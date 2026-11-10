// ═══════════════════════════════════════════════════════════════
//  GIFT SUBSCRIPTIONS — the checkout order bump
//  (REVENUE.md §6 weeks 7–10: "Gift a year — $39.99" at checkout)
//
//  Security posture mirrors the referral program (SECURITY.md §7):
//  · codes are crypto-random at creation — never derived/enumerable
//  · redemption is a single guarded UPDATE … WHERE redeemedAt IS NULL,
//    so a code can never be claimed twice, even under parallel requests
//  · the client can never mint entitlements — Pro is applied server-side
// ═══════════════════════════════════════════════════════════════

import { randomInt } from "crypto"
import { db } from "@/lib/db"
import { USER_ID, getOrCreateUser, applyProEntitlements } from "@/lib/gamification"
import { sendJourneyEmail, proWelcomeSteps } from "@/lib/journeys"
import { APP_URL } from "@/lib/referral"
import type { GiftCodeDTO } from "@/lib/types"

export type { GiftCodeDTO } // single source of truth lives in types.ts

export const GIFT_MONTHS = 12 // a gifted year of Scroll Pro
export const GIFT_PRICE_CENTS = 2999 // $29.99 — the Advent-campaign / order-bump price (reg $39.99)

const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789" // no I/L/O/0/1 — readable
export const GIFT_CODE_RE = /^SCROLL-[A-Z2-9]{4}-[A-Z2-9]{4}$/

export type GiftPurchaseInput = {
  toName?: unknown
  message?: unknown
}

function randomChunk(len: number): string {
  let out = ""
  for (let i = 0; i < len; i++) out += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)]
  return out
}

function clean(s: unknown, max: number): string {
  if (typeof s !== "string") return ""
  // strip control chars & tags, collapse whitespace, hard length cap
  return s
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max)
}

function toDTO(g: {
  code: string
  months: number
  fromName: string
  message: string
  purchasedAt: Date
  redeemedAt: Date | null
  redeemedName: string | null
}): GiftCodeDTO {
  return {
    code: g.code,
    months: g.months,
    fromName: g.fromName,
    message: g.message,
    toLabel: g.fromName ? `To ${g.fromName}` : "A year of Scroll Pro",
    purchasedAt: g.purchasedAt.toISOString(),
    redeemedAt: g.redeemedAt ? g.redeemedAt.toISOString() : null,
    redeemedName: g.redeemedName || null,
    link: `${APP_URL}/redeem/${g.code}`,
  }
}

/**
 * Create a gift code at checkout (the order bump). Called from inside the
 * /api/pro subscribe transaction path — after Pro itself is granted, so a
 * failed gift write never blocks the membership.
 */
export async function createGift(input: GiftPurchaseInput): Promise<GiftCodeDTO> {
  const toName = clean(input.toName, 24)
  const message = clean(input.message, 140)
  // crypto-random code with collision retry (unique index backs the loop)
  for (let i = 0; i < 8; i++) {
    const code = `SCROLL-${randomChunk(4)}-${randomChunk(4)}`
    try {
      const row = await db.giftCode.create({
        data: {
          code,
          months: GIFT_MONTHS,
          fromName: toName,
          message,
          pricePaidCents: GIFT_PRICE_CENTS,
          purchasedBy: USER_ID,
        },
      })
      return toDTO(row)
    } catch (e) {
      const err = e as { code?: string }
      if (err.code !== "P2002") throw e // not a duplicate-code collision → real error
    }
  }
  throw new Error("gift code collision loop exhausted")
}

/** the Profile card payload: gifts I've sent + gifts I've redeemed */
export async function listGifts() {
  const [sent, mine] = await Promise.all([
    db.giftCode.findMany({
      where: { purchasedBy: USER_ID },
      orderBy: { purchasedAt: "desc" },
      take: 20,
    }),
    db.giftCode.findMany({
      where: { redeemedBy: USER_ID },
      orderBy: { redeemedAt: "desc" },
      take: 5,
    }),
  ])
  return {
    sent: sent.map(toDTO),
    redeemed: mine.map(toDTO),
  }
}

export type RedeemResult =
  | { ok: true; months: number; fromName: string; message: string; redeemedAt: string }
  | { ok: false; reason: "invalid" | "not_found" | "already_redeemed" }

/**
 * Redeem a gift code — one-time, race-proof.
 * The claim is a guarded UPDATE (WHERE redeemedAt IS NULL); only if it
 * reports exactly one row do we apply the Pro entitlements.
 */
export async function redeemGiftCode(rawCode: string): Promise<RedeemResult> {
  const code = typeof rawCode === "string" ? rawCode.trim().toUpperCase() : ""
  if (!GIFT_CODE_RE.test(code)) return { ok: false, reason: "invalid" }

  const user = await getOrCreateUser()
  const redeemerName = user.name || "Scribe"

  // guarded atomic claim — two parallel requests can never both win
  const claimed = await db.giftCode.updateMany({
    where: { code, redeemedAt: null },
    data: { redeemedBy: USER_ID, redeemedAt: new Date(), redeemedName: redeemerName },
  })
  if (claimed.count === 0) {
    // either it never existed, or someone got there first
    const existing = await db.giftCode.findUnique({ where: { code } })
    if (!existing) return { ok: false, reason: "not_found" }
    return { ok: false, reason: "already_redeemed" }
  }

  const gift = await db.giftCode.findUnique({ where: { code } })
  if (!gift) return { ok: false, reason: "not_found" } // unreachable, but stay honest

  // apply the gifted year of Pro (a real sub, just prepaid by a friend)
  let updated = await db.userProgress.update({
    where: { userId: USER_ID },
    data: { plan: "pro", planSince: new Date(), trialEndsAt: null, lastCanceledAt: null },
  })
  updated = await applyProEntitlements(updated)
  await sendJourneyEmail("pro_welcome", proWelcomeSteps())

  return {
    ok: true,
    months: gift.months,
    fromName: gift.fromName || "a friend",
    message: gift.message,
    redeemedAt: gift.redeemedAt!.toISOString(),
  }
}
