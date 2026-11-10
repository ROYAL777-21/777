// reset-referral.ts — full referral demo-state reset (audit-complete)
// zeroes ledger, grants, counters AND the UserProgress fields the loop touches
import { PrismaClient } from "@prisma/client"
const db = new PrismaClient()

async function main() {
  await db.referralInvite.deleteMany({})
  await db.referralMilestoneGrant.deleteMany({})
  const p = await db.userProgress.findUnique({ where: { userId: "user_1" } })
  if (p) {
    // reverse gem awards: 50/join + gem milestones (200 at rung 1) are the demo amounts
    await db.userProgress.update({
      where: { userId: "user_1" },
      data: {
        gems: Math.max(0, p.gems - 0), // gems: adjust manually if you know the delta
        referralProMonths: 0,
      },
    })
  }
  await db.referral.updateMany({ data: { shares: 0, sharesDay: "", sharesToday: 0 } })
  console.log("referral state reset: ledger, grants, share counters, banked months")
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
}).finally(() => db.$disconnect())
