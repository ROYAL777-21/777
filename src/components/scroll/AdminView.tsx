"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion"
import {
  BookOpenCheck,
  Church,
  Gift,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react"
import { useAuthStore, DEMO_STAFF_EMAIL } from "@/lib/client/auth"
import { sfx } from "@/lib/client/sound"
import { haptics } from "@/lib/client/haptics"
import type { BootstrapPayload } from "@/lib/types"
import { ChurchDashboard } from "./ChurchDashboard"
import { Mascot } from "./Mascot"

// ═══════════════════════════════════════════════════════════════
//  ADMIN — the staff section (v9)
//
//  This is where the church-plan dashboard now lives: Admin →
//  Churches. Before v9 it floated as its own top-level view; now
//  staff tooling is gathered behind one role-gated door so the
//  learner app stays clean and the pilot team has a single home.
//
//  Tabs: Overview · Churches · Referrals · Content
//  Access: role === "admin" (team domain or the pilot demo account)
// ═══════════════════════════════════════════════════════════════

type AdminTab = "overview" | "churches" | "referrals" | "content"

const TABS: { id: AdminTab; label: string; icon: typeof Church }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "churches", label: "Churches", icon: Church },
  { id: "referrals", label: "Referrals", icon: Gift },
  { id: "content", label: "Content", icon: BookOpenCheck },
]

export function AdminView() {
  const [tab, setTab] = useState<AdminTab>("overview")
  const session = useAuthStore((s) => s.session)

  // ── the gate ──
  if (session?.role !== "admin") return <StaffGate />

  return (
    <div className="px-3 sm:px-5 pt-5 pb-6">
      <div className="max-w-4xl mx-auto">
        {/* header */}
        <header className="flex items-center gap-3 mb-4">
          <span className="w-12 h-12 rounded-2xl bg-[#0F766E]/10 border-2 border-[#0F766E]/30 grid place-items-center shrink-0">
            <ShieldCheck className="w-6 h-6 text-[#0F766E]" />
          </span>
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">Staff admin</h1>
            <p className="text-xs font-bold text-muted-foreground truncate">
              Signed in as {session.name} · {session.email}
            </p>
          </div>
        </header>

        {/* tab rail */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1" role="tablist" aria-label="Admin sections">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => {
                sfx.tap()
                haptics.tap()
                setTab(t.id)
              }}
              className={`btn3d px-4 py-2.5 text-sm border-2 border-b-4 whitespace-nowrap flex items-center gap-1.5 ${
                tab === t.id
                  ? "bg-[#0F766E] text-white border-[#0b5d56] shadow-[0_3px_0_#0b5d56]"
                  : "bg-white border-paper-border text-muted-foreground hover:bg-secondary"
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            {tab === "overview" && <OverviewTab />}
            {tab === "churches" && <ChurchDashboard />}
            {tab === "referrals" && <ReferralsTab />}
            {tab === "content" && <ContentTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

// ── the gate for non-staff ────────────────────────────────────────

function StaffGate() {
  const signInDemoStaff = useAuthStore((s) => s.signInDemoStaff)
  return (
    <div className="px-4 pt-10 pb-6 flex justify-center">
      <div className="bg-white rounded-3xl border-2 border-paper-border shadow-[0_6px_0_#e8e0c8] p-7 max-w-md w-full text-center">
        <div className="flex justify-center mb-2">
          <Mascot mood="cheer" size={84} />
        </div>
        <h1 className="text-2xl font-black mb-1.5">Staff only beyond this point</h1>
        <p className="text-sm font-bold text-muted-foreground leading-relaxed mb-5">
          The admin section holds the church-plan dashboard, referral analytics
          and course publishing. Access is granted to team accounts
          (<span className="font-black">@scrollthebible.org</span>) by invitation.
        </p>
        <button
          onClick={() => {
            sfx.tap()
            haptics.tap()
            signInDemoStaff()
          }}
          className="btn3d bg-[#0F766E] text-white shadow-[0_4px_0_#0b5d56] w-full py-3.5 font-black"
        >
          Enter the pilot demo
        </button>
        <p className="text-[11px] font-bold text-muted-foreground mt-3 leading-relaxed">
          Demo shortcut for the 10 pilot churches — signs in as{" "}
          <span className="font-mono">{DEMO_STAFF_EMAIL}</span>. In production this
          button disappears and staff sign in with real credentials.
        </p>
      </div>
    </div>
  )
}

// ── overview ──────────────────────────────────────────────────────

type ReferralPayload = {
  joins: number
  subscribed: number
  shares: number
  gemsEarned: number
}

function OverviewTab() {
  // real, live numbers we already have
  const { data: boot } = useQuery<BootstrapPayload>({ queryKey: ["bootstrap"] })
  const { data: ref } = useQuery<ReferralPayload>({ queryKey: ["referral"] })

  const kpis = [
    {
      icon: <BookOpenCheck className="w-5 h-5" />,
      label: "Courses live",
      value: boot?.courses?.length ?? "—",
      note: `${boot?.courses?.reduce((s, c) => s + c.totalLessons, 0) ?? 0} lessons published`,
      live: true,
    },
    {
      icon: <Gift className="w-5 h-5" />,
      label: "Referral joins",
      value: ref?.joins ?? "—",
      note: `${ref?.subscribed ?? 0} converted to Pro · ${ref?.shares ?? 0} links shared`,
      live: true,
    },
    {
      icon: <Users className="w-5 h-5" />,
      label: "Pilot churches",
      value: "10",
      note: "Hand-sold cohort · see the Churches tab",
      live: true,
    },
    {
      icon: <Sparkles className="w-5 h-5" />,
      label: "Daily actives",
      value: "1,214",
      note: "Demo data — wire to analytics when live",
      live: false,
    },
  ]

  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {kpis.map((k) => (
          <div key={k.label} className="bg-white rounded-2xl border-2 border-paper-border p-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="w-9 h-9 rounded-xl bg-[#0F766E]/10 grid place-items-center text-[#0F766E]">{k.icon}</span>
              {!k.live && (
                <span className="text-[9px] font-black uppercase tracking-wide bg-duo-gold/20 text-duo-gold-dark rounded-full px-2 py-0.5">
                  demo
                </span>
              )}
            </div>
            <p className="text-2xl font-black tabular-nums leading-none">{k.value}</p>
            <p className="text-[11px] font-black uppercase tracking-wide text-muted-foreground mt-1">{k.label}</p>
            <p className="text-[11px] font-bold text-muted-foreground/80 leading-snug mt-1">{k.note}</p>
          </div>
        ))}
      </div>

      {/* the 90-day heartbeat */}
      <div className="bg-white rounded-2xl border-2 border-paper-border p-5">
        <h2 className="font-black mb-3">Where we are in the 90-day plan</h2>
        <ol className="space-y-2.5">
          {[
            { done: true, label: "Weeks 1–3 · Product: church dashboard, gift subscriptions, order bump" },
            { done: true, label: "Weeks 4–6 · Pricing: $39.99/yr trial + $5.99/mo, Help Center terms" },
            { done: true, label: "Weeks 7–10 · Advent/Christmas gift campaign live" },
            { done: false, label: "Weeks 11–13 · 10 pilot churches onboarded & activated" },
            { done: false, label: "Stripe live payments + webhooks wired by the founder" },
          ].map((row) => (
            <li key={row.label} className="flex items-center gap-3">
              <span
                className={`w-6 h-6 rounded-full border-2 grid place-items-center shrink-0 text-xs font-black ${
                  row.done ? "bg-duo-green border-duo-green text-white" : "border-paper-border text-muted-foreground"
                }`}
                aria-hidden
              >
                {row.done ? "✓" : "•"}
              </span>
              <span className={`text-sm font-bold ${row.done ? "" : "text-muted-foreground"}`}>{row.label}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}

// ── referrals ─────────────────────────────────────────────────────

function ReferralsTab() {
  const { data: ref } = useQuery<ReferralPayload & { code: string; link: string }>({ queryKey: ["referral"] })

  // clearly-labeled illustrative rows — the real leaderboard comes from
  // the database once accounts go live
  const topReferrers = [
    { name: "Grace M.", joins: 14, pro: 5 },
    { name: "Caleb T.", joins: 9, pro: 3 },
    { name: "Lydia K.", joins: 7, pro: 2 },
    { name: "Titus P.", joins: 4, pro: 1 },
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Joins", value: ref?.joins ?? "—", e: "🤝" },
          { label: "Went Pro", value: ref?.subscribed ?? "—", e: "👑" },
          { label: "Shares", value: ref?.shares ?? "—", e: "🔗" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border-2 border-paper-border p-4 text-center">
            <p className="text-xl">{s.e}</p>
            <p className="text-xl font-black tabular-nums">{s.value}</p>
            <p className="text-[11px] font-black uppercase tracking-wide text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border-2 border-paper-border p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-black">Top referrers</h2>
          <span className="text-[9px] font-black uppercase tracking-wide bg-duo-gold/20 text-duo-gold-dark rounded-full px-2 py-0.5">
            demo data
          </span>
        </div>
        <div className="space-y-2">
          {topReferrers.map((r, i) => (
            <div key={r.name} className="flex items-center gap-3 bg-secondary rounded-xl px-3 py-2.5">
              <span className="w-7 h-7 rounded-full bg-duo-purple/15 text-duo-purple grid place-items-center font-black text-sm shrink-0">
                {i + 1}
              </span>
              <span className="font-extrabold text-sm flex-1">{r.name}</span>
              <span className="text-xs font-black text-muted-foreground">{r.joins} joins</span>
              <span className="text-xs font-black text-duo-gold-dark">{r.pro} Pro</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border-2 border-paper-border p-5">
        <h2 className="font-black mb-2">Anti-abuse guardrails (live)</h2>
        <ul className="text-sm font-bold text-muted-foreground space-y-1.5 leading-snug">
          <li>· Max 20 tracked shares and 10 rewarded joins per referrer per day</li>
          <li>· Milestone rungs are unique-keyed — a rung can never pay twice</li>
          <li>· Conversions claim exactly one ledger row, atomically</li>
          <li>· Your own invite code is always rejected — no self-referral farming</li>
        </ul>
      </div>
    </div>
  )
}

// ── content ───────────────────────────────────────────────────────

function ContentTab() {
  const { data: boot } = useQuery<BootstrapPayload>({ queryKey: ["bootstrap"] })
  return (
    <div className="bg-white rounded-2xl border-2 border-paper-border p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-black">Course library</h2>
        <span className="text-xs font-black text-muted-foreground">{boot?.courses?.length ?? 0} courses · all published</span>
      </div>
      <div className="space-y-2">
        {(boot?.courses ?? []).map((c) => (
          <div key={c.id} className="flex items-center gap-3 bg-secondary rounded-xl px-3 py-2.5">
            <span className="text-xl shrink-0">{c.emoji}</span>
            <div className="min-w-0 flex-1">
              <p className="font-extrabold text-sm leading-tight truncate">{c.title}</p>
              <p className="text-[11px] font-bold text-muted-foreground">
                {c.completedLessons}/{c.totalLessons} lessons completed in the demo account
              </p>
            </div>
            <span className="text-[10px] font-black uppercase tracking-wide bg-duo-green/15 text-duo-green-dark rounded-full px-2.5 py-1 shrink-0">
              live
            </span>
          </div>
        ))}
      </div>
      <p className="text-[11px] font-bold text-muted-foreground mt-3 leading-relaxed">
        Publishing controls land with the real CMS wiring — for now every course is live for learners.
      </p>
    </div>
  )
}
