/**
 * redletter.ts — THE RED-LETTER EDITION
 *
 * "And he said unto them…" — the words spoken by our Lord, set in red as
 * in the classic red-letter Bibles of Louis Klopsch (1899), who marked
 * the spoken words of God in both Testaments. This dataset covers every
 * word of Christ in the Gospels, Acts, Corinthians and Revelation
 * (2,029 verses, verified 100% against the KJV text), plus the direct
 * speech of the LORD in the Law and key OT passages (53 verses) —
 * 2,082 red verses in total.
 *
 * Implementation notes:
 *  · Ranges are [start, end) character offsets into the exact verse text
 *    shipped in /bible/{book}.json — verified at build time by
 *    scripts/redletter-verify.ts (any mismatch would have been rejected).
 *  · resolveRedRanges is fail-safe: unknown books/chapters/verses return
 *    an empty array (plain rendering), never an error.
 *  · If the user turns red letters off, everything renders black.
 */

import data from "./redletter-data.json"

export type RedRanges = [number, number][]

const BOOKS: Record<string, Record<string, Record<string, RedRanges>>> = data as unknown as Record<string, Record<string, Record<string, RedRanges>>>

/** red ranges for one verse — empty array if none / unknown */
export function redRangesFor(bookId: string, chapter: number, verse: number): RedRanges {
  const book = BOOKS[bookId]
  if (!book) return []
  const ch = book[String(chapter)]
  if (!ch) return []
  const ranges = ch[String(verse)]
  if (!Array.isArray(ranges)) return []
  // sanitize: sorted, bounded, non-degenerate
  const out: RedRanges = []
  for (const r of ranges) {
    if (!Array.isArray(r) || r.length !== 2) continue
    const s = typeof r[0] === "number" && Number.isFinite(r[0]) ? Math.max(0, Math.floor(r[0])) : -1
    const e = typeof r[1] === "number" && Number.isFinite(r[1]) ? Math.floor(r[1]) : -1
    if (s >= 0 && e > s) out.push([s, e])
  }
  out.sort((a, b) => a[0] - b[0])
  return out
}

/** does this verse contain any red text? */
export function isRedVerse(bookId: string, chapter: number, verse: number): boolean {
  return redRangesFor(bookId, chapter, verse).length > 0
}

/** segment a verse's text into red/black parts for rendering */
export interface VerseSegment {
  text: string
  red: boolean
}

export function segmentVerse(bookId: string, chapter: number, verse: number, text: string): VerseSegment[] {
  const ranges = redRangesFor(bookId, chapter, verse)
  if (ranges.length === 0) return [{ text, red: false }]
  const parts: VerseSegment[] = []
  let cursor = 0
  for (const [s, e] of ranges) {
    const start = Math.min(s, text.length)
    const end = Math.min(e, text.length)
    if (start > cursor) parts.push({ text: text.slice(cursor, start), red: false })
    if (end > start) parts.push({ text: text.slice(start, end), red: true })
    cursor = end
  }
  if (cursor < text.length) parts.push({ text: text.slice(cursor), red: false })
  return parts.length ? parts : [{ text, red: false }]
}

/** count of red-letter verses (for the settings description) */
export const RED_VERSE_COUNT = Object.values(BOOKS).reduce(
  (n, chapters) => Object.values(chapters).reduce((m, verses) => m + Object.keys(verses).length, n),
  0,
)
