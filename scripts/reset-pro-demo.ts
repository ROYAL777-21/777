// full demo-state restore for the referral program + plan fields
import { PrismaClient } from "@prisma/client"
const db = new PrismaClient()
await db.referralInvite.deleteMany({})
await db.referralMilestoneGrant.deleteMany({})
await db.referral.updateMany({ data: { shares: 0, sharesDay: "", sharesToday: 0 } })
const p = await db.userProgress.findUnique({ where: { userId: "user_1" } })
if (p) {
  await db.userProgress.update({
    where: { userId: "user_1" },
    data: {
      referralProMonths: 0,
      gems: Math.max(0, p.gems - 700 - 250), // reverse attack-phase gems (700) + pre-test (250)
      plan: "free",
      trialEndsAt: null,
    },
  })
}
console.log("full referral demo state restored")
await db.$disconnect()
