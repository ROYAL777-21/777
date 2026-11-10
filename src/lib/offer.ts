// ═══════════════════════════════════════════════════════════════
//  THE OFFER — copy engine for Scroll Pro
//  Built on Alex Hormozi's frameworks (the $100M trilogy + the
//  money-model playbooks):
//  1. Grand Slam Offer: dream outcome + perceived likelihood,
//     divided by time delay + effort & sacrifice
//  2. Value stacking with explicit anchor prices
//  3. Risk reversal: guarantee stronger than "money back"
//  4. Urgency & scarcity: real (hokey) deadlines, cohort limits
//  5. Price anchoring: three tiers, decoy structure
//  6. Naming the offer: "The Scripture Mastery System"
//  7. Hooks & CTAs matched to the reader's current pain
//  8. One-call-to-action rule, fine print that builds trust
// ═══════════════════════════════════════════════════════════════

export const OFFER_NAME = "The Scripture Mastery System"

export interface StackItem {
  icon: string
  title: string
  detail: string
}

/** value stack — what Pro unlocks. v9 tone rule: the items speak
 *  for themselves; invented per-line dollar anchors and a made-up
 *  “total value” made us sound like mercenaries, so they are gone.
 *  (Hormozi value-stacking still lives where it belongs: the B2B
 *  church-pilot materials, not the member-facing paywall.) */
export const VALUE_STACK: StackItem[] = [
  {
    icon: "📚",
    title: "All 18 courses, forever",
    detail: "Greek & Hebrew, manuscripts, apologetics, the whole Bible — plus 8 denominations",
  },
  {
    icon: "❤️",
    title: "Unlimited hearts",
    detail: "Mistakes become tuition, not punishment — never stop mid-lesson",
  },
  {
    icon: "🎧",
    title: "Audio lessons & listening labs",
    detail: "Every story and listening exercise narrated aloud — study with your ears, not just your eyes",
  },
  {
    icon: "📊",
    title: "Advanced stats & mastery maps",
    detail: "See exactly which words, tenses and books are weak — and drill them",
  },
  {
    icon: "❄️",
    title: "Streak Repair ×2 every month",
    detail: "Life happens. Two freezes a month save the streak automatically",
  },
  {
    icon: "⚡",
    title: "2× XP weekends",
    detail: "Pro members double every point on weekends — climb leagues 2× faster",
  },
]

/** the bonuses — included with either plan, forever */
export const BONUS_STACK: StackItem[] = [
  {
    icon: "🅰️",
    title: "Bonus 1: Greek Alphabet Speed Drills",
    detail: "The 10-day sprint from 'α is a squiggle' to reading aloud",
  },
  {
    icon: "🙏",
    title: "Bonus 2: The Prayer Journal Prompts",
    detail: "52 verse-anchored prompts — one per week, keyed to your lessons",
  },
]

// v7.1 pricing — two plans, both auto-renewing, both cancellable anytime:
//   Annual  — starts with a 7-day free trial, then $39.99/year
//   Monthly — no trial; the first $5.99 is charged upon checkout
// v11.5 — ANNUAL LEADS (the default effect: the plan shown first becomes
// the normal choice — Built With Science saw 60% → 75–80% annual by moving
// monthly one tap away). Monthly stays, one tap away, never hidden.
export const PLANS = [
  {
    id: "annual" as const,
    name: "Annual",
    price: "$39.99",
    per: "/year",
    perDay: "$3.33 a month",
    badge: "Best value · save 44%",
    note: "7-day free trial, then $39.99/year",
    anchorNote: "$71.88/yr at the monthly rate",
    trial: true,
  },
  {
    id: "monthly" as const,
    name: "Monthly",
    price: "$5.99",
    per: "/month",
    perDay: "20¢ a day",
    badge: null as string | null,
    note: "No trial — first $5.99 charged at checkout",
    anchorNote: "$5.99/mo",
    trial: false,
  },
]

/** v11.5 — the trial timeline (structure before price).
 * Cal AI's highest-lifting paywall screens were the ones that EXPLAINED the
 * trial day by day; Blinkist's honest charge-date line lifted conversion 23%
 * and cut complaints 55%. Honesty is the conversion mechanism. */
export const TRIAL_TIMELINE = [
  {
    icon: "🎁",
    title: "Days 1–7 — everything, free",
    body: "All 18 courses, unlimited hearts, 2× XP weekends. $0.00 due today.",
  },
  {
    icon: "🔔",
    title: "We'll remind you before it ends",
    body: "A gentle nudge on day 5, before anything is ever charged. No surprises — that's a promise.",
  },
  {
    icon: "🕊️",
    title: "Day 8 — $39.99/year, only if you stayed",
    body: "Cancel anytime in two taps and keep the free academy forever. The bonuses stay yours either way.",
  },
]

/** the subscription terms, stated in plain language on every checkout */
export const SUBSCRIPTION_TERMS = {
  annual: "Starts with a 7-day free trial, then $39.99 per year.",
  monthly: "No trial — your first $5.99 is charged upon checkout.",
  shared:
    "Both plans renew automatically, and you can cancel anytime through the app or website. " +
    "For more details on managing your subscription, visit the Scroll the Bible Help Center.",
  helpCenter: {
    name: "Scroll the Bible Help Center",
    url: "https://help.scrollthebible.com",
  },
}

export const GUARANTEE = {
  name: "The Simple Promise",
  headline: "Grow in 30 days — or it's free. And the bonuses stay yours.",
  body: "Study with Scroll Pro for 30 days. If you can't read more Scripture than you can today — one email, every cent back, no questions, no forms. Keep the Alphabet Drills and Prayer Journal either way. The risk is ours, not yours.",
}

/** v9 — the mission-first answer to “why do you charge at all?”.
 *  Replaces the old countdown + cohort-scarcity block: generosity,
 *  not pressure, is the whole brand. */
export const MISSION = {
  badge: "Why we charge",
  body:
    "The academy — 5-minute lessons, the reader, streaks, leagues — is free, forever. " +
    "Scroll Pro exists so it can stay that way: it pays our teachers and servers, " +
    "and it funds the next courses. If you can support it, thank you. " +
    "If you can't, learn anyway — that's the whole point.",
}

export const FAQ = [
  {
    q: "Is the free version going away?",
    a: "No — never. The free academy stays free forever. Pro adds the whole course library, unlimited hearts and the tools that make the climb faster.",
  },
  {
    q: "How is this different from just… reading the Bible?",
    a: "Reading is essential — we built the Bible reader for it. Scroll Academy adds the layer reading can't give you: the original languages, the manuscript story, the ability to defend what you believe, and a system that keeps you showing up on the days you don't feel like it.",
  },
  {
    q: "What if I fall behind?",
    a: "Streak Repair (2×/month) absorbs missed days automatically, and lessons take 5 minutes. The system is designed for real life, not perfect life.",
  },
  {
    q: "Can I cancel?",
    a: "Anytime, in two taps on your profile. No emails to write, no guilt trips. And the 30-day Simple Promise still applies from day one.",
  },
  {
    q: "Where does my money actually go?",
    a: "Teachers, licensing, servers, and the next courses — that's the whole budget. The free academy stays free no matter what; Pro simply lets members carry it for everyone else.",
  },
]

/** context-specific hooks — matched to the moment, never to pressure.
 *  v9 tone pass: benefit-first, calm, zero fake urgency. */
export type PaywallContext = "onboarding" | "hearts" | "shop" | "profile" | "lessonEnd" | "gift" | "general"

export const HOOKS: Record<PaywallContext, { headline: string; sub: string }> = {
  onboarding: {
    headline: "Take the whole library for a week",
    sub: "Every course, free for 7 days. If it's not for you, cancel in two taps — no call, no guilt, and the free academy is still yours.",
  },
  hearts: {
    headline: "Hearts refill on their own — or never run out",
    sub: "They come back with time, and gems can refill them anytime. Pro simply removes the waiting: a mistake costs you five seconds, never fifty minutes.",
  },
  shop: {
    headline: "Or skip the small stuff entirely",
    sub: "Everything in the shop, every course, unlimited hearts — one quiet price instead of one gem purchase at a time.",
  },
  profile: {
    headline: "The whole library, one quiet price",
    sub: "18 courses, unlimited hearts, 2× XP weekends — with a 7-day free trial to see if it fits your rhythm.",
  },
  lessonEnd: {
    headline: "That feeling, every day",
    sub: "Unlimited hearts, every course, 2× XP weekends. Try a week free — cancel anytime in two taps.",
  },
  gift: {
    headline: "Give a year of Scripture study",
    sub: "One code under the tree — 12 months of every course, unlimited hearts and 2× XP weekends. $29.99 while the Advent season runs.",
  },
  general: {
    headline: "The whole academy. One price.",
    sub: "18 courses, unlimited hearts, audio lessons — under a 30-day promise. Cancel anytime; the free academy is always yours.",
  },
}

/** learner stories (pilot-build placeholders, replaced with real
 *  names + permission before launch). v9 tone rule: no invented
 *  aggregate ratings — two honest stories beat a fake 4.9★. */
export const SOCIAL_PROOF = {
  heading: "Why members stay",
  quote: {
    text: "I finished the Greek course in four months. I read John 1:1 aloud at my church's midweek group. My pastor thought I'd taken a seminary class.",
    author: "Marcus T.",
    detail: "Level 14 · 212-day streak",
  },
  quote2: {
    text: "The Streak Repair alone saved my 140-day streak twice. Unlimited hearts changed how I practice — I stopped playing safe.",
    author: "Grace O.",
    detail: "Level 9 · 180-day streak",
  },
}

// v9: URGENCY and DOWNSALE were retired and are now deleted outright.
// Fake countdowns, invented spot counts and exit-interrupt discounts
// made us sound like mercenaries — the opposite of the brand. The
// paywall renders MISSION instead. Real, honest deadlines (a genuine
// Advent end-date, a real price change) may return as schedule
// entries — never as manufactured pressure.

export const FINE_PRINT =
  "Annual starts with a 7-day free trial, then $39.99/year. Monthly has no trial — the first $5.99 is charged upon checkout. " +
  "Both plans renew automatically; cancel anytime in the app or on the website. " +
  `Details: ${SUBSCRIPTION_TERMS.helpCenter.name} (${SUBSCRIPTION_TERMS.helpCenter.url}). Prices in USD.`

// ═══════════════════════════════════════════════════════════════
//  THE ORDER BUMP — "Gift a year" at checkout
//  (REVENUE.md Money Models item 2 · 90-day plan weeks 7–10)
//  Opt-in only, never pre-checked — the no-dark-patterns rule applies
//  to order bumps exactly as it does to everything else.
// ═══════════════════════════════════════════════════════════════

export const GIFT_BUMP = {
  price: "$29.99",
  priceNum: 29.99,
  regPrice: "$39.99", // struck through — the annual price is the honest anchor
  months: 12,
  title: "Gift a year of Scroll Pro",
  detail: "One code, redeemed by anyone — 12 months of every course, unlimited hearts and 2× XP weekends.",
  howTo: "They redeem it in Profile → Scroll Pro → Redeem a gift. One tap, done.",
  finePrint:
    "Gift codes never expire. One redemption each — after that it's theirs for the year. The gift is a one-time purchase: it never auto-renews.",
}

/** honest seasonal framing — the church calendar drives gifting occasions */
export function giftSeason(now: Date = new Date()): { key: string; label: string; line: string } {
  const m = now.getMonth() + 1 // 1..12
  const d = now.getDate()
  if ((m === 11 && d >= 15) || (m === 12 && d <= 6)) {
    return {
      key: "advent",
      label: "Advent & Christmas",
      line: "The season's classic: a year of Scripture study under the tree — advent calendars run out; this one runs all year.",
    }
  }
  if (m === 12 && d > 6 && d <= 31) {
    return {
      key: "christmas-octave",
      label: "Christmas season",
      line: "Still Christmas for the church — a late gift that keeps giving every day of the new year.",
    }
  }
  if (m === 1) {
    return {
      key: "new-year",
      label: "New year",
      line: "The January 1st resolution, pre-paid: give the habit, not the guilt trip.",
    }
  }
  if ((m === 3 && d >= 15) || (m === 4 && d <= 20)) {
    return {
      key: "easter",
      label: "Easter season",
      line: "From the empty tomb to the empty notebook — an Easter gift that fills the second one.",
    }
  }
  if ((m === 5) || (m === 6 && d <= 15)) {
    return {
      key: "confirmation",
      label: "Confirmation & baptism season",
      line: "The classic confirmation gift: a Bible is given once — this teaches them to read it for a year.",
    }
  }
  if ((m === 6 && d > 15) || m === 7) {
    return {
      key: "graduation",
      label: "Graduation season",
      line: "Graduations ask for a life direction. A year of the whole-Bible curriculum is one.",
    }
  }
  return {
    key: "anytime",
    label: "Any day",
    line: "Someone you love is trying to read the Bible more this year. You can make it 12 months easier.",
  }
}
