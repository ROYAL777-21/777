/**
 * schema.ts — THE TELEMETRY SCHEMA (v11)
 *
 * One versioned, machine-readable contract for every event the Scribe's
 * Ledger collects. This is the schema for the 500+-variable engine: the
 * tap stream (EngineEvent) is the raw feed, `features.ts` (617 signals)
 * and `gameVars.ts` (544 variables) are the consumers — this file defines
 * what may ever enter the stream, from whom, in what shape.
 *
 * Where it runs:
 *   · client  `lib/client/engine.ts` validates BEFORE queueing (fast fail,
 *     smaller payloads, no junk over the wire)
 *   · server  `lib/engine/events.ts` validates AGAIN as the authoritative
 *     boundary (never trust the client)
 *   · introspection  GET /api/engine/schema  (version, fingerprint,
 *     contracts, census) — the C# ScrollBridge and the Tauri Rust shell
 *     pin the same fingerprint so drift is caught at startup, not in prod
 *
 * Schema rules:
 *   1. Every event type is declared here with a payload contract.
 *   2. Unknown payload properties are DROPPED (forward compatibility:
 *      an old server never rejects a new client; it just ignores what it
 *      doesn't know). A missing REQUIRED property rejects the event.
 *   3. PII classes: "none" (default) or "coarse" (hour of day, bounded
 *      error text). No free text, no verse content, no transcripts —
 *      the assistant never logs what you said, only which intent fired.
 *   4. The fingerprint (FNV-1a over the canonical form) changes whenever
 *      the contract set changes; bump TELEMETRY_SCHEMA_VERSION with it.
 *   5. Namespaced custom events (`a.b_c`, ≤64 chars) remain allowed as an
 *      escape hatch — they carry no contract, payload still bounded.
 */

// ─────────────────────────────────────────────────────────────
//  version & fingerprint
// ─────────────────────────────────────────────────────────────

export const TELEMETRY_SCHEMA_VERSION = 11

export type PiiClass = "none" | "coarse"

// ─────────────────────────────────────────────────────────────
//  property specs
// ─────────────────────────────────────────────────────────────

export type PropType = "int" | "float" | "bool" | "str" | "enum"

export interface PropSpec {
  t: PropType
  /** required props must be present and valid or the event is rejected */
  r?: boolean
  /** numeric bounds (inclusive) */
  min?: number
  max?: number
  /** string/enum length bound */
  len?: number
  /** allowed values for enum */
  values?: readonly string[]
  /** PII class — "coarse" is the ceiling; there is no "personal" */
  pii?: PiiClass
}

export interface EventContract {
  desc: string
  props: Record<string, PropSpec>
  pii: PiiClass
}

// small helpers keep the contract table readable
const S = (len = 64, r = false): PropSpec => ({ t: "str", len, r })
const E = (values: readonly string[], r = true): PropSpec => ({ t: "enum", values, r })
const I = (min: number, max: number, r = false): PropSpec => ({ t: "int", min, max, r })
const F = (min: number, max: number, r = false): PropSpec => ({ t: "float", min, max, r })
const B = (r = false): PropSpec => ({ t: "bool", r })

/** the app's views (mirrors View in lib/client/store.ts) */
const VIEWS = [
  "learn", "stories", "bible", "community", "friends", "practice-hub",
  "leaderboard", "quests", "shop", "profile", "avatar", "courses", "growth", "admin",
] as const

/** paywall surfaces (mirrors the paywall context union in the store) */
const PAYWALL_CTX = ["onboarding", "hearts", "shop", "profile", "lessonEnd", "gift", "general"] as const

// ─────────────────────────────────────────────────────────────
//  the contracts (60 event types)
// ─────────────────────────────────────────────────────────────

export const EVENT_CONTRACTS: Record<string, EventContract> = {
  // ── session & navigation ──
  app_open: { desc: "app opened (web, PWA or desktop)", pii: "coarse", props: { hour: { ...I(0, 23), pii: "coarse" } } },
  view_change: { desc: "main view switched", pii: "none", props: { view: E(VIEWS) } },
  course_change: { desc: "active course switched", pii: "none", props: { courseId: S(64, true) } },

  // ── learning ──
  lesson_start: { desc: "lesson opened", pii: "none", props: { lessonId: S(64), courseId: S(64) } },
  lesson_complete: {
    desc: "lesson finished (server tap)",
    pii: "none",
    props: {
      lessonId: S(64), courseId: S(64), accuracy: F(0, 1), difficulty: I(1, 5),
      firstTime: B(), xp: I(0, 500), combo: I(0, 50), durationSec: I(0, 7200),
    },
  },
  story_complete: { desc: "story finished", pii: "none", props: { storyId: S(64), xp: I(0, 500), perfect: B() } },
  quiz_complete: { desc: "daily quiz finished", pii: "none", props: { score: I(0, 20), total: I(1, 20), xp: I(0, 500) } },
  chapter_read: { desc: "bible chapter read", pii: "none", props: { bookId: S(8, true), chapter: I(1, 150, true) } },
  verse_mark: { desc: "verse highlighted in the reader", pii: "none", props: { bookId: S(8, true), chapter: I(1, 150, true), verse: I(1, 200, true), color: S(8) } },
  plan_checkoff: { desc: "reading-plan day checked off", pii: "none", props: { planId: S(64, true), day: I(1, 400) } },
  placement_done: { desc: "placement test finished", pii: "none", props: { courseId: S(64), score: I(0, 100) } },

  // ── social ──
  post_create: { desc: "community post created", pii: "none", props: { hasAttachment: B() } },
  comment_create: { desc: "comment created", pii: "none", props: {} },
  like: { desc: "post liked", pii: "none", props: { targetUserId: S(64) } },
  friend_add: { desc: "friend added", pii: "none", props: {} },
  share: { desc: "share sheet used", pii: "none", props: { kind: E(["achievement", "streak", "verse", "plan", "course", "referral"], false), channel: S(32) } },
  invite: { desc: "referral invite sent", pii: "none", props: { channel: S(32) } },

  // ── messaging outcomes ──
  notification_open: { desc: "in-app/browser notification opened", pii: "none", props: { type: S(32), journey: S(32) } },
  email_open: { desc: "journey email opened", pii: "none", props: { journey: S(32) } },
  email_cta: { desc: "journey email button clicked", pii: "none", props: { journey: S(32) } },

  // ── next-best-actions ──
  nba_shown: { desc: "engine decision surfaced", pii: "none", props: { kind: S(32, true), variant: S(32), channel: S(16) } },
  nba_used: { desc: "engine decision acted on", pii: "none", props: { kind: S(32, true), variant: S(32), channel: S(16) } },
  nba_dismissed: { desc: "engine decision dismissed", pii: "none", props: { kind: S(32, true), variant: S(32), channel: S(16) } },

  // ── monetization surfaces ──
  paywall_open: { desc: "paywall opened", pii: "none", props: { context: E(PAYWALL_CTX), hook: S(32) } },
  paywall_view: { desc: "paywall dwell snapshot", pii: "none", props: { context: E(PAYWALL_CTX), hook: S(32), seconds: I(0, 3600) } },
  paywall_dismiss: { desc: "paywall closed without buying", pii: "none", props: { context: E(PAYWALL_CTX), seconds: I(0, 3600), via: S(32) } },
  paywall_cta: { desc: "paywall plan chosen", pii: "none", props: { context: E(PAYWALL_CTX), plan: S(32), hook: S(32), bump: E(["off", "gift_on", "gift_off", "gift_only"], false) } },
  paywall_invite_shown: { desc: "engine-invited paywall shown", pii: "none", props: { context: E(PAYWALL_CTX), hook: S(32) } },
  paywall_complaint: { desc: "user reported offer fatigue", pii: "none", props: {} },
  checkout_view: { desc: "checkout step viewed", pii: "none", props: { plan: S(32, true), bump: S(16) } },
  order_bump_toggle: { desc: "gift order-bump toggled", pii: "none", props: { on: B(true), plan: S(32) } },
  pro_activate: { desc: "Scroll Pro granted/activated", pii: "none", props: { plan: S(32), months: I(0, 36) } },
  purchase: { desc: "purchase completed (payment provider)", pii: "none", props: { plan: S(32), amountCents: I(0, 1_000_000), bump: S(16) } },
  winback_view: { desc: "winback offer shown", pii: "none", props: { depth: I(0, 100) } },
  winback_accept: { desc: "winback offer accepted", pii: "none", props: { depth: I(0, 100) } },
  winback_snooze: { desc: "winback offer snoozed", pii: "none", props: {} },

  // ── game economy ──
  heart_refill: { desc: "hearts restored", pii: "none", props: { source: E(["regen", "shop", "pro", "referral"], false) } },
  heart_lost: { desc: "heart consumed by a mistake", pii: "none", props: { heartsLeft: I(0, 5) } },
  hearts_empty: { desc: "all hearts spent", pii: "none", props: {} },
  freeze_used: { desc: "streak freeze consumed overnight", pii: "none", props: { freezesLeft: I(0, 5) } },
  streak_repair: { desc: "streak repaired", pii: "none", props: { via: E(["pro", "gems", "referral"], false) } },
  chest_open: { desc: "reward chest opened", pii: "none", props: { chestId: S(64) } },
  quest_complete: { desc: "daily quest completed", pii: "none", props: { questId: S(64), metric: S(32) } },
  achievement_unlock: { desc: "achievement tier unlocked", pii: "none", props: { achievementId: S(64, true), tier: I(1, 5) } },
  keyboard_use: { desc: "custom keyboard used in a TYPE challenge", pii: "none", props: { keyboard: S(32) } },

  // ── settings & system ──
  settings_change: { desc: "a preference changed", pii: "none", props: { key: S(32, true), value: S(32) } },
  client_error: { desc: "client-side error breadcrumb", pii: "coarse", props: { message: { ...S(128), pii: "coarse" }, source: S(64) } },
  api_error: { desc: "API call failed", pii: "none", props: { route: S(64), status: I(400, 599) } },
  complaint: { desc: "user filed a complaint", pii: "none", props: { kind: S(32) } },
  session_end_after_mistake: { desc: "learner quit right after a mistake", pii: "none", props: { mistakes: I(1, 50) } },
  ledger_rebuild: { desc: "engine snapshot recomputed", pii: "none", props: { features: I(0, 2000), game: I(0, 2000) } },
  engine_train: { desc: "nightly training ran", pii: "none", props: { adopted: B(), auc: F(0, 1) } },

  // ── campaigns ──
  campaign_banner_view: { desc: "campaign banner shown (Advent…)", pii: "none", props: { campaign: S(32, true), phase: S(32) } },
  campaign_banner_cta: { desc: "campaign banner tapped", pii: "none", props: { campaign: S(32, true) } },

  // ── widgets (v11) ──
  widget_impression: {
    desc: "a widget surface rendered (home-screen board or desktop companion)",
    pii: "none",
    props: { widget: E(["streak", "verse", "xp", "board"], true), chrome: E(["web", "pwa", "desktop"], false) },
  },
  widget_tap: {
    desc: "widget tapped through to the app",
    pii: "none",
    props: { widget: E(["streak", "verse", "xp", "board"], true), target: E(["app", "bible"], false) },
  },

  // ── Ask Papy assistant (v11) ──
  assistant_open: { desc: "assistant sheet opened", pii: "none", props: { via: E(["button", "deeplink", "shortcut", "desktop"], true) } },
  assistant_query: {
    // PRIVACY: the utterance itself is NEVER recorded — only the matched
    // intent id. See docs/TELEMETRY-SCHEMA.md § Privacy.
    desc: "an assistant query was interpreted (intent only, never the words)",
    pii: "none",
    props: { intent: S(32), matched: B(true), mode: E(["voice", "typed", "deeplink"], true) },
  },
  assistant_action: { desc: "assistant answer actioned", pii: "none", props: { intent: S(32, true) } },
  assistant_error: {
    desc: "assistant failed to complete a request",
    pii: "none",
    props: { code: E(["timeout", "stt_denied", "stt_unsupported", "stt_no_match", "network"], true) },
  },
}

/** the canonical event-type list (sorted) — mirrored in Rust + C# */
export const EVENT_TYPES: readonly string[] = Object.keys(EVENT_CONTRACTS).sort()

/** namespaced custom events stay allowed: `a.b_c`, lowercase, ≤64 chars */
const NAMESPACED_RE = /^[a-z0-9_.]{1,64}$/

export function isKnownEventType(type: string): boolean {
  return Object.prototype.hasOwnProperty.call(EVENT_CONTRACTS, type)
}

export function isAllowedCustomEventType(type: string): boolean {
  return NAMESPACED_RE.test(type)
}

// ─────────────────────────────────────────────────────────────
//  validation
// ─────────────────────────────────────────────────────────────

export interface ValidatedEvent {
  ok: boolean
  /** the cleaned payload (unknown props dropped, values coerced/clamped) */
  clean: Record<string, string | number | boolean>
  errors: string[]
}

/**
 * Validate one event against its contract.
 * Server-authoritative: unknown props are dropped, required missing → reject,
 * out-of-range numbers → clamp into range, overlong strings → truncate,
 * wrong types → drop the prop (and reject if it was required).
 */
export function validateTelemetryEvent(type: string, payload: unknown): ValidatedEvent {
  const result: ValidatedEvent = { ok: false, clean: {}, errors: [] }
  if (typeof type !== "string" || type.length === 0 || type.length > 64) {
    result.errors.push("type")
    return result
  }
  const contract = EVENT_CONTRACTS[type]
  if (!contract && !isAllowedCustomEventType(type)) {
    result.errors.push("type:unknown")
    return result
  }
  const props = contract?.props ?? {}
  const src = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {}
  for (const [key, spec] of Object.entries(props)) {
    const v = src[key]
    if (v === undefined || v === null) {
      if (spec.r) result.errors.push(`${key}:required`)
      continue
    }
    switch (spec.t) {
      case "bool":
        if (typeof v === "boolean") result.clean[key] = v
        else if (spec.r) result.errors.push(`${key}:bool`)
        break
      case "int":
      case "float": {
        const n = typeof v === "number" ? v : Number(v)
        if (typeof n === "number" && Number.isFinite(n)) {
          let x = spec.t === "int" ? Math.round(n) : n
          if (spec.min !== undefined) x = Math.max(spec.min, x)
          if (spec.max !== undefined) x = Math.min(spec.max, x)
          result.clean[key] = x
        } else if (spec.r) result.errors.push(`${key}:number`)
        break
      }
      case "enum":
        if (typeof v === "string" && spec.values?.includes(v)) result.clean[key] = v
        else if (spec.r) result.errors.push(`${key}:enum`)
        break
      case "str": {
        if (typeof v === "string") result.clean[key] = v.slice(0, spec.len ?? 64)
        else if (spec.r) result.errors.push(`${key}:str`)
        break
      }
    }
  }
  // hard bound: never accept more than 16 props from any client
  result.ok = result.errors.length === 0 && Object.keys(result.clean).length <= 16
  return result
}

// ─────────────────────────────────────────────────────────────
//  fingerprint — parity across TS · Rust (Tauri) · C# (ScrollBridge)
// ─────────────────────────────────────────────────────────────

/** canonical form: schema tag + sorted event types */
export function telemetryCanonicalForm(): string {
  return `scroll-telemetry-v${TELEMETRY_SCHEMA_VERSION}\n${EVENT_TYPES.join("\n")}`
}

/** FNV-1a 32-bit (wrapping) — identical arithmetic in Rust/C# */
export function fnv1a32(s: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

export function telemetryFingerprint(): number {
  return fnv1a32(telemetryCanonicalForm())
}

export const TELEMETRY_EVENT_COUNT = EVENT_TYPES.length
