/**
 * gameConfig.ts — THE CONFIG RESOLVER
 *
 * Layers, in order:
 *   1. defaults       — the registry above
 *   2. rule overrides — per-user feature/score-aware rules
 *   3. bandit arms    — Thompson-sampled experiment selections
 *   4. adaptive       — trained values from EngineModel("adaptive")
 *                       (best-hour EWMA, fatigue backoff, quest-mix momentum)
 *
 * Everything passes through type-checked getters; a bad row in the DB can
 * never poison the config (fallbacks to defaults on any mismatch).
 */

import { db } from "@/lib/db"
import type { FeatureResult } from "./features"
import type { EngineScores } from "./scores"
import { RULED_VARS, defaultGameConfig } from "./gameVars"
import { sampleArms } from "./bandit"

export type GameConfig = Record<string, number | string | boolean>

const BANDIT_MAP: Record<string, string> = {
  "paywall.hook_selected": "paywall_hook",
  "paywall.anchor_source": "paywall_anchor",
  "paywall.headline_variant": "paywall_headline",
  "paywall.cta_variant": "paywall_cta",
  "notif.tone_reengage": "nudge_tone",
  "quests.mix_label": "quest_mix",
  "notif.digest_day": "digest_day",
  "email.digest_day": "digest_day",
  "session.end_hook_variant": "session_end_hook",
  "paywall.winback_discount": "winback_depth",
  "email.winback_depth": "winback_depth",
}

/** unique bandit contexts — hoisted so it is computed once, not per snapshot */
const BANDIT_CONTEXTS = [...new Set(Object.values(BANDIT_MAP))]

/** quest_mix arm → metric weights — hoisted module constant */
const QUEST_MIX_WEIGHTS: Record<string, Record<string, number>> = {
  lesson: { "quests.metric_mix_weight_lesson": 1.4, "quests.metric_mix_weight_chapters": 0.6 },
  review: { "quests.metric_mix_weight_correct": 1.4, "quests.review_quest_threshold": 6 },
  reading: { "quests.metric_mix_weight_chapters": 1.5, "quests.metric_mix_weight_plan_days": 1.2 },
  social: { "quests.metric_mix_weight_combo": 1.0, "quests.social_quest_weight": 1.2 },
  balanced: {},
}

export async function resolveGameConfig(fr: FeatureResult, scores: EngineScores): Promise<GameConfig> {
  const cfg = defaultGameConfig()
  const v = fr.values

  // ── 1+2: defaults and per-user rules ──
  // RULED_VARS is the precomputed subset with a resolver (dozens, not all 544),
  // so the per-snapshot loop only visits variables that can actually change.
  for (const gv of RULED_VARS) {
    try {
      cfg[gv.id] = gv.rule(v, scores)
    } catch {
      // rule failure leaves the default — engine never breaks gameplay
    }
  }

  // ── 3: bandit arms (ONE batched query for all contexts) ──
  try {
    const drawn = await sampleArms(BANDIT_CONTEXTS)
    for (const [cfgKey, ctx] of Object.entries(BANDIT_MAP)) {
      const arm = drawn.get(ctx)
      if (arm !== undefined && arm !== "") {
        // type-safe assignment: number keys parse; string keys pass through
        const current = cfg[cfgKey]
        if (typeof current === "number") {
          const n = Number(arm)
          if (Number.isFinite(n)) cfg[cfgKey] = n
        } else if (typeof current === "string") {
          cfg[cfgKey] = arm
        }
      }
    }
    // quest_mix arm maps to metric weights
    const mix = drawn.get("quest_mix")
    if (mix) {
      for (const [k, n] of Object.entries(QUEST_MIX_WEIGHTS[mix] ?? {})) cfg[k] = n
    }
  } catch {
    // bandit failure — defaults stand
  }

  // ── 4: adaptive (trained) values ──
  try {
    const adaptive = await db.engineModel.findUnique({ where: { name: "adaptive" } })
    if (adaptive) {
      const w = JSON.parse(adaptive.weights || "{}") as Record<string, number>
      for (const [k, val] of Object.entries(w)) {
        if (!(k in cfg)) continue
        if (typeof val === "number" && Number.isFinite(val)) {
          if (typeof cfg[k] === "number") cfg[k] = val
        }
      }
    }
  } catch {
    // adaptive failure — defaults stand
  }

  // ── hard integrity rules (never overridable) ──
  cfg["tone.guilt_ban"] = 1
  cfg["tone.fear_ban"] = 1
  cfg["tone.false_scarcity_ban"] = 1
  cfg["paywall.no_dark_patterns"] = 1
  cfg["paywall.suppress_for_pro"] = 1
  cfg["paywall.suppress_if_opted_out"] = 1
  cfg["wellbeing.burnout_priority_over_revenue"] = 1
  cfg["experiment.sign_guard_on"] = 1
  cfg["experiment.auc_guard_on"] = 1
  cfg["econ.scarcity_mechanics"] = 0

  return cfg
}
