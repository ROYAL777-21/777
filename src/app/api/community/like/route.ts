import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getOrCreateUser, USER_ID, checkAchievements, computeAchievementCtx, notifyQuestsAndAchievements } from "@/lib/gamification"

export async function POST(req: Request) {
  try {
    const { postId, on } = (await req.json()) as { postId?: string; on?: boolean }
    if (!postId) return NextResponse.json({ error: "bad request" }, { status: 400 })
    const user = await getOrCreateUser()
    const progress = user.progress!

    let liked: string[] = []
    try {
      liked = JSON.parse(progress.likedPosts) as string[]
    } catch {
      liked = []
    }

    const wasLiked = liked.includes(postId)
    const shouldLike = on ?? !wasLiked

    if (shouldLike && !wasLiked) {
      liked.push(postId)
      await db.post.update({ where: { id: postId }, data: { likes: { increment: 1 } } })
    } else if (!shouldLike && wasLiked) {
      liked = liked.filter((id) => id !== postId)
      await db.post.update({ where: { id: postId }, data: { likes: { decrement: 1 } } })
    }

    await db.userProgress.update({
      where: { userId: USER_ID },
      data: { likedPosts: JSON.stringify(liked) },
    })

    // likes count toward the community achievement
    if (shouldLike && !wasLiked) {
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
    }

    return NextResponse.json({ ok: true, liked: shouldLike })
  } catch (e) {
    console.error("[api/community/like POST]", e)
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}
