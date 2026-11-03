import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getOrCreateUser, USER_ID } from "@/lib/gamification"

/** claim the chest after a completed unit → +30 gems */
export async function POST(req: Request) {
  try {
    const { unitId } = (await req.json()) as { unitId?: string }
    if (!unitId) return NextResponse.json({ error: "unitId required" }, { status: 400 })
    const user = await getOrCreateUser()
    const progress = user.progress!

    const unit = await db.unit.findUnique({ where: { id: unitId }, include: { lessons: true } })
    if (!unit) return NextResponse.json({ error: "unit not found" }, { status: 404 })

    const done = await db.lessonCompletion.count({
      where: { userId: USER_ID, lessonId: { in: unit.lessons.map((l) => l.id) } },
    })
    if (done < unit.lessons.length) {
      return NextResponse.json({ error: "unit not complete" }, { status: 400 })
    }
    const already = await db.chestClaim.findUnique({
      where: { userId_unitId: { userId: USER_ID, unitId } },
    })
    if (already) return NextResponse.json({ error: "already claimed" }, { status: 400 })

    const GEMS = 30
    await db.chestClaim.create({ data: { userId: USER_ID, unitId } })
    const updated = await db.userProgress.update({
      where: { userId: USER_ID },
      data: { gems: progress.gems + GEMS },
    })
    await db.appNotification.create({
      data: {
        userId: USER_ID,
        type: "info",
        title: "Chest opened! 💎",
        body: `Unit complete — you found ${GEMS} gems inside the chest. Well earned!`,
        icon: "🎁",
      },
    })
    return NextResponse.json({ ok: true, gems: updated.gems, reward: GEMS })
  } catch (e) {
    console.error("[api/chests]", e)
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}
