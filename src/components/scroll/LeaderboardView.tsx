"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion"
import { Lock, TrendingUp, TrendingDown, Users } from "lucide-react"
import { parseAvatar } from "@/lib/avatar"
import { sfx } from "@/lib/client/sound"
import { haptics } from "@/lib/client/haptics"
import type { LeaderboardPayload } from "@/lib/types"
import { AvatarSvg } from "./AvatarSvg"
import { Mascot } from "./Mascot"

type FriendsBoard = LeaderboardPayload & {
  friends: { rank: number; name: string; avatar: string; xp: number; isCurrentUser: boolean }[]
}

export function LeaderboardView() {
  const [tab, setTab] = useState<"league" | "friends">("league")
  const { data, isLoading } = useQuery<FriendsBoard>({
    queryKey: ["leaderboard"],
    refetchInterval: 30000,
  })

  if (isLoading || !data) {
    return (
      <div className="p-8 flex flex-col items-center gap-3">
        <motion.div animate={{ rotate: [0, -8, 8, 0] }} transition={{ duration: 1.2, repeat: Infinity }} className="text-5xl">
          🏆
        </motion.div>
        <p className="font-black text-muted-foreground">Counting the scrolls…</p>
      </div>
    )
  }

  const daysLeft = Math.ceil(data.timeLeftMs / 86400000)

  return (
    <div className="p-3 sm:p-5 max-w-2xl mx-auto">
      {/* header */}
      <div className="text-center mb-4">
        <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-5xl mb-1 inline-block">
          {tab === "league" ? data.league.emoji : "🤝"}
        </motion.div>
        <h1 className="text-3xl font-black" style={{ color: tab === "league" ? data.league.color : "#9B5DE5" }}>
          {tab === "league" ? `${data.league.name} League` : "Friends Leaderboard"}
        </h1>
        <p className="font-bold text-muted-foreground">
          {tab === "league"
            ? `Top 5 advance · bottom 5 drop · ${daysLeft} day${daysLeft === 1 ? "" : "s"} left`
            : "Weekly XP among your study friends"}
        </p>
      </div>

      {/* tabs */}
      <div className="flex gap-2 mb-4 justify-center">
        {(
          [
            { id: "league", label: `${data.league.emoji} League` },
            { id: "friends", label: "🤝 Friends" },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            onClick={() => {
              sfx.tap()
              haptics.tap()
              setTab(t.id)
            }}
            className={`btn3d px-4 py-2 text-sm border-2 border-b-4 ${
              tab === t.id ? "bg-ink text-white border-[#242424] shadow-[0_3px_0_#242424]" : "bg-white border-paper-border text-muted-foreground hover:bg-secondary"
            }`}
            aria-pressed={tab === t.id}
          >
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
          {tab === "league" ? (
            <>
              {/* promotion / demotion legend */}
              <div className="flex gap-2 mb-4 text-xs font-black">
                <span className="flex items-center gap-1.5 bg-duo-green/10 text-duo-green-dark rounded-full px-3 py-1.5">
                  <TrendingUp className="w-3.5 h-3.5" /> Promotion zone
                </span>
                <span className="flex items-center gap-1.5 bg-duo-red/10 text-duo-red rounded-full px-3 py-1.5">
                  <TrendingDown className="w-3.5 h-3.5" /> Demotion zone
                </span>
              </div>

              {/* table */}
              <div className="bg-white rounded-3xl border-2 border-paper-border shadow-[0_5px_0_#e8e0c8] overflow-hidden">
                {data.entries.map((e, i) => (
                  <motion.div
                    key={`${e.displayName}-${i}`}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className={`flex items-center gap-3 px-4 py-3 border-b border-paper-border/60 ${
                      e.isCurrentUser ? "bg-duo-green/10" : i < 5 ? "bg-duo-green/[0.04]" : ""
                    } ${e.demotion ? "bg-duo-red/[0.05]" : ""}`}
                  >
                    <span className={`w-8 text-center font-black text-lg ${e.rank <= 3 ? "text-duo-gold-dark" : "text-muted-foreground"}`}>
                      {e.rank}
                    </span>
                    <span className="w-10 h-10 rounded-full bg-secondary grid place-items-center text-xl shrink-0">{e.avatarEmoji}</span>
                    <span className="font-extrabold truncate flex-1">
                      {e.displayName}
                      {e.isCurrentUser && <span className="text-duo-green-dark"> (you)</span>}
                    </span>
                    {e.promotion && !e.isCurrentUser && <span className="text-duo-green text-sm">⬆</span>}
                    {e.demotion && <span className="text-duo-red text-sm">⬇</span>}
                    <span className="font-black tabular-nums text-duo-gold-dark">{e.xp} XP</span>
                  </motion.div>
                ))}
              </div>
            </>
          ) : (
            <div className="bg-white rounded-3xl border-2 border-paper-border shadow-[0_5px_0_#e8e0c8] overflow-hidden">
              {data.friends.length <= 1 ? (
                <div className="text-center py-12 px-6">
                  <Users className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                  <h3 className="font-black text-lg">No friends on the board yet</h3>
                  <p className="text-sm font-bold text-muted-foreground mt-1">
                    Add friends from the Friends page and compare streaks and weekly XP here.
                  </p>
                </div>
              ) : (
                data.friends.map((e, i) => {
                  const avatar = parseAvatar(e.avatar)
                  return (
                    <motion.div
                      key={`${e.name}-${i}`}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className={`flex items-center gap-3 px-4 py-3 border-b border-paper-border/60 ${e.isCurrentUser ? "bg-duo-green/10" : ""}`}
                    >
                      <span className={`w-8 text-center font-black text-lg ${e.rank <= 3 ? "text-duo-gold-dark" : "text-muted-foreground"}`}>
                        {e.rank}
                      </span>
                      {avatar ? (
                        <AvatarSvg config={avatar} size={40} />
                      ) : (
                        <span className="w-10 h-10 rounded-full bg-secondary grid place-items-center text-xl shrink-0">👤</span>
                      )}
                      <span className="font-extrabold truncate flex-1">
                        {e.name.replace(" (you)", "")}
                        {e.isCurrentUser && <span className="text-duo-green-dark"> (you)</span>}
                      </span>
                      <span className="font-black tabular-nums text-duo-gold-dark">{e.xp} XP</span>
                    </motion.div>
                  )
                })
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* league ladder */}
      {tab === "league" && (
        <div className="mt-6">
          <h2 className="font-black mb-2 text-center text-sm uppercase tracking-wider text-muted-foreground">The Ten Leagues</h2>
          <div className="flex flex-wrap justify-center gap-2">
            {data.leagues.map((l) => (
              <div
                key={l.name}
                title={l.locked ? `${l.name} — locked` : l.name}
                className={`w-12 h-12 rounded-2xl grid place-items-center text-xl border-2 ${
                  l.order === data.league.order
                    ? "bg-duo-gold/20 border-duo-gold scale-110"
                    : l.locked
                      ? "bg-white border-paper-border opacity-45"
                      : "bg-white border-paper-border"
                }`}
              >
                {l.locked ? <Lock className="w-4 h-4 text-muted-foreground" /> : l.emoji}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-center">
        <Mascot mood="cheer" size={84} />
      </div>
      <p className="text-center text-xs font-bold text-muted-foreground mt-2">
        Earn XP in lessons, Bible reading and community life to climb the standings!
      </p>
    </div>
  )
}
