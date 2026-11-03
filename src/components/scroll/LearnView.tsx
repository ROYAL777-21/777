"use client"

import { useMemo, useRef, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion"
import { BookOpen, Star, Zap, X, Lock, Trophy, Brain, GraduationCap, Check, Sprout, Lightbulb, Sunrise } from "lucide-react"
import { useAppStore } from "@/lib/client/store"
import { sfx } from "@/lib/client/sound"
import { haptics } from "@/lib/client/haptics"
import { fireBrowserNotification } from "@/lib/client/notify"
import type { BootstrapCourse, BootstrapUnit } from "@/lib/types"
import { Mascot } from "./Mascot"
import { useRefreshApp } from "./ScrollApp"

// horizontal offsets create the winding path
const OFFSETS = [0, 46, 72, 46, 0, -46, -72, -46]

export function LearnView({ course }: { course: BootstrapCourse }) {
  const { data: boot } = useQuery<{ user: { dailyXp: number; dailyXpGoal: number; streak: number; image: string; name: string } }>({
    queryKey: ["bootstrap"],
  })
  const goal = boot?.user.dailyXpGoal ?? 50
  const earned = boot?.user.dailyXp ?? 0
  const pct = Math.min(100, Math.round((earned / goal) * 100))

  return (
    <div className="px-3 sm:px-5 pt-5">
      {/* daily goal card */}
      <div className="max-w-2xl mx-auto mb-6">
        <div className="bg-white rounded-2xl border-2 border-paper-border shadow-[0_4px_0_#e8e0c8] p-4 flex items-center gap-4">
          <div className="relative w-14 h-14 shrink-0">
            <svg viewBox="0 0 56 56" className="w-14 h-14 -rotate-90">
              <circle cx="28" cy="28" r="23" fill="none" stroke="#eee6cd" strokeWidth="8" />
              <motion.circle
                cx="28"
                cy="28"
                r="23"
                fill="none"
                stroke="#58CC02"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 23}
                initial={false}
                animate={{ strokeDashoffset: 2 * Math.PI * 23 * (1 - pct / 100) }}
                transition={{ type: "spring", stiffness: 90, damping: 20 }}
              />
            </svg>
            <span className="absolute inset-0 grid place-items-center text-lg font-black">{pct >= 100 ? "🏆" : "⚡"}</span>
          </div>
          <div className="min-w-0">
            <p className="font-black leading-tight">
              {pct >= 100 ? "Daily goal complete — blessed work!" : "Daily goal"}
            </p>
            <p className="text-sm text-muted-foreground font-bold">
              Earn {goal} XP today · {earned}/{goal} so far
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2 bg-duo-gold/15 rounded-full px-3 py-1.5">
            <span className="text-xl animate-flicker">🔥</span>
            <span className="font-black">{boot?.user.streak ?? 0}</span>
          </div>
        </div>
      </div>

      {/* daily quiz + placement cards */}
      <DailyQuizAndPlacementCards courseId={course.id} courseEmoji={course.emoji} />

      {/* path */}
      <div className="max-w-2xl mx-auto pb-10">
        {/* compute unlock state across the whole course: a lesson is unlocked when every lesson before it is completed */}
        {(() => {
          const unlockedByLessonId = new Map<string, boolean>()
          let allPrevDone = true
          for (const u of course.units) {
            for (const l of u.lessons) {
              unlockedByLessonId.set(l.id, l.completed || allPrevDone)
              allPrevDone = allPrevDone && l.completed
            }
          }
          return course.units.map((unit, ui) => (
            <UnitSection
              key={unit.id}
              unit={unit}
              unitIndex={ui}
              isLast={ui === course.units.length - 1}
              courseCode={course.code}
              unlockedByLessonId={unlockedByLessonId}
            />
          ))
        })()}
      </div>
    </div>
  )
}

function UnitSection({
  unit,
  unitIndex,
  isLast,
  courseCode,
  unlockedByLessonId,
}: {
  unit: BootstrapUnit
  unitIndex: number
  isLast: boolean
  courseCode: string
  unlockedByLessonId: Map<string, boolean>
}) {
  const [guideOpen, setGuideOpen] = useState(false)
  const difficulty = unit.difficulty ?? 1
  const diffMeta =
    difficulty >= 3
      ? { label: "⚡ Advanced · timed", bg: "rgba(255,255,255,0.22)" }
      : difficulty === 2
        ? { label: "🔥 Growing", bg: "rgba(255,255,255,0.22)" }
        : { label: "🌱 Foundations", bg: "rgba(255,255,255,0.22)" }

  return (
    <section className="mb-4" aria-label={unit.title}>
      {/* sticky unit header */}
      <div className="sticky top-16 z-20 px-1 py-2 parchment-bg">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl text-white p-4 flex items-center gap-3 shadow-[0_4px_0_rgba(0,0,0,0.18)]"
          style={{ backgroundColor: unit.color }}
        >
          <span className="text-2xl">{unit.emoji}</span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-black uppercase tracking-wider opacity-80">
              Unit {unit.order} · {courseCode === "greek" || courseCode === "hebrew" ? "Language" : "Study"}
            </p>
            <h2 className="font-black text-lg leading-tight truncate">{unit.title}</h2>
          </div>
          <span
            className="hidden sm:inline-block text-[10px] font-black uppercase tracking-wide rounded-full px-2.5 py-1"
            style={{ backgroundColor: diffMeta.bg }}
          >
            {diffMeta.label}
          </span>
          <button
            onClick={() => {
              sfx.tap()
              haptics.tap()
              setGuideOpen(true)
            }}
            className="bg-white/20 hover:bg-white/30 rounded-xl px-3 py-2 flex items-center gap-1.5 text-sm font-extrabold transition-colors"
            aria-label="Open unit guidebook"
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Guidebook</span>
          </button>
        </motion.div>
      </div>

      {/* nodes */}
      <div className="relative pt-4 pb-2">
        {unit.lessons.map((lesson, li) => (
          <PathNode
            key={lesson.id}
            lessonId={lesson.id}
            title={lesson.title}
            order={lesson.order}
            completed={lesson.completed}
            unlocked={unlockedByLessonId.get(lesson.id) ?? false}
            color={unit.color}
            offset={OFFSETS[(unitIndex * 3 + li) % OFFSETS.length]}
          />
        ))}

        {/* chest at unit end */}
        <ChestNode unit={unit} isLastUnit={isLast} offset={OFFSETS[(unitIndex * 3 + unit.lessons.length) % OFFSETS.length]} />
      </div>

      {/* guidebook dialog */}
      <AnimatePresence>
        {guideOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/40 flex items-center justify-center p-4"
            onClick={() => setGuideOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.92, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.92, y: 20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
              className="bg-white rounded-3xl border-2 border-paper-border shadow-[0_6px_0_#e8e0c8] w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-label={`Unit guidebook: ${unit.title}`}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{unit.emoji}</span>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Unit {unit.order}</p>
                  <h3 className="text-xl font-black leading-tight">{unit.title}</h3>
                </div>
              </div>
              <p className="font-semibold text-muted-foreground mb-4">{unit.description}</p>
              {/* growth tips */}
              {unit.tips && (
                <div className="space-y-2 mb-4">
                  <p className="text-xs font-black uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                    <Sprout className="w-4 h-4 text-[#65A30D]" /> How to grow with this unit
                  </p>
                  <div className="bg-duo-green/10 border-2 border-duo-green/30 rounded-xl p-3">
                    <p className="text-xs font-black uppercase tracking-wide text-duo-green-dark mb-0.5 flex items-center gap-1">
                      <Lightbulb className="w-3.5 h-3.5" /> Inside the app
                    </p>
                    <p className="text-sm font-semibold leading-snug">{unit.tips.inApp}</p>
                  </div>
                  <div className="bg-[#0891B2]/10 border-2 border-[#0891B2]/30 rounded-xl p-3">
                    <p className="text-xs font-black uppercase tracking-wide text-[#0E7490] mb-0.5 flex items-center gap-1">
                      <Sunrise className="w-3.5 h-3.5" /> Beyond the app
                    </p>
                    <p className="text-sm font-semibold leading-snug">{unit.tips.outsideApp}</p>
                  </div>
                  <div className="bg-duo-purple/10 border-2 border-duo-purple/30 rounded-xl p-3">
                    <p className="text-xs font-black uppercase tracking-wide text-duo-purple mb-0.5 flex items-center gap-1">
                      <Sprout className="w-3.5 h-3.5" /> Routine that compounds
                    </p>
                    <p className="text-sm font-semibold leading-snug">{unit.tips.routine}</p>
                  </div>
                </div>
              )}
              <div className="space-y-2 mb-4">
                {unit.lessons.map((l, i) => (
                  <div key={l.id} className="flex items-center gap-2.5 bg-secondary rounded-xl px-3 py-2.5">
                    <span className={`w-7 h-7 rounded-full grid place-items-center text-sm font-black text-white ${l.completed ? "bg-duo-green" : "bg-muted-foreground/40"}`}>
                      {l.completed ? "✓" : i + 1}
                    </span>
                    <span className="font-extrabold text-sm">{l.title}</span>
                    {l.completed && <Star className="w-4 h-4 ml-auto text-duo-gold fill-duo-gold" />}
                  </div>
                ))}
              </div>
              <button
                className="btn3d bg-duo-green text-white shadow-[0_4px_0_#46a302] w-full py-3"
                onClick={() => {
                  sfx.tap()
                  setGuideOpen(false)
                }}
              >
                Keep learning
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

function PathNode({
  lessonId,
  title,
  order,
  completed,
  unlocked,
  color,
  offset,
}: {
  lessonId: string
  title: string
  order: number
  completed: boolean
  unlocked: boolean
  color: string
  offset: number
}) {
  const startLesson = useAppStore((s) => s.startLesson)
  const [introOpen, setIntroOpen] = useState(false)

  const isCurrent = unlocked && !completed

  return (
    <div className="flex flex-col items-center" style={{ minHeight: 92 }}>
      <div style={{ transform: `translateX(${offset}px)` }} className="relative">
        {/* connector dots */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex gap-1.5" aria-hidden>
          <span className="path-dot" />
          <span className="path-dot" />
        </div>

        <motion.button
          whileHover={unlocked ? { scale: 1.06 } : undefined}
          whileTap={unlocked ? { scale: 0.94 } : undefined}
          onClick={() => {
            if (!unlocked) {
              sfx.wrong()
              haptics.wrong()
              return
            }
            sfx.tap()
            haptics.tap()
            setIntroOpen(true)
          }}
          className={`relative w-[76px] h-[76px] rounded-full grid place-items-center border-b-[6px] transition-colors ${
            completed
              ? "bg-duo-green border-[#46a302] text-white"
              : unlocked
                ? "text-white"
                : "bg-[#e5dfcc] border-[#cfc7ad] text-[#b3ac93]"
          } ${isCurrent ? "pulse-ring" : ""}`}
          style={
            unlocked && !completed
              ? { backgroundColor: color, borderColor: shadeColor(color, -30), color: "#fff" }
              : undefined
          }
          aria-label={`${title} — ${completed ? "completed" : unlocked ? "start lesson" : "locked"}`}
        >
          {completed ? (
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 15 }}>
              <svg viewBox="0 0 24 24" className="w-9 h-9" fill="none" stroke="currentColor" strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12.5l5 5L20 6.5" />
              </svg>
            </motion.span>
          ) : unlocked ? (
            <span className="text-2xl font-black">{order}</span>
          ) : (
            <Lock className="w-8 h-8" />
          )}
        </motion.button>

        {/* START tooltip on current node */}
        {isCurrent && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="absolute -top-11 left-1/2 -translate-x-1/2 z-10 animate-bob"
          >
            <div className="bg-white border-2 border-paper-border rounded-xl px-3 py-1.5 text-sm font-black text-duo-green-dark whitespace-nowrap shadow-[0_3px_0_#e8e0c8] flex items-center gap-1.5">
              <Zap className="w-4 h-4" /> START
            </div>
            <div className="w-3 h-3 bg-white border-r-2 border-b-2 border-paper-border rotate-45 mx-auto -mt-1.5" />
          </motion.div>
        )}
      </div>

      {/* lesson intro modal */}
      <AnimatePresence>
        {introOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/40 flex items-center justify-center p-4"
            onClick={() => setIntroOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 24, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 24, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 24 }}
              className="bg-white rounded-3xl border-2 border-paper-border shadow-[0_6px_0_#e8e0c8] w-full max-w-md p-6 text-center"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-label={`Lesson: ${title}`}
            >
              <div className="flex justify-center mb-2">
                <Mascot mood="cheer" size={86} />
              </div>
              <h3 className="text-2xl font-black mb-1">{title}</h3>
              <p className="font-bold text-muted-foreground mb-5">
                {completed ? "Review this lesson for +5 XP — repetition is the mother of learning." : "Ready to grow? Let's open the scroll."}
              </p>
              <div className="flex items-center justify-center gap-4 mb-5 text-sm font-black">
                <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-duo-gold" /> {completed ? "5–25" : "15–35"} XP</span>
                <span className="flex items-center gap-1.5"><Star className="w-4 h-4 text-duo-purple" /> Perfect +5</span>
              </div>
              <button
                className="btn3d bg-duo-green text-white shadow-[0_5px_0_#46a302] w-full py-4 text-lg flex items-center justify-center gap-2"
                onClick={() => {
                  setIntroOpen(false)
                  startLesson(lessonId, title)
                }}
              >
                <Zap className="w-5 h-5" /> START LESSON
              </button>
              <button
                className="mt-2 py-2 font-extrabold text-muted-foreground hover:text-foreground"
                onClick={() => {
                  sfx.tap()
                  setIntroOpen(false)
                }}
              >
                Not now
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ChestNode({ unit, isLastUnit, offset }: { unit: BootstrapUnit; isLastUnit: boolean; offset: number }) {
  const qc = useQueryClient()
  const refreshApp = useRefreshApp()
  const pushToast = useAppStore((s) => s.pushToast)
  const [open, setOpen] = useState(false)
  const unitComplete = unit.lessons.every((l) => l.completed)

  const claim = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/chests", { method: "POST", body: JSON.stringify({ unitId: unit.id }) })
      const body = (await res.json()) as { reward?: number; error?: string }
      if (!res.ok) throw new Error(body.error ?? "failed")
      return body as { reward: number; gems: number }
    },
    onSuccess: (d) => {
      sfx.chest()
      haptics.complete()
      pushToast("Chest opened! 💎", `+${d.reward} gems added to your wallet.`, "🎁")
      fireBrowserNotification({ title: "Chest opened! 💎", body: `+${d.reward} gems!`, icon: "🎁" })
      refreshApp()
      void qc.invalidateQueries({ queryKey: ["bootstrap"] })
      setOpen(true)
      setTimeout(() => setOpen(false), 2600)
    },
    onError: () => {
      sfx.wrong()
      haptics.wrong()
    },
  })

  if (isLastUnit) {
    // trophy at course end
    return (
      <div className="flex flex-col items-center pt-8 pb-4">
        <motion.div
          animate={unitComplete ? { rotate: [0, -6, 6, 0], scale: [1, 1.08, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
          className="relative"
        >
          <Trophy className={`w-16 h-16 ${unitComplete ? "text-duo-gold fill-duo-gold" : "text-[#d8d0b5]"}`} />
          {unitComplete && <span className="absolute -top-2 -right-3 text-2xl animate-flicker">✨</span>}
        </motion.div>
        <p className={`mt-2 font-black ${unitComplete ? "text-duo-gold-dark" : "text-muted-foreground"}`}>
          {unitComplete ? "Course section complete!" : "Finish the unit to claim the trophy"}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center pt-3" style={{ minHeight: 92 }}>
      <div style={{ transform: `translateX(${offset}px)` }} className="relative">
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex gap-1.5" aria-hidden>
          <span className="path-dot" />
          <span className="path-dot" />
        </div>
        <motion.button
          whileHover={unitComplete && !unit.chestClaimed ? { scale: 1.08, rotate: [0, -4, 4, 0] } : undefined}
          whileTap={unitComplete && !unit.chestClaimed ? { scale: 0.94 } : undefined}
          onClick={() => {
            if (!unitComplete) {
              sfx.wrong()
              haptics.wrong()
              return
            }
            if (!unit.chestClaimed) claim.mutate()
          }}
          disabled={claim.isPending}
          className={`w-[76px] h-[76px] rounded-2xl grid place-items-center border-b-[6px] text-4xl ${
            unit.chestClaimed || open
              ? "bg-[#e5dfcc] border-[#cfc7ad]"
              : unitComplete
                ? "bg-duo-gold border-[#d9a400] animate-bob"
                : "bg-[#e5dfcc] border-[#cfc7ad] opacity-70"
          }`}
          aria-label={unit.chestClaimed ? "Chest claimed" : unitComplete ? "Open chest for gems" : "Chest locked"}
        >
          <motion.span animate={open ? { scale: [1, 1.4, 1], rotate: [0, 12, -12, 0] } : {}}>
            {unit.chestClaimed && !open ? "📭" : open ? "💎" : "🎁"}
          </motion.span>
        </motion.button>
        {unitComplete && !unit.chestClaimed && (
          <span className="absolute -top-9 left-1/2 -translate-x-1/2 bg-white border-2 border-duo-gold rounded-full px-2.5 py-0.5 text-xs font-black text-duo-gold-dark whitespace-nowrap shadow-[0_3px_0_#e8e0c8]">
            +30 💎
          </span>
        )}
      </div>
    </div>
  )
}

/** darken a hex color by percent */
export function shadeColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace("#", ""), 16)
  const amt = Math.round(2.55 * percent)
  const R = Math.max(0, Math.min(255, (num >> 16) + amt))
  const G = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + amt))
  const B = Math.max(0, Math.min(255, (num & 0xff) + amt))
  return `#${((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1)}`
}

// ═══════════════════════════════════════════════════════════════
//  Daily Quiz + Placement test entry cards
// ═══════════════════════════════════════════════════════════════

function DailyQuizAndPlacementCards({ courseId, courseEmoji }: { courseId: string; courseEmoji: string }) {
  const startQuiz = useAppStore((s) => s.startQuiz)
  const startPlacement = useAppStore((s) => s.startPlacement)

  const { data: quiz } = useQuery<{ completed: boolean; score: number; total: number; streakOfQuizzes: number }>({
    queryKey: ["daily-quiz"],
    queryFn: async () => {
      const res = await fetch("/api/daily-quiz")
      if (!res.ok) throw new Error("failed")
      return res.json()
    },
    staleTime: 60_000,
  })

  return (
    <div className="max-w-2xl mx-auto mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
      {/* daily quiz */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => {
          sfx.tap()
          haptics.tap()
          startQuiz()
        }}
        className={`text-left rounded-2xl border-2 border-b-4 p-4 flex items-center gap-3.5 transition-colors ${
          quiz?.completed
            ? "bg-white border-paper-border"
            : "bg-[#7C3AED] border-[#5B21B6] text-white shadow-[0_4px_0_#5B21B6] hover:bg-[#6D28D9]"
        }`}
        aria-label="Open the Daily Bible Quiz"
      >
        <span
          className={`w-12 h-12 rounded-2xl grid place-items-center shrink-0 border-b-4 ${
            quiz?.completed ? "bg-duo-green/15 border-duo-green/40 text-duo-green-dark" : "bg-white/20 border-white/30 text-white"
          }`}
        >
          {quiz?.completed ? <Check className="w-6 h-6" strokeWidth={3} /> : <Brain className="w-6 h-6" />}
        </span>
        <div className="min-w-0 flex-1">
          <p className={`font-black leading-tight ${quiz?.completed ? "" : "text-white"}`}>
            {quiz?.completed ? "Quiz done today! 🌟" : "Daily Bible Quiz"}
          </p>
          <p className={`text-xs font-bold leading-snug mt-0.5 ${quiz?.completed ? "text-muted-foreground" : "text-white/85"}`}>
            {quiz?.completed
              ? `Scored ${quiz.score}/${quiz.total} — new set in the morning${quiz.streakOfQuizzes > 1 ? ` · 🔥 ${quiz.streakOfQuizzes}-day quiz streak` : ""}`
              : "5 fresh questions on the Book · up to 29 XP"}
          </p>
        </div>
        {!quiz?.completed && (
          <span className="shrink-0 bg-white text-[#5B21B6] text-xs font-black rounded-xl px-2.5 py-1.5 whitespace-nowrap animate-pulse">
            NEW
          </span>
        )}
      </motion.button>

      {/* placement test */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => {
          sfx.tap()
          haptics.tap()
          startPlacement(courseId)
        }}
        className="text-left rounded-2xl border-2 border-b-4 border-paper-border bg-white p-4 flex items-center gap-3.5 hover:bg-secondary transition-colors shadow-[0_4px_0_#e8e0c8]"
        aria-label="Take the placement test to skip ahead"
      >
        <span className="w-12 h-12 rounded-2xl grid place-items-center shrink-0 border-b-4 bg-[#B45309]/10 border-[#B45309]/40 text-[#92400E]">
          <GraduationCap className="w-6 h-6" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-black leading-tight">Placement test</p>
          <p className="text-xs font-bold text-muted-foreground leading-snug mt-0.5">
            Already know this {courseEmoji} material? Score 70%+ per unit and skip ahead with XP.
          </p>
        </div>
      </motion.button>
    </div>
  )
}
