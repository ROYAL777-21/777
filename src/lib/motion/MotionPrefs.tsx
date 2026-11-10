"use client"

/**
 * MotionPrefs — app-wide motion preference (v11.4).
 *
 * One source of truth for "should things move?", combining:
 *   1. the OS flag  — prefers-reduced-motion (live listener)
 *   2. the in-app choice — Settings ▸ Animations (localStorage,
 *      per-device like Duolingo: a phone may need calm, a desktop
 *      may not — so this is a device preference, not an account one)
 *
 * Wraps the tree in framer's <MotionConfig reducedMotion>, which
 * automatically converts transform/layout animations to instant
 * state changes while keeping opacity fades. Canvas-confetti and
 * CSS-keyframe call sites gate on useJuice()/isMotionReduced().
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { MotionConfig } from "framer-motion"
import { readMotionPref, writeMotionPref } from "./index"

type MotionPref = "full" | "reduced"

interface MotionCtx {
  /** the user's explicit in-app choice */
  pref: MotionPref
  /** effective answer: pref === "reduced" OR the OS asks for calm */
  reduced: boolean
  /** the raw OS flag (for showing "your system asks for less motion") */
  osReduced: boolean
  setPref: (p: MotionPref) => void
}

const Ctx = createContext<MotionCtx>({
  pref: "full",
  reduced: false,
  osReduced: false,
  setPref: () => {},
})

export function MotionPrefsProvider({ children }: { children: ReactNode }) {
  const [pref, setPrefState] = useState<MotionPref>("full")
  const [osReduced, setOsReduced] = useState(false)

  // hydrate from localStorage + the OS flag (off the render path)
  useEffect(() => {
    setPrefState(readMotionPref())
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)")
    if (!mq) return
    const apply = () => setOsReduced(mq.matches)
    apply()
    mq.addEventListener?.("change", apply)
    return () => mq.removeEventListener?.("change", apply)
  }, [])

  const setPref = useCallback((p: MotionPref) => {
    writeMotionPref(p)
    setPrefState(p)
  }, [])

  const value = useMemo<MotionCtx>(
    () => ({ pref, reduced: pref === "reduced" || osReduced, osReduced, setPref }),
    [pref, osReduced, setPref],
  )

  // "user" = respect the OS flag automatically; "always" = calm even
  // if the OS never asked (the in-app toggle wins)
  return (
    <Ctx.Provider value={value}>
      <MotionConfig reducedMotion={pref === "reduced" ? "always" : "user"}>{children}</MotionConfig>
    </Ctx.Provider>
  )
}

export function useMotionPrefs() {
  return useContext(Ctx)
}

/** sugar: `const juice = useJuice(); if (juice) confetti(...)` */
export function useJuice() {
  return !useContext(Ctx).reduced
}
