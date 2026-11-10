/**
 * events.ts — event ingestion with validation & caps.
 *
 * The client tap stream lands here. Since v11 every event is validated
 * against THE TELEMETRY SCHEMA (`src/lib/telemetry/schema.ts`):
 *   · known type with a payload contract (or namespaced custom)
 *   · payload properties checked against per-event specs — unknown props
 *     dropped, required missing → rejected, values clamped/truncated
 *   · bounded payload (≤2KB serialized), bounded batch (≤50), daily cap
 * This is the security boundary for the engine's write path. The client
 * validates too, but the server never trusts it.
 */

import { db } from "@/lib/db"
import { USER_ID } from "@/lib/gamification"
import { TELEMETRY_SCHEMA_VERSION, validateTelemetryEvent } from "@/lib/telemetry/schema"

/** events that should bust the snapshot cache when they land */
const MAJOR_TYPES = new Set([
  "lesson_complete", "pro_activate", "winback_accept", "paywall_cta",
  "purchase", "story_complete", "chapter_read", "quiz_complete",
])

const MAX_PAYLOAD_CHARS = 2048
const MAX_BATCH = 50
const MAX_DAILY_EVENTS = 5000

/** returns { stored, major } — major=true when the event should bust the snapshot cache */
export async function ingestEvents(userId: string, events: { type: string; payload?: unknown }[]): Promise<{ stored: number; major: boolean; rejected: number }> {
  if (!Array.isArray(events)) return { stored: 0, major: false, rejected: 0 }
  const clean = events.slice(0, MAX_BATCH)
  let stored = 0
  let rejected = 0
  let major = false

  // daily flood cap (protection against runaway clients)
  try {
    const dayStart = new Date()
    dayStart.setHours(0, 0, 0, 0)
    const count = await db.engineEvent.count({ where: { userId, ts: { gte: dayStart } } })
    if (count >= MAX_DAILY_EVENTS) return { stored: 0, major: false, rejected: clean.length }
  } catch {
    // count failure — proceed cautiously with the batch only
  }

  // ── batched insert: validate every row first, then ONE createMany for the
  // whole batch (was N sequential inserts). If the batch fails (e.g. an FK
  // backstop rejection), fall back to per-row inserts so the good rows
  // still land and only the bad ones count as rejected. ──
  const rows: { userId: string; type: string; payload: string; sv: number }[] = []
  for (const e of clean) {
    if (!e || typeof e.type !== "string" || e.type.length > 64) {
      rejected++
      continue
    }

    // ── v11 schema validation (authoritative) ──
    // known types carry a contract; namespaced custom types pass through
    // with the same payload bounds as before.
    const v = validateTelemetryEvent(e.type, e.payload)
    if (!v.ok) {
      rejected++
      continue
    }

    let payloadStr = "{}"
    if (Object.keys(v.clean).length > 0) {
      try {
        payloadStr = JSON.stringify(v.clean)
      } catch {
        payloadStr = "{}"
      }
    }
    if (payloadStr.length > MAX_PAYLOAD_CHARS) payloadStr = payloadStr.slice(0, MAX_PAYLOAD_CHARS)
    rows.push({ userId, type: e.type, payload: payloadStr, sv: TELEMETRY_SCHEMA_VERSION })
  }

  if (rows.length > 0) {
    try {
      await db.engineEvent.createMany({ data: rows })
      stored = rows.length
      for (const r of rows) if (MAJOR_TYPES.has(r.type)) major = true
    } catch {
      // batch failed — retry row by row to isolate the bad ones
      for (const r of rows) {
        try {
          await db.engineEvent.create({ data: r })
          stored++
          if (MAJOR_TYPES.has(r.type)) major = true
        } catch {
          rejected++
        }
      }
    }
  }
  return { stored, major, rejected }
}

/** server-side tap used by API routes */
export async function tap(userId: string, type: string, payload: Record<string, unknown> = {}): Promise<void> {
  await ingestEvents(userId, [{ type, payload }]).catch(() => {})
}

export { USER_ID }
