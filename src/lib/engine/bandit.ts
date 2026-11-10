/**
 * bandit.ts — Thompson-sampling experiment engine.
 *
 * Each (context, arm) row keeps a Beta(α, β) posterior in EngineBandit.
 * Sampling = one Beta draw per arm, argmax wins (with ε-exploration).
 * Outcomes are recorded online; stale posteriors decay after 90 days.
 *
 * Guarded: beta draws are finite-checked; degenerate rows fall back to
 * uniform; missing arms auto-seed with the prior Beta(1,1).
 */

import { db } from "@/lib/db"

export const EXPERIMENTS: Record<string, string[]> = {
  paywall_hook: ["onboarding", "hearts", "shop", "profile", "lessonEnd", "general"],
  paywall_anchor: ["seminary", "books", "tutor"],
  paywall_headline: ["A", "B", "C", "D"],
  paywall_cta: ["A", "B", "C", "D"],
  nudge_tone: ["growth", "identity", "stewardship"],
  quest_mix: ["lesson", "review", "reading", "social", "balanced"],
  reward_boost: ["none", "xp_surge", "gem_rain", "weekend_double"],
  winback_depth: ["50", "40", "30"],
  digest_day: ["monday", "sunday"],
  session_end_hook: ["A", "B", "C"],
}

const STALE_DAYS = 90

function betaDraw(alpha: number, beta: number): number {
  const a = Math.max(0.05, Math.min(500, alpha))
  const b = Math.max(0.05, Math.min(500, beta))
  // Gaussian-approximated Beta via sum of gaussians is unstable; use the
  // exact relationship: if G1 ~ Gamma(a), G2 ~ Gamma(b) then G1/(G1+G2) ~ Beta(a,b).
  // Marsaglia-Tsang gamma sampling:
  const g1 = gammaSample(a)
  const g2 = gammaSample(b)
  const tot = g1 + g2
  if (!(tot > 0) || !Number.isFinite(tot)) return 0.5
  return Math.min(1, Math.max(0, g1 / tot))
}

function gammaSample(shape: number): number {
  if (shape < 1) {
    const u = Math.random()
    return gammaSample(shape + 1) * Math.pow(u, 1 / shape)
  }
  const d = shape - 1 / 3
  const c = 1 / Math.sqrt(9 * d)
  for (let i = 0; i < 64; i++) {
    let x: number
    let v: number
    do {
      x = gauss()
      v = 1 + c * x
    } while (v <= 0)
    v = v * v * v
    const u = Math.random()
    if (u < 1 - 0.0331 * x * x * x * x) return d * v
    if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v
  }
  return d // fallback: mean
}

function gauss(): number {
  let u = 0
  let v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

export async function ensureArms(): Promise<void> {
  // one findMany for ALL contexts, then parallel seed-creates for the missing
  const existing = await db.engineBandit.findMany({ select: { context: true, arm: true } })
  const have = new Set(existing.map((e) => `${e.context}::${e.arm}`))
  const seeds: { context: string; arm: string; alpha: number; beta: number }[] = []
  for (const [context, arms] of Object.entries(EXPERIMENTS)) {
    for (const arm of arms) if (!have.has(`${context}::${arm}`)) seeds.push({ context, arm, alpha: 1, beta: 1 })
  }
  if (seeds.length > 0) await Promise.all(seeds.map((s) => db.engineBandit.create({ data: s }).catch(() => {})))
}

/**
 * draw the winning arm for a context
 * (single-context convenience wrapper — see sampleArms for the batch path)
 */
export async function sampleArm(context: string): Promise<string> {
  const drawn = await sampleArms([context])
  return drawn.get(context) ?? ""
}

/** in-memory Thompson draw for one context given its posterior rows */
function pickArm(arms: string[], rows: Map<string, { arm: string; alpha: number; beta: number }>): string {
  // ε-exploration: 8% pure random
  if (Math.random() < 0.08) return arms[Math.floor(Math.random() * arms.length)]
  let bestArm = arms[0]
  let bestDraw = -1
  for (const arm of arms) {
    const r = rows.get(arm)
    const draw = r ? betaDraw(r.alpha, r.beta) : betaDraw(1, 1)
    if (Number.isFinite(draw) && draw > bestDraw) {
      bestDraw = draw
      bestArm = arm
    }
  }
  return bestArm
}

/**
 * draw winning arms for MANY contexts in ONE database round-trip —
 * the config resolver samples all 10 experiment contexts per snapshot,
 * so this collapses 10 sequential queries into a single `WHERE context IN …`.
 */
export async function sampleArms(contexts: string[]): Promise<Map<string, string>> {
  const valid = contexts.filter((c) => (EXPERIMENTS[c] ?? []).length > 0)
  const out = new Map<string, string>()
  if (valid.length === 0) return out
  const rows = (await db.engineBandit
    .findMany({ where: { context: { in: valid } } })
    .catch(() => [])) as { context: string; arm: string; alpha: number; beta: number }[]
  const byContext = new Map<string, Map<string, { arm: string; alpha: number; beta: number }>>()
  for (const r of rows) {
    let m = byContext.get(r.context)
    if (!m) {
      m = new Map()
      byContext.set(r.context, m)
    }
    m.set(r.arm, r)
  }
  for (const ctx of valid) out.set(ctx, pickArm(EXPERIMENTS[ctx], byContext.get(ctx) ?? new Map()))
  return out
}

/** record an exposure (failure by default — success only on conversion) */
export async function recordOutcome(context: string, arm: string, success: boolean): Promise<void> {
  if (!EXPERIMENTS[context] || !EXPERIMENTS[context].includes(arm)) return
  await db.engineBandit
    .upsert({
      where: { context_arm: { context, arm } },
      create: { context, arm, alpha: success ? 2 : 1, beta: success ? 1 : 2, exposures: 1, converts: success ? 1 : 0 },
      update: {
        exposures: { increment: 1 },
        ...(success ? { alpha: { increment: 1 }, converts: { increment: 1 } } : { beta: { increment: 1 } }),
        updatedAt: new Date(),
      },
    })
    .catch(() => {})
}

/** decay stale posteriors (>90d without a refresh) — called by train */
export async function decayStale(): Promise<number> {
  const staleBefore = new Date(Date.now() - STALE_DAYS * 86400000)
  const rows = (await db.engineBandit.findMany({ where: { updatedAt: { lt: staleBefore } } }).catch(() => [])) as { id: string; alpha: number; beta: number }[]
  let decayed = 0
  await Promise.all(
    rows.map((r) =>
      db.engineBandit
        .update({
          where: { id: r.id },
          data: {
            alpha: Math.max(1, r.alpha * 0.7),
            beta: Math.max(1, r.beta * 0.7),
            updatedAt: new Date(),
          },
        })
        .catch(() => {})
    )
  )
  decayed = rows.length
  return decayed
}

/** posterior table for the report */
export async function banditTable(): Promise<{ context: string; arm: string; alpha: number; beta: number; exposures: number; converts: number; rate: number }[]> {
  const rows = (await db.engineBandit.findMany({ orderBy: [{ context: "asc" }, { arm: "asc" }] }).catch(() => [])) as { context: string; arm: string; alpha: number; beta: number; exposures: number; converts: number }[]
  return rows.map((r) => ({
    context: r.context,
    arm: r.arm,
    alpha: Math.round(r.alpha * 100) / 100,
    beta: Math.round(r.beta * 100) / 100,
    exposures: r.exposures,
    converts: r.converts,
    rate: r.exposures > 0 ? Math.round((r.converts / r.exposures) * 1000) / 1000 : 0,
  }))
}
