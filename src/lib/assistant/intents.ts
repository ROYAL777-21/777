/**
 * intents.ts — the Ask Papy intent engine (v11).
 *
 * ONE shared definition, used by BOTH the server route
 * (/api/assistant/interpret) and the client's offline fallback — so a
 * voice command means the same thing everywhere.
 *
 * Engineering rules (this is a security surface too):
 *   · tokenized matching — the tokenizer strips everything except
 *     [a-z0-9] via a charCode loop; NO regex runs over user speech
 *     anywhere in this module (ReDoS-impossible by construction)
 *   · bounded input: utterance ≤200 chars, ≤24 tokens
 *   · bounded patterns: ≤8 tokens, ≤2 wildcards (validated at load)
 *   · first full match wins, in declaration order — deterministic
 *   · the matcher NEVER returns user text; slots resolve to canonical
 *     ids (book ids, chapter numbers) only. What you said is never
 *     stored, logged, or echoed into telemetry.
 */

import { BOOKS, BOOK_BY_ID } from "@/lib/bible"

export const ASSISTANT_INTENT_VERSION = 1

// ─────────────────────────────────────────────────────────────
//  tokenizer (no regex)
// ─────────────────────────────────────────────────────────────

export function tokenizeUtterance(raw: string): string[] {
  const s = (raw ?? "").toLowerCase().normalize("NFKD").slice(0, 200)
  const out: string[] = []
  let cur = ""
  for (const ch of s) {
    const c = ch.charCodeAt(0)
    // combining marks (é → e + ́) fold silently — they must not split a word
    if (c >= 0x0300 && c <= 0x036f) continue
    // apostrophes join contractions: "let's" → "lets", "don't" → "dont"
    if (c === 0x27 || c === 0x2019) continue
    const isAlnum = (c >= 97 && c <= 122) || (c >= 48 && c <= 57)
    if (isAlnum) cur += ch
    else if (cur) {
      out.push(cur)
      cur = ""
    }
  }
  if (cur) out.push(cur)
  return out.slice(0, 24)
}

function isDigits(s: string | undefined): boolean {
  if (!s || s.length === 0 || s.length > 3) return false
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i)
    if (c < 48 || c > 57) return false
  }
  return true
}

// ─────────────────────────────────────────────────────────────
//  book name resolution ("1 samuel 3" → 1sa, chapter 3)
// ─────────────────────────────────────────────────────────────

const BOOK_ALIASES: Map<string, string> = (() => {
  const m = new Map<string, string>()
  for (const b of BOOKS) {
    m.set(b.name.toLowerCase(), b.id)
    m.set(b.id, b.id)
  }
  // common spoken forms (all must resolve to a real book id)
  const extras: Record<string, string> = {
    psalm: "psa", psalms: "psa", song: "sng", songs: "sng",
    genesis: "gen", exodus: "exo", deuteronomy: "deu", deut: "deu",
    proverbs: "pro", prov: "pro", ecclesiastes: "ecc",
    isaiah: "isa", jeremiah: "jer", ezekiel: "ezk", daniel: "dan",
    matthew: "mat", matt: "mat", mark: "mrk", luke: "luk", john: "jhn",
    acts: "act", romans: "rom", corinthians: "1co", cor: "1co",
    galatians: "gal", ephesians: "eph", philippians: "php",
    hebrews: "heb", james: "jas", peter: "1pe", jude: "jud",
    revelation: "rev", rev: "rev",
    // spoken ordinals for the numbered books — "first samuel", "second kings"…
    "first samuel": "1sa", "second samuel": "2sa",
    "first kings": "1ki", "second kings": "2ki",
    "first chronicles": "1ch", "second chronicles": "2ch",
    "first corinthians": "1co", "second corinthians": "2co",
    "first thessalonians": "1th", "second thessalonians": "2th",
    "first timothy": "1ti", "second timothy": "2ti",
    "first peter": "1pe", "second peter": "2pe",
    "first john": "1jn", "second john": "2jn", "third john": "3jn",
  }
  for (const [k, v] of Object.entries(extras)) {
    if (BOOK_BY_ID[v]) m.set(k, v)
  }
  return m
})()

/** resolve a book starting at tokens[i]; longest alias wins (3→2→1 words) */
function resolveBookAt(tokens: string[], i: number): { id: string; consumed: number } | null {
  for (const n of [3, 2, 1]) {
    if (i + n > tokens.length) continue
    const phrase = tokens.slice(i, i + n).join(" ")
    const id = BOOK_ALIASES.get(phrase)
    if (id) return { id, consumed: n }
  }
  return null
}

// ─────────────────────────────────────────────────────────────
//  the patterns
// ─────────────────────────────────────────────────────────────

export interface IntentSpec {
  id: string
  /** token patterns; `*` = any 1–3 tokens, `:book` = book name, `:ch` = chapter number */
  patterns: string[]
  examples: string[]
}

export const INTENTS: IntentSpec[] = [
  {
    id: "greeting",
    patterns: ["hello papy", "hi papy", "hey papy", "good morning papy", "good evening papy", "good morning", "good afternoon", "good evening", "hello", "hi", "hey"],
    examples: ["Hello Papy"],
  },
  {
    id: "thanks",
    patterns: ["thank you papy", "thanks papy", "thank you", "thanks"],
    examples: ["Thank you"],
  },
  {
    id: "help",
    patterns: ["what can you do", "what can i say", "what can i ask", "help"],
    examples: ["What can you do?"],
  },
  {
    id: "start_lesson",
    patterns: ["start my lesson", "start a lesson", "start lesson", "begin my lesson", "lets study", "let us study", "lets learn", "continue my lesson", "continue learning", "keep going", "start learning", "start my day"],
    examples: ["Start my lesson", "Let's study"],
  },
  {
    id: "daily_quiz",
    patterns: ["daily quiz", "take the quiz", "start the quiz", "quiz me", "quiz"],
    examples: ["Daily quiz"],
  },
  {
    id: "streak_status",
    patterns: ["how is my streak", "is my streak alive", "did i keep my streak", "my streak", "streak status", "streak"],
    examples: ["How is my streak?"],
  },
  {
    id: "hearts_status",
    patterns: ["how many hearts", "do i have hearts", "my hearts", "hearts status", "hearts"],
    examples: ["How many hearts?"],
  },
  {
    id: "gems_status",
    patterns: ["how many gems", "my gems", "gems status", "gems"],
    examples: ["How many gems?"],
  },
  {
    id: "xp_status",
    patterns: ["what level am i", "how much xp", "my xp", "my level", "xp", "level"],
    examples: ["What level am I?"],
  },
  {
    id: "quests_status",
    patterns: ["what should i do today", "what are my quests", "todays quests", "daily quests", "my quests", "quests"],
    examples: ["What should I do today?"],
  },
  {
    id: "league_status",
    patterns: ["how am i doing in the league", "where am i in the league", "my league", "leaderboard", "league"],
    examples: ["How am I doing in the league?"],
  },
  {
    id: "verse_of_day",
    patterns: ["verse of the day", "todays verse", "verse for today", "read me todays verse", "read me a verse", "give me a verse"],
    examples: ["Verse of the day"],
  },
  {
    id: "bible_ref",
    patterns: [
      "open :book :ch", "open :book", "read :book :ch", "read :book",
      "go to :book :ch", "go to :book", "bible :book :ch", "bible :book",
      "show me :book :ch", "show me :book",
      "open :book chapter :ch", "read :book chapter :ch", "go to :book chapter :ch",
      ":book chapter :ch",
    ],
    examples: ["Open John 3", "Read Psalm 23"],
  },
  {
    id: "bible_open",
    patterns: ["open the bible", "open bible", "show me the bible", "the bible", "bible"],
    examples: ["Open the Bible"],
  },
  {
    id: "practice",
    patterns: ["practice hub", "lets practice", "practice", "review"],
    examples: ["Let's practice"],
  },
  {
    id: "stories",
    patterns: ["tell me a story", "story mode", "read a story", "stories"],
    examples: ["Tell me a story"],
  },
  {
    id: "growth",
    patterns: ["my progress", "my insights", "my growth", "how am i doing", "show my stats"],
    examples: ["How am I doing?"],
  },
  {
    id: "shop",
    patterns: ["open the shop", "the shop", "shop", "store"],
    examples: ["Open the shop"],
  },
]

// ─────────────────────────────────────────────────────────────
//  the matcher (bounded, deterministic, regex-free)
// ─────────────────────────────────────────────────────────────

type Tok = { k: "lit"; v: string } | { k: "slot"; v: "book" | "ch" } | { k: "any" }

function compile(pattern: string): Tok[] {
  return pattern
    .split(" ")
    .filter(Boolean)
    .map((t) => (t === "*" ? { k: "any" } : t.startsWith(":") ? { k: "slot", v: t.slice(1) as "book" | "ch" } : { k: "lit", v: t }))
}

const COMPILED: { id: string; toks: Tok[] }[] = INTENTS.flatMap((spec) =>
  spec.patterns.map((p) => ({ id: spec.id, toks: compile(p) })),
)

// load-time sanity: patterns stay bounded (≤8 tokens, ≤2 wildcards)
for (const c of COMPILED) {
  if (c.toks.length === 0 || c.toks.length > 8 || c.toks.filter((t) => t.k === "any").length > 2) {
    throw new Error(`assistant intent pattern out of bounds: ${c.id}`)
  }
}

export interface IntentMatch {
  intent: string
  slots: Record<string, string>
}

function matchFrom(toks: Tok[], t: string[], i: number, pi: number, slots: Record<string, string>): Record<string, string> | null {
  if (pi === toks.length) return i === t.length ? slots : null
  const tok = toks[pi]
  if (tok.k === "lit") {
    return t[i] === tok.v ? matchFrom(toks, t, i + 1, pi + 1, slots) : null
  }
  if (tok.k === "slot") {
    if (tok.v === "ch") {
      if (!isDigits(t[i])) return null
      const n = Number.parseInt(t[i], 10)
      if (n < 1 || n > 150) return null
      return matchFrom(toks, t, i + 1, pi + 1, { ...slots, ch: t[i] })
    }
    // book
    const r = resolveBookAt(t, i)
    if (!r) return null
    return matchFrom(toks, t, i + r.consumed, pi + 1, { ...slots, book: r.id })
  }
  // wildcard: consume 1–3 tokens (longest first, bounded)
  for (let n = 3; n >= 1; n--) {
    if (i + n <= t.length) {
      const r = matchFrom(toks, t, i + n, pi + 1, slots)
      if (r) return r
    }
  }
  return null
}

export function matchIntent(tokens: string[]): IntentMatch | null {
  if (tokens.length === 0 || tokens.length > 24) return null
  for (const c of COMPILED) {
    const slots = matchFrom(c.toks, tokens, 0, 0, {})
    if (slots) return { intent: c.id, slots }
  }
  return null
}

/** interpret a raw utterance: tokenize → match (shared by server + client) */
export function interpretUtterance(raw: string): IntentMatch | null {
  return matchIntent(tokenizeUtterance(raw))
}

/** clamp a chapter to a real book's length */
export function clampChapter(bookId: string, chapter: number): number {
  const b = BOOK_BY_ID[bookId]
  if (!b) return 1
  return Math.min(Math.max(1, chapter), b.chapters)
}
