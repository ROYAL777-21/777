# Scroll Academy — the Road to $1M/Month

> *"The plans of the diligent lead to profit as surely as haste leads to poverty." — Proverbs 21:5 (NIV)*
>
> Companion doc: [`ENGINE.md`](./ENGINE.md) (the 1,161-variable intelligence engine) · [`SCALE.md`](./SCALE.md) (600k-user architecture) · [`SECURITY.md`](./SECURITY.md)

**Goal:** $1,000,000/month revenue at 600,000 monthly active users — reached the only way that compounds: a product people finish their day to keep studying, priced at the moment of peak value, sold through channels that cost less than they return.

---

## 1 · Where revenue comes from today (shipped in this app)

| # | Stream | Mechanics | Status |
|---|---|---|---|
| 1 | **Scroll Pro — monthly $12.99** | Hearts unlimited, 2× XP weekends, streak repair, advanced stats | ✅ Live (paywall, entitlements server-enforced) |
| 2 | **Scroll Pro — annual $59.99** | "62% OFF / $4.99/mo" anchor, best-value badge | ✅ Live |
| 3 | **Scroll Pro — lifetime $149** | Founding price ($299 anchor), future courses included | ✅ Live |
| 4 | **7-day free trial** | Full entitlements, trial state machine, pro-welcome journey | ✅ Live |
| 5 | **Exit downsell** | 50% off first 3 months on paywall dismissal | ✅ Live |
| 6 | **Win-back journey** | Day 1·3·7 after cancel, 50% comeback offer | ✅ Live (email suite) |
| 7 | **Referral program** | Give-a-month-get-a-month + gem ladder (1/3/5/10 joins) | ✅ Live (server-verified, red-team hardened) |
| 8 | **Church plans (B2B)** | ≤50 seats $99/mo · ≤250 seats $299/mo · networks $1,999/mo — admin dashboard (cohort progress, verse coverage, streaks, seat management) | ✅ **Live in-app** (pilot org seeded: Grace Community, 27/50 seats, `src/lib/church.ts` + `/api/church` + `ChurchDashboard.tsx`) |
| 9 | **Gift subscriptions** | Order bump at checkout: "Gift a year — $39.99" (reg $59.99), one-time crypto-random codes, race-proof redemption | ✅ **Live in-app** (`src/lib/gift.ts` + `/api/gift` + the checkout step in `PaywallModal.tsx`) |
| 10 | **Personalized offer timing** | 1,161-variable engine decides WHO sees WHICH offer WHEN (10 Thompson-sampling experiments) | ✅ Live |

The gem economy, streak freezes, heart refills and boosts are **earned, not sold** — deliberately. Selling them would generate ~$0.30 ARPU at the cost of the trust that powers the $5–8 subscription ARPU. The shop exists to make the Pro entitlements feel valuable, not to be the business.

## 2 · The math to $1M (the Money Model, applied)

Hormozi's *Money Models* core equation: **Profit = (LTV − CAC) × volume of customers acquired**. Everything below is that equation, filled in with our numbers.

### Phase checkpoints

**Phase 1 — month 6: ~$150k/mo**

| Stream | Count | Price | MRR |
|---|---|---|---|
| Pro annual | 9,000 | $59.99/yr | $44,992 |
| Pro monthly | 4,000 | $12.99/mo | $51,960 |
| Church plans (blended) | 350 | ~$119/mo | $41,650 |
| Lifetime book (36-mo amortized) | 3,600 sold | $149 | $14,900 |
| **Total** | | | **$153,502** |

**Phase 2 — month 12: ~$510k/mo**

| Stream | Count | Price | MRR |
|---|---|---|---|
| Pro annual | 34,000 | $59.99/yr | $169,972 |
| Pro monthly | 9,000 | $12.99/mo | $116,910 |
| Church plans (blended) | 1,500 | ~$126/mo | $189,000 |
| Lifetime book | 8,400 sold | $149 | $34,767 |
| **Total** | | | **$510,648** |

**Phase 3 — steady state: $1.30M/mo (goal + headroom)**

| Stream | Count | Price | MRR |
|---|---|---|---|
| Pro annual (B2C) | 72,000 | $59.99/yr | $359,940 |
| Pro monthly (B2C) | 15,000 | $12.99/mo | $194,850 |
| Lifetime book | 14,400 sold | $149 | $59,600 |
| Church ≤50 seats | 4,200 | $99/mo | $415,800 |
| Church+ ≤250 seats | 700 | $299/mo | $209,300 |
| Diocesan/network 1,000+ seats | 25 | $1,999/mo | $49,975 |
| Gift subscriptions (seasonal) | 2,000 | $39.99/yr | $6,665 |
| **Total** | | | **$1,296,130** |

### Why the mix looks like this

- **B2B is 52% of Phase-3 revenue.** 87,000 B2C subs is 14.5% of 600k MAU — above the Duolingo-class 3–8% band. Churches are the honest path to the gap: ~4,925 paying churches ≈ **1.2% of US churches alone** (~350,000). A church buys 30–200 seats at once; a consumer buys one.
- **Annual-dominant B2C.** Annual prepays kill cash-flow churn (Hormozi: recurring beats one-time, and *committed* recurring beats cancellable). Our paywall already pushes annual with the 62%-off anchor.
- **Lifetime as founding scarcity, not a product line.** It caps at the founding cohort; its amortized book is only ~4.6% of revenue. Its real job is price anchoring ($299 struck through) and cash up front.

### Unit economics (the guardrails)

| Metric | B2C organic | B2C paid ads | Church direct sales |
|---|---|---|---|
| Blended ARPU | $6.69/mo | $6.69/mo | $137/mo |
| Avg lifetime | 9 mo | 9 mo | 24 mo |
| LTV | $60.23 | $60.23 | $3,290 |
| CAC | $4.50 | $28.00 | $600 |
| **LTV:CAC** | **13.4 : 1** | **2.15 : 1** | **5.5 : 1** |

Read: **paid ads are not the engine** (2.15:1 is survival, not growth). Referral + content (organic, 13.4:1) and church sales (5.5:1 with a $3.3k LTV) are. This is why the referral program ships in-app, server-verified, in this build.

---

## 3 · Hormozi frameworks → what's built and what's next

### A · $100M Offers — the Grand Slam Offer ✅ built

The value equation: **Dream outcome × Likelihood ÷ (Time × Effort)**. Our offer — "The Scripture Mastery System":

| Element | Implementation | Where |
|---|---|---|
| Dream outcome | "Read John 1:1 in Greek. Dissect any argument. Defend the faith." | Paywall hooks (context-matched, 6 contexts) |
| Likelihood ↑ | 18 courses · 611 lessons · 4,310 challenges · streaks that build the habit | Value stack, $849+ anchored |
| Time ↓ | "5 minutes a day" · lesson length shown before start | Value stack + lesson UI |
| Effort ↓ | Winding path, one tap to continue, hearts protect beginners | Learn path |
| Bonuses | 20 stories, Greek & Hebrew readers, deep practice, church-history units | Bonus stack |
| Guarantee | 30-day "Grow or it's free" | GUARANTEE in `offer.ts` |
| Scarcity | Founding cohort countdown + spots-left (real counters, not fake) | URGENCY |
| Urgency | Contextual (hearts-out, lesson-end high, onboarding) | Engine `decide()` |

### B · Money Models — the retention ladder (this build's additions)

1. **Annual prepay** is the default-recommended plan (62% anchor) — cash now, churn later.
2. **Order bump — ✅ shipped:** "Gift a year to a friend — $39.99" checkbox at the new checkout step (Christmas/confirmation/baptism seasonality copy rotates with the church calendar; Phase-3 line 7). Opt-in only — never pre-checked.
3. **Win-back** is a full journey (day 1·3·7, 50% offer) — recovering a churned sub at 50% is $6.50/mo LTV-positive vs CAC $4.50 organic.
4. **Banked months** (new): referral Pro months are banked and applied at renewal — the referrer *feels* the credit, and applying it re-opens the payment relationship.
5. **Price ladder over time:** founding → standard is pre-announced; existing members keep their price forever (trust compounding).

### C · Leads — the four lead magnets, mapped

| Hormozi magnet | Ours | Conversion path |
|---|---|---|
| Free tool | The app itself: 18 courses, full first units free | Paywall at lesson-end high / hearts-out |
| Free info | Verse-of-the-day + daily quiz email (journey suite) | Weekly digest → Pro offer day 2·9·21 |
| Free community | Community feed + leagues + friends | Social glue → retention (the engine's `social.*` features) |
| Warm outreach | Church pilot program (below) | Demo → org plan |

The referral program is the **flywheel between magnets**: every new user arrives with a mentor (the referrer), which raises D7 retention (the engine's `referral.*` features now track joins, conversion rate, advocacy). Referred users convert ~2–3× cold users in category norms; our `referral.convert_rate` feature measures exactly this.

### D · The plays (12) — status board

| # | Play | Status |
|---|---|---|
| 1 | Grand Slam Offer (value stack + guarantee) | ✅ shipped |
| 2 | Three-tier price anchoring | ✅ shipped |
| 3 | Free trial → paid state machine | ✅ shipped |
| 4 | Exit downsell | ✅ shipped |
| 5 | Win-back sequence | ✅ shipped |
| 6 | Referral loop (double-sided) | ✅ **this build** |
| 7 | Personalized offer timing (engine) | ✅ shipped |
| 8 | Church/B2B plans | ✅ **shipped this build** (pilot dashboard live in-app; pricing above; pilot 10 churches next) |
| 9 | Gift subscriptions | ✅ **shipped this build** (order bump at the checkout step) |
| 10 | Content engine (verse-of-day, social clips) | 🟡 email suite live; short-form pipeline next |
| 11 | Lifetime founding cohort | ✅ live (caps after cohort) |
| 12 | Price increase to standard | 🔜 after founding cohort fills |

---

## 4 · The referral flywheel (new in this build) — why it's the growth engine

```
user loves a lesson ──► shares invite link (engine times the ask at session-end high)
   friend joins ──► +100 gems friend · +50 gems user · engine logs referral.join
   friend hits Pro ──► user banks a free month · friend locks founding price
   banked month applied ──► renewal moment re-opens the payment relationship
   milestones 1/3/5/10 ──► gems → freezes → Pro months → Evangelist badge
```

Server-verified rewards (the client can never mint gems or months), rate-capped, fully ledgered, and wired into the engine as 8 new `referral.*` features (617 total). The milestone ladder is a Hormozi-style escalating incentive — each rung is near enough to taste (1→3→5→10) that the next share is always "one friend away".

## 5 · Non-negotiables (what we will NOT do)

- **No dark patterns.** Scarcity counters are real; cancel is one tap; prices shown before the trial ends.
- **No selling grace.** Gems, hearts and streaks are earned by study, never purchased with cash — the moment salvation-adjacent mechanics are paywalled, we lose the trust the whole model stands on (and the doctrinal audit the app carries).
- **No fake testimonials, ever.** The Statement of Faith standard applies to marketing copy too.
- **Paid ads only after organic 3:1.** The unit economics above make premature paid acquisition value-destroying.

## 6 · 90-day execution order

1. **Weeks 1–2: ✅ done** — shipped this build (referral + Logic course). Instrument `referral.convert_rate` and paywall-hook AUC as the two north-star metrics.
2. **Weeks 3–6: ✅ dashboard shipped** — church pilot: the admin dashboard is live in-app (cohort progress, verse coverage, streaks, seat management, the shepherding list). Next: hand-sell the 10 pilot churches at $99/mo, 50 seats each — the product side is done.
3. **Weeks 7–10: ✅ order bump shipped** — gift-subscription order bump + seasonal copy are live at the checkout step. Next: the Advent/Christmas campaign itself, and re-engaging lapsed founders with the founding-price-forever lock.
4. **Weeks 11–13:** review engine AUC, referral K-factor, church pipeline; decide paid-ads pilot only if organic LTV:CAC holds above 10:1.

**The one-line strategy:** retention is the product, the engine is the salesperson, churches are the missing half of the market, and the referral loop is the bridge between them.
