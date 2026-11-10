# Contributing to Scroll Academy

Thanks for helping build a calmer, truer way to learn the Bible.

## Setup

```bash
bun install
bunx prisma generate
bun run dev        # http://localhost:3000
```

The demo database (`db/custom.db`) ships with the repo; reseed any time with
`bun run db:seed` (destructive — uses `db:push`).

## The two non-negotiables (PRs are checked against both)

**1. Scripture is exact.**
- Interface verses come from `src/lib/scripture.ts` (or the existing reader/red-letter
  systems) — never typed inline, never paraphrased, always KJV with the reference.
- Restraint rules: no verse on money surfaces (paywall, checkout, shop, gift), no verse
  on error states, one verse per surface.
- If you touch verse content, run `bun run redletter:verify`.

**2. We don't sound like mercenaries.**
- No fake countdowns, invented ratings, scarcity counters, exit interrupts,
  confirm-shaming, or ALL-CAPS shouting.
- Benefits in plain language; prices with their plain terms; cancellation stays
  two taps. If it would embarrass a pastor reading over your shoulder, rewrite it.

## Conventions

- **Commits**: conventional commits (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`).
- **Branches**: `feat/<short-name>`, `fix/<short-name>` from `main`.
- **Style**: the codebase speaks in comments — say *why*, not what. Keep the
  banner-comment headers when you touch a file's core logic.
- **New API routes**: cap body size, validate the action/body, and keep secrets
  server-side. No client-minted entitlements, ever.

## Before you open the PR

- [ ] `bun run lint` passes
- [ ] `bun run engine:test` passes (if engine or gamification touched)
- [ ] `bun run redletter:verify` passes (if verse content touched)
- [ ] `bun run redteam` passes
- [ ] Copy follows the two non-negotiables
- [ ] No secrets, no `.env` changes, dependencies justified in the description

CI runs the same checks (plus the Rust and C# suites when their paths change).

## Repository layout

See the README's stack table and [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md).
