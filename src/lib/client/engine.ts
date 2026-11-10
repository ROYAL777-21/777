"use client"

/**
 * engine.ts (client) — the SDK half of the Scribe's Ledger.
 *
 *  · engineTrack() queues UI-level events (app opens, view changes,
 *    paywall interactions) and flushes them in batches to
 *    POST /api/engine/event — with a sendBeacon fallback on tab hide.
 *  · useEngineState() hydrates the personalization state through the
 *    shared TanStack Query pipeline.
 */

export interface EngineScoresDTO {
  churnRisk: number
  engagement: number
  loyalty: number
  loyaltyTier: number
  loyaltyTierName: string
  loyaltyProgress: number
  wtp: number
  ltv90: number
  virality: number
  burnoutRisk: number
  priceSensitivity: number
  discountAffinity: number
  bestHour: number | null
  bestChannel: "push" | "email" | "both"
  segments: string[]
  habitStage: string
}

export interface EngineNbaDTO {
  kind: string
  title: string
  body: string
  icon: string
  action?: string
  priority: number
  reason: string
  channel: string
  variant: string
}

export interface EngineStateClient {
  computedAt: string
  version: number
  featureCount: number
  gameCount: number
  personalizedOffers?: boolean // trust toggle (may be absent on old snapshots)
  scores: EngineScoresDTO
  insights: {
    hourHistogram: number[]
    bestHour: number | null
    streakForecastRisk: number
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
  decisions: EngineNbaDTO[]
  sessionHook: { title: string; body: string }
  game: {
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

// ─────────────────────────────────────────────────────────────
//  event queue with batch flush + beacon fallback
// ─────────────────────────────────────────────────────────────

import { validateTelemetryEvent } from "@/lib/telemetry/schema"

type TrackedEvent = { type: string; payload: Record<string, unknown> }

let queue: TrackedEvent[] = []
let flushTimer: ReturnType<typeof setTimeout> | null = null
let initialized = false

const FLUSH_MS = 4000
const MAX_QUEUE = 60

async function flush(method: "fetch" | "beacon" = "fetch"): Promise<void> {
  if (queue.length === 0) return
  const events = queue.slice(0, MAX_QUEUE)
  queue = queue.slice(MAX_QUEUE)
  try {
    if (method === "beacon" && typeof navigator !== "undefined" && navigator.sendBeacon) {
      navigator.sendBeacon("/api/engine/event", new Blob([JSON.stringify({ events })], { type: "application/json" }))
    } else {
      await fetch("/api/engine/event", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ events }),
        keepalive: true,
      })
    }
  } catch {
    // offline: re-queue a bounded remainder
    queue = [...events.slice(0, 20), ...queue].slice(0, MAX_QUEUE)
  }
}

export function initEngineTracking(): () => void {
  if (initialized || typeof window === "undefined") return () => {}
  initialized = true
  const onHide = () => {
    if (document.visibilityState === "hidden") void flush("beacon")
  }
  document.addEventListener("visibilitychange", onHide)
  return () => document.removeEventListener("visibilitychange", onHide)
}

export function engineTrack(type: string, payload: Record<string, unknown> = {}): void {
  if (typeof window === "undefined") return
  // v11: validate against the telemetry schema BEFORE queueing — junk
  // events die here, payloads shrink to their contract, and the wire
  // only ever carries schema-clean data. (The server re-validates.)
  const v = validateTelemetryEvent(type, payload)
  if (!v.ok) return
  queue.push({ type, payload: v.clean })
  if (queue.length >= MAX_QUEUE) {
    void flush()
    return
  }
  if (flushTimer) clearTimeout(flushTimer)
  flushTimer = setTimeout(() => {
    flushTimer = null
    void flush()
  }, FLUSH_MS)
}

export function engineTrackAppOpen(): void {
  engineTrack("app_open", { hour: new Date().getHours() })
}
