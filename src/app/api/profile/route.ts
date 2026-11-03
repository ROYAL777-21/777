import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getOrCreateUser, USER_ID, levelInfo, dayKey } from "@/lib/gamification"
import { buildCourseSummary } from "@/lib/courseService"
import type { ProfilePayload } from "@/lib/types"

export async function GET() {
  try {
    const user = await getOrCreateUser()
    const progress = user.progress!
    const lv = levelInfo(progress.xp)

    const completions = await db.lessonCompletion.findMany({
      where: { userId: USER_ID },
      orderBy: { completedAt: "desc" },
    })
    const lessonsCompleted = completions.length
    const perfectLessons = completions.filter((c) => c.accuracy === 100).length
    const avgAccuracy = lessonsCompleted > 0 ? Math.round(completions.reduce((s, c) => s + c.accuracy, 0) / lessonsCompleted) : 0
    const challengesCorrect = await db.challengeProgress.count({ where: { userId: USER_ID, completed: true } })
    const questsCompleted = await db.userQuest.count({ where: { userId: USER_ID, completed: true } })
    const [chaptersRead, myPosts, myComments, friendsCount] = await Promise.all([
      db.bibleRead.count({ where: { userId: USER_ID } }),
      db.post.count({ where: { userId: USER_ID } }),
      db.postComment.count({ where: { userId: USER_ID } }),
      db.botUser.count({ where: { isFriend: true } }),
    ])
    let likesGiven = 0
    try {
      likesGiven = ((progress.likedPosts ? JSON.parse(progress.likedPosts) : []) as string[]).length
    } catch {
      likesGiven = 0
    }
    const communityActions = myPosts + myComments + likesGiven

    const coursesAll = await db.course.findMany({ orderBy: { order: "asc" } })
    const courses: ProfilePayload["courses"] = []
    for (const c of coursesAll) {
      const s = await buildCourseSummary(c.id)
      if (s) courses.push(s)
    }

    const achievementsRaw = await db.achievement.findMany({ orderBy: { slug: "asc" } })
    const mine = await db.userAchievement.findMany({ where: { userId: USER_ID } })
    const mineMap = new Map(mine.map((m) => [m.achievementId, m]))

    const metricValue = (metric: string): number => {
      switch (metric) {
        case "streak":
          return progress.streak
        case "xp":
          return progress.xp
        case "lessons":
          return lessonsCompleted
        case "perfect":
          return perfectLessons
        case "challenges":
          return challengesCorrect
        case "quests":
          return questsCompleted
        case "chapters":
          return chaptersRead
        case "community":
          return communityActions
        case "friends":
          return friendsCount
        case "courses":
          return new Set<string>(
            completions.length > 0
              ? courses.filter((c) => c.completedLessons > 0).map((c) => c.id)
              : [],
          ).size
        default:
          return 0
      }
    }

    const achievements: ProfilePayload["achievements"] = achievementsRaw.map((a) => {
      const tiers: number[] = JSON.parse(a.tiers)
      const tierNames: string[] = JSON.parse(a.tierNames)
      const rec = mineMap.get(a.id)
      const value = metricValue(a.metric)
      return {
        slug: a.slug,
        title: a.title,
        description: a.description,
        icon: a.icon,
        metric: a.metric,
        tiers,
        tierNames,
        tier: rec?.tier ?? 0,
        value,
      }
    })

    // 7-day history
    const days: string[] = []
    const today = new Date()
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today.getTime() - i * 86400000)
      days.push(dayKey(d))
    }
    const history = days.map((day) => {
      const dayStart = new Date(day + "T00:00:00Z").getTime() - 8 * 3600 * 1000
      const dayEnd = dayStart + 86400000
      const inDay = completions.filter((c) => {
        const t = c.completedAt.getTime()
        return t >= dayStart && t < dayEnd
      })
      return { day, xp: inDay.reduce((s, c) => s + c.xpEarned, 0), lessons: inDay.length }
    })

    const payload: ProfilePayload = {
      name: user.name,
      image: user.image,
      avatar: user.avatar ?? null,
      bio: user.bio,
      chaptersRead,
      friends: friendsCount,
      streak: progress.streak,
      totalXp: progress.xp,
      level: lv.level,
      levelPercent: lv.percent,
      lessonsCompleted,
      perfectLessons,
      avgAccuracy,
      challengesCorrect,
      questsCompleted,
      courses,
      achievements,
      history,
      days: days.map((d) => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date(d + "T00:00:00Z").getUTCDay()]),
    }
    return NextResponse.json(payload)
  } catch (e) {
    console.error("[api/profile GET]", e)
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { name, image, avatar, bio } = (await req.json()) as {
      name?: string
      image?: string
      avatar?: string | null
      bio?: string
    }
    const user = await getOrCreateUser()
    const data: { name?: string; image?: string; avatar?: string | null; bio?: string } = {}
    if (name && name.trim()) data.name = name.trim().slice(0, 24)
    if (image) data.image = image.slice(0, 8)
    if (typeof avatar === "string") {
      // sanity-limit the avatar JSON payload
      if (avatar.length > 1200) return NextResponse.json({ error: "avatar too large" }, { status: 400 })
      data.avatar = avatar
    } else if (avatar === null) {
      data.avatar = null
    }
    if (typeof bio === "string") data.bio = bio.slice(0, 140)
    const updated = await db.user.update({ where: { id: user.id }, data })
    // keep league display name in sync
    await db.leagueEntry.updateMany({ where: { userId: USER_ID, isCurrentUser: true }, data: { displayName: updated.name, avatarEmoji: updated.image } })
    return NextResponse.json({ ok: true, name: updated.name, image: updated.image, avatar: updated.avatar, bio: updated.bio })
  } catch (e) {
    console.error("[api/profile POST]", e)
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}
