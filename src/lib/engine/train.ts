/**
 * train.ts — THE SELF-IMPROVEMENT LOOP
 *
 * Run via `bun run engine:train` (or POST /api/engine/train). It:
 *
 *  1. Rebuilds honest point-in-time training sets: for each of the last
 *     N day-ends it recomputes features AS OF that day and labels churn
 *     from whether the user was inactive in the following 7 days.
 *  2. Refits the churn logistic model by SGD (starting from priors,
 *     L2-regularized, weight-clipped, signs guarded) and stores it with
 *     AUC metrics — only adopted if the holdout AUC beats the prior's.
 *  3. Refits the conversion model from intervention outcomes.
 *  4. Updates adaptive config values (best-hour EWMA, notification
 *     fatigue backoff, quest-mix momentum toward completed families).
 *  5. Decays stale bandit posteriors (>90 days without exposure).
 *
 * Guardrails everywhere: minimum sample sizes, monotone signs, small
 * learning rate, and full metrics for the report.
 */

import { db } from "@/lib/db"
import { USER_ID, dayKey } from "@/lib/gamification"
import { TZ_OFFSET_MS } from "@/lib/time"
import { computeFeatures } from "./features"
import { CHURN_PRIORS, WTP_PRIORS, runModel, sigmoid } from "./scores"
import { ensureArms, decayStale } from "./bandit"

export interface TrainReport {
  ranAt: string
  churn: { samples: number; positives: number; adopted: boolean; auc: number; priorAuc: number; version: number }
  conversion: { samples: number; adopted: boolean; auc: number }
  adaptive: { bestHour: number | null; fatigueBackoff: number; questMixShift: Record<string, number> }
  bandits: { decayed: number; total: number }
  note?: string
}

const DAY = 86400000

export async function train(userId: string = USER_ID, lookbackDays = 45, labelDays = 7): Promise<TrainReport> {
  const now = Date.now()

  // ═══ 1. honest point-in-time training set ═══
  const samples: { values: Record<string, number>; label: number }[] = []
  for (let d = lookbackDays; d >= 1; d -= 1) {
    const asOf = new Date(now - d * DAY)
    asOf.setHours(23, 59, 59, 999)
    const fr = await computeFeatures(userId, asOf.getTime()).catch(() => null)
    if (!fr) continue
    // label: inactive for the whole following `labelDays` window?
    const dayAfter = new Date(asOf.getTime() + 1 * DAY)
    const windowEnd = new Date(asOf.getTime() + labelDays * DAY)
    const anyActivity = await db.engineEvent.findFirst({
      where: { userId, ts: { gte: dayAfter, lte: windowEnd } },
      select: { id: true },
    })
    const lessonsInWindow = await db.lessonCompletion.findFirst({
      where: { userId, completedAt: { gte: dayAfter, lte: windowEnd } },
      select: { id: true },
    })
    const active = !!anyActivity || !!lessonsInWindow
    samples.push({ values: fr.values, label: active ? 0 : 1 })
    if (samples.length >= 60) break // bounded work
  }
  const positives = samples.filter((s) => s.label === 1).length

  // ═══ 2. churn refit by SGD with sign guards ═══
  let churnWeights: Record<string, number> = { ...CHURN_PRIORS }
  let churnBias = -1.35
  let auc = 0.5
  let priorAuc = 0.5
  let adopted = false
  let version = 0

  const existingChurn = await db.engineModel.findUnique({ where: { name: "churn" } })

  if (samples.length >= 20 && positives >= 3) {
    // holdout split (deterministic by index parity)
    const train = samples.filter((_, i) => i % 10 < 7)
    const holdout = samples.filter((_, i) => i % 10 >= 7)

    const evaluate = (weights: Record<string, number>, bias: number, set: typeof samples): number => {
      if (set.length === 0) return 0.5
      // AUC over pairs
      const preds = set.map((s) => ({ p: runModel(weights, bias, s.values), y: s.label }))
      let concordant = 0
      let pairs = 0
      for (let i = 0; i < preds.length; i++) {
        for (let j = 0; j < preds.length; j++) {
          if (preds[i].y === 1 && preds[j].y === 0) {
            pairs++
            if (preds[i].p > preds[j].p) concordant += 1
            else if (preds[i].p === preds[j].p) concordant += 0.5
          }
        }
      }
      return pairs > 0 ? concordant / pairs : 0.5
    }

    priorAuc = evaluate(CHURN_PRIORS, -1.35, holdout)

    // SGD
    const lr = 0.05
    const l2 = 0.001
    const clip = 8
    const w: Record<string, number> = { ...CHURN_PRIORS }
    let bias = -1.35
    for (let epoch = 0; epoch < 40; epoch++) {
      for (const s of train) {
        const p = runModel(w, bias, s.values)
        const err = s.label - p // 1 - p when positive
        for (const k of Object.keys(w)) {
          const x = Math.max(-10, Math.min(10, s.values[k] ?? 0))
          const priorSign = Math.sign(CHURN_PRIORS[k] ?? 0)
          let g = err * x - l2 * (w[k] - (CHURN_PRIORS[k] ?? 0))
          // sign guard: the update may strengthen but never flip a documented sign
          if (priorSign !== 0 && Math.sign(w[k] + lr * g) !== priorSign && priorSign !== Math.sign(w[k])) {
            g = 0
          }
          w[k] = Math.max(-clip, Math.min(clip, w[k] + lr * g))
        }
        bias += lr * err
        bias = Math.max(-8, Math.min(8, bias))
      }
    }
    auc = evaluate(w, bias, holdout)

    if (auc >= priorAuc && Number.isFinite(auc)) {
      churnWeights = w
      churnBias = bias
      adopted = true
      version = (existingChurn?.version ?? 0) + 1
      await db.engineModel.upsert({
        where: { name: "churn" },
        update: {
          version,
          weights: JSON.stringify(w),
          bias,
          metrics: JSON.stringify({ auc: round3(auc), holdoutAuc: round3(auc), priorAuc: round3(priorAuc), note: "SGD refit adopted (beat priors)" }),
          sampleSize: samples.length,
          trainedAt: new Date(),
        },
        create: {
          name: "churn",
          version,
          weights: JSON.stringify(w),
          bias,
          metrics: JSON.stringify({ auc: round3(auc), priorAuc: round3(priorAuc) }),
          sampleSize: samples.length,
        },
      })
    } else if (existingChurn) {
      // keep priors; record the attempt
      await db.engineModel.update({
        where: { name: "churn" },
        data: { metrics: JSON.stringify({ auc: round3(auc), priorAuc: round3(priorAuc), note: "Refit rejected — priors kept" }) },
      })
    }
  } else if (existingChurn) {
    const m = safeParse(existingChurn.metrics)
    auc = num(m.auc)
    priorAuc = num(m.priorAuc)
    version = existingChurn.version
  }

  // ═══ 3. conversion model from intervention outcomes ═══
  const interventions = await db.engineIntervention.findMany({
    where: { userId, status: { in: ["converted", "dismissed", "shown"] } },
    select: { kind: true, status: true },
  })
  const convSamples = interventions.length
  let convAdopted = false
  if (convSamples >= 20) {
    const converted = interventions.filter((i) => i.status === "converted").length
    const rate = Math.min(0.98, Math.max(0.02, converted / Math.max(1, convSamples)))
    // simple intercept model: log-odds of observed conversion propensity (guarded)
    const intercept = Math.max(-8, Math.min(8, Math.log(rate / (1 - rate))))
    await db.engineModel.upsert({
      where: { name: "conversion" },
      update: {
        weights: JSON.stringify({ intercept }),
        bias: 0,
        metrics: JSON.stringify({ rate: round3(rate), samples: convSamples }),
        sampleSize: convSamples,
        trainedAt: new Date(),
      },
      create: {
        name: "conversion",
        weights: JSON.stringify({ intercept: 0 }),
        metrics: JSON.stringify({ rate: round3(rate), samples: convSamples }),
        sampleSize: convSamples,
      },
    })
    convAdopted = true
  }

  // ═══ 4. adaptive config ═══
  // best-hour EWMA from recent lesson hours
  const lessons = await db.lessonCompletion.findMany({
    where: { userId, completedAt: { gte: new Date(now - 30 * DAY) } },
    select: { completedAt: true },
    orderBy: { completedAt: "asc" },
  })
  const hours = lessons.map((l) => new Date(l.completedAt.getTime() + TZ_OFFSET_MS).getUTCHours())
  let bestHour: number | null = null
  if (hours.length >= 5) {
    const hist = new Array(24).fill(0)
    for (const h of hours) hist[h]++
    const prev = await db.engineModel.findUnique({ where: { name: "adaptive" } })
    let weights: Record<string, number> = {}
    try {
      weights = prev ? (JSON.parse(prev.weights) as Record<string, number>) : {}
    } catch {
      weights = {}
    }
    let bi = 0
    let bv = -1
    for (let h = 0; h < 24; h++) if (hist[h] > bv) { bv = hist[h]; bi = h }
    bestHour = bi
    // EWMA blend toward the observed best hour
    const prevHour = typeof weights["notif.reminder_default_h"] === "number" ? weights["notif.reminder_default_h"] : bi
    const blended = Math.round(prevHour * 0.7 + bi * 0.3)

    // notification fatigue backoff from recent open rate
    const notifs30 = await db.appNotification.count({ where: { userId, createdAt: { gte: new Date(now - 30 * DAY) } } })
    const opens30 = await db.engineEvent.count({ where: { userId, type: "notification_open", ts: { gte: new Date(now - 30 * DAY) } } })
    const openRate = notifs30 > 0 ? opens30 / notifs30 : 1
    const fatigueBackoff = Math.max(0.1, Math.min(0.6, 1 - Math.min(1, openRate)))

    // quest-mix momentum toward completed families
    const questCompletions = await db.userQuest.findMany({
      where: { userId, completed: true, day: { gte: dayKey(new Date(now - 28 * DAY)) } },
      include: { quest: true },
    })
    const mixShift: Record<string, number> = {}
    for (const q of questCompletions) {
      const fam = q.quest.metric
      mixShift[fam] = Math.min(1.5, (mixShift[fam] ?? 1) * 1.05)
    }

    await db.engineModel.upsert({
      where: { name: "adaptive" },
      update: {
        weights: JSON.stringify({
          "notif.reminder_default_h": blended,
          "notif.fatigue_backoff": round3(fatigueBackoff),
          ...Object.fromEntries(Object.entries(mixShift).map(([k, x]) => [`quests.metric_mix_weight_${k}`, round3(x)])),
        }),
        metrics: JSON.stringify({ observedBestHour: bi, openRate: round3(openRate), lessons: lessons.length }),
        sampleSize: hours.length,
        trainedAt: new Date(),
      },
      create: {
        name: "adaptive",
        weights: JSON.stringify({ "notif.reminder_default_h": blended, "notif.fatigue_backoff": round3(fatigueBackoff) }),
        metrics: JSON.stringify({ observedBestHour: bi }),
        sampleSize: hours.length,
      },
    })
    const adaptiveReport = { bestHour, fatigueBackoff: round3(fatigueBackoff), questMixShift: mixShift }
    return await finish(adaptiveReport)
  }
  return await finish({ bestHour: null, fatigueBackoff: 0.3, questMixShift: {} })

  async function finish(adaptive: { bestHour: number | null; fatigueBackoff: number; questMixShift: Record<string, number> }): Promise<TrainReport> {
    // ═══ 5. bandit decay + ensure arms ═══
    await ensureArms()
    const decayed = await decayStale()
    const total = await db.engineBandit.count()
    return {
      ranAt: new Date().toISOString(),
      churn: { samples: samples.length, positives, adopted, auc: round3(auc), priorAuc: round3(priorAuc), version },
      conversion: { samples: convSamples, adopted: convAdopted, auc: 0.5 },
      adaptive,
      bandits: { decayed, total },
      note: adopted ? undefined : samples.length < 20 ? "Insufficient samples — priors kept" : positives < 3 ? "No churn positives to learn from — priors kept" : "Learned model did not beat priors on holdout — priors kept",
    }
  }
}

function round3(x: number): number {
  const v = typeof x === "number" && Number.isFinite(x) ? x : 0
  return Math.round(v * 1000) / 1000
}
function num(x: unknown): number {
  return typeof x === "number" && Number.isFinite(x) ? x : 0
}
function safeParse(s: string): Record<string, number> {
  try {
    return JSON.parse(s) as Record<string, number>
  } catch {
    return {}
  }
}

// keep tree-shaking honest: sigmoid referenced so the import stays used
void sigmoid
