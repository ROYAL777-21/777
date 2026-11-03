import { SeedCourse } from "./helpers"
import { info, sel, assist, match, arrange, typeAns } from "./helpers"

export const apologeticsCourse: SeedCourse = {
  code: "apologetics",
  title: "Apologetics",
  subtitle: "A reason for the hope that is in you",
  description:
    "Learn to give an answer — the case for the Bible, the arguments for God, the evidence for the resurrection, and gracious answers to the hardest objections.",
  emoji: "🛡️",
  color: "#E4453D",
  order: 4,
  units: [
    {
      title: "Defending the Faith",
      description: "What apologetics is, where it comes from, and why it matters.",
      emoji: "⚔️",
      color: "#0F8A80",
      lessons: [
        {
          title: "What Is Apologetics?",
          challenges: [
            info(
              "Not apologizing — defending!",
              "Apologetics comes from the Greek ἀπολογία (apologia) — a legal 'defense speech,' like a lawyer's closing argument. When Paul stood trial, he said, 'I make my defense' (ἀπολογοῦμαι) — same word. Christian apologetics is the art of giving good reasons for Christian belief.",
            ),
            sel(
              "What does ἀπολογία (apologia) mean?",
              "Etymology check",
              "A legal defense speech",
              ["An apology", "A prayer", "A parable"],
              "Apologia = courtroom defense. Christian apologetics is making the case — not saying sorry!"
            ),
            info(
              "The command",
              "1 Peter 3:15 — '…always being prepared to make a defense (ἀπολογίαν) to anyone who asks you for a reason (λόγον) for the hope that is in you; yet do it with gentleness and respect.' Every Christian is on the apologetics team — the verse says always being prepared!",
            ),
            assist(
              "Complete 1 Peter 3:15: 'always being prepared to make a ___ to anyone who asks'",
              "1 Peter 3:15",
              ["defense"],
              ["donation", "dinner", "decree"],
              "'…make a DEFENSE (apologian)… with gentleness and respect.' Attitude included!"
            ),
            sel(
              "According to 1 Peter 3:15, in what spirit should we answer?",
              "😊 Attitude check",
              "Gentleness and respect",
              ["Confidence and volume", "Sarcasm and wit", "Silence"],
              "Gentleness and respect — the method IS part of the message!"
            ),
            match("Tap the pairs", [
              ["ἀπολογία", "defense speech"],
              ["1 Peter 3:15", "always be prepared"],
              ["Gentleness & respect", "the commanded tone"],
              ["λόγος", "reason / word"],
            ]),
          ],
        },
        {
          title: "Paul in Athens",
          challenges: [
            info(
              "The first great apologetic sermon",
              "In Acts 17, Paul walks into Athens — the city of philosophers — and engages BOTH Stoics and Epicureans at the Areopagus (Mars Hill). He quotes their own poets ('In him we live and move and have our being'), identifies their 'unknown god,' and preaches the resurrection. That's apologetics in action: bridge-building, truth-telling, gospel-centered.",
            ),
            sel(
              "Where did Paul deliver his Mars Hill sermon?",
              "📍 Location check",
              "Athens — the Areopagus",
              ["Corinth", "Rome", "Ephesus"],
              "Athens, at the Areopagus (Mars Hill) — the city's high court of ideas!"
            ),
            sel(
              "Whose poets did Paul quote in Athens?",
              "🧑‍🦱 Source check",
              "Greek poets (Epimenides & Aratus)",
              ["King David", "Isaiah", "Homer only"],
              "Paul quoted pagan poets his audience trusted — meeting them where they stood, then pointing to Christ!"
            ),
            match("Tap the pairs", [
              ["Athens", "city of idols"],
              ["Areopagus", "Mars Hill court"],
              ["Stoics & Epicureans", "Paul's audience"],
              ["Resurrection", "his climactic claim"],
            ]),
            arrange(
              "Build Paul's bridge: the order of his sermon",
              "Paul's flow at Mars Hill",
              ["Notice their altar", "Quote their poets", "Proclaim the true God", "Announce the resurrection"],
              ["Insult their city"],
              "Paul started where they were, built common ground, then proclaimed Christ — the masterclass of apologetics!",
            ),
            sel(
              "What was the crowd's reaction to 'resurrection'?",
              "😮 Response check",
              "Some mocked, some wanted to hear more, some believed",
              ["All believed instantly", "All rioted", "Nobody listened"],
              "Some sneered, some said 'we'll hear you again,' and some joined him — including a council member named Dionysius!"
            ),
          ],
        },
        {
          title: "Why It Matters",
          challenges: [
            info(
              "Head, heart, and hands",
              "Apologetics does three jobs: it STRENGTHENS believers (confidence that faith rests on reality), it REMOVES obstacles for seekers (honest answers to honest questions), and it MODELS the greatest commandment — loving God with all your MIND (Mark 12:30). Faith and reason are not enemies; reason is faith's flashlight.",
            ),
            sel(
              "Which command includes loving God 'with all your mind'?",
              "📖 Source check",
              "The greatest commandment (Mark 12:30)",
              ["The Great Commission", "The Golden Rule", "The new command"],
              "'Love the Lord your God with all your heart, soul, MIND, and strength.' Thinking is worship!"
            ),
            sel(
              "What are the three jobs of apologetics?",
              "🎯 Purpose check",
              "Strengthen believers, remove obstacles, love God with the mind",
              ["Win arguments, gain followers, appear smart", "Replace faith, judge others, debate for sport", "Entertain, philosophize, monetize"],
              "Apologetics serves people and God — it never replaces faith, it undergirds it!"
            ),
            match("Tap the pairs", [
              ["Apologetics", "reasons for hope"],
              ["Faith", "trust based on reasons"],
              ["Reason", "faith's flashlight"],
              ["1 Peter 3:15", "the charter verse"],
            ]),
            typeAns(
              "Type the Greek word behind 'apologetics'",
              "The Greek word",
              ["apologia", "απολογια", "apologia!"],
              "ἀπολογία (apologia) — a defense speech presented in court.",
              "apologia"
            ),
            info(
              "⚔️ Unit complete!",
              "You now know what apologetics is, where the word comes from, and its heart — gentleness and respect. Coming up: the hard evidence. Manuscripts, arguments, and history await!",
            ),
          ],
        },
      ],
    },
    {
      title: "The Case for the Bible",
      description: "The evidence that Scripture is the best-attested book of the ancient world.",
      emoji: "📚",
      color: "#D9A400",
      lessons: [
        {
          title: "The Numbers Game",
          challenges: [
            info(
              "An avalanche of evidence",
              "The New Testament survives in over 5,800 Greek manuscripts, about 10,000 Latin manuscripts, and 9,000+ in Syriac, Coptic, Armenian and more — roughly 24,000 total witnesses. The runner-up of antiquity? Homer's Iliad with about 643. The Bible isn't just well-attested — it's in a category of ONE.",
            ),
            sel(
              "Roughly how many manuscripts support the New Testament text (all languages)?",
              "🔢 Count check",
              "About 24,000",
              ["About 100", "About 1,000", "About 2"],
              "~24,000 manuscripts across languages — the best-attested work of antiquity by far!"
            ),
            match("Tap the pairs — copies surviving from antiquity", [
              ["New Testament", "~24,000 witnesses"],
              ["Iliad", "~643 copies"],
              ["Gallic Wars", "~10 copies"],
              ["Plato's works", "~7 copies"],
            ]),
            info(
              "The gap problem — and the Bible's solution",
              "For most ancient works, the gap between writing and earliest copy is centuries: Caesar, ~1,000 years; Plato, ~1,200 years. The New Testament's earliest fragment (P52, from John 18) dates to within about 60–100 years of the original — and whole books appear within ~200 years. Historians dream of gaps like these!",
            ),
            sel(
              "What makes the New Testament's manuscript gap remarkable?",
              "⏱️ Time check",
              "Earliest fragments come within about a century of the originals",
              ["There is no gap at all", "The gap is 1,000 years, same as Caesar", "No originals ever existed"],
              "P52 (~AD 125–175) brings John within living memory of the writing. No other ancient work comes close!"
            ),
            sel(
              "Which Gospel fragment is the earliest known manuscript of ANY New Testament book?",
              "🧾 Papyrus check",
              "P52 — a fragment of John 18",
              ["A complete Mark", "A page of Luke", "A scroll of Matthew"],
              "P52, the Rylands fragment — found in Egypt, proving John circulated early and far!"
            ),
            typeAns(
              "Which ancient poem is the runner-up to the NT in manuscript copies?",
              "Second place",
              ["iliad", "the iliad", "homer's iliad", "iliad!"],
              "Homer's Iliad — ~643 copies. Impressive for antiquity, but no match for ~24,000!",
              "the Iliad"
            ),
          ],
        },
        {
          title: "Reliable Transmission",
          challenges: [
            info(
              "Quantity of copies ≠ quality?",
              "Fair question! More copies means MORE variants to compare — hundreds of thousands of little differences. But here's the key: having many copies lets scholars compare them and weed out copying errors with high confidence. The variants that remain are overwhelmingly spelling, word order, and obvious slips. Textual critics across the spectrum agree: the text we have is over 99% established, and no doctrine hangs on a variant.",
            ),
            sel(
              "Why do MANY manuscripts actually help scholars?",
              "🧠 Logic check",
              "More copies = more witnesses to compare and correct against each other",
              ["More copies = more confusion only", "Quantity hides the original", "They don't help at all"],
              "Many witnesses let scholars triangulate the original — like having 24,000 cameras on one event!"
            ),
            sel(
              "What portion of New Testament variants affect translation meaningfully?",
              "📊 Statistics check",
              "A tiny fraction — the vast majority are spelling and word order",
              ["About half", "Nearly all", "Nobody knows"],
              "Scholars estimate differences that affect meaning are a tiny fraction of the text — and none change a core doctrine."
            ),
            match("Tap the pairs", [
              ["Variant", "a difference between copies"],
              ["Most variants", "spelling & order"],
              ["Textual criticism", "comparing witnesses"],
              ["Doctrines", "unaffected by variants"],
            ]),
            assist(
              "Complete: 'No doctrine of Christianity rests on any ___'",
              "The honest conclusion",
              ["variant"],
              ["manuscript", "language", "century"],
              "No doctrine depends on a disputed variant — the faith stands on rock, not on a scribal slip."
            ),
            sel(
              "Which honest practice do modern Bibles use for major variants?",
              "📖 Transparency check",
              "They note them in footnotes",
              ["They hide them", "They delete the verses silently", "They add new ones"],
              "Open Bibles, open footnotes — transparency is a strength of modern translation!"
            ),
          ],
        },
        {
          title: "One Story, Many Pens",
          challenges: [
            info(
              "The library that tells one story",
              "The Bible: 66 books, ~40 authors, 3 languages, 3 continents, written over about 1,500 years — kings and fishermen, poets and doctors, prophets and tax collectors. And yet it tells ONE unfolding story: creation, fall, promise, redemption, restoration. As church father Irenaeus said, it's like a mosaic of a king — many pieces, one portrait.",
            ),
            sel(
              "How many books make up the Bible?",
              "🔢 Structure check",
              "66",
              ["27", "39", "73"],
              "66 books — 39 Old Testament + 27 New Testament (Protestant count)."
            ),
            match("Tap the pairs", [
              ["66 books", "one library"],
              ["~40 authors", "kings to fishermen"],
              ["3 languages", "Hebrew, Aramaic, Greek"],
              ["~1,500 years", "of writing"],
            ]),
            sel(
              "Which Old Testament passage reads like a description of Christ's suffering?",
              "🔮 Prophecy check",
              "Isaiah 53",
              ["Leviticus 19", "Ecclesiastes 1", "Nahum 3"],
              "Isaiah 53 — pierced for our transgressions, silent before accusers, buried with the rich. Written ~700 years before Jesus!"
            ),
            sel(
              "Which prophecy names Bethlehem as the Messiah's birthplace?",
              "📍 Prophecy check",
              "Micah 5:2",
              ["Malachi 4:2", "Psalm 23", "Hosea 1"],
              "Micah 5:2 — 'But you, Bethlehem Ephrathah… from you shall come a ruler whose coming is from of old.'"
            ),
            info(
              "🎉 Unit complete!",
              "You can now explain WHY scholars trust the biblical text — the numbers, the early fragments, the honest footnotes, and the impossible unity of the Story. Next: does God exist? Let's argue it!",
            ),
          ],
        },
      ],
    },
    {
      title: "Arguments for God",
      description: "The classic arguments — cosmological, teleological, and moral.",
      emoji: "🌌",
      color: "#9B5DE5",
      lessons: [
        {
          title: "The Kalam Argument",
          challenges: [
            info(
              "Three steps to a First Cause",
              "The Kalam cosmological argument (polished by medieval Muslim theologian al-Ghazali, defended today by William Lane Craig):\n1. Whatever begins to exist has a cause.\n2. The universe began to exist.\n3. Therefore, the universe has a cause.\nAnd that cause must be outside space and time, immensely powerful — a lot like God.",
            ),
            arrange(
              "Build the Kalam argument",
              "The syllogism, in order",
              ["Whatever begins to exist has a cause", "The universe began to exist", "Therefore, the universe has a cause"],
              ["Everything is an illusion"],
              "Three lines — and the conclusion follows like sunrise follows dawn!",
            ),
            sel(
              "What does 'cosmological' refer to?",
              "📖 Term check",
              "The cosmos — the origin of the universe",
              ["Cosmetics", "Constellations", "Communities"],
              "Cosmos = the universe as an ordered whole. The argument starts with the universe's beginning!"
            ),
            sel(
              "What evidence supports premise 2 (the universe began to exist)?",
              "💥 Science check",
              "The Big Bang and the impossibility of an actual infinite past",
              ["The universe is obviously eternal", "Stars never burn out", "Everyone agrees the universe is infinite"],
              "Big Bang cosmology points to a beginning; an actually infinite series of past events seems impossible — both roads say 'it started.'"
            ),
            match("Tap the pairs", [
              ["Al-Ghazali", "polished the Kalam"],
              ["William Lane Craig", "modern defender"],
              ["Big Bang", "evidence of a beginning"],
              ["First Cause", "outside space & time"],
            ]),
            sel(
              "If the universe began to exist, its cause must be…",
              "🤔 Deduction check",
              "Outside of space and time, and immensely powerful",
              ["Inside the universe", "Made of matter", "Random"],
              "The cause of space-time can't be INSIDE space-time — and it must be powerful enough to start a universe!"
            ),
          ],
        },
        {
          title: "The Fine-Tuning",
          challenges: [
            info(
              "A universe dialed for life",
              "The constants of physics sit in absurdly narrow 'life-permitting' ranges. If gravity, or the strong nuclear force, or the cosmological constant shifted by minuscule amounts, no stars, no chemistry, no life. Physicists call it 'fine-tuning.' The question: luck, law, multiverse — or design?",
            ),
            sel(
              "What do physicists mean by 'fine-tuning'?",
              "🎯 Definition check",
              "Constants falling in narrow life-permitting ranges",
              ["Pianos tuned for church", "Precise predictions of weather", "Tuning an engine"],
              "The laws of nature appear dialed with life-permitting precision — change them slightly and the universe is sterile."
            ),
            sel(
              "What is the multiverse hypothesis offered as?",
              "🌌 Alternative check",
              "An alternative explanation for fine-tuning — many universes, we got a lucky one",
              ["A proven fact of physics", "A prediction of Genesis", "A type of telescope"],
              "The multiverse says: countless universes exist, and we necessarily observe a lucky one. It's a live but speculative alternative to design!"
            ),
            match("Tap the pairs", [
              ["Fine-tuning", "narrow life ranges"],
              ["Cosmological constant", "famously fine-tuned"],
              ["Multiverse", "many-universes explanation"],
              ["Design", "a Mind behind the dials"],
            ]),
            assist(
              "Complete the design inference: 'The universe looks ___ because it was made by a Mind'",
              "Design inference",
              ["designed"],
              ["accidental", "illusory", "unavoidable"],
              "Dials this precise are exactly what minds make — and what blind chance almost never does!"
            ),
            sel(
              "Which Psalm famously declares 'the heavens declare the glory of God'?",
              "📖 Source check",
              "Psalm 19",
              ["Psalm 1", "Psalm 150", "Psalm 23"],
              "Psalm 19:1 — the oldest fine-tuning observation on record! 'The heavens declare the glory of God.'"
            ),
          ],
        },
        {
          title: "The Moral Argument",
          challenges: [
            info(
              "C.S. Lewis's ladder",
              "In Mere Christianity, Lewis argues:\n1) Every culture has a moral law — 'do not torture children' is not just unpopular, it's WRONG.\n2) A law that binds universally needs a foundation above humans.\n3) Therefore, a transcendent Moral Lawgiver exists. His insight: quarreling itself proves it — when we argue 'that's not fair,' we appeal to a standard both parties assume is real.",
            ),
            arrange(
              "Build the moral argument",
              "Lewis's ladder, in order",
              ["Humans everywhere sense objective moral duties", "A universal law needs a foundation beyond humans", "Therefore, a transcendent Moral Lawgiver exists"],
              ["Morality is merely a herd instinct"],
              "From the moral law we all assume, up to the Lawgiver the assumption requires!"
            ),
            sel(
              "According to Lewis, what does quarreling reveal?",
              "🗣️ Insight check",
              "Both sides assume a real standard of fairness",
              ["That people are annoying", "That morality evolves", "That arguments are pointless"],
              "When we say 'that's not fair,' we appeal beyond instinct to a standard both parties assume — a real moral law!"
            ),
            sel(
              "What does 'objective moral value' mean?",
              "📐 Definition check",
              "Something wrong for everyone, everywhere — regardless of opinion",
              ["Whatever the majority feels", "Personal preference", "Cultural etiquette"],
              "Objective = independent of minds and votes. Torturing children for fun would be wrong even if a culture approved."
            ),
            match("Tap the pairs", [
              ["C.S. Lewis", "Mere Christianity"],
              ["Moral law", "sensed universally"],
              ["Lawgiver", "its needed foundation"],
              ["Conscience", "the law's fingerprint"],
            ]),
            typeAns(
              "Who wrote 'Mere Christianity'?",
              "The author",
              ["c.s. lewis", "cs lewis", "cslewis", "lewis", "c.s. lewis"],
              "C.S. Lewis — Oxford scholar and author of Narnia — argued from morality to God.",
              "C.S. Lewis"
            ),
          ],
        },
      ],
    },
    {
      title: "The Resurrection",
      description: "The central claim of Christianity — and the evidence historians actually debate.",
      emoji: "✝️",
      color: "#E4453D",
      lessons: [
        {
          title: "The Minimal Facts",
          challenges: [
            info(
              "What nearly every scholar grants",
              "Skeptic-friendly scholar Gary Habermas surveyed thousands of publications and found near-universal agreement on core facts:\n1. Jesus died by crucifixion.\n2. His disciples believed they saw Him alive again — and were transformed.\n3. James, the skeptical brother, converted after an appearance.\n4. Paul, the persecutor, converted after an appearance.\n5. The tomb was empty (accepted by ~75% of scholars in the field).",
            ),
            sel(
              "What are the 'minimal facts'?",
              "🎓 Method check",
              "Facts about Jesus accepted by nearly all critical scholars",
              ["Theories only believers accept", "The Ten Commandments", "Miracles proven by physics"],
              "Minimal facts = the common ground even skeptical historians grant. The debate is over how to EXPLAIN them!"
            ),
            match("Tap the pairs", [
              ["Gary Habermas", "minimal facts scholar"],
              ["Crucifixion", "accepted by all"],
              ["Empty tomb", "accepted by ~75%"],
              ["James & Paul", "skeptics who converted"],
            ]),
            sel(
              "Who was James, in the minimal facts case?",
              "👨‍👩‍👦 Family check",
              "Jesus' skeptical brother who converted after a reported appearance",
              ["James the fisherman", "James the scribe", "King James"],
              "James didn't believe during Jesus' ministry (John 7:5) — then he saw the risen Jesus (1 Cor 15:7) and led the Jerusalem church!"
            ),
            sel(
              "Who was Paul before his conversion?",
              "⚔️ Background check",
              "A persecutor of the church",
              ["A Roman soldier", "A temple priest", "A tax collector"],
              "Paul arrested Christians — then claimed the risen Christ appeared to HIM, and spent his life planting churches, ending in martyrdom!"
            ),
            typeAns(
              "Which creed (1 Corinthians 15) lists resurrection appearances — within a few years of the event?",
              "The early creed",
              ["1 corinthians 15", "1 cor 15", "corinthians 15", "1 corinthians"],
              "1 Corinthians 15:3–7 — a creed Paul 'received,' dated by scholars to within a few years of the crucifixion. Too early for legend!",
              "1 Corinthians 15"
            ),
          ],
        },
        {
          title: "Rival Theories",
          challenges: [
            info(
              "Every alternative has a limp",
              "Swoon theory (He survived the cross)? Roman executioners were lethally efficient — and a half-dead Jesus wouldn't inspire worship. Hallucination? It doesn't convert groups of 500 at once (1 Cor 15:6), or enemies like Paul and James. Theft? Then liars died agonizing deaths for what they knew was false — people die for lies, but not for lies they invented themselves. Legend? The creed is far too early.",
            ),
            match("Tap the pairs — each theory's problem", [
              ["Swoon theory", "Roman execution was thorough"],
              ["Hallucination", "groups & enemies saw Him"],
              ["Theft", "martyrs die for known lies?"],
              ["Legend", "creed too early"],
            ]),
            sel(
              "What's the main problem with the hallucination theory?",
              "🧠 Psychology check",
              "Hallucinations are individual — yet groups and even enemies claimed to see Him",
              ["Hallucinations are rare", "The disciples were too sad to hallucinate", "Jews couldn't hallucinate"],
              "Hallucinations don't happen to 500 people at once — or to hostile witnesses like Paul and James!"
            ),
            sel(
              "Why is 'legend' an unlikely explanation?",
              "⏱️ Timeline check",
              "The resurrection proclamation began too early for legend to form",
              ["Legends can't be religious", "Nobody writes legends about peasants", "Legends take a thousand years minimum"],
              "The 1 Cor 15 creed is dated to within a few years of the events; the church proclaimed the resurrection from week one (Acts 2) — in Jerusalem, where the tomb was!"
            ),
            sel(
              "Where did the church first preach the resurrection?",
              "📍 Boldness check",
              "In Jerusalem — the very city of the empty tomb",
              ["In Rome", "In faraway Persia", "In hiding in Galilee"],
              "Acts 2: fifty days later, one mile away, to the people who could check the tomb. That's either madness or confidence!"
            ),
            sel(
              "What happened to most of the apostles for their testimony?",
              "🔥 Cost check",
              "They suffered and died for claiming they saw the risen Christ",
              ["They retired wealthy", "They recanted quietly", "They became politicians"],
              "Tradition and history record their martyrdoms. People may die for what they BELIEVE true — no one dies for what they KNOW is false."
            ),
          ],
        },
        {
          title: "Changed Lives",
          challenges: [
            info(
              "The evidence that keeps going",
              "The resurrection's aftershocks: a movement that turned the world upside down within a generation; worship shifting to the FIRST day of the week among Sabbath-keeping Jews; 2.6 billion people today calling Jesus Lord; and lives still transformed — from Paul to Augustine to a Chicago journalist named Lee Strobel who set out to debunk his wife's faith and wrote 'The Case for Christ' instead.",
            ),
            sel(
              "Who wrote 'The Case for Christ'?",
              "📚 Author check",
              "Lee Strobel — an atheist legal journalist who investigated the evidence",
              ["C.S. Lewis", "Gary Habermas", "William Lane Craig"],
              "Lee Strobel, Yale-trained legal editor of the Chicago Tribune — his investigation led him from atheism to faith!"
            ),
            sel(
              "What shifted early Jewish Christians to worship on Sunday?",
              "📅 Calendar check",
              "The belief that Jesus rose on the first day of the week",
              ["Roman law", "A calendar reform", "Convenience"],
              "Sabbath-keeping Jews didn't casually move worship day — something world-changing happened on a Sunday!"
            ),
            match("Tap the pairs", [
              ["Paul", "persecutor → apostle"],
              ["James", "skeptic → church leader"],
              ["Strobel", "atheist → believer"],
              ["2 Cor 5:17", "new creation"],
            ]),
            assist(
              "Complete 2 Corinthians 5:17: 'If anyone is in Christ, he is a new ___'",
              "2 Corinthians 5:17",
              ["creation"],
              ["creature", "citizen", "chance"],
              "'…he is a new CREATION. The old has passed away; behold, the new has come!'"
            ),
            info(
              "✝️ Unit complete!",
              "You've now surveyed the strongest case in history: minimal facts, failed alternatives, and transformed witnesses. One unit left — handling the hardest objections with grace and truth!",
            ),
          ],
        },
      ],
    },
    {
      title: "Objections & Answers",
      description: "The problem of pain, science vs. faith, and trusting the Gospels.",
      emoji: "❓",
      color: "#58A700",
      lessons: [
        {
          title: "The Problem of Pain",
          challenges: [
            info(
              "The oldest objection",
              "'If God is all-good and all-powerful, why is there suffering?' It's the weightiest objection — and the Bible never dodges it: Job wrestles with it, the Psalms lament it, and the Cross answers it with God ENTERING suffering Himself. The objection assumes God has no reasons — but must that be so?",
            ),
            sel(
              "What does the 'problem of evil' argue?",
              "🎓 Logic check",
              "An all-good, all-powerful God seems incompatible with suffering",
              ["That evil proves God's existence", "That suffering is imaginary", "That religion causes all evil"],
              "The classic tension: if God is good AND powerful, why this much pain? The weightiest objection — worth the best answers."
            ),
            info(
              "Two classic responses",
              "The FREE WILL defense (Alvin Plantinga): a world with genuinely free creatures is more valuable than a programmed one — and freedom makes real evil possible. The SOUL-MAKING theodicy (John Hick): virtues like courage and sacrifice can only exist in a world with real risks and real needs. Neither explains every tear — but both show God and suffering are not logically incompatible.",
            ),
            sel(
              "What is Plantinga's free will defense?",
              "🧠 Response check",
              "Genuine freedom makes evil possible — and genuine love makes it worthwhile",
              ["God cannot see the future", "Evil doesn't really exist", "Humans forced God's hand"],
              "God wanted real love, not robots — and real love requires the freedom to refuse."
            ),
            sel(
              "What is the 'soul-making' theodicy?",
              "🌱 Response check",
              "A world with challenges is the only soil where virtues like courage can grow",
              ["Souls are manufactured in heaven", "Suffering is always punishment", "God is still learning"],
              "John Hick: courage needs danger, sacrifice needs need, compassion needs suffering — character grows in real soil."
            ),
            match("Tap the pairs", [
              ["Job", "the suffering questioner"],
              ["Plantinga", "free will defense"],
              ["Hick", "soul-making"],
              ["The Cross", "God enters suffering"],
            ]),
            sel(
              "How does the Cross uniquely address suffering?",
              "✝️ The Christian answer",
              "God did not stay distant — He entered suffering Himself",
              ["God explains every cause of pain", "God promises no pain now", "God denies pain is real"],
              "On the Cross, God suffers WITH us and FOR us. Christianity's God is not a spectator of pain — He's a participant!"
            ),
          ],
        },
        {
          title: "Science & Faith",
          challenges: [
            info(
              "The war that wasn't",
              "The 'conflict thesis' — that science and faith are at war — was invented in the 19th century by two skeptics (Draper and White), and historians have abandoned it. The founders of modern science were mostly believers: Newton (physics), Kepler (astronomy), Mendel (genetics — a monk!), and Lemaître — the Catholic priest who proposed the Big Bang!",
            ),
            sel(
              "Who first proposed the Big Bang theory?",
              "💥 Origin check",
              "Georges Lemaître — a Catholic priest and physicist",
              ["Richard Dawkins", "Isaac Newton", "Carl Sagan"],
              "Fr. Georges Lemaître, 1927 — the 'primeval atom.' A priest gave science its beginning!"
            ),
            sel(
              "Which monk founded the science of genetics?",
              "🧬 Science check",
              "Gregor Mendel",
              ["Galileo Galilei", "Francis Bacon", "Blaise Pascal"],
              "Mendel, the Augustinian friar with the pea plants — father of genetics!"
            ),
            match("Tap the pairs — believers of science", [
              ["Newton", "laws of motion"],
              ["Kepler", "planetary orbits"],
              ["Mendel", "genetics"],
              ["Lemaître", "Big Bang"],
            ]),
            sel(
              "What is the difference between methodological and philosophical naturalism?",
              "🔬 Philosophy check",
              "Science limits its METHODS to nature; that doesn't prove nature is ALL there is",
              ["They are identical", "One is Christian, one is Muslim", "One uses math, one uses faith"],
              "Doing science as if nature is regular is methodology. Claiming nature is all that exists is a philosophy — smuggled in without proof!"
            ),
            typeAns(
              "Which word means 'the study of the laws of nature' — coined by believer Roger Bacon's tradition: modern ___",
              "The enterprise",
              ["science", "science!"],
              "Science — born in Christian Europe from the belief that a rational God made a rational, law-governed universe.",
              "science"
            ),
            sel(
              "Why did science arise in Christian Europe?",
              "🏛️ History check",
              "Belief in a rational Lawgiver encouraged the search for rational laws",
              ["Pure coincidence", "The church banned all alternatives", "Better weather"],
              "If a rational Mind made the world, the world should be law-full and knowable — the seed conviction of science!"
            ),
          ],
        },
        {
          title: "Why Trust the Gospels?",
          challenges: [
            info(
              "Eyewitnesses, not inventors",
              "The Gospels claim eyewitness roots: Luke opens by interviewing 'those who from the beginning were eyewitnesses' (Luke 1:1–4); Peter insists 'we did not follow cleverly devised myths… but were eyewitnesses of his majesty' (2 Peter 1:16). Mark wrote within ~30–40 years of the events, with the memory culture of first-century Judaism behind it — a world where disciples memorized rabbinic teaching meticulously.",
            ),
            sel(
              "What does Luke claim about his sources in Luke 1:1–4?",
              "📖 Method check",
              "He investigated and interviewed eyewitnesses",
              ["He copied one secret book", "He dreamed the account", "He was an eyewitness himself"],
              "Luke the physician 'followed all things closely… from the beginning' — a researcher's preface!"
            ),
            sel(
              "What does 2 Peter 1:16 reject?",
              "🚫 Claim check",
              "'Cleverly devised myths'",
              ["Roman history", "Jewish prophecy", "Greek grammar"],
              "'We did not follow cleverly devised myths when we made known the power of our Lord… we were eyewitnesses!'"
            ),
            match("Tap the pairs", [
              ["Luke", "the investigator"],
              ["Mark", "earliest Gospel (~AD 60s)"],
              ["1 Cor 15 creed", "within a few years"],
              ["Memory culture", "rabbinic precision"],
            ]),
            sel(
              "What's the 'criterion of embarrassment'?",
              "🧐 Historian's tool",
              "Details that make the authors look bad are probably true — no one invents them",
              ["Embarrassing stories are always false", "Funny stories survive copying", "Enemies write the best history"],
              "The disciples fleeing, Peter denying, women as first witnesses — writers don't invent unflattering facts. Their presence signals authenticity!"
            ),
            arrange(
              "Order the Gospels as scholars commonly date them",
              "Earliest to latest (common view)",
              ["Mark (~AD 60s)", "Matthew (~AD 70–80s)", "Luke (~AD 70–85s)", "John (~AD 85–95s)"],
              ["Revelation"],
              "Mark first, then Matthew and Luke, then John — all within the lifetime of eyewitnesses!",
            ),
            info(
              "🛡️ Course complete!",
              "You've made the full journey: from 1 Peter 3:15 to manuscripts, arguments, evidence, and objections. You're equipped to give the reason for your hope — with gentleness and respect. Review often, keep the streak alive, and go be ready!",
            ),
          ],
        },
      ],
    },
  ],
}
