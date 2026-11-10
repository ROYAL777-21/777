"use client"

import { useEffect, useRef } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useAppStore } from "@/lib/client/store"
import { fireBrowserNotification } from "@/lib/client/notify"
import type { NotificationDTO } from "@/lib/types"

const SEEN_KEY = "sb_notif_seen_ids"

function readSeen(): Set<string> {
  try {
    return new Set(JSON.parse(window.localStorage.getItem(SEEN_KEY) ?? "[]") as string[])
  } catch {
    return new Set()
  }
}

function persistSeen(seen: Set<string>) {
  // keep the set bounded — the newest 200 ids
  window.localStorage.setItem(SEEN_KEY, JSON.stringify([...seen].slice(-200)))
}

/**
 * The journeys heartbeat — polls the server scheduler every 90s (and on
 * window focus) so TIMED notifications (verse, reminder, streak-risk,
 * weekly recap…) and EMAIL journeys fire while the app is open.
 * New notifications become browser notifications + in-app toasts.
 */
export function useJourneys() {
  const qc = useQueryClient()
  const pushToast = useAppStore((s) => s.pushToast)
  const inLesson = useAppStore((s) => s.inLesson)
  const busy = useRef(false)
  const seenRef = useRef<Set<string> | null>(null)

  useEffect(() => {
    // hydrate seen ids on mount, seeded from the current server list so we
    // don't spam the user with historical notifications on first load
    let cancelled = false
    const hydrate = async () => {
      try {
        const res = await fetch("/api/notifications")
        const data = (await res.json()) as { notifications: NotificationDTO[] }
        if (cancelled) return
        const set = readSeen()
        for (const n of data.notifications ?? []) set.add(n.id)
        persistSeen(set)
        seenRef.current = set
      } catch {
        seenRef.current = readSeen()
      }
    }
    void hydrate()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    const tick = async () => {
      if (busy.current || cancelled) return
      busy.current = true
      try {
        const res = await fetch("/api/journeys/evaluate", { method: "POST" })
        if (!res.ok) return
        const data = (await res.json()) as { created?: { type: string; title: string; body: string; icon: string }[] }
        if (!data.created?.length) return

        if (!seenRef.current) seenRef.current = readSeen()
        for (const n of data.created) {
          // server dedupes per day, but belt & suspenders: skip ids we've seen
          const dedupeKey = `${n.type}:${n.title}`
          if (seenRef.current.has(dedupeKey)) continue
          seenRef.current.add(dedupeKey)
          if (!inLesson) {
            pushToast(n.title, n.body, n.icon)
            fireBrowserNotification({ title: n.title, body: n.body, icon: n.icon })
          }
        }
        persistSeen(seenRef.current)
        void qc.invalidateQueries({ queryKey: ["notifications"] })
        void qc.invalidateQueries({ queryKey: ["bootstrap"] })
      } catch {
        /* silent — the next tick will retry */
      } finally {
        busy.current = false
      }
    }

    const interval = setInterval(tick, 90_000)
    const onFocus = () => void tick()
    window.addEventListener("focus", onFocus)
    // first tick after 20s (let bootstrap settle)
    const initial = setTimeout(tick, 20_000)
    return () => {
      cancelled = true
      clearInterval(interval)
      clearTimeout(initial)
      window.removeEventListener("focus", onFocus)
    }
  }, [])
}
