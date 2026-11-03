// quick DB inspection
import { PrismaClient } from "@prisma/client"
const db = new PrismaClient()
const p = await db.userProgress.findUnique({ where: { userId: "user_1" }, include: { activeCourse: true } })
console.log("progress:", JSON.stringify({
  xp: p?.xp, gems: p?.gems, hearts: p?.hearts, streak: p?.streak,
  dailyXp: p?.dailyXp, dailyXpDay: p?.dailyXpDay, lastActiveDay: p?.lastActiveDay,
  activeCourse: p?.activeCourse?.code, leagueOrder: p?.leagueOrder,
}, null, 1))
const lc = await db.lessonCompletion.findMany()
console.log("completions:", JSON.stringify(lc.map((c) => ({ lessonId: c.lessonId, xp: c.xpEarned, acc: c.accuracy, combo: c.comboMax }))))
const uq = await db.userQuest.findMany({ include: { quest: true } })
console.log("quests:", JSON.stringify(uq.map((q) => ({ slug: q.quest.slug, day: q.day, progress: q.progress, completed: q.completed, claimed: q.claimed }))))
const ua = await db.userAchievement.findMany({ include: { achievement: true } })
console.log("achievements:", JSON.stringify(ua.map((a) => ({ slug: a.achievement.slug, tier: a.tier }))))
const n = await db.appNotification.findMany()
console.log("notifications:", JSON.stringify(n.map((x) => ({ type: x.type, title: x.title }))))
await db.$disconnect()
