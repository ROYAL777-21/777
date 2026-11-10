import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getOrCreateUser, regenHearts } from "@/lib/gamification"
import { evaluateJourneys } from "@/lib/journeys"

/**
 * The journeys tick — called by the client every ~90s (and on focus).
 * Creates due TIMED notifications (verse, reminder, quiz, streak-risk,
 * weekly recap), PERSONAL notifications (hearts, level-up, requests)
 * and delivers due EMAIL journey steps. Idempotent per day.
 */
export async function POST() {
  try {
    const user = await getOrCreateUser()
    const progress = await regenHearts(user.progress!)

    // throttle: at most once per 45s server-side
    if (progress.lastNotifEvalAt && Date.now() - progress.lastNotifEvalAt.getTime() < 45_000) {
      return NextResponse.json({ ok: true, throttled: true, created: [], emailsSent: [] })
    }

    const result = await evaluateJourneys(progress)
    await db.userProgress.update({
      where: { userId: "user_1" },
      data: { lastNotifEvalAt: new Date() },
    })
    return NextResponse.json({ ok: true, ...result })
  } catch (e) {
    console.error("[api/journeys/evaluate]", e)
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}

export const dynamic = "force-dynamic"
