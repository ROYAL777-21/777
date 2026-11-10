"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion"
import { BookOpen, Star, Zap, X, Lock, Trophy, Brain, GraduationCap, Check, Sprout, Lightbulb, Sunrise } from "lucide-react"
import { useAppStore } from "@/lib/client/store"
import { sfx } from "@/lib/client/sound"
import { haptics } from "@/lib/client/haptics"
import { fireBrowserNotification } from "@/lib/client/notify"
import { spring, isMotionReduced } from "@/lib/motion"
import { burst } from "@/lib/motion/confetti"
import type { BootstrapCourse, BootstrapUnit, MannaCollectResult } from "@/lib/types"
import { pathVerseOfTheDay, streakMilestone } from "@/lib/scripture"
import { Mascot } from "./Mascot"
import { FootprintShape } from "./footprint"
import { useRefreshApp } from "./ScrollApp"

// horizontal offsets create the winding path
const OFFSETS = [0, 46, 72, 46, 0, -46, -72, -46]

export function LearnView({ course }: { course: BootstrapCourse }) {
  const { data: boot } = useQuery<{
    user: {
      dailyXp: number
      dailyXpGoal: number
      streak: number
      image: string
      name: string
      lastActiveDay: string | null
      manna: { day: string; collected: boolean; mannaStreak: number; verse: { text: string; ref: string } }
    }
  }>({
    queryKey: ["bootstrap"],
  })
  const goal = boot?.user.dailyXpGoal ?? 50
  const earned = boot?.user.dailyXp ?? 0
  const pct = Math.min(100, Math.round((earned / goal) * 100))

  return (
    <div className="px-3 sm:px-5 pt-5">
      {/* v11.5 — Papy greets you on the path: contextual (time, streak,\n          goal, manna), never generic. The mascot is the emotional anchor. */}
      <PapyGreeting
        name={boot?.user.name ?? "Scribe"}
        streak={boot?.user.streak ?? 0}
        streakAtRisk={!!boot?.user.lastActiveDay && boot.user.lastActiveDay !== todayKeyLocal() && (boot?.user.streak ?? 0) > 0}
        goalDone={pct >= 100}
        mannaWaiting={!!boot?.user.manna && !boot.user.manna.collected}
      />

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

      {/* v11.5 — Today's Manna: the daily clock on the path itself.
          A fresh verse-portion every local midnight; one tap to gather,
          +5 XP, its own gentle streak. Never punishes — only counts mornings. */}
      <MannaCard manna={boot?.user.manna ?? null} />

      {/* the day's path verse — one quiet line, exact KJV, new tomorrow (v9).
          On a streak-milestone day, the streak's own verse takes the slot. */}
      {(() => {
        const m = streakMilestone(boot?.user.streak ?? 0)
        const v = m ?? pathVerseOfTheDay()
        return (
          <p className="max-w-2xl mx-auto text-center text-[11px] font-bold text-muted-foreground/90 mb-6 -mt-3 px-6">
            {m && <span className="text-duo-green-dark">{m.title} · </span>}“{v.text}” — {v.ref}
          </p>
        )
      })()}

      {/* difficulty ramp — every unit gets a little harder */}
      <DifficultyRamp units={course.units} />

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

// ─────────────────────────────────────────────────────────────
//  v11.5 — Papy's contextual greeting + Today's Manna card
// ─────────────────────────────────────────────────────────────

/** local YYYY-MM-DD (the streak day-boundary is the user's wall clock) */
function todayKeyLocal(d = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

/** Papy greets you where you actually are: time of day, streak at risk,
 *  goal done, manna waiting. One short line — never generic, never pushy. */
function PapyGreeting({
  name,
  streak,
  streakAtRisk,
  goalDone,
  mannaWaiting,
}: {
  name: string
  streak: number
  streakAtRisk: boolean
  goalDone: boolean
  mannaWaiting: boolean
}) {
  const hour = new Date().getHours()
  const partOfDay = hour < 5 ? "night" : hour < 12 ? "morning" : hour < 17 ? "afternoon" : hour < 21 ? "evening" : "night"

  // context beats clock: the greeting answers the learner's real moment
  const line = goalDone
    ? `The day's portion is gathered, ${name}. Well done!`
    : streakAtRisk
      ? `Your ${streak}-day streak rests on one lesson today, ${name}.`
      : mannaWaiting
        ? "Fresh manna fell this morning — gather it below."
        : partOfDay === "morning"
          ? `Good morning, ${name}. The path is swept and waiting.`
          : partOfDay === "afternoon"
            ? `Good afternoon, scholar. The scroll kept your place.`
            : partOfDay === "evening"
              ? `Good evening, ${name}. A quiet hour is a gift.`
              : `Still burning the midnight oil, ${name}? The lamp holds.`

  const mood = goalDone ? "cheer" : partOfDay === "night" ? "sleep" : "happy"

  return (
    <div className="max-w-2xl mx-auto mb-4 flex items-end gap-3 select-none" aria-live="polite">
      <motion.div
        initial={{ scale: 0.6, opacity: 0, y: 8 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ ...spring.soft, delay: 0.1 }}
        className="shrink-0"
      >
        <Mascot mood={mood} size={72} />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ ...spring.soft, delay: 0.25 }}
        className="relative bg-white border-2 border-paper-border rounded-2xl rounded-bl-sm shadow-[0_4px_0_#e8e0c8] px-4 py-2.5 mb-2 min-w-0"
      >
        <p className="text-sm font-extrabold leading-snug">{line}</p>
      </motion.div>
    </div>
  )
}

/** Today's Manna — the daily clock. A verse-portion lands every local
 *  midnight; one tap gathers it (+5 XP). Manna never kept overnight. */
function MannaCard({ manna }: { manna: { day: string; collected: boolean; mannaStreak: number; verse: { text: string; ref: string } } | null }) {
  const qc = useQueryClient()
  const refreshApp = useRefreshApp()
  const pushToast = useAppStore((s) => s.pushToast)
  const [justGot, setJustGot] = useState(false)

  const gather = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/manna", { method: "POST" })
      const body = (await res.json()) as MannaCollectResult
      if (!res.ok || !body.ok) throw new Error("already gathered")
      return body
    },
    onSuccess: (d) => {
      sfx.chest()
      haptics.complete()
      burst({ y: 0.4 }, 60)
      setJustGot(true)
      pushToast(`Manna gathered — +${d.xpEarned} XP`, `${d.mannaStreak} morning${d.mannaStreak === 1 ? "" : "s"} in a row. "Give us this day our daily bread."`, "🌾")
      refreshApp()
      void qc.invalidateQueries({ queryKey: ["bootstrap"] })
    },
    onError: () => {
      // already collected today — softly sync the UI
      void qc.invalidateQueries({ queryKey: ["bootstrap"] })
    },
  })

  if (!manna || !manna.verse) return null
  const collected = manna.collected || justGot

  return (
    <div className="max-w-2xl mx-auto mb-5">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring.soft, delay: 0.2 }}
        className={`rounded-2xl border-2 p-4 shadow-[0_4px_0_#e8e0c8] ${
          collected ? "bg-duo-green/10 border-duo-green/40" : "bg-white border-duo-gold/70"
        }`}
      >
        <div className="flex items-center gap-3 mb-2.5">
          <motion.span
            className="text-2xl"
            animate={collected ? { rotate: [0, -8, 8, 0], scale: [1, 1.15, 1] } : { y: [0, -3, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          >
            🌾
          </motion.span>
          <div className="min-w-0 flex-1">
            <p className="font-black text-sm leading-tight">
              Today's Manna
              {manna.mannaStreak > 0 && (
                <span className="text-muted-foreground font-extrabold"> · {manna.mannaStreak} morning{manna.mannaStreak === 1 ? "" : "s"} running</span>
              )}
            </p>
            <p className="text-[11px] font-bold text-muted-foreground">
              {collected ? "Gathered. Mercies were new this morning." : "A fresh portion — one tap to gather, gone at midnight."}
            </p>
          </div>
          {!collected && (
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.95 }}
              disabled={gather.isPending}
              onClick={() => {
                sfx.tap()
                haptics.light()
                gather.mutate()
              }}
              className="btn3d bg-duo-gold text-[#5c4500] shadow-[0_4px_0_#d9a400] px-4 py-2 text-sm font-black shrink-0 disabled:opacity-50"
            >
              {gather.isPending ? "Gathering…" : "Gather · +5 XP"}
            </motion.button>
          )}
        </div>
        <blockquote className="text-[13px] font-bold leading-relaxed text-ink/90 border-l-4 border-duo-gold/60 pl-3">
          “{manna.verse.text}”
          <span className="block text-[11px] font-black text-muted-foreground mt-0.5 not-italic">{manna.verse.ref} (KJV)</span>
        </blockquote>
      </motion.div>
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
      <div className="sticky top-14 sm:top-16 z-20 px-1 py-2 parchment-bg">
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
            className="text-[10px] font-black uppercase tracking-wide rounded-full px-2 py-0.5 sm:px-2.5 sm:py-1 shrink-0"
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

      {/* nodes — the trail behind them connects every dot (v9) */}
      <div className="relative pt-4 pb-2">
        <PathTrail unit={unit} unitIndex={unitIndex} isLastUnit={isLast} />
        {unit.lessons.map((lesson, li) => (
          <PathNode
            key={lesson.id}
            lessonId={lesson.id}
            title={lesson.title}
            order={lesson.order}
            completed={lesson.completed}
            unlocked={unlockedByLessonId.get(lesson.id) ?? false}
            color={unit.color}
            difficulty={unit.difficulty ?? 1}
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

// ═══════════════════════════════════════════════════════════════
//  PathTrail (v9) — the winding line that connects the lessons.
//  A smooth Bézier snake drawn behind the nodes: solid in the unit
//  color up to the current lesson (the road walked), then a trail
//  of footprints continuing to the chest/trophy (the road ahead) —
//  "Thy word is a lamp unto my feet", made literal.
// ═══════════════════════════════════════════════════════════════

/** vertical rhythm shared with PathNode/ChestNode rows (see below) */
const ROW = 92 // minHeight of each node row
const TOP_PAD = 16 // pt-4 on the nodes container
const LESSON_CY = 38 // half of the 76px node button (top of row)
const CHEST_CY = 50 // pt-3 (12) + half of 76px
const TROPHY_CY = 64 // pt-8 (32) + half of the 64px trophy

function PathTrail({
  unit,
  unitIndex,
  isLastUnit,
}: {
  unit: BootstrapUnit
  unitIndex: number
  isLastUnit: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [w, setW] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width
      if (width) setW(width)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // the stops: every lesson node + the unit's chest (or trophy)
  const L = unit.lessons.length
  const stops: { x: number; y: number }[] = unit.lessons.map((_, i) => ({
    x: OFFSETS[(unitIndex * 3 + i) % OFFSETS.length],
    y: TOP_PAD + LESSON_CY + ROW * i,
  }))
  stops.push(
    isLastUnit
      ? { x: 0, y: TOP_PAD + ROW * L + TROPHY_CY } // trophy sits centered
      : { x: OFFSETS[(unitIndex * 3 + L) % OFFSETS.length], y: TOP_PAD + ROW * L + CHEST_CY },
  )

  // how far the solid trail reaches: through the current (first
  // uncompleted) node; all-complete reaches the chest/trophy
  const done = unit.lessons.filter((l) => l.completed).length
  const solidTo = Math.min(done, stops.length - 1)

  if (w === 0) return <div ref={ref} className="absolute inset-0 pointer-events-none" aria-hidden />

  const pts = stops.map((p) => ({ x: w / 2 + p.x, y: p.y }))
  const seg = (from: number, to: number) => {
    let d = `M ${pts[from].x} ${pts[from].y}`
    for (let i = from; i < to; i++) {
      const a = pts[i]
      const b = pts[i + 1]
      const dy = (b.y - a.y) / 2
      // vertical control points → smooth S-curves like the real path
      d += ` C ${a.x} ${a.y + dy}, ${b.x} ${b.y - dy}, ${b.x} ${b.y}`
    }
    return d
  }
  const last = pts.length - 1
  const height = Math.max(...pts.map((p) => p.y)) + 48

  // the road ahead — walked, not dotted (v9: "feet marks"). Sample the
  // same Bézier the ribbon follows and lay alternating footprints along
  // it, toes pointing toward the next lesson, gait stepping off the
  // centre line. Two prints per segment, big enough to read as feet.
  // Deterministic jitter — no hydration surprises.
  const steps: { x: number; y: number; rotate: number; mirror: boolean; lead: boolean }[] = []
  for (let i = solidTo, k = 0; i < last; i++) {
    const a = pts[i]
    const b = pts[i + 1]
    const c1 = { x: a.x, y: a.y + (b.y - a.y) / 2 }
    const c2 = { x: b.x, y: b.y - (b.y - a.y) / 2 }
    for (let j = 1; j <= 2; j++) {
      const t = j / 3
      const mt = 1 - t
      const x = mt * mt * mt * a.x + 3 * mt * mt * t * c1.x + 3 * mt * t * t * c2.x + t * t * t * b.x
      const y = mt * mt * mt * a.y + 3 * mt * mt * t * c1.y + 3 * mt * t * t * c2.y + t * t * t * b.y
      const dx = 3 * mt * mt * (c1.x - a.x) + 6 * mt * t * (c2.x - c1.x) + 3 * t * t * (b.x - c2.x)
      const dy = 3 * mt * mt * (c1.y - a.y) + 6 * mt * t * (c2.y - c1.y) + 3 * t * t * (b.y - c2.y)
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI + 90 // toes along travel
      const len = Math.hypot(dx, dy) || 1
      const px = dy / len
      const py = -dx / len
      const side = k % 2 === 0 ? 1 : -1
      const jitter = ((i * 31 + j * 17) % 7) - 3
      steps.push({
        x: x + px * 8 * side + jitter * 0.5,
        y: y + py * 8 * side,
        rotate: angle + jitter,
        mirror: k % 2 === 0,
        lead: false,
      })
      k++
    }
  }
  if (steps.length > 0) steps[0].lead = true // the next step — a soft call forward

  return (
    <div ref={ref} className="absolute inset-0 pointer-events-none" aria-hidden>
      <svg width={w} height={height} className="absolute left-0 top-0" role="presentation">
        {/* the road ahead — footprints marching to the next lesson (v9).
            One shade quieter than the walked ribbon, a shade louder
            than the old dots — quiet, but unmistakably feet. */}
        {steps.map((s, idx) => (
          <FootprintShape key={idx} {...s} fill="#c9c0a4" scale={1.02} />
        ))}
        {/* the road walked — one solid ribbon in the unit color */}
        {solidTo > 0 && (
          <path
            d={seg(0, solidTo)}
            fill="none"
            stroke={unit.color}
            strokeWidth={10}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
    </div>
  )
}

function PathNode({
  lessonId,
  title,
  order,
  completed,
  unlocked,
  color,
  difficulty,
  offset,
}: {
  lessonId: string
  title: string
  order: number
  completed: boolean
  unlocked: boolean
  color: string
  difficulty: number
  offset: number
}) {
  const startLesson = useAppStore((s) => s.startLesson)
  const [introOpen, setIntroOpen] = useState(false)

  const isCurrent = unlocked && !completed

  return (
    <div className="flex flex-col items-center" style={{ minHeight: ROW }}>
      <div style={{ transform: `translateX(${offset}px)` }} className="relative">
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 26 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "-36px" }}
          transition={{ ...spring.juice, delay: Math.min(0.3, (order % 5) * 0.05) }}
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
              <p className="font-bold text-muted-foreground mb-3">
                {completed ? "Review this lesson for +5 XP — repetition is the mother of learning." : "Ready to grow? Let's open the scroll."}
              </p>
              <DifficultyChip difficulty={difficulty} className="mb-4" />
              <div className="flex items-center justify-center gap-4 mb-5 text-sm font-black">
                <span className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-duo-gold" /> {completed ? "5–25" : `${10 + difficulty * 5}–${15 + difficulty * 10}`} XP
                </span>
                <span className="flex items-center gap-1.5"><Star className="w-4 h-4 text-duo-purple" /> Perfect +5</span>
                {difficulty >= 3 && <span className="flex items-center gap-1.5">⏱️ Timed</span>}
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

  // ── v11.5 — the tap-and-hold reveal ritual ──
  // Anticipation is the reward amplifier (variable-reward research: the
  // 5-10s build-up before a reveal multiplies its felt value). Hold ~0.65s:
  // the chest shakes harder, a ring fills, then it bursts.
  // Reduced motion / repeat users skip straight to the open.
  const HOLD_MS = 650
  const [holdPct, setHoldPct] = useState(0)
  const [hint, setHint] = useState(false)
  const rafRef = useRef(0)
  const startRef = useRef(0)
  const firedRef = useRef(false)
  const lastTickRef = useRef(0)

  const stopLoop = () => {
    cancelAnimationFrame(rafRef.current)
    rafRef.current = 0
  }
  useEffect(() => stopLoop, [])

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
      burst({ y: 0.55 }, 80)
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

  const startHold = () => {
    if (!unitComplete) {
      sfx.wrong()
      haptics.wrong()
      return
    }
    if (unit.chestClaimed || claim.isPending || rafRef.current) return
    setHint(false)
    // reduced motion: no ritual, straight to the reveal
    if (isMotionReduced()) {
      claim.mutate()
      return
    }
    firedRef.current = false
    startRef.current = performance.now()
    lastTickRef.current = 0
    const tick = (t: number) => {
      const p = Math.min(1, (t - startRef.current) / HOLD_MS)
      setHoldPct(p)
      // rising haptic/sfx ticks at each quarter — the wind-up
      const quarter = Math.floor(p * 4)
      if (quarter > lastTickRef.current && quarter < 4) {
        lastTickRef.current = quarter
        haptics.light()
        sfx.tap()
      }
      if (p >= 1) {
        rafRef.current = 0
        if (!firedRef.current) {
          firedRef.current = true
          setHoldPct(0)
          claim.mutate()
        }
        return
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
  }

  const cancelHold = () => {
    if (!rafRef.current) return
    stopLoop()
    setHoldPct((p) => {
      if (p > 0.05 && p < 1) setHint(true) // released early — teach the ritual
      return 0
    })
  }

  useEffect(() => {
    if (!hint) return
    const id = setTimeout(() => setHint(false), 1800)
    return () => clearTimeout(id)
  }, [hint])

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
    <div className="flex flex-col items-center pt-3" style={{ minHeight: ROW }}>
      <div style={{ transform: `translateX(${offset}px)` }} className="relative">
        {/* v11.5 — hold-to-open ring: fills over the 0.65s hold */}
        {holdPct > 0 && (
          <svg viewBox="0 0 88 88" className="absolute -top-[6px] -left-[6px] w-[88px] h-[88px] -rotate-90 pointer-events-none z-10">
            <circle cx="44" cy="44" r="40" fill="none" stroke="#FFC800" strokeWidth="5" strokeLinecap="round" strokeDasharray={2 * Math.PI * 40} strokeDashoffset={2 * Math.PI * 40 * (1 - holdPct)} />
          </svg>
        )}
        <motion.button
          whileHover={unitComplete && !unit.chestClaimed ? { scale: 1.08, rotate: [0, -4, 4, 0] } : undefined}
          animate={{
            scale: holdPct > 0 ? 1 + holdPct * 0.12 : 1,
            rotate: holdPct > 0 ? Math.sin(holdPct * 34) * holdPct * 8 : 0,
          }}
          transition={holdPct > 0 ? { duration: 0.05 } : { type: "spring", stiffness: 300, damping: 16 }}
          onPointerDown={(e) => {
            e.preventDefault()
            startHold()
          }}
          onPointerUp={cancelHold}
          onPointerLeave={cancelHold}
          onPointerCancel={cancelHold}
          onKeyDown={(e) => {
            if ((e.key === "Enter" || e.key === " ") && !e.repeat) {
              e.preventDefault()
              startHold()
            }
          }}
          onKeyUp={(e) => {
            if (e.key === "Enter" || e.key === " ") cancelHold()
          }}
          disabled={claim.isPending}
          className={`w-[76px] h-[76px] rounded-2xl grid place-items-center border-b-[6px] text-4xl touch-none select-none ${
            unit.chestClaimed || open
              ? "bg-[#e5dfcc] border-[#cfc7ad]"
              : unitComplete
                ? "bg-duo-gold border-[#d9a400] animate-bob"
                : "bg-[#e5dfcc] border-[#cfc7ad] opacity-70"
          }`}
          aria-label={
            unit.chestClaimed
              ? "Chest claimed"
              : unitComplete
                ? "Hold to open the chest for gems"
                : "Chest locked — finish the unit's lessons first"
          }
        >
          <motion.span animate={open ? { scale: [1, 1.4, 1], rotate: [0, 12, -12, 0] } : {}}>
            {unit.chestClaimed && !open ? "📭" : open ? "💎" : holdPct > 0.66 ? "😮" : "🎁"}
          </motion.span>
        </motion.button>
        {(unitComplete && !unit.chestClaimed) || hint ? (
          <motion.span
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -top-9 left-1/2 -translate-x-1/2 bg-white border-2 rounded-full px-2.5 py-0.5 text-xs font-black whitespace-nowrap shadow-[0_3px_0_#e8e0c8] pointer-events-none"
            style={hint ? { borderColor: "#58CC02", color: "#467302" } : { borderColor: "#FFC800", color: "#8a6d00" }}
          >
            {hint ? "Hold to open ⏳" : "+30 💎 · hold to open"}
          </motion.span>
        ) : null}
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
//  Progressive difficulty: ramp indicator + chips
// ═══════════════════════════════════════════════════════════════

const DIFF_COLORS = ["#58A700", "#D97706", "#7C3AED"]
const DIFF_LABELS = ["🌱 Foundations", "🔥 Growing", "⚡ Advanced"]

/** strip under the daily goal card showing how the course ramps up */
function DifficultyRamp({ units }: { units: BootstrapUnit[] }) {
  if (units.length < 2) return null
  const currentIdx = units.findIndex((u) => u.lessons.some((l) => !l.completed))
  return (
    <div className="max-w-2xl mx-auto mb-5">
      <div className="bg-white rounded-2xl border-2 border-paper-border shadow-[0_4px_0_#e8e0c8] px-4 py-3">
        <div className="flex items-center justify-between gap-2 mb-2">
          <p className="text-xs font-black uppercase tracking-wide text-muted-foreground">The path gets harder as you grow</p>
          <p className="text-[11px] font-black text-muted-foreground hidden sm:block">
            {DIFF_LABELS[0]} → {DIFF_LABELS[1]} → {DIFF_LABELS[2]}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {units.map((u, i) => {
            const d = Math.min(3, Math.max(1, u.difficulty ?? 1))
            const reached = currentIdx === -1 || i <= currentIdx
            return (
              <div
                key={u.id}
                className="h-2.5 rounded-full flex-1 transition-colors"
                style={{ backgroundColor: reached ? DIFF_COLORS[d - 1] : "#eee6cd" }}
                title={`Unit ${u.order}: ${DIFF_LABELS[d - 1]}`}
              />
            )
          })}
        </div>
        <p className="text-[11px] font-bold text-muted-foreground mt-1.5 sm:hidden">
          {DIFF_LABELS[0]} → {DIFF_LABELS[1]} → {DIFF_LABELS[2]}
        </p>
      </div>
    </div>
  )
}

/** small chip describing a unit/lesson difficulty level */
export function DifficultyChip({ difficulty, className = "" }: { difficulty: number; className?: string }) {
  const d = Math.min(3, Math.max(1, difficulty))
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-black text-white ${className}`}
      style={{ backgroundColor: DIFF_COLORS[d - 1] }}
    >
      {DIFF_LABELS[d - 1]}
    </span>
  )
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
