import { NextResponse } from "next/server"
import { createGift, listGifts, redeemGiftCode, GIFT_CODE_RE } from "@/lib/gift"
import { USER_ID } from "@/lib/gamification"
import { ingestEvents } from "@/lib/engine/events"

const MAX_BODY_BYTES = 4 * 1024 // redeem/purchase payloads are tiny

/**
 * GET /api/gift — gifts I've sent (with live redeemed state) + gifts I've redeemed
 */
export async function GET() {
  try {
    const lists = await listGifts()
    return NextResponse.json(lists)
  } catch (e) {
    console.error("[api/gift GET]", e)
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}

/**
 * POST /api/gift
 *  { action: "redeem", code: "SCROLL-XXXX-XXXX" }
 *  → one-time claim: applies a gifted year of Scroll Pro, server-side only
 *
 *  { action: "purchase", toName: "Naomi", message: "Merry Christmas…" }
 *  → gift-only purchase (no plan for the buyer) — the Advent campaign entry
 *    point. Mints the code server-side; the buyer's own plan never changes.
 */
export async function POST(req: Request) {
  try {
    const declaredLength = Number(req.headers.get("content-length") ?? "0")
    if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "payload too large" }, { status: 413 })
    }
    const parsed = await req.json().catch(() => null)
    const body = (parsed && typeof parsed === "object" ? parsed : {}) as { action?: unknown; code?: unknown; toName?: unknown; message?: unknown }
    const action = typeof body.action === "string" ? body.action : ""

    if (action === "purchase") {
      const toName = typeof body.toName === "string" ? body.toName : ""
      if (toName.trim().length < 2) {
        return NextResponse.json({ error: "their name, please (2–24 letters)" }, { status: 400 })
      }
      const gift = await createGift({ toName, message: body.message })
      // the engine cares about conversion moments — feed it
      await ingestEvents(USER_ID, [{ type: "gift_purchased", payload: { months: gift.months, standalone: true } }])
      return NextResponse.json({ ok: true, gift })
    }

    if (action === "redeem") {
      const raw = typeof body.code === "string" ? body.code : ""
      // cheap pre-check so junk never reaches the DB layer
      if (!GIFT_CODE_RE.test(raw.trim().toUpperCase())) {
        return NextResponse.json({ ok: false, reason: "invalid" }, { status: 400 })
      }
      const result = await redeemGiftCode(raw)
      if (!result.ok) {
        const status = result.reason === "not_found" ? 404 : result.reason === "already_redeemed" ? 409 : 400
        return NextResponse.json({ ok: false, reason: result.reason }, { status })
      }
      // the engine cares about conversion moments — feed it
      await ingestEvents(USER_ID, [{ type: "gift_redeemed", payload: { months: result.months } }])
      return NextResponse.json(result)
    }

    return NextResponse.json({ error: "unknown action" }, { status: 400 })
  } catch (e) {
    console.error("[api/gift POST]", e)
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}
