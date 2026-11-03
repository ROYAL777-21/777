// ── Growth tips per unit ──────────────────────────────────────
// Every unit gets three tips: how to grow INSIDE the app ecosystem,
// how to grow OUTSIDE the app, and a ROUTINE that compounds progress.

import type { SeedCourse, SeedUnit } from "./helpers"

export type UnitTips = { inApp: string; outsideApp: string; routine: string }

/** course-specific tip flavors — keyed by course code */
const COURSE_TIPS: Record<
  string,
  {
    inApp: string[]
    outsideApp: string[]
    routine: string[]
  }
> = {
  greek: {
    inApp: [
      "Tap the 🔊 speaker button on every card before answering — hearing the word while reading it doubles retention.",
      "Use the Listening Lab and Spelling Studio lessons in this unit: they drill sound → meaning and sound → spelling, the two skills that unlock real reading.",
      "Miss a word? It comes back in your Practice Hub within days. Reviewing mistakes is worth more XP per minute than new lessons.",
      "Say each word out loud in Speak Out even if you feel silly — pronunciation is muscle memory, not knowledge.",
    ],
    outsideApp: [
      "Write the letters or words from this unit by hand three times each — handwriting builds recognition far faster than typing.",
      "Open John 1 or Psalm 23 in an interlinear Bible (scripture4all.org or Blue Letter Bible) and hunt for words you already know.",
      "Listen to the Greek Audio Bible on Bible.is or Faith Comes By Hearing while commuting — even passive listening tunes your ear.",
      "Label items around your home with sticky notes using Greek words you've learned — vocabulary lives in places, not lists.",
    ],
    routine: [
      "Morning: 1 lesson (5 min) + tap-through of yesterday's Practice Hub queue. Evening: handwrite this unit's new words once.",
      "Stack Greek onto an existing habit: after your morning coffee, do one lesson. After brushing teeth at night, listen to one Greek audio chapter.",
      "Two-minute rule: on busy days, open the app and do one Listening Lab — a tiny rep keeps the streak and the script fresh.",
    ],
  },
  hebrew: {
    inApp: [
      "Hebrew reads right-to-left — trace each word with your finger on screen from the right before answering.",
      "Tap 🔊 on every card. Hebrew vowel sounds (nikkud) are best learned by ear first, eyes second.",
      "The Spelling Studio lesson rebuilds each word letter-by-letter — redo it weekly until spelling feels automatic.",
      "Practice Hub mistakes queue is your best friend here; Hebrew letters fade fast without spaced review.",
    ],
    outsideApp: [
      "Write each new letter on paper ten times while saying its name aloud — the alef-bet is learned in the hand.",
      "Follow along in a Hebrew-English Tanakh (or an interlinear) at Genesis 1 — find words you know from this unit.",
      "Say the Shema (Deut 6:4) aloud in Hebrew each evening — it's short, famous, and packs in letters you're learning.",
      "Listen to Hebrew audio Psalms while walking; don't translate, just let the sounds become familiar friends.",
    ],
    routine: [
      "Morning: one lesson. Night: handwrite the letters from this unit's Spelling Studio once, right to left.",
      "Pair practice with prayer time: read one verse aloud in Hebrew (however slowly) before your regular devotion.",
      "Weekly: retake the unit's Speak Out lesson to keep pronunciation sharp, then one Practice Hub session.",
    ],
  },
  "bible-survey": {
    inApp: [
      "After each lesson, open the Bible tab and skim the chapter the lesson referenced — seeing the context cements the story.",
      "Stories in Story Mode dramatize many of these passages; read one after finishing a unit for a narrative review.",
      "Turn on notifications and answer the Daily Quiz every day — Bible knowledge grows by spaced exposure, not cramming.",
      "Use the placement test if you already know a section — it respects your time and keeps you at the right difficulty.",
    ],
    outsideApp: [
      "Read one full chapter of the covered book in your own Bible after each lesson — app + Scripture together beat either alone.",
      "Retell today's story to a friend or family member in two minutes — teaching is the fastest way to remember.",
      "Journal one sentence per lesson: 'Today I learned…'. A one-line journal compounds into a testimony over a year.",
      "Listen to an audio Bible on your commute for the books this course covers.",
    ],
    routine: [
      "Morning: one lesson. Right after: the matching Bible chapter in the reader. Evening: the Daily Quiz.",
      "Sunday rhythm: start a reading plan in the Bible tab that matches this course, one plan-day per day.",
      "Stack it: lesson with breakfast, quiz with dinner, chapter before bed — three small touches beat one long sitting.",
    ],
  },
  "study-methods": {
    inApp: [
      "Actually practice each method on a real passage in the Bible tab the same day you learn it — method without practice evaporates.",
      "The Daily Quiz and Practice Hub both use spaced repetition — trust the schedule instead of re-reading old lessons.",
      "Finish a method unit, then try it on a story in Story Mode: observation questions work great on dialogue.",
    ],
    outsideApp: [
      "Pick one verse from your reading this week and apply today's method on paper — one column of notes is enough.",
      "Join (or start) a small group Bible study and volunteer to lead once using a method from this course.",
      "Get a simple study notebook: date, passage, observation, interpretation, application — four lines a day.",
    ],
    routine: [
      "Morning: one lesson. Later: apply the method to one verse. Weekly: review your notes page.",
      "Pair the app with your quiet time: lesson first, then the method on the day's reading, then prayer over what you saw.",
    ],
  },
  worldviews: {
    inApp: [
      "After each lesson, read the matching Story Mode dialogue — worldviews are best tested in conversation, not quizzes.",
      "Revisit the Practice Hub for this unit before discussing religion with friends; sharp recall makes gentle answers.",
      "Cross-reference: when this course cites a verse, open it in the Bible tab and read the surrounding context.",
    ],
    outsideApp: [
      "Have one curious conversation this week where you ask three questions before making one statement.",
      "Read one primary source from the worldview you studied (a sutra, the Qur'an's Jesus verses, a Humanist manifesto) — primary sources prevent caricature.",
      "Pray for one friend who holds the view you studied — understanding without love curdles into debate-club pride.",
    ],
    routine: [
      "Morning: one lesson. Weekly: one conversation or primary-source reading. Keep a 'questions I couldn't answer' list — it's your growth map.",
    ],
  },
  manuscripts: {
    inApp: [
      "After a manuscript lesson, open the Bible tab to the same passage — you'll never read it the same way again.",
      "Zoom the practice images slowly; paleography is trained attention, not talent.",
      "Review older units in the Practice Hub — dates and manuscript numbers are exactly the kind of detail spaced review protects.",
    ],
    outsideApp: [
      "Visit a museum with a manuscript exhibit, or browse the digitized Dead Sea Scrolls and Codex Sinaiticus online this week.",
      "Copy a verse by hand in your neatest script — scribes' work becomes real when your hand aches after one verse.",
    ],
    routine: [
      "Morning: one lesson. Weekly: fifteen minutes with a digitized manuscript (csntm.org or bl.uk) just to look slowly.",
    ],
  },
  apologetics: {
    inApp: [
      "Do the Listening Lab for this unit — hearing an argument stated fluently prepares you to say it in real conversations.",
      "Story Mode apologetics dialogues are rehearsals for real talks; retry them and aim for perfect comprehension.",
      "After each lesson, write the core claim in your own words somewhere — an argument you can't restate isn't yours yet.",
    ],
    outsideApp: [
      "Share one argument with a friend this week — not to win, but to practice kindness and clarity together.",
      "Read the primary source behind the argument (e.g., the actual Aquinas selection, the actual Craig debate transcript) once per unit.",
      "Memorize one key verse per argument — 'always being prepared to give a reason' (1 Pet 3:15) includes the reason.",
    ],
    routine: [
      "Morning: one lesson. Weekly: one conversation or one primary reading. Keep answers gentle: 'with gentleness and respect' is part of the method.",
    ],
  },
  existence: {
    inApp: [
      "Work the Mastery lesson of this unit until you can score perfect — these arguments build on each other, so gaps compound.",
      "Use Practice Hub daily; premises and objections are exactly what forgetting curves eat first.",
      "Pair each argument with its Scripture anchor in the Bible tab — faith seeking understanding works both directions.",
    ],
    outsideApp: [
      "Explain one argument to someone with no philosophy background this week — if you can make a child understand the kalam, you understand it.",
      "Write a one-page 'steel-man' of the strongest objection to your favorite argument; steel-manning is how thinkers grow.",
    ],
    routine: [
      "Morning: one lesson + Practice Hub queue. Weekly: one explain-it-to-a-friend rep. Monthly: re-read your notes on the classic theses.",
    ],
  },
  ethics: {
    inApp: [
      "Before answering scenario questions, pause and name the principle at stake — naming is half the skill.",
      "Pair each unit with the related passages in the Bible tab; Christian ethics is Scriptural before it is philosophical.",
      "Revisit wrong answers in the Practice Hub — ethical reasoning improves fastest where it failed last.",
    ],
    outsideApp: [
      "Take one real decision this week and write it up: facts, principles, options, choice — a mini case study of your own life.",
      "Discuss one dilemma at dinner (age-appropriate) — families that reason together grow together.",
    ],
    routine: [
      "Morning: one lesson. Evening: one line in a decision journal. Weekly: one real-life application.",
    ],
  },
  metaphysics: {
    inApp: [
      "Read each INFO card twice — once for the claim, once for the example; metaphysics without examples is fog.",
      "The Mastery lessons here are timed — treat them like sparring: fast retrieval is proof of real understanding.",
      "Use Practice Hub before bed; abstract terms consolidate strongly during sleep.",
    ],
    outsideApp: [
      "Explain one concept (act/potency, universals, divine simplicity) using a kitchen object at the table — embodiment beats abstraction.",
      "Read one primary-source page per unit (a slice of Plato, Aristotle, Aquinas) — the app is the map, they are the territory.",
    ],
    routine: [
      "Morning: one lesson. Evening: explain today's concept aloud in 60 seconds to anyone (or your journal). Weekly: one primary page.",
    ],
  },
}

/** per-unit spot overrides — course-agnostic fallback otherwise */
function fallbackTips(unit: SeedUnit, index: number): UnitTips {
  return {
    inApp: `Do this unit's Listening Lab and Mastery lessons back-to-back, then clear the Practice Hub queue the next day — hear it, prove it, review it.`,
    outsideApp: `Apply today's idea to one real passage or conversation outside the app within 24 hours — knowledge you use within a day becomes knowledge you keep.`,
    routine: `Anchor practice to an existing habit (coffee, commute, bedtime): one lesson at the same time daily beats three lessons once a week. Streaks protect routines; routines protect streaks.`,
  }
}

/** deterministic pick so every re-seed gives the same tips */
function pick<T>(arr: T[], seed: string, salt: number): T {
  let h = 2166136261
  const s = seed + ":" + salt
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return arr[Math.abs(h) % arr.length]
}

/** build the tips map: `${courseCode}-u${unitIndex+1}` → tips */
export function buildUnitTips(courses: SeedCourse[]): Record<string, UnitTips> {
  const map: Record<string, UnitTips> = {}
  for (const c of courses) {
    const flavor = COURSE_TIPS[c.code]
    c.units.forEach((u, ui) => {
      const key = `${c.code}-u${ui + 1}`
      if (!flavor) {
        map[key] = fallbackTips(u, ui)
        return
      }
      map[key] = {
        inApp: pick(flavor.inApp, key, 1),
        outsideApp: pick(flavor.outsideApp, key, 2),
        routine: pick(flavor.routine, key, 3),
      }
    })
  }
  return map
}
