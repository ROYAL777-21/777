"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, Square, Play, Volume2, RotateCcw, Check, X, Turtle } from "lucide-react"
import { speak, stopSpeaking, ttsSupported, type SpeechLang } from "@/lib/client/tts"
import { VoiceRecorder, recorderSupported, type RecordingResult } from "@/lib/client/recorder"
import { sfx } from "@/lib/client/sound"
import { haptics } from "@/lib/client/haptics"

type Phase = "listen" | "record" | "recorded" | "rated"

/**
 * SPEAK challenge: hear the native model (TTS), record yourself saying it,
 * compare both playbacks, and honestly rate how it went.
 * Correctness is self-reported (honor system) — like Duolingo speaking.
 */
export function SpeakExercise({
  text,
  transliteration,
  meaning,
  lang,
  disabled,
  onRated,
}: {
  text: string
  transliteration?: string | null
  meaning?: string | null
  lang: SpeechLang
  disabled: boolean
  onRated: (good: boolean) => void
}) {
  const [phase, setPhase] = useState<Phase>("listen")
  const [modelPlaying, setModelPlaying] = useState(false)
  const [recording, setRecording] = useState(false)
  const [level, setLevel] = useState(0)
  const [recordingData, setRecordingData] = useState<RecordingResult | null>(null)
  const [playingOwn, setPlayingOwn] = useState(false)
  const [micDenied, setMicDenied] = useState(false)
  const recorder = useMemo(() => new VoiceRecorder(), [])
  const ownAudioRef = useRef<HTMLAudioElement | null>(null)
  const levelUnsub = useRef<(() => void) | null>(null)
  const started = useRef(false)

  const playModel = async (isSlow = false) => {
    if (modelPlaying) return
    setModelPlaying(true)
    haptics.tap()
    await speak(text, lang, { rate: isSlow ? 0.55 : 0.9 })
    setModelPlaying(false)
  }

  // auto-play the model once when the challenge mounts
  useEffect(() => {
    if (!started.current) {
      started.current = true
      void playModel()
    }
    return () => {
      stopSpeaking()
      levelUnsub.current?.()
      recorder.cancel()
    }
     
  }, [])

  const startRecording = async () => {
    if (disabled || recording) return
    stopSpeaking()
    const ok = await recorder.start(10000)
    if (!ok) {
      setMicDenied(true)
      haptics.wrong()
      return
    }
    // live level meter for visual feedback
    try {
      const stream = (recorder as unknown as { stream: MediaStream | null }).stream
      if (stream) {
        const { createLevelMeter } = await import("@/lib/client/recorder")
        levelUnsub.current = await createLevelMeter(stream, (v) => setLevel(v))
      }
    } catch {
      // meter optional
    }
    setRecording(true)
    sfx.tap()
  }

  const stopRecording = async () => {
    if (!recording) return
    levelUnsub.current?.()
    levelUnsub.current = null
    setRecording(false)
    haptics.light()
    const res = await recorder.stop()
    if (res) {
      setRecordingData(res)
      setPhase("recorded")
    }
  }

  const playOwn = () => {
    if (!recordingData || playingOwn) return
    const audio = ownAudioRef.current ?? new Audio(recordingData.url)
    ownAudioRef.current = audio
    setPlayingOwn(true)
    audio.onended = () => setPlayingOwn(false)
    void audio.play().catch(() => setPlayingOwn(false))
  }

  const rate = (good: boolean) => {
    if (disabled) return
    if (good) {
      sfx.correct()
      haptics.correct()
    } else {
      sfx.wrong()
      haptics.wrong()
    }
    setPhase("rated")
    onRated(good)
  }

  const reset = () => {
    ownAudioRef.current?.pause()
    ownAudioRef.current = null
    if (recordingData) URL.revokeObjectURL(recordingData.url)
    setRecordingData(null)
    setPhase("listen")
    setPlayingOwn(false)
  }

  const barCount = 12
  const activeBars = Math.round(level * barCount)

  return (
    <div className="bg-white rounded-3xl border-2 border-paper-border shadow-[0_5px_0_#e8e0c8] p-6 sm:p-8 mb-6">
      {/* the line to say */}
      <div className="text-center">
        <h2 className="glyph font-black leading-tight break-words text-4xl sm:text-5xl">{text}</h2>
        {transliteration && <p className="mt-2 font-extrabold text-muted-foreground">{transliteration}</p>}
        {meaning && <p className="mt-1.5 text-sm font-semibold text-muted-foreground">{meaning}</p>}
      </div>

      {/* model row */}
      <div className="mt-6 flex items-center justify-center gap-3">
        <button
          onClick={() => void playModel()}
          disabled={modelPlaying || disabled}
          className="btn3d bg-duo-purple text-white shadow-[0_4px_0_#7c3aed] px-5 py-3 rounded-2xl flex items-center gap-2 font-black disabled:opacity-60"
          aria-label="Play the model pronunciation"
        >
          <Volume2 className={`w-5 h-5 ${modelPlaying ? "animate-pulse" : ""}`} />
          {modelPlaying ? "Playing…" : "Hear it"}
        </button>
        <button
          onClick={() => void playModel(true)}
          disabled={modelPlaying || disabled}
          className="btn3d bg-white border-2 border-paper-border shadow-[0_4px_0_#e8e0c8] px-4 py-3 rounded-2xl flex items-center gap-1.5 font-black text-sm disabled:opacity-60"
          aria-label="Play the model slowly"
        >
          <Turtle className="w-4 h-4" /> Slow
        </button>
      </div>

      {/* record row */}
      <div className="mt-8 flex flex-col items-center gap-3">
        {!recorderSupported() || micDenied ? (
          <div className="text-center bg-secondary rounded-2xl p-4 border-2 border-paper-border">
            <p className="font-black text-sm mb-1">{micDenied ? "Microphone unavailable 🎙️" : "Recording not supported here"}</p>
            <p className="text-sm font-semibold text-muted-foreground max-w-xs">
              No problem — say the line out loud twice, play the model once more, then rate yourself below. The mouth is
              the real microphone anyway.
            </p>
          </div>
        ) : recording ? (
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-end gap-1 h-10" aria-hidden>
              {Array.from({ length: barCount }).map((_, i) => (
                <motion.span
                  key={i}
                  animate={{ scaleY: i < activeBars ? 1 + level * 2.2 : 0.35 }}
                  transition={{ duration: 0.12 }}
                  className="w-2.5 h-10 rounded-full bg-duo-red origin-bottom"
                />
              ))}
            </div>
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => void stopRecording()}
              className="btn3d bg-duo-red text-white shadow-[0_4px_0_#d33131] px-6 py-3 rounded-2xl flex items-center gap-2 font-black"
              aria-label="Stop recording"
            >
              <Square className="w-5 h-5 fill-white" /> Stop
            </motion.button>
            <p className="text-sm font-extrabold text-duo-red animate-pulse">Recording — say it clearly…</p>
          </div>
        ) : (
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => void startRecording()}
            disabled={disabled}
            className="relative btn3d bg-duo-green text-white shadow-[0_5px_0_#46a302] w-24 h-24 rounded-full grid place-items-center"
            aria-label="Start recording yourself"
          >
            <motion.span
              animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.15, 0.5] }}
              transition={{ duration: 1.8, repeat: Infinity }}
              className="absolute inset-0 rounded-full bg-duo-green"
            />
            <Mic className="w-10 h-10" strokeWidth={2.2} />
          </motion.button>
        )}
        {!recording && !recorderSupported() === false && !micDenied && phase === "listen" && (
          <p className="text-sm font-extrabold text-muted-foreground">Tap the mic and say it yourself</p>
        )}
      </div>

      {/* A/B compare */}
      <AnimatePresence>
        {recordingData && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-6 bg-secondary rounded-2xl border-2 border-paper-border p-4"
          >
            <p className="text-xs font-black uppercase tracking-wide text-muted-foreground mb-2.5 text-center">
              Compare — model vs. you
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => void playModel()}
                disabled={modelPlaying}
                className="btn3d bg-white border-2 border-paper-border shadow-[0_3px_0_#e8e0c8] rounded-xl py-2.5 flex flex-col items-center gap-1 font-black text-sm"
              >
                <span className="text-xl">🅖</span> Native
                <Volume2 className={`w-4 h-4 text-duo-purple ${modelPlaying ? "animate-pulse" : ""}`} />
              </button>
              <button
                onClick={playOwn}
                disabled={playingOwn}
                className="btn3d bg-white border-2 border-paper-border shadow-[0_3px_0_#e8e0c8] rounded-xl py-2.5 flex flex-col items-center gap-1 font-black text-sm"
              >
                <span className="text-xl">🙂</span> You
                <Play className={`w-4 h-4 text-duo-green ${playingOwn ? "animate-pulse" : ""}`} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* self rating */}
      <AnimatePresence>
        {(recordingData || !recorderSupported() || micDenied) && phase !== "rated" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 grid grid-cols-[1fr_auto] gap-2.5 items-center"
          >
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => rate(true)}
                disabled={disabled}
                className="btn3d bg-duo-green text-white shadow-[0_4px_0_#46a302] rounded-2xl py-3.5 font-black flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" /> Nailed it
              </button>
              <button
                onClick={() => rate(false)}
                disabled={disabled}
                className="btn3d bg-duo-red text-white shadow-[0_4px_0_#d33131] rounded-2xl py-3.5 font-black flex items-center justify-center gap-2"
              >
                <X className="w-5 h-5" /> Needs work
              </button>
            </div>
            <button
              onClick={reset}
              disabled={disabled}
              className="btn3d bg-white border-2 border-paper-border shadow-[0_3px_0_#e8e0c8] rounded-xl w-11 h-11 grid place-items-center"
              aria-label="Try again"
              title="Try again"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {phase === "rated" && (
        <p className="mt-4 text-center text-sm font-extrabold text-muted-foreground">
          {ttsSupported() ? "Replay both once more if you're unsure — honest reps build real pronunciation." : ""}
        </p>
      )}
    </div>
  )
}
