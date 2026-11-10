// ── Course metadata: categories, taglines, ordering ──────────
// Shared by CoursesView, Onboarding and the bootstrap API.

export type CourseCategory = "language" | "study" | "denomination"

const CATEGORY_BY_CODE: Record<string, CourseCategory> = {
  greek: "language",
  hebrew: "language",
  manuscripts: "study",
  apologetics: "study",
  bibleSurvey: "study",
  studyMethods: "study",
  worldviews: "study",
  logic: "study",
  existence: "study",
  ethics: "study",
  metaphysics: "study",
}

export function courseCategory(code: string): CourseCategory {
  if (code.startsWith("denom-")) return "denomination"
  return CATEGORY_BY_CODE[code] ?? "study"
}

export const CATEGORY_META: Record<CourseCategory, { label: string; emoji: string; blurb: string }> = {
  language: {
    label: "Languages",
    emoji: "🗣️",
    blurb: "Read the Bible in its own words",
  },
  study: {
    label: "Bible & Study",
    emoji: "📖",
    blurb: "Know the Book and defend the faith",
  },
  denomination: {
    label: "Denominations",
    emoji: "⛪",
    blurb: "The great traditions of the faith — most popular first",
  },
}

export const COURSE_TAGLINES: Record<string, string[]> = {
  greek: ["Α α Alpha → Ω ω Omega", "Read John 1:1 in Greek", "Koine — the people's language"],
  hebrew: ["א Aleph → ת Tav", "Open Genesis 1:1 yourself", "Right to left, right to life"],
  manuscripts: ["Sinaiticus & Vaticanus", "Dead Sea Scrolls", "24,000+ witnesses"],
  apologetics: ["1 Peter 3:15", "The case for the resurrection", "Gentleness and respect"],
  bibleSurvey: ["Genesis to Revelation", "66 books, one story", "The whole counsel of God"],
  studyMethods: ["Observation → Interpretation → Application", "SOAP & inductive study", "Dust off every page"],
  worldviews: ["Test every idea", "The battle for hearts and minds", "2 Corinthians 10:5"],
  logic: ["Acts 17:11 — the Berean method", "Dissect any argument", "Name the fallacy, defuse it"],
  existence: ["Why is there something rather than nothing?", "Cosmological & ontological arguments", "Leibniz, Aquinas & crew"],
  ethics: ["Right, wrong & the Good", "From Sinai to the Sermon", "Living worthy of the gospel"],
  metaphysics: ["What is real?", "Universals, souls & time", "The philosophy beneath theology"],
  "denom-catholic": ["1.3 billion believers", "Mass & seven sacraments", "Peter's see since AD 64"],
  "denom-orthodox": ["Icons & theosis", "The church of the Seven Councils", "Unbroken from Pentecost"],
  "denom-pentecostal": ["Azusa Street 1906", "Spirit-filled & global", "600 million and counting"],
  "denom-baptist": ["Believer's baptism", "Local church autonomy", "Expect great things from God"],
  "denom-anglican": ["Book of Common Prayer", "Via media", "One church, three accents"],
  "denom-methodist": ["A heart strangely warmed", "Sanctification & class meetings", "Hymns that teach theology"],
  "denom-reformed": ["Calvin, Dort & TULIP", "Westminster Standards", "Soli Deo gloria"],
  "denom-lutheran": ["Here I stand", "Grace alone, faith alone", "Christ in, with, under"],
}
