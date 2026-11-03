import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getOrCreateUser, regenHearts } from "@/lib/gamification"
import { buildCourseSummary } from "@/lib/courseService"

export async function GET() {
  try {
    const user = await getOrCreateUser()
    await regenHearts(user.progress!)
    const allCourses = await db.course.findMany({ orderBy: { order: "asc" } })
    const summaries: import("@/lib/types").CourseSummary[] = []
    for (const c of allCourses) {
      const s = await buildCourseSummary(c.id)
      if (s) summaries.push(s)
    }
    return NextResponse.json({ courses: summaries, activeCourseId: user.progress!.activeCourseId })
  } catch (e) {
    console.error("[api/courses GET]", e)
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { courseId } = (await req.json()) as { courseId?: string }
    if (!courseId) return NextResponse.json({ error: "courseId required" }, { status: 400 })
    const course = await db.course.findUnique({ where: { id: courseId } })
    if (!course) return NextResponse.json({ error: "course not found" }, { status: 404 })
    await getOrCreateUser()
    await db.userProgress.update({ where: { userId: "user_1" }, data: { activeCourseId: courseId } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("[api/courses POST]", e)
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}
