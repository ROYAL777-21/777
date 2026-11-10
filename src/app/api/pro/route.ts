import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getOrCreateUser, applyProEntitlements } from "@/lib/gamification"
import { sendJourneyEmail, proWelcomeSteps } from "@/lib/journeys"
import { createGift, type GiftCodeDTO } from "@/lib/gift"

function planStatus(progress: { plan: string; planSince: Date | null; trialEndsAt: Date | null }) {
  const isPro = progress.plan !== "free"
  const onTrial = isPro && !!progress.trialEndsAt && progress.trialEndsAt > new Date()
  return {
    plan: progress.plan,
    isPro,
    onTrial,
    planSince: progress.planSince?.toISOString() ?? null,
    trialEndsAt: progress.trialEndsAt?.toISOString() ?? null,
  }
}

export async function GET() {
  try {
    const user = await getOrCreateUser()
    return NextResponse.json(planStatus(user.progress!))
  } catch (e) {
    console.error("[api/pro GET]", e)
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}

/**
 * actions:
 *  - startTrial  → 7-day free trial of Pro on the Annual plan ($39.99/yr after),
 *                  optional gift order-bump rides along
 *  - subscribe   → { plan: "monthly" ($5.99/mo, no trial) | "annual" ($39.99/yr) }
 *                  → maps to pro; optional gift order-bump rides along
 *  - downsell    → $2.99 first month, then monthly (recorded as pro)
 *  - cancel      → back to free (demo: immediate)
 *  - pause       → back to free + a goodwill gift of 3 streak freezes
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as { action?: string; plan?: string; gift?: { toName?: unknown; message?: unknown } | null }
    const action = body.action ?? "subscribe"
    const user = await getOrCreateUser()

    if (action === "startTrial") {
      let updated = await db.userProgress.update({
        where: { userId: "user_1" },
        data: { plan: "pro", planSince: new Date(), trialEndsAt: new Date(Date.now() + 7 * 86400000), lastCanceledAt: null },
      })
      updated = await applyProEntitlements(updated)
      await sendJourneyEmail("pro_welcome", proWelcomeSteps())
      // the order bump can ride along on a trial start too
      let gift: GiftCodeDTO | null = null
      if (body.gift && typeof body.gift === "object") {
        try {
          gift = await createGift(body.gift)
        } catch (ge) {
          console.error("[api/pro POST] gift bump failed (membership unaffected)", ge)
        }
      }
      return NextResponse.json({ ok: true, ...planStatus(updated), gift })
    }

    if (action === "subscribe" || action === "downsell") {
      const plan = body.plan === "lifetime" ? "lifetime" : "pro"
      let updated = await db.userProgress.update({
        where: { userId: "user_1" },
        data: { plan, planSince: new Date(), trialEndsAt: null, lastCanceledAt: null },
      })
      updated = await applyProEntitlements(updated)
      await sendJourneyEmail("pro_welcome", proWelcomeSteps())
      // the order bump: a gifted year added at checkout (REVENUE.md weeks 7–10).
      // A failed gift write must never block the membership — catch and continue.
      let gift: GiftCodeDTO | null = null
      if (body.gift && typeof body.gift === "object") {
        try {
          gift = await createGift(body.gift)
        } catch (ge) {
          console.error("[api/pro POST] gift bump failed (membership unaffected)", ge)
        }
      }
      return NextResponse.json({ ok: true, ...planStatus(updated), gift })
    }

    if (action === "cancel") {
      const updated = await db.userProgress.update({
        where: { userId: "user_1" },
        data: { plan: "free", trialEndsAt: null, lastCanceledAt: new Date() },
      })
      return NextResponse.json({ ok: true, ...planStatus(updated) })
    }

    if (action === "pause") {
      // save flow: pause the plan, top streak freezes back up to the 2-slot cap
      const updated = await db.userProgress.update({
        where: { userId: "user_1" },
        data: { plan: "free", trialEndsAt: null, lastCanceledAt: new Date(), streakFreezes: Math.max(user.progress!.streakFreezes, 2) },
      })
      const freezeItem = await db.storeItem.findUnique({ where: { slug: "streak_freeze" } })
      if (freezeItem) {
        await db.userItem.upsert({
          where: { userId_itemId: { userId: "user_1", itemId: freezeItem.id } },
          update: { quantity: Math.max(0, user.progress!.streakFreezes) },
          create: { userId: "user_1", itemId: freezeItem.id, quantity: 2 },
        })
      }
      return NextResponse.json({ ok: true, ...planStatus(updated) })
    }

    return NextResponse.json({ error: "unknown action" }, { status: 400 })
  } catch (e) {
    console.error("[api/pro POST]", e)
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}
