"use client"

/**
 * Web-Audio synthesized sound effects — Duolingo-style feedback.
 * No audio files needed; everything is generated. Respects user setting.
 */

let ctx: AudioContext | null = null
let enabled = true

export function setSoundEnabled(v: boolean) {
  enabled = v
}

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  if (ctx.state === "suspended") void ctx.resume()
  return ctx
}

function tone(
  freq: number,
  start: number,
  dur: number,
  type: OscillatorType = "sine",
  gain = 0.12,
  slideTo?: number
) {
  const c = getCtx()
  if (!c) return
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, c.currentTime + start)
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, c.currentTime + start + dur)
  g.gain.setValueAtTime(0, c.currentTime + start)
  g.gain.linearRampToValueAtTime(gain, c.currentTime + start + 0.012)
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + start + dur)
  osc.connect(g).connect(c.destination)
  osc.start(c.currentTime + start)
  osc.stop(c.currentTime + start + dur + 0.05)
}

export const sfx = {
  tap() {
    if (!enabled) return
    tone(520, 0, 0.06, "sine", 0.05)
  },
  correct() {
    if (!enabled) return
    tone(660, 0, 0.09)
    tone(880, 0.07, 0.14)
  },
  wrong() {
    if (!enabled) return
    tone(200, 0, 0.22, "sawtooth", 0.08, 120)
  },
  combo(n: number) {
    if (!enabled) return
    const base = 600 + Math.min(8, n) * 60
    tone(base, 0, 0.07, "triangle", 0.08)
  },
  complete() {
    if (!enabled) return
    const notes = [523.25, 659.25, 783.99, 1046.5]
    notes.forEach((f, i) => tone(f, i * 0.11, 0.22, "triangle", 0.1))
  },
  fanfare() {
    if (!enabled) return
    const notes = [392, 523.25, 659.25, 783.99, 1046.5, 1318.5]
    notes.forEach((f, i) => tone(f, i * 0.09, 0.3, "triangle", 0.09))
  },
  chest() {
    if (!enabled) return
    tone(440, 0, 0.1, "triangle", 0.1)
    tone(587.33, 0.1, 0.12, "triangle", 0.1)
    tone(880, 0.22, 0.3, "triangle", 0.11)
  },
  gem() {
    if (!enabled) return
    tone(1200, 0, 0.08, "sine", 0.07)
    tone(1600, 0.06, 0.12, "sine", 0.06)
  },
  heartLost() {
    if (!enabled) return
    tone(300, 0, 0.16, "sine", 0.1, 180)
  },
  notify() {
    if (!enabled) return
    tone(880, 0, 0.09, "sine", 0.08)
    tone(1174.66, 0.1, 0.16, "sine", 0.07)
  },
  // ── v11.4 motion-pairing cues ─────────────────────────────────
  /** soft pop for confetti kicks / pin pops */
  confettiPop() {
    if (!enabled) return
    tone(1046.5, 0, 0.05, "triangle", 0.05)
    tone(1568, 0.03, 0.07, "triangle", 0.04)
  },
  /** rising sparkle for streak flames & combo highs */
  streak() {
    if (!enabled) return
    tone(587.33, 0, 0.08, "triangle", 0.07)
    tone(783.99, 0.07, 0.08, "triangle", 0.07)
    tone(1174.66, 0.14, 0.16, "triangle", 0.08)
  },
  /** coin-ish xp gain */
  xp() {
    if (!enabled) return
    tone(987.77, 0, 0.06, "square", 0.035)
    tone(1318.5, 0.05, 0.12, "square", 0.03)
  },
  /** gentle whoosh for the parting sea / sheet exits */
  whoosh() {
    if (!enabled) return
    tone(220, 0, 0.5, "sine", 0.05, 110)
    tone(330, 0.08, 0.42, "sine", 0.03, 165)
  },
  /** page/view switch tick */
  swish() {
    if (!enabled) return
    tone(660, 0, 0.045, "sine", 0.03)
    tone(880, 0.035, 0.05, "sine", 0.025)
  },
}
