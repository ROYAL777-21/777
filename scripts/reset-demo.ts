/**
 * Reset demo/test activity data while preserving the user's profile,
 * chosen course and settings. Gives a fresh-start experience.
 */
import { PrismaClient } from "@prisma/client"

const db = new PrismaClient()

async function main() {
  const user = await db.user.findUnique({ where: { id: "user_1" }, include: { progress: true } })
  if (!user) {
    console.log("no user yet — nothing to reset")
    return
  }
  const keepCourse = user.progress?.activeCourseId ?? null

  await db.lessonCompletion.deleteMany({ where: { userId: "user_1" } })
  await db.challengeProgress.deleteMany({ where: { userId: "user_1" } })
  await db.userQuest.deleteMany({ where: { userId: "user_1" } })
  await db.userAchievement.deleteMany({ where: { userId: "user_1" } })
  await db.chestClaim.deleteMany({ where: { userId: "user_1" } })
  await db.userItem.deleteMany({ where: { userId: "user_1" } })
  await db.leagueEntry.deleteMany({ where: { userId: "user_1", isCurrentUser: true } })
  await db.appNotification.deleteMany({ where: { userId: "user_1" } })

  await db.userProgress.update({
    where: { userId: "user_1" },
    data: {
      hearts: 5,
      gems: 500,
      xp: 0,
      streak: 0,
      streakFreezes: 0,
      lastActiveDay: null,
      doubleXpUntil: null,
      lastHeartAt: null,
      leagueOrder: 0,
      lastWeekKey: null,
      dailyXp: 0,
      dailyXpDay: null,
      activeCourseId: keepCourse,
    },
  })

  await db.appNotification.create({
    data: {
      userId: "user_1",
      type: "welcome",
      title: "Welcome to Scroll Academy! 📜",
      body: "Your word is a lamp to my feet and a light for my path. Complete your first lesson to light your streak!",
      icon: "🕯️",
    },
  })

  console.log(`✅ Reset complete. Kept course: ${keepCourse ? "selected course" : "none"} · profile: ${user.name} ${user.image}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
