import { PrismaClient } from "@prisma/client"
const db = new PrismaClient()
await db.referralInvite.deleteMany({})
// grant exactly 3 banked months
await db.userProgress.update({ where: { userId: "user_1" }, data: { referralProMonths: 3 } })
console.log("banked before:", (await db.userProgress.findUnique({ where: { userId: "user_1" } }))?.referralProMonths)
await db.$disconnect()
