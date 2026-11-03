import { db } from "@/lib/db"
import { USER_ID, levelInfo } from "@/lib/gamification"
import type { BootstrapCourse, BootstrapUnit, BootstrapUser, CourseSummary } from "@/lib/types"
import type { UserProgress } from "@prisma/client"

export async function buildCourseSummary(courseId: string): Promise<CourseSummary | null> {
  const course = await db.course.findUnique({
    where: { id: courseId },
    include: { units: { include: { lessons: true } } },
  })
  if (!course) return null
  const completions = await db.lessonCompletion.findMany({
    where: { userId: USER_ID, lesson: { unit: { courseId: course.id } } },
    select: { lessonId: true },
  })
  const done = new Set(completions.map((c) => c.lessonId))
  const totalLessons = course.units.reduce((n, u) => n + u.lessons.length, 0)
  return {
    id: course.id,
    code: course.code,
    title: course.title,
    subtitle: course.subtitle,
    emoji: course.emoji,
    color: course.color,
    totalLessons,
    completedLessons: done.size,
  }
}

export async function buildBootstrapCourse(courseId: string): Promise<BootstrapCourse | null> {
  const course = await db.course.findUnique({
    where: { id: courseId },
    include: {
      units: {
        orderBy: { order: "asc" },
        include: { lessons: { orderBy: { order: "asc" } } },
      },
    },
  })
  if (!course) return null
  const summary = await buildCourseSummary(courseId)
  const completions = await db.lessonCompletion.findMany({
    where: { userId: USER_ID, lesson: { unit: { courseId: course.id } } },
    select: { lessonId: true },
  })
  const done = new Set(completions.map((c) => c.lessonId))
  const chests = await db.chestClaim.findMany({ where: { userId: USER_ID } })
  const chestSet = new Set(chests.map((c) => c.unitId))
  return {
    ...summary!,
    units: course.units.map((u) => {
      let tips: BootstrapUnit["tips"] = null
      try {
        tips = u.tipsJson ? (JSON.parse(u.tipsJson) as BootstrapUnit["tips"]) : null
      } catch {
        tips = null
      }
      return {
        id: u.id,
        title: u.title,
        description: u.description,
        emoji: u.emoji,
        color: u.color,
        order: u.order,
        difficulty: u.difficulty ?? 1,
        chestClaimed: chestSet.has(u.id),
        tips,
        lessons: u.lessons.map((l) => ({
          id: l.id,
          title: l.title,
          order: l.order,
          completed: done.has(l.id),
        })),
      }
    }),
  }
}

export function userToDTO(
  progress: UserProgress,
  user: { name: string; image: string; avatar?: string | null; bio?: string }
): BootstrapUser {
  const lv = levelInfo(progress.xp)
  return {
    name: user.name,
    image: user.image,
    avatar: user.avatar ?? null,
    bio: user.bio ?? "",
    hearts: progress.hearts,
    gems: progress.gems,
    xp: progress.xp,
    streak: progress.streak,
    streakFreezes: progress.streakFreezes,
    doubleXpUntil: progress.doubleXpUntil?.toISOString() ?? null,
    dailyXp: progress.dailyXpDay === new Date().toISOString().slice(0, 10) ? progress.dailyXp : 0,
    dailyXpGoal: 50,
    leagueOrder: progress.leagueOrder ?? 0,
    soundOn: progress.soundOn,
    hapticsOn: progress.hapticsOn,
    nextHeartAt: null,
    level: lv.level,
    levelPercent: lv.percent,
    levelIntoXp: lv.intoLevel,
    levelSpanXp: lv.levelSpan,
    xpForNext: lv.xpForNext,
  }
}
