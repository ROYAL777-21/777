"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { Check } from "lucide-react"
import { useAppStore } from "@/lib/client/store"
import { sfx } from "@/lib/client/sound"
import { haptics } from "@/lib/client/haptics"
import type { CourseSummary } from "@/lib/types"
import { useRefreshApp } from "./ScrollApp"
import { Mascot } from "./Mascot"

const TAGLINES: Record<string, string[]> = {
  greek: ["Α α Alpha → Ω ω Omega", "Read John 1:1 in Greek", "Koine — the people's language"],
  hebrew: ["א Aleph → ת Tav", "Open Genesis 1:1 yourself", "Right to left, right to life"],
  manuscripts: ["Sinaiticus & Vaticanus", "Dead Sea Scrolls", "24,000+ witnesses"],
  apologetics: ["1 Peter 3:15", "The case for the resurrection", "Gentleness and respect"],
}

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

  return (
    <div className="p-3 sm:p-5 max-w-2xl mx-auto">
      <div className="flex items-end justify-between mb-5">
        <div>
          <h1 className="text-3xl font-black">My courses</h1>
          <p className="font-bold text-muted-foreground">Four paths, one academy. Switch anytime — progress is saved per course.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="p-8 text-center font-black text-muted-foreground">Fetching the library…</div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {data?.courses.map((c, i) => {
            const active = data.activeCourseId === c.id
            const pct = c.totalLessons > 0 ? Math.round((c.completedLessons / c.totalLessons) * 100) : 0
            const tags = TAGLINES[c.code] ?? []
            return (
              <motion.button
                key={c.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (active) {
                    setView("learn")
                    return
                  }
                  sfx.tap()
                  haptics.tap()
                  select.mutate(c.id)
                }}
                className={`text-left bg-white rounded-3xl border-2 p-5 transition-all shadow-[0_5px_0_#e8e0c8] ${
                  active ? "border-duo-green" : "border-paper-border hover:border-muted-foreground/40"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <span
                    className="w-14 h-14 rounded-2xl grid place-items-center text-3xl shrink-0"
                    style={{ backgroundColor: c.color + "22" }}
                  >
                    {c.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-black leading-tight">{c.title}</h2>
                      {active && (
                        <span className="bg-duo-green text-white text-[10px] font-black uppercase rounded-full px-2 py-0.5 shrink-0">
                          Active
                        </span>
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
              </motion.button>
            )
          })}
        </div>
      )}

      <div className="mt-6 bg-white rounded-3xl border-2 border-paper-border shadow-[0_5px_0_#e8e0c8] p-5 flex items-center gap-4">
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
