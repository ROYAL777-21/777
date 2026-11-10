"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { Check } from "lucide-react"
import { useAppStore } from "@/lib/client/store"
import { sfx } from "@/lib/client/sound"
import { haptics } from "@/lib/client/haptics"
import { courseCategory, CATEGORY_META, COURSE_TAGLINES, type CourseCategory } from "@/lib/courseMeta"
import type { CourseSummary } from "@/lib/types"
import { useRefreshApp } from "./ScrollApp"
import { Mascot } from "./Mascot"

const CATEGORY_ORDER: CourseCategory[] = ["language", "study", "denomination"]

export function CoursesView() {
  const qc = useQueryClient()
  const refreshApp = useRefreshApp()
  const setView = useAppStore((s) => s.setView)
  const pushToast = useAppStore((s) => s.pushToast)

  const { data, isLoading } = useQuery<{ courses: CourseSummary[]; activeCourseId: string | null }>({
    queryKey: ["courses"],
  })

  const select = useMutation({
    mutationFn: async (courseId: string) => {
      const res = await fetch("/api/courses", { method: "POST", body: JSON.stringify({ courseId }) })
      if (!res.ok) throw new Error("failed")
      return res.json()
    },
    onSuccess: (_d, courseId) => {
      sfx.correct()
      haptics.light()
      refreshApp()
      void qc.invalidateQueries({ queryKey: ["courses"] })
      const c = data?.courses.find((x) => x.id === courseId)
      pushToast(`${c?.emoji ?? "📚"} ${c?.title ?? "Course"} selected!`, "Your path has been updated — happy studying!", c?.emoji)
      setView("learn")
    },
    onError: () => {
      sfx.wrong()
      haptics.wrong()
    },
  })

  const grouped = (data?.courses ?? []).reduce<Record<CourseCategory, CourseSummary[]>>(
    (acc, c) => {
      acc[courseCategory(c.code)].push(c)
      return acc
    },
    { language: [], study: [], denomination: [] },
  )

  return (
    <div className="p-3 sm:p-5 max-w-2xl mx-auto">
      <div className="flex items-end justify-between mb-5">
        <div>
          <h1 className="text-3xl font-black">My courses</h1>
          <p className="font-bold text-muted-foreground">Eighteen paths, one academy. Switch anytime — progress is saved per course.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="p-8 text-center font-black text-muted-foreground">Fetching the library…</div>
      ) : (
        CATEGORY_ORDER.map((cat) => {
          const list = grouped[cat]
          if (list.length === 0) return null
          const meta = CATEGORY_META[cat]
          return (
            <section key={cat} className="mb-7" aria-label={meta.label}>
              <div className="flex items-center gap-2.5 mb-3">
                <span className="text-xl">{meta.emoji}</span>
                <div>
                  <h2 className="font-black leading-tight">{meta.label}</h2>
                  <p className="text-xs font-bold text-muted-foreground -mt-0.5">{meta.blurb}</p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {list.map((c, i) => (
                  <CourseCard key={c.id} course={c} index={i} active={data?.activeCourseId === c.id} onSelect={() => select.mutate(c.id)} />
                ))}
              </div>
            </section>
          )
        })
      )}

      <div className="mt-2 bg-white rounded-3xl border-2 border-paper-border shadow-[0_5px_0_#e8e0c8] p-5 flex items-center gap-4">
        <Mascot mood="cheer" size={80} />
        <div>
          <h2 className="font-black">The Scroll difference 📜</h2>
          <p className="text-sm font-bold text-muted-foreground leading-snug">
            No ads, no accounts, no distractions. Just the Bible&apos;s own languages, its manuscript
            history, and the reasons for the hope within you — gamified so you actually keep going.
          </p>
        </div>
      </div>

      <div className="mt-4 text-center">
        <button className="text-sm font-extrabold text-muted-foreground hover:text-foreground" onClick={() => setView("learn")}>
          ← Back to learning
        </button>
      </div>
    </div>
  )
}

function CourseCard({ course: c, index: i, active, onSelect }: { course: CourseSummary; index: number; active: boolean; onSelect: () => void }) {
  const setView = useAppStore((s) => s.setView)
  const tags = COURSE_TAGLINES[c.code] ?? []
  const pct = c.totalLessons > 0 ? Math.round((c.completedLessons / c.totalLessons) * 100) : 0
  return (
    <motion.button
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.05 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => {
        if (active) {
          setView("learn")
          return
        }
        sfx.tap()
        haptics.tap()
        onSelect()
      }}
      className={`text-left bg-white rounded-3xl border-2 p-5 transition-all shadow-[0_5px_0_#e8e0c8] ${
        active ? "border-duo-green" : "border-paper-border hover:border-muted-foreground/40"
      }`}
    >
      <div className="flex items-start gap-3.5">
        <span className="w-14 h-14 rounded-2xl grid place-items-center text-3xl shrink-0" style={{ backgroundColor: c.color + "22" }}>
          {c.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-black leading-tight">{c.title}</h3>
            {active && (
              <span className="bg-duo-green text-white text-[10px] font-black uppercase rounded-full px-2 py-0.5 shrink-0">Active</span>
            )}
          </div>
          <p className="text-sm font-bold text-muted-foreground">{c.subtitle}</p>
        </div>
      </div>

      <div className="mt-3.5 h-3 rounded-full bg-[#eee6cd] overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: c.color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ delay: 0.2, type: "spring", stiffness: 90, damping: 18 }}
        />
      </div>
      <div className="flex justify-between mt-1 mb-2.5">
        <span className="text-xs font-black text-muted-foreground">
          {c.completedLessons}/{c.totalLessons} lessons
        </span>
        <span className="text-xs font-black" style={{ color: c.color }}>
          {pct}%
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {tags.map((t) => (
          <span key={t} className="text-[11px] font-extrabold bg-secondary rounded-full px-2.5 py-1">
            {t}
          </span>
        ))}
      </div>
      {active && <Check className="hidden" />}
    </motion.button>
  )
}
