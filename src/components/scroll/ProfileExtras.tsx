"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion"
import {
  Users, UserRound, Target, ShoppingBag, Sprout, GraduationCap, Dumbbell, Drama, Gift,
  ShieldCheck, LogOut, LogIn,
  Crown, Clock, Moon, Mail, ChevronDown, Check, X, BellRing, Copy, Send, PartyPopper,
} from "lucide-react"
import { useAppStore, type View } from "@/lib/client/store"
import { useAuthStore } from "@/lib/client/auth"
import { sfx } from "@/lib/client/sound"
import { haptics } from "@/lib/client/haptics"
import { NOTIF_CATEGORIES, EMAIL_JOURNEY_KEYS } from "@/lib/journeyMeta"
import { OFFER_NAME, GUARANTEE, GIFT_BUMP } from "@/lib/offer"
import type { ChurchDashboardPayload, GiftListPayload } from "@/lib/types"
import confetti from "canvas-confetti"

// ═══════════════════════════════════════════════════════════════
//  Explore menu — the features consolidated out of the mobile
//  tab bar live here, always one tap away
// ═══════════════════════════════════════════════════════════════

const EXPLORE_ITEMS: { view: View; label: string; sub: string; icon: typeof Users; color: string; emoji: string; staffOnly?: boolean }[] = [
  { view: "stories", label: "Stories", sub: "20 interactive scenes · XP", icon: Drama, color: "#EC4899", emoji: "🎭" },
  { view: "quests", label: "Quests", sub: "Daily challenges · gem rewards", icon: Target, color: "#9B5DE5", emoji: "🎯" },
  { view: "shop", label: "Shop", sub: "Freezes, refills & boosts", icon: ShoppingBag, color: "#58A700", emoji: "🛍️" },
  { view: "community", label: "Community", sub: "Share wins with the fellowship", icon: Users, color: "#E4453D", emoji: "📣" },
  { view: "friends", label: "Friends", sub: "Study partners & quests", icon: UserRound, color: "#D97706", emoji: "🤝" },
  { view: "growth", label: "Growth Hub", sub: "Tips that compound", icon: Sprout, color: "#65A30D", emoji: "🌱" },
  { view: "courses", label: "My courses", sub: "19 paths · switch anytime", icon: GraduationCap, color: "#0F766E", emoji: "🎓" },
  { view: "practice-hub", label: "Practice Hub", sub: "Mistake review & drills", icon: Dumbbell, color: "#B45309", emoji: "🏋️" },
  // v9: the church-plan dashboard moved into the staff admin section.
  // Everyone sees the tile; non-staff land on a friendly gate (with the
  // pilot demo shortcut) instead of a dead end.
  { view: "admin", label: "Admin", sub: "Staff section · church dashboard", icon: ShieldCheck, color: "#0F766E", emoji: "🛡️" },
]

export function ExploreMenu() {
  const setView = useAppStore((s) => s.setView)
  const isAdmin = useAuthStore((s) => s.session?.role === "admin")
  const items = EXPLORE_ITEMS.filter((i) => !i.staffOnly || isAdmin)
  return (
    <div className="bg-white rounded-3xl border-2 border-paper-border shadow-[0_5px_0_#e8e0c8] p-5 mb-4">
      <h2 className="font-black mb-1">Explore</h2>
      <p className="text-xs font-bold text-muted-foreground mb-3">Everything you need, one tap from your profile.</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {items.map((item) => (
          <motion.button
            key={item.view}
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              sfx.tap()
              haptics.tap()
              setView(item.view)
            }}
            className="flex flex-col items-center gap-1.5 rounded-2xl border-2 border-paper-border bg-secondary/60 px-2 py-3.5 hover:border-muted-foreground/40 transition-colors min-h-[92px] justify-center"
          >
            <span className="w-10 h-10 rounded-xl grid place-items-center text-xl" style={{ backgroundColor: item.color + "1f" }}>
              {item.emoji}
            </span>
            <span className="font-black text-sm leading-none">{item.label}</span>
            <span className="text-[10px] font-bold text-muted-foreground text-center leading-tight">{item.sub}</span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
//  Account card — the sign-in state, made visible (v9)
// ═══════════════════════════════════════════════════════════════

export function AccountCard() {
  const session = useAuthStore((s) => s.session)
  const guest = useAuthStore((s) => s.guest)
  const signOut = useAuthStore((s) => s.signOut)
  const pushToast = useAppStore((s) => s.pushToast)

  return (
    <div className="bg-white rounded-3xl border-2 border-paper-border shadow-[0_5px_0_#e8e0c8] p-5 mb-4">
      <h2 className="font-black mb-3">Account</h2>
      {session ? (
        <>
          <div className="flex items-center gap-3 bg-secondary rounded-2xl px-4 py-3 mb-2.5">
            <span className="w-10 h-10 rounded-full bg-duo-green/15 text-duo-green-dark grid place-items-center font-black text-lg shrink-0">
              {session.name.slice(0, 1).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-extrabold text-sm truncate">{session.name}</p>
              <p className="text-xs font-bold text-muted-foreground truncate">{session.email}</p>
            </div>
            {session.role === "admin" && (
              <span className="text-[10px] font-black uppercase tracking-wide bg-[#0F766E]/10 text-[#0F766E] rounded-full px-2.5 py-1 shrink-0">
                staff
              </span>
            )}
          </div>
          <button
            onClick={() => {
              sfx.tap()
              haptics.tap()
              signOut()
              pushToast("Signed out 📜", "Your streak is safe — sign back in anytime.", "👋")
            }}
            className="flex items-center gap-3 bg-secondary rounded-2xl px-4 py-3 font-extrabold hover:bg-paper-border/50 transition-colors w-full"
          >
            <LogOut className="w-5 h-5" />
            <span className="flex-1 text-left">Sign out</span>
          </button>
        </>
      ) : guest ? (
        <>
          <p className="text-sm font-bold text-muted-foreground leading-snug mb-2.5">
            You&apos;re browsing as a guest — your progress lives on this device only.
            Create an account to keep it safe on every device.
          </p>
          <button
            onClick={() => {
              sfx.tap()
              haptics.tap()
              signOut() // clears guest mode → the auth flow appears
            }}
            className="flex items-center gap-3 bg-duo-green text-white rounded-2xl px-4 py-3 font-black w-full"
          >
            <LogIn className="w-5 h-5" />
            <span className="flex-1 text-left">Create your account</span>
          </button>
        </>
      ) : null}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
//  Statement of Faith — the doctrinal foundation every course is
//  built and audited against (the Nicene core of Christianity)
// ═══════════════════════════════════════════════════════════════

const FAITH_POINTS: { title: string; body: string }[] = [
  {
    title: "One God, three Persons",
    body: "We teach one God — Father, Son and Holy Spirit — one Being in three co-equal, co-eternal Persons (Matt 28:19; 2 Cor 13:14).",
  },
  {
    title: "Jesus Christ is Lord",
    body: "Fully God and fully man: born of the virgin Mary, He lived without sin, died for our sins, rose bodily on the third day, ascended — and He will return to judge the living and the dead (John 1:1,14; 1 Cor 15:3–8).",
  },
  {
    title: "Salvation by grace",
    body: "Salvation is God's gift, received through faith in Christ — never earned by works, and always producing them (Eph 2:8–10).",
  },
  {
    title: "Scripture is God's word",
    body: "The Bible is His inspired revelation, the final rule for what we teach (2 Tim 3:16).",
  },
  {
    title: "The Holy Spirit is God",
    body: "The divine Lord and giver of life, who indwells every believer and empowers the church (Acts 5:3–4; Rom 8:9).",
  },
  {
    title: "The blessed hope",
    body: "The bodily resurrection of the dead, real judgment, and the new creation where God dwells with His people (Rev 21:1–4).",
  },
  {
    title: "How we teach",
    body: "Denomination courses present each tradition fairly from its own sources — Catholic, Orthodox, Pentecostal, Baptist, Anglican, Methodist, Reformed and Lutheran. Other faiths are described as their adherents would recognize them. Where Christians differ, we say so honestly; what all Christians hold, we hold together.",
  },
  {
    title: "Scripture versions",
    body: "The built-in reader serves the King James Version (66-book canon). Lessons quote from faithful translations — most often modern ones such as the ESV, sometimes the KJV — and always tell you the reference so you can check it yourself.",
  },
]

export function StatementOfFaith() {
  const [open, setOpen] = useState(false)
  return (
    <div className="bg-white rounded-3xl border-2 border-paper-border shadow-[0_5px_0_#e8e0c8] p-5 mb-4">
      <button
        onClick={() => {
          sfx.tap()
          setOpen((o) => !o)
        }}
        className="w-full flex items-center justify-between gap-3 text-left min-h-[44px]"
      >
        <div>
          <h2 className="font-black">What we believe ✝️</h2>
          <p className="text-xs font-bold text-muted-foreground mt-0.5">
            The Nicene core every course is built — and audited — on. Tap to read.
          </p>
        </div>
        <motion.span animate={{ rotate: open ? 180 : 0 }} className="shrink-0">
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <ul className="mt-4 space-y-3">
              {FAITH_POINTS.map((p) => (
                <li key={p.title} className="rounded-2xl border-2 border-paper-border bg-secondary/60 p-3">
                  <p className="font-black text-sm">{p.title}</p>
                  <p className="text-xs font-bold text-muted-foreground leading-relaxed mt-1">{p.body}</p>
                </li>
              ))}
            </ul>
            <p className="text-[11px] font-bold text-muted-foreground mt-3 leading-relaxed">
              Every lesson in this academy is reviewed against this foundation. Be like the Bereans — check
              everything you learn here against the Scriptures themselves (Acts 17:11).
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
//  Scroll Pro plan card — manage subscription / upgrade
// ═══════════════════════════════════════════════════════════════

type ProStatus = { plan: string; isPro: boolean; onTrial: boolean; trialEndsAt: string | null; planSince: string | null }

export function PlanCard() {
  const qc = useQueryClient()
  const pushToast = useAppStore((s) => s.pushToast)
  const openPaywall = useAppStore((s) => s.openPaywall)
  const [managing, setManaging] = useState(false)

  const { data } = useQuery<ProStatus>({ queryKey: ["pro"], queryFn: async () => (await fetch("/api/pro")).json() })

  const act = useMutation({
    mutationFn: async (action: string) => {
      const res = await fetch("/api/pro", { method: "POST", body: JSON.stringify({ action }) })
      return res.json() as Promise<ProStatus & { ok: boolean }>
    },
    onSuccess: (d, action) => {
      pushToast(
        action === "cancel" ? "Membership paused 👋" : "Membership paused 🕊️",
        action === "cancel"
          ? "You're back on the free academy — it stays free forever."
          : "Paused + Streak Freezes topped up to 2. Come back anytime.",
        "👑",
      )
      void qc.invalidateQueries({ queryKey: ["pro"] })
      void qc.invalidateQueries({ queryKey: ["bootstrap"] })
      setManaging(false)
    },
  })

  const isPro = data?.isPro ?? false
  const isLifetime = data?.plan === "lifetime"

  return (
    <div className={`rounded-3xl border-2 shadow-[0_5px_0_#e8e0c8] p-5 mb-4 ${isPro ? "bg-gradient-to-br from-[#FFC800] to-[#FFB800] border-[#d9a400]" : "bg-white border-paper-border"}`}>
      {isPro ? (
        <div className="flex items-start gap-4">
          <span className="w-12 h-12 rounded-2xl bg-white/50 grid place-items-center shrink-0">
            <Crown className="w-7 h-7 text-[#5c4500]" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="font-black text-lg text-[#3d2f00]">Scroll Pro {isLifetime ? "Lifetime" : data?.onTrial ? "· Free trial" : ""}</h2>
            <p className="text-sm font-bold text-[#5c4500] leading-snug">
              {isLifetime
                ? "Every course, forever. Founding member pricing locked for life."
                : data?.onTrial
                  ? `Trial ends ${data.trialEndsAt ? new Date(data.trialEndsAt).toLocaleDateString() : "in 7 days"}. Cancel anytime — keep everything meanwhile.`
                  : `${OFFER_NAME} active. ${GUARANTEE.name} in force.`}
            </p>
            <button
              onClick={() => {
                sfx.tap()
                setManaging((m) => !m)
              }}
              className="mt-2 text-sm font-black text-[#5c4500] underline underline-offset-2"
            >
              {managing ? "Close" : "Manage membership"}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-4">
          <span className="w-12 h-12 rounded-2xl bg-duo-gold/20 grid place-items-center shrink-0">
            <Crown className="w-7 h-7 text-duo-gold-dark" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="font-black text-lg">Scroll Pro</h2>
            <p className="text-sm font-bold text-muted-foreground leading-snug mb-2.5">
              All 18 courses · unlimited hearts · 2× XP weekends · Streak Repair ×2/mo — under a 30-day grow-or-free guarantee.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  sfx.tap()
                  haptics.tap()
                  openPaywall("profile")
                }}
                className="btn3d bg-duo-gold text-[#5c4500] shadow-[0_4px_0_#d9a400] py-2.5 px-5 text-sm"
              >
                Try 7 days free
              </button>
              <span className="text-xs font-black text-muted-foreground self-center">7-day free trial · cancel in two taps</span>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {managing && isPro && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="mt-3 pt-3 border-t-2 border-[#00000018] flex flex-col gap-2">
              <p className="text-xs font-bold text-[#5c4500]">
                Billing: {isLifetime ? "one-time payment" : data?.onTrial ? "free trial" : "renews automatically"} · cancel anytime
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => act.mutate("pause")}
                  disabled={act.isPending}
                  className="flex-1 btn3d bg-white/70 text-[#5c4500] border-2 border-[#00000022] shadow-[0_3px_0_#00000022] py-2.5 text-sm"
                >
                  Pause + top up freezes
                </button>
                <button
                  onClick={() => act.mutate("cancel")}
                  disabled={act.isPending}
                  className="flex-1 btn3d bg-white/70 text-duo-red-dark border-2 border-duo-red/30 shadow-[0_3px_0_#00000022] py-2.5 text-sm"
                >
                  Cancel membership
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/** Give-a-month-get-a-month referral card (growth loop, Hormozi-style) */
type ReferralPayload = {
  code: string
  link: string
  shares: number
  joins: number
  subscribed: number
  gemsEarned: number
  proMonthsEarned: number
  bankedProMonths: number
  plan: string
  nextMilestone: { joins: number; kind: string; amount: number; label: string } | null
  milestones: { joins: number; kind: string; amount: number; label: string; reached: boolean }[]
  invites: { id: string; friendName: string; status: string; joinedAt: string; note: string }[]
}

export function ReferralCard() {
  const pushToast = useAppStore((s) => s.pushToast)
  const qc = useQueryClient()
  const { data } = useQuery<ReferralPayload>({
    queryKey: ["referral"],
    queryFn: async () => (await fetch("/api/referral")).json(),
  })

  const post = useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const res = await fetch("/api/referral", { method: "POST", body: JSON.stringify(body) })
      return { ok: res.ok, data: (await res.json()) as Record<string, unknown> }
    },
    onSuccess: ({ ok, data: d }) => {
      void qc.invalidateQueries({ queryKey: ["referral"] })
      void qc.invalidateQueries({ queryKey: ["bootstrap"] })
      if (!ok) return
      const r = d as { friendName?: string; milestoneAwarded?: string | null; rewardNote?: string; proMonths?: number }
      if (r.milestoneAwarded !== undefined) {
        pushToast("A friend joined! 🎉", r.rewardNote ?? "Referral rewards granted.", "🎁")
        if (r.milestoneAwarded) {
          setTimeout(() => pushToast("Milestone reached 🏅", r.milestoneAwarded ?? "", "🏅"), 900)
        }
      } else if (r.proMonths !== undefined) {
        pushToast("Your friend went Pro! 👑", `+${r.proMonths} free Pro month banked for you.`, "👑")
      }
    },
  })

  const code = data?.code ?? "······"
  const link = data?.link ?? "https://scroll.academy/join"
  const nextGoal = data?.nextMilestone
  const progressPct = nextGoal && data ? Math.min(100, Math.round((data.joins / nextGoal.joins) * 100)) : 100

  const share = async () => {
    sfx.tap()
    haptics.tap()
    post.mutate({ action: "share" })
    const text = `I'm learning the Bible a few minutes a day on Scroll Academy — Greek, Hebrew, apologetics, logic. Join me — you'll start with +100 gems: ${link}`
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "Scroll Academy", text, url: link })
        return
      } catch {
        /* user dismissed — fall through to copy */
      }
    }
    void navigator.clipboard?.writeText(text).catch(() => undefined)
    pushToast("Invite copied 🔗", "Send it to a friend — you're both rewarded when they join.", "🎁")
  }

  return (
    <div className="bg-white rounded-3xl border-2 border-paper-border shadow-[0_5px_0_#e8e0c8] p-5 mb-4">
      <div className="flex items-start gap-4 mb-3">
        <span className="text-3xl">🎁</span>
        <div className="min-w-0 flex-1">
          <h2 className="font-black">Give a month, get a month</h2>
          <p className="text-sm font-bold text-muted-foreground leading-snug">
            Invite a friend to the academy. They start with <b>+100 gems</b> to welcome them — you earn{" "}
            <b>+50 gems</b> per friend, and a <b>free Pro month</b> whenever one of them subscribes.
          </p>
        </div>
      </div>

      {/* stats strip */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        {[
          { v: data?.joins ?? 0, l: "Friends joined", e: "🤝" },
          { v: data?.subscribed ?? 0, l: "Went Pro", e: "👑" },
          { v: data?.gemsEarned ?? 0, l: "Gems earned", e: "💎" },
          { v: data?.bankedProMonths ?? 0, l: "Pro banked", e: "🗓️" },
        ].map((s) => (
          <div key={s.l} className="rounded-2xl bg-paper-bg border border-paper-border py-2 px-1 text-center">
            <div className="text-lg leading-none">{s.e}</div>
            <div className="font-black text-lg leading-tight">{s.v}</div>
            <div className="text-[10px] font-bold text-muted-foreground leading-tight">{s.l}</div>
          </div>
        ))}
      </div>

      {/* milestone ladder */}
      <div className="rounded-2xl border-2 border-paper-border overflow-hidden mb-3">
        <div className="bg-paper-bg px-3 py-2 flex items-center justify-between">
          <span className="text-xs font-black">🏅 Reward ladder</span>
          {nextGoal ? (
            <span className="text-[11px] font-bold text-muted-foreground">
              {nextGoal.joins - (data?.joins ?? 0)} more to {nextGoal.label.split("—")[0].trim()}
            </span>
          ) : (
            <span className="text-[11px] font-bold text-duo-green">All milestones cleared!</span>
          )}
        </div>
        {nextGoal && (
          <div className="h-2 bg-paper-border/60">
            <motion.div
              className="h-2 bg-duo-purple"
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
            />
          </div>
        )}
        <div className="p-2.5 space-y-1.5">
          {(data?.milestones ?? []).map((m) => (
            <div key={m.joins} className={`flex items-center gap-2 text-xs font-bold ${m.reached ? "text-duo-green" : "text-muted-foreground"}`}>
              <span className={`w-4 h-4 rounded-full border-2 grid place-items-center shrink-0 ${m.reached ? "border-duo-green bg-duo-green text-white" : "border-paper-border"}`}>
                {m.reached ? <Check className="w-2.5 h-2.5" /> : null}
              </span>
              <span className={m.reached ? "" : "opacity-70"}>{m.label}</span>
              <span className="ml-auto text-[10px] text-muted-foreground">{m.joins} friend{m.joins > 1 ? "s" : ""}</span>
            </div>
          ))}
        </div>
      </div>

      {/* invite actions */}
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <button onClick={share} className="btn3d bg-duo-purple text-white shadow-[0_3px_0_#7c3aed] py-2.5 px-5 text-sm">
          Share invite link
        </button>
        <button
          onClick={() => {
            sfx.tap()
            haptics.tap()
            void navigator.clipboard?.writeText(link).catch(() => undefined)
            post.mutate({ action: "share" })
            pushToast("Invite link copied 🔗", "Send it to a friend — you're both rewarded with gems when they join.", "🎁")
          }}
          className="btn3d bg-white border-2 border-paper-border shadow-[0_3px_0_#e8e0c8] py-2.5 px-4 text-sm font-black"
        >
          Copy link
        </button>
        <span className="text-[11px] font-bold text-muted-foreground">Your code: <b className="tracking-widest text-foreground">{code}</b></span>
      </div>

      {/* banked Pro credit */}
      {(data?.bankedProMonths ?? 0) > 0 && (
        <button
          onClick={() => {
            sfx.gem()
            haptics.complete()
            post.mutate({ action: "apply_credit" })
          }}
          className="w-full btn3d bg-amber-400 text-amber-950 shadow-[0_3px_0_#b45309] py-2.5 text-sm font-black mb-2"
        >
          Apply {data?.bankedProMonths} free Pro month{(data?.bankedProMonths ?? 0) > 1 ? "s" : ""} 🗓️
        </button>
      )}

      {/* invite ledger */}
      {(data?.invites?.length ?? 0) > 0 && (
        <div className="rounded-2xl border border-paper-border divide-y divide-paper-border">
          {data!.invites.slice(0, 6).map((i) => (
            <div key={i.id} className="flex items-center gap-2.5 px-3 py-2">
              <span className="text-base">{i.status === "subscribed" ? "👑" : "🤝"}</span>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-black truncate">{i.friendName}</div>
                <div className="text-[10px] font-bold text-muted-foreground truncate">{i.note}</div>
              </div>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${i.status === "subscribed" ? "bg-amber-100 text-amber-800" : "bg-paper-bg text-muted-foreground"}`}>
                {i.status === "subscribed" ? "PRO" : "JOINED"}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* sandbox demo hooks — let you experience the loop end-to-end (dev builds only) */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => post.mutate({ action: "demo_join" })}
          className="mt-2 text-[10px] font-bold text-muted-foreground underline underline-offset-2"
        >
          demo: a friend accepted your invite →
        </button>
        {(data?.joins ?? 0) > (data?.subscribed ?? 0) && (
          <button
            onClick={() => post.mutate({ action: "demo_subscribe" })}
            className="mt-2 text-[10px] font-bold text-muted-foreground underline underline-offset-2"
          >
            demo: that friend went Pro →
          </button>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
//  Notification & email preferences card
// ═══════════════════════════════════════════════════════════════

type PrefsPayload = {
  notifPrefs: Record<string, boolean>
  emailPrefs: Record<string, boolean>
  reminderTime: string
  quietHoursOn: boolean
  emailOptIn: boolean
}

export function NotificationPrefsCard() {
  const qc = useQueryClient()
  const pushToast = useAppStore((s) => s.pushToast)
  const [journeysOpen, setJourneysOpen] = useState(false)

  const { data } = useQuery<PrefsPayload>({
    queryKey: ["notif-prefs"],
    queryFn: async () => (await fetch("/api/notifications/prefs")).json(),
  })

  const save = useMutation({
    mutationFn: async (patch: Record<string, unknown>) => {
      const res = await fetch("/api/notifications/prefs", { method: "POST", body: JSON.stringify(patch) })
      return res.json() as Promise<PrefsPayload & { ok: boolean }>
    },
    onSuccess: (d) => {
      void qc.invalidateQueries({ queryKey: ["notif-prefs"] })
    },
    onError: () => pushToast("Couldn't save", "Try again in a moment.", "🕯️"),
  })

  const notif = data?.notifPrefs ?? {}
  const email = data?.emailPrefs ?? {}

  return (
    <div className="bg-white rounded-3xl border-2 border-paper-border shadow-[0_5px_0_#e8e0c8] p-5 mb-4">
      <h2 className="font-black mb-1">Notifications & email</h2>
      <p className="text-xs font-bold text-muted-foreground mb-3">Personal, specific and timed — all under your control.</p>

      {/* timed: daily reminder time */}
      <div className="flex items-center gap-3 bg-secondary rounded-2xl px-4 py-3 mb-2">
        <Clock className="w-5 h-5 shrink-0 text-duo-green-dark" />
        <div className="flex-1 min-w-0">
          <p className="font-extrabold text-sm leading-tight">Daily study reminder</p>
          <p className="text-[11px] font-bold text-muted-foreground">We nudge you at exactly this time if you haven't studied</p>
        </div>
        <select
          value={data?.reminderTime ?? "19:00"}
          onChange={(e) => save.mutate({ reminderTime: e.target.value })}
          className="bg-white border-2 border-paper-border rounded-xl px-2 py-1.5 font-black text-sm focus:outline-none focus:border-duo-green"
          aria-label="Daily reminder time"
        >
          {["07:00", "08:00", "12:00", "17:00", "19:00", "20:00", "21:00"].map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* timed: quiet hours */}
      <div className="flex items-center gap-3 bg-secondary rounded-2xl px-4 py-3 mb-2">
        <Moon className="w-5 h-5 shrink-0 text-duo-purple" />
        <p className="font-extrabold text-sm flex-1">Quiet hours (21:00–08:00)</p>
        <Toggle on={data?.quietHoursOn ?? true} onToggle={() => save.mutate({ quietHoursOn: !data?.quietHoursOn })} label="Quiet hours" />
      </div>

      {/* per-category notification toggles */}
      <div className="rounded-2xl border-2 border-paper-border overflow-hidden mb-2">
        {NOTIF_CATEGORIES.map((cat, i) => (
          <div key={cat.key} className={`flex items-center gap-3 px-4 py-2.5 ${i > 0 ? "border-t border-paper-border/70" : ""} ${notif[cat.key] === false ? "opacity-50" : ""}`}>
            <span className="text-lg shrink-0">{cat.emoji}</span>
            <div className="min-w-0 flex-1">
              <p className="font-extrabold text-sm leading-tight">{cat.label}</p>
              <p className="text-[11px] font-bold text-muted-foreground leading-tight">{cat.description}</p>
            </div>
            <Toggle on={notif[cat.key] !== false} onToggle={() => save.mutate({ notifPrefs: { [cat.key]: notif[cat.key] === false } })} label={cat.label} />
          </div>
        ))}
      </div>

      {/* email master + journeys */}
      <div className="flex items-center gap-3 bg-secondary rounded-2xl px-4 py-3 mb-2">
        <Mail className="w-5 h-5 shrink-0 text-[#B45309]" />
        <p className="font-extrabold text-sm flex-1">Email journeys</p>
        <Toggle on={data?.emailOptIn ?? true} onToggle={() => save.mutate({ emailOptIn: !data?.emailOptIn })} label="Email journeys" />
      </div>
      <div className={`rounded-2xl border-2 border-paper-border overflow-hidden mb-2 ${(data?.emailOptIn ?? true) ? "" : "opacity-50"}`}>
        {EMAIL_JOURNEY_KEYS.map((j, i) => (
          <div key={j.key} className={`flex items-center gap-3 px-4 py-2.5 ${i > 0 ? "border-t border-paper-border/70" : ""}`}>
            <span className="text-lg shrink-0">{j.emoji}</span>
            <div className="min-w-0 flex-1">
              <p className="font-extrabold text-sm leading-tight">{j.label}</p>
              <p className="text-[11px] font-bold text-muted-foreground leading-tight">{j.description}</p>
            </div>
            <Toggle
              on={email[j.key] !== false}
              onToggle={() => save.mutate({ emailPrefs: { [j.key]: email[j.key] === false } })}
              label={j.label}
            />
          </div>
        ))}
      </div>

      <button
        onClick={() => {
          sfx.tap()
          haptics.tap()
          setJourneysOpen(true)
        }}
        className="w-full btn3d bg-white border-2 border-duo-purple/50 text-duo-purple-dark shadow-[0_3px_0_#e8e0c8] py-2.5 px-3 flex items-center justify-center gap-2 text-sm"
      >
        <Mail className="w-4 h-4" /> Preview the email journeys
      </button>

      <EmailJourneyDialog open={journeysOpen} onClose={() => setJourneysOpen(false)} />
    </div>
  )
}

function Toggle({ on, onToggle, label }: { on: boolean; onToggle: () => void; label: string }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => {
        haptics.tap()
        onToggle()
      }}
      className="w-[52px] h-7 rounded-full transition-colors relative shrink-0"
      style={{ backgroundColor: on ? "#58cc02" : "rgba(138,132,113,0.4)" }}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 32 }}
        className="absolute top-1 w-5 h-5 rounded-full bg-white shadow"
        style={{ left: on ? 27 : 5 }}
      />
    </button>
  )
}

// ═══════════════════════════════════════════════════════════════
//  Email journey preview dialog — every step, subject + copy
// ═══════════════════════════════════════════════════════════════

type EmailLogDTO = {
  id: string
  journey: string
  step: string
  subject: string
  preheader: string
  bodyText: string
  ctaLabel: string | null
  ctaView: string | null
  status: string
  sentAt: string
}

export function EmailJourneyDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [journey, setJourney] = useState<string>(EMAIL_JOURNEY_KEYS[0].key)
  const setView = useAppStore((s) => s.setView)

  const { data } = useQuery<{ emails: EmailLogDTO[] }>({
    queryKey: ["email-journeys"],
    queryFn: async () => (await fetch("/api/email-journeys")).json(),
    enabled: open,
  })

  const sent = (data?.emails ?? []).filter((e) => e.journey === journey)

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[85] bg-black/45 flex items-end sm:items-center justify-center" onClick={onClose}>
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-parchment w-full sm:max-w-lg h-[88dvh] sm:h-auto sm:max-h-[88dvh] rounded-t-3xl sm:rounded-3xl border-2 border-paper-border shadow-2xl flex flex-col"
            role="dialog"
            aria-label="Email journeys"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b-2 border-paper-border bg-white rounded-t-3xl">
              <div>
                <h3 className="font-black">Email journeys</h3>
                <p className="text-[11px] font-bold text-muted-foreground">Every email we send — full transparency</p>
              </div>
              <button onClick={onClose} className="w-9 h-9 rounded-full bg-secondary border-2 border-paper-border grid place-items-center font-black" aria-label="Close">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* journey tabs */}
            <div className="flex gap-1.5 px-4 py-3 overflow-x-auto border-b-2 border-paper-border bg-white" role="tablist">
              {EMAIL_JOURNEY_KEYS.map((j) => (
                <button
                  key={j.key}
                  role="tab"
                  aria-selected={journey === j.key}
                  onClick={() => {
                    sfx.tap()
                    setJourney(j.key)
                  }}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-black border-2 transition-colors ${
                    journey === j.key ? "bg-duo-purple text-white border-duo-purple" : "bg-white border-paper-border text-muted-foreground"
                  }`}
                >
                  {j.emoji} {j.label}
                </button>
              ))}
            </div>

            <div className="overflow-y-auto p-4 flex flex-col gap-3">
              {sent.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground font-semibold text-sm">
                  <BellRing className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                  No emails from this journey yet — each sends once its moment arrives.
                </div>
              ) : (
                sent.map((e) => (
                  <div key={e.id} className="bg-white rounded-2xl border-2 border-paper-border p-4">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[10px] font-black uppercase tracking-wide text-duo-green-dark bg-duo-green/10 rounded-full px-2 py-0.5">
                        ✓ {e.status} · {new Date(e.sentAt).toLocaleDateString()}
                      </span>
                      <span className="text-[10px] font-black text-muted-foreground">{e.step}</span>
                    </div>
                    <p className="font-black text-sm leading-snug">{e.subject}</p>
                    {e.preheader && <p className="text-xs font-bold text-muted-foreground mt-0.5">{e.preheader}</p>}
                    <p className="text-xs font-semibold text-muted-foreground whitespace-pre-line leading-relaxed mt-2 line-clamp-6">{e.bodyText}</p>
                    {e.ctaLabel && (
                      <button
                        onClick={() => {
                          sfx.tap()
                          onClose()
                          if (e.ctaView === "paywall") useAppStore.getState().openPaywall("general")
                          else if (e.ctaView) setView(e.ctaView as View)
                        }}
                        className="mt-2.5 text-xs font-black text-duo-green-dark underline underline-offset-2"
                      >
                        {e.ctaLabel} →
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
