import { NextResponse } from "next/server"
import { getChurchDashboard, getChurchOrg } from "@/lib/church"
import { db } from "@/lib/db"

const MAX_BODY_BYTES = 16 * 1024

/**
 * GET /api/church — the admin dashboard payload
 * (org, seats, the merged cohort, verse coverage, streaks, 8-week trend)
 */
export async function GET() {
  try {
    const payload = await getChurchDashboard()
    if (!payload) return NextResponse.json({ error: "no church plan" }, { status: 404 })
    return NextResponse.json(payload)
  } catch (e) {
    console.error("[api/church GET]", e)
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}

/**
 * POST /api/church — seat management (admin only, capped at seatsTotal)
 *  { action: "invite", name: string }  → add a seat (starts fresh)
 *  { action: "remove", memberId: string } → free a seat (admin seat is protected)
 */
export async function POST(req: Request) {
  try {
    const declaredLength = Number(req.headers.get("content-length") ?? "0")
    if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "payload too large" }, { status: 413 })
    }
    const parsed = await req.json().catch(() => null)
    const body = (parsed && typeof parsed === "object" ? parsed : {}) as { action?: unknown; name?: unknown; memberId?: unknown }
    const action = typeof body.action === "string" ? body.action : ""
    const org = await getChurchOrg()
    if (!org) return NextResponse.json({ error: "no church plan" }, { status: 404 })

    if (action === "invite") {
      // input whitelist: printable name, hard length cap, no tags/control chars
      const name = String(body.name ?? "")
        .replace(/[\u0000-\u001f\u007f]/g, " ")
        .replace(/<[^>]*>/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 24)
      if (name.length < 2) return NextResponse.json({ error: "name too short" }, { status: 400 })

      const used = await db.churchMember.count({ where: { orgId: org.id } })
      if (used >= org.seatsTotal) return NextResponse.json({ error: "all seats filled" }, { status: 409 })

      const member = await db.churchMember.create({
        data: { orgId: org.id, name, emoji: "📖", role: "member" },
      })
      return NextResponse.json({ ok: true, memberId: member.id, seatsUsed: used + 1, seatsTotal: org.seatsTotal })
    }

    if (action === "remove") {
      const memberId = typeof body.memberId === "string" ? body.memberId : ""
      if (!/^[a-z0-9]{20,30}$/i.test(memberId)) return NextResponse.json({ error: "invalid member" }, { status: 400 })
      const member = await db.churchMember.findUnique({ where: { id: memberId } })
      if (!member || member.orgId !== org.id) return NextResponse.json({ error: "not found" }, { status: 404 })
      if (member.role === "admin" || member.userId) {
        return NextResponse.json({ error: "the admin seat cannot be removed" }, { status: 403 })
      }
      await db.churchMember.delete({ where: { id: memberId } })
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: "unknown action" }, { status: 400 })
  } catch (e) {
    console.error("[api/church POST]", e)
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}
