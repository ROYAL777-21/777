# The Advent / Christmas Gift Campaign — Runbook

> *"For unto you is born this day… a Savior"* — Luke 2:11 (KJV)
>
> REVENUE.md §6, weeks 7–10: the order bump shipped; this runs the season around it. **Window: Nov 23, 2026 → Jan 6, 2027 (Epiphany).**

Everything below is driven by one config — `src/lib/campaign.ts` — which powers the in-app banner (`AdventBanner.tsx`), the gift-only checkout (paywall context `"gift"` → `/api/gift` purchase), the email sequence, and the push copy.

---

## 1 · Goals (the honest scoreboard)

| Metric | Target | Where it's measured |
|---|---|---|
| Gift codes sold | **500** (≈ $15.0k at $29.99) | `gift_purchased` events + `GiftCode` rows |
| Gift redeemers activated | **≥60%** within 30 days | `gift_redeemed` events |
| New learners from campaign | **1,000** | referral + campaign attribution (engine) |
| Banner → gift checkout | **≥4%** CTR | `campaign_banner_cta` / `campaign_banner_view` |
| Church pilots closed in-window | **10** (runs in parallel — see the playbook) | pipeline table |

## 2 · The offer

- **A gift year of Scroll Pro at $29.99** (normally $39.99 — the real annual price, honestly anchored).
- One crypto-random code (`SCROLL-XXXX-XXXX`), **never expires**, one-tap redemption, personal note rides along.
- Sold in three places: **the order bump** at every checkout (subscribe flows), **the gift-only checkout** (banner / "Or gift a year"), and the campaign landing page.
- Auto-renew never applies to gifts — one-time purchase, stated in the fine print. (No dark patterns; the trust *is* the funnel.)

## 3 · Timeline & channels

| Phase | Dates | What runs |
|---|---|---|
| **Pre** | Nov 23–28 | Banner in "Advent is coming" tease mode; Black Friday email to the list (Fri Nov 27): "the gift that studies back" |
| **Advent** | Nov 29–Dec 24 | Full banner; email 1 (launch, Nov 29); email 2 (Dec 12); email 3 (Dec 21); pushes Nov 29 / Dec 12 / Dec 21; community post of the week = gift story |
| **Christmas** | Dec 25–Jan 5 | Banner in "twelve days" mode; email 4 (Dec 26); push Dec 26; "still Christmas" framing |
| **Ends** | Jan 6 | Epiphany — price returns to $39.99 automatically (`campaignPhase()` flips to `"ended"`) |

### The email sequence (idempotent, date-gated — `CAMPAIGN_EMAILS`)
1. **Nov 29 · launch** — "Advent begins Sunday — give the gift that studies back"
2. **Dec 12 · twelve** — "13 days to Christmas: the gift that fits every stocking"
3. **Dec 21 · lastcall** — "Four days: the $29.99 gift year ends Jan 6"
4. **Dec 26 · boxing** — "Got gift money? The twelve days are for spending it"

All four respect the email opt-in and the **"Seasonal campaigns"** toggle the user sees in Profile → notifications (journey key `advent_campaign`).

## 4 · The daily automation (one line)

```bash
# daily at 08:00 — Vercel Cron, GitHub Action, or any scheduler:
curl -X POST https://<your-domain>/api/campaign -H 'content-type: application/json' -d '{"action":"sendEmails"}'
```

The route fires every **due + unsent** step — running it twice a day is harmless (one delivery per step, ever, per user). GET `/api/campaign` is the read-only state probe for monitoring.

## 5 · Landing page copy (for scroll.academy/gift)

**Hero:** The gift that studies back — a year of the whole Bible, $29.99.
**Sub:** One code. One tap. Twelve months of Greek, Hebrew, the whole story — 5 minutes a day.
**Stack (reuse `VALUE_STACK` anchors):** 18 courses forever ($497) · audio lessons ($96) · advanced stats ($72) → **$849+ for $29.99.**
**How it works:** Buy → code arrives instantly → they redeem in one tap → the year starts when they're ready.
**Guarantee:** codes never expire; unredeemed codes refunded within 30 days, no questions.
**Urgency (honest):** $29.99 ends Epiphany, Jan 6.

## 6 · In-app placement checklist

- [x] Learn-path banner (`AdventBanner`) — dismissed = hidden until tomorrow, never nagging
- [x] Paywall secondary CTA — "Or gift a year to someone — $29.99 🎁"
- [x] Order bump at every checkout — seasonal copy rotates via `giftSeason()` (Advent/Christmas/Epiphany lines)
- [x] Profile → Gift card — sent-gifts ledger + redeem box
- [x] Engine events: `campaign_banner_view`, `campaign_banner_cta`, `order_bump_toggle`, `gift_purchased`, `gift_redeemed` — all feeding the 10 Thompson-sampling experiments

## 7 · After Epiphany

- Price returns to $39.99 automatically; the bump copy rotates to New-Year framing (`giftSeason()`).
- Review: gift→redeem lag distribution, bump take-rate by plan, banner CTR by phase (engine report: `GET /api/engine/report`).
- Winners get folded into the next seasonal window (confirmation/baptism, graduation — copy already in `giftSeason()`).
