import { SeedCourse } from "./helpers"
import { info, sel, assist, match, arrange, typeAns } from "./helpers"

// ⚖️ Ethics & the Good Life — the popular companion to natural theology.
export const ethicsCourse: SeedCourse = {
  code: "ethics",
  title: "Ethics & the Good Life",
  subtitle: "From moral facts to moral character",
  description:
    "Meta-ethics, the great rival frameworks, divine command and natural law, and the art of becoming a person of virtue. Learn to think clearly about right and wrong — and to live it.",
  emoji: "⚖️",
  color: "#4D7C0F",
  order: 9,
  units: [
    {
      title: "The Moral Landscape",
      description: "What ethics is, where 'oughts' come from, and the moral law within.",
      emoji: "🗺️",
      color: "#4D7C0F",
      lessons: [
        {
          title: "Three Levels of Ethics",
          challenges: [
            info(
              "Descriptive, normative, meta",
              "DESCRIPTIVE ethics asks WHAT people believe (surveys, anthropology: 'most cultures condemn theft'). NORMATIVE ethics asks what people SHOULD do (theories of right action). META-ethics asks what moral talk even MEANS (are moral claims true or false? objective or projections?). Confusing the levels derails most debates: 'morality evolved' describes origins; it does not answer whether caring for the weak is RIGHT.",
            ),
            sel(
              "'What do cultures actually believe about lying?' belongs to…",
              "🪜 Level check",
              "Descriptive ethics",
              ["Normative ethics", "Meta-ethics", "Chemistry"],
              "Describing beliefs ≠ prescribing behavior. The is/ought gap is the cliff between level one and level two.",
            ),
            sel(
              "Asking whether moral claims can be objectively true belongs to…",
              "🪜 Level check",
              "Meta-ethics",
              ["Descriptive ethics", "Normative ethics", "Sociology"],
              "Meta-ethics is the upstairs questions: what IS goodness? What ARE obligations? The Existence of God course argued the Lawgiver answers this level.",
            ),
            match("Tap the pairs", [
              ["Descriptive", "what people believe"],
              ["Normative", "what people should do"],
              ["Meta-ethics", "what moral talk means"],
              ["Theories (utilitarian etc.)", "normative level"],
            ]),
            assist(
              "The claim 'morality evolved' answers the ___ question, not the grounding question.",
              "Level discipline",
              "descriptive",
              ["meta-ethical", "normative", "eternal"],
              "Origins of the belief ≠ truth of the belief. Knowing why you doubt your map doesn't make the cliff disappear.",
            ),
            info(
              "Why start here?",
              "Ethics done well changes lives; ethics done sloppily licenses anything. Jesus said the greatest commands are to love God and love neighbor — that is normative ethics from the mouth of the Lord. Paul reasons meta-ethically in Romans 2 when he locates the Gentiles' moral knowledge in hearts made by God. The levels are not academic furniture; they are the anatomy of loving God with your mind.",
            ),
          ],
        },
        {
          title: "Where Do 'Oughts' Come From?",
          challenges: [
            info(
              "Moral realism vs anti-realism",
              "MORAL REALISM: some moral claims are objectively true (cruelty is really wrong). ANTI-REALISM comes in flavors: EMOTIVISM ('boo! murder' — moral talk just expresses feelings), PRESCRIPTIVISM (commands, not facts), ERROR THEORY (all moral claims are false — nobody is 'really' wrong), RELATIVISM (true-for-you, not true-for-all). Every flavor pays a price: none can explain why we argue about morals as if truth were at stake — which is exactly what everyone does when wronged.",
            ),
            sel(
              "'Stealing is wrong' merely expresses my disapproval, like 'boo, stealing!' — that is…",
              "🎭 Theory check",
              "Emotivism",
              ["Moral realism", "Natural law theory", "Divine command theory"],
              "Ayer and Stevenson's emotivism. It explains the exclamation but not the ARGUMENTS we build when we take morality seriously.",
            ),
            info(
              "The relativist's trapdoor",
              "If morality is relative to culture, then (a) reformers are always wrong — abolitionists 'sinned' against their culture's slavery; (b) 'culture' is fuzzy (which one? your city? your street? your gang?); (c) the claim 'morality is relative' claims to be true FOR EVERYONE — an objective claim sawing off its own branch. Paul Copan calls relativism the view that trips over its own feet. Most people abandon it the moment they are genuinely wronged: 'that was UNFAIR' — not 'that was unfair-for-me.'",
            ),
            sel(
              "Why does cultural relativism condemn the reformers?",
              "🔧 Trapdoor check",
              "If right = whatever culture approves, opposing your culture's practice is by definition wrong",
              ["Because reformers are usually young", "Because cultures never change", "Because reformers reject science"],
              "On relativism, Wilberforce was immoral until the vote flipped — then moral after. A theory that makes rightness flip with polls has flipped away from reality.",
            ),
            match("Tap the pairs", [
              ["Moral realism", "some morals are objectively true"],
              ["Emotivism", "boo / hurrah"],
              ["Relativism", "true-for-you only"],
              ["Abolitionists", "the reformer's problem for relativism"],
            ]),
            typeAns(
              "Type the one-word label for the view that some moral claims are objectively true",
              "The view with a spine",
              ["realism", "moral realism"],
              "Moral realism — the view nearly everyone assumes while arguing, and which the moral argument grounds in God.",
            ),
          ],
        },
        {
          title: "The Moral Law Within",
          challenges: [
            info(
              "Kant's two things",
              "Immanuel Kant, no evangelical, wrote: 'Two things fill the mind with ever new and increasing admiration and awe… the starry heavens above me and the moral law within me.' Even reason's great architect, working WITHOUT revelation, found conscience as undeniable as the sky. Romans 2:14–15 explains what Kant found: the law written on hearts, consciences bearing witness.",
            ),
            sel(
              "Kant's two fillers of the mind with awe were…",
              "🌠 Quote check",
              "The starry heavens above and the moral law within",
              ["The sea and the mountains", "Logic and grammar", "Money and fame"],
              "A non-Christian philosopher confirming what Scripture says about hearts: the moral law is written, and it is FELT.",
            ),
            info(
              "Conscience: proper use",
              "Conscience is the faculty that judges actions in light of the moral law — but it must be FORMED. Luther's 'my conscience is captive to the Word of God' shows the two-part engine: conscience testifies, revelation calibrates. An unformed conscience can be seared (1 Tim 4:2), weak (1 Cor 8), or wrongly burdened — which is why ethics is a discipline, not just a feeling.",
            ),
            assist(
              "Luther said his conscience was captive to the ___ of God.",
              "Calibrating the compass",
              "word",
              ["emotion", "tradition", "council"],
              "Conscience testifies; Scripture calibrates. A compass next to a true north.",
            ),
            arrange(
              "Order the moral-epistemology chain",
              "How moral knowledge flows",
              ["God's nature is the good", "The moral law reflects that nature", "Conscience reads the law", "Calibrated conscience guides action"],
              ["Feelings vote on truth", "Culture defines the good forever"],
              "From the Lawgiver's nature, to law, to heart, to habit — ethics in four beats.",
            ),
            info(
              "🗺️ Unit complete!",
              "You can now sort ethical questions into their levels, diagnose relativism's self-trap, and locate conscience in the biblical architecture. Next: the great rival theories of right action — utilitarianism, deontology, and virtue.",
            ),
          ],
        },
      ],
    },
    {
      title: "Rival Frameworks",
      description: "Utilitarianism, deontology and virtue ethics — strengths, failures, and what each sees truly.",
      emoji: "⚔️",
      color: "#3F6212",
      lessons: [
        {
          title: "Utilitarianism",
          challenges: [
            info(
              "The greatest happiness principle",
              "Bentham and Mill's utilitarianism: the right act maximizes happiness for the greatest number. Its genius: impartiality (everyone counts equally — no castes) and practicality (policy, medicine and economics use its math daily). Its engine is CONSEQUENCES — and only consequences.",
            ),
            sel(
              "Utilitarianism judges actions solely by…",
              "🧮 Theory check",
              "Their consequences for overall happiness",
              ["The intentions behind them", "Their conformity to duty", "The character they express"],
              "If the outcome is maximal happiness, the act is right — whatever its other features. Hold that thought…",
            ),
            info(
              "The trolley and the transplant",
              "A runaway trolley will kill five; you can divert it to kill one. Most people say divert. But now a surgeon could harvest one healthy patient's organs to save five dying ones — same arithmetic, and almost everyone refuses. The refusal is data: we believe persons are not raw materials. Utilitarianism cannot explain the difference; it just adds the numbers. When a theory must shrug at harvesting the innocent, the theory — not the intuition — is on trial.",
            ),
            sel(
              "The transplant case exposes utilitarianism's trouble with…",
              "🏥 Intuition check",
              "The dignity of persons as ends, not resources",
              ["Its inability to do arithmetic", "Its rejection of science", "Its love of rules"],
              "Five lives saved vs one harvested — if numbers were everything, the surgeon should operate. We know better; the numbers are not everything.",
            ),
            info(
              "More cracks in the throne",
              "(1) CALCULATION: happiness can't be measured across persons — whose units? (2) TYRANNY: the majority's happiness can license crushing a minority — permanently. (3) JUSTICE: on pure utilitarianism, punishing an innocent scapegoat to prevent riots is RIGHT if it maximizes welfare. (4) INTEGRITY: your deepest commitments (family, promises, truth) count for nothing special — just more happiness-sand on the scale. Note the lesson: consequences MATTER (Scripture is pro-wisdom!) but they cannot be the WHOLE of morality.",
            ),
            match("Tap the pairs — utilitarianism's cracks", [
              ["Measurement problem", "happiness has no common units"],
              ["Tyranny problem", "majority may crush minority"],
              ["Justice problem", "scapegoating the innocent"],
              ["Integrity problem", "promises count for nothing special"],
            ]),
          ],
        },
        {
          title: "Deontology",
          challenges: [
            info(
              "Duty, not arithmetic",
              "Kant's deontology: right actions conform to DUTY — to moral law reason itself can will as universal. The Categorical Imperative asks: 'Act only on maxims you could will as universal law.' Lying cannot be universalized (trust would collapse, making lying pointless), so lying is wrong — full stop, whatever the payout. Persons must be treated 'always as ends, never merely as means.'",
            ),
            sel(
              "Kant's universalization test asks…",
              "🧭 Formula check",
              "Could everyone act on this rule without destroying it?",
              ["Does this maximize happiness overall?", "Would my culture approve?", "Does this feel right to me?"],
              "Universalizability filters rules by consistency — a rule that eats itself when universalized (promise-breaking, lying) is out.",
            ),
            info(
              "What deontology sees truly",
              "Kant's framework honors what utilitarianism flattened: DIGNITY (persons are priceless, beyond price-tags), UNIVERSALITY (moral law binds everyone, everywhere), and the motive of DUTY (the shopkeeper who deals honestly from fear vs respect for the law — only the second is moral worth). Imago Dei echoes through 'ends in themselves' — Kant, building on Christian intuitions, re-derived the sacredness of persons without the theological foundation.",
            ),
            sel(
              "'Treat persons always as ends, never merely as means' echoes which biblical doctrine?",
              "📖 Bridge check",
              "Imago Dei — every person bears God's image",
              ["Original sin", "The Sabbath command", "Circumcision"],
              "Kant secularized the sacredness of persons — the Christian root shows through the Enlightenment foliage.",
            ),
            info(
              "Deontology's blind spots",
              "(1) RIGIDITY: Kant infamously said you may not lie to a murderer at the door asking for his victim — duty forbids lying, period. (2) CONFLICTING DUTIES: when truth-telling and life-protecting collide, Kant's system offers no referee — no higher court to weigh duties against each other. (3) LEGALISM'S SHADOW: rule-focus can miss the heart — the Pharisees kept rules and missed love, the law's weightier matters (Matt 23:23). Duty is real; it is not yet the whole of the good life.",
            ),
            match("Tap the pairs", [
              ["Categorical Imperative", "universalizable maxims"],
              ["Ends in themselves", "person's dignity"],
              ["Rigidity problem", "truth to the murderer"],
              ["Conflicting duties", "no referee between rules"],
              ["Pharisee warning", "rules without love"],
            ]),
          ],
        },
        {
          title: "Virtue Ethics",
          challenges: [
            info(
              "Aristotle's question: what kind of person?",
              "Virtue ethics shifts the question from 'what act is right?' to 'what person should I BE?' A virtue (aretē) is a stable character trait — courage, generosity, honesty — that a human needs to FLOURISH (eudaimonia). You become brave by doing brave things: virtue is habituated, like strength from training. The virtuous person doesn't grit teeth through right action; she delights in it.",
            ),
            sel(
              "Virtue ethics centers ethics on…",
              "🏛️ Focus check",
              "Character — the kind of person one becomes",
              ["Calculating outcomes act by act", "Following universal rules without exception", "Obeying whatever feels right"],
              "Acts still matter — but as TRAINING and EXPRESSION of character. Ask of any choice: what will this make me?",
            ),
            info(
              "The Christian retrieval",
              "Aquinas baptized Aristotle's framework: virtues are perfections of powers God gave; grace heals and elevates them (faith, hope, love + prudence, justice, fortitude, temperance). Paul's fruit-of-the-Spirit list (Gal 5) is virtue-talk: love, joy, peace, patience… GROWING in a life. Scripture is deeply virtue-shaped: 'train yourself for godliness' (1 Tim 4:7), 'be doers' (Jas 1:22). The Sermon on the Mount aims at the HEART, not just behavior — exactly virtue's target.",
            ),
            assist(
              "Aristotle's term for human flourishing — the goal of the virtuous life — is ___.",
              "Vocabulary",
              "eudaimonia",
              ["hubris", "kairos", "agape"],
              "Eudaimonia — flourishing, living well, the life characteristic of a fully-realized human being.",
              "eu-dai-mo-NEE-a"
            ),
            info(
              "The frameworks in one frame",
              "Here is the integration Christians offer: UTILITARIANISM sees truly that consequences matter (wisdom considers outcomes — Prov 22:3). DEONTOLOGY sees truly that duties bind (God commands). VIRTUE ETHICS sees truly that character is the goal (Christlikeness). What unifies them? A personal God who is wise (outcomes), lawful (duties), and good (character). Christianity doesn't choose one lens — it explains why all three see something real: ethics' three-legged stool.",
            ),
            match("Tap the pairs — frameworks and their truths", [
              ["Utilitarianism", "consequences matter"],
              ["Deontology", "duties bind"],
              ["Virtue ethics", "character is the goal"],
              ["Christian integration", "a good God grounds all three"],
            ]),
            info(
              "⚔️ Unit complete!",
              "You can now run the three great frameworks, spot their strengths and failures, and see how Christian ethics gathers their truths. Next: the distinctively Christian accounts — divine command and natural law — and the Euthyphro question again, this time in full battle dress.",
            ),
          ],
        },
      ],
    },
    {
      title: "Divine Command & Natural Law",
      description: "Is it good because God commands it? Can morality be known by reason alone?",
      emoji: "📜",
      color: "#365314",
      lessons: [
        {
          title: "Divine Command Theory",
          challenges: [
            info(
              "What DCT actually claims",
              "Divine Command Theory: moral OBLIGATIONS arise from God's commands — God's will is the source of duty, not of goodness itself. Careful reading: goodness flows from God's NATURE; obligations flow from God's COMMANDS. 'You shall not murder' binds because the One whose nature is love and justice commands it — and His commands EXPRESS His character. The Euthyphro dilemma (good because commanded? commanded because good?) is answered by the third option: commanded BECAUSE the Commander IS the good.",
            ),
            sel(
              "On refined DCT, God's commands are the source of…",
              "🔬 Precision check",
              "Moral obligation — while goodness flows from His nature",
              ["Goodness itself, invented arbitrarily", "Nothing at all", "Physical laws of nature"],
              "Nature grounds good; commands constitute duty. Distinguish the rails and the train and the dilemma dissolves.",
            ),
            info(
              "Abraham's test — command vs character",
              "The hardest case: God commands Abraham to sacrifice Isaac (Gen 22). Critics ask: does DCT mean God could command ANYTHING — cruelty, child sacrifice — and make it right? Three replies: (1) The command came to STOP, and the test exposed Abraham's total trust — never ratifying child sacrifice (indeed the pagans' child sacrifice is condemned throughout Scripture). (2) God's commands cannot contradict His revealed character. (3) The very next revelation deepens: 'Now I know that you fear God, BECAUSE you have not withheld your son' — and God provides the substitute ram, the whole scene pointing to Calvary's logic: God Himself provides the sacrifice.",
            ),
            sel(
              "Why does Genesis 22 not ratify child sacrifice?",
              "🐐 Passage check",
              "God stopped the sacrifice and provided a substitute — and Scripture condemns child sacrifice elsewhere",
              ["Because Isaac was too old", "Because Abraham refused the command", "Because Sarah objected loudly"],
              "The story ends with provision, not slaughter — and with a foreshadowing of the Lamb God Himself will provide.",
            ),
            typeAns(
              "Type the Greek word for 'nature' used in the phrase 'God's ___ is the good' (also the source of 'essential')",
              "Vocabulary",
              ["essence", "ousia"],
              "Essence (ousia) — what a thing IS. God's essence includes goodness; commands flow from it like light from flame.",
            ),
          ],
        },
        {
          title: "Natural Law",
          challenges: [
            info(
              "What anyone with reason can read",
              "Natural law (Aquinas, building on Aristotle and Paul): the moral order is built into the NATURE of things — into what humans ARE — and reason can read it. 'The light of natural reason' participates in God's eternal law (Romans 1:20 & 2:14–15: Gentiles who 'do by nature what the law requires'). Basic goods (life, family, knowledge, society) and their requirements are knowable WITHOUT special revelation — which is why believers and unbelievers can reason together about justice.",
            ),
            sel(
              "Natural law ethics claims morality is…",
              "🌿 Source check",
              "Built into human nature and knowable by reason",
              ["Revealed only in Scripture", "Invented by each culture", "A matter of private feeling"],
              "The moral structure of the world is public — readable by anyone with functioning reason, because it is written into creation.",
            ),
            info(
              "The precepts",
              "Aquinas' first precept: do good, avoid evil. From human nature flow the primary precepts — preserve life, form families and raise children, seek truth, live in society. From these, secondary rules (against murder, for honesty) by reasoning about circumstances. Paul appeals to natural law reasoning before pagans (Acts 14:17, 17:26–29) — shared creation is shared ground for moral argument.",
            ),
            match("Tap the pairs", [
              ["Eternal law", "God's rational order"],
              ["Natural law", "reason's grasp of the order"],
              ["Primary precepts", "life, family, truth, society"],
              ["Romans 2:14", "Gentiles doing law by nature"],
              ["Shared creation", "common moral ground"],
            ]),
            sel(
              "A danger natural law guards against, and a danger IT must guard against:",
              "⚖️ Balance check",
              "Morality-as-arbitrary-revelation — and proud autonomy that ignores revelation",
              ["Natural law rejects all reasoning", "Natural law forbids reading Scripture", "It teaches that ethics is unknowable"],
              "Grace does not destroy nature but perfects it: revelation heals and completes what sin bends; reason without grace still bends. Both/and, not either/or.",
            ),
          ],
        },
        {
          title: "Grace & the Good",
          challenges: [
            info(
              "Beyond rule-keeping",
              "Christian ethics is not merely divine-command legalism plus natural-law reasoning — it is PARTICIPATION in the life of God. 'You shall be holy, for I am holy' (1 Pet 1:16). The Sermon on the Mount outruns every rule-system: not just no murder — no contempt; not just no adultery — no lustful intent; love ENEMIES, not just neighbors. The bar is the character of God Himself — reachable only by grace, in union with Christ, by the Spirit.",
            ),
            sel(
              "The Sermon on the Mount teaches that righteousness targets…",
              "⛰️ Sermon check",
              "The transformed heart, not only outward behavior",
              ["Only external compliance with rules", "Correct temple attendance", "Political revolution first"],
              "Anger, lust, hypocrisy, anxiety, enemy-hatred — the Sermon aims the arrow at the inner person. Character again.",
            ),
            info(
              "Grace is not morality's rival",
              "A common confusion: 'grace means ethics doesn't matter.' Paul answers: 'Shall we continue in sin that grace may abound? May it never be!' (Rom 6:1–2). Grace forgives the past AND transforms the present: 'the grace of God has appeared… training us to renounce ungodliness' (Titus 2:11–12). Grace TRAINS — like a coach, not an indulgence. The moral life is grateful response, not wage-earning: we obey from acceptance, not for it.",
            ),
            assist(
              "Titus 2 says grace ___ us to renounce ungodliness — grace as coach, not indulgence.",
              "The training grace",
              "trains",
              ["excuses", "forbids", "ignores"],
              "Charis trains (paideuousa) — grace disciplines its recipients toward godliness. Forgiveness fuels formation.",
            ),
            info(
              "📜 Unit complete!",
              "You can now state refined divine command theory, walk natural law from eternal law to precepts, and explain how grace perfects rather than cancels ethics. One unit remains: the good life itself — virtue formed into habit.",
            ),
          ],
        },
      ],
    },
    {
      title: "The Good Life",
      description: "Character, hard choices, and a hope that outlives the world.",
      emoji: "🌱",
      color: "#3F6212",
      lessons: [
        {
          title: "Character Formation",
          challenges: [
            info(
              "Habits make the human",
              "Aristotle: 'We are what we repeatedly do.' Aquinas: virtue is a habitus — a stable disposition. Scripture agrees with startling energy: 'train yourself for godliness' (1 Tim 4:7); 'discipline… yields the peaceful fruit of righteousness' (Heb 12:11). The spiritual disciplines (prayer, Scripture, fasting, fellowship, service) are virtue's gymnasium. Nobody drifts into Christlikeness; grace works through means, and the means are practices.",
            ),
            sel(
              "Virtue, on the classical view, is best described as…",
              "🏋️ Concept check",
              "A stable character trait built through practiced acts",
              ["A mood that visits occasionally", "A rule written on stone", "A talent you're born with fully formed"],
              "Courage is built by courageous acts, generosity by generous ones. You become what you practice — grace supplying the power.",
            ),
            info(
              "The fruit list",
              "Galatians 5:22–23 — love, joy, peace, patience, kindness, goodness, faithfulness, gentleness, self-control. Note: FRUIT, not achievements. Fruit grows on a living branch connected to the Vine (John 15): 'apart from me you can do nothing.' The externals of virtue flow from communion — abiding precedes abounding. Yet branches get pruned, and gardeners expect growth: fruit is observable, forming, gradual.",
            ),
            match("Tap the pairs — formation means", [
              ["Prayer", "communion with God"],
              ["Scripture", "renewing the mind"],
              ["Fasting", "loosening appetite's grip"],
              ["Fellowship", "iron sharpening iron"],
              ["Service", "love in practice"],
            ]),
            typeAns(
              "Type the chapter of Galatians where the fruit of the Spirit is listed (number only)",
              "The fruit chapter",
              ["5", "galatians 5", "five"],
              "Galatians 5:22 — nine facets of one fruit, grown on the Vine.",
            ),
          ],
        },
        {
          title: "Hard Choices",
          challenges: [
            info(
              "When frameworks converge — and when they argue",
              "Truth-telling: all three frameworks plus Scripture agree (honesty builds trust, is universalizable, expresses integrity, images the God of truth). But hard cases strain them: may I lie to protect Jews from Nazis at the door? May a Christian ever fight in a just war? How do I weigh career against caring for a dying parent? These are CASES for trained judgment — what the tradition calls practical wisdom (phronesis): the virtue of seeing the right thing, in this situation, and doing it.",
            ),
            sel(
              "The virtue for navigating hard cases — seeing the right action in concrete situations — is…",
              "🧠 Practical check",
              "Practical wisdom (phronesis / prudence)",
              ["Clever calculation only", "Blind obedience to rules", "Following the strongest feeling"],
              "Prudence is 'right reason about things to be done' — the charioteer of the virtues. Rules without prudence crash on the rocks of real life.",
            ),
            info(
              "Justice for the vulnerable",
              "Biblical ethics has a stress-test: 'Religion that is pure and undefiled before God is this: to visit orphans and widows in their affliction' (Jas 1:27). The prophets thunder not about ritual precision but about the poor, the foreigner, the laborer's wage. Any 'ethics' that leaves the vulnerable untouched is pharisaism in academic dress. Generosity is not charity-as-spare-change but covenant love with its wallet open.",
            ),
            sel(
              "The prophets' recurring moral indictment targeted…",
              "📣 Prophet check",
              "Injustice to the poor, the foreigner and the vulnerable",
              ["Small ritual errors only", "Wrong musical instruments", "Short sermons"],
              "'Let justice roll down like waters' (Amos 5) — worship divorced from righteousness was the target, again and again.",
            ),
            info(
              "Embodied ethics",
              "Christian ethics covers the whole person: sexuality (covenant faithfulness, body as temple), speech (truth, no corrosive talk), work (as unto the Lord), money (generosity, no mammon-worship), technology and attention (what you behold you become). No zone is neutral; every habit is formation. 'Whether you eat or drink, or whatever you do, do all to the glory of God' (1 Cor 10:31).",
            ),
          ],
        },
        {
          title: "Flourishing Forever",
          challenges: [
            info(
              "The beatitudes' inversion",
              "The world's good life: rich, laughing, applauded, comfortable. Jesus' list: poor in spirit, mourning, meek, hungering for righteousness, merciful, pure, peacemaking, persecuted — 'theirs is the kingdom of heaven.' The deepest flourishing is not comfort but COMMUNION — and communion often grows in hardship the way roots grow in winter. Christian ethics ends in hope: the good life is not an emotion but a Person, and the Person is risen.",
            ),
            sel(
              "The beatitudes locate true flourishing in…",
              "🌄 Sermon check",
              "Communion with God — even through poverty, mourning and persecution",
              ["Constant comfort and applause", "Political victory over enemies", "Perfect health forever now"],
              "'Rejoice and be glad, for great is your reward in heaven' — the timeline of the good life runs through eternity.",
            ),
            info(
              "Why hope is not wishful thinking",
              "Christian ethics' final move is eschatological: the resurrection of Jesus is the down-payment that the moral order is not a delusion and suffering is not the last word. C.S. Lewis: 'If you read history you will find that the Christians who did most for the present world were just those who thought most of the next.' Hope does not anesthetize — it inoculates, freeing us from despair AND from the tyranny of building heaven on earth by any means necessary.",
            ),
            match("Tap the pairs — the good life's grammar", [
              ["Beatitudes", "flourishing through communion"],
              ["Resurrection", "hope's down payment"],
              ["Prudence", "wisdom for hard cases"],
              ["Justice", "love for the vulnerable"],
              ["Glory of God", "the end of every act"],
            ]),
            info(
              "⚖️ Course complete!",
              "From meta-ethics to the beatitudes: you can now map the moral landscape, weigh the great frameworks, state refined divine command theory and natural law, and aim your own formation at Christlikeness. The good life is not a formula — it is a Person, practiced daily, in the company of the saints. Go and do likewise.",
            ),
          ],
        },
      ],
    },
  ],
}
