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
import { pickDailyQuestions } from "@/lib/dailyQuiz"
import type { DailyQuizPayload, DailyQuizResult } from "@/lib/types"

export const dynamic = "force-dynamic"

/** GET — today's five questions (or the completed state) */
export async function GET() {
  try {
    const user = await getOrCreateUser()
    await regenHearts(user.progress!)

    const day = dayKey()
    const done = await db.dailyQuizCompletion.findUnique({
      where: { userId_day: { userId: USER_ID, day } },
    })
    const questions = pickDailyQuestions(day)

    // streak of consecutive daily-quiz days (for the flame counter)
    let streakOfQuizzes = 0
    for (let i = 0; i < 400; i++) {
      const d = dayKey(new Date(Date.now() - i * 86400000))
      const hit =
        i === 0
          ? !!done
          : (await db.dailyQuizCompletion.findUnique({ where: { userId_day: { userId: USER_ID, day: d } } })) !== null
      if (hit) streakOfQuizzes++
      else break
    }

    const payload: DailyQuizPayload = {
      day,
      completed: !!done,
      score: done?.score ?? 0,
      total: done?.total ?? questions.length,
      streakOfQuizzes,
      questions: questions.map((q, i) => ({
        id: i,
        category: q.category,
        question: q.q,
        options: q.options,
        correctIndex: q.correct,
        meaning: q.meaning,
      })),
    }
    return NextResponse.json(payload)
  } catch (e) {
    console.error("[api/daily-quiz GET]", e)
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}

/** POST — submit answers, verify, award */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { answers: number[] } // chosen index per question
    const user = await getOrCreateUser()
    const progress = await regenHearts(user.progress!)

    const day = dayKey()
    const existing = await db.dailyQuizCompletion.findUnique({
      where: { userId_day: { userId: USER_ID, day } },
    })
    if (existing) {
      // already done today — return recorded result with zero award
      const result: DailyQuizResult = {
        day,
        score: existing.score,
        total: existing.total,
        xpEarned: 0,
        gemsEarned: 0,
        perfect: existing.score === existing.total,
        streak: progress.streak,
        streakIncreased: false,
        questsCompleted: [],
        achievementsUnlocked: [],
        totalXp: progress.xp,
        gems: progress.gems,
        dailyXp: progress.dailyXpDay === day ? progress.dailyXp : 0,
        dailyXpGoal: progress.dailyGoal ?? 50,
      }
      return NextResponse.json(result)
    }

    // verify against the same deterministic set
    const questions = pickDailyQuestions(day)
    let score = 0
    for (let i = 0; i < questions.length; i++) {
      if (body.answers?.[i] === questions[i].correct) score++
    }
    const perfect = score === questions.length && questions.length > 0

    // ── rewards: 8 XP base + 3 per correct, +6 perfect bonus, +10 gems perfect ──
    const doubled = !!progress.doubleXpUntil && progress.doubleXpUntil > new Date()
    const xpEarned = Math.round((8 + score * 3 + (perfect ? 6 : 0)) * (doubled ? 2 : 1))
    const gemsEarned = perfect ? 10 : 5

    const streakRes = await updateStreak(progress)
    const questRes = await advanceQuests(day, {
      xp: xpEarned,
      correct: score,
      perfect: perfect ? 1 : 0,
      daily_quiz: 1,
    })

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

    const ctx = await computeAchievementCtx(streakRes.streak)
    const achRes = await checkAchievements(ctx)
    await notifyQuestsAndAchievements(questRes, achRes)

    const isNewDay = progress.dailyXpDay !== day
    const dailyXp = (isNewDay ? 0 : progress.dailyXp) + xpEarned
    const totalXp = progress.xp + xpEarned
    const totalGems = progress.gems + gemsEarned + questRes.gemsAwarded + achRes.gems

    await db.dailyQuizCompletion.create({
      data: { userId: USER_ID, day, score, total: questions.length, xpEarned },
    })

    if (perfect) {
      await db.appNotification.create({
        data: {
          userId: USER_ID,
          type: "info",
          title: "Daily Quiz aced! 🧠✨",
          body: `Perfect score — ${score}/${questions.length}. Extra XP and gems are yours. Come back tomorrow for a fresh set!`,
          icon: "🧠",
        },
      })
    }

    await db.userProgress.update({
      where: { userId: USER_ID },
      data: {
        xp: totalXp,
        gems: totalGems,
        streak: streakRes.streak,
        streakFreezes: streakRes.usedFreeze ? Math.max(0, progress.streakFreezes - 1) : progress.streakFreezes,
        lastActiveDay: day,
        dailyXp,
        dailyXpDay: day,
      },
    })

    const result: DailyQuizResult = {
      day,
      score,
      total: questions.length,
      xpEarned,
      gemsEarned: gemsEarned + questRes.gemsAwarded + achRes.gems,
      perfect,
      streak: streakRes.streak,
      streakIncreased: streakRes.increased,
      questsCompleted: questRes.completedNow,
      achievementsUnlocked: achRes.unlocked,
      totalXp,
      gems: totalGems,
      dailyXp,
      dailyXpGoal: progress.dailyGoal ?? 50,
    }
    return NextResponse.json(result)
  } catch (e) {
    console.error("[api/daily-quiz POST]", e)
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}
