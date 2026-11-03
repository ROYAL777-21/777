import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getOrCreateUser, regenHearts, nextHeartAt } from "@/lib/gamification"
import type { ChallengeDTO, LessonPayload } from "@/lib/types"

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params
    const user = await getOrCreateUser()
    const progress = await regenHearts(user.progress!)

    const lesson = await db.lesson.findUnique({
      where: { id },
      include: {
        unit: { select: { title: true, color: true, difficulty: true, course: { select: { emoji: true, code: true } } } },
        challenges: {
          orderBy: { order: "asc" },
          include: { options: { orderBy: { order: "asc" } } },
        },
      },
    })
    if (!lesson) return NextResponse.json({ error: "lesson not found" }, { status: 404 })

    const existing = await db.lessonCompletion.findUnique({
      where: { userId_lessonId: { userId: "user_1", lessonId: id } },
    })

    const challenges: ChallengeDTO[] = lesson.challenges.map((c) => ({
      id: c.id,
      type: c.type as ChallengeDTO["type"],
      prompt: c.prompt,
      question: c.question,
      meaning: c.meaning,
      transliteration: c.transliteration,
      order: c.order,
      options: c.options.map((o) => ({
        id: o.id,
        text: o.text,
        matchId: o.matchId,
        correct: o.correct,
        wordOrder: o.wordOrder,
      })),
    }))

    const payload: LessonPayload = {
      lessonId: lesson.id,
      title: lesson.title,
      unitTitle: lesson.unit.title,
      unitColor: lesson.unit.color,
      difficulty: lesson.unit.difficulty ?? 1,
      courseEmoji: lesson.unit.course.emoji,
      courseCode: lesson.unit.course.code,
      challenges,
      hearts: progress.hearts,
      firstTime: !existing,
    }
    return NextResponse.json(payload)
  } catch (e) {
    console.error("[api/lessons/[id]]", e)
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}
