import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { USER_ID, dayKey } from "@/lib/gamification"
import { ingestEvents } from "@/lib/engine/events"
import {
  getOrCreateReferral,
  referralStats,
  recordJoin,
  recordSubscribe,
  applyBankedProMonth,
  trackShare,
  APP_URL,
} from "@/lib/referral"

const MAX_BODY_BYTES = 16 * 1024 // referral payloads are tiny — 16KB is generous

/**
 * GET /api/referral — the user's referral dashboard payload
 * (code, link, stats, milestone ladder, invite ledger)
 */
export async function GET() {
  try {
    const userId = USER_ID
    const ref = await getOrCreateReferral(userId)
    const stats = await referralStats(userId)
    const invites = await db.referralInvite.findMany({
      where: { refCode: ref.code },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        friendName: true,
        status: true,
        joinedAt: true,
        note: true,
      },
    })
    const progress = await db.userProgress.findUnique({
      where: { userId },
      select: { referralProMonths: true, plan: true },
    })
    return NextResponse.json({
      ...stats,
      bankedProMonths: progress?.referralProMonths ?? 0,
      plan: progress?.plan ?? "free",
      invites,
    })
  } catch (e) {
    console.error("[api/referral GET]", e)
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}

/**
 * POST /api/referral
 *  { action: "share" }             → track a share/copy of the link (daily cap 20, atomic)
 *  { action: "join", code }        → a FRIEND accepted the invite (invitee-side; own code rejected)
 *  { action: "demo_join" }         → sandbox-only demo hook (dev builds only, clearly labeled)
 *  { action: "subscribe", code }   → a FRIEND went Pro (referrer banks a month; own code rejected)
 *  { action: "apply_credit" }      → spend one banked Pro month (guarded decrement)
 */
export async function POST(req: Request) {
  try {
    // hard body-size ceiling BEFORE parsing (memory-amplification guard)
    const declaredLength = Number(req.headers.get("content-length") ?? "0")
    if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "payload too large" }, { status: 413 })
    }

    const parsed = await req.json().catch(() => null)
    const body = (parsed && typeof parsed === "object" ? parsed : {}) as {
      action?: unknown
      code?: unknown
      friendName?: unknown
    }
    const action = typeof body.action === "string" ? body.action : ""

    if (action === "share") {
      const ref = await getOrCreateReferral(USER_ID)
      const allowed = await trackShare(ref.id, dayKey())
      if (!allowed) return NextResponse.json({ error: "share tracking capped for today" }, { status: 429 })
      await ingestEvents(USER_ID, [{ type: "share", payload: { kind: "referral_link" } }])
      return NextResponse.json({ ok: true, code: ref.code, link: `${APP_URL}/join/${ref.code}` })
    }

    if (action === "join" || action === "demo_join") {
      let code: string
      if (action === "demo_join") {
        // sandbox demo: join with YOUR OWN code (dev builds only — this lets
        // you experience the loop end-to-end; production rejects self-referral)
        if (process.env.NODE_ENV === "production") {
          return NextResponse.json({ error: "unknown action" }, { status: 404 })
        }
        const ref = await getOrCreateReferral(USER_ID)
        code = ref.code
      } else {
        const raw = typeof body.code === "string" ? body.code.trim().toUpperCase() : ""
        if (!/^[A-Z0-9]{6}$/.test(raw)) return NextResponse.json({ error: "invalid code" }, { status: 400 })
        code = raw
      }
      const res = await recordJoin(code, { demo: action === "demo_join" })
      if (!res.ok) return NextResponse.json({ error: res.error }, { status: res.status })
      await ingestEvents(USER_ID, [{ type: "invite", payload: { converted: "join", demo: action === "demo_join" } }])
      return NextResponse.json(res)
    }

    if (action === "subscribe" || action === "demo_subscribe") {
      const demo = action === "demo_subscribe"
      if (demo && process.env.NODE_ENV === "production") {
        return NextResponse.json({ error: "unknown action" }, { status: 404 })
      }
      let code: string
      if (demo) {
        const ref = await getOrCreateReferral(USER_ID)
        code = ref.code
      } else {
        const raw = typeof body.code === "string" ? body.code.trim().toUpperCase() : ""
        if (!/^[A-Z0-9]{6}$/.test(raw)) return NextResponse.json({ error: "invalid code" }, { status: 400 })
        code = raw
      }
      const friendName = typeof body.friendName === "string" ? body.friendName.slice(0, 40) : undefined
      const res = await recordSubscribe(code, friendName, { demo })
      if (!res.ok) return NextResponse.json({ error: res.error }, { status: res.status })
      await ingestEvents(USER_ID, [{ type: "invite", payload: { converted: "subscribe", demo } }])
      return NextResponse.json(res)
    }

    if (action === "apply_credit") {
      const spent = await applyBankedProMonth(USER_ID)
      if (!spent) return NextResponse.json({ error: "no banked months" }, { status: 400 })
      const progress = await db.userProgress.findUnique({
        where: { userId: USER_ID },
        select: { referralProMonths: true },
      })
      return NextResponse.json({ ok: true, remaining: progress?.referralProMonths ?? 0 })
    }

    return NextResponse.json({ error: "unknown action" }, { status: 400 })
  } catch (e) {
    console.error("[api/referral POST]", e)
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}
