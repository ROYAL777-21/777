# Architecture

```text
                        ┌────────────────────────────────┐
                        │           browser              │
                        │  Next.js 16 · React 19 client  │
                        │  Zustand · framer-motion       │
                        │  Remotion Player (splash)      │
                        └───────┬───────────────┬────────┘
                     same-origin │               │ sidecar (desktop)
                        ┌────────▼────────┐  ┌──▼───────────────────┐
                        │  Next API routes │  │  Rust · Tauri shell   │
                        │  /api/* (Node)   │  │  ledger.rs — native   │
                        │  Prisma (SQLite) │  │  churn/loyalty/XP     │
                        │  engine (TS)     │  │  parity w/ engine     │
                        │  617 features    │  │  notifications, vibe  │
                        └────────┬─────────┘  └───────────────────────┘
                                 │ events (payments, push) — production
                        ┌────────▼─────────────────────┐
                        │  C# · ScrollBridge (.NET 8)   │
                        │  idempotent entitlements      │
                        │  referral conversions         │
                        │  push outbox, quiet hours     │
                        └───────────────────────────────┘
```

## The web app (product)

- **State**: server truth in SQLite via Prisma; client state in Zustand
  (persisted: auth session, guest flag, sound/haptics prefs).
- **API**: ~30 route handlers under `src/app/api/*`. All reward grants,
  entitlements and progression are server-side; the client can only ask.
- **Engine** (`src/lib/engine/`): feature extraction (617 features), churn/loyalty
  scoring with sign-guarded learned weights, contextual bandit for copy variants,
  next-best-action decisions with fatigue guards. Trainable offline
  (`bun run engine:train`), testable (`bun run engine:test`).
- **Content pipeline**: KJV text fetched per-book into `public/bible/*.json`
  (`scripts/fetch-bible.mjs`); red-letter offsets compiled and verified
  (`scripts/redletter-verify.ts`); curriculum seeded from `prisma/seed-data/*`.

## The Rust shell (desktop)

`src-tauri/` builds the desktop app: on first run it copies the standalone Next
server + SQLite database into app-data, spawns it as a bun sidecar on
`127.0.0.1:3313`, waits for readiness, then opens the window. `ledger.rs` is a
native port of the engine's scoring math with eight parity tests — the desktop
build can score offline without touching JS. CI runs `cargo fmt`, `clippy -D
warnings` and `cargo test` whenever `src-tauri/**` changes.

## The C# worker (scale-out)

`services-csharp/ScrollBridge/` is the production-grade event side: payment
events (validated, idempotent by provider event id), entitlement application,
referral conversion (one per refCode), and a push outbox with quiet hours,
per-user daily caps and retry/backoff. ~18 xUnit tests. CI builds and tests it
whenever `services-csharp/**` changes.

## Deploying

- **Web**: `bun run build` → standalone server (`.next/standalone/scrollbible/`).
  The `Caddyfile` shows the reverse-proxy setup (TLS, compression, API no-cache).
- **Desktop**: `bun run desktop:prepare && cargo tauri build`.
- **Scaling path**: SQLite → PostgreSQL (swap the Prisma provider; queries are
  standard Prisma), then PgBouncer + read replicas. The web tier is stateless;
  ScrollBridge absorbs event traffic asynchronously.

## Data safety notes

- No third-party analytics; the engine's tap stream stays on-origin.
- Minimal PII: name, email, avatar config — nothing else is collected.
