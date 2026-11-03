import { SeedCourse } from "./helpers"
import { info, sel, assist, match, arrange, typeAns } from "./helpers"

export const greekCourse: SeedCourse = {
  code: "greek",
  title: "Biblical Greek",
  subtitle: "Koine Greek for Bible readers",
  description:
    "Read the New Testament in the language it was written in — start with the alphabet, build real vocabulary, and translate John 1:1 yourself.",
  emoji: "🏛️",
  color: "#D97706",
  order: 1,
  units: [
    {
      title: "The Alphabet · Α – Μ",
      description: "Meet the first half of the alphabet the New Testament was written in.",
      emoji: "🔤",
      color: "#58A700",
      lessons: [
        {
          title: "Alpha to Delta",
          challenges: [
            info(
              "Welcome to Koine Greek!",
              "The New Testament was written in Koine — the 'common' Greek of everyday people in the first century. Every lesson here moves you closer to reading it yourself. Let's meet your first four letters!",
            ),
            sel(
              "What is this letter called?",
              "Α α",
              "Alpha",
              ["Omega", "Mu", "Sigma"],
              "Α α (alpha) — says 'a' as in father. It's the very first letter… and the first sound of 'alphabet'!"
            ),
            sel(
              "What is this letter called?",
              "Β β",
              "Beta",
              ["Zeta", "Delta", "Eta"],
              "Β β (beta) — says 'b'. Alpha + beta = alphabet!"
            ),
            sel(
              "What is this letter called?",
              "Γ γ",
              "Gamma",
              ["Lambda", "Kappa", "Theta"],
              "Γ γ (gamma) — says 'g' as in gift."
            ),
            match("Tap the pairs", [
              ["Α", "Alpha"],
              ["Β", "Beta"],
              ["Γ", "Gamma"],
              ["Δ", "Delta"],
            ]),
            sel(
              "Which letter sounds like 'g' in gift?",
              "🔊 g",
              "Γ",
              ["Δ", "Β", "Α"],
              "Γ γ (gamma) is the 'g' sound. Δ is 'd', Β is 'b'."
            ),
          ],
        },
        {
          title: "Epsilon to Theta",
          challenges: [
            info(
              "Two flavors of 'e'",
              "Greek has TWO e-letters: Ε ε (epsilon), the short 'e' in 'met', and Η η (eta), a long 'ay'-ish 'e' in 'obey'. Distinguishing them takes practice — you'll see both constantly.",
            ),
            sel(
              "What is this letter called?",
              "Ε ε",
              "Epsilon",
              ["Eta", "Iota", "Zeta"],
              "Ε ε (epsilon) — short 'e' as in met."
            ),
            sel(
              "What is this letter called?",
              "Ζ ζ",
              "Zeta",
              ["Theta", "Eta", "Xi"],
              "Ζ ζ (zeta) — says 'z' as in zoo."
            ),
            sel(
              "What is this letter called?",
              "Η η",
              "Eta",
              ["Epsilon", "Alpha", "Sigma"],
              "Η η (eta) — long 'e' as in obey."
            ),
            sel(
              "What is this letter called?",
              "Θ θ",
              "Theta",
              ["Gamma", "Zeta", "Phi"],
              "Θ θ (theta) — the 'th' in theology. Theos (God) + logia (words) = theology, 'words about God'!"
            ),
            match("Tap the pairs", [
              ["Ε", "Epsilon"],
              ["Ζ", "Zeta"],
              ["Η", "Eta"],
              ["Θ", "Theta"],
            ]),
            assist(
              "Complete the word for 'God'",
              "θ ___ ς  (th-eos)",
              "ε",
              ["α", "ο", "η"],
              "θεός (theos) — God. You just read a real Greek word!"
            ),
          ],
        },
        {
          title: "Iota to Mu",
          challenges: [
            sel(
              "What is this letter called?",
              "Ι ι",
              "Iota",
              ["Eta", "Kappa", "Tau"],
              "Ι ι (iota) — says 'i'. 'Not one iota of difference' — because iota is the tiniest Greek letter!"
            ),
            sel(
              "What is this letter called?",
              "Κ κ",
              "Kappa",
              ["Lambda", "Pi", "Rho"],
              "Κ κ (kappa) — says 'k'. Yes, like the Twitch meme."
            ),
            sel(
              "What is this letter called?",
              "Λ λ",
              "Lambda",
              ["Mu", "Gamma", "Chi"],
              "Λ λ (lambda) — says 'l'. The Spartans painted λ on their shields — for Lakedaimon."
            ),
            typeAns(
              "Type the name of this letter",
              "Μ μ",
              ["mu", "m u"],
              "Μ μ (mu) — says 'm', like the beginning of 'music'.",
              "mu"
            ),
            match("Tap the pairs", [
              ["Ι", "Iota"],
              ["Κ", "Kappa"],
              ["Λ", "Lambda"],
              ["Μ", "Mu"],
            ]),
            sel(
              "Which of these is a vowel?",
              "Pick the vowel",
              "Ι",
              ["Κ", "Λ", "Μ"],
              "Greek vowels: Α Ε Η Ι Ο Υ Ω. Ι (iota) is one of the seven!"
            ),
          ],
        },
      ],
    },
    {
      title: "The Alphabet · Ν – Ω",
      description: "Finish the alphabet — from nu all the way to the famous Omega.",
      emoji: "🔡",
      color: "#D9A400",
      lessons: [
        {
          title: "Nu to Pi",
          challenges: [
            info(
              "You're over halfway!",
              "Twelve letters down, twelve to go. Next up: Ν ν (nu, 'n'), Ξ ξ (xi, 'x'), Ο ο (omicron, 'o'), Π π (pi, 'p'). Fun fact: omicron literally means 'little o' (o-micron), while omega means 'big o' (o-mega)!"
            ),
            sel(
              "What is this letter called?",
              "Ν ν",
              "Nu",
              ["Mu", "Xi", "Pi"],
              "Ν ν (nu) — says 'n'. Careful, it looks like English 'v' but it's not!"
            ),
            sel(
              "What is this letter called?",
              "Ξ ξ",
              "Xi",
              ["Chi", "Psi", "Zeta"],
              "Ξ ξ (xi) — says 'x' as in axe."
            ),
            sel(
              "What is this letter called?",
              "Π π",
              "Pi",
              ["Tau", "Theta", "Rho"],
              "Π π (pi) — says 'p'. You'll meet πίστις (faith) later!"
            ),
            match("Tap the pairs", [
              ["Ν", "Nu"],
              ["Ξ", "Xi"],
              ["Ο", "Omicron"],
              ["Π", "Pi"],
            ]),
            assist(
              "Complete the word for 'faith'",
              "π ___ σ τ ι ς",
              "ι",
              ["ο", "α", "υ"],
              "πίστις (pistis) — faith. The classic Greek word for trust and belief."
            ),
          ],
        },
        {
          title: "Rho to Chi",
          challenges: [
            info(
              "Sigma has two faces",
              "Σ is sigma at the start or middle of a word, but at the END of a word it becomes ς — the final sigma. So 'Jesus' is written Ἰησοῦς with that curved ς on the tail!"
            ),
            sel(
              "What is this letter called?",
              "Ρ ρ",
              "Rho",
              ["Rho sigma", "Pi", "Phi"],
              "Ρ ρ (rho) — says 'r'. Looks like English 'p', but it's not!"
            ),
            sel(
              "What is this letter called?",
              "Υ υ",
              "Upsilon",
              ["Psi", "Omega", "Tau"],
              "Υ υ (upsilon) — says 'u' or 'y'."
            ),
            sel(
              "Which form does sigma take at the END of a word?",
              "End of word",
              "ς",
              ["σ", "Σ", "ξ"],
              "ς is the final sigma — used only at a word's end."
            ),
            match("Tap the pairs", [
              ["Τ τ", "Tau — 't'"],
              ["Φ φ", "Phi — 'ph/f'"],
              ["Χ χ", "Chi — 'kh'"],
              ["Υ υ", "Upsilon — 'u'"],
            ]),
            sel(
              "Which letter do you hear at the start of 'Christ' — Χριστός?",
              "🔊 kh",
              "Χ",
              ["Ψ", "Ω", "Ρ"],
              "Χ χ (chi) — the 'kh/ch' sound. That's why Xmas = Christmas: X is Chi!"
            ),
          ],
        },
        {
          title: "Psi, Omega & Review",
          challenges: [
            sel(
              "What is this letter called?",
              "Ψ ψ",
              "Psi",
              ["Phi", "Chi", "Xi"],
              "Ψ ψ (psi) — says 'ps' as in lapse. Psychology = study of the soul (psyche)!"
            ),
            sel(
              "What is this letter called?",
              "Ω ω",
              "Omega",
              ["Omicron", "Mu", "Psi"],
              "Ω ω (omega) — the 'big o', last letter of the Greek alphabet."
            ),
            info(
              "“I am the Alpha and the Omega”",
              "In Revelation 22:13, Jesus says: Ἐγώ τὸ Ἄλφα καὶ τὸ Ὦ — 'I am the Alpha and the Omega, the first and the last.' Alpha is the FIRST letter, Omega the LAST. Now you can read both!"
            ),
            match("Alphabet review — tap the pairs", [
              ["Α", "Alpha"],
              ["Μ", "Mu"],
              ["Σ", "Sigma"],
              ["Ω", "Omega"],
            ]),
            typeAns(
              "Type the name of this letter",
              "Ω ω",
              ["omega", "o mega"],
              "Omega — 'the big O'. First and last, beginning and end.",
              "omega"
            ),
            sel(
              "How many letters are in the Greek alphabet?",
              "🔢 Count them",
              "24",
              ["22", "26", "28"],
              "24 letters — 7 vowels (α ε η ι ο υ ω) and 17 consonants. Hebrew, by contrast, has 22!"
            ),
          ],
        },
      ],
    },
    {
      title: "First Words of the Faith",
      description: "Your first real Greek vocabulary — the great words of the New Testament.",
      emoji: "💬",
      color: "#9B5DE5",
      lessons: [
        {
          title: "Word & God",
          challenges: [
            info(
              "λόγος — the Word",
              "In the beginning was the λόγος (logos) — the Word (John 1:1). Greeks used logos for reason, speech, and account. John reached for this mighty word to name the eternal Son of God.",
              "logos"
            ),
            sel(
              "What does this word mean?",
              "λόγος",
              "Word",
              ["Light", "Love", "Bread"],
              "λόγος (logos) — Word. As in John 1:1: 'In the beginning was the Word.'"
            ),
            info(
              "θεός — God",
              "θεός (theos) is the standard New Testament word for God. You already know it from English words like theology, atheist, and pantheon!",
              "theos"
            ),
            typeAns(
              "Type the meaning of this word",
              "θεός",
              ["god", "God"],
              "θεός (theos) — God. Theology = words about God.",
              "theos"
            ),
            sel(
              "Which word means 'God'?",
              "Choose the word",
              "θεός",
              ["λόγος", "ἀγάπη", "πίστις"],
              "θεός (theos) — God. The others: word, love, faith."
            ),
            match("Tap the pairs", [
              ["λόγος", "word"],
              ["θεός", "God"],
              ["ἀγάπη", "love"],
              ["πίστις", "faith"],
            ]),
          ],
        },
        {
          title: "Love, Grace & Hope",
          challenges: [
            info(
              "ἀγάπη — the highest love",
              "The Greeks had several words for love, but ἀγάπη (agapē) became the church's word: self-giving, sacrificial love. 'God is love' — ὁ θεὸς ἀγάπη ἐστίν (1 John 4:8).",
              "agapē"
            ),
            sel(
              "What does this word mean?",
              "ἀγάπη",
              "Love",
              ["Hope", "Peace", "Grace"],
              "ἀγάπη (agapē) — self-giving love. Also the name of love feasts in the early church!"
            ),
            sel(
              "What does this word mean?",
              "χάρις",
              "Grace",
              ["Truth", "Faith", "Glory"],
              "χάρις (charis) — grace, gift, favor. It gives us words like charisma and Eucharist!"
            ),
            sel(
              "What does this word mean?",
              "ἐλπίς",
              "Hope",
              ["Love", "Life", "Word"],
              "ἐλπίς (elpis) — hope, confident expectation. Not wishful thinking — certainty!"
            ),
            match("Tap the pairs", [
              ["ἀγάπη", "love"],
              ["χάρις", "grace"],
              ["ἐλπίς", "hope"],
              ["εἰρήνη", "peace"],
            ]),
            assist(
              "Complete the famous phrase from John 1:17",
              "χάρις καὶ ___ (grace and ___)",
              "ἀλήθεια",
              ["ἐλπίς", "θεός", "λόγος"],
              "χάρις καὶ ἀλήθεια — 'grace and truth came through Jesus Christ' (John 1:17). ἀλήθεια = truth!"
            ),
          ],
        },
        {
          title: "Lord & Peace",
          challenges: [
            info(
              "κύριος — Lord",
              "κύριος (kyrios) means Lord, master, owner. In the Greek Old Testament it translates the sacred name YHWH — so when Thomas says 'My Lord and my God' (Ὁ κύριός μου καὶ ὁ θεός μου), he is using the Bible's highest title for Jesus.",
              "kyrios"
            ),
            sel(
              "What does this word mean?",
              "κύριος",
              "Lord",
              ["King", "Teacher", "Servant"],
              "κύριος (kyrios) — Lord. The LXX uses it for God's covenant name."
            ),
            sel(
              "What does this word mean?",
              "εἰρήνη",
              "Peace",
              ["Joy", "Rest", "Mercy"],
              "εἰρήνη (eirēnē) — peace, wholeness. Jesus: 'Peace I leave with you' (John 14:27)."
            ),
            typeAns(
              "Type the meaning of this word",
              "ἀλήθεια",
              ["truth", "the truth"],
              "ἀλήθεια (alētheia) — truth. 'You will know the truth, and the truth will set you free' (John 8:32).",
              "alētheia"
            ),
            match("Tap the pairs", [
              ["κύριος", "lord"],
              ["εἰρήνη", "peace"],
              ["ἀλήθεια", "truth"],
              ["ζωή", "life"],
            ]),
            arrange(
              "Build the phrase: 'the Lord of peace'",
              "the Lord of peace",
              ["the", "Lord", "of", "peace"],
              ["love"],
              "ὁ κύριος τῆς εἰρήνης — 'the Lord of peace' (2 Thess 3:16). Notice the pattern: noun + article!"
            ),
          ],
        },
      ],
    },
    {
      title: "John 1:1",
      description: "Translate the most famous sentence in Greek — one word at a time.",
      emoji: "📖",
      color: "#E4453D",
      lessons: [
        {
          title: "In the Beginning",
          challenges: [
            info(
              "Ἐν ἀρχῇ — in the beginning",
              "John 1:1 opens: Ἐν ἀρχῇ ἦν ὁ λόγος — 'In the beginning was the Word.' ἐν = in; ἀρχή = beginning, origin, rule. John's opening echoes Genesis 1:1 — a new creation story begins.",
            ),
            sel(
              "What does ἀρχή mean?",
              "ἀρχή",
              "Beginning",
              ["Word", "Heaven", "Light"],
              "ἀρχή (archē) — beginning. Also gives us 'archaeology' — the study of beginnings!"
            ),
            assist(
              "Complete John 1:1",
              "Ἐν ___ ἦν ὁ λόγος",
              ["ἀρχῇ"],
              ["θεός", "πίστις", "εἰρήνη"],
              "Ἐν ἀρχῇ ἦν ὁ λόγος — 'In the beginning was the Word.'"
            ),
            arrange(
              "Build the translation",
              "In the beginning was the Word",
              ["In", "the", "beginning", "was", "the", "Word"],
              ["God"],
              "Ἐν ἀρχῇ ἦν ὁ λόγος — 'In the beginning was the Word.' The Word already existed when everything else began!"
            ),
            typeAns(
              "Type the meaning of ἐν",
              "ἐν",
              ["in", "in the"],
              "ἐν (en) — 'in', a tiny preposition that appears constantly in Greek.",
              "en"
            ),
          ],
        },
        {
          title: "The Verb 'To Be'",
          challenges: [
            info(
              "ἦν — the eternal 'was'",
              "ἦν (ēn) is the imperfect tense of 'to be' — a continuous, ongoing past: 'was being.' John chose it deliberately. Unlike created things that 'came to be' (ἐγένετο), the Word simply WAS — eternally, without beginning. The tense itself preaches!",
              "ēn"
            ),
            sel(
              "What does ἦν mean?",
              "ἦν",
              "Was",
              ["Is", "Will be", "Became"],
              "ἦν (ēn) — 'was', continuously. Contrast: ἐγένετο (egeneto) = 'came to be, happened.'"
            ),
            assist(
              "Complete John 1:1",
              "Ἐν ἀρχῇ ___ ὁ λόγος",
              ["ἦν"],
              ["ἐστίν", "θεός", "ἀγάπη"],
              "ἦν — the imperfect of 'to be'. The Word continuously was."
            ),
            sel(
              "Which tense did John use for the Word's existence?",
              "🤔 Grammar check",
              "Imperfect (continuous past)",
              ["Aorist (one-time past)", "Future", "Present"],
              "The imperfect ἦν shows ongoing existence — the Word never began!"
            ),
            match("Tap the pairs", [
              ["ἐν", "in"],
              ["ἀρχῇ", "beginning"],
              ["ἦν", "was"],
              ["ὁ λόγος", "the Word"],
            ]),
          ],
        },
        {
          title: "The Whole Verse",
          challenges: [
            info(
              "The full verse",
              "Ἐν ἀρχῇ ἦν ὁ λόγος, καὶ ὁ λόγος ἦν πρὸς τὸν θεόν, καὶ θεὸς ἦν ὁ λόγος.\n'In the beginning was the Word, and the Word was with God, and the Word was God.' You now know every part of it!",
            ),
            typeAns(
              "What does πρὸς τὸν θεόν mean?",
              "πρὸς τὸν θεόν",
              ["with God", "with god"],
              "πρὸς τὸν θεόν — 'with God.' The Word was in living relationship with God — face to face.",
              "pros ton theon"
            ),
            arrange(
              "Build the translation",
              "and the Word was with God",
              ["and", "the", "Word", "was", "with", "God"],
              ["in"],
              "καὶ ὁ λόγος ἦν πρὸς τὸν θεόν — 'and the Word was with God.'"
            ),
            arrange(
              "Build the climactic ending",
              "and the Word was God",
              ["and", "the", "Word", "was", "God"],
              ["a", "man"],
              "καὶ θεὸς ἦν ὁ λόγος — 'and the Word was God.' The verse every Greek student waits to read!",
            ),
            match("Tap the pairs", [
              ["ἀγάπη", "love"],
              ["χάρις", "grace"],
              ["πίστις", "faith"],
              ["κύριος", "lord"],
            ]),
            info(
              "🎉 You did it!",
              "You can now recognize every word of John 1:1 in Greek. This is how every Greek scholar started — one letter, one word, one verse at a time. Keep your streak alive and press on to the article!",
            ),
          ],
        },
      ],
    },
    {
      title: "The Article & Cases",
      description: "Meet 'the' — and discover why Greek nouns wear different endings.",
      emoji: "🧩",
      color: "#0F8A80",
      lessons: [
        {
          title: "Meeting 'the'",
          challenges: [
            info(
              "One word, three genders",
              "Greek has three words for 'the': ὁ (masculine), ἡ (feminine), τό (neuter). Nouns are born with their gender — ὁ λόγος (the word, masc.), ἡ ἀγάπη (the love, fem.), τὸ φῶς (the light, neut.). Learn the article with each noun and you get the gender free!"
            ),
            sel(
              "Which article is masculine?",
              "Pick the article",
              "ὁ",
              ["ἡ", "τό", "καί"],
              "ὁ = the (masculine). ἡ = feminine, τό = neuter."
            ),
            sel(
              "Which article is feminine?",
              "Pick the article",
              "ἡ",
              ["ὁ", "τό", "ἐν"],
              "ἡ = the (feminine), as in ἡ ἀγάπη — 'the love.'"
            ),
            match("Tap the pairs", [
              ["ὁ", "the (masc.)"],
              ["ἡ", "the (fem.)"],
              ["τό", "the (neut.)"],
              ["ὁ λόγος", "the word"],
            ]),
            assist(
              "Complete: 'the love'",
              "___ ἀγάπη",
              ["ἡ"],
              ["ὁ", "τό", "ὦ"],
              "ἡ ἀγάπη — 'the love' (feminine). 1 Corinthians 13 is all about her!"
            ),
          ],
        },
        {
          title: "The Nominative Case",
          challenges: [
            info(
              "Cases — Greek's superpower",
              "Greek nouns change endings based on their job in the sentence — their 'case.' The NOMINATIVE is the subject case: the doer of the action. ὁ λόγος ἦν — 'the Word was' — λόγος wears its nominative hat because it's the subject."
            ),
            sel(
              "Which case marks the SUBJECT of a sentence?",
              "🤔 Grammar check",
              "Nominative",
              ["Accusative", "Genitive", "Dative"],
              "The nominative names the subject — the one doing or being."
            ),
            sel(
              "In 'ὁ λόγος ἦν', what job does λόγος do?",
              "ὁ λόγος ἦν",
              "Subject",
              ["Object", "Possessive", "Indirect object"],
              "λόγος is nominative — the subject of 'was.'"
            ),
            match("Tap the pairs", [
              ["Nominative", "subject"],
              ["ὁ λόγος", "the word (subject)"],
              ["τὸν λόγον", "the word (object)"],
              ["ὁ θεός", "God (subject)"],
            ]),
            arrange(
              "Build: 'the Word was God' (subject first!)",
              "the Word was God",
              ["the", "Word", "was", "God"],
              ["a"],
              "καὶ θεὸς ἦν ὁ λόγος — word order is flexible in Greek; the cases tell you who's who!"
            ),
          ],
        },
        {
          title: "Putting It Together",
          challenges: [
            info(
              "Object case",
              "When a noun RECEIVES the action, it slips into the ACCUSATIVE: ὁ λόγος becomes τὸν λόγον. Article and noun change together — ὁ/τό → τό/τὸν. Spot the -ν ending and you've usually found the object!"
            ),
            sel(
              "Which form is the OBJECT: 'the word'?",
              "Pick the object form",
              "τὸν λόγον",
              ["ὁ λόγος", "ἡ λόγος", "λόγοι"],
              "τὸν λόγον (accusative) = the word as object. ὁ λόγος = subject form."
            ),
            assist(
              "Complete: 'the Word was WITH ___' (object of μετά)",
              "ὁ λόγος ἦν μετὰ ___",
              ["τοῦ θεοῦ"],
              ["ὁ θεός", "ἡ ἀγάπη", "ὁ οὐρανός"],
              "μετὰ takes the genitive: τοῦ θεοῦ — 'with God.'"
            ),
            typeAns(
              "Type the subject form of 'the' (masculine)",
              "subject 'the' (masc.)",
              ["ho", "ὁ"],
              "ὁ (ho) — the masculine nominative article.",
              "ho"
            ),
            match("Final review — tap the pairs", [
              ["ἐν ἀρχῇ", "in the beginning"],
              ["ἦν", "was"],
              ["ὁ θεός", "God (subject)"],
              ["τὸν θεόν", "God (object)"],
            ]),
            info(
              "🎓 Unit complete!",
              "You can now read Greek words, know the great vocabulary of the faith, and understand articles and cases. The Greek course will keep growing with you — review to keep your streak and your hearts safe!"
            ),
          ],
        },
      ],
    },
  ],
}
