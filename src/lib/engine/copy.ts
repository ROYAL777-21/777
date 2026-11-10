/**
 * copy.ts — THE VETTED COPY LIBRARY
 *
 * The engine never composes sentences. Every user-visible message is
 * selected from this hand-reviewed library. Doctrine review passed on
 * every line: grace-centered tone, no guilt, no fear tactics, no false
 * scarcity — "let your yea be yea" (Matt 5:37, KJV).
 *
 * Three tones: growth (encouraging momentum), identity (who you are
 * becoming), stewardship (rest and pacing).
 */

export type Tone = "growth" | "identity" | "stewardship"

export interface Copy {
  title: string
  body: string
  icon: string
}

export function safeTone(t: string): Tone {
  return t === "identity" || t === "stewardship" ? t : "growth"
}

interface Vars {
  xp?: number
  goal?: string
  streak?: number
  due?: number
  days?: number
  next?: number
  rank?: number
  name?: string
  gap?: number
}

const NUDGES: Record<string, Record<Tone, Copy | ((v: Vars) => Copy)>> = {
  reengage: {
    growth: {
      title: "Your scroll is waiting",
      body: "One lesson is all it takes to pick the thread back up. The Academy kept your place.",
      icon: "📜",
    },
    identity: {
      title: "You are a learner of the Word",
      body: "Studious people return to their desks. Yours is ready — one lesson and you're back in rhythm.",
      icon: "🕯️",
    },
    stewardship: {
      title: "A gentle restart",
      body: "No catch-up required. One short lesson today is enough — small and faithful wins.",
      icon: "🌱",
    },
  },
  goal: {
    growth: (v) => ({
      title: `${v.goal ?? 50} XP to today's goal`,
      body: v.xp !== undefined && v.xp > 0 ? `You've built ${Math.round(v.xp)} XP of momentum this week — one lesson keeps it alive.` : "Open the path and knock out the first lesson — momentum does the rest.",
      icon: "🎯",
    }),
    identity: (v) => ({
      title: "Consistency is your craft",
      body: `The scribes who lasted were the ones who showed up daily. Your ${v.streak ?? 0}-day habit is proof you're one of them.`,
      icon: "✍️",
    }),
    stewardship: {
      title: "A right-sized step",
      body: "Today only needs one lesson. Guard the habit, not the leaderboard.",
      icon: "🧭",
    },
  },
  review: {
    growth: (v) => ({
      title: `${v.due ?? 0} challenges are ready for review`,
      body: "Each one carried a mistake — reviewing it turns that mistake into mastery. It's the highest-value 5 minutes in the app.",
      icon: "🔁",
    }),
    identity: {
      title: "Mastery is revisiting",
      body: "Every scholar returns to what once tripped them. Your review queue is where rough edges become polish.",
      icon: "💎",
    },
    stewardship: {
      title: "Review a few, gently",
      body: "You don't have to clear the whole queue. Three reviewed challenges today is a faithful pace.",
      icon: "🪶",
    },
  },
  streak_risk: {
    growth: (v) => ({
      title: `${v.streak ?? 0}-day streak — one lesson to keep it`,
      body: "The evening is running out. A single lesson keeps the flame lit for tomorrow.",
      icon: "🔥",
    }),
    identity: (v) => ({
      title: `Keep the ${v.streak ?? 0}-day flame`,
      body: "This streak isn't a streak — it's who you've become. Don't let the sun set on it.",
      icon: "🕯️",
    }),
    stewardship: {
      title: "A minute for your streak",
      body: "If today is too full, a Streak Freeze can hold it. If you can spare one lesson, that's even better.",
      icon: "❄️",
    },
  },
  milestone_near: {
    growth: (v) => ({
      title: `${v.next ?? 7}-day milestone in ${v.days ?? 1} day${(v.days ?? 1) === 1 ? "" : "s"}`,
      body: "So close. One more day of study and it's yours.",
      icon: "🏆",
    }),
    identity: {
      title: "A milestone at hand",
      body: "The disciplined life builds quietly, day by day — and you're about to see the proof.",
      icon: "🏅",
    },
    stewardship: {
      title: "Almost at your milestone",
      body: "One more faithful day. Then rest on the other side of it.",
      icon: "🌅",
    },
  },
  social: {
    growth: {
      title: "Study is better together",
      body: "Learners with 3+ friends measurably stick with it longer. Add a study partner — it takes a minute.",
      icon: "🤝",
    },
    identity: {
      title: "Join the fellowship",
      body: "The faith was never meant to be studied alone. Invite someone into your Academy journey.",
      icon: "👥",
    },
    stewardship: {
      title: "A companion helps",
      body: "One friend who's also studying makes the road lighter. Consider inviting one today.",
      icon: "🫂",
    },
  },
  rest: {
    stewardship: {
      title: "Consider a rest day",
      body: "You've been studying hard. Even the LORD's people were given rhythms of rest — one lighter day will sharpen what's next.",
      icon: "🕊️",
    },
    growth: {
      title: "Rest is part of the plan",
      body: "You've earned a slower day. Your streak is safe with a freeze, and your mind will thank you.",
      icon: "🕊️",
    },
    identity: {
      title: "Wise scribes rest",
      body: "Depth comes from rhythm, not pressure. Take the lighter path today.",
      icon: "🕊️",
    },
  },
  // ── v11.5 — the daily clock, the winnable league, and the human callout ──
  manna: {
    growth: {
      title: "Today's manna is on the path",
      body: "A fresh portion landed this morning — one tap to gather it, and the morning is kept.",
      icon: "🌾",
    },
    identity: {
      title: "Gather the morning portion",
      body: "Manna never kept overnight — and mercies are new every morning. Today's is waiting on the path.",
      icon: "🌾",
    },
    stewardship: {
      title: "A small portion, still fresh",
      body: "Thirty seconds on the path gathers today's verse. Small and faithful wins the morning.",
      icon: "🌾",
    },
  },
  promotion: {
    growth: (v) => ({
      title: `Two lessons from promotion — #${v.rank ?? 6}`,
      body: `The week closes soon and you're ${v.gap ?? 40} XP from the promotion zone. One strong lesson changes the whole week.`,
      icon: "🏆",
    }),
    identity: (v) => ({
      title: "The climb is yours to finish",
      body: `You've held a top spot all week — ${v.gap ?? 40} XP keeps it. Scribes finish what they start.`,
      icon: "🏛️",
    }),
    stewardship: (v) => ({
      title: "A gentle push, if you want it",
      body: `You're close to the promotion zone (${v.gap ?? 40} XP). One lesson today is enough — never two if the day is full.`,
      icon: "🪶",
    }),
  },
  recognition: {
    growth: (v) => ({
      title: `Day ${v.streak ?? 7} — the lamp stands`,
      body: "Papy saw the whole climb. Steady hands, steady fire — that's what a scholar looks like.",
      icon: "🕯️",
    }),
    identity: (v) => ({
      title: `Day ${v.streak ?? 7}, scholar`,
      body: "This is no longer a habit you're trying — it's a craft you're keeping. The Academy salutes you.",
      icon: "🎖️",
    }),
    stewardship: (v) => ({
      title: "Milestone reached, well kept",
      body: `Day ${v.streak ?? 7} of showing up. However the rest of today goes, this part is already faithful.`,
      icon: "🌿",
    }),
  },
}

export function nudgeCopy(kind: keyof typeof NUDGES | string, tone: Tone, vars: Vars = {}): Copy {
  const family = NUDGES[kind as keyof typeof NUDGES] ?? NUDGES.goal
  const entry = family[tone]
  const resolved = typeof entry === "function" ? entry(vars) : entry
  return resolved
}

// ── session-end hooks (attached to lesson completion screens) ──

export const SESSION_END_HOOKS: Record<string, { title: string; body: string }> = {
  A: {
    title: "Well studied",
    body: "The scroll keeps your place. Tomorrow's lesson will be here when you return.",
  },
  B: {
    title: "Another page written",
    body: "\"Study to shew thyself approved unto God\" — 2 Timothy 2:15 (KJV). You're doing exactly that.",
  },
  C: {
    title: "Momentum banked",
    body: "Every lesson compounds. Rest now; pick the thread back up tomorrow.",
  },
}
