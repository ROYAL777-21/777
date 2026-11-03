"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion"
import confetti from "canvas-confetti"
import { X, Heart, Zap, Flame, Timer, Target, ChevronRight } from "lucide-react"
import { useAppStore, normalizeAnswer, seededShuffle } from "@/lib/client/store"
import { sfx } from "@/lib/client/sound"
import { haptics } from "@/lib/client/haptics"
import { fireBrowserNotification } from "@/lib/client/notify"
import { courseLang } from "@/lib/client/tts"
import type { ChallengeDTO, CompleteResult, LessonPayload } from "@/lib/types"
import { Mascot } from "./Mascot"
import { ListenCard, TermAudioButton } from "./AudioCards"
import { SpeakExercise } from "./SpeakExercise"
import { LetterKeyboard, isLangCourse } from "./LetterKeyboard"
import { useRefreshApp } from "./ScrollApp"

interface AnswerDTO {
  challengeId: string
  correct: boolean
  optionId?: string
  text?: string
}

export function LessonView({ session }: { session: { lessonId: string; title: string } }) {
  const endLesson = useAppStore((s) => s.endLesson)
  const qc = useQueryClient()
  const refreshApp = useRefreshApp()
  const isPractice = session.lessonId === "practice"

  const { data, isLoading, isError } = useQuery<LessonPayload>({
    queryKey: ["lesson", session.lessonId],
    queryFn: async () => {
      const url = isPractice ? "/api/practice" : `/api/lessons/${session.lessonId}`
      const res = await fetch(url)
      if (!res.ok) throw new Error("failed to load lesson")
      return res.json() as Promise<LessonPayload>
    },
    staleTime: Infinity,
  })

  // session state
  const [idx, setIdx] = useState(0)
  const [status, setStatus] = useState<"answering" | "correct" | "wrong">("answering")
  const [combo, setCombo] = useState(0)
  const [comboMax, setComboMax] = useState(0)
  const [hearts, setHearts] = useState(5)
  const [answers, setAnswers] = useState<AnswerDTO[]>([])
  const [mistakes, setMistakes] = useState(0)
  const [showQuit, setShowQuit] = useState(false)
  const [outOfHearts, setOutOfHearts] = useState(false)
  const [result, setResult] = useState<CompleteResult | null>(null)
  const [correctFlash, setCorrectFlash] = useState(0)
  const startTime = useRef(Date.now())

  // ── progressive difficulty: timed challenges in Advanced (difficulty 3) units ──
  const timed = (data?.difficulty ?? 1) >= 3
  const [timeLeft, setTimeLeft] = useState<number | null>(null)

  useEffect(() => {
    if (data) {
      setHearts(data.hearts)
      startTime.current = Date.now()
    }
  }, [data])

  const challenges = data?.challenges ?? []
  const challenge = challenges[idx]
  const total = challenges.length

  // language & script helpers for pronunciation / spelling
  const speechLang = courseLang(data?.courseCode ?? "")
  const kbLang = isLangCourse(data?.courseCode ?? "")
  const isScriptText = (s: string) => /[\u0370-\u03FF\u0590-\u05FF]/.test(s)

  const timeLimit =
    timed && challenge && challenge.type !== "INFO" && challenge.type !== "SPEAK" && challenge.type !== "LISTEN"
      ? challenge.type === "MATCH" || challenge.type === "ARRANGE"
        ? 75
        : 30
      : 0

  const complete = useMutation({
    mutationFn: async () => {
      const url = isPractice ? "/api/practice/complete" : `/api/lessons/${session.lessonId}/complete`
      const res = await fetch(url, {
        method: "POST",
        body: JSON.stringify({
          answers,
          comboMax,
          durationSec: Math.round((Date.now() - startTime.current) / 1000),
          hearts,
        }),
      })
      if (!res.ok) throw new Error("completion failed")
      return res.json() as Promise<CompleteResult>
    },
    onSuccess: (r) => {
      setResult(r)
      sfx.fanfare()
      haptics.complete()
      setTimeout(() => {
        confetti({
          particleCount: 160,
          spread: 80,
          origin: { y: 0.62 },
          colors: ["#58CC02", "#FFC800", "#9B5DE5", "#E4453D", "#0F8A80"],
        })
      }, 120)
      refreshApp()
    },
    onError: () => {
      // still let the user leave gracefully
      setResult({
        xpEarned: 0, baseXp: 0, bonusXp: 0, doubled: false, gemsEarned: 0, perfect: false,
        firstTime: false, streak: 0, streakIncreased: false, usedFreeze: false, milestone: null,
        questsCompleted: [], achievementsUnlocked: [], totalXp: 0, gems: 0, hearts,
        dailyXp: 0, dailyXpGoal: 50, correctCount: 0, totalQuestions: total,
      })
    },
  })

  // ── answer handling ──
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [typedText, setTypedText] = useState("")
  const [builtTokens, setBuiltTokens] = useState<{ id: string; text: string }[]>([])
  // match state
  const [matchSelected, setMatchSelected] = useState<string | null>(null) // option id on left
  const [matchedPairs, setMatchedPairs] = useState<Set<string>>(new Set())
  const [matchWrong, setMatchWrong] = useState<string | null>(null)
  const [matchHadMiss, setMatchHadMiss] = useState(false)
  // speak self-rating (honor system)
  const [speakGood, setSpeakGood] = useState<boolean | null>(null)
  // shake trigger
  const [shakeKey, setShakeKey] = useState(0)

  useEffect(() => {
    // reset per-challenge state
    setSelectedOption(null)
    setTypedText("")
    setBuiltTokens([])
    setMatchSelected(null)
    setMatchedPairs(new Set())
    setMatchHadMiss(false)
    setSpeakGood(null)
    setStatus("answering")
  }, [idx])

  // ── timer effects (progressive difficulty: timed challenges in Advanced units) ──
  useEffect(() => {
    setTimeLeft(timeLimit > 0 ? timeLimit : null)
  }, [idx, timeLimit])

  useEffect(() => {
    if (!timed || timeLeft === null || status !== "answering") return
    if (timeLeft <= 0) {
      // time expired — counts as a miss
      const ch = challenges[idx]
      setStatus("wrong")
      setCombo(0)
      setShakeKey((k) => k + 1)
      setMistakes((m) => m + 1)
      sfx.wrong()
      haptics.wrong()
      setAnswers((a) => [...a, { challengeId: ch.id, correct: false, optionId: selectedOption ?? undefined, text: typedText || undefined }])
      if (ch && ch.type !== "MATCH") {
        setHearts((h) => Math.max(0, h - 1))
        sfx.heartLost()
        haptics.heartLost()
      }
      return
    }
    const t = setTimeout(() => setTimeLeft((s) => (s === null ? null : s - 1)), 1000)
    return () => clearTimeout(t)
  }, [timeLeft, status, timed])

  // ── per-type helpers (hooks must run before any early return) ──
  const arrangeBank = useMemo(() => {
    if (!challenge || challenge.type !== "ARRANGE") return []
    return seededShuffle(challenge.options, challenge.id.charCodeAt(0) + challenge.id.length)
  }, [challenge])

  const matchGroups = useMemo(() => {
    const groups = new Map<string, ChallengeDTO["options"]>()
    if (!challenge || challenge.type !== "MATCH") return groups
    for (const o of challenge.options) {
      const k = o.matchId!
      groups.set(k, [...(groups.get(k) ?? []), o])
    }
    return groups
  }, [challenge])

  const matchLeft = useMemo(() => {
    const pairs = [...matchGroups.values()].map((g) => g[0])
    return seededShuffle(pairs, idx * 31 + 7)
  }, [matchGroups, idx])

  const matchRight = useMemo(() => {
    const pairs = [...matchGroups.values()].map((g) => g[1])
    return seededShuffle(pairs, idx * 17 + 3)
  }, [matchGroups, idx])

  if (isLoading || !challenge) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[80] bg-white parchment-bg flex flex-col items-center justify-center gap-4"
      >
        {isError ? (
          <>
            <div className="text-5xl">🕯️</div>
            <p className="font-black text-lg">Couldn&apos;t open this lesson</p>
            <button className="btn3d bg-duo-green text-white shadow-[0_4px_0_#46a302] px-6 py-3" onClick={endLesson}>
              Go back
            </button>
          </>
        ) : (
          <>
            <motion.div animate={{ rotate: [0, -8, 8, 0] }} transition={{ duration: 1.2, repeat: Infinity }} className="text-5xl">
              📜
            </motion.div>
            <p className="font-black text-muted-foreground">Opening the scroll…</p>
          </>
        )}
      </motion.div>
    )
  }

  // ── per-type helpers ──
  const canCheck = (): boolean => {
    switch (challenge.type) {
      case "INFO":
        return true
      case "SELECT":
      case "ASSIST":
      case "LISTEN":
        return !!selectedOption
      case "SPEAK":
        return speakGood !== null
      case "TYPE":
        return typedText.trim().length > 0
      case "ARRANGE":
        return builtTokens.length > 0
      case "MATCH":
        return matchedPairs.size * 2 === challenge.options.length
    }
  }

  const isCorrect = (): { correct: boolean; correctText?: string } => {
    switch (challenge.type) {
      case "INFO":
        return { correct: true }
      case "SELECT":
      case "ASSIST":
      case "LISTEN": {
        const opt = challenge.options.find((o) => o.id === selectedOption)
        return { correct: !!opt?.correct, correctText: challenge.options.find((o) => o.correct)?.text }
      }
      case "SPEAK":
        return { correct: speakGood === true }
      case "TYPE": {
        const accepted = challenge.options.filter((o) => o.correct).map((o) => normalizeAnswer(o.text))
        return { correct: accepted.includes(normalizeAnswer(typedText)), correctText: challenge.options.find((o) => o.correct)?.text }
      }
      case "ARRANGE": {
        const correctSeq = [...challenge.options]
          .filter((o) => (o.wordOrder ?? -1) > 0)
          .sort((a, b) => (a.wordOrder ?? 0) - (b.wordOrder ?? 0))
          .map((o) => o.text)
        const builtSeq = builtTokens.map((t) => t.text)
        return { correct: JSON.stringify(builtSeq) === JSON.stringify(correctSeq), correctText: correctSeq.join(" ") }
      }
      case "MATCH":
        return { correct: !matchHadMiss }
    }
  }

  const recordAnswer = (correct: boolean) => {
    setAnswers((a) => [...a, { challengeId: challenge.id, correct, optionId: selectedOption ?? undefined, text: typedText || undefined }])
  }

  const onCheck = () => {
    if (status !== "answering") return
    const { correct, correctText } = isCorrect()
    if (correct) {
      const newCombo = combo + 1
      setCombo(newCombo)
      setComboMax((m) => Math.max(m, newCombo))
      setStatus("correct")
      sfx.correct()
      haptics.correct()
      if (newCombo >= 3) sfx.combo(newCombo)
      recordAnswer(true)
    } else {
      setStatus("wrong")
      setCombo(0)
      setShakeKey((k) => k + 1)
      setMistakes((m) => m + 1)
      sfx.wrong()
      haptics.wrong()
      recordAnswer(false)
      // lose a heart (not for MATCH, never for SPEAK self-ratings)
      if (challenge.type !== "MATCH" && challenge.type !== "SPEAK") {
        setHearts((h) => Math.max(0, h - 1))
        sfx.heartLost()
        haptics.heartLost()
      }
    }
    void correctText
  }

  const onContinue = () => {
    if (status === "wrong" && hearts <= 0) {
      setOutOfHearts(true)
      return
    }
    if (idx + 1 >= total) {
      complete.mutate()
      return
    }
    setIdx((i) => i + 1)
  }

  const quitLesson = async () => {
    // sync hearts to server
    await fetch("/api/hearts", {
      method: "POST",
      body: JSON.stringify({ hearts }),
    }).catch(() => undefined)
    refreshApp()
    endLesson()
  }

  // ── RESULTS SCREEN ──
  if (result) {
    return (
      <ResultsScreen
        result={result}
        isPractice={isPractice}
        onDone={() => { refreshApp(); endLesson() }}
        shareInfo={!isPractice && data ? { title: session.title, icon: data.courseEmoji, color: data.unitColor } : null}
      />
    )
  }

  const progressPct = Math.round(((idx + (status !== "answering" ? 1 : 0)) / total) * 100)

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 30 }}
      transition={{ type: "spring", stiffness: 260, damping: 28 }}
      className="fixed inset-0 z-[80] parchment-bg flex flex-col"
      role="dialog"
      aria-label={`Lesson: ${session.title}`}
    >
      {/* header */}
      <header className="flex items-center gap-3 px-4 py-3 border-b-2 border-paper-border bg-white/70 backdrop-blur">
        <button
          onClick={() => {
            sfx.tap()
            setShowQuit(true)
          }}
          className="p-1.5 rounded-xl hover:bg-secondary transition-colors"
          aria-label="Quit lesson"
        >
          <X className="w-6 h-6 text-muted-foreground" />
        </button>

        {/* segmented progress */}
        <div className="flex-1 h-4 rounded-full bg-[#eee6cd] overflow-hidden">
          <motion.div
            className="h-full rounded-full relative"
            style={{ backgroundColor: status === "wrong" ? "#FF4B4B" : "#58CC02" }}
            initial={false}
            animate={{ width: `${Math.max(4, progressPct)}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          >
            <AnimatePresence>
              {status === "correct" && (
                <motion.span
                  key={correctFlash}
                  initial={{ opacity: 0.7 }}
                  animate={{ opacity: 0 }}
                  className="absolute inset-0 bg-white/50 rounded-full"
                />
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* timer (Advanced units) */}
        {timed && timeLeft !== null && timeLimit > 0 && status === "answering" && (
          <motion.div
            key={timeLeft}
            initial={{ scale: 1.18 }}
            animate={{ scale: 1 }}
            className={`flex items-center gap-1 font-black text-sm rounded-full px-2.5 py-1 tabular-nums ${
              timeLeft <= 8 ? "bg-duo-red/10 text-duo-red" : "bg-secondary text-muted-foreground"
            }`}
            aria-label={`${timeLeft} seconds remaining`}
          >
            <Timer className={`w-4 h-4 ${timeLeft <= 8 ? "animate-pulse" : ""}`} /> {timeLeft}s
          </motion.div>
        )}

        <div className="flex items-center gap-1 font-black text-lg">
          <Heart className={`w-6 h-6 text-duo-red fill-duo-red ${hearts === 0 ? "opacity-30" : ""}`} />
          <motion.span key={hearts} initial={{ scale: 1.3 }} animate={{ scale: 1 }} className="tabular-nums">
            {hearts}
          </motion.span>
        </div>
      </header>

      {/* combo chip */}
      <AnimatePresence>
        {combo >= 3 && status === "answering" && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.8 }}
            className="fixed top-16 right-4 z-10"
          >
            <motion.div
              key={combo}
              initial={{ scale: 1.35 }}
              animate={{ scale: 1 }}
              className="bg-duo-gold text-white font-black rounded-full px-3.5 py-1.5 text-sm flex items-center gap-1.5 shadow-[0_3px_0_#d9a400]"
            >
              <Flame className="w-4 h-4" /> {combo} combo!
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* body */}
      <main className="flex-1 overflow-y-auto" key={shakeKey}>
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: status === "wrong" ? [0, -8, 8, -5, 5, 0] : 0 }}
          transition={{ duration: 0.25 }}
          className="max-w-2xl mx-auto w-full px-4 py-6 sm:py-10"
        >
          <p className="text-lg font-black mb-4">{challenge.prompt}</p>

          {/* INFO */}
          {challenge.type === "INFO" && (
            <div className="bg-white rounded-3xl border-2 border-paper-border shadow-[0_5px_0_#e8e0c8] p-6 text-center">
              <div className="flex justify-center mb-3">
                <Mascot mood="happy" size={92} />
              </div>
              <h2 className="text-2xl font-black mb-3">{challenge.question}</h2>
              <p className="text-left font-semibold text-foreground/90 leading-relaxed whitespace-pre-line">
                {challenge.meaning}
              </p>
              {challenge.transliteration && (
                <p className="mt-3 text-sm font-extrabold text-duo-green-dark bg-duo-green/10 rounded-xl px-3 py-2 inline-block">
                  🔊 {challenge.transliteration}
                </p>
              )}
            </div>
          )}

          {/* SELECT / ASSIST */}
          {(challenge.type === "SELECT" || challenge.type === "ASSIST") && (
            <div>
              <div className="bg-white rounded-3xl border-2 border-paper-border shadow-[0_5px_0_#e8e0c8] p-6 sm:p-8 mb-6 text-center">
                <h2 className={`glyph font-black leading-tight ${challenge.question.length <= 6 ? "text-7xl sm:text-8xl" : "text-3xl sm:text-4xl"}`}>
                  {challenge.question}
                </h2>
                {challenge.transliteration && (
                  <p className="mt-2 font-extrabold text-muted-foreground">{challenge.transliteration}</p>
                )}
                {isScriptText(challenge.question) && (
                  <div className="mt-4 flex justify-center">
                    <TermAudioButton text={challenge.question} lang={speechLang} />
                  </div>
                )}
              </div>
              <div className={`grid gap-3 ${challenge.options.some((o) => o.text.length > 20) ? "grid-cols-1" : "grid-cols-2"}`}>
                {challenge.options.map((o) => {
                  const isSel = selectedOption === o.id
                  const reveal = status !== "answering"
                  const showCorrect = reveal && o.correct
                  const showWrong = reveal && isSel && !o.correct
                  return (
                    <motion.button
                      key={o.id}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => {
                        if (status !== "answering") return
                        sfx.tap()
                        haptics.tap()
                        setSelectedOption(o.id)
                      }}
                      className={`btn3d py-4 px-4 border-2 border-b-4 min-h-[64px] text-lg ${
                        showCorrect
                          ? "bg-duo-green/10 border-duo-green text-duo-green-dark"
                          : showWrong
                            ? "bg-duo-red/10 border-duo-red text-duo-red animate-shake"
                            : isSel
                              ? "bg-duo-green/10 border-duo-green text-duo-green-dark"
                              : "bg-white border-paper-border text-foreground hover:bg-secondary"
                      }`}
                      aria-pressed={isSel}
                    >
                      <span className="glyph">{o.text}</span>
                    </motion.button>
                  )
                })}
              </div>
            </div>
          )}

          {/* LISTEN — audio → meaning */}
          {challenge.type === "LISTEN" && (
            <div>
              <ListenCard text={challenge.question} lang={speechLang} transliteration={challenge.transliteration} />
              <div className={`grid gap-3 ${challenge.options.some((o) => o.text.length > 20) ? "grid-cols-1" : "grid-cols-2"}`}>
                {challenge.options.map((o) => {
                  const isSel = selectedOption === o.id
                  const reveal = status !== "answering"
                  const showCorrect = reveal && o.correct
                  const showWrong = reveal && isSel && !o.correct
                  return (
                    <motion.button
                      key={o.id}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => {
                        if (status !== "answering") return
                        sfx.tap()
                        haptics.tap()
                        setSelectedOption(o.id)
                      }}
                      className={`btn3d py-4 px-4 border-2 border-b-4 min-h-[64px] text-lg ${
                        showCorrect
                          ? "bg-duo-green/10 border-duo-green text-duo-green-dark"
                          : showWrong
                            ? "bg-duo-red/10 border-duo-red text-duo-red animate-shake"
                            : isSel
                              ? "bg-duo-green/10 border-duo-green text-duo-green-dark"
                              : "bg-white border-paper-border text-foreground hover:bg-secondary"
                      }`}
                      aria-pressed={isSel}
                    >
                      {o.text}
                    </motion.button>
                  )
                })}
              </div>
            </div>
          )}

          {/* SPEAK — hear the model, record yourself, compare */}
          {challenge.type === "SPEAK" && (
            <SpeakExercise
              text={challenge.question}
              transliteration={challenge.transliteration}
              meaning={challenge.meaning}
              lang={speechLang}
              disabled={status !== "answering"}
              onRated={(good) => setSpeakGood(good)}
            />
          )}

          {/* TYPE */}
          {challenge.type === "TYPE" && (() => {
            const answerText = challenge.options.find((o) => o.correct)?.text ?? ""
            const answerIsScript = isScriptText(answerText)
            return (
              <div>
                {answerIsScript ? (
                  /* spelling mode: definition card + play the term */
                  <div className="bg-white rounded-3xl border-2 border-paper-border shadow-[0_5px_0_#e8e0c8] p-6 sm:p-8 mb-6 text-center">
                    <h2 className="font-black text-2xl sm:text-3xl leading-snug">{challenge.question}</h2>
                    <div className="mt-5 flex justify-center">
                      <ListenCard text={answerText} lang={speechLang} transliteration={null} autoPlay={false} />
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl border-2 border-paper-border shadow-[0_5px_0_#e8e0c8] p-6 sm:p-8 mb-6 text-center">
                    <h2 className="glyph font-black text-6xl sm:text-7xl">{challenge.question}</h2>
                    {challenge.transliteration && (
                      <p className="mt-2 font-extrabold text-muted-foreground">{challenge.transliteration}</p>
                    )}
                  </div>
                )}
                <input
                  value={typedText}
                  onChange={(e) => setTypedText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && canCheck() && status === "answering") onCheck()
                  }}
                  disabled={status !== "answering"}
                  placeholder={answerIsScript ? (kbLang === "he" ? "כתבו כאן…" : "γράψτε εδώ…") : "Type the answer…"}
                  dir={kbLang === "he" && answerIsScript ? "rtl" : "ltr"}
                  autoFocus
                className={`glyph w-full bg-white border-2 rounded-2xl px-5 py-4 text-xl font-extrabold focus:outline-none transition-colors ${
                    status === "correct"
                      ? "border-duo-green"
                      : status === "wrong"
                        ? "border-duo-red animate-shake"
                        : "border-paper-border focus:border-duo-green"
                  }`}
                  aria-label="Your answer"
                />
                {answerIsScript && kbLang && (
                  <LetterKeyboard
                    lang={kbLang}
                    disabled={status !== "answering"}
                    onKey={(letter) => setTypedText((t) => t + letter)}
                    onSpace={() => setTypedText((t) => t + " ")}
                    onBackspace={() => setTypedText((t) => t.slice(0, -1))}
                  />
                )}
              </div>
            )
          })()}

          {/* ARRANGE */}
          {challenge.type === "ARRANGE" && (
            <div>
              <p className="text-center font-black text-2xl mb-6">{challenge.question}</p>
              {/* answer area */}
              <div
                className={`min-h-[88px] bg-white border-2 rounded-2xl p-3 flex flex-wrap gap-2 mb-6 ${
                  status === "wrong" ? "border-duo-red" : status === "correct" ? "border-duo-green" : "border-paper-border border-b-4"
                }`}
              >
                {builtTokens.length === 0 && (
                  <span className="text-muted-foreground/60 font-bold self-center mx-auto">Tap the words below…</span>
                )}
                <AnimatePresence>
                  {builtTokens.map((t) => (
                    <motion.button
                      layout
                      key={t.id}
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.6, opacity: 0 }}
                      onClick={() => {
                        if (status !== "answering") return
                        sfx.tap()
                        haptics.tap()
                        setBuiltTokens((b) => b.filter((x) => x.id !== t.id))
                      }}
                      className="btn3d bg-white border-2 border-paper-border px-3.5 py-2 text-base"
                    >
                      {t.text}
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>
              {/* word bank */}
              <div className="flex flex-wrap gap-2 justify-center">
                <AnimatePresence>
                  {arrangeBank
                    .filter((o) => !builtTokens.some((b) => b.id === o.id))
                    .map((o) => (
                      <motion.button
                        layout
                        key={o.id}
                        initial={{ scale: 0.6, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.6, opacity: 0 }}
                        whileTap={{ scale: 0.94 }}
                        onClick={() => {
                          if (status !== "answering") return
                          sfx.tap()
                          haptics.tap()
                          setBuiltTokens((b) => [...b, { id: o.id, text: o.text }])
                        }}
                        className="btn3d bg-white border-2 border-paper-border px-3.5 py-2 text-base shadow-[0_3px_0_#e8e0c8]"
                      >
                        {o.text}
                      </motion.button>
                    ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* MATCH */}
          {challenge.type === "MATCH" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-3">
                {matchLeft.map((o) => {
                  const done = matchedPairs.has(o.matchId!)
                  const sel = matchSelected === o.id
                  return (
                    <motion.button
                      key={o.id}
                      whileTap={{ scale: 0.96 }}
                      animate={matchWrong === o.id ? { x: [0, -6, 6, -4, 4, 0] } : {}}
                      onClick={() => {
                        if (done || status !== "answering") return
                        sfx.tap()
                        haptics.tap()
                        setMatchSelected(o.id)
                      }}
                      className={`btn3d glyph py-4 px-3 border-2 border-b-4 min-h-[60px] text-lg ${
                        done
                          ? "bg-duo-green/10 border-duo-green text-duo-green-dark opacity-50"
                          : sel
                            ? "bg-duo-purple/10 border-duo-purple text-duo-purple"
                            : "bg-white border-paper-border"
                      }`}
                      aria-pressed={sel}
                    >
                      {o.text}
                    </motion.button>
                  )
                })}
              </div>
              <div className="flex flex-col gap-3">
                {matchRight.map((o) => {
                  const done = matchedPairs.has(o.matchId!)
                  const wrong = matchWrong === o.id
                  return (
                    <motion.button
                      key={o.id}
                      whileTap={{ scale: 0.96 }}
                      animate={wrong ? { x: [0, -6, 6, -4, 4, 0] } : {}}
                      onClick={() => {
                        if (done || status !== "answering") return
                        if (!matchSelected) {
                          sfx.tap()
                          haptics.tap()
                          return
                        }
                        const leftOpt = challenge.options.find((x) => x.id === matchSelected)
                        if (leftOpt && leftOpt.matchId === o.matchId) {
                          sfx.correct()
                          haptics.correct()
                          const next = new Set(matchedPairs)
                          next.add(o.matchId!)
                          setMatchedPairs(next)
                          setMatchSelected(null)
                          if (next.size * 2 === challenge.options.length) {
                            // all matched → auto-advance after beat
                            recordAnswer(!matchHadMiss)
                            setStatus(matchHadMiss ? "wrong" : "correct")
                            if (!matchHadMiss) {
                              const nc = combo + 1
                              setCombo(nc)
                              setComboMax((m) => Math.max(m, nc))
                            } else {
                              setCombo(0)
                              setMistakes((m) => m + 1)
                            }
                          }
                        } else {
                          sfx.wrong()
                          haptics.wrong()
                          setMatchHadMiss(true)
                          setCombo(0)
                          setMatchWrong(o.id)
                          setTimeout(() => setMatchWrong(null), 450)
                        }
                      }}
                      className={`btn3d py-4 px-3 border-2 border-b-4 min-h-[60px] text-sm font-extrabold ${
                        done
                          ? "bg-duo-green/10 border-duo-green text-duo-green-dark opacity-50"
                          : wrong
                            ? "bg-duo-red/10 border-duo-red text-duo-red"
                            : "bg-white border-paper-border"
                      }`}
                    >
                      {o.text}
                    </motion.button>
                  )
                })}
              </div>
            </div>
          )}
        </motion.div>
      </main>

      {/* footer / feedback */}
      <AnimatePresence mode="wait">
        {status === "answering" ? (
          <motion.footer
            key="check"
            initial={{ y: 40 }}
            animate={{ y: 0 }}
            exit={{ y: 40 }}
            className="border-t-2 border-paper-border bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
          >
            <div className="max-w-2xl mx-auto">
              <button
                onClick={onCheck}
                disabled={!canCheck() || challenge.type === "MATCH"}
                className="btn3d w-full bg-duo-green text-white shadow-[0_5px_0_#46a302] py-4 text-lg disabled:bg-[#dcd5bd] disabled:shadow-[0_4px_0_#c9c0a4]"
              >
                {challenge.type === "MATCH"
                  ? "Match all the pairs"
                  : challenge.type === "INFO"
                    ? "GOT IT"
                    : challenge.type === "SPEAK"
                      ? speakGood === null
                        ? "RECORD & RATE YOURSELF"
                        : "CHECK"
                      : "CHECK"}
              </button>
            </div>
          </motion.footer>
        ) : (
          <motion.footer
            key="feedback"
            initial={{ y: 60 }}
            animate={{ y: 0 }}
            exit={{ y: 60 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className={`border-t-4 bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))] ${
              status === "correct" ? "border-duo-green" : "border-duo-red"
            }`}
          >
            <div className="max-w-2xl mx-auto">
              <div className={`flex items-start gap-3 mb-3 ${status === "wrong" ? "animate-shake" : ""}`}>
                <motion.span
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 14 }}
                  className={`w-9 h-9 rounded-full grid place-items-center text-white text-lg font-black shrink-0 ${
                    status === "correct" ? "bg-duo-green" : "bg-duo-red"
                  }`}
                >
                  {status === "correct" ? "✓" : "✕"}
                </motion.span>
                <div className="min-w-0">
                  <p className={`font-black ${status === "correct" ? "text-duo-green-dark" : "text-duo-red"}`}>
                    {status === "correct"
                      ? challenge.type === "INFO"
                        ? "Nice reading!"
                        : challenge.type === "SPEAK"
                          ? speakGood
                            ? "Beautiful pronunciation! 🎙️"
                            : "Nice effort — reps train the tongue"
                          : ["Excellent!", "Correct!", "Well done!", "You got it!", "Beautiful!"][idx % 5]
                      : challenge.type === "SPEAK"
                        ? "Keep practicing — play the model once more"
                        : "Not quite…"}
                  </p>
                  {status === "wrong" && challenge.type !== "INFO" && challenge.type !== "SPEAK" && (
                    <p className="font-bold text-sm">
                      Correct answer:{" "}
                      <span className="glyph font-black text-duo-green-dark">
                        {challenge.options.find((o) => o.correct)?.text ?? "—"}
                      </span>
                      {challenge.type === "ARRANGE" && (
                        <span className="block mt-0.5">
                          {(() => {
                            const seq = [...challenge.options]
                              .filter((o) => (o.wordOrder ?? -1) > 0)
                              .sort((a, b) => (a.wordOrder ?? 0) - (b.wordOrder ?? 0))
                              .map((o) => o.text)
                            return seq.join(" ")
                          })()}
                        </span>
                      )}
                      {challenge.type === "TYPE" && (
                        <span className="glyph block mt-0.5">{challenge.options.find((o) => o.correct)?.text}</span>
                      )}
                    </p>
                  )}
                  {challenge.meaning && (
                    <p className="text-sm font-semibold text-muted-foreground leading-snug">{challenge.meaning}</p>
                  )}
                  {status === "correct" && combo >= 3 && (
                    <p className="text-sm font-black text-duo-gold-dark mt-0.5">🔥 {combo} in a row!</p>
                  )}
                </div>
              </div>
              <button
                onClick={onContinue}
                className={`btn3d w-full py-4 text-lg text-white ${
                  status === "correct"
                    ? "bg-duo-green shadow-[0_5px_0_#46a302]"
                    : "bg-duo-red shadow-[0_5px_0_#d33131]"
                }`}
              >
                CONTINUE
              </button>
            </div>
          </motion.footer>
        )}
      </AnimatePresence>

      {/* quit confirm */}
      <AnimatePresence>
        {showQuit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[85] bg-black/40 flex items-center justify-center p-4"
            onClick={() => setShowQuit(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 16, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 16, opacity: 0 }}
              className="bg-white rounded-3xl border-2 border-paper-border shadow-[0_6px_0_#e8e0c8] w-full max-w-sm p-6 text-center"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
            >
              <div className="flex justify-center mb-2">
                <Mascot mood="sad" size={90} />
              </div>
              <h3 className="text-xl font-black mb-1">Wait — don&apos;t go!</h3>
              <p className="font-semibold text-muted-foreground mb-5">
                You&apos;re {progressPct}% through. Quit now and this attempt won&apos;t count.
              </p>
              <div className="flex flex-col gap-2">
                <button
                  className="btn3d bg-duo-green text-white shadow-[0_4px_0_#46a302] py-3"
                  onClick={() => {
                    sfx.tap()
                    setShowQuit(false)
                  }}
                >
                  Keep learning
                </button>
                <button
                  className="btn3d bg-duo-red text-white shadow-[0_4px_0_#d33131] py-3"
                  onClick={() => void quitLesson()}
                >
                  End session
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* out of hearts */}
      <AnimatePresence>
        {outOfHearts && (
          <OutOfHeartsModal
            hearts={hearts}
            onRefilled={() => {
              setHearts(5)
              setOutOfHearts(false)
            }}
            onQuit={() => {
              setOutOfHearts(false)
              void quitLesson()
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function OutOfHeartsModal({
  hearts,
  onRefilled,
  onQuit,
}: {
  hearts: number
  onRefilled: () => void
  onQuit: () => void
}) {
  const refreshApp = useRefreshApp()
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const refill = async () => {
    setBusy(true)
    setErr(null)
    try {
      const res = await fetch("/api/shop", { method: "POST", body: JSON.stringify({ slug: "heart_refill" }) })
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(body.error ?? "failed")
      }
      sfx.gem()
      haptics.complete()
      refreshApp()
      onRefilled()
    } catch (e) {
      setErr((e as Error).message === "not enough gems" ? "Not enough gems — visit the Shop!" : "Something went wrong")
    } finally {
      setBusy(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[85] bg-black/50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.88, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
        className="bg-white rounded-3xl border-2 border-paper-border shadow-[0_6px_0_#e8e0c8] w-full max-w-sm p-6 text-center"
        role="dialog"
        aria-label="Out of hearts"
      >
        <div className="flex justify-center gap-1.5 mb-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Heart key={i} className={`w-8 h-8 ${i < hearts ? "text-duo-red fill-duo-red" : "text-paper-border fill-paper-border"}`} />
          ))}
        </div>
        <div className="flex justify-center mb-2">
          <Mascot mood="sad" size={80} />
        </div>
        <h3 className="text-2xl font-black mb-1">You ran out of hearts!</h3>
        <p className="font-semibold text-muted-foreground mb-5">
          Refill to keep this session going, or come back when they&apos;ve regenerated (10 min each).
        </p>
        {err && <p className="text-duo-red font-bold text-sm mb-2">{err}</p>}
        <div className="flex flex-col gap-2">
          <button
            onClick={refill}
            disabled={busy}
            className="btn3d bg-duo-green text-white shadow-[0_4px_0_#46a302] py-3"
          >
            Refill for 350 💎
          </button>
          <button onClick={onQuit} className="btn3d bg-white border-2 border-paper-border shadow-[0_4px_0_#e8e0c8] py-3">
            End session
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function ResultsScreen({
  result,
  isPractice,
  onDone,
  shareInfo,
}: {
  result: CompleteResult
  isPractice: boolean
  onDone: () => void
  shareInfo: { title: string; icon: string; color: string } | null
}) {
  const [shownXp, setShownXp] = useState(0)
  const [popupIdx, setPopupIdx] = useState(0)
  const setShareDraft = useAppStore((s) => s.setShareDraft)
  const setView = useAppStore((s) => s.setView)
  const endLesson = useAppStore((s) => s.endLesson)

  // count-up XP
  useEffect(() => {
    let raf = 0
    const start = performance.now()
    const dur = 900
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur)
      setShownXp(Math.round(result.xpEarned * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [result.xpEarned])

  const popups = [
    ...result.questsCompleted.map((q) => ({ icon: "🎯", title: "Quest complete!", body: q })),
    ...result.achievementsUnlocked.map((a) => ({ icon: a.icon, title: `Achievement: ${a.title}`, body: `${a.tierName} — +${a.gems} gems` })),
  ]

  const accuracy = result.totalQuestions > 0 ? Math.round((result.correctCount / result.totalQuestions) * 100) : 100
  const duration = Math.max(1, Math.round((Date.now() - 0) / 1000))

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] parchment-bg overflow-y-auto"
    >
      <div className="max-w-lg mx-auto px-4 py-8 min-h-full flex flex-col items-center justify-center">
        <motion.div initial={{ scale: 0.5, y: 20 }} animate={{ scale: 1, y: 0 }} transition={{ type: "spring", stiffness: 260, damping: 16 }}>
          <Mascot mood="cheer" size={130} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-4xl font-black text-duo-green-dark text-center"
        >
          {isPractice ? "Practice complete!" : "Lesson complete!"}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="font-bold text-muted-foreground mb-6 text-center"
        >
          {result.perfect ? "Flawless — not a single mistake! ✨" : "Every word studied is a seed planted."}
        </motion.p>

        {/* stat cards */}
        <div className="grid grid-cols-3 gap-2.5 w-full mb-4">
          <StatCard color="#FFC800" label="Total XP" value={`${shownXp}`} icon={<Zap className="w-5 h-5" />} delay={0.3} sub={result.doubled ? "2× boost!" : undefined} />
          <StatCard color="#E4453D" label="Speedy" value={`${Math.max(15, (result.totalQuestions * 12 + 20))}s`} icon={<Timer className="w-5 h-5" />} delay={0.38} />
          <StatCard color="#9B5DE5" label="Accuracy" value={`${accuracy}%`} icon={<Target className="w-5 h-5" />} delay={0.46} />
        </div>

        {/* streak banner */}
        <AnimatePresence>
          {result.streakIncreased && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.55, type: "spring", stiffness: 300, damping: 20 }}
              className="w-full bg-white border-2 border-paper-border rounded-2xl shadow-[0_4px_0_#e8e0c8] p-3.5 flex items-center gap-3 mb-3"
            >
              <motion.span
                className="text-3xl animate-flicker"
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 1.4, repeat: Infinity }}
              >
                🔥
              </motion.span>
              <div>
                <p className="font-black">
                  {result.streak}-day streak {result.usedFreeze ? "(freeze used!)" : "extended!"}
                </p>
                <p className="text-sm font-bold text-muted-foreground">
                  {result.milestone ? `Milestone reached — ${result.milestone} days! 🎉` : "Come back tomorrow to grow it."}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* quest/achievement popups */}
        <div className="w-full flex flex-col gap-2">
          <AnimatePresence>
            {popups.slice(0, popupIdx + 1).map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.18, type: "spring", stiffness: 300, damping: 22 }}
                onAnimationComplete={() => setPopupIdx(i)}
                className="bg-duo-gold/15 border-2 border-duo-gold/50 rounded-2xl p-3 flex items-center gap-3"
              >
                <span className="text-2xl">{p.icon}</span>
                <div>
                  <p className="font-black text-sm">{p.title}</p>
                  <p className="text-sm font-bold text-muted-foreground">{p.body}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-2 mt-4 mb-2 font-black text-duo-purple">
          <span className="text-xl">💎</span> +{result.gemsEarned} gems
        </div>

        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.62 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            if (!shareInfo) return
            sfx.tap()
            haptics.tap()
            const accuracy0 = result.totalQuestions > 0 ? Math.round((result.correctCount / result.totalQuestions) * 100) : 100
            setShareDraft({
              kind: "lesson",
              title: `${shareInfo.title} complete!`,
              subtitle: `${accuracy0}% accuracy · ${result.xpEarned} XP earned${result.perfect ? " · perfect run ✨" : ""}`,
              icon: shareInfo.icon,
              color: shareInfo.color,
            })
            endLesson()
            setView("community")
          }}
          disabled={!shareInfo}
          className="btn3d bg-duo-purple text-white shadow-[0_5px_0_#7c3aed] w-full py-3.5 mt-2 flex items-center justify-center gap-2"
        >
          📣 Share to community
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          whileTap={{ scale: 0.97 }}
          onClick={onDone}
          className="btn3d bg-duo-green text-white shadow-[0_5px_0_#46a302] w-full py-4 text-lg mt-2 flex items-center justify-center gap-2"
        >
          CONTINUE <ChevronRight className="w-5 h-5" />
        </motion.button>
      </div>
    </motion.div>
  )
}

function StatCard({
  color,
  label,
  value,
  icon,
  delay,
  sub,
}: {
  color: string
  label: string
  value: string
  icon: React.ReactNode
  delay: number
  sub?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-2xl p-3 text-center border-b-4"
      style={{ backgroundColor: color + "1a", borderColor: color + "80" }}
    >
      <div className="flex items-center justify-center gap-1 text-[11px] font-black uppercase tracking-wide" style={{ color }}>
        {icon} {label}
      </div>
      <p className="text-xl font-black" style={{ color }}>
        {value}
      </p>
      {sub && <p className="text-[10px] font-black" style={{ color }}>{sub}</p>}
    </motion.div>
  )
}
