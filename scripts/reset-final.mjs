/** Final reset: pristine user state, pristine bot seeds (Lydia pending, Sophia not friend) */
import { PrismaClient } from "@prisma/client"

const db = new PrismaClient()

async function main() {
  const userPosts = await db.post.findMany({ where: { userId: "user_1" }, select: { id: true } })
  for (const p of userPosts) {
    await db.postComment.deleteMany({ where: { postId: p.id } })
    await db.post.delete({ where: { id: p.id } })
  }
  await db.bibleRead.deleteMany({ where: { userId: "user_1" } })
  await db.verseMark.deleteMany({ where: { userId: "user_1" } })
  await db.planProgress.deleteMany({ where: { userId: "user_1" } })
  await db.userAchievement.deleteMany({ where: { userId: "user_1" } })
  await db.challengeProgress.deleteMany({ where: { userId: "user_1" } })
  await db.lessonCompletion.deleteMany({ where: { userId: "user_1" } })
  await db.chestClaim.deleteMany({ where: { userId: "user_1" } })
  await db.userQuest.deleteMany({ where: { userId: "user_1" } })
  await db.appNotification.deleteMany({ where: { userId: "user_1", type: { in: ["quest", "achievement", "streak", "friend", "social", "info", "league"] } } })
  // bots back to seed state: 3 friends + Lydia incoming request
  await db.botUser.updateMany({ data: { isFriend: false, requestedByUser: false, requestedToUser: false, requestedAt: null } })
  for (const id of ["bot_deborah", "bot_apollos", "bot_priscilla"]) {
    await db.botUser.update({ where: { id }, data: { isFriend: true } })
  }
  await db.botUser.update({ where: { id: "bot_lydia" }, data: { requestedToUser: true, requestedAt: new Date(Date.now() - 3 * 3600 * 1000) } })
  await db.leagueEntry.updateMany({ where: { isCurrentUser: true }, data: { xp: 0 } })
  await db.user.update({ where: { id: "user_1" }, data: { avatar: null, bio: "" } })
  await db.userProgress.update({
    where: { userId: "user_1" },
    data: {
      xp: 0, gems: 500, streak: 0, lastActiveDay: null, dailyXp: 0, dailyXpDay: null,
      hearts: 5, lastHeartAt: null, likedPosts: "[]", doubleXpUntil: null,
    },
  })
  console.log("✅ pristine delivery state restored")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
