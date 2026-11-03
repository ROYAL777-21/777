"use client"

/**
 * Speech-synthesis (TTS) helpers — pronunciation audio for Greek, Hebrew and English.
 * Uses the browser's Web Speech API. Voice availability varies by platform:
 * when no native voice exists for a language we gracefully fall back to the
 * default voice, and the UI separately shows transliterations.
 */

export type SpeechLang = "el" | "he" | "en"

const LANG_TAGS: Record<SpeechLang, string> = {
  el: "el-GR",
  he: "he-IL",
  en: "en-US",
}

/** course code → speech language */
export function courseLang(courseCode: string): SpeechLang {
  if (courseCode === "greek") return "el"
  if (courseCode === "hebrew") return "he"
  return "en"
}

let voicesCache: SpeechSynthesisVoice[] | null = null

function loadVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return []
  if (voicesCache && voicesCache.length) return voicesCache
  voicesCache = window.speechSynthesis.getVoices()
  return voicesCache
}

// voices arrive async in Chrome
if (typeof window !== "undefined" && "speechSynthesis" in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    voicesCache = window.speechSynthesis.getVoices()
  }
}

export function ttsSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window
}

/** pick the best voice for a language: native → same-prefix → default */
export function pickVoice(lang: SpeechLang): SpeechSynthesisVoice | null {
  const voices = loadVoices()
  if (!voices.length) return null
  const tag = LANG_TAGS[lang]
  const prefix = tag.split("-")[0]
  return (
    voices.find((v) => v.lang.replace("_", "-").toLowerCase() === tag.toLowerCase()) ??
    voices.find((v) => v.lang.replace("_", "-").toLowerCase().startsWith(prefix)) ??
    null
  )
}

export function hasVoiceFor(lang: SpeechLang): boolean {
  return !!pickVoice(lang)
}

export interface SpeakOpts {
  rate?: number
  pitch?: number
  volume?: number
  onEnd?: () => void
  onStart?: () => void
}

/** speak text in a language; resolves when done (or immediately if unsupported) */
export function speak(text: string, lang: SpeechLang = "en", opts: SpeakOpts = {}): Promise<void> {
  return new Promise((resolve) => {
    if (!ttsSupported() || !text.trim()) {
      resolve()
      return
    }
    try {
      window.speechSynthesis.cancel()
      const u = new SpeechSynthesisUtterance(text)
      const voice = pickVoice(lang)
      if (voice) {
        u.voice = voice
        u.lang = voice.lang
      } else {
        u.lang = LANG_TAGS[lang]
      }
      u.rate = opts.rate ?? 0.92
      u.pitch = opts.pitch ?? 1
      u.volume = opts.volume ?? 1
      u.onstart = () => opts.onStart?.()
      u.onend = () => resolve()
      u.onerror = () => resolve()
      window.speechSynthesis.speak(u)
      // safety: resolve after a max time so the UI never hangs
      const maxMs = Math.min(30000, 2500 + text.length * 120)
      setTimeout(() => resolve(), maxMs)
    } catch {
      resolve()
    }
  })
}

export function stopSpeaking() {
  if (ttsSupported()) {
    try {
      window.speechSynthesis.cancel()
    } catch {
      // ignore
    }
  }
}

/** stable per-speaker voice variation: narrator slower, characters varied */
export function speakerProfile(name: string): { rate: number; pitch: number } {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 997
  const isNarrator = /narrator/i.test(name)
  return {
    rate: isNarrator ? 0.88 : 0.95,
    pitch: isNarrator ? 1 : 0.8 + (h % 50) / 100, // 0.8–1.3
  }
}
