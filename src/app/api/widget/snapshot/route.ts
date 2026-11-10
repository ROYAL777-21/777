import { NextResponse } from "next/server"
import { readFile } from "node:fs/promises"
import path from "node:path"
import { getOrCreateUser, regenHearts, levelInfo, MAX_HEARTS, DAILY_XP_GOAL, dayKey } from "@/lib/gamification"
import { verseOfDay } from "@/lib/bible"

/**
 * GET /api/widget/snapshot (v11)
 *
 * One tiny round-trip that powers every animated widget surface:
 * the home-screen pages (/widget/streak|verse|xp|board) and the
 * always-on-top desktop companion window (Tauri).
 *
 * Discipline:
 *  · non-sensitive fields only (no email, no ids beyond the name) —
 *    a widget is a glanceable surface, not a data dump
 *  · no-store: always fresh, always cheap (one indexed user read +
 *    a memoized verse lookup)
 *  · the verse text is read once per day from the bundled KJV JSON
 */

let verseMemo: { key: string; text: string } | null = null

async function loadVerseText(): Promise<{ ref: string; bookId: string; chapter: number; verse: number; text: string } | null> {
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

export async function GET() {
  try {
    const user = await getOrCreateUser()
    const progress = await regenHearts(user.progress!)
    const today = dayKey()
    const level = levelInfo(progress.xp)
    const verse = await loadVerseText()

    const payload = {
      v: 1,
      name: user.name,
      streak: progress.streak,
      streakAliveToday: progress.lastActiveDay === today,
      freezes: progress.streakFreezes,
      dailyXp: progress.dailyXpDay === today ? progress.dailyXp : 0,
      dailyGoal: DAILY_XP_GOAL,
      hearts: progress.hearts,
      maxHearts: MAX_HEARTS,
      gems: progress.gems,
      xp: progress.xp,
      level: level.level,
      levelPercent: level.percent,
      leagueOrder: progress.leagueOrder,
      plan: progress.plan,
      verse: verse ? { ref: verse.ref, bookId: verse.bookId, chapter: verse.chapter, verse: verse.verse, text: verse.text } : null,
      serverTime: Date.now(),
    }
    return NextResponse.json(payload, { headers: { "cache-control": "no-store" } })
  } catch (e) {
    console.error("[api/widget/snapshot]", e)
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}

export const dynamic = "force-dynamic"
