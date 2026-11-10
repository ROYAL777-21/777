/**
 * time.ts — one source of truth for local wall-clock math.
 *
 * Scroll Academy is local-first: the server (or the Tauri sidecar) runs on
 * the user's own machine, so the process timezone IS the user's timezone —
 * Johannesburg, Nairobi, London or Manila alike. We therefore derive the
 * offset from the machine's own clock instead of hard-coding any fixed
 * zone, so streak day-boundaries, quiet hours and chronotype histograms
 * always follow the learner's real wall clock.
 */

/** local timezone offset in ms east of UTC, derived at load time */
export const TZ_OFFSET_MS = -new Date().getTimezoneOffset() * 60000

/** local calendar day key, e.g. "2026-11-06" */
export function dayKeyOf(d: Date = new Date()): string {
  return new Date(d.getTime() + TZ_OFFSET_MS).toISOString().slice(0, 10)
}

/** local wall-clock hour 0–23 of the given instant */
export function localHour(d: Date = new Date()): number {
  return new Date(d.getTime() + TZ_OFFSET_MS).getUTCHours()
}

/** minutes since local midnight (0–1439) */
export function localMinuteOfDay(d: Date = new Date()): number {
  const local = new Date(d.getTime() + TZ_OFFSET_MS)
  return local.getUTCHours() * 60 + local.getUTCMinutes()
}
