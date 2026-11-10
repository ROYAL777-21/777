"use client"

/**
 * Assistant.tsx — "Ask Papy" (v11): Siri/Android-Assistant-style voice
 * capability for the app, on every platform the app runs on.
 *
 *   speak or type → /api/assistant/interpret (context-aware, stateless)
 *   → spoken + shown reply (tts.ts) → one-tap action (view/bible/quiz)
 *
 * Bridges (this is what the phone assistants actually trigger):
 *   · Siri:        a Shortcut opens  /?assistant=1&q=<dictated text>
 *   · Android:     an Assistant routine opens the same URL
 *   · Installed    PWA long-press shortcut "Ask Papy" (manifest)
 *   · Desktop:     same URL; the sheet simply opens
 *
 * Privacy: utterances go to interpret and die there; telemetry carries
 * intent ids only. Offline fallback matches intents locally (bible
 * references keep working fully offline).
 */

import { useCallback, useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Mic, MicOff, Send, X, Sparkles, BookOpen, ArrowRight } from "lucide-react"
import { useAppStore, type View } from "@/lib/client/store"
import { engineTrack } from "@/lib/client/engine"
import { speak, stopSpeaking, ttsSupported } from "@/lib/client/tts"
import { listenOnce, sttSupported, type SttHandle, type SttErrorCode } from "@/lib/client/stt"
import { sfx } from "@/lib/client/sound"
import { haptics } from "@/lib/client/haptics"
import { Mascot } from "./Mascot"
import { interpretUtterance, clampChapter } from "@/lib/assistant/intents"

type AssistantAction =
  | { kind: "view"; view: string }
  | { kind: "bible"; bookId: string; chapter: number }
  | { kind: "quiz" }
  | { kind: "lesson" }
  | null

interface AssistantReplyDTO {
  intent: string
  matched: boolean
  speech: string
  verse?: { ref: string; text: string } | null
  action: AssistantAction
  suggestions?: string[]
}

interface Turn {
  role: "user" | "papy"
  text: string
  intent?: string
  verse?: { ref: string; text: string } | null
  action?: AssistantAction
  suggestions?: string[]
}

type Phase = "idle" | "listening" | "thinking" | "speaking"

const SUGGESTIONS = ["Start my lesson", "How is my streak?", "Verse of the day", "Open John 3", "What should I do today?"]

export function Assistant() {
  const [open, setOpen] = useState(false)
  const [phase, setPhase] = useState<Phase>("idle")
  const [interim, setInterim] = useState("")
  const [turns, setTurns] = useState<Turn[]>([])
  const [input, setInput] = useState("")
  const [ttsOn, setTtsOn] = useState(true)
  const listRef = useRef<HTMLDivElement>(null)
  const sttRef = useRef<SttHandle | null>(null)
  const startedRef = useRef(false)

  const setView = useAppStore((s) => s.setView)
  const openBible = useAppStore((s) => s.openBible)
  const startQuiz = useAppStore((s) => s.startQuiz)
  const soundOn = useAppStore((s) => s.soundOn)
  const micOk = sttSupported()
  const voiceOk = ttsSupported()

  useEffect(() => {
    // read storage off the render path, then resolve (same pattern as the
    // splash gate — keeps SSR/hydration deterministic)
    const t = setTimeout(() => {
      try {
        setTtsOn(window.localStorage.getItem("sb_papy_tts") !== "off")
      } catch {
        /* keep default */
      }
    }, 0)
    return () => clearTimeout(t)
  }, [])

  const toggleTts = () => {
    const next = !ttsOn
    setTtsOn(next)
    try {
      window.localStorage.setItem("sb_papy_tts", next ? "on" : "off")
    } catch {
      /* ignore */
    }
  }

  // ── actions ──
  const perform = useCallback(
    (action: NonNullable<AssistantAction>, intent: string) => {
      engineTrack("assistant_action", { intent })
      sfx.tap()
      haptics.tap()
      if (action.kind === "view") setView(action.view as View)
      else if (action.kind === "bible") openBible(action.bookId, action.chapter)
      else if (action.kind === "quiz") startQuiz()
      else if (action.kind === "lesson") setView("learn")
      setOpen(false)
    },
    [setView, openBible, startQuiz],
  )

  // ── the interpret pipeline ──
  const run = useCallback(
    async (text: string, mode: "voice" | "typed" | "deeplink") => {
      const utterance = text.trim().slice(0, 200)
      if (!utterance) return
      stopSpeaking()
      setInterim("")
      setInput("")
      setTurns((t) => [...t, { role: "user", text: utterance }])
      setPhase("thinking")

      let reply: AssistantReplyDTO | null = null
      try {
        const ctrl = new AbortController()
        const timer = setTimeout(() => ctrl.abort(), 5000)
        const res = await fetch("/api/assistant/interpret", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ utterance, mode }),
          signal: ctrl.signal,
        })
        clearTimeout(timer)
        if (res.ok) reply = (await res.json()) as AssistantReplyDTO
      } catch {
        // fall through to the offline reply
      }

      if (!reply) {
        engineTrack("assistant_error", { code: "network" })
        // ── offline fallback: local intent match (bible refs still work) ──
        const m = interpretUtterance(utterance)
        if (m?.intent === "bible_ref") {
          const chapter = m.slots.ch ? clampChapter(m.slots.book, Number.parseInt(m.slots.ch, 10)) : 1
          reply = {
            intent: m.intent,
            matched: true,
            speech: `Opening ${m.slots.book}${m.slots.ch ? ` ${chapter}` : ""}.`,
            action: { kind: "bible", bookId: m.slots.book, chapter },
          }
        } else if (m) {
          reply = { intent: m.intent, matched: true, speech: "I can't reach your scroll right now — but your path is waiting.", action: { kind: "lesson" } }
        } else {
          reply = { intent: "", matched: false, speech: "I can't reach your scroll right now. Try again in a moment.", action: null }
        }
      }

      setTurns((t) => [...t, { role: "papy", text: reply!.speech, intent: reply!.intent, verse: reply!.verse ?? null, action: reply!.action, suggestions: reply!.suggestions }])
      if (ttsOn && soundOn && voiceOk) {
        setPhase("speaking")
        await speak(reply.speech, "en", { rate: 0.95 })
      }
      setPhase("idle")
    },
    [soundOn, ttsOn, voiceOk],
  )

  // ── voice ──
  const startListening = useCallback(() => {
    if (!micOk || phase === "listening") return
    stopSpeaking()
    setInterim("")
    setPhase("listening")
    haptics.light()
    sttRef.current = listenOnce({
      onInterim: (t) => setInterim(t),
      onFinal: (t) => {
        setPhase("idle")
        if (t) void run(t, "voice")
      },
      onError: (code) => {
        setPhase("idle")
        setInterim("")
        engineTrack("assistant_error", { code: code as SttErrorCode })
        if (code === "stt_no_match") setTurns((t) => [...t, { role: "papy", text: "I didn't catch that — try again, or type it below." }])
      },
    })
  }, [micOk, phase, run])

  const stopListening = useCallback(() => {
    sttRef.current?.stop()
    sttRef.current = null
  }, [])

  const closeSheet = () => {
    stopListening()
    stopSpeaking()
    setOpen(false)
    setPhase("idle")
  }

  // ── deep-link bridge: /?assistant=1[&q=…] (+ /?bible=book.ch.verse) ──
  // (runs once, after `run` exists — this is the URL Siri Shortcuts and
  //  Android Assistant routines open; deferred a tick like the splash
  //  gate so nothing sets state synchronously inside the effect)
  useEffect(() => {
    if (startedRef.current || typeof window === "undefined") return
    startedRef.current = true
    const t = setTimeout(() => {
      const params = new URLSearchParams(window.location.search)
      const bible = params.get("bible")
      if (bible && /^[a-z0-9]{2,3}\.\d{1,3}(\.\d{1,3})?$/.test(bible)) {
        const [bookId, ch] = bible.split(".")
        openBible(bookId, clampChapter(bookId, Number.parseInt(ch, 10) || 1))
        params.delete("bible")
      }
      const wants = params.get("assistant") === "1"
      const q = params.get("q")
      if (wants || q) {
        params.delete("assistant")
        params.delete("q")
        const clean = params.toString()
        window.history.replaceState({}, "", `${window.location.pathname}${clean ? `?${clean}` : ""}`)
        setOpen(true)
        engineTrack("assistant_open", { via: "deeplink" })
        if (q) {
          const safe = q.slice(0, 200)
          setTimeout(() => void run(safe, "deeplink"), 350)
        }
      } else if (bible) {
        const clean = params.toString()
        window.history.replaceState({}, "", `${window.location.pathname}${clean ? `?${clean}` : ""}`)
      }
    }, 0)
    return () => clearTimeout(t)
  }, [])

  const openSheet = () => {
    setOpen(true)
    sfx.tap()
    haptics.tap()
    engineTrack("assistant_open", { via: "button" })
  }

  const mood = phase === "thinking" ? "think" : phase === "speaking" ? "cheer" : phase === "listening" ? "happy" : "happy"

  // scroll the conversation to the latest turn
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" })
  }, [turns, interim])

  return (
    <>
      {/* the floating button — bottom-left, clear of the toast stack */}
      <AnimatePresence>
        {!open && (
          <motion.button
            key="papy-fab"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 22 }}
            onClick={openSheet}
            aria-label="Ask Papy"
            className="fixed left-4 bottom-24 lg:bottom-6 z-[80] flex items-center gap-2 rounded-full px-4 py-3 font-black text-sm text-white"
            style={{ background: "#58cc02", boxShadow: "0 4px 0 #46a302", border: "none", cursor: "pointer" }}
          >
            <Sparkles className="w-4 h-4" />
            Ask Papy
          </motion.button>
        )}
      </AnimatePresence>

      {/* the sheet */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="papy-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeSheet}
              className="fixed inset-0 z-[95] bg-black/35"
            />
            <motion.section
              key="papy-sheet"
              initial={{ y: "100%", opacity: 0.6 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0.4 }}
              transition={{ type: "spring", stiffness: 340, damping: 34 }}
              className="fixed z-[96] inset-x-0 bottom-0 sm:inset-0 sm:m-auto sm:h-fit sm:max-w-lg rounded-t-3xl sm:rounded-3xl bg-[#fff9ec] border-2 border-paper-border shadow-[0_6px_0_#e8e0c8] flex flex-col max-h-[82dvh] sm:max-h-[70vh]"
              role="dialog"
              aria-label="Ask Papy"
            >
              {/* header */}
              <div className="flex items-center gap-3 p-4 border-b-2 border-paper-border">
                <div className="w-12 h-12 shrink-0 -mb-2">
                  <Mascot mood={mood} size={64} className="w-full h-full" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-black text-base leading-tight">Ask Papy</h2>
                  <p className="text-xs font-bold text-muted-foreground truncate">
                    {phase === "listening"
                      ? "Listening…"
                      : phase === "thinking"
                        ? "Unrolling an answer…"
                        : phase === "speaking"
                          ? "Speaking…"
                          : "Your study companion — speak or type"}
                  </p>
                </div>
                {voiceOk && (
                  <button
                    onClick={toggleTts}
                    aria-label={ttsOn ? "Mute Papy's voice" : "Unmute Papy's voice"}
                    className="text-xs font-black rounded-xl px-2.5 py-1.5 border-2 border-paper-border"
                    style={{ background: ttsOn ? "#eef7e6" : "#f6f0de", color: "#3f3a2f", cursor: "pointer" }}
                  >
                    {ttsOn ? "🔊" : "🔇"}
                  </button>
                )}
                <button onClick={closeSheet} aria-label="Close" className="p-1.5 rounded-xl hover:bg-[#f3ecd9]" style={{ border: "none", background: "transparent", cursor: "pointer" }}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* conversation */}
              <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3" aria-live="polite">
                {turns.length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-sm font-bold text-muted-foreground mb-3">Try things like:</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {(SUGGESTIONS ?? []).map((s) => (
                        <button
                          key={s}
                          onClick={() => void run(s, "typed")}
                          className="text-xs font-black rounded-full px-3 py-1.5 bg-white border-2 border-paper-border hover:border-[#58cc02] transition-colors"
                          style={{ cursor: "pointer" }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {turns.map((t, i) => (
                  <div key={i} className={`flex ${t.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm font-semibold ${
                        t.role === "user" ? "bg-[#58cc02] text-white" : "bg-white border-2 border-paper-border text-[#3f3a2f]"
                      }`}
                    >
                      {t.text}
                      {t.verse && (
                        <p className="mt-2 pt-2 border-t border-[#eee6cd] font-serif italic text-[13px] leading-snug">
                          “{t.verse.text}”
                          <span className="block not-italic font-black text-[11px] text-[#b89a5e] mt-1">{t.verse.ref}</span>
                        </p>
                      )}
                      {t.suggestions && t.suggestions.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {t.suggestions.slice(0, 4).map((s) => (
                            <button
                              key={s}
                              onClick={() => void run(s, "typed")}
                              className="text-[11px] font-black rounded-full px-2.5 py-1 bg-[#f6f0de] border border-paper-border"
                              style={{ cursor: "pointer" }}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      )}
                      {t.action && (
                        <button
                          onClick={() => perform(t.action!, t.intent ?? "")}
                          className="mt-2 flex items-center gap-1.5 text-xs font-black text-[#58a700]"
                          style={{ border: "none", background: "transparent", cursor: "pointer", padding: 0 }}
                        >
                          {t.action.kind === "bible" ? <BookOpen className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                          {t.action.kind === "bible"
                            ? "Open in the reader"
                            : t.action.kind === "quiz"
                              ? "Start the quiz"
                              : t.action.kind === "lesson"
                                ? "Go to my lesson"
                                : "Take me there"}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {interim && (
                  <div className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm font-semibold bg-[#a7e07a] text-white opacity-80">{interim}…</div>
                  </div>
                )}
                {phase === "thinking" && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl px-4 py-3 bg-white border-2 border-paper-border">
                      <motion.span
                        animate={{ opacity: [0.35, 1, 0.35] }}
                        transition={{ duration: 1.1, repeat: Infinity }}
                        className="text-sm font-bold text-muted-foreground"
                      >
                        unrolling…
                      </motion.span>
                    </div>
                  </div>
                )}
              </div>

              {/* input row */}
              <div className="flex items-center gap-2 p-3 border-t-2 border-paper-border" style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}>
                {micOk ? (
                  <button
                    onClick={phase === "listening" ? stopListening : startListening}
                    aria-label={phase === "listening" ? "Stop listening" : "Speak"}
                    className="w-11 h-11 shrink-0 rounded-2xl flex items-center justify-center text-white"
                    style={{
                      border: "none",
                      cursor: "pointer",
                      background: phase === "listening" ? "#d64541" : "#58cc02",
                      boxShadow: `0 3px 0 ${phase === "listening" ? "#b2362f" : "#46a302"}`,
                    }}
                  >
                    {phase === "listening" ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>
                ) : (
                  <div className="w-11 h-11 shrink-0 rounded-2xl flex items-center justify-center bg-[#f3ecd9] text-[#b0a78e]" title="Voice input isn't supported in this browser — typing works everywhere">
                    <MicOff className="w-5 h-5" />
                  </div>
                )}
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value.slice(0, 200))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void run(input, "typed")
                  }}
                  placeholder="Ask about your streak, a verse, anything on your scroll…"
                  className="flex-1 min-w-0 rounded-2xl border-2 border-paper-border bg-white px-3.5 py-2.5 text-sm font-semibold outline-none focus:border-[#58cc02]"
                  aria-label="Type a question for Papy"
                />
                <button
                  onClick={() => void run(input, "typed")}
                  disabled={!input.trim()}
                  aria-label="Send"
                  className="w-11 h-11 shrink-0 rounded-2xl flex items-center justify-center text-white disabled:opacity-40"
                  style={{ border: "none", cursor: "pointer", background: "#58cc02", boxShadow: "0 3px 0 #46a302" }}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </motion.section>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
