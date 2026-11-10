# Scroll Academy — Scaling to 600,000 Users

> Companion docs: [`REVENUE.md`](./REVENUE.md) · [`ENGINE.md`](./ENGINE.md) · [`SECURITY.md`](./SECURITY.md)

This document defines the architecture that carries the app from the current single-user sandbox (SQLite, local state) to **600k monthly active users (MAU)** — and states plainly what changes and what doesn't.

---

## 1 · The load, honestly sized

| Metric | Estimate @ 600k MAU | Basis |
|---|---|---|
| DAU | ~180,000 (30% DAU/MAU, Duolingo-class) | category norm |
| Requests / sec, average | ~450 rps | 25 req/DAU/day spread over the day |
| Requests / sec, peak (19:00–21:00 local) | ~1,800 rps | 4× average, evening study habit |
| Lesson completions / sec, peak | ~90 | the heaviest write path |
| Engine feature recomputes | ~40/s (event-triggered, debounced) | see §4 |
| Push notifications / day | ~400,000 | daily reminder + verse-of-day |
| DB rows added / day | ~15M (events, completions, notifications) | dominant: EngineEvent |

**The one-sentence summary:** the app is read-heavy (course content is static), write-moderate (progress + events), and burst-scheduled (push + training) — a very standard shape that Postgres + Redis + a queue handles at this scale without heroics.

## 2 · Target architecture

```
                        ┌───────────── CDN (static /_next, bible JSON, icons) ────────────┐
                        │                                                                 │
  600k users ──HTTPS──► │  Edge / LB (Caddy or ALB, TLS, HTTP/2)                          │
                        └──────────┬──────────────────────────────────────────────────────┘
                                   │
                    ┌──────────────▼───────────────┐        ┌──────────────────────────┐
                    │  Next.js API tier (stateless) │        │  ScrollBridge (.NET 8)   │
                    │  N pods, HPA on CPU+rps       │        │  payment webhooks        │
                    │  - all /api routes            │◄──────►│  push dispatch (quiet hrs│
                    │  - session via JWT cookie     │  queue │  + per-user caps)        │
                    │  - no local state             │        │  (services-csharp/)      │
                    └───────┬──────────────┬────────┘        └───────────┬──────────────┘
                            │              │                             │
                  ┌─────────▼───┐   ┌──────▼──────┐   ┌──────────────────▼─────┐
                  │ Postgres 16 │   │ Redis 7     │   │ Queue (RabbitMQ/SQS)   │
                  │ primary +   │   │ sessions,  │   │ events, outbox, DLQ    │
                  │ 2 replicas  │   │ hot caches │   └────────────────────────┘
                  │ (PgBouncer) │   │ rate limits│
                  └──────┬──────┘   └─────────────┘
                         │
                  ┌──────▼───────────────────────────────┐
                  │ Nightly engine training (SGD refit)  │
                  │ + snapshot compaction job            │
                  │ (off-peak, reads replicas)           │
                  └──────────────────────────────────────┘
```

### What changes from today's build

| Layer | Today (sandbox) | At 600k | Migration cost |
|---|---|---|---|
| DB | SQLite, `User.id = "user_1"` | **Postgres 16** + PgBouncer; real user ids; the Prisma schema ports as-is (all models are already normalized; only `@id @default("user_1")` and `DATABASE_URL` change) | Low — schema unchanged |
| Auth | none (single user) | NextAuth.js v4 (already a dependency) with email + Apple/Google OAuth; every API route's `USER_ID` constant becomes `getSession().userId` — the routes already funnel user identity through one constant | Medium — mechanical |
| Sessions | cookie-less | JWT in httpOnly cookie; Redis-backed revocation list | Low |
| Engine events | in-proc `ingestEvents` | same validation (namespace regex, batch ≤50, daily ≤5,000 — **keep these caps**, they are the flood protection), then queue → ClickHouse for analytics + Postgres for state | Medium |
| Push | in-app scheduler + EmailLog | ScrollBridge worker (C#, `services-csharp/`) with quiet hours + per-user caps — code is written and tested in this repo | Low — deploy as-is |
| Course content | DB rows | unchanged, plus CDN-cached read API (immutable between seeds) | Trivial |
| Leagues/bots | server-computed weekly | unchanged per-user compute, but league rollover moves to a scheduled job (partition by league; 15 users/league = 40k independent groups, embarrassingly parallel) | Low |
| Payments | simulated `/api/pro` | Stripe webhooks → ScrollBridge queue → entitlement store (idempotent, dedupe by event id — implemented and unit-tested) | Low |

### Capacity math for the API tier

- Next.js standalone on 1 vCPU ≈ 250–400 rps for these routes (Prisma + JSON). 
- Peak 1,800 rps → **6–8 pods** (n+2). With 2 vCPU pods: **4–5 pods**.
- Postgres: 90 writes/s peak is small; the primary handles it with room to spare. Replicas serve leaderboard/community reads. `EngineEvent` (15M rows/day) is the one table that needs **partitioning by day** and a 90-day TTL → ClickHouse rollup.
- Redis: sessions (600k keys ≈ 300MB), rate-limit buckets (already token-bucket in ScrollBridge), hot course cache.

## 3 · The referral + payment plane (already built)

`services-csharp/ScrollBridge/` in this repo is the production webhook/dispatch core:

- **`PaymentEventProcessor`** — validates every webhook field (kinds whitelisted, lengths capped, amounts bounded), dedupes by provider event id (queues redeliver; we must be idempotent), applies entitlements, records referral conversions. Parity with `src/lib/referral.ts` so the web app and the worker agree.
- **`PushDispatcher`** — quiet hours 21:00–08:00 local, priority-0 transactional exemption, per-user daily cap (default 8), retry with backoff — the same guardrails the in-app notification scheduler enforces, now at fleet scale.
- **18 xUnit tests** cover idempotency, rejection paths, quiet-hours boundaries, cap enforcement.

At 600k users this runs as 3 replicas behind the same queue; the interfaces (`IEntitlementStore`) swap from in-memory to Postgres-backed with no logic change.

## 4 · The engine at scale (keeping 617 features honest)

The Scribe's Ledger recomputes features per user on major events. That is O(user's own history), not O(all users) — the design already partitions by user. At scale:

1. **Event-driven partial recompute** (debounced 60s): only the ~40 families touched by the event change; the rest are snapshot-cached (the `EngineSnapshot` table already exists for this).
2. **Nightly training** reads the replica, never the primary. Training a logistic model on 600k users' point-in-time features is minutes, not hours (sign-guarded SGD, already implemented — `bun run engine:train`).
3. **Bandits** (10 Thompson-sampling experiments) stay global with per-user exposure logs — unchanged.
4. **Privacy**: features are behavioral aggregates; no free-text ever enters the engine (validated payloads only, ≤2KB, namespace regex — see SECURITY.md). GDPR/CCPA: a user's full ledger (`EngineEvent` + `EngineSnapshot` + progress) deletes by `userId` cascade — one transaction.

## 5 · Availability & ops targets

| Target | Value |
|---|---|
| Uptime SLO | 99.9% (43 min/mo budget) |
| API p95 latency | < 300 ms (warm cache), < 800 ms (cold) |
| Push delivery | < 60s from trigger, quiet-hours deferred exactly |
| Backup | Postgres PITR (WAL) + nightly logical dump, 35-day retention |
| Deploy | blue/green on the API tier; migrations are additive-only and backward-compatible for one release |
| Observability | structured logs → Loki; RED metrics per route; engine AUC + referral K-factor on the ops dashboard (they are the revenue metrics) |

## 6 · Cost envelope @ 600k MAU (order of magnitude)

| Line | Monthly |
|---|---|
| API tier (6× 2vCPU pods) | $700 |
| Postgres HA + replicas | $900 |
| Redis | $250 |
| Queue + ClickHouse | $600 |
| CDN + egress (static + Bible JSON) | $1,200 |
| Push (FCM/APNs via SNS) | $800 |
| Observability + misc | $500 |
| **Total infra** | **~$5,000/mo** — 0.5% of Phase-3 revenue ($1.3M/mo in REVENUE.md §2) |

Infrastructure is never the constraint at this scale; **acquisition and retention** are — which is why the money went into the engine, the referral loop and the curriculum instead of premature Kubernetes.

## 7 · What is deliberately NOT in this plan

- **No microservices for the app itself.** One Next.js tier + two workers (engine trainer, ScrollBridge) is the right shape until far beyond 600k. Splitting into services would add failure modes, not capacity.
- **No multi-region** until a second continent exceeds 20% of traffic; the CDN covers static latency meanwhile.
- **No Kafka.** RabbitMQ/SQS at 400k pushes/day is trivial; Kafka would be résumé-driven architecture.
