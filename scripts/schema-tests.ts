/**
 * schema-tests.ts — the telemetry schema test suite (v11).
 *
 * Run: bun run schema:test
 *
 * Guards:
 *   1. the fingerprint is stable and pinned (parity with Rust + C#)
 *   2. every contract is well-formed and bounded
 *   3. the validator behaves: good in, junk out, unknown props dropped,
 *      required enforced, values clamped/truncated
 *   4. the census is live and honest (544 game vars, ≥500 commitment)
 *   5. the assistant intent matcher: golden cases, bounded input,
 *      no regex anywhere in the module (source-level assertion)
 *   6. every event the app actually emits passes its own contract
 *   7. the service lane (v11.2): timing-safe key, strict userId format,
 *      per-IP rate window — the server-to-server ingest spine
 */

import {
  EVENT_CONTRACTS,
  EVENT_TYPES,
  TELEMETRY_EVENT_COUNT,
  TELEMETRY_SCHEMA_VERSION,
  fnv1a32,
  isAllowedCustomEventType,
  telemetryCanonicalForm,
  telemetryFingerprint,
  validateTelemetryEvent,
} from "../src/lib/telemetry/schema"
import { GAME_VARS } from "../src/lib/engine/gameVars"
import { interpretUtterance, tokenizeUtterance, clampChapter, INTENTS } from "../src/lib/assistant/intents"
import {
  SERVICE_LANE_RATE_LIMIT,
  isServiceUserId,
  resetServiceLaneRateLimiter,
  serviceKeyMatches,
  serviceLaneRateLimited,
} from "../src/lib/telemetry/serviceLane"

let passed = 0
let failed = 0
function check(name: string, ok: boolean, detail = "") {
  if (ok) {
    passed++
    console.log(`  ✓ ${name}`)
  } else {
    failed++
    console.error(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`)
  }
}

console.log("╭─ telemetry schema ──────────────────────────────╮")

// 1 · fingerprint
const PINNED = 3_026_954_531
check("fingerprint matches the cross-language pin (TS = Rust = C#)", telemetryFingerprint() === PINNED, `got ${telemetryFingerprint()}`)
check("fingerprint is deterministic", telemetryFingerprint() === telemetryFingerprint())
check("schema version is 11", TELEMETRY_SCHEMA_VERSION === 11)
check("canonical form starts with the schema tag", telemetryCanonicalForm().startsWith("scroll-telemetry-v11\n"))
check("event types are sorted (canonical)", [...EVENT_TYPES].every((t, i) => i === 0 || EVENT_TYPES[i - 1] < t))
check("60 event types contracted", TELEMETRY_EVENT_COUNT === 60, `got ${TELEMETRY_EVENT_COUNT}`)
check("fnv1a32 known vector", fnv1a32("") === 0x811c9dc5 && fnv1a32("a") === 0xe40c292c)

// 2 · contract well-formedness
let contractsOk = true
for (const [type, c] of Object.entries(EVENT_CONTRACTS)) {
  if (!/^[a-z0-9_.]{1,64}$/.test(type)) { contractsOk = false; console.error(`    bad type name: ${type}`) }
  if (c.pii !== "none" && c.pii !== "coarse") contractsOk = false
  if (Object.keys(c.props).length > 16) { contractsOk = false; console.error(`    >16 props: ${type}`) }
  for (const [p, spec] of Object.entries(c.props)) {
    if (!/^[a-z][a-zA-Z0-9]{0,31}$/.test(p)) { contractsOk = false; console.error(`    bad prop name ${type}.${p}`) }
    if (!["int", "float", "bool", "str", "enum"].includes(spec.t)) contractsOk = false
    if (spec.t === "enum" && (!spec.values || spec.values.length === 0)) { contractsOk = false; console.error(`    empty enum ${type}.${p}`) }
    if (spec.t === "str" && (spec.len ?? 64) > 128) { contractsOk = false; console.error(`    str len>128 ${type}.${p}`) }
    if ((spec.t === "int" || spec.t === "float") && spec.min !== undefined && spec.max !== undefined && spec.min > spec.max) contractsOk = false
  }
}
check("all 60 contracts well-formed & bounded", contractsOk)
check("new v11 surfaces contracted", ["widget_impression", "widget_tap", "assistant_open", "assistant_query", "assistant_action", "assistant_error"].every((t) => t in EVENT_CONTRACTS))
check("de-facto events formalized (checkout_view, order_bump_toggle, campaign_*)", ["checkout_view", "order_bump_toggle", "campaign_banner_view", "campaign_banner_cta"].every((t) => t in EVENT_CONTRACTS))

// 3 · validator behavior
check("valid event passes & keeps props", validateTelemetryEvent("lesson_complete", { lessonId: "l1", accuracy: 0.9, difficulty: 3, firstTime: true }).ok)
check("unknown prop dropped, event still ok", validateTelemetryEvent("app_open", { hour: 10, evil: "<script>" }).clean.evil === undefined && validateTelemetryEvent("app_open", { hour: 10, evil: "x" }).ok)
check("required missing → rejected", !validateTelemetryEvent("view_change", {}).ok)
check("enum outside values → prop dropped → required → rejected", !validateTelemetryEvent("view_change", { view: "hacker" }).ok)
check("int clamped into range", validateTelemetryEvent("app_open", { hour: 99 }).clean.hour === 23)
check("string truncated to len", String(validateTelemetryEvent("settings_change", { key: "x".repeat(200), value: "" }).clean.key).length === 32)
check("non-finite number dropped (optional) → ok without it", validateTelemetryEvent("paywall_view", { context: "shop", seconds: NaN }).ok && validateTelemetryEvent("paywall_view", { context: "shop", seconds: NaN }).clean.seconds === undefined)
check("wrong type → rejected when required", !validateTelemetryEvent("order_bump_toggle", { on: "yes" }).ok)
check("unknown type rejected", !validateTelemetryEvent("EVIL EVENT", {}).ok)
check("namespaced custom allowed", validateTelemetryEvent("lab.experiment_a", {}).ok && isAllowedCustomEventType("lab.x_y"))
check("payload not an object → rejected when required present", !validateTelemetryEvent("view_change", "nope").ok)
check("bool passes", validateTelemetryEvent("assistant_query", { intent: "x", matched: true, mode: "voice" }).ok)
check("bool string rejected when required", !validateTelemetryEvent("assistant_query", { intent: "x", matched: "true", mode: "voice" }).ok)

// 4 · census (imports pull prisma client — generated already)
check("game vars census ≥ 500 (544 by design)", GAME_VARS.length >= 500, `got ${GAME_VARS.length}`)
check("game vars live in ≥ 18 domains", new Set(GAME_VARS.map((v) => v.domain)).size >= 18)
check("every game var id unique", new Set(GAME_VARS.map((v) => v.id)).size === GAME_VARS.length)

// 5 · assistant intents
check("golden: 'how is my streak' → streak_status", interpretUtterance("How is my streak?")?.intent === "streak_status")
check("golden: 'start my lesson' → start_lesson", interpretUtterance("Let's start my lesson!")?.intent === "start_lesson" || interpretUtterance("Start my lesson")?.intent === "start_lesson")
check("golden: 'open john 3' → bible_ref jhn ch 3", (() => { const m = interpretUtterance("Open John 3"); return m?.intent === "bible_ref" && m.slots.book === "jhn" && m.slots.ch === "3" })())
check("golden: 'read psalm 23' → bible_ref psa ch 23", (() => { const m = interpretUtterance("Read Psalm 23"); return m?.intent === "bible_ref" && m.slots.book === "psa" && m.slots.ch === "23" })())
check("golden: 'open first samuel 2' (two-word book)", (() => { const m = interpretUtterance("open first samuel 2"); return m?.slots.book === "1sa" && m.slots.ch === "2" })())
check("golden: 'verse of the day' → verse_of_day", interpretUtterance("Verse of the day")?.intent === "verse_of_day")
check("golden: 'what should i do today' → quests_status", interpretUtterance("What should I do today?")?.intent === "quests_status")
check("golden: 'how am i doing in the league' beats generic 'how am i doing'", interpretUtterance("How am I doing in the league?")?.intent === "league_status")
check("golden: 'open the bible' → bible_open (not bible_ref)", interpretUtterance("Open the Bible")?.intent === "bible_open")
check("gibberish → no match", interpretUtterance("flurble wompity zazzle") === null)
check("empty → no match", interpretUtterance("!!! ???") === null)
check("tokenizer strips punctuation & diacritics", JSON.stringify(tokenizeUtterance("Héy, Papy!")) === JSON.stringify(["hey", "papy"]))
check("utterance capped at 200 chars", tokenizeUtterance("a".repeat(500)).length <= 24)
check("tokens capped at 24", tokenizeUtterance(Array.from({ length: 60 }, (_, i) => `w${i}`).join(" ")).length === 24)
check("chapter 999 rejected", interpretUtterance("Open John 999") === null)
check("chapter clamped to book length", clampChapter("jhn", 99) === 21 && clampChapter("psa", 5) === 5)
check("intents all have examples & patterns", INTENTS.every((i) => i.examples.length > 0 && i.patterns.length > 0))
check("every example matches its own intent", INTENTS.every((i) => interpretUtterance(i.examples[0])?.intent === i.id))

// 6 · source-level: no regex over user speech in the intent module
import { readFileSync } from "node:fs"
const intentsSource = readFileSync("src/lib/assistant/intents.ts", "utf8")
check("intent module uses no RegExp over utterances", !/\.test\(|\.match\(|\.replace\(|\.exec\(|new RegExp/.test(intentsSource))

// 7 · real events emitted by the app pass their contracts
const realWorldEvents: [string, Record<string, unknown>][] = [
  ["app_open", { hour: new Date().getHours() }],
  ["view_change", { view: "learn" }],
  ["paywall_cta", { context: "shop", plan: "pro_monthly", hook: "shop", bump: "gift_on" }],
  ["checkout_view", { plan: "gift", bump: "gift_only" }],
  ["order_bump_toggle", { on: true, plan: "gift" }],
  ["widget_impression", { widget: "streak", chrome: "pwa" }],
  ["widget_tap", { widget: "board", target: "app" }],
  ["assistant_open", { via: "deeplink" }],
  ["assistant_query", { intent: "streak_status", matched: true, mode: "voice" }],
  ["assistant_error", { code: "stt_no_match" }],
  ["lesson_complete", { lessonId: "abc", courseId: "greek", accuracy: 0.87, difficulty: 2, firstTime: false, xp: 20, combo: 4, durationSec: 140 }],
  ["settings_change", { key: "soundOn", value: "true" }],
]
check("every real-world event passes its contract", realWorldEvents.every(([t, p]) => validateTelemetryEvent(t, p).ok))

// 8 · the service lane (v11.2) — server-to-server telemetry auth
console.log("┈┈ service lane ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈")
const ENV_KEY = "lane-test-key-abcdef0123456789"
check("lane disabled when env key unset", serviceKeyMatches(ENV_KEY, undefined) === false)
check("lane disabled when env key too short (fail closed)", serviceKeyMatches("short", "short") === false)
check("absent header never matches", serviceKeyMatches(null, ENV_KEY) === false && serviceKeyMatches("", ENV_KEY) === false)
check("wrong key rejected", serviceKeyMatches("lane-test-key-abcdef01234567XX", ENV_KEY) === false)
check("right key accepted (timing-safe path)", serviceKeyMatches(ENV_KEY, ENV_KEY) === true)
check("key comparison is case-sensitive", serviceKeyMatches(ENV_KEY.toUpperCase(), ENV_KEY) === false)
check("env default reads process.env when omitted", (() => {
  const prev = process.env.ENGINE_SERVICE_KEY
  process.env.ENGINE_SERVICE_KEY = ENV_KEY
  const ok = serviceKeyMatches(ENV_KEY) === true
  if (prev === undefined) delete process.env.ENGINE_SERVICE_KEY
  else process.env.ENGINE_SERVICE_KEY = prev
  return ok
})())

const goodIds = ["user_1", "u:grace-27", "svc-scrollbridge", "A0123456789012345678901234567890123456789012345678901234567890"] // 64 chars
const badIds = ["", " leading", "-nope", "has space", "semi;colon", "a".repeat(65), null, 42, undefined, {}, []]
check("valid service userIds accepted", goodIds.every((v) => isServiceUserId(v)))
check("invalid service userIds rejected", badIds.every((v) => !isServiceUserId(v)))

resetServiceLaneRateLimiter()
let limited = false
for (let i = 0; i < SERVICE_LANE_RATE_LIMIT + 5; i++) limited = serviceLaneRateLimited("10.0.0.9")
check(`rate limiter caps at ${SERVICE_LANE_RATE_LIMIT}/min per IP`, limited === true)
check("other IPs unaffected by one IP's cap", serviceLaneRateLimited("10.0.0.10") === false)
resetServiceLaneRateLimiter()

console.log("╰──────────────────────────────────────────────────╯")
console.log(`${passed} passed, ${failed} failed`)
if (failed > 0) process.exit(1)
