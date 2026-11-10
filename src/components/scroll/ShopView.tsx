"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { Gem, Zap, Check, Crown } from "lucide-react"
import { useAppStore } from "@/lib/client/store"
import { sfx } from "@/lib/client/sound"
import { haptics } from "@/lib/client/haptics"
import type { ShopPayload } from "@/lib/types"
import { useRefreshApp } from "./ScrollApp"
import { Mascot } from "./Mascot"

export function ShopView() {
  const qc = useQueryClient()
  const refreshApp = useRefreshApp()
  const pushToast = useAppStore((s) => s.pushToast)
  const openPaywall = useAppStore((s) => s.openPaywall)
  const [busy, setBusy] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  const { data, isLoading } = useQuery<ShopPayload>({ queryKey: ["shop"] })
  const { data: boot } = useQuery<{ user: { isPro: boolean } }>({ queryKey: ["bootstrap"] })
  const isPro = boot?.user.isPro ?? false

  const buy = useMutation({
    mutationFn: async (slug: string) => {
      const res = await fetch("/api/shop", { method: "POST", body: JSON.stringify({ slug }) })
      const body = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) throw new Error(body.error ?? "purchase failed")
      return body
    },
    onMutate: (slug) => setBusy(slug),
    onSettled: () => setBusy(null),
    onSuccess: (_d, slug) => {
      sfx.gem()
      haptics.complete()
      const item = data?.items.find((i) => i.slug === slug)
      pushToast(
        `${item?.icon ?? "✨"} ${item?.name ?? "Item"} equipped!`,
        slug === "streak_freeze"
          ? "Your streak survives one missed day."
          : slug === "heart_refill"
            ? "All hearts restored."
            : "Double XP active for 15 minutes!",
        item?.icon
      )
      setErr(null)
      refreshApp()
      void qc.invalidateQueries({ queryKey: ["shop"] })
    },
    onError: (e) => {
      sfx.wrong()
      haptics.wrong()
      setErr((e as Error).message)
    },
  })

  return (
    <div className="p-3 sm:p-5 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-3xl font-black">Shop</h1>
        <div className="flex items-center gap-1.5 bg-white border-2 border-paper-border rounded-full px-4 py-2 font-black shadow-[0_3px_0_#e8e0c8]">
          <Gem className="w-5 h-5 text-duo-gold fill-duo-gold" />
          <span className="tabular-nums">{data?.gems ?? "…"}</span>
        </div>
      </div>

      {/* Scroll Pro — the whole store in one tap (Hormozi: bundle > à la carte) */}
      {!isPro && (
        <motion.button
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            sfx.tap()
            haptics.tap()
            openPaywall("shop")
          }}
          className="mb-4 w-full text-left bg-gradient-to-br from-[#FFC800] to-[#FFB800] rounded-3xl border-2 border-[#d9a400] shadow-[0_5px_0_#d9a400] p-5 flex items-center gap-4"
        >
          <span className="w-14 h-14 rounded-2xl bg-white/40 grid place-items-center shrink-0">
            <Crown className="w-8 h-8 text-[#5c4500]" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-black text-lg text-[#3d2f00]">One quiet price for everything</span>
            <span className="block text-sm font-bold text-[#5c4500] leading-snug">
              Unlimited hearts, 2× XP weekends, Streak Repair ×2/mo, all 18 courses — $39.99 a year, 7-day free trial.
            </span>
          </span>
          <span className="shrink-0 bg-[#5c4500] text-duo-gold font-black text-sm rounded-xl px-3 py-2">Go Pro</span>
        </motion.button>
      )}

      {err && (
        <div className="bg-duo-red/10 border-2 border-duo-red/40 text-duo-red font-extrabold rounded-2xl p-3 mb-4 text-sm">
          {err === "not enough gems" ? "Not enough gems — complete quests and lessons to earn more!" : err}
        </div>
      )}

      {isLoading ? (
        <div className="p-8 text-center font-black text-muted-foreground">Opening the vault…</div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {data?.items.map((item, i) => {
            const owned = item.owned
            const maxed = item.slug === "streak_freeze" && owned >= 2
            return (
              <motion.div
                key={item.slug}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-white rounded-3xl border-2 border-paper-border shadow-[0_5px_0_#e8e0c8] p-5 flex flex-col"
              >
                <div className="text-4xl mb-2 text-center">
                  <motion.span
                    animate={{ rotate: [0, -6, 6, 0] }}
                    transition={{ duration: 3 + i, repeat: Infinity }}
                    className="inline-block"
                  >
                    {item.icon}
                  </motion.span>
                </div>
                <h2 className="font-black text-lg text-center">{item.name}</h2>
                <p className="text-sm font-semibold text-muted-foreground text-center leading-snug mb-3 flex-1">
                  {item.description}
                </p>

                {item.slug === "streak_freeze" && owned > 0 && (
                  <p className="text-center text-xs font-black text-duo-purple mb-2">
                    Equipped: {owned}/2 ❄️
                  </p>
                )}

                <button
                  onClick={() => buy.mutate(item.slug)}
                  disabled={busy === item.slug || maxed || (data?.gems ?? 0) < item.price}
                  className={`btn3d w-full py-3 flex items-center justify-center gap-2 ${
                    maxed
                      ? "bg-[#b7b2a0] text-white/80 shadow-[0_4px_0_#c9c0a4]"
                      : "bg-duo-green text-white shadow-[0_4px_0_#46a302] disabled:bg-[#dcd5bd] disabled:shadow-[0_4px_0_#c9c0a4] disabled:text-white/70"
                  }`}
                >
                  {maxed ? (
                    <>
                      <Check className="w-4 h-4" /> Max equipped
                    </>
                  ) : (
                    <>
                      <Gem className="w-4 h-4" /> {item.price}
                    </>
                  )}
                </button>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* earn gems hint */}
      <div className="mt-5 bg-white rounded-3xl border-2 border-paper-border shadow-[0_5px_0_#e8e0c8] p-5 flex items-center gap-4">
        <Mascot mood="think" size={76} />
        <div>
          <h2 className="font-black">Need more gems? 💎</h2>
          <p className="text-sm font-bold text-muted-foreground">
            Lessons pay ~12 gems, quests pay 15 each, unit chests pay 30, and achievements pay up to 250.
            <span className="block mt-1 text-duo-green-dark">Study more → earn more. It&apos;s a virtuous cycle!</span>
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2 text-xs font-black text-muted-foreground">
        <Zap className="w-3.5 h-3.5" /> Everything in Scroll Academy is free — gems are earned, never bought.
      </div>
    </div>
  )
}
