import { NextResponse } from "next/server"
import { sendCampaignEmailOnce } from "@/lib/journeys"
import { CAMPAIGN_KEY, campaignActive, campaignPhase, bannerCopy, dueEmailSteps } from "@/lib/campaign"

/**
 * GET /api/campaign — the campaign state for banners/landing pages.
 * Always safe: read-only, no sends.
 */
export async function GET() {
  const now = new Date()
  return NextResponse.json({
    key: CAMPAIGN_KEY,
    phase: campaignPhase(now),
    active: campaignActive(now),
    banner: bannerCopy(now),
    emailsQueued: dueEmailSteps(now).length,
  })
}

/**
 * POST /api/campaign
 *  { action: "sendEmails" }  → fire every DUE, UNSSENT email step (idempotent).
 *
 * Wire this to a daily cron (Vercel Cron / GitHub Action / `stripe listen`-style
 * local job) at ~08:00 local. Running it twice a day is harmless — each
 * (journey, step) is delivered at most once, per user, ever.
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as { action?: string }
    if (body.action !== "sendEmails") {
      return NextResponse.json({ error: "unknown action" }, { status: 400 })
    }

    const now = new Date()
    if (!campaignActive(now) && campaignPhase(now) !== "ended") {
      // pre-season: nothing due yet — report honestly
      return NextResponse.json({ ok: true, phase: campaignPhase(now), sent: [], note: "campaign not started" })
    }

    const due = dueEmailSteps(now)
    if (due.length === 0) {
      return NextResponse.json({ ok: true, phase: campaignPhase(now), sent: [] })
    }

    const sent = await sendCampaignEmailOnce(CAMPAIGN_KEY, due)
    return NextResponse.json({ ok: true, phase: campaignPhase(now), sent, considered: due.map((d) => d.step) })
  } catch (e) {
    console.error("[api/campaign POST]", e)
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}
