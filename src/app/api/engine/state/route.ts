import { NextResponse } from "next/server"
import { getEngineState } from "@/lib/engine/compute"
import { getOrCreateUser } from "@/lib/gamification"

/**
 * GET /api/engine/state — the personalization state for this user.
 * Throttled to the last snapshot (10-min TTL); pass ?force=1 to recompute.
 */
export async function GET(req: Request) {
  try {
    const user = await getOrCreateUser()
    const force = new URL(req.url).searchParams.get("force") === "1"
    const state = await getEngineState(user.id, force)
    return NextResponse.json(state)
  } catch (e) {
    console.error("[api/engine/state]", e)
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}

export const dynamic = "force-dynamic"
