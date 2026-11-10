import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getOrCreateUser } from "@/lib/gamification"
import { readNotifPrefs, readEmailPrefs, DEFAULT_NOTIF_PREFS, DEFAULT_EMAIL_PREFS } from "@/lib/journeys"

/** GET the full notification + email preference set */
export async function GET() {
  try {
    const user = await getOrCreateUser()
    const p = user.progress!
    return NextResponse.json({
      notifPrefs: readNotifPrefs(p),
      emailPrefs: readEmailPrefs(p),
      reminderTime: p.reminderTime,
      quietHoursOn: p.quietHoursOn,
      emailOptIn: p.emailOptIn,
      defaults: { notifPrefs: DEFAULT_NOTIF_PREFS, emailPrefs: DEFAULT_EMAIL_PREFS },
    })
  } catch (e) {
    console.error("[api/notifications/prefs GET]", e)
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}

/** POST partial updates: { reminderTime?, quietHoursOn?, emailOptIn?, notifPrefs?: {...}, emailPrefs?: {...} }
 *  Blue-team hardening: pref keys are whitelisted against the known
 *  categories, values must be booleans — arbitrary keys cannot be stored. */
export async function POST(req: Request) {
  try {
    await getOrCreateUser()
    const body = (await req.json()) as {
      reminderTime?: string
      quietHoursOn?: boolean
      emailOptIn?: boolean
      notifPrefs?: Record<string, unknown>
      emailPrefs?: Record<string, unknown>
    }
    const current = await db.userProgress.findUniqueOrThrow({ where: { userId: "user_1" } })
    const data: Record<string, unknown> = {}
    if (body.reminderTime && /^([01]\d|2[0-3]):[0-5]\d$/.test(body.reminderTime)) data.reminderTime = body.reminderTime
    if (typeof body.quietHoursOn === "boolean") data.quietHoursOn = body.quietHoursOn
    if (typeof body.emailOptIn === "boolean") data.emailOptIn = body.emailOptIn
    if (body.notifPrefs && typeof body.notifPrefs === "object" && !Array.isArray(body.notifPrefs)) {
      const merged = { ...readNotifPrefs(current) }
      let accepted = 0
      for (const [k, v] of Object.entries(body.notifPrefs)) {
        if (typeof v !== "boolean") continue // booleans only
        if (!(k in DEFAULT_NOTIF_PREFS)) continue // whitelist only
        merged[k] = v
        accepted++
        if (accepted >= 32) break // bounded
      }
      data.notifPrefs = JSON.stringify(merged)
    }
    if (body.emailPrefs && typeof body.emailPrefs === "object" && !Array.isArray(body.emailPrefs)) {
      const merged = { ...readEmailPrefs(current) }
      let accepted = 0
      for (const [k, v] of Object.entries(body.emailPrefs)) {
        if (typeof v !== "boolean") continue
        if (!(k in DEFAULT_EMAIL_PREFS)) continue
        merged[k] = v
        accepted++
        if (accepted >= 32) break
      }
      data.emailPrefs = JSON.stringify(merged)
    }
    const updated = await db.userProgress.update({ where: { userId: "user_1" }, data })
    return NextResponse.json({
      ok: true,
      notifPrefs: readNotifPrefs(updated),
      emailPrefs: readEmailPrefs(updated),
      reminderTime: updated.reminderTime,
      quietHoursOn: updated.quietHoursOn,
      emailOptIn: updated.emailOptIn,
    })
  } catch (e) {
    console.error("[api/notifications/prefs POST]", e)
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}
