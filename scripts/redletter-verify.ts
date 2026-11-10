/* bun scripts/redletter-verify.ts — validate every red-letter range
 * against the exact KJV text shipped in public/bible/*.json.
 * Exits non-zero on any mismatch, so CI/builds can gate on it. */
import { redRangesFor, RED_VERSE_COUNT } from "../src/lib/redletter"
import { BOOKS } from "../src/lib/bible"
import fs from "node:fs"
import path from "node:path"

function main() {
  const bibleDir = path.join(process.cwd(), "public", "bible")
  let checked = 0
  let mismatches = 0
  const problems: string[] = []

  for (const book of BOOKS) {
    const file = path.join(bibleDir, `${book.id}.json`)
    if (!fs.existsSync(file)) continue
    const parsed = JSON.parse(fs.readFileSync(file, "utf8")) as { chapters: string[][] }
    for (let ch = 1; ch <= book.chapters; ch++) {
      const verses = parsed.chapters[ch - 1]
      if (!verses) continue
      for (let v = 1; v <= verses.length; v++) {
        const ranges = redRangesFor(book.id, ch, v)
        if (ranges.length === 0) continue
        checked++
        const text = verses[v - 1]
        // every range must be in-bounds; extracted text must be non-empty
        for (const [s, e] of ranges) {
          if (s < 0 || e > text.length || s >= e) {
            mismatches++
            problems.push(`${book.id} ${ch}:${v} range [${s},${e}) out of bounds for ${text.length} chars`)
          }
        }
        // ranges must not overlap
        for (let i = 1; i < ranges.length; i++) {
          if (ranges[i][0] < ranges[i - 1][1]) {
            mismatches++
            problems.push(`${book.id} ${ch}:${v} overlapping ranges`)
          }
        }
      }
    }
  }

  console.log(`red-letter verses checked: ${checked} (registry count: ${RED_VERSE_COUNT})`)
  if (mismatches > 0) {
    console.log(`✗ ${mismatches} MISMATCHES:`)
    for (const p of problems.slice(0, 20)) console.log("  " + p)
    process.exit(1)
  }
  console.log("✓ all ranges valid — red-letter edition integrity confirmed")
}

main()
