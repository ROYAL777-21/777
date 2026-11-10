// ═══════════════════════════════════════════════════════════════
//  SCRIPTURE MICROCOPY (v9)
//
//  One home for every verse quoted as interface copy — the same
//  discipline the Bible reader already follows (exact KJV, always
//  cited), applied to the whole app.
//
//  THE RESTRAINT RULES (keep it subtle, never wallpaper):
//   1. Never on money surfaces — no verse on the paywall, checkout,
//      shop or gift screens. Scripture is not merchandising.
//   2. Never on error states — when something breaks, say so plainly.
//   3. One verse per surface, max. A surface that already speaks
//      does not need a psalm shouting over it.
//   4. Exact KJV text (public domain), always with its reference.
//      The red-letter edition and reader keep their own systems
//      (redletter.ts / bible.ts) — this module is only microcopy.
// ═══════════════════════════════════════════════════════════════

export interface Verse {
  text: string
  ref: string
}

/** verses about the path — one a day under the daily-goal card */
export const PATH_VERSES: Verse[] = [
  { text: "Thy word is a lamp unto my feet, and a light unto my path.", ref: "Psalm 119:105" },
  { text: "Shew me thy ways, O LORD; teach me thy paths.", ref: "Psalm 25:4" },
  { text: "In all thy ways acknowledge him, and he shall direct thy paths.", ref: "Proverbs 3:6" },
  { text: "This is the way, walk ye in it.", ref: "Isaiah 30:21" },
  { text: "Thou wilt shew me the path of life.", ref: "Psalm 16:11" },
]

/** verses for the quiet moments — loading screens */
export const LOADING_VERSES: Verse[] = [
  { text: "Be still, and know that I am God.", ref: "Psalm 46:10" },
  { text: "But they that wait upon the LORD shall renew their strength.", ref: "Isaiah 40:31" },
  { text: "They are new every morning: great is thy faithfulness.", ref: "Lamentations 3:23" },
  { text: "Wait on the LORD: be of good courage, and he shall strengthen thine heart.", ref: "Psalm 27:14" },
]

/**
 * Today's Manna (v11.5) — the daily portion.
 * Fresh every morning, one per day, gathered with a tap on the path.
 * All exact KJV, all about the morning portion / daily bread / the word gathered.
 */
export const MANNA_VERSES: Verse[] = [
  { text: "Give us this day our daily bread.", ref: "Matthew 6:11" },
  { text: "They are new every morning: great is thy faithfulness.", ref: "Lamentations 3:22–23" },
  { text: "O satisfy us early with thy mercy; that we may rejoice and be glad all our days.", ref: "Psalm 90:14" },
  { text: "My voice shalt thou hear in the morning, O LORD; in the morning will I direct my prayer unto thee, and will look up.", ref: "Psalm 5:3" },
  { text: "Cause me to hear thy lovingkindness in the morning; for in thee do I trust.", ref: "Psalm 143:8" },
  { text: "I love them that love me; and those that seek me early shall find me.", ref: "Proverbs 8:17" },
  { text: "He wakeneth morning by morning, he wakeneth mine ear to hear as the learned.", ref: "Isaiah 50:4" },
  { text: "I prevented the dawning of the morning, and cried: I hoped in thy word.", ref: "Psalm 119:147" },
  { text: "His going forth is prepared as the morning; and he shall come unto us as the rain.", ref: "Hosea 6:3" },
  { text: "Thy words were found, and I did eat them; and thy word was unto me the joy and rejoicing of mine heart.", ref: "Jeremiah 15:16" },
  { text: "How sweet are thy words unto my taste! yea, sweeter than honey to my mouth!", ref: "Psalm 119:103" },
  { text: "But his delight is in the law of the LORD; and in his law doth he meditate day and night.", ref: "Psalm 1:2" },
]

/** the manna portion for a given day — stable all day, new at midnight */
export function mannaVerseOfTheDay(): Verse {
  return MANNA_VERSES[dayHash() % MANNA_VERSES.length]
}

/** the friends & referral surfaces — "Two are better than one" */
export const INVITE_VERSE: Verse = {
  text: "Two are better than one; because they have a good reward for their labour.",
  ref: "Ecclesiastes 4:9",
}

/** shown only when hearts are empty — rest, not pressure (tone rule) */
export const HEARTS_VERSE: Verse = {
  text: "Come unto me, all ye that labour and are heavy laden, and I will give you rest.",
  ref: "Matthew 11:28",
}

/**
 * Streak milestones — the numbers Scripture itself pauses on.
 * Shown only on the exact day the streak reaches the number.
 */
export const STREAK_MILESTONES: Record<number, { title: string } & Verse> = {
  3: {
    title: "The Third Day",
    text: "In the third day he will raise us up, and we shall live in his sight.",
    ref: "Hosea 6:2",
  },
  7: {
    title: "A Sabbath Rest",
    text: "Remember the sabbath day, to keep it holy.",
    ref: "Exodus 20:8",
  },
  12: {
    title: "The Twelve",
    text: "And when he had called unto him his twelve disciples…",
    ref: "Matthew 10:1",
  },
  40: {
    title: "Forty in the Wilderness",
    text: "And thou shalt remember all the way which the LORD thy God led thee these forty years in the wilderness.",
    ref: "Deuteronomy 8:2",
  },
  50: {
    title: "Jubilee",
    text: "And ye shall hallow the fiftieth year, and proclaim liberty throughout all the land.",
    ref: "Leviticus 25:10",
  },
  100: {
    title: "An Hundredfold",
    text: "But other fell into good ground, and brought forth fruit, some an hundredfold.",
    ref: "Matthew 13:8",
  },
  365: {
    title: "Day Unto Day",
    text: "Day unto day uttereth speech, and night unto night sheweth knowledge.",
    ref: "Psalm 19:2",
  },
}

// ── helpers ───────────────────────────────────────────────────────

/** FNV-1a over the date key — same deterministic spirit as bible.ts */
function dayHash(d = new Date()): number {
  const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
  let h = 0x811c9dc5
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

/** the day's path verse — stable all day, new tomorrow */
export function pathVerseOfTheDay(): Verse {
  return PATH_VERSES[dayHash() % PATH_VERSES.length]
}

/** the day's loading verse */
export function loadingVerseOfTheDay(): Verse {
  return LOADING_VERSES[dayHash() % LOADING_VERSES.length]
}

/** the milestone verse — only on the exact day it is reached */
export function streakMilestone(streak: number): ({ title: string } & Verse) | null {
  return STREAK_MILESTONES[streak] ?? null
}
