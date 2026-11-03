"use client"

import { useEffect, useMemo, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion"
import confetti from "canvas-confetti"
import { X, Zap, Gem, Flame, Brain, ChevronRight, Sunrise, Trophy } from "lucide-react"
import { useAppStore } from "@/lib/client/store"
import { sfx } from "@/lib/client/sound"
import { haptics } from "@/lib/client/haptics"
import type { DailyQuizPayload, DailyQuizQuestion, DailyQuizResult } from "@/lib/types"
import { Mascot } from "./Mascot"
import { useRefreshApp } from "./ScrollApp"

const CATEGORY_COLORS: Record<string, string> = {
  People: "#D97706",
  Places: "#0F8A80",
  Events: "#BE123C",
  Verses: "#7C3AED",
  Stories: "#EC4899",
  Letters: "#58CC02",
  Prophecy: "#0891B2",
}

/** ms until the next quiz day boundary (UTC+8 like the server's dayKey) */
function msUntilNextQuiz(): number {
  const now = new Date()
  const next = new Date(now.getTime() + 8 * 3600 * 1000)
  next.setUTCHours(24, 0, 0, 0)
  return next.getTime() - (now.getTime() + 8 * 3600 * 1000)
}

function fmtCountdown(ms: number): string {
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

export function DailyQuizOverlay() {
  const endQuiz = useAppStore((s) => s.endQuiz)
  const refreshApp = useRefreshApp()

  const { data, isLoading, isError } = useQuery<DailyQuizPayload>({
    queryKey: ["daily-quiz"],
    queryFn: async () => {
      const res = await fetch("/api/daily-quiz")
      if (!res.ok) throw new Error("failed to load quiz")
      return res.json() as Promise<DailyQuizPayload>
    },
    staleTime: 60_000,
  })

  // flow state
  const [idx, setIdx] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [phase, setPhase] = useState<"answering" | "feedback">("answering")
  const [answers, setAnswers] = useState<number[]>([])
  const [correctCount, setCorrectCount] = useState(0)
  const [result, setResult] = useState<DailyQuizResult | null>(null)

  const questions: DailyQuizQuestion[] = data?.questions ?? []
  const q = questions[idx]
  const total = questions.length
  const alreadyDone = !!data?.completed && !result

  const submit = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/daily-quiz", {
        method: "POST",
        body: JSON.stringify({ answers }),
      })
      if (!res.ok) throw new Error("submission failed")
      return res.json() as Promise<DailyQuizResult>
    },
    onSuccess: (r) => {
      setResult(r)
      sfx.fanfare()
      haptics.complete()
      if (r.score === r.total && r.total > 0) {
        setTimeout(() => {
          confetti({
            particleCount: 170,
            spread: 90,
            origin: { y: 0.6 },
            colors: ["#58CC02", "#FFC800", "#9B5DE5", "#EC4899"],
          })
        }, 120)
      }
      refreshApp()
    },
    onError: () =>
      setResult({
        day: data?.day ?? "",
        score: correctCount,
        total: Math.max(1, total),
        xpEarned: 0,
        gemsEarned: 0,
        perfect: false,
        streak: 0,
        streakIncreased: false,
        questsCompleted: [],
        achievementsUnlocked: [],
        totalXp: 0,
        gems: 0,
        dailyXp: 0,
        dailyXpGoal: 50,
      }),
  })

  // auto submit after the last question's feedback → results
  useEffect(() => {
    if (idx >= total && total > 0 && !result && !submit.isPending && !submit.isError) {
      submit.mutate()
    }
  }, [idx, total, result, submit.isPending, submit.isError])

  const answer = (i: number) => {
    if (phase === "feedback" || !q) return
    setSelected(i)
    const ok = i === q.correctIndex
    setAnswers((a) => [...a, i])
    if (ok) {
      setCorrectCount((c) => c + 1)
      sfx.correct()
      haptics.correct()
    } else {
      sfx.wrong()
      haptics.wrong()
    }
    setPhase("feedback")
  }

  const next = () => {
    setSelected(null)
    setPhase("answering")
    setIdx((i) => i + 1)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 30 }}
      transition={{ type: "spring", stiffness: 260, damping: 28 }}
      className="fixed inset-0 z-[80] parchment-bg flex flex-col"
      role="dialog"
      aria-label="Daily Bible quiz"
    >
      {/* header */}
      <header className="flex items-center gap-3 px-4 py-3 border-b-2 border-paper-border bg-white/70 backdrop-blur">
        <button
          onClick={() => {
            sfx.tap()
            endQuiz()
          }}
          className="p-1.5 rounded-xl hover:bg-secondary transition-colors"
          aria-label="Close daily quiz"
        >
          <X className="w-6 h-6 text-muted-foreground" />
        </button>
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <Brain className="w-6 h-6 text-[#7C3AED] shrink-0" />
          <div className="min-w-0">
            <p className="font-black leading-tight">Daily Bible Quiz</p>
            <p className="text-[11px] font-bold text-muted-foreground truncate">
              {data?.streakOfQuizzes ? `🔥 ${data.streakOfQuizzes}-day quiz streak` : "5 questions · fresh every day"}
            </p>
          </div>
        </div>
        {/* progress dots */}
        {!alreadyDone && !result && (
          <div className="flex items-center gap-1.5" aria-label={`Question ${Math.min(idx + 1, total)} of ${total}`}>
            {questions.map((_, i) => (
              <span
                key={i}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  i < idx ? "bg-duo-green" : i === idx ? "bg-[#7C3AED]" : "bg-[#e5dfcc]"
                }`}
              />
            ))}
          </div>
        )}
      </header>

      {/* body */}
      {isLoading ? (
        <div className="flex-1 grid place-items-center">
          <div className="text-center">
            <motion.div animate={{ rotate: [0, -8, 8, 0] }} transition={{ duration: 1.3, repeat: Infinity }} className="text-6xl">
              🧠
            </motion.div>
            <p className="font-black text-muted-foreground mt-3">Unrolling today&apos;s questions…</p>
          </div>
        </div>
      ) : isError || !data ? (
        <div className="flex-1 grid place-items-center p-8 text-center">
          <div>
            <div className="text-5xl mb-3">🕯️</div>
            <p className="font-black text-lg">Couldn&apos;t load the quiz</p>
            <button onClick={endQuiz} className="btn3d bg-duo-green text-white shadow-[0_3px_0_#46a302] px-6 py-2.5 mt-4 font-extrabold">
              Go back
            </button>
          </div>
        </div>
      ) : result ? (
        <QuizResult result={result} onDone={endQuiz} />
      ) : alreadyDone ? (
        <AlreadyDone data={data} onDone={endQuiz} />
      ) : q ? (
        <>
          <main className="flex-1 overflow-y-auto">
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25 }}
              className="max-w-2xl mx-auto w-full px-4 py-6 sm:py-10"
            >
              <span
                className="inline-block text-[11px] font-black uppercase tracking-wide text-white rounded-full px-3 py-1 mb-4"
                style={{ backgroundColor: CATEGORY_COLORS[q.category] ?? "#7C3AED" }}
              >
                {q.category}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black leading-snug mb-6">{q.question}</h2>
              <div className="grid gap-3">
                {q.options.map((opt, i) => {
                  const isSel = selected === i
                  const reveal = phase === "feedback"
                  const isRight = i === q.correctIndex
                  return (
                    <motion.button
                      key={i}
                      whileTap={phase === "answering" ? { scale: 0.97 } : undefined}
                      onClick={() => answer(i)}
                      disabled={reveal}
                      className={`btn3d text-left py-4 px-5 border-2 border-b-4 text-lg font-bold ${
                        reveal
                          ? isRight
                            ? "bg-duo-green/10 border-duo-green text-duo-green-dark"
                            : isSel
                              ? "bg-duo-red/10 border-duo-red text-duo-red animate-shake"
                              : "bg-white border-paper-border text-muted-foreground"
                          : isSel
                            ? "bg-duo-green/10 border-duo-green text-duo-green-dark"
                            : "bg-white border-paper-border hover:bg-secondary"
                      }`}
                      aria-pressed={isSel}
                    >
                      {opt}
                    </motion.button>
                  )
                })}
              </div>
            </motion.div>
          </main>

          {/* feedback footer */}
          <AnimatePresence mode="wait">
            {phase === "feedback" && (
              <motion.footer
                key="fb"
                initial={{ y: 60 }}
                animate={{ y: 0 }}
                exit={{ y: 60 }}
                transition={{ type: "spring", stiffness: 300, damping: 28 }}
                className={`border-t-4 bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))] ${
                  selected === q.correctIndex ? "border-duo-green" : "border-duo-red"
                }`}
              >
                <div className="max-w-2xl mx-auto">
                  <div className="flex items-start gap-3 mb-3">
                    <motion.span
                      initial={{ scale: 0, rotate: -30 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 14 }}
                      className={`w-9 h-9 rounded-full grid place-items-center text-white text-lg font-black shrink-0 ${
                        selected === q.correctIndex ? "bg-duo-green" : "bg-duo-red"
                      }`}
                    >
                      {selected === q.correctIndex ? "✓" : "✕"}
                    </motion.span>
                    <div>
                      <p className={`font-black ${selected === q.correctIndex ? "text-duo-green-dark" : "text-duo-red"}`}>
                        {selected === q.correctIndex ? "Correct!" : "Not quite…"}
                      </p>
                      <p className="text-sm font-semibold text-muted-foreground leading-snug">{q.meaning}</p>
                    </div>
                  </div>
                  <button onClick={next} className="btn3d bg-duo-green text-white shadow-[0_5px_0_#46a302] w-full py-4 text-lg">
                    {idx + 1 >= total ? "SEE RESULTS" : "NEXT QUESTION"}
                  </button>
                </div>
              </motion.footer>
            )}
          </AnimatePresence>
        </>
      ) : null}
    </motion.div>
  )
}

function AlreadyDone({ data, onDone }: { data: DailyQuizPayload; onDone: () => void }) {
  const [left, setLeft] = useState(msUntilNextQuiz())
  useEffect(() => {
    const t = setInterval(() => setLeft(msUntilNextQuiz()), 1000)
    return () => clearInterval(t)
  }, [])
  const pct = data.total > 0 ? Math.round((data.score / data.total) * 100) : 0
  return (
    <div className="flex-1 overflow-y-auto grid place-items-center px-4 py-10">
      <motion.div
        initial={{ scale: 0.92, y: 16, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        className="max-w-md w-full bg-white rounded-3xl border-2 border-paper-border shadow-[0_6px_0_#e8e0c8] p-7 text-center"
      >
        <div className="flex justify-center mb-3">
          <Mascot mood="cheer" size={110} />
        </div>
        <h2 className="text-2xl font-black">Today&apos;s quiz is done! 🌟</h2>
        <p className="font-bold text-muted-foreground mt-1">
          You scored {data.score}/{data.total} ({pct}%) — {pct === 100 ? "a perfect sweep!" : "come back tomorrow for a new set."}
        </p>
        {data.streakOfQuizzes > 1 && (
          <p className="mt-2 font-black text-duo-red">
            🔥 {data.streakOfQuizzes} daily quizzes in a row — keep the flame alive!
          </p>
        )}
        <div className="mt-5 bg-secondary rounded-2xl border-2 border-paper-border p-4 flex items-center justify-center gap-2.5">
          <Sunrise className="w-5 h-5 text-duo-gold" />
          <div>
            <p className="text-[11px] font-black uppercase tracking-wide text-muted-foreground">Next quiz in</p>
            <p className="font-black text-xl tabular-nums">{fmtCountdown(left)}</p>
          </div>
        </div>
        <p className="mt-4 text-sm font-semibold text-muted-foreground">
          While you wait: a lesson, a story, or a Practice Hub review all count toward today&apos;s quests.
        </p>
        <button onClick={onDone} className="btn3d bg-duo-green text-white shadow-[0_5px_0_#46a302] w-full py-4 mt-5 text-lg">
          Keep learning
        </button>
      </motion.div>
    </div>
  )
}

function QuizResult({ result, onDone }: { result: DailyQuizResult; onDone: () => void }) {
  const setShareDraft = useAppStore((s) => s.setShareDraft)
  const setView = useAppStore((s) => s.setView)
  const endQuiz = useAppStore((s) => s.endQuiz)
  const [shownXp, setShownXp] = useState(0)
  const pct = result.total > 0 ? Math.round((result.score / result.total) * 100) : 0

  useEffect(() => {
    let raf = 0
    const start = performance.now()
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / 900)
      setShownXp(Math.round(result.xpEarned * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [result.xpEarned])

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-lg mx-auto px-4 py-8 flex flex-col items-center">
        <motion.div initial={{ scale: 0.5, y: 20 }} animate={{ scale: 1, y: 0 }} transition={{ type: "spring", stiffness: 260, damping: 16 }}>
          <Mascot mood={result.perfect ? "cheer" : "happy"} size={130} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-4xl font-black text-duo-green-dark text-center"
        >
          {result.perfect ? "Perfect run!" : "Quiz complete!"}
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="font-bold text-muted-foreground mb-6 text-center">
          {result.perfect
            ? "All five — you know the Book. ✨"
            : result.score >= result.total - 2
              ? "Strong showing — every miss is a seed for tomorrow."
              : "Every question you met today is one you'll own tomorrow."}
        </motion.p>

        {/* score ring */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="relative w-36 h-36 mb-4"
        >
          <svg viewBox="0 0 120 120" className="w-36 h-36 -rotate-90">
            <circle cx="60" cy="60" r="50" fill="none" stroke="#eee6cd" strokeWidth="14" />
            <motion.circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke={pct === 100 ? "#58CC02" : pct >= 60 ? "#FFC800" : "#FF4B4B"}
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 50}
              initial={{ strokeDashoffset: 2 * Math.PI * 50 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 50 * (1 - pct / 100) }}
              transition={{ duration: 1.1, ease: "easeOut", delay: 0.35 }}
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <div className="text-center">
              <p className="text-3xl font-black">{result.score}/{result.total}</p>
              <p className="text-[11px] font-black uppercase tracking-wide text-muted-foreground">correct</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-3 gap-2.5 w-full mb-4">
          <div className="rounded-2xl bg-duo-gold/10 border-2 border-duo-gold/40 p-3 text-center">
            <Zap className="w-5 h-5 mx-auto text-duo-gold" />
            <p className="font-black text-lg mt-1">+{shownXp}</p>
            <p className="text-[11px] font-black text-muted-foreground uppercase">XP</p>
          </div>
          <div className="rounded-2xl bg-duo-purple/10 border-2 border-duo-purple/40 p-3 text-center">
            <Gem className="w-5 h-5 mx-auto text-duo-purple" />
            <p className="font-black text-lg mt-1">+{result.gemsEarned}</p>
            <p className="text-[11px] font-black text-muted-foreground uppercase">Gems</p>
          </div>
          <div className="rounded-2xl bg-duo-red/10 border-2 border-duo-red/40 p-3 text-center">
            <Flame className="w-5 h-5 mx-auto text-duo-red" />
            <p className="font-black text-lg mt-1">{result.streak}</p>
            <p className="text-[11px] font-black text-muted-foreground uppercase">Day streak</p>
          </div>
        </div>

        {result.streakIncreased && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-sm font-extrabold text-duo-red mb-2"
          >
            🔥 Streak extended — {result.streak} days strong!
          </motion.p>
        )}

        {result.questsCompleted.length > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
            className="text-sm font-extrabold text-duo-green-dark mb-2 flex items-center gap-1.5"
          >
            <Trophy className="w-4 h-4" /> Quest complete: {result.questsCompleted.join(" · ")}
          </motion.p>
        )}
        {result.achievementsUnlocked.map((a, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 + i * 0.1 }}
            className="text-sm font-extrabold text-duo-gold-dark"
          >
            {a.icon} Achievement: {a.title} — {a.tierName}
          </motion.p>
        ))}

        <button
          onClick={() => {
            sfx.tap()
            haptics.tap()
            setShareDraft({
              kind: "quiz",
              title: `Daily Quiz — ${result.score}/${result.total}${result.perfect ? " perfect ✨" : ""}`,
              subtitle: `${result.xpEarned} XP earned on today's Bible knowledge questions`,
              icon: "🧠",
              color: "#7C3AED",
            })
            endQuiz()
            setView("community")
          }}
          className="btn3d bg-duo-purple text-white shadow-[0_5px_0_#7c3aed] w-full py-3.5 mt-4 flex items-center justify-center gap-2 font-black"
        >
          📣 Share to community
        </button>
        <button
          onClick={onDone}
          className="btn3d bg-duo-green text-white shadow-[0_5px_0_#46a302] w-full py-4 text-lg mt-2.5 flex items-center justify-center gap-2 font-black"
        >
          CONTINUE <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
