import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()
async function main() {
  const completions = await db.lessonCompletion.count({ where: { userId: 'user_1' } })
  const p = await db.userProgress.findUnique({ where: { userId: 'user_1' } })
  const notifs = await db.appNotification.findMany({ where: { userId: 'user_1' }, orderBy: { createdAt: 'desc' }, take: 3 })
  console.log('completions:', completions, '| xp:', p?.xp, '| dailyXp:', p?.dailyXp)
  console.log('recent notifs:', notifs.map((n) => n.title))
}
main().finally(() => db.$disconnect())
