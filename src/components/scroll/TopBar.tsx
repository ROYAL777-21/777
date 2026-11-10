"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { Flame, Gem, Heart, Bell, Crown } from "lucide-react"
import { useAppStore } from "@/lib/client/store"
import { sfx } from "@/lib/client/sound"
import { haptics } from "@/lib/client/haptics"
import { CountUp } from "@/components/motion/CountUp"
import { useJuice } from "@/lib/motion/MotionPrefs"
import type { BootstrapCourse, BootstrapUser, NotificationDTO } from "@/lib/types"
import { HeartsModal } from "./HeartsModal"
import { NotificationCenter } from "./NotificationCenter"

export function TopBar({ user, activeCourse }: { user: BootstrapUser; activeCourse: BootstrapCourse }) {
  const setView = useAppStore((s) => s.setView)
  const openPaywall = useAppStore((s) => s.openPaywall)
  const [heartsOpen, setHeartsOpen] = useState(false)
  const [bellOpen, setBellOpen] = useState(false)
  const juice = useJuice()

  // v11.5 — streak at risk: a streak exists, today isn't logged yet.
  // The flame doesn't shame (fear is banned) — it flickers faster and carries
  // a gentle "one lesson saves it" note. Saved = normal flame.
  const todayLocal = new Date().toLocaleDateString("en-CA") // YYYY-MM-DD
  const streakAtRisk = user.streak > 0 && !!user.lastActiveDay && user.lastActiveDay !== todayLocal

  // v11.4: when the streak grows, the flame ignites (pop + ring)
  const [streakPop, setStreakPop] = useState(0)
  const prevStreak = useRef(user.streak)
  useEffect(() => {
    if (user.streak > prevStreak.current) setStreakPop((k) => k + 1)
    prevStreak.current = user.streak
  }, [user.streak])

  const { data: notif } = useQuery<{ notifications: NotificationDTO[]; unread: number }>({
    queryKey: ["notifications"],
    refetchInterval: bellOpen ? 8000 : false,
  })

  return (
    <>
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b-2 border-paper-border pt-[env(safe-area-inset-top)]">
      <div className="max-w-[1100px] mx-auto px-2.5 sm:px-5 h-14 sm:h-16 flex items-center gap-1.5 sm:gap-4">
        {/* logo */}
        <button
          onClick={() => {
            sfx.tap()
            haptics.tap()
            setView("learn")
          }}
          className="flex items-center gap-2 min-w-0"
          aria-label="Scroll Academy home"
        >
          <img src="/scroll-icon.svg" alt="" className="w-9 h-9 rounded-xl shrink-0" />
          <span className="hidden sm:block font-black text-lg tracking-tight">
            Scroll<span className="text-duo-green">Academy</span>
          </span>
        </button>

        {/* course pill */}
        <button
          onClick={() => {
            sfx.tap()
            haptics.tap()
            setView("courses")
          }}
          className="flex items-center gap-2 bg-white border-2 border-paper-border rounded-full pl-1.5 pr-3 py-1 hover:bg-secondary transition-colors"
          aria-label="Switch course"
        >
          <span
            className="w-8 h-8 rounded-full grid place-items-center text-lg"
            style={{ backgroundColor: activeCourse.color + "22" }}
          >
            {activeCourse.emoji}
          </span>
          <span className="hidden md:block text-sm font-extrabold">{activeCourse.title}</span>
          <span className="text-muted-foreground text-xs font-black">▾</span>
        </button>

        <div className="flex-1" />

        {/* streak — v11.5: the at-risk flame flickers faster and carries
            a red halo; the call is hope ("one lesson saves it"), not fear */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => {
            sfx.tap()
            haptics.tap()
            setView(streakAtRisk ? "learn" : "profile")
          }}
          className="relative flex items-center gap-1.5 font-black"
          title={streakAtRisk ? `${user.streak}-day streak — one lesson today keeps the flame lit` : `${user.streak}-day streak`}
          aria-label={streakAtRisk ? `${user.streak} day streak at risk — one lesson today keeps it` : `${user.streak} day streak`}
        >
          {streakAtRisk && juice && (
            <motion.span
              className="absolute left-[-6px] top-0 w-9 h-9 rounded-full border-4 border-duo-red"
              animate={{ scale: [0.7, 1.5], opacity: [0.75, 0] }}
              transition={{ duration: 1.1, repeat: Infinity, ease: "easeOut" }}
              aria-hidden="true"
            />
          )}
          <motion.span
            className={`text-2xl ${streakAtRisk ? "animate-flicker-fast" : user.streak > 0 ? "animate-flicker" : "opacity-40 grayscale"}`}
            animate={user.streak > 0 ? { scale: streakAtRisk ? [1, 1.22, 0.96, 1] : [1, 1.12, 1] } : {}}
            transition={{ duration: streakAtRisk ? 0.9 : 1.6, repeat: Infinity }}
          >
            🔥
          </motion.span>
          {streakAtRisk && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-duo-red text-white text-[10px] font-black grid place-items-center"
              aria-hidden="true"
            >
              !
            </motion.span>
          )}
          {/* v11.4: ignition ring when the streak grows */}
          {streakPop > 0 && juice && (
            <motion.span
              key={streakPop}
              className="absolute left-[-6px] top-0 w-9 h-9 rounded-full border-4 border-duo-gold"
              initial={{ scale: 0.4, opacity: 0.9 }}
              animate={{ scale: 1.9, opacity: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              aria-hidden="true"
            />
          )}
          <CountUp value={user.streak} className="text-lg tabular-nums" />
        </motion.button>

        {/* gems */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => {
            sfx.tap()
            haptics.tap()
            setView("shop")
          }}
          className="flex items-center gap-1.5 font-black"
          title={`${user.gems} gems`}
          aria-label={`${user.gems} gems`}
        >
          <Gem className="w-6 h-6 text-duo-gold fill-duo-gold" />
          <CountUp value={user.gems} className="text-lg tabular-nums" />
        </motion.button>

        {/* hearts */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => {
            sfx.tap()
            haptics.tap()
            setHeartsOpen(true)
          }}
          className="flex items-center gap-1.5 font-black"
          title={user.isPro ? "Unlimited hearts (Scroll Pro)" : `${user.hearts} hearts`}
          aria-label={user.isPro ? "Unlimited hearts" : `${user.hearts} of 5 hearts`}
        >
          {user.isPro ? (
            <Heart className="w-6 h-6 text-duo-red fill-duo-red" />
          ) : (
            <Heart className={`w-6 h-6 text-duo-red fill-duo-red transition-opacity ${user.hearts === 0 ? "opacity-30" : ""}`} />
          )}
          <span className="text-lg tabular-nums">{user.isPro ? "∞" : user.hearts}</span>
        </motion.button>

        {/* Scroll Pro crown */}
        {user.isPro ? (
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => {
              sfx.tap()
              haptics.tap()
              setView("profile")
            }}
            className="p-1.5 bg-duo-gold/15 rounded-xl"
            title="Scroll Pro member"
            aria-label="Scroll Pro member"
          >
            <Crown className="w-5 h-5 text-duo-gold-dark fill-duo-gold" />
          </motion.button>
        ) : (
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => {
              sfx.tap()
              haptics.tap()
              openPaywall("general")
            }}
            className="relative flex items-center gap-1.5 bg-duo-gold text-[#5c4500] border-b-[3px] border-[#d9a400] rounded-xl pl-2 pr-2.5 py-1.5 font-black text-sm"
            title="Scroll Pro — every course, unlimited hearts"
            aria-label="Upgrade to Scroll Pro"
          >
            {/* v11.4: a gentle pulse invites the tap */}
            {juice && (
              <motion.span
                className="absolute inset-0 rounded-xl bg-duo-gold/40"
                animate={{ scale: [1, 1.14], opacity: [0.55, 0] }}
                transition={{ duration: 1.9, repeat: Infinity, ease: "easeOut" }}
                aria-hidden="true"
              />
            )}
            <Crown className="w-4 h-4" />
            <span className="hidden xs:inline sm:inline">PRO</span>
          </motion.button>
        )}

        {/* notifications */}
        <div className="relative">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => {
              sfx.tap()
              haptics.tap()
              setBellOpen((o) => !o)
            }}
            className="relative p-2 hover:bg-secondary rounded-xl transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-6 h-6" />
            {(notif?.unread ?? 0) > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 rounded-full bg-duo-red text-white text-xs font-black grid place-items-center"
              >
                {notif!.unread}
              </motion.span>
            )}
          </motion.button>
          <NotificationCenter open={bellOpen} onClose={() => setBellOpen(false)} />
        </div>
      </div>
    </header>
    {/* portal to body: the header's backdrop-blur makes it the containing block
        for position:fixed descendants, which would break the modals */}
    {typeof document !== "undefined" && createPortal(
      <>
        <HeartsModal open={heartsOpen} onClose={() => setHeartsOpen(false)} />
      </>,
      document.body,
    )}
    </>
  )
}
