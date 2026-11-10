import { SeedCourse } from "./helpers"
import { info, sel, assist, match, arrange, typeAns } from "./helpers"

export const manuscriptsCourse: SeedCourse = {
  code: "manuscripts",
  title: "Manuscripts & Codices",
  subtitle: "Hold history in your hands",
  description:
    "Journey from papyrus scrolls to the great codices — Sinai, Vatican, Alexandria — and discover how the Bible you hold traveled 2,000 years to reach you.",
  emoji: "📜",
  color: "#9B5DE5",
  order: 3,
  units: [
    {
      title: "Scrolls & Scribes",
      description: "What manuscripts are, what they're made of, and who copied them.",
      emoji: "🪶",
      color: "#8B5E3C",
      lessons: [
        {
          title: "What Is a Manuscript?",
          challenges: [
            info(
              "Before the printing press",
              "For roughly 1,400 years after the New Testament was written, every copy of the Bible was made BY HAND. A 'manuscript' (from Latin manus 'hand' + scriptus 'written') is one of those handwritten copies. No two are exactly alike — each is a witness with its own story!",
            ),
            sel(
              "What does 'manuscript' literally mean?",
              "Etymology check",
              "Handwritten",
              ["Ancient book", "Sacred scroll", "Copied text"],
              "Manus (hand) + scriptus (written). Before printing, every Bible was one careful hand at a time."
            ),
            info(
              "Scroll vs. Codex",
              "A SCROLL is one long rolled sheet — the format of the synagogue. A CODEX is a stack of pages bound at the spine — basically, a book. Christians were early adopters of the codex, and by the 4th century it was the standard for Scripture. Every time you flip pages, you're using their innovation!",
            ),
            sel(
              "What is a codex?",
              "📚 Format check",
              "An early bound book with pages",
              ["A rolled scroll", "A stone tablet", "A chained library"],
              "The codex — pages bound at a spine — replaced the scroll. Christians championed it early on!"
            ),
            match("Tap the pairs", [
              ["Manuscript", "handwritten copy"],
              ["Scroll", "rolled sheet"],
              ["Codex", "bound book"],
              ["Scribe", "trained copyist"],
            ]),
            sel(
              "Which format did Christians help popularize for Scripture?",
              "🤔 History check",
              "The codex (book)",
              ["The scroll", "The tablet", "The inscription"],
              "Christians embraced the codex early — easier to reference, holds more text, both sides writable!"
            ),
          ],
        },
        {
          title: "God's Library Materials",
          challenges: [
            info(
              "Papyrus — the paper of Egypt",
              "Papyrus was made by slicing the papyrus reed, laying strips in crisscross layers, pressing and drying them. Cheap and light — but fragile. It survives best in Egypt's dry sands. Most of our very oldest New Testament fragments are papyrus!",
            ),
            sel(
              "What is papyrus made from?",
              "🪴 Material check",
              "A reed plant",
              ["Tree bark", "Animal skin", "Clay"],
              "Papyrus reeds, sliced and pressed. Egypt's gift to the ancient world — and to archaeologists!"
            ),
            info(
              "Parchment & vellum — skin deep luxury",
              "Parchment (and the finer grade, vellum) is made from stretched, scraped animal skin. Durable for centuries — but expensive! One complete Bible could require an entire flock of sheep. The great codices of the 4th-5th centuries are written on it.",
            ),
            sel(
              "What is vellum made from?",
              "🐑 Material check",
              "Fine animal skin",
              ["Tree bark", "Pressed reeds", "Wax"],
              "Vellum = fine parchment from calfskin (parchment generally from sheep/goat). A Bible cost a flock!"
            ),
            match("Tap the pairs", [
              ["Papyrus", "pressed reed"],
              ["Parchment", "animal skin"],
              ["Ink", "carbon + gum"],
              ["Scroll", "up to ~10 meters long"],
            ]),
            typeAns(
              "Type the material: dried, pressed reed used for Egypt's scrolls",
              "The Egyptian writing material",
              ["papyrus", "papyrus!"],
              "Papyrus — cheap, light, fragile. Perfect for Egypt's dry sands to preserve.",
              "papyrus"
            ),
            assist(
              "Complete: the very oldest NT fragments are written on ___",
              "Oldest NT fragments = ___",
              ["papyrus"],
              ["vellum", "paper", "stone"],
              "P52, the earliest known Gospel fragment (John 18), is a small piece of papyrus!"
            ),
          ],
        },
        {
          title: "The Scribes",
          challenges: [
            info(
              "Guardians of the text",
              "Professional scribes (Hebrew: sopherim, 'counters') copied Scripture with extraordinary care. The Masoretes of Tiberias (about AD 500–1000) went further: they counted every letter, every word, every verse, and recorded the totals in the margins — the Masorah. Their masterpieces? The Aleppo Codex — once complete, now partially lost to fire — and the Leningrad Codex, the oldest complete Hebrew Bible.",
            ),
            sel(
              "What did the Masoretes famously COUNT?",
              "🔢 Care check",
              "Every letter, word and verse",
              ["Only the chapters", "The readers", "The errors they made"],
              "The Masoretes counted everything — if a copy had one letter too many, they caught it. The Masorah records their tallies!"
            ),
            sel(
              "What does 'Masorete' come from?",
              "Etymology check",
              "Masorah — 'tradition/traditional'",
              ["Mosaic — of Moses", "Messiah", "Measure"],
              "The Masorah is the 'tradition' — the safeguarding system around the Hebrew text."
            ),
            match("Tap the pairs", [
              ["Sopherim", "scribes"],
              ["Masoretes", "vowel-pointers"],
              ["Aleppo Codex", "crown of Masoretic text"],
              ["Leningrad Codex", "oldest complete Hebrew Bible"],
            ]),
            arrange(
              "Put the writing materials in historical order",
              "Order of popularity",
              ["Papyrus", "Parchment", "Paper"],
              ["Stone"],
              "Papyrus dominated early, parchment from the late empire, paper from the medieval period onward.",
            ),
            sel(
              "Who added the vowel points to the Hebrew text?",
              "🐔 Careful — one answer",
              "The Masoretes (AD 500–1000)",
              ["Moses", "The apostles", "Ezra"],
              "The Masoretes added nikud so pronunciation would never be lost. Their counts and checks built a hedge so the text could never drift.",
            ),
          ],
        },
      ],
    },
    {
      title: "The Great Uncials",
      description: "Meet the three most famous Bibles on Earth — all handwritten, all magnificent.",
      emoji: "📕",
      color: "#E4453D",
      lessons: [
        {
          title: "Codex Sinaiticus",
          challenges: [
            info(
              "The discovery at Mount Sinai",
              "In 1844, scholar Constantin von Tischendorf visited St. Catherine's Monastery at the foot of Mount Sinai — and found ancient parchment pages earmarked for the stove! Over several trips (1844–1859), he rescued what became Codex Sinaiticus: the oldest complete New Testament and one of the two oldest near-complete Bibles in the world.",
            ),
            sel(
              "Who discovered Codex Sinaiticus?",
              "🔍 Name the scholar",
              "Constantin von Tischendorf",
              ["Robert Estienne", "Desiderius Erasmus", "Brooke Westcott"],
              "Tischendorf — who called the pages 'the crown of all discoveries in the field of textual criticism'!"
            ),
            sel(
              "Where was Sinaiticus discovered?",
              "📍 Location check",
              "St. Catherine's Monastery, Mount Sinai",
              ["A cave near Qumran", "The Vatican Library", "Old Cairo"],
              "At St. Catherine's, built at the foot of Mount Sinai in the 6th century — still standing today!"
            ),
            info(
              "What's inside",
              "Sinaiticus (mid-4th century, ~AD 330–360) contains the complete New Testament in Greek — plus the Epistle of Barnabas and part of the Shepherd of Hermas, books the church later did not include in the canon. Written in neat uncials (capital letters), four columns per page in the Old Testament and two in the New Testament, on fine parchment.",
            ),
            sel(
              "Roughly when was Sinaiticus written?",
              "📅 Date check",
              "Mid-4th century (~AD 330–360)",
              ["1st century", "9th century", "13th century"],
              "Mid-300s — within about 250 years of the original New Testament writings."
            ),
            match("Tap the pairs", [
              ["Sinaiticus", "found at Mount Sinai"],
              ["Uncials", "capital letters"],
              ["4 columns", "Sinaiticus page layout"],
              ["AD 330–360", "Sinaiticus date"],
            ]),
            typeAns(
              "Sinaiticus is named after which mountain?",
              "Its name comes from…",
              ["sinai", "mount sinai"],
              "Mount Sinai — where St. Catherine's Monastery preserved it for centuries.",
              "Sinai"
            ),
          ],
        },
        {
          title: "Codex Vaticanus",
          challenges: [
            info(
              "The mystery in the Vatican",
              "Codex Vaticanus — 'B' to scholars — is Sinaiticus's twin in age: a 4th-century Greek Bible of extraordinary quality. It appears in the Vatican Library's earliest catalog (1475) and no one knows exactly how it got there. Its text is among the finest witnesses to the original New Testament.",
            ),
            sel(
              "Where has Codex Vaticanus been housed since at least the 15th century?",
              "📍 Location check",
              "The Vatican Library",
              ["British Library", "Bibliothèque nationale", "Mount Sinai"],
              "The Vatican Library, Rome — catalogued there since 1475!"
            ),
            sel(
              "How old is Codex Vaticanus?",
              "📅 Date check",
              "4th century",
              ["2nd century", "8th century", "11th century"],
              "4th century — one of the two oldest near-complete Bibles, with Sinaiticus."
            ),
            match("Tap the pairs", [
              ["Vaticanus", "Vatican Library"],
              ["Scholars' nickname", "Codex B"],
              ["Text quality", "excellent Alexandrian"],
              ["Sinaiticus", "its 4th-century sibling"],
            ]),
            assist(
              "Complete: Vaticanus and ___ are the two great 4th-century Greek Bibles",
              "The two great codices: Vaticanus and ___",
              ["Sinaiticus"],
              ["Alexandrinus", "Bezae", "Ephraemi"],
              "Vaticanus + Sinaiticus — the oldest near-complete Bibles known!"
            ),
            sel(
              "What letters does a 4th-century Greek Bible use?",
              "✍️ Handwriting check",
              "Uncials (capitals)",
              ["Minuscules (cursive)", "Gothic blackletter", "Cuneiform"],
              "Uncials — elegant rounded capitals. Minuscule (lowercase cursive) arrives around the 9th century!"
            ),
          ],
        },
        {
          title: "Alexandrinus & Nomina Sacra",
          challenges: [
            info(
              "The gift to a king",
              "Codex Alexandrinus (5th century) likely came from Alexandria, Egypt. In 1627, Patriarch Cyril Lucaris presented it to King Charles I of England — one of the greatest royal gifts ever! It sits today in the British Library, a few meters from Sinaiticus.",
            ),
            sel(
              "Which king received Codex Alexandrinus as a gift?",
              "👑 Gift check",
              "King Charles I of England",
              ["Louis XIV of France", "Henry VIII", "Charlemagne"],
              "Charles I, in 1627 — from Patriarch Cyril Lucaris. It's been in London ever since!"
            ),
            info(
              "Nomina sacra — sacred abbreviations",
              "Early Christian scribes wrote sacred names as special abbreviations with a line drawn over them: ΘΣ (God), ΚΣ (Lord), ΙΣ (Jesus), ΧΣ (Christ), ΠΗΡ (Father), ΥΣ (Son), ΠΝΑ (Spirit), and more. Spot the overline in an old manuscript and you've found a holy name!",
            ),
            match("Tap the pairs — nomina sacra", [
              ["ΘΣ", "God"],
              ["ΚΣ", "Lord"],
              ["ΙΣ", "Jesus"],
              ["ΧΣ", "Christ"],
            ]),
            sel(
              "What marks a nomen sacrum in a manuscript?",
              "👀 Spot it",
              "A horizontal line drawn over the abbreviation",
              ["Gold ink", "Red brackets", "Larger letters"],
              "The overline — the scribe's halo over holy names!"
            ),
            arrange(
              "Order the three great codices by age (oldest first)",
              "Oldest to youngest",
              ["Vaticanus & Sinaiticus (4th century)", "Alexandrinus (5th century)"],
              ["Bezae (5th–6th century)"],
              "Vaticanus and Sinaiticus are 4th-century; Alexandrinus and Bezae follow in the 5th.",
            ),
            sel(
              "Where is Codex Alexandrinus today?",
              "📍 Final check",
              "The British Library, London",
              ["The Vatican", "Mount Sinai", "Alexandria"],
              "London — where it has been since 1627!"
            ),
          ],
        },
      ],
    },
    {
      title: "The Dead Sea Scrolls",
      description: "The greatest archaeological discovery of all time — a goat, a cave, and a library of treasure.",
      emoji: "🏜️",
      color: "#D9A400",
      lessons: [
        {
          title: "A Boy and a Cave",
          challenges: [
            info(
              "1947: the throw that changed everything",
              "A young Bedouin shepherd, Muhammed edh-Dhib, was searching for a lost goat near Qumran by the Dead Sea. He tossed a stone into a cave mouth and heard pottery shatter. Inside: jars holding ancient scrolls — wrapped in linen, sealed for two thousand years!",
            ),
            sel(
              "How did the shepherd find the first Dead Sea cave?",
              "🐐 The story",
              "Threw a stone into a cave and heard pottery break",
              ["Fell into a hole", "Followed a map", "Dug a well"],
              "A stone, a shatter, and the greatest manuscript discovery of the century!"
            ),
            sel(
              "Where were the Dead Sea Scrolls found?",
              "📍 Location check",
              "Qumran, near the Dead Sea",
              ["Mount Sinai", "Alexandria", "Rome"],
              "Eleven caves near Qumran, by the Dead Sea's northwest shore — the world's driest preservation vault!"
            ),
            match("Tap the pairs", [
              ["1947", "year of discovery"],
              ["Qumran", "site near Dead Sea"],
              ["Muhammed edh-Dhib", "the shepherd"],
              ["Cave 1", "first discovery"],
            ]),
            arrange(
              "Reorder the discovery",
              "What happened, in order",
              ["Shepherd loses a goat", "Throws stone into cave", "Hears pottery break", "Finds jars of scrolls"],
              ["Sells scrolls to a museum"],
              "A lost goat, a thrown stone, a shattering sound — and history's greatest manuscript find!",
            ),
            typeAns(
              "Type the name of the site where the scrolls were found",
              "The discovery site",
              ["qumran", "qumran!"],
              "Qumran — the ruins of a Jewish settlement near the Dead Sea.",
              "Qumran"
            ),
          ],
        },
        {
          title: "What Was Found",
          challenges: [
            info(
              "A hidden library",
              "Eleven caves yielded about 900+ manuscripts: every book of the Hebrew Bible EXCEPT Esther, plus community writings — the Community Rule, the War Scroll, Thanksgiving Hymns, and even a mysterious COPPER scroll listing hidden treasure locations!",
            ),
            sel(
              "Which Bible book is MISSING from the Dead Sea Scrolls?",
              "📚 Collection check",
              "Esther",
              ["Genesis", "Isaiah", "Psalms"],
              "Esther is the only book absent — every other Hebrew Bible book is represented!"
            ),
            sel(
              "What is special about the Copper Scroll?",
              "🥉 Curiosity check",
              "It lists locations of hidden treasure",
              ["It is the oldest", "It is in Greek", "It names the scribes"],
              "The Copper Scroll — etched metal, listing 64 hiding places of gold and silver. Still unsolved!"
            ),
            info(
              "The Great Isaiah Scroll",
              "Cave 1 yielded a complete scroll of Isaiah — all 66 chapters — copied around 125 BC. That's a THOUSAND YEARS older than any Hebrew Bible previously known. Scholars expected a millennium of copying errors… and found a text astonishingly close to the medieval Masoretic text. The transmission of Scripture had been careful beyond expectation!",
            ),
            sel(
              "The Great Isaiah Scroll dates to about…",
              "📅 Date check",
              "125 BC",
              ["AD 70", "AD 500", "AD 900"],
              "~125 BC — about 1,000 years older than the previous oldest Hebrew Isaiah copies!"
            ),
            match("Tap the pairs", [
              ["~900 manuscripts", "total found"],
              ["11 caves", "explored"],
              ["Isaiah Scroll", "complete, 66 chapters"],
              ["Community Rule", "sectarian writing"],
            ]),
            sel(
              "How old was the complete Isaiah scroll compared to previously known Hebrew copies?",
              "⚖️ Compare",
              "About 1,000 years older",
              ["50 years older", "Exactly as old", "Newer"],
              "A thousand years older — and still remarkably close to the Masoretic text!"
            ),
          ],
        },
        {
          title: "Why They Matter",
          challenges: [
            info(
              "The verdict of the caves",
              "Before 1947, our oldest substantial Hebrew manuscripts dated to around AD 900. The scrolls pushed that back a full millennium — to the time of Jesus and before. Result? The biblical text had been copied with remarkable fidelity. Isaiah, for example, matches later copies ~95%+ word-for-word, with differences mostly spelling and grammar. The caves voted: the scribes were trustworthy.",
            ),
            sel(
              "Before the Dead Sea discovery, Hebrew Bible copies dated to about…",
              "📅 Baseline check",
              "AD 900",
              ["500 BC", "AD 100", "AD 1500"],
              "About AD 900 — the age of the Aleppo and Leningrad codices. The scrolls jumped us back 1,000+ years!"
            ),
            sel(
              "How closely does the Great Isaiah Scroll match the later Masoretic text?",
              "🧬 Fidelity check",
              "Remarkably close — differences are mostly spelling",
              ["Totally different", "About half matches", "Unrecognizable"],
              "Word-for-word almost identical — the tiny differences are spelling-level. A millennium of copying, preserved!"
            ),
            match("Tap the pairs", [
              ["Dead Sea Scrolls", "pushed text back 1,000 yrs"],
              ["Isaiah scroll", "~95%+ match with Masoretic"],
              ["Scribes", "proven careful"],
              ["Cave 4", "richest cave (~15,000 fragments)"],
            ]),
            typeAns(
              "Type the sea near the Qumran caves",
              "Which body of water?",
              ["dead sea", "the dead sea"],
              "The Dead Sea — so salty that nothing lives in it, so dry that everything survives beside it!",
              "Dead Sea"
            ),
            info(
              "🎉 Unit complete!",
              "You now know the story modern museums tell: a shepherd's stone, jars of linen-wrapped scrolls, and a millennium of faithful copying. Next stop: how scholars weigh these witnesses — textual criticism!",
            ),
          ],
        },
      ],
    },
    {
      title: "Textual Criticism 101",
      description: "How scholars compare thousands of manuscripts to recover the original text.",
      emoji: "⚖️",
      color: "#0F8A80",
      lessons: [
        {
          title: "Counting the Witnesses",
          challenges: [
            info(
              "The best-attested book of antiquity",
              "Compare the surviving manuscripts: Caesar's Gallic Wars — about 10 good copies, earliest ~900 years after he wrote. Plato — a handful, ~1,200 years later. Homer's Iliad — the runner-up, with ~643 copies. The New Testament? Over 5,800 Greek manuscripts, 10,000+ Latin, and thousands more in other languages — with fragments within about 100 years of the writing. Nothing else comes close!",
            ),
            match("Tap the pairs — ancient works by surviving copies", [
              ["New Testament", "5,800+ Greek mss"],
              ["Iliad (Homer)", "~643 copies"],
              ["Gallic Wars (Caesar)", "~10 copies"],
              ["Plato", "~7 copies"],
            ]),
            sel(
              "Which ancient work has the MOST surviving manuscript copies?",
              "🏆 The record holder",
              "The New Testament",
              ["Homer's Iliad", "Caesar's Gallic Wars", "Plato's dialogues"],
              "The New Testament — thousands of Greek copies plus thousands of early translations. No contest!"
            ),
            sel(
              "What is P52?",
              "🧾 Fragment check",
              "The earliest known Gospel manuscript fragment (John 18)",
              ["A 5th-century codex", "A Qumran scroll", "A Latin Bible"],
              "P52 (the Rylands fragment) — a scrap of John 18, dated around AD 125–175, found in Egypt: John's Gospel traveled far, fast, and early!"
            ),
            typeAns(
              "How many GREEK New Testament manuscripts do we have? (approximately)",
              "Count them (5,___)",
              ["5800", "5,800", "5800+"],
              "5,800+ Greek manuscripts — and counting with every archaeological season!",
              "5,800+"
            ),
            sel(
              "Why do earlier manuscripts matter?",
              "🤔 Thinking check",
              "Fewer generations of copying between them and the original",
              ["They are prettier", "They are longer", "They are in Latin"],
              "Each copy is one more step from the original — earlier witnesses can be closer to the source!",
            ),
          ],
        },
        {
          title: "Families & Variants",
          challenges: [
            info(
              "The three text families",
              "Scholars group manuscripts into 'families' by shared readings: the ALEXANDRIAN family (Egypt; oldest and generally shortest — Vaticanus, Sinaiticus), the WESTERN family (freer paraphrase — Codex Bezae), and the BYZANTINE family (the majority text of the medieval East — smooth, standardized, ancestor of the KJV's Textus Receptus).",
            ),
            match("Tap the pairs", [
              ["Alexandrian", "oldest, shortest"],
              ["Western", "freer paraphrase"],
              ["Byzantine", "majority, standardized"],
              ["Textus Receptus", "basis of KJV"],
            ]),
            sel(
              "Which family do Vaticanus and Sinaiticus belong to?",
              "🏛️ Family check",
              "Alexandrian",
              ["Western", "Byzantine", "Caesarean"],
              "Alexandrian — Egypt's careful, generally concise tradition."
            ),
            info(
              "Variants — should we worry?",
              "With thousands of handwritten copies come hundreds of thousands of 'variants' — small differences. But the vast majority are spelling, word order, and obvious slips that affect nothing. Famous big ones: the woman caught in adultery (John 7:53–8:11), the long ending of Mark, and the Comma Johanneum (1 John 5:7). Modern Bibles note these honestly in their footnotes — and no doctrine of Christianity hangs on any of them.",
            ),
            sel(
              "Most textual variants are…",
              "🧮 Honest assessment",
              "Spelling and word order — trivial",
              ["Whole lost books", "Changed doctrines", "Forged miracles"],
              "The overwhelming majority are scribal slips and spelling — the text's foundation is rock solid."
            ),
            sel(
              "Where does the story of the woman caught in adultery sit in our earliest manuscripts?",
              "📖 Famous variant",
              "It's missing from the earliest and best witnesses",
              ["It's in every manuscript", "Only in Latin", "Only in Codex Bezae"],
              "John 7:53–8:11 is absent from the earliest Greek witnesses — but present in many later ones. Your Bible's footnote probably tells you!"
            ),
            match("Tap the pairs", [
              ["NA28 / UBS5", "modern critical Greek NT"],
              ["KJV (1611)", "from Textus Receptus"],
              ["ESV, NIV, NASB", "from critical text"],
              ["Footnotes", "honest variant notes"],
            ]),
          ],
        },
        {
          title: "How Scholars Decide",
          challenges: [
            info(
              "External evidence",
              "When manuscripts disagree, scholars weigh the WITNESSES: How old? What family? How carefully copied? A 2nd-century papyrus, a 4th-century uncial, and a 10th-century minuscule are not equal citizens — age, geography, and family quality all count.",
            ),
            info(
              "Internal evidence",
              "Then they ask: which reading best EXPLAINS the others? Scribes tended to smooth rough sayings, harmonize parallel passages, and add reverent titles. So scholars often prefer the HARDER reading (lectio difficilior potior) and the SHORTER one (lectio brevior potior) — not because harder is truer, but because no scribe invents difficulty!",
            ),
            sel(
              "What does 'lectio difficilior potior' mean?",
              "🎓 Scholar's Latin",
              "The harder reading is preferred",
              ["The longest reading wins", "The smoothest reading wins", "Readers prefer difficulty"],
              "Scribes smoothed rough readings — so the awkward one likely came first."
            ),
            sel(
              "Why do scholars often prefer the SHORTER reading?",
              "✂️ Tendency check",
              "Scribes were more likely to ADD than to delete",
              ["Shorter is cheaper", "Paul wrote briefly", "Scrolls had size limits"],
              "Copyists expanded names, harmonized quotes, and 'improved' text — additions, not deletions, were the drift."
            ),
            match("Tap the pairs", [
              ["External evidence", "age, family, geography"],
              ["Internal evidence", "which reading explains others"],
              ["Harder reading", "often original"],
              ["Scribes' habit", "smooth & expand"],
            ]),
            arrange(
              "Order the steps of textual criticism",
              "The scholar's workflow",
              ["Gather the manuscripts", "Compare the readings", "Weigh external evidence", "Weigh internal evidence"],
              ["Publish a novel"],
              "Collect witnesses, map variants, weigh the externals, weigh the internals — and publish the critical text!",
            ),
            info(
              "🎓 Course complete!",
              "You now understand how your Bible reached you: papyrus and parchment, scribes and Masoretes, caves and codices, and the careful science that compares them all. The text has been passed hand to hand for 3,000 years — and it arrived safely. Keep your streak alive and review to earn XP!",
            ),
          ],
        },
      ],
    },
  ],
}
