/**
 * xp.ts — engine-aware XP awarding for returning learners.
 *
 * The catch-up multiplier (1.0–1.25×) helps lapsed learners feel welcome
 * again instead of punished. It never stacks with Double XP (fairness),
 * and it decays as the habit rebuilds.
 */

function clamp(x: number, lo: number, hi: number): number {
  const v = typeof x === "number" && Number.isFinite(x) ? x : 0
  return Math.min(hi, Math.max(lo, v))
}

export function catchUpMultiplier(daysSinceLesson: number, engagement: number): number {
  if (!Number.isFinite(daysSinceLesson) || daysSinceLesson <= 1) return 1
  const lapseBoost = clamp(Math.log2(1 + Math.min(21, daysSinceLesson)) / 8, 0, 0.25)
  const engagementDamp = clamp(1 - engagement, 0, 1) // already-engaged users need less help
  return 1 + lapseBoost * (0.5 + 0.5 * engagementDamp)
}

export function sessionTargetMinutes(habitStage: string): number {
  switch (habitStage) {
    case "sparking":
      return 3
    case "starting":
      return 5
    case "establishing":
      return 7
    default:
      return 10
  }
}
