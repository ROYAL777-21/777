import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import {
  USER_ID,
  getOrCreateUser,
  regenHearts,
  updateStreak,
  advanceQuests,
  checkAchievements,
  notifyQuestsAndAchievements,
  computeAchievementCtx,
  weekKey,
  dayKey,
} from "@/lib/gamification"
import type { PlacementPayload, PlacementQuestion, PlacementResult } from "@/lib/types"

export const dynamic = "force-dynamic"

/** deterministic-ish sampling so a course's test is stable per day */
function hashStr(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

/** GET — build the placement test: 2–3 SELECT challenges sampled per unit */
export async function GET(_req: Request, ctx: { params: Promise<{ courseId: string }> }) {
  try {
    const { courseId } = await ctx.params
    const course = await db.course.findUnique({
      where: { id: courseId },
      include: {
        units: {
          orderBy: { order: "asc" },
          include: {
            lessons: {
              orderBy: { order: "asc" },
              include: { challenges: { where: { type: "SELECT" }, include: { options: true } } },
            },
          },
        },
      },
    })
    if (!course) return NextResponse.json({ error: "course not found" }, { status: 404 })

    const day = dayKey()
    const questions: PlacementQuestion[] = []

    for (const unit of course.units) {
      // gather this unit's SELECT challenges (single-answer ones only)
      const usable = unit.lessons
        .flatMap((l) => l.challenges)
        .filter((c) => c.options.filter((o) => o.correct).length === 1 && c.options.length >= 3)
      // pick up to 2 per unit (3 for the first unit)
      const perUnit = unit.order <= 1 ? 3 : 2
      const seed = hashStr(`${course.code}-u${unit.order}-${day}`)
      const picked: typeof usable = []
      const pool = [...usable]
      for (let i = 0; i < perUnit && pool.length > 0; i++) {
        picked.push(pool.splice(seed % pool.length, 1)[0])
      }
      for (const ch of picked) {
        questions.push({
          challengeId: ch.id,
          unitOrder: unit.order,
          unitTitle: unit.title,
          prompt: ch.prompt,
          question: ch.question,
          options: ch.options.map((o) => ({ id: o.id, text: o.text })),
          correctOptionId: ch.options.find((o) => o.correct)!.id,
          meaning: ch.meaning,
        })
      }
    }

    const payload: PlacementPayload = {
      courseId: course.id,
      courseTitle: course.title,
      courseEmoji: course.emoji,
      unitsPlaced: course.units.length,
      totalUnits: course.units.length,
      questions,
    }
    return NextResponse.json(payload)
  } catch (e) {
    console.error("[api/placement GET]", e)
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}

/** POST — score the test; units with ≥70% (and all earlier units) are completed */
export async function POST(req: Request, ctx: { params: Promise<{ courseId: string }> }) {
  try {
    const { courseId } = await ctx.params
    const body = (await req.json()) as { answers: { challengeId: string; optionId: string }[] }
    const user = await getOrCreateUser()
    const progress = await regenHearts(user.progress!)

    const course = await db.course.findUnique({
      where: { id: courseId },
      include: {
        units: {
          orderBy: { order: "asc" },
          include: {
            lessons: { orderBy: { order: "asc" } },
          },
        },
      },
    })
    if (!course) return NextResponse.json({ error: "course not found" }, { status: 404 })

    // fetch the sampled challenges fresh (same sampling as GET — verify by optionId)
    const answerMap = new Map(body.answers?.map((a) => [a.challengeId, a.optionId]) ?? [])

    // per-unit tallies
    const perUnit = new Map<number, { correct: number; total: number; title: string }>()
    for (const unit of course.units) {
      perUnit.set(unit.order, { correct: 0, total: 0, title: unit.title })
    }

    let correctTotal = 0
    let questionTotal = 0
    const checkedIds = new Set<string>()
    for (const unit of course.units) {
      for (const lesson of unit.lessons) {
        const challenges = await db.challenge.findMany({
          where: { lessonId: lesson.id, type: "SELECT" },
          include: { options: true },
        })
        for (const ch of challenges) {
          if (checkedIds.has(ch.id)) continue
          if (ch.options.filter((o) => o.correct).length !== 1) continue
          if (!answerMap.has(ch.id)) continue
          checkedIds.add(ch.id)
          const tally = perUnit.get(unit.order)!
          tally.total++
          questionTotal++
          const chosen = ch.options.find((o) => o.id === answerMap.get(ch.id))
          if (chosen?.correct) {
            tally.correct++
            correctTotal++
          }
        }
      }
    }

    // sequential placement: unit counts as placed if ≥70% AND every earlier unit placed
    const unitScores: PlacementResult["unitScores"] = []
    let cumulativePlaced = true
    const placedUnitIds = new Set<string>()
    for (const unit of course.units) {
      const t = perUnit.get(unit.order)!
      const ratio = t.total > 0 ? t.correct / t.total : 0
      const placed = cumulativePlaced && t.total > 0 && ratio >= 0.7
      if (!placed) cumulativePlaced = false
      if (placed) placedUnitIds.add(unit.id)
      unitScores.push({
        unitOrder: unit.order,
        unitTitle: unit.title,
        correct: t.correct,
        total: t.total,
        placed,
      })
    }

    // count how many units the user had ALREADY completed before this test
    const priorCompletions = await db.lessonCompletion.findMany({
      where: { userId: USER_ID, lesson: { unit: { courseId: course.id } } },
      select: { lessonId: true },
    })
    const priorDone = new Set(priorCompletions.map((c) => c.lessonId))

    // create completions for lessons in placed units that aren't already done
    let lessonsCompleted = 0
    for (const unit of course.units) {
      if (!placedUnitIds.has(unit.id)) continue
      for (const lesson of unit.lessons) {
        if (priorDone.has(lesson.id)) continue
        await db.lessonCompletion.create({
          data: {
            userId: USER_ID,
            lessonId: lesson.id,
            xpEarned: 8,
            comboMax: 0,
            accuracy: 80,
            durationSec: 0,
          },
        }).catch(() => undefined) // unique race-safe
        lessonsCompleted++
      }
    }

    // XP: 8 per skipped lesson, only if this test actually skipped something new
    const xpEarned = lessonsCompleted * 8
    let streakRes = { streak: progress.streak, increased: false, usedFreeze: false, milestone: null as number | null }
    let questRes = { completedNow: [] as string[], gemsAwarded: 0 }
    let achRes = { unlocked: [] as { title: string; tierName: string; gems: number; icon: string }[], gems: 0 }
    let totalXp = progress.xp
    let totalGems = progress.gems
    const today = dayKey()

    if (xpEarned > 0) {
      streakRes = await updateStreak(progress)
      questRes = await advanceQuests(today, { xp: xpEarned, correct: correctTotal })

      // league xp
      const leagueId = `league-${progress.leagueOrder ?? 0}`
      const wk = weekKey()
      const meCount = await db.leagueEntry.count({ where: { leagueId, weekKey: wk, isCurrentUser: true } })
      if (meCount === 0) {
        await db.leagueEntry.create({
          data: { leagueId, weekKey: wk, displayName: user.name, avatarEmoji: user.image, isCurrentUser: true, xp: 0 },
        })
      }
      await db.leagueEntry.updateMany({
        where: { leagueId, weekKey: wk, isCurrentUser: true },
        data: { xp: { increment: xpEarned } },
      })

      const ctx2 = await computeAchievementCtx(streakRes.streak)
      achRes = await checkAchievements(ctx2)
      await notifyQuestsAndAchievements(questRes, achRes)

      const isNewDay = progress.dailyXpDay !== today
      const dailyXp = (isNewDay ? 0 : progress.dailyXp) + xpEarned
      totalXp = progress.xp + xpEarned
      totalGems = progress.gems + questRes.gemsAwarded + achRes.gems

      await db.userProgress.update({
        where: { userId: USER_ID },
        data: {
          xp: totalXp,
          gems: totalGems,
          streak: streakRes.streak,
          streakFreezes: streakRes.usedFreeze ? Math.max(0, progress.streakFreezes - 1) : progress.streakFreezes,
          lastActiveDay: today,
          dailyXp,
          dailyXpDay: today,
        },
      })

      await db.appNotification.create({
        data: {
          userId: USER_ID,
          type: "info",
          title: "Placement test complete! 🎓",
          body: `You placed out of ${unitScores.filter((u) => u.placed).length} unit(s) in ${course.title} — ${lessonsCompleted} lessons marked complete and ${xpEarned} XP awarded.`,
          icon: "🎓",
        },
      })
    }

    const result: PlacementResult = {
      unitsSkipped: unitScores.filter((u) => u.placed).length,
      lessonsCompleted,
      xpEarned,
      totalXp,
      gems: totalGems,
      streak: streakRes.streak,
      streakIncreased: streakRes.increased,
      questsCompleted: questRes.completedNow,
      achievementsUnlocked: achRes.unlocked,
      unitScores,
    }
    return NextResponse.json(result)
  } catch (e) {
    console.error("[api/placement POST]", e)
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}
