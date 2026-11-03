// check completion timestamps
import { PrismaClient } from "@prisma/client"
const db = new PrismaClient()
const lc = await db.lessonCompletion.findMany({ orderBy: { completedAt: "asc" } })
for (const c of lc) console.log(c.lessonId, "→", c.completedAt.toISOString(), "xp:", c.xpEarned, "combo:", c.comboMax)
const posts = await db.post.findMany({ orderBy: { createdAt: "desc" }, take: 5 })
for (const p of posts) console.log("POST:", (p.userId ? "USER" : p.authorBotId), p.createdAt.toISOString(), p.body.slice(0, 40))
await db.$disconnect()
