"use client"

/** Haptic feedback via the Vibration API (mobile + some laptops). Respects user setting. */

let enabled = true

export function setHapticsEnabled(v: boolean) {
  enabled = v
}

function vib(pattern: number | number[]) {
  if (!enabled) return
  if (typeof navigator === "undefined" || !("vibrate" in navigator)) return
  try {
    navigator.vibrate(pattern)
  } catch {
    // ignore unsupported
  }
}

export const haptics = {
  tap: () => vib(12),
  light: () => vib(20),
  correct: () => vib(35),
  wrong: () => vib([70, 40, 70]),
  heartLost: () => vib([50, 30, 50]),
  complete: () => vib([30, 60, 30, 60, 90]),
  combo: () => vib(18),
  notify: () => vib([40, 60, 40]),
}
