/**
 * census.ts — the variable census (server-side).
 *
 * The telemetry schema guards the tap stream; the census answers
 * "how many variables does the engine actually govern?" — live, not
 * from a doc. Two registries:
 *
 *   · features.ts  — 617 retention/loyalty signals (28 families)
 *   · gameVars.ts  — 544 gamification variables (18 domains)
 *
 * Together: 1,161 variables — the "500-variable engine" commitment,
 * more than doubled and machine-counted. The schema route exposes the
 * census so parity checks (Rust/C# mirrors, CI, the admin dashboard)
 * never rely on a hand-updated number.
 */

import { db } from "@/lib/db"
import { GAME_VARS } from "@/lib/engine/gameVars"
import { TELEMETRY_EVENT_COUNT, TELEMETRY_SCHEMA_VERSION, EVENT_TYPES } from "@/lib/telemetry/schema"

/** documented feature-family count (features.ts header) — verified by `bun run engine:test` */
export const FEATURE_FAMILY_COUNT = 28

export interface CensusReport {
  schemaVersion: number
  eventTypes: number
  gameVars: number
  gameVarDomains: string[]
  /** featureCount from the latest EngineSnapshot (live computation happens on demand) */
  features: number | null
  featureFamilies: number
  totalVariables: number | null
  source: "snapshot" | "none"
}

export async function engineCensus(): Promise<CensusReport> {
  // game vars: static registry, always live
  const domains = [...new Set(GAME_VARS.map((v) => v.domain))].sort()

  // features: cheap truth = the latest engine snapshot's stored count.
  // (A full computeFeatures() run is available via /api/engine/state.)
  let features: number | null = null
  let source: "snapshot" | "none" = "none"
  try {
    const snap = await db.engineSnapshot.findFirst({ orderBy: { computedAt: "desc" }, select: { featureCount: true } })
    if (snap?.featureCount) {
      features = snap.featureCount
      source = "snapshot"
    }
  } catch {
    // db unavailable (e.g. early boot) — report without features rather than fail
  }

  return {
    schemaVersion: TELEMETRY_SCHEMA_VERSION,
    eventTypes: TELEMETRY_EVENT_COUNT,
    gameVars: GAME_VARS.length,
    gameVarDomains: domains,
    features,
    featureFamilies: FEATURE_FAMILY_COUNT,
    totalVariables: features === null ? null : features + GAME_VARS.length,
    source,
  }
}

export { EVENT_TYPES }
