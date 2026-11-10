"use client"

/**
 * useSnapshot.ts — shared widget plumbing (v11):
 *  · fetch /api/widget/snapshot (no-store)
 *  · refetch only when visible, at most every 10 minutes
 *  · countdown to local midnight (streak deadline), paused when hidden
 *  · widget_impression / widget_tap telemetry through the schema
 *    (one impression per surface per hour — widgets are glances,
 *     not event firehoses)
 */

import { useCallback, useEffect, useRef, useState } from "react"
import { engineTrack } from "@/lib/client/engine"
import { focusMainWindow, isDesktopApp } from "@/lib/client/desktop"

export interface WidgetSnapshot {
  v: number
  name: string
  streak: number
  streakAliveToday: boolean
  freezes: number
  dailyXp: number
  dailyGoal: number
  hearts: number
  maxHearts: number
  gems: number
  xp: number
  level: number
  levelPercent: number
  leagueOrder: number
  plan: string
  verse: { ref: string; bookId: string; chapter: number; verse: number; text: string } | null
  serverTime: number
}

export type WidgetKind = "streak" | "verse" | "xp" | "board"
export type ChromeKind = "web" | "pwa" | "desktop"

export function useChrome(): ChromeKind {
  const [chrome, setChrome] = useState<ChromeKind>("web")
  useEffect(() => {
    // environment detection happens after mount (SSR renders "web") —
    // deferred a tick so nothing sets state synchronously in the effect
    const t = setTimeout(() => {
      if (isDesktopApp()) setChrome("desktop")
      else if (window.matchMedia?.("(display-mode: standalone)").matches) setChrome("pwa")
    }, 0)
    return () => clearTimeout(t)
  }, [])
  return chrome
}

/** fetch + visibility-gated polling (10 min) */
export function useWidgetSnapshot() {
  const [snap, setSnap] = useState<WidgetSnapshot | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let alive = true
    let timer: ReturnType<typeof setTimeout> | null = null

    const load = async () => {
      try {
        const res = await fetch("/api/widget/snapshot", { cache: "no-store" })
        if (!res.ok) throw new Error("snapshot failed")
        const data = (await res.json()) as WidgetSnapshot
        if (alive) {
          setSnap(data)
          setError(false)
        }
      } catch {
        if (alive) setError(true)
      }
      if (alive) {
        timer = setTimeout(load, 10 * 60 * 1000)
      }
    }
    void load()

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        if (timer) clearTimeout(timer)
        void load()
      }
    }
    document.addEventListener("visibilitychange", onVisibility)
    return () => {
      alive = false
      if (timer) clearTimeout(timer)
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [])

  return { snap, error }
}

/** one impression per widget per hour, tracked through the schema */
export function trackWidgetImpression(kind: WidgetKind, chrome: ChromeKind) {
  if (typeof window === "undefined") return
  const key = `sb_widget_imp_${kind}_${new Date().toISOString().slice(0, 13)}`
  try {
    if (window.localStorage.getItem(key) === "1") return
    window.localStorage.setItem(key, "1")
  } catch {
    /* storage blocked — still track, just un-deduped */
  }
  engineTrack("widget_impression", { widget: kind, chrome })
}

export function trackWidgetTap(kind: WidgetKind, target: "app" | "bible") {
  engineTrack("widget_tap", { widget: kind, target })
}

/** milliseconds until local midnight (the streak deadline), refreshed every 30s while visible */
export function useTimeUntilMidnight(): { msLeft: number; hhmm: string } {
  const calc = () => {
    const now = new Date()
    const midnight = new Date(now)
    midnight.setHours(24, 0, 0, 0)
    const msLeft = Math.max(0, midnight.getTime() - now.getTime())
    const h = Math.floor(msLeft / 3600000)
    const m = Math.floor((msLeft % 3600000) / 60000)
    return { msLeft, hhmm: `${h}h ${String(m).padStart(2, "0")}m` }
  }
  const [t, setT] = useState(calc)
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null
    const start = () => {
      if (!timer) timer = setInterval(() => setT(calc()), 30_000)
    }
    const stop = () => {
      if (timer) clearInterval(timer)
      timer = null
    }
    const onVisibility = () => (document.visibilityState === "visible" ? start() : stop())
    document.addEventListener("visibilitychange", onVisibility)
    if (document.visibilityState === "visible") start()
    return () => {
      stop()
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [])
  return t
}

/**
 * Widget tap behavior: on desktop, bring the main window forward instead
 * of navigating the little companion window. On web/PWA, open the app
 * in this tab (target _top keeps standalone PWAs in-app).
 */
export function useWidgetOpen() {
  const chrome = useChrome()
  return useCallback(
    (kind: WidgetKind, path = "/", target: "app" | "bible" = "app") => {
      trackWidgetTap(kind, target)
      if (chrome === "desktop") {
        void focusMainWindow()
        return
      }
      window.open(path, "_top")
    },
    [chrome],
  )
}
