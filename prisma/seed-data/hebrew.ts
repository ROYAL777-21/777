import { SeedCourse } from "./helpers"
import { info, sel, assist, match, arrange, typeAns } from "./helpers"

export const hebrewCourse: SeedCourse = {
  code: "hebrew",
  title: "Biblical Hebrew",
  subtitle: "Read the Torah in its original tongue",
  description:
    "From aleph to tav — learn the 22 letters of the Hebrew Bible, master the vowel points, and open Genesis 1:1 for yourself.",
  emoji: "🕎",
  color: "#0F8A80",
  order: 2,
  units: [
    {
      title: "Aleph-Bet · Part 1",
      description: "Your first Hebrew letters — and the secret of reading right to left.",
      emoji: "🔤",
      color: "#E08600",
      lessons: [
        {
          title: "Aleph to He",
          challenges: [
            info(
              "שָׁלוֹם! Welcome to Hebrew",
              "Hebrew is read RIGHT to LEFT — the opposite of English. It has 22 letters, and they are all consonants; vowels live as dots and dashes around them. You're about to meet the letters of the Torah itself!"
            ),
            sel(
              "Which direction do you read Hebrew?",
              "📖 Reading direction",
              "Right to left",
              ["Left to right", "Top to bottom", "Either way"],
              "Hebrew reads right to left — start at what feels like the 'end' of the line!"
            ),
            sel(
              "What is this letter called?",
              "א",
              "Aleph",
              ["Ayin", "He", "Tav"],
              "א (aleph) — silent! It carries a vowel sound but makes none itself. It's the first letter of אֱלֹהִים (Elohim — God)!"
            ),
            sel(
              "What is this letter called?",
              "בּ",
              "Bet",
              ["Kaf", "Dalet", "Zayin"],
              "בּ (bet) — says 'b'. With no dot it's vet ('v'). Fun fact: Bethlehem = 'house of bread' — בַּיִת (bayit, house) + לֶחֶם (lechem, bread)!"
            ),
            match("Tap the pairs", [
              ["א", "Aleph"],
              ["בּ", "Bet"],
              ["ג", "Gimel"],
              ["ד", "Dalet"],
            ]),
            sel(
              "What is this letter called?",
              "ה",
              "He",
              ["Chet", "Vav", "Zayin"],
              "ה (he) — says 'h'. It appears twice in the sacred name יהוה (YHWH), ends תּוֹרָה (torah), and sits inside אֱלֹהִים (Elohim)!"
            ),
          ],
        },
        {
          title: "Vav to Yod",
          challenges: [
            info(
              "Letters that double as vowels",
              "Hebrew has 'mothers of reading': ו (vav), י (yod), and ה (he) can serve as vowel letters inside words. So תוֹרָה (torah) uses its ה as a final 'a' sound!"
            ),
            sel(
              "What is this letter called?",
              "ו",
              "Vav",
              ["Zayin", "Tet", "He"],
              "ו (vav) — says 'v' (classically 'w'). As a vowel-letter it can say 'o' or 'u', like in שׁוֹמֵר (shomer, keeper)!"
            ),
            sel(
              "What is this letter called?",
              "ח",
              "Chet",
              ["He", "Tet", "Ayin"],
              "ח (chet) — the 'ch' of Bach, from the throat. It begins חֶסֶד (chesed) — steadfast love!"
            ),
            sel(
              "What is this letter called?",
              "י",
              "Yod",
              ["Vav", "Zayin", "Kaf"],
              "י (yod) — says 'y'. The tiniest letter! Jesus said not one יוֹד will pass from the Law (Matt 5:18). It begins יְהוָה and יֵשׁוּעַ (Yeshua — Jesus)!"
            ),
            match("Tap the pairs", [
              ["ז", "Zayin"],
              ["ח", "Chet"],
              ["ט", "Tet"],
              ["י", "Yod"],
            ]),
            assist(
              "Complete the word 'house' — בַּיִת (b-a-yit)",
              "בַּי ___",
              ["ת"],
              ["ר", "שׁ", "ק"],
              "בַּיִת (bayit) — house. Torah scrolls say 'the house of YHWH' with this word!"
            ),
          ],
        },
        {
          title: "Reading Your First Words",
          challenges: [
            info(
              "You know enough to read!",
              "With ten letters down, you can already recognize real Bible words. אָב (av) = father, אָח (ach) = brother, בֵּן (ben) = son. Look at them closely — you know every letter!"
            ),
            sel(
              "What does this word mean?",
              "אָב",
              "Father",
              ["Brother", "Son", "King"],
              "אָב (av) — father. 'Avraham' = father of a multitude!"
            ),
            sel(
              "What does this word mean?",
              "בֵּן",
              "Son",
              ["House", "Father", "Day"],
              "בֵּן (ben) — son. 'Benjamin' = son of the right hand!"
            ),
            match("Tap the pairs", [
              ["אָב", "father"],
              ["אָח", "brother"],
              ["בֵּן", "son"],
              ["בַּיִת", "house"],
            ]),
            typeAns(
              "Type the meaning of אָח",
              "אָח",
              ["brother", "a brother"],
              "אָח (ach) — brother. 'Achi' = my brother.",
              "ach"
            ),
            sel(
              "Which letter begins the word for 'father'?",
              "אָב",
              "א",
              ["בּ", "ג", "ד"],
              "Father אָב starts with aleph, ends with bet — the alphabet's first two letters!"
            ),
          ],
        },
      ],
    },
    {
      title: "Aleph-Bet · Part 2",
      description: "Complete the alphabet — and meet the mysterious final forms.",
      emoji: "🔡",
      color: "#9B5DE5",
      lessons: [
        {
          title: "Kaf to Nun",
          challenges: [
            info(
              "Final forms — letters in disguise",
              "Five Hebrew letters change shape at the END of a word: כ→ך (kaf), מ→ם (mem), נ→ן (nun), פ→ף (pe), צ→ץ (tsade). Don't panic when you see them — they're the same letters in their 'formal wear'!"
            ),
            sel(
              "What is this letter called?",
              "ל",
              "Lamed",
              ["Nun", "Kaf", "Mem"],
              "ל (lamed) — says 'l'. The tallest letter! It begins לֵב (lev) — heart."
            ),
            sel(
              "ם is the final form of which letter?",
              "ם",
              "מ (Mem)",
              ["ס (Samech)", "נ (Nun)", "כ (Kaf)"],
              "ם is mem standing at word's end — as in שָׁלוֹם (shalom)!"
            ),
            sel(
              "What is this letter called?",
              "ן",
              "Final Nun",
              ["Final Kaf", "Final Mem", "Vav"],
              "ן (final nun) — the long-tailed nun used at the end of words."
            ),
            match("Tap the pairs", [
              ["כּ", "Kaf — 'k'"],
              ["ל", "Lamed — 'l'"],
              ["מ", "Mem — 'm'"],
              ["נ", "Nun — 'n'"],
            ]),
            arrange(
              "Build the word: שָׁלוֹם (right to left!)",
              "Shalom (peace)",
              ["שׁ", "ל", "ו", "ם"],
              ["ך"],
              "שׁ-ל-ו-ם: shin, lamed, vav, final mem. Peace, wholeness, completeness!"
            ),
          ],
        },
        {
          title: "Samech to Tsade",
          challenges: [
            sel(
              "What is this letter called?",
              "ס",
              "Samech",
              ["Ayin", "Tsade", "Pe"],
              "ס (samech) — says 's'. A full circle of a letter — it 'supports' (somech)!"
            ),
            info(
              "The silent twins",
              "ע (ayin) is silent like א (aleph), but it began as a throaty 'gh' sound. Scribes knew them apart by heart. Even though both are silent today, they mark different roots — one little ע can change a word's whole meaning!"
            ),
            sel(
              "What is this letter called?",
              "ע",
              "Ayin",
              ["Aleph", "Tsade", "Qof"],
              "ע (ayin) — a silent guttural from the throat. It appears in עֶלְיוֹן (Elyon, Most High)!"
            ),
            sel(
              "What is this letter called?",
              "צ",
              "Tsade",
              ["Resh", "Qof", "Pe"],
              "צ (tsade) — says 'ts' as in cats. Its final form ץ is its long-tailed outfit for word endings!"
            ),
            match("Tap the pairs", [
              ["ס", "Samech — 's'"],
              ["ע", "Ayin — silent"],
              ["פּ", "Pe — 'p'"],
              ["צ", "Tsade — 'ts'"],
            ]),
            typeAns(
              "Type the sound of פּ",
              "פּ",
              ["p", "p!", "the p sound"],
              "פּ (pe) — says 'p'. Without its dot it says 'f' (feh)!",
              "p"
            ),
          ],
        },
        {
          title: "Qof to Tav",
          challenges: [
            sel(
              "What is this letter called?",
              "ק",
              "Qof",
              ["Kaf", "Resh", "Tav"],
              "ק (qof) — a 'k' made deeper in the throat. It begins קָדוֹשׁ (qadosh) — holy!"
            ),
            sel(
              "What is this letter called?",
              "שׁ",
              "Shin",
              ["Tav", "Sin", "Samech"],
              "שׁ (shin) — says 'sh'. With the dot on the LEFT it becomes sin ('s'). Shin crowns the mezuzah and means God's presence in tradition!"
            ),
            sel(
              "What is this letter called?",
              "ת",
              "Tav",
              ["Tet", "Tsade", "Resh"],
              "ת (tav) — says 't'. The LAST letter of the Hebrew alphabet — and of 'truth': אֶמֶת (emet)!"
            ),
            match("Tap the pairs — all five finals!", [
              ["ך", "final kaf"],
              ["ם", "final mem"],
              ["ן", "final nun"],
              ["ף", "final pe"],
              ["ץ", "final tsade"],
            ]),
            assist(
              "Complete the word for 'holy': קָדוֹשׁ",
              "___ ָדוֹשׁ",
              ["ק"],
              ["ר", "שׁ", "בּ"],
              "קָדוֹשׁ (qadosh) — holy. 'Holy, holy, holy is YHWH of hosts!' (Isaiah 6:3)"
            ),
            sel(
              "How many letters are in the Hebrew alphabet?",
              "🔢 Count them",
              "22",
              ["24", "26", "28"],
              "22 letters — and in tradition, God created the world with them! (Greek has 24, English 26.)"
            ),
          ],
        },
      ],
    },
    {
      title: "Nikkud · The Vowels",
      description: "Those dots and dashes? They're the soul of Hebrew pronunciation.",
      emoji: "✨",
      color: "#E4453D",
      lessons: [
        {
          title: "The 'A' Vowels",
          challenges: [
            info(
              "Enter the Masoretes",
              "Hebrew letters are consonants — so how do we know how to pronounce שׁלום? Around AD 700–1000, the Masoretes in Tiberias invented nikud: dots and dashes that record the vowels. Every Hebrew Bible (and this app!) owes its pronunciation to them."
            ),
            sel(
              "Who invented the vowel points?",
              "👥 History check",
              "The Masoretes",
              ["The Essenes", "The apostles", "Moses"],
              "The Masoretes — Jewish scribes in Tiberias — added nikud and counted every letter to guard the text!"
            ),
            sel(
              "Which nikkud gives an 'a' sound?",
              "Pick the 'a' vowel",
              "ַ  (patach)",
              ["ִ  (hiriq)", "ֹ  (holem)", "ֵ  (tsere)"],
              "Patach ַ says 'a', as in בַּיִת (bayit). Hiriq says 'i', holem says 'o', tsere says 'e'!"
            ),
            sel(
              "What does this word mean?",
              "דָּבָר",
              "Word",
              ["Light", "King", "Bread"],
              "דָּבָר (davar) — word, thing, matter. Two qamets = two 'a' sounds: da-var!"
            ),
            typeAns(
              "Type the transliteration of דָּבָר",
              "דָּבָר",
              ["davar", "da-var", "dawar"],
              "davar — word. The Hebrew twin of Greek logos!",
              "davar"
            ),
            match("Tap the pairs", [
              ["ַ", "'a' (patach)"],
              ["דָּבָר", "word"],
              ["חָכָם", "wise (chacham)"],
              ["בָּרָא", "created (bara)"],
            ]),
          ],
        },
        {
          title: "E, I, O, U",
          challenges: [
            info(
              "The full vowel kit",
              "Tsere ֵ and segol ֶ say 'e'; hiriq ִ says 'i'; holem ֹ says 'o'; shureq וּ and qibbuts ֻ say 'u'. Pair them with consonants: בִּ (bi), בֵּ (be), בֹּ (bo), בֻּ (bu)!"
            ),
            sel(
              "Which vowel says 'o'?",
              "Pick the 'o' vowel",
              "ֹ  (holem)",
              ["ִ  (hiriq)", "ֻ  (qibbuts)", "ַ  (patach)"],
              "Holem ֹ says 'o' — as in תּוֹרָה (torah)!"
            ),
            sel(
              "Which vowel says 'i'?",
              "Pick the 'i' vowel",
              "ִ  (hiriq)",
              ["ֵ  (tsere)", "ַ  (patach)", "ֹ  (holem)"],
              "Hiriq ִ says 'i' — as in מִי (mi — who?) and גִּבּוֹר (gibor — mighty)."
            ),
            match("Tap the pairs", [
              ["בִּ", "bi"],
              ["בֵּ", "be"],
              ["בֹּ", "bo"],
              ["בֻּ", "bu"],
            ]),
            sel(
              "What does this word mean?",
              "מֶלֶךְ",
              "King",
              ["Prophet", "Priest", "Servant"],
              "מֶלֶךְ (melech) — king. Two segols ('e'): me-lech. From the root mlch — kingdom, royalty, Malchus!"
            ),
            assist(
              "Complete the word for 'sun': שֶׁמֶשׁ",
              "___ ֶמֶשׁ",
              ["שׁ"],
              ["מ", "ל", "ר"],
              "שֶׁמֶשׁ (shemesh) — sun. 'The sun of righteousness' (Malachi 4:2)!"
            ),
          ],
        },
        {
          title: "Reading Syllables",
          challenges: [
            info(
              "Open and closed syllables",
              "Hebrew syllables come in two kinds: OPEN (end in a vowel — דָּ 'da') and CLOSED (end in a consonant — וָר 'var'). Davar = da + var. Once you chop words into syllables, even long Torah words stop being scary!"
            ),
            sel(
              "Split it: how many syllables in מֶלֶךְ (king)?",
              "מֶלֶךְ",
              "2 (me-lech)",
              ["1 (melech)", "3 (me-le-ch)", "4"],
              "me-lech — one open syllable (me) and one closed syllable (lech), each with a segol 'e'."
            ),
            sel(
              "What does this word mean?",
              "שֶׁמֶשׁ",
              "Sun",
              ["Moon", "Star", "Sky"],
              "שֶׁמֶשׁ (shemesh) — sun. Joshua told it to stand still (Joshua 10:12)!"
            ),
            match("Tap the pairs", [
              ["מֶלֶךְ", "king"],
              ["שֶׁמֶשׁ", "sun"],
              ["בָּרוּךְ", "blessed"],
              ["שָׁלוֹם", "peace"],
            ]),
            typeAns(
              "Type the meaning of בָּרוּךְ",
              "בָּרוּךְ",
              ["blessed", "blessed!"],
              "בָּרוּךְ (baruch) — blessed. 'Baruch atah YHWH' — Blessed are You, LORD!",
              "baruch"
            ),
            arrange(
              "Build the phrase: 'the king of peace'",
              "the king of peace",
              ["the", "king", "of", "peace"],
              ["sun"],
              "מֶלֶךְ הַשָּׁלוֹם — the King of Peace. Hebrews 7:2 reads Melchizedek's Salem (Gen 14) as 'king of peace'!"
            ),
          ],
        },
      ],
    },
    {
      title: "Words of the Torah",
      description: "The great words of the Hebrew Bible — shalom, chesed, or, torah.",
      emoji: "🌿",
      color: "#58A700",
      lessons: [
        {
          title: "Shalom & Chesed",
          challenges: [
            info(
              "שָׁלוֹם — more than peace",
              "Shalom comes from the root שׁלם (shalem) — WHOLE, complete. It's not just the absence of conflict; it's everything put right. When you say shalom you're praying God's wholeness over someone!",
              "shalom"
            ),
            sel(
              "What is the deeper meaning of שָׁלוֹם?",
              "שָׁלוֹם",
              "Wholeness, completeness",
              ["Silence", "Victory", "Freedom"],
              "Shalom = wholeness. From shalem, 'to be complete, to make whole.'"
            ),
            info(
              "חֶסֶד — the impossible word",
              "Translators fight over חֶסֶד (chesed): steadfast love? lovingkindness? covenant loyalty? It's the LOVE that KEEPS ITS PROMISES — the word Ruth uses for her loyalty and God uses for His. One translation had to coin a whole word for it: 'lovingkindness' (Coverdale, 1535 — carried into the KJV)!",
              "chesed"
            ),
            sel(
              "What does חֶסֶד mean?",
              "חֶסֶד",
              "Steadfast, covenant love",
              ["Holy fear", "Great wealth", "Long life"],
              "Chesed — loyal, covenant love. 'His chesed endures forever' closes every one of Psalm 136's 26 verses — 33 times across Psalms, 41 times across the whole OT!"
            ),
            match("Tap the pairs", [
              ["שָׁלוֹם", "peace / wholeness"],
              ["חֶסֶד", "steadfast love"],
              ["אֱמֶת", "truth / faithfulness"],
              ["קָדוֹשׁ", "holy"],
            ]),
            typeAns(
              "Type the transliteration of חֶסֶד",
              "חֶסֶד",
              ["chesed", "hesed", "chesed!", "checed"],
              "chesed — the covenant love that never lets go.",
              "chesed"
            ),
          ],
        },
        {
          title: "Light & Life",
          challenges: [
            info(
              "יְהִי אוֹר — Let there be light",
              "God's first recorded words in Scripture: יְהִי אוֹר ('yehi or') — 'Let there be light' (Genesis 1:3). And in John 8:12 Jesus declares — in Greek — Ἐγὼ εἰμι τὸ φῶς τοῦ κόσμοῦ: 'I AM the light of the world.' Light is a big deal in this Book!",
            ),
            sel(
              "What does אוֹר mean?",
              "אוֹר",
              "Light",
              ["Darkness", "Word", "Day"],
              "אוֹר (or) — light. God's first spoken creation!"
            ),
            sel(
              "What does חַיִּים mean?",
              "חַיִּים",
              "Life",
              ["Death", "Peace", "Blood"],
              "חַיִּים (chayim) — life, always plural in form! 'L'chaim!' — to life!"
            ),
            assist(
              "Complete Genesis 1:3: 'Let there be ___'",
              "יְהִי ___",
              ["אוֹר"],
              ["מֶלֶךְ", "שָׁלוֹם", "דָּבָר"],
              "יְהִי אוֹר — and there was light!"
            ),
            match("Tap the pairs", [
              ["אוֹר", "light"],
              ["חַיִּים", "life"],
              ["לֵב", "heart"],
              ["דָּם", "blood"],
            ]),
            arrange(
              "Build the translation of Genesis 1:3",
              "Let there be light",
              ["Let", "there", "be", "light"],
              ["life"],
              "יְהִי אוֹר — three syllables in Hebrew, four words in English. And there was light!"
            ),
          ],
        },
        {
          title: "Torah & the Name",
          challenges: [
            info(
              "תּוֹרָה — more than 'law'",
              "We often translate torah as 'Law,' but it comes from the root ירה — 'to instruct, to aim.' Torah is God's TEACHING, His aim for a good life. Psalm 19 calls it 'perfect, reviving the soul' — that's not legislation, that's love!",
              "torah"
            ),
            sel(
              "What does תּוֹרָה really mean?",
              "תּוֹרָה",
              "Instruction / teaching",
              ["Rules only", "Punishment", "History"],
              "Torah = instruction, teaching. The first five books: Genesis, Exodus, Leviticus, Numbers, Deuteronomy."
            ),
            sel(
              "What does שֵׁם mean?",
              "שֵׁם",
              "Name",
              ["Voice", "Face", "Glory"],
              "שֵׁם (shem) — name, reputation. 'Blessed be the NAME' — ha-shem!"
            ),
            typeAns(
              "Type the transliteration of תּוֹרָה",
              "תּוֹרָה",
              ["torah", "tora", "torah!"],
              "torah — from the root 'to instruct.' God's teaching for life.",
              "torah"
            ),
            match("Tap the pairs", [
              ["תּוֹרָה", "instruction / law"],
              ["שֵׁם", "name"],
              ["שָׁמַיִם", "heavens"],
              ["אָרֶץ", "earth / land"],
            ]),
            assist(
              "Complete 'the heavens and the ___' (Genesis 1:1)",
              "הַשָּׁמַיִם וְאֵת הַ___",
              ["אָרֶץ"],
              ["אוֹר", "שֵׁם", "לֵב"],
              "הַשָּׁמַיִם וְאֵת הָאָרֶץ — the heavens and the earth. You're one lesson from reading Genesis 1:1!"
            ),
          ],
        },
      ],
    },
    {
      title: "Genesis 1:1",
      description: "The Bible's opening line — in the original Hebrew.",
      emoji: "🌅",
      color: "#D9A400",
      lessons: [
        {
          title: "In the Beginning",
          challenges: [
            info(
              "בְּרֵאשִׁית — one mighty word",
              "The Bible opens with ONE Hebrew word: בְּרֵאשִׁית (bereshit) — 'in the beginning.' It's the preposition בְּ ('in') welded onto רֵאשִׁית ('first/beginning'). Hebrew stacks meaning like this all the time. In Hebrew, Genesis is literally NAMED by this word: Bereshit!",
              "bereshit"
            ),
            sel(
              "What does בְּרֵאשִׁית mean?",
              "בְּרֵאשִׁית",
              "In the beginning",
              ["In the garden", "From eternity", "By the word"],
              "bereshit — 'in the beginning.' Also the Hebrew name of the book of Genesis!"
            ),
            typeAns(
              "Type the transliteration of בְּרֵאשִׁית",
              "בְּרֵאשִׁית",
              ["bereshit", "bereishit", "beresheet", "bereshith"],
              "bereshit — in the beginning.",
              "bereshit"
            ),
            sel(
              "בְּרֵאשִׁית is built from בְּ + which word?",
              "Word anatomy",
              "רֵאשִׁית (first, beginning)",
              ["רֹאשׁ only", "אֵשׁ (fire)", "שִׁית (place)"],
              "בְּ ('in') + רֵאשִׁית ('beginning') — related to רֹאשׁ (rosh), head!"
            ),
            match("Tap the pairs", [
              ["בְּרֵאשִׁית", "in the beginning"],
              ["בָּרָא", "created"],
              ["אֱלֹהִים", "God"],
              ["הַשָּׁמַיִם", "the heavens"],
            ]),
          ],
        },
        {
          title: "God Created",
          challenges: [
            info(
              "בָּרָא — God's signature verb",
              "In its basic (Qal) stem, the verb בָּרָא (bara, 'created') NEVER has a subject other than God. Humans 'make' (עשׂה), 'form' (יצר), and 'build' (בנה) — but bara is God's word alone. Creating from nothing is His signature act!",
              "bara"
            ),
            sel(
              "What does בָּרָא mean?",
              "בָּרָא",
              "Created",
              ["Blessed", "Chose", "Spoke"],
              "bara — created. And in its Qal stem, only God is ever the subject in Scripture!"
            ),
            sel(
              "Who is the subject of בָּרָא (Qal) in the Hebrew Bible?",
              "🤔 Grammar & theology",
              "God — always",
              ["Angels", "Humans", "Anyone"],
              "Only God creates (bara). Genesis 1:1, Psalm 51:10 ('create in me a clean heart'), Isaiah 65:17 — always divine!"
            ),
            sel(
              "What does אֱלֹהִים mean?",
              "אֱלֹהִים",
              "God",
              ["Heaven", "Angel", "Spirit"],
              "Elohim — God. The mighty One. Appears over 2,500 times in the Hebrew Bible!"
            ),
            typeAns(
              "Type the transliteration of אֱלֹהִים",
              "אֱלֹהִים",
              ["elohim", "elohiem", "eloheim"],
              "Elohim — God, the mighty Creator's name in Genesis 1 (the covenant name YHWH is revealed later, in Exodus 3).",
              "elohim"
            ),
            match("Tap the pairs", [
              ["בָּרָא", "created"],
              ["אֱלֹהִים", "God"],
              ["הָאָרֶץ", "the earth"],
              ["וְ", "and"],
            ]),
          ],
        },
        {
          title: "The Whole Verse",
          challenges: [
            info(
              "The verse, unpacked",
              "בְּרֵאשִׁית בָּרָא אֱלֹהִים אֵת הַשָּׁמַיִם וְאֵת הָאָרֶץ\n'In the beginning God created the heavens and the earth.' Fun fact: אֵת (et) is untranslatable — it just marks 'the heavens' and 'the earth' as objects. Hebrew's way of pointing: 'this is the thing being created!'"
            ),
            sel(
              "What job does אֵת do in Genesis 1:1?",
              "אֵת",
              "Marks the object (untranslatable)",
              ["Means 'and'", "Means 'light'", "Means 'with'"],
              "אֵת is the object marker — Greek and English don't have a twin. It just points: 'this is what was created!'"
            ),
            arrange(
              "Build the translation of Genesis 1:1",
              "In the beginning God created the heavens and the earth",
              ["In", "the", "beginning", "God", "created", "the", "heavens", "and", "the", "earth"],
              ["word"],
              "בְּרֵאשִׁית בָּרָא אֱלֹהִים אֵת הַשָּׁמַיִם וְאֵת הָאָרֶץ — seven Hebrew words containing the whole story's opening!"
            ),
            assist(
              "Complete: 'the heavens and the ___'",
              "הַשָּׁמַיִם וְאֵת הָ___",
              ["אָרֶץ"],
              ["אוֹר", "שֵׁם", "לֵב"],
              "הָאָרֶץ (ha'arets) — the earth / the land."
            ),
            match("Final review — tap the pairs", [
              ["bereshit", "in the beginning"],
              ["bara", "created"],
              ["Elohim", "God"],
              ["ha'arets", "the earth"],
            ]),
            info(
              "🎉 You read Genesis 1:1!",
              "From aleph to tav, you've traveled through the alphabet, the vowels, and into the Bible's first verse in its own language. Keep your streak burning — the Hebrew course continues to grow, and so do you!",
            ),
          ],
        },
      ],
    },
  ],
}
