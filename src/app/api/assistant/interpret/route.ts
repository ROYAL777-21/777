import { NextResponse } from "next/server"
import { readFile } from "node:fs/promises"
import path from "node:path"
import { db } from "@/lib/db"
import { getOrCreateUser, regenHearts, levelInfo, nextHeartAt, ensureDailyQuests, dayKey, MAX_HEARTS, USER_ID } from "@/lib/gamification"
import { interpretUtterance, clampChapter, INTENTS } from "@/lib/assistant/intents"
import { verseOfDay, BOOK_BY_ID } from "@/lib/bible"
import { tap } from "@/lib/engine/events"

/**
 * POST /api/assistant/interpret — Ask Papy's brain (v11).
 *
 * PRIVACY (by design, not by policy):
 *   · the utterance is tokenized, matched, and discarded — it is never
 *     written to the database, never logged, never echoed into telemetry
 *   · telemetry records ONLY {intent, matched, mode} via the schema's
 *     assistant_query contract
 *
 * SECURITY:
 *   · input bounded (string ≤200 chars after trim, non-string rejected)
 *   · in-memory sliding-window rate limit: 30 requests/min per IP
 *   · matching is regex-free and linear (see lib/assistant/intents.ts)
 *   · responses are composed server-side from vetted templates —
 *     no user text is ever interpolated back into a reply
 */

// ── tiny per-IP sliding window (single-process pilot; Redis at scale) ──
const RATE_LIMIT = 30
const RATE_WINDOW_MS = 60_000
const hits = new Map<string, number[]>()

function rateLimited(ip: string): boolean {
  const now = Date.now()
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS)
  if (arr.length >= RATE_LIMIT) {
    hits.set(ip, arr)
    return true
  }
  arr.push(now)
  hits.set(ip, arr)
  if (hits.size > 500) {
    // opportunistic sweep
    for (const [k, v] of hits) if (v.every((t) => now - t >= RATE_WINDOW_MS)) hits.delete(k)
  }
  return false
}

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for")
  if (fwd) return fwd.split(",")[0].trim().slice(0, 64)
  return "local"
}

// ── verse text (memoized per day, same helper as the widget snapshot) ──
let verseMemo: { key: string; text: string } | null = null

async function loadVerse(): Promise<{ ref: string; bookId: string; chapter: number; verse: number; text: string } | null> {
  try {
    const v = verseOfDay(dayKey())
    const key = `${v.bookId}-${v.chapter}-${v.verse}`
    if (verseMemo?.key === key) return { ...v, text: verseMemo.text }
    const raw = await readFile(path.join(process.cwd(), "public", "bible", `${v.bookId}.json`), "utf8")
    const book = JSON.parse(raw) as { chapters: string[][] }
    const text = book.chapters[v.chapter - 1]?.[v.verse - 1] ?? ""
    verseMemo = { key, text }
    return { ...v, text }
  } catch {
    return null
  }
}

// ── the reply model ──────────────────────────────────────────

export type AssistantAction =
  | { kind: "view"; view: string }
  | { kind: "bible"; bookId: string; chapter: number }
  | { kind: "quiz" }
  | { kind: "lesson" }
  | null

export interface AssistantReply {
  intent: string
  matched: boolean
  speech: string
  verse?: { ref: string; text: string } | null
  action: AssistantAction
  suggestions?: string[]
}

export async function POST(req: Request) {
  try {
    const len = Number(req.headers.get("content-length") ?? 0)
    if (Number.isFinite(len) && len > 4_000) return NextResponse.json({ error: "payload too large" }, { status: 413 })
    if (rateLimited(clientIp(req))) return NextResponse.json({ error: "slow down" }, { status: 429 })

    let body: unknown
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: "invalid json" }, { status: 400 })
    }
    const utterance = (body as { utterance?: unknown })?.utterance
    if (typeof utterance !== "string" || utterance.trim().length === 0) {
      return NextResponse.json({ error: "utterance required" }, { status: 400 })
    }
    const bounded = utterance.trim().slice(0, 200)
    const mode = (body as { mode?: unknown })?.mode === "voice" || (body as { mode?: unknown })?.mode === "deeplink" ? String((body as { mode: string }).mode) : "typed"

    // ── load the user's real world (one round-trip, light) ──
    const user = await getOrCreateUser()
    const progress = await regenHearts(user.progress!)
    const match = interpretUtterance(bounded)

    // telemetry: intent only — never the words (schema: assistant_query)
    void tap(USER_ID, "assistant_query", { intent: match?.intent ?? "", matched: !!match, mode })

    const reply = await composeReply(match, { user: user.name, progress })
    return NextResponse.json(reply)
  } catch (e) {
    console.error("[api/assistant/interpret]", e)
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}

async function composeReply(
  match: ReturnType<typeof interpretUtterance>,
  ctx: { user: string; progress: Awaited<ReturnType<typeof regenHearts>> },
): Promise<AssistantReply> {
  const { progress } = ctx
  const firstName = (ctx.user || "Scribe").split(" ")[0]

  if (!match) {
    return {
      intent: "",
      matched: false,
      speech: "I heard you, but I'm not sure how to help with that yet. Try asking “what can you do”.",
      action: null,
      suggestions: INTENTS.slice(0, 6).map((i) => i.examples[0]),
    }
  }

  switch (match.intent) {
    case "greeting": {
      const alive = progress.lastActiveDay === dayKey()
      return {
        intent: match.intent,
        matched: true,
        speech: `Shalom, ${firstName}! ${progress.streak > 0 ? `You're on a ${progress.streak}-day streak${alive ? " — today already safe" : ""}. ` : ""}Where shall we walk today?`,
        action: null,
        suggestions: ["Start my lesson", "Verse of the day"],
      }
    }
    case "thanks":
      return {
        intent: match.intent,
        matched: true,
        speech: "Anytime!",
        verse: { ref: "Proverbs 17:17", text: "A friend loveth at all times." },
        action: null,
      }
    case "help":
      return {
        intent: match.intent,
        matched: true,
        speech: "I can open any part of your scroll, read the day's verse, take you straight to a chapter, or tell you how your streak, hearts, gems, quests and league are doing.",
        action: null,
        suggestions: INTENTS.filter((i) => i.id !== "help").slice(0, 5).map((i) => i.examples[0]),
      }
    case "start_lesson":
      return { intent: match.intent, matched: true, speech: "Opening your path — today's lesson is waiting.", action: { kind: "lesson" } }
    case "daily_quiz":
      return { intent: match.intent, matched: true, speech: "Here comes today's quiz. Steady now.", action: { kind: "quiz" } }
    case "streak_status": {
      const alive = progress.lastActiveDay === dayKey()
      return {
        intent: match.intent,
        matched: true,
        speech:
          progress.streak === 0
            ? "No streak yet — one lesson today lights the first candle."
            : alive
              ? `Your streak is ${progress.streak} ${progress.streak === 1 ? "day" : "days"} strong, and today is already safe. Well done.`
              : `Your streak is ${progress.streak} ${progress.streak === 1 ? "day" : "days"} strong. A lesson today makes it ${progress.streak + 1}.`,
        action: progress.streak === 0 || !alive ? { kind: "lesson" } : null,
      }
    }
    case "hearts_status": {
      const next = nextHeartAt(progress)
      const when = next ? ` The next one returns around ${new Date(next).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}.` : ""
      return {
        intent: match.intent,
        matched: true,
        speech: `You have ${progress.hearts} of ${MAX_HEARTS} hearts.${progress.hearts === MAX_HEARTS ? " Full and ready." : when}`,
        action: null,
      }
    }
    case "gems_status":
      return { intent: match.intent, matched: true, speech: `You're carrying ${progress.gems} gems — enough for ${Math.floor(progress.gems / 350) || "a"} streak repair${progress.gems >= 700 ? "s" : ""} or a heart refill.`, action: null }
    case "xp_status": {
      const level = levelInfo(progress.xp)
      return {
        intent: match.intent,
        matched: true,
        speech: `Level ${level.level}, ${level.intoLevel} XP into it — about ${level.percent}% of the way to the next.`,
        action: { kind: "view", view: "growth" },
      }
    }
    case "quests_status": {
      const quests = await ensureDailyQuests(dayKey())
      const done = quests.filter((q) => q.completed).length
      const firstOpen = quests.find((q) => !q.completed)
      return {
        intent: match.intent,
        matched: true,
        speech:
          done === quests.length
            ? `All ${quests.length} quests are done today — beautifully finished.`
            : `${done} of ${quests.length} quests done today.${firstOpen ? ` Next up: “${firstOpen.quest.title}”.` : ""}`,
        action: { kind: "view", view: "quests" },
      }
    }
    case "league_status": {
      const league = await db.league.findFirst({ where: { order: progress.leagueOrder ?? 0 } }).catch(() => null)
      return {
        intent: match.intent,
        matched: true,
        speech: league
          ? `You're competing in the ${league.name} League this week. The ladder resets Monday.`
          : "You're in a league this week — the ladder resets Monday.",
        action: { kind: "view", view: "leaderboard" },
      }
    }
    case "verse_of_day": {
      const v = await loadVerse()
      if (!v) return { intent: match.intent, matched: true, speech: "The day's verse is ready in the Bible reader.", action: { kind: "view", view: "bible" } }
      const spoken = v.text.length > 300 ? `${v.text.slice(0, 297)}…` : v.text
      return {
        intent: match.intent,
        matched: true,
        speech: spoken,
        verse: { ref: v.ref, text: v.text },
        action: { kind: "bible", bookId: v.bookId, chapter: v.chapter },
      }
    }
    case "bible_ref": {
      const book = BOOK_BY_ID[match.slots.book]
      const chapter = match.slots.ch ? clampChapter(match.slots.book, Number.parseInt(match.slots.ch, 10)) : 1
      return {
        intent: match.intent,
        matched: true,
        speech: `Opening ${book?.name ?? "the Bible"}${match.slots.ch ? ` ${chapter}` : ""}.`,
        action: { kind: "bible", bookId: match.slots.book, chapter },
      }
    }
    case "bible_open":
      return { intent: match.intent, matched: true, speech: "Opening the Bible.", action: { kind: "view", view: "bible" } }
    case "practice":
      return { intent: match.intent, matched: true, speech: "Practice hub it is — a little repetition keeps the ink fresh.", action: { kind: "view", view: "practice-hub" } }
    case "stories":
      return { intent: match.intent, matched: true, speech: "Story mode — the Bible, told as a journey.", action: { kind: "view", view: "stories" } }
    case "growth":
      return { intent: match.intent, matched: true, speech: "Here's your growth hub — rhythm, streak health and insights.", action: { kind: "view", view: "growth" } }
    case "shop":
      return { intent: match.intent, matched: true, speech: "Opening the shop.", action: { kind: "view", view: "shop" } }
    default:
      return { intent: match.intent, matched: true, speech: "On it.", action: null }
  }
}

export const dynamic = "force-dynamic"
