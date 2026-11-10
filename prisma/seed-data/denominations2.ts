import type { SeedCourse } from "./helpers"
import { info, sel, assist, match, arrange, typeAns } from "./helpers"

// ── Popular denominations, part 2 ─────────────────────────────
// Anglican (~85M) · Methodist (~80M) · Lutheran (~75M) · Reformed/Presbyterian (~80M)

export const anglicanCourse: SeedCourse = {
  code: "denom-anglican",
  title: "Anglican",
  subtitle: "The middle way of Word and Sacrament",
  description: "The Book of Common Prayer, the via media between Rome and Geneva, and a worldwide communion praying in one voice across 165 countries.",
  emoji: "🕯️",
  color: "#C2410C",
  order: 16,
  units: [
    {
      title: "The Middle Way",
      description: "Cranmer's prayer book, Hooker's three-legged stool, and the Articles that define Anglican faith.",
      emoji: "📖",
      color: "#C2410C",
      difficulty: 1,
      lessons: [
        {
          title: "Cranmer & Common Prayer",
          challenges: [
            info(
              "One book to pray by",
              "1549: Archbishop Thomas Cranmer publishes the Book of Common Prayer — one vernacular liturgy for the whole realm. Its goal: the whole Bible read through yearly, services so beautiful and scriptural that ordinary people pray them daily. Phrases like 'till death do us part' and 'ashes to ashes' come straight from it.",
            ),
            sel(
              "The Book of Common Prayer (1549) was revolutionary because…",
              "It put the whole liturgy into English for everyone",
              ["It was written in Latin", "It banned all singing", "It replaced the Bible"],
              "Medieval worship was Latin-only; Cranmer made Scripture-saturated prayer the shared possession of plowman and scholar alike.",
            ),
            sel(
              "Anglicanism calls its identity the 'via media,' meaning…",
              "The middle way between Roman Catholicism and Protestantism",
              ["The fastest route to church", "The highest hill in England", "A medieval tax code"],
              "Via media: retain ancient order (bishops, sacraments, liturgy) while embracing Reformation insights (Scripture's supremacy, justification by faith).",
            ),
            match(
              "Match the Anglican foundation",
              [
                ["Book of Common Prayer", "The church's liturgical spine"],
                ["39 Articles", "Its doctrinal confession (1571)"],
                ["Archbishop of Canterbury", "First among its bishops"],
                ["Elizabethan Settlement", "The 1559 compromise that shaped it"],
              ],
            ),
            assist(
              "Complete the wedding vow made famous by the Prayer Book: 'to have and to hold… till death us do ______.'",
              "'till death us do ___'",
              "part",
              ["joins", "amends", "lifts"],
              "'Till death us do part' — Prayer Book phrasing (1549: 'till death us depart'; 'do part' from 1552 onward) entered every English-speaking wedding and four centuries of vocabulary.",
            ),
          ],
        },
        {
          title: "Scripture, Tradition, Reason",
          challenges: [
            info(
              "Hooker's three-legged stool",
              "Richard Hooker (1554–1600) gave Anglicanism its method: SCRIPTURE is supreme; TRADITION (the ancient creeds, councils, fathers) interprets it; REASON (God's gift for understanding) applies it. Not three equals — a stool where Scripture is the seat and the others are legs holding it steady.",
            ),
            sel(
              "In the Anglican 'three-legged stool,' the supreme authority is…",
              "Scripture — with tradition and reason supporting",
              ["Tradition — with Scripture optional", "The monarch's private opinion", "Parliament"],
              "Hooker: 'What Scripture doth plainly deliver, to that the first place both of credit and obedience is due' — read with the Church's ancient voice and sanctified reason, never in isolation.",
            ),
            assist(
              "Complete 2 Timothy 2:15: 'Rightly handling the word of ______.'",
              "'rightly handling the word of ___'",
              "truth",
              ["power", "men", "kings"],
              "Truth — the stool exists to handle the word rightly: reading, weighing, applying without wandering into private fancy.",
            ),
            arrange(
              "Build the Anglican method",
              "Scripture informs Tradition tests Reason applies",
              ["Scripture", "informs", "Tradition", "tests", "Reason", "applies"],
              ["Mood", "decides", "Chance"],
              "Scripture informs, Tradition tests, Reason applies — a living hermeneutic rather than a frozen formula.",
            ),
            sel(
              "The 39 Articles (1571) function as Anglicanism's…",
              "Doctrinal confession — Reformed in theology, kept moderately worded",
              ["Hymn book", "Property deed", "List of saints"],
              "39 Articles: justification by faith, Scripture's sufficiency, two Gospel sacraments — with deliberately irenic edges to shelter a broad church.",
            ),
          ],
        },
        {
          title: "Bishops & the Settlement",
          challenges: [
            info(
              "Episcopal order preserved",
              "Anglicans kept the historic threefold ministry: bishops (episkopoi), priests (presbyters), deacons. Apostolic succession runs through episcopal ordination. The 'Elizabethan Settlement' (1559) made room for Catholics AND Protestants in one church: catholic structure, evangelical doctrine, common prayer.",
            ),
            match(
              "Match the Anglican order",
              [
                ["Bishop", "Oversees a diocese; ordains"],
                ["Priest", "Leads parishes; celebrates sacraments"],
                ["Deacon", "Serves; first step of ordination"],
                ["Lay reader", "Authorized member leading worship & reading"],
              ],
            ),
            sel(
              "'The Elizabethan Settlement' describes…",
              "The 1559 compromise giving Anglicanism its lasting shape",
              ["Henry VIII's divorce terms", "A tax on monasteries", "The Falklands treaty"],
              "Elizabeth I: one prayer book, moderate doctrine, bishops in office — 'no windows into men's souls.' The Settlement made Anglicanism flexible enough to survive 450 years.",
            ),
            sel(
              "The English Reformation began in the 1530s primarily over…",
              "Henry VIII's marriage annulment and Rome's authority",
              ["The color of vestments", "Candle pricing", "Ireland's taxes"],
              "The spark was political (Henry's annulment), but the fire was theological — Tyndale's English Bible, Cromwell's reforms, Cranmer's liturgy made it real.",
            ),
          ],
        },
      ],
    },
    {
      title: "The Global Communion",
      description: "Worship styles, the Anglican Communion, and the rhythm of the church year.",
      emoji: "🌍",
      color: "#9A3412",
      difficulty: 2,
      lessons: [
        {
          title: "High, Low & Broad",
          challenges: [
            info(
              "One church, three accents",
              "HIGH church (Anglo-Catholic): incense, vestments, bowing — catholic beauty. LOW church (Evangelical): pulpit-centered, Reformed in feel, missionary-minded. BROAD church: a via-media temper between them. All pray the same prayer book; the accents differ by parish.",
            ),
            sel(
              "An 'Anglo-Catholic' or 'high church' parish would typically feature…",
              "Incense, reserved sacrament, and Catholic-style ceremony",
              ["No liturgy at all", "Only extemporaneous prayer", "No communion ever"],
              "The Oxford Movement (1833, Keble, Pusey, Newman) rediscovered Anglicanism's catholic roots — vestments and ritual returned, deeply scriptural but visibly ancient.",
            ),
            match(
              "Match the churchmanship",
              [
                ["High church", "Incense, ritual, sacramental focus"],
                ["Low church", "Preaching, conversion, missions focus"],
                ["Broad church", "Moderate, comprehensivizing temper"],
              ],
            ),
            sel(
              "In most Anglican parishes, Holy Communion is celebrated…",
              "Every Sunday — Word and Sacrament together",
              ["Once a year", "Never — only morning prayer", "Only at weddings"],
              "The 1979 (US) and modern prayer books restored the early-church pattern: every Lord's Day gathers the Lord's Table.",
            ),
          ],
        },
        {
          title: "Canterbury & the World",
          challenges: [
            info(
              "A communion, not a command",
              "The Anglican Communion spans ~85 million members in 165 countries — England to Nigeria, Uganda to Brazil. The Archbishop of Canterbury is 'first among equals' — a focus of unity, not a pope. Instruments of communion: the Archbishop, the Lambeth Conference (decennial), the Primates' Meeting, the Anglican Consultative Council.",
            ),
            sel(
              "The Archbishop of Canterbury's authority in the Communion is…",
              "Primatial and symbolic — 'first among equals,' not papal",
              ["Absolute, like a pope", "Purely ceremonial with zero influence", "Enforced by armies"],
              "He convenes, represents and presides — but each national church is autonomous. Anglican unity is affinity and prayer, not command.",
            ),
            match(
              "Match the Communion instrument",
              [
                ["Lambeth Conference", "Bishops gathering every ten years"],
                ["Primates' Meeting", "Senior archbishops and presiding bishops"],
                ["Anglican Consultative Council", "Lay, clergy and episcopal representatives"],
                ["Archbishop of Canterbury", "The communion's focus of unity"],
              ],
            ),
            typeAns(
              "Which cathedral city gives the Communion's 'first among equals' his title?",
              "C_________",
              ["canterbury"],
              "Canterbury — Augustine of Canterbury landed in 597; since then the see has anchored English Christianity and, later, the worldwide Communion.",
            ),
            info(
              "The global shift",
              "Anglicanism's center of gravity has moved: Nigeria, Uganda, Kenya, and the Diocese of Sydney now hold some of its largest and most evangelical churches. The average Anglican is a young African woman with a smartphone — not an English aristocrat.",
            ),
          ],
        },
        {
          title: "The Prayer Book Rhythm",
          challenges: [
            info(
              "Living the church year",
              "Anglican worship runs on the LECTIONARY (Scripture readings mapped to every day and feast) and the CHURCH YEAR: Advent, Christmas, Epiphany, Lent, Easter, Pentecost, and saints' days. Daily offices — Morning and Evening Prayer — give laypeople the monastic rhythm of psalms and lessons.",
            ),
            sel(
              "The 'daily office' in Anglican practice refers to…",
              "Set daily prayer services — Morning and Evening Prayer",
              ["The priest's desk job", "Parish administration", "Sunday announcements"],
              "From Benedict's hours through Cranmer's simplification: psalms, Old and New Testament lessons, canticles and prayers — prayed in cathedrals and kitchen tables alike.",
            ),
            assist(
              "Complete Psalm 119:164: 'Seven times a day I ______ you for your righteous rules.'",
              "'Seven times a day I ___ you'",
              "praise",
              ["sleep", "labor", "sigh"],
              "Praise — the biblical impulse behind fixed-hour prayer, which the offices Christianize and Anglicanize.",
            ),
            arrange(
              "Build the church year's opening arc",
              "Advent Christmas Epiphany Lent Easter",
              ["Advent", "Christmas", "Epiphany", "Lent", "Easter"],
              ["Halloween", "Tax day", "Arbor day"],
              "The year tells the Story: waiting (Advent) → incarnation (Christmas) → manifestation (Epiphany) → cross (Lent) → resurrection (Easter).",
            ),
            sel(
              "The lectionary's purpose is…",
              "To walk the whole congregation through the bulk of Scripture on a set cycle",
              ["To avoid difficult passages", "To shorten services", "To replace preaching"],
              "Preachers don't pick favorites; the lectionary assigns — ensuring the church hears the whole counsel of God, not just the preacher's hobbyhorses.",
            ),
          ],
        },
      ],
    },
  ],
}

export const methodistCourse: SeedCourse = {
  code: "denom-methodist",
  title: "Methodist",
  subtitle: "Wesley's heart, methodical grace",
  description: "Aldersgate's strangely-warmed heart, sanctifying grace, class meetings and world-changing hymns — the movement of 'methodical' holiness.",
  emoji: "🎵",
  color: "#0E7490",
  order: 17,
  units: [
    {
      title: "A Heart Strangely Warmed",
      description: "Wesley's conversion, the pursuit of sanctification, and the small groups that made it stick.",
      emoji: "❤️",
      color: "#0E7490",
      difficulty: 1,
      lessons: [
        {
          title: "Wesley & Aldersgate",
          challenges: [
            info(
              "May 24, 1738",
              "John Wesley — Oxford don, failed Georgia missionary, tormented by doubt — attends a Moravian meeting on Aldersgate Street, London. Someone reads Luther's preface to Romans. 'I felt my heart strangely warmed. I felt I did trust in Christ, Christ alone, for salvation.' The revival that became Methodism starts with one warmed heart.",
            ),
            assist(
              "Complete Romans 8:16 (the epistle at Aldersgate's heart): 'The Spirit himself bears ______ with our spirit that we are children of God.'",
              "'bears ___ with our spirit'",
              "witness",
              ["weight", "burden", "fruit"],
              "Witness (symmartureō) — assurance from within, not just doctrine about: the experiential heart of Wesleyan faith.",
            ),
            sel(
              "Wesley's Aldersgate experience centered on…",
              "Assurance of salvation by trusting Christ alone",
              ["Speaking in tongues", "Being made a bishop", "Founding a university"],
              "Wesley already tithed, fasted and visited prisons — Aldersgate added ASSURANCE: peace that his standing with God rested on Christ, not his discipline.",
            ),
            match(
              "Match the Wesley story",
              [
                ["Holy Club", "Oxford methodists: prayer, prison visits, Communion"],
                ["Georgia mission", "Wesley's failed 1735 Savannah venture"],
                ["Aldersgate, 1738", "The 'strangely warmed heart' night"],
                ["Moravians", "The German pietists whose faith humbled him"],
              ],
            ),
            sel(
              "'Methodist' began as…",
              "A mocking nickname for Wesley's methodical holy-living club",
              ["Wesley's chosen brand", "A Latin theological term", "A tax category"],
              "'Methodists' — Holy Club members methodically prayed, fasted, studied and served on schedule. The insult stuck; the movement kept the discipline.",
            ),
          ],
        },
        {
          title: "Sanctification — Going On to Perfection",
          challenges: [
            info(
              "Not just forgiven — changed",
              "Wesley's signature doctrine: ENTIRE SANCTIFICATION — God's love so filling the heart that 'sinning' loses its grip. Not sinless perfectionism in one zap, but a journey: justifying grace pardons; sanctifying grace TRANSFORMS. 'The great work' is to have the mind of Christ and be made perfect in love (Matthew 5:48; 1 John 4:18).",
            ),
            assist(
              "Complete Matthew 5:48: 'You therefore must be ______, as your heavenly Father is perfect.'",
              "'must be ___…'",
              "perfect",
              ["polite", "patient", "powerful"],
              "Perfect (teleios) — complete, mature, whole. Wesley read it as love grown all the way up: the aim of sanctification.",
            ),
            sel(
              "In Wesleyan theology, sanctification is…",
              "A real transformation of heart and life by grace — 'going on to perfection' in love",
              ["Impossible before death", "Identical with church attendance", "Only for monks"],
              "Grace is not a legal fiction only: God actually changes people. Holiness is the Methodist family business — 'spread scriptural holiness over the land.'",
            ),
            arrange(
              "Build Wesley's grace timeline",
              "Prevenient Justifying Sanctifying Glorifying",
              ["Prevenient", "Justifying", "Sanctifying", "Glorifying"],
              ["Taxing", "Ending", "Trading"],
              "Prevenient grace wakes the soul; justifying grace pardons; sanctifying grace heals; glorifying grace completes. All grace — every step.",
            ),
            typeAns(
              "Which grace in Wesleyan theology comes BEFORE conversion, awakening the soul ('preventing grace')?",
              "P__________ grace",
              ["prevenient", "preventing"],
              "Prevenient grace — God's drawing presence in every human life before we respond: why Wesley could say free will is real because grace moves first.",
            ),
          ],
        },
        {
          title: "Class Meetings & Bands",
          challenges: [
            info(
              "Accountability with teeth",
              "Wesley organized converts into CLASS MEETINGS — 10–12 people meeting weekly, asked the question: 'How is it with your soul?' Bands were smaller groups for confession. Methodism grew 25,000 (1767) → 130,000 (1791) not through preaching alone but through this machinery of accountable community.",
            ),
            sel(
              "The signature question of a Wesleyan class meeting was…",
              "'How is it with your soul?'",
              ["What's your favorite hymn?", "How much did you tithe?", "Who did you vote for?"],
              "The question made spiritual state conversational and communal — early Methodism's 'small group' was its engine, not its accessory.",
            ),
            match(
              "Match the Wesleyan structure",
              [
                ["Class meeting", "Weekly group of ~12 checking in on souls"],
                ["Band", "Small voluntary group for mutual confession"],
                ["Circuit", "Riding route linking preaching stations"],
                ["Love feast", "Bread-and-water agape meal from Moravians"],
              ],
            ),
            assist(
              "Complete Hebrews 10:24: 'Let us consider how to stir up one another to ______ and good works.'",
              "'stir up one another to ___ and good works'",
              "love",
              ["argument", "rest", "silence"],
              "Love — the class meeting existed precisely to 'stir up' (paroxysmō — provoke!) one another. Community as sanctification's delivery system.",
            ),
          ],
        },
      ],
    },
    {
      title: "Method & Mission",
      description: "The quadrilateral, Charles Wesley's hymns, social holiness and America's circuit riders.",
      emoji: "🐎",
      color: "#155E75",
      difficulty: 2,
      lessons: [
        {
          title: "The Wesleyan Quadrilateral",
          challenges: [
            info(
              "Four lights, one way",
              "Methodists read God through the QUADRILATERAL: SCRIPTURE (primary — 'the only rule'), interpreted with TRADITION (2,000 years of the church), REASON (sober thinking), and EXPERIENCE (the Spirit's witness in life). Coined later by Albert Outler summarizing Wesley, it explains the Methodist instinct for both head and heart.",
            ),
            sel(
              "In the Wesleyan quadrilateral, which element is primary?",
              "Scripture — tradition, reason and experience illuminate it",
              ["Experience — above all", "Tradition — it outranks texts", "Reason — faith must bow"],
              "Scripture is 'the only rule and sufficient rule'; the other three are lamps for reading it, never rivals to it.",
            ),
            arrange(
              "Build the quadrilateral",
              "Scripture above Tradition Reason Experience",
              ["Scripture", "above", "Tradition", "Reason", "Experience"],
              ["Feelings", "polls", "vibes"],
              "Scripture first; the rest are interpretive companions. Wesley: 'I allow no other rule, whether of faith or practice, than the Holy Scriptures' (The Principles of a Methodist, 1742).",
            ),
            sel(
              "Wesley's Arminianism emphasized…",
              "Christ died for all; grace enables genuine free response",
              ["Double predestination", "Babies inherit salvation automatically", "Salvation by national identity"],
              "Against Calvinist election, Wesley preached universal atonement (1 Tim 2:4, 'desires all people to be saved') with grace freeing — not forcing — the will.",
            ),
            assist(
              "Complete 1 Timothy 2:4: God 'desires ______ people to be saved and to come to the knowledge of the truth.'",
              "'desires ___ people to be saved'",
              "all",
              ["some", "elect", "royal"],
              "All — the Arminian charter: a sincere offer of the gospel to every creature (Mark 16:15).",
            ),
          ],
        },
        {
          title: "Hymns & Social Holiness",
          challenges: [
            info(
              "The gospel in rhyme",
              "Charles Wesley wrote ~6,500 hymns: 'Hark! The Herald Angels Sing,' 'O For a Thousand Tongues,' 'And Can It Be,' 'Christ the Lord Is Risen Today.' John said the hymnbook is 'a little body of experimental and practical divinity' — theology the congregation sings until it sticks. Methodism has long been described as 'born in song.'",
            ),
            assist(
              "Complete Charles Wesley: 'And can it be that I should gain an interest in the ______' blood?'",
              "'an interest in the ___' blood'",
              "Savior",
              ["Caesar's", "temple's", "angel's"],
              "Savior's — from 'And Can It Be,' written right after Aldersgate's assurance broke into poetry.",
            ),
            sel(
              "Wesley's 'social holiness' meant…",
              "Holiness lived together in community and poured out toward the poor",
              ["Holiness only in private prayer", "State-enforced morality", "Holier-than-thou competition"],
              "'There is no holiness but SOCIAL holiness' — sanctification grows in fellowship and expresses itself in prisons, mines, schools and food pantries.",
            ),
            match(
              "Match the Methodist social legacy",
              [
                ["Wesley's 'Thoughts on Slavery'", "Early abolitionist tract (1774)"],
                ["Kingswood school", "Free education for miners' children"],
                ["Wesley's primitive physic", "Free medical guide for the poor"],
                ["Susanna Wesley", "John's mother — model of disciplined nurture"],
              ],
            ),
            info(
              "Both boats",
              "Methodism historically held 'personal AND social' holiness together: convert the heart AND abolish slavery, open schools, feed the hungry. That double emphasis became the Wesleyan fingerprint on evangelicalism and social reform alike.",
            ),
          ],
        },
        {
          title: "Circuit Riders & Connectionalism",
          challenges: [
            info(
              "Riding for souls",
              "1784: the Christmas Conference organizes American Methodism with Francis Asbury as co-bishop (with Thomas Coke). 'Circuit riders' — young preachers on horseback — ride 200–500 mile loops preaching daily, organizing classes, planting churches. Methodism becomes America's largest denomination by 1850.",
            ),
            typeAns(
              "Which bishop organized American Methodism at the 1784 Christmas Conference and rode circuits for 45 years?",
              "F______ A_____",
              ["francis asbury", "asbury"],
              "Francis Asbury — he crossed the Atlantic just once (1771) and spent 45 years riding roughly 270,000 miles on horseback, ordaining and organizing as he went. 'Bishop of the frontier.'",
            ),
            sel(
              "Methodist 'connectionalism' means…",
              "Churches linked in an interdependent network — districts, conferences, bishops",
              ["Every church is an island", "Churches connect only by email", "The government connects them"],
              "From class meeting to General Conference: a web of mutual accountability — the opposite of independence, the Methodist middle between pope and pure autonomy.",
            ),
            match(
              "Match the Methodist structure",
              [
                ["Charge/Local church", "The congregation itself"],
                ["District", "Cluster of churches under a superintendent"],
                ["Annual Conference", "The basic governing body — clergy & laity"],
                ["General Conference", "The global lawmaking body, quadrennial"],
              ],
            ),
            sel(
              "A distinctive of Methodist polity…",
              "Clergy and laity share governance in conferences",
              ["Only clergy may speak", "Laity are excluded", "Bishops appoint without process"],
              "Lay representation, added over the course of the nineteenth century (General Conference from 1872 in the M.E. Church), grew into full partnership — a democratizing instinct that shaped American religious life broadly.",
            ),
          ],
        },
      ],
    },
  ],
}

export const lutheranCourse: SeedCourse = {
  code: "denom-lutheran",
  title: "Lutheran",
  subtitle: "Grace alone, faith alone, Scripture alone",
  description: "95 theses, a warmed heart, the Small Catechism and Christ truly present in, with, and under the bread — the tradition that started the Reformation.",
  emoji: "🏰",
  color: "#4D7C0F",
  order: 18,
  units: [
    {
      title: "Here I Stand",
      description: "The 95 Theses, justification by faith, and the solas of the Reformation.",
      emoji: "📜",
      color: "#4D7C0F",
      difficulty: 1,
      lessons: [
        {
          title: "95 Theses",
          challenges: [
            info(
              "October 31, 1517",
              "An Augustinian monk posts 95 academic debate points on Wittenberg's church door — mostly about INDULGENCES: certificates sold to shorten purgatory (Johann Tetzel's jingle: 'When the coin in the coffer rings…'). Luther's protest over grace-for-sale ignites the Reformation. Within weeks, printing presses carry the theses across Europe.",
            ),
            sel(
              "Luther's 95 Theses primarily attacked…",
              "The sale of indulgences",
              ["The Trinity", "Church architecture", "Easter dates"],
              "Thesis 82's innocent question — 'Why doesn't the pope empty purgatory out of love?' — exposed the whole system. Grace cannot be purchased; it is gifted.",
            ),
            assist(
              "Complete Ephesians 2:8: 'For by ______ you have been saved through faith.'",
              "'For by ___ you have been saved'",
              "grace",
              ["works", "birth", "law"],
              "Grace — the Reformation's engine text: salvation is God's unmerited gift, received by faith, 'not a result of works' (v. 9).",
            ),
            match(
              "Match the Reformation term",
              [
                ["Indulgence", "Paid certificate remitting temporal punishment"],
                ["Purgatory", "Roman teaching on post-death purification"],
                ["Excommunication", "Formal removal from the church"],
                ["Diet of Worms", "1521 trial where Luther refused to recant"],
              ],
            ),
            typeAns(
              "In what year did Luther post the 95 Theses?",
              "1___",
              ["1517"],
              "1517 — October 31 (All Hallows' Eve), when the castle church filled with pilgrims viewing relics. Reformation Day still marks it.",
            ),
          ],
        },
        {
          title: "Faith Alone",
          challenges: [
            info(
              "The tower breakthrough",
              "Luther's crisis: how can a righteous God judge sinners? Studying Romans 1:17, light broke — 'THE RIGHTEOUS SHALL LIVE BY FAITH.' God's righteousness isn't the standard that condemns but the GIFT that saves. Justification is forensic (a verdict!) and by faith alone (sola fide) — 'simul iustus et peccator': simultaneously saint and sinner.",
            ),
            assist(
              "Complete Romans 1:17: 'The righteous shall live by ______.'",
              "'shall live by ___'",
              "faith",
              ["works", "law", "merit"],
              "Faith (pistis) — quoting Habakkuk 2:4. Luther: 'Here I felt that I was altogether born again and had entered paradise itself through open gates.' (1545 Preface)",
            ),
            sel(
              "Luther's phrase 'simul iustus et peccator' means…",
              "The believer is simultaneously justified and still a sinner",
              ["Saints never sin again", "Sinners are never justified", "Everyone is fine as-is"],
              "The believer's standing in Christ (declared righteous) coexists with ongoing struggle — grace covers the gap until glory.",
            ),
            arrange(
              "Build the three solas of the Lutheran Reformation",
              "Sola gratia sola fide sola scriptura",
              ["Sola", "gratia", "sola", "fide", "sola", "scriptura"],
              ["opera", "traditio", "merces"],
              "Grace ALONE (not merit), faith ALONE (not ritual), Scripture ALONE (not papal decree) — the triple pillar of Wittenberg.",
            ),
            sel(
              "Luther at the Diet of Worms (1521) famously said…",
              "'My conscience is captive to the Word of God. I cannot and will not recant. Here I stand, I can do no other.'",
              ["'Sell more indulgences'", "'I recant everything'", "'The pope is my lord'"],
              "The official transcript gives his conscience 'captive to the Word of God'; the 'Here I stand' line comes from early printed editions of the speech. He arrived under imperial safe-conduct — and left an outlaw. The Stand at Worms made the Reformation irreversible.",
            ),
          ],
        },
        {
          title: "Scripture & the Priested People",
          challenges: [
            info(
              "The Bible in every hand",
              "Luther's German New Testament (1522, from Erasmus' Greek) and complete Bible (1534) did for German what Tyndale did for English. He added the 'priesthood of all believers' (1 Peter 2:9): every Christian reads, prays, serves. Vernacular worship, catechisms for heads of household, and hymns carried doctrine into daily life.",
            ),
            assist(
              "Complete 1 Peter 2:9: 'You are a chosen race, a royal priesthood, a holy ______.'",
              "'a holy ___'",
              "nation",
              ["empire", "guild", "council"],
              "Nation (ethnos) — God's people collectively, with direct access to God through Christ: Luther's 'every Christian is a priest' text.",
            ),
            sel(
              "Luther's Small Catechism (1529) was written for…",
              "Heads of households to teach children the faith at home",
              ["University theologians", "Papal couriers", "Monastic choirs"],
              "'As the father of the family should teach it to his household' — the Ten Commandments, Creed, Lord's Prayer, baptism, Supper, confession: pocket-sized Reformation.",
            ),
            match(
              "Match the Lutheran confession",
              [
                ["Augsburg Confession", "1530 statement presented to Emperor Charles V"],
                ["Small Catechism", "1529 family teaching booklet"],
                ["Book of Concord", "1580 collection of Lutheran standards"],
                ["Smalcald Articles", "Luther's 1537 doctrinal summary"],
              ],
            ),
            sel(
              "Lutheran worship after the Reformation was…",
              "Largely retained in form — liturgy, chant, sacraments, but in German and reformed in content",
              ["Abolished entirely", "Replaced by Quaker silence", "Kept in Latin forever"],
              "Luther kept what Scripture allowed and conscience required: 'it is not our intention to abolish the liturgical service of God completely, but rather to purify the one that is now in use' (Luther, 1523). Hence Lutheran liturgy still smells like the ancient church.",
            ),
          ],
        },
      ],
    },
    {
      title: "Word, Water, Wine & Vocation",
      description: "The Book of Concord's Christ-centered sacraments, hymns, and calling in daily work.",
      emoji: "🍷",
      color: "#3F6212",
      difficulty: 2,
      lessons: [
        {
          title: "Christ in the Bread",
          challenges: [
            info(
              "Sacramental union",
              "Luther vs the Swiss: against both Rome's transubstantiation and Zwingli's bare symbolism, Lutherans teach Christ's body and blood are truly present 'IN, WITH, and UNDER' the bread and wine — sacramental union, like iron in fire. Anchor: 'The cup of blessing… participation (koinōnia) in the blood of Christ' (1 Cor 10:16).",
            ),
            assist(
              "Complete 1 Corinthians 10:16: 'The cup of blessing that we bless — is it not a participation in the ______ of Christ?'",
              "'a participation in the ___ of Christ'",
              "blood",
              ["wisdom", "nation", "law"],
              "Blood — koinōnia: genuine sharing in Christ Himself. Lutheran eucharistic theology hangs its hat on this verse and John 6.",
            ),
            sel(
              "The Lutheran teaching on the Lord's Supper is often summarized as…",
              "Real presence 'in, with, and under' the elements",
              ["Transubstantiation", "Pure memorial", "The bread is irrelevant"],
              "Not Aristotle's substances — a mystery of UNION: Christ gives His body and blood WITH the bread, received by faith (and received by unworthy mouths too, though to judgment — 1 Cor 11).",
            ),
            sel(
              "Why do Lutherans keep infant baptism?",
              "Faith is God's gift through the Word — even in an infant, by the Spirit's work",
              ["Babies must be baptized to be citizens", "It's merely a family tradition", "It saves automatically apart from God's promise"],
              "Baptism is GOD's promise-action ('baptized into Christ,' Gal 3:27), not primarily our decision. The Word gives the water its power — hence 'baptism now saves you' (1 Peter 3:21).",
            ),
            info(
              "Word and sacrament: the means of grace",
              "Lutheran theology's heartbeat: God delivers forgiveness through concrete channels — the preached Word, baptism, the Supper, absolution. 'Means of grace': grace with an address. You don't climb to God; He comes down to your ears and hands.",
            ),
          ],
        },
        {
          title: "A Mighty Fortress",
          challenges: [
            info(
              "The war hymn of the Reformation",
              "Luther's 'Ein feste Burg' (1529), from Psalm 46: 'A mighty fortress is our God, a bulwark never failing.' Congregational singing was a Reformation weapon — everyone, not just choirs, singing doctrine. Bach's greatest church works grow from Lutheran hymnody; 'the battle hymn' spread on prints, broadsheets and armies' marches.",
            ),
            assist(
              "Complete Psalm 46:1: 'God is our refuge and ______, a very present help in trouble.'",
              "'our refuge and ___'",
              "strength",
              ["shield", "song", "sword"],
              "Strength — the psalm behind 'A Mighty Fortress.' Luther's hymn stands where the psalm stands: in the middle of trouble, not in escape from it.",
            ),
            match(
              "Match the Lutheran hymn contribution",
              [
                ["Luther", "Wrote 'A Mighty Fortress' (Psalm 46)"],
                ["J.S. Bach", "Crowned Lutheran hymnody in cantatas"],
                ["Congregational singing", "The Reformation's people's choir"],
                ["Chorale", "The hymn form that carried doctrine"],
              ],
            ),
            sel(
              "The Lutheran 'two kingdoms' doctrine teaches…",
              "God rules the state by law and the church by grace — distinct but both His",
              ["The church should rule the state", "The state should rule the church", "Neither matters"],
              "Romans 13 (sword) and Matthew 22 (render to Caesar/God) — citizenship and discipleship run on different rails, both under God. It shaped Lutheran political theology for centuries.",
            ),
          ],
        },
        {
          title: "Vocation — God in Ordinary Work",
          challenges: [
            info(
              "The milkmaid's calling",
              "Luther's revolution: 'vocation' is not just for monks. The mother changing diapers, the magistrate judging, the farmer plowing — each serves God in place (Psalm 128; 1 Thess 4:11). 'God milks the cows through the milkmaid.' The sacred/secular wall came down: your desk, kitchen and workshop are altars.",
            ),
            assist(
              "Complete Colossians 3:23: 'Whatever you do, work heartily, as for the ______ and not for men.'",
              "'as for the ___ and not for men'",
              "Lord",
              ["boss", "crowd", "money"],
              "Lord — vocation's verse: ordinary work is worship when done 'for the Lord.' Lutherans turned the monastery inside out.",
            ),
            sel(
              "The Lutheran doctrine of vocation means…",
              "Every lawful occupation is a God-given calling serving the neighbor",
              ["Only pastors have callings", "Work is a curse to escape", "Vocation means monastic vows"],
              "'The Christian serves God by serving the neighbor' — the butcher, brewer and baker are masks of God's providence. No walled garden needed.",
            ),
            typeAns(
              "Which 1530 document, presented to Emperor Charles V, became Lutheranism's chief confession?",
              "A_______ C_________",
              ["augsburg confession", "augsburg"],
              "The Augsburg Confession — read aloud in German before the emperor, June 25, 1530. June 25 is still 'Augsburg Day' for confessional Lutherans.",
            ),
            info(
              "Lutherans today",
              "~75 million worldwide. Lutheran World Federation (global, liturgical), the conservative Confessional Lutheran bodies (Missouri Synod, WELS, ELS), and massive churches in Scandinavia, Germany, Tanzania, Ethiopia (the world's largest Lutheran Mekane Yesus) and Indonesia. Distinctives remain: justification by faith, real presence, liturgy, catechesis — and the freedom of a forgiven conscience.",
            ),
          ],
        },
      ],
    },
  ],
}

export const reformedCourse: SeedCourse = {
  code: "denom-reformed",
  title: "Reformed & Presbyterian",
  subtitle: "Covenant, confessions and the sovereignty of grace",
  description: "Calvin's Geneva, the TULIP of Dort, covenant theology and Presbyterian government — the tradition of the Westminster Standards and the regulative principle.",
  emoji: "🌷",
  color: "#7C2D12",
  order: 19,
  units: [
    {
      title: "The Geneva Stream",
      description: "Calvin's Institutes, the Canons of Dort and the covenant architecture of Scripture.",
      emoji: "🇨🇭",
      color: "#7C2D12",
      difficulty: 1,
      lessons: [
        {
          title: "Calvin & the Institutes",
          challenges: [
            info(
              "The mind of the Reformation",
              "John Calvin (1509–1564), French lawyer turned reformer, led Geneva's church and wrote the Institutes of the Christian Religion (final Latin edition 1559) — Protestantism's first great systematic theology. Center: the glory and sovereignty of God. Calvin never 'founded a church' — he reformed Geneva's already-existing church; 'Calvinism' was built by his heirs (Beza, Knox, the Puritans).",
            ),
            sel(
              "The Institutes of the Christian Religion is…",
              "Calvin's systematic theology — the Reformation's masterpiece",
              ["A gym membership plan", "A list of church fees", "A book of Catholic canon law"],
              "First 1536 (six chapters), final 1559 (eighty chapters). Addressed to King Francis I as a defense of persecuted French Protestants — the people later nicknamed 'the Huguenots.'",
            ),
            assist(
              "Complete Romans 11:36: 'For from him and through him and to him are ______ things.'",
              "'are ___ things'",
              "all",
              ["some", "few", "good only"],
              "All — the doxology that frames Calvin's whole system: everything comes from God, and everything exists for His glory. Sovereignty isn't a doctrine among others; it's the frame around them all.",
            ),
            match(
              "Match the Reformed shaper",
              [
                ["John Calvin", "Geneva reformer, wrote the Institutes"],
                ["John Knox", "Carried Reformation to Scotland"],
                ["Theodore Beza", "Calvin's successor in Geneva"],
                ["William Perkins", "Elizabethan 'father of Puritanism'"],
              ],
            ),
            sel(
              "The 'five solas' of the Reformation include…",
              "Sola scriptura, sola fide, sola gratia, solus Christus, soli Deo gloria",
              ["Sola cena, sola virgo, sola papa", "Sola Luther, sola Calvin, sola Knox", "Sola Beza, sola TULIP, sola Geneva"],
              "Scripture alone, faith alone, grace alone, Christ alone, glory to God alone — the shared grammar of Protestant orthodoxy, summarized crisply by Reformed scholastics.",
            ),
          ],
        },
        {
          title: "TULIP & the Canons of Dort",
          challenges: [
            info(
              "The acrostic of grace",
              "1618–19: the Synod of Dort answers the Arminian 'Remonstrants' with five canons — later remembered as TULIP: Total depravity, Unconditional election, Limited (definite) atonement, Irresistible (effective) grace, Perseverance of the saints. The point isn't fatalism but GRACE from first to last: salvation is of the Lord (Jonah 2:9).",
            ),
            match(
              "Match each TULIP letter",
              [
                ["T", "Total depravity — sin touches every part of us"],
                ["U", "Unconditional election — God chooses by mercy, not merit"],
                ["I", "Irresistible (effective) grace — God's saving call accomplishes what it intends"],
                ["L", "Definite atonement — Christ's cross surely saves His people"],
                ["P", "Perseverance — God keeps those He saves"],
              ],
            ),
            assist(
              "Complete Jonah 2:9: '______ belongs to the LORD!'",
              "'___ belongs to the LORD'",
              "Salvation",
              ["Victory", "Judgment", "Glory only"],
              "Salvation — the Old Testament shout behind Dort's whole point: from rescue's start to finish, it is God's work.",
            ),
            sel(
              "'Limited atonement' (particular redemption) teaches…",
              "Christ's death definitely accomplishes salvation for His sheep",
              ["Christ died for no one", "Only apostles were saved", "The cross has no effect"],
              "Jesus: 'I lay down my life FOR THE SHEEP' (John 10:15). The cross doesn't merely make salvation possible — it actually saves everyone it was made for.",
            ),
            typeAns(
              "What Dutch city hosted the 1618–19 synod that answered the Remonstrants?",
              "D___",
              ["dort", "dordrecht"],
              "Dort (Dordrecht) — 154 sessions, six months (Nov 1618 – May 1619). Its 'Canons' gave posterity the five points; its clearest legacy is the acrostic TULIP.",
            ),
            sel(
              "Reformed piety is known for emphasizing…",
              "God's sovereignty, covenant, and deep doctrinal teaching",
              ["Prophetic prediction charts", "Bare emotionalism", "Avoiding theology"],
              "Geneva built schools (academy), catechisms (Geneva Catechism), and preaching every week — the Reformed instinct: theology taught is worship deepened.",
            ),
          ],
        },
        {
          title: "Covenant Theology",
          challenges: [
            info(
              "The Bible's backbone",
              "Reformed theology reads Scripture as two great covenants: WORKS (Adam: obey and live — broken) and GRACE (Christ: the Second Adam obeys and dies for His people — kept). Same gospel from Genesis 3:15 through Revelation. Covenant of grace administered through Abraham, Moses, David — fulfilled in the New Covenant (Jer 31:31–34; Luke 22:20).",
            ),
            assist(
              "Complete Jeremiah 31:33: 'I will put my ______ within them, and I will write it on their hearts.'",
              "'put my ___ within them'",
              "law",
              ["sword", "ark", "temple"],
              "Law — written inside, not just on stone: the New Covenant's signature promise that grace changes hearts.",
            ),
            sel(
              "In covenant theology, Adam functioned as…",
              "A federal head whose obedience (and failure) represented humanity",
              ["A random gardener", "Only a private individual", "A mythical figure without role"],
              "'Federal' = covenant representation. Romans 5:12–19 parallels Adam and Christ; and 'as in Adam all die, so in Christ all shall be made alive' (1 Cor 15:22).",
            ),
            arrange(
              "Build the covenant timeline",
              "Works Adam Grace Christ New Covenant",
              ["Works", "Adam", "Grace", "Christ", "New Covenant"],
              ["Random", "Chaos", "Chance"],
              "Covenant of works (Adam) fails; covenant of grace (Christ, the true Adam) succeeds — one storyline, two administrations.",
            ),
            info(
              "Why 'presbyterian'?",
              "From Greek presbyteros (elder). Reformed churches govern by ELDERS, not bishops or pure democracy: a session (local), presbytery (regional), synod/general assembly (national). Executive power rests with the church's courts, sitting together — 1 Timothy 5:17's 'elders who rule well' made structural.",
            ),
          ],
        },
      ],
    },
    {
      title: "Westminster & Worship",
      description: "The Westminster Standards, the regulative principle and Reformed life today.",
      emoji: "⚖️",
      color: "#78350F",
      difficulty: 2,
      lessons: [
        {
          title: "The Westminster Standards",
          challenges: [
            info(
              "The confessional summit",
              "1643–49: the Westminster Assembly (English and Scottish divines) produces the Westminster Confession of Faith, the Larger and Shorter Catechisms — the mature statement of Reformed orthodoxy. Shorter Catechism Q1: 'Man's chief end is to glorify God, and to enjoy him forever.' (107 Q&A learned by children.)",
            ),
            typeAns(
              "According to the Shorter Catechism Q1, what is man's chief end? 'To glorify God and to ______ him forever.'",
              "'to ___ him forever'",
              ["enjoy"],
              "ENJOY — glory and joy fused: 'glorify AND ENJOY him forever.' John Piper's 'Christian Hedonism' grows straight out of this line.",
            ),
            sel(
              "The Westminster Assembly met in…",
              "London, during the English Civil War (1643–49)",
              ["Geneva in 1559", "Philadelphia in 1789", "Rome in 1054"],
              "121 divines in Westminster Abbey's Jerusalem Chamber — Scottish commissioners' presence made it a British Reformation document, adopted by the Church of Scotland in 1647.",
            ),
            match(
              "Match the Westminster document",
              [
                ["Confession of Faith", "33 chapters of doctrine"],
                ["Shorter Catechism", "107 Q&A for new believers and children"],
                ["Larger Catechism", "196 Q&A with fuller proofs"],
                ["Directory for Worship", "Guidelines replacing the prayer book"],
              ],
            ),
            assist(
              "Complete 1 Corinthians 10:31: 'Whether you eat or drink, or whatever you do, do ______ to the glory of God.'",
              "'do ___ to the glory of God'",
              "all",
              ["some", "much", "enough"],
              "All — eating, drinking, working: the Reformed insistence that every square inch of life belongs to God (Kuyper's famous echo).",
            ),
          ],
        },
        {
          title: "The Regulative Principle",
          challenges: [
            info(
              "Only what God commands",
              "Reformed worship follows the REGULATIVE PRINCIPLE: elements of worship must be instituted by Scripture (prayer, singing, Word, sacraments, offerings) — not whatever seems meaningful. (Lutherans keep what's not forbidden; Reformed keep only what's commanded.) Historic fruit: psalm-singing (Genevan Psalter, Scottish Psalter), a cappella praise in many churches, simple architecture — pulpit at the center.",
            ),
            sel(
              "The 'regulative principle of worship' holds that…",
              "Worship elements must be prescribed by Scripture",
              ["Worship may be whatever feels good", "Worship requires orchestras", "Worship must be silent"],
              "Deuteronomy 12:32 ('You shall not add to it') and the Second Commandment's logic: God, not taste, rules His worship. Application varies — principle stands.",
            ),
            match(
              "Match the Reformed worship stream",
              [
                ["Exclusive psalmody", "Only the Psalms, a cappella (old Scots)"],
                ["Genevan Psalter", "Calvin's rhymed psalter, 1562"],
                ["Regulative principle", "Only Scripture-prescribed elements"],
                ["Pulpit-centered room", "Preaching at the architectural center"],
              ],
            ),
            sel(
              "John Knox brought Reformation to Scotland in 1560 through…",
              "The Scots Confession and Reformed parish churches",
              ["A papal appointment", "Royal marriage", "The Spanish armada"],
              "Knox — galley slave turned preacher — pushed the Scots Parliament to adopt the Scots Confession (1560). It was Knox himself who called Geneva 'the most perfect school of Christ that ever was in the earth since the days of the Apostles' — and shipped the school home.",
            ),
          ],
        },
        {
          title: "Reformed Life Today",
          challenges: [
            info(
              "The wide Reformed world",
              "~80 million: Presbyterian Church (USA), Presbyterian Church in America, Orthodox Presbyterian, Dutch Reformed & Christian Reformed, rapid Reformed growth in Africa (the Church of Central Africa Presbyterian, the Presbyterian churches of Ghana and Kenya), plus the 'young, restless, Reformed' revival of the 2000s. Confessions vary (Westminster, Belgic, Heidelberg, Canons of Dort) — the shared DNA: God's sovereignty, covenant, confessional clarity.",
            ),
            sel(
              "The Heidelberg Catechism (1563) opens with…",
              "'What is your only comfort in life and death?' — I am not my own, but belong to Christ",
              ["The Ten Commandments", "The Lord's Prayer", "The book of Psalms"],
              "Q1: '…that I, with body and soul, in life and death, am not my own, but belong to my faithful Savior Jesus Christ.' The catechism's warm 'comfort' tone marks German Reformed piety.",
            ),
            assist(
              "Complete 1 Peter 1:5 (the perseverance text): '…who by God's ______ are guarded through faith for a salvation ready to be revealed.'",
              "'by God's ___ are guarded'",
              "power",
              ["anger", "silence", "chance"],
              "Power — perseverance is GOD's guarding, not our grip: kept 'through faith' by the One who holds both ends of the rope.",
            ),
            match(
              "Match the Reformed confession to its home",
              [
                ["Westminster Standards", "Presbyterians (Britain, America)"],
                ["Belgic Confession & Canons of Dort", "Dutch Reformed churches"],
                ["Heidelberg Catechism", "German Reformed piety"],
                ["Scots Confession", "Knox's Scotland, 1560"],
              ],
            ),
            info(
              "Why it still matters",
              "Reformed theology's gifts to the whole church: the Bible's big-story unity (covenant), doctrinal catechesis, and the work-ethic of vocation. Whether or not one holds TULIP, every evangelical has breathed Reformed air: confessions, expository preaching, and the instinct that all of life is under Christ's crown.",
            ),
          ],
        },
      ],
    },
  ],
}
