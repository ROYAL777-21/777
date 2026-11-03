"use client"

import { motion } from "framer-motion"
import { Dumbbell, Heart, Zap } from "lucide-react"
import { useAppStore } from "@/lib/client/store"
import { sfx } from "@/lib/client/sound"
import { haptics } from "@/lib/client/haptics"
import { useRefreshApp } from "./ScrollApp"
import { Mascot } from "./Mascot"
import { useQuery } from "@tanstack/react-query"

export function PracticeHub() {
  const startLesson = useAppStore((s) => s.startLesson)
  const refreshApp = useRefreshApp()
  const { data: boot } = useQuery<{ user: { hearts: number; streak: number } }>({ queryKey: ["bootstrap"] })

  const cards = [
    {
      key: "practice",
      title: "Mistakes review",
      desc: "Resurface the challenges you missed and turn weaknesses into strengths. Restores one heart!",
      icon: <Dumbbell className="w-6 h-6" />,
      color: "#D97706",
      cta: "PRACTICE NOW",
    },
  ]

  return (
    <div className="p-3 sm:p-5 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <motion.div
          animate={{ rotate: [0, -8, 8, 0] }}
          transition={{ duration: 2.4, repeat: Infinity }}
          className="text-4xl"
        >
          🏋️
        </motion.div>
        <div>
          <h1 className="text-3xl font-black leading-tight">Practice hub</h1>
          <p className="font-bold text-muted-foreground">Keep your memory — and your hearts — strong.</p>
        </div>
      </div>

      {/* hearts status */}
      <div className="bg-white rounded-3xl border-2 border-paper-border shadow-[0_5px_0_#e8e0c8] p-5 mb-4 flex items-center gap-4">
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Heart
              key={i}
              className={`w-7 h-7 ${i < (boot?.user.hearts ?? 5) ? "text-duo-red fill-duo-red" : "text-paper-border fill-paper-border"}`}
            />
          ))}
        </div>
        <p className="font-bold text-muted-foreground flex-1">
          {boot?.user.hearts === 5
            ? "Hearts full — go get a streak lesson!"
            : "Practice sessions restore one heart each (plus 10 XP and 5 gems)."}
        </p>
      </div>

      {cards.map((c, i) => (
        <motion.div
          key={c.key}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          className="bg-white rounded-3xl border-2 border-paper-border shadow-[0_5px_0_#e8e0c8] p-5 mb-4"
        >
          <div className="flex items-center gap-3.5 mb-3">
            <span className="w-12 h-12 rounded-2xl grid place-items-center text-white shrink-0" style={{ backgroundColor: c.color }}>
              {c.icon}
            </span>
            <div>
              <h2 className="font-black text-lg leading-tight">{c.title}</h2>
              <p className="text-sm font-bold text-muted-foreground leading-snug">{c.desc}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm font-black text-muted-foreground mb-3">
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-duo-gold" /> +10 XP
            </span>
            <span className="flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-duo-red fill-duo-red" /> +1 heart
            </span>
            <span className="flex items-center gap-1.5">💎 +5 gems</span>
          </div>
          <button
            className="btn3d w-full py-3.5 text-white"
            style={{ backgroundColor: c.color, boxShadow: `0 4px 0 ${shade(c.color, -35)}` }}
            onClick={() => {
              sfx.tap()
              haptics.tap()
              refreshApp()
              startLesson("practice", "Mistakes review")
            }}
          >
            {c.cta}
          </button>
        </motion.div>
      ))}

      <div className="flex items-center gap-4 bg-white rounded-3xl border-2 border-paper-border shadow-[0_5px_0_#e8e0c8] p-5">
        <Mascot mood="think" size={76} />
        <p className="text-sm font-bold text-muted-foreground">
          <span className="block font-black text-foreground mb-0.5">Why practice works</span>
          Spaced repetition is how the scribes memorized — and how your brain cements Greek and Hebrew.
          A short review today beats a long cram tomorrow.
        </p>
      </div>
    </div>
  )
}

function shade(hex: string, percent: number): string {
  const num = parseInt(hex.replace("#", ""), 16)
  const amt = Math.round(2.55 * percent)
  const R = Math.max(0, Math.min(255, (num >> 16) + amt))
  const G = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + amt))
  const B = Math.max(0, Math.min(255, (num & 0xff) + amt))
  return `#${((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1)}`
}
