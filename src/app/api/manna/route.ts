import { NextResponse } from "next/server"
import { getOrCreateUser, mannaStateOf, collectManna } from "@/lib/gamification"
import { mannaVerseOfTheDay } from "@/lib/scripture"
import { tap } from "@/lib/engine/events"
import type { MannaPayload } from "@/lib/types"

/**
 * Today's Manna (v11.5) — the daily clock mechanic.
 *   GET  → the day's portion + gather state
 *   POST → gather it (idempotent per local day, +5 XP through the award path)
 */
async function payload(): Promise<MannaPayload> {
  const user = await getOrCreateUser()
  const state = mannaStateOf(user.progress!)
  return { ...state, verse: mannaVerseOfTheDay() }
}

export async function GET() {
  try {
    return NextResponse.json(await payload())
  } catch (e) {
    console.error("[api/manna GET]", e)
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}

export async function POST() {
  try {
    const user = await getOrCreateUser()
    const res = await collectManna(user.progress!)
    if (res.ok) {
      // namespaced custom event — allowed by the telemetry schema's
      // escape hatch (a.b_c, lowercase); carries no payload contract
      void tap(user.id, "game.manna_collect", {})
    }
    return NextResponse.json(res)
  } catch (e) {
    console.error("[api/manna POST]", e)
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}

export const dynamic = "force-dynamic"
