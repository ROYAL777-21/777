import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getOrCreateUser } from "@/lib/gamification"

/** toggle sound / haptics preferences */
export async function POST(req: Request) {
  try {
    const { soundOn, hapticsOn } = (await req.json()) as { soundOn?: boolean; hapticsOn?: boolean }
    await getOrCreateUser()
    const data: { soundOn?: boolean; hapticsOn?: boolean } = {}
    if (typeof soundOn === "boolean") data.soundOn = soundOn
    if (typeof hapticsOn === "boolean") data.hapticsOn = hapticsOn
    const updated = await db.userProgress.update({ where: { userId: "user_1" }, data })
    return NextResponse.json({ ok: true, soundOn: updated.soundOn, hapticsOn: updated.hapticsOn })
  } catch (e) {
    console.error("[api/settings]", e)
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}
