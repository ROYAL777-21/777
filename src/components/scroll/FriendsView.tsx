"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion"
import { Check, UserMinus, UserPlus, Users, X, Clock, Flame, Zap } from "lucide-react"
import { parseAvatar } from "@/lib/avatar"
import { useAppStore } from "@/lib/client/store"
import { sfx } from "@/lib/client/sound"
import { haptics } from "@/lib/client/haptics"
import type { BotDTO, FriendsPayload } from "@/lib/types"
import { AvatarSvg } from "./AvatarSvg"
import { useRefreshApp } from "./ScrollApp"

export function FriendsView() {
  const [tab, setTab] = useState<"friends" | "add">("friends")

  return (
    <div className="px-3 sm:px-5 pt-5 pb-6">
      <div className="max-w-2xl mx-auto">
        <header className="mb-4">
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
            <Users className="w-8 h-8 text-duo-purple" /> Friends
          </h1>
          <p className="text-muted-foreground font-bold text-sm mt-1">Encourage one another — streaks, quests and study side by side</p>
        </header>

        <div className="flex gap-2 mb-5">
          {(
            [
              { id: "friends", label: "My friends" },
              { id: "add", label: "Add friends" },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => {
                sfx.tap()
                setTab(t.id)
              }}
              className={`btn3d px-4 py-2.5 text-sm border-2 border-b-4 ${
                tab === t.id ? "bg-duo-purple text-white border-duo-purple-dark shadow-[0_3px_0_#7c3aed]" : "bg-white border-paper-border text-muted-foreground hover:bg-secondary"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
            {tab === "friends" ? <FriendsList /> : <AddFriends />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

function BotCard({
  bot,
  actions,
}: {
  bot: BotDTO
  actions?: React.ReactNode
}) {
  const avatar = parseAvatar(bot.avatar)
  return (
    <div className="bg-white rounded-3xl border-2 border-paper-border shadow-[0_4px_0_#e8e0c8] p-4 flex items-center gap-3">
      {avatar ? (
        <AvatarSvg config={avatar} size={56} />
      ) : (
        <span className="w-14 h-14 rounded-full bg-secondary grid place-items-center text-2xl">👤</span>
      )}
      <div className="min-w-0 flex-1">
        <p className="font-black leading-tight flex items-center gap-1.5">
          {bot.name} <span className="text-sm">{bot.country}</span>
        </p>
        <p className="text-xs font-bold text-muted-foreground line-clamp-2 mt-0.5">{bot.bio}</p>
        <div className="flex gap-2 mt-1.5">
          <span className="inline-flex items-center gap-1 text-[11px] font-black text-duo-red">
            <Flame className="w-3.5 h-3.5" /> {bot.streak}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-black text-duo-gold-dark">
            <Zap className="w-3.5 h-3.5" /> {bot.weeklyXp} XP this week
          </span>
        </div>
      </div>
      {actions && <div className="shrink-0 flex flex-col gap-2">{actions}</div>}
    </div>
  )
}

function FriendsList() {
  const { data, isLoading } = useQuery<FriendsPayload>({ queryKey: ["friends"], refetchInterval: 15_000 })
  const qc = useQueryClient()
  const refreshApp = useRefreshApp()
  const pushToast = useAppStore((s) => s.pushToast)

  const act = useMutation({
    mutationFn: async ({ botId, action }: { botId: string; action: string }) => {
      const res = await fetch("/api/friends", { method: "POST", body: JSON.stringify({ botId, action }) })
      if (!res.ok) throw new Error("failed")
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["friends"] })
      void qc.invalidateQueries({ queryKey: ["leaderboard"] })
      void qc.invalidateQueries({ queryKey: ["profile"] })
      refreshApp()
    },
  })

  if (isLoading) {
    return <p className="text-center font-black text-muted-foreground py-10">Gathering the fellowship…</p>
  }

  const friends = data?.friends ?? []
  const requests = data?.requests ?? []

  return (
    <div className="space-y-5">
      {requests.length > 0 && (
        <section aria-label="Friend requests">
          <h2 className="font-black text-sm uppercase tracking-wider text-muted-foreground mb-2">Requests</h2>
          <div className="space-y-2.5">
            {requests.map((b) => (
              <BotCard
                key={b.id}
                bot={b}
                actions={
                  <>
                    <button
                      onClick={() => {
                        sfx.correct()
                        haptics.tap()
                        act.mutate({ botId: b.id, action: "accept" })
                        pushToast("New friend! 🤝", `You and ${b.name} are now study friends.`, "🤝")
                      }}
                      className="btn3d bg-duo-green text-white shadow-[0_3px_0_#46a302] px-3 py-2 text-xs flex items-center gap-1"
                    >
                      <Check className="w-4 h-4" /> Accept
                    </button>
                    <button
                      onClick={() => {
                        sfx.tap()
                        act.mutate({ botId: b.id, action: "decline" })
                      }}
                      className="btn3d bg-white border-2 border-paper-border text-muted-foreground px-3 py-2 text-xs flex items-center gap-1"
                    >
                      <X className="w-4 h-4" /> Decline
                    </button>
                  </>
                }
              />
            ))}
          </div>
        </section>
      )}

      <section aria-label="My friends">
        <h2 className="font-black text-sm uppercase tracking-wider text-muted-foreground mb-2">
          My friends {friends.length > 0 && <span className="text-muted-foreground/60">· {friends.length}</span>}
        </h2>
        {friends.length === 0 ? (
          <div className="text-center py-12 px-6 bg-white rounded-3xl border-2 border-paper-border">
            <div className="text-5xl mb-3">🤝</div>
            <h3 className="font-black text-lg">No friends yet</h3>
            <p className="text-sm font-bold text-muted-foreground mt-1">
              Switch to “Add friends” and send some requests — iron sharpens iron.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {friends.map((b) => (
              <BotCard
                key={b.id}
                bot={b}
                actions={
                  <button
                    onClick={() => {
                      sfx.tap()
                      act.mutate({ botId: b.id, action: "remove" })
                      pushToast("Friend removed", `${b.name} was removed from your friends.`, "👋")
                    }}
                    className="btn3d bg-white border-2 border-paper-border text-muted-foreground px-3 py-2 text-xs flex items-center gap-1"
                    aria-label={`Remove ${b.name}`}
                  >
                    <UserMinus className="w-4 h-4" />
                  </button>
                }
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function AddFriends() {
  const { data, isLoading } = useQuery<FriendsPayload>({ queryKey: ["friends"], refetchInterval: 15_000 })
  const qc = useQueryClient()
  const pushToast = useAppStore((s) => s.pushToast)
  const [sent, setSent] = useState<Set<string>>(new Set())

  const add = useMutation({
    mutationFn: async (botId: string) => {
      const res = await fetch("/api/friends", { method: "POST", body: JSON.stringify({ botId, action: "add" }) })
      if (!res.ok) throw new Error("failed")
    },
    onSuccess: (_d, botId) => {
      setSent((s) => new Set([...s, botId]))
      sfx.correct()
      haptics.tap()
      pushToast("Request sent 📨", "They usually reply quickly — watch your notifications.", "📨")
      void qc.invalidateQueries({ queryKey: ["friends"] })
    },
  })

  if (isLoading) return <p className="text-center font-black text-muted-foreground py-10">Scanning the study hall…</p>

  const suggestions = data?.suggestions ?? []

  return (
    <div className="space-y-5">
      <div className="bg-duo-purple/10 border-2 border-duo-purple/30 rounded-2xl p-4 text-sm font-bold text-duo-purple-dark">
        📨 Requests you send are usually accepted within moments. Friends appear on your Friends leaderboard and light up your community feed.
      </div>

      <section aria-label="People you may know">
        <h2 className="font-black text-sm uppercase tracking-wider text-muted-foreground mb-2">People you may know</h2>
        {suggestions.length === 0 ? (
          <p className="text-center font-black text-muted-foreground py-8">You&apos;ve added everyone in the hall — for now! 🎉</p>
        ) : (
          <div className="space-y-2.5">
            {suggestions.map((b) => {
              const isSent = sent.has(b.id)
              return (
                <BotCard
                  key={b.id}
                  bot={b}
                  actions={
                    <button
                      onClick={() => add.mutate(b.id)}
                      disabled={isSent || add.isPending}
                      className={`btn3d px-4 py-2 text-xs flex items-center gap-1.5 ${
                        isSent ? "bg-secondary text-muted-foreground" : "bg-duo-purple text-white shadow-[0_3px_0_#7c3aed]"
                      }`}
                    >
                      {isSent ? <Clock className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                      {isSent ? "Sent" : "Add"}
                    </button>
                  }
                />
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
