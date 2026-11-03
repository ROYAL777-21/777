import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getOrCreateUser, regenHearts, awardActivityXp, USER_ID } from "@/lib/gamification"
import { BOOK_BY_ID, BOOKS } from "@/lib/bible"
import type { BibleStatePayload } from "@/lib/types"

export const totalChapters = BOOKS.reduce((n, b) => n + b.chapters, 0)

export async function GET() {
  try {
    const user = await getOrCreateUser()
    await regenHearts(user.progress!)
    const [reads, marks] = await Promise.all([
      db.bibleRead.findMany({ where: { userId: USER_ID }, orderBy: { readAt: "desc" } }),
      db.verseMark.findMany({ where: { userId: USER_ID }, orderBy: { createdAt: "desc" } }),
    ])
    const payload: BibleStatePayload = {
      read: reads.map((r) => `${r.bookId}-${r.chapter}`),
      marks: marks.map((m) => ({ bookId: m.bookId, chapter: m.chapter, verse: m.verse, color: m.color, note: m.note })),
      chaptersRead: reads.length,
      totalChapters,
      lastRead: reads[0] ? { bookId: reads[0].bookId, chapter: reads[0].chapter } : null,
    }
    return NextResponse.json(payload)
  } catch (e) {
    console.error("[api/bible GET]", e)
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      action: "read" | "mark" | "unmark"
      bookId: string
      chapter: number
      verse?: number
      color?: string
    }
    const book = BOOK_BY_ID[body.bookId]
    if (!book || body.chapter < 1 || body.chapter > book.chapters) {
      return NextResponse.json({ error: "invalid reference" }, { status: 400 })
    }
    const user = await getOrCreateUser()
    const progress = await regenHearts(user.progress!)

    if (body.action === "read") {
      const existing = await db.bibleRead.findUnique({
        where: { userId_bookId_chapter: { userId: USER_ID, bookId: book.id, chapter: body.chapter } },
      })
      if (existing) {
        return NextResponse.json({
          firstTime: false,
          chaptersRead: await db.bibleRead.count({ where: { userId: USER_ID } }),
          xpEarned: 0,
          streak: progress.streak,
          questsCompleted: [],
          achievementsUnlocked: [],
        })
      }
      await db.bibleRead.create({ data: { userId: USER_ID, bookId: book.id, chapter: body.chapter } })
      const award = await awardActivityXp(progress, { xp: 10, questDelta: { chapters: 1 } })
      const chaptersRead = await db.bibleRead.count({ where: { userId: USER_ID } })
      return NextResponse.json({
        firstTime: true,
        chaptersRead,
        xpEarned: award.xpEarned,
        streak: award.streak,
        questsCompleted: award.questsCompleted,
        achievementsUnlocked: award.achievementsUnlocked,
      })
    }

    if (body.action === "mark") {
      const verse = body.verse ?? 1
      const color = ["gold", "rose", "teal", "violet"].includes(body.color ?? "") ? body.color! : "gold"
      await db.verseMark.upsert({
        where: { userId_bookId_chapter_verse: { userId: USER_ID, bookId: book.id, chapter: body.chapter, verse } },
        update: { color },
        create: { userId: USER_ID, bookId: book.id, chapter: body.chapter, verse, color },
      })
      return NextResponse.json({ ok: true })
    }

    if (body.action === "unmark") {
      const verse = body.verse ?? 1
      await db.verseMark.deleteMany({ where: { userId: USER_ID, bookId: book.id, chapter: body.chapter, verse } })
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: "unknown action" }, { status: 400 })
  } catch (e) {
    console.error("[api/bible POST]", e)
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}
