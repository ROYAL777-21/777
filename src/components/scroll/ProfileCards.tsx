"use client"

// ═══════════════════════════════════════════════════════════════
//  ProfileCards — the two new Profile surfaces (v7):
//   · ChurchPlanCard — the B2B membership card → full dashboard
//   · GiftCard       — gift subscriptions: redeem + sent ledger
//  (kept in their own module so ProfileExtras stays focused)
// ═══════════════════════════════════════════════════════════════

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { Church, Gift, Copy, Send, PartyPopper, Flame, BookOpenCheck, ArrowRight } from "lucide-react"
import confetti from "canvas-confetti"
import { useAppStore } from "@/lib/client/store"
import { sfx } from "@/lib/client/sound"
import { haptics } from "@/lib/client/haptics"
import { GIFT_BUMP } from "@/lib/offer"
import type { ChurchDashboardPayload, GiftListPayload } from "@/lib/types"
import { useRefreshApp } from "./ScrollApp"

// ═══════════════════════════════════════════════════════════════
//  Church plan card — the membership summary (the full dashboard
//  lives at Explore → Church plan)
// ═══════════════════════════════════════════════════════════════

export function ChurchPlanCard() {
  const setView = useAppStore((s) => s.setView)
  const { data } = useQuery<ChurchDashboardPayload>({
    queryKey: ["church"],
    queryFn: async () => {
      const res = await fetch("/api/church")
      if (res.status === 404) return null
      return res.json()
    },
    staleTime: 30_000,
  })

  if (!data) return null // no church plan enrolled — nothing to show
  const renewal = new Date(data.org.renewalAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl border-2 border-paper-border shadow-[0_5px_0_#e8e0c8] p-5 mb-4"
    >
      <div className="flex items-center gap-3 mb-3">
        <span className="w-11 h-11 shrink-0 rounded-2xl bg-[#B45309]/10 grid place-items-center">
          <Church className="w-6 h-6 text-[#B45309]" />
        </span>
        <div className="flex-1 min-w-0">
          <h2 className="font-black leading-tight">Church plan · {data.org.name}</h2>
          <p className="text-xs font-bold text-muted-foreground mt-0.5">
            {data.org.seatsUsed} of {data.org.seatsTotal} seats · ${data.org.priceMonthly}/mo · renews {renewal}
          </p>
        </div>
        <span className="text-[10px] font-black text-teal-700 bg-teal-100 rounded-full px-2 py-0.5 shrink-0">
          {data.org.tierLabel}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="rounded-2xl bg-secondary p-2.5 text-center">
          <p className="text-lg font-black leading-none tabular-nums">{data.cohort.activeThisWeek}</p>
          <p className="text-[10px] font-black uppercase text-muted-foreground mt-1">active this week</p>
        </div>
        <div className="rounded-2xl bg-secondary p-2.5 text-center">
          <p className="text-lg font-black leading-none tabular-nums">{data.cohort.lessonsTotal}</p>
          <p className="text-[10px] font-black uppercase text-muted-foreground mt-1">lessons done</p>
        </div>
        <div className="rounded-2xl bg-secondary p-2.5 text-center">
          <p className="text-lg font-black leading-none tabular-nums">{data.cohort.coveragePct}%</p>
          <p className="text-[10px] font-black uppercase text-muted-foreground mt-1">Bible coverage</p>
        </div>
      </div>

      <button
        onClick={() => {
          sfx.tap()
          haptics.tap()
          setView("admin")
        }}
        className="btn3d w-full bg-white border-2 border-[#B45309]/40 text-[#7C3A0B] shadow-[0_4px_0_#e8dcc8] py-3 font-black flex items-center justify-center gap-2"
      >
        Open the dashboard <ArrowRight className="w-4 h-4" />
      </button>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════
//  Gift subscriptions — redeem a code + the sent ledger
// ═══════════════════════════════════════════════════════════════

export function GiftCard() {
  const qc = useQueryClient()
  const refreshApp = useRefreshApp()
  const pushToast = useAppStore((s) => s.pushToast)
  const [code, setCode] = useState("")
  const [err, setErr] = useState<string | null>(null)

  const { data } = useQuery<GiftListPayload>({
    queryKey: ["gifts"],
    queryFn: async () => {
      const res = await fetch("/api/gift")
      if (!res.ok) throw new Error("failed")
      return res.json()
    },
  })

  const redeem = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/gift", { method: "POST", body: JSON.stringify({ action: "redeem", code: code.trim() }) })
      const json = (await res.json()) as { ok?: boolean; reason?: string; months?: number; fromName?: string; message?: string }
      if (!res.ok || !json.ok) throw new Error(json.reason ?? "invalid")
      return json as { months: number; fromName: string; message: string }
    },
    onSuccess: (d) => {
      sfx.fanfare()
      haptics.complete()
      confetti({ particleCount: 160, spread: 90, origin: { y: 0.5 }, colors: ["#FFC800", "#E4453D", "#58CC02"] })
      setCode("")
      setErr(null)
      pushToast("A year of Scroll Pro — gifted to you 🎁", `From ${d.fromName}. Every course and unlimited hearts, for ${d.months} months.`, "🎁")
      refreshApp()
      void qc.invalidateQueries({ queryKey: ["gifts"] })
      void qc.invalidateQueries({ queryKey: ["pro"] })
    },
    onError: (e: Error) => {
      haptics.wrong()
      setErr(
        e.message === "already_redeemed"
          ? "That code was already redeemed — each gift is one-time."
          : e.message === "not_found"
            ? "We couldn't find that code. Check the spelling (SCROLL-XXXX-XXXX)."
            : "Codes look like SCROLL-XXXX-XXXX (no I/L/O/0/1).",
      )
    },
  })

  const copyCode = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      sfx.tap()
      pushToast("Copied", label, "🔗")
    } catch {
      pushToast("Copy failed", "Select the code and copy it manually.", "⚠️")
    }
  }

  return (
    <div className="bg-white rounded-3xl border-2 border-paper-border shadow-[0_5px_0_#e8e0c8] p-5 mb-4">
      <div className="flex items-center gap-3 mb-1">
        <span className="w-10 h-10 shrink-0 rounded-2xl bg-rose-100 grid place-items-center">
          <Gift className="w-5 h-5 text-rose-600" />
        </span>
        <div>
          <h2 className="font-black leading-tight">Gift subscriptions</h2>
          <p className="text-xs font-bold text-muted-foreground">Redeem a gifted year · send them from checkout.</p>
        </div>
      </div>

      {/* redeem */}
      <div className="mt-3">
        <div className="flex gap-2">
          <input
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase())
              setErr(null)
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && code.trim().length >= 10 && !redeem.isPending) redeem.mutate()
            }}
            placeholder="SCROLL-XXXX-XXXX"
            maxLength={20}
            className="flex-1 min-w-0 bg-secondary border-2 border-paper-border rounded-xl px-3 py-2.5 font-mono font-bold text-sm tracking-wide focus:outline-none focus:border-duo-green"
            aria-label="Gift code"
          />
          <button
            onClick={() => redeem.mutate()}
            disabled={redeem.isPending || code.trim().length < 10}
            className="btn3d bg-rose-600 text-white shadow-[0_4px_0_#9f1239] px-4 py-2.5 font-black text-sm disabled:opacity-50 shrink-0"
          >
            Redeem
          </button>
        </div>
        {err && <p className="text-xs font-bold text-red-600 mt-1.5">{err}</p>}
        {data?.redeemed && data.redeemed.length > 0 && (
          <p className="text-xs font-bold text-muted-foreground mt-1.5 flex items-center gap-1">
            <PartyPopper className="w-3.5 h-3.5" /> {data.redeemed.length} gifted {data.redeemed.length === 1 ? "year" : "years"} redeemed on this account.
          </p>
        )}
      </div>

      {/* sent ledger */}
      {data && data.sent.length > 0 && (
        <div className="mt-4 pt-4 border-t-2 border-paper-border">
          <p className="text-xs font-black uppercase tracking-wide text-muted-foreground mb-2">Years you've gifted</p>
          <div className="flex flex-col gap-2">
            {data.sent.slice(0, 4).map((g) => (
              <div key={g.code} className="flex items-center gap-3 rounded-2xl bg-secondary px-3 py-2.5">
                <span className="w-9 h-9 rounded-xl bg-white border-2 border-paper-border grid place-items-center text-lg shrink-0">
                  {g.redeemedAt ? "🎉" : "📮"}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-black text-sm leading-tight truncate">
                    {g.toLabel} <span className="font-bold text-muted-foreground">· {GIFT_BUMP.price}</span>
                  </p>
                  <p className="text-[11px] font-bold text-muted-foreground truncate">
                    {g.redeemedAt
                      ? `Redeemed by ${g.redeemedName ?? "a friend"} · ${new Date(g.redeemedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                      : "Awaiting redemption · never expires"}
                  </p>
                </div>
                <button
                  onClick={() => void copyCode(g.code, "The gift code — send it to them.")}
                  className="p-2 rounded-xl hover:bg-white text-muted-foreground hover:text-duo-purple shrink-0"
                  aria-label="Copy gift code"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (typeof navigator !== "undefined" && navigator.share) {
                      void navigator.share({
                        title: "A year of Scroll Academy",
                        text: `${g.toLabel} — redeem your gifted year of Scroll Pro with this code: ${g.code}`,
                      })
                    } else {
                      void copyCode(`${g.link} — code ${g.code}`, "Share text copied.")
                    }
                  }}
                  className="p-2 rounded-xl hover:bg-white text-muted-foreground hover:text-duo-purple shrink-0"
                  aria-label="Share gift code"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {(!data || (data.sent.length === 0 && data.redeemed.length === 0)) && (
        <p className="text-xs font-bold text-muted-foreground mt-3 leading-relaxed">
          At checkout there&apos;s a checkbox — “{GIFT_BUMP.title}” {GIFT_BUMP.price} (reg. {GIFT_BUMP.regPrice}). It sends a
          one-time code; they redeem it here.
        </p>
      )}
    </div>
  )
}
