# Scripture in the interface — design rules

> “Thy word is a lamp unto my feet, and a light unto my path.” — Psalm 119:105

Scripture in Scroll Academy is never decoration. These rules keep it intentional.

## Where verses live (one source per job)

| System | File | Job |
| --- | --- | --- |
| Microcopy | `src/lib/scripture.ts` | the day's path verse, loading verses, milestone verses, the invite & rest verses |
| Reader | `src/lib/bible.ts` | verse-of-the-day pool, reading plans, book metadata |
| Red-letter | `src/lib/redletter.ts` + `redletter-data.json` | 2,082 verses as character offsets into the exact KJV text (`public/bible/*.json`) |
| Journeys | `src/lib/journeys.ts` | notification verse pool (exact KJV, cited) |

## The restraint rules

1. **Exact KJV, always cited.** Letter-perfect text (public domain), reference included.
   Ellipses allowed when trimming; paraphrase never.
2. **Never on money surfaces.** No verse on the paywall, checkout, shop, gift or
   referral-reward screens. Scripture is not merchandising.
3. **Never on error states.** When something breaks, say so plainly.
4. **One verse per surface.** A surface that already speaks doesn't need a psalm
   shouting over it.
5. **Milestones carry their own verses** — the numbers Scripture pauses on:
   3 (Hosea 6:2), 7 (Exodus 20:8), 12 (Matthew 10:1), 40 (Deuteronomy 8:2),
   50 (Leviticus 25:10), 100 (Matthew 13:8), 365 (Psalm 19:2). Shown only on the
   exact day the streak reaches them.

## Where it shows up today

- The learn path header — one quiet verse a day under the daily-goal card
  (milestone verse takes the slot on milestone days)
- The loading screen — the day's waiting verse
- Empty hearts — Matthew 11:28 (rest, not pressure)
- Friends & referral — Ecclesiastes 4:9
- The splash — Psalm 119:105, the verse the whole product is built on, and the
  reason the path is a trail of **footprints**
- The profile footer, statement of faith, growth-habit cards (pre-existing)

## Verification

`bun run redletter:verify` proves every red-letter offset matches the KJV text
character-for-character. The doctrinal audit history lives in `docs/CHANGELOG.md`.
