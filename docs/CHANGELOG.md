# Changelog

## v11.5 — The Peak-End Update

The 16-video principles pass, applied to the moment that matters most:
**the end of a session and the start of a day**. Peak-end rules say the
last 30 seconds decide whether tomorrow happens — so the completion
screen was rebuilt, and the morning got its own clock. Telemetry contract
frozen and verified untouched: fingerprint `3026954531` · 60 events ·
617 features + 544 gameVars. Engine 91/91 · schema 57/57 · red-team PASS.

### Completion screen v2 (`LessonView.tsx`)

The old screen showed a staged "Speedy" number (a formula, not a clock)
and a farewell that never changed. v2, top to bottom:

- **Real duration** — the Speedy card shows the server-timed run
  (`durationSec` posted at completion, echoed back), not an estimate
- **Goal ring** — today's XP portion fills a ring under the stats;
  a finished day crowns 🏆, "blessed work!"
- **Manna reward** — the rare "extra manna fell" bonus (+5–15 XP,
  deterministic per lesson·day, first-run only, never farmable) gets
  its own grace note card — gold wheat, a joyful shake
- **PB badges** — personal bests beaten this run (fastest run, longest
  combo ever) appear as 🏅 chips; evidence of skill against your own
  history, not attendance ribbons
- **League tag** — rank, the climb (📈), promotion-zone callout, and the
  one catchable scribe ahead ("one lesson catches them"); taps through
  to the leaderboard
- **sessionHook farewell** — the engine's tone-matched send-off line
  (variant A/B/C, engine-chosen) lands above CONTINUE as the last words
  of the session

### The false-scarcity line, killed

The lesson-end upsell said "Founding price ends when the cohort fills →"
— a claim that isn't true (there is no cohort cap). Replaced with the
plain terms: "First 7 days free — cancel anytime, in two taps." The
paywall CTAs now say **"$0.00 due now"** (desktop checkout + sticky
mobile CTA): exact numbers, no ambiguity, per the honest-pricing
research (Blinkist's exact-charge-date line: +23% conversion, −55%
complaints).

### Today's Manna — the daily clock (`LearnView.tsx` + `/api/manna`)

A verse-portion lands every local midnight; one tap gathers it (+5 XP
through the standard award path — quests, achievements, league all see
it). The manna streak counts mornings and **never punishes** — it only
counts. Idempotent per day (verified live: second POST → `ok:false`,
0 XP). Engine nudge `manna_reminder` fires afternoons-only once the
habit exists (mannaStreak ≥ 2), pointing, never shaming.

### Papy's contextual greeting (`LearnView.tsx`)

Papy stands at the top of the path and answers the learner's actual
moment — goal done (cheer), streak at risk (the honest callout), manna
waiting (the pointer), or the time of day (morning / afternoon / evening
/ midnight-oil). Mood-matched: `cheer` / `sleep` / `happy`.

### Chest tap-and-hold ritual (`LearnView.tsx`)

Unit chests no longer pop on a tap: **hold ~0.65s to open**. A gold ring
fills around the chest, the shake intensifies, quarter-way haptic ticks
wind it up, and the reveal bursts (confetti added). Release early and a
gentle "Hold to open ⏳" hint teaches the ritual. Keyboard: hold
Enter/Space. Reduced motion: the ritual is skipped, straight to the
open. Anticipation is the reward amplifier.

### Streak-at-risk flame (`TopBar.tsx`)

When a streak exists but today isn't logged yet, the flame flickers
fast (`flicker-fast`, 0.9s) under a red pulsing halo with a "!" badge —
and the tooltip says the hopeful thing: "one lesson today keeps the
flame lit." Tapping goes straight to the Learn path, not the profile.
Fear is banned; the flame asks to be saved, never warns of loss.

### Daily goal picker (`ProfileView.tsx` + `/api/settings`)

"Daily goal — choose your portion": Casual 20 / Steady 50 / Intense 100,
or "let Papy size it" (engine-tuned, returns null and the engine's 50
default). Self-chosen goals stick better than assigned ones
(self-determination research); `dailyGoal` flows through profile,
settings and bootstrap payloads. Invalid values (77) are rejected
server-side (verified live).

### Session-break repairs (found by fresh tsc)

The session died mid-edit on Nov 9; four wounds were found and fixed:
`copy.ts` nudge functions missing their `(v)` parameter (promotion /
recognition identities), `practice/complete` referencing a bare
`durationSec`, the LessonView error-fallback missing the four new
`CompleteResult` fields, and a stale `confetti.Color` cast that the
installed @types no longer exports. Fresh `tsc --noEmit`: clean.

### Verification (all live, this session)

Engine 91/91 · schema 57/57 · red-team 8/8 PASS with the fingerprint
pinned (a. schema pin 3026954531 events=60 features=617 gameVars=544).
C#/Rust suites: no toolchain in this sandbox, but `git diff` shows
zero changes under `services-csharp/` and `src-tauri/` since the v11.4
baseline (C# 52/52, Rust 12/12) — baselines hold by code identity.
API smoke (scratch standalone + throwaway db): manna GET/POST/idempotent,
goal set 100 → null → invalid 77 rejected, profile/bootstrap carrying
`dailyGoal` + `manna`, lesson-complete returning the full v2 payload
(`durationSec: 87`, league `{rank 1, promotionZone 5}`, records,
mannaBonus). `bun run build`: compiled clean, 35/35 static pages.

## v11.4 — The Juice Update

A Duolingo-grade motion system across the whole app — and the horrendous
first paint is gone. Verified live in the browser: splash renders instantly
and hands over in ~2.1s, lesson juice fires with zero console errors, engine
91/91 · schema 57/57 unchanged.

### The splash, rebuilt live (the first-paint fix)

`SplashGate` no longer loads the Remotion Player at all — that dynamic
import + video decode was the blank-screen culprit. It is now a pure
Framer scene rendered in the very first frame: dawn gradient, a turning
sun, the title cascading letter by letter, **the sea parting in two springy
wave stacks** with spray droplets, a dry path with a light shaft revealed,
Papy rising through the gap with squash-and-stretch, and Exodus 14:21
landing at the close — then it hands over (~2.1s, was 7.5s + decode).
`npm run splash:render` still produces the store MP4 from the Remotion
composition (kept for store submissions).

### The motion system (`src/lib/motion/`)

One vocabulary for the app, tuned to Duolingo's feel (fast attack, tiny
overshoot): springs `juice/snappy/soft/lunge/heavy`, named variants
(`pageIn`, `popIn`, `sheetIn`, `squish`, `shake`, `cascade`), the confetti
palette, and `juiceConfetti` helpers (`burst`, `cannons` — the Duolingo
double side-fire — `rain`, `popAt`).

### Full-Duo Papy (`Mascot.tsx`)

Breathes (subtle body swell), blinks, **eyes track your pointer**
(springy motion-values, zero re-renders, rAF-throttled), every mood change
lands with squash-and-stretch, and `cheer` is a full celebration — hop,
wiggle, seal spin, sparkles.

### Lesson juice (`LessonView.tsx`)

- Wrong answer: the **whole screen shakes** (re-triggerable via animation
  controls) + the wrong option shakes red, correct answer pops green
- Progress bar: the lunge spring (stiffness 170 / damping 13)
- Heart lost: a 💔 floats off the counter
- Lesson complete: **double confetti side-cannons ×2 + central burst**,
  streak-increase sparkle cue (`sfx.streak`)

### App-wide

- View switches: springy `pageIn` (y 18 + micro-scale) instead of a flat fade
- Learn path: lesson nodes **cascade into view** as you scroll (`whileInView`)
- TopBar: streak/gem **CountUp** rollers with pop, streak **ignition ring**
  when the streak grows, PRO button pulse halo
- Paywall: plan cards spring in staggered, the pick pops, benefit list pops
  in on scroll, the sticky CTA breathes (squish + gentle pulse)
- New sound cues (`confettiPop/streak/xp/whoosh/swish`) + haptics
  (`celebrate/streak/reveal`) pair with the motion

### Reduced motion, properly (a11y)

`MotionPrefsProvider` wraps the app in framer's `MotionConfig`: the OS
`prefers-reduced-motion` flag is respected automatically **and** Settings ▸
**Animations** toggles it per device (like Duolingo — motion is a device
preference, so it lives in localStorage, not the account). The splash skips
itself, confetti goes silent, CSS keyframes stop (`.animate-shake`/`pulse`
added to the hard-off list), and the OS-flag edge case is messaged honestly
in Settings.

### Honest fix found by verification

Browser verification caught a real runtime error before you could:
**framer springs reject 3-keyframe pops** ("Only two keyframes currently
supported… 1,1.08,1") — the option-button pop, plan-card pick, and check
circle all used keyframe arrays with spring transitions. Fixed with
per-value tween transitions for the pops; the error count in the dev log
stayed flat afterwards.

### Verification

Splash (fresh storage) → auth → guest → lesson answered correct & wrong →
settings toggle on/off → all clean, zero console errors, `bun run lint`
0 errors. One surface not click-tested live: the paywall plan-picker (the
demo session is a Pro account, which never sees the upgrade sheet) — its
patterns are the ones proven live elsewhere and it compiles clean.

## v11.3 — The Scribe's Polish

A repo-wide efficiency + readability pass over the game core, and the red-team
suite grew teeth: the service lane is now under continuous live adversarial
fire. **Behavior proven unchanged**: all 617 features byte-identical against a
frozen pre-refactor baseline (same DB, same `asOf`), with every suite green —
engine 91/91 · schema 57/57 · Rust 12/12 · C# 52/52 · `next build` clean.

### Engine efficiency (measured, not vibes)

- `resolveGameConfig` **5.7ms → 1.8ms per snapshot (3.2×)**:
  - `sampleArms()` (`bandit.ts`) draws all 10 experiment contexts in **one**
    `WHERE context IN (…)` query (was 10 sequential round-trips);
  - `RULED_VARS` (`gameVars.ts`) — the resolver now visits only the vars that
    actually carry a personalization rule (dozens), not all 544;
  - defaults are a frozen module-level object, cloned per call.
- `features.ts` — one shared time-window index per snapshot: sorted
  millisecond arrays (`lessonMs`…`allMs`) with early-exit `countSince` /
  `countBetween` scans, and an `ago()` dayKey→days-ago cache. This removes
  ~50 full-array `filter` sweeps and thousands of `Date` re-parses from the
  hottest loops (every `activeDays.filter(k => daysBetween(k, todayKey)…)`
  predicate re-parsed two date strings per element, per call site).
- `events.ts` — tap batches (≤50 events) now land via **one `createMany`**
  with a per-row fallback when the batch fails (was 50 sequential inserts);
  semantics `{stored, major, rejected}` unchanged.
- `compute.ts` — planned interventions went N×(findFirst+create) → one
  `findMany` + one `createMany`; `decide()` and the trust-toggle read now run
  in parallel.
- `gamification.ts` — `checkAchievements` reads the user's tiers once and
  upserts only what advanced (was a `findUnique` + `upsert` per definition);
  quest updates, league-bot seeding, and quest/achievement notifications are
  batched/parallel (`createMany` / `Promise.all`).

### Two honest fixes surfaced by the polish

- **Multi-user cache bleed (real bug for the pilot)**:
  `getGameConfigQuick` cached ONE config globally — with the 10-church
  pilot's many members it could serve one user's personalization to another.
  Now a per-user cache (256 entries, LRU-ish eviction, 60s TTL).
- **Future-day leak in point-in-time reconstruction**: when `train.ts`
  recomputes features at a historical `asOf`, the *current* `lastActiveDay`
  (future relative to `asOf`) was counted as "active within 7d" by the
  `delta`/`comp` families (no `≥ 0` guard), while `freq`/`active` families
  already excluded it. Unified: `activeIn()` applies the lower bound
  everywhere. Affects 11 features only when reconstructing history; live
  snapshots (`asOf = now`) are unaffected — verified byte-identical.

### Red team v11.3 — the lane goes under continuous fire

`scripts/redteam.sh` grew from 6 static checks to **8 sections with live
adversarial probes**:

- **[7] service-lane hygiene (static)**: no literal key committed, key never
  logged, `timingSafeEqual` present, fail-closed on short/absent keys.
- **[8] LIVE probes** — boots an *isolated* scratch instance (production
  standalone on :3111, throwaway DB copy, random key, rate cap 5/min) and
  attacks the lane: schema fingerprint/census pin (`3026954531` · 60 events ·
  617 features · 544 vars), wrong key → 401 + key-never-echoed, **body
  `userId` without a key must not ride the lane**, valid keyed tap stored &
  attributed, junk attribution rejected, 200KB body → 413, invalid JSON →
  400, sustained keyed fire → 429. Set `REDTEAM_BASE_URL` +
  `REDTEAM_SERVICE_KEY` to probe a shared staging server instead.
- **Continuous mode**: `bash scripts/redteam.sh --loop 120` reruns the full
  suite every 2 minutes (fresh scratch server each round) — plus
  `npm run redteam:live` / `redteam:static`.
- Hardened its own process handling while at it: the scratch server is
  launched as a direct child (an earlier subshell wrapper could orphan the
  bun process, leaving a stale-key server on :3111), and a boot-time death
  check reports `EADDRINUSE` loudly instead of probing a zombie.
- `ENGINE_SERVICE_RATE_LIMIT` (env) now overrides the lane cap so the flood
  probe can verify 429s without 600 real calls.

## v11.2 — The Bridge Update

Three completions, one honest fix, and the season made ready:

- **The service lane — true server-to-server telemetry**: `POST /api/engine/event`
  now speaks two lanes behind one schema. The service lane
  (`src/lib/telemetry/serviceLane.ts`) authenticates ScrollBridge with
  `X-Scroll-Service-Key` — timing-safe (SHA-256 + `timingSafeEqual`), **disabled
  by default** (unset or short `ENGINE_SERVICE_KEY` → every keyed request 401s,
  fail-closed) — and attributes every event to a strictly-validated `userId`
  (no ambient user, no defaults, FK backstop, own 600/min/IP cap). The C#
  `EngineTapClient` now sends the key (`SCROLL_TAP__KEY`) and the per-event
  `userId`; invalid ids are rejected before the wire; telemetry still never
  blocks the payment path. Proven live: wrong key → 401, right key → events
  land attributed in the DB, ghost users rejected by the FK, junk types still
  schema-rejected. Tests: schema §8 (57 total) + C# `ServiceLaneTests`
  (52 total).
- **The splash is a real MP4**: `npm run splash:render` now works — the
  composition's `@/` import broke Remotion's webpack (Next alias); fixed with a
  relative path. Rendered: **1080×1920 h264, 30fps, 7.5s, 408 kB** —
  `download/parting-sea-splash.mp4`, store-submission ready.
- **The Advent dry-run — 34 verified · 0 failed** (`bun run advent:dryrun`):
  the phase clock (off → pre Nov 23 → advent Nov 29 → christmas Dec 25 → ended
  Epiphany), the banner copy per phase, the 4-email schedule and its
  **once-only delivery proven against the real database** (second send is a
  no-op, exactly one EmailLog row), the gift purchase→redeem race-proofing at
  the campaign price ($29.99 ↔ 2999 cents verified from the DB row), and the
  live endpoint's honest pre-season guard. Plus the **10-church projection
  model** — clearly labeled SIMULATED with its full assumption table — landing
  the $990/mo MRR finish line, 182 members, 766 chapters, and the go-live
  checklist for Nov 23. Report: `docs/ADVENT-DRYRUN-REPORT.md`.
- **Preview stability**: the app now runs from the production standalone build
  (no on-demand dev compilation — first loads were timing out after sandbox
  recycles).

## v11.1 — Watchman hardening (previous build)

Re-verified the whole v11 surface from a clean sandbox; four latent defects found and fixed:

- **Rust ledger sign guard was a silent prior-killer** (`src-tauri/src/ledger.rs`): a
  wrong-sign learned weight was clamped to `0.0`, which *deleted* the prior and
  *lowered* churn risk — the exact flip the guard exists to prevent. Now a wrong-sign
  (or NaN) override is **rejected and the prior stands**, matching the TS trainer's
  semantics (weights start from priors; a step that would cross zero has its gradient
  zeroed). New test covers flip-rejected / same-sign-sharpening-accepted / NaN-rejected.
  `cargo test` 12/12 (was 11 with 1 failure).
- **C# ScrollBridge never compiled** (v11 regression): the `tests/` project lives inside
  the worker's directory, so SDK globbing pulled the xUnit sources into
  `ScrollBridge.csproj` (which doesn't reference xunit) → `dotnet test` failed with 50+
  `Fact` errors. Fixed with `<Compile Remove="tests/**/*.cs" />`, plus three genuine
  compile errors in the v11 telemetry mirror (`TelemetrySchema.Fingerprint()` called
  unqualified from another class; a `(string,string)` tuple queued into a retry queue
  that later passed the tuple where a JSON body string was required; `ILogingBuilder`
  misused for `CreateLogger`). Telemetry tests added: fingerprint pin, canonical form,
  60 sorted event types, namespaced escape hatch, payload bounds, no-op tap client.
  `dotnet test` 37/37 (was: did not build).
- **The census was off by one, honestly**: the registry counts **544** gamification
  variables, not 545 — the old `ENGINE-REGISTRY.md` had merged a *feature*
  (`well.sunday_rest`) into the game-var numbering, and the header docs repeated it.
  Regenerated the registry from the live code (617 features + 544 vars = **1,161
  governed variables**) and corrected every doc that claimed 545/1,162.
- **Verification, full stack**: schema tests 46/46 · engine tests 91/91 · Rust 12/12 ·
  C# 37/37 · `next build` clean · live checks of `/api/engine/schema` (fingerprint
  `3026954531`, census), all four `/widget/*` pages, `/api/widget/snapshot`, the
  assistant interpret API, and the Siri/Assistant deep link (`/?assistant=1&q=open john 3`
  → "Opening John 3." → reader opens at John 3).

## v11 — The Watchman Update

- **The telemetry schema** (`src/lib/telemetry/schema.ts`): one versioned, machine-readable
  contract for the whole tap stream — 60 event types with per-event payload specs (types,
  bounds, enums, required flags), PII classes (`none`/`coarse` — no free text, no verse
  content, no assistant transcripts), and a canonical fingerprint (`3026954531`) mirrored
  and pinned across **TypeScript, Rust (Tauri) and C# (ScrollBridge)** so schema drift
  fails CI instead of production. Enforced client-side before queueing and server-side at
  ingest; every `EngineEvent` row is stamped with its schema version (`sv`).
  Introspection: `GET /api/engine/schema`. Tests: `bun run schema:test` (46 checks).
- **The census, live**: the schema route reports the engine's true size from the
  registries themselves — 544 gamification variables (18 domains) + 617 retention
  features (28 families) = **1,161 governed variables**, counted, not claimed.
- **Animated widgets, phone and laptop** (`/widget/*`): the streak flame (flicker +
  countdown ring to local midnight), the verse of the day on parchment (ink drift,
  underline grow), the XP goal ring (pulses when the day is won), and the board that
  unites them — all battery-disciplined (transform/opacity only, reduced-motion freezes,
  visible-only refresh) and backed by one tiny `GET /api/widget/snapshot` (verse text
  included, non-sensitive fields only).
- **Desktop companion window** (Tauri): `toggle_widget` creates a frameless,
  always-on-top 420×560 window over `/widget/board` — no new plugins, core window APIs.
  Taps bring the main window forward instead of navigating the little one.
- **Ask Papy — Siri & Android assistant capability** (`Assistant.tsx`): speak or type a
  question, get a spoken + actionable answer from real app state (streak, hearts, gems,
  quests with titles, league name, level, verse of the day, any Bible chapter via spoken
  book names — "open first Samuel 2" works). The bridge every assistant triggers is one
  URL: `/?assistant=1&q=…` — Siri Shortcuts today, Assistant routines today, PWA
  long-press shortcuts today; native App Intents (`native/ios/AppIntents.swift`) and App
  Actions (`native/android/app-actions.xml`) are written for the store builds.
  Privacy by design: utterances are matched to intents and discarded — never stored,
  never logged, never in telemetry.
- **Engine regression**: all 91 engine checks pass unchanged; the tap-stream ingest is
  now contract-validated (unknown props dropped, required enforced, values clamped,
  rate-capped at 30/min per IP for the assistant).

## v9.0 — The Exodus Update

- **Splash — the parting of the sea** (Remotion, `src/remotion/`): Papy drifts asleep on
  a quiet sea, a wind passes, the waters part and a golden trail of footprints is
  revealed. Shown once before the auth flow; renders to MP4 for app stores.
- **The learn path is walked, not dotted**: footprints replace the connector dots —
  "Thy word is a lamp unto my feet" (Psalm 119:105), made literal.
- **Scripture microcopy system** (`src/lib/scripture.ts`): one home for every verse
  quoted as interface copy — exact KJV, always cited, with restraint rules (never on
  money surfaces, never on errors, one verse per surface). Streak milestones (3, 7, 12,
  40, 50, 100, 365) each carry their own verse.
- **Sign in / sign up flow**: welcome → create account / sign in / guest. Passwords are
  PBKDF2-SHA256 hashed (WebCrypto) even in the demo — no plaintext anywhere; legacy
  accounts migrate transparently. Password strength feedback, manual invite-code entry.
- **Referral program**: invite links now respect `NEXT_PUBLIC_APP_URL`; reward copy is
  exact (+100 gems friend / +50 referrer / Pro month on subscribe) and carries
  Ecclesiastes 4:9; sign-up captures `?ref=` and hand-typed codes alike.
- **Staff admin consolidation**: the church dashboard now lives only under Staff admin →
  Churches (the standalone `church` view is gone — one door, one truth).
- **Tone pass**: invented value anchors ($849+), fake aggregate ratings (4.9★ / 2,300+),
  countdown pressure ("Four days…", "⏳ Last week…") and "GO PRO" shouting removed from
  every member-facing surface. Hormozi frameworks remain in the B2B pilot materials
  where they belong.
- **Impeccable repo**: CI (web + engine + Rust + C# + audit), Dependabot, SECURITY.md,
  CONTRIBUTING.md, LICENSE, issue/PR templates, in-repo redteam script, portable env.

## Earlier releases


A **Duolingo-style Bible study app** in the spirit of [Scroll Bible App](https://scrollbibleapp.com/) — no ads, no accounts, no tracking — with the full gamification playbook: streaks, XP, hearts, gems, leagues, quests, achievements, **story mode**, and a winding learning path that gets progressively harder.

**What's new in v7 (this build):**

1. ⛪ **Church plans + the B2B dashboard** — the REVENUE.md 90-day plan weeks 3–6, shipped: a 50-seat pilot org (Grace Community, $99/mo, 27/50 seats) with a full admin seat view — cohort progress, **verse coverage** (chapters read against the Bible's 1,189), streak bands, engagement bands, an 8-week cohort trend, a “worth a call this week” shepherding list, and seat management (invite/free seats, admin protected, caps enforced). Your own seat is computed **live** from real lesson completions and Bible reads — the pilot cohort carries an explicitly-seeded weekly snapshot (every number inspectable in `prisma/seed-data/church.ts`). See it in Profile → Church plan or Explore → Church plan.
2. 🎁 **Gift-subscription order bump** — the REVENUE.md 90-day plan weeks 7–10, shipped: a new **checkout step** on every paid paywall path (skip-the-trial + exit downsell) with the “Gift a year of Scroll Pro — $39.99 (reg. $59.99)” order bump — **opt-in only, never pre-checked** (the no-dark-patterns rule). Seasonal copy rotates honestly through the church calendar (Advent/Christmas, Easter, confirmation & baptism, graduation). Codes are crypto-random (`SCROLL-XXXX-XXXX`), redeemed one-time in Profile → Scroll Pro → Redeem a gift; redemption is a guarded atomic claim (race-proof — verified with a 3-way parallel redeem: exactly 1 win, 2 rejected).
3. 📱 **Tab bar consolidated to 4** — mobile keeps only the immediate-use surfaces: **Learn · Bible · Leagues · Profile**. Stories joined Quests, Shop, Community, Friends, Growth Hub, My courses and Practice Hub in **Profile → Explore** (one tap away); the desktop sidebar keeps the full set and adds Church plan.
4. 🧠 **Logic & Fallacies course** — 6 units × 8 lessons (48 with deep practice): what an argument is, deduction/induction/abduction, validity vs soundness, dissecting arguments (conclusion indicators, enthymemes, the principle of charity), formal fallacies (affirming the consequent, denying the antecedent, undistributed middle) and 20+ informal fallacies — ad hominem, strawman, false dilemma, slippery slope, begging the question, equivocation, hasty generalisation, appeal to ignorance… applied honestly to BOTH sides of faith conversations, ending with the Berean method of Acts 17:11. Every KJV quotation verified exact.
5. 🎁 **Real referral program** — `give-a-month-get-a-month` with server-verified rewards: friends join via your link (+100 gems them, +50 you), subscribe to Pro (you bank a free month), milestone ladder at 1/3/5/10 joins (gems → streak freezes → Pro months → Evangelist badge), share sheet + Web Share API, invite ledger, banked-month redemption at renewal.
6. 🛡️ **Red-team hardened** — two adversarial sub-agents attacked the new surface: 11 findings (2 critical race conditions that could mint phantom rewards, self-referral, cap bypasses) — **all fixed** with transactions, unique-keyed milestone grants, atomic single-row claims, crypto-random codes, guarded decrements, body-size limits, and re-verified under the same parallel attacks. See `docs/SECURITY.md` §7. The church/gift surface follows the same pattern (guarded claims, input whitelists, admin-protected seats).
7. 🦀 **Rust ledger core** (`src-tauri/src/ledger.rs`) — native scoring parity for the desktop build: churn model with sign-guarded priors, loyalty tiers, XP math — 8 unit tests, exposed as Tauri commands.
8. ⚙️ **C# ScrollBridge** (`services-csharp/`) — .NET 8 scale-out worker for 600k users: idempotent payment webhooks → referral conversions & entitlements, push dispatch with quiet hours + per-user caps — 18 xUnit tests.
9. 💰 **Revenue architecture to $1M/mo** (`docs/REVENUE.md`) — Hormozi frameworks mapped to shipped features, phased model ($150k → $510k → $1.3M/mo), unit economics (organic LTV:CAC 13.4:1, paid 2.15:1, church 5.5:1), the 12 plays status board — plays #8 (church) and #9 (gifts) are now **✅ shipped in this build**. Plus `docs/SCALE.md` — the 600k-user architecture (Postgres/Redis/queue/CDN, ~$5k/mo infra, 0.5% of Phase-3 revenue).
10. 🧮 **Engine grows to 617 features** (27→28 families) — 8 new `referral.*` signals wired into churn, loyalty and virality scoring; `bun scripts/engine-tests.ts` still 91/91. Checkout and order-bump events now feed the engine too (`checkout_view`, `order_bump_toggle`, `gift_redeemed`).

**What's new in v6 (the previous build):**

1. 📱 **Mobile-optimized** — safe-area insets for notched phones, 44px+ tap targets, no double-tap zoom, momentum scrolling, PWA manifest (installable), lazy-loaded views for fast first paint, and a fixed modal-positioning bug in the TopBar (backdrop-blur containing block).
2. ⛪ **8 popular denominations added** — Catholic, Eastern Orthodox, Pentecostal, Baptist, Anglican, Methodist, Reformed & Presbyterian, Lutheran (most popular first, ordered by global adherents). Each with 2 units × 3 lessons of fair, source-grounded content: history, worship, beliefs and distinctives.
3. 📈 **Progressive difficulty** — every course starts easy (🌱 Foundations: untimed, gentle) and ramps (🔥 Growing → ⚡ Advanced: timed challenges, +5 bonus XP, richer gem drops). A difficulty-ramp strip on the Learn path and per-lesson difficulty chips make the curve visible.
4. 🔔 **Complete notification system** — personal (hearts refilled, level-ups), specific (quest X done, friend requests, league promotion) and timed (verse of the day, daily study reminder at your chosen hour, quiz nudge, evening streak-risk, Monday weekly recap) — all with quiet hours, a 10-category preference panel and a 90-second in-app scheduler.
5. 📧 **Full email journeys** — welcome series (day 0·1·3·7), Scroll Pro offer sequence (day 2·9·21), streak saver, re-engagement (3·7·14 days), Monday weekly digest, milestone celebrations, Pro welcome — each delivered to an inbox log with a full preview dialog in Profile.
6. 👑 **Scroll Pro paywall (Hormozi-built)** — value stack ($849+ anchored), three-tier price anchoring (monthly/annual/lifetime), 30-day “Grow or it's free” guarantee, live founding-cohort countdown + spots-left scarcity, context-matched hooks (hearts-out, lesson-end high, onboarding), exit downsell (50% off / snooze), referral loop, FAQ objection handling — plus unlimited hearts, 2× XP weekends and Streak Repair as real entitlements.

**Tab bar consolidated:** the mobile bottom bar is now **4 tabs — Learn · Bible · Leagues · Profile** (the immediate-use surfaces). Stories joined Quests, Shop, Community, Friends, Growth Hub, My courses, Practice Hub **and the Church dashboard** in **Profile → Explore**, one tap away. The desktop sidebar keeps the full set and adds Church plan.

**✝️ Doctrinal audit — every module reviewed against the Christian faith.** All 18 courses (every teaching card, quiz item, match pair, story scene and checkpoint), plus the daily quiz, verse-of-day, notifications, email journeys and paywall copy, were audited line-by-line against the Nicene core (Trinity, full deity & humanity of Christ, bodily resurrection, salvation by grace, Scripture as God's word, real judgment & heaven/hell). 140+ fixes were applied, including: misattributed quotes corrected to their real authors (Knox's "school of Christ", Durant's "we are what we repeatedly do", Habermas on human rights), two quiz items where a "wrong" answer was actually right (Passover goat, Ex 12:5 — and moksa/nibbana as valid transliterations), one fabricated "Athanasius" quote removed, an unhedged universalist line about hell corrected, Scripture citations repaired (1 Cor 15:22 vs Romans 5, Hebrews 7:2 for "king of peace", Gen 3:5 wording), loose paraphrases of Luther/Wesley/Hooker replaced with documented quotations, and fairness fixes for how Judaism, Islam, Hinduism, Buddhism and the LDS/JW movements are described. A **Statement of Faith** card ("What we believe") in Profile → shows the doctrinal foundation every course is taught and audited against (Acts 17:11).

**✝️ Second doctrinal pass (this build).** Every seed file was re-audited line-by-line (worldviews, apologetics, ethics, existence of God, metaphysics, manuscripts, Bible survey, Greek, Hebrew, study methods, canon history, deep practice, stories and the daily quiz) — 17 further precision fixes, e.g.: the bara (בָּרָא) claim now correctly scoped to the Qal stem; Codex Sinaiticus' column layout corrected (4 columns OT / 2 NT); Origen's canon terms credited via Eusebius; the Maccabean story scene re-dated to 167 BC; the Penzias quote restored to its full published wording; Plantinga's view relabelled theistic Platonism; open theism presented as a modern debate rather than "the tradition"; Col 4:6 / Jas 1:27 / 2 Cor 5:17 quote wordings aligned to the ESV with KJV renderings noted; the serpent's Gen 3:5 line renamed "the oldest lie, not the oldest promise". Verse-of-day notifications now quote the **KJV exactly**, matching the in-app reader; the Statement of Faith gained a **Scripture versions** note; the Catholic course explains which reader canon the app uses. **Zero Nicene-orthodoxy violations found in this pass** — the corpus affirms the Trinity, Christ's full deity and humanity, the bodily resurrection and salvation by grace throughout.

**Freshly enforced Pro entitlements (the paywall's promises are now real code):** 2× XP every Saturday–Sunday for members (wired into the server-side XP math), Streak Repair ×2 topped up automatically every calendar month, and the Advanced-stats weekly chart gated behind Scroll Pro. The email suite also gained a **win-back journey** (day 1 · 3 · 7 after a cancellation, with a 50% comeback offer), a toggleable **Pro-welcome** receipt, real league names in the Monday digest, and honest "audio lessons" wording (no more "offline" promise). Difficulty ramps are now strictly monotonic in every course, and sheets use dynamic-viewport heights with pinch-zoom restored (WCAG 1.4.4) — double-tap zoom is still suppressed via `touch-action`.

**Study tracks (19 courses, 611 lessons, 4,300+ challenges, 20 interactive stories):**

| Course | What you'll learn |
|---|---|
| 🏛️ **Biblical Greek** | The alphabet Α→Ω, the great words of the faith, John 1:1, and the full verb engine (aspect, aorist, moods) |
| 🕎 **Biblical Hebrew** | The 22-letter aleph-bet, nikkud vowels, Torah vocabulary, Genesis 1:1 — and reading the Shema yourself |
| 📜 **Manuscripts & Codices** | Papyrus to parchment, Sinaiticus & Vaticanus, the Dead Sea Scrolls, textual criticism — and how we got the canon |
| 🛡️ **Apologetics** | 1 Peter 3:15, the case for the Bible, the resurrection — and the hardest doctrines (hell, justice, judgment) handled honestly |
| 📖 **The Big Picture** | The whole Bible as one story, with a poetry workshop (parallelism, psalm types, wisdom) |
| 🔍 **Study Skills** | O.I.A. method, genre reading — and figures of speech: idioms, chiasmus, hyperbole |
| 🌍 **Worldviews & Religions** | Judaism, Islam, atheism, Hinduism, Buddhism — and new religious movements (Mormonism, JW) |
| 🧠 **Logic & Fallacies** | What an argument is, deduction·induction·abduction, validity vs soundness, dissecting arguments, formal fallacies, 20+ informal fallacies, cognitive biases — and the Berean method (Acts 17:11) |
| ✨ **The Existence of God** | The full natural-theology curriculum: kalam, contingency, fine-tuning, moral argument, consciousness, reason, the ontological argument — every objection answered |
| ⚖️ **Ethics & the Good Life** | Meta-ethics, utilitarianism vs deontology vs virtue, divine command & natural law, Euthyphro answered, character formation |
| 🌀 **Metaphysics** | The deep grammar of reality: being, act & potency, essence & existence, ipsum esse subsistens, universals, time, eternity, free will |
| ⛪ **Catholic** | The four marks, Peter & the papacy, the 73-book canon, the Mass, seven sacraments, Mary & the rosary |
| ☦️ **Eastern Orthodox** | Unbroken from Pentecost, icons & Nicaea II, the Great Schism, the Divine Liturgy, theosis & the Jesus Prayer |
| 🔥 **Pentecostal** | Azusa Street 1906, baptism in the Spirit, the nine gifts, divine healing, the global movement |
| 🌊 **Baptist** | Smyth & Williams, believer's baptism by immersion, local autonomy, two ordinances, Carey & modern missions |
| 🕯️ **Anglican** | Cranmer's Common Prayer, via media, the 39 Articles, high/low/broad church, the global Communion |
| 🎵 **Methodist** | Wesley & Aldersgate, sanctification, class meetings, the quadrilateral, hymns & social holiness |
| 🌷 **Reformed & Presbyterian** | Calvin & the Institutes, TULIP & Dort, covenant theology, Westminster Standards, the regulative principle |
| 🏰 **Lutheran** | The 95 Theses, faith alone, the Small Catechism, real presence "in, with, under," vocation |

Every course ramps in difficulty — Foundations → Growing → **Advanced (timed challenges)** — so the app gets progressively harder as you progress.

---

## 🎭 Story Mode (dialogue-based scenarios)

A Duolingo-Stories-style player with chat-bubble dialogue, narration cards, and comprehension checkpoints:

- **8 stories across 4 categories** — Bible (Road to Emmaus, Nicodemus at Night, Joseph & the Dreamers), Apologetics (Dinner with a Skeptic), Church history (Paul at the Areopagus, Justin's School in Rome), Languages (First Day of Greek)
- Animated chat bubbles with an emoji cast, spring transitions, tap-to-advance
- Checkpoint questions with correct/wrong feedback and explanations
- Full gamification integration — XP, gems, streak, quests and achievements all advance
- Perfect-comprehension bonus, replay support, and one-tap **sharing to the community feed**

## ✨ Gamification (the full Duolingo playbook)

- **Winding learning path** — sticky unit headers, locked/current/completed nodes with 3D buttons, START bobbing tooltip, pulsing ring on the current node
- **XP & levels** — base XP + first-time, perfect-lesson and combo bonuses, Double XP boost
- **Daily goal ring** — 50 XP/day with animated progress
- **Streaks** — daily streak with flame animation, milestone celebrations (3/7/14/30/100…), **Streak Freeze** protection
- **Hearts** — 5 hearts, lose one per mistake, timed regeneration (10 min), refill via gems or practice
- **Gems economy** — earned from lessons, stories, quests, chests and achievements; spend on freezes, refills, boosts
- **Leagues** — Bronze → Diamond, 15 rivals whose XP ramps through the week, promotion/demotion zones, weekly rollover
- **Daily quests** — deterministic daily quests with progress bars and auto-claimed gem rewards (stories count too)
- **Achievements** — tiered achievements (Wildfire, Sage, Scholar, Flawless, Scribe, Renaissance, Quest Hunter, Bible Reader, Koinonia…)
- **Unit chests & trophy** — 30-gem chest after each unit, trophy at course end
- **Practice hub** — mistakes review that restores hearts

## 🧠 The Scribe's Ledger — retention, loyalty & gamification intelligence engine

A closed-loop personalization engine with **609 behavioral features** (27 families) and **544 live gamification variables** (18 domains), built to grow revenue the honest way — by making the app worth returning to daily, then asking for the sale at the moment of peak value:

- **Scores every learner** — churn risk (learned logistic model), engagement, loyalty tiers (Parchment → Scroll → Codex → Library), willingness-to-pay, 90-day LTV, burnout risk, best study hour, habit stage
- **Decides next-best-actions** — ten action kinds with expected utility, guardrails (caps, cooldowns, quiet hours) and a human-readable "why" shown to the user
- **Runs 10 Thompson-sampling experiments** — paywall hook/anchor/headline/CTA, nudge tone, quest mix, reward boost, win-back depth, digest day, session-end hook
- **Improves over time** — nightly self-training loop (`bun run engine:train`) refits the churn model from point-in-time history with sign-guarded SGD and honest holdout AUC reporting; adaptive config (best-hour EWMA, fatigue backoff, quest-mix momentum) updates live
- **Fully transparent** — Profile → **Your insights** shows your loyalty tier, study rhythm, habit health and the engine's current recommendations *with the reasons why* — and a one-tap switch turns personalized offers off entirely
- **Algorithmically bullet-proofed** — `bun run engine:test` runs a 91-check adversarial suite (all-zero / all-extreme / all-NaN feature sets, boundary timestamps, pathological scores): no NaN, Infinity or crash can ever reach gameplay
- Full design doc: [`docs/ENGINE.md`](docs/ENGINE.md) · machine-readable registry: [`docs/ENGINE-REGISTRY.md`](docs/ENGINE-REGISTRY.md)

## 🛡 Security — GLM red/blue-team audited

Audited by adversarial attack simulation (red team) and hardened (blue team): **25/25 attack vectors defended** — XSS, SQL/path injection, prototype pollution, type confusion, oversized payloads, plan tampering, answer forgery, method abuse, IDOR, rate-limit bypass. Hardening includes input whitelists everywhere, body-size guards, rate limits, five security headers, and a validating event-ingestion boundary. Full report: [`docs/SECURITY.md`](docs/SECURITY.md).

## 📖 The Bible itself

- **Full Bible text** (public-domain translation, all 66 books) in a reader with verse highlighting and five highlight colors
- **Red-letter edition** ✝️ — the words of God and of our Lord Jesus Christ set in deep red (2,082 verses: every word of Christ in the Gospels, Acts, Corinthians and Revelation, plus the direct speech of the LORD in the Law and key OT passages — verified 100% against the KJV text by `bun run redletter:verify`). One-tap toggle in the reader header
- **Bookmarks and notes** on any verse
- **Reading plans** with day-by-day check-offs
- Reading chapters awards XP and advances streaks and quests

## 👥 Community & friends

- **Friends system** — add friends from suggestions, send/accept requests, see streaks and weekly XP
- **Community feed** — post achievements, streaks, verses, plan progress and story completions; like and comment

## 🧑‍🎨 Avatars

- Fully customizable SVG avatar — skin, hair, eyes, outfit, accessories
- **Crucifix options** (wooden and gold) among the accessories

## 🎮 UX details

- **Haptics** — Web Vibration API patterns for correct/wrong/combo/complete (toggleable)
- **Sound** — fully synthesized Web Audio effects (no audio files): correct chime, wrong buzz, combo ticks, completion fanfare
- **Animations** — framer-motion everywhere: page transitions, progress springs, combo chip, confetti results screen, count-up stats, shake on wrong answers
- **Notifications** — in-app notification center + real browser notifications (streak-at-risk, quest complete, achievements)
- **Mascot** — "Papy" the animated scroll character with moods (happy, cheer, sad, think)
- **Mobile-first** — bottom nav on phones (7 items incl. Stories), sidebar on desktop, safe-area aware, 44px+ touch targets

## 🛠 Tech stack (free & open-source first)

| Layer | Tech |
|---|---|
| Framework | **Next.js 16** (App Router) + TypeScript |
| Styling | Tailwind CSS 4 + custom Duolingo-style design system |
| Database | **Prisma ORM + SQLite** (local, offline, zero-config) |
| State | Zustand (client) + TanStack Query (server) |
| Animation | framer-motion + canvas-confetti |
| Audio/Haptics | Web Audio API + Vibration API |
| Desktop packaging | **Rust + Tauri 2** (`src-tauri/`) with a fully offline sidecar server |

### Run the web app

```bash
bun install
bun run db:push          # create the SQLite schema
bun prisma/seed.ts       # seed courses, stories, quests, achievements, leagues
bun run demo:seed-history   # (optional) rich 3-week demo learner history
bun run engine:backfill     # (optional) seed the engine's 45-day event history
bun run engine:train        # (optional) run the self-improvement loop once
bun run dev              # http://localhost:3000
```

Verification suites:

```bash
bun run engine:test      # 91-check adversarial algorithm suite
bun run redletter:verify # red-letter integrity vs the KJV text
bun run engine:report    # registry report + regenerate docs/ENGINE-REGISTRY.md
bun run engine:smoke     # engine sanity check
```

### Package as a native desktop app (Rust, fully offline)

The `src-tauri/` shell ships the **entire app — server, database and Bible text —
inside the native binary**. No internet, no Node install, nothing required:

```bash
cargo install tauri-cli --version "^2"   # one-time
bun run desktop:icons    # once — renders PNG/ICO/ICNS from the SVG
bun run desktop:prepare  # builds the standalone server + seeds the desktop DB + sidecar
cargo tauri build        # .AppImage / .deb / .msi / .dmg
```

See [`src-tauri/README.md`](src-tauri/README.md) for the full architecture:
the Rust shell copies the bundled server + pre-seeded SQLite into the OS
app-data directory on first run, spawns a bundled Bun runtime sidecar on
`127.0.0.1:3313`, waits for readiness, and only then reveals the window.
Tauri plugins included:

- `tauri-plugin-notification` — native OS notifications for streak reminders
- `tauri-plugin-vibration` — native haptics on Android
- `tauri-plugin-shell` — sidecar lifecycle (spawn, readiness, shutdown)

### Reset the demo data

```bash
bun scripts/reset-demo.ts   # keeps profile + chosen course, clears progress
```

## 📁 Project structure

```
prisma/
  schema.prisma           # full gamification + story-mode data model
  seed.ts                 # seeder orchestration
  seed-data/              # course content:
                          #   greek, hebrew, bibleSurvey, studyMethods,
                          #   worldviews, manuscripts, apologetics,
                          #   existence, ethics, metaphysics, expansions,
                          #   stories, meta (quests, achievements, bots…)
src/
  app/api/                # bootstrap, courses, lessons, complete, practice,
                          # hearts, leaderboard, quests, shop, chests,
                          # notifications, profile, settings, bible, plans,
                          # friends, community, stories, referral,
                          # church (B2B dashboard + seats), gift (order bump)
  lib/gamification.ts     # streaks, quests, leagues, achievements, hearts engine
  lib/client/             # sound synth, haptics, notifications, zustand store
  components/scroll/      # the whole UI (path, lesson player, story player,
                          # bible reader, community, avatar builder, views)
src-tauri/                # Rust desktop shell (offline sidecar architecture)
scripts/
  prepare-desktop.mjs     # desktop build pipeline
  make-icons.mjs          # PNG/ICO/ICNS icon generation
  desktop-server.js       # the offline server launcher (sidecar entry)
```

## 📖 Content notes

All lesson content is written to be scholarly and fair: manuscript counts and dates reflect standard references (Sinaiticus ~AD 330–360, Dead Sea Scrolls 1947, ~5,800+ Greek NT manuscripts), the apologetics and Existence-of-God courses present the classical arguments alongside how philosophers actually debate them (objections and replies), the worldviews course describes other faiths respectfully while marking real differences, and language lessons use real verses (John 1:1, Genesis 1:1, Deuteronomy 6:4, Psalm 117) with accurate transliterations.

*"Your word is a lamp to my feet and a light for my path." — Psalm 119:105*
