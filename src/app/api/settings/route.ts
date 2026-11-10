import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getOrCreateUser, USER_ID } from "@/lib/gamification"
import { readNotifPrefs, readEmailPrefs } from "@/lib/journeys"
import { tap } from "@/lib/engine/events"

/** toggle sound / haptics preferences (and other quick settings) */
export async function POST(req: Request) {
  try {
    const { soundOn, hapticsOn, reminderTime, quietHoursOn, emailOptIn, personalizedOffers, redLetterOn, dailyGoal } = (await req.json()) as {
      soundOn?: boolean
      hapticsOn?: boolean
      reminderTime?: string
      quietHoursOn?: boolean
      emailOptIn?: boolean
      personalizedOffers?: boolean
      redLetterOn?: boolean
      dailyGoal?: number | null // v11.5: goal agency — null returns sizing to the engine
    }
    await getOrCreateUser()
    const data: Record<string, unknown> = {}
    if (typeof soundOn === "boolean") data.soundOn = soundOn
    if (typeof hapticsOn === "boolean") data.hapticsOn = hapticsOn
    if (typeof quietHoursOn === "boolean") data.quietHoursOn = quietHoursOn
    if (typeof emailOptIn === "boolean") data.emailOptIn = emailOptIn
    if (typeof personalizedOffers === "boolean") data.personalizedOffers = personalizedOffers
    if (typeof redLetterOn === "boolean") data.redLetterOn = redLetterOn
    if (dailyGoal === null) data.dailyGoal = null
    else if (dailyGoal !== undefined && [20, 50, 100].includes(dailyGoal)) data.dailyGoal = dailyGoal
    if (reminderTime && /^([01]\d|2[0-3]):[0-5]\d$/.test(reminderTime)) data.reminderTime = reminderTime
    const updated = await db.userProgress.update({ where: { userId: USER_ID }, data })
    // engine tap: settings changes feed the wellbeing/notif feature families
    for (const [key, value] of Object.entries(data)) {
      void tap(USER_ID, "settings_change", { key, value: value === null ? "off" : String(value) })
    }
    return NextResponse.json({
      ok: true,
      soundOn: updated.soundOn,
      hapticsOn: updated.hapticsOn,
      reminderTime: updated.reminderTime,
      quietHoursOn: updated.quietHoursOn,
      emailOptIn: updated.emailOptIn,
      personalizedOffers: updated.personalizedOffers,
      redLetterOn: updated.redLetterOn,
      dailyGoal: updated.dailyGoal ?? null, // v11.5: goal agency
      notifPrefs: readNotifPrefs(updated),
      emailPrefs: readEmailPrefs(updated),
    })
  } catch (e) {
    console.error("[api/settings]", e)
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}
