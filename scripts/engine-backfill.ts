/* bun scripts/engine-backfill.ts — seed a plausible 45-day engine-event
 * history consistent with the existing demo data (lesson completions,
 * reads, quizzes). Idempotent: skips if the ledger already has history. */
import { PrismaClient } from "@prisma/client"

const db = new PrismaClient()
const USER_ID = "user_1"
const DAY = 86400000

async function main() {
  const existing = await db.engineEvent.count({ where: { userId: USER_ID } })
  if (existing > 200) {
    console.log(`ledger already has ${existing} events — skipping backfill`)
    return
  }
  await db.engineEvent.deleteMany({ where: { userId: USER_ID, type: { not: "ledger_rebuild" } } })

  const now = Date.now()
  const lessons = await db.lessonCompletion.findMany({
    where: { userId: USER_ID },
    orderBy: { completedAt: "asc" },
    select: { completedAt: true, xpEarned: true, accuracy: true },
  })
  const reads = await db.bibleRead.findMany({ where: { userId: USER_ID }, select: { readAt: true, bookId: true, chapter: true } })
  const quizzes = await db.dailyQuizCompletion.findMany({ where: { userId: USER_ID }, select: { createdAt: true, score: true, total: true } })

  type Ev = { type: string; payload: Record<string, unknown>; ts: Date }
  const events: Ev[] = []

  // deterministic pseudo-random
  let seed = 987654321
  const rnd = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296
    return seed / 4294967296
  }
  const pick = <T>(arr: T[]): T => arr[Math.floor(rnd() * arr.length)]
  const views = ["learn", "bible", "stories", "growth", "community", "friends", "leagues", "quests", "shop", "profile", "courses", "practice-hub"]

  // 1. one app_open + a few view_change per active day (from lesson history)
  const byDay = new Map<string, Date[]>()
  for (const l of lessons) {
    const k = l.completedAt.toISOString().slice(0, 10)
    byDay.set(k, [...(byDay.get(k) ?? []), l.completedAt])
  }
  for (const r of reads) {
    const k = r.readAt.toISOString().slice(0, 10)
    byDay.set(k, [...(byDay.get(k) ?? []), r.readAt])
  }
  for (const q of quizzes) {
    const k = q.createdAt.toISOString().slice(0, 10)
    byDay.set(k, [...(byDay.get(k) ?? []), q.createdAt])
  }

  let dayCount = 0
  for (const [day, stamps] of byDay) {
    if (stamps.length === 0) continue
    dayCount++
    const first = stamps[0]
    const openAt = new Date(first.getTime() - (2 + Math.floor(rnd() * 6)) * 60000)
    events.push({ type: "app_open", payload: { hour: openAt.getUTCHours() }, ts: openAt })
    // 2-5 view changes before/during the session
    const nViews = 2 + Math.floor(rnd() * 4)
    let cursor = openAt.getTime()
    for (let i = 0; i < nViews; i++) {
      cursor += (30 + Math.floor(rnd() * 180)) * 1000
      events.push({ type: "view_change", payload: { view: pick(views) }, ts: new Date(cursor) })
    }
    // lesson_complete events matching real completions
    for (const st of stamps) {
      const isRead = reads.some((r) => r.readAt.getTime() === st.getTime())
      const isQuiz = quizzes.some((q) => q.createdAt.getTime() === st.getTime())
      if (isRead) events.push({ type: "chapter_read", payload: {}, ts: st })
      else if (isQuiz) events.push({ type: "quiz_complete", payload: {}, ts: st })
      else events.push({ type: "lesson_complete", payload: { accuracy: lessons.find((l) => l.completedAt.getTime() === st.getTime())?.accuracy ?? 90 }, ts: st })
    }
    // occasional notification open (~45%)
    if (rnd() < 0.45) {
      events.push({ type: "notification_open", payload: { kind: "streak" }, ts: new Date(first.getTime() - 30 * 60000) })
    }
    // occasional chest/quest completion
    if (rnd() < 0.3) events.push({ type: "quest_complete", payload: {}, ts: new Date(first.getTime() + 4 * 60000) })
    if (rnd() < 0.15) events.push({ type: "chest_open", payload: {}, ts: new Date(first.getTime() + 6 * 60000) })
  }

  // 2. paywall journey: ~weekly views, mostly dismissed, one CTA exploration
  const paywallDays = [40, 33, 26, 18, 11, 5]
  for (const d of paywallDays) {
    const at = new Date(now - d * DAY - Math.floor(rnd() * 6) * 3600000)
    events.push({ type: "paywall_open", payload: { context: "profile" }, ts: at })
    events.push({ type: "paywall_view", payload: { context: "profile", seconds: 20 + Math.floor(rnd() * 60) }, ts: new Date(at.getTime() + 1000) })
    if (d === 18 || d === 5) {
      events.push({ type: "paywall_cta", payload: { context: "profile", plan: "annual" }, ts: new Date(at.getTime() + 45000) })
      events.push({ type: "paywall_dismiss", payload: { context: "profile", seconds: 60 + Math.floor(rnd() * 40) }, ts: new Date(at.getTime() + 50000) })
    } else {
      events.push({ type: "paywall_dismiss", payload: { context: "profile", seconds: 12 + Math.floor(rnd() * 30) }, ts: new Date(at.getTime() + 15000) })
    }
  }
  // one winback view + snooze (Pro was tried & cancelled in demo data)
  events.push({ type: "winback_view", payload: { depth: 50 }, ts: new Date(now - 4 * DAY) })
  events.push({ type: "winback_snooze", payload: { depth: 50 }, ts: new Date(now - 4 * DAY + 30000) })

  // 3. a purchase history (freeze + heart refill via gems)
  events.push({ type: "purchase", payload: { slug: "streak_freeze", price: 200 }, ts: new Date(now - 21 * DAY) })
  events.push({ type: "purchase", payload: { slug: "heart_refill", price: 350 }, ts: new Date(now - 9 * DAY) })
  events.push({ type: "heart_refill", payload: {}, ts: new Date(now - 9 * DAY + 5000) })
  events.push({ type: "heart_lost", payload: {}, ts: new Date(now - 9 * DAY - 3600000) })
  events.push({ type: "hearts_empty", payload: {}, ts: new Date(now - 9 * DAY - 3630000) })
  events.push({ type: "freeze_used", payload: {}, ts: new Date(now - 15 * DAY) })

  // 4. email opens (light)
  events.push({ type: "email_open", payload: { journey: "weekly_digest" }, ts: new Date(now - 10 * DAY) })
  events.push({ type: "email_open", payload: { journey: "welcome_series" }, ts: new Date(now - 38 * DAY) })
  events.push({ type: "email_cta", payload: { journey: "weekly_digest" }, ts: new Date(now - 10 * DAY + 60000) })

  // 5. social signals
  events.push({ type: "post_create", payload: {}, ts: new Date(now - 13 * DAY) })
  events.push({ type: "comment_create", payload: {}, ts: new Date(now - 13 * DAY + 120000) })
  events.push({ type: "like", payload: {}, ts: new Date(now - 7 * DAY) })
  events.push({ type: "share", payload: { kind: "verse" }, ts: new Date(now - 6 * DAY) })

  // 6. settings & marker
  events.push({ type: "settings_change", payload: { key: "reminderTime", value: "19:00" }, ts: new Date(now - 30 * DAY) })
  events.push({ type: "placement_done", payload: { course: "greek" }, ts: new Date(now - 39 * DAY) })
  events.push({ type: "course_change", payload: { course: "greek" }, ts: new Date(now - 39 * DAY) })
  events.push({ type: "keyboard_use", payload: { lang: "greek" }, ts: new Date(now - 20 * DAY) })
  events.push({ type: "ledger_rebuild", payload: { at: new Date().toISOString() }, ts: new Date(now) })

  events.sort((a, b) => a.ts.getTime() - b.ts.getTime())
  // write in chunks
  let written = 0
  for (let i = 0; i < events.length; i += 50) {
    const chunk = events.slice(i, i + 50)
    await db.engineEvent.createMany({ data: chunk.map((e) => ({ userId: USER_ID, type: e.type, payload: JSON.stringify(e.payload), ts: e.ts })) })
    written += chunk.length
  }
  console.log(`backfilled ${written} events across ${dayCount} active days`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
