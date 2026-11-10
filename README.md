<div align="center">

📜

# Scroll Academy

**“Thy word is a lamp unto my feet, and a light unto my path.” — Psalm 119:105 (KJV)**

A Duolingo-style journey through Scripture: 19 courses, five-minute lessons,
the whole King James Bible with the red-letter words of Christ, streaks,
leagues, stories — and a parting-of-the-sea splash to open it all.

[![CI](https://github.com/scroll-academy/scroll-academy/actions/workflows/ci.yml/badge.svg)](./.github/workflows/ci.yml)
[![License: Proprietary](https://img.shields.io/badge/license-proprietary-blue)](./LICENSE)
[![Scripture: KJV](https://img.shields.io/badge/scripture-KJV%20·%20public%20domain-gold)](./docs/SCRIPTURE-DESIGN.md)

</div>

---

## What's inside

- **The learn path** — a winding trail of lessons, chests and trophies. The road ahead
  is a trail of footprints; the road walked is a solid ribbon in the unit's color.
- **19 courses** — Greek, Hebrew, Bible survey, manuscripts, apologetics, logic (I & II),
  worldviews, ethics, metaphysics, existence of God, denominations (×8), study methods,
  stories, deep practice expansions.
- **The Bible reader** — all 66 books (KJV), reading plans, verse marks, and the
  red-letter edition: 2,082 verses of Christ's words and direct LORD speech, stored as
  character offsets against the exact KJV text and verified by `bun run redletter:verify`.
- **Gamification** — XP, streaks (with repair), hearts, gems, daily quests, leagues,
  achievements, chests, an avatar builder, and a 617-feature personalization engine
  (`src/lib/engine/`) that decides the next best action.
- **Community & growth** — posts, friends, a growth hub with habit plans.
- **Scroll Pro** — monthly ($5.99, no trial) / annual ($39.99, 7-day free trial),
  gift subscriptions, church plans (B2B pilot), and a double-sided referral program.
- **The splash** — Remotion composition (`src/remotion/`) that parts the sea and hands
  over to onboarding; render it to MP4 for the app stores with one command.

## The stack — three languages, one product

| Piece | Tech | Role |
| --- | --- | --- |
| `app` (this repo root) | Next.js 16 · React 19 · Tailwind 4 · Prisma/SQLite · Zustand · framer-motion · Remotion | The product itself |
| `src-tauri/` | **Rust** (Tauri 2) | Desktop shell — boots the standalone server as a sidecar, native churn/loyalty/XP ledger (`ledger.rs`, parity-tested against the TS engine), OS notifications & vibration |
| `services-csharp/ScrollBridge/` | **C#** (.NET 8 Worker) | Scale-out worker — idempotent payment entitlements, referral conversions, push dispatch with quiet hours and per-user caps (~18 xUnit tests) |

The web app runs standalone; the Rust and C# services are the desktop and
production-scale paths and are wired into CI.

## Quickstart

```bash
bun install
cp .env.example .env
mkdir -p db
bunx prisma db push
bun run db:seed
bun run dev            # → http://localhost:3000
```

First visit plays the parting-of-the-sea splash once, then the sign in / sign up flow,
then onboarding. `demo staff` shortcut: sign in as `pastor@scrollthebible.org` (any
password in the mock) to see the Staff admin → Churches dashboard.

### Handy scripts

| Command | What it does |
| --- | --- |
| `bun run dev` / `build` / `start` | develop / build / run the standalone server |
| `bun run lint` | ESLint over the whole app |
| `bun run splash:studio` | open the Remotion timeline for the splash |
| `bun run splash:render` | render the splash to `out/parting-sea.mp4` (stores, ads) |
| `bun run db:seed` | reseed the demo database |
| `bun run engine:test` | engine parity + behavior tests |
| `bun run redletter:verify` | verify all 2,082 red-letter offsets against KJV text |
| `bun run redteam` | dependency audit, secret scan, no-eval, headers check |
| `bun run desktop:prepare && cargo tauri dev` | run the Rust desktop shell |

Environment: copy `.env.example` → `.env` (`DATABASE_URL`, `NEXT_PUBLIC_APP_URL`,
Stripe keys when payments go live). Full architecture: [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md).

```text
┌──────────────────────────── browser ────────────────────────────┐
│  Next.js 16 app  ·  Prisma (SQLite)  ·  engine (TS, 617 feats)  │
└───────┬──────────────────────────────────────────────┬──────────┘
        │ desktop build (sidecar)                      │ scale-out (production)
┌───────▼──────────────┐                    ┌───────────▼──────────────┐
│  Rust · Tauri shell   │                    │  C# · ScrollBridge worker │
│  ledger parity, OS    │                    │  entitlements, referrals, │
│  notifications        │                    │  push (quiet hours)       │
└───────────────────────┘                    └──────────────────────────┘
```

## Scripture & tone — the two non-negotiables

1. **Scripture is exact.** KJV only (public domain), quoted letter-perfect with its
   reference, verified by script. Interface microcopy lives in `src/lib/scripture.ts`
   under restraint rules: never on money surfaces, never on error states, one verse per
   surface. Details: [docs/SCRIPTURE-DESIGN.md](./docs/SCRIPTURE-DESIGN.md).
2. **We don't sound like mercenaries.** No fake countdowns, no invented ratings, no
   exit interrupts, no shouting CTAs. Pricing is stated in plain language, cancellation
   is two taps, and the free academy is free forever. Sales frameworks live in the B2B
   pilot materials ([docs/](./docs)) — never in the member UI.

## Security

Conservative headers (`next.config.ts`), transactional reward grants with unique-keyed
milestones, PBKDF2 password hashing even in the demo auth, body-size caps, no
client-minted entitlements, and a red-team script wired into CI. Report privately via
GitHub Security Advisories — see [SECURITY.md](./SECURITY.md) and [docs/SECURITY.md](./docs/SECURITY.md).

## Contributing & license

[CONTRIBUTING.md](./CONTRIBUTING.md) has the setup, conventions and the PR checklist.
Proprietary — all rights reserved; see [LICENSE](./LICENSE). The Scripture text is
public domain. Built with [Remotion](https://remotion.dev) (check its license for your
company size).
