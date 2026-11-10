// ── Bible metadata & reading plans (KJV text served from /bible/{id}.json) ──

export type BibleBook = {
  id: string
  name: string
  testament: "OT" | "NT"
  genre: "Law" | "History" | "Wisdom" | "Major Prophets" | "Minor Prophets" | "Gospels" | "Acts" | "Epistles" | "Apocalyptic"
  chapters: number
  summary: string
}

export const BOOKS: BibleBook[] = [
  { id: "gen", name: "Genesis", testament: "OT", genre: "Law", chapters: 50, summary: "Beginnings: creation, fall, flood, and the family of promise" },
  { id: "exo", name: "Exodus", testament: "OT", genre: "Law", chapters: 40, summary: "Slavery to Sinai — the Passover, the Red Sea, the Law" },
  { id: "lev", name: "Leviticus", testament: "OT", genre: "Law", chapters: 27, summary: "How a holy God dwells among a sinful people" },
  { id: "num", name: "Numbers", testament: "OT", genre: "Law", chapters: 36, summary: "Forty years of wilderness wandering and lessons" },
  { id: "deu", name: "Deuteronomy", testament: "OT", genre: "Law", chapters: 34, summary: "Moses' farewell sermons: love and remember" },
  { id: "jos", name: "Joshua", testament: "OT", genre: "History", chapters: 24, summary: "Conquest and settlement of the promised land" },
  { id: "jdg", name: "Judges", testament: "OT", genre: "History", chapters: 21, summary: "Cycles of sin, crying out, and deliverance" },
  { id: "rut", name: "Ruth", testament: "OT", genre: "History", chapters: 4, summary: "A Moabite widow, a kinsman-redeemer, a royal line" },
  { id: "1sa", name: "1 Samuel", testament: "OT", genre: "History", chapters: 31, summary: "From judges to kings — Samuel, Saul, young David" },
  { id: "2sa", name: "2 Samuel", testament: "OT", genre: "History", chapters: 24, summary: "David's reign: triumph, sin, and unending covenant" },
  { id: "1ki", name: "1 Kings", testament: "OT", genre: "History", chapters: 22, summary: "Solomon's glory, the temple, a kingdom divided" },
  { id: "2ki", name: "2 Kings", testament: "OT", genre: "History", chapters: 25, summary: "Decline and exile — prophets ignored, judgment falls" },
  { id: "1ch", name: "1 Chronicles", testament: "OT", genre: "History", chapters: 29, summary: "Retelling Israel's story for the returned exiles" },
  { id: "2ch", name: "2 Chronicles", testament: "OT", genre: "History", chapters: 36, summary: "Kings and revivals — the temple at the centre" },
  { id: "ezr", name: "Ezra", testament: "OT", genre: "History", chapters: 10, summary: "Return from Babylon and rebuild the altar and temple" },
  { id: "neh", name: "Nehemiah", testament: "OT", genre: "History", chapters: 13, summary: "Prayer, walls, and revival under a cupbearer" },
  { id: "est", name: "Esther", testament: "OT", genre: "History", chapters: 10, summary: "God's hidden providence saving His people" },
  { id: "job", name: "Job", testament: "OT", genre: "Wisdom", chapters: 42, summary: "Suffering, friends who fail, and God's answer" },
  { id: "psa", name: "Psalms", testament: "OT", genre: "Wisdom", chapters: 150, summary: "The prayer and song book of God's people" },
  { id: "pro", name: "Proverbs", testament: "OT", genre: "Wisdom", chapters: 31, summary: "Street-smart godliness in memorable lines" },
  { id: "ecc", name: "Ecclesiastes", testament: "OT", genre: "Wisdom", chapters: 12, summary: "Life under the sun — vapour, apart from God" },
  { id: "sng", name: "Song of Songs", testament: "OT", genre: "Wisdom", chapters: 8, summary: "Covenant love celebrated without shame" },
  { id: "isa", name: "Isaiah", testament: "OT", genre: "Major Prophets", chapters: 66, summary: "Judgment, comfort, and the Suffering Servant" },
  { id: "jer", name: "Jeremiah", testament: "OT", genre: "Major Prophets", chapters: 52, summary: "The weeping prophet and the new covenant promise" },
  { id: "lam", name: "Lamentations", testament: "OT", genre: "Major Prophets", chapters: 5, summary: "Laments over Jerusalem's fall — great is Thy faithfulness" },
  { id: "ezk", name: "Ezekiel", testament: "OT", genre: "Major Prophets", chapters: 48, summary: "Exile visions, dry bones, and a new heart" },
  { id: "dan", name: "Daniel", testament: "OT", genre: "Major Prophets", chapters: 12, summary: "Faithful exiles, empires, and the Son of Man" },
  { id: "hos", name: "Hosea", testament: "OT", genre: "Minor Prophets", chapters: 14, summary: "A prophet's faithful love for an unfaithful wife" },
  { id: "jol", name: "Joel", testament: "OT", genre: "Minor Prophets", chapters: 3, summary: "Locusts as warning; the Spirit poured out" },
  { id: "amo", name: "Amos", testament: "OT", genre: "Minor Prophets", chapters: 9, summary: "Let justice roll down like waters" },
  { id: "oba", name: "Obadiah", testament: "OT", genre: "Minor Prophets", chapters: 1, summary: "Pride over Edom — the day of the LORD" },
  { id: "jon", name: "Jonah", testament: "OT", genre: "Minor Prophets", chapters: 4, summary: "A runaway prophet, a great fish, a merciful God" },
  { id: "mic", name: "Micah", testament: "OT", genre: "Minor Prophets", chapters: 7, summary: "Bethlehem's ruler; do justice, love mercy" },
  { id: "nam", name: "Nahum", testament: "OT", genre: "Minor Prophets", chapters: 3, summary: "Nineveh's fall — God slow to anger but not mocked" },
  { id: "hab", name: "Habakkuk", testament: "OT", genre: "Minor Prophets", chapters: 3, summary: "Questions, woe oracles, and faith that sings" },
  { id: "zep", name: "Zephaniah", testament: "OT", genre: "Minor Prophets", chapters: 3, summary: "The day of the LORD and a rejoicing God" },
  { id: "hag", name: "Haggai", testament: "OT", genre: "Minor Prophets", chapters: 2, summary: "Rebuild the temple — consider your ways" },
  { id: "zec", name: "Zechariah", testament: "OT", genre: "Minor Prophets", chapters: 14, summary: "Night visions and the humble King" },
  { id: "mal", name: "Malachi", testament: "OT", genre: "Minor Prophets", chapters: 4, summary: "Disputes with a tired people; the forerunner promised" },
  { id: "mat", name: "Matthew", testament: "NT", genre: "Gospels", chapters: 28, summary: "Jesus the promised King, fulfilling prophecy" },
  { id: "mrk", name: "Mark", testament: "NT", genre: "Gospels", chapters: 16, summary: "Jesus the swift Servant — 'immediately'" },
  { id: "luk", name: "Luke", testament: "NT", genre: "Gospels", chapters: 24, summary: "Jesus the perfect Man for all nations" },
  { id: "jhn", name: "John", testament: "NT", genre: "Gospels", chapters: 21, summary: "Jesus the divine Son — that you may believe" },
  { id: "act", name: "Acts", testament: "NT", genre: "Acts", chapters: 28, summary: "The Spirit-empowered church from Jerusalem to Rome" },
  { id: "rom", name: "Romans", testament: "NT", genre: "Epistles", chapters: 16, summary: "The gospel from wrath to glory" },
  { id: "1co", name: "1 Corinthians", testament: "NT", genre: "Epistles", chapters: 16, summary: "Church disorders met with the cross and love" },
  { id: "2co", name: "2 Corinthians", testament: "NT", genre: "Epistles", chapters: 13, summary: "Strength made perfect in weakness" },
  { id: "gal", name: "Galatians", testament: "NT", genre: "Epistles", chapters: 6, summary: "Freedom — no other gospel" },
  { id: "eph", name: "Ephesians", testament: "NT", genre: "Epistles", chapters: 6, summary: "The church as God's new humanity, then armor" },
  { id: "php", name: "Philippians", testament: "NT", genre: "Epistles", chapters: 4, summary: "Joy from a prison cell" },
  { id: "col", name: "Colossians", testament: "NT", genre: "Epistles", chapters: 4, summary: "The supremacy of Christ over everything" },
  { id: "1th", name: "1 Thessalonians", testament: "NT", genre: "Epistles", chapters: 5, summary: "Faith, love, hope — and His coming" },
  { id: "2th", name: "2 Thessalonians", testament: "NT", genre: "Epistles", chapters: 3, summary: "Stand firm — the man of lawlessness will be revealed and destroyed" },
  { id: "1ti", name: "1 Timothy", testament: "NT", genre: "Epistles", chapters: 6, summary: "How to behave in the household of God" },
  { id: "2ti", name: "2 Timothy", testament: "NT", genre: "Epistles", chapters: 4, summary: "Paul's last letter: finish the race" },
  { id: "tit", name: "Titus", testament: "NT", genre: "Epistles", chapters: 3, summary: "Sound doctrine that produces good works" },
  { id: "phm", name: "Philemon", testament: "NT", genre: "Epistles", chapters: 1, summary: "The gospel rewriting a master-slave relationship" },
  { id: "heb", name: "Hebrews", testament: "NT", genre: "Epistles", chapters: 13, summary: "Christ is better — persevere" },
  { id: "jas", name: "James", testament: "NT", genre: "Epistles", chapters: 5, summary: "Faith that works" },
  { id: "1pe", name: "1 Peter", testament: "NT", genre: "Epistles", chapters: 5, summary: "Living hope in suffering" },
  { id: "2pe", name: "2 Peter", testament: "NT", genre: "Epistles", chapters: 3, summary: "Grow in grace; the day of the LORD will come" },
  { id: "1jn", name: "1 John", testament: "NT", genre: "Epistles", chapters: 5, summary: "That you may know you have life" },
  { id: "2jn", name: "2 John", testament: "NT", genre: "Epistles", chapters: 1, summary: "Walk in truth and love" },
  { id: "3jn", name: "3 John", testament: "NT", genre: "Epistles", chapters: 1, summary: "Hospitality and walking in truth" },
  { id: "jud", name: "Jude", testament: "NT", genre: "Epistles", chapters: 1, summary: "Contend for the faith; keep yourselves in love" },
  { id: "rev", name: "Revelation", testament: "NT", genre: "Apocalyptic", chapters: 22, summary: "The slain Lamb wins — a new creation" },
]

export const BOOK_BY_ID: Record<string, BibleBook> = Object.fromEntries(BOOKS.map((b) => [b.id, b]))

export const GENRE_EMOJI: Record<string, string> = {
  Law: "📜",
  History: "🏜️",
  Wisdom: "🕯️",
  "Major Prophets": "🔥",
  "Minor Prophets": "📯",
  Gospels: "✝️",
  Acts: "🕊️",
  Epistles: "✉️",
  Apocalyptic: "👑",
}

// ── Reading plans ─────────────────────────────────────────────

export type PlanDay = {
  ref: string // "jhn 3"
  focus: string
  question: string
}

export type ReadingPlan = {
  id: string
  title: string
  subtitle: string
  emoji: string
  color: string
  days: PlanDay[]
}

function chapter(ref: string, focus: string, question: string): PlanDay {
  return { ref, focus, question }
}

export const READING_PLANS: ReadingPlan[] = [
  {
    id: "john",
    title: "Gospel of John",
    subtitle: "21 days · one chapter a day",
    emoji: "🕊️",
    color: "#166534",
    days: [
      chapter("jhn 1", "The Word became flesh", "What does it mean that Jesus is the 'true light' coming into the world?"),
      chapter("jhn 2", "Water to wine, temple cleansed", "Why does Jesus call his body the temple?"),
      chapter("jhn 3", "Born again", "What does being 'born of the Spirit' change in a life?"),
      chapter("jhn 4", "The woman at the well", "How does Jesus cross social barriers with this woman?"),
      chapter("jhn 5", "The paralyzed man healed", "Jesus claims equality with God — how do people respond?"),
      chapter("jhn 6", "Bread of life", "Why do many disciples walk away after this teaching?"),
      chapter("jhn 7", "Rivers of living water", "What keeps the crowds divided over Jesus?"),
      chapter("jhn 8", "Light of the world", "What does freedom look like in this chapter?"),
      chapter("jhn 9", "The man born blind", "How does the healed man's testimony grow through the chapter?"),
      chapter("jhn 10", "The good shepherd", "What do the shepherd images tell you about Jesus' care?"),
      chapter("jhn 11", "Lazarus raised", "How do Martha and Mary answer Jesus differently?"),
      chapter("jhn 12", "The anointing and the Greeks", "What does the grain of wheat principle teach?"),
      chapter("jhn 13", "Feet washed, betrayer revealed", "How does Jesus define greatness here?"),
      chapter("jhn 14", "The way, the truth, the life", "How does Jesus comfort the troubled heart?"),
      chapter("jhn 15", "The vine and the branches", "What does 'abiding' look like in your week?"),
      chapter("jhn 16", "The Spirit's coming work", "Why is it better that Jesus goes away?"),
      chapter("jhn 17", "Jesus' high-priestly prayer", "What does Jesus pray specifically for you (v. 20)?"),
      chapter("jhn 18", "Arrest and trials", "How does Jesus' calm contrast with everyone else?"),
      chapter("jhn 19", "The crucifixion", "Which fulfilled detail stands out to you?"),
      chapter("jhn 20", "The empty tomb", "How does John structure the resurrection evidence?"),
      chapter("jhn 21", "Breakfast by the sea", "How does Jesus restore Peter?"),
    ],
  },
  {
    id: "genesis",
    title: "Genesis Beginnings",
    subtitle: "30 days · foundations of the story",
    emoji: "🌅",
    color: "#A16207",
    days: [
      chapter("gen 1", "Creation by the word", "What repeated refrain marks each day, and what does it reveal?"),
      chapter("gen 2", "Garden and covenant", "How does chapter 2's garden picture deepen chapter 1?"),
      chapter("gen 3", "The fall", "Where are you tempted to echo 'did God actually say'?"),
      chapter("gen 4", "Cain and Abel", "What does sin's progression look like here?"),
      chapter("gen 5", "The genealogy of death — and Enoch", "Why is Enoch the interrupting grace note?"),
      chapter("gen 6", "Sons of God, Noah found", "How does grieved holiness and saving grace sit together?"),
      chapter("gen 7", "The flood comes", "What does the 'remembering' of God mean here?"),
      chapter("gen 8", "Waters recede", "Where do you see patience in the waiting?"),
      chapter("gen 9", "Covenant of the rainbow", "What does the bow promise — and cost?"),
      chapter("gen 11", "Babel", "How does the confusion of languages contrast with Pentecost later?"),
      chapter("gen 12", "The call of Abram", "Which of the seven promises encourages you today?"),
      chapter("gen 13", "Abram and Lot separate", "How does Lot's choice look in hindsight?"),
      chapter("gen 14", "Melchizedek appears", "Why is this mysterious priest-king significant (see Hebrews 7)?"),
      chapter("gen 15", "The covenant cut", "Who passes between the pieces — and why does that matter?"),
      chapter("gen 16", "Hagar and Ishmael", "How does God see the runaway servant?"),
      chapter("gen 17", "Covenant of circumcision", "What does it mean that God renames Abram?"),
      chapter("gen 18", "Three visitors, Sodom pleaded for", "How does Abraham's intercession teach prayer?"),
      chapter("gen 19", "Sodom delivered and destroyed", "What does Lot's hesitation warn?"),
      chapter("gen 21", "Isaac born", "How does laughter become the name of the promise?"),
      chapter("gen 22", "The binding of Isaac", "How does this chapter preach the cross?"),
      chapter("gen 24", "A wife for Isaac", "Where do you see God's quiet providence guiding?"),
      chapter("gen 25", "Esau sells the birthright", "What does Esau's appetite cost him?"),
      chapter("gen 27", "The stolen blessing", "How do deception's ripples spread?"),
      chapter("gen 28", "Jacob's ladder", "How does God meet a runaway deceiver?"),
      chapter("gen 29", "Leah and Rachel", "How does God remember the unloved?"),
      chapter("gen 32", "Wrestling at Peniel", "What does it mean to be renamed Israel?"),
      chapter("gen 37", "Joseph's dreams and betrayal", "How does God's plan survive human evil here?"),
      chapter("gen 39", "Temptation and prison", "How does 'the LORD was with Joseph' sustain him?"),
      chapter("gen 45", "Joseph reveals himself", "How does verse 5 preach Romans 8:28?"),
      chapter("gen 50", "Genesis closes", "How does Joseph's last word point beyond Egypt?"),
    ],
  },
  {
    id: "psalms-comfort",
    title: "Psalms of Comfort",
    subtitle: "14 days · for heavy hearts",
    emoji: "🫂",
    color: "#7E22CE",
    days: [
      chapter("psa 23", "The Shepherd psalm", "Which provision do you need most today?"),
      chapter("psa 27", "Whom shall I fear?", "What does it mean to seek His dwelling?"),
      chapter("psa 34", "Taste and see", "What deliverance motif runs through the psalm?"),
      chapter("psa 42", "As the deer pants", "How does the psalmist preach to his own soul?"),
      chapter("psa 46", "Be still", "What 'be still' is God inviting you into?"),
      chapter("psa 56", "In God I trust", "How are tears kept in a bottle and fears met?"),
      chapter("psa 62", "My soul waits", "What contrast does 'alone / only' draw?"),
      chapter("psa 91", "Shelter of the Most High", "How does the psalm answer fear?"),
      chapter("psa 103", "Bless the LORD", "Which benefit of verses 2-5 do you forget most?"),
      chapter("psa 116", "He heard my voice", "How does the psalmist pay his vows?"),
      chapter("psa 121", "I lift my eyes", "What does the Keeper's 'not' list protect?"),
      chapter("psa 130", "Out of the depths", "What does 'therefore hope' establish?"),
      chapter("psa 139", "You know me", "How do being known and being followed comfort?"),
      chapter("psa 143", "Teach me to do Your will", "How does the psalm end on renewed praying?"),
    ],
  },
  {
    id: "romans",
    title: "Romans Road to Truth",
    subtitle: "16 days · the gospel in full",
    emoji: "🛤️",
    color: "#B45309",
    days: [
      chapter("rom 1", "The gospel and the exchange", "What is the 'exchange' of verses 21-25 about?"),
      chapter("rom 2", "God's kindness and judgment", "How does presuming on kindness deceive?"),
      chapter("rom 3", "All have sinned", "How do verses 21-26 define justification?"),
      chapter("rom 4", "Abraham counted righteous", "How does faith receive — not earn?"),
      chapter("rom 5", "Peace, grace, two Adams", "How does Adam's one act frame Christ's one act?"),
      chapter("rom 6", "Dead to sin, alive to God", "What does union with Christ's death change?"),
      chapter("rom 7", "The war within", "Who is the 'wretched man' and what is his cry?"),
      chapter("rom 8", "No condemnation", "Which promise of this chapter do you need today?"),
      chapter("rom 9", "Mercy and the potter", "How does Paul hold grief and election together?"),
      chapter("rom 10", "Faith comes by hearing", "What does 'beautiful feet' require of us?"),
      chapter("rom 11", "The olive tree", "How does humility and hope meet here?"),
      chapter("rom 12", "A living sacrifice", "What renewal of the mind is being worked in you?"),
      chapter("rom 13", "Love fulfills the law", "How do submission and love pair?"),
      chapter("rom 14", "Judging one another", "What does welcoming 'as God has welcomed' look like?"),
      chapter("rom 15", "Unity and hope", "How do endurance and encouragement come?"),
      chapter("rom 16", "The greeting list", "What does this chapter reveal about Paul's friendships?"),
    ],
  },
  {
    id: "life-of-christ",
    title: "Life of Christ",
    subtitle: "30 days · through all four Gospels",
    emoji: "✝️",
    color: "#166534",
    days: [
      chapter("luk 1", "Annunciations", "How do Mary's and Zechariah's responses differ?"),
      chapter("luk 2", "Born in Bethlehem", "What do Simeon's words foreshadow?"),
      chapter("mat 3", "Baptism of Jesus", "Why does the sinless one identify with sinners?"),
      chapter("mat 4", "Temptation and first disciples", "How does Jesus wield Scripture in the wilderness?"),
      chapter("jhn 3", "Nicodemus at night", "How is the new birth both water and Spirit?"),
      chapter("mrk 2", "Paralytic forgiven", "How do the four friends model intercession?"),
      chapter("luk 7", "The widow's son, the sinful woman", "How does being forgiven much fuel love?"),
      chapter("mat 5", "Beatitudes", "Which blessing reverses your assumption most?"),
      chapter("mat 6", "Giving, praying, fasting", "How does 'your Father sees' recenter practice?"),
      chapter("mat 7", "Ask, seek, knock", "How do the two builders close the sermon?"),
      chapter("mrk 4", "Parables of the kingdom", "Where is the word snatched or choked in your life?"),
      chapter("mrk 6", "Rejected at home, feeding 5,000", "How do fear and faith collide on the water?"),
      chapter("jhn 6", "Bread of life", "Why is this teaching a 'hard saying'?"),
      chapter("mat 14", "Walking on water", "What does Peter's little faith still accomplish?"),
      chapter("mat 16", "Who do you say I am?", "What does it mean to take up the cross?"),
      chapter("mrk 9", "Transfiguration", "How does the Father's word answer fear?"),
      chapter("luk 10", "Sent out seventy; Mary and Martha", "What is 'the good portion'?"),
      chapter("luk 15", "Three lost things", "Which character are you in each parable?"),
      chapter("jhn 11", "Lazarus", "How do 'Jesus wept' and 'I am the resurrection' pair?"),
      chapter("luk 18", "Persistent widow, rich ruler, blind beggar", "What does persistent shameless prayer look like?"),
      chapter("mat 21", "Triumphal entry, temple cleansed", "How does the crowd's cry change by Friday?"),
      chapter("jhn 13", "The upper room begins", "How does foot-washing redefine greatness?"),
      chapter("luk 22", "Gethsemane and arrest", "How does Jesus' prayer model submission?"),
      chapter("jhn 19", "Crucified", "Which detail speaks fulfillment to you?"),
      chapter("mat 27", "Darkness, veil, tomb", "What does the torn veil proclaim?"),
      chapter("mrk 16", "Empty tomb", "How do fear and amazement mix at the tomb?"),
      chapter("luk 24", "Road to Emmaus", "How do hearts burn at opened Scripture?"),
      chapter("jhn 20", "Believing Thomas", "How does Jesus treat honest doubt?"),
      chapter("jhn 21", "Do you love me?", "How does Jesus restore a denier?"),
      chapter("act 1", "Ascension and waiting", "What are the disciples now witnesses of?"),
    ],
  },
  {
    id: "one-story",
    title: "The One Story",
    subtitle: "30 days · key chapters across the whole Bible",
    emoji: "🌍",
    color: "#0F766E",
    days: [
      chapter("gen 1", "Creation", "What does 'very good' establish?"),
      chapter("gen 3", "Fall", "Where is the first gospel promise hidden?"),
      chapter("gen 12", "Abraham called", "How do the promises bless all nations?"),
      chapter("exo 12", "Passover", "How does the lamb's blood preach Christ?"),
      chapter("exo 20", "The Ten Commandments", "How do the commands begin with grace?"),
      chapter("jos 1", "Entering the land", "What does 'be strong and courageous' rest on?"),
      chapter("1sa 16", "David anointed", "What does 'the heart' criterion teach?"),
      chapter("psa 2", "The anointed King", "How do the nations rage in vain?"),
      chapter("isa 53", "The Suffering Servant", "Which pierced-for detail stands out?"),
      chapter("jer 31", "New covenant promised", "What changes between old and new?"),
      chapter("ezk 37", "Dry bones", "Where do you need the breath of hope?"),
      chapter("dan 7", "Son of Man", "What kingdom outlasts empires?"),
      chapter("mat 1", "The genealogy", "How do the four women in the list preach grace?"),
      chapter("mat 5", "Kingdom ethics", "How does the King bless?"),
      chapter("mrk 8", "Cross predicted", "What does 'get behind me, Satan' cost?"),
      chapter("jhn 1", "Word made flesh", "How do grace and truth come together?"),
      chapter("jhn 19", "The cross", "What is 'finished'?"),
      chapter("1co 15", "Resurrection", "Why does everything hinge on this?"),
      chapter("act 2", "Pentecost", "How does Babel reverse?"),
      chapter("rom 5", "Justified by faith", "How do the two Adams frame history?"),
      chapter("gal 3", "Promise and law", "Why is the heir no different from a slave?"),
      chapter("eph 2", "By grace through faith", "How are we both saved and made one?"),
      chapter("php 2", "The mind of Christ", "How does the hymn descend and ascend?"),
      chapter("heb 9", "Better sacrifice", "How does the once-for-all offering change everything?"),
      chapter("rev 5", "The slain Lamb", "Why is the Lion a Lamb?"),
      chapter("rev 21", "New creation", "Which 'no more' do you long for most?"),
      chapter("rev 22", "River and tree", "How does Eden return — exceeded?"),
      chapter("gen 50", "Meant for good", "How does providence close Genesis?"),
      chapter("psa 110", "Priest-King forever", "Why does Jesus quote this most?"),
      chapter("rev 22", "Come, Lord Jesus", "What is the Bible's last invitation to you?"),
    ],
  },
]

export const PLAN_BY_ID: Record<string, ReadingPlan> = Object.fromEntries(READING_PLANS.map((p) => [p.id, p]))

export function parseRef(ref: string): { bookId: string; chapter: number } | null {
  const m = ref.match(/^([1-3]?[a-z]+)\s+(\d+)$/)
  if (!m) return null
  const bookId = m[1]
  const chapter = parseInt(m[2], 10)
  if (!BOOK_BY_ID[bookId]) return null
  if (chapter < 1 || chapter > BOOK_BY_ID[bookId].chapters) return null
  return { bookId, chapter }
}

export function refLabel(ref: string): string {
  const p = parseRef(ref)
  if (!p) return ref
  return `${BOOK_BY_ID[p.bookId].name} ${p.chapter}`
}

/** deterministic verse of the day from the day key */
export function verseOfDay(dayKey: string): { ref: string; bookId: string; chapter: number; verse: number } {
  let h = 2166136261
  for (let i = 0; i < dayKey.length; i++) {
    h ^= dayKey.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  const pool = [
    "jhn 3:16", "psa 23:1", "rom 8:28", "php 4:13", "pro 3:5", "isa 41:10", "jer 29:11", "mat 11:28",
    "psa 46:10", "1co 13:13", "heb 11:1", "jos 1:9", "psa 119:105", "gal 2:20", "eph 2:8", "2ti 1:7",
    "psa 27:1", "lam 3:22", "jas 1:5", "1pe 5:7", "rev 21:4", "psa 121:1", "mat 6:33", "col 3:23",
  ]
  const pick = pool[Math.abs(h) % pool.length]
  const [ref, verseS] = pick.split(":")
  const [bookId, chapterS] = ref.split(" ")
  return { ref: pick, bookId, chapter: parseInt(chapterS, 10), verse: parseInt(verseS, 10) }
}
