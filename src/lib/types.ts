// ── Shared API types (server → client) ──────────────────────

export type CourseSummary = {
  id: string
  code: string
  title: string
  subtitle: string
  emoji: string
  color: string
  totalLessons: number
  completedLessons: number
}

export type BootstrapUser = {
  name: string
  image: string
  avatar: string | null
  bio: string
  hearts: number
  gems: number
  xp: number
  streak: number
  streakFreezes: number
  doubleXpUntil: string | null
  dailyXp: number
  dailyXpGoal: number
  leagueOrder: number
  soundOn: boolean
  hapticsOn: boolean
  nextHeartAt: string | null
  level: number
  levelPercent: number
  levelIntoXp: number
  levelSpanXp: number
  xpForNext: number
}

export type BootstrapLesson = {
  id: string
  title: string
  order: number
  completed: boolean
}

export type BootstrapUnit = {
  id: string
  title: string
  description: string
  emoji: string
  color: string
  order: number
  difficulty: number
  lessons: BootstrapLesson[]
  chestClaimed: boolean
  tips: { inApp: string; outsideApp: string; routine: string } | null
}

export type BootstrapCourse = CourseSummary & {
  units: BootstrapUnit[]
}

export type BootstrapPayload = {
  user: BootstrapUser
  activeCourse: BootstrapCourse | null
  courses: CourseSummary[]
}

// ── lesson payload ──

export type ChallengeOptionDTO = {
  id: string
  text: string
  matchId: string | null
}

export type ChallengeDTO = {
  id: string
  type: "INFO" | "SELECT" | "ASSIST" | "MATCH" | "ARRANGE" | "TYPE" | "LISTEN" | "SPEAK"
  prompt: string
  question: string
  meaning: string | null
  transliteration: string | null
  order: number
  options: (ChallengeOptionDTO & { correct?: boolean; wordOrder?: number | null })[]
}

export type LessonPayload = {
  lessonId: string
  title: string
  unitTitle: string
  unitColor: string
  difficulty: number
  courseEmoji: string
  courseCode: string
  challenges: ChallengeDTO[]
  hearts: number
  firstTime: boolean
}

// ── completion result ──

export type CompleteResult = {
  xpEarned: number
  baseXp: number
  bonusXp: number
  doubled: boolean
  gemsEarned: number
  perfect: boolean
  firstTime: boolean
  streak: number
  streakIncreased: boolean
  usedFreeze: boolean
  milestone: number | null
  questsCompleted: string[]
  achievementsUnlocked: { title: string; tierName: string; gems: number; icon: string }[]
  totalXp: number
  gems: number
  hearts: number
  dailyXp: number
  dailyXpGoal: number
  correctCount: number
  totalQuestions: number
}

// ── daily quiz ──

export type DailyQuizQuestion = {
  id: number
  category: string
  question: string
  options: string[]
  correctIndex: number
  meaning: string // explanation with reference
}

export type DailyQuizPayload = {
  day: string
  completed: boolean
  score: number
  total: number
  streakOfQuizzes: number
  questions: DailyQuizQuestion[]
}

export type DailyQuizResult = {
  day: string
  score: number
  total: number
  xpEarned: number
  gemsEarned: number
  perfect: boolean
  streak: number
  streakIncreased: boolean
  questsCompleted: string[]
  achievementsUnlocked: { title: string; tierName: string; gems: number; icon: string }[]
  totalXp: number
  gems: number
  dailyXp: number
  dailyXpGoal: number
}

// ── placement test ──

export type PlacementQuestion = {
  challengeId: string
  unitOrder: number
  unitTitle: string
  prompt: string
  question: string
  options: { id: string; text: string }[]
  correctOptionId: string
  meaning: string | null
}

export type PlacementPayload = {
  courseId: string
  courseTitle: string
  courseEmoji: string
  unitsPlaced: number
  totalUnits: number
  questions: PlacementQuestion[]
}

export type PlacementResult = {
  unitsSkipped: number
  lessonsCompleted: number
  xpEarned: number
  totalXp: number
  gems: number
  streak: number
  streakIncreased: boolean
  questsCompleted: string[]
  achievementsUnlocked: { title: string; tierName: string; gems: number; icon: string }[]
  unitScores: { unitOrder: number; unitTitle: string; correct: number; total: number; placed: boolean }[]
}

// ── leaderboard ──

export type LeagueEntryDTO = {
  rank: number
  displayName: string
  avatarEmoji: string
  xp: number
  isCurrentUser: boolean
  promotion: boolean
  demotion: boolean
}

export type LeaderboardPayload = {
  league: { name: string; emoji: string; color: string; order: number }
  entries: LeagueEntryDTO[]
  leagues: { name: string; emoji: string; order: number; locked: boolean }[]
  timeLeftMs: number
}

// ── quests ──

export type QuestDTO = {
  id: string
  slug: string
  title: string
  description: string
  icon: string
  target: number
  gemsReward: number
  progress: number
  completed: boolean
}

export type QuestsPayload = {
  dailyXp: number
  dailyXpGoal: number
  quests: QuestDTO[]
  refreshInMs: number
}

// ── shop ──

export type ShopItemDTO = {
  slug: string
  name: string
  description: string
  icon: string
  price: number
  owned: number
}

export type ShopPayload = {
  gems: number
  streakFreezes: number
  items: ShopItemDTO[]
}

// ── profile ──

export type AchievementDTO = {
  slug: string
  title: string
  description: string
  icon: string
  metric: string
  tiers: number[]
  tierNames: string[]
  tier: number
  value: number
}

export type ProfilePayload = {
  name: string
  image: string
  avatar: string | null
  bio: string
  chaptersRead: number
  friends: number
  streak: number
  totalXp: number
  level: number
  levelPercent: number
  lessonsCompleted: number
  perfectLessons: number
  avgAccuracy: number
  challengesCorrect: number
  questsCompleted: number
  courses: CourseSummary[]
  achievements: AchievementDTO[]
  history: { day: string; xp: number; lessons: number }[]
  days: string[]
}

// ── notifications ──

export type NotificationDTO = {
  id: string
  type: string
  title: string
  body: string
  icon: string
  read: boolean
  createdAt: string
}

// ── bible reader ──

export type BibleMarkDTO = {
  bookId: string
  chapter: number
  verse: number
  color: string
  note: string
}

export type BibleStatePayload = {
  read: string[] // "gen-1"
  marks: BibleMarkDTO[]
  chaptersRead: number
  totalChapters: number
  lastRead: { bookId: string; chapter: number } | null
}

export type BibleReadResult = {
  firstTime: boolean
  chaptersRead: number
  xpEarned: number
  streak: number
  questsCompleted: string[]
  achievementsUnlocked: { title: string; tierName: string; gems: number; icon: string }[]
}

// ── reading plans ──

export type PlanProgressDTO = {
  id: string
  daysDone: number
  totalDays: number
  doneDays: number[]
  lastDay: number | null
}

export type PlansPayload = {
  plans: PlanProgressDTO[]
}

export type PlanDayResult = {
  firstTime: boolean
  xpEarned: number
  streak: number
  planDaysDone: number
  questsCompleted: string[]
  achievementsUnlocked: { title: string; tierName: string; gems: number; icon: string }[]
}

// ── stories ──

export type StoryListItemDTO = {
  id: string
  slug: string
  title: string
  description: string
  emoji: string
  color: string
  category: string
  difficulty: number
  xpReward: number
  completed: boolean
  perfect: boolean
}

export type StoriesPayload = {
  stories: StoryListItemDTO[]
  completedCount: number
  total: number
}

export type StorySceneDTO = {
  id: string
  order: number
  kind: "NARRATION" | "LINE" | "QUESTION"
  speaker: string | null
  text: string
  question: string | null
  options: string[]
  correctIndex: number
  meaning: string | null
}

export type StoryPayload = {
  storyId: string
  title: string
  emoji: string
  color: string
  category: string
  difficulty: number
  xpReward: number
  cast: Record<string, string>
  scenes: StorySceneDTO[]
  completed: boolean
}

export type StoryCompleteResult = {
  xpEarned: number
  doubled: boolean
  firstTime: boolean
  perfect: boolean
  gemsEarned: number
  streak: number
  streakIncreased: boolean
  questsCompleted: string[]
  achievementsUnlocked: { title: string; tierName: string; gems: number; icon: string }[]
  totalXp: number
  gems: number
  dailyXp: number
  dailyXpGoal: number
}

// ── friends ──

export type BotDTO = {
  id: string
  name: string
  avatar: string
  bio: string
  country: string
  streak: number
  weeklyXp: number
  isFriend: boolean
  requestedByUser: boolean
  requestedToUser: boolean
}

export type FriendsPayload = {
  friends: BotDTO[]
  requests: BotDTO[]
  suggestions: BotDTO[]
}

// ── community ──

export type PostAttachment = {
  kind: string
  title: string
  subtitle: string
  icon: string
  color: string
}

export type PostCommentDTO = {
  id: string
  authorName: string
  authorAvatar: string | null
  authorEmoji: string | null
  isUser: boolean
  body: string
  createdAt: string
}

export type PostDTO = {
  id: string
  authorName: string
  authorAvatar: string | null
  authorEmoji: string | null
  authorCountry: string
  isUser: boolean
  isFriend: boolean
  body: string
  attachment: PostAttachment | null
  likes: number
  liked: boolean
  comments: PostCommentDTO[]
  createdAt: string
}

export type CommunityPayload = {
  posts: PostDTO[]
  guidelines: boolean
}
