"use client"

import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, BarChart3, Sun, Moon, ShieldCheck, Compass, ChevronDown } from "lucide-react"
import { sfx } from "@/lib/client/sound"
import { haptics } from "@/lib/client/haptics"
import { useAppStore, type View } from "@/lib/client/store"
import type { EngineStateClient } from "@/lib/client/engine"

/**
 * InsightsPanel — the user-facing half of the Scribe's Ledger.
 *
 * Retention research is unambiguous: visible personalization builds
 * trust, and trust is what compounds LTV. So the engine shows its work:
 * loyalty tier, study rhythm, habit health, the exact next actions it
 * recommends (with the "why"), and a one-tap switch to turn personalized
 * offers off entirely.
 */

const TIER_META: Record<number, { emoji: string; color: string; note: string }> = {
  0: { emoji: "📜", color: "#8B5E3C", note: "Every scribe starts here — consistency writes the next page." },
  1: { emoji: "🖋️", color: "#0F8A80", note: "A steady rhythm is forming. The Academy notices." },
  2: { emoji: "📕", color: "#9B5DE5", note: "You're a keeper of the codex — deep in the habit." },
  3: { emoji: "🏛️", color: "#D97706", note: "Library tier: your discipline funds a whole shelf of knowledge." },
}

export function InsightsPanel() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery<EngineStateClient>({
    queryKey: ["engine/state"],
    staleTime: 60_000,
    retry: false,
  })
  const setView = useAppStore((s) => s.setView)
  const openPaywall = useAppStore((s) => s.openPaywall)
  const pushToast = useAppStore((s) => s.pushToast)
  const [whyOpen, setWhyOpen] = useState<string | null>(null)
  // local override after a toggle; otherwise hydrate from the persisted preference
  const [offersOverride, setOffersOverride] = useState<boolean | null>(null)
  const offersOn = offersOverride ?? data?.personalizedOffers ?? true

  if (isLoading || !data) return null

  const { scores, insights, decisions, featureCount, gameCount } = data
  const tier = TIER_META[scores.loyaltyTier] ?? TIER_META[0]
  const maxHour = Math.max(1, ...insights.hourHistogram)
  const chronotype =
    scores.bestHour !== null && scores.bestHour >= 5 && scores.bestHour < 12 ? "Morning scribe"
      : scores.bestHour !== null && scores.bestHour >= 12 && scores.bestHour < 18 ? "Midday scribe"
        : scores.bestHour !== null && scores.bestHour < 23 ? "Evening scribe"
          : "Night watch"

  const go = (action?: string) => {
    sfx.tap()
    haptics.tap()
    if (!action) return
    if (action === "paywall") openPaywall("profile")
    else setView(action as View)
  }

  const toggleOffers = async () => {
    const next = !offersOn
    setOffersOverride(next)
    sfx.tap()
    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ personalizedOffers: next }),
      })
      pushToast(
        next ? "Personalized offers back on" : "Personalized offers paused",
        next ? "The Academy will time offers to your momentum again." : "Offers now appear only where you open them yourself. No timing tricks.",
        next ? "✨" : "🛡️",
      )
      void qc.invalidateQueries({ queryKey: ["engine/state"] })
    } catch {
      setOffersOverride(!next)
    }
  }

  return (
    <div className="mb-4">
      <h2 className="font-black mb-1 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-duo-purple" /> Your insights
      </h2>
      <p className="text-xs font-bold text-muted-foreground mb-3">
        {featureCount} signals, {gameCount} live settings — the engine that keeps your streak healthy. Fully transparent.
      </p>

      <div className="grid gap-3">
        {/* loyalty tier */}
        <div className="bg-white rounded-3xl border-2 border-paper-border shadow-[0_5px_0_#e8e0c8] p-5">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{tier.emoji}</span>
            <div className="min-w-0 flex-1">
              <p className="font-black text-lg leading-tight" style={{ color: tier.color }}>
                {scores.loyaltyTierName} tier
              </p>
              <p className="text-[11px] font-bold text-muted-foreground">{tier.note}</p>
            </div>
            <span className="text-2xl font-black tabular-nums" style={{ color: tier.color }}>
              {Math.round(scores.loyalty)}
            </span>
          </div>
          <div className="h-3 rounded-full bg-[#eee6cd] overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: tier.color }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.round(scores.loyaltyProgress * 100)}%` }}
              transition={{ type: "spring", stiffness: 70, damping: 16 }}
            />
          </div>
          <p className="text-[11px] font-bold text-muted-foreground mt-1.5">
            {Math.round(scores.loyaltyProgress * 100)}% to the next tier · recency + consistency + advocacy
          </p>
        </div>

        {/* study rhythm + habit health */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-white rounded-3xl border-2 border-paper-border shadow-[0_5px_0_#e8e0c8] p-4">
            <p className="font-black text-sm mb-1 flex items-center gap-1.5">
              {scores.bestHour !== null && scores.bestHour >= 18 ? <Moon className="w-4 h-4 text-duo-purple" /> : <Sun className="w-4 h-4 text-duo-gold" />}
              Your study rhythm
            </p>
            <div className="flex items-end gap-[2px] h-12 mb-1.5" aria-hidden>
              {insights.hourHistogram.map((n, h) => (
                <div
                  key={h}
                  className="flex-1 rounded-t-sm"
                  style={{
                    height: `${Math.max(4, (n / maxHour) * 100)}%`,
                    background: insights.bestHour === h ? "#58A700" : "#e8e0c8",
                  }}
                />
              ))}
            </div>
            <p className="text-[11px] font-bold text-muted-foreground">
              {chronotype}
              {insights.bestHour !== null && ` · peak around ${String(insights.bestHour).padStart(2, "0")}:00`}
            </p>
          </div>

          <div className="bg-white rounded-3xl border-2 border-paper-border shadow-[0_5px_0_#e8e0c8] p-4">
            <p className="font-black text-sm mb-2 flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-duo-green" /> Habit health
            </p>
            <ul className="text-xs font-bold flex flex-col gap-1.5">
              <li className="flex justify-between">
                <span className="text-muted-foreground">Habit stage</span>
                <span className="capitalize">{scores.habitStage.replace("_", " ")}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Active days (30d)</span>
                <span>{insights.activeDays30}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Rest days (30d)</span>
                <span>{insights.restDays30}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Review queue</span>
                <span className={insights.reviewDue > 20 ? "text-duo-red" : ""}>{insights.reviewDue} items</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Avg accuracy</span>
                <span>{Math.round(insights.avgAccuracy)}%</span>
              </li>
            </ul>
          </div>
        </div>

        {/* next best actions */}
        {decisions.length > 0 && (
          <div className="bg-white rounded-3xl border-2 border-paper-border shadow-[0_5px_0_#e8e0c8] p-5">
            <p className="font-black text-sm mb-1 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-duo-red" /> Recommended next
            </p>
            <p className="text-[11px] font-bold text-muted-foreground mb-3">What the engine would do for you right now:</p>
            <div className="flex flex-col gap-2.5">
              {decisions.slice(0, 3).map((d) => (
                <div key={d.kind} className="rounded-2xl bg-secondary/60 p-3">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl leading-none mt-0.5">{d.icon}</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-extrabold text-sm leading-tight">{d.title}</p>
                      <p className="text-xs font-semibold text-muted-foreground leading-snug mt-0.5">{d.body}</p>
                      <div className="flex items-center gap-3 mt-2">
                        {d.action && (
                          <button
                            onClick={() => go(d.action)}
                            className="text-xs font-black text-duo-green-dark hover:underline"
                          >
                            {d.action === "paywall" ? "See the offer" : "Take me there"} →
                          </button>
                        )}
                        <button
                          onClick={() => {
                            sfx.tap()
                            setWhyOpen(whyOpen === d.kind ? null : d.kind)
                          }}
                          className="text-xs font-black text-muted-foreground hover:text-foreground flex items-center gap-1"
                          aria-expanded={whyOpen === d.kind}
                        >
                          Why? <ChevronDown className={`w-3.5 h-3.5 transition-transform ${whyOpen === d.kind ? "rotate-180" : ""}`} />
                        </button>
                      </div>
                      <AnimatePresence>
                        {whyOpen === d.kind && (
                          <motion.p
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden text-[11px] font-semibold text-muted-foreground/80 leading-snug pt-2"
                          >
                            {d.reason}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* transparency & control */}
        <div className="bg-white rounded-3xl border-2 border-paper-border shadow-[0_5px_0_#e8e0c8] p-5">
          <p className="font-black text-sm mb-1 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-duo-green" /> How this works
          </p>
          <p className="text-xs font-semibold text-muted-foreground leading-relaxed mb-3">
            A local engine (the &ldquo;Scribe&rsquo;s Ledger&rdquo;) studies when you learn, what you master and what keeps
            you coming back — then tunes quests, nudges and review timing to you. Every message it sends is drawn from a
            reviewed, grace-filled library; nothing is manipulative, and everything stays on your device.
          </p>
          <button
            onClick={() => void toggleOffers()}
            className="w-full flex items-center justify-between rounded-2xl border-2 border-paper-border px-4 py-3 text-left"
            aria-pressed={offersOn}
          >
            <span>
              <span className="block font-extrabold text-sm">Personalized offers</span>
              <span className="block text-[11px] font-bold text-muted-foreground">
                {offersOn ? "On — offers timed to your momentum" : "Off — offers only where you open them"}
              </span>
            </span>
            <span
              className={`w-12 h-7 rounded-full transition-colors relative shrink-0 ${offersOn ? "bg-duo-green" : "bg-[#d8cfb4]"}`}
              aria-hidden
            >
              <span
                className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all ${offersOn ? "left-6" : "left-1"}`}
              />
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
