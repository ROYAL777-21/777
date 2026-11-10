/**
 * decide.ts — THE DECISION LAYER
 *
 * Turns scores + config into a ranked set of next-best-actions (NBAs),
 * each with an expected-utility estimate, a transparency reason, copy
 * drawn ONLY from the vetted library, and guardrails:
 *   · daily and weekly caps per channel & kind
 *   · quiet hours (21:00–08:00 local) except streak-risk
 *   · cooldowns between repeats of a kind
 *   · paywall invites suppressed for Pro members and users who turned
 *     OFF personalized offers (trust toggle)
 *   · rest encouragement outranks extraction when burnout risk is high
 *
 * Every surfaced action becomes an EngineIntervention row — the
 * attribution ledger the self-improvement loop learns from.
 */

import { db } from "@/lib/db"
import { USER_ID, weekKey, weekElapsed, botDisplayXp, PROMOTION_SLOTS } from "@/lib/gamification"
import { TZ_OFFSET_MS, localHour } from "@/lib/time"
import type { FeatureResult } from "./features"
import type { EngineScores } from "./scores"
import type { GameConfig } from "./gameConfig"
import { nudgeCopy, safeTone, SESSION_END_HOOKS } from "./copy"
import { recordOutcome } from "./bandit"

export interface Nba {
  kind: string
  title: string
  body: string
  icon: string
  action?: string // view to navigate to ("learn" | "practice-hub" | …)
  priority: number // higher = more important
  reason: string // shown in the transparency panel
  channel: "in_app" | "notification" | "email"
  variant: string
}

const QUIET_START_MIN = 21 * 60
const QUIET_END_MIN = 8 * 60

function inQuietHours(): boolean {
  const now = new Date(Date.now() + TZ_OFFSET_MS)
  const m = now.getUTCHours() * 60 + now.getUTCMinutes()
  return m >= QUIET_START_MIN || m < QUIET_END_MIN
}

interface Caps {
  todayByKind: Set<string>
  weekPaywallInvites: number
  lastShownByKind: Map<string, number>
  isPro: boolean
  personalizedOffers: boolean
}

async function loadCaps(userId: string): Promise<Caps> {
  const dayStart = new Date()
  dayStart.setHours(0, 0, 0, 0)
  const weekAgo = new Date(Date.now() - 7 * 86400000)
  const [today, week, progress] = await Promise.all([
    db.engineIntervention.findMany({ where: { userId, createdAt: { gte: dayStart } }, select: { kind: true } }),
    db.engineIntervention.count({ where: { userId, kind: "paywall_invite", createdAt: { gte: weekAgo } } }),
    db.userProgress.findUnique({ where: { userId }, select: { plan: true, personalizedOffers: true } }),
  ])
  const lastShownByKind = new Map<string, number>()
  const recent = await db.engineIntervention.findMany({
    where: { userId, createdAt: { gte: new Date(Date.now() - 14 * 86400000) } },
    orderBy: { createdAt: "desc" },
    select: { kind: true, createdAt: true },
  })
  for (const r of recent) {
    if (!lastShownByKind.has(r.kind)) lastShownByKind.set(r.kind, r.createdAt.getTime())
  }
  return {
    todayByKind: new Set(today.map((t) => t.kind)),
    weekPaywallInvites: week,
    lastShownByKind,
    isPro: (progress?.plan ?? "free") !== "free",
    personalizedOffers: progress?.personalizedOffers ?? true,
  }
}

function cooldownOk(caps: Caps, kind: string, cooldownDays: number): boolean {
  const last = caps.lastShownByKind.get(kind)
  if (!last) return true
  return Date.now() - last >= cooldownDays * 86400000
}

export interface PlannedIntervention {
  kind: string
  variant: string
  channel: string
  utility: number
  reason: string
  expiresAt: Date
}

export async function decide(
  fr: FeatureResult,
  scores: EngineScores,
  cfg: GameConfig,
  userId: string = USER_ID,
): Promise<{ nba: Nba[]; planned: PlannedIntervention[]; sessionHook: { title: string; body: string } }> {
  const v = fr.values
  const get = (id: string, dflt = 0): number => {
    const x = v[id]
    return typeof x === "number" && Number.isFinite(x) ? x : dflt
  }
  const caps = await loadCaps(userId)
  const out: Nba[] = []
  const planned: PlannedIntervention[] = []
  const quiet = inQuietHours()
  const tone = safeTone(String(cfg["notif.tone_reengage"] ?? "growth"))

  const seenToday = (kind: string) => caps.todayByKind.has(kind)
  const emit = (n: Nba, cooldownDays = 1, cap = 1) => {
    if (seenToday(n.kind)) return
    if (!cooldownOk(caps, n.kind, cooldownDays)) return
    out.push(n)
    if (out.filter((x) => x.kind === n.kind).length <= cap) {
      planned.push({
        kind: n.kind,
        variant: n.variant,
        channel: n.channel,
        utility: n.priority,
        reason: n.reason,
        expiresAt: new Date(Date.now() + 2 * 86400000),
      })
    }
  }

  // ══ 1. study_nudge — the core retention move ══
  if (!get("recency.active_today") && scores.churnRisk > 0.35 && !quiet) {
    const vars = { xp: get("motiv.xp_velocity_7d", 0), goal: String(cfg["xp.daily_goal"] ?? 50), streak: get("streak.current") }
    const copy = nudgeCopy(scores.churnRisk > 0.6 ? "reengage" : "goal", tone, vars)
    emit(
      {
        kind: "study_nudge",
        ...copy,
        action: "learn",
        priority: 10 + scores.churnRisk * 20,
        reason: `Churn risk ${(scores.churnRisk * 100).toFixed(0)}% · not active today · tone "${tone}" chosen by experiment`,
        channel: "notification",
        variant: tone,
      },
      1,
      2,
    )
  }

  // ══ 2. review_quest — spaced repetition rescue ══
  const due = get("mastery.review_due", 0)
  if (due >= Number(cfg["quests.review_quest_threshold"] ?? 8)) {
    const copy = nudgeCopy("review", safeTone(String(cfg["notif.tone_goal"] ?? "growth")), { due })
    emit(
      {
        kind: "review_quest",
        ...copy,
        action: "practice-hub",
        priority: 8 + Math.min(10, due / 4),
        reason: `${due} challenges carry recorded mistakes — review converts them to mastery`,
        channel: "in_app",
        variant: "review",
      },
      2,
    )
  }

  // ══ 3. streak_protect — evening save ══
  if (get("streak.risk_tonight") === 1 && get("streak.current") >= 3) {
    const copy = nudgeCopy("streak_risk", safeTone(String(cfg["streak.evening_save_tone"] ?? "stewardship")), { streak: get("streak.current") })
    emit(
      {
        kind: "streak_protect",
        ...copy,
        action: "learn",
        priority: 14 + Math.min(12, get("streak.current") / 8),
        reason: `${get("streak.current")}-day streak unlit today and the evening is running out`,
        channel: "notification",
        variant: "streak_risk",
      },
      1,
    )
  }

  // ══ 4. celebrate — milestone planning ══
  const dist = get("streak.next_milestone_dist", 99)
  const nextMilestone = [3, 7, 14, 30, 60, 100, 365].find((m) => m > get("streak.current")) ?? 365
  if (dist >= 1 && dist <= 2 && get("streak.current") >= 2) {
    const copy = nudgeCopy("milestone_near", "growth", { days: dist, next: nextMilestone })
    emit(
      {
        kind: "celebrate",
        ...copy,
        action: "learn",
        priority: 7,
        reason: `${dist} day${dist === 1 ? "" : "s"} from the ${nextMilestone}-day milestone`,
        channel: "in_app",
        variant: "milestone",
      },
      2,
    )
  }

  // ══ 5. social_connect — relationship depth (the #1 retention multiplier) ══
  if (get("social.friends") < 3 && get("progress.lessons_total") >= 5 && !quiet) {
    const copy = nudgeCopy("social", "growth")
    emit(
      {
        kind: "social_connect",
        ...copy,
        action: "friends",
        priority: 6,
        reason: `Only ${get("social.friends")} friends connected — social ties measurably reduce churn`,
        channel: "in_app",
        variant: "social",
      },
      7,
    )
  }

  // ══ 6. goal_adjust — right-size the goal when it keeps missing ══
  if (get("motiv.goal_miss_streak", 0) >= 4 && get("motiv.goal_hits_30d", 0) < 8) {
    emit(
      {
        kind: "goal_adjust",
        title: "Right-size your daily goal",
        body: "Four misses in a row isn't a discipline problem — it's a goal-size problem. A 20-XP goal you hit beats a 50-XP goal you skip.",
        icon: "🎯",
        action: "profile",
        priority: 5.5,
        reason: "Repeated goal misses shrink self-efficacy; smaller wins rebuild the habit loop",
        channel: "in_app",
        variant: "goal_adjust",
      },
      14,
    )
  }

  // ══ 7. paywall_invite — the revenue moment, at peak value perception ══
  const lessonCount = get("progress.lessons_total", 0)
  const hook = String(cfg["paywall.hook_selected"] ?? "general")
  const triggerLessons = Number(cfg["paywall.trigger_lesson_end"] ?? 12)
  const paywallEligible =
    !caps.isPro &&
    caps.personalizedOffers &&
    caps.weekPaywallInvites < Number(cfg["paywall.weekly_cap"] ?? 2) &&
    !seenToday("paywall_invite") &&
    cooldownOk(caps, "paywall_invite", Number(cfg["paywall.cooldown_days"] ?? 5)) &&
    (lessonCount >= triggerLessons || scores.wtp > Number(cfg["paywall.wtp_threshold"] ?? 0.55)) &&
    scores.engagement > Number(cfg["paywall.min_engagement"] ?? 0.2)
  if (paywallEligible) {
    const util = scores.wtp * 30 + scores.engagement * 10 + Math.min(lessonCount / 10, 10)
    emit(
      {
        kind: "paywall_invite",
        title: "Unlock the whole Academy",
        body: `You've completed ${lessonCount} lessons — you've proven the method works. Scroll Pro unlocks every course, unlimited hearts and Streak Repair.`,
        icon: "👑",
        action: "paywall",
        priority: util,
        reason: `wtp ${(scores.wtp * 100).toFixed(0)}% · engagement ${(scores.engagement * 100).toFixed(0)}% · ${lessonCount} lessons · hook "${hook}" (experiment) · cooldown respected`,
        channel: "in_app",
        variant: hook,
      },
      5,
    )
  }

  // ══ 8. winback_offer — for lapsed users with prior intent ══
  if (!caps.isPro && get("monet.days_since_cancel", 999) <= 21 && get("monet.days_since_cancel", 999) >= 1 && caps.personalizedOffers) {
    const depth = String(cfg["paywall.winback_discount"] ?? "50")
    emit(
      {
        kind: "winback_offer",
        title: `Your ${depth}% win-back offer is ready`,
        body: "Everything you unlocked can come back — unlimited hearts, Streak Repair, 2× XP weekends — at the win-back rate.",
        icon: "💝",
        action: "paywall",
        priority: 12,
        reason: `Pro ended ${get("monet.days_since_cancel")} days ago · discount depth ${depth}% (experiment arm)`,
        channel: "email",
        variant: depth,
      },
      7,
    )
  }

  // ══ 9. rest_encourage — protect the human, protect the LTV ══
  if (scores.burnoutRisk > Number(cfg["wellbeing.burnout_threshold"] ?? 0.55)) {
    const copy = nudgeCopy("rest", "stewardship")
    emit(
      {
        kind: "rest_encourage",
        ...copy,
        action: "learn",
        priority: 4 + scores.burnoutRisk * 10, // outranks extraction at high risk
        reason: `Burnout risk ${(scores.burnoutRisk * 100).toFixed(0)}% — long-run retention beats short-run extraction`,
        channel: "in_app",
        variant: "rest",
      },
      3,
    )
  }

  // ══ 10. course_suggest — momentum after completion or plateau ══
  if (get("delta.progress_velocity", 0) < -0.3 && get("progress.lessons_total", 0) > 15) {
    emit(
      {
        kind: "course_suggest",
        title: "A fresh course re-lights the fire",
        body: "Your pace has slowed — that's the plateau every learner hits. A new course (maybe one you've been curious about) is the classic cure.",
        icon: "🧭",
        action: "courses",
        priority: 5,
        reason: "Negative progress velocity detected; novelty is the documented cure for plateaus",
        channel: "in_app",
        variant: "course_suggest",
      },
      10,
    )
  }

  // ══ 11. manna_reminder — the daily clock, gently (v11.5) ══
  // Only after the habit exists (mannaStreak ≥ 2) and only in the afternoon:
  // the portion expires at midnight, the nudge never shames — it points.
  try {
    const todayStr = new Date(Date.now() + TZ_OFFSET_MS).toISOString().slice(0, 10)
    const [mp] = await Promise.all([
      db.userProgress.findUnique({ where: { userId }, select: { lastMannaDay: true, mannaStreak: true } }),
    ])
    if (mp && mp.lastMannaDay !== todayStr && mp.mannaStreak >= 2 && localHour() >= 14 && !quiet) {
      const copy = nudgeCopy("manna", tone)
      emit(
        {
          kind: "manna_reminder",
          ...copy,
          action: "learn",
          priority: 6.5,
          reason: `Manna streak ${mp.mannaStreak} · today's portion uncollected · fresh portion expires at midnight`,
          channel: "in_app",
          variant: "manna",
        },
        1,
      )
    }
  } catch {
    // manna read failure — skip silently
  }

  // ══ 12. promotion_push — the winnable league, at the moment it matters (v11.5) ══
  // Small cohort is the design: with ≤2 days left in the week and a catchable
  // gap to the promotion zone, one lesson changes the week. Never for demotion
  // — fear is banned; this is only ever "you're close".
  try {
    const wk = weekKey()
    const elapsed = weekElapsed()
    const daysLeft = Math.ceil((1 - elapsed) * 7)
    if (daysLeft >= 1 && daysLeft <= 2) {
      const progressRow = await db.userProgress.findUnique({ where: { userId }, select: { leagueOrder: true } })
      const scoped = await db.leagueEntry.findMany({
        where: { leagueId: `league-${progressRow?.leagueOrder ?? 0}`, weekKey: wk },
      })
      const ranked = scoped
        .map((e) => ({
          name: e.displayName,
          isMe: e.isCurrentUser,
          xp: e.isCurrentUser ? e.xp : e.isBot ? botDisplayXp(e.targetXp ?? 0, e.displayName, elapsed) : e.xp,
        }))
        .sort((a, b) => b.xp - a.xp)
      const myIdx = ranked.findIndex((r) => r.isMe)
      if (myIdx > PROMOTION_SLOTS - 1 && myIdx <= PROMOTION_SLOTS + 2) {
        // sitting just OUTSIDE the zone — the gap to the last promoted spot
        const cutoff = ranked[PROMOTION_SLOTS - 1]
        const me = ranked[myIdx]
        const gap = Math.max(1, cutoff.xp - me.xp)
        if (gap <= 90) {
          const copy = nudgeCopy("promotion", safeTone(String(cfg["notif.tone_reengage"] ?? "growth")), {
            rank: myIdx + 1,
            gap,
          })
          emit(
            {
              kind: "promotion_push",
              ...copy,
              action: "leaderboard",
              priority: 9,
              reason: `Rank #${myIdx + 1} · ${gap} XP from the promotion zone · ${daysLeft} day${daysLeft === 1 ? "" : "s"} left in the week`,
              channel: "in_app",
              variant: "promotion",
            },
            1,
          )
        }
      }
    }
  } catch {
    // league read failure — skip silently
  }

  // ══ 13. recognition — the human callout on milestone days (v11.5) ══
  // Peloton's instructor-callout pattern, honest edition: on the exact day a
  // streak milestone lands, Papy says it out loud. Rare by construction.
  try {
    const streakNow = get("streak.current", 0)
    const milestone = [7, 14, 30, 60, 100, 365].includes(streakNow)
    if (milestone && get("recency.active_today") === 1 && streakNow >= 7) {
      const copy = nudgeCopy("recognition", safeTone(String(cfg["notif.tone_reengage"] ?? "growth")), { streak: streakNow })
      emit(
        {
          kind: "recognition",
          ...copy,
          action: "learn",
          priority: 7.5,
          reason: `${streakNow}-day milestone reached today — effort acknowledged in a human voice (recognition > badge)`,
          channel: "in_app",
          variant: "recognition",
        },
        30, // milestone days are ≥7 days apart; cooldown can't skip one
      )
    }
  } catch {
    // recognition failure — skip silently
  }

  // session-end hook copy selection (attached to lesson completion screens)
  const sessionHook = SESSION_END_HOOKS[String(cfg["session.end_hook_variant"] ?? "A")] ?? SESSION_END_HOOKS.A

  // record bandit exposures for the paywall invite (the main revenue experiment)
  for (const p of planned) {
    if (p.kind === "paywall_invite") {
      await recordOutcome("paywall_hook", p.variant, false).catch(() => {})
    }
  }

  // rest outranks everything at very high burnout risk — reorder
  out.sort((a, b) => b.priority - a.priority)
  return { nba: out.slice(0, 6), planned, sessionHook }
}

export type DecideResult = Awaited<ReturnType<typeof decide>>
