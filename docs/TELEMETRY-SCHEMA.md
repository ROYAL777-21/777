# The Telemetry Schema (v11)

> *"For God is not the author of confusion, but of peace." — 1 Corinthians 14:33 (KJV)*

One versioned contract for everything the Scribe's Ledger collects. The engine
governs **1,161 variables** (617 retention/loyalty features in 28 families +
544 gamification variables in 18 domains — see [`ENGINE.md`](./ENGINE.md));
this schema defines what may ever **enter** the stream that feeds them.

- **Schema version:** 11 · **Event types:** 60 · **Fingerprint:** `3026954531`
- Source of truth: `src/lib/telemetry/schema.ts` (isomorphic — client + server)
- Mirrors: `src-tauri/src/telemetry.rs` (Rust) · `services-csharp/ScrollBridge/TelemetrySchema.cs` (C#)
- Introspection: `GET /api/engine/schema` (summary) · `?full=1` (prop specs)
- Tests: `bun run schema:test` — fingerprint pin, contract validity, validator
  behavior, census bounds, assistant intent golden cases

---

## 1 · The layers

```
EVENT CONTRACTS          VARIABLE CENSUS               CONSUMERS
(60 event types,          617 features (28 families)    features.ts → scores
 this schema)             544 game vars (18 domains)    gameVars.ts → resolveGameConfig()
        │                        ▲                            │
        ▼                        │                            ▼
 EngineEvent rows ── validate ──┴──── computeFeatures() ── decide() → NBAs
 (tap stream, sv=11)                   (point-in-time)          (caps · quiet hours)
```

## 2 · Contract shape

Every event type declares a payload contract:

```ts
lesson_complete: {
  props: {
    lessonId:  { t: "str",   len: 64 },
    accuracy:  { t: "float", min: 0, max: 1 },
    difficulty:{ t: "int",   min: 1, max: 5 },
    firstTime: { t: "bool" },
    // …
  }
}
```

Property types: `int` · `float` · `bool` · `str` · `enum` (fixed values).
Every type carries bounds (`min/max` or `len`); every enum is closed.

**Validation semantics (client pre-check, server authoritative):**

| Situation | Result |
|---|---|
| Unknown payload property | dropped (forward compatibility) |
| Required property missing / wrong shape | event rejected |
| Number out of range | clamped into range |
| String over length | truncated |
| Unknown event type | rejected, unless it's a namespaced custom (`a.b_c`, `[a-z0-9_.]{1,64}`) |
| Payload > 2 KB · batch > 50 · > 5,000 events/day/user | capped at ingest |

## 3 · Privacy

- PII classes: **`none`** (default) and **`coarse`** (hour of day, bounded
  error breadcrumbs). That's the ceiling — there is no "personal" class.
- **No free text.** No verse content, no post bodies, no assistant
  transcripts. The assistant records `{intent, matched, mode}` — never
  the words you spoke.
- Everything runs locally (single-user pilot DB / offline desktop build);
  the schema exists so that never changes by accident as the app scales.
- Each `EngineEvent` row stores the schema version (`sv`) that wrote it,
  so historical data can be interpreted under its own rules.

## 4 · The fingerprint (cross-language parity)

```
canonical = "scroll-telemetry-v11\n" + sorted event types joined by "\n"
fingerprint = FNV-1a 32-bit (canonical) = 3026954531
```

- **TS** `telemetryFingerprint()` — served by `GET /api/engine/schema`
- **Rust** `telemetry::fingerprint()` — Tauri command `schema_fingerprint`
  (the desktop webview compares both at runtime and logs drift in dev)
- **C#** `TelemetrySchema.Fingerprint()` — ScrollBridge refuses to start
  on a pin mismatch (fail-closed)
- `cargo test` and `bun run schema:test` pin the same constant — a schema
  change that doesn't update all three mirrors fails CI, not production.

**To change the schema:** edit `schema.ts` → update the event list + pinned
fingerprint in `telemetry.rs` and `TelemetrySchema.cs` → bump
`TELEMETRY_SCHEMA_VERSION` → all three test suites must pass in one commit.

## 5 · New surfaces in v11

| Surface | Events |
|---|---|
| Animated widgets (`/widget/*`, desktop companion) | `widget_impression` · `widget_tap` |
| Ask Papy assistant (voice + Siri/Assistant bridges) | `assistant_open` · `assistant_query` · `assistant_action` · `assistant_error` |

Widget impressions are deduped to **one per surface per hour** — a glance is
not an event firehose. The assistant query event carries intent ids only.

## 6 · Where validation runs

| Layer | File | Role |
|---|---|---|
| Client | `src/lib/client/engine.ts` | validate before queueing — junk dies in the browser |
| Server | `src/lib/engine/events.ts` | authoritative re-validation (never trust the client) |
| Rust | `src-tauri/src/telemetry.rs` | fingerprint parity, pinned by `cargo test` |
| C# | `services-csharp/ScrollBridge/TelemetrySchema.cs` | fingerprint pin + validated emission from the payment/push planes |

## 7 · The service lane (v11.2) — server-to-server telemetry

ScrollBridge (C#) and future workers act on a user's behalf — payment
conversions, entitlement grants, push outcomes. Those events belong in the
Ledger **attributed to the right user, without a browser session**.

```
ScrollBridge ──POST /api/engine/event──────────────────────────┐
  header:  X-Scroll-Service-Key: <ENGINE_SERVICE_KEY>           │
  body:    { "events": [ { "type": "purchase",                  │
                          "payload": { "plan": "annual" },      │ same schema,
                          "userId": "user_1" } ] }              │ same validation,
                                                                │ same caps
```

**The rules** (`src/lib/telemetry/serviceLane.ts`):

| Rule | Enforcement |
|---|---|
| Disabled by default | `ENGINE_SERVICE_KEY` unset (or <16 chars) → every keyed request is **401** |
| Timing-safe auth | SHA-256 both sides → `crypto.timingSafeEqual` — no early exit, no length oracle |
| Strict attribution | every event must carry a valid `userId` (`[A-Za-z0-9][A-Za-z0-9_:-]{0,63}`); no ambient user, no defaults |
| FK backstop | the EngineEvent `user` relation rejects attribution to users that don't exist |
| Own rate cap | 600 keyed requests/min/IP (the session lane keeps its own caps) |
| Same schema | the 60 contracts apply identically — unknown props dropped, bounds clamped, junk types rejected |
| Daily flood cap | per target user, as the session lane |

**C# side** (`EngineTapClient`): set `SCROLL_TAP__URL` + `SCROLL_TAP__KEY`
(= the web app's `ENGINE_SERVICE_KEY`) and every tap carries the header and
the per-event `userId`. Invalid userIds are rejected client-side before the
wire. Without a key the client still fires (the server 401s and the client
logs it once) — telemetry never blocks the payment path.

Tests: `bun run schema:test` §8 (lane disabled, fail-closed, wrong/right key,
userId format, rate window) · C# `ServiceLaneTests` (header + userId on the
wire, no-key behavior, local skip, body shape, userId format parity).

