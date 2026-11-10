import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getOrCreateUser } from "@/lib/gamification"

/**
 * GET: the full email-journey delivery log — powers the
 * "Email journeys" preview in Profile.
 */
export async function GET() {
  try {
    await getOrCreateUser()
    const logs = await db.emailLog.findMany({
      where: { userId: "user_1" },
      orderBy: { sentAt: "desc" },
      take: 200,
    })
    return NextResponse.json({
      emails: logs.map((l) => ({
        id: l.id,
        journey: l.journey,
        step: l.step,
        subject: l.subject,
        preheader: l.preheader,
        bodyText: l.bodyText,
        ctaLabel: l.ctaLabel,
        ctaView: l.ctaView,
        status: l.status,
        sentAt: l.sentAt.toISOString(),
      })),
    })
  } catch (e) {
    console.error("[api/email-journeys]", e)
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}
