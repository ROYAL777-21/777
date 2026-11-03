import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { USER_ID, getOrCreateUser, regenHearts } from "@/lib/gamification"
import type { ChallengeDTO, LessonPayload } from "@/lib/types"

/** Practice = weakest challenges from completed lessons (mistakes first), 8 per session */
export async function GET() {
  try {
    const user = await getOrCreateUser()
    const progress = await regenHearts(user.progress!)

    const records = await db.challengeProgress.findMany({
      where: { userId: USER_ID, mistakes: { gt: 0 } },
      include: { challenge: { include: { options: { orderBy: { order: "asc" } } } } },
      orderBy: { mistakes: "desc" },
      take: 20,
    })
    let picked = records.map((r) => r.challenge)

    if (picked.length < 8) {
      const completedLessonIds = await db.lessonCompletion.findMany({
        where: { userId: USER_ID },
        select: { lessonId: true },
      })
      if (completedLessonIds.length > 0) {
        const fill = await db.challenge.findMany({
          where: { lessonId: { in: completedLessonIds.map((c) => c.lessonId) } },
          include: { options: { orderBy: { order: "asc" } } },
          take: 40,
        })
        const seen = new Set(picked.map((p) => p.id))
        for (const c of fill) {
          if (picked.length >= 8) break
          if (!seen.has(c.id)) {
            picked.push(c)
            seen.add(c.id)
          }
        }
      }
    }

    if (picked.length === 0 && progress.activeCourseId) {
      // brand-new user: free practice from the first lesson of the active course
      const firstLesson = await db.lesson.findFirst({
        where: { unit: { courseId: progress.activeCourseId } },
        orderBy: [{ unit: { order: "asc" } }, { order: "asc" }],
        include: { challenges: { include: { options: { orderBy: { order: "asc" } } } } },
      })
      if (firstLesson) picked = firstLesson.challenges.slice(0, 6)
    }

    picked = picked.slice(0, 8)

    // resolve the active course's code for language-aware audio (Greek/Hebrew)
    let courseCode = "mixed"
    if (progress.activeCourseId) {
      const c = await db.course.findUnique({ where: { id: progress.activeCourseId }, select: { code: true } })
      if (c) courseCode = c.code
    }

    const challenges: ChallengeDTO[] = picked.map((c) => ({
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
      lessonId: "practice",
      title: "Practice",
      unitTitle: "Review your weak spots",
      unitColor: "#0F8A80",
      difficulty: 1,
      courseEmoji: "📝",
      courseCode,
      challenges,
      hearts: progress.hearts,
      firstTime: false,
    }
    return NextResponse.json(payload)
  } catch (e) {
    console.error("[api/practice]", e)
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}
