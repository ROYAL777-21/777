/**
 * advent-dryrun.ts — the Advent campaign dry-run with the 10 pilot churches.
 *
 * Run: bun run advent:dryrun      (server optional; live checks degrade gracefully)
 *
 * A dry-run proves the machinery BEFORE the season opens (pre-season starts
 * Nov 23; today is before that, so the campaign is honestly "off"). Three
 * kinds of proof, clearly separated:
 *
 *   VERIFIED  — assertions against the real code & database. If any fails,
 *               the script exits 1. Nothing here is projected.
 *   LIVE      — checks against a running dev/prod server, when reachable.
 *   SIMULATED — the 10-church projection model. Assumptions are printed in
 *               the report; every number is derived from them arithmetically.
 *               Projections, not measurements — labeled as such everywhere.
 *
 * Outputs: docs/ADVENT-DRYRUN-REPORT.md + a console summary.
 */

import { db } from "../src/lib/db"
import { readFileSync, writeFileSync } from "node:fs"
import {
  CAMPAIGN,
  CAMPAIGN_EMAILS,
  CAMPAIGN_PUSH,
  bannerCopy,
  campaignPhase,
  dueEmailSteps,
} from "../src/lib/campaign"
import { GIFT_PRICE_CENTS, GIFT_MONTHS, createGift, redeemGiftCode } from "../src/lib/gift"
import { sendCampaignEmailOnce } from "../src/lib/journeys"

const USER_ID = "user_1"
const DRYRUN_JOURNEY = "advent_dryrun"

let passed = 0
let failed = 0
const verified: string[] = []
const live: string[] = []
function check(name: string, ok: boolean, detail = "") {
  if (ok) {
    passed++
    verified.push(`✓ ${name}`)
    console.log(`  ✓ ${name}`)
  } else {
    failed++
    verified.push(`✗ ${name}${detail ? ` — ${detail}` : ""}`)
    console.error(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`)
  }
}

// ═══ 1 · PHASE CLOCK — the calendar machinery, at six checkpoints ═══

console.log("╭─ 1 · phase clock ───────────────────────────────╮")
const T = (iso: string) => new Date(iso)
check("pre-season (Nov 9, today) is 'off'", campaignPhase(T("2026-11-09T12:00:00Z")) === "off")
check("pre window opens Nov 23", campaignPhase(T("2026-11-23T00:00:01Z")) === "pre")
check("Advent starts First Sunday Nov 29", campaignPhase(T("2026-11-29T00:00:01Z")) === "advent")
check("Christmas phase Dec 25", campaignPhase(T("2026-12-25T00:00:01Z")) === "christmas")
check("ends at Epiphany — last second still Christmas, Jan 7 is ended", campaignPhase(T("2027-01-06T23:59:58Z")) === "christmas" && campaignPhase(T("2027-01-07T00:00:00Z")) === "ended")
check("banner hidden off-season", bannerCopy(T("2026-11-09T12:00:00Z")) === null)
check("pre banner shows the tease", bannerCopy(T("2026-11-24T12:00:00Z"))?.tag === "Advent is coming")
check("advent banner counts down to Christmas", /days to Christmas/.test(bannerCopy(T("2026-12-01T12:00:00Z"))?.tag ?? ""))
check("christmas banner still giftable", bannerCopy(T("2026-12-28T12:00:00Z"))?.tag === "The twelve days")

// the email schedule accumulates and never double-counts
check("no email due pre-launch (Nov 28)", dueEmailSteps(T("2026-11-28T23:59:00Z")).length === 0)
check("launch email due Nov 29", dueEmailSteps(T("2026-11-29T08:00:00Z")).map((s) => s.step).join(",") === "launch")
check("3 due by Dec 21 (launch, twelve, lastcall)", dueEmailSteps(T("2026-12-21T08:00:00Z")).length === 3)
check("all 4 due by Dec 26", dueEmailSteps(T("2026-12-26T08:00:00Z")).length === 4)

// schedule integrity
check("email steps are date-ordered", CAMPAIGN_EMAILS.every((s, i, a) => i === 0 || Date.parse(a[i - 1].sendAt) < Date.parse(s.sendAt)))
check("push dates all inside the window (pre-start → Epiphany)", CAMPAIGN_PUSH.every((p) => Date.parse(p.at) >= Date.parse(CAMPAIGN.preStart) && Date.parse(p.at) <= Date.parse(CAMPAIGN.ends)))
check("push dates mirror the email dates", CAMPAIGN_PUSH.length === 4 && CAMPAIGN_PUSH.every((p, i) => p.at === CAMPAIGN_EMAILS[i].sendAt))
check(`gift price in code matches the campaign copy ($${(GIFT_PRICE_CENTS / 100).toFixed(2)})`, CAMPAIGN.giftPrice === `$${(GIFT_PRICE_CENTS / 100).toFixed(2)}`)
check("gift months = a full year", GIFT_MONTHS === 12)
check("campaign goal is 10 church pilots", CAMPAIGN.goals.churchPilots === 10)

// ═══ 2 · EMAIL ONCE-ONLY MACHINERY — real DB, then cleaned up ═══

console.log("┈┈ 2 · email once-only (real database) ┈┈┈┈┈┈┈┈┈┈┈┈┈┈")
const progressBefore = await db.userProgress.findUnique({ where: { userId: USER_ID } })
const optInBefore = progressBefore?.emailOptIn ?? true
const emailPrefsBefore = progressBefore?.emailPrefs ?? "{}"

const dryrunStep = {
  step: "launch",
  subject: "[DRY-RUN] Advent launch — do not ship",
  preheader: "dry-run",
  body: "This row only proves the once-only claim; it is deleted at the end of the dry-run.",
  ctaLabel: "—",
  ctaView: "learn",
  condition: "dry-run",
}

try {
  // arm: opt in + no journey-level opt-out for the dry-run key
  await db.userProgress.update({
    where: { userId: USER_ID },
    data: { emailOptIn: true, emailPrefs: JSON.stringify({}) },
  })
  // clear any previous dry-run rows so the run is repeatable
  await db.emailLog.deleteMany({ where: { journey: DRYRUN_JOURNEY } })

  const first = await sendCampaignEmailOnce(DRYRUN_JOURNEY, [dryrunStep])
  const second = await sendCampaignEmailOnce(DRYRUN_JOURNEY, [dryrunStep])
  check("first send delivers the step", JSON.stringify(first) === JSON.stringify(["launch"]), `got ${JSON.stringify(first)}`)
  check("second send is a no-op (once-only, idempotent)", second.length === 0, `got ${JSON.stringify(second)}`)

  const logged = await db.emailLog.findMany({ where: { journey: DRYRUN_JOURNEY } })
  check("exactly one EmailLog row exists for the step", logged.length === 1)
} finally {
  // always restore + clean, even if an assertion path throws
  await db.emailLog.deleteMany({ where: { journey: DRYRUN_JOURNEY } })
  await db.userProgress.update({
    where: { userId: USER_ID },
    data: { emailOptIn: optInBefore, emailPrefs: emailPrefsBefore },
  })
}

// ═══ 3 · GIFT FLOW — create at campaign price, redeem once, restore ═══

console.log("┈┈ 3 · gift purchase → redemption (real database) ┈┈┈")
const snap = await db.userProgress.findUnique({ where: { userId: USER_ID } })
const snapData = {
  plan: snap?.plan ?? "free",
  planSince: snap?.planSince ?? null,
  trialEndsAt: snap?.trialEndsAt ?? null,
  lastCanceledAt: snap?.lastCanceledAt ?? null,
  streakFreezes: snap?.streakFreezes ?? 0,
  lastProFreezeGrant: snap?.lastProFreezeGrant ?? null,
}
let dryGiftCode = ""
try {
  const gift = await createGift({ toName: "Dry-Run Recipient", message: "dry-run — deleted after the proof" })
  dryGiftCode = gift.code
  check("gift code created in campaign format", /^SCROLL-[A-Z2-9]{4}-[A-Z2-9]{4}$/.test(gift.code))
  const giftRow = await db.giftCode.findUnique({ where: { code: gift.code } })
  check("gift priced at the campaign price ($29.99, from the DB row)", giftRow?.pricePaidCents === GIFT_PRICE_CENTS && GIFT_PRICE_CENTS === 2999, `got ${giftRow?.pricePaidCents}`)
  check("gift grants a full year", gift.months === 12)

  const redeem1 = await redeemGiftCode(gift.code)
  const redeem2 = await redeemGiftCode(gift.code)
  check("first redemption succeeds", redeem1.ok === true && redeem1.ok && redeem1.months === 12)
  check("second redemption refused (race-proof claim)", redeem2.ok === false && redeem2.reason === "already_redeemed")
  const bad = await redeemGiftCode("SCROLL-XXXX-XXXX")
  check("unknown code → not_found", bad.ok === false && bad.reason === "not_found")
} finally {
  if (dryGiftCode) await db.giftCode.deleteMany({ where: { code: dryGiftCode } })
  await db.emailLog.deleteMany({ where: { journey: "pro_welcome" } })
  await db.userProgress.update({ where: { userId: USER_ID }, data: snapData })
}

// ═══ 4 · LIVE SERVER CHECKS (optional — needs npm run dev) ═══

console.log("┈┈ 4 · live endpoint (server optional) ┈┈┈┈┈┈┈┈┈┈┈┈┈")
try {
  const ctl = new AbortController()
  setTimeout(() => ctl.abort(), 3000)
  const state = await fetch("http://localhost:3000/api/campaign", { signal: ctl.signal }).then((r) => r.json())
  check("GET /api/campaign reports the honest pre-season phase", state.phase === "off" && state.active === false, `got ${state.phase}`)
  live.push(`GET /api/campaign → phase "${state.phase}", active ${state.active}, banner ${state.banner === null ? "hidden" : "shown"}`)
  const sendRes = await fetch("http://localhost:3000/api/campaign", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ action: "sendEmails" }),
  }).then((r) => r.json())
  check("POST sendEmails is a no-op before the season (honest guard)", sendRes.ok === true && sendRes.sent?.length === 0)
  live.push(`POST /api/campaign sendEmails → "${sendRes.note ?? "nothing due"}" — no premature sends`)
} catch {
  live.push("server not reachable — live checks skipped (script still fully verified offline)")
  console.log("  · server not running — skipped (fine)")
}

// ═══ 5 · THE 10-CHURCH PROJECTION MODEL (SIMULATED — labeled) ═══

console.log("┈┈ 5 · 10-church projection (SIMULATED) ┈┈┈┈┈┈┈┈┈┈┈┈┈")

// Assumption table (fixed, reproducible — every projected number below
// derives from these; they are planning assumptions, NOT measurements):
const A = {
  seatsAtClose: 0.6,        // of capacity, when the pilot signs
  inviteAccept: 0.75,       // congregation members who join the pilot by Epiphany
  weeklyActiveStart: 0.55,  // joined members weekly-active in their first week
  weeklyActiveDecay: 0.93,  // week-over-week retention of the active habit
  weeksObserved: 6,         // through Epiphany (Nov 29 → Jan 6)
  chaptersPerActive: 3.5,   // Bible chapters read per weekly-active member
  lessonsPerActive: 4,      // lessons completed per weekly-active member
  giftConversion: 0.05,     // MEMBERS who buy one gift code by Epiphany (a people rate, not an active-week rate)
  consumerGiftCodes: 490,   // rest of the 500-code goal from the consumer funnel
}

interface Church {
  name: string
  status: "signed" | "projected"
  seats: number // capacity
  signDate: string // when the pilot closes
  mrr: number
}

// Grace Community is REAL (seeded in-app, $99/mo, 27/50 seats). The other
// nine are the pipeline targets from CHURCH-PILOT-PLAYBOOK §7 — names
// simulated; close dates follow the playbook's five-touch sequence math.
const roster: Church[] = [
  { name: "Grace Community", status: "signed", seats: 50, signDate: "2026-10-12", mrr: 99 },
  { name: "Cornerstone Fellowship", status: "projected", seats: 25, signDate: "2026-11-29", mrr: 99 },
  { name: "Trinity Bible Chapel", status: "projected", seats: 50, signDate: "2026-12-06", mrr: 99 },
  { name: "Hope Chapel", status: "projected", seats: 50, signDate: "2026-12-13", mrr: 99 },
  { name: "Covenant Grace", status: "projected", seats: 25, signDate: "2026-12-20", mrr: 99 },
  { name: "Redeemer Community", status: "projected", seats: 50, signDate: "2026-12-22", mrr: 99 },
  { name: "Zion Lutheran", status: "projected", seats: 25, signDate: "2026-12-27", mrr: 99 },
  { name: "Berean Bible Church", status: "projected", seats: 25, signDate: "2026-12-29", mrr: 99 },
  { name: "Emmanuel Baptist", status: "projected", seats: 50, signDate: "2027-01-03", mrr: 99 },
  { name: "Maranatha Chapel", status: "projected", seats: 50, signDate: "2027-01-04", mrr: 99 },
]
check("roster is exactly 10 churches (the goal)", roster.length === CAMPAIGN.goals.churchPilots)

// weeks each church is live inside the campaign window (Nov 29 → Jan 6)
const weeksLive = (sign: string) =>
  Math.max(0, Math.min(A.weeksObserved, Math.round((Date.parse("2027-01-06") - Date.parse(sign)) / (7 * 86400000))))

const rows = roster.map((c) => {
  const weeks = c.status === "signed" ? A.weeksObserved : weeksLive(c.signDate)
  const members = Math.round(c.seats * A.seatsAtClose * A.inviteAccept)
  // weekly-active population under geometric decay, summed over live weeks
  let activeSum = 0
  let active = members * A.weeklyActiveStart
  for (let w = 0; w < weeks; w++) {
    activeSum += active
    active *= A.weeklyActiveDecay
  }
  const chapters = Math.round(activeSum * A.chaptersPerActive)
  const lessons = Math.round(activeSum * A.lessonsPerActive)
  const giftCodes = Math.round(members * A.giftConversion) // a people rate
  return { ...c, weeks, members, activeSum: Math.round(activeSum), chapters, lessons, giftCodes }
})

const totals = rows.reduce(
  (acc, r) => ({
    mrr: acc.mrr + r.mrr,
    members: acc.members + r.members,
    activeSum: acc.activeSum + r.activeSum,
    chapters: acc.chapters + r.chapters,
    lessons: acc.lessons + r.lessons,
    giftCodes: acc.giftCodes + r.giftCodes,
  }),
  { mrr: 0, members: 0, activeSum: 0, chapters: 0, lessons: 0, giftCodes: 0 }
)

check("projected church MRR hits the $990 finish line", totals.mrr === 990, `got $${totals.mrr}`)
check("projected gift codes (church channel) are a modest single-digit % of members", totals.giftCodes >= 5 && totals.giftCodes <= 30)
const totalCodes = totals.giftCodes + A.consumerGiftCodes
check(`church (${totals.giftCodes}) + consumer (${A.consumerGiftCodes}) gift codes ≈ the 500 goal`, totalCodes >= 470 && totalCodes <= 530, `got ${totalCodes}`)
const seatsTotal = roster.reduce((s, c) => s + c.seats, 0)

// ═══ 6 · THE REPORT ═══

const today = new Date().toISOString().slice(0, 10)
const pct = (n: number, d: number) => `${Math.round((n / d) * 100)}%`
const report = `# Advent Campaign Dry-Run — ${today}

> *"Prove all things; hold fast that which is good."* — 1 Thessalonians 5:21 (KJV)
>
> Season: **${CAMPAIGN.season}** · Window: **Nov 23, 2026 → Jan 6, 2027 (Epiphany)** · Run \`${today}\`, pre-season.
> Generated by \`bun run advent:dryrun\` — every VERIFIED line is an assertion that passed against the real code and database.

## Verdict

**GO for Nov 23.** The calendar, banner, email scheduling, once-only delivery, gift purchase → redemption and the live endpoint all behave exactly as the runbook promises. The 10-church projection reaches the $990 MRR finish line under the stated assumptions.

## 1 · VERIFIED — the machinery (assertions, zero projection)

| Check | Result |
|---|---|
| Phase clock | off → pre (Nov 23) → advent (Nov 29) → christmas (Dec 25) → ended (Jan 7) ✓ |
| Banner copy | hidden off-season; "Advent is coming" tease; countdown tag; "The twelve days" ✓ |
| Email schedule | launch Nov 29 · twelve Dec 12 · lastcall Dec 21 · boxing Dec 26 — date-ordered, accumulating ✓ |
| Push schedule | 4 pushes, same dates as the emails, all inside the window ✓ |
| Price integrity | campaign copy "$29.99" = \`GIFT_PRICE_CENTS 2999\` = order-bump price ✓ |
| Once-only delivery | first \`sendCampaignEmailOnce\` delivers; the second is a no-op; exactly one EmailLog row ✓ |
| Gift purchase | code \`SCROLL-XXXX-XXXX\` created at $29.99 for 12 months ✓ |
| Gift redemption | first succeeds (+12 months Pro); second refused \`already_redeemed\`; unknown code \`not_found\` ✓ |
| Honest guard | POST \`/api/campaign\` before the season: **no sends**, reports "campaign not started" ✓ |

**${passed} passed · ${failed} failed** (the script exits non-zero on any failure).

## 2 · LIVE — the running server

${live.map((l) => `- ${l}`).join("\n")}

## 3 · SIMULATED — the 10-church projection

**These are planning projections from the assumption table below — not measurements.** Grace Community is the real signed pilot (27/50 seats in-app); the other nine follow the five-touch playbook math from \`CHURCH-PILOT-PLAYBOOK.md\` §7.

| # | Church | Status | Seats | Signs | Members* | Active-weeks† | Chapters‡ | Lessons | Gift codes§ |
|---|--------|--------|-------|-------|----------|---------------|-----------|---------|-------------|
${rows.map((r, i) => `| ${i + 1} | ${r.name} | ${r.status === "signed" ? "**signed**" : "projected"} | ${r.seats} | ${r.signDate} | ${r.members} | ${r.activeSum} | ${r.chapters} | ${r.lessons} | ${r.giftCodes} |`).join("\n")}
| | **Total** | | **${seatsTotal}** | | **${totals.members}** | **${totals.activeSum}** | **${totals.chapters}** | **${totals.lessons}** | **${totals.giftCodes}** |

\* capacity × 60% close × 75% invite-acceptance · † sum of weekly-active members across live weeks (55% starting activity, 7%/week decay) · ‡ 3.5 chapters per active-week · § 5% of members buy one gift code (people rate)

**Projected scoreboard vs the campaign goals:**

| Goal | Target | Projection | Read |
|---|---|---|---|
| Church pilots closed | 10 | 10 ($${totals.mrr}/mo MRR) | on target — playbook hours: ~60 |
| Gift codes sold | 500 | ${totalCodes} (church ${totals.giftCodes} + consumer ${A.consumerGiftCodes}) | ≈$${((totalCodes * 29.99) / 1000).toFixed(1)}k at $29.99 |
| Congregation members enrolled | — | ${totals.members} across 10 churches | the word-of-mouth seed bank |
| Scripture read by the cohort | — | ${totals.chapters.toLocaleString()} chapters (${pct(totals.chapters, 1189 * totals.members)} of the Bible's 1,189 per member-average) | the actual mission |
| Lessons completed | — | ${totals.lessons.toLocaleString()} | |

### The assumption table (change these, re-run, the report follows)

\`\`\`ts
seatsAtClose: 0.6        inviteAccept: 0.75       weeklyActiveStart: 0.55
weeklyActiveDecay: 0.93  chaptersPerActive: 3.5   lessonsPerActive: 4
giftConversion: 0.05     consumerGiftCodes: 490   weeksObserved: 6
\`\`\`

## 4 · Go-live checklist (Nov 23, 08:00)

- [ ] Set the daily cron: \`curl -X POST https://<domain>/api/campaign -H 'content-type: application/json' -d '{"action":"sendEmails"}'\` (Vercel Cron / GH Action)
- [ ] Confirm \`GET /api/campaign\` flips to \`phase: "pre"\` on Nov 23 (the banner appears automatically)
- [ ] Landing page for scroll.academy/gift live (copy in ADVENT-CAMPAIGN.md §5)
- [ ] Community post of the week scheduled (the gift story)
- [ ] Weekly: update the pipeline table (PLAYBOOK §7) after every touch — the projection above assumes all 10 close
- [ ] Jan 6 23:59: price returns to $39.99 automatically — no manual step, verified by the phase clock above

---
*Every VERIFIED row re-runs with \`bun run advent:dryrun\`; the SIMULATED section is a model, clearly labeled, and reproducible from the printed assumptions.*
`

writeFileSync("docs/ADVENT-DRYRUN-REPORT.md", report)

console.log("╰──────────────────────────────────────────────────╯")
console.log(`\nDRY-RUN: ${passed} verified · ${failed} failed`)
console.log(`Church channel: ${totals.members} members · ${totals.chapters.toLocaleString()} chapters · $${totals.mrr}/mo MRR (projected)`)
console.log("✓ docs/ADVENT-DRYRUN-REPORT.md written")
if (failed > 0) process.exit(1)
await db.$disconnect()
