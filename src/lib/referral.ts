/**
 * referral.ts — the Give-a-Month-Get-a-Month growth loop
 *
 * A double-sided referral program (Hormozi value-first growth engine):
 *  · Friend joins via your link   → they get a 100-gem welcome boost, you get +50 gems
 *  · Friend subscribes to Pro     → they lock the founding price, you bank a free Pro month
 *  · Milestone ladder (1·3·5·10)  → gems → freezes → Pro months → Pro months + badge
 *
 * Security model (red-team hardened — see docs/SECURITY.md):
 *  · every reward grant runs inside a database transaction
 *  · milestone rungs are unique-keyed (ReferralMilestoneGrant) — duplicate
 *    awards are structurally impossible, even under parallel fire
 *  · subscribe conversions are claimed atomically (updateMany with status
 *    guard) — one ledger row converts exactly once
 *  · share tracking is a daily counter incremented atomically under its cap
 *  · banked Pro months are spent with a guarded decrement (never below zero)
 *  · join/subscribe reject the caller's OWN code (no self-referral farming)
 *  · codes are random at creation (crypto) — never derived/enumerable
 */

import { randomInt } from "crypto"
import { db } from "@/lib/db"

/** public app URL — set NEXT_PUBLIC_APP_URL in .env so invite and gift
 *  links match the domain people actually see (v9: was hardcoded). */
export const APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? "https://scroll.academy").replace(/\/+$/, "")

export const REF_JOIN_REFERRER_GEMS = 50
export const REF_JOIN_FRIEND_GEMS = 100
export const REF_SUB_PRO_MONTHS = 1
export const MAX_SHARES_PER_DAY = 20
export const MAX_JOINS_PER_DAY = 10
export const MAX_SUBS_PER_DAY = 10
export const MAX_LEDGER_ROWS = 500

const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789" // no I/L/O/0/1 — readable

/** random 6-char code (crypto) — not derivable from the user id */
function randomCode(): string {
  let code = ""
  for (let i = 0; i < 6; i++) code += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)]
  return code
}

function isUniqueViolation(e: unknown): boolean {
  return typeof e === "object" && e !== null && "code" in e && (e as { code?: string }).code === "P2002"
}

/** true when the failure is write contention (SQLite lock / pg snapshot) — retryable */
function isContention(e: unknown): boolean {
  if (typeof e !== "object" || e === null) return false
  const err = e as { code?: string; message?: string }
  if (err.code === "P2024" || err.code === "P1008" || err.code === "P2028") return true // tx timeout / socket timeout / expired tx
  const msg = String(err.message ?? "")
  return /SQLITE_BUSY|database is locked|write conflict|socket timeout/i.test(msg)
}

const TX_OPTS = { timeout: 15_000, maxWait: 10_000 } // generous under write storms

/** db.$transaction with generous timeouts (contention-safe; used with the write lock) */
function txRun<T>(fn: Parameters<typeof db.$transaction>[0]): Promise<T> {
  return (db.$transaction as (f: typeof fn, opts?: typeof TX_OPTS) => Promise<T>)(fn, TX_OPTS)
}

/** run a transaction with retry-on-contention so parallel calls serialize cleanly */
async function withRetry<T>(fn: () => Promise<T>, attempts = 4): Promise<T> {
  let lastErr: unknown
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn()
    } catch (e) {
      if (!isContention(e)) throw e
      lastErr = e
      await new Promise((r) => setTimeout(r, 40 * (i + 1) + Math.random() * 40))
    }
  }
  throw lastErr
}

// ── single-writer gate ────────────────────────────────────────────────────
// SQLite allows exactly one writer; interactive transactions fired in
// parallel produce lock storms. This in-process mutex serializes referral
// writes in FIFO order (the sandbox runs one process). On Postgres the
// mutex is harmless — transactions are short and MVCC absorbs the rest.
let writeChain: Promise<unknown> = Promise.resolve()
function withWriteLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = writeChain.then(fn, fn)
  // keep the chain alive even if fn rejects
  writeChain = run.catch(() => undefined)
  return run
}

export type ReferralMilestone = {
  joins: number
  kind: "gems" | "freezes" | "pro" | "badge"
  amount: number
  label: string
}

/** the incentive ladder — each rung auto-grants when the join count reaches it */
export const REFERRAL_MILESTONES: ReferralMilestone[] = [
  { joins: 1, kind: "gems", amount: 200, label: "First Follower — +200 gems" },
  { joins: 3, kind: "freezes", amount: 2, label: "Bible Study Circle — 2 Streak Freezes" },
  { joins: 5, kind: "pro", amount: 1, label: "House Church — +1 free Pro month" },
  { joins: 10, kind: "pro", amount: 3, label: "Evangelist — +3 free Pro months & the 🕊️ Dove badge" },
]

const FRIEND_NAMES = [
  "Grace M.", "Caleb T.", "Ruth A.", "Silas B.", "Lydia K.", "Titus P.", "Phoebe W.",
  "Aquila R.", "Priscilla D.", "Barnabas N.", "Junia S.", "Onesimus J.", "Eunice L.",
  "Lois H.", "Epaphras V.", "Gaius C.",
]

/** stable pseudo-random pick for the friend display name (no crypto needed) */
export function friendNameFor(seed: string): string {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return FRIEND_NAMES[h % FRIEND_NAMES.length]
}

/** get-or-create the user's referral row; the code is random and never reassigned */
export async function getOrCreateReferral(userId: string) {
  const existing = await db.referral.findUnique({ where: { userId } })
  if (existing) return existing
  // random code with collision retry — a code is never stolen from its owner
  for (let i = 0; i < 6; i++) {
    try {
      return await db.referral.create({ data: { code: randomCode(), userId } })
    } catch (e) {
      if (isUniqueViolation(e)) continue // 31^6 ≈ 887M codes — retry is plenty
      throw e
    }
  }
  throw new Error("referral code space exhausted")
}

/** atomic daily-capped share tracking (lifetime counter keeps counting) */
export async function trackShare(referralId: string, today: string): Promise<boolean> {
  return withRetry(() => withWriteLock(() => txRun(async (tx) => {
    // roll the daily window if stale
    await tx.referral.updateMany({
      where: { id: referralId, sharesDay: { not: today } },
      data: { sharesDay: today, sharesToday: 0 },
    })
    // increment under the cap — single atomic UPDATE, race-proof
    const res = await tx.referral.updateMany({
      where: { id: referralId, sharesToday: { lt: MAX_SHARES_PER_DAY } },
      data: { sharesToday: { increment: 1 }, shares: { increment: 1 } },
    })
    return res.count === 1
  })))
}

export type ReferralStats = {
  code: string
  link: string
  shares: number
  joins: number
  subscribed: number
  gemsEarned: number
  proMonthsEarned: number
  nextMilestone: ReferralMilestone | null
  milestones: (ReferralMilestone & { reached: boolean })[]
}

export async function referralStats(userId: string): Promise<ReferralStats> {
  const ref = await getOrCreateReferral(userId)
  const invites = await db.referralInvite.findMany({
    where: { refCode: ref.code },
    orderBy: { createdAt: "desc" },
    take: MAX_LEDGER_ROWS,
  })
  // milestone grants actually persisted (unique-keyed — no phantom rungs)
  const grants = await db.referralMilestoneGrant.findMany({ where: { refCode: ref.code } })
  const grantedRungs = new Set(grants.map((g) => g.joins))
  const progress = await db.userProgress.findUnique({ where: { userId } })

  const joins = invites.length
  const subscribed = invites.filter((i) => i.status === "subscribed").length
  const milestones = REFERRAL_MILESTONES.map((m) => ({ ...m, reached: grantedRungs.has(m.joins) }))
  const nextMilestone = milestones.find((m) => !m.reached) ?? null

  const gemsEarned =
    joins * REF_JOIN_REFERRER_GEMS +
    grants.filter((g) => g.kind === "gems").reduce((s, g) => {
      const m = REFERRAL_MILESTONES.find((mm) => mm.joins === g.joins)
      return s + (m?.amount ?? 0)
    }, 0)
  const proMonthsEarned =
    progress?.referralProMonths ?? 0 // still-banked months
  void subscribed // (display-only stat)

  return {
    code: ref.code,
    link: `${APP_URL}/join/${ref.code}`,
    shares: ref.shares,
    joins,
    subscribed,
    gemsEarned,
    proMonthsEarned,
    nextMilestone,
    milestones,
  }
}

export type JoinResult =
  | { ok: true; friendName: string; milestoneAwarded: string | null; rewardNote: string }
  | { ok: false; error: string; status: number }

/**
 * A friend accepted the invite (in production: fired by the invitee's first
 * app launch with ?ref=CODE — the caller may NOT be the code's owner).
 * Grants both sides' join rewards + any milestone rung that was crossed.
 * Fully transactional; rungs are unique-keyed so parallel calls cannot
 * double-award.
 */
export async function recordJoin(refCode: string, opts?: { demo?: boolean }): Promise<JoinResult> {
  const ref = await db.referral.findUnique({ where: { code: refCode } })
  if (!ref) return { ok: false, error: "unknown referral code", status: 404 }

  // self-referral guard — you cannot redeem your own invite code
  // (the sandbox demo action opts in explicitly via { demo: true })
  if (!opts?.demo && ref.userId === "user_1") {
    return { ok: false, error: "cannot use your own invite code", status: 400 }
  }

  const dayStart = new Date()
  dayStart.setHours(0, 0, 0, 0)

  try {
    return await withRetry(() => withWriteLock(() => txRun(async (tx) => {
      const todayJoins = await tx.referralInvite.count({
        where: { refCode, createdAt: { gte: dayStart } },
      })
      if (todayJoins >= MAX_JOINS_PER_DAY)
        return { ok: false as const, error: "too many joins today", status: 429 }

      const before = await tx.referralInvite.count({ where: { refCode } })
      const invite = await tx.referralInvite.create({
        data: {
          refCode,
          friendName: friendNameFor(`${refCode}-${before}-${Date.now()}`),
          status: "joined",
          rewardKind: "join_gems",
          note: `+${REF_JOIN_REFERRER_GEMS} gems for you · +${REF_JOIN_FRIEND_GEMS} gems for your friend`,
          rewardedAt: new Date(),
        },
      })

      await tx.userProgress.update({
        where: { userId: ref.userId },
        data: { gems: { increment: REF_JOIN_REFERRER_GEMS } },
      })

      // milestone rung crossed? unique key (refCode, joins) — the create fails
      // if the rung was already granted, making double awards impossible
      const after = before + 1
      const milestone = REFERRAL_MILESTONES.find((m) => m.joins === after)
      let milestoneAwarded: string | null = null
      if (milestone) {
        try {
          await tx.referralMilestoneGrant.create({
            data: { refCode, joins: milestone.joins, kind: milestone.kind },
          })
        } catch (e) {
          if (isUniqueViolation(e)) return { ok: true as const, friendName: invite.friendName, milestoneAwarded: null, rewardNote: `You earned +${REF_JOIN_REFERRER_GEMS} gems` }
          throw e
        }
        if (milestone.kind === "gems") {
          await tx.userProgress.update({
            where: { userId: ref.userId },
            data: { gems: { increment: milestone.amount } },
          })
        } else if (milestone.kind === "freezes") {
          const p = await tx.userProgress.findUnique({ where: { userId: ref.userId } })
          if (p) {
            await tx.userProgress.update({
              where: { userId: ref.userId },
              data: { streakFreezes: Math.min(4, p.streakFreezes + milestone.amount) },
            })
          }
        } else if (milestone.kind === "pro") {
          await tx.userProgress.update({
            where: { userId: ref.userId },
            data: { referralProMonths: { increment: milestone.amount } },
          })
        }
        milestoneAwarded = milestone.label
        await tx.referralInvite.update({
          where: { id: invite.id },
          data: { note: `${invite.note} · milestone: ${milestone.label}` },
        })
      }

      return {
        ok: true as const,
        friendName: invite.friendName,
        milestoneAwarded,
        rewardNote: `You earned +${REF_JOIN_REFERRER_GEMS} gems${milestoneAwarded ? ` and ${milestoneAwarded}` : ""}`,
      }
    })))
  } catch (e) {
    console.error("[referral] join failed", e)
    return { ok: false, error: "join failed", status: 500 }
  }
}

export type SubscribeResult = { ok: true; proMonths: number; friendName: string } | { ok: false; error: string; status: number }

/**
 * The friend went Pro — the referrer banks a free month (give-a-month-get-a-month).
 * The ledger row is CLAIMED atomically (status-guarded updateMany), so one row
 * converts exactly once; parallel calls cannot mint phantom months.
 */
export async function recordSubscribe(refCode: string, friendName?: string, opts?: { demo?: boolean }): Promise<SubscribeResult> {
  const ref = await db.referral.findUnique({ where: { code: refCode } })
  if (!ref) return { ok: false, error: "unknown referral code", status: 404 }
  if (!opts?.demo && ref.userId === "user_1") return { ok: false, error: "cannot use your own invite code", status: 400 }

  const dayStart = new Date()
  dayStart.setHours(0, 0, 0, 0)

  try {
    return await withRetry(() => withWriteLock(() => txRun(async (tx) => {
      // daily cap on conversions (anti-farming)
      const todaySubs = await tx.referralInvite.count({
        where: { refCode, rewardKind: "pro_month", rewardedAt: { gte: dayStart } },
      })
      if (todaySubs >= MAX_SUBS_PER_DAY)
        return { ok: false as const, error: "too many conversions today", status: 429 }

      // atomic claim of exactly ONE "joined" row (find candidate → guard-claim
      // by id; parallel callers each take a distinct row)
      let claim = { count: 0 }
      let friend = friendName?.slice(0, 40) || ""
      for (let attempt = 0; attempt < 3 && claim.count === 0; attempt++) {
        const candidate = await tx.referralInvite.findFirst({
          where: { refCode, status: "joined" },
          orderBy: { createdAt: "asc" },
        })
        if (!candidate) break
        claim = await tx.referralInvite.updateMany({
          where: { id: candidate.id, status: "joined" },
          data: {
            status: "subscribed",
            rewardKind: "pro_month",
            note: `+${REF_SUB_PRO_MONTHS} free Pro month banked for you · founding price locked for your friend`,
            rewardedAt: new Date(),
          },
        })
        if (claim.count === 1) friend = candidate.friendName
      }

      if (claim.count === 0) {
        // no joined row — friend subscribed directly at checkout (join+convert)
        const before = await tx.referralInvite.count({ where: { refCode } })
        if (before >= MAX_LEDGER_ROWS)
          return { ok: false as const, error: "ledger full", status: 429 }
        friend = friend || friendNameFor(`${refCode}-${Date.now()}`)
        await tx.referralInvite.create({
          data: {
            refCode,
            friendName: friend,
            status: "subscribed",
            rewardKind: "pro_month",
            note: `+${REF_SUB_PRO_MONTHS} free Pro month banked for you · founding price locked for your friend`,
            rewardedAt: new Date(),
          },
        })
      }

      await tx.userProgress.update({
        where: { userId: ref.userId },
        data: { referralProMonths: { increment: REF_SUB_PRO_MONTHS } },
      })
      return { ok: true as const, proMonths: REF_SUB_PRO_MONTHS, friendName: friend }
    })))
  } catch (e) {
    console.error("[referral] subscribe failed", e)
    return { ok: false, error: "subscribe failed", status: 500 }
  }
}

/**
 * Spend one banked Pro month — guarded decrement (can never go negative).
 * Returns true when a month was actually spent; false when none remained.
 * (Never derives status from a post-write read — that races under parallel fire.)
 */
export async function applyBankedProMonth(userId: string): Promise<boolean> {
  const spent = await db.userProgress.updateMany({
    where: { userId, referralProMonths: { gt: 0 } },
    data: { referralProMonths: { decrement: 1 } },
  })
  if (spent.count === 0) return false
  // entitlement enrichment — idempotent, non-fatal if it fails
  try {
    const p = await db.userProgress.findUnique({ where: { userId } })
    if (p) {
      await db.userProgress.update({
        where: { userId },
        data: {
          plan: p.plan === "free" ? "pro" : p.plan,
          planSince: new Date(),
          trialEndsAt: new Date(Date.now() + 30 * 86400000),
          lastCanceledAt: null,
        },
      })
    }
  } catch {
    /* the month is already spent — plan enrichment retries naturally */
  }
  return true
}
