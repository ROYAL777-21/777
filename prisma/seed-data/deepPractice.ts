// ── Deep Practice expansion ───────────────────────────────────
// Appends FIVE new lessons to every unit of every course:
//   +1 Listening Lab  (LISTEN — hear the term, choose the meaning)
//   +2 Spelling Studio (TYPE — hear/see the meaning, spell the term)
//   +3 Speak Out      (SPEAK — hear the model, record yourself, compare)
//   +4 Mixed Review   (remix of the unit's original challenges)
//   +5 Unit Mastery   (harder mixed test incl. reverse direction)
// Language courses (Greek/Hebrew) exercise the original script;
// content courses exercise key terms & definitions.

import type { SeedChallenge, SeedCourse, SeedUnit } from "./helpers"

// ── vocabulary mining ─────────────────────────────────────────

export type VocabEntry = {
  term: string // the thing to hear/say/spell
  definition: string // short meaning (≤ 90 chars)
  translit?: string
  distractors: string[] // wrong definitions
}

function short(s: string, max = 90): string {
  const clean = s.replace(/\s+/g, " ").trim()
  if (clean.length <= max) return clean
  // cut at sentence boundary if possible
  const sentenceEnd = clean.slice(0, max).search(/[.!?](\s|$)/)
  if (sentenceEnd > 30) return clean.slice(0, sentenceEnd + 1).trim()
  return clean.slice(0, max - 1).trim() + "…"
}

/** mine a unit's challenges into vocab entries usable for listen/spell/speak */
export function mineVocab(unit: SeedUnit): VocabEntry[] {
  const out: VocabEntry[] = []
  const seen = new Set<string>()

  const push = (e: VocabEntry) => {
    const k = e.term.toLowerCase()
    if (!k || seen.has(k)) return
    if (e.term.length > 40 || e.definition.length < 4) return
    if (e.distractors.length < 2) return
    seen.add(k)
    out.push(e)
  }

  for (const lesson of unit.lessons) {
    for (const ch of lesson.challenges) {
      if (ch.type === "MATCH") {
        // regroup options by matchId → [term, definition] pairs
        const groups = new Map<string, string[]>()
        for (const o of ch.options) {
          if (!o.matchId) continue
          groups.set(o.matchId, [...(groups.get(o.matchId) ?? []), o.text])
        }
        const pairList = [...groups.values()].filter((g) => g.length === 2)
        const defs = pairList.map((g) => g[1])
        for (const [i, g] of pairList.entries()) {
          push({
            term: g[0],
            definition: short(g[1]),
            distractors: defs.filter((_, j) => j !== i).slice(0, 3),
          })
        }
      } else if (ch.type === "SELECT") {
        // term → meaning question with explanation
        const hasOptions = ch.options.filter((o) => o.correct).length === 1
        if (!hasOptions) continue
        const q = ch.question.replace(/\s+/g, " ").trim()
        const isTermLike = q.length <= 34 && !q.endsWith("?") && !q.includes("___")
        if (!isTermLike) continue
        // skip decorative check-labels ("⚙️ Grammar check") that some sel() styles put in the question slot
        const isLabel = /check/i.test(q) || !/^[A-Za-z0-9\"'(]/.test(q) || q === ch.prompt?.trim()
        if (isLabel) continue
        const meaning = ch.meaning ? short(ch.meaning) : short(ch.options.find((o) => o.correct)?.text ?? "")
        push({
          term: q,
          definition: meaning,
          translit: ch.transliteration ?? undefined,
          distractors: ch.options.filter((o) => !o.correct).map((o) => short(o.text)).slice(0, 3),
        })
      }
    }
  }
  return out
}

/** recitation lines for SPEAK in content courses (verses / key sentences) */
function mineRecitations(unit: SeedUnit): { text: string; translit?: string; meaning?: string }[] {
  const out: { text: string; translit?: string; meaning?: string }[] = []
  const push = (raw: string, translit?: string, meaning?: string) => {
    const t = raw.replace(/\s+/g, " ").trim()
    if (t.length < 8 || t.length > 110) return
    if (/^[#*>-]/.test(t)) return
    if (out.some((o) => o.text === t)) return
    out.push({ text: t, translit, meaning })
  }
  for (const lesson of unit.lessons) {
    for (const ch of lesson.challenges) {
      if (ch.type === "INFO" && ch.meaning) {
        // speak the teaching card's first sentence, not its (often playful) title
        const first = ch.meaning.split(/(?<=[.!?])\s/)[0] ?? ""
        push(first, ch.transliteration ?? undefined, ch.meaning)
      }
      if (ch.type === "ARRANGE") {
        // join the word-bank tokens in order — the actual sentence
        const words = ch.options
          .filter((o) => o.wordOrder && o.wordOrder > 0)
          .sort((a, b) => (a.wordOrder ?? 0) - (b.wordOrder ?? 0))
          .map((o) => o.text)
        if (words.length >= 3) push(words.join(" "), ch.transliteration ?? undefined, ch.meaning ?? undefined)
      }
    }
  }
  return out.slice(0, 8)
}

// ── challenge builders ────────────────────────────────────────

function listenChallenge(v: VocabEntry, reverse: boolean, termDistractors: string[] = []): SeedChallenge {
  if (reverse) {
    // see the definition → choose the TERM (harder)
    return {
      type: "SELECT",
      prompt: "Which term matches this description?",
      question: v.definition,
      meaning: `${v.term}${v.translit ? ` (${v.translit})` : ""} — ${v.definition}`,
      transliteration: v.translit,
      options: mixOptions(v.term, termDistractors.length >= 2 ? termDistractors : v.distractors),
    }
  }
  // hear the term → choose the meaning
  return {
    type: "LISTEN",
    prompt: "Tap play, listen carefully, then choose the meaning",
    question: v.term,
    meaning: `${v.term}${v.translit ? ` — ${v.translit}` : ""}: ${v.definition}`,
    transliteration: v.translit,
    options: mixOptions(v.definition, v.distractors),
  }
}

function hasGreekOrHebrew(s: string): boolean {
  return /[\u0370-\u03FF\u0590-\u05FF]/.test(s)
}

function spellChallenge(v: VocabEntry): SeedChallenge {
  const isScript = hasGreekOrHebrew(v.term)
  return {
    type: "TYPE",
    prompt: isScript
      ? "Spell it: play the word, then type what you hear"
      : "Type the term that matches this description",
    question: v.definition,
    meaning: `${v.term}${v.translit ? ` (${v.translit})` : ""} — ${v.definition}`,
    transliteration: v.translit,
    options: [
      { text: v.term, correct: true },
      ...(v.translit ? [{ text: v.translit, correct: true }] : []),
    ],
  }
}

function speakChallenge(
  v: VocabEntry,
): SeedChallenge {
  return {
    type: "SPEAK",
    prompt: "Listen to the model, then say it yourself",
    question: v.term,
    meaning: v.definition,
    transliteration: v.translit,
    options: [],
  }
}

function mixOptions(correct: string, wrongs: string[]) {
  const opts = [{ text: correct, correct: true }, ...wrongs.slice(0, 3).map((w) => ({ text: w, correct: false }))]
  // deterministic-ish spread: rotate by length
  const r = correct.length % opts.length
  return [...opts.slice(r), ...opts.slice(0, r)]
}

// ── lesson assembly ───────────────────────────────────────────

const pickN = <T,>(arr: T[], n: number, salt: number): T[] => {
  if (arr.length <= n) return [...arr]
  const out: T[] = []
  let h = salt
  const pool = [...arr]
  while (out.length < n && pool.length > 0) {
    h = (h * 9301 + 49297) % 233280
    out.push(pool.splice(Math.floor((h / 233280) * pool.length), 1)[0])
  }
  return out
}

export function expandUnitWithDeepPractice(unit: SeedUnit): SeedUnit["lessons"] {
  const vocab = mineVocab(unit)
  const recitations = mineRecitations(unit)
  const newLessons: SeedUnit["lessons"] = []

  // original challenges pool for review lessons
  const pool: SeedChallenge[] = []
  for (const l of unit.lessons) {
    for (const ch of l.challenges) {
      if (ch.type !== "INFO") pool.push({ ...ch })
    }
  }

  // ── +1 Listening Lab ──
  {
    const items = pickN(vocab, 6, 17)
    const challenges: SeedChallenge[] = [
      {
        type: "INFO",
        prompt: "Study this",
        question: "🔊 Listening Lab",
        meaning:
          "Ears first! Tap the speaker to hear each term spoken, then choose what it means. Hearing a term before reading it builds the sound-meaning link that makes vocabulary stick. Replay the audio as many times as you need — repetition is the point, not cheating.",
        options: [],
      },
    ]
    items.forEach((v) => challenges.push(listenChallenge(v, false)))
    if (items.length < 4) {
      // unit has little vocab — fall back to a compact review of SELECT items
      pickN(pool.filter((c) => c.type === "SELECT" || c.type === "ASSIST"), 4, 29).forEach((c) => challenges.push(c))
    }
    if (challenges.length > 1) newLessons.push({ title: "Listening Lab", challenges })
  }

  // ── +2 Spelling Studio ──
  {
    const items = pickN(vocab, 6, 43)
    const challenges: SeedChallenge[] = [
      {
        type: "INFO",
        prompt: "Study this",
        question: "✍️ Spelling Studio",
        meaning:
          "Type each term after reading its meaning. For Greek and Hebrew an on-screen letter keyboard appears — tap the letters in order (Hebrew goes right to left!). Spelling forces your brain to encode every letter, which is why strong spellers recognize words more quickly when reading.",
        options: [],
      },
    ]
    items.forEach((v) => challenges.push(spellChallenge(v)))
    if (items.length < 4) {
      pickN(pool.filter((c) => c.type === "TYPE"), 4, 61).forEach((c) => challenges.push(c))
      pickN(pool.filter((c) => c.type === "SELECT" || c.type === "ASSIST"), 4 - items.length, 67).forEach((c) =>
        challenges.push(c)
      )
    }
    if (challenges.length > 1) newLessons.push({ title: "Spelling Studio", challenges })
  }

  // ── +3 Speak Out ──
  {
    const items = pickN(vocab, 4, 71)
    const recs = pickN(recitations, 3, 83)
    const challenges: SeedChallenge[] = [
      {
        type: "INFO",
        prompt: "Study this",
        question: "🎙️ Speak Out",
        meaning:
          "Time to use your voice: play the model pronunciation, then record yourself saying the same word or line. Compare the two playbacks honestly and mark how it went. Speaking out loud recruits motor memory — words your mouth has formed are far harder to forget. (Mic permission is only requested when you press record.)",
        options: [],
      },
    ]
    items.forEach((v) => challenges.push(speakChallenge(v)))
    recs.forEach((r) =>
      challenges.push({
        type: "SPEAK",
        prompt: "Read this line aloud — recitation is memory's oldest tool",
        question: r.text,
        meaning: r.meaning ?? undefined,
        transliteration: r.translit ?? undefined,
        options: [],
      })
    )
    if (challenges.length > 1) newLessons.push({ title: "Speak Out", challenges })
  }

  // ── +4 Mixed Review ──
  {
    const items = pickN(pool, 8, 97)
    if (items.length >= 4) {
      newLessons.push({
        title: "Mixed Review",
        challenges: [
          {
            type: "INFO",
            prompt: "Study this",
            question: "🌀 Mixed Review",
            meaning:
              "Everything from this unit shuffled together: choose, match, arrange, and type. Mixed practice feels harder than blocked practice — that difficulty is exactly what makes it build durable knowledge. Miss something? It will resurface in your Practice Hub.",
            options: [],
          },
          ...items,
        ],
      })
    }
  }

  // ── +5 Unit Mastery ──
  {
    const forward = pickN(vocab, 3, 113).map((v) => listenChallenge(v, false))
    const reverse = pickN(vocab, 3, 131).map((v) =>
      listenChallenge(
        v,
        true,
        pickN(
          vocab.filter((o) => o.term !== v.term && o.term.length <= 40),
          3,
          139 + v.term.length,
        ).map((o) => o.term),
      )
    )
    const hard = pickN(pool.filter((c) => c.type === "ARRANGE" || c.type === "TYPE"), 3, 149)
    const challenges: SeedChallenge[] = [
      {
        type: "INFO",
        prompt: "Study this",
        question: "🏅 Unit Mastery",
        meaning:
          "The graduation test for this unit: listen, reverse-match, and produce — the hardest directions. Score a perfect run for bonus XP. Mastery here unlocks smoother progress in the next unit, since every unit builds on this one.",
        options: [],
      },
      ...forward,
      ...reverse,
      ...hard,
    ]
    if (challenges.length > 2) newLessons.push({ title: "Unit Mastery", challenges })
  }

  return newLessons
}

/** apply the +5 expansion to every unit of every course (mutates copies) */
export function expandCoursesWithDeepPractice(courses: SeedCourse[]): SeedCourse[] {
  return courses.map((c) => ({
    ...c,
    units: c.units.map((u) => ({
      ...u,
      lessons: [...u.lessons, ...expandUnitWithDeepPractice(u)],
    })),
  }))
}
