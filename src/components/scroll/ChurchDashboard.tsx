"use client"

// ═══════════════════════════════════════════════════════════════
//  ChurchDashboard — the B2B admin seat view
//  (REVENUE.md §6 weeks 3–6: "admin seat view: cohort progress,
//   verse coverage, streaks")
//
//  Everything here is real data from /api/church:
//   · the pilot cohort's stored weekly snapshot
//   · YOUR seat recomputed live (lessons, Bible chapters, streak)
// ═══════════════════════════════════════════════════════════════

import { useMemo, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { motion } from "framer-motion"
import {
  Church, Flame, BookOpenCheck, Zap, Users, TrendingUp, UserPlus, X, HeartHandshake,
} from "lucide-react"
import { sfx } from "@/lib/client/sound"
import { haptics } from "@/lib/client/haptics"
import type { ChurchDashboardPayload, ChurchMemberDTO } from "@/lib/types"

type SortKey = "weeklyXp" | "streak" | "lessons" | "chaptersRead" | "lastActive"

const SORTS: { key: SortKey; label: string }[] = [
  { key: "weeklyXp", label: "This week XP" },
  { key: "streak", label: "Streak" },
  { key: "lessons", label: "Lessons" },
  { key: "chaptersRead", label: "Chapters" },
  { key: "lastActive", label: "Recently active" },
]

const STATUS_STYLE: Record<ChurchMemberDTO["status"], { label: string; cls: string }> = {
  active: { label: "active", cls: "text-duo-green-dark bg-duo-green/10" },
  quiet: { label: "quiet", cls: "text-amber-700 bg-amber-100" },
  lapsed: { label: "lapsed", cls: "text-red-700 bg-red-100" },
}

export function ChurchDashboard() {
  const qc = useQueryClient()
  const [sort, setSort] = useState<SortKey>("weeklyXp")
  const [inviteName, setInviteName] = useState("")
  const [inviteErr, setInviteErr] = useState<string | null>(null)

  const { data, isLoading } = useQuery<ChurchDashboardPayload>({
    queryKey: ["church"],
    staleTime: 30_000,
  })

  const invite = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/church", { method: "POST", body: JSON.stringify({ action: "invite", name: inviteName }) })
      const json = (await res.json()) as { ok?: boolean; error?: string }
      if (!res.ok || !json.ok) throw new Error(json.error ?? "failed")
      return json
    },
    onSuccess: () => {
      sfx.correct()
      haptics.light()
      setInviteName("")
      setInviteErr(null)
      void qc.invalidateQueries({ queryKey: ["church"] })
    },
    onError: (e: Error) => {
      haptics.wrong()
      setInviteErr(
        e.message === "all seats filled"
          ? "All 50 seats are filled — the plan covers everyone."
          : "Use their real name (2–24 letters).",
      )
    },
  })

  const remove = useMutation({
    mutationFn: async (memberId: string) => {
      const res = await fetch("/api/church", { method: "POST", body: JSON.stringify({ action: "remove", memberId }) })
      const json = (await res.json()) as { ok?: boolean; error?: string }
      if (!res.ok || !json.ok) throw new Error(json.error ?? "failed")
      return json
    },
    onSuccess: () => {
      sfx.tap()
      void qc.invalidateQueries({ queryKey: ["church"] })
    },
  })

  const members = useMemo(() => {
    if (!data) return []
    const list = [...data.members]
    // you always first, then the chosen sort, newest activity at top
    const youIdx = list.findIndex((m) => m.isYou)
    const you = youIdx >= 0 ? list.splice(youIdx, 1)[0] : null
    list.sort((a, b) => {
      if (sort === "lastActive") return a.lastActiveDaysAgo - b.lastActiveDaysAgo
      return (b[sort] as number) - (a[sort] as number)
    })
    return you ? [you, ...list] : list
  }, [data, sort])

  if (isLoading || !data) {
    return (
      <div className="p-8 flex flex-col items-center gap-3">
        <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 1.4, repeat: Infinity }} className="text-5xl">
          ⛪
        </motion.div>
        <p className="font-black text-muted-foreground">Opening the parish ledger…</p>
      </div>
    )
  }

  const { org, cohort } = data
  const renewal = new Date(org.renewalAt).toLocaleDateString("en-US", { month: "long", day: "numeric" })
  const started = new Date(org.startedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  const maxWeekly = Math.max(10, ...cohort.weekly.map((w) => w.lessons))
  const seatsLeft = org.seatsTotal - org.seatsUsed

  return (
    <div className="p-3 sm:p-5 max-w-3xl mx-auto pb-10">
      {/* header */}
      <div className="bg-ink text-white rounded-3xl p-5 mb-4 relative overflow-hidden">
        <div className="absolute -right-6 -top-6 text-[120px] opacity-10 select-none" aria-hidden>
          ⛪
        </div>
        <div className="flex items-start gap-3">
          <span className="w-11 h-11 shrink-0 rounded-2xl bg-white/10 grid place-items-center">
            <Church className="w-6 h-6 text-duo-gold" />
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-black leading-tight">{org.name}</h1>
            <p className="text-xs font-bold text-white/70 mt-0.5">
              {org.city} · {org.tierLabel} · since {started}
            </p>
          </div>
          <span className="text-[10px] font-black text-teal-100 bg-teal-900/80 rounded-full px-2 py-0.5 shrink-0">
            PILOT PROGRAM
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2 mt-4">
          <div className="rounded-2xl bg-white/10 p-2.5 text-center">
            <p className="text-xl font-black leading-none tabular-nums">{org.seatsUsed}</p>
            <p className="text-[10px] font-black uppercase text-white/60 mt-1">of {org.seatsTotal} seats</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-2.5 text-center">
            <p className="text-xl font-black leading-none tabular-nums">${org.priceMonthly}</p>
            <p className="text-[10px] font-black uppercase text-white/60 mt-1">per month</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-2.5 text-center">
            <p className="text-xl font-black leading-none tabular-nums">{cohort.activeThisWeek}</p>
            <p className="text-[10px] font-black uppercase text-white/60 mt-1">active this wk</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-2.5 text-center">
            <p className="text-xl font-black leading-none tabular-nums">{cohort.coveragePct}%</p>
            <p className="text-[10px] font-black uppercase text-white/60 mt-1">Bible read</p>
          </div>
        </div>

        <p className="text-[11px] font-bold text-white/70 mt-3">
          {org.contactName} · renews {renewal} · {org.focusCourse}
        </p>
      </div>

      {/* verse coverage — the congregation's Bible reading */}
      <div className="bg-white rounded-3xl border-2 border-paper-border shadow-[0_5px_0_#e8e0c8] p-5 mb-4">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-black flex items-center gap-2">
            <BookOpenCheck className="w-5 h-5 text-duo-purple" /> Verse coverage
          </h2>
          <span className="text-xs font-black text-muted-foreground tabular-nums">
            {cohort.chaptersRead.toLocaleString()} / {cohort.totalChapters.toLocaleString()} chapters
          </span>
        </div>
        <div className="h-4 rounded-full bg-[#eee6cd] overflow-hidden mt-2">
          <motion.div
            className="h-full rounded-full bg-duo-purple"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, cohort.coveragePct)}%` }}
            transition={{ type: "spring", stiffness: 60, damping: 16 }}
          />
        </div>
        <p className="text-xs font-bold text-muted-foreground mt-2">
          The congregation has read {cohort.chaptersRead.toLocaleString()} of the Bible&apos;s {cohort.totalChapters.toLocaleString()} chapters —
          {cohort.coveragePerMember} per member on average. Your seat counts live, every refresh.
        </p>
      </div>

      {/* 8-week cohort trend */}
      <div className="bg-white rounded-3xl border-2 border-paper-border shadow-[0_5px_0_#e8e0c8] p-5 mb-4">
        <h2 className="font-black mb-1 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-duo-green" /> Cohort lessons · last 8 weeks
        </h2>
        <p className="text-xs font-bold text-muted-foreground mb-3">Lessons completed per week (all seats, including yours).</p>
        <div className="flex items-end justify-between gap-2 h-32">
          {cohort.weekly.map((w, i) => {
            const pct = Math.max(4, Math.round((w.lessons / maxWeekly) * 100))
            return (
              <div key={w.label + i} className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
                <motion.div
                  className="w-full rounded-t-lg bg-duo-green"
                  initial={{ height: 0 }}
                  animate={{ height: `${pct}%` }}
                  transition={{ delay: 0.08 + i * 0.05, type: "spring", stiffness: 120, damping: 16 }}
                  title={`${w.lessons} lessons · ${w.chapters} chapters · ${w.xp.toLocaleString()} XP`}
                />
                <span className="text-[10px] font-black text-muted-foreground truncate w-full text-center">{w.label}</span>
              </div>
            )
          })}
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="rounded-2xl bg-secondary p-2.5 text-center">
            <p className="font-black text-lg leading-none tabular-nums">{cohort.lessonsTotal.toLocaleString()}</p>
            <p className="text-[10px] font-black uppercase text-muted-foreground mt-1">lessons total</p>
          </div>
          <div className="rounded-2xl bg-secondary p-2.5 text-center">
            <p className="font-black text-lg leading-none tabular-nums">{cohort.lessonsAvg}</p>
            <p className="text-[10px] font-black uppercase text-muted-foreground mt-1">avg per member</p>
          </div>
          <div className="rounded-2xl bg-secondary p-2.5 text-center">
            <p className="font-black text-lg leading-none tabular-nums">{cohort.weekly[cohort.weekly.length - 1]?.xp.toLocaleString() ?? 0}</p>
            <p className="text-[10px] font-black uppercase text-muted-foreground mt-1">XP this week</p>
          </div>
        </div>
      </div>

      {/* streaks + engagement */}
      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <div className="bg-white rounded-3xl border-2 border-paper-border shadow-[0_5px_0_#e8e0c8] p-5">
          <h2 className="font-black mb-3 flex items-center gap-2">
            <Flame className="w-5 h-5 text-duo-red" /> Streaks
          </h2>
          <div className="flex flex-col gap-2.5">
            {cohort.streakBands.map((b) => {
              const max = Math.max(1, ...cohort.streakBands.map((x) => x.count))
              return (
                <div key={b.label}>
                  <div className="flex justify-between text-xs font-black mb-1">
                    <span>{b.label}</span>
                    <span className="tabular-nums text-muted-foreground">{b.count}</span>
                  </div>
                  <div className="h-3 rounded-full bg-[#eee6cd] overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: b.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${(b.count / max) * 100}%` }}
                      transition={{ type: "spring", stiffness: 90, damping: 18 }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <div className="bg-white rounded-3xl border-2 border-paper-border shadow-[0_5px_0_#e8e0c8] p-5">
          <h2 className="font-black mb-3 flex items-center gap-2">
            <Zap className="w-5 h-5 text-duo-gold-dark" /> Engagement
          </h2>
          <div className="flex flex-wrap gap-2">
            {cohort.engagementBands.map((b) => (
              <span
                key={b.label}
                className="rounded-2xl px-3 py-2 font-black text-sm border-2"
                style={{ borderColor: b.color + "55", backgroundColor: b.color + "14", color: b.color }}
              >
                {b.count} · {b.label}
              </span>
            ))}
          </div>
          <p className="text-xs font-bold text-muted-foreground mt-3 leading-relaxed">
            Bands are computed from lessons done and days since last session — the same signals the
            intelligence engine uses, shown here without any scoring.
          </p>
        </div>
      </div>

      {/* shepherding list */}
      {cohort.atRisk.length > 0 && (
        <div className="bg-white rounded-3xl border-2 border-amber-300 shadow-[0_5px_0_#e8dcc8] p-5 mb-4">
          <h2 className="font-black mb-1 flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-amber-600" /> Worth a call this week
          </h2>
          <p className="text-xs font-bold text-muted-foreground mb-3">
            {cohort.atRisk.length} {cohort.atRisk.length === 1 ? "seat has" : "seats have"} gone quiet — a personal invite beats every notification we can send.
          </p>
          <div className="flex flex-wrap gap-2">
            {cohort.atRisk.slice(0, 8).map((m) => (
              <span key={m.name} className="rounded-2xl bg-amber-50 border-2 border-amber-200 px-3 py-2 text-sm font-black">
                {m.name}
                <span className="ml-2 text-xs font-bold text-muted-foreground">
                  {m.lastActiveLabel}
                  {m.streak > 0 ? ` · had a ${m.streak}-day streak` : ""}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* seat table */}
      <div className="bg-white rounded-3xl border-2 border-paper-border shadow-[0_5px_0_#e8e0c8] p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-black flex items-center gap-2">
            <Users className="w-5 h-5 text-duo-purple" /> The cohort
          </h2>
          <span className="text-xs font-black text-muted-foreground">
            {org.seatsUsed} seats · {seatsLeft} open
          </span>
        </div>

        {/* sort chips */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {SORTS.map((s) => (
            <button
              key={s.key}
              onClick={() => {
                sfx.tap()
                setSort(s.key)
              }}
              className={`rounded-full px-3 py-1.5 text-xs font-black border-2 transition-colors ${
                sort === s.key ? "bg-duo-green/10 border-duo-green/50 text-duo-green-dark" : "bg-white border-paper-border text-muted-foreground"
              }`}
              aria-pressed={sort === s.key}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-1.5">
          {members.map((m) => {
            const st = STATUS_STYLE[m.status]
            return (
              <div
                key={m.id}
                className={`flex items-center gap-2.5 rounded-2xl border-2 px-3 py-2.5 ${
                  m.isYou ? "border-duo-green/50 bg-duo-green/5" : "border-paper-border bg-secondary/60"
                }`}
              >
                <span className="w-9 h-9 rounded-xl bg-white border-2 border-paper-border grid place-items-center text-lg shrink-0">
                  {m.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-black text-sm leading-tight truncate">
                    {m.name}
                    {m.isYou && <span className="ml-1.5 text-[10px] font-black uppercase text-duo-green-dark">(you · admin)</span>}
                    {m.role === "admin" && !m.isYou && <span className="ml-1.5 text-[10px] font-black uppercase text-muted-foreground">(admin)</span>}
                  </p>
                  <p className="text-[11px] font-bold text-muted-foreground truncate">
                    joined {new Date(m.joinedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })} · {m.lastActiveLabel}
                  </p>
                </div>
                <span className="flex items-center gap-1 text-sm font-black tabular-nums shrink-0" title="current streak">
                  <Flame className="w-3.5 h-3.5 text-duo-red" /> {m.streak}
                </span>
                <span className="text-sm font-black tabular-nums text-muted-foreground shrink-0 w-10 text-right" title="lessons done">
                  {m.lessons}
                </span>
                <span className="text-sm font-black tabular-nums text-muted-foreground shrink-0 w-10 text-right" title="chapters read">
                  {m.chaptersRead}
                </span>
                <span className="text-sm font-black tabular-nums text-duo-gold-dark shrink-0 w-14 text-right" title="XP this week">
                  {m.weeklyXp.toLocaleString()}
                </span>
                <span className={`text-[10px] font-black rounded-full px-2 py-0.5 shrink-0 ${st.cls}`}>{st.label}</span>
                {!m.isYou && (
                  <button
                    onClick={() => {
                      haptics.tap()
                      remove.mutate(m.id)
                    }}
                    className="p-1.5 rounded-xl text-muted-foreground/60 hover:text-red-600 hover:bg-red-50 shrink-0"
                    aria-label={`Remove ${m.name} from the plan`}
                    title="Free this seat"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {/* invite */}
        <div className="mt-4 pt-4 border-t-2 border-paper-border">
          <p className="text-xs font-black uppercase tracking-wide text-muted-foreground mb-2">
            Add a seat {seatsLeft > 0 ? `· ${seatsLeft} open` : "· plan is full"}
          </p>
          <div className="flex gap-2">
            <input
              value={inviteName}
              onChange={(e) => {
                setInviteName(e.target.value)
                setInviteErr(null)
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && inviteName.trim().length >= 2 && !invite.isPending) invite.mutate()
              }}
              maxLength={24}
              placeholder="Their name"
              className="flex-1 min-w-0 bg-secondary border-2 border-paper-border rounded-xl px-3 py-2.5 font-bold text-sm focus:outline-none focus:border-duo-green"
              aria-label="New seat name"
            />
            <button
              onClick={() => invite.mutate()}
              disabled={invite.isPending || inviteName.trim().length < 2 || seatsLeft <= 0}
              className="btn3d bg-duo-purple text-white shadow-[0_4px_0_#7c3aed] px-4 py-2.5 font-black text-sm flex items-center gap-1.5 disabled:opacity-50 shrink-0"
            >
              <UserPlus className="w-4 h-4" /> Add seat
            </button>
          </div>
          {inviteErr && <p className="text-xs font-bold text-red-600 mt-1.5">{inviteErr}</p>}
          <p className="text-[11px] font-bold text-muted-foreground mt-2 leading-relaxed">
            Seats start fresh (0 lessons). Removing a seat frees it for someone else — the plan price never changes.
          </p>
        </div>
      </div>

      <p className="text-xs font-bold text-muted-foreground text-center leading-relaxed px-4">
        The admin dashboard is read-only for members — only the plan admin (your seat) can add or free seats.
        Billing is flat-rate for the whole org: unlimited hearts and every course for every seat, no per-seat upsells.
      </p>
    </div>
  )
}
