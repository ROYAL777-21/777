// ── Course: Worldviews & Religions ───────────────────────────
// Comparative theology & apologetics engagement. Scholarly, respectful,
// ideas-focused. Motto: "know what you believe and why — engage with
// gentleness and respect" (1 Peter 3:15-16).

import { info, sel, assist, match, arrange, typeAns, type SeedCourse } from "./helpers"

export const worldviewsCourse: SeedCourse = {
  code: "worldviews",
  title: "Worldviews & Religions",
  subtitle: "Know every story, share yours well",
  description:
    "Study what Judaism, Islam and other worldviews actually teach, how the Christian case answers the big questions, and how to discuss deep differences with truth and love.",
  emoji: "🌍",
  color: "#0F766E",
  order: 7,
  units: [
    {
      title: "What Is a Worldview?",
      description: "Everyone lives by a story. Learn to spot one — and test it.",
      emoji: "🧭",
      color: "#0F766E",
      difficulty: 1,
      lessons: [
        {
          title: "Everyone Has One",
          challenges: [
            info(
              "Worldview: the story you live by",
              "A worldview is the set of beliefs through which you see everything — God, people, right and wrong, suffering, and destiny. Think of it as a pair of glasses: you rarely look AT them, but you look THROUGH them all day long. The question is never whether you have a worldview, but whether yours is true.",
            ),
            info(
              "Four questions every worldview must answer",
              "1) Where did we come from? (origin) 2) What went wrong? (the human problem) 3) What is the fix? (rescue) 4) Where are we heading? (destiny). Every religion and philosophy — Christianity, Judaism, Islam, Buddhism, atheism — is an attempt to answer these four.",
            ),
            sel(
              "A worldview is best pictured as…",
              "🧭 A compass for all of life",
              ["A Sunday-only habit", "A list of doubts about God", "A personality type"],
              "A worldview orients every area of life, not just religious corners of it.",
            ),
            assist(
              "Complete the principle",
              "The question is never whether you have a worldview, but whether yours is ___.",
              "true",
              ["popular", "old", "comfortable"],
              "Truth is the real test of a worldview — not comfort, age or popularity.",
            ),
            match("Pair each big question with its category", [
              ["Where did we come from?", "Origin"],
              ["What went wrong with the world?", "The human problem"],
              ["What is the rescue?", "Salvation"],
              ["Where is history heading?", "Destiny"],
            ]),
            sel(
              "'A worldview is like a pair of glasses.' What does the metaphor mean?",
              "You look THROUGH it at everything, usually without noticing it",
              ["It corrects your eyesight", "It is expensive to replace", "It is only worn in public"],
              "Worldviews are pre-conscious: they shape how you interpret every fact before you examine them.",
            ),
            typeAns(
              "Which four-word phrase names the four big questions?",
              "origin, problem, rescue, destiny",
              ["origin problem rescue destiny", "origin problem salvation destiny", "origin evil rescue destiny"],
              "Origin · problem · rescue · destiny.",
            ),
          ],
        },
        {
          title: "Testing Worldviews",
          challenges: [
            info(
              "How do you judge a worldview?",
              "Three tests scholars use: 1) LOGICAL CONSISTENCY — does it contradict itself? 2) FIT WITH REALITY — does it match what we observe in history, science and human experience? 3) LIVABILITY — can you actually live by it without borrowing from another worldview? A view that fails these tests is defective, no matter how attractive it feels.",
            ),
            info(
              "Truth is not a flavour",
              "Saying 'that's true for you but not for me' sounds humble, but it collapses on contact with itself: is THAT claim true for everyone? If yes, it refutes relativism; if no, it is just an opinion you may ignore. Christianity claims open, public, testable truth — rooted in history, not private feelings (2 Peter 1:16).",
            ),
            sel(
              "Which test asks whether a worldview contradicts itself?",
              "Logical consistency",
              ["Livability", "Popularity", "Emotional appeal"],
              "A self-contradictory worldview cannot be wholly true.",
            ),
            assist(
              "A relativist says 'all truth is relative.' Why does this self-destruct?",
              "Because the claim applies the claim to ___ as well — and refutes itself.",
              "itself",
              ["science", "religion", "no one"],
              "If all truth is relative, so is that sentence — and we may freely ignore it.",
            ),
            match("Match each test to what it examines", [
              ["Consistency", "Does it contradict itself?"],
              ["Coherence with reality", "Does it match evidence?"],
              ["Livability", "Can you actually live it?"],
            ]),
            sel(
              "Christianity grounds its truth-claims in…",
              "Public history — creation, Israel, the cross, the empty tomb",
              ["Private mystical feelings alone", "Majority vote in each century", "Whatever culture tolerates"],
              "Paul stakes everything on public events: 'if Christ has not been raised, our preaching is useless' (1 Cor 15:14).",
            ),
            typeAns(
              "Name the test: 'can a person actually live by this view day to day?'",
              "livability",
              ["livability", "liveability", "livability test"],
              "The livability test — worldviews must be livable, not just speakable.",
            ),
          ],
        },
        {
          title: "The Christian Story",
          challenges: [
            info(
              "Creation → Fall → Redemption → Restoration",
              "The Bible's four-act story: God made a GOOD world (Genesis 1–2); humanity rebelled and dragged creation into decay (Genesis 3); God pursues a rescued people through covenant and cross (Exodus → Gospels); one day all is made new (Revelation 21–22). Every other worldview gives a different diagnosis of the human problem — and therefore a different cure.",
            ),
            info(
              "How Christianity answers the four questions",
              "Origin: we are made in God's image, on purpose. Problem: sin — rebellion severing us from our Source. Rescue: grace — God Himself pays the price in Christ. Destiny: a renewed creation where God dwells with His people. Notice: the rescue is by grace, not by climbing up to God by effort.",
            ),
            sel(
              "In the Christian story, what is the core human problem?",
              "Sin — rebellion against our Maker",
              ["Ignorance of scientific facts", "Imbalance of cosmic energies", "Weak self-esteem"],
              "A wrong diagnosis always produces the wrong cure. Christianity's cure — grace — targets sin precisely.",
            ),
            arrange(
              "Put the Bible's four-act story in order",
              "Creation Fall Redemption Restoration",
              ["Creation", "Fall", "Redemption", "Restoration"],
              [],
              "Creation · Fall · Redemption · Restoration — the frame that holds all 66 books together.",
            ),
            match("Match the question to Christianity's answer", [
              ["Origin", "Made in God's image"],
              ["Problem", "Sin and rebellion"],
              ["Rescue", "Grace through Christ's cross"],
              ["Destiny", "A renewed creation"],
            ]),
            sel(
              "Why does the diagnosis matter so much?",
              "Because the cure only works if the disease is correctly named",
              ["Because doctors say so", "Because it makes good poetry", "It does not really matter"],
              "Buddha diagnosed craving; Marx diagnosed class; the Bible diagnoses sin. Each prescribes a matching cure.",
            ),
            typeAns(
              "Which act of the story does the cross belong to? (one word)",
              "redemption",
              ["redemption", "redemption act"],
              "The cross is the hinge of the Redemption act.",
            ),
          ],
        },
      ],
    },
    {
      title: "Judaism · Our Elder Brother",
      description: "The faith Jesus, Paul and the apostles were raised in. What it teaches, and where we part ways.",
      emoji: "🕎",
      color: "#6D28D9",
      difficulty: 2,
      lessons: [
        {
          title: "What Judaism Teaches",
          challenges: [
            info(
              "A respectful start",
              "Christianity was born inside Judaism. Jesus, Mary, Peter and Paul were all Jews. Judaism gave the world the Shema ('Hear, O Israel: the LORD our God, the LORD is one' — Deut 6:4), the Sabbath, the Psalms and the prophetic hope. Studying it respectfully is studying our own roots (Rom 9:4-5, 11:18).",
            ),
            info(
              "Tanakh: the Hebrew Bible",
              "T-N-K = Torah (Law: Genesis–Deuteronomy), Nevi'im (Prophets: Joshua–Kings + Isaiah–Malachi), Ketuvim (Writings: Psalms, Proverbs, Daniel and more). It is the same library as the Protestant Old Testament, arranged differently. Alongside it, rabbinic Judaism treasures the Talmud — centuries of debate and commentary on how to live the Torah.",
            ),
            sel(
              "What does 'Tanakh' stand for?",
              "Torah, Nevi'im, Ketuvim",
              ["Temple, Nation, Kingdom", "Teachings of the Rabbis", "Torah and New Covenant"],
              "Tanakh is an acronym of its three sections — Law, Prophets and Writings.",
            ),
            assist(
              "The Shema (Deut 6:4) confesses that the LORD is ___",
              "Hear, O Israel: the LORD our God, the LORD is ___.",
              "one",
              ["three", "silent", "unknowable"],
              "Judaism's bedrock is radical oneness — which is exactly where the Trinity debate begins.",
            ),
            match("Match each section of the Tanakh to its contents", [
              ["Torah", "Genesis–Deuteronomy"],
              ["Nevi'im", "Joshua–Kings, Isaiah–Malachi"],
              ["Ketuvim", "Psalms, Proverbs, Daniel"],
            ]),
            sel(
              "The Talmud is best described as…",
              "Rabbinic commentary and debate on living out the Torah",
              ["A lost book of the Bible", "The Jewish New Testament", "A history of the Temple only"],
              "The Talmud is the heart of ORAL tradition — a stream Christians respect but do not treat as Scripture.",
            ),
            sel(
              "Which Jewish festival celebrates the Exodus deliverance?",
              "Passover (Pesach)",
              ["Purim", "Hanukkah", "Yom Kippur"],
              "Jesus reinterpreted the Passover cup at His Last Supper — 'this is my blood of the covenant.'",
            ),
            typeAns(
              "Which patriarch received the covenant of circumcision (Gen 17)?",
              "abraham",
              ["abraham", "abram", "abraham abram"],
              "Abraham — the father of Israel and of all who believe (Rom 4:16).",
            ),
          ],
        },
        {
          title: "The Messiah Question",
          challenges: [
            info(
              "Messiah: what Israel was waiting for",
              "Mashiach means 'Anointed One' — the king God promised who would restore Israel and the world. Key texts Jewish and Christian readers both weigh: Isaiah 53 (the suffering Servant), Psalm 22 (pierced hands and feet imagery, casting lots for garments), Micah 5:2 (ruler from Bethlehem), Daniel 9 (anointed one cut off), Isaiah 9:6-7 (child called Mighty God).",
            ),
            info(
              "How the conversation usually goes",
              "Traditional Jewish readings often identify the Isaiah 53 Servant as the people of Israel suffering on behalf of the nations, and read Messianic titles as royal poetry. Christian readers see Jesus of Nazareth fulfilling these texts — his birth in Bethlehem, his crucifixion detail by detail, his resurrection, and his impact on the nations. Both sides agree these are the texts to argue about — that itself is common ground.",
            ),
            sel(
              "What does 'Messiah' (Mashiach) literally mean?",
              "Anointed One",
              ["Light-bringer", "Law-giver", "Warrior-priest"],
              "Kings and priests were anointed with oil; the promised Anointed One would be the ultimate King.",
            ),
            assist(
              "Micah 5:2 names the Messiah's birthplace as ___",
              "But you, O Bethlehem… from you shall come a ruler for me, whose origin is from of old.",
              "bethlehem",
              ["nazareth", "jerusalem", "capernaum"],
              "Matthew 2 and Luke 2 report Jesus' birth in Bethlehem — a checkpoint anyone can investigate.",
            ),
            match("Match the prophecy to its detail", [
              ["Isaiah 53", "Servant pierced for our transgressions"],
              ["Psalm 22", "Hands and feet pierced, garments divided"],
              ["Micah 5:2", "Ruler born in Bethlehem"],
              ["Isaiah 9:6", "Child called Mighty God"],
            ]),
            sel(
              "A common traditional Jewish reading of Isaiah 53's Servant is…",
              "The nation Israel suffering for the nations",
              ["A Roman governor", "The archangel Michael", "The prophet Ezekiel"],
              "Knowing the alternative reading honestly makes your conversation respectful instead of strawmanned.",
            ),
            typeAns(
              "Which Gospel reports the casting of lots for Jesus' garments at the cross (echoing Psalm 22)?",
              "john",
              ["john", "the gospel of john", "gospel of john"],
              "John 19:23-24 explicitly cites the detail — a thread you can pull in study.",
            ),
          ],
        },
        {
          title: "Agreeing & Differing",
          challenges: [
            info(
              "Where Jews and Christians agree",
              "One Creator God; the Hebrew Scriptures; the dignity of every human as God's image; the moral law; the covenant with Abraham; the hope of resurrection and a redeemed world; and the priority of loving God and neighbour. That is an enormous shared inheritance.",
            ),
            info(
              "Where the road forks",
              "1) Is Jesus the promised Messiah and divine Son? 2) Is God a Trinity — one Being, three Persons? 3) How is sin atoned — Temple sacrifice (awaited restoration), or the cross as the final sacrifice (Hebrews 10)? 4) What is the new covenant of Jeremiah 31? Christians answer: Jesus fulfils all four (Matt 5:17).",
            ),
            info(
              "How to speak — and how not to",
              "Paul weeps over Israel and writes 'they are beloved for the sake of the fathers' (Rom 11:28). Never mock, never pressure, never dehumanize. Read what Jewish scholars actually say, build real friendships, and let the evidence and your life do the persuading. Antisemitic slander is sin — full stop.",
            ),
            sel(
              "Paul's attitude toward Jewish people in Romans 9–11 is best described as…",
              "Aching love and respect — 'beloved for the sake of the fathers'",
              ["Cold indifference", "Triumphant contempt", "Fearful avoidance"],
              "Rom 9:2-3 — 'I have great sorrow and unceasing anguish… I could wish myself accursed for their sake.'",
            ),
            match("Match the fork in the road", [
              ["Christians confess", "Jesus is Messiah and divine Son"],
              ["Judaism holds", "Messiah's coming is yet future"],
              ["Both treasure", "The Hebrew Scriptures and the Shema"],
            ]),
            assist(
              "Hebrews 10 presents the cross as the ___ sacrifice that ends the sacrificial system",
              "But when Christ had offered for all time a single ___ for sins, he sat down at the right hand of God.",
              "sacrifice",
              ["symbol", "parable", "rumour"],
              "One offering, once for all — the heart of how the New Covenant reads Leviticus.",
            ),
            sel(
              "The Trinity claims that God is…",
              "One Being in three Persons — not three gods",
              ["Three separate gods ranked by power", "One Person wearing three masks", "A force with no personhood"],
              "Both Judaism and Islam hear 'three gods' when Christians say Trinity — correcting that mishearing is step one of honest dialogue.",
            ),
            typeAns(
              "Which chapter of Romans expresses Paul's grief and hope for Israel? (number)",
              "9",
              ["9", "romans 9", "nine"],
              "Romans 9–11 — the most sustained Christian reflection on Israel ever written.",
            ),
          ],
        },
      ],
    },
    {
      title: "Islam · A Close Cousin",
      description: "The world's second-largest faith claims to complete the biblical story. What it teaches, and how the evidence compares.",
      emoji: "☪️",
      color: "#047857",
      difficulty: 2,
      lessons: [
        {
          title: "What Islam Teaches",
          challenges: [
            info(
              "Origins in a sentence",
              "Islam ('submission') began with Muhammad (570–632 AD) in Arabia. Muslims believe the angel Gabriel recited God's literal words to him over 23 years, collected as the Quran — God's final revelation, confirming and correcting earlier scriptures.",
            ),
            info(
              "The Five Pillars",
              "1) Shahada — confess 'there is no god but Allah, and Muhammad is his messenger.' 2) Salat — five daily prayers toward Mecca. 3) Zakat — almsgiving (~2.5%). 4) Sawm — fasting Ramadan's daylight hours. 5) Hajj — pilgrimage to Mecca once if able. A disciplined, communal, works-and-merit framework of devotion.",
            ),
            info(
              "Tawhid: the uncompromising oneness",
              "Islam's deepest conviction is Tawhid — God is absolutely one, with no partner, no son, no Trinity. Shirk (associating anything with God) is the unforgivable sin. This is the single widest ditch between Islam and Christianity.",
            ),
            sel(
              "What does 'Islam' literally mean?",
              "Submission (to God)",
              ["Peace at any price", "The sword of God", "The final philosophy"],
              "A Muslim is 'one who submits.' The name announces the framework: surrender, not trust-in-a-person.",
            ),
            match("Match each pillar to its practice", [
              ["Shahada", "Confession of faith"],
              ["Salat", "Five daily prayers"],
              ["Zakat", "Almsgiving"],
              ["Sawm", "Ramadan fasting"],
              ["Hajj", "Pilgrimage to Mecca"],
            ]),
            assist(
              "Islam's doctrine of absolute divine oneness is called ___",
              "To deny it is shirk — the gravest sin.",
              "tawhid",
              ["tariqa", "taqwa", "tahrif"],
              "Tawhid vs Trinity is the central theological conversation between the two faiths.",
            ),
            sel(
              "The Quran's view of Jesus (Isa) is that he is…",
              "A virgin-born prophet and Messiah — but not divine, not crucified",
              ["A mere carpenter of no importance", "An angel in disguise", "A failed revolutionary"],
              "Surah 3:45-47 honours Jesus remarkably — then Surah 4:157 denies the crucifixion and 5:116 denies his divinity.",
            ),
            typeAns(
              "What is Islam's holy book called?",
              "quran",
              ["quran", "koran", "qur'an", "quran koran"],
              "The Quran — about the length of the New Testament, written in Arabic.",
            ),
          ],
        },
        {
          title: "Scripture Under the Microscope",
          challenges: [
            info(
              "The charge of tahrif ('corruption')",
              "The Quran tells Muslims to trust the Torah and Gospel (Surah 5:46-47, 10:94), yet the New Testament we possess contradicts Islam on the cross and the Sonship of Jesus. The usual resolution: the earlier scriptures were corrupted (tahrif). Everything then turns on one testable question — WHEN? Corruption before Muhammad would be caught by manuscripts; corruption after is impossible, because we possess complete New Testaments from the 300s AD — centuries BEFORE Islam began.",
            ),
            info(
              "What the manuscripts actually show",
              "We hold ~5,800 Greek New Testament manuscripts, plus ~10,000 Latin and 9,000+ in other languages — including Codex Sinaiticus and Vaticanus (complete NTs, 4th century) and P52, a fragment of John from the early 100s AD. Quotations by early church writers alone could reconstruct nearly the whole NT. The textual variants scholars debate (like the longer ending of Mark) are flagged in the footnotes of every study Bible — nothing about the cross or the Sonship of Jesus hinges on them.",
            ),
            sel(
              "Why does a 4th-century complete New Testament matter for this debate?",
              "It predates Islam by ~300 years, so Muslims and Christians read the same New Testament",
              ["It is written in gold ink", "It was found in Mecca", "It is the only copy scholars accept"],
              "Codex Sinaiticus and Vaticanus are dated c. 325–350 AD — Muhammad was born around 570 AD.",
            ),
            assist(
              "The doctrine claiming earlier scriptures were altered is called ___",
              "The Quran urges trust in Torah and Gospel; the conflict is resolved by the claim of ___.",
              "tahrif",
              ["tawhid", "tafsir", "takbir"],
              "Tahrif — 'corruption.' The manuscript record lets us test that claim directly.",
            ),
            sel(
              "About how many Greek New Testament manuscripts do scholars hold today?",
              "Roughly 5,800",
              ["About 12", "About 120", "Exactly 66"],
              "Compare: the average ancient classical work survives in a handful or two of copies.",
            ),
            match("Match the document to its date", [
              ["P52 (fragment of John)", "early 100s AD"],
              ["Codex Sinaiticus", "c. 325–350 AD"],
              ["Birth of Muhammad", "c. 570 AD"],
              ["Dead Sea Scrolls (Isaiah scroll)", "c. 125 BC"],
            ]),
            sel(
              "Do textual variants change the core claims about the cross?",
              "No — variants are minor and transparently documented in footnotes",
              ["Yes — the cross is a later addition", "Yes — half the NT is invented", "No one can know anything"],
              "Variants like Mark 16:9-20 are printed WITH notes in every modern Bible — textual criticism is open science, not secrecy.",
            ),
            typeAns(
              "Which complete 4th-century New Testament codex shares its name with a mountain? (one word)",
              "sinaiticus",
              ["sinaiticus", "codex sinaiticus"],
              "Codex Sinaiticus — discovered at St Catherine's monastery on Mount Sinai.",
            ),
          ],
        },
        {
          title: "The Cross in Question",
          challenges: [
            info(
              "Surah 4:157 — 'they did not kill him'",
              "The Quran states that Jesus was not crucified: 'they did not kill him, nor did they crucify him, but it was made to appear so to them.' Christianity stands or falls on the opposite: 'if Christ has not been raised, your faith is futile' (1 Cor 15:17). So which claim carries the evidence?",
            ),
            info(
              "The historical case for the crucifixion",
              "The crucifixion of Jesus under Pontius Pilate is one of the most secure facts of ancient history: all four Gospels (within living memory), the Roman historian Tacitus (Annals 15.44: 'Christus… suffered the extreme penalty during the reign of Tiberius at the hands of Pontius Pilatus'), the Jewish historian Josephus (Antiquities 18), and unanimous early Christian and even anti-Christian tradition. Bart Ehrman — an agnostic skeptic — calls denying the crucifixion 'ahistorical.'",
            ),
            info(
              "Resurrection: the Christian's positive case",
              "The 'minimal facts' most scholars accept: Jesus died by crucifixion; his tomb was found empty; individuals and groups (including skeptics James and Paul) believed they saw him alive; the church exploded in the very city of the execution. Rival theories (swoon, theft, hallucination, legend) each break on one of these rocks. Islam offers no alternative account — only the bare denial.",
            ),
            sel(
              "Which Roman historian mentions Jesus' execution under Pilate?",
              "Tacitus",
              ["Pliny the Elder", "Livy", "Cicero"],
              "Tacitus, Annals 15.44 (c. 116 AD) — a hostile, non-Christian source confirming the crucifixion.",
            ),
            assist(
              "Paul writes: 'if Christ has not been raised, your ___ is futile'",
              "1 Corinthians 15:17 stakes everything on the resurrection.",
              "faith",
              ["hope", "love", "church"],
              "Christianity is a falsifiable, evidence-based faith — Paul invites the historical check.",
            ),
            match("Match the minimal fact to its source", [
              ["Death by crucifixion", "Gospels + Tacitus + Josephus"],
              ["Empty tomb", "All four Gospels' early tradition"],
              ["Appearances to skeptics", "James and Paul transformed"],
              ["Birth of the church in Jerusalem", "Acts 2, weeks after the execution"],
            ]),
            sel(
              "A historian who denies that Jesus was crucified is…",
              "Rejecting the consensus of believing AND skeptical scholars alike",
              ["Following the majority view", "Simply reading the Quran carefully", "Being maximally cautious"],
              "Even skeptical scholars like Ehrman affirm the crucifixion as bedrock history.",
            ),
            typeAns(
              "Which chapter of the Quran denies the crucifixion? Give the surah number as digits.",
              "4",
              ["4", "4:157", "surah 4"],
              "Surah 4:157 — written six centuries after the event it denies.",
            ),
          ],
        },
        {
          title: "Bridges & Barriers",
          challenges: [
            info(
              "Real common ground",
              "Muslims honour Jesus as Messiah and Word of God, revere the Hebrew prophets, defend monotheism and public morality, fast and pray with a discipline many Christians envy, and share Abraham's story. Conversations can begin anywhere on that bridge — not with a fight.",
            ),
            info(
              "Questions that open doors",
              "'As a Christian I worship ONE God — may I explain how the Trinity is not three gods?' 'What do you love most about the Quran?' 'Since the Quran tells you the Gospel is guidance — may we read one together?' 'If the crucifixion is history, what would that mean?' Hospitality, patience and genuine friendship carry more weight than a hundred arguments.",
            ),
            info(
              "The line we do not cross",
              "Muslims are neighbours to be loved (Luke 10:25-37), not enemies to be won by insult. Mockery of Muhammad or the Quran builds walls the gospel must then climb over. Truth matters — and so does the manner of its delivery (Col 4:5-6).",
            ),
            sel(
              "The best FIRST move in a spiritual conversation with a Muslim friend is usually…",
              "Genuine friendship and honest questions about what they believe",
              ["A lecture on Surah 4:157", "Mocking the Quran", "Avoiding the topic forever"],
              "Ask, listen, love — then answer the questions they actually ask.",
            ),
            sel(
              "Why is 'so you worship three gods?' a misunderstanding of the Trinity?",
              "The Trinity is one Being in three Persons — monotheism is non-negotiable",
              ["Because Christians are unsure", "Because the number changes by tradition", "Because the Trinity means three opinions"],
              "Deut 6:4 and James 2:19 — Christians confess exactly one God; the debate is about His inner life.",
            ),
            assist(
              "Colossians 4:6: 'Let your speech be always gracious, seasoned with ___'",
              "The manner of truth matters as much as the truth.",
              "salt",
              ["fire", "iron", "honey"],
              "Salt makes speech worth tasting — gracious, well-seasoned, never bland or bitter.",
            ),
            match("Match the bridge to the barrier", [
              ["Bridge: Jesus honoured", "Barrier: Jesus denied as divine Son"],
              ["Bridge: one God", "Barrier: Trinity rejected as shirk"],
              ["Bridge: prophets and Abraham", "Barrier: finality of Muhammad"],
            ]),
            typeAns(
              "Which parable answers 'who is my neighbour?' across ethnic and religious lines? (one word)",
              "good samaritan",
              ["good samaritan", "samaritan", "the good samaritan"],
              "The Good Samaritan — the model for Christian love toward Muslims and all neighbours.",
            ),
          ],
        },
      ],
    },
    {
      title: "Other Paths",
      description: "Atheism, Hinduism, Buddhism, New Age — the other major stories on the world stage.",
      emoji: "🛕",
      color: "#9A3412",
      difficulty: 3,
      lessons: [
        {
          title: "Atheism & Secularism",
          challenges: [
            info(
              "The modern skeptic's case",
              "New Atheism (Dawkins, Harris, Hitchens) argued: faith is a delusion; science explains everything worth explaining; religion does more harm than good; evil disproves a good God. Take the strongest version seriously — then test it.",
            ),
            info(
              "Three pressure points",
              "1) A universe from nothing, fine-tuned for life, bursting with information, is not obviously godless — it cries out for explanation. 2) Objective morality ('torturing children for fun is REALLY wrong') makes sense if a moral Lawgiver exists; without one, 'wrong' is just chemistry and preference. 3) Atheism's own story must answer the four questions too: from where? what's wrong? what's the fix? where heading? 'Heat death and no meaning' is honest — and hard to live.",
            ),
            sel(
              "The moral argument presses the question…",
              "If objective moral facts exist, what grounds them beyond human preference?",
              ["Why do churches have rules?", "Can atheists be moral people?", "Is religion old-fashioned?"],
              "Note carefully: the argument is NOT that atheists behave badly — many live admirable lives. It is about what MAKES anything truly right or wrong.",
            ),
            assist(
              "Fine-tuning refers to the universe's physical constants being set within ___ ranges for life",
              "Even Stephen Hawking conceded the universe 'appears remarkably fine-tuned.'",
              "narrow",
              ["random", "wide", "unknown"],
              "Gravity, the cosmological constant and dozens of others sit in razor-thin life-permitting ranges.",
            ),
            match("Match the atheist claim to the Christian response", [
              ["'Faith believes without evidence'", "Biblical faith is trust in public, testable history"],
              ["'Science explains everything'", "Science presupposes a lawlike, knowable order"],
              ["'Religion causes wars'", "Ideologies of every kind do; compare body counts of the 20th century's atheist regimes"],
              ["'Evil disproves God'", "Evil presupposes an absolute standard only God supplies"],
            ]),
            sel(
              "The strongest form of the problem of evil argues…",
              "A good, all-powerful God and the amount of evil we see may be logically or evidentially in tension",
              ["Anything bad that happens is God's fault", "Christians never suffer", "If I were God I would do better"],
              "Take the strong version seriously — then weigh the cross: God did not stand outside suffering but entered it.",
            ),
            typeAns(
              "Which 20th-century atheist regimes does the 'religion causes wars' comparison usually meet? Name either leader (one word).",
              "stalin",
              ["stalin", "mao", "pol pot", "stalin mao", "hitler"],
              "Stalin, Mao and Pol Pot — state atheism with tens of millions dead. The argument cuts both ways.",
            ),
          ],
        },
        {
          title: "Hinduism",
          challenges: [
            info(
              "A river, not a fountain",
              "Hinduism is a family of traditions — Vedas and Upanishads, Brahman the ultimate reality, millions of devas (gods) as its faces, karma and reincarnation (samsara), and moksha (liberation) as the goal. Paths are many: devotion (bhakti), knowledge (jnana), works (karma), meditation (yoga).",
            ),
            info(
              "Where the stories diverge",
              "1) 'All paths lead up the same mountain' assumes the mountain exists and paths are about EFFORT — Christianity claims God climbed DOWN to us in Christ (grace, not karma). 2) Karma explains suffering by deeds in past lives — untestable, and it can corrode compassion ('they deserved it'). The biblical story explains suffering through a fallen world awaiting renewal. 3) You are not a drop returning to an ocean; you are a person God knows by name, made for covenant love.",
            ),
            sel(
              "In Hindu thought, what is karma's relationship to suffering?",
              "Suffering follows deeds across many lifetimes",
              ["Suffering is always random", "Suffering is God's punishment only", "Suffering is an illusion of the body"],
              "Karma is an impersonal moral law — no forgiver, no cross, no rescue from outside.",
            ),
            assist(
              "The Hindu goal of liberation from the cycle of rebirth is ___",
              "Release from samsara into ultimate reality.",
              "moksha",
              ["moksa", "nirvana", "atman", "moksha moksa"],
              "Moksha — while Buddhism's parallel goal, nirvana, means 'blowing out' the self's craving.",
            ),
            match("Match the term to its meaning", [
              ["Brahman", "Ultimate reality"],
              ["Samsara", "Cycle of rebirth"],
              ["Moksha", "Liberation"],
              ["Bhakti", "Devotional path"],
            ]),
            sel(
              "'All religions are different paths up the same mountain' fails because…",
              "The religions contradict each other on God, the problem and the cure",
              ["Mountains do not exist", "Hindus reject all mountains", "It was disproven by geology"],
              "Grace vs karma, personal God vs impersonal absolute, resurrection vs rebirth — these are different mountains, not different paths.",
            ),
            typeAns(
              "What do we call God's rescue that does NOT depend on our accumulated merit? (one word)",
              "grace",
              ["grace"],
              "Grace — the scandal of Christianity, and its glory (Eph 2:8-9).",
            ),
          ],
        },
        {
          title: "Buddhism",
          challenges: [
            info(
              "The Four Noble Truths",
              "1) Life is dukkha (suffering/unsatisfactoriness). 2) The cause is tanha (craving, attachment). 3) The cure is extinguishing craving. 4) The path is the Noble Eightfold Path — right view, intention, speech, action, livelihood, effort, mindfulness, concentration. Siddhartha Gautama (the Buddha, c. 5th century BC) taught a precise psychology of desire.",
            ),
            info(
              "Two stories, two diagnoses",
              "Buddha: suffering comes from craving; cure by detachment until the self's fires go out (nirvana). Jesus: suffering comes from a broken world and broken hearts; cure by attachment to a Person — 'I am the resurrection and the life.' One seeks release from desire; the other redirects desire to its true Home. Buddhism is officially non-theistic; the Bible begins 'In the beginning, God.'",
            ),
            sel(
              "Buddhism's diagnosis of suffering is…",
              "Craving and attachment",
              ["Rebellion against God", "Viral infection", "Class conflict"],
              "Interesting: Christianity also diagnoses disordered desire — but prescribes re-creation, not extinction.",
            ),
            assist(
              "The Buddhist state of release, literally 'blowing out' the fires of craving, is ___",
              "The candle of the self is extinguished.",
              "nirvana",
              ["moksha", "koan", "satori", "nibbana"],
              "Nirvana (Pali: nibbana). Not a place — a release.",
            ),
            match("Match the framework", [
              ["Dukkha", "Life is unsatisfactory"],
              ["Tanha", "Craving causes it"],
              ["Nirvana", "Extinguishing craving"],
              ["Eightfold Path", "The disciplined way there"],
            ]),
            sel(
              "The deepest difference from Christianity is…",
              "Buddhism seeks extinction of craving; Christianity seeks communion with a personal God",
              ["Buddhists meditate more", "Christians have more festivals", "The Buddha was younger than Jesus"],
              "'Our hearts are restless till they rest in Thee' — Augustine answers Buddha with a Person.",
            ),
            typeAns(
              "Which claim of Jesus directly answers death — Buddhism's ultimate problem? (hint: John 11:25, three words)",
              "i am the resurrection",
              ["i am the resurrection", "i am the resurrection and the life", "the resurrection"],
              "'I am the resurrection and the life' — not escape FROM the world, but the world made new.",
            ),
          ],
        },
        {
          title: "New Age & Everything-Mixes",
          challenges: [
            info(
              "The spiritual buffet",
              "New Age spirituality samples from everywhere: 'the universe' as a power, horoscopes, crystals, manifesting, chakras, 'your truth,' karma-lite, angels without commands, energy healing. Its creed: God is within you; you are divine; intention shapes reality; all religions are one.",
            ),
            info(
              "Why it is so sticky",
              "It offers spirituality without discipleship, awe without obedience, and 'your truth' without correction. It is tailor-made for a consumer culture — and it quietly keeps the self on the throne. The biblical counter: you are wonderfully made but not God; the universe is created, not a god; truth is revealed, not personalized (Ex 20:3; Ps 19:1; Jn 14:6).",
            ),
            info(
              "Engaging with warmth",
              "Most New Age seekers are honestly hungry for transcendence — that hunger is a trailhead, not an enemy. Ask what their practice has actually changed in their life; share your own experience of prayer; hold out a God who speaks and loves, not a force to be manipulated.",
            ),
            sel(
              "New Age thought typically holds that…",
              "The divine is a force within you, channelled by practice and intention",
              ["God is a Person who commands", "Truth is fixed and revealed", "Humans are sinners needing rescue"],
              "'You are God' is the oldest promise in the book — Genesis 3:5.",
            ),
            assist(
              "Jesus claimed: 'I am the way, and the truth, and the ___'",
              "John 14:6 — truth with a face, not a frequency.",
              "life",
              ["light", "universe", "energy"],
              "The life — versus 'manifesting' your best existence.",
            ),
            match("Match the New Age idea to the biblical reply", [
              ["'You are divine'", "You are made in God's image — creature, not creator"],
              ["'The universe did it'", "The universe is creation, not deity"],
              ["'Your truth'", "Truth is a Person who addresses you"],
              ["'Manifest your reality'", "Prayer asks a Father; it does not program a force"],
            ]),
            sel(
              "A good opening question for a New Age friend is…",
              "'What has this practice actually changed for you?'",
              ["'Did you know astrology is demonic?'", "'How can you believe that nonsense?'", "'Do you even read the Bible?'"],
              "Respectful curiosity opens doors that contempt welds shut.",
            ),
            typeAns(
              "Which commandment directly forbids harnessing spiritual powers for control? Give its number as a word.",
              "first",
              ["first", "one", "the first", "1st"],
              "'You shall have no other gods before me' — Exodus 20:3.",
            ),
          ],
        },
      ],
    },
    {
      title: "Making the Case in Love",
      description: "Assemble the full arsenal — then deliver it the way Jesus would.",
      emoji: "🛡️",
      color: "#B45309",
      difficulty: 3,
      lessons: [
        {
          title: "The Arguments Arsenal",
          challenges: [
            info(
              "Four arguments every Christian should own",
              "1) COSMOLOGICAL — everything that begins to exist has a cause; the universe began (Big Bang, thermodynamics); therefore a transcendent Creator. 2) TELEOLOGICAL — the universe's fine-tuning, DNA's information and life's intelligibility point to mind, not accident. 3) MORAL — objective moral duty requires a transcendent Lawgiver. 4) HISTORICAL — the resurrection is the best explanation of the empty tomb, the appearances and the church's birth.",
            ),
            sel(
              "The cosmological argument concludes that…",
              "The universe has a transcendent cause",
              ["Everything is an illusion", "The universe is eternal and uncaused", "Matter created itself from nothing"],
              "Whatever begins to exist has a cause — and the evidence says the universe began.",
            ),
            assist(
              "The teleological argument reasons from ___ to a Designer",
              "Fine-tuning, information and order.",
              "design",
              ["chaos", "silence", "nothing"],
              "Teleology = purpose. The watch still asks for a Watchmaker.",
            ),
            match("Match the argument to its key premise", [
              ["Cosmological", "Whatever begins has a cause"],
              ["Teleological", "Fine-tuning and information imply mind"],
              ["Moral", "Objective duty implies a Lawgiver"],
              ["Resurrection", "Empty tomb + appearances + birth of the church"],
            ]),
            typeAns(
              "Which argument rests on historical evidence rather than philosophy? (one word)",
              "resurrection",
              ["resurrection", "the resurrection"],
              "The resurrection is a claim about dated, public, investigate-able events.",
            ),
            sel(
              "Why do these arguments matter even though faith is relational?",
              "They clear the road so the heart can travel it honestly",
              ["They force everyone to agree", "They replace the work of the Spirit", "They win arguments on the internet"],
              "Apologetics removes boulders; love and God's Spirit do the heart surgery (1 Pet 3:15; 2 Cor 10:4-5).",
            ),
          ],
        },
        {
          title: "Toughest Objections",
          challenges: [
            info(
              "'Why does God allow suffering?'",
              "The classical shape of the answer: free will makes real love possible; a world with genuine choice can be misused; God has not stood aloof — He entered the worst of it on the cross; and He has promised a judgment and renewal where every tear is answered (Rev 21:4). Honest believers admit mystery remains — grief is not a debate to be won but a person to be held (Ps 34:18).",
            ),
            info(
              "'The church is full of hypocrites'",
              "True — and Jesus reserved his sharpest words for religious performers (Matt 23). A counterfeit only makes sense against a real standard; hypocrisy proves the standard, not the fraud. The reply is not perfection but honesty about the rescue in progress (1 Tim 1:15).",
            ),
            info(
              "'Science has replaced God' and 'all religions are the same'",
              "Science asks HOW; it cannot answer WHY or WHO — method limits, not discoveries. Christians founded modern science on the conviction that a rational Lawgiver made a lawlike world (Kepler: 'thinking God's thoughts after Him'). And religions contradict each other on the four questions — agreeing only that questions exist. Same-mountain slogans flatten what each faith actually claims.",
            ),
            assist(
              "Revelation 21:4 promises God will wipe away every ___ from our eyes",
              "The answer to suffering is a Person and a renewal — not a slogan.",
              "tear",
              ["memory", "doubt", "shadow"],
              "'He will wipe away every tear' — the cross and the new creation, together.",
            ),
            sel(
              "The free-will defence argues that genuine love requires…",
              "Real choice, with the possibility of real misuse",
              ["Divine puppet strings", "The removal of all pain", "Many lifetimes to practise"],
              "A world without any possibility of evil is a world without love, sacrifice or courage.",
            ),
            match("Match the objection to a seed of reply", [
              ["'Why suffering?'", "Free will + the cross + coming renewal"],
              ["'Hypocrites!'", "Jesus' harshest words were for them too"],
              ["'Science replaced God'", "Science needs a lawlike, knowable order"],
              ["'All religions are one'", "They contradict on the four questions"],
            ]),
            typeAns(
              "Give Kepler's famous phrase for doing science: 'thinking God's ___ after Him' (one word)",
              "thoughts",
              ["thoughts"],
              "'Thinking God's thoughts after Him' — faith fuelled physics, not fought it.",
            ),
          ],
        },
        {
          title: "Gentle & Reverent",
          challenges: [
            info(
              "1 Peter 3:15-16 — the master class",
              "'In your hearts honour Christ the Lord as holy, always being prepared to make a defence to anyone who asks you for a reason for the hope that is in you; yet do it with GENTLENESS and RESPECT.' Three marks: holiness first, readiness always, gentleness always. Argument without Christlikeness is noise.",
            ),
            info(
              "The skill of asking",
              "Great ambassadors ask before they answer: 'What led you to that view?' 'What would change your mind?' 'What has been your experience of church?' Questions honour people, expose the real obstacle, and often do more than answers. Then: answer THE question asked, admit uncertainty honestly, and never try to do the Holy Spirit's job.",
            ),
            info(
              "Your story is evidence too",
              "Arguments show Christianity is TRUE; your story shows it is ALIVE. Paul's pattern (Acts 22, 26): here is my life before, here is what Christ did, here is my life now. Keep it short, honest, and about Jesus — not about your eloquence. Combine a warm story with a solid case and you are dangerous — in the best way.",
            ),
            sel(
              "1 Peter 3:15 requires answers to be given with…",
              "Gentleness and respect",
              ["Ruthless efficiency", "Volume and certainty", "Reluctance and sighing"],
              "Gentleness and respect — the manner is part of the message.",
            ),
            arrange(
              "Order Paul's testimony pattern (Acts 22 & 26)",
              "Life before Christ What Christ did Life now",
              ["Life before Christ", "What Christ did", "Life now"],
              [],
              "Before → encounter → after. The simplest, strongest structure for sharing your story.",
            ),
            match("Match the practice to its purpose", [
              ["Ask questions first", "Find the real obstacle"],
              ["Admit uncertainty", "Build credibility"],
              ["Keep your story short", "Keep Jesus the focus"],
              ["Pray for the person", "God changes hearts — we don't"],
            ]),
            assist(
              "Colossians 4:5: 'Walk in wisdom toward outsiders, making the best use of the ___'",
              "Time is short; love well.",
              "time",
              ["money", "words", "platform"],
              "Redeem the time — evangelism is a long walk with a friend, not a drive-by.",
            ),
            typeAns(
              "Complete the charge: 'always being prepared to make a ___ to anyone who asks…' (one word, ESV)",
              "defence",
              ["defence", "defense", "a defence"],
              "'Make a defence' — Greek: apologia. Apologetics is obedience, not a hobby.",
            ),
          ],
        },
      ],
    },
  ],
}
