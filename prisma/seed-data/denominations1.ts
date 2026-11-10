import type { SeedCourse } from "./helpers"
import { info, sel, assist, match, arrange, typeAns } from "./helpers"

// ── Popular denominations, part 1 ─────────────────────────────
// Ordered roughly by global adherent count (the most popular first):
// Catholic (~1.3B) · Orthodox (~220M) · Pentecostal (~280M) · Baptist (~100M)

export const catholicCourse: SeedCourse = {
  code: "denom-catholic",
  title: "Catholic",
  subtitle: "The 2,000-year-old global church",
  description: "Meet the world's largest Christian body: its creed, its papacy, its Mass and sacraments, Mary and the saints — taught fairly, from the Catechism and Scripture.",
  emoji: "⛪",
  color: "#B08D2E",
  order: 12,
  units: [
    {
      title: "Roots of the Rock",
      description: "The marks of the Church, the papacy, and the Catholic Bible — where it all comes from.",
      emoji: "🪨",
      color: "#B08D2E",
      difficulty: 1,
      lessons: [
        {
          title: "One, Holy, Catholic, Apostolic",
          challenges: [
            info(
              "The four marks",
              "The Nicene Creed, as completed at Constantinople (AD 381), confesses a church that is ONE (united), HOLY (set apart for God), CATHOLIC (Greek katholou, 'universal — for everyone'), and APOSTOLIC (built on the teaching of the apostles). These 'four marks' have summarized Catholic self-understanding for some 1,600 years.",
            ),
            sel(
              "Which of these is NOT one of the four marks of the Church from the Nicene Creed?",
              "Infallible",
              ["One", "Holy", "Apostolic"],
              "The creed says one, holy, catholic and apostolic. 'Infallibility' is a later, narrower doctrine about the papacy — not one of the four marks.",
            ),
            assist(
              "Fill in the Creed: 'I believe in one, holy, catholic and ______ Church'",
              "I believe in one, holy, catholic and ___ Church",
              "apostolic",
              ["eternal", "Roman", "perfect"],
              "Apostolic — the Church stands in continuity with the apostles through succession of bishops and unbroken teaching.",
            ),
            match(
              "Match each mark to its meaning",
              [
                ["One", "Unity under one Lord and one baptism"],
                ["Holy", "Set apart by God's Spirit, despite imperfect members"],
                ["Catholic", "Universal — the faith for every nation"],
                ["Apostolic", "Rooted in the apostles' teaching"],
              ],
            ),
            info(
              "Apostolic succession",
              "Catholic bishops are ordained in a line they trace back to the apostles — laying hands from generation to generation (2 Timothy 1:6). This living chain is why Catholics say the Church's authority is 'apostolic': not a new invention each century, but a passed-down ministry.",
            ),
          ],
        },
        {
          title: "Peter & the Papacy",
          challenges: [
            info(
              "'You are Peter'",
              "In Matthew 16:18 Jesus says: 'You are Peter (Petros, rock), and on this rock I will build my Church… I will give you the keys of the kingdom.' Catholics read this as Jesus founding a visible Church with Peter as chief shepherd — the first bishop of Rome, the pope.",
              "Petros = rock",
            ),
            sel(
              "The pope, in Catholic teaching, is primarily…",
              "The bishop of Rome, successor of Peter",
              ["An inspired prophet who writes new Scripture", "A king ruling all nations", "The only person who can hear confessions"],
              "The pope is first a bishop — of Rome. His papal role grows out of that local see's link to Peter and Paul, both martyred there.",
            ),
            assist(
              "Complete Matthew 16:18: 'You are Peter, and on this rock I will build my ______'",
              "'You are Peter, and on this rock I will build my ___'",
              "church",
              ["temple", "synagogue", "kingdom"],
              "Church (ekklēsia, 'assembly'). The Greek word appears for the first time in the Gospels right here.",
              "ekklēsia = assembly",
            ),
            match(
              "Match the Catholic structure term",
              [
                ["Pope", "Bishop of Rome, Peter's successor"],
                ["Diocese", "A regional church under a bishop"],
                ["Parish", "A local community under a priest"],
                ["Magisterium", "The Church's teaching office"],
              ],
            ),
            sel(
              "Papal infallibility (defined at Vatican I, 1870) applies…",
              "Only when the pope solemnly defines a doctrine on faith or morals for the whole Church",
              ["To everything a pope says in private conversation", "To papal opinions about science or politics", "To every homily a pope preaches"],
              "It's far narrower than popular imagination: formally defined, ex cathedra teachings on faith and morals. It has been used explicitly only once alone — the Assumption of Mary (1950).",
            ),
          ],
        },
        {
          title: "The Bible of 73 Books",
          challenges: [
            info(
              "How the canon grew",
              "The Church used Scripture long before the list was fixed. Synods at Hippo (393) and Carthage (397) listed the 46-book Old Testament (including the deuterocanon) and 27-book New Testament — the 73-book Catholic Bible. The Reformers later kept the shorter Hebrew canon, which is why Catholic and Protestant Bibles differ in length.",
            ),
            sel(
              "The 'deuterocanon' is…",
              "A second layer of Old Testament books like Tobit, Wisdom and 1–2 Maccabees",
              ["A second New Testament", "Another name for the four Gospels", "A collection of papal letters"],
              "Deuterocanon = 'second canon.' Jerome hesitated about these books, but the undivided Church read them; Catholics still print them in the Old Testament.",
            ),
            info(
              "Reading along in this app",
              "The built-in reader in this app uses the King James Version with the 66-book Protestant canon. To read the full 73-book Catholic canon, open a Catholic edition such as the NABRE or RSV-CE — every lesson here tells you exactly which book and chapter to visit.",
            ),
            match(
              "Match the book to its group",
              [
                ["Tobit", "Deuterocanon (Catholic Old Testament)"],
                ["Romans", "New Testament epistle"],
                ["Exodus", "Torah — the Law"],
                ["Psalms", "Wisdom & poetry"],
              ],
            ),
            assist(
              "Fill in 2 Timothy 3:16: 'All ______ is inspired by God and profitable for teaching.'",
              "'All ___ is inspired by God and profitable for teaching'",
              "scripture",
              ["tradition", "council", "opinion"],
              "Scripture (graphē). Catholics agree Scripture is God-breathed — their distinctive claim adds Tradition and Magisterium as the lens through which it is interpreted.",
            ),
            arrange(
              "Build the Catholic triple-tower of authority",
              "Scripture Tradition Magisterium",
              ["Scripture", "Tradition", "Magisterium"],
              ["Scientists", "Emperors"],
              "Catholics hold that God's word flows through inspired Scripture, the Church's living Tradition, and the Magisterium that guards both — three streams from one Source.",
            ),
          ],
        },
      ],
    },
    {
      title: "Mass, Saints & Sacraments",
      description: "Step inside the Mass, meet the seven sacraments, and learn why Mary and the saints matter so much.",
      emoji: "🕯️",
      color: "#9A7B23",
      difficulty: 2,
      lessons: [
        {
          title: "Inside the Mass",
          challenges: [
            info(
              "Two great halves",
              "Every Mass has two main parts: the LITURGY OF THE WORD (Scripture readings, psalm, Gospel, homily) and the LITURGY OF THE EUCHARIST (offertory, consecration, communion). The pattern goes back to the synagogue service joined to the Lord's Supper — word and table.",
            ),
            sel(
              "Which reading set is always at the heart of the Liturgy of the Word?",
              "A passage from one of the four Gospels",
              ["The papal Twitter feed", "A random bishop's favorite book", "The parish newsletter"],
              "The Gospel reading stands at the climax of the Word portion — often accompanied by standing, an acclamation ('Alleluia'), and a procession with candles.",
            ),
            arrange(
              "Order the two halves of the Mass",
              "Liturgy of the Word Liturgy of the Eucharist",
              ["Liturgy of the Word", "Liturgy of the Eucharist"],
              ["Coffee hour", "Vespers"],
              "First God speaks (Word), then God feeds (Eucharist). The whole shape is a conversation: call, response, table, sending.",
            ),
            sel(
              "What do Catholics believe happens at the consecration of the bread and wine?",
              "The substances become the body and blood of Christ — transubstantiation",
              ["The bread is a mere symbol of Jesus' teaching", "The bread is merely blessed — nothing changes in it", "Nothing particular happens until people feel it"],
              "Transubstantiation (defined at Lateran IV, 1215): the substance changes while the appearance (accidents) of bread remains. Echoes of John 6:51 — 'the bread that I will give is my flesh.'",
            ),
          ],
        },
        {
          title: "The Seven Sacraments",
          challenges: [
            info(
              "Outward signs, inward grace",
              "A sacrament is an outward sign instituted by Christ that gives grace. Catholics count seven: Baptism, Confirmation, Eucharist, Penance (Reconciliation), Anointing of the Sick, Holy Orders, and Matrimony. Three are 'sacraments of initiation' (Baptism, Confirmation, Eucharist).",
            ),
            match(
              "Match the sacrament to its life moment",
              [
                ["Baptism", "Entry into the Church — often as an infant"],
                ["Confirmation", "Sealing of the Spirit in youth"],
                ["Anointing of the Sick", "Strength in illness or before death"],
                ["Matrimony", "Covenant of husband and wife"],
              ],
            ),
            assist(
              "Complete John 3:5: 'Unless one is born of water and the ______, he cannot enter the kingdom of God.'",
              "'born of water and the ___…'",
              "Spirit",
              ["Wind", "Law", "Sabbath"],
              "Water and Spirit — the classic Catholic anchor text for baptism's necessity (with Titus 3:5, 'washing of regeneration').",
            ),
            sel(
              "Which three are the 'sacraments of initiation'?",
              "Baptism, Confirmation, Eucharist",
              ["Matrimony, Orders, Penance", "Penance, Anointing, Eucharist", "Baptism, Orders, Anointing"],
              "Initiation: you are born (Baptism), strengthened (Confirmation), and fed (Eucharist). The other sacraments accompany the ongoing journey.",
            ),
            typeAns(
              "Recall the term: the sacrament of forgiveness, also called Reconciliation or Confession",
              "P______",
              ["penance", "confession", "reconciliation"],
              "Penance — rooted in John 20:23: 'If you forgive the sins of any, they are forgiven.' A priest acts in persona Christi to pronounce absolution.",
            ),
          ],
        },
        {
          title: "Mary, Saints & the Rosary",
          challenges: [
            info(
              "Honor, not worship",
              "Catholics distinguish latria (worship — for God alone) from dulia (honor — for saints) and hyperdulia (highest honor — for Mary). Praying 'to' a saint means asking them to pray FOR you, like asking a friend — not worshipping them. The anchor: Revelation 5:8, where the elders in heaven offer the prayers of the saints.",
            ),
            sel(
              "The Immaculate Conception (dogma, 1854) refers to…",
              "Mary being conceived without original sin",
              ["Jesus' virgin birth", "Mary's bodily rising into heaven", "The Holy Spirit conceiving the Church"],
              "It's about MARY's conception (by her parents), preserved from original sin in view of Christ's saving work. The Assumption (1950) — Mary taken body and soul into heaven — is the other Marian dogma.",
            ),
            match(
              "Match the rosary mystery sets to their theme",
              [
                ["Joyful", "Annunciation to the boy Jesus"],
                ["Luminous", "Jesus' public ministry"],
                ["Sorrowful", "Passion and death"],
                ["Glorious", "Resurrection to the crown"],
              ],
            ),
            assist(
              "Complete Luke 1:42 (part of the Hail Mary): 'Blessed are you among women, and blessed is the fruit of your ______.'",
              "'blessed is the fruit of your ___'",
              "womb",
              ["words", "work", "way"],
              "Elizabeth's Spirit-filled greeting to Mary (Luke 1:42) became the second half of the Hail Mary — Scripture woven into prayer.",
            ),
            info(
              "The rosary in one line",
              "A rosary beads together 20 mysteries (by 2002's Luminous addition) across 4 sets, each mystery paired with an Our Father, ten Hail Marys, and a Glory Be. St John Paul II called it 'a compendium of the Gospel' — walking the whole story of Christ through Mary's eyes.",
            ),
          ],
        },
      ],
    },
  ],
}

export const orthodoxCourse: SeedCourse = {
  code: "denom-orthodox",
  title: "Eastern Orthodox",
  subtitle: "The ancient church of the East",
  description: "Icons, theosis, the Divine Liturgy and the Great Schism — discover the tradition that traces its faith unbroken to the church of Pentecost.",
  emoji: "☦️",
  color: "#7C3AED",
  order: 13,
  units: [
    {
      title: "The Original Christianity",
      description: "From Pentecost to the seven councils, icons, and the great 1054 split.",
      emoji: "🏛️",
      color: "#7C3AED",
      difficulty: 1,
      lessons: [
        {
          title: "Unbroken from Pentecost",
          challenges: [
            info(
              "'The Church of the apostles'",
              "Orthodox Christians claim continuity with the church born at Pentecost (Acts 2): same faith, same sacraments, same episcopal succession. The great sees — Jerusalem, Antioch, Alexandria, Constantinople, Rome — each carry apostolic roots. Orthodoxy spreads through self-governing (autocephalous) national churches: Greek, Russian, Serbian, Romanian, and more.",
            ),
            sel(
              "The Orthodox Church is governed…",
              "By a family of self-governing (autocephalous) churches in communion",
              ["By one pope in Rome", "By the United Nations", "By the Archbishop of Canterbury"],
              "There is no Orthodox 'pope.' The Ecumenical Patriarch of Constantinople is 'first among equals' — honored, but not commanding. Councils, not a single monarch, hold the family together.",
            ),
            match(
              "Match the ancient see to its apostle",
              [
                ["Jerusalem", "James — the Lord's brother led it"],
                ["Antioch", "Disciples were first called Christians here (Acts 11:26); Peter and Paul both ministered there"],
                ["Alexandria", "Mark the Evangelist founded it"],
                ["Constantinople", "Andrew, brother of Peter, is patron"],
              ],
            ),
            sel(
              "How many ecumenical (worldwide) councils does Orthodoxy recognize as authoritative?",
              "Seven",
              ["One — the Bible only", "Twenty-One, like Rome", "None — councils are optional"],
              "Nicaea I (325) through Nicaea II (787). The Seven Ecumenical Councils defined the Trinity, Christ's two natures, and the legitimacy of icons.",
            ),
          ],
        },
        {
          title: "Icons & Nicaea II",
          challenges: [
            info(
              "Theology you can see",
              "An icon is not a portrait — it's 'theology in color': flat on purpose, reversed perspective (the lines converge on YOU), gold sky (heaven's light). The Seventh Ecumenical Council (Nicaea II, 787) ruled that because the Word became visible flesh (John 1:14), depicting Him is legitimate — and venerating the image passes to its prototype.",
            ),
            sel(
              "Why did Nicaea II (787) defend icons against the iconoclasts?",
              "Because the Incarnation — God becoming visible in Christ — makes depicting Him legitimate",
              ["Because artists needed employment", "Because icons are God Himself", "Because the emperor demanded it"],
              "Iconoclasts ('icon-smashers') said images violated the 2nd commandment. John of Damascus answered: the commandment forbade depicting an INVISIBLE God — but God made Himself visible in Jesus.",
            ),
            assist(
              "Fill in John 1:14: 'And the Word became ______ and dwelt among us.'",
              "'The Word became ___ and dwelt among us'",
              "flesh",
              ["light", "law", "fire"],
              "Flesh — visible, touchable, paintable. This one verse carried the whole icon defense for John of Damascus.",
            ),
            sel(
              "The iconostasis is…",
              "The icon-covered screen separating nave from sanctuary",
              ["A book of hymns", "The priest's embroidered robe", "A bell tower"],
              "A wall of icons (Christ, Theotokos, John the Baptist, feasts) marks the threshold between earth and heaven — pierced by the 'royal doors' through which the gifts come out.",
            ),
            info(
              "Veneration vs worship",
              "Orthodox make a sharp distinction: latreia (worship) belongs to God alone; proskynēsis (veneration — kiss, bow, incense) belongs to icons and saints. The honor shown the image 'passes to the prototype' — kiss an icon of Christ, and the kiss reaches Christ Himself.",
            ),
          ],
        },
        {
          title: "The Great Schism",
          challenges: [
            info(
              "1054: the parting of ways",
              "Rome and Constantinople drifted for centuries over language (Latin vs Greek), authority (papal supremacy vs conciliar collegiality) and one small Latin word: filioque — 'and the Son,' added to the Creed's 'Spirit proceeds from the Father.' In 1054 mutual excommunications sealed the split. They were lifted in 1965, but East and West remain divided.",
            ),
            sel(
              "The word 'filioque,' a flashpoint of the Schism, means…",
              "'and the Son' — added to the procession of the Holy Spirit",
              ["'and the saints' — added to the communion", "'of the pope' — a title of authority", "'one God' — a creed summary"],
              "Rome added 'the Spirit proceeds from the Father AND THE SON' (filioque) to the Creed. The East called it both theologically wrong and illegitimate to change a creed unilaterally.",
            ),
            arrange(
              "Build the creed phrase the East defends",
              "proceeds from the Father",
              ["proceeds", "from", "the", "Father"],
              ["and the Son", "alone"],
              "John 15:26: 'the Spirit of truth who PROCEEDS FROM THE FATHER.' The East keeps the Creed exactly as Nicaea-Constantinople (381) wrote it.",
            ),
            sel(
              "Orthodoxy's main authority principle, contrasted with Rome's papal monarchy, is…",
              "Conciliar — the whole family of churches deciding together",
              ["Every believer decides alone", "The emperor decides", "A prophet decides"],
              "Orthodoxy holds to collegiality: patriarchs, synods, and councils decide together, as at the apostolic council of Jerusalem: 'It seemed good to the Holy Spirit and to us' (Acts 15:28). No single bishop can bind the whole Church.",
            ),
            typeAns(
              "In what year did the Great Schism between East and West take place?",
              "1___",
              ["1054"],
              "1054 — Cardinal Humbert laid a bull of excommunication on Hagia Sophia's altar; Patriarch Michael Cerularius responded in kind. The wounds of 1054 still shape the map of Christendom.",
            ),
          ],
        },
      ],
    },
    {
      title: "Worship & Theosis",
      description: "The Divine Liturgy, the goal of becoming 'partakers of the divine nature,' and Orthodox daily practice.",
      emoji: "🕯️",
      color: "#6D28D9",
      difficulty: 2,
      lessons: [
        {
          title: "The Divine Liturgy",
          challenges: [
            info(
              "Heaven on earth",
              "The main Orthodox service is the Divine Liturgy, most often the Liturgy of St John Chrysostom (4th c.). Almost everything is sung; the congregation stands for hours; incense floods the senses. The liturgy enacts the Kingdom: 'We have seen the true light, we have received the heavenly Spirit.'",
            ),
            sel(
              "In Orthodox worship, the Eucharistic bread is…",
              "Leavened (risen) bread, and infants receive communion",
              ["Always unleavened matzo", "Replaced by rice cakes", "Reserved for priests only"],
              "Leavened bread — the East sees leaven as life in the risen Body. And since baptism includes chrismation (confirmation) and communion, even babies receive from the chalice.",
            ),
            match(
              "Match the Orthodox worship element",
              [
                ["Divine Liturgy", "The main Sunday Eucharist"],
                ["Chrismation", "Anointing with oil right after baptism"],
                ["Trisagion", "'Holy God, Holy Mighty, Holy Immortal…'"],
                ["Pascha", "Easter — 'the feast of feasts'"],
              ],
            ),
            sel(
              "Orthodox priests may marry — but bishops must be…",
              "Monks (celibate), usually chosen from monasteries",
              ["Married with 5 children", "Elected by the government", "Under 30 years old"],
              "A married man can be ordained a priest (before ordination), but a bishop is drawn from the celibate monastic ranks — 'the parish and the monastery' system.",
            ),
          ],
        },
        {
          title: "Theosis — Becoming Partakers",
          challenges: [
            info(
              "The goal: theosis",
              "Theosis ('deification') is Orthodoxy's breathtaking goal: real union with God's energies — not becoming God's essence, but being filled with His life. Anchor: 2 Peter 1:4 — 'partakers of the divine nature.' Athanasius' famous line: 'God became man so that man might become god.'",
            ),
            assist(
              "Complete 2 Peter 1:4: '…that you may become partakers of the ______ nature.'",
              "'partakers of the ___ nature'",
              "divine",
              ["human", "fallen", "angelic"],
              "Divine nature — theosis' charter verse. Salvation is not only pardon; it is participation.",
            ),
            sel(
              "In Orthodox theology, theosis means…",
              "Being united to God's energies and transformed by grace",
              ["Becoming an equal member of the Trinity", "Escaping the body for pure spirit", "Mastering divine magic"],
              "The distinction is crucial: God's ESSENCE remains beyond us; His ENERGIES (uncreated grace, 'light' of Tabor) genuinely fill and transform us.",
            ),
            match(
              "Match the Orthodox salvation vocabulary",
              [
                ["Theosis", "Union with God's life"],
                ["Synergy", "Grace plus free human cooperation"],
                ["Theotokos", "Mary, 'God-bearer'"],
                ["Nous", "The heart's eye of the soul"],
              ],
            ),
            info(
              "Why no 'penal' focus?",
              "Western atonement talk often centers on legal guilt satisfied. Orthodoxy frames salvation as HEALING: Christ the Physician cures death and corruption by entering them. Hence Easter night's shout: 'Christ is risen! Death by death has been trampled down!'",
            ),
          ],
        },
        {
          title: "Living Orthodoxy",
          challenges: [
            info(
              "The Jesus Prayer",
              "'Lord Jesus Christ, Son of God, have mercy on me, a sinner' — repeated with the breath, often with a prayer rope (komboskini) of 100 knots. This 'prayer of the heart' comes from the Desert Fathers and the Philokalia, aiming to 'pray without ceasing' (1 Thess 5:17).",
              "Komboskini = prayer rope",
            ),
            sel(
              "Orthodox fasting practice is famously…",
              "Extensive: many weeks of vegan fasting through the year",
              ["Nonexistent", "Eating only meat during Lent", "Fasting exactly one hour per week"],
              "Four major fasts (Nativity, Lent, Apostles', Dormition) plus Wednesdays and Fridays — no meat, dairy, eggs, often no oil or wine. Fasting is training, not punishment.",
            ),
            assist(
              "Complete 1 Thessalonians 5:17: '______ without ceasing.'",
              "'___ without ceasing'",
              "Pray",
              ["Work", "Sing", "Read"],
              "Pray — the verse behind the Jesus Prayer's whole way of life: turning breath itself into prayer.",
            ),
            sel(
              "The greatest feast of the Orthodox year is…",
              "Pascha (Easter) — midnight resurrection liturgy",
              ["Christmas", "The emperor's birthday", "Harvest festival"],
              "Pascha ('Passover') is 'the feast of feasts.' At midnight churches process around the building and proclaim: 'Christ is risen from the dead, trampling down death by death!'",
            ),
            typeAns(
              "What title does Orthodoxy give Mary that means 'God-bearer'?",
              "T________",
              ["theotokos", "theotocos"],
              "Theotokos — defined at Ephesus (431) to affirm that Mary bore the one person who is truly God the Son, countering those who preferred 'Christ-bearer' (Christotokos) and separated the human Jesus from the divine Word.",
            ),
          ],
        },
      ],
    },
  ],
}

export const pentecostalCourse: SeedCourse = {
  code: "denom-pentecostal",
  title: "Pentecostal",
  subtitle: "Spirit-filled, fire-tested, worldwide",
  description: "From Azusa Street to 600 million Spirit-filled believers: tongues, healing, prophecy and the fastest-growing movement in Christian history.",
  emoji: "🔥",
  color: "#DC2626",
  order: 14,
  units: [
    {
      title: "Fire on the Earth",
      description: "Azusa Street, baptism in the Spirit, and the gifts that fuel the movement.",
      emoji: "🔥",
      color: "#DC2626",
      difficulty: 1,
      lessons: [
        {
          title: "Topeka & Azusa Street",
          challenges: [
            info(
              "A revival with an address",
              "1901: Charles Parham's Bible school in Topeka, Kansas links 'speaking in tongues' to Spirit baptism. 1906: William J. Seymour, a one-eyed Black son of ex-slaves, preaches at 312 Azusa Street, Los Angeles. For three years, races worship together, tongues and healings break out, and reporters mock what they can't explain. Pentecostalism is born.",
            ),
            sel(
              "Why is Azusa Street (1906) so significant?",
              "It launched the modern Pentecostal movement — multiracial, global, Spirit-emphasized",
              ["It was the first church building ever built", "It printed the first Bible", "It is where Constantine converted"],
              "Azusa's Apostolic Faith Mission sent missionaries literally around the globe within two years. Its multiracial worship — 'the color line was washed away in the blood' — was radical for 1906 America.",
            ),
            assist(
              "Complete Acts 1:8: 'You shall receive ______ when the Holy Spirit has come upon you, and you shall be my witnesses.'",
              "'receive ___ when the Holy Spirit has come upon you'",
              "power",
              ["money", "peace", "rest"],
              "Power (dynamis) — the engine verse of Pentecostalism: the Spirit doesn't just comfort; He empowers witness.",
            ),
            match(
              "Match the pioneer to their contribution",
              [
                ["Charles Parham", "Taught tongues as evidence at Topeka, 1901"],
                ["William Seymour", "Led the Azusa Street revival, 1906"],
                ["Aimee Semple McPherson", "Built the Foursquare Church, media pioneer"],
                ["David du Plessis", "Carried Pentecost into mainline churches"],
              ],
            ),
          ],
        },
        {
          title: "Baptism in the Spirit",
          challenges: [
            info(
              "A distinct experience",
              "Classical Pentecostals teach that BAPTISM IN THE HOLY SPIRIT is a distinct experience subsequent to conversion (new birth) — a later, dramatic filling for power. The 'initial physical evidence' is speaking in tongues (Acts 2:4; 10:46; 19:6). Not a second way of being saved — empowerment for mission.",
            ),
            assist(
              "Complete Acts 2:4: 'And they were all filled with the Holy Spirit and began to speak in other ______, as the Spirit gave them utterance.'",
              "'began to speak in other ___…'",
              "tongues",
              ["places", "parables", "psalms"],
              "Tongues (glōssai — languages). Pentecost reversal of Babel: one gospel, every tongue.",
            ),
            sel(
              "In classic Pentecostal doctrine, 'initial physical evidence' of Spirit baptism is…",
              "Speaking in tongues",
              ["Falling backward", "Weeping for 40 days", "Speaking Latin"],
              "Derived from the pattern in Acts (2:4, 10:46, 19:6) where tongues accompany the filling. Some Pentecostal groups soften this; classic denominations (Assemblies of God) hold it firmly.",
            ),
            sel(
              "How do most Pentecostals relate Spirit baptism to salvation?",
              "As a second experience, available after conversion",
              ["Identical to salvation", "Only for apostles", "A Catholic sacrament"],
              "The 'second work' framework: John 20:22 (receive the Spirit) then Acts 1:8, 2:4 (be clothed with power) — same people, two moments.",
            ),
            arrange(
              "Build the engine verse",
              "you shall be my witnesses",
              ["you", "shall", "be", "my", "witnesses"],
              ["silent", "always", "never"],
              "Acts 1:8 — Spirit baptism is purpose-built for WITNESS: Jerusalem, Judea, Samaria, ends of the earth.",
            ),
          ],
        },
        {
          title: "Gifts of the Spirit",
          challenges: [
            info(
              "Nine gifts, one Spirit",
              "1 Corinthians 12:7–11 lists nine manifestations: wisdom, knowledge, faith, healing, miracles, prophecy, discernment of spirits, tongues, interpretation. Pentecostals hold these are FOR TODAY — not retired with the apostles — and should be tested (1 Thess 5:20–21) and ordered (1 Cor 14:40).",
            ),
            assist(
              "Complete 1 Corinthians 12:7: 'To each is given the manifestation of the Spirit for the ______.'",
              "'for the ___'",
              "common good",
              ["few", "elite", "show"],
              "Common good — gifts are not trophies but tools for building up the body. Paul's ordering rules in ch. 14 exist to protect exactly this.",
            ),
            sel(
              "What does Paul command about prophecy in the assembly?",
              "Test everything; weigh what is said — don't forbid it",
              ["Never allow prophecy at all", "Believe every prophetic word instantly", "Prophecy replaces Scripture"],
              "1 Thess 5:19–21: 'Do not quench the Spirit… test everything; hold fast what is good.' Pentecostals balance openness with discernment.",
            ),
            match(
              "Match the gift to its description",
              [
                ["Tongues", "Spirit-given speech in a language unknown to the speaker"],
                ["Interpretation", "Making the tongue's content understood"],
                ["Discernment", "Distinguishing spirits — true or false"],
                ["Healing", "Restoration of the sick by prayer"],
              ],
            ),
            sel(
              "Where do Pentecostals stand on 'cessationism' (gifts stopped with the apostles)?",
              "They reject it — gifts continue until Christ returns",
              ["They fully agree with it", "They only accept wisdom", "They leave it to philosophers"],
              "Acts 2:17 — 'in the last days I will pour out my Spirit on ALL flesh.' Pentecostals read the gift-promise as spanning the whole church age.",
            ),
          ],
        },
      ],
    },
    {
      title: "The Spirit-Filled Life",
      description: "Healing, worship, global growth and the distinctives that mark Pentecostal churches.",
      emoji: "🌍",
      color: "#B91C1C",
      difficulty: 2,
      lessons: [
        {
          title: "Healing & Worship",
          challenges: [
            info(
              "Divine healing in the atonement",
              "Pentecostals hold healing is 'provided for in the atonement' (Isaiah 53:4–5) and practice James 5:14–15 — elders anoint with oil, pray the prayer of faith. Not a guarantee against suffering, but a standing expectation that God still heals. Healing evangelism (Oral Roberts, Smith Wigglesworth) shaped the movement's global face.",
            ),
            assist(
              "Complete James 5:14: 'Is anyone among you sick? Let him call for the ______ of the church.'",
              "'call for the ___ of the church'",
              "elders",
              ["doctors", "deacons", "musicians"],
              "Elders — healing is communal: anointing with oil 'in the name of the Lord,' prayer of faith, and the promise: 'the Lord will raise him up.'",
            ),
            sel(
              "Pentecostal worship is typically characterized by…",
              "Contemporary, participatory praise — hands raised, spontaneous, Spirit-led",
              ["Silent contemplation only", "Chant from a fixed medieval book", "Organ-only hymns"],
              "Psalms 100/150 set the tone: shout, clap, dance, new songs. 'Praise and worship' as a choreographed ramp into God's presence is a Pentecostal gift to global Christianity.",
            ),
            info(
              "Anointed preaching",
              "The sermon is expected to be 'in the Spirit' — spontaneous applications, 'words of knowledge' for individuals, altar calls where people respond immediately. The pulpit is not a lecture hall but an altar rail with a microphone.",
            ),
          ],
        },
        {
          title: "A Global Explosion",
          challenges: [
            info(
              "The fastest movement in Christian history",
              "1914: Hot Springs, Arkansas — the Assemblies of God forms as a missionary fellowship. Today Pentecostals + charismatics number 600+ million across every continent. Africa, Latin America and Asia lead: Brazil's universal churches, Nigeria's megachurches, Korea's Spirit-filled prayer mountains. Scholars call it 'the Third Force' of Christianity.",
            ),
            sel(
              "The difference between 'Pentecostals' and 'charismatics' is…",
              "Pentecostals are in Pentecostal denominations; charismatics are Spirit-practicing members of older churches",
              ["Pentecostals use incense; charismatics don't", "Charismatics reject tongues", "They are rival sports teams"],
              "The charismatic movement (from 1960) carried Spirit-experience INTO Episcopal, Catholic, Lutheran and Orthodox bodies. Same Spirit, different addresses.",
            ),
            match(
              "Match the Pentecostal body to its origin",
              [
                ["Assemblies of God", "Hot Springs, Arkansas, 1914"],
                ["Church of God (Cleveland)", "Tennessee holiness roots, 1886"],
                ["Foursquare Church", "Aimee Semple McPherson, 1927"],
                ["Apostolic Faith Mission", "Azusa Street, 1906"],
              ],
            ),
            typeAns(
              "In what year was the Assemblies of God founded?",
              "1___",
              ["1914"],
              "1914 — Hot Springs, Arkansas: 300 preachers, one question ('How do we carry this fire to the nations?'), one fellowship.",
            ),
          ],
        },
        {
          title: "Distinctives & Expectations",
          challenges: [
            info(
              "What marks the movement",
              "Four squares of the 'Foursquare Gospel': Jesus SAVES, HEALS, BAPTIZES with the Spirit, and is COMING KING. Most Pentecostals are premillennial — expecting Christ's visible return before a literal millennium (Rev 20:1–6) — which fuels urgency: 'Jesus is coming soon; who will hear?'",
            ),
            sel(
              "The four squares of the Foursquare Gospel are…",
              "Savior, Healer, Baptizer with the Spirit, Coming King",
              ["Father, Son, Ghost, Mary", "Word, Sacrament, Order, Prayer", "Faith, Hope, Love, Luck"],
              "Aimee Semple McPherson's 1920s vision, preached from her 5,300-seat Angelus Temple in Los Angeles and pictured in the Foursquare emblem: cross, dove, cup, and crown.",
            ),
            assist(
              "Complete Revelation 20:6: 'Blessed and holy is the one who shares in the first ______.'",
              "'shares in the first ___'",
              "resurrection",
              ["harvest", "snowfall", "concert"],
              "Resurrection — the premillennial anchor: martyrs reign with Christ a thousand years before the final judgment.",
            ),
            sel(
              "Pentecostal holiness historically included…",
              "Personal standards: no alcohol, modest dress, disciplined speech",
              ["Compulsory monastic vows", "Required celibacy for all", "Eating rules like Leviticus"],
              "Born from Wesleyan 'entire sanctification' — God's Spirit makes us actually holy in daily habits, not just legally acquitted.",
            ),
            info(
              "Prophecy for today",
              "A 'word of prophecy' may be given in service — but never replaces Scripture. The classic test: does it agree with the Bible, edify the body, and prove true? Prophecy functions like a spirit-powered spotlight on the Word, not a new revelation next to it.",
            ),
          ],
        },
      ],
    },
  ],
}

export const baptistCourse: SeedCourse = {
  code: "denom-baptist",
  title: "Baptist",
  subtitle: "Believer's church, Bible-defined, mission-driven",
  description: "Why Baptists baptize only believers by immersion, how local churches govern themselves, and how a movement of dissenters carried the gospel to the nations.",
  emoji: "🌊",
  color: "#2563EB",
  order: 15,
  units: [
    {
      title: "The Believer's Church",
      description: "Origins in 1609 Amsterdam, immersion as the New Testament pattern, and soul liberty.",
      emoji: "💧",
      color: "#2563EB",
      difficulty: 1,
      lessons: [
        {
          title: "Smyth, Williams & a New Start",
          challenges: [
            info(
              "Baptizing themselves",
              "1609: John Smyth, an English Separatist in Amsterdam, re-reads the New Testament and concludes infant baptism isn't in it — so he baptizes HIMSELF, then his flock. 1638: Roger Williams, banished from Massachusetts for religious liberty, plants the First Baptist Church of Providence, Rhode Island — the first in America.",
            ),
            sel(
              "The Baptist movement began…",
              "Among English Separatists around 1609, insisting on believer's baptism",
              ["At the Council of Nicaea", "With Martin Luther in 1517", "On Azusa Street in 1906"],
              "Baptists grew from Puritan/Separatist soil: if the church is a company of BELIEVERS, membership begins where faith begins — and infant baptism stops making sense.",
            ),
            sel(
              "Roger Williams founded Rhode Island primarily as…",
              "A haven of religious liberty for dissenters",
              ["A royal tobacco colony", "A Quaker utopia", "A penal settlement"],
              "Williams' 'soul liberty' — the state has no business enforcing conscience — made Rhode Island the seedbed of the American First Amendment.",
            ),
            match(
              "Match the Baptist pioneer",
              [
                ["John Smyth", "Self-baptized in Amsterdam, 1609"],
                ["Thomas Helwys", "First English Baptist church; died in prison for liberty"],
                ["Roger Williams", "Founded Providence, Rhode Island, 1638"],
                ["Adoniram Judson", "First American foreign missionary, Burma 1812"],
              ],
            ),
          ],
        },
        {
          title: "Baptism by Immersion",
          challenges: [
            info(
              "The word itself",
              "Baptist case: the Greek baptizō means 'immerse, dip, plunge.' Every New Testament example pictures it: Jesus 'came up out of the water' (Mark 1:10), the eunuch 'went down into the water' (Acts 8:38). And the meaning matches: Romans 6:4 — buried with Christ in baptism, raised to walk in new life. Only believers can be buried-and-raised; infants can't profess faith.",
              "baptizō = to immerse",
            ),
            assist(
              "Complete Romans 6:4: 'We were ______ therefore with him by baptism into death.'",
              "'We were ___ therefore with him'",
              "buried",
              ["married", "baptized only", "named"],
              "Buried — immersion preaches the gospel physically: down into the grave with Jesus, up into resurrection life.",
            ),
            sel(
              "Why do Baptists reject infant baptism?",
              "Because church membership requires personal profession of faith",
              ["Because babies are sinless already", "Because water is expensive", "Because infants cannot sin"],
              "The 'believer's church' principle: the church is a covenant of the REGENERATED. Baptism doesn't make a child Christian; faith does — baptism then pictures it.",
            ),
            arrange(
              "Build Mark 1:10's baptism picture",
              "coming up out of the water",
              ["coming", "up", "out", "of", "the", "water"],
              ["sprinkled", "dry", "insides"],
              "Mark 1:10 — Jesus 'coming UP OUT OF the water.' The Greek (ek) implies He was IN it. Immersion isn't a Baptist eccentricity; it's the text's own picture.",
            ),
            typeAns(
              "What Greek verb, meaning 'to immerse or dip,' gives baptism its name?",
              "b______",
              ["baptizo", "baptidzo"],
              "baptizō — used in ancient Greek for dyeing cloth and sinking ships: total saturation. Translate the verb literally and 'immersion' is unavoidable.",
            ),
          ],
        },
        {
          title: "Soul Competency & Autonomy",
          challenges: [
            info(
              "Priesthood of every believer",
              "Baptists carry Luther's 'priesthood of all believers' (1 Peter 2:9) to its congregational conclusion: every soul can read, interpret, approach God — and every LOCAL church is self-governing under Christ. No pope, no bishop, no synod can overrule a congregation. Cooperation (associations, conventions) is voluntary, not hierarchical.",
            ),
            assist(
              "Complete 1 Peter 2:9: 'You are a chosen race, a royal ______, a holy nation.'",
              "'a royal ___'",
              "priesthood",
              ["palace", "throne", "army"],
              "Priesthood — direct access: every believer comes to God through Christ alone, with no human mediator required.",
            ),
            sel(
              "'Local church autonomy' means…",
              "Each congregation governs itself — choosing pastors, owning property, ordering worship",
              ["Each member may ignore Scripture", "The state runs the church", "Pastors answer to a bishop"],
              "Autonomy under Christ's headship. Associations like the SBC bind churches together by voluntary cooperation and shared mission — not command.",
            ),
            sel(
              "The Baptist distinctive set is often summarized as…",
              "Bible authority, believer's baptism, church autonomy, separation of church and state",
              ["Incense, icons, pilgrimages", "Triple-office bishops", "Predestination by national census"],
              "The historic Baptist identity cluster — each distinctive flowing from the others like dominoes falling in order.",
            ),
          ],
        },
      ],
    },
    {
      title: "Mission & Practice",
      description: "Two ordinances, the modern missions movement, and the wide Baptist family today.",
      emoji: "🚢",
      color: "#1D4ED8",
      difficulty: 2,
      lessons: [
        {
          title: "Two Ordinances",
          challenges: [
            info(
              "Symbolic, not saving",
              "Baptists practice TWO ordinances — baptism and the Lord's Supper. Both are symbolic memorials: they PICTURE grace rather than confer it. The Supper is a memorial ('do this in remembrance of me,' Luke 22:19) and a proclamation of the cross until He comes (1 Cor 11:26) — usually observed monthly, open to believers.",
            ),
            sel(
              "The Baptist view of the Lord's Supper is…",
              "A symbolic memorial and proclamation of Christ's death",
              ["Transubstantiation", "Consubstantiation", "A sacrifice for sins repeated"],
              "Zwingli's memorialist line, held firmly: bread stays bread; faith feeds on CHRIST, not the elements. Christ is present by His Spirit, not in the loaf.",
            ),
            match(
              "Match ordinance to its gospel picture",
              [
                ["Baptism", "Death, burial and resurrection with Christ"],
                ["Lord's Supper", "Body given and blood shed for you"],
                ["Feet washing (some Baptists)", "Servant-hearted humility — John 13"],
              ],
            ),
            assist(
              "Complete 1 Corinthians 11:26: 'As often as you eat this bread and drink the cup, you ______ the Lord's death until he comes.'",
              "'you ___ the Lord's death'",
              "proclaim",
              ["purchase", "postpone", "imitate"],
              "Proclaim — the Supper is a sermon you can taste: the gospel announced 'until he comes.'",
            ),
          ],
        },
        {
          title: "Carey & Modern Missions",
          challenges: [
            info(
              "'Expect great things…'",
              "1792: William Carey — a cobbler turned preacher — publishes An Enquiry into the Obligations of Christians and founds the Baptist Missionary Society. Sailing to India in 1793, he translates the Bible into dozens of languages. 'Expect great things from God; attempt great things for God' became the spark of the modern missionary movement.",
            ),
            assist(
              "Complete Matthew 28:19: 'Go therefore and make ______ of all nations.'",
              "'make ___ of all nations'",
              "disciples",
              ["citizens", "converts only", "colonies"],
              "Disciples — not mere decisions: teach, baptize, obey 'all that I have commanded.' The Great Commission is the Baptist engine room.",
            ),
            sel(
              "Adoniram Judson, America's first foreign missionary (1812), served in…",
              "Burma (Myanmar) — translating the Bible into Burmese",
              ["China under the Qing", "Rome under the Pope", "The Falkland Islands"],
              "En route to India, Judson studied baptism on board ship — became a Baptist — and served nearly 40 years (1813–1850) in Burma: prison, famine, and finally the completed Burmese Bible and a young church of thousands that would pass 100,000 within a generation of his death.",
            ),
            info(
              "The missionary ripple",
              "Baptist mission societies multiplied: London (1792), Massachusetts (1802), BMS, IMB. Carey's Enquiry effectively invented the modern mission agency and the annual missionary offering — inspiring later watchwords like the Student Volunteer Movement's 'the evangelization of the world in this generation.'",
            ),
          ],
        },
        {
          title: "Baptists Today",
          challenges: [
            info(
              "One name, many rooms",
              "The Baptist family is vast and diverse: Southern Baptist Convention (largest US Protestant body), American Baptist, National Baptist (historic Black denominations), independent and Reformed Baptists, BMS/Baptist Union in Britain, global bodies in Nigeria, Brazil, Myanmar. What unites: believer's baptism, congregational governance, Bible authority — and usually very good potlucks.",
            ),
            sel(
              "The largest Protestant denomination in the United States is…",
              "The Southern Baptist Convention",
              ["The Episcopal Church", "The Assemblies of God", "The ELCA Lutherans"],
              "Formed in 1845, the SBC grew into America's largest Protestant body (13M+ members), powering the world's largest Protestant mission-sending agency (IMB).",
            ),
            match(
              "Match the Baptist stream",
              [
                ["Southern Baptist", "Largest US Protestant body, since 1845"],
                ["National Baptist", "Historic Black Baptist denominations"],
                ["Reformed Baptist", "Calvinist confession (1689) Baptists"],
                ["Independent Baptist", "Self-governing, no convention ties"],
              ],
            ),
            sel(
              "A mark of Baptist public life has historically been…",
              "Championing separation of church and state",
              ["Establishing a national church", "Taxation for the parish", "State-appointed clergy"],
              "From Helwys' dying-in-prison plea to Williams' Rhode Island to modern advocacy: a free church in a free state — no compulsion in religion.",
            ),
            info(
              "Why the potluck matters",
              "Baptist congregationalism makes fellowship structural: members vote, break bread, send missionaries, and hold pastors accountable TOGETHER. Hebrews 10:24–25's 'not neglecting to meet together' is lived, not laminated.",
            ),
          ],
        },
      ],
    },
  ],
}
