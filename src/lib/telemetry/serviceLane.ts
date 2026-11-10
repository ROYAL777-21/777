/**
 * serviceLane.ts — the server-to-server telemetry lane (v11.2)
 *
 * ScrollBridge (C#) and future scale-out workers act on a user's behalf —
 * payment conversions, entitlement grants, push outcomes. Those outcomes
 * belong in the Scribe's Ledger, attributed to the RIGHT user, without a
 * browser session. This module is the auth + attribution spine for that:
 *
 *   · one shared secret:  ENGINE_SERVICE_KEY (web) == SCROLL_TAP__KEY (C#)
 *   · one header:         X-Scroll-Service-Key
 *   · one rule:           a keyed request must attribute EVERY event to a
 *                         valid userId (no ambient user, no defaults)
 *
 * Disabled by default: with ENGINE_SERVICE_KEY unset, every keyed request
 * is refused — the lane simply does not exist. Keys shorter than 16 chars
 * are treated as unset (misconfiguration should fail closed, not open).
 *
 * Defense details:
 *   · comparison is timing-safe: SHA-256 both sides, then
 *     crypto.timingSafeEqual — constant-length compare, no early exit
 *   · the lane has its own per-IP sliding-window cap (600/min) — a worker
 *     batching for thousands of users must batch, not blast singles
 *   · userIds are strictly validated before they touch the database;
 *     the EngineEvent FK then guarantees attribution only to real users
 */

import { createHash, timingSafeEqual } from "node:crypto"

export const SERVICE_KEY_HEADER = "x-scroll-service-key"

/** keys must be at least this long to arm the lane */
export const SERVICE_KEY_MIN_LEN = 16

/**
 * per-IP sliding window for keyed requests (worker batches, so generous).
 * Override with ENGINE_SERVICE_RATE_LIMIT (red-team runs the lane against a
 * scratch server with a tiny cap to verify the 429 path without 600 calls).
 */
export const SERVICE_LANE_RATE_LIMIT = (() => {
  const raw = Number(process.env.ENGINE_SERVICE_RATE_LIMIT ?? "")
  if (!Number.isFinite(raw) || raw <= 0) return 600
  return Math.min(100_000, Math.floor(raw))
})()
export const SERVICE_LANE_WINDOW_MS = 60_000

/**
 * Timing-safe service-key check.
 * `envKey` defaults to process.env.ENGINE_SERVICE_KEY (injectable for tests).
 * Returns false when: lane unconfigured, key too short, header absent,
 * or any mismatch. Never throws.
 */
export function serviceKeyMatches(
  provided: string | null | undefined,
  envKey: string | undefined = process.env.ENGINE_SERVICE_KEY
): boolean {
  if (typeof provided !== "string" || provided.length === 0) return false
  if (typeof envKey !== "string" || envKey.length < SERVICE_KEY_MIN_LEN) return false
  // different lengths can't be equal; hash first so the compare is over a
  // fixed 32 bytes and reveals nothing about key length or content position
  const a = createHash("sha256").update(provided, "utf8").digest()
  const b = createHash("sha256").update(envKey, "utf8").digest()
  return timingSafeEqual(a, b)
}

/**
 * A userId the service lane may attribute events to. Strict on purpose —
 * this value becomes an EngineEvent.userId (FK-checked at write time, but
 * we reject junk before it costs a query):
 *   1–64 chars, starts alphanumeric, then [A-Za-z0-9_:-]
 */
const SERVICE_USER_ID_RE = /^[A-Za-z0-9][A-Za-z0-9_:-]{0,63}$/

export function isServiceUserId(v: unknown): v is string {
  return typeof v === "string" && SERVICE_USER_ID_RE.test(v)
}

// ── per-IP sliding window (single-process pilot; Redis at scale) ──

const hits = new Map<string, number[]>()

/** true = this IP is over the service-lane cap for the current minute */
export function serviceLaneRateLimited(ip: string, now: number = Date.now()): boolean {
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < SERVICE_LANE_WINDOW_MS)
  if (arr.length >= SERVICE_LANE_RATE_LIMIT) {
    hits.set(ip, arr)
    return true
  }
  arr.push(now)
  hits.set(ip, arr)
  // opportunistic sweep so the map can't grow unbounded under IP spray
  if (hits.size > 1_000) {
    for (const [k, v] of hits) {
      if (v.every((t) => now - t >= SERVICE_LANE_WINDOW_MS)) hits.delete(k)
    }
  }
  return false
}

/** test hook — clear the window state */
export function resetServiceLaneRateLimiter(): void {
  hits.clear()
}
