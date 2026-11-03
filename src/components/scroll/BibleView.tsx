"use client"

import { useEffect, useMemo, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion"
import confetti from "canvas-confetti"
import { BookOpen, Bookmark, CalendarCheck, ChevronLeft, ChevronRight, Sparkles, Share2, X, Check, Loader2 } from "lucide-react"
import { BOOKS, BOOK_BY_ID, GENRE_EMOJI, READING_PLANS, PLAN_BY_ID, parseRef, refLabel, verseOfDay } from "@/lib/bible"
import { useAppStore } from "@/lib/client/store"
import { sfx } from "@/lib/client/sound"
import { haptics } from "@/lib/client/haptics"
import type { BibleMarkDTO, BibleStatePayload, PlanProgressDTO, PostAttachment } from "@/lib/types"
import { useRefreshApp } from "./ScrollApp"

const HIGHLIGHTS: { id: string; name: string; chip: string; text: string }[] = [
  { id: "gold", name: "Gold", chip: "#F59E0B", text: "#FEF3C7" },
  { id: "rose", name: "Rose", chip: "#F43F5E", text: "#FFE4E6" },
  { id: "teal", name: "Teal", chip: "#14B8A6", text: "#CCFBF1" },
  { id: "violet", name: "Violet", chip: "#8B5CF6", text: "#EDE9FE" },
]

type Tab = "read" | "plans" | "marks"

export function BibleView() {
  const [tab, setTab] = useState<Tab>("read")
  return (
    <div className="px-3 sm:px-5 pt-5 pb-6">
      <div className="max-w-3xl mx-auto">
        <header className="mb-4">
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-duo-purple" /> The Bible
          </h1>
          <p className="text-muted-foreground font-bold text-sm mt-1">King James Version · read, highlight, and walk the plans</p>
        </header>

        {/* tabs */}
        <div className="flex gap-2 mb-5" role="tablist" aria-label="Bible sections">
          {(
            [
              { id: "read", label: "Read", icon: BookOpen },
              { id: "plans", label: "Plans", icon: CalendarCheck },
              { id: "marks", label: "Marks", icon: Bookmark },
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
              className={`btn3d px-4 py-2.5 flex items-center gap-2 text-sm border-2 border-b-4 ${
                tab === t.id ? "bg-duo-purple text-white border-duo-purple-dark shadow-[0_3px_0_#7c3aed]" : "bg-white border-paper-border text-muted-foreground hover:bg-secondary"
              }`}
            >
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            {tab === "read" && <ReadTab />}
            {tab === "plans" && <PlansTab />}
            {tab === "marks" && <MarksTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

// ── READ ──────────────────────────────────────────────────────

function ReadTab() {
  const bibleTarget = useAppStore((s) => s.bibleTarget)
  const clearBibleTarget = useAppStore((s) => s.clearBibleTarget)
  const [openState, setOpenState] = useState<{ bookId: string; chapter: number } | null>(null)
  // a fresh target (e.g. "open John 3" from a plan) takes precedence until the user navigates locally
  const open = openState ?? bibleTarget
  const setOpen = (v: { bookId: string; chapter: number } | null) => {
    clearBibleTarget()
    setOpenState(v)
  }

  const { data: state } = useQuery<BibleStatePayload>({ queryKey: ["bible"] })

  if (open) return <ChapterReader bookId={open.bookId} chapter={open.chapter} onClose={() => setOpen(null)} onNavigate={(b, c) => setOpen({ bookId: b, chapter: c })} />

  return (
    <div>
      <TodayCard state={state} />
      <ContinueCard state={state} />
      <BookGrid state={state} onOpen={(bookId, chapter) => setOpen({ bookId, chapter })} />
    </div>
  )
}

function TodayCard({ state }: { state?: BibleStatePayload }) {
  const dayKey = new Date().toISOString().slice(0, 10)
  const vod = useMemo(() => verseOfDay(dayKey), [dayKey])
  const setShareDraft = useAppStore((s) => s.setShareDraft)
  const setView = useAppStore((s) => s.setView)
  const [verse, setVerse] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    fetch(`/bible/${vod.bookId}.json`)
      .then((r) => r.json())
      .then((data: { chapters: string[][] }) => {
        if (alive) setVerse(data.chapters[vod.chapter - 1]?.[vod.verse - 1] ?? null)
      })
      .catch(() => undefined)
    return () => {
      alive = false
    }
  }, [vod])

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl border-2 border-paper-border shadow-[0_5px_0_#e8e0c8] p-5 mb-4"
    >
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-5 h-5 text-duo-gold" />
        <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">Verse of the day</span>
      </div>
      <blockquote className="text-lg font-extrabold leading-snug">
        {verse === null ? "Loading today's bread…" : `"${verse}"`}
      </blockquote>
      <p className="text-sm font-black text-duo-purple mt-2">{vod.ref.toUpperCase()}</p>
      <div className="flex gap-2 mt-3">
        <button
          onClick={() => {
            sfx.tap()
            haptics.tap()
            const att: PostAttachment = {
              kind: "verse",
              title: vod.ref,
              subtitle: verse ? `"${verse.slice(0, 120)}${verse.length > 120 ? "…" : ""}"` : "",
              icon: "📖",
              color: "#9B5DE5",
            }
            setShareDraft(att)
            setView("community")
          }}
          className="btn3d bg-duo-purple text-white shadow-[0_3px_0_#7c3aed] px-4 py-2 text-xs flex items-center gap-1.5"
        >
          <Share2 className="w-3.5 h-3.5" /> Share verse
        </button>
      </div>
    </motion.div>
  )
}

function ContinueCard({ state }: { state?: BibleStatePayload }) {
  const [open, setOpen] = useState<{ bookId: string; chapter: number } | null>(null)
  if (!state?.lastRead) return null
  const book = BOOK_BY_ID[state.lastRead.bookId]
  const nextChapter = Math.min(state.lastRead.chapter + 1, book.chapters)
  return (
    <>
      <button
        onClick={() => {
          sfx.tap()
          haptics.tap()
          setOpen({ bookId: state.lastRead!.bookId, chapter: nextChapter })
        }}
        className="w-full text-left bg-duo-green/10 border-2 border-duo-green/40 rounded-3xl p-4 mb-4 flex items-center gap-3 hover:bg-duo-green/15 transition-colors"
      >
        <span className="text-3xl">📖</span>
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-wider text-duo-green-dark">Continue reading</p>
          <p className="font-black truncate">
            {book.name} {nextChapter}
          </p>
        </div>
        <ChevronRight className="w-6 h-6 ml-auto text-duo-green-dark shrink-0" />
      </button>
      {open && <ChapterReader bookId={open.bookId} chapter={open.chapter} onClose={() => setOpen(null)} onNavigate={(b, c) => setOpen({ bookId: b, chapter: c })} />}
    </>
  )
}

function BookGrid({ state, onOpen }: { state?: BibleStatePayload; onOpen: (bookId: string, chapter: number) => void }) {
  const [testament, setTestament] = useState<"OT" | "NT">("OT")
  const [genre, setGenre] = useState<string | null>(null)
  const readSet = useMemo(() => new Set(state?.read ?? []), [state])
  const books = BOOKS.filter((b) => b.testament === testament && (!genre || b.genre === genre))
  const genres = useMemo(() => [...new Set(BOOKS.filter((b) => b.testament === testament).map((b) => b.genre))], [testament])
  const doneInTestament = useMemo(() => {
    const list = BOOKS.filter((b) => b.testament === testament)
    const readCount = list.reduce((n, b) => n + Array.from({ length: b.chapters }, (_, i) => `${b.id}-${i + 1}`).filter((k) => readSet.has(k)).length, 0)
    const total = list.reduce((n, b) => n + b.chapters, 0)
    return { readCount, total }
  }, [testament, readSet])

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className="flex bg-secondary rounded-full p-1">
          {(["OT", "NT"] as const).map((t) => (
            <button
              key={t}
              onClick={() => {
                sfx.tap()
                setTestament(t)
                setGenre(null)
              }}
              className={`px-4 py-1.5 rounded-full text-sm font-black transition-colors ${testament === t ? "bg-white shadow-sm" : "text-muted-foreground"}`}
            >
              {t === "OT" ? "Old Testament" : "New Testament"}
            </button>
          ))}
        </div>
        <span className="ml-auto text-xs font-black text-muted-foreground whitespace-nowrap">
          {doneInTestament.readCount}/{doneInTestament.total} ch
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        <button
          onClick={() => setGenre(null)}
          className={`px-3 py-1 rounded-full text-xs font-black border-2 transition-colors ${!genre ? "bg-ink text-white border-ink" : "bg-white border-paper-border text-muted-foreground"}`}
        >
          All
        </button>
        {genres.map((g) => (
          <button
            key={g}
            onClick={() => {
              sfx.tap()
              setGenre(g === genre ? null : g)
            }}
            className={`px-3 py-1 rounded-full text-xs font-black border-2 transition-colors ${genre === g ? "bg-ink text-white border-ink" : "bg-white border-paper-border text-muted-foreground"}`}
          >
            {GENRE_EMOJI[g]} {g}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
        {books.map((b, i) => {
          const readChapters = Array.from({ length: b.chapters }, (_, ci) => `${b.id}-${ci + 1}`).filter((k) => readSet.has(k)).length
          const pct = Math.round((readChapters / b.chapters) * 100)
          return (
            <motion.button
              key={b.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: Math.min(i * 0.02, 0.3) }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                sfx.tap()
                haptics.tap()
                onOpen(b.id, 1)
              }}
              className="bg-white border-2 border-paper-border rounded-2xl p-3 text-left shadow-[0_3px_0_#e8e0c8] hover:border-duo-green/50 transition-colors"
            >
              <p className="font-black text-sm leading-tight">{b.name}</p>
              <p className="text-[11px] font-bold text-muted-foreground mt-0.5 line-clamp-2">{b.summary}</p>
              <div className="mt-2 h-1.5 rounded-full bg-secondary overflow-hidden">
                <div className="h-full bg-duo-green rounded-full" style={{ width: `${pct}%` }} />
              </div>
              <p className="text-[10px] font-black text-muted-foreground mt-1">
                {readChapters}/{b.chapters} chapters
              </p>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

// ── CHAPTER READER ────────────────────────────────────────────

function ChapterReader({
  bookId,
  chapter,
  onClose,
  onNavigate,
}: {
  bookId: string
  chapter: number
  onClose: () => void
  onNavigate: (bookId: string, chapter: number) => void
}) {
  const book = BOOK_BY_ID[bookId]
  const qc = useQueryClient()
  const refreshApp = useRefreshApp()
  const pushToast = useAppStore((s) => s.pushToast)
  const setShareDraft = useAppStore((s) => s.setShareDraft)
  const setView = useAppStore((s) => s.setView)
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null)

  const { data: chapterData, isLoading } = useQuery<{ chapters: string[][] }>({
    queryKey: ["bible-chapter", bookId],
    queryFn: async () => {
      const res = await fetch(`/bible/${bookId}.json`)
      if (!res.ok) throw new Error("failed")
      return res.json()
    },
    staleTime: Infinity,
  })
  const { data: state } = useQuery<BibleStatePayload>({ queryKey: ["bible"] })

  const verses = chapterData?.chapters[chapter - 1] ?? []
  const marksByVerse = useMemo(() => {
    const m = new Map<number, BibleMarkDTO>()
    for (const mk of state?.marks ?? []) if (mk.bookId === bookId && mk.chapter === chapter) m.set(mk.verse, mk)
    return m
  }, [state, bookId, chapter])
  const alreadyRead = state?.read.includes(`${bookId}-${chapter}`) ?? false

  const mark = useMutation({
    mutationFn: async (payload: { verse: number; color?: string }) => {
      const existing = marksByVerse.get(payload.verse)
      const remove = payload.color === undefined || (!!existing && existing.color === payload.color)
      const res = await fetch("/api/bible", {
        method: "POST",
        body: JSON.stringify(
          remove
            ? { action: "unmark", bookId, chapter, verse: payload.verse }
            : { action: "mark", bookId, chapter, verse: payload.verse, color: payload.color }
        ),
      })
      if (!res.ok) throw new Error("failed")
    },
    onSuccess: () => {
      sfx.tap()
      void qc.invalidateQueries({ queryKey: ["bible"] })
    },
  })

  const markRead = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/bible", {
        method: "POST",
        body: JSON.stringify({ action: "read", bookId, chapter }),
      })
      if (!res.ok) throw new Error("failed")
      return res.json() as Promise<{ firstTime: boolean; xpEarned: number }>
    },
    onSuccess: (r) => {
      sfx.correct()
      haptics.complete()
      if (r.firstTime) {
        confetti({ particleCount: 70, spread: 70, origin: { y: 0.7 }, colors: ["#58CC02", "#FFC800"] })
        pushToast("Chapter read! +10 XP", `${book.name} ${chapter} marked as read.`, "📖")
      }
      void qc.invalidateQueries({ queryKey: ["bible"] })
      refreshApp()
    },
  })

  return (
    <div>
      {/* header */}
      <div className="sticky top-16 z-20 parchment-bg py-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sfx.tap()
              onClose()
            }}
            className="p-2 rounded-xl hover:bg-secondary transition-colors"
            aria-label="Close chapter"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h2 className="font-black text-lg leading-tight truncate">
              {book.name} <span className="text-muted-foreground">{chapter}</span>
            </h2>
            <p className="text-[11px] font-bold text-muted-foreground truncate">
              {GENRE_EMOJI[book.genre]} {book.genre} · {book.summary}
            </p>
          </div>
          {!alreadyRead && (
            <button
              onClick={() => markRead.mutate()}
              disabled={markRead.isPending}
              className="btn3d ml-auto bg-duo-green text-white shadow-[0_3px_0_#46a302] px-3 py-2 text-xs flex items-center gap-1.5 shrink-0"
            >
              {markRead.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Read +10 XP
            </button>
          )}
          {alreadyRead && (
            <span className="ml-auto flex items-center gap-1 text-xs font-black text-duo-green-dark bg-duo-green/10 rounded-full px-3 py-1.5 shrink-0">
              <Check className="w-4 h-4" /> Read
            </span>
          )}
        </div>
      </div>

      {/* chapter chips */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4 -mx-1 px-1" role="tablist" aria-label="Chapters">
        {Array.from({ length: book.chapters }, (_, i) => i + 1).map((c) => {
          const isRead = state?.read.includes(`${bookId}-${c}`)
          return (
            <button
              key={c}
              onClick={() => {
                sfx.tap()
                onNavigate(bookId, c)
                setSelectedVerse(null)
              }}
              className={`w-9 h-9 shrink-0 rounded-xl text-sm font-black border-2 transition-colors ${
                c === chapter
                  ? "bg-ink text-white border-ink"
                  : isRead
                    ? "bg-duo-green/15 text-duo-green-dark border-duo-green/40"
                    : "bg-white border-paper-border text-muted-foreground hover:bg-secondary"
              }`}
              aria-label={`Chapter ${c}`}
              aria-current={c === chapter}
            >
              {c}
            </button>
          )
        })}
      </div>

      {/* verses */}
      {isLoading ? (
        <div className="py-16 flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          <p className="font-black text-muted-foreground">Unrolling the scroll…</p>
        </div>
      ) : (
        <motion.article
          key={`${bookId}-${chapter}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border-2 border-paper-border shadow-[0_5px_0_#e8e0c8] p-5 sm:p-7"
        >
          <h3 className="text-center font-black text-2xl mb-4 text-duo-purple">{book.name} {chapter}</h3>
          <p className="text-[15px] sm:text-base leading-relaxed font-semibold">
            {verses.map((v, i) => {
              const mk = marksByVerse.get(i + 1)
              const hl = HIGHLIGHTS.find((h) => h.id === mk?.color)
              return (
                <span key={i} className="relative">
                  <span
                    onClick={() => {
                      if (selectedVerse === i + 1) {
                        setSelectedVerse(null)
                        return
                      }
                      sfx.tap()
                      haptics.tap()
                      setSelectedVerse(i + 1)
                    }}
                    className={`cursor-pointer rounded px-0.5 transition-colors hover:bg-secondary ${hl ? "bg-[var(--hl)]" : ""}`}
                    style={hl ? ({ ["--hl" as string]: hl.text, backgroundColor: hl.text } as React.CSSProperties) : undefined}
                    role="button"
                    aria-label={`Verse ${i + 1}`}
                  >
                    <sup className="text-duo-purple font-black text-[11px] mr-0.5 select-none">{i + 1}</sup>
                    {v}
                  </span>{" "}
                  {selectedVerse === i + 1 && (
                    <span className="inline-flex align-middle gap-1 ml-1 bg-white border-2 border-paper-border rounded-full shadow-[0_3px_0_#e8e0c8] px-1.5 py-1">
                      {HIGHLIGHTS.map((h) => (
                        <button
                          key={h.id}
                          onClick={() => mark.mutate({ verse: i + 1, color: h.id })}
                          className="w-5 h-5 rounded-full border-2 border-paper-border hover:scale-110 transition-transform"
                          style={{ backgroundColor: h.chip }}
                          aria-label={`Highlight ${h.name}`}
                        />
                      ))}
                      <button
                        onClick={() => mark.mutate({ verse: i + 1 })}
                        className="w-5 h-5 rounded-full grid place-items-center border-2 border-paper-border text-[10px] font-black text-muted-foreground"
                        aria-label="Remove highlight"
                      >
                        ✕
                      </button>
                      <button
                        onClick={() => {
                          const att: PostAttachment = {
                            kind: "verse",
                            title: `${book.name} ${chapter}:${i + 1}`,
                            subtitle: `"${v.slice(0, 120)}${v.length > 120 ? "…" : ""}"`,
                            icon: "📖",
                            color: "#9B5DE5",
                          }
                          setShareDraft(att)
                          setView("community")
                        }}
                        className="w-5 h-5 rounded-full grid place-items-center border-2 border-paper-border text-muted-foreground hover:text-duo-purple"
                        aria-label="Share verse"
                      >
                        <Share2 className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </span>
              )
            })}
          </p>

          {/* share whole chapter */}
          <button
            onClick={() => {
              const att: PostAttachment = {
                kind: "verse",
                title: `${book.name} ${chapter}`,
                subtitle: "Come read this chapter with me — join me in the word today!",
                icon: "📖",
                color: "#7C2D12",
              }
              setShareDraft(att)
              setView("community")
            }}
            className="btn3d mt-5 bg-white text-muted-foreground border-2 border-paper-border shadow-[0_3px_0_#e8e0c8] px-4 py-2 text-xs flex items-center gap-1.5 mx-auto"
          >
            <Share2 className="w-3.5 h-3.5" /> Share this chapter
          </button>
        </motion.article>
      )}

      {/* prev / next */}
      <div className="flex items-center justify-between gap-3 mt-4 mb-2">
        <button
          disabled={chapter <= 1 && bookId === BOOKS[0].id}
          onClick={() => {
            sfx.tap()
            if (chapter > 1) onNavigate(bookId, chapter - 1)
            else {
              const idx = BOOKS.findIndex((b) => b.id === bookId)
              const prev = BOOKS[idx - 1]
              if (prev) onNavigate(prev.id, prev.chapters)
            }
            setSelectedVerse(null)
          }}
          className="btn3d bg-white border-2 border-paper-border shadow-[0_3px_0_#e8e0c8] px-4 py-2.5 text-sm flex items-center gap-1.5"
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>
        <button
          disabled={bookId === BOOKS[BOOKS.length - 1].id && chapter >= book.chapters}
          onClick={() => {
            sfx.tap()
            if (chapter < book.chapters) onNavigate(bookId, chapter + 1)
            else {
              const idx = BOOKS.findIndex((b) => b.id === bookId)
              const next = BOOKS[idx + 1]
              if (next) onNavigate(next.id, 1)
            }
            setSelectedVerse(null)
          }}
          className="btn3d bg-white border-2 border-paper-border shadow-[0_3px_0_#e8e0c8] px-4 py-2.5 text-sm flex items-center gap-1.5"
        >
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// ── PLANS ─────────────────────────────────────────────────────

function PlansTab() {
  const { data } = useQuery<{ plans: PlanProgressDTO[] }>({ queryKey: ["plans"] })
  const [openPlan, setOpenPlan] = useState<string | null>(null)

  if (openPlan) return <PlanDetail planId={openPlan} onBack={() => setOpenPlan(null)} />

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {READING_PLANS.map((p, i) => {
        const prog = data?.plans.find((pp) => pp.id === p.id)
        const pct = prog ? Math.round((prog.daysDone / p.days.length) * 100) : 0
        return (
          <motion.button
            key={p.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              sfx.tap()
              haptics.tap()
              setOpenPlan(p.id)
            }}
            className="text-left bg-white rounded-3xl border-2 border-paper-border shadow-[0_5px_0_#e8e0c8] p-5"
          >
            <div className="flex items-start gap-3">
              <span className="text-3xl">{p.emoji}</span>
              <div className="min-w-0 flex-1">
                <h3 className="font-black text-lg leading-tight">{p.title}</h3>
                <p className="text-xs font-bold text-muted-foreground">{p.subtitle}</p>
              </div>
            </div>
            <div className="mt-3 h-3 rounded-full bg-secondary overflow-hidden border-2 border-paper-border">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: p.color }}
                initial={false}
                animate={{ width: `${pct}%` }}
                transition={{ type: "spring", stiffness: 90, damping: 20 }}
              />
            </div>
            <p className="text-xs font-black text-muted-foreground mt-1.5">
              {prog?.daysDone ?? 0} / {p.days.length} days {pct === 100 ? "· complete! 🎉" : ""}
            </p>
          </motion.button>
        )
      })}
    </div>
  )
}

function PlanDetail({ planId, onBack }: { planId: string; onBack: () => void }) {
  const plan = PLAN_BY_ID[planId]
  const qc = useQueryClient()
  const refreshApp = useRefreshApp()
  const pushToast = useAppStore((s) => s.pushToast)
  const openBible = useAppStore((s) => s.openBible)
  const { data } = useQuery<{ plans: PlanProgressDTO[] }>({ queryKey: ["plans"] })
  const prog = data?.plans.find((pp) => pp.id === planId)
  const doneSet = new Set(prog?.doneDays ?? [])

  const complete = useMutation({
    mutationFn: async (day: number) => {
      const res = await fetch("/api/plans", { method: "POST", body: JSON.stringify({ planId, day }) })
      if (!res.ok) throw new Error("failed")
      return res.json() as Promise<{ firstTime: boolean; xpEarned: number }>
    },
    onSuccess: (r) => {
      sfx.correct()
      haptics.tap()
      if (r.firstTime) pushToast("Plan day complete! +12 XP", "Another step along the path. 🎯", "📅")
      void qc.invalidateQueries({ queryKey: ["plans"] })
      refreshApp()
    },
  })

  return (
    <div>
      <button onClick={() => { sfx.tap(); onBack() }} className="flex items-center gap-1.5 font-black text-sm text-muted-foreground hover:text-foreground mb-3">
        <ChevronLeft className="w-4 h-4" /> All plans
      </button>
      <div className="rounded-3xl text-white p-5 mb-4 shadow-[0_5px_0_rgba(0,0,0,0.18)]" style={{ backgroundColor: plan.color }}>
        <div className="flex items-center gap-3">
          <span className="text-4xl">{plan.emoji}</span>
          <div>
            <h2 className="font-black text-2xl leading-tight">{plan.title}</h2>
            <p className="font-bold text-white/80 text-sm">{plan.subtitle}</p>
          </div>
        </div>
      </div>

      <div className="space-y-2.5">
        {plan.days.map((d, i) => {
          const day = i + 1
          const done = doneSet.has(day)
          return (
            <div key={day} className={`rounded-3xl border-2 p-4 shadow-[0_3px_0_#e8e0c8] ${done ? "bg-duo-green/10 border-duo-green/40" : "bg-white border-paper-border"}`}>
              <div className="flex items-center gap-3">
                <span className={`w-9 h-9 rounded-full grid place-items-center font-black text-sm shrink-0 ${done ? "bg-duo-green text-white" : "bg-secondary text-muted-foreground"}`}>
                  {done ? <Check className="w-5 h-5" /> : day}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-black">{refLabel(d.ref)}</p>
                  <p className="text-xs font-bold text-muted-foreground truncate">{d.focus}</p>
                </div>
                <button
                  onClick={() => {
                    sfx.tap()
                    haptics.tap()
                    const p = parseRef(d.ref)!
                    openBible(p.bookId, p.chapter)
                  }}
                  className="btn3d bg-white border-2 border-paper-border shadow-[0_3px_0_#e8e0c8] px-3 py-2 text-xs shrink-0"
                >
                  Read
                </button>
                <button
                  onClick={() => complete.mutate(day)}
                  disabled={done || complete.isPending}
                  className={`btn3d px-3 py-2 text-xs shrink-0 ${done ? "bg-secondary text-muted-foreground" : "bg-duo-green text-white shadow-[0_3px_0_#46a302]"}`}
                >
                  {done ? "Done" : "+12 XP"}
                </button>
              </div>
              <p className="text-xs font-semibold text-muted-foreground mt-2 bg-secondary rounded-xl px-3 py-2">
                💭 {d.question}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── MARKS ─────────────────────────────────────────────────────

function MarksTab() {
  const { data } = useQuery<BibleStatePayload>({ queryKey: ["bible"] })
  const openBible = useAppStore((s) => s.openBible)
  const marks = data?.marks ?? []

  if (marks.length === 0) {
    return (
      <div className="text-center py-14 px-6 bg-white rounded-3xl border-2 border-paper-border">
        <div className="text-5xl mb-3">🖍️</div>
        <h3 className="font-black text-lg">No highlights yet</h3>
        <p className="text-sm font-bold text-muted-foreground mt-1 max-w-sm mx-auto">
          While reading, tap any verse to highlight it in four colours or share it with the community. Your marks will gather here.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2.5">
      {marks.map((m) => {
        const hl = HIGHLIGHTS.find((h) => h.id === m.color) ?? HIGHLIGHTS[0]
        const book = BOOK_BY_ID[m.bookId]
        return (
          <button
            key={`${m.bookId}-${m.chapter}-${m.verse}`}
            onClick={() => {
              sfx.tap()
              openBible(m.bookId, m.chapter)
            }}
            className="w-full text-left bg-white rounded-2xl border-2 border-paper-border shadow-[0_3px_0_#e8e0c8] p-4 flex items-center gap-3 hover:border-duo-green/50 transition-colors"
          >
            <span className="w-2.5 h-10 rounded-full shrink-0" style={{ backgroundColor: hl.chip }} />
            <div className="min-w-0">
              <p className="font-black text-sm">
                {book.name} {m.chapter}:{m.verse}
              </p>
              <p className="text-xs font-semibold text-muted-foreground line-clamp-2">{m.note || "Highlighted verse"}</p>
            </div>
            <ChevronRight className="w-5 h-5 ml-auto text-muted-foreground shrink-0" />
          </button>
        )
      })}
    </div>
  )
}
