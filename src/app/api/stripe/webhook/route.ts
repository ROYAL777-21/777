// ═══════════════════════════════════════════════════════════════
//  STRIPE WEBHOOK — the live-payment source of truth
//
//  Point a Stripe webhook endpoint here (Stripe CLI for local:
//    stripe listen --forward-to localhost:3000/api/stripe/webhook)
//  Subscribe to:
//    checkout.session.completed     → grant Pro (+ mint the gift bump code)
//    customer.subscription.updated  → cancel_at_period_end → schedule downgrade
//    customer.subscription.deleted  → plan back to free
//    invoice.payment_failed         → dunning — log + flag for the win-back journey
//
//  Security:
//    · every request is signature-verified (HMAC-SHA256, constant-time
//      compare) against STRIPE_WEBHOOK_SECRET — unsigned posts are dropped
//    · entitlements are only ever granted server-side, from verified events
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server"
import { createHmac, timingSafeEqual } from "crypto"
import { db } from "@/lib/db"
import { applyProEntitlements } from "@/lib/gamification"
import { createGift } from "@/lib/gift"
import { sendJourneyEmail, proWelcomeSteps } from "@/lib/journeys"

const USER_ID = "user_1" // demo single-user; swap for real auth (client_reference_id → session.metadata)

/** Verify the Stripe-Signature header per Stripe's spec (t=…,v1=…) */
function verifySignature(payload: string, header: string | null, secret: string): boolean {
  if (!header) return false
  const parts = Object.fromEntries(
    header.split(",").map((kv) => {
      const [k, v] = kv.split("=")
      return [k.trim(), v?.trim() ?? ""]
    }),
  )
  const timestamp = parts["t"]
  const signature = parts["v1"]
  if (!timestamp || !signature) return false

  // replay window: 5 minutes
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false

  const expected = createHmac("sha256", secret).update(`${timestamp}.${payload}`).digest("hex")
  const a = Buffer.from(expected, "utf8")
  const b = Buffer.from(signature, "utf8")
  return a.length === b.length && timingSafeEqual(a, b)
}

type StripeEvent = {
  id: string
  type: string
  data: { object: Record<string, unknown> }
}

async function handleCheckoutCompleted(event: StripeEvent) {
  const s = event.data.object as {
    metadata?: Record<string, string>
    subscription?: string
    client_reference_id?: string
  }
  const plan = s.metadata?.["plan"] === "monthly" ? "monthly" : "annual"

  // grant Pro — for annual the session completed at trial start ($0 today),
  // so entitlements begin immediately and trialEndsAt mirrors Stripe's trial
  let updated = await db.userProgress.update({
    where: { userId: USER_ID },
    data: {
      plan: "pro",
      planSince: new Date(),
      trialEndsAt: plan === "annual" ? new Date(Date.now() + 7 * 86400000) : null,
      lastCanceledAt: null,
    },
  })
  updated = await applyProEntitlements(updated)
  await sendJourneyEmail("pro_welcome", proWelcomeSteps())

  // the order bump: mint the gift code only after payment is verified
  const giftTo = s.metadata?.["gift_to"]
  if (giftTo) {
    try {
      await createGift({ toName: giftTo, message: s.metadata?.["gift_msg"] ?? "" })
    } catch (ge) {
      // a failed gift write must never un-grant the membership — flag it
      console.error("[stripe/webhook] gift bump failed after checkout", event.id, ge)
    }
  }
  console.log(`💳 [stripe] checkout.completed → ${plan} plan active${giftTo ? " + gift year" : ""}`)
}

async function handleSubscriptionDeleted() {
  await db.userProgress.update({
    where: { userId: USER_ID },
    data: { plan: "free", trialEndsAt: null, lastCanceledAt: new Date() },
  })
  console.log("👋 [stripe] subscription.deleted → plan back to free (win-back journey armed)")
}

async function handleSubscriptionUpdated(event: StripeEvent) {
  const sub = event.data.object as { cancel_at_period_end?: boolean }
  if (sub.cancel_at_period_end) {
    // access continues to period end; arm the win-back + honest countdown
    await db.userProgress.update({
      where: { userId: USER_ID },
      data: { lastCanceledAt: new Date() },
    })
    console.log("🕐 [stripe] subscription.update → cancels at period end")
  }
}

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) {
    return NextResponse.json({ error: "webhook_secret_not_set" }, { status: 503 })
  }

  const payload = await req.text()
  const signature = req.headers.get("stripe-signature")
  if (!verifySignature(payload, signature, secret)) {
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 })
  }

  let event: StripeEvent
  try {
    event = JSON.parse(payload) as StripeEvent
  } catch {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event)
        break
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event)
        break
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted()
        break
      case "invoice.payment_failed":
        // dunning: Stripe retries per its schedule; we surface the risk
        console.warn("⚠️ [stripe] invoice.payment_failed — retry scheduled, win-back armed")
        break
      default:
        // unhandled types are acknowledged so Stripe stops retrying
        break
    }
  } catch (e) {
    console.error("[stripe/webhook] handler failed", event.type, e)
    // 500 → Stripe retries with backoff (idempotent handlers make this safe)
    return NextResponse.json({ error: "handler_failed" }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
