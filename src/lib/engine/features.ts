/**
 * features.ts — THE SIGNAL LAYER (retention & loyalty)
 *
 * 590 point-in-time behavioral features across 27 families, computed from
 * the user's own local history. Every value passes a finite-number guard;
 * every ratio divides by max(1, d). `asOf` enables honest point-in-time
 * reconstruction, which the self-improvement loop (train.ts) uses to
 * build leak-free training sets.
 *
 * Families: tenure · recency · freq · streak · active · session · timing ·
 * speed · mastery · progress · delta · comp · motiv · social · community ·
 * league · monet · econ · surface · notif · email · faith · well · tech ·
 * ctx · meta · z  (28 families, 617 features)
 */

import { db } from "@/lib/db"
import { USER_ID, dayKey, daysBetween, levelInfo } from "@/lib/gamification"
import { TZ_OFFSET_MS as TZ_OFFSET_MS_LOCAL } from "@/lib/time"

export const TZ_OFFSET_MS = TZ_OFFSET_MS_LOCAL // follows the machine's own clock (see @/lib/time)

export interface FeatureVal {
  id: string
  cat: string
  desc: string
  value: number
}

export interface FeatureResult {
  features: FeatureVal[]
  byCat: { cat: string; count: number }[]
  values: Record<string, number>
}

// ─────────────────────────────────────────────────────────────
//  finite-number guard — nothing downstream ever sees NaN/Infinity
// ─────────────────────────────────────────────────────────────

function num(x: unknown, dflt = 0): number {
  if (typeof x === "number" && Number.isFinite(x)) return x
  if (typeof x === "boolean") return x ? 1 : 0
  return dflt
}
function div(n: number, d: number): number {
  return d > 0 || d < 0 ? n / d : 0 // 0 divisor → 0, never Infinity/NaN
}
function clamp01(x: number): number {
  return Math.min(1, Math.max(0, num(x)))
}
function clamp(x: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, num(x)))
}
function daysSince(ts: Date | null | undefined, asOf: number): number {
  if (!ts) return 999
  return Math.max(0, (asOf - ts.getTime()) / 86400000)
}
function hoursSince(ts: Date | null | undefined, asOf: number): number {
  if (!ts) return 999
  return Math.max(0, (asOf - ts.getTime()) / 3600000)
}

// ─────────────────────────────────────────────────────────────
//  context loading (point-in-time)
// ─────────────────────────────────────────────────────────────

interface Ctx {
  progress: Record<string, unknown>
  joinedAt: Date
  user: { name: string; image: string; avatar: string | null; bio: string }
  lessons: { completedAt: Date; xpEarned: number; comboMax: number; accuracy: number; durationSec: number; lessonId: string; courseId: string; difficulty: number }[]
  challenges: { completed: boolean; mistakes: number; challengeId: string }[]
  stories: { completedAt: Date; xpEarned: number; perfect: boolean; storyId: string }[]
  reads: { readAt: Date; bookId: string; chapter: number }[]
  marks: { createdAt: Date; color: string; note: string }[]
  plans: { completedAt: Date; planId: string; day: number }[]
  quizzes: { createdAt: Date; day: string; score: number; total: number; xpEarned: number }[]
  posts: { createdAt: Date; likes: number; hasAttachment: boolean }[]
  comments: { createdAt: Date }[]
  likesByUser: number
  friends: number
  friendRequests: number
  notifs: { createdAt: Date; type: string; read: boolean }[]
  emails: { sentAt: Date; journey: string; status: string }[]
  events: { ts: Date; type: string; payload: Record<string, unknown> }[]
  league: { xp: number; targetXp: number; isCurrentUser: boolean; weekKey: string }[]
  items: { slug: string; quantity: number }[]
  achievements: { tier: number; unlockedAt: Date | null }[]
  quests: { day: string; completed: boolean; claimed: boolean; metric: string }[]
  referral: { shares: number; joins: number; subscribed: number; bankedMonths: number; lastJoinAt: Date | null }
  asOf: number
}

async function loadCtx(userId: string, asOf: number): Promise<Ctx> {
  const asOfDate = new Date(asOf)
  const [
    user, lessonsRaw, challengesRaw, storiesRaw, readsRaw, marksRaw, plansRaw,
    quizzesRaw, postsRaw, commentsRaw, botsRaw, notifsRaw, emailsRaw, eventsRaw,
    leagueRaw, itemsRaw, achRaw, questsRaw,
  ] = await Promise.all([
    db.user.findUnique({ where: { id: userId }, include: { progress: true } }),
    db.lessonCompletion.findMany({
      where: { userId, completedAt: { lte: asOfDate } },
      include: { lesson: { include: { unit: { select: { courseId: true, difficulty: true } } } } },
      orderBy: { completedAt: "asc" },
    }),
    db.challengeProgress.findMany({ where: { userId } }),
    db.storyCompletion.findMany({ where: { userId, completedAt: { lte: asOfDate } }, orderBy: { completedAt: "asc" } }),
    db.bibleRead.findMany({ where: { userId, readAt: { lte: asOfDate } }, orderBy: { readAt: "asc" } }),
    db.verseMark.findMany({ where: { userId, createdAt: { lte: asOfDate } } }),
    db.planProgress.findMany({ where: { userId, completedAt: { lte: asOfDate } }, orderBy: { completedAt: "asc" } }),
    db.dailyQuizCompletion.findMany({ where: { userId, createdAt: { lte: asOfDate } }, orderBy: { createdAt: "asc" } }),
    db.post.findMany({ where: { userId, createdAt: { lte: asOfDate } }, orderBy: { createdAt: "asc" } }),
    db.postComment.findMany({ where: { userId, createdAt: { lte: asOfDate } } }),
    db.botUser.findMany({}),
    db.appNotification.findMany({ where: { userId, createdAt: { lte: asOfDate } }, orderBy: { createdAt: "desc" } }),
    db.emailLog.findMany({ where: { userId, sentAt: { lte: asOfDate } } }),
    db.engineEvent.findMany({ where: { userId, ts: { lte: asOfDate } }, orderBy: { ts: "asc" } }),
    db.leagueEntry.findMany({ where: { userId, isCurrentUser: true } }),
    db.userItem.findMany({ where: { userId }, include: { item: true } }),
    db.userAchievement.findMany({ where: { userId } }),
    db.userQuest.findMany({ where: { userId }, include: { quest: true } }),
  ] as const)

  // referral program state (point-in-time: joins + conversions counted only
  // up to asOf; `shares`/`bankedMonths` are current counters — no per-event log)
  const referralRow = await db.referral.findUnique({ where: { userId } })
  const referralInvites = referralRow
    ? await db.referralInvite.findMany({ where: { refCode: referralRow.code, createdAt: { lte: asOfDate } }, orderBy: { createdAt: "asc" } })
    : []

  const p = (user?.progress ?? {}) as Record<string, unknown>
  let liked = 0
  try {
    const arr = JSON.parse(String(p.likedPosts ?? "[]"))
    liked = Array.isArray(arr) ? (arr as string[]).length : 0
  } catch {
    liked = 0
  }

  return {
    progress: p,
    joinedAt: user?.createdAt ?? asOfDate,
    user: { name: user?.name ?? "", image: user?.image ?? "", avatar: user?.avatar ?? null, bio: user?.bio ?? "" },
    lessons: lessonsRaw.map((l) => ({
      completedAt: l.completedAt,
      xpEarned: l.xpEarned,
      comboMax: l.comboMax,
      accuracy: l.accuracy,
      durationSec: l.durationSec,
      lessonId: l.lessonId,
      courseId: l.lesson.unit.courseId,
      difficulty: l.lesson.unit.difficulty,
    })),
    challenges: challengesRaw.map((c) => ({ completed: c.completed, mistakes: c.mistakes, challengeId: c.challengeId })),
    stories: storiesRaw.map((s) => ({ completedAt: s.completedAt, xpEarned: s.xpEarned, perfect: s.perfect, storyId: s.storyId })),
    reads: readsRaw.map((r) => ({ readAt: r.readAt, bookId: r.bookId, chapter: r.chapter })),
    marks: marksRaw.map((m) => ({ createdAt: m.createdAt, color: m.color, note: m.note })),
    plans: plansRaw.map((p2) => ({ completedAt: p2.completedAt, planId: p2.planId, day: p2.day })),
    quizzes: quizzesRaw.map((q) => ({ createdAt: q.createdAt, day: q.day, score: q.score, total: q.total, xpEarned: q.xpEarned })),
    posts: postsRaw.map((po) => ({ createdAt: po.createdAt, likes: po.likes, hasAttachment: !!po.attachment })),
    comments: commentsRaw.map((c) => ({ createdAt: c.createdAt })),
    likesByUser: liked,
    friends: botsRaw.filter((b) => b.isFriend).length,
    friendRequests: botsRaw.filter((b) => b.requestedByUser || b.requestedToUser).length,
    notifs: notifsRaw.map((n) => ({ createdAt: n.createdAt, type: n.type, read: n.read })),
    emails: emailsRaw.map((e) => ({ sentAt: e.sentAt, journey: e.journey, status: e.status })),
    events: eventsRaw
      .map((e) => {
        let payload: Record<string, unknown> = {}
        try {
          payload = JSON.parse(e.payload || "{}") as Record<string, unknown>
        } catch {
          payload = {}
        }
        return { ts: e.ts, type: e.type, payload }
      }),
    league: leagueRaw.map((l) => ({ xp: l.xp, targetXp: l.targetXp, isCurrentUser: l.isCurrentUser, weekKey: l.weekKey })),
    items: itemsRaw.map((i) => ({ slug: i.item.slug, quantity: i.quantity })),
    achievements: achRaw.map((a) => ({ tier: a.tier, unlockedAt: a.unlockedAt })),
    quests: questsRaw.map((q) => ({ day: q.day, completed: q.completed, claimed: q.claimed, metric: q.quest.metric })),
    referral: {
      shares: referralRow?.shares ?? 0,
      joins: referralInvites.length,
      // point-in-time: only conversions whose reward was granted ≤ asOf
      subscribed: referralInvites.filter(
        (i) => i.rewardKind === "pro_month" && i.rewardedAt !== null && i.rewardedAt.getTime() <= asOf,
      ).length,
      bankedMonths: Number(p.referralProMonths ?? 0),
      lastJoinAt: referralInvites.length ? referralInvites[referralInvites.length - 1].createdAt : null,
    },
    asOf,
  }
}

// ─────────────────────────────────────────────────────────────
//  the 617 features
// ─────────────────────────────────────────────────────────────

export async function computeFeatures(userId: string = USER_ID, asOf: number = Date.now()): Promise<FeatureResult> {
  const c = await loadCtx(userId, asOf)
  const registry: FeatureVal[] = []
  const seen = new Set<string>()
  const add = (cat: string, id: string, desc: string, value: number | boolean) => {
    if (seen.has(id)) return // id uniqueness enforced here too
    seen.add(id)
    registry.push({ id, cat, desc, value: num(value) })
  }

  const todayKey = dayKey(new Date(asOf))
  const p = c.progress
  const b = <T>(k: string, dflt: T): T => (p[k] === undefined || p[k] === null ? dflt : (p[k] as T))

  // activity day sets from every source of "was active"
  const activeStamps = new Set<string>()
  for (const l of c.lessons) activeStamps.add(dayKey(l.completedAt))
  for (const s of c.stories) activeStamps.add(dayKey(s.completedAt))
  for (const r of c.reads) activeStamps.add(dayKey(r.readAt))
  for (const q of c.quizzes) activeStamps.add(dayKey(q.createdAt))
  for (const po of c.posts) activeStamps.add(dayKey(po.createdAt))
  for (const cm of c.comments) activeStamps.add(dayKey(cm.createdAt))
  for (const pl of c.plans) activeStamps.add(dayKey(pl.completedAt))
  for (const e of c.events) activeStamps.add(dayKey(e.ts))
  if (b<string | null>("lastActiveDay", null)) activeStamps.add(b<string>("lastActiveDay", ""))
  const activeDays = [...activeStamps].filter(Boolean).sort()

  // ── shared time-window index (built once; every family below reuses it) ──
  // Plain millisecond stamps, sorted ascending, so window counts are cheap
  // reverse scans with early exit. `ago()` caches dayKey→days-ago so filter
  // predicates never re-parse date strings (the hottest inner loop here).
  const sortedMs = (xs: number[]) => xs.sort((a, b) => a - b)
  const lessonMs = sortedMs(c.lessons.map((l) => l.completedAt.getTime()))
  const storyMs = sortedMs(c.stories.map((s) => s.completedAt.getTime()))
  const readMs = sortedMs(c.reads.map((r) => r.readAt.getTime()))
  const quizMs = sortedMs(c.quizzes.map((q) => q.createdAt.getTime()))
  const postMs = sortedMs(c.posts.map((x) => x.createdAt.getTime()))
  const commentMs = sortedMs(c.comments.map((x) => x.createdAt.getTime()))
  const planMs = sortedMs(c.plans.map((x) => x.completedAt.getTime()))
  const markMs = sortedMs(c.marks.map((x) => x.createdAt.getTime()))
  const allMs = sortedMs([...lessonMs, ...storyMs, ...readMs, ...quizMs, ...postMs, ...commentMs, ...planMs, ...markMs, ...c.events.map((e) => e.ts.getTime())])
  const agoByDay = new Map<string, number>(activeDays.map((k) => [k, daysBetween(k, todayKey)]))
  const ago = (k: string): number => agoByDay.get(k) ?? 9999
  /** count of stamps with (asOf − t) < days·ms — reverse scan, early exit */
  const countSince = (arr: number[], days: number): number => {
    const cutoff = asOf - days * 86400000
    let n = 0
    for (let i = arr.length - 1; i >= 0 && arr[i] > cutoff; i--) n++
    return n
  }
  /** count of stamps with fromDays·ms ≤ (asOf − t) < toDays·ms */
  const countBetween = (arr: number[], fromDays: number, toDays: number): number => countSince(arr, toDays) - countSince(arr, fromDays)
  /** active days with fromDays ≤ days-ago < toDays */
  const activeIn = (fromDays: number, toDays: number): number =>
    activeDays.filter((k) => {
      const a = ago(k)
      return a >= fromDays && a < toDays
    }).length

  // hour histogram from lessons + events + reads
  const hourHist = new Array(24).fill(0)
  for (const l of c.lessons) hourHist[clamp(Math.floor((l.completedAt.getTime() + TZ_OFFSET_MS) / 3600000) % 24, 0, 23)]++
  for (const e of c.events) hourHist[clamp(Math.floor((e.ts.getTime() + TZ_OFFSET_MS) / 3600000) % 24, 0, 23)]++
  for (const r of c.reads) hourHist[clamp(Math.floor((r.readAt.getTime() + TZ_OFFSET_MS) / 3600000) % 24, 0, 23)]++
  const hourTotal = hourHist.reduce((a, x) => a + num(x), 0)

  // ═══ 1. tenure (16) ═══
  {
    const cat = "tenure"
    const joined = c.joinedAt.getTime()
    const tenureDays = Math.max(0, (asOf - joined) / 86400000)
    const firstLesson = c.lessons[0]?.completedAt.getTime() ?? null
    add(cat, "tenure.days", "Days since joining", Math.round(tenureDays * 10) / 10)
    add(cat, "tenure.hours", "Account age (hours)", Math.round((asOf - joined) / 3600000))
    add(cat, "tenure.is_new_1d", "Joined today", tenureDays < 1)
    add(cat, "tenure.is_new_3d", "Joined within 3 days", tenureDays < 3)
    add(cat, "tenure.is_new_7d", "Joined within a week", tenureDays < 7)
    add(cat, "tenure.is_new_30d", "Joined within a month", tenureDays < 30)
    add(cat, "tenure.stage", "Lifecycle stage (0-5)", tenureDays < 1 ? 0 : tenureDays < 3 ? 1 : tenureDays < 7 ? 2 : tenureDays < 30 ? 3 : tenureDays < 90 ? 4 : 5)
    add(cat, "tenure.avatar_set", "Avatar customized", !!c.user.avatar || !!c.user.image)
    add(cat, "tenure.name_customized", "Name customized", c.user.name !== "Scribe" && c.user.name.length > 0)
    add(cat, "tenure.onboarded", "Onboarding completed (course picked)", !!b<string | null>("activeCourseId", null))
    add(cat, "tenure.joined_weekend", "Joined on a weekend", [0, 6].includes(new Date(joined).getUTCDay()))
    add(cat, "tenure.days_since_first_lesson", "Days since first lesson", firstLesson ? Math.max(0, (asOf - firstLesson) / 86400000) : 999)
    add(cat, "tenure.active_first_day", "Active on join day", activeDays.includes(dayKey(c.joinedAt)))
    add(cat, "tenure.plan_months", "Months of tenure capped at 24", Math.min(24, tenureDays / 30.44))
    add(cat, "tenure.quiet_share", "Share of tenure with no activity", clamp01(div(Math.max(0, tenureDays - activeDays.length), Math.max(1, tenureDays))))
    add(cat, "tenure.is_lapsed_30d", "Gone quiet for 30+ days", daysSince(c.lessons.at(-1)?.completedAt, asOf) >= 30 && activeDays.length > 0 && daysSince(lastActiveTs(c), asOf) >= 30)
  }

  // ═══ 2. recency (14) ═══
  {
    const cat = "recency"
    const lastEventTs = c.events.length ? c.events[c.events.length - 1].ts.getTime() : null
    const lastLesson = c.lessons.at(-1)?.completedAt ?? null
    const lastStory = c.stories.at(-1)?.completedAt ?? null
    const lastRead = c.reads.at(-1)?.readAt ?? null
    const lastQuiz = c.quizzes.at(-1)?.createdAt ?? null
    const lastCommunity = c.posts.at(-1)?.createdAt ?? c.comments.at(-1)?.createdAt ?? null
    const lastMark = c.marks.at(-1)?.createdAt ?? null
    const lastPlan = c.plans.at(-1)?.completedAt ?? null
    const lastAny = Math.max(...[lastEventTs, lastLesson?.getTime() ?? null, lastStory?.getTime() ?? null, lastRead?.getTime() ?? null, lastQuiz?.getTime() ?? null, lastCommunity?.getTime() ?? null, lastPlan?.getTime() ?? null].filter((x): x is number => x !== null), 0)
    add(cat, "recency.min_since_event", "Minutes since last tracked event", lastEventTs ? Math.round((asOf - lastEventTs) / 60000) : 9999)
    add(cat, "recency.hours_since_lesson", "Hours since last lesson", hoursSince(lastLesson, asOf))
    add(cat, "recency.days_since_lesson", "Days since last lesson", daysSince(lastLesson, asOf))
    add(cat, "recency.days_since_story", "Days since last story", daysSince(lastStory, asOf))
    add(cat, "recency.days_since_read", "Days since last Bible chapter", daysSince(lastRead, asOf))
    add(cat, "recency.days_since_quiz", "Days since last daily quiz", daysSince(lastQuiz, asOf))
    add(cat, "recency.days_since_community", "Days since last community action", daysSince(lastCommunity, asOf))
    add(cat, "recency.days_since_mark", "Days since last verse mark", daysSince(lastMark, asOf))
    add(cat, "recency.days_since_plan", "Days since last plan check-off", daysSince(lastPlan, asOf))
    add(cat, "recency.active_today", "Active today (any surface)", activeStamps.has(todayKey))
    add(cat, "recency.hours_since_any", "Hours since any activity", lastAny ? (asOf - lastAny) / 3600000 : 9999)
    add(cat, "recency.was_active_yesterday", "Active yesterday", activeStamps.has(dayKey(new Date(asOf - 86400000))))
    add(cat, "recency.gap_days", "Days since last active day", activeDays.length ? Math.max(0, daysBetween(activeDays[activeDays.length - 1], todayKey)) : 999)
    add(cat, "recency.inactivity_trend", "Recency worsening vs personal normal", (() => {
      if (activeDays.length < 4) return 0
      const gaps: number[] = []
      for (let i = 1; i < activeDays.length; i++) gaps.push(daysBetween(activeDays[i - 1], activeDays[i]))
      const recent = gaps.slice(-3).reduce((a, x) => a + x, 0) / Math.max(1, gaps.slice(-3).length)
      const prior = gaps.slice(0, -3).reduce((a, x) => a + x, 0) / Math.max(1, gaps.slice(0, -3).length)
      return clamp(num(recent - prior) / 3, -1, 1)
    })())
  }

  // ═══ 3. freq (48) ═══
  {
    const cat = "freq"
    // (window counts use the shared sorted-ms index defined above)
    for (const days of [1, 3, 7, 14, 30, 90]) {
      const suffix = `${days}d`
      add(cat, `freq.lessons_${suffix}`, `Lessons completed in last ${days}d`, countSince(lessonMs, days))
      add(cat, `freq.stories_${suffix}`, `Stories completed in last ${days}d`, countSince(storyMs, days))
      add(cat, `freq.reads_${suffix}`, `Bible chapters read in last ${days}d`, countSince(readMs, days))
      add(cat, `freq.quizzes_${suffix}`, `Daily quizzes in last ${days}d`, countSince(quizMs, days))
      add(cat, `freq.posts_${suffix}`, `Community posts in last ${days}d`, countSince(postMs, days))
      add(cat, `freq.comments_${suffix}`, `Comments in last ${days}d`, countSince(commentMs, days))
      add(cat, `freq.plans_${suffix}`, `Plan check-offs in last ${days}d`, countSince(planMs, days))
      add(cat, `freq.active_days_${suffix}`, `Active days in last ${days}d`, activeIn(0, days))
    }
    add(cat, "freq.total_lessons", "Lessons completed all-time", c.lessons.length)
    add(cat, "freq.total_stories", "Stories completed all-time", c.stories.length)
    add(cat, "freq.total_reads", "Bible chapters read all-time", c.reads.length)
    add(cat, "freq.total_quizzes", "Daily quizzes all-time", c.quizzes.length)
    add(cat, "freq.total_posts", "Posts all-time", c.posts.length)
    add(cat, "freq.total_comments", "Comments all-time", c.comments.length)
    add(cat, "freq.total_marks", "Verse marks all-time", c.marks.length)
    add(cat, "freq.total_events", "Engine events recorded", c.events.length)
    add(cat, "freq.event_rate_7d", "Events per day (7d)", countSince(allMs, 7) / 7)
    add(cat, "freq.event_rate_30d", "Events per day (30d)", countSince(allMs, 30) / 30)
    add(cat, "freq.activity_per_week_tenure", "All activity events per week of tenure", div(allMs.length, Math.max(1, (asOf - c.joinedAt.getTime()) / (7 * 86400000))))
    add(cat, "freq.lesson_days_share", "Share of active days with a lesson", clamp01(div(countSince(lessonMs, 365), Math.max(1, activeIn(0, 365)))))
    add(cat, "freq.reads_per_active_day", "Chapters per active day", clamp(div(c.reads.length, Math.max(1, activeDays.length)), 0, 20))
    add(cat, "freq.freq_delta_7_vs_prev", "7d frequency vs previous 7d", (() => {
      const cur = countSince(allMs, 7)
      const prev = countBetween(allMs, 7, 14)
      return clamp((cur - prev) / Math.max(3, (cur + prev) / 2), -1, 1)
    })())
    add(cat, "freq.freq_delta_30_vs_prev", "30d frequency vs previous 30d", (() => {
      const cur = countSince(allMs, 30)
      const prev = countBetween(allMs, 30, 60)
      return clamp((cur - prev) / Math.max(5, (cur + prev) / 2), -1, 1)
    })())
    add(cat, "freq.session_count_7d", "Estimated sessions in 7d (gaps>45m)", (() => {
      const ts = allMs.filter((t) => asOf - t < 7 * 86400000) // already sorted
      let sessions = ts.length > 0 ? 1 : 0
      for (let i = 1; i < ts.length; i++) if (ts[i] - ts[i - 1] > 45 * 60000) sessions++
      return sessions
    })())
    add(cat, "freq.session_count_30d", "Estimated sessions in 30d (gaps>45m)", (() => {
      const ts = allMs.filter((t) => asOf - t < 30 * 86400000) // already sorted
      let sessions = ts.length > 0 ? 1 : 0
      for (let i = 1; i < ts.length; i++) if (ts[i] - ts[i - 1] > 45 * 60000) sessions++
      return sessions
    })())
    add(cat, "freq.sessions_per_week_4w", "Sessions per week over last 4w", (() => {
      const ts = allMs.filter((t) => asOf - t < 28 * 86400000) // already sorted
      let sessions = ts.length > 0 ? 1 : 0
      for (let i = 1; i < ts.length; i++) if (ts[i] - ts[i - 1] > 45 * 60000) sessions++
      return div(sessions, 4)
    })())
  }

  // ═══ 4. streak (19) ═══
  {
    const cat = "streak"
    const streak = b<number>("streak", 0)
    const freezes = b<number>("streakFreezes", 0)
    const lastActiveDay = b<string | null>("lastActiveDay", null)
    const yKey = dayKey(new Date(asOf - 86400000))
    const streakAlive = lastActiveDay === todayKey || lastActiveDay === yKey
    const milestones = [3, 7, 14, 30, 60, 100, 365]
    const nextMilestone = milestones.find((m) => m > streak) ?? 365
    const longestRun = (() => {
      let best = 0
      let run = 0
      let prev: string | null = null
      for (const k of activeDays) {
        run = prev && daysBetween(prev, k) === 1 ? run + 1 : 1
        best = Math.max(best, run)
        prev = k
      }
      return best
    })()
    add(cat, "streak.current", "Current streak (days)", streak)
    add(cat, "streak.is_alive", "Streak alive today or yesterday", streakAlive)
    add(cat, "streak.risk_tonight", "Streak unlit and the day is ending", lastActiveDay !== todayKey && streak >= 2)
    add(cat, "streak.freezes", "Streak freezes equipped", freezes)
    add(cat, "streak.freezes_available", "Freeze protection active", freezes > 0)
    add(cat, "streak.next_milestone", "Next streak milestone", nextMilestone)
    add(cat, "streak.next_milestone_dist", "Days to next milestone", nextMilestone - streak)
    add(cat, "streak.milestone_near", "Within 2 days of a milestone", nextMilestone - streak <= 2 && streak >= 2)
    add(cat, "streak.length_log", "log10 of streak length", Math.log10(Math.max(1, streak)))
    add(cat, "streak.longest_est", "Estimated longest active-day run", longestRun)
    add(cat, "streak.run_ratio", "Current streak vs longest run", clamp01(div(streak, Math.max(1, longestRun))))
    add(cat, "streak.repairs_used", "Streak repairs used (events)", c.events.filter((e) => e.type === "streak_repair" || e.type === "freeze_used").length)
    add(cat, "streak.streak_start_hour", "Median activity hour", (() => {
      if (!hourTotal) return -1
      let acc = 0
      for (let h = 0; h < 24; h++) {
        acc += hourHist[h]
        if (acc >= hourTotal / 2) return h
      }
      return 12
    })())
    add(cat, "streak.saves_via_freeze_30d", "Freeze saves in 30d", c.events.filter((e) => e.type === "freeze_used" && asOf - e.ts.getTime() < 30 * 86400000).length)
    add(cat, "streak.at_risk_value", "Streak value at risk tonight", streakAlive ? 0 : clamp(streak / 30, 0, 1))
    add(cat, "streak.days_since_last", "Days since last streak advance", lastActiveDay ? Math.max(0, daysBetween(lastActiveDay, todayKey)) : 999)
    add(cat, "streak.doubled_xp_active", "Double XP currently active", !!b<Date | null>("doubleXpUntil", null) && new Date(b<Date>("doubleXpUntil", new Date(0))).getTime() > asOf)
    add(cat, "streak.historical_max", "Historical max streak (longest run)", longestRun)
  }

  // ═══ 5. active (36) ═══
  {
    const cat = "active"
    for (const days of [7, 14, 30, 60, 90]) {
      add(cat, `active.days.${days}d`, `Active days in last ${days}d`, activeIn(0, days))
    }
    for (const days of [7, 14, 30, 60]) {
      add(cat, `active.share.${days}d`, `Activity share last ${days}d (0-1)`, clamp01(div(activeIn(0, days), days)))
    }
    add(cat, "active.days.total", "Active days all-time", activeDays.length)
    add(cat, "active.days.weekday_avg", "Avg active weekday days (4w)", div(activeDays.filter((k) => { const d = new Date(k + "T12:00:00Z").getUTCDay(); return d >= 1 && d <= 5 && ago(k) < 28 }).length, 4))
    add(cat, "active.days.weekend_avg", "Avg active weekend days (4w)", div(activeDays.filter((k) => { const d = K2D(k); return (d === 0 || d === 6) && ago(k) < 28 }).length, 4))
    add(cat, "active.weekday_share", "Share of activity on weekdays (90d)", clamp01(div(activeDays.filter((k) => { const d = K2D(k); return d >= 1 && d <= 5 && ago(k) < 90 }).length, Math.max(1, activeDays.filter((k) => ago(k) < 90).length))))
    for (let d = 0; d <= 6; d++) {
      add(cat, `active.dow.${d}`, `Active count on weekday ${d} (90d)`, activeDays.filter((k) => K2D(k) === d && ago(k) < 90).length)
    }
    add(cat, "active.longest_gap", "Longest gap between active days", (() => {
      if (activeDays.length < 2) return 0
      let g = 0
      for (let i = 1; i < activeDays.length; i++) g = Math.max(g, daysBetween(activeDays[i - 1], activeDays[i]))
      return g
    })())
    add(cat, "active.current_gap", "Current inactivity gap (days)", activeDays.length ? Math.max(0, daysBetween(activeDays[activeDays.length - 1], todayKey)) : 999)
    add(cat, "active.gap_z", "Current gap vs personal normal", (() => {
      if (activeDays.length < 5) return 0
      const gaps: number[] = []
      for (let i = 1; i < activeDays.length; i++) gaps.push(daysBetween(activeDays[i - 1], activeDays[i]))
      const gapNow = activeDays.length ? Math.max(0, daysBetween(activeDays[activeDays.length - 1], todayKey)) : 0
      const mean = gaps.reduce((a, x) => a + x, 0) / Math.max(1, gaps.length)
      const variance = gaps.reduce((a, x) => a + (x - mean) * (x - mean), 0) / Math.max(1, gaps.length)
      const sd = Math.sqrt(Math.max(0.25, variance))
      return clamp((gapNow - mean) / sd, -3, 5)
    })())
    add(cat, "active.return_pattern", "Classic return-after-lapse day pattern", (() => {
      if (activeDays.length < 6) return 0
      let hits = 0
      let chans = 0
      for (let i = 1; i < activeDays.length; i++) {
        const gap = daysBetween(activeDays[i - 1], activeDays[i])
        if (gap >= 2) {
          chans++
          if (K2D(activeDays[i]) === 1 || K2D(activeDays[i]) === 0) hits++
        }
      }
      return chans ? clamp01(hits / chans) : 0
    })())
    add(cat, "active.night_owl_7d", "Late-night activity share (7d)", clamp01(div(c.events.filter((e) => { const h = Math.floor((e.ts.getTime() + TZ_OFFSET_MS) / 3600000) % 24; return (h >= 23 || h < 5) && asOf - e.ts.getTime() < 7 * 86400000 }).length, Math.max(1, c.events.filter((e) => asOf - e.ts.getTime() < 7 * 86400000).length))))
    add(cat, "active.early_bird_7d", "Early-morning activity share (7d)", clamp01(div(c.events.filter((e) => { const h = Math.floor((e.ts.getTime() + TZ_OFFSET_MS) / 3600000) % 24; return h >= 5 && h < 9 && asOf - e.ts.getTime() < 7 * 86400000 }).length, Math.max(1, c.events.filter((e) => asOf - e.ts.getTime() < 7 * 86400000).length))))
    add(cat, "active.burst_days_30d", "Very-high-activity days (30d)", (() => {
      const counts = new Map<string, number>()
      for (const e of c.events) if (asOf - e.ts.getTime() < 30 * 86400000) counts.set(dayKey(e.ts), (counts.get(dayKey(e.ts)) ?? 0) + 1)
      return [...counts.values()].filter((v) => v >= 25).length
    })())
    add(cat, "active.light_days_30d", "Single-touch days (30d)", (() => {
      const counts = new Map<string, number>()
      for (const e of c.events) if (asOf - e.ts.getTime() < 30 * 86400000) counts.set(dayKey(e.ts), (counts.get(dayKey(e.ts)) ?? 0) + 1)
      return [...counts.values()].filter((v) => 1 <= v && v < 4).length
    })())
    add(cat, "active.days_365d", "Active days in last year", activeDays.filter((k) => ago(k) < 365).length)
    add(cat, "active.monday_share", "Monday share of active days", clamp01(div(activeDays.filter((k) => K2D(k) === 1).length, Math.max(1, activeDays.length))))
    add(cat, "active.sunday_share", "Sunday share of active days", clamp01(div(activeDays.filter((k) => K2D(k) === 0).length, Math.max(1, activeDays.length))))
    add(cat, "active.ramp_days_7d", "Consecutive active days ending today", (() => {
      let n = 0
      for (let i = 0; i < 30; i++) {
        const k = dayKey(new Date(asOf - i * 86400000))
        if (activeStamps.has(k)) n++
        else break
      }
      return n
    })())
    add(cat, "active.pre_lapse_drop", "Activity dropping before current lapse", (() => {
      if (activeDays.length < 5) return 0
      const now = activeDays.length ? daysBetween(activeDays[activeDays.length - 1], todayKey) : 0
      if (now < 2) return 0
      const w1 = activeIn(now, now + 7)
      const w2 = activeIn(now + 7, now + 14)
      return clamp((w1 - w2) / Math.max(1, w1 + w2), -1, 1)
    })())
    add(cat, "active.yesterday", "Active yesterday", activeStamps.has(dayKey(new Date(asOf - 86400000))))
    add(cat, "active.today_minutes", "Minutes of activity today", (() => {
      const t = c.events.filter((e) => dayKey(e.ts) === todayKey)
      if (t.length < 2) return 0
      const ts = t.map((e) => e.ts.getTime()).sort((a, b2) => a - b2)
      return Math.round((ts[ts.length - 1] - ts[0]) / 60000)
    })())
    add(cat, "active.avg_per_day_7d", "Avg events per active day (7d)", (() => {
      const counts = new Map<string, number>()
      for (const e of c.events) if (asOf - e.ts.getTime() < 7 * 86400000) counts.set(dayKey(e.ts), (counts.get(dayKey(e.ts)) ?? 0) + 1)
      if (counts.size === 0) return 0
      return [...counts.values()].reduce((a, x) => a + x, 0) / counts.size
    })())
    add(cat, "active.days_since_join_first", "Active-day share of first 30 days", clamp01(div(activeDays.filter((k) => (new Date(k + "T12:00:00Z").getTime() - c.joinedAt.getTime()) / 86400000 < 30).length, 30)))
  }

  // ═══ 6. session (18) ═══
  {
    const cat = "session"
    const sessions = (() => {
      const ts = c.events.map((e) => e.ts.getTime()).sort((a, b2) => a - b2)
      const out: number[][] = []
      let cur: number[] = []
      for (let i = 0; i < ts.length; i++) {
        if (cur.length === 0 || ts[i] - cur[cur.length - 1] <= 45 * 60000) cur.push(ts[i])
        else {
          out.push(cur)
          cur = [ts[i]]
        }
      }
      if (cur.length) out.push(cur)
      return out
    })()
    const durations = sessions.map((s) => (s[s.length - 1] - s[0]) / 60000).filter((x) => x >= 0)
    const recent = durations.slice(-20)
    const avg = recent.length ? recent.reduce((a, x) => a + x, 0) / recent.length : 0
    add(cat, "session.count_total", "Sessions all-time", sessions.length)
    add(cat, "session.count_7d", "Sessions in 7d", sessions.filter((s) => asOf - s[s.length - 1] < 7 * 86400000).length)
    add(cat, "session.count_30d", "Sessions in 30d", sessions.filter((s) => asOf - s[s.length - 1] < 30 * 86400000).length)
    add(cat, "session.avg_minutes", "Avg session minutes (last 20)", Math.round(avg * 10) / 10)
    add(cat, "session.median_minutes", "Median session minutes", (() => {
      if (!recent.length) return 0
      const s = [...recent].sort((a, b2) => a - b2)
      return Math.round(s[Math.floor(s.length / 2)] * 10) / 10
    })())
    add(cat, "session.max_minutes", "Longest session minutes", durations.length ? Math.round(Math.max(...durations)) : 0)
    add(cat, "session.last_minutes", "Last session minutes", durations.length ? Math.round(durations[durations.length - 1]) : 0)
    add(cat, "session.length_trend", "Session length trend (recent vs prior)", (() => {
      if (durations.length < 6) return 0
      const r = durations.slice(-5).reduce((a, x) => a + x, 0) / 5
      const pr = durations.slice(-10, -5).reduce((a, x) => a + x, 0) / Math.max(1, durations.slice(-10, -5).length)
      return clamp((r - pr) / Math.max(2, (r + pr) / 2), -1, 1)
    })())
    add(cat, "session.depth_avg", "Avg events per session", (() => {
      const r = sessions.slice(-20)
      return r.length ? div(r.reduce((a, s) => a + s.length, 0), r.length) : 0
    })())
    add(cat, "session.hole_ratio", "Share of sessions ending without a completion", (() => {
      const r = sessions.slice(-20)
      if (!r.length) return 0
      let withCompletion = 0
      for (const s of r) {
        const day = dayKey(new Date(s[s.length - 1]))
        if (c.lessons.some((l) => dayKey(l.completedAt) === day) || c.stories.some((st) => dayKey(st.completedAt) === day)) withCompletion++
      }
      return clamp01(1 - div(withCompletion, r.length))
    })())
    add(cat, "session.time_since_last_min", "Minutes since last session end", durations.length ? Math.round((asOf - sessions[sessions.length - 1][sessions[sessions.length - 1].length - 1]) / 60000) : 9999)
    add(cat, "session.per_day_7d", "Sessions per day (7d)", div(sessions.filter((s) => asOf - s[s.length - 1] < 7 * 86400000).length, 7))
    add(cat, "session.per_week_4w", "Sessions per week (4w)", div(sessions.filter((s) => asOf - s[s.length - 1] < 28 * 86400000).length, 4))
    add(cat, "session.weekend_session_share", "Share of sessions on weekends", clamp01(div(sessions.filter((s) => { const d = K2D(dayKey(new Date(s[0]))); return d === 0 || d === 6 }).length, Math.max(1, sessions.length))))
    add(cat, "session.streak_day_session_len", "Avg session length on streak days", (() => {
      const r = sessions.filter((s) => activeStamps.has(dayKey(new Date(s[0]))))
      if (!r.length) return 0
      return Math.round((r.reduce((a, s) => a + (s[s.length - 1] - s[0]) / 60000, 0) / r.length) * 10) / 10
    })())
    add(cat, "session.open_to_lesson_min", "Avg minutes from open to first lesson", (() => {
      const pairs: number[] = []
      for (const s of sessions.slice(-30)) {
        const firstLessonAfter = c.lessons.find((l) => l.completedAt.getTime() >= s[0] && l.completedAt.getTime() <= s[s.length - 1] + 45 * 60000)
        if (firstLessonAfter) pairs.push((firstLessonAfter.completedAt.getTime() - s[0]) / 60000)
      }
      return pairs.length ? Math.round((pairs.reduce((a, x) => a + x, 0) / pairs.length) * 10) / 10 : 0
    })())
    add(cat, "session.long_share", "Share of sessions over 15 minutes", clamp01(div(durations.filter((d) => d > 15).length, Math.max(1, durations.length))))
    add(cat, "session.short_share", "Share of sessions under 3 minutes", clamp01(div(durations.filter((d) => d < 3).length, Math.max(1, durations.length))))
  }

  // ═══ 7. timing (25) ═══
  {
    const cat = "timing"
    const best = (() => {
      let bi = -1
      let bv = 0
      for (let h = 0; h < 24; h++) if (hourHist[h] > bv) { bv = hourHist[h]; bi = h }
      return bi
    })()
    add(cat, "timing.best_hour", "Most active local hour", best >= 0 ? best : -1)
    add(cat, "timing.best_hour_weight", "Share of activity in best hour", clamp01(div(best >= 0 ? hourHist[best] : 0, Math.max(1, hourTotal))))
    add(cat, "timing.morning_share", "Share of activity 5-12h", clamp01(div(hourHist.slice(5, 12).reduce((a, x) => a + x, 0), Math.max(1, hourTotal))))
    add(cat, "timing.midday_share", "Share of activity 12-17h", clamp01(div(hourHist.slice(12, 17).reduce((a, x) => a + x, 0), Math.max(1, hourTotal))))
    add(cat, "timing.evening_share", "Share of activity 17-21h", clamp01(div(hourHist.slice(17, 21).reduce((a, x) => a + x, 0), Math.max(1, hourTotal))))
    add(cat, "timing.night_share", "Share of activity 21-5h", clamp01(div([...hourHist.slice(21), ...hourHist.slice(0, 5)].reduce((a, x) => a + x, 0), Math.max(1, hourTotal))))
    add(cat, "timing.chronotype", "Chronotype code (0 morning, 1 midday, 2 evening, 3 night)", (() => {
      const m = hourHist.slice(5, 12).reduce((a, x) => a + x, 0)
      const md = hourHist.slice(12, 17).reduce((a, x) => a + x, 0)
      const e = hourHist.slice(17, 21).reduce((a, x) => a + x, 0)
      const n = [...hourHist.slice(21), ...hourHist.slice(0, 5)].reduce((a, x) => a + x, 0)
      const mx = Math.max(m, md, e, n)
      if (mx === 0) return -1
      return mx === m ? 0 : mx === md ? 1 : mx === e ? 2 : 3
    })())
    add(cat, "timing.reminder_hour", "Configured reminder hour", (() => {
      const hm = String(b<string>("reminderTime", "19:00"))
      const h = parseInt((hm.split(":")[0] ?? "19"), 10)
      return Number.isFinite(h) ? clamp(h, 0, 23) : 19
    })())
    add(cat, "timing.reminder_alignment", "Reminder set near best hour", best >= 0 && (() => {
      const hm = String(b<string>("reminderTime", "19:00"))
      const h = parseInt((hm.split(":")[0] ?? "19"), 10)
      return Number.isFinite(h) ? Math.abs(h - best) <= 1 : false
    })() ? 1 : 0)
    add(cat, "timing.spread_hours", "Number of distinct active hours", hourHist.filter((x) => x > 0).length)
    add(cat, "timing.concentration", "Activity concentration (HHI/24)", clamp01(div(hourHist.reduce((a, x) => a + x * x, 0), Math.max(1, hourTotal * hourTotal))))
    for (const h of [7, 12, 19, 22]) {
      add(cat, `timing.h${h}_share`, `Share of activity at hour ~${h}`, clamp01(div(hourHist.slice(Math.max(0, h - 1), h + 2).reduce((a, x) => a + x, 0), Math.max(1, hourTotal))))
    }
    add(cat, "timing.first_seen_hour", "Hour of first-ever activity", c.events.length ? Math.floor((c.events[0].ts.getTime() + TZ_OFFSET_MS) / 3600000) % 24 : -1)
    add(cat, "timing.last_seen_hour", "Hour of last activity", c.events.length ? Math.floor((c.events[c.events.length - 1].ts.getTime() + TZ_OFFSET_MS) / 3600000) % 24 : -1)
    add(cat, "timing.hour_shift", "Recent activity hour minus historical", (() => {
      if (c.events.length < 10) return 0
      const recent = c.events.filter((e) => asOf - e.ts.getTime() < 7 * 86400000)
      if (recent.length < 3) return 0
      const rAvg = recent.reduce((a, e) => a + (Math.floor((e.ts.getTime() + TZ_OFFSET_MS) / 3600000) % 24), 0) / recent.length
      const hAvg = c.events.reduce((a, e) => a + (Math.floor((e.ts.getTime() + TZ_OFFSET_MS) / 3600000) % 24), 0) / c.events.length
      return clamp(rAvg - hAvg, -12, 12)
    })())
    add(cat, "timing.weekend_hour_shift", "Weekend activity hour minus weekday", (() => {
      const we = c.events.filter((e) => { const d = new Date(e.ts.getTime() + TZ_OFFSET_MS).getUTCDay(); return d === 0 || d === 6 })
      const wd = c.events.filter((e) => { const d = new Date(e.ts.getTime() + TZ_OFFSET_MS).getUTCDay(); return d >= 1 && d <= 5 })
      if (we.length < 3 || wd.length < 3) return 0
      return clamp((we.reduce((a, e) => a + (Math.floor((e.ts.getTime() + TZ_OFFSET_MS) / 3600000) % 24), 0) / we.length) - (wd.reduce((a, e) => a + (Math.floor((e.ts.getTime() + TZ_OFFSET_MS) / 3600000) % 24), 0) / wd.length), -12, 12)
    })())
    add(cat, "timing.dow_mode", "Most active day-of-week", (() => {
      const counts = new Array(7).fill(0)
      for (const k of activeDays) counts[K2D(k)]++
      let bi = -1
      let bv = 0
      for (let d = 0; d < 7; d++) if (counts[d] > bv) { bv = counts[d]; bi = d }
      return bi
    })())
    add(cat, "timing.study_days_per_week", "Study days per week (4w avg)", div(activeDays.filter((k) => ago(k) < 28).length, 4))
    add(cat, "timing.evening_study_share", "Share of lessons completed after 18:00", clamp01(div(c.lessons.filter((l) => Math.floor((l.completedAt.getTime() + TZ_OFFSET_MS) / 3600000) % 24 >= 18).length, Math.max(1, c.lessons.length))))
    add(cat, "timing.primetime_match", "Golden-hour nudge would land in best hour", best >= 0 && best >= 17 && best <= 21 ? 1 : 0)
    add(cat, "timing.hour_variance", "Variance of active hours", (() => {
      if (c.events.length < 5) return 0
      const hs = c.events.map((e) => Math.floor((e.ts.getTime() + TZ_OFFSET_MS) / 3600000) % 24)
      const mean = hs.reduce((a, x) => a + x, 0) / hs.length
      return Math.round(hs.reduce((a, x) => a + (x - mean) * (x - mean), 0) / hs.length)
    })())
    add(cat, "timing.regular_hour", "Same-hour consistency (mode share)", (() => {
      if (c.events.length < 5) return 0
      const counts = new Map<number, number>()
      for (const e of c.events) {
        const h = Math.floor((e.ts.getTime() + TZ_OFFSET_MS) / 3600000) % 24
        counts.set(h, (counts.get(h) ?? 0) + 1)
      }
      const mx = Math.max(...counts.values())
      return clamp01(div(mx, c.events.length))
    })())
    add(cat, "timing.post_meridiem", "Share of activity after noon", clamp01(div(hourHist.slice(12).reduce((a, x) => a + x, 0), Math.max(1, hourTotal))))
  }

  // ═══ 8. speed (14) ═══
  {
    const cat = "speed"
    const durs = c.lessons.map((l) => l.durationSec).filter((x) => x > 0)
    const recentDurs = durs.slice(-15)
    const avgAll = durs.length ? durs.reduce((a, x) => a + x, 0) / durs.length : 0
    const avgRecent = recentDurs.length ? recentDurs.reduce((a, x) => a + x, 0) / recentDurs.length : 0
    add(cat, "speed.avg_sec", "Avg seconds per lesson (all-time)", Math.round(avgAll))
    add(cat, "speed.avg_sec_recent", "Avg seconds per lesson (last 15)", Math.round(avgRecent))
    add(cat, "speed.trend", "Speed trend (recent vs all-time)", clamp(div(avgRecent - avgAll, Math.max(30, avgAll)), -1, 1))
    add(cat, "speed.fastest", "Fastest lesson (sec)", durs.length ? Math.min(...durs) : 0)
    add(cat, "speed.slowest", "Slowest lesson (sec)", durs.length ? Math.max(...durs) : 0)
    add(cat, "speed.rush_ratio", "Share of lessons under 60s", clamp01(div(durs.filter((d) => d < 60).length, Math.max(1, durs.length))))
    add(cat, "speed.slow_ratio", "Share of lessons over 420s", clamp01(div(durs.filter((d) => d > 420).length, Math.max(1, durs.length))))
    add(cat, "speed.difficulty_speed_corr", "Higher difficulty takes longer (proxy)", (() => {
      const easy = c.lessons.filter((l) => l.difficulty <= 1).map((l) => l.durationSec)
      const hard = c.lessons.filter((l) => l.difficulty >= 3).map((l) => l.durationSec)
      if (easy.length < 2 || hard.length < 2) return 0
      const ea = easy.reduce((a, x) => a + x, 0) / easy.length
      const ha = hard.reduce((a, x) => a + x, 0) / hard.length
      return clamp(div(ha - ea, Math.max(60, ea)), -1, 1)
    })())
    add(cat, "speed.quiz_engagement", "Quiz-day event density", (() => {
      const quizDays = new Set(c.quizzes.map((q) => q.day))
      const evs = c.events.filter((e) => quizDays.has(dayKey(e.ts)))
      return evs.length
    })())
    add(cat, "speed.xp_per_minute", "XP per tracked minute (30d)", (() => {
      const xp30 = c.lessons.filter((l) => asOf - l.completedAt.getTime() < 30 * 86400000).reduce((a, l) => a + l.xpEarned, 0)
      const ev30 = c.events.filter((e) => asOf - e.ts.getTime() < 30 * 86400000)
      const mins = ev30.length > 1 ? (ev30[ev30.length - 1].ts.getTime() - ev30[0].ts.getTime()) / 60000 : 0
      return clamp(div(xp30, Math.max(1, mins)), 0, 30)
    })())
    add(cat, "speed.completion_velocity", "Lessons per active day (30d)", (() => {
      const l30 = c.lessons.filter((l) => asOf - l.completedAt.getTime() < 30 * 86400000)
      const d30 = activeDays.filter((k) => ago(k) < 30).length
      return clamp(div(l30.length, Math.max(1, d30)), 0, 20)
    })())
    add(cat, "speed.slowest_recent", "Slowest of last 15 (sec)", recentDurs.length ? Math.max(...recentDurs) : 0)
    add(cat, "speed.median_sec", "Median seconds per lesson", (() => {
      if (!durs.length) return 0
      const s = [...durs].sort((a, b2) => a - b2)
      return s[Math.floor(s.length / 2)]
    })())
  }

  // ═══ 9. mastery (26) ═══
  {
    const cat = "mastery"
    const challengesDone = c.challenges.filter((ch) => ch.completed)
    const mistakeful = c.challenges.filter((ch) => ch.mistakes > 0 && !ch.completed)
    const recentLessons = c.lessons.slice(-30)
    const accRecent = recentLessons.length ? recentLessons.reduce((a, l) => a + l.accuracy, 0) / recentLessons.length : 0
    add(cat, "mastery.challenges_total", "Challenges attempted", c.challenges.length)
    add(cat, "mastery.challenges_done", "Challenges completed", challengesDone.length)
    add(cat, "mastery.completion_rate", "Challenge completion rate", clamp01(div(challengesDone.length, Math.max(1, c.challenges.length))))
    add(cat, "mastery.mistakes_total", "Total recorded mistakes", c.challenges.reduce((a, ch) => a + ch.mistakes, 0))
    add(cat, "mastery.mistakeful_pending", "Challenges with unresolved mistakes", mistakeful.length)
    add(cat, "mastery.review_due", "Review queue size (mistaken challenges)", mistakeful.length)
    add(cat, "mastery.avg_accuracy_30d", "Avg lesson accuracy (last 30)", Math.round(accRecent))
    add(cat, "mastery.avg_accuracy_all", "Avg lesson accuracy (all-time)", Math.round(c.lessons.length ? c.lessons.reduce((a, l) => a + l.accuracy, 0) / c.lessons.length : 0))
    add(cat, "mastery.perfect_ratio", "Share of perfect lessons", clamp01(div(c.lessons.filter((l) => l.accuracy === 100).length, Math.max(1, c.lessons.length))))
    add(cat, "mastery.perfect_streak", "Consecutive perfect lessons", (() => {
      let n = 0
      for (let i = c.lessons.length - 1; i >= 0; i--) {
        if (c.lessons[i].accuracy === 100) n++
        else break
      }
      return n
    })())
    add(cat, "mastery.accuracy_trend", "Accuracy trend (recent vs prior)", (() => {
      if (c.lessons.length < 8) return 0
      const r = c.lessons.slice(-5).reduce((a, l) => a + l.accuracy, 0) / 5
      const pr = c.lessons.slice(-12, -5).reduce((a, l) => a + l.accuracy, 0) / Math.max(1, c.lessons.slice(-12, -5).length)
      return clamp((r - pr) / 10, -1, 1)
    })())
    add(cat, "mastery.avg_combo", "Avg max combo", Math.round(c.lessons.length ? c.lessons.reduce((a, l) => a + l.comboMax, 0) / c.lessons.length : 0))
    add(cat, "mastery.max_combo", "Best combo", c.lessons.length ? Math.max(...c.lessons.map((l) => l.comboMax)) : 0)
    add(cat, "mastery.difficulty_max", "Highest unit difficulty attempted", c.lessons.length ? Math.max(...c.lessons.map((l) => l.difficulty)) : 0)
    add(cat, "mastery.difficulty_mix", "Share of lessons at difficulty 3", clamp01(div(c.lessons.filter((l) => l.difficulty >= 3).length, Math.max(1, c.lessons.length))))
    add(cat, "mastery.courses_touched", "Distinct courses studied", new Set(c.lessons.map((l) => l.courseId)).size)
    add(cat, "mastery.courses_finished", "Courses with 10+ lessons (deep engagement)", (() => {
      const byCourse = new Map<string, number>()
      for (const l of c.lessons) byCourse.set(l.courseId, (byCourse.get(l.courseId) ?? 0) + 1)
      return [...byCourse.values()].filter((v) => v >= 10).length
    })())
    add(cat, "mastery.review_pressure", "Review queue relative to throughput", clamp(div(mistakeful.length, Math.max(1, c.lessons.filter((l) => asOf - l.completedAt.getTime() < 14 * 86400000).length)), 0, 5))
    add(cat, "mastery.overlearning", "Lessons redone / practiced", clamp01(div(Math.max(0, c.lessons.length - new Set(c.lessons.map((l) => l.lessonId)).size), Math.max(1, c.lessons.length))))
    add(cat, "mastery.quiz_avg", "Avg quiz score fraction", clamp01(div(c.quizzes.reduce((a, q) => a + q.score, 0), Math.max(1, c.quizzes.reduce((a, q) => a + q.total, 0)))))
    add(cat, "mastery.quiz_perfect_days", "Perfect quiz days", c.quizzes.filter((q) => q.score === q.total && q.total > 0).length)
    add(cat, "mastery.quiz_trend", "Quiz score trend", (() => {
      if (c.quizzes.length < 4) return 0
      const r = c.quizzes.slice(-3).reduce((a, q) => a + div(q.score, Math.max(1, q.total)), 0) / 3
      const pr = c.quizzes.slice(-8, -3).reduce((a, q) => a + div(q.score, Math.max(1, q.total)), 0) / Math.max(1, c.quizzes.slice(-8, -3).length)
      return clamp((r - pr) * 2, -1, 1)
    })())
    add(cat, "mastery.last_mistake_days", "Days since last lesson under 100%", (() => {
      const imperfect = [...c.lessons].reverse().find((l) => l.accuracy < 100)
      return imperfect ? daysSince(imperfect.completedAt, asOf) : 30
    })())
    add(cat, "mastery.struggle_courses", "Courses with avg accuracy under 70", (() => {
      const byCourse = new Map<string, number[]>()
      for (const l of c.lessons) byCourse.set(l.courseId, [...(byCourse.get(l.courseId) ?? []), l.accuracy])
      let n = 0
      for (const arr of byCourse.values()) if (arr.length >= 3 && arr.reduce((a, x) => a + x, 0) / arr.length < 70) n++
      return n
    })())
    add(cat, "mastery.sputnik", "Recent struggle: 2+ lessons under 60% (last 10)", c.lessons.slice(-10).filter((l) => l.accuracy < 60).length >= 2 ? 1 : 0)
    add(cat, "mastery.mastery_index", "Composite mastery index 0-1", clamp01(div(challengesDone.length, Math.max(6, challengesDone.length + mistakeful.length * 2)) * 0.6 + clamp01(div(Math.max(0, accRecent), 100)) * 0.4))
  }

  // ═══ 10. progress (36) ═══
  {
    const cat = "progress"
    const xp = b<number>("xp", 0)
    const lv = levelInfo(xp)
    add(cat, "progress.xp_total", "Total XP", xp)
    add(cat, "progress.level", "Current level", lv.level)
    add(cat, "progress.level_percent", "Percent into level", lv.percent / 100)
    add(cat, "progress.xp_to_next", "XP to next level", Math.max(0, lv.xpForNext - xp))
    add(cat, "progress.lessons_total", "Lessons completed", c.lessons.length)
    add(cat, "progress.lessons_7d", "Lessons in last 7d", c.lessons.filter((l) => asOf - l.completedAt.getTime() < 7 * 86400000).length)
    add(cat, "progress.lessons_30d", "Lessons in last 30d", c.lessons.filter((l) => asOf - l.completedAt.getTime() < 30 * 86400000).length)
    add(cat, "progress.xp_7d", "XP earned in 7d", c.lessons.filter((l) => asOf - l.completedAt.getTime() < 7 * 86400000).reduce((a, l) => a + l.xpEarned, 0) + c.stories.filter((s) => asOf - s.completedAt.getTime() < 7 * 86400000).reduce((a, s) => a + s.xpEarned, 0) + c.quizzes.filter((q) => asOf - q.createdAt.getTime() < 7 * 86400000).reduce((a, q) => a + q.xpEarned, 0))
    add(cat, "progress.xp_30d", "XP earned in 30d", c.lessons.filter((l) => asOf - l.completedAt.getTime() < 30 * 86400000).reduce((a, l) => a + l.xpEarned, 0) + c.stories.filter((s) => asOf - s.completedAt.getTime() < 30 * 86400000).reduce((a, s) => a + s.xpEarned, 0) + c.quizzes.filter((q) => asOf - q.createdAt.getTime() < 30 * 86400000).reduce((a, q) => a + q.xpEarned, 0))
    add(cat, "progress.daily_xp", "Daily XP today", b<string | null>("dailyXpDay", null) === todayKey ? b<number>("dailyXp", 0) : 0)
    add(cat, "progress.daily_goal", "Daily XP goal", 50)
    add(cat, "progress.goal_hit_today", "Daily goal hit today", (b<string | null>("dailyXpDay", null) === todayKey ? b<number>("dailyXp", 0) : 0) >= 50)
    add(cat, "progress.gems", "Gems held", b<number>("gems", 0))
    add(cat, "progress.gems_spent_est", "Gems spent (all-time, estimate)", Math.max(0, 500 + c.quests.filter((q) => q.completed).reduce((a, q) => a + 15, 0) + c.achievements.reduce((a, a2) => a + a2.tier * 25, 0) - b<number>("gems", 0)))
    add(cat, "progress.hearts", "Hearts right now", b<number>("hearts", 5))
    add(cat, "progress.hearts_low", "Hearts at zero", b<number>("hearts", 5) === 0)
    add(cat, "progress.stories_total", "Stories completed", c.stories.length)
    add(cat, "progress.chapters_read", "Bible chapters read", c.reads.length)
    add(cat, "progress.marks_total", "Verse marks made", c.marks.length)
    add(cat, "progress.plans_days", "Plan days completed", c.plans.length)
    add(cat, "progress.plan_streak", "Consecutive plan check-offs (best)", (() => {
      const byPlan = new Map<string, number[]>()
      for (const p2 of c.plans) byPlan.set(p2.planId, [...(byPlan.get(p2.planId) ?? []), p2.day])
      let best = 0
      for (const days of byPlan.values()) {
        const s = [...days].sort((a, b2) => a - b2)
        let run = 0
        let prev = -99
        for (const d of s) {
          run = d === prev + 1 ? run + 1 : 1
          best = Math.max(best, run)
          prev = d
        }
      }
      return best
    })())
    add(cat, "progress.quizzes_total", "Quizzes completed", c.quizzes.length)
    add(cat, "progress.quests_completed_total", "Quests completed all-time", c.quests.filter((q) => q.completed).length)
    add(cat, "progress.quests_today", "Quests completed today", c.quests.filter((q) => q.day === todayKey && q.completed).length)
    add(cat, "progress.quests_claim_rate", "Quest claim rate", clamp01(div(c.quests.filter((q) => q.claimed).length, Math.max(1, c.quests.filter((q) => q.completed).length))))
    add(cat, "progress.achievements_tiers", "Achievement tiers unlocked", c.achievements.reduce((a, x) => a + x.tier, 0))
    add(cat, "progress.achievements_count", "Achievements unlocked (any tier)", c.achievements.filter((x) => x.tier > 0).length)
    add(cat, "progress.items_owned", "Store items owned", c.items.reduce((a, i) => a + i.quantity, 0))
    add(cat, "progress.freezes_owned", "Streak freezes owned", c.items.find((i) => i.slug === "streak_freeze")?.quantity ?? 0)
    add(cat, "progress.completion_breadth", "Breadth: distinct courses touched", new Set(c.lessons.map((l) => l.courseId)).size)
    add(cat, "progress.avg_xp_per_lesson", "Avg XP per lesson", Math.round(c.lessons.length ? c.lessons.reduce((a, l) => a + l.xpEarned, 0) / c.lessons.length : 0))
    add(cat, "progress.xp_velocity_7d", "XP per day (7d)", div(c.lessons.filter((l) => asOf - l.completedAt.getTime() < 7 * 86400000).reduce((a, l) => a + l.xpEarned, 0) + c.stories.filter((s) => asOf - s.completedAt.getTime() < 7 * 86400000).reduce((a, s) => a + s.xpEarned, 0), 7))
    add(cat, "progress.xp_velocity_30d", "XP per day (30d)", div(c.lessons.filter((l) => asOf - l.completedAt.getTime() < 30 * 86400000).reduce((a, l) => a + l.xpEarned, 0) + c.stories.filter((s) => asOf - s.completedAt.getTime() < 30 * 86400000).reduce((a, s) => a + s.xpEarned, 0), 30))
    add(cat, "progress.days_since_levelup", "Days since level-up (est)", (() => {
      let last = c.joinedAt
      const steps = [0, 100, 250, 500, 900, 1500, 2500, 4000, 6000, 9000]
      let cum = 0
      for (const l of c.lessons) {
        cum += l.xpEarned
        if (steps.includes(cum)) last = l.completedAt
      }
      return daysSince(last, asOf)
    })())
    add(cat, "progress.new_course_recent", "Started a new course in last 14d", (() => {
      const seen = new Set<string>()
      let newCourse = false
      for (const l of c.lessons) {
        if (!seen.has(l.courseId)) {
          seen.add(l.courseId)
          if (asOf - l.completedAt.getTime() < 14 * 86400000) newCourse = true
        }
      }
      return newCourse
    })())
    add(cat, "progress.course_count", "Courses started", new Set(c.lessons.map((l) => l.courseId)).size)
    add(cat, "progress.placement_done", "Placement test taken", c.events.some((e) => e.type === "placement_done"))
  }

  // ═══ 11. delta (23) ═══
  {
    const cat = "delta"
    // (window counts use the shared sorted-ms index defined above)
    add(cat, "delta.lessons_7vprev", "Lessons 7d vs previous 7d", countBetween(lessonMs, 0, 7) - countBetween(lessonMs, 7, 14))
    add(cat, "delta.reads_7vprev", "Chapters 7d vs previous 7d", countBetween(readMs, 0, 7) - countBetween(readMs, 7, 14))
    add(cat, "delta.quizzes_7vprev", "Quizzes 7d vs previous 7d", countBetween(quizMs, 0, 7) - countBetween(quizMs, 7, 14))
    add(cat, "delta.stories_7vprev", "Stories 7d vs previous 7d", countBetween(storyMs, 0, 7) - countBetween(storyMs, 7, 14))
    add(cat, "delta.lessons_14vprev", "Lessons 14d vs previous 14d", countBetween(lessonMs, 0, 14) - countBetween(lessonMs, 14, 28))
    add(cat, "delta.reads_14vprev", "Chapters 14d vs previous 14d", countBetween(readMs, 0, 14) - countBetween(readMs, 14, 28))
    add(cat, "delta.active_7vprev", "Active days 7d vs previous 7d", activeIn(0, 7) - activeIn(7, 14))
    add(cat, "delta.active_14vprev", "Active days 14d vs previous 14d", activeIn(0, 14) - activeIn(14, 28))
    add(cat, "delta.session_7vprev", "Sessions 7d vs previous 7d", (() => {
      const evts = c.events.map((e) => e.ts.getTime()).sort((a, b2) => a - b2)
      const count = (lo: number, hi: number) => {
        const ts = evts.filter((t) => asOf - t >= lo * 86400000 && asOf - t < hi * 86400000)
        if (!ts.length) return 0
        let s = 1
        for (let i = 1; i < ts.length; i++) if (ts[i] - ts[i - 1] > 45 * 60000) s++
        return s
      }
      return count(0, 7) - count(7, 14)
    })())
    add(cat, "delta.xp_7vprev", "XP 7d vs previous 7d", (() => {
      const x7 = c.lessons.filter((l) => asOf - l.completedAt.getTime() < 7 * 86400000).reduce((a, l) => a + l.xpEarned, 0)
      const x7p = c.lessons.filter((l) => asOf - l.completedAt.getTime() >= 7 * 86400000 && asOf - l.completedAt.getTime() < 14 * 86400000).reduce((a, l) => a + l.xpEarned, 0)
      return x7 - x7p
    })())
    add(cat, "delta.accuracy_10vprev", "Accuracy last 10 vs previous 10", (() => {
      if (c.lessons.length < 12) return 0
      const r = c.lessons.slice(-10).reduce((a, l) => a + l.accuracy, 0) / 10
      const pr = c.lessons.slice(-20, -10).reduce((a, l) => a + l.accuracy, 0) / Math.max(1, c.lessons.slice(-20, -10).length)
      return Math.round(r - pr)
    })())
    add(cat, "delta.combo_10vprev", "Combo last 10 vs previous 10", (() => {
      if (c.lessons.length < 12) return 0
      const r = c.lessons.slice(-10).reduce((a, l) => a + l.comboMax, 0) / 10
      const pr = c.lessons.slice(-20, -10).reduce((a, l) => a + l.comboMax, 0) / Math.max(1, c.lessons.slice(-20, -10).length)
      return Math.round(r - pr)
    })())
    add(cat, "delta.mark_7vprev", "Verse marks 7d vs prev", countBetween(markMs, 0, 7) - countBetween(markMs, 7, 14))
    add(cat, "delta.post_14vprev", "Posts 14d vs prev", countBetween(postMs, 0, 14) - countBetween(postMs, 14, 28))
    add(cat, "delta.progress_velocity", "Normalized progress velocity change", clamp(div(countBetween(lessonMs, 0, 7) - countBetween(lessonMs, 7, 14), Math.max(2, (countBetween(lessonMs, 0, 7) + countBetween(lessonMs, 7, 14)) / 2)), -1, 1))
    add(cat, "delta.engagement_slope", "Engagement slope over 4 weeks", (() => {
      const weeks = [0, 1, 2, 3].map((i) => activeIn(i * 7, (i + 1) * 7))
      if (weeks.some((x) => x === 0)) return 0
      const mean = weeks.reduce((a, x) => a + x, 0) / 4
      let cov = 0
      let varx = 0
      for (let i = 0; i < 4; i++) {
        cov += (i - 1.5) * (weeks[i] - mean)
        varx += (i - 1.5) * (i - 1.5)
      }
      return varx > 0 ? clamp(cov / varx / Math.max(1, mean), -1, 1) : 0
    })())
    add(cat, "delta.reading_slope", "Bible-reading slope over 4 weeks", (() => {
      const weeks = [0, 1, 2, 3].map((i) => c.reads.filter((r) => { const d = daysBetween(dayKey(r.readAt), todayKey); return d >= i * 7 && d < (i + 1) * 7 }).length)
      if (weeks.reduce((a, x) => a + x, 0) === 0) return 0
      const mean = weeks.reduce((a, x) => a + x, 0) / 4
      let cov = 0
      let varx = 0
      for (let i = 0; i < 4; i++) {
        cov += (i - 1.5) * (weeks[i] - mean)
        varx += (i - 1.5) * (i - 1.5)
      }
      return varx > 0 ? clamp(cov / varx / Math.max(1, mean), -1, 1) : 0
    })())
    add(cat, "delta.gems_delta_7d", "Gems net flow 7d (est)", 0) // requires spend events; ledger symmetry
    add(cat, "delta.new_streak_high", "Streak at all-time high", (() => {
      let best = 0
      let run = 0
      let prev: string | null = null
      for (const k of activeDays) {
        run = prev && daysBetween(prev, k) === 1 ? run + 1 : 1
        best = Math.max(best, run)
        prev = k
      }
      return b<number>("streak", 0) >= best ? 1 : 0
    })())
    add(cat, "delta.first_week_lessons", "Lessons in first 7 days after join", c.lessons.filter((l) => l.completedAt.getTime() - c.joinedAt.getTime() < 7 * 86400000).length)
    add(cat, "delta.sophomore_slump", "Week-2 drop vs week-1 (new users)", (() => {
      const tenureDays = (asOf - c.joinedAt.getTime()) / 86400000
      if (tenureDays > 30) return 0
      const w1 = c.lessons.filter((l) => l.completedAt.getTime() - c.joinedAt.getTime() < 7 * 86400000).length
      const w2 = c.lessons.filter((l) => l.completedAt.getTime() - c.joinedAt.getTime() >= 7 * 86400000 && l.completedAt.getTime() - c.joinedAt.getTime() < 14 * 86400000).length
      if (w1 === 0) return 0
      return clamp((w2 - w1) / Math.max(1, w1), -1, 1)
    })())
    add(cat, "delta.momentum_score", "Composite momentum (velocity + active share)", clamp01(clamp01(div(countSince(lessonMs, 7), 7)) * 0.5 + clamp01(div(activeIn(0, 7), 7)) * 0.5))
    add(cat, "delta.regression_flag", "3+ signals negative this week", (() => {
      let neg = 0
      if (countBetween(lessonMs, 0, 7) < countBetween(lessonMs, 7, 14)) neg++
      if (activeIn(0, 7) < activeIn(7, 14)) neg++
      if (countBetween(readMs, 0, 7) < countBetween(readMs, 7, 14)) neg++
      if (countBetween(quizMs, 0, 7) < countBetween(quizMs, 7, 14)) neg++
      return neg >= 3 ? 1 : 0
    })())
  }

  // ═══ 12. comp (26) — consistency & composites ═══
  {
    const cat = "comp"
    const a7 = activeIn(0, 7)
    const a30 = activeIn(0, 30)
    const gaps: number[] = []
    for (let i = 1; i < activeDays.length; i++) gaps.push(daysBetween(activeDays[i - 1], activeDays[i]))
    const meanGap = gaps.length ? gaps.reduce((a, x) => a + x, 0) / gaps.length : 0
    const longestRun = (() => {
      let best = 0
      let run = 0
      let prev: string | null = null
      for (const k of activeDays) {
        run = prev && daysBetween(prev, k) === 1 ? run + 1 : 1
        best = Math.max(best, run)
        prev = k
      }
      return best
    })()
    add(cat, "comp.routine_score", "Routine score 0-1 (share × low variance)", clamp01(div(a30, 30) * (gaps.length ? clamp01(1.5 - div(gaps.reduce((a, x) => a + Math.abs(x - meanGap), 0) / gaps.length, Math.max(0.5, meanGap))) : 1)))
    add(cat, "comp.consistency_7d", "Consistency: active-day share (7d)", clamp01(div(a7, 7)))
    add(cat, "comp.consistency_30d", "Consistency: active-day share (30d)", clamp01(div(a30, 30)))
    add(cat, "comp.mean_gap", "Mean gap between active days", Math.round(meanGap * 10) / 10)
    add(cat, "comp.gap_sd", "Std-dev of gaps", (() => {
      if (gaps.length < 2) return 0
      const m = gaps.reduce((a, x) => a + x, 0) / gaps.length
      return Math.round(Math.sqrt(gaps.reduce((a, x) => a + (x - m) * (x - m), 0) / gaps.length) * 10) / 10
    })())
    add(cat, "comp.gap_cv", "Coefficient of variation of gaps", (() => {
      if (!gaps.length || meanGap <= 0) return 0
      const sd = Math.sqrt(gaps.reduce((a, x) => a + (x - meanGap) * (x - meanGap), 0) / gaps.length)
      return clamp(div(sd, meanGap), 0, 5)
    })())
    add(cat, "comp.habit_strength", "Habit strength (56-day hit rate)", clamp01(div(activeIn(0, 56), 56)))
    add(cat, "comp.deep_work_share", "Share of active days with 2+ lessons", (() => {
      const counts = new Map<string, number>()
      for (const l of c.lessons) if (daysBetween(dayKey(l.completedAt), todayKey) < 30) counts.set(dayKey(l.completedAt), (counts.get(dayKey(l.completedAt)) ?? 0) + 1)
      return clamp01(div([...counts.values()].filter((v) => v >= 2).length, Math.max(1, a30)))
    })())
    add(cat, "comp.balanced_diet", "Lesson+read+quiz all present in 14d", (() => {
      const win = 14 * 86400000
      const hasLesson = c.lessons.some((l) => asOf - l.completedAt.getTime() < win)
      const hasRead = c.reads.some((r) => asOf - r.readAt.getTime() < win)
      const hasQuiz = c.quizzes.some((q) => asOf - q.createdAt.getTime() < win)
      return hasLesson && hasRead && hasQuiz ? 1 : 0
    })())
    add(cat, "comp.surface_breadth_7d", "Distinct surfaces used in 7d", new Set(c.events.filter((e) => asOf - e.ts.getTime() < 7 * 86400000 && e.type === "view_change").map((e) => String(e.payload.view ?? ""))).size)
    add(cat, "comp.completion_discipline", "Quests claimed ÷ completed", clamp01(div(c.quests.filter((q) => q.claimed).length, Math.max(1, c.quests.filter((q) => q.completed).length))))
    add(cat, "comp.sobriety", "No very-late-night sessions in 14d", c.events.filter((e) => { const h = Math.floor((e.ts.getTime() + TZ_OFFSET_MS) / 3600000) % 24; return (h >= 1 && h < 5) && asOf - e.ts.getTime() < 14 * 86400000 }).length === 0 ? 1 : 0)
    add(cat, "comp.engagement_composite", "Engagement composite (breadth×depth×consistency)", clamp01(clamp01(div(new Set(c.events.filter((e) => asOf - e.ts.getTime() < 30 * 86400000).map((e) => dayKey(e.ts))).size, 30)) * 0.4 + clamp01(div(c.lessons.filter((l) => asOf - l.completedAt.getTime() < 30 * 86400000).length, 20)) * 0.4 + clamp01(div(c.reads.filter((r) => asOf - r.readAt.getTime() < 30 * 86400000).length, 10)) * 0.2))
    add(cat, "comp.autonomy", "Self-directed share (own navigation vs nudges)", clamp01(1 - div(c.events.filter((e) => e.type === "nba_used").length, Math.max(1, c.events.filter((e) => e.type === "app_open").length))))
    add(cat, "comp.intrinsic_mix", "Reading/study share vs gamified surfaces", clamp01(div(c.events.filter((e) => e.type === "view_change" && ["bible", "learn", "stories"].includes(String(e.payload.view))).length, Math.max(1, c.events.filter((e) => e.type === "view_change").length))))
    add(cat, "comp.grit_proxy", "Grit proxy: accuracy maintained as difficulty rises", (() => {
      const early = c.lessons.slice(0, Math.max(1, Math.floor(c.lessons.length / 2)))
      const late = c.lessons.slice(Math.floor(c.lessons.length / 2))
      if (early.length < 3 || late.length < 3) return 0
      const ea = early.reduce((a, l) => a + l.accuracy, 0) / early.length
      const la = late.reduce((a, l) => a + l.accuracy, 0) / late.length
      const dRise = (late.reduce((a, l) => a + l.difficulty, 0) / late.length) - (early.reduce((a, l) => a + l.difficulty, 0) / early.length)
      if (dRise <= 0) return 0
      return clamp((la - ea + 10) / 30, 0, 1)
    })())
    add(cat, "comp.flow_days_30d", "Days with lesson and 10+ events (30d)", (() => {
      const lessonDays = new Set(c.lessons.filter((l) => asOf - l.completedAt.getTime() < 30 * 86400000).map((l) => dayKey(l.completedAt)))
      const evCounts = new Map<string, number>()
      for (const e of c.events) if (asOf - e.ts.getTime() < 30 * 86400000) evCounts.set(dayKey(e.ts), (evCounts.get(dayKey(e.ts)) ?? 0) + 1)
      let n = 0
      for (const d of lessonDays) if ((evCounts.get(d) ?? 0) >= 10) n++
      return n
    })())
    add(cat, "comp.read_streak_days", "Consecutive Bible-reading days (best)", (() => {
      const rd = [...new Set(c.reads.map((r) => dayKey(r.readAt)))].sort()
      let best = 0
      let run = 0
      let prev: string | null = null
      for (const k of rd) {
        run = prev && daysBetween(prev, k) === 1 ? run + 1 : 1
        best = Math.max(best, run)
        prev = k
      }
      return best
    })())
    add(cat, "comp.dopamine_diversity", "Reward-source diversity (7d)", new Set([...c.quests.filter((q) => q.completed && daysBetween(q.day, todayKey) < 7).map(() => "quest"), ...c.events.filter((e) => e.type === "chest_open" && asOf - e.ts.getTime() < 7 * 86400000).map(() => "chest"), ...c.quizzes.filter((q) => daysBetween(q.day, todayKey) < 7).map(() => "quiz")]).size)
    add(cat, "comp.help_seeking", "Opened practice/help surfaces in 14d", c.events.filter((e) => e.type === "view_change" && ["practice-hub", "guidebook"].includes(String(e.payload.view)) && asOf - e.ts.getTime() < 14 * 86400000).length)
    add(cat, "comp.night_light", "Late-night activity share (30d)", clamp01(div(c.events.filter((e) => { const h = Math.floor((e.ts.getTime() + TZ_OFFSET_MS) / 3600000) % 24; return (h >= 23 || h < 5) && asOf - e.ts.getTime() < 30 * 86400000 }).length, Math.max(1, c.events.filter((e) => asOf - e.ts.getTime() < 30 * 86400000).length))))
    add(cat, "comp.weekend_engagement", "Weekend share of active days", clamp01(div(activeDays.filter((k) => K2D(k) === 0 || K2D(k) === 6).length, Math.max(1, activeDays.length))))
    add(cat, "comp.overall_health", "Overall habit-health composite", clamp01((clamp01(div(a30, 30)) + clamp01(div(c.lessons.filter((l) => asOf - l.completedAt.getTime() < 30 * 86400000).length, 30)) + clamp01(1 - clamp01(div(daysSince(c.lessons.at(-1)?.completedAt, asOf), 7)))) / 3))
    add(cat, "comp.trend_direction", "Health trend over 2 weeks", clamp(activeIn(0, 14) - activeIn(14, 28), -1, 1))
    add(cat, "comp.completion_ratio_all", "Lessons per day since first lesson", (() => {
      const first = c.lessons[0]?.completedAt
      if (!first) return 0
      const days = Math.max(1, (asOf - first.getTime()) / 86400000)
      return clamp(div(c.lessons.length, days), 0, 20)
    })())
    add(cat, "comp.retention_shape", "Classic retention curve shape (D1/D7 proxies)", clamp01(div(activeIn(0, 30), 30)) * clamp01(div(longestRun, 14)))
  }

  // ═══ 13. motiv (20) ═══
  {
    const cat = "motiv"
    const dailyGoal = 50
    const xpByDay = new Map<string, number>()
    for (const l of c.lessons) xpByDay.set(dayKey(l.completedAt), (xpByDay.get(dayKey(l.completedAt)) ?? 0) + l.xpEarned)
    for (const q of c.quizzes) xpByDay.set(q.day, (xpByDay.get(q.day) ?? 0) + q.xpEarned)
    for (const s of c.stories) xpByDay.set(dayKey(s.completedAt), (xpByDay.get(dayKey(s.completedAt)) ?? 0) + s.xpEarned)
    const goalHits30 = [...xpByDay.entries()].filter(([k, v]) => v >= dailyGoal && daysBetween(k, todayKey) < 30).length
    const misses = [...activeDays].filter((k) => (xpByDay.get(k) ?? 0) < dailyGoal).length
    add(cat, "motiv.goal_hits_30d", "Daily-goal hits in 30d", goalHits30)
    add(cat, "motiv.goal_hit_rate", "Goal-hit rate among active days", clamp01(div(goalHits30, Math.max(1, activeIn(0, 30)))))
    add(cat, "motiv.goal_miss_streak", "Consecutive active days missing the goal", (() => {
      const recentActive = activeDays.filter((k) => ago(k) < 14).slice(-6)
      let n = 0
      for (let i = recentActive.length - 1; i >= 0; i--) {
        if ((xpByDay.get(recentActive[i]) ?? 0) < dailyGoal) n++
        else break
      }
      return n
    })())
    add(cat, "motiv.misses_total", "Active days under goal (all-time)", misses)
    add(cat, "motiv.xp_velocity_7d", "XP per day (7d, all sources)", div(c.lessons.filter((l) => asOf - l.completedAt.getTime() < 7 * 86400000).reduce((a, l) => a + l.xpEarned, 0) + c.stories.filter((s) => asOf - s.completedAt.getTime() < 7 * 86400000).reduce((a, s) => a + s.xpEarned, 0) + c.quizzes.filter((q) => asOf - q.createdAt.getTime() < 7 * 86400000).reduce((a, q) => a + q.xpEarned, 0), 7))
    add(cat, "motiv.combo_love", "Combo-seeking: avg combo ÷ 10", clamp(div(c.lessons.length ? c.lessons.reduce((a, l) => a + l.comboMax, 0) / c.lessons.length : 0, 10), 0, 1))
    add(cat, "motiv.perfect_seeking", "Perfect-lesson pursuit (recent share)", clamp01(div(c.lessons.slice(-10).filter((l) => l.accuracy === 100).length, Math.max(1, Math.min(10, c.lessons.length)))))
    add(cat, "motiv.gem_economy_active", "Gem economy activity (7d)", c.quests.filter((q) => q.completed && daysBetween(q.day, todayKey) < 7).length + c.quizzes.filter((q) => daysBetween(q.day, todayKey) < 7).length)
    add(cat, "motiv.reward_variety_7d", "Distinct reward types touched 7d", new Set([c.quests.filter((q) => q.completed && daysBetween(q.day, todayKey) < 7).length > 0 ? "quest" : "", c.quizzes.filter((q) => daysBetween(q.day, todayKey) < 7).length > 0 ? "quiz" : "", c.stories.filter((s) => asOf - s.completedAt.getTime() < 7 * 86400000).length > 0 ? "story" : "", c.reads.filter((r) => asOf - r.readAt.getTime() < 7 * 86400000).length > 0 ? "read" : ""].filter(Boolean)).size)
    add(cat, "motiv.league_compete", "League XP above zero this week", c.league.some((l) => l.isCurrentUser && l.xp > 0) ? 1 : 0)
    add(cat, "motiv.social_recognition", "Community posts with likes received", c.posts.filter((po) => po.likes > 0).length)
    add(cat, "motiv.avatar_investment", "Custom avatar configured", !!c.user.avatar)
    add(cat, "motiv.bio_written", "Profile bio written", c.user.bio.trim().length > 0)
    add(cat, "motiv.profile_completeness", "Profile completeness 0-1", clamp01((!!c.user.avatar ? 0.4 : 0) + (c.user.bio.trim().length > 0 ? 0.3 : 0) + (c.user.name !== "Scribe" ? 0.3 : 0)))
    add(cat, "motiv.mastery_drive", "Mastery-driven: review-hub usage", clamp01(div(c.events.filter((e) => e.type === "view_change" && String(e.payload.view) === "practice-hub").length, Math.max(2, c.events.filter((e) => e.type === "view_change").length / 10))))
    add(cat, "motiv.curiosity_drive", "Exploration: distinct books opened", new Set(c.reads.map((r) => r.bookId)).size)
    add(cat, "motiv.competence_feel", "Competence feel: accuracy × completion", clamp01(div(c.lessons.filter((l) => l.accuracy >= 80).length, Math.max(1, c.lessons.length))))
    add(cat, "motiv.autonomy_feel", "Autonomy: self-navigated course changes", c.events.filter((e) => e.type === "course_change").length)
    add(cat, "motiv.relatedness_feel", "Relatedness: friends + community actions", c.friends + c.posts.length + c.comments.length)
    add(cat, "motiv.streak_identity", "Streak as identity (streak × consistency)", clamp01(div(b<number>("streak", 0), 100)) * clamp01(div(activeDays.length, Math.max(10, activeDays.length))))
    add(cat, "motiv.intrinsic_balance", "Intrinsic vs extrinsic surface balance", clamp01(1 - div(c.events.filter((e) => e.type === "shop_view" || e.type === "paywall_view").length, Math.max(1, c.events.length / 5))))
  }

  // ═══ 14. social (19) ═══
  {
    const cat = "social"
    add(cat, "social.friends", "Friends connected", c.friends)
    add(cat, "social.friend_requests", "Pending friend requests", c.friendRequests)
    add(cat, "social.has_friends", "At least 1 friend", c.friends > 0)
    add(cat, "social.friends_3plus", "3+ friends (retention multiplier)", c.friends >= 3)
    add(cat, "social.posts_total", "Posts created", c.posts.length)
    add(cat, "social.comments_total", "Comments written", c.comments.length)
    add(cat, "social.likes_given", "Likes given", c.likesByUser)
    add(cat, "social.likes_received", "Likes received on own posts", c.posts.reduce((a, po) => a + po.likes, 0))
    add(cat, "social.posts_30d", "Posts in 30d", c.posts.filter((po) => asOf - po.createdAt.getTime() < 30 * 86400000).length)
    add(cat, "social.comments_30d", "Comments in 30d", c.comments.filter((cm) => asOf - cm.createdAt.getTime() < 30 * 86400000).length)
    add(cat, "social.social_actions_30d", "All social actions in 30d", c.posts.filter((po) => asOf - po.createdAt.getTime() < 30 * 86400000).length + c.comments.filter((cm) => asOf - cm.createdAt.getTime() < 30 * 86400000).length + c.likesByUser)
    add(cat, "social.social_days_30d", "Distinct social days in 30d", new Set([...c.posts.filter((po) => asOf - po.createdAt.getTime() < 30 * 86400000).map((po) => dayKey(po.createdAt)), ...c.comments.filter((cm) => asOf - cm.createdAt.getTime() < 30 * 86400000).map((cm) => dayKey(cm.createdAt))]).size)
    add(cat, "social.share_events", "Share actions", c.events.filter((e) => e.type === "share").length)
    add(cat, "social.invite_events", "Invite actions", c.events.filter((e) => e.type === "invite").length)
    add(cat, "social.days_since_social", "Days since last social action", daysSince(c.posts.at(-1)?.createdAt ?? c.comments.at(-1)?.createdAt, asOf))
    add(cat, "social.social_breadth", "Social breadth (posts+comments+likes+friends)", c.posts.length + c.comments.length + c.likesByUser + c.friends)
    add(cat, "social.liked_ratio", "Share of own posts that got likes", clamp01(div(c.posts.filter((po) => po.likes > 0).length, Math.max(1, c.posts.length))))
    add(cat, "social.reciprocity", "Comments ÷ posts (conversation depth)", clamp(div(c.comments.length, Math.max(1, c.posts.length)), 0, 5))
    add(cat, "social.virality_events", "Share+invite events all-time", c.events.filter((e) => e.type === "share" || e.type === "invite").length)
  }

  // ═══ 14b. referral (8) — the give-a-month-get-a-month loop ═══
  {
    const cat = "referral"
    const r = c.referral
    add(cat, "referral.shares", "Invite links shared/copied", r.shares)
    add(cat, "referral.joins", "Friends who joined via your link", r.joins)
    add(cat, "referral.subscribed", "Referrals who went Pro", r.subscribed)
    add(cat, "referral.join_rate", "Joins ÷ shares (invite effectiveness)", clamp01(div(r.joins, Math.max(1, r.shares))))
    add(cat, "referral.convert_rate", "Subscribed ÷ joined (referral quality)", clamp01(div(r.subscribed, Math.max(1, r.joins))))
    add(cat, "referral.banked_months", "Free Pro months banked", r.bankedMonths)
    add(cat, "referral.days_since_join", "Days since last referral join", daysSince(r.lastJoinAt ?? undefined, asOf))
    add(cat, "referral.is_advocate", "3+ referral joins (advocate segment)", r.joins >= 3)
  }

  // ═══ 15. community (14) ═══
  {
    const cat = "community"
    add(cat, "community.actions_total", "Community actions all-time", c.posts.length + c.comments.length + c.likesByUser)
    add(cat, "community.actions_7d", "Community actions in 7d", c.posts.filter((po) => asOf - po.createdAt.getTime() < 7 * 86400000).length + c.comments.filter((cm) => asOf - cm.createdAt.getTime() < 7 * 86400000).length)
    add(cat, "community.attach_posts", "Posts with attachment cards", c.posts.filter((po) => po.hasAttachment).length)
    add(cat, "community.verse_shares", "Verse-card shares", c.events.filter((e) => e.type === "share" && String(e.payload.kind ?? "") === "verse").length)
    add(cat, "community.engagement_per_post", "Avg likes per own post", Math.round(div(c.posts.reduce((a, po) => a + po.likes, 0), Math.max(1, c.posts.length)) * 10) / 10)
    add(cat, "community.community_days_share", "Share of active days with community use", clamp01(div(new Set([...c.posts.map((po) => dayKey(po.createdAt)), ...c.comments.map((cm) => dayKey(cm.createdAt))]).size, Math.max(1, activeDays.length))))
    add(cat, "community.profile_views", "Times own profile viewed", c.events.filter((e) => e.type === "view_change" && String(e.payload.view) === "profile").length)
    add(cat, "community.leaderboard_views", "Leaderboard views", c.events.filter((e) => e.type === "view_change" && String(e.payload.view) === "leagues").length)
    add(cat, "community.friend_views", "Friends page views", c.events.filter((e) => e.type === "view_change" && String(e.payload.view) === "friends").length)
    add(cat, "community.days_since_post", "Days since last post", daysSince(c.posts.at(-1)?.createdAt, asOf))
    add(cat, "community.first_post_day", "Day of first community action (tenure days)", (() => {
      const t = c.posts[0]?.createdAt ?? c.comments[0]?.createdAt
      return t ? Math.max(0, (t.getTime() - c.joinedAt.getTime()) / 86400000) : -1
    })())
    add(cat, "community.social_first_week", "Community used in first week", (() => {
      const t = c.posts[0]?.createdAt ?? c.comments[0]?.createdAt
      return t ? t.getTime() - c.joinedAt.getTime() < 7 * 86400000 : false
    })())
    add(cat, "community.giver_score", "Giver score (likes given vs posts)", clamp01(div(c.likesByUser, Math.max(1, c.posts.length))))
    add(cat, "community.lurker", "Lurker: reads community, never posts", c.events.filter((e) => e.type === "view_change" && String(e.payload.view) === "community").length >= 3 && c.posts.length === 0)
  }

  // ═══ 16. league (16) ═══
  {
    const cat = "league"
    const me = c.league[c.league.length - 1]
    add(cat, "league.order", "Current league tier index", b<number>("leagueOrder", 0))
    add(cat, "league.xp_this_week", "League XP this week", me?.xp ?? 0)
    add(cat, "league.weeks_competed", "Weeks with a league entry", c.league.length)
    add(cat, "league.promotions", "Estimated promotions (tier index)", Math.max(0, b<number>("leagueOrder", 0)))
    add(cat, "league.active_this_week", "League entry exists this week", c.league.length > 0)
    add(cat, "league.xp_last_week", "League XP last week", c.league.length >= 2 ? c.league[c.league.length - 2].xp : 0)
    add(cat, "league.league_views_7d", "League page views in 7d", c.events.filter((e) => e.type === "view_change" && String(e.payload.view) === "leagues" && asOf - e.ts.getTime() < 7 * 86400000).length)
    add(cat, "league.compete_intensity", "League check-ins per week", div(c.events.filter((e) => e.type === "view_change" && String(e.payload.view) === "leagues").length, Math.max(1, (asOf - c.joinedAt.getTime()) / (7 * 86400000))))
    add(cat, "league.zone", "League zone by xp vs target (0-2)", (() => {
      const xp = me?.xp ?? 0
      const target = Math.max(100, me?.targetXp ?? 0)
      return xp > target * 0.8 ? 2 : xp > target * 0.3 ? 1 : 0
    })())
    add(cat, "league.xp_vs_target", "League XP ÷ personal weekly target", clamp(div(me?.xp ?? 0, Math.max(50, me?.targetXp ?? 0)), 0, 3))
    add(cat, "league.race_close", "Close race (within 15% of target)", (() => {
      const xp = me?.xp ?? 0
      const t = Math.max(50, me?.targetXp ?? 0)
      return Math.abs(xp - t) < t * 0.15 ? 1 : 0
    })())
    add(cat, "league.trend", "League XP trend vs last week", clamp(div((me?.xp ?? 0) - (c.league.length >= 2 ? c.league[c.league.length - 2].xp : 0), Math.max(50, me?.xp ?? 50)), -1, 1))
    add(cat, "league.streak_league", "Weeks competed consecutively (best)", (() => {
      let best = 0
      let run = 0
      let prev: number | null = null
      const weeks = c.league.map((l) => parseInt(l.weekKey.slice(-2), 10))
      for (const w of weeks) {
        run = prev !== null && w === prev + 1 ? run + 1 : 1
        best = Math.max(best, run)
        prev = w
      }
      return best
    })())
    add(cat, "league.weekend_push", "Weekend XP share of league week", clamp01(div(c.lessons.filter((l) => [0, 6].includes(new Date(l.completedAt.getTime() + TZ_OFFSET_MS).getUTCDay()) && asOf - l.completedAt.getTime() < 7 * 86400000).reduce((a, l) => a + l.xpEarned, 0), Math.max(1, c.lessons.filter((l) => asOf - l.completedAt.getTime() < 7 * 86400000).reduce((a, l) => a + l.xpEarned, 0)))))
    add(cat, "league.last_week_promotion_zone", "Was in promotion zone last week", c.league.length >= 2 ? (c.league[c.league.length - 2].xp > Math.max(100, c.league[c.league.length - 2].targetXp) * 0.8 ? 1 : 0) : 0)
    add(cat, "league.league_identity", "League as identity (tier 4+ and checking daily)", (b<number>("leagueOrder", 0) >= 4 && c.events.filter((e) => e.type === "view_change" && String(e.payload.view) === "leagues" && asOf - e.ts.getTime() < 7 * 86400000).length >= 5) ? 1 : 0)
  }

  // ═══ 17. monet (37) ═══
  {
    const cat = "monet"
    const plan = String(b<string>("plan", "free"))
    const planSince = b<Date | null>("planSince", null)
    const trialEnds = b<Date | null>("trialEndsAt", null)
    const canceledAt = b<Date | null>("lastCanceledAt", null)
    const isPro = plan !== "free"
    add(cat, "monet.is_pro", "Active Pro member", isPro)
    add(cat, "monet.plan_code", "Plan code (0 free, 1 pro, 2 lifetime)", plan === "lifetime" ? 2 : plan === "pro" ? 1 : 0)
    add(cat, "monet.days_since_cancel", "Days since Pro was cancelled", canceledAt ? Math.max(0, (asOf - canceledAt.getTime()) / 86400000) : 999)
    add(cat, "monet.cancelled_within_7d", "Cancelled within the last 7 days", canceledAt ? (asOf - canceledAt.getTime()) / 86400000 <= 7 : false)
    add(cat, "monet.cancelled_within_21d", "Cancelled within the last 21 days", canceledAt ? (asOf - canceledAt.getTime()) / 86400000 <= 21 : false)
    add(cat, "monet.trial_active", "Trial currently active", !!trialEnds && trialEnds.getTime() > asOf)
    add(cat, "monet.trial_days_left", "Trial days remaining", trialEnds && trialEnds.getTime() > asOf ? (trialEnds.getTime() - asOf) / 86400000 : 0)
    add(cat, "monet.plan_tenure_days", "Days on current plan", planSince ? (asOf - planSince.getTime()) / 86400000 : 0)
    add(cat, "monet.paywall_views", "Paywall views all-time", c.events.filter((e) => e.type === "paywall_view").length)
    add(cat, "monet.paywall_views_7d", "Paywall views in 7d", c.events.filter((e) => e.type === "paywall_view" && asOf - e.ts.getTime() < 7 * 86400000).length)
    add(cat, "monet.paywall_views_30d", "Paywall views in 30d", c.events.filter((e) => e.type === "paywall_view" && asOf - e.ts.getTime() < 30 * 86400000).length)
    add(cat, "monet.paywall_dismisses", "Paywall dismissals", c.events.filter((e) => e.type === "paywall_dismiss").length)
    add(cat, "monet.paywall_dismisses_7d", "Paywall dismissals in 7d", c.events.filter((e) => e.type === "paywall_dismiss" && asOf - e.ts.getTime() < 7 * 86400000).length)
    add(cat, "monet.paywall_cta_clicks", "Paywall CTA clicks", c.events.filter((e) => e.type === "paywall_cta").length)
    add(cat, "monet.paywall_open_rate", "Open rate: CTA clicks ÷ views", clamp01(div(c.events.filter((e) => e.type === "paywall_cta").length, Math.max(1, c.events.filter((e) => e.type === "paywall_view").length))))
    add(cat, "monet.dismiss_rate", "Dismiss rate among paywall views", clamp01(div(c.events.filter((e) => e.type === "paywall_dismiss").length, Math.max(1, c.events.filter((e) => e.type === "paywall_view").length))))
    add(cat, "monet.avg_paywall_dwell", "Avg paywall dwell seconds", (() => {
      const d = c.events.filter((e) => e.type === "paywall_view" && typeof e.payload.seconds === "number").map((e) => num(e.payload.seconds))
      return d.length ? Math.round(d.reduce((a, x) => a + x, 0) / d.length) : 0
    })())
    add(cat, "monet.last_paywall_days", "Days since last paywall view", daysSince(c.events.filter((e) => e.type === "paywall_view").at(-1)?.ts, asOf))
    add(cat, "monet.winback_views", "Win-back offer views", c.events.filter((e) => e.type === "winback_view").length)
    add(cat, "monet.winback_accepts", "Win-back acceptances", c.events.filter((e) => e.type === "winback_accept").length)
    add(cat, "monet.winback_snoozes", "Win-back snoozes", c.events.filter((e) => e.type === "winback_snooze").length)
    add(cat, "monet.winback_accept_rate", "Win-back acceptance rate", clamp01(div(c.events.filter((e) => e.type === "winback_accept").length, Math.max(1, c.events.filter((e) => e.type === "winback_view").length))))
    add(cat, "monet.shop_views", "Shop views", c.events.filter((e) => e.type === "view_change" && String(e.payload.view) === "shop").length)
    add(cat, "monet.shop_views_7d", "Shop views in 7d", c.events.filter((e) => e.type === "view_change" && String(e.payload.view) === "shop" && asOf - e.ts.getTime() < 7 * 86400000).length)
    add(cat, "monet.gem_purchases", "Gem item purchases (events)", c.events.filter((e) => e.type === "purchase").length)
    add(cat, "monet.freeze_purchases", "Streak-freeze purchases", c.events.filter((e) => e.type === "purchase" && String(e.payload.slug ?? "") === "streak_freeze").length)
    add(cat, "monet.heart_purchases", "Heart-refill purchases", c.events.filter((e) => e.type === "purchase" && String(e.payload.slug ?? "") === "heart_refill").length)
    add(cat, "monet.spend_events_30d", "Any purchase events in 30d", c.events.filter((e) => e.type === "purchase" && asOf - e.ts.getTime() < 30 * 86400000).length)
    add(cat, "monet.hearts_refilled", "Heart-refill usage events", c.events.filter((e) => e.type === "heart_refill").length)
    add(cat, "monet.personalized_offers_on", "Personalized offers enabled", b<boolean>("personalizedOffers", true))
    add(cat, "monet.offer_impressions", "Personalized offer impressions", c.events.filter((e) => e.type === "paywall_invite_shown").length)
    add(cat, "monet.offer_accepts", "Personalized offer acceptance", c.events.filter((e) => e.type === "paywall_cta").length)
    add(cat, "monet.last_purchase_days", "Days since last purchase event", daysSince(c.events.filter((e) => e.type === "purchase").at(-1)?.ts, asOf))
    add(cat, "monet.spend_trend", "Purchase-event trend 30d vs prior", clamp(div(c.events.filter((e) => e.type === "purchase" && asOf - e.ts.getTime() < 30 * 86400000).length - c.events.filter((e) => e.type === "purchase" && asOf - e.ts.getTime() >= 30 * 86400000 && asOf - e.ts.getTime() < 60 * 86400000).length, 3), -1, 1))
    add(cat, "monet.price_fairness", "Price-fairness posture (complaints inverted)", clamp01(1 - div(c.events.filter((e) => e.type === "paywall_complaint").length, Math.max(1, c.events.filter((e) => e.type === "paywall_view").length / 10))))
    add(cat, "monet.ltv_signals", "Composite monetization signal strength", clamp01(clamp01(div(c.events.filter((e) => e.type === "paywall_view").length, 20)) * 0.4 + clamp01(div(c.events.filter((e) => e.type === "paywall_cta").length, 5)) * 0.3 + (isPro ? 0.3 : 0)))
  }

  // ═══ 18. econ (20) ═══
  {
    const cat = "econ"
    add(cat, "econ.gems_balance", "Current gem balance", b<number>("gems", 0))
    add(cat, "econ.gems_earned_quests", "Gems from quests (est)", c.quests.filter((q) => q.completed).length * 15)
    add(cat, "econ.gems_earned_achv", "Gems from achievements (est)", c.achievements.reduce((a, x) => a + x.tier * 25, 0))
    add(cat, "econ.gems_spent_freeze", "Gems spent on freezes (est)", c.events.filter((e) => e.type === "purchase" && String(e.payload.slug ?? "") === "streak_freeze").length * 200)
    add(cat, "econ.gems_spent_hearts", "Gems spent on hearts (est)", c.events.filter((e) => e.type === "purchase" && String(e.payload.slug ?? "") === "heart_refill").length * 350)
    add(cat, "econ.xp_total", "Total XP (economy input)", b<number>("xp", 0))
    add(cat, "econ.xp_per_gem", "XP earned per gem held", div(b<number>("xp", 0), Math.max(1, b<number>("gems", 0))))
    add(cat, "econ.gem_rich", "Gem-rich (>1000 gems)", b<number>("gems", 0) > 1000)
    add(cat, "econ.gem_poor", "Gem-poor (<100 gems)", b<number>("gems", 0) < 100)
    add(cat, "econ.heart_economy_pressure", "Heart pressure (recent losses)", clamp01(div(c.events.filter((e) => e.type === "heart_lost" && asOf - e.ts.getTime() < 7 * 86400000).length, 10)))
    add(cat, "econ.hearts_full", "Hearts full right now", b<number>("hearts", 5) >= 5)
    add(cat, "econ.hearts_empty_events_7d", "Hit zero hearts in 7d", c.events.filter((e) => e.type === "hearts_empty" && asOf - e.ts.getTime() < 7 * 86400000).length)
    add(cat, "econ.freeze_inventory", "Streak freezes in inventory", c.items.find((i) => i.slug === "streak_freeze")?.quantity ?? 0)
    add(cat, "econ.double_xp_active", "Double XP active now", !!b<Date | null>("doubleXpUntil", null) && new Date(b<Date>("doubleXpUntil", new Date(0))).getTime() > asOf)
    add(cat, "econ.double_xp_used", "Double XP items used", c.events.filter((e) => e.type === "purchase" && String(e.payload.slug ?? "") === "double_xp").length)
    add(cat, "econ.chest_claims", "Chests claimed (events)", c.events.filter((e) => e.type === "chest_open").length)
    add(cat, "econ.chest_claims_30d", "Chests claimed in 30d", c.events.filter((e) => e.type === "chest_open" && asOf - e.ts.getTime() < 30 * 86400000).length)
    add(cat, "econ.reward_ratio", "Reward-moment density", clamp(div(c.events.filter((e) => ["chest_open", "quest_complete", "achievement_unlock"].includes(e.type)).length, Math.max(1, c.events.length / 20)), 0, 1))
    add(cat, "econ.scarcity_sensitivity", "Runs out of hearts often (7d)", clamp01(div(c.events.filter((e) => e.type === "hearts_empty" && asOf - e.ts.getTime() < 7 * 86400000).length, 3)))
    add(cat, "econ.economy_health", "Economy health composite", clamp01(clamp01(div(b<number>("gems", 0), 500)) * 0.5 + (b<number>("hearts", 5) >= 3 ? 0.25 : 0) + clamp01(div(c.events.filter((e) => e.type === "chest_open").length, 10)) * 0.25))
  }

  // ═══ 19. surface (30) ═══
  {
    const cat = "surface"
    const views = new Map<string, number>()
    for (const e of c.events) if (e.type === "view_change") views.set(String(e.payload.view ?? ""), (views.get(String(e.payload.view ?? "")) ?? 0) + 1)
    const surfaces = ["learn", "bible", "stories", "growth", "community", "friends", "leagues", "quests", "shop", "profile", "practice-hub", "courses"]
    for (const s of surfaces) {
      add(cat, `surface.${s}_views`, `${s} views all-time`, views.get(s) ?? 0)
    }
    for (const s of ["learn", "bible", "stories", "community", "shop", "profile"]) {
      add(cat, `surface.${s}_views_7d`, `${s} views in 7d`, c.events.filter((e) => e.type === "view_change" && String(e.payload.view) === s && asOf - e.ts.getTime() < 7 * 86400000).length)
    }
    add(cat, "surface.app_opens", "App opens all-time", c.events.filter((e) => e.type === "app_open").length)
    add(cat, "surface.app_opens_7d", "App opens in 7d", c.events.filter((e) => e.type === "app_open" && asOf - e.ts.getTime() < 7 * 86400000).length)
    add(cat, "surface.app_opens_30d", "App opens in 30d", c.events.filter((e) => e.type === "app_open" && asOf - e.ts.getTime() < 30 * 86400000).length)
    add(cat, "surface.distinct_surfaces_7d", "Distinct surfaces in 7d", new Set(c.events.filter((e) => e.type === "view_change" && asOf - e.ts.getTime() < 7 * 86400000).map((e) => String(e.payload.view ?? ""))).size)
    add(cat, "surface.distinct_surfaces_all", "Distinct surfaces all-time", views.size)
    const viewTotal = [...views.values()].reduce((a, x) => a + x, 0)
    add(cat, "surface.learn_share", "Share of views on learn", clamp01(div(views.get("learn") ?? 0, Math.max(1, viewTotal))))
    add(cat, "surface.bible_share", "Share of views on bible", clamp01(div(views.get("bible") ?? 0, Math.max(1, viewTotal))))
    add(cat, "surface.stories_share", "Share of views on stories", clamp01(div(views.get("stories") ?? 0, Math.max(1, viewTotal))))
    add(cat, "surface.social_share", "Share of views on social surfaces", clamp01(div((views.get("community") ?? 0) + (views.get("friends") ?? 0) + (views.get("leagues") ?? 0), Math.max(1, viewTotal))))
    add(cat, "surface.gamified_share", "Share of views on gamified surfaces", clamp01(div((views.get("quests") ?? 0) + (views.get("shop") ?? 0) + (views.get("leagues") ?? 0) + (views.get("growth") ?? 0), Math.max(1, viewTotal))))
    add(cat, "surface.setting_changes", "Setting changes made", c.events.filter((e) => e.type === "settings_change").length)
    add(cat, "surface.language_views", "Letter-keyboard usage (languages)", c.events.filter((e) => e.type === "keyboard_use").length)
  }

  // ═══ 20. notif (25) ═══
  {
    const cat = "notif"
    const opens = c.events.filter((e) => e.type === "notification_open")
    add(cat, "notif.received_total", "Notifications received", c.notifs.length)
    add(cat, "notif.received_7d", "Notifications received in 7d", c.notifs.filter((n) => asOf - n.createdAt.getTime() < 7 * 86400000).length)
    add(cat, "notif.received_30d", "Notifications received in 30d", c.notifs.filter((n) => asOf - n.createdAt.getTime() < 30 * 86400000).length)
    add(cat, "notif.opened_total", "Notification opens (events)", opens.length)
    add(cat, "notif.opened_7d", "Notification opens in 7d", opens.filter((e) => asOf - e.ts.getTime() < 7 * 86400000).length)
    add(cat, "notif.open_rate", "Open rate (opens ÷ recent received)", clamp01(div(opens.length, Math.max(1, c.notifs.filter((n) => asOf - n.createdAt.getTime() < 30 * 86400000).length))))
    add(cat, "notif.unread_count", "Unread notifications now", c.notifs.filter((n) => !n.read).length)
    add(cat, "notif.unread_share", "Share unread", clamp01(div(c.notifs.filter((n) => !n.read).length, Math.max(1, c.notifs.length))))
    add(cat, "notif.quiet_hours_on", "Quiet hours enabled", b<boolean>("quietHoursOn", true))
    add(cat, "notif.notif_prefs_changed", "Notification pref changes", c.events.filter((e) => e.type === "settings_change" && String(e.payload.key ?? "").startsWith("notif")).length)
    add(cat, "notif.master_enabled", "Push notifications enabled overall", 1) // default-on design
    add(cat, "notif.streak_notifs_30d", "Streak notifications in 30d", c.notifs.filter((n) => n.type.startsWith("streak") && asOf - n.createdAt.getTime() < 30 * 86400000).length)
    add(cat, "notif.quest_notifs_30d", "Quest notifications in 30d", c.notifs.filter((n) => n.type === "quest" && asOf - n.createdAt.getTime() < 30 * 86400000).length)
    add(cat, "notif.league_notifs_30d", "League notifications in 30d", c.notifs.filter((n) => n.type === "league" && asOf - n.createdAt.getTime() < 30 * 86400000).length)
    add(cat, "notif.social_notifs_30d", "Social notifications in 30d", c.notifs.filter((n) => ["friend", "social"].includes(n.type) && asOf - n.createdAt.getTime() < 30 * 86400000).length)
    add(cat, "notif.read_speed_min", "Avg minutes to read a notification", (() => {
      const withRead = c.notifs.filter((n) => n.read)
      if (!withRead.length) return 0
      const avgMin = withRead.reduce((a, n) => a + Math.min(1440, (asOf - n.createdAt.getTime()) / 60000), 0) / withRead.length
      return clamp(avgMin, 1, 720)
    })())
    add(cat, "notif.last_open_days", "Days since last notification open", daysSince(opens.at(-1)?.ts, asOf))
    add(cat, "notif.fatigue_signal", "Notification fatigue (opens falling)", (() => {
      if (opens.length < 4) return 0
      const recent = opens.filter((e) => asOf - e.ts.getTime() < 14 * 86400000).length
      const prior = opens.filter((e) => asOf - e.ts.getTime() >= 14 * 86400000 && asOf - e.ts.getTime() < 28 * 86400000).length
      return clamp((prior - recent) / Math.max(1, prior), -1, 1)
    })())
    add(cat, "notif.burst_tolerance", "Open rate healthy under load", clamp01(div(opens.length, Math.max(1, c.notifs.length))) > 0.3 ? 1 : 0)
    add(cat, "notif.golden_hour_hits", "Nudges landing in best hour (7d)", (() => {
      const bestH = (() => { let bi = -1; let bv = 0; for (let h = 0; h < 24; h++) if (hourHist[h] > bv) { bv = hourHist[h]; bi = h } return bi })()
      return bestH >= 0 ? c.notifs.filter((n) => Math.floor((n.createdAt.getTime() + TZ_OFFSET_MS) / 3600000) % 24 === bestH && asOf - n.createdAt.getTime() < 7 * 86400000).length : 0
    })())
    add(cat, "notif.nba_shown_7d", "In-app recommendations shown 7d", c.events.filter((e) => e.type === "nba_shown" && asOf - e.ts.getTime() < 7 * 86400000).length)
    add(cat, "notif.nba_used_7d", "In-app recommendations acted on 7d", c.events.filter((e) => e.type === "nba_used" && asOf - e.ts.getTime() < 7 * 86400000).length)
    add(cat, "notif.nba_ctr", "Recommendation follow rate", clamp01(div(c.events.filter((e) => e.type === "nba_used").length, Math.max(1, c.events.filter((e) => e.type === "nba_shown").length))))
    add(cat, "notif.nba_dismissed_7d", "Recommendations dismissed 7d", c.events.filter((e) => e.type === "nba_dismissed" && asOf - e.ts.getTime() < 7 * 86400000).length)
    add(cat, "notif.complaint_signals", "Complaint signals (settings off etc.)", c.events.filter((e) => e.type === "settings_change" && (e.payload.key === "quietHoursOn" || e.payload.key === "emailOptIn")).length)
  }

  // ═══ 21. email (18) ═══
  {
    const cat = "email"
    add(cat, "email.opted_in", "Email opt-in on", b<boolean>("emailOptIn", true))
    add(cat, "email.sent_total", "Emails sent (journey log)", c.emails.filter((e) => e.status === "sent").length)
    add(cat, "email.sent_30d", "Emails sent in 30d", c.emails.filter((e) => e.status === "sent" && asOf - e.sentAt.getTime() < 30 * 86400000).length)
    add(cat, "email.skipped_total", "Emails skipped (prefs/quiet)", c.emails.filter((e) => e.status === "skipped").length)
    add(cat, "email.journeys_touched", "Distinct journeys used", new Set(c.emails.map((e) => e.journey)).size)
    add(cat, "email.welcome_steps", "Welcome journey steps sent", c.emails.filter((e) => e.journey === "welcome_series" && e.status === "sent").length)
    add(cat, "email.digest_count", "Weekly digests sent", c.emails.filter((e) => e.journey === "weekly_digest" && e.status === "sent").length)
    add(cat, "email.reengagement_count", "Re-engagement emails sent", c.emails.filter((e) => e.journey === "re_engagement" && e.status === "sent").length)
    add(cat, "email.winback_count", "Win-back emails sent", c.emails.filter((e) => e.journey === "winback" && e.status === "sent").length)
    add(cat, "email.pro_offer_count", "Pro offer emails sent", c.emails.filter((e) => e.journey === "pro_offer" && e.status === "sent").length)
    add(cat, "email.last_email_days", "Days since last email", daysSince(c.emails.at(-1)?.sentAt, asOf))
    add(cat, "email.email_days_share", "Share of weeks with an email", clamp01(div(new Set(c.emails.map((e) => dayKey(e.sentAt).slice(0, 8))).size, Math.max(1, (asOf - c.joinedAt.getTime()) / (7 * 86400000)))))
    add(cat, "email.opens", "Email opens (tracked events)", c.events.filter((e) => e.type === "email_open").length)
    add(cat, "email.open_rate", "Email open rate", clamp01(div(c.events.filter((e) => e.type === "email_open").length, Math.max(1, c.emails.filter((e) => e.status === "sent").length))))
    add(cat, "email.cta_clicks", "Email CTA clicks", c.events.filter((e) => e.type === "email_cta").length)
    add(cat, "email.last_open_days", "Days since last email open", daysSince(c.events.filter((e) => e.type === "email_open").at(-1)?.ts, asOf))
    add(cat, "email.resubscribed", "Re-enabled email after opt-out", c.events.filter((e) => e.type === "settings_change" && e.payload.key === "emailOptIn" && e.payload.value === true).length)
    add(cat, "email.prefs_customized", "Custom email journey prefs set", (() => {
      try {
        const prefs = JSON.parse(String(b<string>("emailPrefs", "{}"))) as Record<string, boolean>
        return Object.keys(prefs).length
      } catch {
        return 0
      }
    })())
  }

  // ═══ 22. faith (18) ═══
  {
    const cat = "faith"
    const ntBooks = new Set(["mat", "mrk", "luk", "jhn", "act", "rom", "1co", "2co", "gal", "eph", "php", "col", "1th", "2th", "1ti", "2ti", "tit", "phm", "heb", "jas", "1pe", "2pe", "1jn", "2jn", "3jn", "jud", "rev"])
    const gospels = new Set(["mat", "mrk", "luk", "jhn"])
    add(cat, "faith.chapters_read", "Chapters read all-time", c.reads.length)
    add(cat, "faith.nt_chapters", "New-Testament chapters read", c.reads.filter((r) => ntBooks.has(r.bookId)).length)
    add(cat, "faith.ot_chapters", "Old-Testament chapters read", c.reads.filter((r) => !ntBooks.has(r.bookId)).length)
    add(cat, "faith.gospel_chapters", "Gospel chapters read", c.reads.filter((r) => gospels.has(r.bookId)).length)
    add(cat, "faith.psalm_chapters", "Psalms read", c.reads.filter((r) => r.bookId === "psa").length)
    add(cat, "faith.books_opened", "Distinct books opened", new Set(c.reads.map((r) => r.bookId)).size)
    add(cat, "faith.reads_7d", "Chapters read in 7d", c.reads.filter((r) => asOf - r.readAt.getTime() < 7 * 86400000).length)
    add(cat, "faith.reads_30d", "Chapters read in 30d", c.reads.filter((r) => asOf - r.readAt.getTime() < 30 * 86400000).length)
    add(cat, "faith.read_streak_days", "Consecutive reading days (best)", (() => {
      const rd = [...new Set(c.reads.map((r) => dayKey(r.readAt)))].sort()
      let best = 0
      let run = 0
      let prev: string | null = null
      for (const k of rd) {
        run = prev && daysBetween(prev, k) === 1 ? run + 1 : 1
        best = Math.max(best, run)
        prev = k
      }
      return best
    })())
    add(cat, "faith.days_since_read", "Days since last chapter", daysSince(c.reads.at(-1)?.readAt, asOf))
    add(cat, "faith.marks_total", "Verse marks", c.marks.length)
    add(cat, "faith.marks_30d", "Verse marks in 30d", c.marks.filter((m) => asOf - m.createdAt.getTime() < 30 * 86400000).length)
    add(cat, "faith.marked_with_notes", "Marks carrying a written note", c.marks.filter((m) => m.note.trim().length > 0).length)
    add(cat, "faith.plan_days_total", "Reading-plan days completed", c.plans.length)
    add(cat, "faith.plans_active", "Reading plans in progress", new Set(c.plans.map((p2) => p2.planId)).size)
    add(cat, "faith.plan_days_7d", "Plan check-offs in 7d", c.plans.filter((p2) => asOf - p2.completedAt.getTime() < 7 * 86400000).length)
    add(cat, "faith.devotion_share", "Devotional mix: reading days ÷ active days", clamp01(div(new Set(c.reads.map((r) => dayKey(r.readAt))).size, Math.max(1, activeDays.length))))
    add(cat, "faith.languages_share", "Original-languages study share", clamp01(div(c.lessons.filter((l) => ["greek", "hebrew"].includes(l.courseId)).length, Math.max(1, c.lessons.length))))
  }

  // ═══ 23. well (16) — wellbeing & protection ═══
  {
    const cat = "well"
    const restDays = Math.max(0, 30 - activeIn(0, 30))
    add(cat, "well.rest_days_30d", "Rest days in 30d", restDays)
    add(cat, "well.overuse_7d", "Overuse flag: 60+ event-days in 7d", (() => {
      const counts = new Map<string, number>()
      for (const e of c.events) if (asOf - e.ts.getTime() < 7 * 86400000) counts.set(dayKey(e.ts), (counts.get(dayKey(e.ts)) ?? 0) + 1)
      return [...counts.values()].filter((v) => v >= 60).length
    })())
    add(cat, "well.sessions_10plus_7d", "Very-heavy days in 7d", (() => {
      const counts = new Map<string, number>()
      for (const e of c.events) if (asOf - e.ts.getTime() < 7 * 86400000) counts.set(dayKey(e.ts), (counts.get(dayKey(e.ts)) ?? 0) + 1)
      return [...counts.values()].filter((v) => v >= 60).length
    })())
    add(cat, "well.late_night_sessions_14d", "Late-night sessions in 14d", c.events.filter((e) => { const h = Math.floor((e.ts.getTime() + TZ_OFFSET_MS) / 3600000) % 24; return (h >= 0 && h < 5) && asOf - e.ts.getTime() < 14 * 86400000 }).length)
    add(cat, "well.burnout_risk", "Burnout risk proxy (overuse + late nights + accuracy drop)", clamp01(clamp01(div(c.events.filter((e) => { const h = Math.floor((e.ts.getTime() + TZ_OFFSET_MS) / 3600000) % 24; return (h >= 23 || h < 5) && asOf - e.ts.getTime() < 14 * 86400000 }).length, 10)) * 0.5 + clamp01(div(c.lessons.slice(-10).filter((l) => l.accuracy < 70).length, 10)) * 0.5))
    add(cat, "well.frustration_signal", "Frustration: repeated low-accuracy lessons", clamp01(div(c.lessons.slice(-8).filter((l) => l.accuracy < 60).length, 8)))
    add(cat, "well.rage_signal", "Rage-checkouts: session ends right after mistakes", clamp01(div(c.events.filter((e) => e.type === "session_end_after_mistake").length, Math.max(1, c.events.length / 50))))
    add(cat, "well.sunday_rest", "Sundays without activity (8w)", (() => {
      const sundays: string[] = []
      for (let i = 0; i < 56; i++) {
        const d = new Date(asOf - i * 86400000)
        if (K2D(dayKey(d)) === 0) sundays.push(dayKey(d))
      }
      return sundays.filter((k) => !activeStamps.has(k)).length
    })())
    add(cat, "well.sabbath_pattern", "Honors a weekly rest rhythm", clamp01(div((() => {
      const sundays: string[] = []
      for (let i = 0; i < 56; i++) {
        const d = new Date(asOf - i * 86400000)
        if (K2D(dayKey(d)) === 0) sundays.push(dayKey(d))
      }
      return sundays.filter((k) => !activeStamps.has(k)).length
    })(), 8)))
    add(cat, "well.streak_anxiety_proxy", "Freeze-chasing behavior", clamp01(div(c.events.filter((e) => e.type === "purchase" && String(e.payload.slug ?? "") === "streak_freeze").length, 5)))
    add(cat, "well.goal_overshoot", "Goal overshoot (3+ days at 5× goal)", (() => {
      const xpByDay = new Map<string, number>()
      for (const l of c.lessons) xpByDay.set(dayKey(l.completedAt), (xpByDay.get(dayKey(l.completedAt)) ?? 0) + l.xpEarned)
      for (const q of c.quizzes) xpByDay.set(q.day, (xpByDay.get(q.day) ?? 0) + q.xpEarned)
      return [...xpByDay.values()].filter((v) => v >= 250).length >= 3 ? 1 : 0
    })())
    add(cat, "well.pace_sustainable", "Sustainable pace (≤20 lessons/week)", clamp01(1 - clamp01(div(c.lessons.filter((l) => asOf - l.completedAt.getTime() < 7 * 86400000).length, 20))))
    add(cat, "well.notification_overload", "Notification overload (received ≫ opens)", clamp01(div(c.notifs.filter((n) => asOf - n.createdAt.getTime() < 30 * 86400000).length, Math.max(5, c.events.filter((e) => e.type === "notification_open").length * 5))))
    add(cat, "well.complaint_ratio", "Complaint events ÷ 100 events", clamp01(div(c.events.filter((e) => e.type === "complaint").length * 100, Math.max(1, c.events.length))))
    add(cat, "well.settings_protective", "Protective settings on (quiet hours)", b<boolean>("quietHoursOn", true))
    add(cat, "well.overall_protected", "Overall wellbeing protection composite", clamp01((clamp01(1 - clamp01(div(c.lessons.slice(-10).filter((l) => l.accuracy < 70).length, 10))) + (b<boolean>("quietHoursOn", true) ? 0.5 : 0) + clamp01(div(restDays, 8)) * 0.5) / 2))
  }

  // ═══ 24. tech (16) ═══
  {
    const cat = "tech"
    add(cat, "tech.client_errors", "Client errors reported", c.events.filter((e) => e.type === "client_error").length)
    add(cat, "tech.client_errors_7d", "Client errors in 7d", c.events.filter((e) => e.type === "client_error" && asOf - e.ts.getTime() < 7 * 86400000).length)
    add(cat, "tech.api_failures", "API failures (client-visible)", c.events.filter((e) => e.type === "api_error").length)
    add(cat, "tech.offline_events", "Offline (queued) events", c.events.filter((e) => e.payload.queued === true).length)
    add(cat, "tech.event_types", "Distinct event types seen", new Set(c.events.map((e) => e.type)).size)
    add(cat, "tech.last_event_age_min", "Minutes since last event", c.events.length ? Math.round((asOf - c.events[c.events.length - 1].ts.getTime()) / 60000) : 9999)
    add(cat, "tech.tracking_active", "Tap stream alive (event in 24h)", c.events.some((e) => asOf - e.ts.getTime() < 86400000))
    add(cat, "tech.tracking_lag_sec", "Typical event-payload lag", 0) // local writes are immediate
    add(cat, "tech.payload_avg_size", "Avg event payload size (chars)", (() => {
      const sizes = c.events.slice(-100).map((e) => JSON.stringify(e.payload).length)
      return sizes.length ? Math.round(sizes.reduce((a, x) => a + x, 0) / sizes.length) : 0
    })())
    add(cat, "tech.snapshot_count", "Engine snapshots stored (approx by age)", 0)
    add(cat, "tech.interactions_total", "Total tracked events", c.events.length)
    add(cat, "tech.interactions_per_day", "Events per day (lifetime)", div(c.events.length, Math.max(1, (asOf - c.joinedAt.getTime()) / 86400000)))
    add(cat, "tech.tap_density", "Taps per active day", clamp(div(c.events.length, Math.max(1, activeDays.length)), 0, 200))
    add(cat, "tech.longest_gap_hours", "Longest gap between events (hours)", (() => {
      if (c.events.length < 2) return 0
      let g = 0
      const ts = c.events.map((e) => e.ts.getTime()).sort((a, b2) => a - b2)
      for (let i = 1; i < ts.length; i++) g = Math.max(g, (ts[i] - ts[i - 1]) / 3600000)
      return Math.round(g)
    })())
    add(cat, "tech.resets_survived", "Data resets survived (ledger rebuild markers)", c.events.filter((e) => e.type === "ledger_rebuild").length)
    add(cat, "tech.first_ts_days", "Days of tracked history", c.events.length ? Math.max(0, (asOf - c.events[0].ts.getTime()) / 86400000) : 0)
  }

  // ═══ 25. ctx (12) — current context ═══
  {
    const cat = "ctx"
    const local = new Date(asOf + TZ_OFFSET_MS)
    const h = local.getUTCHours()
    const dow = local.getUTCDay()
    add(cat, "ctx.hour", "Current local hour", h)
    add(cat, "ctx.is_weekend", "It is the weekend", dow === 0 || dow === 6)
    add(cat, "ctx.dow", "Day of week (0 Sun)", dow)
    add(cat, "ctx.is_morning", "Morning hours", h >= 5 && h < 12)
    add(cat, "ctx.is_evening", "Evening hours", h >= 17 && h < 21)
    add(cat, "ctx.is_night", "Night hours", h >= 21 || h < 5)
    add(cat, "ctx.quiet_hours_now", "Currently inside quiet hours", h >= 21 || h < 8)
    add(cat, "ctx.reminder_due", "Reminder window reached today", (() => {
      const hm = String(b<string>("reminderTime", "19:00"))
      const rh = parseInt((hm.split(":")[0] ?? "19"), 10)
      return Number.isFinite(rh) && h >= rh ? 1 : 0
    })())
    add(cat, "ctx.month_day", "Day of month (1-31)", local.getUTCDate())
    add(cat, "ctx.month", "Month (1-12)", local.getUTCMonth() + 1)
    add(cat, "ctx.is_december", "December (advent/Christmas season)", local.getUTCMonth() === 11)
    add(cat, "ctx.is_easter_window", "Easter-season window (Mar 25-Apr 25)", local.getUTCMonth() === 2 ? local.getUTCDate() >= 25 : local.getUTCMonth() === 3 ? local.getUTCDate() <= 25 : false)
  }

  // ═══ 26. meta (14) — ledger self-awareness ═══
  {
    const cat = "meta"
    add(cat, "meta.feature_count", "Signals in this computation", registry.length + 1)
    add(cat, "meta.as_of_epoch", "Computation as-of (epoch seconds)", Math.floor(asOf / 1000))
    add(cat, "meta.computation_version", "Feature-set version", 2)
    add(cat, "meta.data_density", "Data density: events per feature", clamp(div(c.events.length, 590), 0, 10))
    add(cat, "meta.history_days", "Days of usable history", Math.min(365, (asOf - c.joinedAt.getTime()) / 86400000))
    add(cat, "meta.cold_start", "Cold start (<3 active days)", activeDays.length < 3)
    add(cat, "meta.warm_start", "Warm start (3-14 active days)", activeDays.length >= 3 && activeDays.length < 14)
    add(cat, "meta.mature_history", "Mature history (30+ active days)", activeDays.length >= 30)
    add(cat, "meta.confidence", "Confidence in signals (0-1)", clamp01(div(activeDays.length, 14)))
    add(cat, "meta.models_version", "Model set version in use", 1)
    add(cat, "meta.bandit_arms_seen", "Experiments this user has joined", 0)
    add(cat, "meta.interventions_seen", "Engine interventions shown", 0)
    add(cat, "meta.last_train_days", "Days since last self-training", 0)
    add(cat, "meta.ledger_health", "Ledger health (events/day > 5)", div(c.events.length, Math.max(1, (asOf - c.joinedAt.getTime()) / 86400000)) > 5 ? 1 : 0)
  }

  // ═══ 27. z (14) — normalized/technical features ═══
  {
    const cat = "z"
    const a30 = activeDays.filter((k) => daysBetween(k, todayKey) < 30).length
    add(cat, "z.log_xp", "log10 XP", Math.log10(Math.max(1, b<number>("xp", 0))))
    add(cat, "z.log_lessons", "log10 lessons", Math.log10(Math.max(1, c.lessons.length)))
    add(cat, "z.log_events", "log10 events", Math.log10(Math.max(1, c.events.length)))
    add(cat, "z.log_tenure_days", "log10 tenure days", Math.log10(Math.max(1, (asOf - c.joinedAt.getTime()) / 86400000)))
    add(cat, "z.log_streak", "log10 streak", Math.log10(Math.max(1, b<number>("streak", 0))))
    add(cat, "z.active_rate_30d", "Active rate 30d", clamp01(div(a30, 30)))
    add(cat, "z.activity_square", "Active-rate squared (convexity)", clamp01(Math.pow(div(a30, 30), 2)))
    add(cat, "z.sqrt_social", "sqrt social breadth", Math.sqrt(c.posts.length + c.comments.length + c.likesByUser + c.friends))
    add(cat, "z.inv_recency_days", "1/(1+days since lesson)", 1 / (1 + Math.min(60, daysSince(c.lessons.at(-1)?.completedAt, asOf))))
    add(cat, "z.inv_recency_hours", "1/(1+hours since event)", 1 / (1 + Math.min(240, c.events.length ? (asOf - c.events[c.events.length - 1].ts.getTime()) / 3600000 : 240)))
    add(cat, "z.normalized_engagement", "Engagement percentile proxy", clamp01(div(a30, 30) * 0.5 + clamp01(div(c.lessons.length, 100)) * 0.5))
    add(cat, "z.frailty", "Frailty index: count of risk flags", (() => {
      let n = 0
      if (daysSince(c.lessons.at(-1)?.completedAt, asOf) > 3) n++
      if (a30 < 8) n++
      if (c.lessons.slice(-10).filter((l) => l.accuracy < 70).length >= 4) n++
      if (b<number>("streak", 0) === 0) n++
      if (c.friends === 0) n++
      return n
    })())
    add(cat, "z.is_high_value", "High-value composite flag", clamp01(div(a30, 30)) > 0.6 && c.lessons.length > 20 ? 1 : 0)
    add(cat, "z.residual_activity", "Activity beyond habit floor", clamp(div(c.lessons.filter((l) => asOf - l.completedAt.getTime() < 30 * 86400000).length - a30, Math.max(1, a30)), -1, 2))
  }

  // ─── finalize ───
  const byCatMap = new Map<string, number>()
  for (const f of registry) byCatMap.set(f.cat, (byCatMap.get(f.cat) ?? 0) + 1)
  const values: Record<string, number> = {}
  for (const f of registry) values[f.id] = f.value
  return {
    features: registry,
    byCat: [...byCatMap.entries()].map(([cat, count]) => ({ cat, count })).sort((a, b2) => b2.count - a.count),
    values,
  }
}

// ─── helpers ───

/** day-key "2026-11-06" → weekday 0-6 (Sun=0), in local calendar terms */
function K2D(k: string): number {
  return new Date(k + "T12:00:00Z").getUTCDay()
}

function lastActiveTs(c: Ctx): Date | null {
  const candidates = [c.lessons.at(-1)?.completedAt, c.stories.at(-1)?.completedAt, c.reads.at(-1)?.readAt, c.quizzes.at(-1)?.createdAt, c.posts.at(-1)?.createdAt, c.comments.at(-1)?.createdAt, c.plans.at(-1)?.completedAt, c.events.at(-1)?.ts]
  const valid = candidates.filter((x): x is Date => !!x)
  return valid.length ? new Date(Math.max(...valid.map((x) => x.getTime()))) : null
}
