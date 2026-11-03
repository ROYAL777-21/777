"use client"

import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { Zap, BookOpen, Flame, Star, Target } from "lucide-react"
import type { QuestsPayload } from "@/lib/types"

const ICONS: Record<string, typeof Zap> = {
  Zap,
  BookOpen,
  Flame,
  Star,
  Target,
}

export function QuestsView() {
  const { data, isLoading } = useQuery<QuestsPayload>({
    queryKey: ["quests"],
    refetchInterval: 20000,
  })

  if (isLoading || !data) {
    return (
      <div className="p-8 flex flex-col items-center gap-3">
        <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.1, repeat: Infinity }} className="text-5xl">
          🎯
        </motion.div>
        <p className="font-black text-muted-foreground">Unrolling today&apos;s quests…</p>
      </div>
    )
  }

  const hoursLeft = Math.floor(data.refreshInMs / 3600000)
  const minutesLeft = Math.floor((data.refreshInMs % 3600000) / 60000)
  const goalPct = Math.min(100, Math.round((data.dailyXp / data.dailyXpGoal) * 100))

  return (
    <div className="p-3 sm:p-5 max-w-2xl mx-auto">
      <h1 className="text-3xl font-black mb-1">Quests</h1>
      <p className="font-bold text-muted-foreground mb-5">
        New quests arrive in {hoursLeft}h {minutesLeft}m
      </p>

      {/* daily goal */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl border-2 border-paper-border shadow-[0_5px_0_#e8e0c8] p-5 mb-5 flex items-center gap-5"
      >
        <div className="relative w-20 h-20 shrink-0">
          <svg viewBox="0 0 80 80" className="w-20 h-20 -rotate-90">
            <circle cx="40" cy="40" r="32" fill="none" stroke="#eee6cd" strokeWidth="10" />
            <motion.circle
              cx="40"
              cy="40"
              r="32"
              fill="none"
              stroke="#58CC02"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 32}
              initial={false}
              animate={{ strokeDashoffset: 2 * Math.PI * 32 * (1 - goalPct / 100) }}
              transition={{ type: "spring", stiffness: 80, damping: 18 }}
            />
          </svg>
          <span className="absolute inset-0 grid place-items-center text-2xl">{goalPct >= 100 ? "🏆" : "⚡"}</span>
        </div>
        <div>
          <h2 className="font-black text-lg">Daily goal</h2>
          <p className="font-bold text-muted-foreground">
            {data.dailyXp} / {data.dailyXpGoal} XP today
          </p>
          <p className="text-sm font-bold text-duo-green-dark mt-1">
            {goalPct >= 100 ? "Goal smashed — see you tomorrow, scholar! 🌟" : `${data.dailyXpGoal - data.dailyXp} XP to go — one lesson gets you there!`}
          </p>
        </div>
      </motion.div>

      {/* quests */}
      <h2 className="font-black mb-2.5 flex items-center gap-2">
        🎯 Daily quests
      </h2>
      <div className="flex flex-col gap-3">
        {data.quests.map((q, i) => {
          const pct = Math.min(100, Math.round((q.progress / q.target) * 100))
          const Icon = ICONS[q.icon] ?? Target
          return (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`rounded-3xl border-2 p-4 shadow-[0_4px_0_#e8e0c8] ${
                q.completed ? "bg-duo-green/10 border-duo-green" : "bg-white border-paper-border"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-12 h-12 rounded-2xl grid place-items-center shrink-0 ${
                    q.completed ? "bg-duo-green text-white" : "bg-duo-purple/15 text-duo-purple"
                  }`}
                >
                  {q.completed ? <span className="text-xl">✓</span> : <Icon className="w-6 h-6" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black leading-tight">{q.title}</p>
                  <p className="text-sm font-bold text-muted-foreground">{q.description}</p>
                </div>
                <span className="flex items-center gap-1 font-black text-duo-gold-dark whitespace-nowrap">
                  💎 {q.gemsReward}
                </span>
              </div>
              <div className="mt-3 h-4 rounded-full bg-[#eee6cd] overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${q.completed ? "bg-duo-green" : "bg-duo-purple"}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ type: "spring", stiffness: 90, damping: 18, delay: 0.2 }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs font-black text-muted-foreground tabular-nums">
                  {Math.min(q.progress, q.target)} / {q.target}
                </span>
                {q.completed && <span className="text-xs font-black text-duo-green-dark">Reward claimed ✓</span>}
              </div>
            </motion.div>
          )
        })}
      </div>

      <p className="text-center text-xs font-bold text-muted-foreground mt-5">
        Quests auto-complete and pay gems straight to your wallet.
      </p>
    </div>
  )
}
