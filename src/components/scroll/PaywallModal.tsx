"use client"

import { useEffect, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { AnimatePresence, motion } from "framer-motion"
import { Check, ShieldCheck, ChevronDown, Crown, Heart, Gift as GiftIcon, Copy, Send, Sparkles } from "lucide-react"
import confetti from "canvas-confetti"
import { sfx } from "@/lib/client/sound"
import { haptics } from "@/lib/client/haptics"
import { useAppStore } from "@/lib/client/store"
import { engineTrack, type EngineStateClient } from "@/lib/client/engine"
import { spring } from "@/lib/motion"
import {
  OFFER_NAME,
  VALUE_STACK,
  BONUS_STACK,
  PLANS,
  TRIAL_TIMELINE,
  GUARANTEE,
  FAQ,
  HOOKS,
  SOCIAL_PROOF,
  MISSION,
  FINE_PRINT,
  GIFT_BUMP,
  SUBSCRIPTION_TERMS,
  giftSeason,
  type PaywallContext,
} from "@/lib/offer"
import type { GiftCodeDTO } from "@/lib/types"

/** checkout summaries for the paid step (the order bump rides along).
 *  v7.1: annual = 7-day free trial → $0.00 today, then $39.99/yr;
 *        monthly = no trial → first $5.99 charged upon checkout. */
const SUMMARY: Record<
  "monthly" | "annual",
  { name: string; price: string; today: string; todayNum: number; note: string }
> = {
  monthly: { name: "Monthly", price: "$5.99/mo", today: "$5.99", todayNum: 5.99, note: "No trial — the first $5.99 is charged upon checkout, then $5.99/mo" },
  annual: { name: "Annual · 7-day free trial", price: "$39.99/yr", today: "$0.00", todayNum: 0, note: "Nothing today — first charge $39.99/year after the trial" },
}

export function PaywallModal() {
  const paywall = useAppStore((s) => s.paywall)
  const closePaywall = useAppStore((s) => s.closePaywall)
  const pushToast = useAppStore((s) => s.pushToast)
  const qc = useQueryClient()

  const context: PaywallContext = paywall?.context ?? "general"
  const [plan, setPlan] = useState<(typeof PLANS)[number]["id"]>("annual")
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [faqOpen, setFaqOpen] = useState<number | null>(null)

  // ── checkout step (the paid path) + the gift order bump ──
  // "gift" = gift-only checkout (no plan for yourself) — the Advent
  // campaign entry point and the “gift a year” path for existing members.
  const [checkout, setCheckout] = useState<null | "monthly" | "annual" | "gift">(null)
  const [giftOn, setGiftOn] = useState(false) // opt-in only — never pre-checked
  const [giftTo, setGiftTo] = useState("")
  const [giftMsg, setGiftMsg] = useState("")
  const [giftResult, setGiftResult] = useState<GiftCodeDTO | null>(null)

  // ── engine personalization state (shared query cache with ScrollApp) ──
  const engine = useQuery<EngineStateClient>({
    queryKey: ["engine/state"],
    staleTime: 60_000,
    retry: false,
  })
  const enginePaywall = engine.data?.game.paywall

  // engine-chosen plan highlight (price-sensitivity aware) — applied once per open
  useEffect(() => {
    if (!paywall || !enginePaywall) return
    const hp = enginePaywall.highlightPlan
    if (hp === "monthly" || hp === "annual") setPlan(hp)
  }, [paywall, enginePaywall])

  // gift-only context (Advent banner / “gift a year”) → land straight on the gift checkout
  useEffect(() => {
    if (paywall?.context === "gift") {
      setCheckout("gift")
      setGiftOn(true)
      engineTrack("checkout_view", { plan: "gift", bump: "gift_only" })
    }
  }, [paywall])

  // paywall open + dwell tracking with honest dismissal seconds
  useEffect(() => {
    if (!paywall) return
    const openedAt = Date.now()
    engineTrack("paywall_open", { context, hook: enginePaywall?.hook ?? context })
    let dwellReported = false
    const reportDwell = () => {
      if (dwellReported) return
      dwellReported = true
      engineTrack("paywall_view", { context, hook: enginePaywall?.hook ?? context, seconds: Math.round((Date.now() - openedAt) / 1000) })
    }
    const onVisibility = () => {
      if (document.visibilityState === "hidden") reportDwell()
    }
    document.addEventListener("visibilitychange", onVisibility)
    return () => {
      reportDwell()
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [paywall, context, enginePaywall?.hook])

  // the hook: moment-specific contexts keep their own hook (hearts/shop are
  // triggered by a real moment); the engine's bandit-chosen hook personalizes
  // the general/profile/lessonEnd moments
  const engineHook = enginePaywall?.hook as PaywallContext | undefined
  const hook =
    (context === "hearts" || context === "shop" || context === "onboarding") || !engineHook
      ? HOOKS[context]
      : HOOKS[engineHook] ?? HOOKS[context]

  // wipe the step state when the sheet closes, so the next open is fresh
  useEffect(() => {
    if (paywall) return
    setDone(false)
    setCheckout(null)
    setGiftResult(null)
    setGiftOn(false)
    setGiftTo("")
    setGiftMsg("")
  }, [paywall])

  const subscribe = async (chosenPlan: string, gift?: { toName: string; message: string }) => {
    setBusy(true)
    try {
      const res = await fetch("/api/pro", {
        method: "POST",
        body: JSON.stringify({
          action: chosenPlan === "trial" ? "startTrial" : "subscribe",
          plan: chosenPlan,
          gift: gift ?? undefined,
        }),
      })
      const data = (await res.json()) as { isPro?: boolean; plan?: string; gift?: GiftCodeDTO | null }
      engineTrack("paywall_cta", { context, plan: chosenPlan, hook: enginePaywall?.hook ?? context, bump: gift ? "gift_on" : "gift_off" })
      sfx.fanfare()
      haptics.complete()
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.4 },
        colors: ["#FFC800", "#58CC02", "#9B5DE5", "#E4453D"],
      })
      setDone(true)
      if (data.gift) {
        // a gift year was purchased — the code must stay on screen to copy
        setGiftResult(data.gift)
        pushToast(
          "Gift year sent 🎁",
          `Code ${data.gift.code} — they redeem it in Profile → Scroll Pro.`,
          "🎁",
        )
        void qc.invalidateQueries({ queryKey: ["gifts"] })
      } else {
        pushToast(
          "Scroll Pro activated 👑",
          chosenPlan === "trial"
            ? "7-day free trial started — everything is unlocked."
            : "Pro membership active. Renews automatically — cancel anytime in Profile → Scroll Pro.",
          "👑",
        )
      }
      void qc.invalidateQueries({ queryKey: ["bootstrap"] })
      void qc.invalidateQueries({ queryKey: ["pro"] })
      if (!data.gift) {
        setTimeout(() => {
          closePaywall()
          setDone(false)
        }, 2400)
      }
    } catch {
      pushToast("Hmm, the scribe stumbled", "Could not activate right now — try again in a moment.", "🕯️")
    } finally {
      setBusy(false)
    }
  }

  /** gift-only purchase (no plan for yourself) — the Advent campaign path */
  const purchaseGift = async () => {
    setBusy(true)
    try {
      const res = await fetch("/api/gift", {
        method: "POST",
        body: JSON.stringify({ action: "purchase", toName: giftTo.trim(), message: giftMsg.trim() }),
      })
      const data = (await res.json()) as { gift?: GiftCodeDTO; error?: string }
      if (!res.ok || !data.gift) throw new Error(data.error ?? "failed")
      engineTrack("paywall_cta", { context, plan: "gift_only", hook: enginePaywall?.hook ?? context, bump: "gift_only" })
      sfx.fanfare()
      haptics.complete()
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.4 },
        colors: ["#FFC800", "#58CC02", "#9B5DE5", "#E4453D"],
      })
      setGiftResult(data.gift)
      setDone(true)
      pushToast("Gift year sent 🎁", `Code ${data.gift.code} — they redeem it in Profile → Scroll Pro.`, "🎁")
      void qc.invalidateQueries({ queryKey: ["gifts"] })
    } catch {
      pushToast("Hmm, the scribe stumbled", "Could not send the gift right now — try again in a moment.", "🕯️")
    } finally {
      setBusy(false)
    }
  }

  /** open the paid checkout step (the order bump lives there) */
  const openCheckout = (planId: "monthly" | "annual" | "gift") => {
    sfx.tap()
    haptics.tap()
    setGiftOn(false)
    setGiftTo("")
    setGiftMsg("")
    setCheckout(planId)
    engineTrack("checkout_view", { plan: planId, bump: "off" })
  }

  /** close — no exit interrupt, no downsell, no guilt (v9 tone rule).
  *  Leaving is free and always will be. */
  const requestClose = () => {
    engineTrack("paywall_dismiss", { context, seconds: 0, via: "plain_close" })
    closePaywall()
  }

  // what lands on the card at the bottom of the checkout
  const totalToday = !checkout
    ? 0
    : checkout === "gift"
      ? GIFT_BUMP.priceNum
      : SUMMARY[checkout].todayNum + (giftOn ? GIFT_BUMP.priceNum : 0)
  const trialEndsLabel = new Date(Date.now() + 7 * 86400_000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })

  // the gift fields (shared by the order bump and the gift-only checkout)
  const giftFields = (
    <div className="flex flex-col gap-2.5">
      <div>
        <label className="block text-xs font-black mb-1" htmlFor="gift-to">
          To (their first name)
        </label>
        <input
          id="gift-to"
          value={giftTo}
          onChange={(e) => setGiftTo(e.target.value)}
          maxLength={24}
          placeholder="Naomi"
          className="w-full bg-white border-2 border-rose-200 rounded-xl px-3 py-2.5 font-bold text-sm focus:outline-none focus:border-rose-400"
        />
      </div>
      <div>
        <label className="block text-xs font-black mb-1" htmlFor="gift-msg">
          A note for them (optional)
        </label>
        <textarea
          id="gift-msg"
          value={giftMsg}
          onChange={(e) => setGiftMsg(e.target.value)}
          maxLength={140}
          rows={2}
          placeholder="Merry Christmas — read John with me this year."
          className="w-full bg-white border-2 border-rose-200 rounded-xl px-3 py-2.5 font-semibold text-sm focus:outline-none focus:border-rose-400 resize-none"
        />
      </div>
      <p className="text-[11px] font-bold text-muted-foreground leading-relaxed">{GIFT_BUMP.howTo}</p>
    </div>
  )

  return (
    <AnimatePresence>
      {paywall && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[95] bg-black/55 backdrop-blur-sm flex items-end sm:items-center justify-center"
          onClick={requestClose}
          role="dialog"
          aria-modal="true"
          aria-label="Scroll Pro offer"
        >
          <motion.div
            initial={{ y: 80, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 80, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-parchment w-full sm:max-w-lg h-[92dvh] sm:h-auto sm:max-h-[92dvh] rounded-t-[2rem] sm:rounded-[2rem] border-2 border-paper-border shadow-2xl overflow-y-auto overscroll-contain"
          >
            {done ? (
              <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 p-8 sm:p-10 text-center">
                <motion.div animate={{ scale: [0.6, 1.15, 1], rotate: [0, 8, 0] }} transition={{ duration: 0.6 }}>
                  <Crown className="w-20 h-20 text-duo-gold fill-duo-gold" />
                </motion.div>
                <h2 className="text-2xl font-black">Welcome to Scroll Pro 👑</h2>
                <p className="font-bold text-muted-foreground">Every course, unlimited hearts, 2× XP weekends. All unlocked.</p>

                {giftResult && (
                  <div className="mt-2 w-full max-w-sm bg-white rounded-3xl border-2 border-rose-200 shadow-[0_5px_0_#f3d2dc] p-5">
                    <p className="font-black flex items-center justify-center gap-2 text-lg">
                      <GiftIcon className="w-5 h-5 text-rose-600" /> Your gift year is sent
                    </p>
                    {giftResult.toLabel !== "A year of Scroll Pro" && (
                      <p className="text-xs font-bold text-muted-foreground mt-0.5">{giftResult.toLabel}</p>
                    )}
                    {giftResult.message && (
                      <p className="text-sm font-semibold italic text-muted-foreground mt-2">“{giftResult.message}”</p>
                    )}
                    <div className="mt-3 bg-secondary rounded-2xl border-2 border-dashed border-paper-border px-4 py-3">
                      <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-1">The code — one-time, never expires</p>
                      <p className="font-mono font-black text-lg tracking-wider select-all">{giftResult.code}</p>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => {
                          void navigator.clipboard.writeText(giftResult.code).then(() => pushToast("Copied", "The gift code — send it to them.", "🔗"))
                        }}
                        className="btn3d flex-1 bg-white border-2 border-paper-border shadow-[0_3px_0_#e8e0c8] py-2.5 font-black text-sm flex items-center justify-center gap-1.5"
                      >
                        <Copy className="w-4 h-4" /> Copy code
                      </button>
                      <button
                        onClick={() => {
                          if (typeof navigator !== "undefined" && navigator.share) {
                            void navigator.share({
                              title: "A year of Scroll Academy",
                              text: `I gifted you a year of Scroll Pro — redeem it with this code: ${giftResult.code}`,
                            })
                          } else {
                            void navigator.clipboard.writeText(`${giftResult.link} — code ${giftResult.code}`).then(() => pushToast("Share text copied", "Paste it into any message.", "🔗"))
                          }
                        }}
                        className="btn3d flex-1 bg-rose-600 text-white shadow-[0_3px_0_#9f1239] py-2.5 font-black text-sm flex items-center justify-center gap-1.5"
                      >
                        <Send className="w-4 h-4" /> Share
                      </button>
                    </div>
                    <p className="text-[11px] font-bold text-muted-foreground mt-3 leading-relaxed">
                      They redeem it in Profile → Scroll Pro → “Redeem a gift” — one tap and their year starts.
                    </p>
                    <button
                      onClick={() => {
                        setDone(false)
                        setGiftResult(null)
                        setCheckout(null)
                        closePaywall()
                      }}
                      className="mt-4 w-full py-3 font-extrabold text-duo-green-dark hover:underline"
                    >
                      Done
                    </button>
                  </div>
                )}
              </div>
            ) : checkout ? (
              /* ── the paid checkout step — home of the order bump ── */
              <div className="p-5 sm:p-7 pb-24 sm:pb-7">
                <button
                  onClick={() => {
                    sfx.tap()
                    setCheckout(null)
                  }}
                  className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white border-2 border-paper-border grid place-items-center text-lg font-black hover:bg-secondary z-10"
                  aria-label="Back to the offer"
                >
                  ←
                </button>

                <div className="text-center mb-5 mt-2">
                  <span className="inline-flex items-center gap-1.5 bg-duo-green/15 text-duo-green-dark rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide mb-3">
                    <Check className="w-3.5 h-3.5" /> Checkout · {checkout === "gift" ? "Gift a year" : SUMMARY[checkout].name}
                  </span>
                  <h2 className="text-2xl font-black leading-tight">One step left</h2>
                  <p className="font-bold text-muted-foreground text-sm leading-snug mt-1">
                    {checkout === "gift"
                      ? `${GIFT_BUMP.title} · ${GIFT_BUMP.price} — one-time, never auto-renews`
                      : `${SUMMARY[checkout].price} · ${SUMMARY[checkout].note}`}
                  </p>
                </div>

                {/* order summary */}
                <div className="bg-white rounded-2xl border-2 border-paper-border p-4 mb-4">
                  {checkout === "gift" ? (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="font-black text-sm">🎁 Gift a year of Scroll Pro</span>
                        <span className="font-black text-lg tabular-nums">{GIFT_BUMP.price}</span>
                      </div>
                      <p className="text-[11px] font-bold text-muted-foreground mt-1">
                        One-time purchase — a ${GIFT_BUMP.regPrice} value. Codes never expire; they redeem whenever they’re ready.
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="font-black text-sm">{SUMMARY[checkout].name}</span>
                        <span className="font-black text-lg tabular-nums">{SUMMARY[checkout].today}</span>
                      </div>
                      <p className="text-[11px] font-bold text-muted-foreground mt-1">
                        {checkout === "annual"
                          ? `First charge $39.99 on ${trialEndsLabel} — cancel anytime before it lands. `
                          : `${SUMMARY[checkout].note}. `}
                        30-day “Grow or it’s free” guarantee.
                      </p>
                    </>
                  )}
                </div>

                {/* THE ORDER BUMP — opt-in only, never pre-checked.
                    (In gift-only mode the gift IS the product, so no toggle.) */}
                {checkout !== "gift" && (
                <div
                  className={`rounded-2xl border-2 p-4 mb-4 transition-colors ${
                    giftOn ? "border-rose-400 bg-rose-50" : "border-paper-border bg-white"
                  }`}
                >
                  <button
                    className="w-full flex items-start gap-3 text-left"
                    onClick={() => {
                      sfx.tap()
                      haptics.tap()
                      const next = !giftOn
                      setGiftOn(next)
                      engineTrack("order_bump_toggle", { on: next, plan: checkout })
                    }}
                    aria-pressed={giftOn}
                    aria-label="Add a gift year"
                  >
                    <span
                      className={`w-6 h-6 rounded-xl border-2 grid place-items-center shrink-0 mt-0.5 ${
                        giftOn ? "border-rose-500 bg-rose-500" : "border-muted-foreground/40 bg-white"
                      }`}
                    >
                      {giftOn && <Check className="w-4 h-4 text-white" strokeWidth={4} />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline gap-2 flex-wrap">
                        <span className="font-black">🎁 {GIFT_BUMP.title}</span>
                        <span className="font-black text-lg text-rose-700">{GIFT_BUMP.price}</span>
                        <span className="text-sm font-bold text-muted-foreground/60 line-through">{GIFT_BUMP.regPrice}</span>
                      </span>
                      <span className="block text-xs font-bold text-muted-foreground leading-snug mt-1">{GIFT_BUMP.detail}</span>
                      <span className="block text-[11px] font-bold text-duo-purple mt-1.5">{giftSeason().label} — {giftSeason().line}</span>
                    </span>
                  </button>

                  {giftOn && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="overflow-hidden">
                      <div className="mt-3 pt-3 border-t-2 border-rose-200">{giftFields}</div>
                    </motion.div>
                  )}
                </div>
                )}

                {/* gift-only mode: the gift IS the product — fields live in their own card */}
                {checkout === "gift" && (
                  <div className="rounded-2xl border-2 border-rose-400 bg-rose-50 p-4 mb-4">
                    <p className="font-black leading-tight">🎁 {GIFT_BUMP.title}</p>
                    <p className="text-xs font-bold text-muted-foreground leading-snug mt-1 mb-3">
                      {GIFT_BUMP.detail}{" "}
                      <span className="text-duo-purple">{giftSeason().label} — {giftSeason().line}</span>
                    </p>
                    {giftFields}
                  </div>
                )}

                {/* total */}
                <div className="bg-ink text-white rounded-2xl p-4 mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-wider text-duo-gold">Total today</p>
                    <p className="text-xs font-bold text-white/70 mt-0.5">
                      {checkout === "gift"
                        ? `${GIFT_BUMP.title} — one-time`
                        : giftOn
                          ? `${SUMMARY[checkout].today} plan + ${GIFT_BUMP.price} gift year`
                          : SUMMARY[checkout].price}
                    </p>
                  </div>
                  <p className="text-3xl font-black tabular-nums">${totalToday.toFixed(2)}</p>
                </div>

                <p className="text-[11px] font-bold text-muted-foreground text-center mb-3 leading-relaxed">
                  {checkout === "gift" ? (
                    GIFT_BUMP.finePrint
                  ) : (
                    <>
                      {checkout === "annual"
                        ? SUBSCRIPTION_TERMS.annual
                        : SUBSCRIPTION_TERMS.monthly}{" "}
                      {SUBSCRIPTION_TERMS.shared}{" "}
                      <a
                        href={SUBSCRIPTION_TERMS.helpCenter.url}
                        target="_blank"
                        rel="noreferrer"
                        className="underline text-duo-purple"
                      >
                        {SUBSCRIPTION_TERMS.helpCenter.name}
                      </a>
                    </>
                  )}
                </p>

                <div className="sm:static sm:bg-transparent fixed bottom-0 inset-x-0 sm:inset-auto p-4 sm:p-0 bg-parchment/95 backdrop-blur border-t-2 border-paper-border sm:border-0">
                  <button
                    disabled={busy || ((giftOn || checkout === "gift") && giftTo.trim().length < 2)}
                    onClick={() => {
                      sfx.correct()
                      haptics.light()
                      if (checkout === "gift") {
                        void purchaseGift()
                      } else if (checkout === "annual") {
                        void subscribe("trial", giftOn ? { toName: giftTo.trim(), message: giftMsg.trim() } : undefined)
                      } else {
                        void subscribe(checkout, giftOn ? { toName: giftTo.trim(), message: giftMsg.trim() } : undefined)
                      }
                    }}
                    className="btn3d bg-duo-green text-white shadow-[0_5px_0_#46a302] w-full py-4 text-lg font-black flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {checkout === "gift" ? (
                      <>
                        <GiftIcon className="w-5 h-5" /> Buy the gift year — {GIFT_BUMP.price}
                      </>
                    ) : checkout === "annual" ? (
                      <>
                        <Crown className="w-5 h-5" />
                        {giftOn ? `Start trial + gift — $${totalToday.toFixed(2)} today` : "Start 7-day free trial — $0.00 due now"}
                      </>
                    ) : (
                      <>
                        <Crown className="w-5 h-5" /> Confirm — ${totalToday.toFixed(2)} today
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      sfx.tap()
                      setCheckout(null)
                    }}
                    className="w-full py-2.5 font-extrabold text-muted-foreground hover:text-foreground text-sm"
                  >
                    Back to the offer
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-5 sm:p-7 pb-24 sm:pb-7">
                {/* close */}
                <button
                  onClick={requestClose}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white border-2 border-paper-border grid place-items-center text-lg font-black hover:bg-secondary z-10"
                  aria-label="Close offer"
                >
                  ✕
                </button>

                {/* hook */}
                <div className="text-center mb-5">
                  <span className="inline-flex items-center gap-1.5 bg-duo-gold/20 text-duo-gold-dark rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide mb-3">
                    <Crown className="w-3.5 h-3.5" /> Scroll Pro · {OFFER_NAME}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black leading-tight mb-2">{hook.headline}</h2>
                  <p className="font-bold text-muted-foreground text-sm leading-snug">{hook.sub}</p>
                </div>

                {/* mission — the honest answer to “why do you charge?” (v9).
                    The old countdown + cohort-scarcity block is gone. */}
                <div className="bg-ink text-white rounded-2xl p-4 mb-5 flex items-start gap-4">
                  <Heart className="w-8 h-8 text-duo-red shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-[11px] font-black uppercase tracking-wider text-duo-gold mb-1">{MISSION.badge}</p>
                    <p className="text-sm font-bold leading-snug text-white/90">{MISSION.body}</p>
                  </div>
                </div>

                {/* value stack — v11.4: benefits pop in as you reach them */}
                <div className="bg-white rounded-2xl border-2 border-paper-border p-4 mb-4">
                  <p className="text-xs font-black uppercase tracking-wide text-muted-foreground mb-3">Everything included</p>
                  <ul className="flex flex-col gap-2.5">
                    {VALUE_STACK.map((item, vi) => (
                      <motion.li
                        key={item.title}
                        initial={{ opacity: 0, x: -18 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-24px" }}
                        transition={{ ...spring.juice, delay: Math.min(0.25, vi * 0.04) }}
                        className="flex items-start gap-3"
                      >
                        <span className="w-8 h-8 rounded-xl bg-duo-green/10 grid place-items-center text-lg shrink-0">{item.icon}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-extrabold text-sm leading-tight">{item.title}</span>
                          <span className="block text-xs font-semibold text-muted-foreground leading-snug">{item.detail}</span>
                        </span>
                      </motion.li>
                    ))}
                    {BONUS_STACK.map((b) => (
                      <li key={b.title} className="flex items-start gap-3 bg-duo-gold/10 rounded-xl p-2 -m-1">
                        <span className="w-8 h-8 rounded-xl bg-duo-gold/20 grid place-items-center text-lg shrink-0">{b.icon}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-extrabold text-sm leading-tight">{b.title}</span>
                          <span className="block text-xs font-semibold text-muted-foreground leading-snug">{b.detail}</span>
                        </span>
                        <span className="text-sm font-black text-duo-gold-dark shrink-0">FREE</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* plans — v11.4: cards spring in staggered; the pick pops */}
                <div className="grid gap-2.5 mb-4">
                  {PLANS.map((p, pi) => {
                    const active = plan === p.id
                    return (
                      <motion.button
                        key={p.id}
                        initial={{ opacity: 0, y: 22, scale: 0.96 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        viewport={{ once: true, margin: "-24px" }}
                        transition={
                          active
                            ? { scale: { duration: 0.3, ease: "easeOut" }, default: spring.juice }
                            : { ...spring.juice, delay: pi * 0.08 }
                        }
                        whileTap={{ scale: 0.98 }}
                        animate={active ? { scale: [1, 1.03, 1] } : { scale: 1 }}
                        onClick={() => {
                          sfx.tap()
                          haptics.tap()
                          setPlan(p.id)
                        }}
                        className={`relative text-left rounded-2xl border-2 p-4 transition-colors ${
                          active ? "border-duo-green bg-duo-green/5 shadow-[0_4px_0_#58cc0a55]" : "border-paper-border bg-white hover:border-muted-foreground/40"
                        }`}
                        aria-pressed={active}
                      >
                        {p.badge && (
                          <span className="absolute -top-2.5 left-4 text-[10px] font-black uppercase tracking-wide rounded-full px-2.5 py-1 text-white bg-duo-green">
                            {p.badge}
                          </span>
                        )}
                        <div className="flex items-center gap-3">
                          <motion.span
                            className={`w-5 h-5 rounded-full border-2 grid place-items-center shrink-0 ${active ? "border-duo-green bg-duo-green" : "border-muted-foreground/40"}`}
                            animate={active ? { scale: [0.6, 1.25, 1] } : { scale: 1 }}
                            transition={
                              active
                                ? { scale: { duration: 0.3, ease: "easeOut" } }
                                : spring.snappy
                            }
                          >
                            {active && <Check className="w-3 h-3 text-white" strokeWidth={4} />}
                          </motion.span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-baseline gap-2">
                              <span className="font-black">{p.name}</span>
                              <span className="text-xl font-black">{p.price}</span>
                              <span className="text-sm font-bold text-muted-foreground">{p.per}</span>
                            </div>
                            <p className="text-xs font-bold text-muted-foreground">
                              {p.note} · {p.perDay}
                              <span className="ml-1.5 text-muted-foreground/60 line-through">{p.anchorNote}</span>
                            </p>
                          </div>
                        </div>
                      </motion.button>
                    )
                  })}
                </div>

                {/* v11.5 — the trial timeline: structure before price.
                    When Annual is selected, the trial is explained day by day
                    (Cal AI's heaviest-lifting screens). Honest, calm, complete. */}
                <AnimatePresence initial={false}>
                  {plan === "annual" && (
                    <motion.div
                      key="trial-timeline"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.28, ease: "easeOut" }}
                      className="overflow-hidden"
                    >
                      <div className="rounded-2xl border-2 border-duo-green/40 bg-duo-green/5 p-4 mb-4">
                        <p className="text-xs font-black uppercase tracking-wide text-duo-green-dark mb-2.5">
                          How the free week works
                        </p>
                        <div className="flex flex-col gap-2.5">
                          {TRIAL_TIMELINE.map((t, i) => (
                            <motion.div
                              key={t.title}
                              initial={{ opacity: 0, x: -14 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.08 * i, ...spring.snappy }}
                              className="flex items-start gap-3"
                            >
                              <span className="w-8 h-8 rounded-xl bg-white border-2 border-duo-green/30 grid place-items-center text-lg shrink-0">
                                {t.icon}
                              </span>
                              <span className="min-w-0">
                                <span className="block font-extrabold text-sm leading-tight">{t.title}</span>
                                <span className="block text-xs font-semibold text-muted-foreground leading-snug">{t.body}</span>
                              </span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* guarantee */}
                <div className="bg-duo-green/10 border-2 border-duo-green/40 rounded-2xl p-4 mb-4 flex gap-3">
                  <ShieldCheck className="w-10 h-10 text-duo-green shrink-0" />
                  <div>
                    <p className="font-black text-sm">{GUARANTEE.name}: {GUARANTEE.headline}</p>
                    <p className="text-xs font-semibold text-muted-foreground leading-snug mt-1">{GUARANTEE.body}</p>
                  </div>
                </div>

                {/* learner stories — no invented ratings (v9 tone rule) */}
                <div className="bg-white rounded-2xl border-2 border-paper-border p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2.5">
                    <Sparkles className="w-4 h-4 text-duo-gold-dark" />
                    <span className="text-xs font-black text-muted-foreground">{SOCIAL_PROOF.heading}</span>
                  </div>
                  <blockquote className="text-sm font-semibold leading-snug mb-2">
                    “{SOCIAL_PROOF.quote.text}”
                    <footer className="text-xs font-black text-muted-foreground mt-1">
                      — {SOCIAL_PROOF.quote.author}, {SOCIAL_PROOF.quote.detail}
                    </footer>
                  </blockquote>
                  <blockquote className="text-sm font-semibold leading-snug">
                    “{SOCIAL_PROOF.quote2.text}”
                    <footer className="text-xs font-black text-muted-foreground mt-1">
                      — {SOCIAL_PROOF.quote2.author}, {SOCIAL_PROOF.quote2.detail}
                    </footer>
                  </blockquote>
                </div>

                {/* FAQ */}
                <div className="bg-white rounded-2xl border-2 border-paper-border p-1 mb-4">
                  {FAQ.map((f, i) => (
                    <div key={f.q} className={i > 0 ? "border-t border-paper-border/70" : ""}>
                      <button
                        className="w-full flex items-center justify-between gap-2 px-3.5 py-3 text-left"
                        onClick={() => {
                          sfx.tap()
                          setFaqOpen(faqOpen === i ? null : i)
                        }}
                        aria-expanded={faqOpen === i}
                      >
                        <span className="font-extrabold text-sm">{f.q}</span>
                        <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${faqOpen === i ? "rotate-180" : ""}`} />
                      </button>
                      <AnimatePresence>
                        {faqOpen === i && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <p className="px-3.5 pb-3.5 text-sm font-semibold text-muted-foreground leading-snug">{f.a}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>

                <p className="text-[11px] font-bold text-muted-foreground text-center mb-3">{FINE_PRINT}</p>

                {/* sticky CTA (mobile) — v11.4: squish + a living pulse */}
                <div className="sm:static sm:bg-transparent fixed bottom-0 inset-x-0 sm:inset-auto p-4 sm:p-0 bg-parchment/95 backdrop-blur border-t-2 border-paper-border sm:border-0">
                  <motion.button
                    disabled={busy}
                    whileHover={{ scale: 1.015, y: -1 }}
                    whileTap={{ scale: 0.96, y: 2 }}
                    animate={busy ? {} : { scale: [1, 1.012, 1] }}
                    transition={busy ? spring.snappy : { duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                    onClick={() => {
                      sfx.correct()
                      haptics.light()
                      openCheckout(plan === "monthly" ? "monthly" : "annual")
                    }}
                    className="btn3d bg-duo-green text-white shadow-[0_5px_0_#46a302] w-full py-4 text-lg font-black flex items-center justify-center gap-2 mb-2"
                  >
                    <Crown className="w-5 h-5" />
                    {plan === "monthly" ? "Continue — $5.99 today" : "Start free trial — $0.00 due now"}
                  </motion.button>
                  <button
                    disabled={busy}
                    onClick={() => {
                      sfx.tap()
                      haptics.tap()
                      setCheckout("gift")
                      setGiftOn(true)
                      engineTrack("checkout_view", { plan: "gift", bump: "gift_only" })
                    }}
                    className="w-full py-2.5 font-extrabold text-duo-green-dark hover:underline text-sm"
                  >
                    Or gift a year to someone — {GIFT_BUMP.price} 🎁
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
