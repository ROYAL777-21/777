import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getOrCreateUser, USER_ID, checkAchievements, computeAchievementCtx, notifyQuestsAndAchievements } from "@/lib/gamification"

const BOT_REPLIES = [
  "Amen to that! 🙌",
  "This encouraged me today — thank you!",
  "Love this. Keeping you in prayer 🙏",
  "Well said! Sharing it with my small group.",
  "So good. 'The word is living and active!'",
  "Praise God for this ✨",
]

export async function POST(req: Request) {
  try {
    const len = Number(req.headers.get("content-length") ?? 0)
    if (Number.isFinite(len) && len > 20_000) return NextResponse.json({ error: "payload too large" }, { status: 413 })
    const { postId, body } = (await req.json()) as { postId?: string; body?: string }
    if (!postId || !body?.trim()) return NextResponse.json({ error: "bad request" }, { status: 400 })
    const user = await getOrCreateUser()
    // blue-team: rate limit — at most 30 comments per hour
    const hourAgo = new Date(Date.now() - 3600_000)
    const recentComments = await db.postComment.count({ where: { userId: user.id, createdAt: { gte: hourAgo } } })
    if (recentComments >= 30) return NextResponse.json({ error: "too many comments" }, { status: 429 })
    const post = await db.post.findUnique({ where: { id: postId } })
    if (!post) return NextResponse.json({ error: "not found" }, { status: 404 })

    const comment = await db.postComment.create({
      data: { postId, userId: user.id, body: body.trim().slice(0, 300) },
    })

    // a friendly bot replies to the user's comment after a beat (stored immediately, dated slightly later)
    if (post.userId === user.id) {
      const friends = await db.botUser.findMany({ where: { isFriend: true } })
      if (friends.length > 0) {
        const bot = friends[Math.floor(Math.random() * friends.length)]
        await db.postComment.create({
          data: {
            postId,
            authorBotId: bot.id,
            body: BOT_REPLIES[Math.floor(Math.random() * BOT_REPLIES.length)],
          },
        })
      }
    }

    // comments count toward the community achievement
    const ctx = await computeAchievementCtx()
    const ach = await checkAchievements(ctx)
    for (const a of ach.unlocked) {
      await db.appNotification.create({
        data: {
          userId: USER_ID,
          type: "achievement",
          title: `Achievement: ${a.title} ${a.icon}`,
          body: `You reached “${a.tierName}” and earned ${a.gems} gems. Beautiful work!`,
          icon: "🏅",
        },
      })
    }

    return NextResponse.json({ ok: true, id: comment.id })
  } catch (e) {
    console.error("[api/community/comment POST]", e)
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}
