/**
 * scores.ts — THE MODELS
 *
 *   churnRisk   P(inactive within 7 days) — logistic over normalized features,
 *               priors hand-set from retention science; refit nightly by SGD
 *               (train.ts) with sign guards: learned weights may strengthen a
 *               documented direction but never flip it.
 *   engagement  0–1 breadth × depth × consistency
 *   loyalty     0–100 RFM+T+A → tiers Parchment → Scroll → Codex → Library
 *   wtp         willingness-to-pay 0–1
 *   ltv90       projected 90-day value ($)
 *   burnoutRisk 0–1 overuse/frustration trend — protects the human
 *   bestHour / bestChannel — timing & routing
 *
 * Math hardening: sigmoid is overflow-safe; every ratio divides by
 * max(1, d); every output passes clamp01/clamp; NaN can never propagate.
 */

import { db } from "@/lib/db"
import { USER_ID } from "@/lib/gamification"
import type { FeatureResult } from "./features"

export interface EngineScores {
  churnRisk: number
  engagement: number
  loyalty: number
  loyaltyTier: number // 0-3
  loyaltyTierName: string
  loyaltyProgress: number // 0-1 toward next tier
  wtp: number
  ltv90: number
  virality: number
  burnoutRisk: number
  priceSensitivity: number
  discountAffinity: number
  bestHour: number | null
  bestChannel: "push" | "email" | "both"
  segments: string[]
  habitStage: "sparking" | "starting" | "establishing" | "automatic" | "identity"
}

// ─────────────────────────────────────────────────────────────
//  safe math
// ─────────────────────────────────────────────────────────────

function num(x: unknown, dflt = 0): number {
  if (typeof x === "number" && Number.isFinite(x)) return x
  if (typeof x === "boolean") return x ? 1 : 0
  return dflt
}
function clamp01(x: number): number {
  return Math.min(1, Math.max(0, num(x)))
}
function clamp(x: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, num(x)))
}
/** overflow-safe logistic */
export function sigmoid(z: number): number {
  const v = num(z)
  if (v >= 0) return 1 / (1 + Math.exp(-Math.min(35, v)))
  const e = Math.exp(Math.max(-35, v))
  return e / (1 + e)
}

// ─────────────────────────────────────────────────────────────
//  churn priors — documented directions (sign-guarded in training)
// ─────────────────────────────────────────────────────────────

export const CHURN_PRIORS: Record<string, number> = {
  // recency — the strongest single predictor
  "recency.days_since_lesson": 0.62,
  "recency.gap_days": 0.30,
  "recency.hours_since_any": 0.012,
  "z.inv_recency_days": -0.9,
  // frequency collapse
  "delta.lessons_7vprev": -0.08,
  "delta.active_7vprev": -0.05,
  "delta.regression_flag": 0.55,
  "delta.engagement_slope": -0.5,
  "delta.momentum_score": -0.7,
  // consistency
  "comp.consistency_7d": -0.35,
  "comp.consistency_30d": -0.55,
  "comp.routine_score": -0.3,
  "active.gap_z": 0.18,
  "active.pre_lapse_drop": 0.22,
  // streak protection
  "streak.risk_tonight": 0.12,
  "streak.is_alive": -0.28,
  // mastery & frustration
  "mastery.sputnik": 0.25,
  "mastery.review_pressure": 0.04,
  "well.frustration_signal": 0.3,
  "well.burnout_risk": 0.4,
  // social glue
  "social.friends": -0.05,
  "social.friends_3plus": -0.18,
  "community.actions_total": -0.01,
  // habit depth
  "progress.lessons_total": -0.012,
  "z.log_lessons": -0.22,
  "meta.confidence": -0.15,
  "meta.cold_start": 0.2,
  // lifecycle
  "tenure.sophomore_slump": 0.0,
  "delta.sophomore_slump": 0.3,
  "tenure.is_lapsed_30d": 0.8,
}

const CHURN_BIAS = -1.35 // base rate prior: most days, most users, are fine

// ─────────────────────────────────────────────────────────────
//  wtp priors
// ─────────────────────────────────────────────────────────────

export const WTP_PRIORS: Record<string, number> = {
  "monet.paywall_views": 0.06,
  "monet.paywall_cta_clicks": 0.22,
  "monet.paywall_open_rate": 0.8,
  "monet.winback_accept_rate": 0.5,
  "monet.shop_views": 0.015,
  "monet.spend_events_30d": 0.12,
  "monet.freeze_purchases": 0.08,
  "monet.heart_purchases": 0.08,
  "progress.lessons_total": 0.014,
  "progress.level": 0.03,
  "z.log_lessons": 0.25,
  "engagement_composite_placeholder": 0,
  "social.friends": 0.02,
  "faith.languages_share": 0.2,
  "econ.gem_poor": 0.08,
  "econ.hearts_empty_events_7d": 0.05,
}
const WTP_BIAS = -2.1

// ─────────────────────────────────────────────────────────────
//  learned-model runner (weights come from EngineModel rows)
// ─────────────────────────────────────────────────────────────

export function runModel(weights: Record<string, number>, bias: number, values: Record<string, number>): number {
  let z = num(bias)
  for (const [k, w] of Object.entries(weights)) {
    if (typeof w !== "number" || !Number.isFinite(w)) continue
    const v = num(values[k])
    // features are unbounded; tame them so one wild value can't explode
    const tamed = Math.max(-10, Math.min(10, v))
    z += Math.max(-8, Math.min(8, w)) * tamed
  }
  return sigmoid(z)
}

// ─────────────────────────────────────────────────────────────
//  the scorer
// ─────────────────────────────────────────────────────────────

const LOYALTY_TIERS = [
  { name: "Parchment", at: 0 },
  { name: "Scroll", at: 40 },
  { name: "Codex", at: 60 },
  { name: "Library", at: 82 },
]

export async function computeScores(fr: FeatureResult, userId: string = USER_ID): Promise<EngineScores> {
  const v = fr.values
  const get = (id: string, dflt = 0): number => num(v[id], dflt)

  // load learned models if present
  let churnWeights = CHURN_PRIORS
  let churnBias = CHURN_BIAS
  let wtpWeights = WTP_PRIORS
  let wtpBias = WTP_BIAS
  try {
    const models = await db.engineModel.findMany({ where: { name: { in: ["churn", "conversion"] } } })
    for (const m of models) {
      const w = JSON.parse(m.weights || "{}") as Record<string, number>
      if (m.name === "churn" && Object.keys(w).length > 0 && (m.sampleSize ?? 0) >= 30) {
        churnWeights = w
        churnBias = num(m.bias, CHURN_BIAS)
      }
      if (m.name === "conversion" && Object.keys(w).length > 0 && (m.sampleSize ?? 0) >= 30) {
        wtpWeights = w
        wtpBias = num(m.bias, WTP_BIAS)
      }
    }
  } catch {
    // priors stay — engine must never fail on a model-read error
  }

  // ── churn ──
  let churnRisk = clamp01(runModel(churnWeights, churnBias, v))

  // ── engagement composite ──
  const breadth = clamp01(get("surface.distinct_surfaces_7d", 0) / 6)
  const depth = clamp01(get("comp.engagement_composite", 0))
  const consistency = clamp01((clamp01(get("comp.consistency_7d", 0)) + clamp01(get("comp.consistency_30d", 0))) / 2)
  const autonomy = clamp01(get("comp.intrinsic_mix", 0))
  const engagement = clamp01(breadth * 0.2 + depth * 0.45 + consistency * 0.25 + autonomy * 0.1)

  // ── loyalty: RFM + T + A (0-100) ──
  // v11.5 rebalance: advocacy 0.05 → 0.09, monetary 0.15 → 0.13, frequency
  // 0.30 → 0.28. The retention literature is unambiguous — social ties are
  // the strongest single glue (Strava kudos, Peloton callouts, the
  // "friends_3plus" churn prior) — so the loyalty score now weighs what a
  // learner *brings to others*, not only what they spend. Tiers unchanged.
  const recencyScore = clamp01(1 - Math.min(1, get("recency.gap_days", 30) / 14)) // 14d quiet → 0
  const freqScore = clamp01(get("comp.consistency_30d", 0))
  const monetary = clamp01(get("monet.ltv_signals", 0))
  const tenureScore = clamp01(get("meta.history_days", 0) / 180)
  const advocacy = clamp01(get("social.virality_events", 0) / 8)
  const loyaltyRaw = 100 * clamp01(
    recencyScore * 0.30 +
    freqScore * 0.28 +
    monetary * 0.13 +
    tenureScore * 0.10 +
    advocacy * 0.09 +
    engagement * 0.10,
  )
  const loyalty = clamp(loyaltyRaw, 0, 100)
  let loyaltyTier = 0
  for (let i = 0; i < LOYALTY_TIERS.length; i++) if (loyalty >= LOYALTY_TIERS[i].at) loyaltyTier = i
  const tierName = LOYALTY_TIERS[loyaltyTier].name
  const nextAt = loyaltyTier < LOYALTY_TIERS.length - 1 ? LOYALTY_TIERS[loyaltyTier + 1].at : 100
  const curAt = LOYALTY_TIERS[loyaltyTier].at
  const loyaltyProgress = clamp01((loyalty - curAt) / Math.max(1, nextAt - curAt))

  // ── wtp: behavior model blended with engagement & proven value ──
  const wtpBehavioral = clamp01(runModel(wtpWeights, wtpBias, v))
  const lessons = get("progress.lessons_total", 0)
  const provenValue = clamp01(Math.log10(1 + lessons) / 2) // 100 lessons ≈ 1.0
  const wtp = clamp01(wtpBehavioral * 0.6 + provenValue * 0.25 + engagement * 0.15)

  // ── ltv90 (dollars, plan-value weighted) ──
  const isPro = get("monet.is_pro", 0) === 1
  const isLifetime = get("monet.plan_code", 0) === 2
  const planValue = isLifetime ? 149 : isPro ? 59.99 / 3 : 0
  const freeOptionValue = clamp01(engagement * 0.7 + wtp * 0.3) * 12 * (1 - churnRisk)
  const ltv90 = clamp(planValue * (1 - clamp01(churnRisk * 0.8)) + freeOptionValue, 0, 500)

  // ── virality ──
  const virality = clamp01(
    clamp01(get("social.virality_events", 0) / 5) * 0.5 +
    clamp01(get("social.friends", 0) / 8) * 0.3 +
    clamp01(get("community.verse_shares", 0) / 10) * 0.2,
  )

  // ── burnout ──
  const burnoutRisk = clamp01(get("well.burnout_risk", 0) * 0.6 + clamp01(get("well.frustration_signal", 0)) * 0.4)

  // ── price posture ──
  const dismissRate = clamp01(get("monet.dismiss_rate", 0))
  const winbackSnoozes = get("monet.winback_snoozes", 0)
  const priceSensitivity = clamp01(dismissRate * 0.7 + clamp01(winbackSnoozes / 5) * 0.3)
  const discountAffinity = clamp01(clamp01(get("monet.winback_accept_rate", 0)) * 0.6 + clamp01(get("econ.gem_poor", 0)) * 0.4)

  // ── timing & routing ──
  const bestHour = get("timing.best_hour", -1) >= 0 ? Math.round(get("timing.best_hour", -1)) : null
  const emailOpens = get("email.opens", 0)
  const notifOpens = get("notif.opened_total", 0)
  const bestChannel: "push" | "email" | "both" =
    emailOpens > 0 && notifOpens > 0 ? "both" : emailOpens > 0 ? "email" : "push"

  // ── segments (readable, for reporting & copy selection) ──
  const segments: string[] = []
  const active30 = get("active.days.30d", 0)
  if (get("meta.cold_start", 0) === 1 || get("tenure.is_new_7d", 0) === 1) segments.push("new_user")
  if (active30 >= 20 && get("comp.consistency_30d", 0) >= 0.6) segments.push("power_user")
  if (churnRisk >= 0.6) segments.push("high_churn_risk")
  if (wtp >= 0.55) segments.push("high_wtp")
  if (isPro) segments.push("pro_member")
  if (get("monet.cancelled_within_21d", 0) === 1) segments.push("recent_canceller")
  if (get("faith.devotion_share", 0) >= 0.5) segments.push("devoted_reader")
  if (get("social.friends", 0) === 0 && get("progress.lessons_total", 0) >= 10) segments.push("solo_learner")
  if (burnoutRisk >= 0.55) segments.push("burnout_watch")
  if (segments.length === 0) segments.push("core")

  // ── habit stage (BJ Fogg / James Clear framing) ──
  const activeTotal = get("active.days.total", 0)
  const consistency30 = clamp01(get("comp.consistency_30d", 0))
  const habitStage: EngineScores["habitStage"] =
    activeTotal < 3 ? "sparking"
      : activeTotal < 10 ? "starting"
        : activeTotal < 21 ? "establishing"
          : consistency30 < 0.5 ? "automatic"
            : "identity"

  return {
    churnRisk,
    engagement,
    loyalty,
    loyaltyTier,
    loyaltyTierName: tierName,
    loyaltyProgress,
    wtp,
    ltv90: Math.round(ltv90 * 100) / 100,
    virality,
    burnoutRisk,
    priceSensitivity,
    discountAffinity,
    bestHour,
    bestChannel,
    segments,
    habitStage,
  }
}
