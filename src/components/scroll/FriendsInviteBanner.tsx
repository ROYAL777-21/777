"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { Gift, Share2 } from "lucide-react"
import { useAppStore } from "@/lib/client/store"
import { sfx } from "@/lib/client/sound"
import { haptics } from "@/lib/client/haptics"

// ═══════════════════════════════════════════════════════════════
//  FRIENDS INVITE BANNER (v9)
//
//  The referral loop's most natural home: the moment you're looking
//  at friends, you remember the friend who isn't here yet. One
//  share button, warm copy, zero pressure — the rewards speak for
//  themselves.
// ═══════════════════════════════════════════════════════════════

type ReferralPayload = {
  code: string
  link: string
  joins: number
}

export function FriendsInviteBanner() {
  const pushToast = useAppStore((s) => s.pushToast)
  const qc = useQueryClient()

  const { data } = useQuery<ReferralPayload>({
    queryKey: ["referral"],
    queryFn: async () => (await fetch("/api/referral")).json(),
  })

  const trackShare = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/referral", {
        method: "POST",
        body: JSON.stringify({ action: "share" }),
      })
      return { ok: res.ok }
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["referral"] })
    },
  })

  const link = data?.link ?? "https://scroll.academy/join"
  const joins = data?.joins ?? 0

  const share = async () => {
    sfx.tap()
    haptics.tap()
    trackShare.mutate()
    const text = `I'm learning the Bible five minutes a day on Scroll Academy — Greek, Hebrew, the whole story. Join me: ${link}`
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "Scroll Academy", text, url: link })
        return
      } catch {
        /* dismissed — fall through to copy */
      }
    }
    void navigator.clipboard?.writeText(text).catch(() => undefined)
    pushToast("Invite copied 🔗", "Send it to a friend — you'll both be rewarded when they join.", "🎁")
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-duo-purple to-[#7C3AED] text-white rounded-3xl border-2 border-[#5B21B6] shadow-[0_5px_0_#5B21B6] p-4 mb-5 flex items-center gap-4"
    >
      <span className="w-12 h-12 rounded-2xl bg-white/15 border-2 border-white/25 grid place-items-center text-2xl shrink-0">
        🎁
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-black leading-tight">Bring a friend on the journey</p>
        <p className="text-xs font-bold text-white/85 leading-snug mt-0.5">
          They start with +100 gems. You earn +50 more for each friend — and a
          free Pro month whenever one subscribes.
          {joins > 0 && <span className="text-duo-gold"> {joins} joined so far.</span>}
        </p>
        <p className="text-[10px] font-bold text-white/60 mt-1">
          “Two are better than one.” — Ecclesiastes 4:9
        </p>
      </div>
      <button
        onClick={share}
        className="btn3d bg-white text-duo-purple shadow-[0_4px_0_#d8d0b5] px-4 py-2.5 text-sm font-black flex items-center gap-1.5 shrink-0"
      >
        <Share2 className="w-4 h-4" />
        <span className="hidden sm:inline">Share invite</span>
        <span className="sm:hidden">Invite</span>
      </button>
    </motion.div>
  )
}
