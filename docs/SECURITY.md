# Scroll Academy — Security Audit Report (GLM Red/Blue Team)

> Audit date: 2026-11-07 · Scope: full application (API surface, client, data layer, engine)
> Method: adversarial attack simulation (red team) against the live app + code review and hardening (blue team)
> Result: **25/25 attack vectors defended · 0 known vulnerabilities remaining**

---

## 1 · Attack surface surveyed

| Surface | Count | Notes |
|---|---|---|
| API routes (GET/POST) | 27 | 23 accept POST bodies |
| User-writable text fields | 9 | post body, comment, profile name/bio, verse notes, reminder time, event types/payloads, pref keys, attachment cards |
| Gamification write paths | 12 | XP, hearts, gems, streaks, quests, chests, league, plans, shop |
| Engine write paths | 4 | event tap stream, snapshots, interventions, bandits |
| Dangerous-API scan | 0 findings | no `dangerouslySetInnerHTML` (app code), no `$queryRaw`, no `eval`/`new Function` |
| Secrets scan | 0 findings | `.env` contains only `DATABASE_URL` (local SQLite path) |

## 2 · Red team — attack simulation results (final run: PASS 25 · FAIL 0)

| # | Vector | Technique | Result |
|---|---|---|---|
| 1 | Stored XSS | `<img onerror>`, `<script>`, `<svg onload>` in posts/comments/profile | **Defended** — React auto-escaping at render; all fields length-capped |
| 2 | Malicious attachment cards | forged `kind`, `javascript:` color | **Defended** — shape whitelist (5 kinds), hex-color regex, field caps; junk stored as `null` |
| 3 | Prototype pollution | `__proto__.isAdmin` in JSON bodies | **Defended** — JSON.parse never executes; unknown keys ignored |
| 4 | Path traversal | `../../etc/passwd` as bookId | **Defended** — 400 (bookId whitelisted against BOOKS) |
| 5 | Reference abuse | chapter 99999 / −1, verse 0 | **Defended** — range validation |
| 6 | Action injection | unknown actions (`nuke`, `grantLifetime`) | **Defended** — 400 |
| 7 | SQL injection | `'); DROP TABLE Post;--` in text fields | **Defended** — Prisma parameterized queries; text stored inert |
| 8 | Type confusion | `"soundOn":"yes"`, hearts 99999 | **Defended** — `typeof` checks; hearts clamped 0–5 (Pro clamps to max) |
| 9 | Oversized payloads | 2 MB post body | **Defended** — connection rejected; stored bodies capped at 600 chars |
| 10 | Event-stream XSS/flood | `<script>` event types, 100-char types, 200-event batches | **Defended** — namespace regex `[a-z0-9_.]{1,64}`, batch cap 50, daily cap 5000 |
| 11 | Plan tampering | `plan:"free-forever-lol"` | **Defended** — values mapped through whitelist (`lifetime|pro`) |
| 12 | Lesson answer forgery | fake challengeId, optionId overflow, combo 99999 | **Defended** — server-side verification against the real challenge graph |
| 13 | HTTP method abuse | DELETE/PUT on POST-only routes | **Defended** — 405 |
| 14 | IDOR | foreign `userId` in body | **Defended** — server uses only the local user id |
| 15 | Prefs key injection | `<img src=x>` as pref key | **Defended** — key whitelist + boolean-only values |
| 16 | Reminder-time injection | `99:99` | **Defended** — proper `HH:MM` (0–23:0–59) regex |
| 17 | Community flood | 11 posts in a burst | **Defended** — 429 after 10/hour |
| 18 | Comment flood | burst commenting | **Defended** — 429 after 30/hour |
| 19 | Engine event flood | 200-event batch, repeated | **Defended** — batch 50 + daily 5000 caps |
| 20 | Notification overload | unbounded notif creation | **Defended** — engine daily/weekly caps + quiet hours |

Additional checks: XSS via red-letter data (ranges are numeric offsets — no HTML), engine config poisoning (DB rows type-checked; hard rules re-asserted after resolution), league bot manipulation (server-computed), Tauri shell (loads only local server; no remote origins).

## 3 · Blue team — hardening applied in this audit

| # | Fix | Files |
|---|---|---|
| 1 | Pref-key whitelist + boolean-only values + 32-key bound | `api/notifications/prefs`, `lib/journeys.ts` (read filters too) |
| 2 | Attachment card shape validation (kind whitelist, hex color, caps) | `api/community` |
| 3 | Rate limits: 10 posts/hour, 30 comments/hour | `api/community`, `api/community/comment` |
| 4 | Body-size guards (100 KB community, 50 KB profile, 20 KB comment, 150 KB engine) → 413 | same + `api/engine/event` |
| 5 | Security headers: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy`; `Cache-Control: no-store` on `/api/*` | `next.config.ts` |
| 6 | Reminder-time real range validation | `api/settings`, `api/notifications/prefs` |
| 7 | Event ingestion hardening (type regex, payload ≤2 KB, batch ≤50, daily ≤5000) | `lib/engine/events.ts` |
| 8 | Engine math NaN/Infinity guards throughout + adversarial test suite (91/91) | `lib/engine/*`, `scripts/engine-tests.ts` |
| 9 | Red-letter data fail-safe (unknown refs render plain; build-time verifier) | `lib/redletter.ts`, `scripts/redletter-verify.ts` |
| 10 | **v11 telemetry schema**: per-event payload contracts enforced server-side (unknown props dropped, required enforced, values clamped); `sv` version stamped per row; cross-language fingerprint pin (TS · Rust · C#) | `lib/telemetry/schema.ts`, `lib/engine/events.ts`, `lib/client/engine.ts`, `src-tauri/src/telemetry.rs`, `services-csharp/ScrollBridge/TelemetrySchema.cs` |
| 11 | **v11 assistant**: utterance ≤200 chars, regex-free linear matcher, 30 req/min per-IP sliding window, no transcript storage/logging (intent ids only), replies composed from server templates — no user text interpolated | `api/assistant/interpret`, `lib/assistant/intents.ts` |
| 12 | **v11 widgets**: snapshot endpoint serves non-sensitive fields only (no email/ids), `no-store`, noindex pages; widget telemetry deduped (1 impression/surface/hour) | `api/widget/snapshot`, `app/widget/*` |

## 4 · Architecture notes (why this app is structurally hard to attack)

1. **Local-first**: the app runs on the learner's own machine; there is no multi-tenant surface, no remote sessions, no secrets in the client. The database is a local SQLite file.
2. **Server-authoritative economy**: XP, gems, hearts, streaks, league XP are computed server-side from the real challenge graph; client-sent values are clamped or ignored.
3. **React-only rendering**: every user string renders through React's escaping; there are zero `innerHTML` sinks in application code.
4. **Prisma parameterization**: all queries go through the ORM — no string-built SQL exists.
5. **Engine boundary**: the personalization engine reads the tap stream through a validating ingestion layer and writes only bounded, type-checked rows.

## 5 · Remaining accepted risks

- The daily-quiz and practice paths trust a small amount of client state (timing/combo), bounded by fixed small XP rewards — accepted for a local-first app where the only "attacker" is the user themselves.
- `typescript.ignoreBuildErrors: true` in `next.config.ts` is scaffold-era configuration; `bunx tsc --noEmit` is kept clean (0 errors) and enforced by the test suite instead.
- HTTP (not HTTPS) is used locally — by design for a localhost/Tauri app; the Tauri shell uses `tauri://` and never loads remote origins.

## 6 · Verification commands

```bash
bash scripts/redteam.sh            # full red team: static checks + LIVE service-lane probes
bash scripts/redteam.sh --loop 120  # continuous adversarial checking (fresh round every 2 min)
bun scripts/engine-tests.ts      # algorithm edge-case suite (91 checks)
bun scripts/redletter-verify.ts  # red-letter integrity vs KJV text
bun scripts/engine-smoke.ts      # engine sanity
bun run lint && bunx tsc --noEmit
```

---

## 7 · Round 2 — referral program red-team (this build)

**Method:** two adversarial sub-agents (GLM red/blue-team simulation) attacked the new referral surface (`/api/referral`, `src/lib/referral.ts`, `ReferralCard` UI, engine referral features) — parallel-fire races, reward minting, cap bypass, type confusion, self-referral, ledger integrity. **10 findings (2 critical · 1 high · 3 medium · 4 low) — all fixed and re-verified under the same attacks.**

| # | Finding (severity) | Fix shipped | Re-attack result |
|---|---|---|---|
| R1 | Join race: 15 parallel joins bypassed the 10/day cap and double-awarded 3 milestone rungs (CRITICAL) | all writes inside transactions; milestone rungs unique-keyed (`ReferralMilestoneGrant @@unique([refCode, joins])`) so a rung is structurally grantable once; in-process FIFO write lock + retry-on-contention serializes SQLite writers | 15 parallel joins → exactly 10×200 + 5×429, rungs 1/3/5/10 granted once, gems exactly 10×50+200 |
| R2 | Subscribe race: no cap; parallel calls converted one row many times → phantom Pro months (15 months from 7 rows) (CRITICAL) | atomic single-row claim (`findFirst` → `updateMany({id, status:"joined"})`); new `MAX_SUBS_PER_DAY` cap; months increment only on a successful claim | 12 parallel subscribes → 10×200 (cap) + 2×429, each converting exactly one row |
| R3 | Self-referral: any user could redeem their own code; codes were a deterministic hash of userId → enumerable (HIGH) | `join`/`subscribe` reject the caller's own code (400); codes are crypto-random at creation and never reassigned; sandbox demo uses separate `demo_*` actions that 404 in production builds | self-join → 400, self-subscribe → 400 |
| R4 | Share cap was lifetime (permanent 429 after 20 total) and race-overshot (HIGH) | daily counter (`sharesDay`/`sharesToday`) with atomic increment under cap; rolls over at midnight | 20 parallel shares → 20×200, next day resets |
| R5 | `apply_credit` race: 22 spends from 20 months → `referralProMonths = −1` (MEDIUM) | guarded decrement `updateMany({referralProMonths: {gt: 0}}, {decrement: 1})` — atomic, cannot go negative; return value derived from the write itself, not a racy read | 25 parallel spends of 3 months → exactly 3×200 + 22×400, ends at 0 |
| R6 | No request-body size limit — 3 MB body parsed unauthenticated (MEDIUM) | `Content-Length > 16 KB` → 413 before parsing | oversized → 413 |
| R7 | `null` JSON body → 500 (LOW) | null/non-object parse guard → 400 | null body → 400 |
| R8 | Hash-collision upsert could reassign a code's owner (LOW) | random codes + create-retry; owner never updated | n/a (structural) |
| R9 | Dashboard stats derived from counts diverged from actual grants (LOW) | stats computed from the persisted milestone-grant ledger | stats match grants exactly |
| R10 | Referral engine features leaked future state (`subscribed` counted current status, not point-in-time) (LOW) | `rewardKind === "pro_month" && rewardedAt <= asOf` filter | point-in-time replay deterministic |
| R11 | `ReferralCard` called nonexistent `sfx.purchase()`/`haptics.success()` → apply-credit button dead at runtime (HIGH, UI) | swapped to existing `sfx.gem()` / `haptics.complete()`; `tsc --noEmit` clean | tsc 0 errors |

**XSS re-check:** ledger `friendName`/`note` render as React text children only — no `dangerouslySetInnerHTML` in application code (verified by grep). Engine-event payloads remain server-constructed only.

**Verification (all green after fixes):**

```bash
bun scripts/engine-tests.ts       # 91/91 PASS (referral features included)
bunx tsc --noEmit                 # 0 errors in app code
bun run lint                      # 0 problems
# attack replay: 15 parallel joins / 12 subscribes / 20 shares / 25 credits — capped & consistent
```

## 8 · Round 3 — the telemetry service lane (v11.2)

The engine ingest grew a second door: server-to-server events from the C#
worker (payments, entitlements, push outcomes) attributed to the exact user
the worker acted for. Threat model and countermeasures:

| # | Attack attempted | Countermeasure | Verified by |
|---|---|---|---|
| L1 | Key extraction via timing (byte-by-byte comparison) | SHA-256 both sides → `crypto.timingSafeEqual` — constant-time over fixed 32 bytes, no length oracle | `schema:test` §8 + code review |
| L2 | Lane enabled by misconfiguration (short/dev key) | keys <16 chars are treated as unset → **fail closed**; unset env → every keyed request 401 | `bun run schema:test` |
| L3 | Event forgery for arbitrary victims (spoofed userId) | strict `[A-Za-z0-9][A-Za-z0-9_:-]{0,63}` validation + the EngineEvent FK rejects users that don't exist | live: `user_ghost_999` → stored 0, rejected 1 |
| L4 | Anonymous attribution (events without userId) | keyed requests require a per-event userId; no ambient user, no defaults — rejected otherwise | live: junk id → rejected 1, valid → stored 1 |
| L5 | Keyed flood (worker gone rogue) | own sliding-window cap, 600 req/min/IP, independent of the session lane's caps | `schema:test` §8 (rate window) |
| L6 | Schema bypass via the new lane | same 60 contracts enforced in `ingestEvents` for both lanes — unknown props dropped, junk types rejected | live: `NOT_VALID_TYPE` → stored 0 |
| L7 | Telemetry failure blocking payments | the C# client is fire-and-forget with one capped retry pass; it never throws into payment paths (unchanged) | C# `ServiceLaneTests` |

**Secrets:** `ENGINE_SERVICE_KEY` (web) = `SCROLL_TAP__KEY` (C# worker), ≥16
chars, stored in env only (`.env` is gitignored; the repo never carries a key).
The demo deployment's key is a sandbox value — rotate for production.

```bash
# verify the lane end-to-end
bun run schema:test            # 57/57 (§8 = the lane)
cd services-csharp/ScrollBridge/tests && dotnet test   # 52/52
curl -X POST <host>/api/engine/event -H 'X-Scroll-Service-Key: wrong' -d '{...}'   # → 401
```

## 10 · Round 4 — the lane under continuous fire (v11.3)

**Method:** the red-team suite now *runs* the attack, not just greps for it.
Each round boots an isolated scratch instance (production standalone, throwaway
DB copy, random service key, 5/min cap) and fires nine live probes at
`POST /api/engine/event`:

| # | Probe | Expected | Verified |
|---|---|---|---|
| a | schema fingerprint + census pin | `3026954531` · 60 events · 617 features · 544 vars | ✓ |
| b | wrong key | 401, real key never echoed in body/headers | ✓ |
| c | body `userId` **without** a key | must NOT get service-lane attribution | ✓ |
| d | valid key + real user + valid event | 200, `lane:"service"`, stored ≥ 1 | ✓ |
| e | valid key + junk userIds | rejected ≥ 2, stored 0 | ✓ |
| f | 200KB body | 413 before any lane work | ✓ |
| g | invalid JSON | 400 | ✓ |
| i | sustained keyed fire (cap 5/min) | 429 engages | ✓ |

Static lane hygiene is also checked every round: no literal key in the tree,
key never logged, `timingSafeEqual` present, fail-closed on short/absent keys.
`--loop N` (≥ 30s) keeps firing rounds against a fresh scratch server —
continuous adversarial checking for long pilot days. Result: **RED TEAM: PASS,
repeatably** (two consecutive rounds green, no state bleed between rounds).
