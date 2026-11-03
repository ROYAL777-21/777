import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { USER_ID, checkAchievements, computeAchievementCtx, notifyQuestsAndAchievements } from "@/lib/gamification"
import type { BotDTO, FriendsPayload } from "@/lib/types"

function toDTO(b: {
  id: string
  name: string
  avatar: string
  bio: string
  country: string
  streak: number
  weeklyXp: number
  isFriend: boolean
  requestedByUser: boolean
  requestedToUser: boolean
}): BotDTO {
  return { ...b }
}

/** outgoing requests auto-accept after ~10 seconds (bots are friendly) */
const ACCEPT_AFTER_MS = 10_000

export async function GET() {
  try {
    // auto-accept matured outgoing requests
    const pending = await db.botUser.findMany({
      where: { requestedByUser: true, isFriend: false, requestedAt: { lte: new Date(Date.now() - ACCEPT_AFTER_MS) } },
    })
    for (const b of pending) {
      await db.botUser.update({ where: { id: b.id }, data: { isFriend: true, requestedByUser: false } })
      await db.appNotification.create({
        data: {
          userId: USER_ID,
          type: "friend",
          title: `${b.name} accepted your request! 🤝`,
          body: `You and ${b.name} are now study friends. Compare streaks and encourage each other!`,
          icon: "🤝",
        },
      })
    }

    const bots = await db.botUser.findMany({ orderBy: { weeklyXp: "desc" } })
    const payload: FriendsPayload = {
      friends: bots.filter((b) => b.isFriend).map(toDTO),
      requests: bots.filter((b) => b.requestedToUser && !b.isFriend).map(toDTO),
      suggestions: bots.filter((b) => !b.isFriend && !b.requestedToUser && !b.requestedByUser).map(toDTO),
    }
    return NextResponse.json(payload)
  } catch (e) {
    console.error("[api/friends GET]", e)
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { botId, action } = (await req.json()) as { botId?: string; action?: string }
    if (!botId || !action) return NextResponse.json({ error: "bad request" }, { status: 400 })
    const bot = await db.botUser.findUnique({ where: { id: botId } })
    if (!bot) return NextResponse.json({ error: "not found" }, { status: 404 })

    let friendCount = bot.isFriend ? 1 : 0

    switch (action) {
      case "add": {
        if (bot.isFriend || bot.requestedByUser) break
        await db.botUser.update({ where: { id: bot.id }, data: { requestedByUser: true, requestedAt: new Date() } })
        friendCount = 0
        break
      }
      case "accept": {
        if (!bot.requestedToUser || bot.isFriend) break
        await db.botUser.update({ where: { id: bot.id }, data: { isFriend: true, requestedToUser: false } })
        await db.appNotification.create({
          data: {
            userId: USER_ID,
            type: "friend",
            title: `You and ${bot.name} are now friends! 🤝`,
            body: `${bot.name} is stoked to study alongside you.`,
            icon: "🤝",
          },
        })
        friendCount = 1
        break
      }
      case "decline": {
        await db.botUser.update({ where: { id: bot.id }, data: { requestedToUser: false } })
        friendCount = 0
        break
      }
      case "remove": {
        if (!bot.isFriend) break
        await db.botUser.update({ where: { id: bot.id }, data: { isFriend: false, requestedByUser: false, requestedToUser: false } })
        friendCount = 0
        break
      }
      default:
        return NextResponse.json({ error: "unknown action" }, { status: 400 })
    }

    // friend-count achievement (koinonia)
    if (action === "accept" && friendCount === 1) {
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

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("[api/friends POST]", e)
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}
