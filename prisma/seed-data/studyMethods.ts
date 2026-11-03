// ── Course: Study Skills (how to study the Bible) ────────────
import { info, sel, assist, match, arrange, typeAns, type SeedCourse } from "./helpers"

export const studyMethodsCourse: SeedCourse = {
  code: "study-methods",
  title: "Study Skills",
  subtitle: "Handle the word rightly",
  description:
    "Learn the craft: observe what the text says, interpret what it meant, apply what it means — genre by genre, with word studies, cross-references and a plan to hide the word in your heart.",
  emoji: "🔍",
  color: "#BE123C",
  order: 6,
  units: [
    {
      title: "The O.I.A. Craft",
      description: "Observation, Interpretation, Application — the foundational discipline.",
      emoji: "🔎",
      color: "#BE123C",
      difficulty: 2,
      lessons: [
        {
          title: "Observation: See First",
          challenges: [
            info(
              "The discipline of seeing before saying",
              "Most misreading skips step one. OBSERVATION asks only: what does the text SAY? — who, what, when, where, repeated words, contrasts ('but'), comparisons ('like'), connecting words ('therefore'), verbs, tone. Read like a detective, not a tourist. The prophet's counsel: 'Stand by the roads, and look… ask for the ancient paths' (Jer 6:16).",
            ),
            info(
              "The 5 W's and an H",
              "WHO is speaking/writing? To WHOM? WHAT happens or is commanded? WHEN and WHERE? WHY does the author say it here? HOW is it argued (story, poem, letter, law)? Write your observations in the margin — Ezra 'set his heart to study the Law… and to do it' (Ezra 7:10).",
            ),
            sel(
              "Observation asks…",
              "What does the text SAY?",
              ["What does it mean to me?", "What should I do?", "What do commentators say?"],
              "See first, say second, do third — order protects you from imagination.",
            ),
            match("Match the marker to what it flags", [
              ["'But'", "Contrast"],
              ["'Therefore'", "Consequence"],
              ["'Like / as'", "Comparison"],
              ["Repeated word", "Emphasis"],
            ]),
            assist(
              "Ezra 'set his heart to study the Law… and to ___ it'",
              "Ezra 7:10 — study, do, teach. In that order.",
              "do",
              ["teach", "defend", "sing"],
              "Study → do → teach: the sequence that guards teachers from hypocrisy.",
            ),
            sel(
              "The best first move when studying a passage is…",
              "Read it several times slowly, noting observations",
              ["Consult three commentaries", "Ask what it means to you", "Skip to the application"],
              "Commentaries answer questions YOU haven't asked yet — observe first.",
            ),
            typeAns(
              "Give the O.I.A. steps in order (three words).",
              "observation interpretation application",
              ["observation interpretation application"],
              "Observation · Interpretation · Application — the craft of handling the word rightly.",
            ),
          ],
        },
        {
          title: "Interpretation: Then & There",
          challenges: [
            info(
              "The golden rule of meaning",
              "A text cannot mean what it never meant. Ask FIRST: what did this mean to its author and first readers — in their language, culture, genre and place in the story? THEN carry the principle across the bridge to today. 'Do your best to present yourself to God as one approved… rightly handling the word of truth' (2 Tim 2:15).",
            ),
            info(
              "Context is king",
              "Three circles: IMMEDIATE — the verses around it (who is 'you'?). BOOK — why is this whole book written (John 20:31; Luke 1:1-4)? CANON — how does it fit the whole story (the psalms of imprecation in light of Romans 12:19)? A text without a context is a pretext — for anything.",
            ),
            info(
              "Let the genre set the rules",
              "You don't read Psalms like Leviticus or Revelation like Proverbs. Poetry uses images and hyperbole; narrative reports what happened without always approving it; law is covenant instruction; prophecy combines near fulfilment and far horizon. Next unit trains each genre — here, just lock in: meaning is what the AUTHOR intended, discovered in context.",
            ),
            sel(
              "'A text cannot mean what it never meant' guards against…",
              "Reading today's ideas INTO the ancient text (eisegesis)",
              ["Reading too slowly", "Using study Bibles", "Memorizing verses"],
              "Eisegesis = reading in; exegesis = drawing out. Context is the boundary line.",
            ),
            assist(
              "2 Timothy 2:15 charges us to 'rightly ___ the word of truth'",
              "Like a craftsman cutting straight.",
              "handle",
              ["cut", "guard", "recite"],
              "'Rightly handling' — Greek: orthotomeō, to cut a straight path.",
            ),
            match("Match the context circle to its question", [
              ["Immediate", "What do the surrounding verses do?"],
              ["Book", "Why was this whole book written?"],
              ["Canon", "How does it fit the whole Bible story?"],
            ]),
            sel(
              "Narrative parts describing polygamy or deception are…",
              "Describing what happened, not prescribing what's right",
              ["Commands to imitate", "Proof God approves", "Errors to cut out"],
              "Narrative is descriptive more than prescriptive — check the law and the outcomes before copying.",
            ),
            typeAns(
              "What is the technical term for reading your own ideas INTO the text? (one word)",
              "eisegesis",
              ["eisegesis"],
              "Eisegesis (reading in) vs exegesis (drawing out).",
            ),
          ],
        },
        {
          title: "Application: Here & Now",
          challenges: [
            info(
              "Building the bridge",
              "Application crosses from THEN/THERE to HERE/NOW without twisting the text. Ask: What does this reveal about God? About people? Is there a command to obey, a promise to trust, a sin to confess, an example to follow or flee, a truth to believe? Then make it concrete: one action, one date, one person. 'Be doers of the word, and not hearers only' (Jas 1:22).",
            ),
            info(
              "The application trap",
              "Applications must be AUTHORIZED by the author's meaning. 'I can do all things through Christ' (Phil 4:13) was written about contentment in poverty and plenty — it strengthens endurance, not athletic trophies. The principle stays; the packaging may change. Wrongly applied truth still misleads.",
            ),
            sel(
              "Philippians 4:13, in context, promises strength for…",
              "Contentment in every circumstance, plenty or want",
              ["Winning competitions", "Getting rich", "Never feeling pain"],
              "Paul writes from prison about learned contentment — the verse still empowers, within its lane.",
            ),
            assist(
              "James 1:22: 'Be doers of the word, and not ___ only'",
              "The O.I.A. journey lands here.",
              "hearers",
              ["readers", "talkers", "thinkers"],
              "Hearing without doing is a mirror immediately forgotten (Jas 1:23-24).",
            ),
            match("Match the passage element to an application move", [
              ["Command", "Obey it concretely"],
              ["Promise", "Trust it today"],
              ["Warning", "Flee what it flags"],
              ["Example", "Follow or flee it"],
            ]),
            sel(
              "A good application is…",
              "Specific, personal and doable this week",
              ["Grand, vague and eternal", "Only for other people", "Purely emotional"],
              "One action, one date, one person — the seed of real change.",
            ),
            typeAns(
              "Name the bridge every application crosses: from 'then and there' to '___ and ___' (two words).",
              "here now",
              ["here now", "here and now"],
              "From then/there to here/now — carried by the author's intended principle.",
            ),
          ],
        },
      ],
    },
    {
      title: "Reading by Genre",
      description: "Each shelf of the library has its own reading rules.",
      emoji: "🗂️",
      color: "#C2410C",
      difficulty: 2,
      lessons: [
        {
          title: "Narrative & Law",
          challenges: [
            info(
              "Narrative: 40% of the Bible",
              "Rules: follow the PLOT (setting → conflict → resolution), watch CHARACTER comparisons (Eli vs Hannah, Saul vs David), notice REPETITION and IRONY, and remember: description ≠ prescription. Narratives show God working through flawed people — 'these things took place as examples for us' (1 Cor 10:6, 11).",
            ),
            info(
              "Law: covenant documents",
              "The Law (Torah) is Israel's covenant charter: moral core (Ten Commandments), civil case-law, and ritual purity. Ask of each law: what does it reveal about God's holiness, Israel's neighbours, and the gospel shadow (sacrifice, priesthood, tabernacle)? 'The law was our guardian until Christ came' (Gal 3:24) — not a ladder to climb, a teacher pointing forward.",
            ),
            sel(
              "Because narrative is descriptive, we…",
              "Look for what it reveals, not merely what to repeat",
              ["Must obey every act reported", "Should skip the stories", "Cannot learn from it"],
              "David's adultery is reported, not recommended — but it is loaded with revelation about sin and grace.",
            ),
            assist(
              "Galatians 3:24: 'the law was our ___ until Christ came'",
              "The law leads to Christ; it doesn't replace him.",
              "guardian",
              ["ladder", "mirror", "judge"],
              "Paidagōgos — the slave who walked the child TO school. Destination: Christ.",
            ),
            match("Match the law kind to its example", [
              ["Moral core", "Ten Commandments"],
              ["Civil case-law", "Ox-goring rules"],
              ["Ritual purity", "Clean and unclean foods"],
              ["Gospel shadow", "Passover & Day of Atonement"],
            ]),
            sel(
              "The three questions to ask of any narrative are…",
              "Plot, characters, repetition/irony",
              ["Rhyme, meter, melody", "Date, price, author photo", "Greek, Hebrew, Latin"],
              "Setting→conflict→resolution; who is contrasted with whom; what echoes keep returning.",
            ),
            typeAns(
              "What fraction of the Bible is narrative, roughly? Give a percentage number.",
              "40",
              ["40", "40%", "forty", "forty percent"],
              "About 40% story — because God reveals Himself in acts, not only aphorisms.",
            ),
          ],
        },
        {
          title: "Poetry & Prophecy",
          challenges: [
            info(
              "Poetry: the heart of the text",
              "Hebrew poetry rhymes IDEAS, not sounds: parallelism — SYNONYMOUS (second line echoes, Ps 24:1), ANTITHETICAL (second line contrasts, Prov 15:1), SYNTHETIC (second line advances, Ps 1:3). Images are bold on purpose: 'trees clapping their hands' is metaphor, not meteorology. Read slowly, aloud, feeling-first — then think.",
            ),
            info(
              "Prophecy: near and far",
              "Prophets were covenant prosecutors: 'Thus says the LORD' calling Israel back to Sinai. Most oracles address the NEAR (Assyria, Babylon, exile) with a FAR horizon (Messiah, new covenant, final day). The 'mountain peaks' rule: from the valley, two peaks can look adjacent though miles apart. Expect near fulfilment first; let the NT confirm the far (1 Pet 1:10-12).",
            ),
            sel(
              "Hebrew poetry 'rhymes' by…",
              "Repeating, contrasting or advancing IDEAS between lines",
              ["Ending sounds of words", "Syllable counts", "Musical notation"],
              "Parallelism — the second line is the first line's echo, opposite, or next step.",
            ),
            match("Match the parallelism to its pattern", [
              ["Synonymous", "Line 2 echoes line 1"],
              ["Antithetical", "Line 2 contrasts line 1"],
              ["Synthetic", "Line 2 advances line 1"],
            ]),
            assist(
              "The prophets were covenant ___: bringing God's lawsuit against Israel's unfaithfulness",
              "Their sermons presuppose Sinai.",
              "prosecutors",
              ["poets", "politicians", "protesters"],
              "Covenant prosecutors — 'contend with your mother' (Hos 2:2), courtroom language throughout.",
            ),
            sel(
              "The 'mountain peaks' rule explains why prophets…",
              "Blend near events and distant fulfilments into one view",
              ["Never foretell anything", "Only speak of the far future", "Speak only to kings"],
              "Two distant peaks can appear side by side from the valley — prophecy does the same with time.",
            ),
            typeAns(
              "Which Psalm opens 'The heavens declare the glory of God' — Hebrew poetry at full power? Give its number.",
              "19",
              ["19", "psalm 19"],
              "Psalm 19 — creation's testimony and Torah's perfection in one poem.",
            ),
          ],
        },
        {
          title: "Gospels & Parables",
          challenges: [
            info(
              "Reading a Gospel",
              "Each Gospel is a PORTRAIT with a thesis (Jn 20:31), arranged theologically as well as chronologically. Watch for: fulfillment formulas (Mt), 'immediately' urgency (Mk), journeys to Jerusalem (Lk), 'I AM' signs (Jn). Ask: what does THIS Gospel emphasize about Jesus — and why does the church need all four?",
            ),
            info(
              "Parables: one point, sharp edges",
              "A parable is an earthly story with a heavenly punch. Rules: 1) Find the ONE main point (and the 'hook' — the detail that shocks). 2) Identify the audience (disciples? crowds? Pharisees?) — Luke 15's three lost things answer grumbling religionists. 3) Note the kingdom reversal: the elder brother sulks while the whore gets the ring. Don't allegorize every detail — the sower isn't about farming technique.",
            ),
            sel(
              "The first job with a parable is to find…",
              "The one main point and its shock",
              ["A full allegory of every detail", "The original Hebrew", "The moral for children only"],
              "The Good Samaritan is about who counts as a neighbour — not a first-aid manual.",
            ),
            assist(
              "Luke 15's three parables (lost sheep, coin, son) were Jesus' answer to ___",
              "'The Pharisees and scribes grumbled, saying, This man receives…'",
              "grumbling",
              ["prayer", "fasting", "taxes"],
              "They answer the grumblers: heaven REJOICES over the found — do you?",
            ),
            match("Match the Gospel to its signature move", [
              ["Matthew", "Fulfilment formulas"],
              ["Mark", "'Immediately' urgency"],
              ["Luke", "Journey to Jerusalem"],
              ["John", "'I AM' signs"],
            ]),
            sel(
              "The 'hook' of the Prodigal Son parable is…",
              "The elder brother — the 'good' one — stays outside the feast",
              ["The pigs' menu", "The ring's cost in shekels", "The father's age"],
              "Every hearer is left inside one of two brothers — the shocking one is the 'good' one.",
            ),
            typeAns(
              "Which Gospel states its thesis in 20:31 — 'that you may believe… and have life'?",
              "john",
              ["john", "the gospel of john"],
              "John — the thesis-driven Gospel.",
            ),
          ],
        },
        {
          title: "Epistles & Revelation",
          challenges: [
            info(
              "Letters: someone else's mail with your name on it",
              "Structure to trace: (1) opening & thanksgiving, (2) body — usually a problem and the gospel answer, (3) practical exhortations, (4) greetings. Find the INDICATIVE before the IMPERATIVE: what God has DONE before what you must do (Eph 1–3 then 4–6). Ask what problem occasioned it, and let paragraphs — not verses — carry the freight.",
            ),
            info(
              "Revelation: a liturgy of hope",
              "Genre: apocalypse + prophecy + letter. Rules: read IMAGERY through the OT (beast → Daniel 4-7; Babylon → exile), follow the STRUCTURE (sevens and cycles), read with the CHURCH of every age — persecuted, tempted, tired — and anchor every interpretation in the slain Lamb. Blessing promised 'to the one who reads aloud… and keeps it' — Revelation is meant to be sung, not decrypted.",
            ),
            sel(
              "The Ephesians pattern is…",
              "Chapters 1–3 tell what God DID; chapters 4–6 what we DO",
              ["Commands first, doctrine later", "All doctrine, no commands", "All commands, no doctrine"],
              "Indicative before imperative — grace powers obedience, never reverses it.",
            ),
            assist(
              "Revelation's blessing falls on 'the one who reads aloud… and ___ it'",
              "Revelation 1:3 — a book to be lived.",
              "keeps",
              ["decodes", "debates", "sells"],
              "Read, hear, KEEP — the blessing is for doers, even of this hardest book.",
            ),
            match("Match the letter part to its role", [
              ["Opening & thanksgiving", "Names the church and its graces"],
              ["Body", "Problem met with the gospel"],
              ["Exhortations", "Faith worked out in conduct"],
              ["Greetings", "The wider church networking"],
            ]),
            sel(
              "Revelation's imagery is decoded chiefly by…",
              "The Old Testament, which supplies its symbols",
              ["Modern newspapers", "Star charts", "Personal dream dictionaries"],
              "Beasts from Daniel, Babylon from the exile, the Lamb from Isaiah 53 — Scripture interprets Scripture.",
            ),
            typeAns(
              "Revelation combines three genres — apocalypse, prophecy and which third? (one word)",
              "letter",
              ["letter", "epistle"],
              "It opens like a letter 'to the seven churches' — written to real, tired, tempted believers.",
            ),
          ],
        },
      ],
    },
    {
      title: "Going Deeper",
      description: "Word studies, cross-references, translations, background — the craftsman's toolkit.",
      emoji: "🧰",
      color: "#4D7C0F",
      difficulty: 3,
      lessons: [
        {
          title: "Word Studies Without Falling",
          challenges: [
            info(
              "The classic case: agapē vs phileō",
              "Folk-etymology claims agapē is God's special divine love and phileō mere friendship. But: the Father loves (phileō) the Son (Jn 5:20); Paul 'kissed' (same root) his friends; and in 2 Sam 13 (LXX), Amnon agapa-s his sister Tamar… and then hates her. The correction: words don't carry fixed theological cargo — CONTEXT loads the meaning. Word studies serve context, never replace it.",
            ),
            info(
              "How to do a responsible word study",
              "1) Choose a word in ONE verse. 2) Find its range: how does this author use it elsewhere? the whole NT? the LXX? 3) Check the immediate context's selection. 4) Let the range inform, the context decide. Tools: a concordance, an interlinear, a lexicon (Strong's, BDAG). Never build a doctrine on etymology alone — 'butterfly' contains 'butter' and 'fly' but is neither.",
            ),
            sel(
              "The main correction to the popular agapē/phileō theory is…",
              "Context, not etymology, determines a word's meaning",
              ["Agapē doesn't exist", "Phileō is untranslatable", "Greek has no word for love"],
              "John 5:20, 2 Sam 13 (LXX) — the same roots appear where the theory forbids them.",
            ),
            assist(
              "The command 'Love (agapaō) your enemies' (Mt 5:44) shows agapē can be ___",
              "A love you are COMMANDED to choose — not a spontaneous glow.",
              "commanded",
              ["optional", "mysterious", "earned"],
              "Agapē is love of the will as much as the heart — evidenced by action toward the unworthy.",
            ),
            match("Match the word-study step to its question", [
              ["Choose", "Which word in which verse?"],
              ["Range", "How do author/NT/LXX use it?"],
              ["Context", "What does THIS passage select?"],
              ["Conclude", "Meaning in this verse, stated modestly"],
            ]),
            sel(
              "Etymology alone is a poor guide because…",
              "Words change meaning; usage, not origin, carries sense",
              ["Etymology is always wrong", "Greek has no etymology", "Only Hebrew counts"],
              "'Butterfly' contains butter and fly — and is neither. Use usage.",
            ),
            typeAns(
              "Which tool lists every occurrence of a Greek/Hebrew word in Scripture? (one word)",
              "concordance",
              ["concordance", "a concordance"],
              "A concordance (Strong's is the classic) — the word-hunter's net.",
            ),
          ],
        },
        {
          title: "Cross-References & Translations",
          challenges: [
            info(
              "Scripture interprets Scripture",
              "Three guards: 1) CLEAR passages interpret CLOUDY ones (don't build on one odd verse). 2) AUTHOR-priority: let Paul interpret Paul before welding him to James. 3) The WHOLE counsel (Acts 20:27) — a doctrine is secure when the Bible's full weight rests on it. Chain references and a good study Bible are your scaffolding.",
            ),
            info(
              "Why translations differ",
              "Formal-equivalence (KJV, NASB, ESV) leans word-for-word; dynamic (NIV) leans thought-for-thought; paraphrase (The Message) re-voices. Compare two or three on a hard verse — where they agree, read confidently; where they differ, the notes tell you the textual or translational choice. Even our app's KJV and the manuscripts course show: variants exist, and honesty about them is a strength.",
            ),
            sel(
              "The rule 'clear interprets cloudy' means…",
              "Build doctrine on plain texts, not one obscure verse",
              ["Difficult verses are worthless", "Only clear books should be read", "Cloudiness is sinful"],
              "Revelation's imagery yields to John's plain statements — not the reverse.",
            ),
            assist(
              "Acts 20:27: 'I did not shrink from declaring to you the whole ___ of God'",
              "Topical preaching collects; expository preaching reads whole.",
              "counsel",
              ["letter", "law", "story"],
              "The whole counsel — the antidote to hobby-horse religion.",
            ),
            match("Match the translation to its philosophy", [
              ["KJV / NASB / ESV", "Formal — closer to word order"],
              ["NIV", "Dynamic — thought-for-thought"],
              ["The Message", "Paraphrase — re-voicing"],
            ]),
            sel(
              "When two translations differ on a verse, you should…",
              "Check the textual/translation notes and weigh both",
              ["Panic and quit Bible study", "Keep whichever you like", "Assume the newest is right"],
              "Differences are usually visible, explicable, and non-doctrinal — transparency, not conspiracy.",
            ),
            typeAns(
              "Which principle says to let Paul interpret Paul before forcing him onto James? (hyphenated word)",
              "author-priority",
              ["author-priority", "author priority"],
              "Author-priority — each writer's own usage first.",
            ),
          ],
        },
        {
          title: "Background & Tools",
          challenges: [
            info(
              "Why background matters",
              "Knowing Corinth was a two-harbour trade city full of temples and newly-rich strivers makes 1 Corinthians click: factionalism, lawsuits, food sacrificed to idols, head coverings, the 'resurrection body' debate. Knowing Ps 23 is a SHEPHERD psalm sung by a king makes 'he leads me' both pastoral and royal. Bible dictionaries, atlases, and background commentaries are bridges over the culture gap.",
            ),
            info(
              "The toolkit, honestly ranked",
              "1) The BIBLE ITSELF — read in big chunks, repeatedly. 2) A reading PLAN and a notebook. 3) Two or three TRANSLATIONS. 4) A study Bible with honest notes. 5) Bible dictionary & atlas for background. 6) One trusted commentary per book — AFTER you've studied it yourself. Tools serve the meal; they are not the meal (Ezra 7:10 again).",
            ),
            sel(
              "Corinth's setting as a busy trade city helps explain…",
              "Its factions, lawsuits and meat-market dilemmas",
              ["Its love of genealogies", "Its refusal to use ships", "Its silence about the resurrection"],
              "Background doesn't decode the text — it clears the fog around it.",
            ),
            assist(
              "Psalm 23's shepherd imagery meant royalty too, because Israel's ideal ___ was a shepherd",
              "Think David — and Ezekiel 34's Shepherd-King.",
              "king",
              ["priest", "prophet", "soldier"],
              "'The LORD is my shepherd' — covenant King as tender Keeper.",
            ),
            match("Match the tool to its job", [
              ["Bible dictionary", "Background on people, places, customs"],
              ["Atlas", "Geography of journeys and lands"],
              ["Interlinear", "Original text beside your language"],
              ["Commentary", "A scholar's map after your own attempt"],
            ]),
            sel(
              "When should you consult a commentary?",
              "After you have observed and wrestled yourself",
              ["Instead of reading the text", "Before every verse", "Never — they mislead"],
              "Commentary as coach, not chauffeur — you do the lifting it then corrects.",
            ),
            typeAns(
              "Which tool maps the journeys of Paul and the lands of the prophets? (one word)",
              "atlas",
              ["atlas", "an atlas", "bible atlas"],
              "A Bible atlas — geography preaches: distances, deserts, mountains and roads all argue.",
            ),
          ],
        },
      ],
    },
    {
      title: "Hide It in Your Heart",
      description: "Memorization and meditation — the word moved from page to pulse.",
      emoji: "❤️‍🔥",
      color: "#7E22CE",
      difficulty: 3,
      lessons: [
        {
          title: "Why Memorize?",
          challenges: [
            info(
              "The biblical case",
              "'I have stored up your word in my heart, that I might not sin against you' (Ps 119:11). Memorized Scripture: arms the Holy Spirit's sword in temptation (Jesus in the wilderness — Mt 4), fuels unceasing prayer, steadies the night shift of anxiety, makes counselling and witness instant, and lets the aged keep the feast when eyes grow dim. You will pray what you have hidden.",
            ),
            info(
              "How the brain cooperates",
              "Spaced repetition beats cramming: review at expanding intervals (1 day, 3, 7, 14, 30). Say aloud, write out, recite the REFERENCE first and last (bookends stop verse-orphaning). Use the app's practice hub — every review re-sharpens. Aim for quality over volume: one verse well-kept beats ten half-known.",
            ),
            sel(
              "Psalm 119:11 gives memorization's purpose as…",
              "Guarding the heart against sin",
              ["Winning Bible trivia", "Impressing the small group", "Filling quiet time"],
              "'…that I might not sin against you' — Scripture as sword, not souvenir.",
            ),
            assist(
              "Jesus answered each wilderness temptation with 'It is ___'",
              "Matthew 4 — the memorized word in combat.",
              "written",
              ["finished", "enough", "said"],
              "'It is written' — the sword drawn instantly (Eph 6:17).",
            ),
            match("Match the memory aid to its use", [
              ["Spaced repetition", "Review at growing intervals"],
              ["Bookend the reference", "Prevents verse-orphaning"],
              ["Say aloud & write", "Deepens multi-sensory encoding"],
              ["Small verse count", "Quality over volume"],
            ]),
            sel(
              "Which temptation-response pattern does Matthew 4 model for us?",
              "Answering temptation with memorized Scripture",
              ["Fasting longer than the tempter", "Arguing from philosophy", "Silence and withdrawal"],
              "'It is written' three times — the same sword the Spirit still hands us.",
            ),
            typeAns(
              "Give the interval pattern of spaced repetition in days (e.g. '1 3 7 14 30').",
              "1 3 7 14 30",
              ["1 3 7 14 30"],
              "Day 1 → 3 → 7 → 14 → 30: expanding review, the curve of remembering.",
            ),
          ],
        },
        {
          title: "Meditation ≠ Emptiness",
          challenges: [
            info(
              "Biblical meditation is chewing, not emptying",
              "The word hagah means to mutter, murmur — like a lion over prey (Isa 31:4), or a cow chewing cud. Joshua 1:8: 'This Book of the Law shall not depart from your MOUTH; you shall MEDITATE on it day and night.' Take one verse; ask it ten questions; turn it into prayer; carry it through the day like a stone in the shoe. Blessed is the one whose 'delight is in the law of the LORD… and in his law he meditates day and night' (Ps 1:2).",
            ),
            info(
              "A simple practice: verse → prayer → obedience",
              "1) VERSE: read one slowly, five times. 2) PRAYER: turn every clause into address — 'The LORD is my shepherd' → 'Lord, BE my shepherd today in…'. 3) OBEDIENCE: name one act today that the verse makes different. Meditation ends in doxology and obedience — never in vagueness.",
            ),
            sel(
              "The Hebrew picture behind 'meditate' (hagah) is…",
              "A lion growling over prey — slow, absorbed chewing",
              ["Sitting perfectly silent", "Emptying the mind", "Racing through chapters"],
              "Meditation is intensity, not emptiness — the soul at work on the word.",
            ),
            assist(
              "Joshua 1:8: 'you shall meditate on it day and ___'",
              "Round-the-clock rumination.",
              "night",
              ["morning", "sabbath", "feast"],
              "Day and night — the word as constant companion.",
            ),
            match("Match the meditation step to its move", [
              ["Verse", "Read one slowly, five times"],
              ["Prayer", "Turn each clause into address"],
              ["Obedience", "Name one act it changes today"],
            ]),
            sel(
              "Psalm 1 says the one who meditates on the law is like…",
              "A tree planted by streams of water",
              ["A cloud drifting at dawn", "A lion among gazelles", "A lamp on a hill"],
              "Roots before fruit — meditation is how roots drink.",
            ),
            typeAns(
              "Name the three-part practice taught in this lesson (three words).",
              "verse prayer obedience",
              ["verse prayer obedience"],
              "Verse → prayer → obedience: the word become prayer become walk.",
            ),
          ],
        },
        {
          title: "Verse by Heart: John 3:16 & Psalm 23:1",
          challenges: [
            info(
              "Memorize John 3:16 (KJV)",
              "'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.' — Say it aloud twice, bookend the reference, then assemble it below.",
            ),
            arrange(
              "Assemble John 3:16 (KJV)",
              "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.",
              ["For", "God", "so", "loved", "the", "world,", "that", "he", "gave", "his", "only", "begotten", "Son,", "that", "whosoever", "believeth", "in", "him", "should", "not", "perish,", "but", "have", "everlasting", "life."],
              ["nevertheless", "quickly", "perhaps"],
              "For God so loved the world… — the gospel in one sentence.",
            ),
            info(
              "Memorize Psalm 23:1 (KJV)",
              "'The LORD is my shepherd; I shall not want.' — Six Hebrew-English words that reframe a whole life: royal Keeper, personal pronoun, and a soul provided for.",
            ),
            arrange(
              "Assemble Psalm 23:1 (KJV)",
              "The LORD is my shepherd; I shall not want.",
              ["The", "LORD", "is", "my", "shepherd;", "I", "shall", "not", "want."],
              ["never", "maybe", "always"],
              "The LORD is my shepherd; I shall not want. — now carry it through the day.",
            ),
            typeAns(
              "Type John 3:16's opening five words (KJV).",
              "for god so loved the",
              ["for god so loved the", "for god so loved the world"],
              "'For God so loved the world' — the most memorized sentence in history.",
            ),
            typeAns(
              "Type Psalm 23:1 in full (KJV).",
              "the lord is my shepherd i shall not want",
              ["the lord is my shepherd i shall not want", "the lord is my shepherd; i shall not want"],
              "'The LORD is my shepherd; I shall not want.'",
            ),
          ],
        },
      ],
    },
  ],
}
