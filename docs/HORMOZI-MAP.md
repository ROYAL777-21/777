# The Hormozi Application Map — every concept, where it lives

> The question: *are the three books ($100M Offers, Leads, Models), the twelve playbooks, and the ask-hormozi lessons actually applied throughout the company?* This is the audit. Status legend: ✅ shipped in code · 🟡 partially shipped · 🔴 not yet.

---

## 1 · $100M OFFERS — the Grand Slam Offer

**The value equation: Dream Outcome × Perceived Likelihood ÷ (Time Delay × Effort & Sacrifice)**

| Concept | Where it lives | Status |
|---|---|---|
| Value equation (all 4 levers) | `src/lib/offer.ts` — HOOKS per context (dream), VALUE_STACK likelihood proof, "5 minutes a day" time, hearts/one-tap effort | ✅ |
| Name the offer | `OFFER_NAME = "The Scripture Mastery System"` | ✅ |
| Value stacking w/ anchors | `VALUE_STACK` (6 items, $849+ total) + `BONUS_STACK` (2 bonuses) — every line carries its struck-through anchor | ✅ |
| Bonuses named & stacked | Greek Alphabet Speed Drills ($29) + Prayer Journal Prompts ($19), revealed after the anchor total | ✅ |
| Guarantees (risk reversal) | `GUARANTEE` — 30-day "Grow or it's free", bonuses stay yours | ✅ |
| Scarcity (real) | `URGENCY` — founding cohort 387/500 claimed, live counter | ✅ |
| Urgency (honest deadlines) | 72h founding-deadline countdown, persisted per browser; engine-personalized window | ✅ |
| Price anchoring (decoy→target) | Monthly $5.99 anchor → Annual $39.99 (44% off, $3.33/mo) — `PLANS` | ✅ |
| Payment plans / options | Two plans + exit downsell + gift bump — every option value-positive | ✅ |
| Trim the offer, don't discount | Downsell is a *different, smaller* offer ($2.99 first month), never "same thing cheaper" | ✅ |
| Who/what transformation | "Read John 1:1 in Greek. Dissect any argument." — outcome language everywhere | ✅ |
| CTA above the fold | Sticky bottom CTA on the paywall, one primary action per screen | ✅ |
| Sales page flow | Paywall = hook → urgency → stack → plans → guarantee → proof → FAQ → fine print | ✅ |
| Testimonial proximity | `SOCIAL_PROOF` — two long-streak quotes with level + streak details | ✅ |
| Fine print that builds trust | Auto-renew + cancel-anytime + Help Center link on every checkout (`SUBSCRIPTION_TERMS`) | ✅ |

## 2 · $100M LEADS — the four lead magnets + capture

| Concept | Ours | Status |
|---|---|---|
| Lead magnet #1 — free tool | The app itself: 18 courses with free first units | ✅ |
| Lead magnet #2 — free info | Verse-of-the-day + daily-quiz emails (`journeys.ts`) | ✅ |
| Lead magnet #3 — free community | Community feed + leagues + friends (social glue) | ✅ |
| Lead magnet #4 — warm outreach | Church pilot program (hand-sold — `CHURCH-PILOT-PLAYBOOK.md`) | ✅ |
| The core offer after the magnet | Pro offer timed at peak value: lesson-end high, hearts-out, shop intent (engine `decide()`) | ✅ |
| Halo offer (high-price anchor) | Church network tier $1,999/mo anchors the $99 tier | ✅ |
| CTAs on every surface | Learn path, profile card, sidebar, lesson end, shop, banner | ✅ |
| Lead capture | Email opt-in + granular prefs (10 notification categories, 9 email journeys) | ✅ |
| Nurture sequence | Welcome d0·1·3·7 → Pro offer d2·9·21 (`journeys.ts`) | ✅ |
| Follow-up assets | 90-second demo video (church), campaign emails (Advent), win-back d1·3·7 | 🟡 video to record |
| Paid ads | Gated: only after organic LTV:CAC ≥ 10:1 (REVENUE.md §5) | 🔴 deliberately |
| Short-form content engine | Verse clips pipeline | 🔴 next 90 days |
| No-brainer offer (ask-hormozi staple) | Founding rate + guarantee + bonuses + cancel-anytime = the "yes" stack | ✅ |
| Sales conversations > funnels (B2B) | 10-church hand-sell: 5-touch sequence, scripts, objection table | ✅ playbook ready |

## 3 · $100M MODELS — pricing, upsells, retention ladder

**Profit = (LTV − CAC) × volume** — REVENUE.md §2 is this equation with our numbers ($1.30M/mo steady state).

| Concept | Ours | Status |
|---|---|---|
| Recurring revenue (MRR) | Two subscription plans — both auto-renewing, both cancellable | ✅ |
| Committed > cancellable | Annual pushed as default (44% off); trial converts to annual billing | ✅ |
| Upsell | Monthly → annual upgrade path; engine highlights annual for low price-sensitivity | ✅ |
| Downsell | Exit save: $2.99 first month (shown once/week max) | ✅ |
| Order bump | **Gift a year — $29.99** at every checkout; opt-in only, never pre-checked | ✅ |
| Continuity / subscription state machine | Trial → paid → cancel → win-back, server-enforced (`/api/pro`) | ✅ |
| Win-back | Day 1·3·7 email journey, 50% comeback offer | ✅ |
| Price ladder over time | Founding cohort → standard price (pre-announced; existing keep their rate) | ✅ policy set |
| Cash-flow now (annual prepay) | Annual default + gift year (prepaid) + founding cohort | ✅ |
| Banked value | Referral months banked & applied at renewal — re-opens the payment moment | ✅ |
| Guarantees as pricing tool | 30-day grow-or-free; gifts never expire + 30-day refund on landing page | ✅ |
| B2B as the growth half | Church tiers $99/$299/$1,999 — 52% of Phase-3 revenue | ✅ dashboard live, pilots hand-selling |
| Upsell after value delivered | Lesson-end paywall moments; post-milestone offers (engine) | ✅ |
| Unit-economics discipline | LTV:CAC tracked per channel (13.4:1 organic / 5.5:1 church) — ads gated | ✅ |

## 4 · The twelve plays — status board

| # | Play | Status |
|---|---|---|
| 1 | Grand Slam Offer (stack + guarantee) | ✅ |
| 2 | Price anchoring (two-tier + decoy math) | ✅ |
| 3 | Free trial → paid state machine | ✅ |
| 4 | Exit downsell | ✅ |
| 5 | Win-back sequence | ✅ |
| 6 | Referral loop (double-sided + milestone ladder) | ✅ |
| 7 | Personalized offer timing (1,161-var engine, 10 experiments) | ✅ |
| 8 | Church / B2B plans | ✅ dashboard + API; 10 pilots in hand-sell |
| 9 | Gift subscriptions (bump + gift-only + Advent campaign) | ✅ |
| 10 | Content engine (verse-of-day, social clips) | 🟡 emails live; clips next |
| 11 | Founding-cohort scarcity | ✅ |
| 12 | Price increase to standard | 🔜 after cohort fills (policy pre-announced) |

## 5 · ask-hormozi lessons — the cross-cutting rules

| Lesson | Applied as |
|---|---|
| "Give so much value the sale is obvious" | Free tier = 18 course intros + full Bible reader + leagues; Pro sells the depth |
| CAC/LTV before scaling spend | REVENUE.md unit-economics guardrails; ads gated at 10:1 organic |
| Sales assets beat sales talent | Scripts, terms sheet, demo agenda, objection table — all written down (church playbook) |
| Follow-up is where the money is | 5-touch church sequence; 4-step Advent emails; win-back d1·3·7 — every send idempotent |
| Offer > copy > funnel (in that order) | The engine personalizes *which offer* before any copy variant (bandit chooses hook + plan) |
| Retention is the cheapest growth | Streaks, freezes, hearts-regen, leagues, quests, friends, journeys — the whole app |
| Do things that compound | Annual-default pricing, founding-rate trust lock, referral flywheel, church cohort lock-in |

## 6 · Gaps (honest list)

1. **Short-form content engine (play 10)** — verse-clip pipeline not built; biggest missing lead flow.
2. **Paid acquisition** — intentionally blocked until organic LTV:CAC proves ≥10:1 (that's the discipline, not a gap).
3. **Church pilots** — product side shipped; the 10 hand-sells are human work (playbook written, pipeline table ready).
4. **Real payments** — Stripe scaffold (`/api/stripe/*`) wired for keys; live charges begin when you drop them in.

**Verdict:** Offers ✅ fully applied. Leads ✅ applied on magnets/capture/nurture, content engine pending. Models ✅ applied across the whole ladder — bump, downsell, win-back, banked months, B2B tiers. 10 of 12 plays live in code; the remaining two are sequenced, not forgotten.
