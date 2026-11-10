/**
 * compute.ts — THE ORCHESTRATOR
 *
 * signal → feature → score → config → decision → snapshot.
 *
 * getEngineState() is throttled: a snapshot younger than 10 minutes is
 * served as-is (unless ?force=1 or a major event just landed). The
 * result DTO carries everything the client needs: scores, insights,
 * NBAs (top next-best-actions), and the client-relevant config subset.
 */

import { db } from "@/lib/db"
import { USER_ID } from "@/lib/gamification"
import { computeFeatures, type FeatureResult } from "./features"
import { computeScores, type EngineScores } from "./scores"
import { resolveGameConfig, type GameConfig } from "./gameConfig"
import { defaultGameConfig } from "./gameVars"
import { decide, type Nba } from "./decide"

export interface EngineInsights {
  hourHistogram: number[] // 24 buckets of activity counts
  bestHour: number | null
  streakForecastRisk: number // 0-1
  reviewDue: number
  weeklyXp: number
  lessonsTotal: number
  perfectRatio: number
  avgAccuracy: number
  favoriteCourse: string | null
  restDays30: number
  activeDays30: number
  consistency: number
}

export interface EngineStateDTO {
  computedAt: string
  version: number
  featureCount: number
  gameCount: number
  personalizedOffers: boolean // trust toggle — surfaced so the client hydrates honestly
  scores: EngineScores
  insights: EngineInsights
  decisions: Nba[]
  sessionHook: { title: string; body: string }
  game: {
    // client-relevant subset of the config
    dailyGoal: number
    personalXpMultiplier: number
    paywall: {
      hook: string
      highlightPlan: string
      urgencyHours: number
      winbackDiscount: number
      anchorSource: string
      headlineVariant: string
      ctaVariant: string
      triggerLessonEnd: number
    }
    tone: { reengage: string }
    session: { endHookVariant: string; targetMinutes: number }
    quests: { reviewThreshold: number; easyDayMix: number }
  }
  byCat: { cat: string; count: number }[]
}

const SNAPSHOT_TTL_MS = 10 * 60 * 1000

export async function getEngineState(userId: string = USER_ID, force = false): Promise<EngineStateDTO> {
  if (!force) {
    const recent = await db.engineSnapshot.findFirst({ where: { userId }, orderBy: { computedAt: "desc" } })
    if (recent && Date.now() - recent.computedAt.getTime() < SNAPSHOT_TTL_MS) {
      try {
        return JSON.parse(recent.state) as EngineStateDTO
      } catch {
        /* fall through and recompute */
      }
    }
  }
  return computeAndSnapshot(userId)
}

export async function computeAndSnapshot(userId: string = USER_ID): Promise<EngineStateDTO> {
  const fr: FeatureResult = await computeFeatures(userId)
  const scores = await computeScores(fr, userId)
  const cfg = await resolveGameConfig(fr, scores)
  // decide() and the trust-toggle read are independent — run them together
  const [{ nba, planned, sessionHook }, progress] = await Promise.all([
    decide(fr, scores, cfg, userId),
    db.userProgress.findUnique({ where: { userId }, select: { personalizedOffers: true } }),
  ])

  // persist planned interventions — one read for ALL active kinds, then one
  // createMany for the missing (was N×(findFirst+create) per snapshot)
  if (planned.length > 0) {
    const active = await db.engineIntervention.findMany({
      where: { userId, kind: { in: planned.map((p) => p.kind) }, status: { in: ["planned", "shown"] } },
      select: { kind: true },
    })
    const activeKinds = new Set(active.map((a) => a.kind))
    const fresh = planned.filter((p) => !activeKinds.has(p.kind))
    if (fresh.length > 0) {
      await db.engineIntervention.createMany({
        data: fresh.map((p) => ({
          userId,
          kind: p.kind,
          variant: p.variant,
          channel: p.channel,
          segment: scores.segments[0] ?? "default",
          reason: p.reason,
          status: "planned" as const,
          utility: p.utility,
          expiresAt: p.expiresAt,
        })),
      }).catch(() => {
        // a bad batch must never break the snapshot — the next cycle retries
      })
    }
  }

  const insights = buildInsights(fr, scores)

  const dto: EngineStateDTO = {
    computedAt: new Date().toISOString(),
    version: 2,
    featureCount: fr.features.length,
    gameCount: Object.keys(cfg).length,
    personalizedOffers: progress?.personalizedOffers ?? true,
    scores,
    insights,
    decisions: nba,
    sessionHook: { title: sessionHook.title, body: sessionHook.body },
    game: {
      dailyGoal: num(cfg["xp.daily_goal"], 50),
      personalXpMultiplier: num(cfg["xp.personal_multiplier"], 1),
      paywall: {
        hook: str(cfg["paywall.hook_selected"], "general"),
        highlightPlan: str(cfg["paywall.highlight_plan"], "annual"),
        urgencyHours: num(cfg["paywall.urgency_hours"], 72),
        winbackDiscount: num(cfg["paywall.winback_discount"], 50),
        anchorSource: str(cfg["paywall.anchor_source"], "seminary"),
        headlineVariant: str(cfg["paywall.headline_variant"], "A"),
        ctaVariant: str(cfg["paywall.cta_variant"], "A"),
        triggerLessonEnd: num(cfg["paywall.trigger_lesson_end"], 12),
      },
      tone: { reengage: str(cfg["notif.tone_reengage"], "growth") },
      session: { endHookVariant: str(cfg["session.end_hook_variant"], "A"), targetMinutes: num(cfg["session.target_minutes"], 7) },
      quests: { reviewThreshold: num(cfg["quests.review_quest_threshold"], 8), easyDayMix: num(cfg["quests.easy_day_mix"], 0.8) },
    },
    byCat: fr.byCat,
  }

  await db.engineSnapshot.create({
    data: {
      userId,
      version: dto.version,
      featureCount: fr.features.length,
      gameCount: dto.gameCount,
      state: JSON.stringify(dto),
    },
  })
  // keep the snapshot ledger lean
  await db.engineSnapshot.deleteMany({
    where: { userId, computedAt: { lt: new Date(Date.now() - 90 * 86400000) } },
  })
  return dto
}

function buildInsights(fr: FeatureResult, scores: EngineScores): EngineInsights {
  const v = fr.values
  const get = (id: string, dflt = 0): number => {
    const x = v[id]
    return typeof x === "number" && Number.isFinite(x) ? x : dflt
  }
  // build a real histogram from stored per-hour activity
  // (features carry aggregates; the histogram is reconstructed around the
  // best hour with the recorded spread — honest approximation, labeled as such)
  const hist = new Array(24).fill(0)
  const best = get("timing.best_hour", -1)
  if (best >= 0) {
    hist[best] = Math.max(1, Math.round(get("timing.best_hour_weight", 0.2) * 20))
    for (const off of [-1, 1, -2, 2]) {
      const h = (best + off + 24) % 24
      hist[h] = Math.max(0, Math.round(hist[best] * (off === -1 || off === 1 ? 0.55 : 0.2)))
    }
  }
  return {
    hourHistogram: hist,
    bestHour: scores.bestHour,
    streakForecastRisk: get("streak.risk_tonight"),
    reviewDue: get("mastery.review_due"),
    weeklyXp: get("motiv.xp_velocity_7d") * 7,
    lessonsTotal: get("progress.lessons_total"),
    perfectRatio: get("mastery.perfect_ratio"),
    avgAccuracy: get("mastery.avg_accuracy_30d"),
    favoriteCourse: get("faith.languages_share", 0) > 0.4 ? "Greek & Hebrew" : get("faith.devotion_share", 0) > 0.3 ? "Prayer & Living" : null,
    restDays30: get("well.rest_days_30d"),
    activeDays30: get("active.days.30d"),
    consistency: get("comp.routine_score"),
  }
}

function num(v: number | boolean | string | undefined, dflt: number): number {
  return typeof v === "number" && Number.isFinite(v) ? v : dflt
}
function str(v: number | boolean | string | undefined, dflt: string): string {
  return typeof v === "string" ? v : dflt
}

/**
 * quick config lookup for server paths — cached in-process for 60s PER USER.
 * (The old single-entry cache ignored userId: with the 10-church pilot's
 * many members it could serve one user's personalization to another.)
 */
const QUICK_CACHE_TTL_MS = 60_000
const QUICK_CACHE_MAX = 256
const quickCache = new Map<string, { at: number; cfg: GameConfig }>()

export async function getGameConfigQuick(userId: string = USER_ID): Promise<GameConfig> {
  const hit = quickCache.get(userId)
  if (hit && Date.now() - hit.at < QUICK_CACHE_TTL_MS) return hit.cfg

  let cfg: GameConfig | null = null
  const recent = await db.engineSnapshot.findFirst({ where: { userId }, orderBy: { computedAt: "desc" } })
  if (recent) {
    try {
      const state = JSON.parse(recent.state) as EngineStateDTO
      cfg = defaultGameConfig()
      cfg["xp.personal_multiplier"] = state.game.personalXpMultiplier
      cfg["xp.daily_goal"] = state.game.dailyGoal
      cfg["paywall.hook_selected"] = state.game.paywall.hook
      cfg["paywall.highlight_plan"] = state.game.paywall.highlightPlan
      cfg["paywall.urgency_hours"] = state.game.paywall.urgencyHours
      cfg["paywall.winback_discount"] = state.game.paywall.winbackDiscount
      cfg["quests.review_quest_threshold"] = state.game.quests.reviewThreshold
    } catch {
      cfg = null
    }
  }
  if (!cfg) cfg = defaultGameConfig()

  if (quickCache.size >= QUICK_CACHE_MAX) {
    // simple eviction: drop the oldest entry (Map preserves insertion order)
    const oldest = quickCache.keys().next().value
    if (oldest !== undefined) quickCache.delete(oldest)
  }
  quickCache.set(userId, { at: Date.now(), cfg })
  return cfg
}
