import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getOrCreateUser, regenHearts, nextHeartAt, notifyStreakRiskIfNeeded } from "@/lib/gamification"
import { buildBootstrapCourse, buildCourseSummary, userToDTO } from "@/lib/courseService"
import type { BootstrapPayload } from "@/lib/types"

export async function GET() {
  try {
    const user = await getOrCreateUser()
    const progress = await regenHearts(user.progress!)
    await notifyStreakRiskIfNeeded()

    const allCourses = await db.course.findMany({ orderBy: { order: "asc" } })
    const summaries: BootstrapPayload["courses"] = []
    for (const c of allCourses) {
      const s = await buildCourseSummary(c.id)
      if (s) summaries.push(s)
    }

    const activeCourse = progress.activeCourseId ? await buildBootstrapCourse(progress.activeCourseId) : null

    const dto = userToDTO(progress, user)
    dto.nextHeartAt = nextHeartAt(progress)

    const payload: BootstrapPayload = { user: dto, activeCourse, courses: summaries }
    return NextResponse.json(payload)
  } catch (e) {
    console.error("[api/bootstrap]", e)
    return NextResponse.json({ error: "bootstrap failed" }, { status: 500 })
  }
}
