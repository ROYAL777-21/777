"use client"

import { useState } from "react"
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion"
import { Heart, Zap, Dumbbell, Crown } from "lucide-react"
import { useAppStore } from "@/lib/client/store"
import { sfx } from "@/lib/client/sound"
import { haptics } from "@/lib/client/haptics"
import { useRefreshApp } from "./ScrollApp"
import { Mascot } from "./Mascot"

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  })
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(body.error ?? "request failed")
  }
  return res.json() as Promise<T>
}

export function HeartsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qc = useQueryClient()
  const refreshApp = useRefreshApp()
  const setView = useAppStore((s) => s.setView)
  const pushToast = useAppStore((s) => s.pushToast)
  const openPaywall = useAppStore((s) => s.openPaywall)
  const [error, setError] = useState<string | null>(null)

  const { data: shop } = useQuery<{ gems: number; items: { slug: string; price: number; icon: string; name: string }[] }>({
    queryKey: ["shop"],
  })
  const { data: boot } = useQuery<{ user: { hearts: number; nextHeartAt: string | null; isPro: boolean } }>({
    queryKey: ["bootstrap"],
  })
  const isPro = boot?.user.isPro ?? false

  const refill = useMutation({
    mutationFn: () => api("/api/shop", { method: "POST", body: JSON.stringify({ slug: "heart_refill" }) }),
    onSuccess: () => {
      sfx.gem()
      haptics.complete()
      pushToast("Hearts refilled! ❤️", "Back to the books — all 5 hearts restored.", "❤️")
      refreshApp()
      void qc.invalidateQueries({ queryKey: ["shop"] })
      onClose()
    },
    onError: (e) => setError((e as Error).message),
  })

  const price = shop?.items.find((i) => i.slug === "heart_refill")?.price ?? 350
  const hearts = boot?.user.hearts ?? 5

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] bg-black/40 flex items-end sm:items-center justify-center p-3 sm:p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 60, scale: 0.96, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 60, scale: 0.96, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl border-2 border-paper-border w-full max-w-md p-6 text-center shadow-[0_6px_0_#e8e0c8]"
            role="dialog"
            aria-label="Hearts"
          >
            <div className="flex justify-center -mt-2 mb-1">
              <div className="flex gap-1.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: i * 0.07, type: "spring", stiffness: 300, damping: 15 }}
                  >
                    <Heart className={`w-8 h-8 ${i < hearts ? "text-duo-red fill-duo-red" : "text-paper-border fill-paper-border"}`} />
                  </motion.div>
                ))}
              </div>
            </div>

            <h2 className="text-2xl font-black mb-1">
              {isPro ? "Unlimited hearts active 👑" : `You have ${hearts} heart${hearts === 1 ? "" : "s"}`}
            </h2>
            <p className="text-muted-foreground font-semibold mb-4">
              {isPro
                ? "Mistakes cost you nothing but a moment. Practice fearlessly — hearts never run out on Scroll Pro."
                : "Hearts refill over time — one every 10 minutes. Lose them by making mistakes in lessons; practice to train them back."}
            </p>

            {/* rest, not pressure — the one place a verse belongs here (v9) */}
            {!isPro && hearts === 0 && (
              <p className="text-xs font-bold text-muted-foreground/90 bg-secondary rounded-xl px-3 py-2 mb-4 leading-relaxed">
                “Come unto me, all ye that labour and are heavy laden, and I will give you rest.” — Matthew 11:28
              </p>
            )}

            {error && <p className="text-duo-red font-bold mb-2 text-sm">{error}</p>}

            <div className="flex flex-col gap-2.5">
              {isPro ? (
                <div className="bg-duo-gold/15 border-2 border-duo-gold/40 rounded-2xl p-3 text-sm font-extrabold text-duo-gold-dark flex items-center justify-center gap-2">
                  <Crown className="w-5 h-5" /> Scroll Pro member — no heart limits
                </div>
              ) : (
                <>
                  <button
                    disabled={refill.isPending || hearts >= 5}
                    onClick={() => refill.mutate()}
                    className="btn3d bg-duo-green text-white shadow-[0_4px_0_#46a302] py-3 px-4 flex items-center justify-center gap-2 disabled:shadow-[0_4px_0_#c9c0a4] disabled:bg-[#b7b2a0] disabled:text-white/80"
                  >
                    <Zap className="w-5 h-5" />
                    {hearts >= 5 ? "Hearts already full" : `Refill for ${price} 💎`}
                  </button>
                  <button
                    onClick={() => {
                      sfx.tap()
                      haptics.tap()
                      onClose()
                      openPaywall("hearts")
                    }}
                    className="btn3d bg-duo-gold text-[#5c4500] shadow-[0_4px_0_#d9a400] py-3 px-4 flex items-center justify-center gap-2"
                  >
                    <Crown className="w-5 h-5" />
                    Go unlimited hearts with Pro
                  </button>
                </>
              )}
              <button
                onClick={() => {
                  sfx.tap()
                  haptics.tap()
                  onClose()
                  setView("practice-hub")
                }}
                className="btn3d bg-white text-duo-green-dark border-2 border-duo-green/60 shadow-[0_4px_0_#e8e0c8] py-3 px-4 flex items-center justify-center gap-2"
              >
                <Dumbbell className="w-5 h-5" />
                Practice to earn hearts
              </button>
              <button onClick={onClose} className="py-2 font-extrabold text-muted-foreground hover:text-foreground">
                Maybe later
              </button>
            </div>

            <div className="mt-3 flex justify-center">
              <Mascot mood={hearts > 0 ? "happy" : "sad"} size={72} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
