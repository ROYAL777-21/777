// ═══════════════════════════════════════════════════════════════
//  STRIPE CHECKOUT — the live-payment entry point
//
//  Wire-up (see .env.example):
//    · STRIPE_SECRET_KEY       — sk_live_… / sk_test_…
//    · STRIPE_PRICE_ANNUAL     — recurring yearly  $39.99 (7-day trial applied here)
//    · STRIPE_PRICE_MONTHLY    — recurring monthly $5.99 (no trial — charged at checkout)
//    · STRIPE_PRICE_GIFT       — one-time $29.99 (optional; inline price_data fallback)
//
//  POST { plan: "annual" | "monthly", gift?: { toName, message } }
//  → { url } — redirect the browser to Stripe Checkout.
//  Without keys → 501 { live:false } and the client falls back to the
//  demo checkout at /api/pro, so the app keeps working in dev.
//
//  No SDK dependency: plain fetch to api.stripe.com with Basic auth.
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server"

const STRIPE_API = "https://api.stripe.com/v1"

// v7.1 pricing — single source of truth for the live path (mirrors offer.ts)
export const PRICING = {
  annual: { amount: 3999, interval: "year", trialDays: 7 }, // $39.99/yr after a 7-day free trial
  monthly: { amount: 599, interval: "month", trialDays: 0 }, // $5.99 charged upon checkout
  gift: { amount: 2999 }, // one-time gift year (reg $39.99)
} as const

function env(name: string): string | undefined {
  const v = process.env[name]
  return v && v.length > 0 ? v : undefined
}

/** Stripe expects form-encoded bodies */
function form(data: Record<string, string | number | undefined>): URLSearchParams {
  const p = new URLSearchParams()
  for (const [k, v] of Object.entries(data)) {
    if (v !== undefined && v !== null && v !== "") p.append(k, String(v))
  }
  return p
}

async function stripe(path: string, key: string, body?: Record<string, string | number | undefined>) {
  const res = await fetch(`${STRIPE_API}${path}`, {
    method: body ? "POST" : "GET",
    headers: {
      Authorization: `Basic ${Buffer.from(key + ":").toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body ? form(body).toString() : undefined,
  })
  const json = (await res.json()) as Record<string, unknown> & { error?: { message?: string } }
  if (!res.ok) throw new Error(json.error?.message ?? `Stripe ${res.status}`)
  return json
}

export async function POST(req: Request) {
  const key = env("STRIPE_SECRET_KEY")
  if (!key) {
    return NextResponse.json(
      {
        live: false,
        error: "stripe_not_configured",
        message:
          "Set STRIPE_SECRET_KEY (+ price IDs) to go live. The demo checkout at /api/pro keeps working meanwhile.",
      },
      { status: 501 },
    )
  }

  try {
    const body = (await req.json().catch(() => ({}))) as {
      plan?: string
      gift?: { toName?: unknown; message?: unknown } | null
    }
    const plan = body.plan === "monthly" ? "monthly" : "annual"
    const origin = new URL(req.url).origin
    const priceId = plan === "monthly" ? env("STRIPE_PRICE_MONTHLY") : env("STRIPE_PRICE_ANNUAL")

    if (!priceId) {
      return NextResponse.json(
        { live: false, error: "stripe_price_missing", message: `Set STRIPE_PRICE_${plan.toUpperCase()} in the environment.` },
        { status: 501 },
      )
    }

    // line 1: the subscription itself
    const params: Record<string, string | number | undefined> = {
      mode: "subscription",
      "line_items[0][price]": priceId,
      "line_items[0][quantity]": 1,
      success_url: env("STRIPE_SUCCESS_URL") ?? `${origin}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: env("STRIPE_CANCEL_URL") ?? `${origin}/?checkout=cancel`,
      client_reference_id: "user_1", // demo single-user; swap for real auth ids
      "metadata[plan]": plan,
      "subscription_data[metadata][plan]": plan,
      allow_promotion_codes: "true",
    }

    // annual → the 7-day free trial lives on the subscription itself
    if (plan === "annual") {
      params["subscription_data[trial_period_days]"] = PRICING.annual.trialDays
    }

    // the order bump: a gift year rides along in the same checkout
    const gift = body.gift && typeof body.gift === "object" ? body.gift : null
    if (gift) {
      const giftPriceId = env("STRIPE_PRICE_GIFT")
      const toName = typeof gift.toName === "string" ? gift.toName.slice(0, 24) : ""
      const message = typeof gift.message === "string" ? gift.message.slice(0, 140) : ""
      if (giftPriceId) {
        params["line_items[1][price]"] = giftPriceId
      } else {
        // inline one-time price — no dashboard product needed
        params["line_items[1][price_data][currency]"] = "usd"
        params["line_items[1][price_data][unit_amount]"] = PRICING.gift.amount
        params["line_items[1][price_data][product_data][name]"] = "Gift a year of Scroll Pro"
      }
      params["line_items[1][quantity]"] = 1
      params["metadata[gift_to]"] = toName
      params["metadata[gift_msg]"] = message
    }

    const session = await stripe("/checkout/sessions", key, params)
    return NextResponse.json({ live: true, url: session.url, id: session.id })
  } catch (e) {
    console.error("[api/stripe/checkout]", e)
    return NextResponse.json({ error: "checkout_failed", message: (e as Error).message }, { status: 502 })
  }
}

/** GET → live-readiness probe (the paywall uses this to decide which checkout to call) */
export async function GET() {
  const live = !!env("STRIPE_SECRET_KEY") && !!env("STRIPE_PRICE_ANNUAL") && !!env("STRIPE_PRICE_MONTHLY")
  return NextResponse.json({ live, pricing: PRICING })
}
