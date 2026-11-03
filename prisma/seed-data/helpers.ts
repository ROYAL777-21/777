// ── Seed content type definitions & builder helpers ──────────

export type SeedOption = {
  text: string
  correct?: boolean
  matchId?: string
  wordOrder?: number
  order?: number
}

export type SeedChallenge = {
  type: "INFO" | "SELECT" | "ASSIST" | "MATCH" | "ARRANGE" | "TYPE" | "LISTEN" | "SPEAK"
  prompt: string
  question: string
  meaning?: string
  transliteration?: string
  options: SeedOption[]
}

export type SeedLesson = {
  title: string
  challenges: SeedChallenge[]
}

export type SeedUnit = {
  title: string
  description: string
  emoji: string
  color: string
  /** 1 Foundations · 2 Growing · 3 Advanced (timed). Default: ramp by unit index. */
  difficulty?: number
  lessons: SeedLesson[]
}

export type SeedCourse = {
  code: string
  title: string
  subtitle: string
  description: string
  emoji: string
  color: string
  order: number
  units: SeedUnit[]
}

// deterministic "shuffle" so seeds are stable across runs
function hash(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

function mix<T>(correct: T, wrongs: T[]): { item: T; correct: boolean }[] {
  const arr = [{ item: correct, correct: true }, ...wrongs.map((w) => ({ item: w, correct: false }))]
  const r = hash(String(correct)) % arr.length
  return [...arr.slice(r), ...arr.slice(0, r)]
}

// accept "answer" or ["answer"] for the correct value
function one(correct: string | string[]): string {
  return Array.isArray(correct) ? correct[0] : correct
}

/** Teaching card — no answer required */
export const info = (title: string, body: string, transliteration?: string): SeedChallenge => ({
  type: "INFO",
  prompt: "Study this",
  question: title,
  meaning: body,
  transliteration,
  options: [],
})

/** Multiple choice — two accepted shapes:
 *  sel(prompt, question, correct, wrongs, meaning?, translit?) — stimulus card + options
 *  sel(question, correct, wrongs, meaning?)                    — question itself displayed
 */
export function sel(...args: unknown[]): SeedChallenge {
  let prompt: string, question: string, correct: string, wrongs: string[], meaning: string | undefined, transliteration: string | undefined
  if (Array.isArray(args[2])) {
    prompt = "Choose the correct answer"
    question = args[0] as string
    correct = args[1] as string
    wrongs = args[2] as string[]
    meaning = args[3] as string | undefined
  } else {
    prompt = args[0] as string
    question = args[1] as string
    correct = args[2] as string
    wrongs = args[3] as string[]
    meaning = args[4] as string | undefined
    transliteration = args[5] as string | undefined
  }
  return {
    type: "SELECT",
    prompt,
    question,
    meaning,
    transliteration,
    options: mix(one(correct), wrongs).map((o) => ({ text: o.item, correct: o.correct })),
  }
}

/** Fill in the blank (sentence shown with ___) */
export const assist = (
  prompt: string,
  sentence: string,
  correct: string | string[],
  wrongs: string[],
  meaning?: string,
  transliteration?: string
): SeedChallenge => ({
  type: "ASSIST",
  prompt,
  question: sentence,
  meaning,
  transliteration,
  options: mix(one(correct), wrongs).map((o) => ({ text: o.item, correct: o.correct })),
})

/** Tap-the-pairs exercise. pairs: [term, definition][] */
export const match = (prompt: string, pairs: [string, string][]): SeedChallenge => ({
  type: "MATCH",
  prompt,
  question: "Tap the matching pairs",
  options: pairs.flatMap(([a, b], i) => [
    { text: a, matchId: `p${i}`, correct: true, order: i * 2 },
    { text: b, matchId: `p${i}`, correct: true, order: i * 2 + 1 },
  ]),
})

/** Build-a-translation with word bank */
export const arrange = (
  prompt: string,
  target: string,
  words: string[],
  distractors: string[] = [],
  meaning?: string,
  transliteration?: string
): SeedChallenge => ({
  type: "ARRANGE",
  prompt,
  question: target,
  meaning,
  transliteration,
  options: [
    ...words.map((w, i) => ({ text: w, wordOrder: i + 1, correct: true })),
    ...distractors.map((w) => ({ text: w, wordOrder: -1, correct: false })),
  ],
})

/** Free-text answer. If the displayed question would give away the answer
 *  (question is one of the accepted answers), it is masked into a hint
 *  like "T______" so the exercise stays a real recall test. */
export function typeAns(
  prompt: string,
  question: string,
  answers: string[],
  meaning?: string,
  transliteration?: string
): SeedChallenge {
  const norm = (s: string) =>
    s.toLowerCase().trim().replace(/[.,!?;:'"’‘“”()[\]]/g, "").replace(/\s+/g, " ")
  const selfAnswering = answers.some((a) => norm(a) === norm(question))
  const display = selfAnswering ? maskAnswer(question) : question
  return {
    type: "TYPE",
    prompt,
    question: display,
    meaning,
    transliteration,
    options: answers.map((a) => ({ text: a, correct: true })),
  }
}

function maskAnswer(ans: string): string {
  const masked = ans
    .split(" ")
    .map((w) => (w ? w[0] + "_".repeat(Math.max(1, w.length - 1)) : w))
    .join(" ")
  return masked.length <= 2 ? "✍️" : masked
}
