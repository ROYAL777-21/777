// ── Journey metadata (client-safe: no server imports) ────────
// Notification categories + email journeys. The engine lives in
// src/lib/journeys.ts; both server and client import from here.

export const NOTIF_CATEGORIES = [
  { key: "reminders", label: "Study reminders", description: "Your daily nudge at the time you choose", emoji: "⏰" },
  { key: "streak", label: "Streak protection", description: "Alerts when your streak is at risk or saved", emoji: "🔥" },
  { key: "quests", label: "Quests & rewards", description: "Daily quest completions and gem drops", emoji: "🎯" },
  { key: "achievements", label: "Achievements", description: "New tiers, milestones and medals", emoji: "🏅" },
  { key: "league", label: "League updates", description: "Promotion, demotion and weekly standings", emoji: "🏆" },
  { key: "verse", label: "Verse of the day", description: "A morning scripture, every day", emoji: "📖" },
  { key: "quiz", label: "Daily quiz", description: "When the fresh 5-question set is ready", emoji: "🧠" },
  { key: "hearts", label: "Hearts refilled", description: "All hearts back — time for a lesson", emoji: "❤️" },
  { key: "social", label: "Friends & community", description: "Friend requests, likes and replies", emoji: "🤝" },
  { key: "level", label: "Progress & recaps", description: "Level ups and your Monday weekly recap", emoji: "📈" },
] as const

export type NotifCategoryKey = (typeof NOTIF_CATEGORIES)[number]["key"]

export const DEFAULT_NOTIF_PREFS: Record<string, boolean> = Object.fromEntries(
  NOTIF_CATEGORIES.map((c) => [c.key, true]),
)

export const EMAIL_JOURNEY_KEYS = [
  { key: "welcome_series", label: "Welcome series", description: "Day 0 · 1 · 3 · 7 — getting started right", emoji: "🕊️" },
  { key: "pro_offer", label: "Scroll Pro offers", description: "The founding-member sequence (days 2 · 9 · 21)", emoji: "👑" },
  { key: "pro_welcome", label: "Pro welcome", description: "Your receipt + how to use every perk, after subscribing", emoji: "🧾" },
  { key: "winback", label: "Win-back", description: "If Pro ends: a fair look back at days 1 · 3 · 7", emoji: "📮" },
  { key: "streak_saver", label: "Streak saver", description: "Fires the evening your streak is at risk", emoji: "🔥" },
  { key: "re_engagement", label: "Re-engagement", description: "Gentle comebacks after 3 · 7 · 14 quiet days", emoji: "🌅" },
  { key: "weekly_digest", label: "Weekly digest", description: "Every Monday: XP, league and what's next", emoji: "📊" },
  { key: "milestone", label: "Milestones", description: "Streak records, level ups, course completions", emoji: "🎉" },
  { key: "advent_campaign", label: "Seasonal campaigns", description: "The Advent & Christmas gift guide (Nov–Dec only)", emoji: "🎁" },
] as const

export type EmailJourneyKey = (typeof EMAIL_JOURNEY_KEYS)[number]["key"]

export const DEFAULT_EMAIL_PREFS: Record<string, boolean> = Object.fromEntries(
  EMAIL_JOURNEY_KEYS.map((c) => [c.key, true]),
)
