import { NextResponse } from "next/server"
import { train } from "@/lib/engine/train"
import { getOrCreateUser } from "@/lib/gamification"

/**
 * POST /api/engine/train — run the self-improvement loop.
 * (The nightly cron / desktop scheduler calls this; also exposed for manual runs.)
 */
export async function POST() {
  try {
    const user = await getOrCreateUser()
    const report = await train(user.id)
    return NextResponse.json({ ok: true, report })
  } catch (e) {
    console.error("[api/engine/train]", e)
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}

export const dynamic = "force-dynamic"
