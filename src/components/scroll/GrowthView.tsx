"use client"

import { useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Sprout, Brain, Flame, Repeat2, Drama, Volume2, GraduationCap, Trophy, Target, BookOpenText,
  Users, Sun, Moon, Coffee, Check, Plus, Minus, CalendarCheck, Compass, PenLine, Mic2,
  LibraryBig, HandHeart, ChevronRight,
} from "lucide-react"
import { useAppStore } from "@/lib/client/store"
import { sfx } from "@/lib/client/sound"
import { haptics } from "@/lib/client/haptics"

type Tab = "app" | "beyond" | "routine"

// ═══════════════════════════════════════════════════════════════
//  Habit catalog for the routine builder
// ═══════════════════════════════════════════════════════════════

type Habit = {
  id: string
  label: string
  detail: string
  slot: "morning" | "midday" | "evening"
  icon: string
  xp: string // what it earns / trains
}

const HABITS: Habit[] = [
  { id: "h_morning_lesson", label: "One lesson with coffee", detail: "The single highest-leverage habit — 5 minutes that protect the streak and prime the day.", slot: "morning", icon: "☕", xp: "15–35 XP" },
  { id: "h_morning_scripture", label: "Read the day's Bible chapter", detail: "Open the Bible tab right after a lesson and read the chapter it touched — context cements content.", slot: "morning", icon: "📖", xp: "+5 XP / chapter" },
  { id: "h_morning_memorize", label: "Recite one memory verse", detail: "Say yesterday's verse aloud once. Recitation is memory's oldest technology.", slot: "morning", icon: "🧠", xp: "Long-term recall" },
  { id: "h_midday_quiz", label: "Daily Quiz at lunch", detail: "Five Bible knowledge questions, fresh each day — perfect break-sized learning.", slot: "midday", icon: "🧠", xp: "8–29 XP" },
  { id: "h_midday_review", label: "Clear the Practice Hub queue", detail: "Spaced-repetition reviews of past mistakes — 3 minutes that stop forgetting.", slot: "midday", icon: "♻️", xp: "Review XP" },
  { id: "h_midday_listen", label: "One Listening Lab or story", detail: "Train the ear: a Listening Lab lesson or a narrated story over lunch.", slot: "midday", icon: "🔊", xp: "15–30 XP" },
  { id: "h_evening_greek", label: "10 minutes of Greek or Hebrew", detail: "Alternate: Spelling Studio one day, Speak Out the next. Small daily doses beat weekly marathons.", slot: "evening", icon: "🏛️", xp: "Script mastery" },
  { id: "h_evening_speak", label: "Say 5 words aloud", detail: "Use the mic in Speak Out — or just read your notes aloud. Muscles remember.", slot: "evening", icon: "🎙️", xp: "Pronunciation" },
  { id: "h_evening_journal", label: "One-line journal", detail: "Write one sentence: 'Today I learned…'. A year of lines becomes a testimony.", slot: "evening", icon: "✍️", xp: "Reflection" },
  { id: "h_evening_plan", label: "Check off the reading plan", detail: "Keep the Bible-tab plan moving — one checkmark a day walks through Scripture yearly.", slot: "evening", icon: "✅", xp: "+5 XP / day" },
]

const SLOT_META = {
  morning: { label: "Morning", icon: Sun, color: "#D97706" },
  midday: { label: "Midday", icon: Coffee, color: "#0F8A80" },
  evening: { label: "Evening", icon: Moon, color: "#7C3AED" },
} as const

function dayKeyLocal(): string {
  const d = new Date() // browser-local — matches the server's dayKey on the user's own machine
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

// ═══════════════════════════════════════════════════════════════
//  Main view
// ═══════════════════════════════════════════════════════════════

export function GrowthView() {
  const [tab, setTab] = useState<Tab>("app")

  return (
    <div className="px-3 sm:px-5 pt-5 pb-10">
      <div className="max-w-2xl mx-auto">
        {/* header */}
        <div className="bg-white rounded-2xl border-2 border-paper-border shadow-[0_4px_0_#e8e0c8] p-4 mb-4 flex items-center gap-3">
          <span className="text-3xl">🌱</span>
          <div className="min-w-0">
            <h1 className="font-black text-lg leading-tight">Growth Hub</h1>
            <p className="text-sm text-muted-foreground font-bold">
              How to grow inside the app, beyond the app, and day by day.
            </p>
          </div>
        </div>

        {/* tabs */}
        <div className="grid grid-cols-3 gap-2 mb-5" role="tablist" aria-label="Growth sections">
          {(
            [
              { id: "app", label: "In the app", icon: Compass },
              { id: "beyond", label: "Beyond the app", icon: Sprout },
              { id: "routine", label: "My routine", icon: CalendarCheck },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => {
                sfx.tap()
                haptics.tap()
                setTab(t.id)
              }}
              className={`btn3d py-3 px-2 flex flex-col items-center gap-1 text-xs font-black border-2 border-b-4 ${
                tab === t.id
                  ? "bg-duo-green text-white shadow-[0_4px_0_#46a302]"
                  : "bg-white border-paper-border text-muted-foreground hover:bg-secondary"
              }`}
            >
              <t.icon className="w-5 h-5" />
              {t.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {tab === "app" && <InAppTips />}
            {tab === "beyond" && <BeyondAppTips />}
            {tab === "routine" && <RoutineBuilder />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
//  Tab 1 — grow inside the app ecosystem
// ═══════════════════════════════════════════════════════════════

const APP_TIPS: { icon: React.ReactNode; color: string; title: string; body: string; action?: { label: string; view: string } }[] = [
  {
    icon: <Brain className="w-6 h-6" />,
    color: "#7C3AED",
    title: "Take the Daily Quiz every single day",
    body: "Five Bible knowledge questions, a new set each morning. It costs two minutes, pays up to 29 XP, counts as a daily quest, and — most importantly — keeps every corner of Scripture within reach of memory. Miss a day? Nothing breaks; just pick the habit back up.",
    action: { label: "Open the Daily Quiz", view: "quiz" },
  },
  {
    icon: <Flame className="w-6 h-6" />,
    color: "#E4453D",
    title: "Protect the streak, but don't worship it",
    body: "The streak is a servant, not a master. Use it to build the habit: one lesson a day is enough to keep it alive. Keep a Streak Freeze equipped for genuine emergencies (find them in the Shop), and remember — the goal is a trained mind and a warmed heart, not a number.",
    action: { label: "Visit the Shop", view: "shop" },
  },
  {
    icon: <Repeat2 className="w-6 h-6" />,
    color: "#0F8A80",
    title: "Let the Practice Hub do the remembering",
    body: "Every question you miss is quietly queued for spaced review. Clearing that queue is the single most efficient XP-per-minute activity in the app — and it's exactly how memory science says you should spend study time. Review beats re-reading, every time.",
    action: { label: "Open Practice Hub", view: "practice-hub" },
  },
  {
    icon: <Volume2 className="w-6 h-6" />,
    color: "#B45309",
    title: "Use your ears: Listening Labs & narration",
    body: "Every Greek and Hebrew unit now has a Listening Lab (hear the word, choose the meaning) and a Speak Out studio (hear the model, record yourself, compare). Turn on voice narration in Stories to hear dialogues performed. Ears learn faster than eyes alone — that's why the app keeps handing you the 🔊 button.",
  },
  {
    icon: <GraduationCap className="w-6 h-6" />,
    color: "#92400E",
    title: "Test out of what you already know",
    body: "Placement tests let advanced learners skip ahead: score 70%+ on a unit's sample questions and its lessons are marked complete, with XP for everything you place out of. Retake anytime from the top of any course path — unlocked progress is never lost.",
  },
  {
    icon: <Drama className="w-6 h-6" />,
    color: "#EC4899",
    title: "Read stories at your tier — then one tier up",
    body: "Stories are organized by difficulty: easy retellings, medium dialogues, and advanced debates (the Problem of Pain, Nicaea, translating John 1:1). Read comfortably at your tier, then stretch one tier up — comprehension questions keep you honest, and TTS narration reads every line aloud.",
    action: { label: "Open Stories", view: "stories" },
  },
  {
    icon: <Trophy className="w-6 h-6" />,
    color: "#D97706",
    title: "Let the league be your pace-car",
    body: "Weekly leagues turn 'how much should I study?' into a friendly race. You don't need to win — just stay off the bottom five. Finishing mid-table for a few weeks naturally compounds into top-five fitness. Promotion feels great; the habit is the real prize.",
    action: { label: "Open Leagues", view: "leaderboard" },
  },
  {
    icon: <Target className="w-6 h-6" />,
    color: "#9B5DE5",
    title: "Claim your daily quests — they're a checklist for growth",
    body: "Three quests refresh every day (earn XP, finish lessons, take the quiz, read a chapter…). Treat them as your minimum viable day: finish all three and you've almost certainly hit your daily XP goal too. Quest gems fund streak freezes and heart refills.",
    action: { label: "Open Quests", view: "quests" },
  },
  {
    icon: <BookOpenText className="w-6 h-6" />,
    color: "#58CC02",
    title: "Pair every lesson with the Bible tab",
    body: "Lessons compress; Scripture expands. After a lesson, open the referenced chapter in the reader, leave a highlight, and check off your reading-plan day. The app counts chapters read; your soul counts the rest.",
    action: { label: "Open the Bible", view: "bible" },
  },
  {
    icon: <Users className="w-6 h-6" />,
    color: "#0891B2",
    title: "Share wins in the community",
    body: "Posting achievements and verses does two things: it cements your progress ('I did this'), and it encourages someone else to start. Add friends to see their streaks and cheer them on — growth is contagious.",
    action: { label: "Open Community", view: "community" },
  },
]

function InAppTips() {
  const setView = useAppStore((s) => s.setView)
  const startQuiz = useAppStore((s) => s.startQuiz)
  return (
    <div className="space-y-3">
      {APP_TIPS.map((tip, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ delay: (i % 4) * 0.05 }}
          className="bg-white rounded-2xl border-2 border-paper-border shadow-[0_4px_0_#e8e0c8] p-4 flex gap-3.5"
        >
          <div
            className="w-12 h-12 rounded-2xl grid place-items-center shrink-0 border-b-4"
            style={{ backgroundColor: tip.color + "1a", borderColor: tip.color + "80", color: tip.color }}
          >
            {tip.icon}
          </div>
          <div className="min-w-0">
            <h3 className="font-black leading-tight mb-1">{tip.title}</h3>
            <p className="text-sm font-semibold text-muted-foreground leading-relaxed">{tip.body}</p>
            {tip.action && (
              <button
                onClick={() => {
                  sfx.tap()
                  haptics.tap()
                  if (tip.action!.view === "quiz") {
                    startQuiz()
                  } else {
                    setView(tip.action!.view as never)
                  }
                }}
                className="mt-2.5 inline-flex items-center gap-1 text-sm font-black text-duo-green-dark hover:gap-2 transition-all"
              >
                {tip.action.label} <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
//  Tab 2 — grow beyond the app
// ═══════════════════════════════════════════════════════════════

const BEYOND_TIPS: { icon: React.ReactNode; color: string; title: string; body: string }[] = [
  {
    icon: <LibraryBig className="w-6 h-6" />,
    color: "#58CC02",
    title: "Read whole books, not just verses",
    body: "Apps are wonderful at fragments; Scripture was written as whole books. Once a week, read one entire book (or half of a long one) in one sitting — Philemon, Jonah, Ruth, Philippians, Ephesians. You'll spot plot, tone, and argument that verse-by-verse reading can't show. The app's reading plans can schedule this for you.",
  },
  {
    icon: <PenLine className="w-6 h-6" />,
    color: "#B45309",
    title: "Keep a one-line journal",
    body: "After each study session, write a single sentence: what you learned, or what struck you. Not a diary — a ledger. One line a day is 365 traces of growth a year, and re-reading old lines is encouragement on hard days. Paper works; a notes app works; consistency is the only requirement.",
  },
  {
    icon: <Brain className="w-6 h-6" />,
    color: "#7C3AED",
    title: "Memorize — out loud, in chunks",
    body: "Choose one verse a week. Say it aloud ten times on day one, then once daily after that. Speak it while walking, waiting, washing dishes. The combination of rhythm, voice, and repetition is how most of the world memorized Scripture for three millennia. The Daily Quiz will start feeling suspiciously easy.",
  },
  {
    icon: <Volume2 className="w-6 h-6" />,
    color: "#0F8A80",
    title: "Listen while you move",
    body: "An audio Bible turns commutes, walks, and chores into seminary. Aim for one chapter a day of listening in addition to your reading — different input channel, deeper roots. Hearing Paul's letters read aloud (as they were first received!) restores their oral force.",
  },
  {
    icon: <Mic2 className="w-6 h-6" />,
    color: "#BE123C",
    title: "Use your outside voice: teach someone",
    body: "The fastest way to learn is to teach. Retell a story from Stories to a friend over coffee; explain an argument from Apologetics to a curious colleague; show a family member the Greek alphabet you just learned. If you can't explain it simply, the app will happily take you back through it.",
  },
  {
    icon: <HandHeart className="w-6 h-6" />,
    color: "#D97706",
    title: "Join the people of the Book",
    body: "The Bible is a library written by, for, and within a community — and it is best studied in one. Join a small group, attend church, serve somewhere. Online streaks train the mind; embodied fellowship trains the whole disciple. Bring your questions from the app with you.",
  },
  {
    icon: <Compass className="w-6 h-6" />,
    color: "#0891B2",
    title: "Go one level deeper — with the right tools",
    body: "When a verse intrigues you: check a second translation (compare wording), read the surrounding chapter (context), and — as you grow — peek at the Greek or Hebrew in a free interlinear (Blue Letter Bible, stepBible). The languages you learn here turn those tools from mysterious to friendly.",
  },
  {
    icon: <Sprout className="w-6 h-6" />,
    color: "#65A30D",
    title: "Pray what you read",
    body: "Study that never prays becomes a museum; prayer that never studies becomes vague. Turn one line from each session into a one-sentence prayer — even 'Lord, help me believe this.' Knowledge watered by prayer grows into wisdom; knowledge alone grows into pride (1 Cor 8:1).",
  },
]

function BeyondAppTips() {
  return (
    <div className="space-y-3">
      <div className="bg-duo-green/10 border-2 border-duo-green/40 rounded-2xl p-4">
        <p className="font-black text-sm text-duo-green-dark leading-relaxed">
          🌍 The app is the gym; life is the field. Everything below is designed to be done <em>away</em> from a screen —
          pick one or two, not all of them.
        </p>
      </div>
      {BEYOND_TIPS.map((tip, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ delay: (i % 4) * 0.05 }}
          className="bg-white rounded-2xl border-2 border-paper-border shadow-[0_4px_0_#e8e0c8] p-4 flex gap-3.5"
        >
          <div
            className="w-12 h-12 rounded-2xl grid place-items-center shrink-0 border-b-4"
            style={{ backgroundColor: tip.color + "1a", borderColor: tip.color + "80", color: tip.color }}
          >
            {tip.icon}
          </div>
          <div className="min-w-0">
            <h3 className="font-black leading-tight mb-1">{tip.title}</h3>
            <p className="text-sm font-semibold text-muted-foreground leading-relaxed">{tip.body}</p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
//  Tab 3 — the routine builder
// ═══════════════════════════════════════════════════════════════

function RoutineBuilder() {
  // lazy-init from localStorage (client component — guard for SSR)
  const [routine, setRoutine] = useState<string[]>(() => {
    if (typeof window === "undefined") return []
    try {
      const r = localStorage.getItem("growth-routine")
      return r ? (JSON.parse(r) as string[]) : []
    } catch {
      return []
    }
  })
  const [day, setDay] = useState(() => dayKeyLocal())
  const [doneToday, setDoneToday] = useState<string[]>(() => {
    if (typeof window === "undefined") return []
    try {
      const d = dayKeyLocal()
      const done = localStorage.getItem(`growth-routine-done-${d}`)
      return done ? (JSON.parse(done) as string[]) : []
    } catch {
      return []
    }
  })

  // roll over the day
  useEffect(() => {
    const t = setInterval(() => {
      const d = dayKeyLocal()
      if (d !== day) {
        setDay(d)
        setDoneToday([])
      }
    }, 30_000)
    return () => clearInterval(t)
  }, [day])

  const persist = (r: string[]) => {
    setRoutine(r)
    try {
      localStorage.setItem("growth-routine", JSON.stringify(r))
    } catch {
      // ignore
    }
  }

  const toggleHabit = (id: string) => {
    const has = routine.includes(id)
    const next = has ? routine.filter((x) => x !== id) : [...routine, id]
    if (has) setDoneToday((d) => d.filter((x) => x !== id))
    persist(next)
    sfx.tap()
    haptics.tap()
  }

  const toggleDone = (id: string) => {
    const isDone = doneToday.includes(id)
    if (isDone) {
      sfx.tap()
      haptics.tap()
      setDoneToday((d) => d.filter((x) => x !== id))
    } else {
      sfx.correct()
      haptics.correct()
      setDoneToday((d) => [...d, id])
    }
    try {
      localStorage.setItem(`growth-routine-done-${day}`, JSON.stringify(isDone ? doneToday.filter((x) => x !== id) : [...doneToday, id]))
    } catch {
      // ignore
    }
  }

  const myHabits = useMemo(() => HABITS.filter((h) => routine.includes(h.id)), [routine])
  const bySlot = (slot: Habit["slot"]) => myHabits.filter((h) => h.slot === slot)
  const pct = myHabits.length > 0 ? Math.round((doneToday.length / myHabits.length) * 100) : 0
  const allDone = myHabits.length > 0 && doneToday.length === myHabits.length

  return (
    <div className="space-y-4">
      {/* today's progress */}
      <div className="bg-white rounded-2xl border-2 border-paper-border shadow-[0_4px_0_#e8e0c8] p-4">
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 shrink-0">
            <svg viewBox="0 0 64 64" className="w-16 h-16 -rotate-90">
              <circle cx="32" cy="32" r="26" fill="none" stroke="#eee6cd" strokeWidth="9" />
              <motion.circle
                cx="32"
                cy="32"
                r="26"
                fill="none"
                stroke="#58CC02"
                strokeWidth="9"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 26}
                animate={{ strokeDashoffset: 2 * Math.PI * 26 * (1 - pct / 100) }}
                transition={{ type: "spring", stiffness: 90, damping: 20 }}
              />
            </svg>
            <span className="absolute inset-0 grid place-items-center text-xl font-black">{allDone ? "🏆" : `${pct}%`}</span>
          </div>
          <div className="min-w-0">
            <p className="font-black leading-tight">
              {myHabits.length === 0
                ? "Build your daily routine"
                : allDone
                  ? "Routine complete — blessed work!"
                  : `Today's routine · ${doneToday.length}/${myHabits.length} done`}
            </p>
            <p className="text-sm text-muted-foreground font-bold">
              {myHabits.length === 0
                ? "Pick habits below — small anchors, morning to evening."
                : allDone
                  ? "Rest is part of growth. See you tomorrow."
                  : "Check habits off as you do them — resets each night."}
            </p>
          </div>
        </div>
      </div>

      {/* my routine by slot */}
      {myHabits.length > 0 && (
        <div className="space-y-3">
          {(["morning", "midday", "evening"] as const).map((slot) => {
            const items = bySlot(slot)
            if (!items.length) return null
            const meta = SLOT_META[slot]
            return (
              <div key={slot}>
                <p className="text-xs font-black uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1.5">
                  <meta.icon className="w-4 h-4" style={{ color: meta.color }} /> {meta.label}
                </p>
                <div className="space-y-2">
                  {items.map((h) => {
                    const isDone = doneToday.includes(h.id)
                    return (
                      <motion.button
                        key={h.id}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => toggleDone(h.id)}
                        className={`w-full text-left rounded-2xl border-2 border-b-4 p-3.5 flex items-center gap-3 transition-colors ${
                          isDone
                            ? "bg-duo-green/10 border-duo-green"
                            : "bg-white border-paper-border hover:bg-secondary"
                        }`}
                        aria-pressed={isDone}
                      >
                        <span
                          className={`w-9 h-9 rounded-xl grid place-items-center shrink-0 border-2 ${
                            isDone ? "bg-duo-green border-duo-green text-white" : "border-paper-border text-lg"
                          }`}
                        >
                          {isDone ? <Check className="w-5 h-5" strokeWidth={3.2} /> : h.icon}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className={`font-black text-sm ${isDone ? "text-duo-green-dark line-through decoration-2" : ""}`}>{h.label}</p>
                          <p className="text-xs font-semibold text-muted-foreground leading-snug">{h.detail}</p>
                        </div>
                        <span className="text-[10px] font-black text-muted-foreground bg-secondary rounded-full px-2 py-1 shrink-0">
                          {h.xp}
                        </span>
                      </motion.button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* habit catalog */}
      <div>
        <p className="text-xs font-black uppercase tracking-wide text-muted-foreground mb-2">
          Habit catalog — tap to add or remove
        </p>
        <div className="space-y-2">
          {HABITS.map((h) => {
            const inRoutine = routine.includes(h.id)
            const meta = SLOT_META[h.slot]
            return (
              <motion.button
                key={h.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleHabit(h.id)}
                className={`w-full text-left rounded-2xl border-2 p-3 flex items-center gap-3 transition-colors ${
                  inRoutine ? "bg-duo-purple/10 border-duo-purple/50" : "bg-white border-paper-border hover:bg-secondary"
                }`}
                aria-pressed={inRoutine}
              >
                <span
                  className={`w-8 h-8 rounded-lg grid place-items-center shrink-0 font-black ${
                    inRoutine ? "bg-duo-purple text-white" : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {inRoutine ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-black text-sm leading-tight">
                    {h.icon} {h.label}
                  </p>
                  <p className="text-xs font-semibold text-muted-foreground leading-snug mt-0.5">{h.detail}</p>
                </div>
                <span
                  className="text-[10px] font-black rounded-full px-2 py-1 shrink-0 flex items-center gap-1"
                  style={{ backgroundColor: meta.color + "1a", color: meta.color }}
                >
                  <meta.icon className="w-3 h-3" /> {meta.label}
                </span>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* habit science */}
      <div className="bg-duo-gold/10 border-2 border-duo-gold/50 rounded-2xl p-4">
        <p className="font-black text-sm text-duo-gold-dark leading-relaxed">
          💡 <b>Habit-stack it:</b> attach each habit to something you already do — lesson after coffee, quiz after lunch,
          review after brushing teeth. Tiny-and-daily beats big-and-weekly; the streak calendar will prove it to you within
          a month.
        </p>
      </div>
    </div>
  )
}
