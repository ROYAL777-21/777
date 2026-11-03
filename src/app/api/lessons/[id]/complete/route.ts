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
  dayKey,
  weekKey,
  MAX_HEARTS,
} from "@/lib/gamification"
import type { CompleteResult } from "@/lib/types"

interface AnswerDTO {
  challengeId: string
  correct: boolean
  optionId?: string
  text?: string
}

/** normalize text for TYPE-answer checking */
function normalize(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[.,!?;:'"’‘“”()\[\]]/g, "")
    .replace(/\s+/g, " ")
    .replace(/[!]/g, "")
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params
    const body = (await req.json()) as {
      answers: AnswerDTO[]
      comboMax?: number
      durationSec?: number
      hearts?: number
    }
    const user = await getOrCreateUser()
    let progress = await regenHearts(user.progress!)

    const lesson = await db.lesson.findUnique({
      where: { id },
      include: { challenges: { include: { options: true } } },
    })
    if (!lesson) return NextResponse.json({ error: "lesson not found" }, { status: 404 })

    // ── server-side verification ──
    const byId = new Map(lesson.challenges.map((c) => [c.id, c]))
    let correctCount = 0
    let totalQuestions = 0
    const verified: AnswerDTO[] = []
    for (const a of body.answers ?? []) {
      const ch = byId.get(a.challengeId)
      if (!ch || ch.type === "INFO" || ch.type === "SPEAK") continue
      totalQuestions += 1
      let correct = a.correct
      if (ch.type === "SELECT" || ch.type === "ASSIST" || ch.type === "LISTEN") {
        const opt = ch.options.find((o) => o.id === a.optionId)
        correct = !!opt?.correct
      } else if (ch.type === "TYPE") {
        const accepted = ch.options.filter((o) => o.correct).map((o) => normalize(o.text))
        // lenient: also accept the transliteration when provided (keyboard-less users)
        if (ch.transliteration) accepted.push(normalize(ch.transliteration))
        correct = accepted.includes(normalize(a.text ?? ""))
      } // MATCH & ARRANGE trust client-side interactivity flags
      if (correct) correctCount += 1
      verified.push({ challengeId: a.challengeId, correct })
    }

    const mistakes = Math.max(0, totalQuestions - correctCount)
    const perfect = totalQuestions > 0 && mistakes === 0
    const comboMax = Math.max(0, Math.min(body.comboMax ?? 0, 99))
    const durationSec = Math.max(0, body.durationSec ?? 0)

    const existing = await db.lessonCompletion.findUnique({
      where: { userId_lessonId: { userId: USER_ID, lessonId: id } },
    })
    const firstTime = !existing

    // ── XP math ──
    const baseXp = 15
    let bonusXp = (firstTime ? 10 : 5) + (perfect ? 5 : 0) + (comboMax >= 5 ? 5 : 0)
    const doubled = !!progress.doubleXpUntil && progress.doubleXpUntil > new Date()
    const xpEarned = Math.round((baseXp + bonusXp) * (doubled ? 2 : 1))
    const gemsEarned = 12 + (perfect ? 5 : 0)

    // ── record challenge progress (for mistakes review) ──
    for (const a of verified) {
      await db.challengeProgress.upsert({
        where: { userId_challengeId: { userId: USER_ID, challengeId: a.challengeId } },
        update: { completed: true, mistakes: a.correct ? 0 : { increment: 1 } },
        create: { userId: USER_ID, challengeId: a.challengeId, completed: true, mistakes: a.correct ? 0 : 1 },
      })
    }

    // ── upsert lesson completion ──
    const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 100
    await db.lessonCompletion.upsert({
      where: { userId_lessonId: { userId: USER_ID, lessonId: id } },
      update: {
        xpEarned: Math.max(existing?.xpEarned ?? 0, xpEarned),
        comboMax: Math.max(existing?.comboMax ?? 0, comboMax),
        accuracy: Math.max(existing?.accuracy ?? 0, accuracy),
        durationSec,
        completedAt: new Date(),
      },
      create: { userId: USER_ID, lessonId: id, xpEarned, comboMax, accuracy, durationSec },
    })

    // ── streak ──
    const streakRes = await updateStreak(progress)

    // ── quests ──
    const today = dayKey()
    const questRes = await advanceQuests(today, {
      xp: xpEarned,
      lessons: 1,
      combo: comboMax,
      perfect: perfect ? 1 : 0,
      correct: correctCount,
    })

    // ── league xp ──
    const leagueId = `league-${progress.leagueOrder ?? 0}`
    const wk = weekKey()
    await db.leagueEntry.updateMany({
      where: { leagueId, weekKey: wk, isCurrentUser: true },
      data: { xp: { increment: xpEarned }, displayName: user.name, avatarEmoji: user.image },
    })
    // ensure the user's entry exists even if leaderboard wasn't opened yet
    const meCount = await db.leagueEntry.count({ where: { leagueId, weekKey: wk, isCurrentUser: true } })
    if (meCount === 0) {
      await db.leagueEntry.create({
        data: { leagueId, weekKey: wk, displayName: user.name, avatarEmoji: user.image, isCurrentUser: true, xp: xpEarned },
      })
    }

    // ── daily xp ──
    const isNewDay = progress.dailyXpDay !== today
    const dailyXp = (isNewDay ? 0 : progress.dailyXp) + xpEarned

    // ── totals ──
    const totalXp = progress.xp + xpEarned
    const totalGems = progress.gems + gemsEarned + questRes.gemsAwarded

    // ── hearts: sync from lesson session ──
    const hearts = Math.max(0, Math.min(MAX_HEARTS, body.hearts ?? progress.hearts))

    const lessonsDone = await db.lessonCompletion.count({ where: { userId: USER_ID } })
    const perfectDone = await db.lessonCompletion.count({ where: { userId: USER_ID, accuracy: 100 } })
    const correctTotal = await db.challengeProgress.count({ where: { userId: USER_ID, completed: true } })
    const questsDone = await db.userQuest.count({ where: { userId: USER_ID, completed: true } })
    const coursesTouched = await db.lessonCompletion.findMany({
      where: { userId: USER_ID },
      select: { lesson: { select: { unit: { select: { courseId: true } } } } },
      distinct: ["lessonId"],
    })
    const courseIds = new Set(coursesTouched.map((c) => c.lesson.unit.courseId))

    const achRes = await checkAchievements({
      streak: streakRes.streak,
      xp: totalXp,
      lessons: lessonsDone,
      perfect: perfectDone,
      challenges: correctTotal,
      quests: questsDone,
      courses: courseIds.size,
    })

    // ── notifications for quests & achievements ──
    for (const q of questRes.completedNow) {
      await db.appNotification.create({
        data: {
          userId: USER_ID,
          type: "quest",
          title: "Quest complete! 🎯",
          body: `You finished the daily quest “${q}”. Gems have been added to your wallet!`,
          icon: "🎯",
        },
      })
    }
    for (const a of achRes.unlocked) {
      await db.appNotification.create({
        data: {
          userId: USER_ID,
          type: "achievement",
          title: `Achievement: ${a.title} ${a.icon}`,
          body: `You reached “${a.tierName}” and earned ${a.gems} gems. Beautiful work!`,
          icon: "🏅",
        },
      })
    }
    if (streakRes.milestone) {
      await db.appNotification.create({
        data: {
          userId: USER_ID,
          type: "streak",
          title: `${streakRes.milestone}-day streak! 🔥`,
          body: `You've studied ${streakRes.milestone} days in a row. Your discipline is paying off — keep going!`,
          icon: "🔥",
        },
      })
    }

    // ── persist user progress ──
    progress = await db.userProgress.update({
      where: { userId: USER_ID },
      data: {
        xp: totalXp,
        gems: totalGems,
        streak: streakRes.streak,
        streakFreezes: streakRes.usedFreeze ? Math.max(0, progress.streakFreezes - 1) : progress.streakFreezes,
        lastActiveDay: today,
        dailyXp,
        dailyXpDay: today,
        hearts,
        lastHeartAt: hearts < MAX_HEARTS ? new Date() : null,
      },
    })

    const result: CompleteResult = {
      xpEarned,
      baseXp,
      bonusXp,
      doubled,
      gemsEarned: gemsEarned + questRes.gemsAwarded + achRes.gems,
      perfect,
      firstTime,
      streak: streakRes.streak,
      streakIncreased: streakRes.increased,
      usedFreeze: streakRes.usedFreeze,
      milestone: streakRes.milestone,
      questsCompleted: questRes.completedNow,
      achievementsUnlocked: achRes.unlocked,
      totalXp,
      gems: totalGems,
      hearts,
      dailyXp,
      dailyXpGoal: 50,
      correctCount,
      totalQuestions,
    }
    return NextResponse.json(result)
  } catch (e) {
    console.error("[api/lessons/[id]/complete]", e)
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}

export const dynamic = "force-dynamic"
