"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { Flame, Gem, Heart, Bell } from "lucide-react"
import { useAppStore } from "@/lib/client/store"
import { sfx } from "@/lib/client/sound"
import { haptics } from "@/lib/client/haptics"
import type { BootstrapCourse, BootstrapUser, NotificationDTO } from "@/lib/types"
import { HeartsModal } from "./HeartsModal"
import { NotificationCenter } from "./NotificationCenter"

export function TopBar({ user, activeCourse }: { user: BootstrapUser; activeCourse: BootstrapCourse }) {
  const setView = useAppStore((s) => s.setView)
  const [heartsOpen, setHeartsOpen] = useState(false)
  const [bellOpen, setBellOpen] = useState(false)

  const { data: notif } = useQuery<{ notifications: NotificationDTO[]; unread: number }>({
    queryKey: ["notifications"],
    refetchInterval: bellOpen ? 8000 : false,
  })

  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b-2 border-paper-border">
      <div className="max-w-[1100px] mx-auto px-3 sm:px-5 h-16 flex items-center gap-2 sm:gap-4">
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

        {/* streak */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => {
            sfx.tap()
            haptics.tap()
            setView("profile")
          }}
          className="flex items-center gap-1.5 font-black"
          title={`${user.streak}-day streak`}
          aria-label={`${user.streak} day streak`}
        >
          <motion.span
            className={user.streak > 0 ? "text-2xl animate-flicker" : "text-2xl opacity-40 grayscale"}
            animate={user.streak > 0 ? { scale: [1, 1.12, 1] } : {}}
            transition={{ duration: 1.6, repeat: Infinity }}
          >
            🔥
          </motion.span>
          <span className="text-lg tabular-nums">{user.streak}</span>
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
          <span className="text-lg tabular-nums">{user.gems}</span>
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
          title={`${user.hearts} hearts`}
          aria-label={`${user.hearts} of 5 hearts`}
        >
          <Heart className={`w-6 h-6 text-duo-red fill-duo-red transition-opacity ${user.hearts === 0 ? "opacity-30" : ""}`} />
          <span className="text-lg tabular-nums">{user.hearts}</span>
        </motion.button>

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

      <HeartsModal open={heartsOpen} onClose={() => setHeartsOpen(false)} />
    </header>
  )
}
