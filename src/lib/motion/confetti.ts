"use client"

/**
 * juiceConfetti — the app's confetti vocabulary (v11.4).
 * Wraps canvas-confetti with the house palette and, critically,
 * the motion preference: zero particles when reduced.
 *
 *   · burst()      — one central pop (correct answers, redeems)
 *   · cannons()    — Duolingo's double side-fires (completions)
 *   · rain()       — gentle top rain (big milestones)
 */

import confetti from "canvas-confetti"
import { isMotionReduced, CONFETTI_COLORS } from "@/lib/motion"

const PALETTE = { colors: CONFETTI_COLORS }
const disabled = () => isMotionReduced()

export function burst(origin: { x?: number; y?: number } = { y: 0.6 }, count = 90) {
  if (disabled()) return
  void confetti({
    particleCount: count,
    spread: 75,
    startVelocity: 42,
    scalar: 1.05,
    origin: { x: 0.5, ...origin },
    ...PALETTE,
  })
}

export function cannons(count = 70) {
  if (disabled()) return
  const opts: confetti.Options = {
    particleCount: count,
    angle: 60,
    spread: 60,
    startVelocity: 55,
    origin: { x: 0, y: 0.75 },
    ...PALETTE,
  }
  void confetti(opts)
  void confetti({ ...opts, angle: 120, origin: { x: 1, y: 0.75 } })
}

export function rain(ms = 1600) {
  if (disabled()) return
  const end = Date.now() + ms
  const frame = () => {
    void confetti({
      particleCount: 3,
      startVelocity: 0,
      ticks: 250,
      spread: 360,
      gravity: 0.6,
      scalar: 0.9,
      origin: { x: Math.random(), y: 0 },
      ...PALETTE,
    })
    if (Date.now() < end) requestAnimationFrame(frame)
  }
  requestAnimationFrame(frame)
}

/** a tiny pop right where the user tapped (e.g. correct-option tick) */
export function popAt(x: number, y: number, count = 26) {
  if (disabled()) return
  void confetti({
    particleCount: count,
    spread: 50,
    startVelocity: 26,
    scalar: 0.8,
    ticks: 120,
    origin: { x, y },
    ...PALETTE,
  })
}
