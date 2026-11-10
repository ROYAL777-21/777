import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import {
  USER_ID,
  getOrCreateUser,
  regenHearts,
  advanceQuests,
  checkAchievements,
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

/** practice completion: +10 XP, +1 heart, +5 gems */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { answers: AnswerDTO[]; comboMax?: number; durationSec?: number; hearts?: number }
    const user = await getOrCreateUser()
    let progress = await regenHearts(user.progress!)

    const correctCount = (body.answers ?? []).filter((a) => a.correct).length
    const totalQuestions = (body.answers ?? []).length
    const comboMax = Math.max(0, body.comboMax ?? 0)

    const doubled = !!progress.doubleXpUntil && progress.doubleXpUntil > new Date()
    const xpEarned = Math.round(10 * (doubled ? 2 : 1))
    const gemsEarned = 5
    const hearts = Math.min(MAX_HEARTS, Math.max(body.hearts ?? progress.hearts, progress.hearts) + 1)

    // challenge progress records
    for (const a of body.answers ?? []) {
      if (!a.challengeId) continue
      const rec = await db.challengeProgress.findUnique({
        where: { userId_challengeId: { userId: USER_ID, challengeId: a.challengeId } },
      })
      if (!rec) continue
      if (a.correct && rec.mistakes > 0) {
        await db.challengeProgress.update({
          where: { id: rec.id },
          data: { mistakes: { decrement: 1 } },
        })
      } else if (!a.correct) {
        await db.challengeProgress.update({
          where: { id: rec.id },
          data: { mistakes: { increment: 1 } },
        })
      }
    }

    const today = dayKey()
    const questRes = await advanceQuests(today, {
      xp: xpEarned,
      lessons: 0,
      combo: comboMax,
      perfect: 0,
      correct: correctCount,
    })

    const leagueId = `league-${progress.leagueOrder ?? 0}`
    const wk = weekKey()
    await db.leagueEntry.updateMany({
      where: { leagueId, weekKey: wk, isCurrentUser: true },
      data: { xp: { increment: xpEarned } },
    })

    const totalXp = progress.xp + xpEarned
    const totalGems = progress.gems + gemsEarned + questRes.gemsAwarded
    const dailyXp = (progress.dailyXpDay === today ? progress.dailyXp : 0) + xpEarned

    const lessonsDone = await db.lessonCompletion.count({ where: { userId: USER_ID } })
    const perfectDone = await db.lessonCompletion.count({ where: { userId: USER_ID, accuracy: 100 } })
    const correctTotal = await db.challengeProgress.count({ where: { userId: USER_ID, completed: true } })
    const questsDone = await db.userQuest.count({ where: { userId: USER_ID, completed: true } })
    const coursesTouched = await db.lessonCompletion.findMany({
      where: { userId: USER_ID },
      select: { lesson: { select: { unit: { select: { courseId: true } } } } },
    })
    const courseIds = new Set(coursesTouched.map((c) => c.lesson.unit.courseId))
    const achRes = await checkAchievements({
      streak: progress.streak,
      xp: totalXp,
      lessons: lessonsDone,
      perfect: perfectDone,
      challenges: correctTotal,
      quests: questsDone,
      courses: courseIds.size,
    })

    for (const q of questRes.completedNow) {
      await db.appNotification.create({
        data: {
          userId: USER_ID,
          type: "quest",
          title: "Quest complete! 🎯",
          body: `You finished the daily quest “${q}”. Gems added!`,
          icon: "🎯",
        },
      })
    }

    progress = await db.userProgress.update({
      where: { userId: USER_ID },
      data: {
        xp: totalXp,
        gems: totalGems,
        dailyXp,
        dailyXpDay: today,
        hearts,
        lastHeartAt: hearts < MAX_HEARTS ? new Date() : null,
      },
    })

    const result: CompleteResult = {
      xpEarned,
      baseXp: 10,
      bonusXp: 0,
      doubled,
      gemsEarned: gemsEarned + questRes.gemsAwarded + achRes.gems,
      perfect: totalQuestions > 0 && correctCount === totalQuestions,
      firstTime: false,
      streak: progress.streak,
      streakIncreased: false,
      usedFreeze: false,
      milestone: null,
      questsCompleted: questRes.completedNow,
      achievementsUnlocked: achRes.unlocked,
      totalXp,
      gems: totalGems,
      hearts,
      dailyXp,
      dailyXpGoal: progress.dailyGoal ?? 50,
      correctCount,
      totalQuestions,
      durationSec: Math.max(0, Math.round(body.durationSec ?? 0)),
      mannaBonus: null,
      records: [],
      league: null,
    }
    return NextResponse.json(result)
  } catch (e) {
    console.error("[api/practice/complete]", e)
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}
