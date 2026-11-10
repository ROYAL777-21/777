// ═══════════════════════════════════════════════════════════════
//  THE ADVENT / CHRISTMAS GIFT CAMPAIGN
//  (REVENUE.md §6 weeks 7–10 — the seasonal half of gift subs)
//
//  One config drives everything: the in-app banner, the gift-only
//  checkout entry, the email sequence and the push copy. Dates are
//  honest (the real church calendar), pricing is the real order-bump
//  price ($29.99, anchored to the $39.99 annual), and every send is
//  idempotent — the daily trigger can run twice without double-sending.
//
//  Windows (2026–27 season):
//    Nov 23–28  PRE      — Black Friday week tease
//    Nov 29–Dec 24  ADVENT — the main campaign (First Sunday: Nov 29)
//    Dec 25–Jan 5  CHRISTMAS — the twelve days
//    Jan 6      ENDS     — Epiphany: price returns to $39.99
// ═══════════════════════════════════════════════════════════════

import type { EmailStep } from "@/lib/journeys"

export const CAMPAIGN_KEY = "advent_campaign"

export const CAMPAIGN = {
  season: "2026–27",
  preStart: "2026-11-23",
  adventStart: "2026-11-29", // First Sunday of Advent
  christmasStart: "2026-12-25",
  ends: "2027-01-06T23:59:59Z", // Epiphany
  giftPrice: "$29.99",
  giftRegPrice: "$39.99",
  goals: {
    giftCodes: 500, // @ $29.99 → ~$15.0k
    churchPilots: 10, // the hand-sell target runs in parallel
    newLearners: 1000, // gift redeemers + campaign landing arrivals
  },
} as const

export type CampaignPhase = "off" | "pre" | "advent" | "christmas" | "ended"

export function campaignPhase(now: Date = new Date()): CampaignPhase {
  const t = now.getTime()
  if (t >= Date.parse(CAMPAIGN.ends)) return "ended"
  if (t >= Date.parse(CAMPAIGN.christmasStart)) return "christmas"
  if (t >= Date.parse(CAMPAIGN.adventStart)) return "advent"
  if (t >= Date.parse(CAMPAIGN.preStart)) return "pre"
  return "off"
}

export function campaignActive(now: Date = new Date()): boolean {
  const p = campaignPhase(now)
  return p === "pre" || p === "advent" || p === "christmas"
}

function daysUntil(targetIso: string, now: Date): number {
  return Math.ceil((Date.parse(targetIso) - now.getTime()) / 86400000)
}

/** copy for the in-app banner, per phase */
export function bannerCopy(now: Date = new Date()) {
  const phase = campaignPhase(now)
  const toChristmas = daysUntil(CAMPAIGN.christmasStart, now)
  switch (phase) {
    case "pre":
      return {
        tag: "Advent is coming",
        title: "The gift that studies back",
        body: `A year of Scripture study under the tree — ${CAMPAIGN.giftPrice} (reg ${CAMPAIGN.giftRegPrice}) when the season opens Nov 29.`,
        cta: "See the gift",
      }
    case "advent":
      return {
        tag: `Advent · ${Math.max(0, toChristmas)} days to Christmas`,
        title: "Give a year of the Word",
        body: `One code, one tap to redeem — 12 months of every course. ${CAMPAIGN.giftPrice} through Jan 6 (reg ${CAMPAIGN.giftRegPrice}).`,
        cta: "Gift a year",
      }
    case "christmas":
      return {
        tag: "The twelve days",
        title: "Still Christmas — still giftable",
        body: `Late gifts count twice here: the code never expires and the year starts when they redeem. ${CAMPAIGN.giftPrice} through Jan 6.`,
        cta: "Gift a year",
      }
    default:
      return null
  }
}

// ── the email sequence (idempotent, date-gated) ────────────────
// POST /api/campaign { action: "sendEmails" } fires due steps once.

export const CAMPAIGN_EMAILS: (EmailStep & { sendAt: string })[] = [
  {
    step: "launch",
    sendAt: CAMPAIGN.adventStart,
    subject: "Advent begins Sunday — give the gift that studies back",
    preheader: "A year of Scroll Pro, $29.99 through Jan 6.",
    body: `Advent starts this Sunday — the season of waiting, and of small gifts that mean something.\n\nThis year, give a year of Scripture study: all 18 courses, unlimited hearts, the Greek and Hebrew readers — one code they redeem in a tap. $29.99 through January 6 (normally $39.99).\n\nWhy it works as a gift:\n· It asks 5 minutes a day, not a seminary\n· The streak system keeps them going after the tree comes down\n· The code never expires — they start when they're ready\n\nOne code, one tap, one year. The oldest story, in the newest packaging.`,
    ctaLabel: "Gift a year — $29.99",
    ctaView: "paywall",
    condition: "Nov 29 — First Sunday of Advent",
  },
  {
    step: "twelve",
    sendAt: "2026-12-12",
    subject: "13 days to Christmas: the gift that fits every stocking",
    preheader: "Instant delivery — even on December 24th.",
    body: `Two weeks out, the honest question: what do you give the person who has everything?\n\nNot another mug. A year of the whole-Bible curriculum — Greek, Hebrew, apologetics, 18 courses — for $29.99.\n\nThe practical part:\n· The code arrives instantly (yes, even on the 24th)\n· They redeem in one tap — Profile → Scroll Pro → Redeem a gift\n· Your note rides along with the code\n\n13 mornings from now, one of them can hold the whole year.`,
    ctaLabel: "Gift a year — $29.99",
    ctaView: "paywall",
    condition: "Dec 12 — two weeks before Christmas",
  },
  {
    step: "lastcall",
    sendAt: "2026-12-21",
    subject: "The $29.99 gift year — through Jan 6",
    preheader: "The code arrives in seconds. The year lasts 12 months.",
    body: `The short version: the campaign price ($29.99, normally $39.99) runs through January 6.\n\nThe gift is a code — SCROLL-XXXX-XXXX — that arrives in seconds and never expires. They redeem it whenever they're ready, and the year starts then.\n\nAfter Jan 6 the gift year returns to $39.99. Still worth it — but $10 less giftable.`,
    ctaLabel: "Gift a year — $29.99",
    ctaView: "paywall",
    condition: "Dec 21 — last full week",
  },
  {
    step: "boxing",
    sendAt: "2026-12-26",
    subject: "Got gift money? The twelve days are for spending it",
    preheader: "Still Christmas until Jan 6 — the campaign price too.",
    body: `Christmas is twelve days, not one — the church has said so for a long time, and the sale agrees.\n\nIf cash cards arrived instead of inspiration: a gift year of Scroll Pro is still $29.99 through Epiphany. Gift it forward, or use the code yourself — redemption is one tap.\n\nAfter Jan 6: $39.99. Until then, the calendar is on your side.`,
    ctaLabel: "Gift a year — $29.99",
    ctaView: "paywall",
    condition: "Dec 26 — the twelve days",
  },
]

/** which email steps are due right now (date-gate, not yet sent) */
export function dueEmailSteps(now: Date = new Date()): (EmailStep & { sendAt: string })[] {
  return CAMPAIGN_EMAILS.filter((s) => now.getTime() >= Date.parse(s.sendAt))
}

// ── push notification copy (the notification center + browser push) ──

export const CAMPAIGN_PUSH = [
  { at: "2026-11-29", icon: "🕯️", title: "Advent begins", body: "A gift year of Scroll Pro is $29.99 through Jan 6 — give the Word that keeps giving." },
  { at: "2026-12-12", icon: "🎄", title: "13 days to Christmas", body: "Instant delivery, one-tap redemption — gift a year of Scripture study for $29.99." },
  { at: "2026-12-21", icon: "🎁", title: "Gift-year price: $29.99", body: "The campaign price returns to $39.99 after Jan 6. Codes arrive in seconds and never expire." },
  { at: "2026-12-26", icon: "👑", title: "The twelve days", body: "Still Christmas — still $29.99. Redeem a gift code or gift one forward." },
] as const
