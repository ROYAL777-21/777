import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import {
  USER_ID,
  getOrCreateUser,
  regenHearts,
  updateStreak,
  advanceQuests,
  checkAchievements,
  dayKey,
  weekKey,
  weekElapsed,
  botDisplayXp,
  PROMOTION_SLOTS,
  MAX_HEARTS,
} from "@/lib/gamification"
import { sendMilestoneEmail, localTime } from "@/lib/journeys"
import { tap } from "@/lib/engine/events"
import { catchUpMultiplier } from "@/lib/engine/xp"
import { getGameConfigQuick } from "@/lib/engine/compute"
import { computeFeatures } from "@/lib/engine/features"
import { computeScores } from "@/lib/engine/scores"
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

/** small stable hash — drives the rare "extra manna fell" surprise */
function hashStr(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
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
      include: {
        unit: { select: { difficulty: true, courseId: true } },
        challenges: { include: { options: true } },
      },
    })
    if (!lesson) return NextResponse.json({ error: "lesson not found" }, { status: 404 })
    const unitDifficulty = lesson.unit.difficulty ?? 1

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

    // ── XP math (progressive difficulty: harder units pay more) ──
    // difficulty 1 Foundations → 15 base · 2 Growing → 20 · 3 Advanced → 25
    const baseXp = 10 + unitDifficulty * 5
    let bonusXp = (firstTime ? 10 : 5) + (perfect ? 5 : 0) + (comboMax >= 5 ? 5 : 0) + (unitDifficulty >= 3 ? 5 : 0)
    // Scroll Pro — 2× XP weekends: every Saturday & Sunday (local, UTC+8) Pro members earn double XP
    const isPro = progress.plan !== "free"
    const isWeekend = localTime().dow === 0 || localTime().dow === 6
    const weekendDouble = isPro && isWeekend
    const doubled = (!!progress.doubleXpUntil && progress.doubleXpUntil > new Date()) || weekendDouble
    // the Scribe's Ledger: returning learners get a gentle catch-up multiplier
    // (1.0–1.25×) — it NEVER stacks with Double XP (fairness rule)
    let catchUp = 1
    try {
      const lastCompletion = await db.lessonCompletion.findFirst({
        where: { userId: USER_ID },
        orderBy: { completedAt: "desc" },
        select: { completedAt: true },
      })
      if (lastCompletion) {
        const daysSince = Math.max(0, (Date.now() - lastCompletion.completedAt.getTime()) / 86400000)
        const fr = await computeFeatures(USER_ID)
        const scores = await computeScores(fr, USER_ID)
        const cfg = await getGameConfigQuick(USER_ID)
        catchUp = typeof cfg["xp.personal_multiplier"] === "number" && Number.isFinite(cfg["xp.personal_multiplier"])
          ? Math.max(1, Math.min(1.25, cfg["xp.personal_multiplier"] as number))
          : catchUpMultiplier(daysSince, scores.engagement)
        if (doubled) catchUp = 1 // never stack
      }
    } catch {
      catchUp = 1 // engine failure must never break XP math
    }
    const xpEarned = Math.round((baseXp + bonusXp) * (doubled ? 2 : catchUp))
    const gemsEarned = 10 + unitDifficulty * 2 + (perfect ? 5 : 0)

    // ── v11.5 · the craving machine's controlled surprise ──
    // A rare "extra manna fell on this lesson" bonus (+5–15 XP), first-run
    // lessons only, deterministic per (lesson, day) so it can never be farmed
    // by replays. The reward system stays predictable with moments of grace.
    const mannaRoll = hashStr(`${id}|${dayKey()}|manna`)
    const mannaBonus = firstTime && mannaRoll % 100 < 12 ? 5 + (mannaRoll % 11) : null
    const xpWithBonus = xpEarned + (mannaBonus ?? 0)

    // ── record challenge progress (for mistakes review) ──
    for (const a of verified) {
      await db.challengeProgress.upsert({
        where: { userId_challengeId: { userId: USER_ID, challengeId: a.challengeId } },
        update: { completed: true, mistakes: a.correct ? 0 : { increment: 1 } },
        create: { userId: USER_ID, challengeId: a.challengeId, completed: true, mistakes: a.correct ? 0 : 1 },
      })
    }

    // ── v11.5 · personal bests (competence signals, computed BEFORE the upsert) ──
    // Records compare this run against the learner's own history — evidence
    // of skill, not attendance (the anti-badge-theater rule).
    const records: string[] = []
    if (!firstTime && durationSec >= 10 && existing?.durationSec && durationSec < existing.durationSec) {
      records.push(`Fastest run — ${durationSec}s (was ${existing.durationSec}s)`)
    }
    if (comboMax >= 5) {
      const bestCombo = await db.lessonCompletion.findFirst({
        where: { userId: USER_ID },
        orderBy: { comboMax: "desc" },
        select: { comboMax: true },
      })
      if (comboMax > (bestCombo?.comboMax ?? 0)) records.push(`Longest combo ever — ${comboMax} in a row`)
    }

    // ── upsert lesson completion ──
    const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 100
    await db.lessonCompletion.upsert({
      where: { userId_lessonId: { userId: USER_ID, lessonId: id } },
      update: {
        xpEarned: Math.max(existing?.xpEarned ?? 0, xpWithBonus),
        comboMax: Math.max(existing?.comboMax ?? 0, comboMax),
        accuracy: Math.max(existing?.accuracy ?? 0, accuracy),
        durationSec,
        completedAt: new Date(),
      },
      create: { userId: USER_ID, lessonId: id, xpEarned: xpWithBonus, comboMax, accuracy, durationSec },
    })

    // ── the Scribe's Ledger: completion tap ──
    void tap(USER_ID, "lesson_complete", { lessonId: id, accuracy, courseId: lesson.unit.courseId, difficulty: unitDifficulty, firstTime })

    // ── streak ──
    const streakRes = await updateStreak(progress)

    // ── quests ──
    const today = dayKey()
    const questRes = await advanceQuests(today, {
      xp: xpWithBonus,
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
      data: { xp: { increment: xpWithBonus }, displayName: user.name, avatarEmoji: user.image },
    })
    // ensure the user's entry exists even if leaderboard wasn't opened yet
    const meCount = await db.leagueEntry.count({ where: { leagueId, weekKey: wk, isCurrentUser: true } })
    if (meCount === 0) {
      await db.leagueEntry.create({
        data: { leagueId, weekKey: wk, displayName: user.name, avatarEmoji: user.image, isCurrentUser: true, xp: xpWithBonus },
      })
    }

    // ── v11.5 · the invisible scoreboard at the moment of completion ──
    // Where do you stand now, how far did this lesson move you, and who is
    // one catchable lesson away? (Localized cohort — the league IS small.)
    let league: CompleteResult["league"] = null
    try {
      const entries = await db.leagueEntry.findMany({ where: { leagueId, weekKey: wk } })
      const elapsed = weekElapsed()
      const ranked = entries
        .map((e) => ({
          name: e.displayName,
          isMe: e.isCurrentUser,
          xp: e.isCurrentUser
            ? e.xp
            : e.isBot
              ? botDisplayXp(e.targetXp ?? 0, e.displayName, elapsed)
              : e.xp,
        }))
        .sort((a, b) => b.xp - a.xp || (a.isMe ? -1 : 1))
      const rankAfter = ranked.findIndex((r) => r.isMe)
      if (rankAfter >= 0) {
        const rankBefore = [...ranked]
          .map((r) => ({ ...r, xp: r.isMe ? r.xp - xpWithBonus : r.xp }))
          .sort((a, b) => b.xp - a.xp || (a.isMe ? -1 : 1))
          .findIndex((r) => r.isMe)
        const above = rankAfter > 0 ? ranked[rankAfter - 1] : null
        league = {
          rank: rankAfter + 1,
          moved: Math.max(-5, Math.min(5, rankBefore - rankAfter)),
          nextUp: above ? { name: above.name, gap: Math.max(1, above.xp - ranked[rankAfter].xp) } : null,
          promotionZone: PROMOTION_SLOTS,
        }
      }
    } catch {
      league = null // standings must never break the completion flow
    }

    // ── daily xp ──
    const isNewDay = progress.dailyXpDay !== today
    const dailyXp = (isNewDay ? 0 : progress.dailyXp) + xpWithBonus

    // ── totals ──
    const totalXp = progress.xp + xpWithBonus
    const totalGems = progress.gems + gemsEarned + questRes.gemsAwarded

    // ── hearts: sync from lesson session (Scroll Pro keeps them full) ──
    const hearts = progress.plan !== "free" ? MAX_HEARTS : Math.max(0, Math.min(MAX_HEARTS, body.hearts ?? progress.hearts))

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

    // ── milestone emails (streak milestones · level ups · course completion) ──
    if (streakRes.milestone) void sendMilestoneEmail("streak_milestone", String(streakRes.milestone)).catch(() => undefined)
    const lv = Math.floor(totalXp / 100)
    const prevLv = Math.floor(progress.xp / 100)
    if (lv > prevLv && lv > 0) void sendMilestoneEmail("level_up", String(lv + 1)).catch(() => undefined)
    {
      const courseLessons = await db.lesson.count({ where: { unit: { courseId: lesson.unit.courseId } } })
      const doneInCourse = await db.lessonCompletion.count({
        where: { userId: USER_ID, lesson: { unit: { courseId: lesson.unit.courseId } } },
      })
      if (courseLessons > 0 && doneInCourse >= courseLessons && !existing) {
        const course = await db.course.findUnique({ where: { id: lesson.unit.courseId }, select: { title: true } })
        void sendMilestoneEmail("course_complete", course?.title ?? "a course").catch(() => undefined)
      }
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
      xpEarned: xpWithBonus,
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
      dailyXpGoal: progress.dailyGoal ?? 50,
      correctCount,
      totalQuestions,
      durationSec,
      mannaBonus,
      records,
      league,
    }
    return NextResponse.json(result)
  } catch (e) {
    console.error("[api/lessons/[id]/complete]", e)
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}

export const dynamic = "force-dynamic"
