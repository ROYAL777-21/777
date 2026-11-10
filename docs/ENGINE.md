# The Scribe's Ledger — Retention, Loyalty & Gamification Intelligence Engine

> *"The heart of the prudent getteth knowledge; and the ear of the wise seeketh knowledge." — Proverbs 18:15 (KJV)*

A closed-loop personalization engine built into Scroll Academy: **signal → feature → score → decision → action → outcome → learning**. It exists for one goal — **revenue** — and it pursues that goal the only way that compounds: by making the app worth returning to every day, then asking for the sale at the moment of peak perceived value.

- **617 retention & loyalty features** (28 families) — see `src/lib/engine/features.ts`
- **544 gamification variables** (18 domains) — see `src/lib/engine/gameVars.ts`
- Full machine-readable listing: regenerate with `bun run engine:report`
- Security audit: [`docs/SECURITY.md`](./SECURITY.md) · Algorithm test suite: `bun scripts/engine-tests.ts` (91 checks)

---

## 1 · Architecture

```
┌─────────────── SIGNALS ───────────────┐
│  API routes (server taps)             │  every lesson, story, read, purchase,
│  Client SDK (UI events)               │  paywall interaction, notification open
│  DB state (progress, quests, leagues) │
└──────────────┬────────────────────────┘
               ▼  EngineEvent table (validated tap stream)
┌─────────────── FEATURES ──────────────┐
│  computeFeatures(userId, asOf?)       │  617 signals, point-in-time capable
│  27 families: recency, frequency,     │
│  streak, mastery, chronotype, social, │
│  monetization, wellbeing, faith …     │
└──────────────┬────────────────────────┘
               ▼
┌─────────────── SCORES ────────────────┐
│  churnRisk (logistic, learned)        │  engagement · loyalty (RFM+T+A, 4 tiers)
│  wtp · ltv90 · virality               │  burnoutRisk · priceSensitivity
│  bestHour · bestChannel · segments    │  habitStage (sparking→identity)
└──────────────┬────────────────────────┘
               ▼
┌─────────────── CONFIG ────────────────┐
│  resolveGameConfig()                  │  544 variables resolved per user:
│  defaults → rule overrides →          │  difficulty targets, XP catch-up,
│  bandit arms → trained adaptive       │  quest mix, paywall timing/depth…
└──────────────┬────────────────────────┘
               ▼
┌─────────────── DECISIONS ─────────────┐
│  decide() — next-best-actions with    │
│  expected utility + reasons           │
│  caps · cooldowns · quiet hours       │
│  → EngineIntervention ledger          │
└──────────────┬────────────────────────┘
               ▼
┌─────────────── ACTIONS ───────────────┐
│  nudges (vetted copy library only)    │  quest plans · XP catch-up
│  paywall invites & offer shape        │  verse-of-day timing/translation
└──────────────┬────────────────────────┘
               ▼  outcomes resolve interventions
┌─────────────── LEARNING ──────────────┐
│  online: Thompson-sampling bandits    │
│  nightly: SGD refit of churn model    │  `bun run engine:train`
│  adaptive config (best-hour EWMA,     │
│  quest-mix momentum, fatigue backoff) │
└───────────────────────────────────────┘
```

## 2 · The models

| Score | What it predicts | How |
|---|---|---|
| `churnRisk` | P(inactive within 7 days) | Logistic over ~30 normalized features; priors hand-set from retention science; refit nightly by SGD with **sign guards** (learned weights may strengthen but never flip a documented sign) |
| `engagement` | 0–1 breadth × depth × consistency × autonomy | weighted composite |
| `loyalty` | 0–100 RFM+T+A → tiers **Parchment → Scroll → Codex → Library** | recency, frequency, monetary, tenure, advocacy |
| `wtp` | willingness-to-pay 0–1 | logistic over monetization behavior + composite blend |
| `ltv90` | projected 90-day value ($) | plan value × probability + engaged-free-user option value |
| `burnoutRisk` | 0–1 overuse/frustration trend | protects the human — and therefore the LTV |
| `priceSensitivity` / `discountAffinity` | offer-depth posture | dismissal/winback behavior |
| `bestHour` / `bestChannel` | timing & routing | activity-hour histogram / open rates |

**Math hardening (verified by the 91-check adversarial suite):** sigmoid is overflow-safe; every ratio divides by `max(1, d)`; every feature passes a finite-number guard; all-zero / all-extreme / all-NaN feature sets produce valid, bounded scores; boundary timestamps (epoch, 2100) are safe.

## 3 · The decision layer

Every candidate action carries **expected utility, priority, a human-readable reason** (shown verbatim in the user's Insights panel), and guardrails:

- daily/weekly caps per kind and channel; global notification cap
- quiet hours 21:00–08:00 local (streak-risk may bypass — it's the one honest exception)
- cooldowns between repeats of a kind
- paywall invites: suppressed for Pro members, weekly cap 2, cooldown 3–12 days (price-sensitivity aware), **never shown to users who turned OFF personalized offers** (trust toggle in Insights)
- **rest_encourage outranks extraction when burnout risk is high** — long-run LTV beats short-run extraction
- copy is **never composed** — every message is selected from the hand-reviewed library in `engine/copy.ts` (three tones: growth / identity / stewardship; doctrinally reviewed, no guilt, no fear, no false scarcity — "let your yea be yea")

Ten action kinds: `study_nudge · review_quest · streak_protect · celebrate · social_connect · goal_adjust · paywall_invite · winback_offer · rest_encourage · course_suggest`.

## 4 · The experiments (Thompson sampling)

| Context | Arms |
|---|---|
| `paywall_hook` | onboarding · hearts · shop · profile · lessonEnd · general |
| `paywall_anchor` | seminary · books · tutor |
| `paywall_headline` / `paywall_cta` | A · B · C · D |
| `nudge_tone` | growth · identity · stewardship |
| `quest_mix` | lesson · review · reading · social · balanced |
| `reward_boost` | none · xp_surge · gem_rain · weekend_double |
| `winback_depth` | 50% · 40% · 30% |
| `digest_day` | monday · sunday |
| `session_end_hook` | A · B · C |

Each arm keeps a Beta(α, β) posterior in `EngineBandit` (Marsaglia–Tsang gamma sampling, finite-guarded). Sampling = one Beta draw per arm, argmax wins (with ε-exploration). Outcomes are recorded online; stale posteriors decay after 90 days.

## 5 · Self-improvement

`bun run engine:train` (or `POST /api/engine/train`):

1. **Rebuilds honest training sets** — features recomputed *as of* each of the last 45 day-ends; churn label = inactive in the following 7 days (point-in-time reconstruction, no leakage).
2. **SGD logistic refit** from the priors (L2, lr 0.05, 40 epochs, weight-clip ±8, sign guards). Adopted only if holdout AUC doesn't degrade; otherwise priors stay and the report says so.
3. **Conversion model** from intervention outcomes.
4. **Adaptive config**: best-hour EWMA, notification fatigue backoff, quest-mix momentum toward completed families.
5. **Bandit decay** for arms older than 90 days.

Cold start is fully supported: priors + rules carry the app from minute one; the models take over as history accumulates (the trainer reports `samples` and refuses to adopt below minimums).

## 6 · Where the engine touches the app

| Surface | Effect |
|---|---|
| XP award paths (lesson completion) | catch-up multiplier 1.0–1.25× for returning learners (never stacks with Double XP) |
| Notification & email journeys (`journeys.ts`) | churn-escalated re-engagement (3d→2d at high risk), golden-hour nudges, tone from the bandit |
| Paywall (`PaywallModal`) | hook selection, plan highlight, urgency window, winback depth, dwell tracking, downsell |
| Profile → **Your insights** | loyalty tier, study rhythm, habit health, NBAs with "why", personalized-offers trust toggle |
| Bible reader | verse-of-day rendering + **red-letter edition** (2,082 verses of the words of God and Christ, verified against the KJV) |
| `ScrollApp` | app_open + view tracking; surfaces one in-app NBA at a time (fatigue guardrail) |

## 7 · APIs

- `POST /api/engine/event` — client tap stream: `{ events: [{ type, payload }] }` (validated against the telemetry schema v11: type contracts, payload specs, ≤2 KB, batch ≤50, daily ≤5000 — see [`TELEMETRY-SCHEMA.md`](./TELEMETRY-SCHEMA.md))
- `GET /api/engine/schema` — the telemetry schema: version, fingerprint (`3026954531`), event contracts, census; `?full=1` for prop specs
- `GET /api/engine/state` — personalization state (10-min snapshot TTL; `?force=1`)
- `POST /api/engine/train` — run the self-improvement loop
- `GET /api/engine/report` — registry counts, scores, model metrics, bandit table, intervention funnel

## 8 · Revenue philosophy

Retention research and the app's own monetization principles agree on one thing: **the reliable path to revenue is value delivered, then trusted**. Concretely, the engine:

1. **Builds the habit first** (streaks, quests, review timing tuned per user) — D1/D7/D30 is the top of the revenue funnel.
2. **Earns loyalty visibly** (RFM tiers, transparent insights, the personalized-offers kill switch) — trust converts and retains.
3. **Asks at the peak moment** (paywall invite at high engagement × high WTP, after proven lessons, capped at 2/week) — with price fairness capped at ±15% personalization spread.
4. **Protects the asset** (burnout detection, rest nudges, Sunday grace, honest copy) — a churned user is worth $0; a rested one compounds.
5. **Learns relentlessly** (bandits + nightly refits) — every nudge and offer gets smarter from its own outcomes.

## 9 · Doctrine & ethics guardrails

- All engine copy comes from a reviewed library (grace-centered, Scripture-honoring tone; no fear/guilt tactics).
- Complaint-rate and overuse guardrails auto-revert aggressive experiments.
- No dark patterns: scarcity and urgency in the offer are the app's honest founding-cohort framing, never fabricated per-user pressure; refunds remain one tap.
- Hard rules in `gameVars.ts`/`gameConfig.ts` are non-overridable (guilt ban, fear ban, false-scarcity ban, burnout-outranks-revenue).
- Everything runs locally — no data leaves the device.
