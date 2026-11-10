// ═══════════════════════════════════════════════════════════════
//  CHURCH PLANS — server aggregation for the admin dashboard
//  (REVENUE.md §6 weeks 3–6: the 10-church pilot)
//
//  Two data sources, merged into one cohort:
//  · pilot members — their stored weekly snapshot (seeded, inspectable)
//  · the admin seat (userId "user_1") — recomputed LIVE from real
//    lesson completions, Bible reads and progress, every request
// ═══════════════════════════════════════════════════════════════

import { db } from "@/lib/db"
import { USER_ID, dayKey, weekKey } from "@/lib/gamification"
import type { ChurchDashboardPayload, ChurchMemberDTO } from "@/lib/types"

const DAY = 86400000
export const TOTAL_BIBLE_CHAPTERS = 1189 // 66 books — the coverage denominator

const TIER_LABELS: Record<string, string> = {
  fifty: "≤50 seats",
  twohundred: "≤250 seats",
  network: "Diocesan / network",
}

type StoredWeek = { lessons: number; chapters: number; xp: number }

function parseWeeks(json: string): StoredWeek[] {
  try {
    const v = JSON.parse(json)
    if (!Array.isArray(v)) return []
    return v.slice(-8).map((w) => ({
      lessons: Math.max(0, Number(w?.lessons) || 0),
      chapters: Math.max(0, Number(w?.chapters) || 0),
      xp: Math.max(0, Number(w?.xp) || 0),
    }))
  } catch {
    return []
  }
}

function daysBetween(fromKey: string | null, to = new Date()): number {
  if (!fromKey) return 99
  const a = new Date(`${fromKey}T00:00:00Z`).getTime()
  const b = new Date(`${dayKey(to)}T00:00:00Z`).getTime()
  return Math.max(0, Math.round((b - a) / DAY))
}

/** short label for the last 8 week keys, oldest → newest */
function lastNWeekKeys(n: number): string[] {
  const now = Date.now()
  return Array.from({ length: n }, (_, i) => weekKey(new Date(now - (i + 1) * 7 * DAY))).reverse()
}

function weekLabel(key: string): string {
  // "2026-W45" → the Monday of that week, as "Nov 2"
  const year = Number(key.slice(0, 4))
  const week = Number(key.slice(6))
  const jan4 = new Date(Date.UTC(year, 0, 4))
  const jan4Day = jan4.getUTCDay() || 7
  const monday = new Date(jan4)
  monday.setUTCDate(jan4.getUTCDate() - jan4Day + 1 + (week - 1) * 7)
  return monday.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })
}

function statusFor(lastActiveDaysAgo: number): ChurchMemberDTO["status"] {
  if (lastActiveDaysAgo >= 7) return "lapsed"
  if (lastActiveDaysAgo >= 4) return "quiet"
  return "active"
}

function lastActiveLabel(d: number): string {
  if (d <= 0) return "today"
  if (d === 1) return "yesterday"
  if (d < 7) return `${d} days ago`
  if (d < 14) return `${d} days ago`
  return "2+ weeks ago"
}

/** the admin seat — LIVE stats computed from the real tables */
async function liveAdminStats(): Promise<{
  name: string
  lessons: number
  chaptersRead: number
  streak: number
  weeklyXp: number
  lastActiveDaysAgo: number
  weeks: StoredWeek[]
}> {
  const [user, progress, completions, reads] = await Promise.all([
    db.user.findUnique({ where: { id: USER_ID } }),
    db.userProgress.findUnique({ where: { userId: USER_ID } }),
    db.lessonCompletion.findMany({
      where: { userId: USER_ID },
      select: { xpEarned: true, completedAt: true },
    }),
    db.bibleRead.findMany({ where: { userId: USER_ID }, select: { readAt: true } }),
  ])

  // group real activity into the last 8 calendar weeks
  const keys = lastNWeekKeys(8)
  const byKey = new Map<string, StoredWeek>(keys.map((k) => [k, { lessons: 0, chapters: 0, xp: 0 }]))
  for (const c of completions) {
    const k = weekKey(c.completedAt)
    const bucket = byKey.get(k)
    if (bucket) {
      bucket.lessons += 1
      bucket.xp += c.xpEarned
    }
  }
  for (const r of reads) {
    const bucket = byKey.get(weekKey(r.readAt))
    if (bucket) bucket.chapters += 1
  }

  const weeks = keys.map((k) => byKey.get(k)!)

  // live weekly XP: this week's league entry (the same number Leagues shows)
  const myEntry = await db.leagueEntry.findFirst({
    where: { weekKey: weekKey(), isCurrentUser: true },
    select: { xp: true },
  })

  return {
    name: user?.name ?? "Scribe",
    lessons: completions.length,
    chaptersRead: reads.length,
    streak: progress?.streak ?? 0,
    weeklyXp: myEntry?.xp ?? weeks[weeks.length - 1]?.xp ?? 0,
    lastActiveDaysAgo: daysBetween(progress?.lastActiveDay ?? null),
    weeks,
  }
}

export async function getChurchOrg() {
  return db.churchOrg.findFirst({ orderBy: { startedAt: "asc" } })
}

export async function getChurchDashboard(): Promise<ChurchDashboardPayload | null> {
  const org = await getChurchOrg()
  if (!org) return null

  const stored = await db.churchMember.findMany({ where: { orgId: org.id }, orderBy: { joinedAt: "asc" } })
  const live = await liveAdminStats()

  const members: ChurchMemberDTO[] = []
  for (const m of stored) {
    if (m.userId === USER_ID) {
      // the admin seat — live numbers, never the stored snapshot
      members.push({
        id: m.id,
        name: live.name,
        emoji: "📜",
        role: "admin",
        isYou: true,
        joinedAt: m.joinedAt.toISOString(),
        lessons: live.lessons,
        chaptersRead: live.chaptersRead,
        streak: live.streak,
        weeklyXp: live.weeklyXp,
        lastActiveDaysAgo: live.lastActiveDaysAgo,
        lastActiveLabel: lastActiveLabel(live.lastActiveDaysAgo),
        status: statusFor(live.lastActiveDaysAgo),
        weeks: live.weeks,
      })
    } else {
      members.push({
        id: m.id,
        name: m.name,
        emoji: m.emoji,
        role: m.role === "admin" ? "admin" : "member",
        isYou: false,
        joinedAt: m.joinedAt.toISOString(),
        lessons: m.lessons,
        chaptersRead: m.chaptersRead,
        streak: m.streak,
        weeklyXp: m.weeklyXp,
        lastActiveDaysAgo: m.lastActiveDaysAgo,
        lastActiveLabel: lastActiveLabel(m.lastActiveDaysAgo),
        status: statusFor(m.lastActiveDaysAgo),
        weeks: parseWeeks(m.weeksJson),
      })
    }
  }

  // ── cohort aggregates ──
  const n = Math.max(1, members.length)
  const lessonsTotal = members.reduce((s, m) => s + m.lessons, 0)
  const chaptersRead = members.reduce((s, m) => s + m.chaptersRead, 0)
  const activeThisWeek = members.filter((m) => m.lastActiveDaysAgo <= 7).length

  const streakBands = [
    { label: "No streak yet", count: members.filter((m) => m.streak === 0).length, color: "#B8B2A5" },
    { label: "1–6 days", count: members.filter((m) => m.streak >= 1 && m.streak <= 6).length, color: "#E3B341" },
    { label: "7–29 days", count: members.filter((m) => m.streak >= 7 && m.streak <= 29).length, color: "#E4453D" },
    { label: "30+ days", count: members.filter((m) => m.streak >= 30).length, color: "#58CC02" },
  ]

  const engagementOf = (m: ChurchMemberDTO) => {
    if (m.status === "lapsed") return "Lapsed"
    if (m.lessons >= 60) return "Core"
    if (m.lessons >= 20) return "Steady"
    return "Ramping"
  }
  const engagementBands = [
    { label: "Core · 60+ lessons", count: members.filter((m) => engagementOf(m) === "Core").length, color: "#58CC02" },
    { label: "Steady · 20–59", count: members.filter((m) => engagementOf(m) === "Steady").length, color: "#0F8A80" },
    { label: "Ramping · <20", count: members.filter((m) => engagementOf(m) === "Ramping").length, color: "#9B5DE5" },
    { label: "Lapsed · 7+ days out", count: members.filter((m) => engagementOf(m) === "Lapsed").length, color: "#E4453D" },
  ]

  // 8-week cohort trend: sum everyone's aligned series (yours is real)
  const weekly = lastNWeekKeys(8).map((key, i) => {
    const row: StoredWeek = { lessons: 0, chapters: 0, xp: 0 }
    for (const m of members) {
      const w = m.weeks[Math.min(i, m.weeks.length - 1)] ?? { lessons: 0, chapters: 0, xp: 0 }
      row.lessons += w.lessons
      row.chapters += w.chapters
      row.xp += w.xp
    }
    return { label: weekLabel(key), ...row }
  })

  const atRisk = members
    .filter((m) => m.status !== "active")
    .sort((a, b) => b.lastActiveDaysAgo - a.lastActiveDaysAgo)
    .map((m) => ({ name: m.name, lastActiveLabel: m.lastActiveLabel, streak: m.streak }))

  return {
    org: {
      name: org.name,
      city: org.city,
      tier: org.tier,
      tierLabel: TIER_LABELS[org.tier] ?? org.tier,
      seatsTotal: org.seatsTotal,
      seatsUsed: members.length,
      priceMonthly: org.priceMonthly,
      renewalAt: org.renewalAt.toISOString(),
      startedAt: org.startedAt.toISOString(),
      contactName: org.contactName,
      contactEmail: org.contactEmail,
      focusCourse: org.focusCourse,
    },
    you: { name: live.name, role: "admin" },
    members,
    cohort: {
      activeThisWeek,
      lessonsTotal,
      lessonsAvg: Math.round((lessonsTotal / n) * 10) / 10,
      chaptersRead,
      totalChapters: TOTAL_BIBLE_CHAPTERS,
      coveragePct: Math.min(100, Math.round((chaptersRead / TOTAL_BIBLE_CHAPTERS) * 1000) / 10),
      coveragePerMember: Math.round((chaptersRead / n) * 10) / 10,
      streakBands,
      engagementBands,
      weekly,
      atRisk,
    },
  }
}
