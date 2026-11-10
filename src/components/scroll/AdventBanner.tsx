"use client"

// ═══════════════════════════════════════════════════════════════
//  AdventBanner — the in-app face of the Advent/Christmas gift
//  campaign. Shows on the Learn path while the campaign runs
//  (Nov 23 → Jan 6), one dismissal per day, and opens the
//  gift-only checkout (paywall context "gift").
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Gift, X } from "lucide-react"
import { useAppStore } from "@/lib/client/store"
import { sfx } from "@/lib/client/sound"
import { haptics } from "@/lib/client/haptics"
import { engineTrack } from "@/lib/client/engine"
import { bannerCopy, campaignActive } from "@/lib/campaign"

const DISMISS_KEY = "sb_advent_banner_dismissed"

function dismissedToday(): boolean {
  if (typeof window === "undefined") return true
  try {
    return window.localStorage.getItem(DISMISS_KEY) === new Date().toISOString().slice(0, 10)
  } catch {
    return false
  }
}

export function AdventBanner() {
  const openPaywall = useAppStore((s) => s.openPaywall)
  const [visible, setVisible] = useState(false)

  // mount after hydration; the campaign window is date-driven. The
  // storage read happens off the render path (React 19: no sync
  // setState inside effects)
  useEffect(() => {
    const t = setTimeout(() => {
      if (!campaignActive() || dismissedToday()) return
      setVisible(true)
      engineTrack("campaign_banner_view", { campaign: "advent", phase: bannerCopy()?.tag ?? "" })
    }, 0)
    return () => clearTimeout(t)
  }, [])

  if (!visible) return null
  const copy = bannerCopy()
  if (!copy) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4 mx-3 sm:mx-5 relative overflow-hidden rounded-3xl border-2 border-[#c98a5e] bg-gradient-to-br from-[#fff3e4] via-[#ffe8d1] to-[#f9dcc4] shadow-[0_5px_0_#e3c9a8] p-4"
      role="region"
      aria-label="Advent gift campaign"
    >
      <div className="absolute -right-3 -top-4 text-[80px] opacity-15 select-none" aria-hidden>
        🕯️
      </div>
      <div className="relative flex items-center gap-3.5">
        <span className="w-12 h-12 shrink-0 rounded-2xl bg-white/70 border-2 border-[#e3c9a8] grid place-items-center">
          <Gift className="w-6 h-6 text-[#b45309]" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-black uppercase tracking-wider text-[#b45309]">{copy.tag}</p>
          <p className="font-black leading-tight">{copy.title}</p>
          <p className="text-xs font-bold text-[#7c5a3a] leading-snug mt-0.5 line-clamp-2">{copy.body}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <button
            onClick={() => {
              sfx.correct()
              haptics.light()
              engineTrack("campaign_banner_cta", { campaign: "advent" })
              openPaywall("gift")
            }}
            className="btn3d bg-[#b45309] text-white shadow-[0_4px_0_#7c3a10] px-4 py-2.5 text-sm font-black whitespace-nowrap"
          >
            {copy.cta}
          </button>
          <button
            onClick={() => {
              sfx.tap()
              try {
                window.localStorage.setItem(DISMISS_KEY, new Date().toISOString().slice(0, 10))
              } catch {
                /* ignore */
              }
              setVisible(false)
            }}
            className="text-[#7c5a3a]/70 hover:text-[#7c5a3a] p-1 -mb-1"
            aria-label="Hide the campaign banner until tomorrow"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
