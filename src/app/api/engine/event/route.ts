import { NextResponse } from "next/server"
import { getOrCreateUser } from "@/lib/gamification"
import { ingestEvents } from "@/lib/engine/events"
import {
  SERVICE_KEY_HEADER,
  serviceKeyMatches,
  isServiceUserId,
  serviceLaneRateLimited,
} from "@/lib/telemetry/serviceLane"

/**
 * POST /api/engine/event — the client tap stream.
 *
 * Two lanes, one schema (v11.2):
 *
 *   session lane (browsers):  { events: [{ type, payload }] }
 *     — user derived from the session (getOrCreateUser), as before.
 *
 *   service lane (servers):   X-Scroll-Service-Key: <shared secret>
 *                              { events: [{ type, payload, userId }] }
 *     — for ScrollBridge (C#) and future workers acting on a user's behalf.
 *       EVERY event must carry a valid userId; nothing is ever attributed
 *       to a default. Timing-safe key check + its own per-IP rate cap.
 *       With ENGINE_SERVICE_KEY unset the lane refuses everything.
 *
 * Both lanes validate & cap identically in ingestEvents.
 */
export async function POST(req: Request) {
  try {
    // blue-team: bound the tap-stream body (50 events × ~2KB payloads + envelope)
    const len = Number(req.headers.get("content-length") ?? 0)
    if (Number.isFinite(len) && len > 150_000) return NextResponse.json({ error: "payload too large" }, { status: 413 })

    let body: unknown
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: "invalid json" }, { status: 400 })
    }
    const events = (body as { events?: unknown })?.events
    if (!Array.isArray(events)) {
      return NextResponse.json({ error: "events[] required" }, { status: 400 })
    }

    // ── the service lane ──
    const svcKey = req.headers.get(SERVICE_KEY_HEADER)
    if (svcKey !== null) {
      if (!serviceKeyMatches(svcKey)) {
        // unconfigured, absent or wrong key — same answer, no oracle
        return NextResponse.json({ error: "service key required" }, { status: 401 })
      }
      const ip = req.headers.get("x-real-ip") ?? req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local"
      if (serviceLaneRateLimited(ip)) {
        return NextResponse.json({ error: "rate limited" }, { status: 429 })
      }

      let stored = 0
      let rejected = 0
      let major = false
      // group the batch by target user so each user's daily cap is checked once
      const byUser = new Map<string, { type: string; payload?: unknown }[]>()
      for (const e of events) {
        const rec = e as { type?: unknown; userId?: unknown }
        if (!isServiceUserId(rec.userId)) {
          rejected++
          continue
        }
        if (typeof rec.type !== "string") {
          rejected++
          continue
        }
        const list = byUser.get(rec.userId) ?? []
        list.push({ type: rec.type, payload: (e as { payload?: unknown }).payload })
        byUser.set(rec.userId, list)
      }
      for (const [userId, list] of byUser) {
        const r = await ingestEvents(userId, list)
        stored += r.stored
        rejected += r.rejected
        major = major || r.major
      }
      return NextResponse.json({ ok: true, lane: "service", users: byUser.size, stored, rejected, major })
    }

    // ── the session lane (unchanged) ──
    const user = await getOrCreateUser()
    const res = await ingestEvents(user.id, events as { type: string; payload?: unknown }[])
    return NextResponse.json({ ok: true, lane: "session", ...res })
  } catch (e) {
    console.error("[api/engine/event]", e)
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}

export const dynamic = "force-dynamic"
