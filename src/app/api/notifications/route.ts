import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getOrCreateUser, USER_ID } from "@/lib/gamification"
import type { NotificationDTO } from "@/lib/types"

export async function GET() {
  try {
    await getOrCreateUser()
    const list = await db.appNotification.findMany({
      where: { userId: USER_ID },
      orderBy: { createdAt: "desc" },
      take: 40,
    })
    const dtos: NotificationDTO[] = list.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      body: n.body,
      icon: n.icon,
      read: n.read,
      createdAt: n.createdAt.toISOString(),
    }))
    return NextResponse.json({ notifications: dtos, unread: dtos.filter((d) => !d.read).length })
  } catch (e) {
    console.error("[api/notifications GET]", e)
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { action?: string; title?: string; bodyText?: string; icon?: string }
    const action = body.action ?? "readAll"
    if (action === "readAll") {
      await db.appNotification.updateMany({ where: { userId: USER_ID, read: false }, data: { read: true } })
      return NextResponse.json({ ok: true })
    }
    if (action === "test") {
      const created = await db.appNotification.create({
        data: {
          userId: USER_ID,
          type: "reminder",
          title: body.title ?? "Time to study! ⏰",
          body: body.bodyText ?? "Your daily lesson is waiting. A 5-minute session keeps your streak alive!",
          icon: body.icon ?? "⏰",
        },
      })
      return NextResponse.json({
        ok: true,
        notification: {
          id: created.id,
          type: created.type,
          title: created.title,
          body: created.body,
          icon: created.icon,
          read: false,
          createdAt: created.createdAt.toISOString(),
        } satisfies NotificationDTO,
      })
    }
    return NextResponse.json({ error: "unknown action" }, { status: 400 })
  } catch (e) {
    console.error("[api/notifications POST]", e)
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}
