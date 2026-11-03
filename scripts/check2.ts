import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()
async function main() {
  const all = await db.dailyQuizCompletion.findMany()
  console.log('records:', all.map((r) => `${r.day} score=${r.score}/${r.total} xp=${r.xpEarned}`))
  const p = await db.userProgress.findUnique({ where: { userId: 'user_1' } })
  console.log('progress:', JSON.stringify({ xp: p?.xp, dailyXp: p?.dailyXp, gems: p?.gems }))
}
main().finally(() => db.$disconnect())
