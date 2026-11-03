import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getOrCreateUser, regenHearts, nextHeartAt, MAX_HEARTS } from "@/lib/gamification"

/** sync hearts after a lesson session (client reports final heart count) */
export async function POST(req: Request) {
  try {
    const { hearts } = (await req.json()) as { hearts?: number }
    const user = await getOrCreateUser()
    const progress = await regenHearts(user.progress!)
    const h = Math.max(0, Math.min(MAX_HEARTS, hearts ?? progress.hearts))
    const updated = await db.userProgress.update({
      where: { userId: "user_1" },
      data: { hearts: h, lastHeartAt: h < MAX_HEARTS ? new Date() : null },
    })
    return NextResponse.json({ hearts: updated.hearts, nextHeartAt: nextHeartAt(updated) })
  } catch (e) {
    console.error("[api/hearts]", e)
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}
