import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getOrCreateUser, regenHearts, MAX_HEARTS, USER_ID } from "@/lib/gamification"
import type { ShopPayload } from "@/lib/types"

export async function GET() {
  try {
    const user = await getOrCreateUser()
    const progress = await regenHearts(user.progress!)
    const items = await db.storeItem.findMany({ orderBy: { price: "asc" } })
    const owned = await db.userItem.findMany({ where: { userId: USER_ID } })
    const ownedMap = new Map(owned.map((o) => [o.itemId, o.quantity]))
    const payload: ShopPayload = {
      gems: progress.gems,
      streakFreezes: progress.streakFreezes,
      items: items.map((i) => ({
        slug: i.slug,
        name: i.name,
        description: i.description,
        icon: i.icon,
        price: i.price,
        owned: i.slug === "streak_freeze" ? progress.streakFreezes : (ownedMap.get(i.id) ?? 0),
      })),
    }
    return NextResponse.json(payload)
  } catch (e) {
    console.error("[api/shop GET]", e)
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { slug } = (await req.json()) as { slug?: string }
    if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 })
    const user = await getOrCreateUser()
    const progress = await regenHearts(user.progress!)
    const item = await db.storeItem.findUnique({ where: { slug } })
    if (!item) return NextResponse.json({ error: "item not found" }, { status: 404 })
    if (progress.gems < item.price) {
      return NextResponse.json({ error: "not enough gems", gems: progress.gems }, { status: 400 })
    }

    let gems = progress.gems - item.price
    let hearts = progress.hearts
    let streakFreezes = progress.streakFreezes
    let doubleXpUntil = progress.doubleXpUntil

    switch (slug) {
      case "streak_freeze":
        if (streakFreezes >= 2) return NextResponse.json({ error: "max 2 streak freezes equipped" }, { status: 400 })
        streakFreezes += 1
        break
      case "heart_refill":
        hearts = MAX_HEARTS
        break
      case "double_xp":
        doubleXpUntil = new Date(Date.now() + 15 * 60 * 1000)
        break
      default:
        break
    }

    const updated = await db.userProgress.update({
      where: { userId: USER_ID },
      data: { gems, hearts, streakFreezes, doubleXpUntil, lastHeartAt: hearts < MAX_HEARTS ? progress.lastHeartAt : null },
    })

    await db.appNotification.create({
      data: {
        userId: USER_ID,
        type: "info",
        title: `${item.icon} ${item.name} purchased!`,
        body:
          slug === "streak_freeze"
            ? "Your streak is now protected for one missed day. Sleep easy, scholar."
            : slug === "heart_refill"
              ? "Hearts refilled to the max — back to the books!"
              : "Double XP active for 15 minutes — make them count!",
        icon: item.icon,
      },
    })

    return NextResponse.json({ ok: true, gems: updated.gems, hearts: updated.hearts, streakFreezes: updated.streakFreezes, doubleXpUntil: updated.doubleXpUntil?.toISOString() ?? null })
  } catch (e) {
    console.error("[api/shop POST]", e)
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}
