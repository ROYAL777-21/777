import { db } from "@/lib/db"
import type { UserProgress, AppNotification } from "@prisma/client"
import { TZ_OFFSET_MS } from "@/lib/time"

// ─────────────────────────────────────────────────────────────
//  Constants
// ─────────────────────────────────────────────────────────────

export const USER_ID = "user_1"
export const MAX_HEARTS = 5
export const HEART_REGEN_MS = 10 * 60 * 1000 // one heart every 10 minutes
export const DAILY_XP_GOAL = 50
export const LEAGUE_SIZE = 15
export const PROMOTION_SLOTS = 5
export const DEMOTION_SLOTS = 5

// TZ_OFFSET_MS comes from @/lib/time — follows the machine's own clock

// ─────────────────────────────────────────────────────────────
//  Time helpers
// ─────────────────────────────────────────────────────────────

/** local calendar day key, e.g. "2026-10-29" (machine clock — see @/lib/time) */
export function dayKey(d: Date = new Date()): string {
  const local = new Date(d.getTime() + TZ_OFFSET_MS)
  return local.toISOString().slice(0, 10)
}

/** local month key, e.g. "2026-11" — used for monthly Pro grants */
export function monthKey(d: Date = new Date()): string {
  const local = new Date(d.getTime() + TZ_OFFSET_MS)
  return local.toISOString().slice(0, 7)
}

export function daysBetween(aKey: string, bKey: string): number {
  const a = new Date(aKey + "T00:00:00Z").getTime()
  const b = new Date(bKey + "T00:00:00Z").getTime()
  return Math.round((b - a) / 86400000)
}

/** ISO-like week key, e.g. "2026-W44" (weeks start Monday) */
export function weekKey(d: Date = new Date()): string {
  const local = new Date(d.getTime() + TZ_OFFSET_MS)
  const day = local.getUTCDay() || 7 // Mon=1..Sun=7
  local.setUTCDate(local.getUTCDate() + 4 - day) // Thursday of this week
  const yearStart = new Date(Date.UTC(local.getUTCFullYear(), 0, 1))
  const week = Math.ceil(((local.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  return `${local.getUTCFullYear()}-W${String(week).padStart(2, "0")}`
}

/** how much of the current week has elapsed (0..1) */
export function weekElapsed(d: Date = new Date()): number {
  const local = new Date(d.getTime() + TZ_OFFSET_MS)
  const day = local.getUTCDay() || 7
  const hours = local.getUTCHours() + day * 24 // hours since Monday 00:00
  return Math.min(1, hours / (7 * 24))
}

// ─────────────────────────────────────────────────────────────
//  Levels
// ─────────────────────────────────────────────────────────────

const LEVEL_STEPS = [0, 100, 250, 500, 900, 1500, 2500, 4000, 6000, 9000]

export function levelInfo(xp: number) {
  let level = 1
  for (let i = 0; i < LEVEL_STEPS.length; i++) {
    if (xp >= LEVEL_STEPS[i]) level = i + 1
  }
  const cur = LEVEL_STEPS[level - 1]
  const next = level < LEVEL_STEPS.length ? LEVEL_STEPS[level] : cur + 3500
  return {
    level,
    intoLevel: xp - cur,
    levelSpan: next - cur,
    xpForNext: next,
    percent: Math.min(100, Math.round(((xp - cur) / (next - cur)) * 100)),
  }
}

// ─────────────────────────────────────────────────────────────
//  User bootstrap + hearts
// ─────────────────────────────────────────────────────────────

const WELCOME_NOTIFICATIONS: Omit<AppNotification, "id" | "userId" | "createdAt" | "read">[] = [
  {
    type: "welcome",
    title: "Welcome to Scroll Academy! 📜",
    body: "“Thy word is a lamp unto my feet, and a light unto my path” — Psalm 119:105 (KJV). Start your first lesson to light your streak!",
    icon: "🕯️",
  },
]

export async function getOrCreateUser() {
  let user = await db.user.findUnique({ where: { id: USER_ID }, include: { progress: true } })
  if (!user) {
    user = await db.user.create({
      data: {
        id: USER_ID,
        name: "Scribe",
        image: "🦁",
        progress: { create: {} },
        notifications: { create: WELCOME_NOTIFICATIONS },
      },
      include: { progress: true },
    })
  }
  if (!user.progress) {
    await db.userProgress.create({ data: { userId: USER_ID } })
    user = await db.user.findUnique({ where: { id: USER_ID }, include: { progress: true } })
  }
  // ── Scroll Pro entitlements (monthly Streak Repair top-up) ──
  await applyProEntitlements(user!.progress!)
  return user!
}

/**
 * Scroll Pro entitlements, applied lazily on every user fetch:
 *  · Streak Repair ×2 every month — tops the equipped freezes back up to 2
 *    (shop cap is 2; the grant is idempotent per local calendar month).
 *  · 2× XP weekends are applied at lesson-completion time (see api/lessons).
 */
export async function applyProEntitlements(progress: UserProgress): Promise<UserProgress> {
  if (progress.plan === "free") return progress
  const mk = monthKey()
  if (progress.lastProFreezeGrant === mk) return progress
  const updated = await db.userProgress.update({
    where: { userId: USER_ID },
    data: {
      streakFreezes: Math.max(progress.streakFreezes, 2),
      lastProFreezeGrant: mk,
    },
  })
  return updated
}

/** lazily regenerate hearts over time; returns refreshed progress */
export async function regenHearts(progress: UserProgress): Promise<UserProgress> {
  if (progress.hearts >= MAX_HEARTS) {
    if (progress.lastHeartAt) {
      progress = await db.userProgress.update({
        where: { userId: progress.userId },
        data: { lastHeartAt: null },
      })
    }
    return progress
  }
  if (!progress.lastHeartAt) return progress
  const now = Date.now()
  const elapsed = now - progress.lastHeartAt.getTime()
  const gained = Math.floor(elapsed / HEART_REGEN_MS)
  if (gained <= 0) return progress
  const hearts = Math.min(MAX_HEARTS, progress.hearts + gained)
  const lastHeartAt = hearts >= MAX_HEARTS ? null : new Date(progress.lastHeartAt.getTime() + gained * HEART_REGEN_MS)
  return db.userProgress.update({ where: { userId: progress.userId }, data: { hearts, lastHeartAt } })
}

export function nextHeartAt(progress: UserProgress): string | null {
  if (progress.hearts >= MAX_HEARTS) return null
  if (!progress.lastHeartAt) return null
  return new Date(progress.lastHeartAt.getTime() + HEART_REGEN_MS).toISOString()
}

// ─────────────────────────────────────────────────────────────
//  Daily quests
// ─────────────────────────────────────────────────────────────

function hashStr(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

/** 3 deterministic quests per day */
export async function ensureDailyQuests(day: string) {
  const all = await db.quest.findMany({ orderBy: { slug: "asc" } })
  const seed = hashStr(USER_ID + day)
  // pick = stable pseudo-random index into the slug-sorted quest list
  const pick = (offset: number) => all[(seed + offset) % all.length]
  const chosen = new Set<string>()
  for (let i = 0; chosen.size < 3 && i < 20; i++) {
    chosen.add(pick(i * 7 + 3).slug)
  }
  const quests = all.filter((q) => chosen.has(q.slug))
  await Promise.all(
    quests.map((q) =>
      db.userQuest.upsert({
        where: { userId_questId_day: { userId: USER_ID, questId: q.id, day } },
        update: {},
        create: { userId: USER_ID, questId: q.id, day, progress: 0 },
      })
    )
  )
  return db.userQuest.findMany({
    where: { userId: USER_ID, day },
    include: { quest: true },
    orderBy: { questId: "asc" },
  })
}

export interface QuestDelta {
  xp?: number
  lessons?: number
  combo?: number
  perfect?: number
  correct?: number
  chapters?: number
  plan_days?: number
  daily_quiz?: number
}

/** advance quests; auto-claims rewards; returns quests newly completed this call */
export async function advanceQuests(day: string, delta: QuestDelta) {
  const uqs = await ensureDailyQuests(day)
  const completedNow: string[] = []
  let gemsAwarded = 0
  const METRIC_GETTERS: Record<string, (uq: (typeof uqs)[number]) => number> = {
    xp: () => delta.xp ?? 0,
    lessons: () => delta.lessons ?? 0,
    combo: (uq) => Math.max(0, (delta.combo ?? 0) - uq.progress),
    perfect: () => delta.perfect ?? 0,
    correct: () => delta.correct ?? 0,
    chapters: () => delta.chapters ?? 0,
    plan_days: () => delta.plan_days ?? 0,
    daily_quiz: () => delta.daily_quiz ?? 0,
  }
  // resolve each quest's increment, then apply the updates in parallel
  const updates: Promise<unknown>[] = []
  const finished: { title: string; gems: number }[] = []
  for (const uq of uqs) {
    if (uq.completed) continue
    const add = METRIC_GETTERS[uq.quest.metric]?.(uq) ?? 0
    if (add <= 0) continue
    const progress = uq.progress + add
    const completed = progress >= uq.quest.target
    updates.push(
      db.userQuest.update({
        where: { id: uq.id },
        data: { progress: Math.min(progress, uq.quest.target), completed, claimed: completed },
      })
    )
    if (completed) finished.push({ title: uq.quest.title, gems: uq.quest.gemsReward })
  }
  await Promise.all(updates)
  for (const f of finished) {
    completedNow.push(f.title)
    gemsAwarded += f.gems
  }
  return { completedNow, gemsAwarded }
}

// ─────────────────────────────────────────────────────────────
//  Achievement context (shared by all award paths)
// ─────────────────────────────────────────────────────────────

export interface AchievementCtx {
  streak: number
  xp: number
  lessons: number
  perfect: number
  challenges: number
  quests: number
  courses: number
  chapters: number
  community: number
  friends: number
}

export async function computeAchievementCtx(streak?: number): Promise<AchievementCtx> {
  const progress = await db.userProgress.findUnique({ where: { userId: USER_ID } })
  const [lessonsDone, perfectDone, correctTotal, questsDone] = await Promise.all([
    db.lessonCompletion.count({ where: { userId: USER_ID } }),
    db.lessonCompletion.count({ where: { userId: USER_ID, accuracy: 100 } }),
    db.challengeProgress.count({ where: { userId: USER_ID, completed: true } }),
    db.userQuest.count({ where: { userId: USER_ID, completed: true } }),
  ])
  const coursesTouched = await db.lessonCompletion.findMany({
    where: { userId: USER_ID },
    select: { lesson: { select: { unit: { select: { courseId: true } } } } },
    distinct: ["lessonId"],
  })
  const [chapters, posts, comments, friends] = await Promise.all([
    db.bibleRead.count({ where: { userId: USER_ID } }),
    db.post.count({ where: { userId: USER_ID } }),
    db.postComment.count({ where: { userId: USER_ID } }),
    db.botUser.count({ where: { isFriend: true } }),
  ])
  let likes = 0
  try {
    likes = ((progress?.likedPosts ? JSON.parse(progress.likedPosts) : []) as string[]).length
  } catch {
    likes = 0
  }
  return {
    streak: streak ?? progress?.streak ?? 0,
    xp: progress?.xp ?? 0,
    lessons: lessonsDone,
    perfect: perfectDone,
    challenges: correctTotal,
    quests: questsDone,
    courses: new Set(coursesTouched.map((c) => c.lesson.unit.courseId)).size,
    chapters,
    community: posts + comments + likes,
    friends,
  }
}

// ─────────────────────────────────────────────────────────────
//  Notifications for quests & achievements (shared)
// ─────────────────────────────────────────────────────────────

function iconEmoji(icon: string): string {
  const map: Record<string, string> = {
    Flame: "🔥", Sparkles: "✨", BookOpen: "📖", Star: "⭐", PenLine: "✍️",
    GraduationCap: "🎓", Target: "🎯", BookOpenCheck: "📖", Users: "🤝", UserPlus: "🤝",
  }
  return map[icon] ?? "🏅"
}

export async function notifyQuestsAndAchievements(questRes: { completedNow: string[] }, achRes: { unlocked: { title: string; tierName: string; gems: number; icon: string }[] }) {
  // one createMany instead of a sequential insert per notification
  const rows: { userId: string; type: string; title: string; body: string; icon: string }[] = []
  for (const q of questRes.completedNow) {
    rows.push({
      userId: USER_ID,
      type: "quest",
      title: "Quest complete! 🎯",
      body: `You finished the daily quest “${q}”. Gems have been added to your wallet!`,
      icon: "🎯",
    })
  }
  for (const a of achRes.unlocked) {
    rows.push({
      userId: USER_ID,
      type: "achievement",
      title: `Achievement: ${a.title} ${iconEmoji(a.icon)}`,
      body: `You reached “${a.tierName}” and earned ${a.gems} gems. Beautiful work!`,
      icon: "🏅",
    })
  }
  if (rows.length > 0) await db.appNotification.createMany({ data: rows })
}

// ─────────────────────────────────────────────────────────────
//  Award XP for non-lesson activities (Bible reading, plans, community)
// ─────────────────────────────────────────────────────────────

export interface ActivityAwardResult {
  xpEarned: number
  doubled: boolean
  streak: number
  streakIncreased: boolean
  usedFreeze: boolean
  milestone: number | null
  totalXp: number
  gems: number
  dailyXp: number
  dailyXpGoal: number
  questsCompleted: string[]
  achievementsUnlocked: { title: string; tierName: string; gems: number; icon: string }[]
}

export async function awardActivityXp(
  progress: UserProgress,
  opts: { xp: number; questDelta?: QuestDelta }
): Promise<ActivityAwardResult> {
  const today = dayKey()
  const doubled = !!progress.doubleXpUntil && progress.doubleXpUntil > new Date()
  const xpEarned = Math.round(opts.xp * (doubled ? 2 : 1))

  // streak + quests are independent of each other — advance them together
  const [streakRes, questRes] = await Promise.all([
    updateStreak(progress),
    advanceQuests(today, { xp: xpEarned, ...(opts.questDelta ?? {}) }),
  ])

  // league xp
  const leagueId = `league-${progress.leagueOrder ?? 0}`
  const wk = weekKey()
  const meCount = await db.leagueEntry.count({ where: { leagueId, weekKey: wk, isCurrentUser: true } })
  if (meCount === 0) {
    const user = await db.user.findUnique({ where: { id: USER_ID } })
    await db.leagueEntry.create({
      data: { leagueId, weekKey: wk, displayName: user?.name ?? "You", avatarEmoji: user?.image ?? "📖", isCurrentUser: true, xp: 0 },
    })
  }
  await db.leagueEntry.updateMany({
    where: { leagueId, weekKey: wk, isCurrentUser: true },
    data: { xp: { increment: xpEarned } },
  })

  const isNewDay = progress.dailyXpDay !== today
  const dailyXp = (isNewDay ? 0 : progress.dailyXp) + xpEarned
  const totalXp = progress.xp + xpEarned

  const ctx = await computeAchievementCtx(streakRes.streak)
  const achRes = await checkAchievements(ctx)
  await notifyQuestsAndAchievements(questRes, achRes)

  if (streakRes.milestone) {
    await db.appNotification.create({
      data: {
        userId: USER_ID,
        type: "streak",
        title: `${streakRes.milestone}-day streak! 🔥`,
        body: `You've studied ${streakRes.milestone} days in a row. Your discipline is paying off — keep going!`,
        icon: "🔥",
      },
    })
  }

  const totalGems = progress.gems + questRes.gemsAwarded + achRes.gems
  await db.userProgress.update({
    where: { userId: USER_ID },
    data: {
      xp: totalXp,
      gems: totalGems,
      streak: streakRes.streak,
      streakFreezes: streakRes.usedFreeze ? Math.max(0, progress.streakFreezes - 1) : progress.streakFreezes,
      lastActiveDay: today,
      dailyXp,
      dailyXpDay: today,
    },
  })

  return {
    xpEarned,
    doubled,
    streak: streakRes.streak,
    streakIncreased: streakRes.increased,
    usedFreeze: streakRes.usedFreeze,
    milestone: streakRes.milestone,
    totalXp,
    gems: totalGems,
    dailyXp,
    dailyXpGoal: progress.dailyGoal ?? DAILY_XP_GOAL,
    questsCompleted: questRes.completedNow,
    achievementsUnlocked: achRes.unlocked,
  }
}

// ─────────────────────────────────────────────────────────────
//  Achievements
// ─────────────────────────────────────────────────────────────

export async function checkAchievements(ctx: {
  streak: number
  xp: number
  lessons: number
  perfect: number
  challenges: number
  quests: number
  courses: number
}) {
  const defs = await db.achievement.findMany()
  // ONE read for the user's current tiers (was a findUnique per achievement),
  // then parallel upserts only for the definitions that actually advanced.
  const mine = await db.userAchievement.findMany({ where: { userId: USER_ID }, select: { achievementId: true, tier: true } })
  const myTier = new Map(mine.map((m) => [m.achievementId, m.tier]))
  const unlocked: { title: string; tierName: string; gems: number; icon: string }[] = []
  let gems = 0
  const gemScale = [10, 25, 50, 100, 250]
  const upserts: Promise<unknown>[] = []
  for (const def of defs) {
    const tiers: number[] = JSON.parse(def.tiers)
    const tierNames: string[] = JSON.parse(def.tierNames)
    const value = (ctx as unknown as Record<string, number>)[def.metric] ?? 0
    let newTier = 0
    for (let i = 0; i < tiers.length; i++) if (value >= tiers[i]) newTier = i + 1
    if (newTier === 0) continue
    if ((myTier.get(def.id) ?? 0) >= newTier) continue
    const gemReward = gemScale[Math.min(newTier - 1, gemScale.length - 1)]
    upserts.push(
      db.userAchievement.upsert({
        where: { userId_achievementId: { userId: USER_ID, achievementId: def.id } },
        update: { tier: newTier, unlockedAt: new Date() },
        create: { userId: USER_ID, achievementId: def.id, tier: newTier, unlockedAt: new Date() },
      })
    )
    unlocked.push({ title: def.title, tierName: tierNames[newTier - 1], gems: gemReward, icon: def.icon })
    gems += gemReward
  }
  await Promise.all(upserts)
  return { unlocked, gems }
}

// ─────────────────────────────────────────────────────────────
//  Leagues
// ─────────────────────────────────────────────────────────────

export async function ensureLeagueState(progress: UserProgress) {
  const wk = weekKey()
  let order = progress.leagueOrder ?? 0
  let changed = false

  if (progress.lastWeekKey && progress.lastWeekKey !== wk) {
    // week rolled over → evaluate last week's placement
    const lastEntries = await db.leagueEntry.findMany({
      where: { leagueId: `league-${order}`, weekKey: progress.lastWeekKey, userId: USER_ID },
      orderBy: [{ xp: "desc" }, { displayName: "asc" }],
    })
    const me = lastEntries.findIndex((e) => e.isCurrentUser)
    const total = lastEntries.length
    if (me >= 0 && total >= 10) {
      if (me < PROMOTION_SLOTS && order < 9) {
        order += 1
        changed = true
        await db.appNotification.create({
          data: {
            userId: USER_ID,
            type: "league",
            title: "Promotion! 🎉",
            body: `You finished top ${PROMOTION_SLOTS} last week and advanced a league. Keep the XP coming!`,
            icon: "🏆",
          },
        })
      } else if (me >= total - DEMOTION_SLOTS && order > 0) {
        order -= 1
        changed = true
        await db.appNotification.create({
          data: {
            userId: USER_ID,
            type: "league",
            title: "Demotion 😢",
            body: `You fell to the bottom ${DEMOTION_SLOTS} last week. Fight back this week — you've got this!`,
            icon: "📉",
          },
        })
      }
    }
  }

  // ensure a league entry for the user this week
  const userEntry = await db.leagueEntry.findFirst({
    where: { leagueId: `league-${order}`, weekKey: wk, isCurrentUser: true },
  })
  if (!userEntry) {
    const user = await db.user.findUnique({ where: { id: USER_ID } })
    await db.leagueEntry.create({
      data: {
        leagueId: `league-${order}`,
        weekKey: wk,
        displayName: user?.name ?? "You",
        avatarEmoji: user?.image ?? "📖",
        isCurrentUser: true,
      },
    })
  }

  // seed bots for this league+week
  const bots = await db.leagueEntry.count({
    where: { leagueId: `league-${order}`, weekKey: wk, isBot: true },
  })
  if (bots < LEAGUE_SIZE - 1) {
    const botDefs = BOT_POOL
    await Promise.all(
      Array.from({ length: LEAGUE_SIZE - 1 }, (_, i) => {
        const b = botDefs[hashStr(`${order}-${wk}-${i}`) % botDefs.length]
        const base = 60 + order * 55
        const target = base + (hashStr(`${b.name}-${wk}-${i}`) % 260)
        return db.leagueEntry.upsert({
          where: {
            leagueId_weekKey_displayName: {
              leagueId: `league-${order}`,
              weekKey: wk,
              displayName: b.name,
            },
          },
          update: {},
          create: {
            leagueId: `league-${order}`,
            weekKey: wk,
            displayName: b.name,
            avatarEmoji: b.emoji,
            isBot: true,
            targetXp: target,
          },
        })
      })
    )
  }

  if (changed || progress.lastWeekKey !== wk) {
    await db.userProgress.update({ where: { userId: USER_ID }, data: { leagueOrder: order, lastWeekKey: wk } })
    progress = await db.userProgress.findUniqueOrThrow({ where: { userId: USER_ID } })
  }
  return progress
}

const BOT_POOL = [
  { name: "Deborah S.", emoji: "🦉" },
  { name: "Apollos", emoji: "🏛️" },
  { name: "Barnabas", emoji: "🌿" },
  { name: "Priscilla", emoji: "🕊️" },
  { name: "Tabitha", emoji: "🧵" },
  { name: "Silas", emoji: "🎵" },
  { name: "Lydia", emoji: "💜" },
  { name: "Aquila", emoji: "🏕️" },
  { name: "Phoebe", emoji: "📮" },
  { name: "Timothy", emoji: "🌱" },
  { name: "Titus", emoji: "📜" },
  { name: "Sophia", emoji: "📚" },
  { name: "Theophilus", emoji: "🔍" },
  { name: "Berean Bill", emoji: "📖" },
  { name: "Qumran Kid", emoji: "🏜️" },
  { name: "Scroll Sis", emoji: "🪶" },
  { name: "Logos Luke", emoji: "⚡" },
  { name: "Alpha Amy", emoji: "α" },
  { name: "Shalom Steve", emoji: "🕎" },
  { name: "Codex Carly", emoji: "📕" },
  { name: "Papyrus Pat", emoji: "🪴" },
  { name: "Nikkud Nadia", emoji: "✨" },
  { name: "Vulgate Vicky", emoji: "🌍" },
  { name: "Wycliffe Will", emoji: "✍️" },
]

/** compute a bot's "live" xp — ramps toward its weekly target as the week progresses */
export function botDisplayXp(targetXp: number, name: string, elapsed: number): number {
  const jitter = hashStr(name + Math.floor(Date.now() / 3_600_000)) % 9
  const ramp = Math.min(1, elapsed * 1.12 + 0.02)
  return Math.max(0, Math.round(targetXp * ramp) + jitter)
}

// ─────────────────────────────────────────────────────────────
//  Today's Manna (v11.5 — the daily clock)
//  A fresh portion lands every local midnight; gathering it takes one
//  tap and pays a small XP gift. The manna streak is its own gentle
//  counter — it never punishes, it only counts mornings.
// ─────────────────────────────────────────────────────────────

export const MANNA_XP = 5

export interface MannaState {
  day: string
  collected: boolean
  mannaStreak: number
}

export function mannaStateOf(progress: UserProgress): MannaState {
  const today = dayKey()
  return {
    day: today,
    collected: progress.lastMannaDay === today,
    mannaStreak: progress.mannaStreak,
  }
}

/** gather today's portion — idempotent per local day */
export async function collectManna(progress: UserProgress) {
  const today = dayKey()
  if (progress.lastMannaDay === today) {
    return { ok: false as const, ...mannaStateOf(progress), xpEarned: 0 }
  }
  const yesterday = dayKey(new Date(Date.now() - 86400000))
  const mannaStreak = progress.lastMannaDay === yesterday ? progress.mannaStreak + 1 : 1
  // XP flows through the standard award path (quests, achievements, league)
  const award = await awardActivityXp(progress, { xp: MANNA_XP })
  const updated = await db.userProgress.update({
    where: { userId: USER_ID },
    data: { mannaStreak, lastMannaDay: today },
  })
  return {
    ok: true as const,
    day: today,
    collected: true,
    mannaStreak: updated.mannaStreak,
    xpEarned: award.xpEarned,
    totalXp: award.totalXp,
    streak: award.streak,
  }
}

// ─────────────────────────────────────────────────────────────
//  Streaks
// ─────────────────────────────────────────────────────────────

export interface StreakResult {
  streak: number
  increased: boolean
  usedFreeze: boolean
  milestone: number | null
}

export async function updateStreak(progress: UserProgress): Promise<StreakResult> {
  const today = dayKey()
  if (progress.lastActiveDay === today) {
    return { streak: progress.streak, increased: false, usedFreeze: false, milestone: null }
  }
  const yesterday = dayKey(new Date(Date.now() - 86400000))
  let streak = progress.streak
  let usedFreeze = false
  if (progress.lastActiveDay === yesterday) {
    streak += 1
  } else if (progress.lastActiveDay) {
    const gap = daysBetween(progress.lastActiveDay, today)
    if (gap === 2 && progress.streakFreezes > 0) {
      streak += 1
      usedFreeze = true
      await db.appNotification.create({
        data: {
          userId: USER_ID,
          type: "streak_saved",
          title: "Streak Freeze used! ❄️",
          body: "You missed a day, but your Streak Freeze protected your streak. Equip another one from the Shop!",
          icon: "❄️",
        },
      })
    } else {
      streak = 1
    }
  } else {
    streak = 1
  }
  const milestones = [3, 7, 14, 30, 60, 100, 365]
  const milestone = milestones.includes(streak) ? streak : null
  return { streak, increased: true, usedFreeze, milestone }
}

export async function notifyStreakRiskIfNeeded() {
  const progress = await db.userProgress.findUnique({ where: { userId: USER_ID } })
  if (!progress || progress.streak < 2) return
  const today = dayKey()
  if (progress.lastActiveDay === today) return
  const recent = await db.appNotification.findFirst({
    where: { userId: USER_ID, type: "streak_risk", createdAt: { gte: new Date(Date.now() - 20 * 3600 * 1000) } },
  })
  if (recent) return
  await db.appNotification.create({
    data: {
      userId: USER_ID,
      type: "streak_risk",
      title: `${progress.streak}-day streak at risk! 🔥`,
      body: "Complete one lesson today to keep your streak alive. Your future self will thank you!",
      icon: "🔥",
    },
  })
}
