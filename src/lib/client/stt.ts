"use client"

/**
 * stt.ts — speech-to-text (Ask Papy's ears).
 *
 * Thin, bounded wrapper over the Web Speech API. The rest of the app
 * never touches SpeechRecognition directly, so capabilities degrade in
 * exactly one place:
 *   · iOS Safari 14.5+, Chrome, Edge, Samsung Internet: yes
 *   · Firefox: not supported (typed input remains)
 *   · the Tauri desktop build: uses the system webview (WebView2/WKWebView)
 *
 * Hard bounds: one utterance, ≤12 seconds, no transcripts retained
 * after the callback fires.
 */

interface SpeechRecognitionAlternativeLike { transcript: string }
interface SpeechRecognitionResultLike { 0: SpeechRecognitionAlternativeLike; isFinal: boolean; length: number }
interface SpeechRecognitionEventLike { resultIndex: number; results: { length: number; [i: number]: SpeechRecognitionResultLike } }
interface SpeechRecognitionErrorEventLike { error: string }
interface SpeechRecognitionLike {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  onresult: ((e: SpeechRecognitionEventLike) => void) | null
  onerror: ((e: SpeechRecognitionErrorEventLike) => void) | null
  onend: (() => void) | null
  start(): void
  abort(): void
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike

function getCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor
    webkitSpeechRecognition?: SpeechRecognitionCtor
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

export function sttSupported(): boolean {
  return getCtor() !== null
}

export type SttErrorCode = "stt_denied" | "stt_unsupported" | "stt_no_match" | "stt_error"

export interface SttHandle {
  stop(): void
}

export interface SttOptions {
  onInterim?: (text: string) => void
  onFinal: (text: string) => void
  onError: (code: SttErrorCode) => void
  maxMs?: number
}

/** start one bounded listening session; returns null when unsupported */
export function listenOnce(opts: SttOptions): SttHandle | null {
  const Ctor = getCtor()
  if (!Ctor) {
    opts.onError("stt_unsupported")
    return null
  }
  let gotFinal = false
  let done = false
  let timer: ReturnType<typeof setTimeout> | null = null

  const rec = new Ctor()
  rec.lang = "en-US"
  rec.continuous = false
  rec.interimResults = true
  rec.maxAlternatives = 1

  const finish = (fn: () => void) => {
    if (done) return
    done = true
    if (timer) clearTimeout(timer)
    try {
      rec.abort()
    } catch {
      /* already stopped */
    }
    fn()
  }

  rec.onresult = (e) => {
    let interim = ""
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const r = e.results[i]
      const text = r[0]?.transcript ?? ""
      if (r.isFinal) {
        gotFinal = true
        const trimmed = text.trim().slice(0, 200)
        finish(() => opts.onFinal(trimmed))
      } else {
        interim += text
      }
    }
    if (interim && !gotFinal) opts.onInterim?.(interim.slice(0, 200))
  }
  rec.onerror = (e) => {
    const code: SttErrorCode =
      e.error === "not-allowed" || e.error === "service-not-allowed"
        ? "stt_denied"
        : e.error === "no-speech"
          ? "stt_no_match"
          : "stt_error"
    finish(() => opts.onError(code))
  }
  rec.onend = () => {
    finish(() => {
      if (!gotFinal) opts.onError("stt_no_match")
    })
  }

  try {
    rec.start()
  } catch {
    opts.onError("stt_error")
    return null
  }
  timer = setTimeout(() => finish(() => (gotFinal ? undefined : opts.onError("stt_no_match"))), opts.maxMs ?? 12_000)

  return {
    stop: () => finish(() => (gotFinal ? undefined : opts.onError("stt_no_match"))),
  }
}
