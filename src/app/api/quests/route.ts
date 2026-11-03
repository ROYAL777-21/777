import { NextResponse } from "next/server"
import { getOrCreateUser, ensureDailyQuests, dayKey } from "@/lib/gamification"
import type { QuestsPayload } from "@/lib/types"

export async function GET() {
  try {
    const user = await getOrCreateUser()
    const progress = user.progress!
    const today = dayKey()
    const uqs = await ensureDailyQuests(today)

    const quests: QuestsPayload["quests"] = uqs.map((uq) => ({
      id: uq.id,
      slug: uq.quest.slug,
      title: uq.quest.title,
      description: uq.quest.description,
      icon: uq.quest.icon,
      target: uq.quest.target,
      gemsReward: uq.quest.gemsReward,
      progress: Math.min(uq.progress, uq.quest.target),
      completed: uq.completed,
    }))

    // refresh at local midnight
    const now = new Date()
    const local = new Date(now.getTime() + 8 * 3600 * 1000)
    const msLeft =
      (24 - local.getUTCHours()) * 3600000 - (local.getUTCMinutes() * 60 + local.getUTCSeconds()) * 1000

    const payload: QuestsPayload = {
      dailyXp: progress.dailyXpDay === today ? progress.dailyXp : 0,
      dailyXpGoal: 50,
      quests,
      refreshInMs: Math.max(0, msLeft),
    }
    return NextResponse.json(payload)
  } catch (e) {
    console.error("[api/quests]", e)
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}
