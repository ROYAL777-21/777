import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getOrCreateUser, regenHearts, awardActivityXp, USER_ID } from "@/lib/gamification"
import { READING_PLANS } from "@/lib/bible"
import type { PlansPayload } from "@/lib/types"

export async function GET() {
  try {
    const user = await getOrCreateUser()
    await regenHearts(user.progress!)
    const rows = await db.planProgress.findMany({ where: { userId: USER_ID } })
    const payload: PlansPayload = {
      plans: READING_PLANS.map((p) => {
        const mine = rows.filter((r) => r.planId === p.id)
        const lastDay = mine.reduce((m, r) => Math.max(m, r.day), 0)
        return {
          id: p.id,
          daysDone: mine.length,
          totalDays: p.days.length,
          doneDays: mine.map((r) => r.day),
          lastDay: lastDay || null,
        }
      }),
    }
    return NextResponse.json(payload)
  } catch (e) {
    console.error("[api/plans GET]", e)
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { planId, day } = (await req.json()) as { planId?: string; day?: number }
    const plan = READING_PLANS.find((p) => p.id === planId)
    if (!plan || !day || day < 1 || day > plan.days.length) {
      return NextResponse.json({ error: "invalid plan day" }, { status: 400 })
    }
    const user = await getOrCreateUser()
    const progress = await regenHearts(user.progress!)

    const existing = await db.planProgress.findUnique({
      where: { userId_planId_day: { userId: USER_ID, planId: plan.id, day } },
    })
    if (existing) {
      return NextResponse.json({
        firstTime: false,
        xpEarned: 0,
        streak: progress.streak,
        planDaysDone: await db.planProgress.count({ where: { userId: USER_ID, planId: plan.id } }),
        questsCompleted: [],
        achievementsUnlocked: [],
      })
    }

    await db.planProgress.create({ data: { userId: USER_ID, planId: plan.id, day } })
    const award = await awardActivityXp(progress, { xp: 12, questDelta: { plan_days: 1 } })
    const planDaysDone = await db.planProgress.count({ where: { userId: USER_ID, planId: plan.id } })

    if (planDaysDone === plan.days.length) {
      await db.appNotification.create({
        data: {
          userId: USER_ID,
          type: "info",
          title: `Plan complete: ${plan.title} ${plan.emoji}`,
          body: `You finished every day of the ${plan.title} reading plan. Share it with the community!`,
          icon: "🎯",
        },
      })
    }

    return NextResponse.json({
      firstTime: true,
      xpEarned: award.xpEarned,
      streak: award.streak,
      planDaysDone,
      questsCompleted: award.questsCompleted,
      achievementsUnlocked: award.achievementsUnlocked,
    })
  } catch (e) {
    console.error("[api/plans POST]", e)
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}
