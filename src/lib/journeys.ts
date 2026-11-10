import { db } from "@/lib/db"
import { USER_ID, dayKey, weekKey, daysBetween, levelInfo, MAX_HEARTS } from "@/lib/gamification"
import {
  NOTIF_CATEGORIES,
  DEFAULT_NOTIF_PREFS,
  EMAIL_JOURNEY_KEYS,
  DEFAULT_EMAIL_PREFS,
  type NotifCategoryKey,
  type EmailJourneyKey,
} from "@/lib/journeyMeta"
import type { UserProgress } from "@prisma/client"

// re-exported for API routes that serve the metadata
export { NOTIF_CATEGORIES, EMAIL_JOURNEY_KEYS, DEFAULT_NOTIF_PREFS, DEFAULT_EMAIL_PREFS }
export type { NotifCategoryKey, EmailJourneyKey }

// ═══════════════════════════════════════════════════════════════
//  NOTIFICATION & EMAIL JOURNEY ENGINE
//  ─ personal  → triggered by THIS user's own activity/state
//  ─ specific  → about a concrete thing (quest X, achievement Y,
//                unit Z, friend request, league rank)
//  ─ timed     → scheduled: daily verse, study reminder at the
//                user's chosen hour, streak-risk window, weekly
//                recap Monday morning, quiz nudge, heart refill
// ═══════════════════════════════════════════════════════════════

const TZ_OFFSET_MS = -new Date().getTimezoneOffset() * 60000 // server-local — matches @/lib/time

/** local wall-clock hour and minute-of-day, e.g. 19:30 → { hour: 19, minute: 1150 } */
export function localTime(d: Date = new Date()): { hour: number; minuteOfDay: number; dow: number } {
  const local = new Date(d.getTime() + TZ_OFFSET_MS)
  return {
    hour: local.getUTCHours(),
    minuteOfDay: local.getUTCHours() * 60 + local.getUTCMinutes(),
    dow: local.getUTCDay(), // 0 = Sunday
  }
}

function parseHM(hm: string): number {
  const [h, m] = hm.split(":").map((x) => parseInt(x, 10))
  return (isNaN(h) ? 19 : h) * 60 + (isNaN(m) ? 0 : m)
}

// ── notification preference model (metadata lives in journeyMeta.ts) ──

export function readNotifPrefs(progress: UserProgress): Record<string, boolean> {
  try {
    const stored = JSON.parse(progress.notifPrefs || "{}") as Record<string, unknown>
    const clean: Record<string, boolean> = {}
    for (const [k, v] of Object.entries(stored)) {
      if (typeof v === "boolean" && k in DEFAULT_NOTIF_PREFS) clean[k] = v // whitelist, booleans only
    }
    return { ...DEFAULT_NOTIF_PREFS, ...clean }
  } catch {
    return { ...DEFAULT_NOTIF_PREFS }
  }
}

// email journey metadata lives in journeyMeta.ts (client-safe)

export function readEmailPrefs(progress: UserProgress): Record<string, boolean> {
  try {
    const stored = JSON.parse(progress.emailPrefs || "{}") as Record<string, unknown>
    const clean: Record<string, boolean> = {}
    for (const [k, v] of Object.entries(stored)) {
      if (typeof v === "boolean" && k in DEFAULT_EMAIL_PREFS) clean[k] = v
    }
    return { ...DEFAULT_EMAIL_PREFS, ...clean }
  } catch {
    return { ...DEFAULT_EMAIL_PREFS }
  }
}

// ── verse of the day pool (exact KJV — matches the in-app reader) ─

const VERSE_POOL: { ref: string; text: string }[] = [
  { ref: "Psalm 119:105", text: "Thy word is a lamp unto my feet, and a light unto my path." },
  { ref: "Joshua 1:9", text: "Be strong and of a good courage… for the LORD thy God is with thee whithersoever thou goest." },
  { ref: "Philippians 4:13", text: "I can do all things through Christ which strengtheneth me." },
  { ref: "Isaiah 40:31", text: "But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles." },
  { ref: "Proverbs 3:5", text: "Trust in the LORD with all thine heart; and lean not unto thine own understanding." },
  { ref: "Matthew 11:28", text: "Come unto me, all ye that labour and are heavy laden, and I will give you rest." },
  { ref: "Psalm 46:1", text: "God is our refuge and strength, a very present help in trouble." },
  { ref: "Romans 8:28", text: "And we know that all things work together for good to them that love God." },
  { ref: "2 Timothy 1:7", text: "For God hath not given us the spirit of fear; but of power, and of love, and of a sound mind." },
  { ref: "Lamentations 3:22-23", text: "…His compassions fail not; they are new every morning: great is thy faithfulness." },
  { ref: "Hebrews 4:12", text: "For the word of God is quick, and powerful, and sharper than any twoedged sword." },
  { ref: "Psalm 119:11", text: "Thy word have I hid in mine heart, that I might not sin against thee." },
  { ref: "Galatians 6:9", text: "And let us not be weary in well doing: for in due season we shall reap, if we faint not." },
  { ref: "Jeremiah 29:13", text: "And ye shall seek me, and find me, when ye shall search for me with all your heart." },
  { ref: "Colossians 3:16", text: "Let the word of Christ dwell in you richly in all wisdom." },
]

// ── helpers ───────────────────────────────────────────────────

async function alreadyNotifiedToday(type: string): Promise<boolean> {
  const start = new Date(new Date(dayKey() + "T00:00:00Z").getTime() - TZ_OFFSET_MS)
  const found = await db.appNotification.findFirst({
    where: { userId: USER_ID, type, createdAt: { gte: start } },
    select: { id: true },
  })
  return !!found
}

async function createNotif(data: { type: string; title: string; body: string; icon: string }) {
  await db.appNotification.create({ data: { userId: USER_ID, ...data } })
  return true
}

const QUIET_START = 21 * 60 // 21:00
const QUIET_END = 8 * 60 // 08:00

function inQuietHours(minuteOfDay: number): boolean {
  return minuteOfDay >= QUIET_START || minuteOfDay < QUIET_END
}

// ── the Scribe's Ledger: engine-aware escalation ──────────────

interface EngineContext {
  churnRisk: number
  reengageTone: string
}

/** read the latest engine snapshot (fails soft to priors) */
async function engineContext(): Promise<EngineContext> {
  try {
    const snap = await db.engineSnapshot.findFirst({ where: { userId: USER_ID }, orderBy: { computedAt: "desc" } })
    if (!snap) return { churnRisk: 0.35, reengageTone: "growth" }
    const state = JSON.parse(snap.state) as { scores?: { churnRisk?: number }; game?: { tone?: { reengage?: string } } }
    const churn = typeof state.scores?.churnRisk === "number" && Number.isFinite(state.scores.churnRisk) ? state.scores.churnRisk : 0.35
    const tone = typeof state.game?.tone?.reengage === "string" ? state.game.tone.reengage : "growth"
    return { churnRisk: Math.max(0, Math.min(1, churn)), reengageTone: tone }
  } catch {
    return { churnRisk: 0.35, reengageTone: "growth" }
  }
}

/** tone-aware re-engagement subject/body variants (vetted library only) */
function reengageCopyForTone(tone: string, name: string, gap: number): { subject: string; preheader: string; body: string } {
  if (tone === "identity") {
    return {
      subject: `${name}, you are a learner of the Word`,
      preheader: "Studious people return to their desks — yours is ready",
      body: `It's been ${gap} days. That's not who you've become.

The scroll kept your place, your streak can be rekindled with one lesson, and the Word you were learning is still waiting to be learned. Return to your desk — the Academy kept it exactly as you left it.`,
    }
  }
  if (tone === "stewardship") {
    return {
      subject: `A gentle restart, ${name}`,
      preheader: "No catch-up required — one short lesson is enough",
      body: `It's been ${gap} days, and that's okay.

No catch-up is required, no guilt is owed. One short lesson today is enough — small and faithful wins. The Academy will pace itself to you.`,
    }
  }
  return {
    subject: `${name}, your scroll is waiting`,
    preheader: "One lesson picks the thread back up",
    body: `It's been ${gap} days. One lesson is all it takes to pick the thread back up — the Academy kept your place, your XP and your streak path exactly as you left them.`,
  }
}

// ── the timed + personal scheduler ────────────────────────────

export interface EvaluateResult {
  created: { type: string; title: string; body: string; icon: string }[]
  emailsSent: { journey: string; step: string; subject: string }[]
}

/** Run every ~60–90s from the client (and on bootstrap). Idempotent: each rule fires at most once per day. */
export async function evaluateJourneys(progress: UserProgress): Promise<EvaluateResult> {
  const prefs = readNotifPrefs(progress)
  const created: EvaluateResult["created"] = []
  const push = async (cat: NotifCategoryKey, data: { type: string; title: string; body: string; icon: string }, critical = false) => {
    if (!prefs[cat]) return
    const { minuteOfDay } = localTime()
    if (!critical && progress.quietHoursOn && inQuietHours(minuteOfDay)) return
    if (await alreadyNotifiedToday(data.type)) return
    await createNotif(data)
    created.push(data)
  }

  const { hour, minuteOfDay, dow } = localTime()
  const today = dayKey()
  const studiedToday = progress.lastActiveDay === today
  const streak = progress.streak

  // ── 1. TIMED · Verse of the day (morning, every day) ──
  if (hour >= 7) {
    const dayIndex = Math.floor(new Date(today + "T00:00:00Z").getTime() / 86400000)
    const v = VERSE_POOL[dayIndex % VERSE_POOL.length]
    await push("verse", {
      type: "verse",
      title: `Verse of the day 📖`,
      body: `“${v.text}” — ${v.ref}. A 5-minute lesson pairs beautifully with it.`,
      icon: "📖",
    })
  }

  // ── 2. TIMED · Study reminder at the user's chosen time ──
  if (minuteOfDay >= parseHM(progress.reminderTime) && !studiedToday) {
    await push("reminders", {
      type: "reminder",
      title: streak > 0 ? `${streak}-day streak needs one lesson ⏰` : "Your daily lesson awaits ⏰",
      body:
        streak > 0
          ? `Just one 5-minute lesson keeps your ${streak}-day streak alive. The scroll is open.`
          : "Five minutes now starts a streak that changes everything. Open your first lesson!",
      icon: "⏰",
    })
  }

  // ── 3. TIMED · Daily quiz nudge (afternoon) ──
  if (hour >= 13 && !studiedToday) {
    await push("quiz", {
      type: "quiz_nudge",
      title: "Fresh quiz, 5 questions 🧠",
      body: "Today's Daily Bible Quiz is live — up to 29 XP in under two minutes.",
      icon: "🧠",
    })
  }

  // ── 4. TIMED · Streak-risk window (evening, critical) ──
  if (hour >= 20 && streak >= 2 && !studiedToday) {
    const recent = await db.appNotification.findFirst({
      where: { userId: USER_ID, type: "streak_risk", createdAt: { gte: new Date(Date.now() - 20 * 3600 * 1000) } },
      select: { id: true },
    })
    if (!recent && prefs["streak"]) {
      const skipQuiet = progress.quietHoursOn && inQuietHours(minuteOfDay)
      if (!skipQuiet) {
        await createNotif({
          type: "streak_risk",
          title: `${streak}-day streak at risk! 🔥`,
          body: "One lesson before midnight saves it. Your future self will thank you!",
          icon: "🔥",
        })
        created.push({
          type: "streak_risk",
          title: `${streak}-day streak at risk! 🔥`,
          body: "One lesson before midnight saves it. Your future self will thank you!",
          icon: "🔥",
        })
      }
    }
  }

  // ── 5. PERSONAL · Hearts fully refilled ──
  if (progress.hearts >= MAX_HEARTS && progress.hearts < 5 + 1) {
    // hearts only reach MAX via regen — celebrate the refill (once/day)
    await push("hearts", {
      type: "heart_full",
      title: "Hearts full — perfect timing ❤️",
      body: "All 5 hearts regenerated. A full run of lessons is waiting for you.",
      icon: "❤️",
    })
  }

  // ── 6. SPECIFIC · Level up ──
  const level = levelInfo(progress.xp).level
  let meta: Record<string, unknown> = {}
  try {
    meta = JSON.parse(progress.notifPrefs || "{}")
  } catch {
    /* ignore */
  }
  const lastKnownLevel = typeof meta._lastLevel === "number" ? meta._lastLevel : null
  if (lastKnownLevel !== null && level > lastKnownLevel) {
    await push("level", {
      type: "level_up",
      title: `Level ${level} unlocked! 🚀`,
      body: `You've grown from Level ${lastKnownLevel} to Level ${level}. Harder units — and richer XP — now open up.`,
      icon: "🚀",
    })
  }
  if (lastKnownLevel !== level) {
    meta._lastLevel = level
    await db.userProgress.update({
      where: { userId: USER_ID },
      data: { notifPrefs: JSON.stringify({ ...prefs, ...meta }) },
    })
  }

  // ── 7. SPECIFIC · Friend requests waiting ──
  const pendingRequests = await db.botUser.count({ where: { requestedToUser: true } })
  if (pendingRequests > 0) {
    await push("social", {
      type: "friend_request",
      title: `${pendingRequests} friend request${pendingRequests > 1 ? "s" : ""} waiting 🤝`,
      body: "Someone wants to study alongside you. Say hello in Friends!",
      icon: "🤝",
    })
  }

  // ── 8. TIMED · Monday weekly recap ──
  if (dow === 1 && hour >= 8) {
    const lastMonday = new Date(new Date(today + "T00:00:00Z").getTime() - TZ_OFFSET_MS - 6 * 86400000)
    const weekXp = await db.leagueEntry.findFirst({
      where: { userId: USER_ID, weekKey: weekKey(lastMonday), isCurrentUser: true },
      select: { xp: true },
    })
    await push("level", {
      type: "weekly_recap",
      title: "Your week in the Word 📊",
      body: `Last week you earned ${weekXp?.xp ?? 0} league XP. New league, fresh start — aim for the promotion zone!`,
      icon: "📊",
    })
  }

  // ── email journeys ──
  const emailsSent = await evaluateEmailJourneys(progress)
  return { created, emailsSent }
}

// ═══════════════════════════════════════════════════════════════
//  EMAIL JOURNEYS — copy follows Alex Hormozi's frameworks:
//  · Value equation (dream outcome × likelihood) / (time × effort)
//  · Value stacking with anchor prices
//  · Guarantee (risk reversal) · Urgency & scarcity
//  · One clear CTA per email, named offer, hooks & open loops
// ═══════════════════════════════════════════════════════════════

export interface EmailStep {
  step: string
  subject: string
  preheader: string
  body: string
  ctaLabel: string
  ctaView: string
  /** human-readable send condition shown in the preview UI */
  condition: string
}

function welcomeSteps(name: string): EmailStep[] {
  const n = name || "friend"
  return [
    {
      step: "d0",
      subject: `Your scroll is ready, ${n} 📜 (a founding gift is inside)`,
      preheader: "Your first 5-minute lesson — and a gift that expires.",
      body: `${n}, welcome to Scroll Academy.\n\nYou just joined a school where the Bible's own languages, its history and its defense are taught in 5-minute lessons — with streaks, hearts and leagues that make showing up daily almost automatic.\n\nHERE'S YOUR FIRST STEP: open one lesson today. Not a chapter of theory — one lesson. It takes 5 minutes, and by the end you'll have read a phrase of real Koine Greek or Hebrew.\n\nFOUNDING GIFT INSIDE: this week, Scroll Pro — every course, unlimited hearts, audio lessons — is still at founding-member pricing. When you're ready, it's one tap in your profile.\n\nP.S. Day 1 streaks beat day 7 plans. Start now, thank yourself later.`,
      ctaLabel: "Start my first lesson",
      ctaView: "learn",
      condition: "Immediately after sign-up",
    },
    {
      step: "d1",
      subject: "The 5-minute Bible habit (day 2)",
      preheader: "Why tiny beats heroic — every single time.",
      body: `Quick question, ${n}: did you open a lesson yesterday?\n\nIf yes — your streak is alive and your future self says thank you. If not — no guilt. Here's the whole secret of this academy:\n\nTHE MATH OF SHOWING UP\n5 minutes/day × 365 days = 1,825 minutes — about 30 hours of study a year. That's a seminary course, learned in the time you'd otherwise spend waiting for coffee.\n\nTHE METHOD\n· Lessons are short by design — you always have time.\n· Hearts forgive mistakes; streaks reward consistency.\n· Every unit ends with a gem chest — rewards built in.\n\nOne lesson today. That's the entire ask.`,
      ctaLabel: "Keep my streak alive",
      ctaView: "learn",
      condition: "1 day after sign-up",
    },
    {
      step: "d3",
      subject: "Why 4,000 attempts at learning Greek fail (and why yours won't)",
      preheader: "The one variable that decides whether you finish.",
      body: `${n}, here's an uncomfortable truth: most people who try to learn Biblical Greek quit by week three.\n\nNot because they're lazy. Because the METHOD demands heroics: 90-minute grammar sessions, vocab flashcards with 400 words, no feedback loop.\n\nSCROLL ACADEMY FLIPS THE EQUATION\n· Time: 5 minutes, not 90.\n· Effort: the app picks your next lesson — zero planning.\n· Feedback: instant. Every answer tells you something.\n· Outcome: you'll parse real verses, not translate imaginary sentences.\n\nThat's the whole difference. The people who finish aren't stronger — they're carrying less.\n\nYour lesson today is waiting exactly where you left it.`,
      ctaLabel: "Open my lesson",
      ctaView: "learn",
      condition: "3 days after sign-up",
    },
    {
      step: "d7",
      subject: "One week in: here's what you've unlocked",
      preheader: "Your first-week report — and what opens next.",
      body: `${n}, you've been in the academy for a week. Look at what's on your desk now:\n\n· Streak mechanics working FOR you (never against you)\n· The practice hub that recycles your exact mistakes\n· Leagues where your weekly XP competes for promotion\n· Stories, a daily quiz, and the full Bible reader with verse highlighting\n\nWHAT OPENS NEXT: the deeper units pay more XP — they're harder ON PURPOSE. Foundations → Growing → Advanced. You'll feel the ramp, and that's exactly how mastery is built.\n\nIf you've kept any streak at all this week: spectacular. If the week got away from you: today is day one. Both roads start at the same button.`,
      ctaLabel: "See my week",
      ctaView: "profile",
      condition: "7 days after sign-up",
    },
  ]
}

function proOfferSteps(name?: string): EmailStep[] {
  const n = name || "friend"
  return [
    {
      step: "d2",
      subject: "The Scroll Pro founding offer (ends when the cohort fills)",
      preheader: "$849 of courses. One price. A guarantee that pays YOU to try it.",
      body: `You've seen the free academy. Here's the whole library, unlocked:\n\nTHE ALL-ACCESS STACK\n· All 18 courses — Greek, Hebrew, manuscripts, apologetics, 8 denominations ($497)\n· Unlimited hearts — never stop mid-lesson ($89/yr)\n· The full story library, audio lessons & advanced stats ($167)\n· Streak Repair ×2 every month — freeze-proof your streak ($49)\n· Founder bonuses: Greek Alphabet Speed Drills + Prayer Journal prompts ($48)\n\nTOTAL VALUE: $850+. YOURS AT FOUNDING PRICE: from $4.99/mo.\n\nTHE SIMPLE PROMISE: study for 30 days. If you don't know more Scripture than you do today, one email gets every cent back — and you keep the bonus drills.\n\nFounding pricing exists to seed the first cohort. When the cohort fills, it's gone.`,
      ctaLabel: "Claim my founding price",
      ctaView: "paywall",
      condition: "2 days after sign-up",
    },
    {
      step: "d9",
      subject: "What $4.99 actually buys (the honest math)",
      preheader: "Cheaper than the coffee you'll drink during one lesson.",
      body: `Let's be brutally specific, ${n}.\n\n· A single seminary Greek credit: ~$1,800. Scroll Pro annual: $59.99. That's 3% of one credit — for the alphabet to the verb system.\n· A commentary set: $200–600. Our 18 courses walk through the whole Bible's story, languages and defense.\n· A tutoring hour: $50–90. Unlimited hearts mean you never pay (in frustration) for mistakes again.\n\nPER DAY: the annual plan is $0.16/day. Your lessons happen in 5 minutes. Do the division — you're being paid in years of saved time.\n\nAnd the risk is on US: 30 days, full refund, keep the bonuses. That's not a tagline; it's a signed promise.`,
      ctaLabel: "Start Scroll Pro",
      ctaView: "paywall",
      condition: "9 days after sign-up",
    },
    {
      step: "d21",
      subject: "Last call: founding price closes with the cohort",
      preheader: "One final bonus for the people who finish what they start.",
      body: `${n}, three weeks ago you opened your first scroll. Quick recap of what the founding offer still includes:\n\n· Every course — 18 paths, all languages & denominations\n· Unlimited hearts, audio lessons, advanced stats\n· Streak Repair ×2/month\n· The founder bonuses (alphabet drills + prayer journal)\n· 30-day "Grow or it's free" guarantee\n\nWHAT CHANGES WHEN THE COHORT FILLS: the price. Founding members keep their rate for life. Everyone after pays full price.\n\nIf you've been waiting for a sign — this is it, written by a system that knows your streak, your XP, and exactly how close you are to your next milestone.`,
      ctaLabel: "Lock my founding rate",
      ctaView: "paywall",
      condition: "21 days after sign-up (if not subscribed)",
    },
  ]
}

function streakSaverSteps(streak: number): EmailStep[] {
  return [
    {
      step: "day1_miss",
      subject: `${streak}-day streak: one lesson turns the lights back on 🔥`,
      preheader: "The streak isn't gone — it's waiting.",
      body: `Your ${streak}-day streak didn't die today — it's just unlit, like a lamp waiting for a match.\n\nOne lesson before tonight resets the flame. Five minutes. The lesson is already queued from where you stopped.\n\nP.S. Scroll Pro includes Streak Repair twice a month — a freeze that saves the streak even on missed days. It has rescued thousands of streaks at 11:58 PM.`,
      ctaLabel: "Relight my streak",
      ctaView: "learn",
      condition: "Evening of the first missed day (streak ≥ 3)",
    },
  ]
}

function reEngagementSteps(name: string, days: number): EmailStep[] {
  const n = name || "friend"
  const map: Record<string, EmailStep> = {
    d3_miss: {
      step: "d3_miss",
      subject: `${n}, your scrolls miss you (3 days quiet)`,
      preheader: "Your league moved on without you — 5 minutes fixes that.",
      body: `Three days of quiet. No lectures — just this: the material you learned is still yours, but leagues don't wait, and streaks don't either.\n\nHere's what 5 minutes today does: reactivates your streak, moves you up the league table, and finishes the lesson you were halfway through.\n\nThe academy kept your seat. Come take it back.`,
      ctaLabel: "Come back in 5 minutes",
      ctaView: "learn",
      condition: "3 days inactive",
    },
    d7_miss: {
      step: "d7_miss",
      subject: "A comeback gift: 3 Streak Freezes, on us ❄️",
      preheader: "One week out — here's a safety net to come back with.",
      body: `${n}, it's been a week, so instead of a reminder, here's a GIFT: 3 Streak Freezes added to your account the moment you open a lesson today.\n\nThey work like this: miss a day, and a freeze absorbs the blow instead of your streak. Stumble-proof your comeback.\n\nREMEMBER THE OUTCOME: reading Scripture in its own words isn't a fantasy — it's 5 minutes a day with the method you already know. You were closer than you think.`,
      ctaLabel: "Claim freezes & return",
      ctaView: "learn",
      condition: "7 days inactive",
    },
    d14_miss: {
      step: "d14_miss",
      subject: "Should I close your seat? (50% answer inside)",
      preheader: "One honest question — and a half-price option.",
      body: `Two weeks is long enough to ask honestly: is Scroll Academy not working for you?\n\nIf the answer is "too busy" — the annual plan costs $0.16/day and lessons take 5 minutes. Busy people are exactly who it was built for.\n\nIf the answer is "the free tier is enough" — totally fine, it stays free forever. But before you go: here's 50% OFF the first 3 months of Pro if you want the full library without the full price. Use it or ignore it — your seat stays open either way.\n\nEither way, one lesson today would look good on you.`,
      ctaLabel: "Take the 50% comeback offer",
      ctaView: "paywall",
      condition: "14 days inactive",
    },
  }
  return [map[`d${Math.min(14, days)}_miss`] ?? map.d3_miss]
}

function weeklyDigestSteps(xp: number, lessons: number, league: string, rank: number | null): EmailStep[] {
  return [
    {
      step: "monday",
      subject: `Your week: ${xp} XP, ${lessons} lessons 📊 (and what's next)`,
      preheader: "Monday recap + this week's one goal.",
      body: `THE RECAP\n· XP earned: ${xp}\n· Lessons completed: ${lessons}\n· League: ${league}${rank ? ` (rank #${rank})` : ""}\n\nTHIS WEEK'S ONE GOAL: pick a single number — 150 XP, 7 lessons, one finished unit — and let the daily quests carry you there. Progress compounds when it's specific.\n\nThe path got a little harder this week. Good. That's what growth feels like from the inside.`,
      ctaLabel: "Set my week in motion",
      ctaView: "learn",
      condition: "Monday morning",
    },
  ]
}

function milestoneSteps(kind: string, detail: string): EmailStep[] {
  const map: Record<string, EmailStep> = {
    streak_milestone: {
      step: `streak_${detail}`,
      subject: `${detail} days in a row. You're built different 🔥`,
      preheader: `${detail}-day streak — and why it matters more than talent.`,
      body: `${detail} consecutive days of study. Not talent — system. The streak you've built is now HABIT wearing a crown.\n\nMost learners never see this number. You're past the point where quitting is easy and into the territory where your streak protects YOU on the bad days.\n\nCelebrate, then protect it: one lesson a day keeps the crown on.`,
      ctaLabel: "Keep the fire",
      ctaView: "learn",
      condition: "Streak hits a milestone (7 · 30 · 100 · 365)",
    },
    level_up: {
      step: "level_up",
      subject: `Level ${detail} unlocked 🚀`,
      preheader: "New level, richer XP, harder paths.",
      body: `Level ${detail} — official. Every level now pays more XP because the units are genuinely harder. That's the deal this academy makes: growing hurts less than stagnating.\n\nYour next milestone is already visible on your profile. Go touch it.`,
      ctaLabel: "See my progress",
      ctaView: "profile",
      condition: "Each new level",
    },
    course_complete: {
      step: "course_complete",
      subject: "Course complete — you did the whole thing 🎓",
      preheader: "The trophy is claimed. Here's what your next door is.",
      body: `You finished ${detail}. Every unit, every mastery test, every chest claimed.\n\nThat's not a streak stat — that's a life skill installed. The natural next door: switch to a second course (your progress in the first is saved forever), or bring a friend into the academy.\n\nProud of you. The academy is proud of you.`,
      ctaLabel: "Choose my next course",
      ctaView: "courses",
      condition: "100% of a course completed",
    },
  }
  return [map[kind]]
}

export function proWelcomeSteps(): EmailStep[] {
  return [
    {
      step: "welcome",
      subject: "Welcome to Scroll Pro 👑 (receipt + your unfair advantages)",
      preheader: "Everything unlocked. The guarantee, in writing.",
      body: `You're in. Every door in the academy is now open:\n\n· All 18 courses — languages, Bible, apologetics, 8 denominations\n· Unlimited hearts — mistakes are now just tuition\n· Audio for stories and listening labs\n· Streak Repair ×2 monthly\n· Advanced stats on your profile\n\nTHE GUARANTEE, IN WRITING: 30 days. If you don't know more Scripture than you do today, one email refunds every cent — and the founder bonuses stay yours.\n\nFIRST MOVE: start the course you've been curious about. Second: turn on daily reminders in your profile. Momentum does the rest.`,
      ctaLabel: "Open everything",
      ctaView: "learn",
      condition: "Immediately after subscribing",
    },
  ]
}

function winbackSteps(days: number): EmailStep[] {
  const map: Record<string, EmailStep> = {
    d1: {
      step: "d1",
      subject: "Pro is off — here's what changes (honestly)",
      preheader: "No guilt trip. Just the facts, so you can decide with both eyes open.",
      body: `Your Scroll Pro membership has ended. No hard feelings — the free academy stays fully yours: lessons, streaks, leagues, the Bible reader, all 18 course intros.\n\nFOR THE RECORD, what Pro added:\n· Unlimited hearts (mistakes without the meter running)\n· 2× XP every weekend\n· Streak Repair ×2 a month\n· Advanced stats & weekly trends\n\nIf you cancelled because something didn't work — reply and tell us what. Reading one honest complaint beats a hundred polite silences.`,
      ctaLabel: "Back to my lessons",
      ctaView: "learn",
      condition: "1 day after Pro ends",
    },
    d3: {
      step: "d3",
      subject: "3 days out: your streak insurance expired with it",
      preheader: "Streak Repair ×2/month — what it quietly does every month.",
      body: `Quick status, since you'd want to know: the monthly Streak Repairs stopped with your plan. On free, a missed day costs the streak — and a 30-day streak is worth more than the subscription, frankly.\n\nTWO FAIR OPTIONS:\n1. Keep studying free — genuinely fine. The door never closes.\n2. Come back at the winback rate below, and the insurance restarts today.\n\nEither way: one lesson today. That part never changes.`,
      ctaLabel: "Protect my streak",
      ctaView: "paywall",
      condition: "3 days after Pro ends",
    },
    d7: {
      step: "d7",
      subject: "Last one from me: 50% off, 7 days, then it's gone",
      preheader: "The winback offer — half price for 3 full months.",
      body: `Last email about your membership — after this we go back to cheering your streak on quietly.\n\nTHE WINBACK OFFER: 50% OFF your first 3 months of Scroll Pro. Everything back on: unlimited hearts, weekend 2× XP, monthly Streak Repairs, advanced stats. The 30-day “Grow or it's free” guarantee applies like it always did.\n\nWhy so generous? Because a learner who comes back is worth more than a discount. Offer expires in 7 days — after that, founding pricing only.\n\nWhatever you choose: keep reading. The book is worth it.`,
      ctaLabel: "Claim 50% off",
      ctaView: "paywall",
      condition: "7 days after Pro ends",
    },
  }
  return [map[`d${Math.min(7, days)}`] ?? map.d1]
}

// ── the email engine ──────────────────────────────────────────

async function sendEmail(step: EmailStep, journey: string): Promise<boolean> {
  // single-user sandbox: persist the delivery (provider transport is a no-op log)
  try {
    await db.emailLog.upsert({
      where: { userId_journey_step: { userId: USER_ID, journey, step: step.step } },
      update: {},
      create: {
        userId: USER_ID,
        journey,
        step: step.step,
        subject: step.subject,
        preheader: step.preheader,
        bodyText: step.body,
        ctaLabel: step.ctaLabel,
        ctaView: step.ctaView,
        status: "sent",
      },
    })
    console.log(`📧 [email:${journey}/${step.step}] ${step.subject}`)
    return true
  } catch (e) {
    console.error("[sendEmail]", e)
    return false
  }
}

/** Direct send for event-driven journeys (onboarding, subscribe, milestones). */
export async function sendJourneyEmail(journey: string, steps: EmailStep[]): Promise<EvaluateResult["emailsSent"]> {
  const prefsRaw = await db.userProgress.findUnique({ where: { userId: USER_ID }, select: { emailPrefs: true, emailOptIn: true } })
  if (!prefsRaw?.emailOptIn) return []
  const prefs = readEmailPrefs(prefsRaw as unknown as UserProgress)
  if (prefs[journey] === false) return []
  const sent: EvaluateResult["emailsSent"] = []
  for (const s of steps) {
    if (await sendEmail(s, journey)) sent.push({ journey, step: s.step, subject: s.subject })
  }
  return sent
}

/** Idempotent campaign send — used by seasonal campaigns (the Advent gift
 *  campaign). At most ONE delivery per (journey, step), exactly like the
 *  scheduled rules, so re-running the daily trigger never double-sends.
 *  Respects the user's email opt-in + the journey preference toggle. */
export async function sendCampaignEmailOnce(journey: string, steps: EmailStep[]): Promise<string[]> {
  const prefsRaw = await db.userProgress.findUnique({ where: { userId: USER_ID }, select: { emailPrefs: true, emailOptIn: true } })
  if (!prefsRaw?.emailOptIn) return []
  const prefs = readEmailPrefs(prefsRaw as unknown as UserProgress)
  if (prefs[journey] === false) return []
  const sent: string[] = []
  for (const s of steps) {
    const exists = await db.emailLog.findUnique({
      where: { userId_journey_step: { userId: USER_ID, journey, step: s.step } },
      select: { id: true },
    })
    if (exists) continue
    if (await sendEmail(s, journey)) sent.push(s.step)
  }
  return sent
}

export async function welcomeStepsForUser(): Promise<EmailStep[]> {
  const user = await db.user.findUnique({ where: { id: USER_ID }, select: { name: true } })
  return welcomeSteps(user?.name ?? "friend")
}

/** Scheduled email rules — like notifications, each step fires at most once. Idempotent. */
export async function evaluateEmailJourneys(progress: UserProgress): Promise<EvaluateResult["emailsSent"]> {
  if (!progress.emailOptIn) return []
  const prefs = readEmailPrefs(progress)
  const sent: EvaluateResult["emailsSent"] = []
  const trySend = async (journey: EmailJourneyKey, steps: EmailStep[]) => {
    if (prefs[journey] === false) return
    for (const s of steps) {
      const exists = await db.emailLog.findUnique({
        where: { userId_journey_step: { userId: USER_ID, journey, step: s.step } },
        select: { id: true },
      })
      if (exists) continue
      if (await sendEmail(s, journey)) sent.push({ journey, step: s.step, subject: s.subject })
    }
  }

  const user = await db.user.findUnique({ where: { id: USER_ID }, select: { name: true, createdAt: true } })
  const name = user?.name ?? "friend"

  // account age in days
  const ageDays = user?.createdAt ? Math.floor((Date.now() - user.createdAt.getTime()) / 86400000) : 0
  const isPro = progress.plan !== "free"

  // welcome series — day 0 fires at account creation; 1/3/7 by age
  if (!isPro && ageDays >= 0 && prefs["welcome_series"] !== false) {
    const all = welcomeSteps(name)
    const due = all.filter((s) => {
      const d = { d0: 0, d1: 1, d3: 3, d7: 7 }[s.step] ?? 99
      return ageDays >= d
    })
    await trySend("welcome_series", due)
  }

  // pro offer sequence — days 2 / 9 / 21, only while free
  if (!isPro && ageDays >= 2 && prefs["pro_offer"] !== false) {
    const all = proOfferSteps(name)
    const due = all.filter((s) => {
      const d = { d2: 2, d9: 9, d21: 21 }[s.step] ?? 99
      return ageDays >= d
    })
    await trySend("pro_offer", due)
  }

  // streak saver — evening of a missed day with streak ≥ 3
  const { hour } = localTime()
  const yesterdayKey = dayKey(new Date(Date.now() - 86400000))
  const activeYesterday = progress.lastActiveDay === yesterdayKey
  const studiedToday = progress.lastActiveDay === dayKey()
  if (hour >= 19 && progress.streak >= 3 && !activeYesterday && !studiedToday && prefs["streak_saver"] !== false) {
    const step = streakSaverSteps(progress.streak)[0]
    const exists = await db.emailLog.findUnique({
      where: { userId_journey_step: { userId: USER_ID, journey: "streak_saver", step: step.step } },
      select: { id: true },
    })
    if (!exists) await trySend("streak_saver", [step])
  }

  // re-engagement — 3 / 7 / 14 days inactive (day-key distance from lastActiveDay),
  // escalated to 2 days when the engine judges churn risk high, with the
  // bandit-chosen tone from the vetted library
  if (!studiedToday && progress.lastActiveDay) {
    const gap = daysBetween(progress.lastActiveDay, dayKey())
    const eng = await engineContext()
    const trigger = eng.churnRisk > 0.6 ? 2 : 3
    if (gap >= trigger && prefs["re_engagement"] !== false) {
      if (eng.churnRisk > 0.6 && gap < 3) {
        // early escalation: tone-aware short letter (engine-driven)
        const copy = reengageCopyForTone(eng.reengageTone, name, gap)
        const already = await db.emailLog.findFirst({
          where: { userId: USER_ID, journey: "re_engagement", step: `early-${gap}` },
          select: { id: true },
        })
        if (!already) {
          await trySend("re_engagement", [{
            step: `early-${gap}`,
            condition: `Engine escalation: churn risk ${(eng.churnRisk * 100).toFixed(0)}%`,
            subject: copy.subject,
            preheader: copy.preheader,
            body: copy.body,
            ctaLabel: "Return to the scroll",
            ctaView: "learn",
          }])
        }
      } else {
        const steps = reEngagementSteps(name, gap)
        await trySend("re_engagement", steps)
      }
    }
  }

  // winback — Pro ended: day 1 · 3 · 7 after cancellation (stops if they resubscribe)
  if (!isPro && progress.lastCanceledAt && prefs["winback"] !== false) {
    const sinceDays = Math.floor((Date.now() - progress.lastCanceledAt.getTime()) / 86400000)
    if (sinceDays >= 1 && sinceDays <= 14) {
      await trySend("winback", winbackSteps(sinceDays))
    }
  }

  // weekly digest — Monday morning
  const { dow } = localTime()
  if (dow === 1 && hour >= 8 && prefs["weekly_digest"] !== false) {
    const entry = await db.leagueEntry.findFirst({
      where: { userId: USER_ID, weekKey: weekKey(), isCurrentUser: true },
      select: { xp: true },
    })
    const lessons = await db.lessonCompletion.count({
      where: { userId: USER_ID, completedAt: { gte: new Date(Date.now() - 7 * 86400000) } },
    })
    const leagueRows = await db.leagueEntry.findMany({
      where: { leagueId: `league-${progress.leagueOrder ?? 0}`, weekKey: weekKey() },
      orderBy: [{ xp: "desc" }, { displayName: "asc" }],
      select: { isCurrentUser: true },
    })
    const rank = leagueRows.findIndex((e) => e.isCurrentUser)
    const leagueName =
      (await db.league.findUnique({ where: { id: `league-${progress.leagueOrder ?? 0}` }, select: { name: true } }))?.name ??
      `League ${(progress.leagueOrder ?? 0) + 1}`
    const step = weeklyDigestSteps(entry?.xp ?? 0, lessons, leagueName, rank >= 0 ? rank + 1 : null)[0]
    const weekTag = weekKey()
    const exists = await db.emailLog.findUnique({
      where: { userId_journey_step: { userId: USER_ID, journey: "weekly_digest", step: `${step.step}-${weekTag}` } },
      select: { id: true },
    })
    if (!exists) {
      const s = { ...step, step: `${step.step}-${weekTag}` }
      await trySend("weekly_digest", [s])
    }
  }

  return sent
}

/** event-driven milestone email — call after big wins (streak milestones, level ups, course completion) */
export async function sendMilestoneEmail(kind: "streak_milestone" | "level_up" | "course_complete", detail: string) {
  const progress = await db.userProgress.findUnique({ where: { userId: USER_ID } })
  if (!progress?.emailOptIn) return []
  const prefs = readEmailPrefs(progress)
  if (prefs["milestone"] === false) return []
  return sendJourneyEmail("milestone", milestoneSteps(kind, detail))
}
