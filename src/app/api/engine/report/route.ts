import { NextResponse } from "next/server"
import { getOrCreateUser, USER_ID } from "@/lib/gamification"
import { computeFeatures } from "@/lib/engine/features"
import { computeScores } from "@/lib/engine/scores"
import { resolveGameConfig } from "@/lib/engine/gameConfig"
import { decide } from "@/lib/engine/decide"
import { GAME_VARS } from "@/lib/engine/gameVars"
import { banditTable, EXPERIMENTS } from "@/lib/engine/bandit"
import { getEngineState } from "@/lib/engine/compute"
import { db } from "@/lib/db"

/**
 * GET /api/engine/report — registry counts, scores, model metrics, bandit
 * table, intervention funnel. Also regenerates docs/ENGINE-REGISTRY.md when
 * run through scripts/engine-report.ts.
 */
export async function GET() {
  try {
    await getOrCreateUser()
    const fr = await computeFeatures(USER_ID)
    const ids = new Set(fr.features.map((f) => f.id))
    const uniqueFeatures = ids.size
    const uniqueVars = new Set(GAME_VARS.map((v) => v.id)).size
    const scores = await computeScores(fr, USER_ID)
    const cfg = await resolveGameConfig(fr, scores)
    const d = await decide(fr, scores, cfg, USER_ID)
    const bandits = await banditTable()
    const state = await getEngineState(USER_ID)

    const [interventions, models, eventCount, snapshotCount] = await Promise.all([
      db.engineIntervention.findMany({ where: { userId: USER_ID }, select: { status: true, kind: true } }),
      db.engineModel.findMany(),
      db.engineEvent.count({ where: { userId: USER_ID } }),
      db.engineSnapshot.count({ where: { userId: USER_ID } }),
    ])
    const funnel = interventions.reduce<Record<string, number>>((acc, i) => {
      acc[i.status] = (acc[i.status] ?? 0) + 1
      return acc
    }, {})
    const personalizedAway = Object.keys(cfg).filter((k) => {
      const gv = GAME_VARS.find((v) => v.id === k)
      return gv && gv.def !== cfg[k]
    }).length

    return NextResponse.json({
      ok: true,
      registry: {
        features: uniqueFeatures,
        gameVars: uniqueVars,
        featureDupeCheck: uniqueFeatures === fr.features.length ? "OK" : "DUPLICATES",
        gameVarDupeCheck: uniqueVars === GAME_VARS.length ? "OK" : "DUPLICATES",
        families: fr.byCat,
        domains: GAME_VARS.reduce<Record<string, number>>((acc, v) => {
          acc[v.domain] = (acc[v.domain] ?? 0) + 1
          return acc
        }, {}),
        experiments: Object.keys(EXPERIMENTS).length,
        banditArms: bandits.length,
      },
      scores,
      resolvedConfig: { total: Object.keys(cfg).length, personalizedAway },
      decisions: { nba: d.nba.map((n) => ({ kind: n.kind, priority: Math.round(n.priority * 10) / 10 })) },
      models: models.map((m) => ({ name: m.name, version: m.version, sampleSize: m.sampleSize, metrics: safeParse(m.metrics) })),
      bandits,
      interventionFunnel: funnel,
      ledger: { events: eventCount, snapshots: snapshotCount, interventions: interventions.length },
      sessionHook: state.sessionHook,
    })
  } catch (e) {
    console.error("[api/engine/report]", e)
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}

function safeParse(s: string): Record<string, unknown> {
  try {
    return JSON.parse(s) as Record<string, unknown>
  } catch {
    return {}
  }
}

export const dynamic = "force-dynamic"
