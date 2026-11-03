// ── Course: The Big Picture (whole-Bible survey) ─────────────
import { info, sel, assist, match, arrange, typeAns, type SeedCourse } from "./helpers"

export const bibleSurveyCourse: SeedCourse = {
  code: "bible-survey",
  title: "The Big Picture",
  subtitle: "The whole Bible, one story",
  description:
    "Journey through all 66 books — how the library fits together, the sweep of both Testaments, and the one redemption story running from Eden to the New Jerusalem.",
  emoji: "📖",
  color: "#7C2D12",
  order: 5,
  units: [
    {
      title: "How the Library Fits",
      description: "66 books, 3 languages, ~40 authors, one story.",
      emoji: "📚",
      color: "#7C2D12",
      difficulty: 1,
      lessons: [
        {
          title: "One Book, Many Pens",
          challenges: [
            info(
              "The Bible is a library",
              "66 books written over ~1,500 years by ~40 authors — kings, shepherds, fishermen, a doctor, a tax collector — in Hebrew, Aramaic and Greek. Yet it tells one coherent story. 'Testament' means covenant: the Old Covenant through Moses and Israel; the New Covenant through Christ (Jer 31:31-34; Luke 22:20).",
            ),
            info(
              "The Old Testament shelf",
              "LAW (Genesis–Deuteronomy) · HISTORY (Joshua–Esther: conquest, kingdom, exile, return) · WISDOM/POETRY (Job–Song of Songs) · MAJOR PROPHETS (Isaiah–Daniel, 'major' = longer) · MINOR PROPHETS (Hosea–Malachi, 'minor' = shorter, not worse).",
            ),
            info(
              "The New Testament shelf",
              "GOSPELS (Matthew–John: the life, death and resurrection of Jesus) · HISTORY (Acts: the church's first 30 years) · PAUL'S LETTERS (Romans–Philemon) · GENERAL LETTERS (Hebrews–Jude) · PROPHECY (Revelation).",
            ),
            match("Match the OT section to its books", [
              ["Law", "Genesis – Deuteronomy"],
              ["History", "Joshua – Esther"],
              ["Wisdom & Poetry", "Job – Song of Songs"],
              ["Major Prophets", "Isaiah – Daniel"],
              ["Minor Prophets", "Hosea – Malachi"],
            ]),
            sel(
              "'Major prophets' are called major because…",
              "Their books are longer",
              ["They are more important", "They came first", "They performed bigger miracles"],
              "'Major' = longer scroll, never 'more important.'",
            ),
            assist(
              "'Testament' literally means ___",
              "The two halves of the Bible are two ___s: old and new.",
              "covenant",
              ["testimony", "treasure", "template"],
              "Covenant — a binding relationship with promises, sealed in blood (Ex 24:8; Luke 22:20).",
            ),
            sel(
              "Which language was MOST of the Old Testament written in?",
              "Hebrew",
              ["Latin", "Greek", "Aramaic"],
              "Hebrew (with stretches of Aramaic in Daniel and Ezra). The NT was written in Greek.",
            ),
            typeAns(
              "How many books are in the whole Protestant Bible? (digits)",
              "66",
              ["66", "sixty six", "sixty-six"],
              "39 OT + 27 NT = 66.",
            ),
          ],
        },
        {
          title: "The Timeline Map",
          challenges: [
            info(
              "Timeline in one breath",
              "Creation & Fall (~?) → Abraham c. 2000 BC → Exodus c. 1446 BC → Kingdom under David c. 1000 BC → Split & Exile (586 BC Jerusalem falls) → Return & rebuild (538–444 BC) → 400 silent years → Jesus c. 4 BC–30 AD → Church to c. 60s AD → Revelation looks ahead.",
            ),
            info(
              "Reading order tip",
              "New readers often start with a Gospel (Mark is fastest, John is deepest), then Acts, then Genesis. The Bible was not written as a page-by-page novel — it is a library, and libraries reward a map before you browse.",
            ),
            sel(
              "Which event happened around 586 BC?",
              "Jerusalem fell and Judah was exiled to Babylon",
              ["The parting of the Red Sea", "David became king", "The walls of Jericho fell"],
              "The exile is the OT's darkest hour — and the prophets' hope glows brightest there.",
            ),
            arrange(
              "Put these eras in order",
              "Patriarchs Exodus Kingdom Exile Return",
              ["Patriarchs", "Exodus", "Kingdom", "Exile", "Return"],
              [],
              "Promise → rescue → kingdom → exile → return: the five-act rhythm of the OT.",
            ),
            match("Match the book to its era", [
              ["Genesis", "Patriarchs"],
              ["Exodus", "Rescue from Egypt"],
              ["1–2 Samuel", "Kingdom rising"],
              ["Lamentations", "Exile begins"],
              ["Nehemiah", "Return & rebuild"],
            ]),
            assist(
              "A new reader wanting the fullest portrait of Jesus should start with the Gospel of ___",
              "It reads like an eyewitness meditation on who Jesus is.",
              "john",
              ["mark", "luke", "matthew"],
              "Mark is the fastest; John is the deepest — start where your hunger is.",
            ),
          ],
        },
        {
          title: "How We Got the Canon",
          challenges: [
            info(
              "Canon: the measuring stick",
              "'Canon' (reed, ruler) means the recognized list of Scripture. Israel received the Law and Prophets; the church recognized the 27 NT books — not by council vote, but by recognizing books the churches already read as apostolic, Spirit-breathed and consistent (2 Pet 3:16 treats Paul's letters as Scripture). By c. 367 AD Athanasius lists all 27; the councils confirmed what was already lived.",
            ),
            info(
              "Tests for a New Testament book",
              "1) APOSTOLIC — written by an apostle or his close coworker. 2) CATHOLIC ('universal') — read and valued across all the churches. 3) CONSISTENT — agrees with the apostolic rule of faith. Gospels and the bulk of Paul were never in doubt; books like Hebrews and Revelation were debated then confirmed.",
            ),
            sel(
              "Which bishop's 367 AD letter lists exactly our 27 New Testament books?",
              "Athanasius",
              ["Augustine", "Constantine", "Irenaeus"],
              "Athanasius' Easter letter — decades before councils formalized it.",
            ),
            assist(
              "'Canon' comes from the Greek word for a ___ (measuring stick)",
              "Scripture is the rule; everything else lines up against it.",
              "reed",
              ["ruler", "rock", "river"],
              "Kanon = reed/ruler. The canon measures; it is not measured.",
            ),
            match("Match the test to its question", [
              ["Apostolic", "Did an apostle or coworker write it?"],
              ["Catholic", "Do all the churches read it?"],
              ["Consistent", "Does it match the rule of faith?"],
            ]),
            sel(
              "Did councils CREATE the canon?",
              "No — they recognized books the churches had already treasured",
              ["Yes — they voted books in", "Yes — Constantine chose the list", "No — the canon is still open"],
              "Recognition, not creation: the sheep already knew the Shepherd's voice (Jn 10:27).",
            ),
            typeAns(
              "2 Peter 3:16 already calls whose letters 'Scripture'? (one word)",
              "paul",
              ["paul", "paul's"],
              "Peter, writing within the apostolic age, ranks Paul's letters with 'the other Scriptures.'",
            ),
          ],
        },
      ],
    },
    {
      title: "The Old Testament Story",
      description: "From Eden's garden to exile's ashes — promise, rescue, kingdom and hope.",
      emoji: "🏜️",
      color: "#A16207",
      difficulty: 2,
      lessons: [
        {
          title: "Beginnings: Gen & Exodus",
          challenges: [
            info(
              "Genesis in four words: created, cursed, chosen, covenant",
              "Ch 1–2: a good world. Ch 3: sin enters — 'you shall be as gods' becomes 'you shall surely die.' Ch 12: God calls Abram with a seven-fold promise — nation, land, blessing… 'and in you all the families of the earth shall be blessed.' Genesis then traces that family through Isaac, Jacob and Joseph into Egypt.",
            ),
            info(
              "Exodus: the gospel in advance",
              "God hears the slaves' groaning (2:24), judges Egypt through ten plagues, and provides the Passover: a LAMB dies so a SON lives (ch 12). The Red Sea parts; the Law is given; a tent is built so God may dwell among them. 'I will take you as my people, and I will be your God' (6:7).",
            ),
            sel(
              "What promise does Genesis 12:3 attach to Abraham's family?",
              "All families of the earth will be blessed through him",
              ["They will never be slaves", "They will conquer Rome", "They will build a pyramid"],
              "The gospel according to Genesis — Paul quotes it in Galatians 3:8.",
            ),
            assist(
              "In the Passover, a ___ dies so a firstborn son lives",
              "Exodus 12 — the gospel in advance.",
              "lamb",
              ["goat", "bull", "bird"],
              "'Christ, our Passover lamb, has been sacrificed' (1 Cor 5:7).",
            ),
            match("Match the Genesis event to its chapter", [
              ["Creation", "Genesis 1–2"],
              ["The Fall", "Genesis 3"],
              ["The Flood", "Genesis 6–9"],
              ["Call of Abram", "Genesis 12"],
            ]),
            arrange(
              "Order the Exodus arc",
              "Slavery Plagues Passover Red Sea Sinai",
              ["Slavery", "Plagues", "Passover", "Red Sea", "Sinai"],
              [],
              "Slavery → plagues → Passover → sea → covenant at Sinai. Rescue THEN relationship.",
            ),
            typeAns(
              "Which mountain did Israel meet God on after the exodus? (one word)",
              "sinai",
              ["sinai", "horeb", "mount sinai"],
              "Sinai (also called Horeb) — where the Law was given.",
            ),
          ],
        },
        {
          title: "Kingdom & Exile",
          challenges: [
            info(
              "From judges to kings",
              "After Joshua's conquest, judges ruled in cycles of sin-crying-out-deliverance. Israel demanded a king 'like the nations' and got Saul — impressive and unstable. God then chose 'a man after his own heart' (1 Sam 13:14): David, the shepherd-king. His son Solomon built the Temple but his heart drifted; the kingdom split in 930 BC: Israel (north, 10 tribes) and Judah (south).",
            ),
            info(
              "The exile, and the prophets' hope",
              "Israel fell to Assyria (722 BC); Judah fell to Babylon (586 BC) — Temple burned, city ruined. Yet the prophets had already sown hope: a NEW covenant (Jer 31), a Suffering Servant (Isa 53), a Shepherd-King (Ezek 34), a Son of Man receiving an everlasting kingdom (Dan 7). Under Persia, exiles returned (Ezra, Nehemiah) — but the story pointed forward, waiting for 'the fullness of time' (Gal 4:4).",
            ),
            sel(
              "Why did God reject Saul as king?",
              "Disobedience — partial obedience is disobedience (1 Sam 15)",
              ["He was too short", "He was from the wrong tribe", "He lost a battle"],
              "'To obey is better than sacrifice' — Saul obeyed the parts he liked.",
            ),
            assist(
              "David was called 'a man after God's own ___'",
              "1 Samuel 13:14.",
              "heart",
              ["army", "throne", "bloodline"],
              "God's king-making criterion has never changed: the heart first.",
            ),
            match("Match the prophet to his signature hope", [
              ["Isaiah", "Suffering Servant (Isa 53)"],
              ["Jeremiah", "New covenant (Jer 31)"],
              ["Ezekiel", "Shepherd-King & dry bones"],
              ["Daniel", "Son of Man's kingdom (Dan 7)"],
            ]),
            sel(
              "The kingdom split after Solomon into…",
              "Israel in the north, Judah in the south",
              ["Judah and Benjamin", "Israel and Philistia", "North and South Egypt"],
              "930 BC — ten tribes north (Israel), two south (Judah), from which come 'Jews.'",
            ),
            typeAns(
              "In which empire's captivity was Judah taken in 586 BC? (one word)",
              "babylon",
              ["babylon", "babylonia", "the babylonian"],
              "Babylon — 'by the rivers of Babylon we sat and wept' (Ps 137:1).",
            ),
          ],
        },
        {
          title: "Wisdom & the Waiting",
          challenges: [
            info(
              "The wisdom shelf",
              "Job: suffering without easy answers. Psalms: the prayer book of the people of God — every emotion brought into God's presence. Proverbs: street-smart godliness in short lines. Ecclesiastes: life 'under the sun' without God is vapour. Song of Songs: covenant love celebrated without shame. Wisdom literature trains the heart, not just the head.",
            ),
            info(
              "The 400 silent years",
              "Between Malachi and Matthew, no recognized prophet speaks — but history sprints: Persia falls to Alexander (331 BC), Greek language and culture spread, Rome rises, and expectations of the Messiah burn hotter from Daniel's clock (Dan 9:24-27). When 'the fullness of time had come, God sent forth his Son' (Gal 4:4), the world had one language, one road network — and one waiting people.",
            ),
            sel(
              "Which book is the prayer book of God's people — every emotion included?",
              "Psalms",
              ["Proverbs", "Leviticus", "Nahum"],
              "Praise, rage, grief, doubt, repentance, triumph — all of it addressed TO God.",
            ),
            assist(
              "Ecclesiastes concludes: 'Fear God and keep his ___'",
              "The whole duty of humanity, says the Preacher.",
              "commandments",
              ["promises", "festivals", "sacrifices"],
              "After 'vanity of vanities' — the one solid ground left standing (Eccl 12:13).",
            ),
            match("Match the wisdom book to its voice", [
              ["Job", "Suffering without easy answers"],
              ["Psalms", "Every emotion prayed"],
              ["Proverbs", "Street-smart godliness"],
              ["Ecclesiastes", "Life under the sun is vapour"],
              ["Song of Songs", "Covenant love celebrated"],
            ]),
            sel(
              "Daniel 9 gave the waiting people…",
              "A prophetic clock for the Anointed One",
              ["A map of Babylon", "A menu of clean foods", "A list of kings"],
              "'Seventy weeks… to anoint the most holy' — the calendar of expectation.",
            ),
            typeAns(
              "Which sea did God part for Israel's exodus? (two words)",
              "red sea",
              ["red sea", "the red sea"],
              "The Red Sea — Israel's baptism moment (1 Cor 10:1-2).",
            ),
          ],
        },
      ],
    },
    {
      title: "The New Testament Story",
      description: "The King arrives, dies rising, and His movement fills the world.",
      emoji: "✝️",
      color: "#166534",
      difficulty: 2,
      lessons: [
        {
          title: "Four Portraits of Jesus",
          challenges: [
            info(
              "Why FOUR gospels?",
              "Matthew: Jesus as promised KING of Israel — fulfilled prophecy everywhere. Mark: Jesus as swift SERVANT — 'immediately' echoes through its 16 chapters. Luke: Jesus as perfect MAN for all nations — a doctor's careful investigation. John: Jesus as divine SON — 'I AM' seven times, that you 'may believe and have life' (Jn 20:31).",
            ),
            info(
              "What the four agree on",
              "Jesus preached God's kingdom, healed the sick, chose twelve, was betrayed, crucified under Pontius Pilate, and rose on the third day. The fourfold portrait gives 3D depth — four witnesses, one Lord.",
            ),
            sel(
              "Which gospel emphasizes Jesus as the fulfilment of Old Testament prophecy?",
              "Matthew",
              ["Mark", "Luke", "John"],
              "'That it might be fulfilled…' rings through Matthew like a bell.",
            ),
            assist(
              "John states his purpose: 'these are written that you may ___ and have life'",
              "John 20:31.",
              "believe",
              ["prosper", "travel", "listen"],
              "'…that you may believe that Jesus is the Christ, the Son of God.'",
            ),
            match("Match the gospel to its portrait of Jesus", [
              ["Matthew", "King of Israel"],
              ["Mark", "Swift Servant"],
              ["Luke", "Perfect Man for all nations"],
              ["John", "Divine Son"],
            ]),
            sel(
              "Under which Roman governor was Jesus crucified — confirmed also by Tacitus?",
              "Pontius Pilate",
              ["Herod Agrippa", "Felix", "Nero"],
              "Pilate — carved in stone: the 'Pilate stone' was found at Caesarea in 1961.",
            ),
            typeAns(
              "How many 'I AM' declarations does John record Jesus making (bread, light, door…)? (digits)",
              "7",
              ["7", "seven"],
              "Seven — bread, light, door, shepherd, resurrection, way-truth-life, true vine.",
            ),
          ],
        },
        {
          title: "Acts: The Church on Fire",
          challenges: [
            info(
              "Acts in three panels",
              "Ch 1–7: Jerusalem — Spirit falls at Pentecost, Peter preaches, 3,000 believe; the church shares everything. Ch 8–12: Judea & Samaria — Philip to the Ethiopian, Saul converted on the Damascus road, Peter to Cornelius' house: Gentiles included! Ch 13–28: ends of the earth — Paul's three journeys, the Jerusalem council, and Rome under house arrest 'proclaiming the kingdom… with all boldness' (28:31).",
            ),
            info(
              "The engine: the Spirit + the word",
              "The book never says 'the spread of Christianity'; it shows the word of God growing (6:7; 12:24; 19:20). The church's engine is not charisma or strategy but Spirit-empowered testimony — 'you will be my witnesses' (1:8).",
            ),
            sel(
              "What happened at Pentecost (Acts 2)?",
              "The Holy Spirit filled the church and 3,000 were baptized",
              ["Peter escaped prison", "Paul was converted", "The Temple fell"],
              "Pentecost: Babel reversed — every nation hears God's praises in its own tongue.",
            ),
            assist(
              "Acts 1:8 maps the expansion: Jerusalem, Judea & Samaria, and the ___ of the earth",
              "The outline of the whole book in one verse.",
              "ends",
              ["kings", "roads", "cities"],
              "…'to the ends of the earth.'",
            ),
            match("Match the person to their moment in Acts", [
              ["Peter", "Pentecost sermon"],
              ["Stephen", "First martyr"],
              ["Philip", "Ethiopian official"],
              ["Saul/Paul", "Damascus road"],
              ["Cornelius", "Gentile Pentecost"],
            ]),
            arrange(
              "Order Paul's journey in Acts 13–14",
              "Sent from Antioch Preached in Asia Minor Stoned at Lystra Returned rejoicing",
              ["Sent from Antioch", "Preached in Asia Minor", "Stoned at Lystra", "Returned rejoicing"],
              ["Baptized the Ethiopian", "Sailed to Rome"],
              "First missionary journey: Cyprus → Galatia → back home — the pattern repeats twice more.",
            ),
            typeAns(
              "In which city was Paul when Acts ends — under guard but preaching freely? (one word)",
              "rome",
              ["rome", "roma"],
              "Rome — the gospel reaches the empire's capital; the book ends open-ended on purpose.",
            ),
          ],
        },
        {
          title: "Letters & the Last Page",
          challenges: [
            info(
              "Reading someone else's mail",
              "21 of the 27 NT books are letters: Paul's 13 (Romans to Philemon), plus Hebrews and the General Letters (James, 1–2 Peter, 1–3 John, Jude). Each was written to a real situation — quarrels, false teaching, discouragement — and each applies the gospel to that situation. Read Romans for doctrine, James for practice, 1 Peter for suffering.",
            ),
            info(
              "Revelation: the end of the beginning",
              "Not a puzzle book but a liturgy of hope: Jesus the slain-and-risen Lamb opens history's scroll; the dragon, beast and Babylon rage and lose; martyrs are told to hold on; and the story closes where it opened — a garden-city, a tree of life, God dwelling with His people, every tear wiped (Rev 21–22). 'Even so, come Lord Jesus.'",
            ),
            sel(
              "Which letter is Paul's systematic masterwork — the gospel from wrath to glory?",
              "Romans",
              ["Philemon", "Jude", "2 John"],
              "Romans: 'the righteousness of God revealed from faith for faith' (1:17).",
            ),
            assist(
              "James 1:22: 'Be ___ of the word, and not hearers only'",
              "The wisdom-shelf echo of the NT.",
              "doers",
              ["keepers", "teachers", "lovers"],
              "Faith that works works faith.",
            ),
            match("Match the letter to its heartbeat", [
              ["Romans", "The gospel in full"],
              ["Galatians", "Freedom from legalism"],
              ["James", "Faith that works"],
              ["1 Peter", "Hope in suffering"],
              ["1 John", "Assurance of life"],
            ]),
            sel(
              "Revelation's central image of Jesus is…",
              "The slain-and-risen Lamb on the throne",
              ["A lion attacking Rome", "A judge with scales", "A shepherd with a staff"],
              "The Lion of Judah appears as a LAMB — the pattern of the whole book (Rev 5:5-6).",
            ),
            typeAns(
              "Which two chapters close the Bible with the new creation? (two chapter numbers, e.g. '21 22')",
              "21 22",
              ["21 22", "revelation 21 22", "rev 21 22"],
              "Revelation 21–22: garden-city, tree of life, no more tears — Eden restored and exceeded.",
            ),
          ],
        },
      ],
    },
    {
      title: "The Thread of Redemption",
      description: "Covenants chaining Eden to the New Jerusalem — the deepest level of Bible study.",
      emoji: "🧵",
      color: "#9D174D",
      difficulty: 3,
      lessons: [
        {
          title: "The Covenant Chain",
          challenges: [
            info(
              "Covenant: God's promise architecture",
              "ADAM — creation mandate and the first gospel hint ('her seed shall crush the serpent's head,' Gen 3:15). NOAH — never again a global flood; the rainbow seal (Gen 9). ABRAHAM — descendants, land, and blessing for all nations (Gen 12; 15; 17). MOSES — law and priesthood, a holy nation (Ex 19–24). DAVID — an everlasting throne (2 Sam 7). NEW — Jeremiah 31:31-34: law written on hearts, sins remembered no more.",
            ),
            info(
              "How the chain holds the Bible together",
              "Each covenant narrows the pipeline of the promise: from humanity → one family → one nation → one dynasty → ONE PERSON, in whom all the promises find their 'Yes' (2 Cor 1:20). The Old Testament is the question; Jesus is the answer; the church is the announcement; the new creation is the consummation.",
            ),
            match("Match the covenant partner to the promise", [
              ["Adam", "Seed will crush the serpent"],
              ["Noah", "No more global flood"],
              ["Abraham", "Blessing for all nations"],
              ["Moses", "A holy nation under law"],
              ["David", "An everlasting throne"],
            ]),
            arrange(
              "Order the covenant chain",
              "Adam Noah Abraham Moses David New Covenant",
              ["Adam", "Noah", "Abraham", "Moses", "David", "New Covenant"],
              [],
              "Six links, one promise — all converging on Christ.",
            ),
            assist(
              "2 Corinthians 1:20: all God's promises find their '___' in Jesus",
              "The chain's clasp.",
              "yes",
              ["end", "law", "rest"],
              "'All the promises of God find their Yes in him.'",
            ),
            sel(
              "Genesis 3:15 — the 'protoevangelium' — promises…",
              "The woman's seed crushing the serpent's head",
              ["A rainbow after rain", "A city on a hill", "A kingdom split in two"],
              "The first gospel whisper: victory through the seed, won at a cost ('you shall bruise his heel').",
            ),
            typeAns(
              "Which prophet announces the NEW covenant written on hearts? (one word)",
              "jeremiah",
              ["jeremiah", "jeremias"],
              "Jeremiah 31:31-34 — quoted in full in Hebrews 8.",
            ),
          ],
        },
        {
          title: "Types & Shadows",
          challenges: [
            info(
              "The Bible rhymes",
              "God pre-echoes Christ across the OT: the Passover LAMB → 'Christ our Passover' (1 Cor 5:7). The bronze SERPENT lifted for healing → 'as Moses lifted up the serpent… so must the Son of Man be lifted up' (Jn 3:14). MANNA in the wilderness → 'I am the bread of life' (Jn 6). The DAY OF ATONEMENT's two goats → sacrifice and scapegoat (Lev 16; Heb 9). JONAH three days → 'the sign of Jonah' (Mt 12:40).",
            ),
            info(
              "How to read types without wild guessing",
              "A true 'type' is one the NT itself authorizes (as those above), or one that transparently matches redemptive pattern — never a coded Bible code. The rule: the OT is the seed, the NT is the flower; the flower explains the seed, not vice versa.",
            ),
            sel(
              "'Christ our Passover lamb has been sacrificed' — which OT event does this claim Jesus fulfils?",
              "The Passover lamb dying so the firstborn lives",
              ["The flood", "The exodus from Canaan", "The building of the tower"],
              "1 Cor 5:7 — the exodus is the gospel in advance.",
            ),
            assist(
              "Jesus said: 'As Moses lifted up the serpent… so must the Son of Man be ___'",
              "John 3:14 — a strange, precise prediction of the cross.",
              "lifted up",
              ["anointed", "hidden", "crowned"],
              "Lifted up — as the bronze serpent brought healing to lookers, the cross brings life.",
            ),
            match("Match the shadow to its substance", [
              ["Passover lamb", "Christ's sacrifice"],
              ["Manna", "Bread of life"],
              ["Bronze serpent", "The lifted-up Christ"],
              ["Day of Atonement", "Final sacrifice (Heb 9)"],
              ["Jonah's three days", "The sign of resurrection"],
            ]),
            sel(
              "Reading 'Bible codes' into every OT detail…",
              "Overreaches — authorized types are the NT's own, not our inventions",
              ["Is the mark of a great scholar", "Is commanded in Leviticus", "Replaces grammatical study"],
              "Flower explains seed — never the reverse.",
            ),
            typeAns(
              "Which book argues at length that the Levitical sacrifices were shadows fulfilled by Christ? (one word)",
              "hebrews",
              ["hebrews"],
              "Hebrews — the 'better' book: better priest, covenant, sacrifice, promises.",
            ),
          ],
        },
        {
          title: "From Eden to the City",
          challenges: [
            info(
              "The Bible's first and last chapters rhyme",
              "Genesis opens: garden, tree of life, river, bride, walk with God — then LOST. Revelation closes: garden-CITY, tree of life 'for the healing of the nations,' river of life, the Bride the Lamb's wife, God dwelling with His people — RESTORED and exceeded. History is not a circle but an arc: paradise lost → paradise regained at greater cost and greater glory.",
            ),
            info(
              "You in the story",
              "The Bible is not mainly about what you must do for God but what God has done to bring you home. Reading it whole — 66 books, one story — turns the parts into a map: genealogies are the pipeline of the promise; laws show holiness and our failure; prophecies keep hope alive; gospels deliver the climax; letters apply the victory; Revelation guarantees the end. 'Let the one who is thirsty come' (Rev 22:17).",
            ),
            sel(
              "The Bible's storyline is best described as…",
              "An arc: paradise lost → redemption → paradise restored",
              ["A circle of endless rebirths", "A random anthology of wise sayings", "A moral ladder we climb to God"],
              "Creation → Fall → Redemption → Restoration — an arc with a cross at the centre.",
            ),
            arrange(
              "Order the whole Bible's six-act arc",
              "Creation Fall Israel Christ Church New Creation",
              ["Creation", "Fall", "Israel", "Christ", "Church", "New Creation"],
              [],
              "The map for every future read-through — you now hold it.",
            ),
            match("Match Genesis' loss to Revelation's answer", [
              ["Tree guarded", "Tree of life freely given"],
              ["God hidden", "God dwells with His people"],
              ["Bride taken from side", "Bride made ready for the Lamb"],
              ["River of Eden", "River of the water of life"],
            ]),
            assist(
              "Revelation 22:17 invites: 'Let the one who is ___ come'",
              "The Bible's last invitation — still open.",
              "thirsty",
              ["worthy", "perfect", "learned"],
              "'…and let the one who is thirsty come; whoever desires, let him take the water of life freely.'",
            ),
            typeAns(
              "Give the four words of the Bible's whole arc in order (e.g. 'Creation Fall Redemption Restoration').",
              "creation fall redemption restoration",
              ["creation fall redemption restoration"],
              "Creation · Fall · Redemption · Restoration — the one story of the 66.",
            ),
          ],
        },
      ],
    },
  ],
}
