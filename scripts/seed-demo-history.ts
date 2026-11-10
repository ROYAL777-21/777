/* bun scripts/seed-demo-history.ts — create a realistic 3-week learner
 * history for the demo user (lesson completions, reads, quizzes, streak)
 * so the shipped app and the engine both have living data to show.
 * Idempotent: wipes user activity first, then rebuilds. */
import { PrismaClient } from "@prisma/client"

const db = new PrismaClient()
const USER_ID = "user_1"
const DAY = 86400000

async function main() {
  const now = Date.now()
  let seed = 424242
  const rnd = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296
    return seed / 4294967296
  }

  // ── wipe existing activity (catalog untouched) ──
  await db.lessonCompletion.deleteMany({ where: { userId: USER_ID } })
  await db.challengeProgress.deleteMany({ where: { userId: USER_ID } })
  await db.dailyQuizCompletion.deleteMany({ where: { userId: USER_ID } })
  await db.bibleRead.deleteMany({ where: { userId: USER_ID } })
  await db.verseMark.deleteMany({ where: { userId: USER_ID } })
  await db.planProgress.deleteMany({ where: { userId: USER_ID } })
  await db.storyCompletion.deleteMany({ where: { userId: USER_ID } })
  await db.userQuest.deleteMany({ where: { userId: USER_ID } })
  await db.userAchievement.deleteMany({ where: { userId: USER_ID } })
  await db.chestClaim.deleteMany({ where: { userId: USER_ID } })
  await db.engineEvent.deleteMany({ where: { userId: USER_ID } })
  await db.engineSnapshot.deleteMany({ where: { userId: USER_ID } })
  await db.engineIntervention.deleteMany({ where: { userId: USER_ID } })
  await db.leagueEntry.deleteMany({ where: { userId: USER_ID, isCurrentUser: true } })
  const userPosts = await db.post.findMany({ where: { userId: USER_ID }, select: { id: true } })
  for (const p of userPosts) {
    await db.postComment.deleteMany({ where: { postId: p.id } })
    await db.post.delete({ where: { id: p.id } })
  }

  // ── pick lessons: first 26 from the active course (or greek), a few from a second course ──
  const progress = await db.userProgress.findUnique({ where: { userId: USER_ID } })
  const activeCourseId = progress?.activeCourseId
  const courses = await db.course.findMany({ orderBy: { order: "asc" }, select: { id: true, code: true } })
  const primaryId = activeCourseId && courses.some((c) => c.id === activeCourseId) ? activeCourseId : courses.find((c) => c.code === "greek")?.id ?? courses[0].id
  const secondaryId = courses.find((c) => c.code === "bible-survey")?.id ?? courses.find((c) => c.id !== primaryId)?.id ?? primaryId

  const primaryUnits = await db.unit.findMany({ where: { courseId: primaryId }, orderBy: { order: "asc" }, select: { id: true } })
  const secondaryUnits = await db.unit.findMany({ where: { courseId: secondaryId }, orderBy: { order: "asc" }, select: { id: true } })
  const primaryLessons = (await db.lesson.findMany({ where: { unitId: { in: primaryUnits.map((u) => u.id) } }, orderBy: { order: "asc" }, select: { id: true, unitId: true, challenges: { select: { id: true } } } })).slice(0, 22)
  const secondaryLessons = (await db.lesson.findMany({ where: { unitId: { in: secondaryUnits.map((u) => u.id) } }, orderBy: { order: "asc" }, select: { id: true, unitId: true, challenges: { select: { id: true } } } })).slice(0, 6)
  if (primaryLessons.length === 0) throw new Error("no lessons found for demo history")

  // ── day plan: study days over the last 24 days (12-day streak ending yesterday) ──
  // day offsets back from today: 0 = today (streak pending → risk), 1..12 = streak days
  const studyDays: number[] = []
  for (let d = 1; d <= 12; d++) studyDays.push(d)
  studyDays.push(15, 17, 19, 22) // older scattered days
  const todayStudy = false // leave today open → engine sees streak-risk state

  let xpTotal = 0
  const completions: { lessonId: string; at: Date; xp: number; accuracy: number; combo: number; dur: number }[] = []
  let lessonIdx = 0

  const hours = [9, 10, 12, 18, 19, 20, 21]
  for (const dOff of [...studyDays].sort((a, b) => a - b)) {
    const nLessons = dOff <= 12 ? 1 + (rnd() < 0.35 ? 1 : 0) : 1
    const hour = hours[Math.floor(rnd() * hours.length)]
    for (let i = 0; i < nLessons && lessonIdx < primaryLessons.length + secondaryLessons.length; i++) {
      const pool = lessonIdx < primaryLessons.length ? primaryLessons : secondaryLessons
      const li = lessonIdx < primaryLessons.length ? lessonIdx : lessonIdx - primaryLessons.length
      const lesson = pool[li]
      const at = new Date(now - dOff * DAY)
      at.setUTCHours(hour - 2, Math.floor(rnd() * 55), 0, 0) // local ≈ UTC+2 (Johannesburg)
      const accuracy = 72 + Math.floor(rnd() * 29) // 72-100
      const combo = Math.max(3, Math.floor(accuracy / 12) + Math.floor(rnd() * 3))
      const dur = 95 + Math.floor(rnd() * 210)
      const xp = 10 + (accuracy === 100 ? 5 : 0) + Math.min(15, combo)
      completions.push({ lessonId: lesson.id, at, xp, accuracy, combo, dur })
      xpTotal += xp
      lessonIdx++

      // challenge progress for this lesson
      for (const ch of lesson.challenges) {
        const done = rnd() < (accuracy / 100) * 0.95
        await db.challengeProgress.create({
          data: { userId: USER_ID, challengeId: ch.id, completed: done, mistakes: done ? 0 : 1 + Math.floor(rnd() * 2) },
        })
      }
    }
  }
  for (const c of completions) {
    await db.lessonCompletion.create({
      data: { userId: USER_ID, lessonId: c.lessonId, xpEarned: c.xp, comboMax: c.combo, accuracy: c.accuracy, durationSec: c.dur, completedAt: c.at },
    })
  }

  // ── Bible reads (John plan mostly) ──
  const reads: { bookId: string; chapter: number; dOff: number }[] = []
  for (let i = 0; i < 14; i++) reads.push({ bookId: "jhn", chapter: i + 1, dOff: 22 - i * 1.5 })
  reads.push({ bookId: "psa", chapter: 23, dOff: 6 }, { bookId: "gen", chapter: 1, dOff: 20 }, { bookId: "rom", chapter: 8, dOff: 4 })
  for (const r of reads) {
    const at = new Date(now - Math.round(r.dOff) * DAY)
    at.setUTCHours(20, 15, 0, 0)
    await db.bibleRead.create({ data: { userId: USER_ID, bookId: r.bookId, chapter: r.chapter, readAt: at } })
    xpTotal += 10
  }

  // ── daily quizzes (10 days) ──
  for (let i = 0; i < 10; i++) {
    const dOff = 23 - i * 2
    const day = new Date(now - dOff * DAY)
    const dayKey = day.toISOString().slice(0, 10)
    const score = 3 + Math.floor(rnd() * 3)
    await db.dailyQuizCompletion.create({
      data: { userId: USER_ID, day: dayKey, score, total: 5, xpEarned: 15, createdAt: day },
    })
    xpTotal += 15
  }

  // ── verse marks ──
  const marks = [
    { bookId: "jhn", chapter: 3, verse: 16, color: "gold", note: "" },
    { bookId: "psa", chapter: 23, verse: 1, color: "rose", note: "The LORD is my shepherd" },
    { bookId: "rom", chapter: 8, verse: 28, color: "teal", note: "" },
    { bookId: "jhn", chapter: 1, verse: 1, color: "violet", note: "In the beginning was the Word" },
  ]
  for (const m of marks) {
    await db.verseMark.create({ data: { userId: USER_ID, ...m, createdAt: new Date(now - 8 * DAY) } })
  }

  // ── plan progress (John plan days 1-14) ──
  for (let d = 1; d <= 14; d++) {
    await db.planProgress.create({ data: { userId: USER_ID, planId: "john", day: d, completedAt: new Date(now - (22 - d) * DAY) } })
  }

  // ── story completions ──
  const stories = await db.story.findMany({ take: 3, orderBy: { order: "asc" }, select: { id: true } })
  for (const s of stories) {
    await db.storyCompletion.create({ data: { userId: USER_ID, storyId: s.id, xpEarned: 20, perfect: rnd() < 0.4, completedAt: new Date(now - 11 * DAY) } })
    xpTotal += 20
  }

  // ── a community post ──
  const me = await db.user.findUnique({ where: { id: USER_ID } })
  await db.post.create({
    data: {
      userId: USER_ID,
      body: "Finished the Greek alphabet unit — reading John 1:1 in the original feels like meeting an old friend. Πρὸς τὸν θεόν!",
      likes: 4,
      createdAt: new Date(now - 6 * DAY),
    },
  })
  await db.postComment.create({
    data: { userId: USER_ID, postId: (await db.post.findFirst({ where: { userId: USER_ID }, orderBy: { createdAt: "desc" } }))!.id, body: "Next stop: the aorist!", createdAt: new Date(now - 6 * DAY + 3600000) },
  })

  // ── progress state: 12-day streak ending yesterday, rich wallet ──
  const lastDay = new Date(now - 1 * DAY)
  const lastKey = `${lastDay.getUTCFullYear()}-${String(lastDay.getUTCMonth() + 1).padStart(2, "0")}-${String(lastDay.getUTCDate()).padStart(2, "0")}`
  await db.userProgress.update({
    where: { userId: USER_ID },
    data: {
      xp: xpTotal,
      gems: 768,
      streak: 12,
      streakFreezes: 1,
      hearts: 5,
      lastHeartAt: null,
      lastActiveDay: lastKey,
      dailyXp: 0,
      dailyXpDay: null,
      leagueOrder: 2,
      plan: "free",
      planSince: null,
      lastCanceledAt: null,
      ...(me ? {} : {}),
    },
  })

  // ── league entry for the user this week ──
  const now2 = new Date()
  const wkLocal = new Date(now2.getTime() + 2 * 3600000)
  const dayNum = wkLocal.getUTCDay() || 7
  const thursday = new Date(wkLocal)
  thursday.setUTCDate(wkLocal.getUTCDate() + 4 - dayNum)
  const jan1 = new Date(Date.UTC(thursday.getUTCFullYear(), 0, 1))
  const week = Math.ceil(((thursday.getTime() - jan1.getTime()) / DAY + 1) / 7)
  const weekKeyStr = `${thursday.getUTCFullYear()}-W${String(week).padStart(2, "0")}`
  await db.leagueEntry.create({
    data: { leagueId: "league-2", weekKey: weekKeyStr, displayName: me?.name ?? "Scribe", avatarEmoji: me?.image ?? "📖", isCurrentUser: true, xp: 180 },
  }).catch(() => {})

  console.log(`demo history: ${completions.length} lessons, ${reads.length} chapters, 10 quizzes, streak 12, ${xpTotal} XP`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
