import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getOrCreateUser, USER_ID } from "@/lib/gamification"
import type { CommunityPayload, PostAttachment, PostCommentDTO, PostDTO } from "@/lib/types"

function timeAgo(iso: Date): string {
  const s = Math.max(1, Math.floor((Date.now() - iso.getTime()) / 1000))
  if (s < 60) return "just now"
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const tab = url.searchParams.get("tab") ?? "all"
    const user = await getOrCreateUser()
    const progress = user.progress!

    // bot encouragement: after ~25s, a random friend or two likes the user's newest post
    const userPosts = await db.post.findMany({ where: { userId: USER_ID }, orderBy: { createdAt: "asc" } })
    for (const p of userPosts) {
      const age = Date.now() - p.createdAt.getTime()
      if (age > 25_000 && age < 6 * 3600_000 && p.likes < 8) {
        const boost = 1 + (Math.floor(age / 25_000) % 2)
        await db.post.update({ where: { id: p.id }, data: { likes: { increment: boost } } })
        p.likes += boost
        const liker = await db.botUser.findFirst({ where: { isFriend: true } })
        if (liker && boost > 0) {
          await db.appNotification.create({
            data: {
              userId: USER_ID,
              type: "social",
              title: `${liker.name} liked your post ❤️`,
              body: "Your encouragement is making rounds in the community.",
              icon: "❤️",
            },
          })
        }
      }
    }

    const raw = await db.post.findMany({
      orderBy: { createdAt: "desc" },
      include: { bot: true, comments: { orderBy: { createdAt: "asc" }, include: { bot: true } } },
      take: 60,
    })

    let liked: string[] = []
    try {
      liked = JSON.parse(progress.likedPosts) as string[]
    } catch {
      liked = []
    }

    const friendIds = new Set(
      (await db.botUser.findMany({ where: { isFriend: true }, select: { id: true } })).map((b) => b.id),
    )

    const mapped: (PostDTO & { ago: string })[] = raw.map((p) => {
      const attachment: PostAttachment | null = p.attachment
        ? (() => {
            try {
              return JSON.parse(p.attachment!) as PostAttachment
            } catch {
              return null
            }
          })()
        : null
      const comments: PostCommentDTO[] = p.comments.map((c) => ({
        id: c.id,
        authorName: c.bot?.name ?? user.name,
        authorAvatar: c.bot?.avatar ?? (user.avatar ?? null),
        authorEmoji: c.bot ? null : user.image,
        isUser: !c.bot,
        body: c.body,
        createdAt: timeAgo(c.createdAt),
      }))
      return {
        id: p.id,
        authorName: p.bot?.name ?? user.name,
        authorAvatar: p.bot?.avatar ?? (user.avatar ?? null),
        authorEmoji: p.bot ? null : user.image,
        authorCountry: p.bot?.country ?? "🌍",
        isUser: !p.bot,
        isFriend: p.bot ? friendIds.has(p.bot.id) : false,
        body: p.body,
        attachment,
        likes: p.likes,
        liked: liked.includes(p.id),
        comments,
        createdAt: timeAgo(p.createdAt),
        ago: timeAgo(p.createdAt),
      }
    })

    let posts = mapped
    if (tab === "friends") posts = mapped.filter((p) => p.isUser || p.isFriend)
    if (tab === "me") posts = mapped.filter((p) => p.isUser)

    const payload: CommunityPayload & { posts: (PostDTO & { ago: string })[] } = {
      posts,
      guidelines: true,
    }
    return NextResponse.json(payload)
  } catch (e) {
    console.error("[api/community GET]", e)
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { body, attachment } = (await req.json()) as { body?: string; attachment?: PostAttachment | null }
    if (!body || !body.trim()) return NextResponse.json({ error: "empty post" }, { status: 400 })
    const user = await getOrCreateUser()
    const created = await db.post.create({
      data: {
        userId: user.id,
        body: body.trim().slice(0, 600),
        attachment: attachment ? JSON.stringify(attachment) : null,
      },
    })

    // achievements (community_seed) — posts count toward it
    const { checkAchievements, computeAchievementCtx } = await import("@/lib/gamification")
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

    return NextResponse.json({ ok: true, id: created.id, achievements: ach.unlocked })
  } catch (e) {
    console.error("[api/community POST]", e)
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}
