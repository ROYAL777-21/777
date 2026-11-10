import { PrismaClient } from "@prisma/client"
const db = new PrismaClient()
const p = await db.userProgress.findUnique({ where: { userId: "user_1" }, select: { referralProMonths: true, plan: true } })
console.log("banked after:", p?.referralProMonths, "| plan:", p?.plan)
await db.$disconnect()
