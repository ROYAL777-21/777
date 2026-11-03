"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion"
import confetti from "canvas-confetti"
import { X, Play, Check, Zap, Gem, Flame, ChevronRight, BookMarked, Repeat2, Volume2, VolumeX } from "lucide-react"
import { useAppStore } from "@/lib/client/store"
import { sfx } from "@/lib/client/sound"
import { haptics } from "@/lib/client/haptics"
import { speak, stopSpeaking, ttsSupported, speakerProfile } from "@/lib/client/tts"
import type { StoriesPayload, StoryListItemDTO, StoryPayload, StorySceneDTO, StoryCompleteResult } from "@/lib/types"
import { useRefreshApp } from "./ScrollApp"

const CATEGORY_LABELS: Record<string, string> = {
  bible: "Bible stories",
  apologetics: "Apologetics",
  history: "Church history",
  languages: "Languages",
}

const CATEGORY_FILTERS = ["all", "bible", "apologetics", "history", "languages"]

export function StoriesView() {
  const [filter, setFilter] = useState("all")
  const [activeSlug, setActiveSlug] = useState<string | null>(null)

  const { data } = useQuery<StoriesPayload>({ queryKey: ["stories"] })
  const stories = data?.stories ?? []
  const filtered = useMemo(
    () => (filter === "all" ? stories : stories.filter((s) => s.category === filter)),
    [stories, filter]
  )

  return (
    <div className="px-3 sm:px-5 pt-5 pb-10">
      <div className="max-w-2xl mx-auto">
        {/* header */}
        <div className="bg-white rounded-2xl border-2 border-paper-border shadow-[0_4px_0_#e8e0c8] p-4 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎭</span>
            <div className="min-w-0">
              <h1 className="font-black text-lg leading-tight">Story Mode</h1>
              <p className="text-sm text-muted-foreground font-bold">
                Dialogue-driven scenarios — walk the road, hear the debate, learn in the living room.
              </p>
            </div>
          </div>
          {data && (
            <div className="mt-3 flex items-center gap-3">
              <div className="flex-1 h-3 rounded-full bg-secondary overflow-hidden" role="progressbar" aria-valuenow={data.completedCount} aria-valuetext={`${data.completedCount} of ${data.total} stories read`} aria-valuemin={0} aria-valuemax={data.total}>
                <motion.div
                  className="h-full rounded-full bg-[#EC4899]"
                  initial={false}
                  animate={{ width: `${data.total ? (data.completedCount / data.total) * 100 : 0}%` }}
                  transition={{ type: "spring", stiffness: 90, damping: 20 }}
                />
              </div>
              <span className="text-sm font-black whitespace-nowrap">
                {data.completedCount}/{data.total} read
              </span>
            </div>
          )}
        </div>

        {/* category chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin" role="tablist" aria-label="Story categories">
          {CATEGORY_FILTERS.map((c) => (
            <button
              key={c}
              role="tab"
              aria-selected={filter === c}
              onClick={() => {
                sfx.tap()
                haptics.tap()
                setFilter(c)
              }}
              className={`shrink-0 px-4 py-2 rounded-full border-2 font-extrabold text-sm transition-colors ${
                filter === c
                  ? "bg-[#EC4899] text-white border-[#BE185D] shadow-[0_2px_0_#BE185D]"
                  : "bg-white text-muted-foreground border-paper-border hover:border-[#EC4899]/50"
              }`}
            >
              {c === "all" ? "All stories" : (CATEGORY_LABELS[c] ?? c)}
            </button>
          ))}
        </div>

        {/* library grid */}
        <div className="grid sm:grid-cols-2 gap-3 mt-2">
          {filtered.map((s) => (
            <StoryCard key={s.id} story={s} onPlay={() => setActiveSlug(s.slug)} />
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-10 text-muted-foreground font-bold">No stories here yet — more are on the way! 📜</div>
        )}
      </div>

      {/* player overlay */}
      <AnimatePresence>
        {activeSlug && <StoryPlayer key={activeSlug} slug={activeSlug} onExit={() => setActiveSlug(null)} />}
      </AnimatePresence>
    </div>
  )
}

function StoryCard({ story, onPlay }: { story: StoryListItemDTO; onPlay: () => void }) {
  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => {
        sfx.tap()
        haptics.tap()
        onPlay()
      }}
      className="text-left bg-white rounded-2xl border-2 border-paper-border shadow-[0_4px_0_#e8e0c8] p-4 flex flex-col gap-2 hover:border-[#EC4899]/60 transition-colors"
      aria-label={`Play story: ${story.title}`}
    >
      <div className="flex items-start gap-3">
        <span
          className="w-12 h-12 rounded-2xl grid place-items-center text-2xl shrink-0"
          style={{ backgroundColor: story.color + "1f" }}
        >
          {story.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-black leading-tight flex items-center gap-1.5">
            {story.title}
            {story.completed && (
              <span className="inline-grid place-items-center w-4 h-4 rounded-full bg-duo-green text-white" title="Completed">
                <Check className="w-2.5 h-2.5" strokeWidth={4} />
              </span>
            )}
          </p>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">{CATEGORY_LABELS[story.category] ?? story.category}</p>
        </div>
      </div>
      <p className="text-sm font-semibold text-muted-foreground line-clamp-2 leading-snug">{story.description}</p>
      <div className="flex items-center gap-2 mt-auto pt-1">
        <span className="flex items-center gap-1 text-xs font-black text-muted-foreground" aria-label={`Difficulty ${story.difficulty} of 3`}>
          {Array.from({ length: 3 }).map((_, i) => (
            <span key={i} className={i < story.difficulty ? "text-[#EC4899]" : "text-muted-foreground/30"}>●</span>
          ))}
        </span>
        <span className="flex items-center gap-1 text-xs font-black text-duo-green-dark">
          <Zap className="w-3.5 h-3.5" /> {story.xpReward} XP
        </span>
        <span
          className={`ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 font-extrabold text-xs ${
            story.completed
              ? "bg-white border-paper-border text-muted-foreground"
              : "bg-[#EC4899] border-[#BE185D] text-white shadow-[0_2px_0_#BE185D]"
          }`}
        >
          {story.completed ? <Repeat2 className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          {story.completed ? "Replay" : "Play"}
        </span>
      </div>
    </motion.button>
  )
}

// ═══════════════════════════════════════════════════════════════
//  The story player — chat-style dialogue with checkpoints
// ═══════════════════════════════════════════════════════════════

function StoryPlayer({ slug, onExit }: { slug: string; onExit: () => void }) {
  const setView = useAppStore((s) => s.setView)
  const setShareDraft = useAppStore((s) => s.setShareDraft)
  const qc = useQueryClient()
  const refreshApp = useRefreshApp()

  const { data, isLoading, isError } = useQuery<StoryPayload>({
    queryKey: ["story", slug],
    queryFn: async () => {
      const res = await fetch(`/api/stories/${slug}`)
      if (!res.ok) throw new Error("failed to load story")
      return res.json() as Promise<StoryPayload>
    },
    staleTime: Infinity,
  })

  // player state
  const [idx, setIdx] = useState(0)
  const [phase, setPhase] = useState<"reading" | "feedback">("reading")
  const [selected, setSelected] = useState<number | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [questionsSeen, setQuestionsSeen] = useState(0)
  const [showQuit, setShowQuit] = useState(false)
  const [result, setResult] = useState<StoryCompleteResult | null>(null)
  const [showTapHint, setShowTapHint] = useState(true)
  const stageRef = useRef<HTMLDivElement>(null)

  const scenes = data?.scenes ?? []
  const scene: StorySceneDTO | undefined = scenes[idx]
  const total = scenes.length
  const isQuestion = scene?.kind === "QUESTION"
  const isDone = idx >= total

  // ── voice narration (TTS) ──
  const [narration, setNarration] = useState(() => {
    if (typeof window === "undefined") return false
    try {
      return localStorage.getItem("story-narration") === "on"
    } catch {
      return false
    }
  })
  const [speakingSceneId, setSpeakingSceneId] = useState<string | null>(null)
  const lastNarrated = useRef<string>("")

  const toggleNarration = () => {
    const next = !narration
    setNarration(next)
    try {
      localStorage.setItem("story-narration", next ? "on" : "off")
    } catch {
      // ignore
    }
    if (!next) {
      stopSpeaking()
      setSpeakingSceneId(null)
    }
    sfx.tap()
    haptics.tap()
  }

  const narrateScene = async (s: StorySceneDTO | undefined) => {
    if (!s || s.kind === "QUESTION") return
    stopSpeaking()
    setSpeakingSceneId(s.id)
    const name = s.speaker ?? "Narrator"
    const profile = speakerProfile(name)
    await speak(s.text, "en", { rate: profile.rate, pitch: profile.pitch })
    setSpeakingSceneId(null)
  }

  // auto-narrate the current scene when narration is on
  useEffect(() => {
    if (!narration || result || !scene || isQuestion) return
    const key = `${slug}:${scene.id}`
    if (lastNarrated.current === key) return
    lastNarrated.current = key
    // defer so the effect body never sets state synchronously
    const t = setTimeout(() => void narrateScene(scene), 150)
    return () => clearTimeout(t)
  }, [idx, narration, scene, result])

  // stop all speech on unmount
  useEffect(() => () => stopSpeaking(), [])

  const complete = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/stories/${slug}/complete`, {
        method: "POST",
        body: JSON.stringify({ correct: correctCount, total: questionsSeen }),
      })
      if (!res.ok) throw new Error("completion failed")
      return res.json() as Promise<StoryCompleteResult>
    },
    onSuccess: (r) => {
      setResult(r)
      sfx.fanfare()
      haptics.complete()
      setTimeout(() => {
        confetti({
          particleCount: 150,
          spread: 85,
          origin: { y: 0.55 },
          colors: ["#EC4899", "#58CC02", "#FFC800", "#9B5DE5"],
        })
      }, 120)
      refreshApp()
      void qc.invalidateQueries({ queryKey: ["stories"] })
    },
    onError: () => {
      setResult({
        xpEarned: 0, doubled: false, firstTime: false, perfect: false, gemsEarned: 0,
        streak: 0, streakIncreased: false, questsCompleted: [], achievementsUnlocked: [],
        totalXp: 0, gems: 0, dailyXp: 0, dailyXpGoal: 50,
      })
    },
  })

  // fire completion once the last scene passes
  useEffect(() => {
    if (data && isDone && !complete.isPending && !result && !complete.isError) {
      complete.mutate()
    }
  }, [isDone, data, result, complete])

  // advance a reading scene (tap)
  const advance = () => {
    if (!scene || isQuestion || result) return
    sfx.tap()
    haptics.tap()
    stopSpeaking()
    setSpeakingSceneId(null)
    setShowTapHint(false)
    setIdx((i) => i + 1)
    // brief re-show of the hint for the next scene
    setTimeout(() => setShowTapHint(true), 500)
    requestAnimationFrame(() => stageRef.current?.scrollTo({ top: 0 }))
  }

  // answer a checkpoint question
  const answer = (i: number) => {
    if (phase === "feedback" || !isQuestion) return
    setSelected(i)
    setQuestionsSeen((q) => q + 1)
    const ok = i === scene.correctIndex
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

  const continuePastQuestion = () => {
    setPhase("reading")
    setSelected(null)
    setIdx((i) => i + 1)
    requestAnimationFrame(() => stageRef.current?.scrollTo({ top: 0 }))
  }

  // keyboard: space/enter advances reading scenes
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (result) {
          onExit()
        } else {
          setShowQuit(true)
        }
      } else if ((e.key === " " || e.key === "Enter") && scene && !isQuestion && !result) {
        e.preventDefault()
        advance()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [result, scene, isQuestion])

  const cast = data?.cast ?? {}
  // visible window: the current scene plus the two before it (dialogue memory)
  const windowScenes = scenes.slice(Math.max(0, idx - 2), idx + 1)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] parchment-bg flex flex-col"
      role="dialog"
      aria-label={data ? `Story: ${data.title}` : "Story"}
    >
      {/* top bar */}
      <div className="bg-white border-b-2 border-paper-border px-3 sm:px-5 py-3 flex items-center gap-3 shrink-0">
        <button
          onClick={() => (result ? onExit() : setShowQuit(true))}
          className="p-2 rounded-xl hover:bg-secondary transition-colors"
          aria-label="Close story"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xl shrink-0">{data?.emoji ?? "🎭"}</span>
            <p className="font-black truncate">{data?.title ?? "Loading…"}</p>
          </div>
          <div className="mt-1 h-2 rounded-full bg-secondary overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: data?.color ?? "#EC4899" }}
              initial={false}
              animate={{ width: `${Math.min(100, (idx / Math.max(1, total)) * 100)}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 22 }}
            />
          </div>
        </div>
        <button
          onClick={toggleNarration}
          disabled={!ttsSupported()}
          title={ttsSupported() ? (narration ? "Narration on — each line is read aloud" : "Narration off") : "Voice narration not supported in this browser"}
          className={`p-2 rounded-xl border-2 transition-colors disabled:opacity-40 ${
            narration ? "bg-[#EC4899]/10 border-[#EC4899]/50 text-[#BE185D]" : "bg-white border-paper-border text-muted-foreground hover:bg-secondary"
          }`}
          aria-pressed={narration}
          aria-label="Toggle voice narration"
        >
          {narration ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </button>
        <span className="text-xs font-black text-muted-foreground whitespace-nowrap">
          {Math.min(idx + 1, total)}/{total}
        </span>
      </div>

      {/* stage */}
      {isLoading ? (
        <div className="flex-1 grid place-items-center">
          <motion.div animate={{ rotate: [0, -6, 6, 0] }} transition={{ duration: 1.4, repeat: Infinity }} className="text-5xl">
            📖
          </motion.div>
          <p className="font-extrabold text-muted-foreground mt-3">Opening the story…</p>
        </div>
      ) : isError || !data ? (
        <div className="flex-1 grid place-items-center p-8 text-center">
          <div>
            <div className="text-5xl mb-3">🕯️</div>
            <p className="font-black text-lg">The scroll tore</p>
            <p className="text-muted-foreground font-bold mt-1">We couldn&apos;t load this story. Please try again.</p>
            <button onClick={onExit} className="btn3d bg-duo-green text-white shadow-[0_3px_0_#46a302] px-6 py-2.5 mt-4 font-extrabold">
              Back to library
            </button>
          </div>
        </div>
      ) : result ? (
        <StoryResult result={result} storyEmoji={data.emoji} storyTitle={data.title} color={data.color}
          onShare={() => {
            setShareDraft({
              kind: "story",
              title: `Finished the story “${data.title}”`,
              subtitle: result.perfect ? "Perfect comprehension! All checkpoints aced." : "Story complete — checkpoints cleared.",
              icon: data.emoji,
              color: data.color,
            })
            onExit()
            setView("community")
          }}
          onDone={onExit}
        />
      ) : (
        <div
          ref={stageRef}
          className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 cursor-pointer"
          onClick={advance}
        >
          <div className="max-w-lg mx-auto flex flex-col gap-3">
            <AnimatePresence mode="popLayout">
              {windowScenes.map((s) => {
                const isCurrent = s.order - 1 === idx
                if (s.kind === "NARRATION") {
                  const speaking = speakingSceneId === s.id
                  return (
                    <motion.div
                      key={s.id}
                      layout
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: isCurrent ? 1 : 0.45, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: "spring", stiffness: 260, damping: 26 }}
                      className="bg-white border-2 border-paper-border rounded-2xl p-4 shadow-[0_4px_0_#e8e0c8]"
                    >
                      <div className="flex items-start gap-3">
                        <p className="text-[15px] font-semibold leading-relaxed text-foreground/90 italic flex-1">{s.text}</p>
                        {isCurrent && ttsSupported() && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              void narrateScene(s)
                            }}
                            className={`shrink-0 w-9 h-9 rounded-xl border-2 grid place-items-center transition-colors ${
                              speaking ? "bg-[#EC4899]/10 border-[#EC4899]/50 text-[#BE185D]" : "border-paper-border text-muted-foreground hover:bg-secondary"
                            }`}
                            aria-label="Replay narration"
                            title="Replay narration"
                          >
                            <Volume2 className={`w-4 h-4 ${speaking ? "animate-pulse" : ""}`} />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )
                }
                if (s.kind === "LINE") {
                  const emoji = cast[speaker(s)] ?? "🗣️"
                  const speaking = speakingSceneId === s.id
                  return (
                    <motion.div
                      key={s.id}
                      layout
                      initial={{ opacity: 0, x: -26, scale: 0.96 }}
                      animate={{ opacity: isCurrent ? 1 : 0.45, x: 0, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 26 }}
                      className="flex items-start gap-2.5"
                    >
                      <span className="w-10 h-10 rounded-full bg-white border-2 border-paper-border grid place-items-center text-xl shrink-0 shadow-[0_2px_0_#e8e0c8]">
                        {emoji}
                      </span>
                      <div
                        className="bg-white border-2 border-paper-border rounded-2xl rounded-tl-md px-4 py-3 shadow-[0_4px_0_#e8e0c8] min-w-0 cursor-pointer"
                        onClick={(e) => {
                          if (isCurrent && ttsSupported()) {
                            e.stopPropagation()
                            void narrateScene(s)
                          }
                        }}
                        title={isCurrent && ttsSupported() ? "Tap to hear this line" : undefined}
                      >
                        <p className="text-[11px] font-black uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                          {s.speaker}
                          {speaking && <Volume2 className="w-3 h-3 text-[#BE185D] animate-pulse" />}
                        </p>
                        <p className="text-[15px] font-semibold leading-relaxed">{s.text}</p>
                      </div>
                    </motion.div>
                  )
                }
                // QUESTION — only render the current one
                if (!isCurrent) return null
                return (
                  <motion.div
                    key={s.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 26 }}
                    className="bg-white border-2 border-paper-border rounded-2xl p-4 shadow-[0_4px_0_#e8e0c8] cursor-default"
                  >
                    <p className="text-[11px] font-black uppercase tracking-wide text-[#EC4899] mb-1.5">Checkpoint</p>
                    <p className="font-extrabold text-lg leading-snug mb-3">{s.question}</p>
                    <div className="flex flex-col gap-2">
                      {s.options.map((opt, i) => {
                        const isSel = selected === i
                        const isRight = i === s.correctIndex
                        const revealed = phase === "feedback"
                        return (
                          <button
                            key={i}
                            onClick={(e) => {
                              e.stopPropagation()
                              answer(i)
                            }}
                            disabled={revealed}
                            className={`text-left px-4 py-3 rounded-xl border-2 font-bold text-[15px] transition-colors ${
                              revealed
                                ? isRight
                                  ? "bg-duo-green/10 border-duo-green text-duo-green-dark"
                                  : isSel
                                    ? "bg-duo-red/10 border-duo-red text-duo-red-dark"
                                    : "bg-white border-paper-border text-muted-foreground"
                                : "bg-white border-paper-border hover:border-[#EC4899]/60 active:translate-y-[1px]"
                            }`}
                          >
                            {opt}
                          </button>
                        )
                      })}
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* bottom bar */}
      {!result && !isLoading && data && (
        <div className="bg-white border-t-2 border-paper-border px-4 sm:px-6 py-3.5 shrink-0">
          <div className="max-w-lg mx-auto">
            {isQuestion && phase === "feedback" && scene ? (
              <div className="flex flex-col gap-2.5">
                <div
                  className={`rounded-xl p-3 border-2 ${
                    selected === scene.correctIndex
                      ? "bg-duo-green/10 border-duo-green/50"
                      : "bg-duo-red/10 border-duo-red/50"
                  }`}
                >
                  <p className="font-black text-sm">
                    {selected === scene.correctIndex ? "✅ Exactly right!" : "❌ Not quite —"}
                  </p>
                  {scene.meaning && <p className="text-sm font-semibold text-muted-foreground mt-0.5">{scene.meaning}</p>}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    sfx.tap()
                    haptics.tap()
                    continuePastQuestion()
                  }}
                  className="btn3d bg-duo-green text-white shadow-[0_3px_0_#46a302] w-full py-3 font-extrabold"
                >
                  CONTINUE
                </button>
              </div>
            ) : isQuestion ? (
              <p className="text-center text-sm font-extrabold text-muted-foreground py-1.5">Pick the right answer to continue…</p>
            ) : (
              <button
                onClick={advance}
                className="w-full text-center text-sm font-black text-muted-foreground py-2 hover:text-foreground transition-colors flex items-center justify-center gap-1.5"
              >
                {showTapHint && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.6, repeat: Infinity }}
                    className="flex items-center gap-1.5"
                  >
                    <ChevronRight className="w-4 h-4" /> Tap to continue
                  </motion.span>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* quit confirmation */}
      <AnimatePresence>
        {showQuit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 bg-black/40 grid place-items-center p-6"
            onClick={() => setShowQuit(false)}
          >
            <motion.div
              initial={{ scale: 0.92, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 12 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl border-2 border-paper-border shadow-[0_6px_0_#e8e0c8] p-6 max-w-sm w-full text-center"
            >
              <div className="text-4xl mb-2">📕</div>
              <h2 className="font-black text-xl">Leave the story?</h2>
              <p className="text-sm font-bold text-muted-foreground mt-1 mb-5">
                Your progress in this story won&apos;t be saved — the scroll will roll back up.
              </p>
              <div className="flex flex-col gap-2.5">
                <button
                  onClick={() => {
                    sfx.tap()
                    onExit()
                  }}
                  className="btn3d bg-duo-red text-white shadow-[0_3px_0_#b32d27] py-2.5 font-extrabold"
                >
                  Yes, leave
                </button>
                <button
                  onClick={() => {
                    sfx.tap()
                    setShowQuit(false)
                  }}
                  className="btn3d bg-white border-2 border-paper-border shadow-[0_3px_0_#e8e0c8] py-2.5 font-extrabold"
                >
                  Keep reading
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function speaker(s: StorySceneDTO): string {
  return s.speaker ?? "Narrator"
}

function StoryResult({
  result,
  storyEmoji,
  storyTitle,
  color,
  onShare,
  onDone,
}: {
  result: StoryCompleteResult
  storyEmoji: string
  storyTitle: string
  color: string
  onShare: () => void
  onDone: () => void
}) {
  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-8">
      <motion.div
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 20 }}
        className="max-w-md mx-auto bg-white rounded-3xl border-2 border-paper-border shadow-[0_6px_0_#e8e0c8] p-6 text-center"
      >
        <div
          className="w-20 h-20 rounded-3xl grid place-items-center text-5xl mx-auto"
          style={{ backgroundColor: color + "1f" }}
        >
          {storyEmoji}
        </div>
        <h2 className="font-black text-2xl mt-3">Story complete!</h2>
        <p className="text-sm font-bold text-muted-foreground">{storyTitle}</p>

        {result.perfect && (
          <div className="mt-3 inline-flex items-center gap-1.5 bg-duo-gold/20 border-2 border-duo-gold/60 rounded-full px-4 py-1.5 font-black text-sm">
            🌟 Perfect comprehension
          </div>
        )}

        <div className="grid grid-cols-3 gap-2 mt-5">
          <div className="rounded-2xl bg-duo-green/10 border-2 border-duo-green/40 p-3">
            <Zap className="w-5 h-5 mx-auto text-duo-green" />
            <p className="font-black text-lg mt-1">+{result.xpEarned}</p>
            <p className="text-[11px] font-black text-muted-foreground uppercase">XP</p>
          </div>
          <div className="rounded-2xl bg-duo-gold/10 border-2 border-duo-gold/40 p-3">
            <Gem className="w-5 h-5 mx-auto text-duo-gold" />
            <p className="font-black text-lg mt-1">+{result.gemsEarned}</p>
            <p className="text-[11px] font-black text-muted-foreground uppercase">Gems</p>
          </div>
          <div className="rounded-2xl bg-duo-red/10 border-2 border-duo-red/40 p-3">
            <Flame className="w-5 h-5 mx-auto text-duo-red" />
            <p className="font-black text-lg mt-1">{result.streak}</p>
            <p className="text-[11px] font-black text-muted-foreground uppercase">Day streak</p>
          </div>
        </div>

        {result.streakIncreased && (
          <p className="text-sm font-extrabold text-duo-red mt-3">🔥 Streak extended — {result.streak} days strong!</p>
        )}
        {result.achievementsUnlocked.length > 0 && (
          <div className="mt-4 space-y-1.5">
            {result.achievementsUnlocked.map((a, i) => (
              <p key={i} className="text-sm font-extrabold">
                {a.icon} Achievement: {a.title} — {a.tierName}
              </p>
            ))}
          </div>
        )}
        {result.questsCompleted.length > 0 && (
          <p className="text-sm font-extrabold text-duo-green mt-2">🎯 Quest complete: {result.questsCompleted.join(" · ")}</p>
        )}

        <div className="flex flex-col gap-2.5 mt-6">
          <button
            onClick={() => {
              sfx.tap()
              haptics.tap()
              onShare()
            }}
            className="btn3d bg-[#EC4899] text-white shadow-[0_3px_0_#BE185D] py-3 font-extrabold flex items-center justify-center gap-2"
          >
            <BookMarked className="w-5 h-5" /> Share to community
          </button>
          <button
            onClick={() => {
              sfx.tap()
              onDone()
            }}
            className="btn3d bg-duo-green text-white shadow-[0_3px_0_#46a302] py-3 font-extrabold"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  )
}
