import { SeedUnit } from "./helpers"
import { info, sel, assist, match, arrange, typeAns } from "./helpers"

// ── Course expansions ──────────────────────────────────────────
// One new unit appended to each existing course. These build on what
// the course already teaches and push one level deeper.
export const courseExpansions: Record<string, SeedUnit[]> = {
  // ── GREEK: the verb system ──
  greek: [
    {
      title: "The Verb Engine",
      description: "Tense, voice and mood — the machinery that makes Greek sentences move.",
      emoji: "⚙️",
      color: "#B45309",
      difficulty: 3,
      lessons: [
        {
          title: "Action Words",
          challenges: [
            info(
              "The engine under the hood",
              "Greek verbs are entire phrases in one word: λύει = 'he/she/it looses.' The endings carry PERSON and NUMBER, so pronouns are usually unnecessary — the verb already knows its subject. A Greek verb is built from STEM + a tense marker + a personal ending: a tiny sentence wearing a single costume.",
            ),
            sel(
              "Why don't Greek sentences usually need subject pronouns?",
              "⚙️ Grammar check",
              "The verb ending already encodes person and number",
              ["Pronouns are forbidden in Greek", "Greek has no pronouns at all", "Subjects were considered rude"],
              "λύεις means 'you loose' — the -εις IS the 'you.' When a pronoun DOES appear, it's emphatic: EMPHASIS.",
            ),
            info(
              "Present: the ongoing view",
              "The PRESENT tense views action as unfolding — in progress: λύω 'I am loosing / I loose.' Greek tense is less about WHEN and more about ASPECT — the angle the camera takes on the action. Present = video footage; Aorist = snapshot (next lesson!). 'We walk by faith' (περιπατοῦμεν, present) — ongoing lifestyle, not one stroll.",
            ),
            assist(
              "Complete John 11:25: 'ἐγώ εἰμι ἡ ἀνάστασις καὶ ἡ ζωή' — ἐγώ εἰμι means 'I ___'",
              "The emphatic 'I AM'",
              "am",
              ["was", "will be", "seem"],
              "ἐγώ εἰμι — with the extra pronoun for emphasis: I MYSELF AM. Echoes of Exodus 3:14.",
            ),
            match("Match the part to its job", [
              ["Stem", "the core meaning"],
              ["Tense marker", "time + aspect"],
              ["Personal ending", "person and number"],
              ["Present aspect", "action in progress"],
            ]),
          ],
        },
        {
          title: "Past Tenses",
          challenges: [
            info(
              "The aorist: the snapshot",
              "The AORIST views an action as a whole — undefined, undefined, complete: ἔλυσα 'I loosed.' It's the default narrative tense: Greek storytellers advance the plot in aorists. 'ἐπίστευσαν καὶ ἐβαπτίσθησαν' — 'they believed and were baptized': simple, whole events. Do NOT read 'once-for-all' theology into every aorist — it's a camera angle, not a sermon.",
            ),
            sel(
              "The aorist aspect is best described as…",
              "📸 Aspect check",
              "A snapshot — the action viewed as a complete whole",
              ["A video of ongoing action", "A future intention", "A repeated habit only"],
              "Aorist = summary view. Present = unfolding view. The Greeks filmed everything twice, from two angles.",
            ),
            info(
              "The imperfect: the long look",
              "The IMPERFECT is past action in progress — 'was loosing' (ἔλυον). It paints backgrounds, habits, repeated attempts: 'they were coming and were bringing to him…' (imperfects). Mark's famous use: εὐθύς ('immediately') + aorists = breathless pace. And the most tender imperfect in the NT: as Stephen was stoned, 'they were casting… and he was calling out' — the imperfect slows time at the martyrdom.",
            ),
            sel(
              "Narrators use the imperfect to…",
              "🎬 Storytelling check",
              "Paint background and ongoing past action",
              ["List commands to obey", "Predict the future", "Quote Scripture"],
              "Aorists advance the plot; imperfects set the scene. 'ἦν ὁ λόγος πρὸς τὸν θεόν' — the Word WAS, continuously (Jn 1:1).",
            ),
            match("Tense to aspect", [
              ["Present", "unfolding now"],
              ["Aorist", "snapshot whole"],
              ["Imperfect", "past in progress"],
              ["Aspect", "camera angle on action"],
            ]),
            typeAns(
              "Type the Greek imperfect meaning 'he was saying' — transliterate as 'elegen' or type Greek",
              "Transliteration drill",
              ["elegen", "ἔλεγεν"],
              "ἔλεγεν (elegen) — imperfect of λέγω: 'he kept saying / was saying.'",
              "E-le-gen"
            ),
          ],
        },
        {
          title: "Moods & the Infinitive",
          challenges: [
            info(
              "Mood: the speaker's stance",
              "INDICATIVE states facts (λύει 'he looses'). SUBJUNCTIVE projects possibility — used after ἵνα ('in order that'): ἵνα πιστεύσητε 'that you may believe.' IMPERATIVE commands: λῦσον 'loose!' OPTATIVE wishes (rare, jewel-like: μὴ γένοιτο 'may it never be!'). Mood encodes the speaker's ATTITUDE toward the action — assertion, projection, command, wish.",
            ),
            sel(
              "The mood after ἵνα ('in order that') is usually…",
              "🧭 Mood check",
              "Subjunctive",
              ["Indicative", "Imperative", "Optative"],
              "ἵνα + subjunctive = purpose: 'that you may believe.' John 20:31 literally states its purpose this way!",
            ),
            info(
              "μὴ γένοιτο — the jewel",
              "Paul's favorite expression of horror, traditionally 'God forbid!' or 'may it never be!': μὴ γένοιτο (mē genoito), an OPTATIVE — the mood of wishes. 'Should we continue in sin that grace may abound? μὴ γένοιτο!' (Rom 6:1–2). Learn to spot it and you'll hear Paul's gasp across two millennia.",
            ),
            assist(
              "Paul's gasp — 'may it never be!' — in Greek is μὴ ___",
              "The optative jewel",
              "genoito",
              ["Kurie", "panta", "lego"],
              "μὴ γένοιτο — ten times in Romans alone. The apostle's 'heavens, no!'",
            ),
            match("Mood to stance", [
              ["Indicative", "assertion"],
              ["Subjunctive", "possibility"],
              ["Imperative", "command"],
              ["Optative", "wish"],
            ]),
            info(
              "⚙️ Unit complete!",
              "You can now parse the verb engine — tense, aspect, mood — and read John's purpose statement (Jn 20:31) with its actual grammar visible. The New Testament is no longer a blur of endings: it's an engine you can open. Keep reading, keep parsing!",
            ),
          ],
        },
      ],
    },
  ],

  // ── HEBREW: reading the Shema ──
  hebrew: [
    {
      title: "Reading the Shema",
      description: "Syllables, stress and your first full verses — Deuteronomy 6:4 and Psalm 117.",
      emoji: " 👂".trim(),
      color: "#0F766E",
      difficulty: 3,
      lessons: [
        {
          title: "Syllables & Sheva",
          challenges: [
            info(
              "Open and closed doors",
              "A Hebrew syllable is OPEN when it ends in a vowel (דָּ 'da') and CLOSED when it ends in a consonant (דַּבְ 'dab'). Syllables decide stress — usually on the LAST syllable (מֶלֶךְ me-LECH) — and stress changes some vowels. Reading Hebrew fluently is mostly hearing syllables in your head, like musical measures.",
            ),
            sel(
              "A syllable ending in a consonant is called…",
              "🚪 Syllable check",
              "Closed",
              ["Open", "Silent", "Stressed"],
              "Open syllables end in vowels (light and long); closed ones end in consonants (short and quick).",
            ),
            info(
              "The sheva: the whisper",
              "The silent sheva (ְ ) is the sound of a syllable-closing consonant with no vowel — or the briefest 'eh' when it opens a syllable (called vocal sheva). שְׁמַע = shə-MA: the שׁ opens with a whispered 'ə', then stress lands on MA. The sheva is why Biblical Hebrew sounds like waves — soft consonant-ushers between vowel-crests.",
            ),
            assist(
              "שְׁמַע (shema) is syllabified as…",
              "👂 Whisper check",
              "sh'-MA (whisper + stressed open syllable)",
              ["she-MA-a", "SH-m-A", "she-ma-a-a"],
              "Vocal sheva 'sh', then accented 'ma'. One whisper, one drumbeat: the word Israel hears twice daily.",
            ),
            match("Tap the pairs", [
              ["Open syllable", "ends in vowel"],
              ["Closed syllable", "ends in consonant"],
              ["Vocal sheva", "brief 'eh' opener"],
              ["Hebrew stress", "usually final"],
            ]),
          ],
        },
        {
          title: "The Shema Line",
          challenges: [
            info(
              "Deuteronomy 6:4, word by word",
              "שְׁמַע יִשְׂרָאֵל יְהוָה אֱלֹהֵינוּ יְהוָה אֶחָֽד — Sh'ma Yisra'el, Adonai Eloheinu, Adonai echad: 'Hear, O Israel: the LORD our God, the LORD is one.' שְׁמַע (hear), יִשְׂרָאֵל (Israel), יְהוָה (YHWH — the covenant name, read as Adonai), אֱלֹהֵינוּ (our God), אֶחָד (one/only). The confession Jesus called the greatest command begins here — and now you can read its every syllable.",
            ),
            arrange(
              "Put the Shema's words in order",
              "Deuteronomy 6:4",
              ["שְׁמַע", "יִשְׂרָאֵל", "יְהוָה", "אֱלֹהֵינוּ", "יְהוָה", "אֶחָֽד"],
              ["בְּרֵאשִׁית", "אוֹר"],
              "Sh'ma Yisra'el, Adonai Eloheinu, Adonai echad — the words on Jewish lips for three thousand years, now on yours.",
            ),
            sel(
              "The word אֶחָד (echad) means…",
              "📖 Vocabulary check",
              "One / only",
              ["Blessed", "Hear", "Forever"],
              "Echad — 'one.' Israel's confession amid the ancient world's god-crowd: our God is ONE. Zechariah 14:9 dreams of the day the whole earth echoes it.",
            ),
            sel(
              "יהוה is customarily read aloud as…",
              "🕯️ Reverence check",
              "Adonai (the LORD)",
              ["Yahweh always", "Elohim always", "HaShem never"],
              "Out of reverence for the covenant name, Jewish readers say Adonai ('Lord'). Most English Bibles render it LORD in small caps.",
            ),
            typeAns(
              "Transliterate the first word of the Shema (hear!)",
              "The opening word",
              ["shema", "sh'ma", "shma"],
              "שְׁמַע — Sh'ma! The word Jesus and every synagogue-child learned first.",
            ),
          ],
        },
        {
          title: "Psalm 117 — The Shortest Psalm",
          challenges: [
            info(
              "Two verses, whole world",
              "Psalm 117 is the Bible's shortest chapter — and it says the biggest thing: הַלְלוּ אֶת־יְהוָה כָּל־גּוֹיִם — 'Praise the LORD, all nations!' (hal'lu et-Adonai kol-goyim). הַלְלוּ (praise!) is a plural imperative — everybody in. From this word comes 'Hallelujah' (praise-ya = praise the LORD). The shortest psalm commands the largest choir: every nation, all peoples.",
            ),
            sel(
              "הַלְלוּ (hallelu) is a…",
              "🎶 Grammar check",
              "Plural imperative — 'you all, praise!'",
              ["Singular past tense", "Noun meaning song", "Participle of walking"],
              "Plural command: all of you, praise! Psalms 113–118 (the Egyptian Hallel) are its extended family — sung at Passover, likely the hymn Jesus sang (Mt 26:30).",
            ),
            assist(
              "The English word 'Hallelujah' comes from הַלְלוּ plus ___ (a short form of God's name).",
              "Word history",
              "ya",
              ["no", "shalom", "amen"],
              "Hal'lu-YAH — praise the LORD! One Hebrew verb conquered the vocabularies of every continent.",
            ),
            match("Tap the pairs", [
              ["Psalm 117", "shortest chapter"],
              ["Hallelu", "plural imperative"],
              ["Kol goyim", "all nations"],
              ["Egyptian Hallel", "Passover psalms"],
              ["Mt 26:30", "they sang a hymn"],
            ]),
            info(
              " 👂 Unit complete!".trim(),
              "You can now divide syllables, honor the sheva, read the Shema line, and chant the shortest psalm. You are reading the actual Hebrew Bible — not a transliteration, not a translation. The scroll is open. Keep going!",
            ),
          ],
        },
      ],
    },
  ],

  // ── BIBLE SURVEY: poetry workshop ──
  "bible-survey": [
    {
      title: "The Poetry Workshop",
      description: "How Hebrew poems work — parallelism, psalm types, proverbs, and the wisdom of Job.",
      emoji: " ✒️".trim(),
      color: "#92400E",
      difficulty: 3,
      lessons: [
        {
          title: "How Hebrew Poems Rhyme",
          challenges: [
            info(
              "Rhyme with ideas",
              "Hebrew poetry doesn't rhyme sounds — it rhymes MEANINGS. Parallelism is the engine: SYNONYMOUS (second line echoes: 'The heavens declare the glory of God; the skies proclaim his handiwork' — Ps 19:1); ANTITHETIC (second line contrasts: 'The LORD knows the way of the righteous, but the way of the wicked will perish' — Ps 1:6); SYNTHETIC (second line advances: 'Blessed is the man… [who] walks not… nor stands… nor sits' — building, stair-stepping).",
            ),
            sel(
              "'The heavens declare the glory of God; the sky above proclaims his handiwork' is…",
              " ✒️".trim() + " Parallelism check",
              "Synonymous — line two echoes line one",
              ["Antithetic — line two contradicts", "Synthetic — line two changes subject", "No parallelism at all"],
              "Declare/proclaim, heavens/sky, glory/handiwork — rhymed ideas, not rhymed sounds.",
            ),
            info(
              "Why poems?",
              "Poetry is memory's architecture: parallel lines double the hooks for recall in an oral culture. And poetry says what prose cannot — precision about feelings. A third of the Bible is poetry because a third of life needs metaphor. When the psalmist says 'deep calls to deep,' the FORM carries what flat sentences can't: the weight of the water.",
            ),
            match("Type of parallel to example", [
              ["Synonymous", "echo and deepen"],
              ["Antithetic", "contrast and sharpen"],
              ["Synthetic", "advance and build"],
              ["Ps 1:6", "antithetic pair"],
              ["Ps 19:1", "synonymous pair"],
            ]),
            assist(
              "In antithetic parallelism, the second line stands against the first — often marked by a contrastive 'but' (וְ/כִּי in Hebrew) — the marker of ___.",
              "Spotting the hinge",
              "contrast",
              ["synonym", "summary", "silence"],
              "When you see 'but' between lines, the poem is sharpening a contrast — Proverbs lives on this hinge.",
            ),
          ],
        },
        {
          title: "Psalms by Type",
          challenges: [
            info(
              "The playlist of the soul",
              "The Psalter has genres, like a well-stocked record shop: LAMENT (the largest shelf — a complaint, a turn, a trust: Ps 3, 13, 22); THANKSGIVING (I cried, He answered, come see: Ps 30, 116); PRAISE/HYMN (character + commands to praise: Ps 100, 117); ROYAL (the King — God's or David's: Ps 2, 110); ENTHRONEMENT (the LORD reigns: Ps 93–99); WISDOM (two roads: Ps 1, 37). Learn the shelf and you'll know what a psalm is doing by verse two.",
            ),
            sel(
              "The most common psalm type — complaint, petition, turn, trust — is…",
              "📚 Genre check",
              "Lament",
              ["Thanksgiving psalm", "Coronation anthem", "Wedding song"],
              "A THIRD of the psalms are laments. God put the complaint department IN the hymnal — faith may bring its wounds to the throne.",
            ),
            info(
              "The lament's four-chambered heart",
              "Psalm 13 shows the structure: (1) COMPLAINT — 'How long, O LORD? Will you forget me forever?' (2) PETITION — 'Consider and answer me.' (3) TURN — 'But I have trusted in your steadfast love.' (4) PRAISE — 'I will sing to the LORD.' Notice what's licensed: rage, grief, question — held together with trust that outlasts the night. The lament is not faith failing; it's faith fighting.",
            ),
            arrange(
              "Order the lament's chambers (Psalm 13)",
              "The anatomy of a lament",
              ["Complaint — how long?", "Petition — consider me", "Turn — but I trust", "Praise — I will sing"],
              ["Silence — say nothing", "Revenge — take matters"],
              "Complaint, petition, turn, praise. Prayers that skip the turn stay in the night; prayers that skip the complaint never bring the real self.",
            ),
            sel(
              "Why does the hymnal contain a complaint department?",
              " 🎼".trim() + " Pastoral check",
              "Because real faith may bring real wounds to God",
              ["Because complaints are sins to confess", "Because David had a bad temper", "Because later editors lost pages"],
              "Lament is not the opposite of praise — it is praise's night shift. God is not embarrassed by your 'how long.'",
            ),
          ],
        },
        {
          title: "Proverbs, Job & the Reversal",
          challenges: [
            info(
              "Proverbs are not promises",
              "A proverb is a short, memorable, generally-true principle — not a guaranteed contract. 'Train up a child in the way he should go' (Prov 22:6) states the WISDOM-pattern, not a law of physics; some faithful parents know grief. Reading proverbs as promises breaks hearts and breeds cynicism. Read them as streetlights: reliable guidance, not guarantees.",
            ),
            sel(
              "Reading 'train up a child' (Prov 22:6) as a binding promise is a mistake because proverbs are…",
              " 💡".trim() + " Genre check",
              "General principles — the wise pattern, not a guarantee",
              ["Secret spells that always work", "Laws Moses gave to Israel", "Prophecies about the Messiah"],
              "The sages themselves knew: Job (a righteous man suffering) and Ecclesiastes (the wicked prospering) are the Bible's own check on formula-theology.",
            ),
            info(
              "Job: the book that argues with the proverbs",
              "Job's friends speak proverb-wisdom: you suffer, therefore you sinned — repent! God's verdict on their theology: 'you have not spoken of me what is right' (Job 42:7). The book dismantles the vending machine (insert righteousness, receive blessing) while never telling Job WHY he suffered — instead, God shows up in person, and that presence, not an explanation, is what Job needed. The wisdom shelf holds its own self-critique.",
            ),
            match("Tap the pairs", [
              ["Proverb", "general principle"],
              ["Promise", "guaranteed contract"],
              ["Job's friends", "formula theology"],
              ["Job 42:7", "you have not spoken right"],
              ["God's answer", "presence, not explanation"],
            ]),
            typeAns(
              "Type the Bible book that is wisdom's own self-critique — the righteous sufferer whose friends had all the formulas (one word)",
              "The counterexample",
              ["job"],
              "Job — 42 chapters that unhook blessing from formula, and end with God in a whirlwind.",
            ),
            info(
              " ✒️".trim() + " Unit complete!",
              "You now read Hebrew poetry by its rhymes (parallelism), navigate the psalter by genre, and read proverbs with wisdom and Job beside you. A third of your Bible just became three-dimensional. Next stop: the prophets — but that's another unit's story.",
            ),
          ],
        },
      ],
    },
  ],

  // ── STUDY METHODS: figures & patterns ──
  "study-methods": [
    {
      title: "Word Pictures & Patterns",
      description: "Idioms, chiasmus, hyperbole and structure — reading the Bible's artistry without missing it.",
      emoji: " 🎨".trim(),
      color: "#9F1239",
      difficulty: 3,
      lessons: [
        {
          title: "Idioms & Word Pictures",
          challenges: [
            info(
              "Lost in translation? No — found in idiom",
              "Every language paints with local colors. Hebrew: 'hard of heart' = stubborn; 'cover his head' = mourn; 'lift the face' = show favor; 'their heart went out' = compassion — Genesis 43:30's inward-parts idiom ('his bowels yearned,' KJV — the Hebrew seat of feeling!). Greek: 'bowels of mercies' (KJV of Col 3:12) = deep compassion. When a phrase feels odd, suspect an idiom before a doctrine.",
            ),
            sel(
              "'Their heart went out to him' translates a Hebrew idiom where the SEAT of compassion is…",
              " 🫀".trim() + " Idiom check",
              "The inward parts (bowels/gut)",
              ["The knees", "The right hand", "The tongue"],
              "Gen 43:30 — 'his heart went out to his brother': the Hebrew idiom seats compassion in the inward parts. English says heart; Hebrew said gut. Same feeling, different anatomy of metaphor — and the NT's own word for compassion (splagchnizomai, 'moved in one's guts') keeps the picture.",
            ),
            info(
              "Eyes, hands, names",
              "More word-pictures: 'eyes of the LORD' = his watchful care; 'the apple of his eye' = the pupil — the most guarded, most sensitive place; 'to lift one's eyes' = to look with hope; 'my name is in him' (Ex 23:21) = my character/authority. Hebrew 'name' (shem) carries reputation — 'hallowing the name' is living so God's reputation shines. Read the picture, not just the pixels.",
            ),
            match("Idiom to meaning", [
              ["Hard of heart", "stubborn"],
              ["Apple of the eye", "most guarded treasure"],
              ["Lift the eyes", "look with hope"],
              ["Name", "character and reputation"],
            ]),
          ],
        },
        {
          title: "Chiasmus — the X-Ray Structure",
          challenges: [
            info(
              "The Hebrew sandwich",
              "A chiasm (from the Greek letter chi, X) arranges lines as A-B-B'-A' — ideas mirrored around a CENTER. Mark 2:27–28: 'The Sabbath was made for man (A), not man for the Sabbath (A′) — and the Son of Man is lord even of the Sabbath.' In longer chiasms (A-B-C-B'-A') the pivot (C) carries the point. Finding the pivot is finding the author's finger pointing: 'THERE.' Hebrew authors thought in balanced, folded structures the way we think in bullet points.",
            ),
            sel(
              "In a chiasm A-B-C-B'-A', the main point usually sits at…",
              "❌ Structure check",
              "The center (C)",
              ["The first line (A)", "The last line (A')", "The spaces between lines"],
              "The mirror's axis is the message. Commentators argue over centers the way jewelers argue over the setting of a diamond.",
            ),
            info(
              "Chiasm in the wild: Genesis 7–9",
              "The flood narrative is one giant chiasm: God remembers Noah (center) — surrounded by paired scenes (waters rising/waters falling, ark sealed/ark opened, promise/fulfillment). At the hinge of the world's worst judgment stands 'God remembered Noah.' That is the story's theology in its very architecture — judgment's pivot is mercy's memory.",
            ),
            arrange(
              "Build a small chiasm on 'the Sabbath was made for man'",
              "Mark 2:27",
              ["The Sabbath (A)", "was made for man (B)", "and not man (B')", "for the Sabbath (A')"],
              ["Man made the Sabbath", "Nobody made anything"],
              "A-B-B'-A': the mirrored halves shine light on each other — and the whole saying lands as one balanced flash.",
            ),
          ],
        },
        {
          title: "Hyperbole, Numbers & Frames",
          challenges: [
            info(
              "Holy exaggeration",
              "Hyperbole is deliberate, recognized overstatement — everyone in the audience hears it as such. 'If your right eye causes you to sin, tear it out' (Mt 5:29): not an instruction for surgery but a portrait of how drastic the war on sin must be. 'It is easier for a camel to go through the eye of a needle' — a joke with teeth. Reading hyperbole literally (as critics sometimes do) misses the very force it was built to carry.",
            ),
            sel(
              "'Why do you see the speck in your brother's eye but not the log in your own?' is…",
              " 🪵".trim() + " Figure check",
              "Hyperbole — deliberate overstatement with a point",
              ["A literal carpentry regulation", "A proverb about lumber", "A medical description of eyes"],
              "Speck vs log — the laugh IS the lesson. Jesus' humor scalpeled the hypocrite's selective vision.",
            ),
            info(
              "Numbers that round",
              "Biblical numbers are often symbolic-round: 7 (completeness — sabbath, seventy-times-seven), 12 (tribes/apostles — the people of God), 40 (a full span of testing — flood, wilderness, temptations), 1000 (a huge, complete multitude). 'Seventy times seven' is not arithmetic but forgiveness beyond score-keeping. Ask: is this number counting, or is it SAYING?",
            ),
            match("Number to symbol", [
              ["Seven", "completeness"],
              ["Twelve", "the people of God"],
              ["Forty", "a full span of testing"],
              ["A thousand", "vast, countless"],
            ]),
            typeAns(
              "Which rhetorical figure deliberately overstates to make a point? (one word)",
              "The figure of holy exaggeration",
              ["hyperbole"],
              "Hyperbole — the camel, the log, the mustard seed. Recognize it and the saying's force lands as intended.",
            ),
            info(
              " 🎨".trim() + " Unit complete!",
              "You can now spot idioms before they become bad doctrines, x-ray a passage for chiasm, hear hyperbole as force rather than folly, and read numbers as speech. The Bible's artistry is no longer invisible decoration — it's part of the meaning. Happy hunting!",
            ),
          ],
        },
      ],
    },
  ],

  // ── WORLDVIEWS: new religious movements ──
  worldviews: [
    {
      title: "New Religious Movements",
      description: "Mormonism, Jehovah's Witnesses — and the marks of groups that rewrite the gospel.",
      emoji: "🧭",
      color: "#831843",
      difficulty: 3,
      lessons: [
        {
          title: "Mormonism (LDS)",
          challenges: [
            info(
              "The story of the restoration",
              "Joseph Smith (1805–1844) said an angel directed him to golden plates he translated as the Book of Mormon (1830): another testament of Jesus' work in the Americas. The LDS church honors the Bible 'as far as it is translated correctly' — alongside three additional scriptures (Book of Mormon, Doctrine & Covenants, Pearl of Great Price). Missionary energy, family emphasis and clean living have made it one of the world's fastest-growing movements.",
            ),
            sel(
              "The LDS church treats the Bible as…",
              "📚 Scripture check",
              "True 'as far as translated correctly' — alongside later scriptures",
              ["The only scripture, alone", "A merely human novel", "Superseded entirely by the Qur'an"],
              "Formally: the Bible is scripture number one of four — with the crucial caveat that it suffered corruption, which later scriptures repair.",
            ),
            info(
              "Where the roads part",
              "Theological divergences are deep: God the Father has a glorified physical body and (in classical LDS teaching) was once a man who progressed to godhood — 'as man now is, God once was; as God now is, man may become' (Lorenzo Snow). The Trinity is three separate beings, not one essence. Salvation includes exaltation to godhood in eternal marriage. Jesus is the literal firstborn spirit-son of the Father. Each claim collides with Nicaea's grammar: one ousia, three persons; God eternal as God; salvation as adoption, not promotion to deity.",
            ),
            match("Tap the pairs — LDS vs classical doctrine", [
              ["God's past (LDS)", "once a man"],
              ["Trinity (LDS)", "three separate beings"],
              ["Human destiny (LDS)", "exaltation to godhood"],
              ["Nicaea", "one essence, three persons"],
            ]),
            sel(
              "The Lorenzo Snow couplet summarizes which divergence?",
              " ⛰️".trim() + " Doctrine check",
              "The gap between God and humans is bridgeable by progression",
              ["The date of Easter", "The food laws", "The liturgy language"],
              "'As man now is, God once was; as God now is, man may become.' Classical theism: Creator/creature distinction is infinite and eternal — ipsum esse vs. participated being.",
            ),
          ],
        },
        {
          title: "Jehovah's Witnesses",
          challenges: [
            info(
              "A different Bible, a different framework",
              "Charles Russell's Bible Student movement (1870s) became Jehovah's Witnesses under Rutherford. Distinctives: the New World Translation, the divine name 'Jehovah' restored throughout; Jesus as God's first CREATION — the archangel Michael — not God the Son; rejection of the Trinity as pagan; 1914 (invisible) as Christ's enthronement; door-to-door witnessing as the ark of survival; and the 144,000 heavenly class with the great crowd on a paradise earth.",
            ),
            sel(
              "On JW teaching, Jesus is…",
              " ✝️".trim() + " Christology check",
              "God's first creation — identified with Michael the archangel",
              ["Co-eternal God the Son", "A merely human prophet", "An angel who fell and rose"],
              "Nicaea's answer: 'begotten, not made, of one substance with the Father.' The gap between begotten-not-made and first-created is the whole gospel.",
            ),
            info(
              "Where to press gently",
              "Two points bear honest conversation: (1) TRANSLATION — the NWT's rendering of John 1:1 ('the Word was a god') and the insertion of 'other' in Colossians 1:16–17 build Christology into the text; a concordance shows the pattern. (2) PROPHECY — 1914's invisible presence and repeated date revisions test Jesus' own standard: 'concerning that day and hour no one knows' (Mt 24:36; cf. Deut 18:21–22 on testing prophets). Bring the questions with gentleness; Witnesses are sincere seekers who memorized answers no one has ever lovingly questioned.",
            ),
            assist(
              "Deuteronomy 18:22 gives Israel's test for a prophet: if the word does not ___ , the prophet spoke presumptuously.",
              "The prophetic litmus",
              "come to pass",
              ["rhyme", "inspire", "convert"],
              "Kindness first — but the Berean test (Acts 17:11) is an act of love, not aggression.",
            ),
            match("Tap the pairs", [
              ["New World Translation", "disputed renderings"],
              ["1914", "invisible enthronement"],
              ["144,000", "heavenly class"],
              ["Bereans", "examined daily"],
            ]),
          ],
        },
        {
          title: "Marks of a Movement Off Course",
          challenges: [
            info(
              "Reading the warning lights",
              "Across very different movements, the same gauges glow red: (1) ONE interpreter — a living leader or elite whose rulings can rewrite doctrine; (2) ADDED scripture — a new book that quietly outranks the Bible; (3) REWRITTEN Christ — a Jesus who is less or other than Nicaea's; (4) SALVATION BY PERFORMANCE — assurance never settled, grace never finished; (5) ISOLATION — family, history and questions discouraged outside the group; (6) MOVING PROPHECY — dates revised, memory managed. Not every mark means heresy — but three or more, together, is the ancient pattern of a gospel being edited.",
            ),
            sel(
              "Which is NOT one of the warning marks listed?",
              "🚨 Discernment check",
              "High view of the Trinity",
              ["One controlling interpreter", "Scripture that outranks the Bible", "Dates that keep moving"],
              "The marks cluster around the same centers: WHO interprets, WHAT authority, WHICH Christ, HOW saved, WHO you may question.",
            ),
            info(
              "Galatians 1 and the love-test",
              "Paul's anathema falls not on sincere confusion but on 'another gospel' — grace plus anything. Yet his instruction for engaging is pastoral: 'the Lord's servant must not be quarrelsome but kind… correcting with gentleness' (2 Tim 2:24–25). Your JW or LDS neighbor is not an enemy to defeat but a person loved by God — often better neighbors than we are. Win the person, not just the point.",
            ),
            match("Tap the pairs — the marks and their test", [
              ["One interpreter", "no Berean checking"],
              ["Added scripture", "authority drift from the Bible"],
              ["Rewritten Christ", "conflicts with Nicaea"],
              ["Performance salvation", "assurance always pending"],
              ["2 Tim 2:24", "gentleness corrects"],
            ]),
            typeAns(
              "Which letter contains Paul's 'even if we or an angel preach another gospel' warning? (one word)",
              "The charter for discernment",
              ["galatians", "gal"],
              "Galatians 1:8 — the gospel is not editable, even by angels. Handle with prayer and gentleness.",
            ),
          ],
        },
      ],
    },
  ],

  // ── MANUSCRIPTS: canon formation ──
  manuscripts: [
    {
      title: "How We Got the Canon",
      description: "Recognition, not selection — the church didn't vote the Bible into existence.",
      emoji: " 📐".trim(),
      color: "#7C3AED",
      difficulty: 3,
      lessons: [
        {
          title: "Recognizing Scripture",
          challenges: [
            info(
              "Canon: a measuring rod",
              "'Canon' (kanōn) means measuring reed — the standard. The question was never 'which books shall we MAKE scripture?' but 'which books ARE scripture — and how do we recognize them?' The church's answer was recognition, not election: the canon is created by God's inspiration, discovered by the church — as a Treasury agent recognizes (not creates) real currency by learning its marks.",
            ),
            sel(
              "The church's relationship to the canon is best described as…",
              " 📐".trim() + " Concept check",
              "Recognizing what God had already inspired",
              ["Electing books by majority vote", "Writing the books by committee", "Inventing scripture in the 4th century"],
              "No council ever MADE a book scripture; they listed what the church had always read as scripture. Recognition — like a jeweler identifying real pearls.",
            ),
            info(
              "The three marks",
              "The fathers tested books by: APOSTOLICITY — written by an apostle or his close associate (Mark writes Peter's preaching; Luke, Paul's); ANTIQUITY — from the apostolic generation, not a century later; CATHOLICITY (universality) — read and received across ALL the churches, everywhere. Later summaries add: ORTHODOXY — consonant with the rule of faith the church already confessed. A book passed on all marks not by committee but by consensus-in-the-pews: churches reading, copying, and reading again in worship.",
            ),
            match("Mark to its question", [
              ["Apostolicity", "who wrote it?"],
              ["Antiquity", "how old is it?"],
              ["Catholicity", "who reads it?"],
              ["Orthodoxy", "does it match the faith?"],
            ]),
            sel(
              "The strongest single evidence a book belonged was…",
              " 🕯️".trim() + " Reception check",
              "Continuous use in the churches' worship and teaching",
              ["A vote at a council", "The emperor's approval", "The book's physical size"],
              "Books earned their place by being read Sunday after Sunday, from Antioch to Rome to Carthage — before councils ever tallied them.",
            ),
          ],
        },
        {
          title: "The Process in History",
          challenges: [
            info(
              "From list to letter",
              "The trail runs: (c. 140) Marcion's truncated canon (Luke + Paul, edited) — provoking the church to state what it read; (c. 180) the Muratorian Fragment lists the four Gospels, Acts, Paul's letters (with nuances), Revelation, and pauses over some; (c. 200) Origen already distinguishes acknowledged from disputed books — Hebrews, James, 2 Peter, Jude, 2–3 John — the Greek terms homologoumena/antilegomena later standardized by Eusebius; (367) Athanasius' Easter letter lists EXACTLY our 27 NT books — the first surviving complete list; (393/397) councils at Hippo and Carthage confirm for the West. The church did not fabricate a canon; it surrendered to one.",
            ),
            arrange(
              "Order the milestones",
              "The canon trail",
              ["Marcion provokes (c. 140)", "Muratorian fragment (c. 180)", "Origen's disputed-list (c. 200)", "Athanasius' 27 (367)", "Hippo & Carthage confirm"],
              ["Emperor Constantine writes the gospels", "The Vatican invents Mark"],
              "A provocation, a list, a distinction, a letter, a confirmation — recognition, not election.",
            ),
            info(
              "What about the Old Testament?",
              "The OT canon was fixed within Judaism — the Law, Prophets and Writings (Tanakh) complete by Jesus' day: 'the Law of Moses, the Prophets and the Psalms' (Lk 24:44) is Jesus' threefold name for it. The disputed 'apocrypha' (Tobit, Maccabees, etc.) were widely read and valued but placed by Jews — and by the earliest surviving Christian lists (Origen, Athanasius, Jerome) — outside scripture: 'books for instruction but not for doctrine.' Rome defined them as canonical at Trent (1546); the Reformers followed the Hebrew canon, while Greek churches continued to read them in the Septuagint.",
            ),
            sel(
              "Jesus' phrase 'the Law of Moses, the Prophets and the Psalms' refers to…",
              " 🕍".trim() + " Canon check",
              "The threefold Hebrew Bible — complete and fixed in his day",
              ["A new canon he was writing", "The Apocrypha", "The Septuagint's appendix"],
              "Luke 24:44 — Tanakh's three shelves. Jesus argued from a closed OT, never citing the apocrypha as scripture.",
            ),
          ],
        },
        {
          title: "'Lost Gospels'?",
          challenges: [
            info(
              "The Da Vinci panic",
              "Pop-culture claims: 'the church suppressed dozens of gospels; the real Jesus hid in Thomas, Judas and Mary.' The manuscript facts: the 'other gospels' are LATE (mostly 2nd–3rd century), SECTARIAN (largely Gnostic — secret knowledge, a lesser creator-god, Jesus a Revealer not a Savior-in-flesh), and GEOGRAPHICALLY FRINGE (Egypt-centered). Nothing was 'lost' — the church knew these books and gave reasons for passing: no apostolic link, no antiquity, no resemblance to the Jesus of the cross and empty tomb.",
            ),
            sel(
              "The Gospel of Thomas is best described as…",
              " 🗿".trim() + " Source check",
              "A later, Gnostic-flavored collection of sayings",
              ["A first-century eyewitness", "Paul's private notebook", "A Qumran scroll"],
              "Thomas (likely 2nd century) offers secret sayings ('whoever finds the meaning of these words will not taste death') — Gnostic tone, no narrative, no cross.",
            ),
            info(
              "Why the four stood",
              "Irenaeus (c. 180) pictures the fourfold Gospel as fixed and natural: four cherub-faces, four winds, four pillars of creation — his rhetoric, but the point beneath it: by his day you could no more add a fifth gospel than a fifth cardinal direction. Matthew, Mark, Luke and John were read in every church, every Sunday, from the apostles' own generation. When Thomas surfaced, the church did the Berean thing: compared, tested, declined — and kept the books that walked out of the first century with the eyewitnesses.",
            ),
            match("Tap the pairs", [
              ["Muratorian fragment", "early list (c. 180)"],
              ["Athanasius 367", "the 27 listed"],
              ["Gospel of Thomas", "later Gnostic sayings"],
              ["Irenaeus", "the fourfold Gospel"],
              ["Recognition", "the church's method"],
            ]),
            typeAns(
              "Which church father listed exactly our 27 New Testament books in his 367 Easter letter? (one word)",
              "The letter-writer",
              ["athanasius"],
              "Athanasius of Alexandria — his festal letter is the earliest surviving complete list of the NT as we hold it.",
            ),
          ],
        },
      ],
    },
  ],

  // ── APOLOGETICS: hell, justice & judgment ──
  apologetics: [
    {
      title: "Hell, Justice & Judgment",
      description: "The hardest doctrine — examined honestly, without pictures of pitchforks.",
      emoji: "🔥",
      color: "#991B1B",
      difficulty: 3,
      lessons: [
        {
          title: "What Is Hell Actually?",
          challenges: [
            info(
              "Dusting off the cartoons",
              "Forget horns, pitchforks and cartoon demons — the Bible's hell is more serious, not less. Jesus' dominant image: GEHENNA, the valley outside Jerusalem's walls (once a place of child-sacrifice (Jer 7:31), by his day a byword for judgment and shame — the later 'refuse-heap' detail comes from medieval tradition) — a metaphor of destruction and shame. Other images: outer DARKNESS, the SECOND DEATH, exclusion from the wedding FEAST. Notice: the images conflict if literalized (fire and darkness together?) — they are word-pictures pointing past themselves at a reality worse than all of them: the loss of God.",
            ),
            sel(
              "Jesus' most-used word for hell, Gehenna, was originally…",
              "🔥 Image check",
              "A literal valley outside Jerusalem's walls",
              ["A Greek underworld myth", "A temple furnace", "A Babylonian ziggurat"],
              "Hinnom Valley — history of grief, now Jesus' standing metaphor for judgment. Words about a real place, aimed at a worse reality.",
            ),
            info(
              "The Bible's own grammar of judgment",
              "Scripture holds three notes in tension: DESTRUCTION ('they will suffer the punishment of eternal destruction, away from the presence of the Lord' — 2 Th 1:9); EXCLUSION ('cast out into the outer darkness… I do not know you' — Mt 25:30, with Mt 7:23's 'I never knew you'); PUNISHMENT proportioned ('few blows' and 'many blows' — Lk 12:47–48). What all three agree on: hell is REAL, CHOSEN (the door is locked on the inside, as Lewis said), and TERRIBLE — and God takes no pleasure in it: 'As I live, declares the Lord GOD, I have no pleasure in the death of the wicked' (Ezek 33:11).",
            ),
            sel(
              "2 Thessalonians 1:9 describes hell as…",
              "📖 Data check",
              "Eternal destruction AWAY FROM the presence of the Lord",
              ["Endless torture by creatures", "A purifying fire for everyone", "A cycle of second chances"],
              "Destruction-and-absence — the note Paul sounds. Whatever else hell is, it is the Godless outcome of a Godless choice.",
            ),
            match("Image to emphasis", [
              ["Gehenna", "destruction and shame"],
              ["Outer darkness", "exclusion"],
              ["Second death", "finality"],
              ["Locked feast-door", "chosen refusal"],
            ]),
          ],
        },
        {
          title: "The Justice Problem",
          challenges: [
            info(
              "Objection A: punishment without reform",
              "'What good is punishment that never improves?' Reply begins by asking what punishment is FOR: if ONLY rehabilitation, then the gulag's flaws vanish by definition — but justice for victims then means nothing, and monstrous crimes would go unanswered if the criminal were past reform. Punishment also VINDICATES — declares that evil really matters. A universe where Hitler's end equals Mother Teresa's is not merciful; it is morally asleep.",
            ),
            sel(
              "The 'vindication' purpose of punishment means…",
              "⚖️ Purpose check",
              "Declaring that evil truly matters — justice for victims is real",
              ["Making criminals suffer for fun", "Scaring bystanders into obedience", "Balancing the prison budget"],
              "A world that cannot finally say 'this was EVIL' has not outgrown hell; it has outgrown justice.",
            ),
            info(
              "Objection B: proportionality forever",
              "'How can finite sins deserve infinite consequence?' Careful answers: (1) the objection assumes duration-of-punishment must scale with duration-of-sin — but we don't scale a murder's sentence by the seconds the act took; we scale by the DIGNITY OFFENDED. (2) If God is infinite, refusal of God has an infinite reference. (3) The traditions differ on hell's duration — eternal conscious torment (most traditional), universal restoration (Origen's hope; Gregory of Nyssa), annihilation (destruction of the unrepentant — Irenaeus, modern conditionalists). All three claim biblical support; the DEBATE is in-house — and the existence of judgment itself stands in all three.",
            ),
            sel(
              "Which is NOT one of the three historic views of hell's duration?",
              "🕰️ Views check",
              "Reincarnation into livestock",
              ["Eternal conscious torment", "Annihilation of the unrepentant", "Universal restoration"],
              "ECT, conditionalism (annihilation), and universalism (restoration, as a hope — 1 Cor 15:22, Col 1:20 pressed hard) — the family argument.",
            ),
          ],
        },
        {
          title: "The Cross Between the Answers",
          challenges: [
            info(
              "Where the doctrine must stand",
              "Every treatment of hell must pass beneath two towers: 'God is LOVE' (1 Jn 4:8) and 'SHALL NOT THE JUDGE OF ALL THE EARTH DO RIGHT?' (Gen 18:25). The cross holds both: there, the Judge of all the earth takes the judgment INTO himself — 'he made him to be sin who knew no sin' (2 Cor 5:21). Hell is not delight in suffering; it is the solemn backside of a love that will not coerce. As C.S. Lewis wrote: the doors of hell are locked on the inside.",
            ),
            assist(
              "C.S. Lewis' famous line: the doors of hell are locked on the ___ .",
              "The inside-lock",
              "inside",
              ["outside", "ceiling", "future"],
              "On Lewis's telling, God does not lock people out who want in — the tragedy is souls who will not walk out of their own Godlessness, chosen and ratified forever.",
            ),
            info(
              "Speaking of hell like Jesus",
              "Jesus spoke of hell more than anyone in Scripture — always with tears available (Lk 19:41), never with relish, never as a debate-winner. His own summary of motive: 'I did not come to judge the world but to save it' (Jn 12:47). Learn his register: truth-telling urgency with open arms. The doctrine of hell should make you pray, not sneer; warn, not gloat. If your hell-talk produces contempt rather than compassion, you are doing it wrong.",
            ),
            sel(
              "Jesus' own relationship to judgment was…",
              " ✝️".trim() + " Register check",
              "Urgent warning from a Savior — 'I came not to judge but to save'",
              ["Gleeful announcement of doom", "Silence on the topic", "A job he delegated to angels"],
              "The one with most to say about hell is the one who died to rescue us from it. Take his tone when you take his doctrine.",
            ),
            match("Tap the pairs", [
              ["Hell's images", "word-pictures, not blueprints"],
              ["Vindication", "evil truly matters"],
              ["Three durations", "ECT · annihilation · restoration"],
              ["Locked doors", "chosen refusal"],
              ["Jesus' register", "warning with tears"],
            ]),
            info(
              "🔥 Unit complete!",
              "You can now dust off the cartoons, state the real images, weigh the justice objections, and name the three historic positions — all without losing the cross between the answers. The hardest doctrine, handled with the most honesty you can carry: that is apologetics at its best.",
            ),
          ],
        },
      ],
    },
  ],
}
