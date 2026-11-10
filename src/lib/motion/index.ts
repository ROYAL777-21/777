"use client"

/**
 * ═══════════════════════════════════════════════════════════════
 *  THE JUICE SYSTEM (v11.4) — shared motion tokens for the whole
 *  app. One vocabulary, everywhere: springs, easings, durations,
 *  and named variants (pageIn, popIn, cascade, squish, shake…).
 *
 *  Rules of the house:
 *   · never hand-roll a spring in a component — import from here
 *   · every animation must survive `reducedMotion` gracefully
 *     (framer's <MotionConfig> handles transforms automatically;
 *     canvas-confetti / CSS keyframes check isMotionReduced())
 *   · the numbers are tuned to Duolingo's feel: fast attack,
 *     visible-but-tiny overshoot, never sluggish
 * ═══════════════════════════════════════════════════════════════
 */

import type { Transition, Variants } from "framer-motion"

// ── springs ──────────────────────────────────────────────────────
export const spring = {
  /** big playful overshoot — cards, mascot, celebrations */
  juice: { type: "spring", stiffness: 260, damping: 18 } satisfies Transition,
  /** quick tap feedback, chips, toggles */
  snappy: { type: "spring", stiffness: 320, damping: 24 } satisfies Transition,
  /** panels and sheets */
  soft: { type: "spring", stiffness: 200, damping: 26 } satisfies Transition,
  /** progress bars — the Duolingo lunge */
  lunge: { type: "spring", stiffness: 170, damping: 13 } satisfies Transition,
  /** heavy things (full-screen overlays) */
  heavy: { type: "spring", stiffness: 300, damping: 30 } satisfies Transition,
} as const

// ── easings & durations (for the few tween cases) ────────────────
export const easeOutExpo = [0.22, 1, 0.36, 1] as const
export const easeInOut = [0.65, 0, 0.35, 1] as const
export const duration = { fast: 0.18, base: 0.28, slow: 0.45 } as const

// ── named variants ───────────────────────────────────────────────
export const v = {
  /** view/page entrance (used by ScrollApp's view switch) */
  pageIn: {
    initial: { opacity: 0, y: 18, scale: 0.995 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -12, scale: 0.995 },
  },
  /** element pops in with juice */
  popIn: {
    initial: { opacity: 0, scale: 0.6, y: 8 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.7, y: -6 },
  },
  /** modal/sheet entrance */
  sheetIn: {
    initial: { opacity: 0, y: 60, scale: 0.96 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 40, scale: 0.97 },
  },
  /** the Duolingo button squish — spread onto any motion.button */
  squish: {
    whileHover: { scale: 1.04, y: -1 },
    whileTap: { scale: 0.92, y: 1 },
  },
  /** wrong-answer screenshake — spread on the container */
  shake: {
    animate: { x: [0, -10, 10, -6, 6, -2, 0] },
  },
  /** staggered children (lists, path nodes, cards) */
  cascade: {
    hidden: { opacity: 0, y: 16 },
    show: {
      opacity: 1,
      y: 0,
      transition: spring.juice,
    },
  },
} as unknown as Record<string, Variants>

/** stagger container props */
export const staggerChildren = (gap = 0.05, delay = 0.02) =>
  ({
    initial: "hidden",
    animate: "show",
    variants: { hidden: {}, show: { transition: { staggerChildren: gap, delayChildren: delay } } },
  }) as const

// ── reduced motion (non-hook getter for confetti/css call sites) ─
const LS_KEY = "sb_motion_pref_v1"

export function readMotionPref(): "full" | "reduced" {
  if (typeof window === "undefined") return "full"
  try {
    const val = window.localStorage.getItem(LS_KEY)
    return val === "reduced" ? "reduced" : "full"
  } catch {
    return "full"
  }
}

export function writeMotionPref(pref: "full" | "reduced") {
  try {
    window.localStorage.setItem(LS_KEY, pref)
  } catch {
    /* storage blocked — in-memory only for this session */
  }
}

/** true when juice should be OFF (user choice OR the OS flag) */
export function isMotionReduced(): boolean {
  if (typeof window === "undefined") return false
  if (readMotionPref() === "reduced") return true
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false
}

// ── the app confetti palette (bible-parchment Duolingo mix) ──────
export const CONFETTI_COLORS = ["#58CC02", "#FFC800", "#9B5DE5", "#E4453D", "#0F8A80", "#F4A6A0"]

// ── misc timing constants ────────────────────────────────────────
/** how long the splash takes before auto-finishing */
export const SPLASH_MS = 2100
