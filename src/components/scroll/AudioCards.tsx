"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { Volume2, Turtle, BookOpen } from "lucide-react"
import { speak, stopSpeaking, ttsSupported, courseLang, type SpeechLang } from "@/lib/client/tts"
import { sfx } from "@/lib/client/sound"
import { haptics } from "@/lib/client/haptics"

/**
 * Big speaker card used by LISTEN challenges (and as an audio term card
 * anywhere pronunciation matters). Auto-plays on mount, replays on tap,
 * slow-turtle mode for careful listening.
 */
export function ListenCard({
  text,
  lang,
  transliteration,
  autoPlay = true,
  compact = false,
}: {
  text: string
  lang: SpeechLang
  transliteration?: string | null
  autoPlay?: boolean
  compact?: boolean
}) {
  const [playing, setPlaying] = useState(false)
  const [slow, setSlow] = useState(false)
  const started = useRef(false)

  const play = async (isSlow = false) => {
    if (playing) {
      stopSpeaking()
      setPlaying(false)
      return
    }
    setSlow(isSlow)
    setPlaying(true)
    haptics.tap()
    await speak(text, lang, { rate: isSlow ? 0.55 : 0.92 })
    setPlaying(false)
  }

  useEffect(() => {
    if (autoPlay && !started.current) {
      started.current = true
      // defer so the effect body never sets state synchronously
      const t = setTimeout(() => void play(), 120)
      return () => clearTimeout(t)
    }
    return () => stopSpeaking()
  }, [text])

  if (compact) {
    return (
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => void play()}
        className="shrink-0 w-11 h-11 rounded-2xl bg-duo-purple/10 border-2 border-duo-purple/40 grid place-items-center text-duo-purple hover:bg-duo-purple/20 transition-colors"
        aria-label={`Play pronunciation of ${text}`}
      >
        <Volume2 className={`w-5 h-5 ${playing ? "animate-pulse" : ""}`} />
      </motion.button>
    )
  }

  return (
    <div className="bg-white rounded-3xl border-2 border-paper-border shadow-[0_5px_0_#e8e0c8] p-6 sm:p-8 mb-6 text-center">
      <motion.button
        whileTap={{ scale: 0.93 }}
        whileHover={{ scale: 1.04 }}
        onClick={() => void play()}
        className="mx-auto relative w-32 h-32 rounded-full grid place-items-center text-white shadow-[0_6px_0_#7c3aed] bg-duo-purple"
        aria-label={`Play audio — ${transliteration ?? text}`}
      >
        <motion.span
          animate={playing ? { scale: [1, 1.12, 1] } : {}}
          transition={{ duration: 0.8, repeat: playing ? Infinity : 0 }}
          className="absolute inset-0 rounded-full border-4 border-duo-purple/40"
        />
        <Volume2 className="w-14 h-14" strokeWidth={2.2} />
      </motion.button>

      <p className="mt-4 font-black text-lg">{playing ? (slow ? "Playing slowly…" : "Listening…") : "Tap to replay"}</p>
      {transliteration && (
        <p className="mt-1 font-extrabold text-muted-foreground glyph">
          {ttsSupported() ? "" : "Voice unavailable — "}
          {transliteration}
        </p>
      )}

      <div className="mt-3 flex justify-center gap-2">
        <button
          onClick={() => void play(true)}
          className="flex items-center gap-1.5 text-sm font-black bg-secondary border-2 border-paper-border rounded-full px-3.5 py-1.5 hover:bg-[#eee6cd] transition-colors"
          aria-label="Play slowly"
        >
          <Turtle className="w-4 h-4" /> Slow
        </button>
      </div>
    </div>
  )
}

/** small floating "hear this term" chip for term cards in SELECT/TYPE challenges */
export function TermAudioButton({ text, lang }: { text: string; lang: SpeechLang }) {
  const [playing, setPlaying] = useState(false)
  const play = async () => {
    if (playing) return
    setPlaying(true)
    sfx.tap()
    haptics.tap()
    await speak(text, lang, { rate: 0.9 })
    setPlaying(false)
  }
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={(e) => {
        e.stopPropagation()
        void play()
      }}
      className="shrink-0 w-10 h-10 rounded-xl bg-duo-purple/10 border-2 border-duo-purple/30 grid place-items-center text-duo-purple hover:bg-duo-purple/20 transition-colors"
      aria-label="Hear pronunciation"
      title="Hear pronunciation"
    >
      <Volume2 className={`w-5 h-5 ${playing ? "animate-pulse" : ""}`} />
    </motion.button>
  )
}

/** helper: speech lang from course code (re-exported for convenience) */
export { courseLang }

export function ReadingHint({ label }: { label: string }) {
  return (
    <p className="text-center text-sm font-extrabold text-muted-foreground flex items-center justify-center gap-1.5 mt-2">
      <BookOpen className="w-4 h-4" /> {label}
    </p>
  )
}
