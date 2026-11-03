"use client"

import { useMemo, useState } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion"
import { X, GraduationCap, ChevronRight, Check, Lock, ArrowRight, Sparkles } from "lucide-react"
import { useAppStore } from "@/lib/client/store"
import { sfx } from "@/lib/client/sound"
import { haptics } from "@/lib/client/haptics"
import type { PlacementPayload, PlacementQuestion, PlacementResult } from "@/lib/types"
import { Mascot } from "./Mascot"
import { useRefreshApp } from "./ScrollApp"

/**
 * Placement test — lets advanced learners test out of units they already know.
 * Sampled SELECT challenges across every unit; ≥70% per unit (sequentially)
 * marks that unit's lessons complete.
 */
export function PlacementOverlay({ courseId }: { courseId: string }) {
  const endPlacement = useAppStore((s) => s.endPlacement)
  const refreshApp = useRefreshApp()

  const { data, isLoading, isError } = useQuery<PlacementPayload>({
    queryKey: ["placement", courseId],
    queryFn: async () => {
      const res = await fetch(`/api/placement/${courseId}`)
      if (!res.ok) throw new Error("failed to load placement test")
      return res.json() as Promise<PlacementPayload>
    },
    staleTime: Infinity,
  })

  const [started, setStarted] = useState(false)
  const [idx, setIdx] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [phase, setPhase] = useState<"answering" | "feedback">("answering")
  const [answers, setAnswers] = useState<{ challengeId: string; optionId: string }[]>([])
  const [result, setResult] = useState<PlacementResult | null>(null)

  const questions: PlacementQuestion[] = data?.questions ?? []
  const q = questions[idx]
  const total = questions.length

  // deterministic shuffle of options so the correct one isn't always first
  const shuffled = useMemo(() => {
    if (!q) return []
    const arr = [...q.options]
    let h = 0
    for (let i = 0; i < q.challengeId.length; i++) h = (h * 33 + q.challengeId.charCodeAt(i)) % 99991
    for (let i = arr.length - 1; i > 0; i--) {
      h = (h * 9301 + 49297) % 233280
      const j = h % (i + 1)
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
  }, [q])

  const submit = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/placement/${courseId}`, {
        method: "POST",
        body: JSON.stringify({ answers }),
      })
      if (!res.ok) throw new Error("submission failed")
      return res.json() as Promise<PlacementResult>
    },
    onSuccess: (r) => {
      setResult(r)
      sfx.fanfare()
      haptics.complete()
      refreshApp()
    },
    onError: () => {
      // graceful fallback so the user is never stuck
      setResult({
        unitsSkipped: 0,
        lessonsCompleted: 0,
        xpEarned: 0,
        totalXp: 0,
        gems: 0,
        streak: 0,
        streakIncreased: false,
        questsCompleted: [],
        achievementsUnlocked: [],
        unitScores: [],
      })
    },
  })

  const answer = (optionId: string) => {
    if (phase === "feedback" || !q) return
    setSelected(optionId)
    setAnswers((a) => [...a, { challengeId: q.challengeId, optionId }])
    const ok = optionId === q.correctOptionId
    if (ok) {
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
    if (idx + 1 >= total) {
      submit.mutate()
      return
    }
    setIdx((i) => i + 1)
  }

  const exit = () => {
    refreshApp()
    endPlacement()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 30 }}
      transition={{ type: "spring", stiffness: 260, damping: 28 }}
      className="fixed inset-0 z-[80] parchment-bg flex flex-col"
      role="dialog"
      aria-label="Placement test"
    >
      {/* header */}
      <header className="flex items-center gap-3 px-4 py-3 border-b-2 border-paper-border bg-white/70 backdrop-blur">
        <button
          onClick={() => {
            sfx.tap()
            exit()
          }}
          className="p-1.5 rounded-xl hover:bg-secondary transition-colors"
          aria-label="Close placement test"
        >
          <X className="w-6 h-6 text-muted-foreground" />
        </button>
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <GraduationCap className="w-6 h-6 text-[#B45309] shrink-0" />
          <div className="min-w-0">
            <p className="font-black leading-tight truncate">Placement Test · {data?.courseTitle ?? "…"}</p>
            <p className="text-[11px] font-bold text-muted-foreground truncate">
              {started && !result ? `Question ${Math.min(idx + 1, total)} of ${total} · Unit: ${q?.unitTitle ?? "—"}` : `Skip ahead if you already know this material`}
            </p>
          </div>
        </div>
        {started && !result && (
          <div className="w-28 h-3 rounded-full bg-[#eee6cd] overflow-hidden shrink-0" role="progressbar" aria-valuenow={idx} aria-valuemin={0} aria-valuemax={total}>
            <motion.div
              className="h-full rounded-full bg-[#B45309]"
              initial={false}
              animate={{ width: `${total ? ((idx + (phase === "feedback" ? 1 : 0)) / total) * 100 : 0}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
            />
          </div>
        )}
      </header>

      {/* body */}
      {isLoading ? (
        <div className="flex-1 grid place-items-center">
          <div className="text-center">
            <motion.div animate={{ rotate: [0, -8, 8, 0] }} transition={{ duration: 1.3, repeat: Infinity }} className="text-6xl">
              🎓
            </motion.div>
            <p className="font-black text-muted-foreground mt-3">Preparing your test…</p>
          </div>
        </div>
      ) : isError || !data || questions.length === 0 ? (
        <div className="flex-1 grid place-items-center p-8 text-center">
          <div>
            <div className="text-5xl mb-3">🕯️</div>
            <p className="font-black text-lg">No placement test available</p>
            <p className="text-muted-foreground font-bold mt-1">This course doesn&apos;t have enough question material yet.</p>
            <button onClick={exit} className="btn3d bg-duo-green text-white shadow-[0_3px_0_#46a302] px-6 py-2.5 mt-4 font-extrabold">
              Go back
            </button>
          </div>
        </div>
      ) : result ? (
        <PlacementResultView result={result} courseEmoji={data.courseEmoji} onDone={exit} />
      ) : !started ? (
        /* intro screen */
        <div className="flex-1 overflow-y-auto grid place-items-center px-4 py-8">
          <motion.div
            initial={{ scale: 0.92, y: 16, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="max-w-md w-full bg-white rounded-3xl border-2 border-paper-border shadow-[0_6px_0_#e8e0c8] p-7 text-center"
          >
            <div className="flex justify-center mb-3">
              <Mascot mood="cheer" size={110} />
            </div>
            <h2 className="text-2xl font-black">Already know some of this?</h2>
            <p className="font-bold text-muted-foreground mt-2 leading-relaxed">
              Take the placement test to skip ahead. You&apos;ll answer <b>{total} questions</b> drawn from every unit of{" "}
              <b>{data.courseTitle}</b>. Score <b>70% or higher</b> on a unit (and the units before it) and those lessons are
              marked complete — with XP for everything you place out of.
            </p>
            <div className="mt-5 text-left bg-secondary rounded-2xl border-2 border-paper-border p-4 space-y-2.5">
              <p className="text-sm font-bold flex items-start gap-2">
                <Check className="w-4 h-4 text-duo-green shrink-0 mt-0.5" /> Wrong answers never cost hearts — this is a
                measurement, not a minefield.
              </p>
              <p className="text-sm font-bold flex items-start gap-2">
                <Check className="w-4 h-4 text-duo-green shrink-0 mt-0.5" /> You can retake the test anytime — new units
                you unlock are kept, progress is never removed.
              </p>
              <p className="text-sm font-bold flex items-start gap-2">
                <Check className="w-4 h-4 text-duo-green shrink-0 mt-0.5" /> Prefer to earn it lesson by lesson? Simply
                close this — the path is patient.
              </p>
            </div>
            <button
              onClick={() => {
                sfx.tap()
                haptics.tap()
                setStarted(true)
              }}
              className="btn3d bg-[#B45309] text-white shadow-[0_5px_0_#92400e] w-full py-4 mt-6 text-lg font-black flex items-center justify-center gap-2"
            >
              START THE TEST <ChevronRight className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
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
              <span className="inline-block text-[11px] font-black uppercase tracking-wide bg-[#B45309]/10 text-[#92400e] rounded-full px-3 py-1 mb-4">
                Unit {q.unitOrder} · {q.unitTitle}
              </span>
              <p className="text-lg font-black mb-4">{q.prompt}</p>
              <div className="bg-white rounded-3xl border-2 border-paper-border shadow-[0_5px_0_#e8e0c8] p-6 sm:p-8 mb-6 text-center">
                <h2 className="glyph font-black leading-tight text-3xl sm:text-4xl">{q.question}</h2>
              </div>
              <div className={`grid gap-3 ${shuffled.some((o) => o.text.length > 20) ? "grid-cols-1" : "grid-cols-2"}`}>
                {shuffled.map((o) => {
                  const isSel = selected === o.id
                  const reveal = phase === "feedback"
                  const isRight = o.id === q.correctOptionId
                  return (
                    <motion.button
                      key={o.id}
                      whileTap={phase === "answering" ? { scale: 0.96 } : undefined}
                      onClick={() => answer(o.id)}
                      disabled={reveal}
                      className={`btn3d py-4 px-4 border-2 border-b-4 min-h-[64px] text-lg font-bold ${
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
                      {o.text}
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
                  selected === q.correctOptionId ? "border-duo-green" : "border-duo-red"
                }`}
              >
                <div className="max-w-2xl mx-auto">
                  <div className="flex items-start gap-3 mb-3">
                    <span
                      className={`w-9 h-9 rounded-full grid place-items-center text-white text-lg font-black shrink-0 ${
                        selected === q.correctOptionId ? "bg-duo-green" : "bg-duo-red"
                      }`}
                    >
                      {selected === q.correctOptionId ? "✓" : "✕"}
                    </span>
                    <div>
                      <p className={`font-black ${selected === q.correctOptionId ? "text-duo-green-dark" : "text-duo-red"}`}>
                        {selected === q.correctOptionId ? "Correct!" : "Not quite…"}
                      </p>
                      {q.meaning && <p className="text-sm font-semibold text-muted-foreground leading-snug">{q.meaning}</p>}
                    </div>
                  </div>
                  <button onClick={next} className="btn3d bg-duo-green text-white shadow-[0_5px_0_#46a302] w-full py-4 text-lg">
                    {idx + 1 >= total ? "SEE MY PLACEMENT" : "NEXT"}
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

function PlacementResultView({
  result,
  courseEmoji,
  onDone,
}: {
  result: PlacementResult
  courseEmoji: string
  onDone: () => void
}) {
  const placedCount = result.unitScores.filter((u) => u.placed).length
  const anyPlaced = placedCount > 0

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-lg mx-auto px-4 py-8 flex flex-col items-center">
        <motion.div initial={{ scale: 0.5, y: 20 }} animate={{ scale: 1, y: 0 }} transition={{ type: "spring", stiffness: 260, damping: 16 }}>
          <Mascot mood={anyPlaced ? "cheer" : "happy"} size={130} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-3xl font-black text-center"
        >
          {anyPlaced ? "You placed ahead!" : "Fresh start recommended"}
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="font-bold text-muted-foreground mb-6 text-center">
          {anyPlaced
            ? `${placedCount} unit${placedCount > 1 ? "s" : ""} complete — ${result.lessonsCompleted} lessons skipped and ${result.xpEarned} XP awarded.`
            : "The path from Unit 1 is the right fit — and that's a fine place to be. Every lesson builds the next."}
        </motion.p>

        {/* per-unit scorecard */}
        <div className="w-full space-y-2 mb-5">
          {result.unitScores.map((u, i) => {
            const pct = u.total > 0 ? Math.round((u.correct / u.total) * 100) : 0
            return (
              <motion.div
                key={u.unitOrder}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.07 }}
                className={`rounded-2xl border-2 p-3 flex items-center gap-3 ${
                  u.placed ? "bg-duo-green/10 border-duo-green/50" : "bg-white border-paper-border"
                }`}
              >
                <span
                  className={`w-9 h-9 rounded-full grid place-items-center text-white shrink-0 ${
                    u.placed ? "bg-duo-green" : "bg-muted-foreground/40"
                  }`}
                >
                  {u.placed ? <Check className="w-5 h-5" strokeWidth={3} /> : <Lock className="w-4 h-4" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-black text-sm truncate">
                    Unit {u.unitOrder} · {u.unitTitle}
                  </p>
                  <div className="mt-1 h-2 rounded-full bg-[#eee6cd] overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${pct >= 70 ? "bg-duo-green" : pct >= 40 ? "bg-duo-gold" : "bg-duo-red"}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: 0.4 + i * 0.07, type: "spring", stiffness: 80, damping: 18 }}
                    />
                  </div>
                </div>
                <span className="font-black text-sm tabular-nums shrink-0">
                  {u.correct}/{u.total}
                </span>
              </motion.div>
            )
          })}
        </div>

        {result.xpEarned > 0 && (
          <div className="flex items-center gap-2 mb-3 font-black text-duo-gold-dark">
            <Sparkles className="w-5 h-5" /> +{result.xpEarned} XP for placed-out lessons
          </div>
        )}
        {result.questsCompleted.length > 0 && (
          <p className="text-sm font-extrabold text-duo-green-dark mb-2">🎯 Quest complete: {result.questsCompleted.join(" · ")}</p>
        )}
        {result.achievementsUnlocked.map((a, i) => (
          <p key={i} className="text-sm font-extrabold text-duo-gold-dark">
            {a.icon} Achievement: {a.title} — {a.tierName}
          </p>
        ))}

        <button
          onClick={onDone}
          className="btn3d bg-duo-green text-white shadow-[0_5px_0_#46a302] w-full py-4 text-lg mt-4 flex items-center justify-center gap-2 font-black"
        >
          {anyPlaced ? "JUMP TO MY LEVEL" : "BACK TO THE PATH"} <ArrowRight className="w-5 h-5" />
        </button>
        <p className="mt-3 text-xs font-bold text-muted-foreground text-center">
          {courseEmoji} Retake anytime from the course path — unlocked progress is never lost.
        </p>
      </div>
    </div>
  )
}
