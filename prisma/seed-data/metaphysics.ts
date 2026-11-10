import { SeedCourse } from "./helpers"
import { info, sel, assist, match, arrange, typeAns } from "./helpers"

// 🌀 Metaphysics — the deep, complex grammar of being. The course for
// learners who want the nuance beneath the arguments.
export const metaphysicsCourse: SeedCourse = {
  code: "metaphysics",
  title: "Metaphysics",
  subtitle: "The deep grammar of reality",
  description:
    "Being, change, causality, essence, universals, time, and freedom — the concepts theology thinks with when it thinks hardest. The most nuanced course in the academy: proceed slowly, reread, and let the concepts settle.",
  emoji: "🌀",
  color: "#475569",
  order: 11,
  units: [
    {
      title: "First Philosophy",
      description: "What metaphysics is, the categories of being, and why theology cannot live without it.",
      emoji: "🗿",
      color: "#475569",
      lessons: [
        {
          title: "What Is Metaphysics?",
          challenges: [
            info(
              "Beyond the physics",
              "Aristotle called it 'first philosophy' — the study of being AS being (on he on). Physics studies beings THAT change (rocks, stars, cells); metaphysics studies what it means to BE at all: what exists, what things are, how change is possible, what causation is, whether universals are real. The name came later: the editors placed these books AFTER (meta) the Physics. First in dignity, last in the library.",
            ),
            sel(
              "Metaphysics studies…",
              "🗿 Definition check",
              "Being as being — what it means to exist at all",
              ["Only particles smaller than atoms", "Only religious doctrines", "Human behavior in markets"],
              "Physics studies physical beings; metaphysics studies the conditions of ANY being whatsoever — the floor beneath physics' feet.",
            ),
            info(
              "The questions that will not sit down",
              "Why is there something rather than nothing? What is a THING — this apple over-against its properties (red, round, sweet)? Can things really change, or is change an illusion? What is a CAUSE? Do numbers exist? Is the future real? Is your self your body, your brain, your soul? Each question sounds simple until you try to answer it. Welcome to the oldest and hardest seminar in civilization.",
            ),
            sel(
              "'What is a cause, really?' is a question of…",
              "🧩 Sorting check",
              "Metaphysics",
              ["Physics", "Grammar", "Politics"],
              "Physics USES causes constantly; asking what causation IS steps off the lab bench into first philosophy.",
            ),
            match("Tap the pairs — sciences and their objects", [
              ["Physics", "changing material beings"],
              ["Mathematics", "quantity and structure"],
              ["Metaphysics", "being as being"],
              ["Theology", "God and all things relative to God"],
            ]),
            typeAns(
              "Type the two-word label Aristotle gave metaphysics (____ philosophy)",
              "Aristotle's label",
              ["first philosophy", "first"],
              "First philosophy — first because everything else borrows its concepts: thing, cause, change, time, possibility.",
            ),
          ],
        },
        {
          title: "The Categories of Being",
          challenges: [
            info(
              "Aristotle's filing cabinet",
              "When you say 'Socrates is a human sitting in the marketplace, taller than Plato, wearing a cloak,' you have used Aristotle's categories: SUBSTANCE (Socrates — the thing itself), QUANTITY (taller), QUALITY (pale), RELATION (than Plato), PLACE, TIME, POSITION, HABIT (clothed), ACTION, PASSION. Substance is the anchor; the other nine are accidents that INHERE in it. Without this grammar, sentences about reality collapse into a blur.",
            ),
            sel(
              "In Aristotle's categories, 'Socrates' himself is a…",
              "🗂️ Category check",
              "Substance",
              ["Quality", "Relation", "Quantity"],
              "Substance = the individual thing that exists in itself. Accidents exist IN it: his height, his paleness, his location.",
            ),
            info(
              "Why theology needs this grammar",
              "Now the payoff — read the Nicene Creed with categories in hand: Christ is 'of one SUBSTANCE (ousia) with the Father' — not one quality, not one person, but one WHAT. The Creed is metaphysics on its knees. Likewise the Trinity: one ousia (what), three hypostases (who). And the incarnation: two natures (divine and human WHATS) in one person (WHO). Strip away substance/nature/person distinctions and the sentences of Nicaea and Chalcedon become ungrammatical nonsense.",
            ),
            sel(
              "Why did the church need 'one substance (ousia) with the Father'?",
              "⛪ Creed check",
              "To say the Son shares the very WHAT of God — not merely similar qualities",
              ["To honor Greek philosophers", "To shorten the creed", "To describe Mary's role"],
              "Arius could say the Son is LIKE God (a quality); Nicaea insisted He IS God (substance). The category carried the gospel.",
            ),
            match("Tap the pairs — the grammar of the creeds", [
              ["Ousia", "what something is"],
              ["Hypostasis/person", "who something is"],
              ["Nicaea 325", "one substance with the Father"],
              ["Chalcedon 451", "two natures, one person"],
            ]),
            assist(
              "The category for the individual thing that exists in itself — the anchor of the other nine — is ___.",
              "Vocabulary",
              "substance",
              ["accident", "relation", "passion"],
              "Substance (ousia in Greek, substantia in Latin): the this-that-it-is; accidents ride in it like passengers.",
            ),
          ],
        },
        {
          title: "Why Metaphysics Matters",
          challenges: [
            info(
              "The scorched ground of the 20th century",
              "Logical positivists tried to abolish metaphysics: only science speaks meaningfully; 'God exists' is neither true nor false but NONSENSE. The abolition collapsed on its own terms — 'only verifiable statements are meaningful' is itself unverifiable: the principle fails its own test. Metaphysics survived every attempt to kill it because questions about being, causation and persons never stop pressing. Today's philosophy of religion is metaphysics' phoenix.",
            ),
            sel(
              "Why did logical positivism self-destruct?",
              "🔥 Self-reference check",
              "Its own verification principle is unverifiable by its own standard",
              ["It was written in German", "It proved too many theorems", "It was refuted by biology"],
              "'Only the verifiable is meaningful' is not itself verifiable — the theory executes itself. Metaphysics outlived its executioners.",
            ),
            info(
              "Metaphysical errors have body counts",
              "Ideas have consequences, and bad metaphysics walks on feet: if humans are merely advanced matter (crude materialism), the weak are recyclable material — every atrocity of the last century borrowed its permission from a metaphysics. If persons are illusions, contracts are void; if change is illusion, repentance is impossible; if universals are mere names, 'human dignity' is a noise. Theology's heresies, likewise, are usually metaphysics gone wrong wearing vestments.",
            ),
            sel(
              "Why does 'human dignity' need metaphysical roots?",
              "🧬 Dignity check",
              "A DIGNITY that binds requires a real human NATURE — not just a word we apply",
              ["Because dignity is a chemical", "Because votes create natures", "Because dignity is a mood"],
              "If 'human' names nothing real, 'human rights' protects nothing real. Nominalism's knife cuts the legs off the rights table.",
            ),
            arrange(
              "Order the case for studying metaphysics",
              "The apology for first philosophy",
              ["Every discipline borrows metaphysical concepts", "The creeds speak in metaphysical grammar", "Metaphysical errors have real-world costs", "Therefore first philosophy is first in dignity"],
              ["Metaphysics replaced physics entirely", "All questions are already solved"],
              "First not by difficulty but by position: the floor under every other floor.",
            ),
            info(
              "🗿 Unit complete!",
              "You know what metaphysics is, hold Aristotle's categories, and can explain why the creeds think in their grammar. Next: the first great puzzle — change. How can anything become, without ceasing to be?",
            ),
          ],
        },
      ],
    },
    {
      title: "Change & Causality",
      description: "Parmenides' riddle, act and potency, the four causes, and the principle of sufficient reason.",
      emoji: "🌊",
      color: "#334155",
      lessons: [
        {
          title: "The Problem of Change",
          challenges: [
            info(
              "Heraclitus vs Parmenides",
              "Heraclitus: all is flux — 'you cannot step into the same river twice.' Parmenides: being IS, non-being IS NOT — therefore change is IMPOSSIBLE, motion a delusion of the senses. His student Zeno sharpened the paradox: Achilles can never catch the tortoise (each time he arrives, it has advanced); the flying arrow is motionless (at each instant it occupies its own space). The senses scream CHANGE; the reasons scream CONTRADICTION.",
            ),
            sel(
              "Parmenides argued change is impossible because…",
              "🏛️ Riddle check",
              "Being cannot come from non-being — so 'coming-to-be' is incoherent",
              ["Motion is too slow to observe", "Rivers are never the same anyway", "God forbids change"],
              "For something to change it would have to BE what it is NOT yet — Parmenides saw the tension and chose to abolish becoming.",
            ),
            info(
              "The tension is real",
              "Take the green apple turning red. Before: green-not-red. After: red-not-green. If the apple is SIMPLY green (just green, nothing else), it can never be red without ceasing to exist. If it is SIMPLY red later, where did redness come from? Either the fruit is destroyed and replaced (not change) or something in it was open to redness BEFORE it was red. Common sense says the second. Parmenides said the first. Aristotle found the third way — next lesson.",
            ),
            sel(
              "The apple puzzle presses the question…",
              "🍎 Tension check",
              "How can the same thing be potentially what it is not yet actually?",
              ["Whether apples are good to eat", "Whether red and green exist", "Whether time is measurable by clocks"],
              "Change needs a subject that STAYS while its states shift. Pure permanence freezes; pure flux evaporates. The apple awaits Aristotle.",
            ),
            match("Tap the pairs — the two elders", [
              ["Heraclitus", "all is flux"],
              ["Parmenides", "change is impossible"],
              ["Zeno", "arrow and tortoise paradoxes"],
              ["The task", "save both change and being"],
            ]),
          ],
        },
        {
          title: "Act & Potency",
          challenges: [
            info(
              "Aristotle's rescue",
              "The apple is ACTUALLY green and POTENTIALLY red. POTENCY is real-not-yet: a real capacity grounded in what the thing is (a stone has no potency to turn red when ripe — an apple does). ACT is what is, here and now. Change = the REDUCTION of potency to act. Nothing becomes what it had zero potency to become. The river stays a river (substance endures) while its waters shift (accidents change). Heraclitus gets the accidents, Parmenides gets the substance — both are right about HALF.",
            ),
            sel(
              "'Potency' is best defined as…",
              "⚖️ Definition check",
              "A real capacity to be something not yet actual",
              ["A logical contradiction", "A statistical probability only", "An illusion of the senses"],
              "Potency is real (grounded in the thing's nature) but not actual. It is the metaphysical hinge that lets change be real without chaos.",
            ),
            info(
              "The principle of act and potency",
              "Now the deep rule, and it is load-bearing for natural theology: NOTHING reduces itself from potency to act. The green apple cannot make itself red — sun, soil and season must act on it. Ice cannot unfreeze itself; a cold room stays cold. Whatever MOVES from could-be to is MUST be moved by another ALREADY ACTUAL. This is the seed of Aquinas' First Way: whatever is moved is moved by another, and the chain of movers cannot regress to infinity in act — there must be a First Mover, PURE ACT (actus purus), whose essence is to act with nothing potential left to actualize.",
            ),
            sel(
              "Why can nothing reduce ITSELF from potency to act?",
              "🔄 Principle check",
              "To actualize itself it would already have to be actual in that respect",
              ["Because things are lazy by nature", "Because Aristotle forbade it personally", "Because change is always slow"],
              "The unheated cannot heat; the untaught cannot teach themselves what they lack. Potency stays passive until an already-actual agent arrives.",
            ),
            match("Tap the pairs", [
              ["Act", "what is, here and now"],
              ["Potency", "real capacity, not yet"],
              ["Change", "potency reduced to act"],
              ["Pure act (actus purus)", "God, no unactualized capacity"],
              ["First Way", "the unmoved Mover"],
            ]),
            typeAns(
              "Type Aquinas' Latin phrase for God as pure actuality (two words)",
              "Latin check",
              ["actus purus", "purus actus"],
              "Actus purus — pure act. In God there is no waiting room: all that could be actual IS actual.",
            ),
          ],
        },
        {
          title: "The Four Causes",
          challenges: [
            info(
              "Four answers to 'why?'",
              "Ask why a bronze statue exists: MATERIAL cause (the bronze), FORMAL (the shape imposed), EFFICIENT (the sculptor), FINAL (the purpose — to honor the general). Aristotle: to know a thing is to know all four. Modern science deliberately narrowed to the efficient (and mathematized it) — magnificent for prediction, myopic for UNDERSTANDING. A biology that refuses to ask what hearts are FOR (pumping blood) cannot even identify what a heart IS.",
            ),
            sel(
              "The sculptor is which cause of the statue?",
              "🗿 Cause check",
              "Efficient",
              ["Material", "Formal", "Final"],
              "Material = bronze; formal = the shape; efficient = the sculptor; final = the purpose. Four whys, one statue.",
            ),
            info(
              "Teleology: the forbidden question",
              "FINAL CAUSES (telos = purpose-end) are the scandal. Modern philosophy, following Bacon and Descartes, banished purposes from physics: describe mechanisms, never ends. But the ban cannot hold even in the lab: 'the heart's FUNCTION is to pump blood', 'the eye is FOR seeing', natural selection 'selects FOR' fitness — smuggled teleology everywhere. The theist says the smuggling is no accident: a world shot through with pointings-toward is a world made by an Intender.",
            ),
            sel(
              "Why do critics say biology smuggles in teleology?",
              "🎯 Smuggling check",
              "Functional language ('for pumping', 'selects for') presupposes ends science claims to banish",
              ["Because biologists are lazy", "Because hearts change species", "Because functions are illusions of grammar"],
              "You cannot say what a heart IS without saying what it is FOR. Ends are the skeleton in mechanism's closet.",
            ),
            info(
              "Hume's guillotine and the PSR",
              "David Hume reduced causation to CONSTANT CONJUNCTION: we see A-then-B, feel expectation, and CALL it causation — no real connection observed. The skeptical edge cuts deep, but notice: Hume's own account presupposes regularity needing explanation, and no one — including Hume — lives as if fire might not burn tomorrow. Aquinas' alternative: causation is the actualizing of potency by an agent's act — a real metaphysical relation. Behind it stands the Principle of Sufficient Reason: everything has an explanation — the engine of the contingency argument you already know.",
            ),
            match("Tap the pairs", [
              ["Material cause", "what it's made of"],
              ["Formal cause", "the structure it has"],
              ["Efficient cause", "the agent that made it"],
              ["Final cause", "the end it's for"],
              ["Hume", "constant conjunction only"],
            ]),
            info(
              "🌊 Unit complete!",
              "You can now solve Parmenides' riddle with act and potency, name all four causes, and explain why purpose refuses to leave science. Next: the deepest distinction in the tradition — what a thing is versus THAT it is.",
            ),
          ],
        },
      ],
    },
    {
      title: "Essence & Existence",
      description: "The distinction that delivers God: ipsum esse subsistens.",
      emoji: "🕯️",
      color: "#1E293B",
      lessons: [
        {
          title: "What vs That",
          challenges: [
            info(
              "Two questions everything answers",
              "Of anything you can ask WHAT it is (its essence — the answer to 'define it') and THAT it is (its existence — the fact that there's one here). For everything in your experience, the two come apart: you can perfectly define a phoenix without there being any; the definition of 'unicorn' contains no existing. In creatures, essence and existence are really distinct — your essence (humanity) does not BY ITSELF hand you existence; you receive it, moment by moment, like a lamp plugged into a grid.",
            ),
            sel(
              "The fact that you can define a unicorn without there being any shows…",
              "🦄 Distinction check",
              "Essence and existence are distinct — what-ness doesn't guarantee that-ness",
              ["That unicorns might exist somewhere", "That definitions are useless", "That existence is a quality like green"],
              "No essence, however magnificent, contains existence automatically — except ONE (coming).",
            ),
            info(
              "The parable of the participated",
              "Philosophers call creatures 'beings by participation': we HAVE being the way the moon HAS light — borrowed, reflected, sustained from elsewhere. The classical alternative is being BY ESSENCE: that whose very what-it-is IS to-be. Aquinas: in God alone are essence and existence identical. Everything else: an act of existing poured into an essence that did not owe it. You are, right now, being given your existence.",
            ),
            sel(
              "Creatures exist 'by participation' — like the moon's light. This means…",
              "🌙 Participation check",
              "Their existence is received and sustained from beyond themselves",
              ["They are illusions", "They are parts of God's body", "They exist necessarily in themselves"],
              "The moon shines with borrowed light; creatures exist with borrowed being. The grid, the sun, the Giver — the metaphor points beyond the world.",
            ),
            typeAns(
              "Type Aquinas' Latin phrase for God: 'subsistent being itself' (two words)",
              "Latin check",
              ["ipsum esse", "ipsum esse subsistens"],
              "Ipsum esse subsistens — not a being among beings, but BEING itself, subsisting.",
            ),
          ],
        },
        {
          title: "Ipsum Esse Subsistens",
          challenges: [
            info(
              "The divine attributes fall out",
              "Here is the elegant move of classical theism — the attributes are not added decorations but unpackings of ipsum esse: SIMPLE (no parts — an essence identical to existence cannot be composite), IMMUTABLE (no potency to actualize — act through and through), ETERNAL (no potency, no succession — all at once), INFINITE (not limited by any essence-receiver), ONE (existence itself cannot be pluralized). From 'What is God?' the answer cascades: He is Being itself, and therefore simple, changeless, eternal, boundless, unique.",
            ),
            sel(
              "Why is God immutable (unchangeable) on classical theism?",
              "⛰️ Attribute check",
              "Change requires potency, and God is pure act with no unactualized capacity",
              ["Because He is too busy to change", "Because changing would be effortful", "Because Scripture forbids it only"],
              "Pure act has no could-be-still-actual. This is not stiffness but perfection: nothing outstanding remains.",
            ),
            info(
              "Does God's changelessness chill Him?",
              "A worry arises: is the immutable God distant — a frozen perfect thing? The tradition's reply: God's changelessness is the perfection of LOVE, not its absence. Emotionally unstable love is not greater love — 'Jesus Christ is the same yesterday and today and forever' (Heb 13:8) is a COMFORT, not a cold shoulder. And in the incarnation, the unchangeable Word takes changeable humanity TO Himself without ceasing to be what He is — Chalcedon's grammar again: the natures unconfused.",
            ),
            sel(
              "Why is divine immutability good news rather than bad?",
              "📜 Gospel check",
              "A God who cannot drift, decay or fall out of love is a God who can be trusted utterly",
              ["Because change is always evil in creatures", "Because emotions are weaknesses in anyone", "Because the Bible says feelings are sins"],
              "'The same yesterday, today, forever' — covenant love needs no seismograph. His stability is our anchor (Heb 6:19).",
            ),
            match("Tap the pairs — attributes from ipsum esse", [
              ["No parts", "simplicity"],
              ["No potency", "immutability"],
              ["No succession", "eternity"],
              ["No limiting essence-receiver", "infinity"],
              ["No pluralized existence", "unity"],
            ]),
          ],
        },
        {
          title: "Necessary & Contingent",
          challenges: [
            info(
              "The map of modality",
              "METAPHYSICAL MODALITY maps how things COULD be: NECESSARY (cannot fail — exists in every possible configuration of reality), CONTINGENT (could fail or could have failed — exists in some), IMPOSSIBLE (cannot be — square circles). Leibniz pictured possible worlds: complete consistent histories. Necessary being occurs in ALL of them; contingent beings in SOME. Philosophy's discovery: the contingent points beyond itself — the collection of the could-have-failed needs the cannot-fail as its ground. (You met this as the contingency argument; now you see its engine.)",
            ),
            sel(
              "A necessary being is one that…",
              "🗺️ Modality check",
              "Cannot fail to exist in any possible world",
              ["Exists only in the actual world", "Exists in most worlds", "Is needed by law but may not exist"],
              "Necessity is the impossibility of non-existence — not mere longevity or importance.",
            ),
            info(
              "God, worlds and worship",
              "Careful nuance: philosophers debate whether 'God exists necessarily' means in-all-worlds or could-not-have-failed-given-His-nature. What classical theism insists on: God is not one more item in the inventory of the world — He is the inventory's GROUND, the reason there is an inventory at all. That is why 'Who made God?' is a category error: whatever is made is, by definition, not God. The made is contingent; the Maker is necessary. Asking who made the unmade is asking for a square circle.",
            ),
            sel(
              "'Who made God?' is a category error because…",
              "❓ Question check",
              "God is by definition unmade — the necessary ground of the contingent",
              ["God is too powerful to have makers", "The question is grammatically wrong", "Nobody knows enough to ask it"],
              "The question assumes God is contingent. But 'God' names ipsum esse — the question saws off the branch it sits on.",
            ),
            arrange(
              "Order the metaphysical ladder of being",
              "From fact to Ground",
              ["Contingent things exist", "Their existence is received, moment by moment", "The receiver needs a Giver beyond the collection", "The Giver exists of Himself — ipsum esse subsistens"],
              ["Contingent things exist necessarily", "The collection explains itself"],
              "Each rung is a lesson you have now climbed: distinction, participation, contingency, necessity.",
            ),
            info(
              "🕯️ Unit complete!",
              "You hold the tradition's master-key: essence/existence distinction → participation → ipsum esse → the attributes → the necessary Ground. Next: do universals exist — and what IS human nature?",
            ),
          ],
        },
      ],
    },
    {
      title: "Universals & Natures",
      description: "The one-over-many: realism, nominalism, abstract objects, and the metaphysics of the human person.",
      emoji: "🔗",
      color: "#3F3F46",
      lessons: [
        {
          title: "The One Over Many",
          challenges: [
            info(
              "The ancient riddle",
              "Two green emeralds, on two continents, are BOTH green — the SAME green. But they are two stones. Is 'greenness' ONE thing present in both? The ONE over MANY: any group of resembling particulars seems to share a single universal. PLATO: universals exist separately, in a heaven of Forms (particulars 'participate'). ARISTOTLE: universals exist only IN things (greenness exists in green things — 'immanent realism'). NOMINALISTS: only the NAME 'green' and resembling individuals exist — no shared thing at all.",
            ),
            sel(
              "The 'problem of universals' asks…",
              "🔗 Riddle check",
              "What makes many particulars genuinely THE SAME in kind?",
              ["Why the universe is expanding", "Whether names have owners", "How many planets exist"],
              "The question hides in plain sight every time you say 'these are both apples.' Same WHAT, exactly?",
            ),
            sel(
              "Aristotle's position on universals is that they exist…",
              "🏛️ School check",
              "Only in the particular things that instantiate them",
              ["In a separate heaven of Forms", "As mere names with no reality", "Only inside human brains by convention"],
              "Greenness lives in green things, humanity in humans — immanent realism. Plato's Forms live next door to the gods; Aristotle moved them into the things.",
            ),
            info(
              "Why this is not trivia",
              "Theology is committed to moderate realism: 'What is not assumed is not healed' (Gregory of Nazianzus) requires a real HUMAN NATURE that the Word assumed — if 'humanity' is just a name, the incarnation heals nothing universal, just one specimen. Original justice and original sin likewise require a real common nature. And scientific laws presuppose real natures with real operations — 'water boils at 100°C' is about what water IS.",
            ),
            match("Tap the pairs — positions on universals", [
              ["Plato", "separate Forms"],
              ["Aristotle", "universals in things"],
              ["Nominalism", "names only"],
              ["Gregory of Nazianzus", "what is not assumed is not healed"],
            ]),
          ],
        },
        {
          title: "Numbers & Propositions",
          challenges: [
            info(
              "The strangest citizens of reality",
              "Consider: '2 + 2 = 4' was true before any mind counted and will be true after — numbers look necessary, eternal, invisible. Propositions ('grass is green') seem likewise true independent of thinkers. But WHAT are they? If abstract objects are real (Platonism), we have an eternal, necessary, non-physical realm… existing on its own, alongside God? Some philosophers of religion argue this is a CO-RIVAL to God in the necessary-eternal-immaterial category — forcing a choice: God, or numbers, or both reinterpreted.",
            ),
            sel(
              "Abstract objects like numbers are strange because they seem…",
              "🔢 Ontology check",
              "Necessary, eternal and non-physical — yet causally inert",
              ["Physical items in deep space", "Recent inventions of the Enlightenment", "Chemical states of brains"],
              "Eternal, necessary, immaterial — and powerless. That last property becomes the argument's hinge.",
            ),
            info(
              "Three ways through",
              "AQUINAS and classical theists: abstract objects exist as divine IDEAS — God's own intellect is the home of eternal truths (Augustine's rationes aeternae). Numbers and propositions are real, necessary, eternal — because they are THOUGHTS of the necessary, eternal Thinker. THEISTIC ACTIVISM: abstracta are not independently real — they are created by, or grounded in, God's nature. PLATONISM: they exist on their own — God coexists with a necessary realm He didn't think up (many judge this incoherent for classical theism). Plantinga's 'theistic Platonism' instead lets abstracta exist uncreated, unthought — a middle path between the two.",
            ),
            sel(
              "Augustine's answer to eternal truths locates them…",
              "💡 Solution check",
              "In the mind of God — the eternal rationes",
              ["In a separate Platonic heaven beside God", "In human conventions", "In quantum fields"],
              "Numbers are not God's rivals but God's thoughts. The Logos is the home of logic.",
            ),
            info(
              "'In the beginning was the Logos'",
              "Notice the resonance: John's Gospel names the eternal Word (Logos) — the reason-like, expressive, creative principle WITH God and IS God. A universe governed by mathematical law, intelligible to minds, with logic woven into its fabric, is no surprise if a Logos stands at its source — and is the deepest of mysteries if not. The doctrine of creation and the intelligibility of science are cousins; the lab coat bows, often unknowingly, to the Logos.",
            ),
            typeAns(
              "Type the Greek word John uses for 'Word' in John 1:1",
              "Greek check",
              ["logos", "λόγος"],
              "Logos — word, reason, discourse. In the beginning was the Reason: the metaphysician's Gospel.",
            ),
          ],
        },
        {
          title: "Human Nature",
          challenges: [
            info(
              "What are YOU?",
              "The metaphysics of the person: SUBSTANCE DUALISM (you are a soul immaterially related to a body — Plato, Descartes), PHYSICALISM (you are your body/brain; mind IS brain activity), THOMISTIC HYLORMORPHISM (you are one substance OF body-and-soul — the soul is the FORM of the body, not a ghost in a machine). Each answers differently: what survives death? What is a person? When does life begin? Could a copy of your brain be you?",
            ),
            sel(
              "Thomistic hylomorphism says the soul is…",
              "🧍 Theory check",
              "The form of the body — one substance of matter and soul",
              ["A ghost piloting a machine", "Identical to brain chemistry", "An illusion produced by neurons"],
              "Not two things glued (dualism) or one thing only (physicalism): the soul is what makes this matter A HUMAN — form and matter, one being.",
            ),
            info(
              "The imago Dei as metaphysical anchor",
              "Whatever the theory details, Scripture anchors the person: made in God's IMAGE (Gen 1:26–27) — personal, rational, moral, relational, creative. The incarnation raises the stakes: the Word took FLESH (John 1:14), not a ghost; the resurrection raises BODIES, not disembodied sparks; the new creation is cosmic, not vaporous. Christian anthropology refuses both extremes: you are not a brain with accessories, nor a spirit wearing a suit — you are an embodied soul, destined for embodied eternity.",
            ),
            sel(
              "Why does the BODILY resurrection matter to Christian anthropology?",
              "🥀 Gospel check",
              "It affirms the body as essential to the person — salvation is of whole humans, not escape from matter",
              ["It proves ghosts are real", "It makes bodies optional extras", "It denies that souls exist at all"],
              "The Word became flesh; flesh is not a prison but a destiny. Your eternal life is embodied life.",
            ),
            match("Tap the pairs — theories of the person", [
              ["Substance dualism", "soul and body, two things"],
              ["Physicalism", "you are your brain"],
              ["Hylomorphism", "soul as form of the body"],
              ["Imago Dei", "personal, rational, relational"],
              ["Resurrection", "embodied eternity"],
            ]),
            info(
              "🔗 Unit complete!",
              "You can map the problem of universals, place eternal truths in the Logos, and locate human nature between the extremes. Final unit: time itself — and the freedom of the will within it.",
            ),
          ],
        },
      ],
    },
    {
      title: "Time, Eternity & Will",
      description: "Augustine's river, God and time, and the metaphysics of free will — the summit of the course.",
      emoji: "⏳",
      color: "#27272A",
      lessons: [
        {
          title: "What Is Time?",
          challenges: [
            info(
              "Augustine's confession",
              "'What then is time? If no one asks me, I know; if I wish to explain it to one who asks, I know not.' His puzzle: the past no longer exists, the future does not yet, and the present — if it has duration — divides into past and future. Yet we measure time, and things change IN it. His famous move: time is a DISTENSION of the soul — memory (past), attention (present), expectation (future). Time seems tied to creatures: 'You made all times, and before all times you are.'",
            ),
            sel(
              "Augustine's puzzle about time is that…",
              "⌛ Puzzle check",
              "Past and future do not exist, yet we speak of them as real",
              ["Clocks are always slightly wrong", "Time flows faster in summer", "Nobody can feel anything"],
              "The past is gone, the future un-arrived, the present instantaneous — yet history and hope structure everything. Time is stranger than it looks.",
            ),
            info(
              "A-theory and B-theory",
              "A-THEORY (tensed): time really FLOWS; the present is objectively special; the future is open. B-THEORY (tenseless): all moments — past, present, future — are equally real (the 'block universe'); 'now' is like 'here', a word for where you stand. Einstein's relativity pressures A-theory (simultaneity is relative to observers); but A-theorists reply that relativity describes measurements, not reality itself. The debate is live — and theology is watching it closely.",
            ),
            sel(
              "The 'block universe' is the picture associated with…",
              "🧱 Theory check",
              "B-theory — all times equally real",
              ["A-theory — the flowing present", "Augustine's distension", "Aristotle's categories"],
              "On B-theory, dinosaurs and distant descendants are equally real; 'now' is an index, like 'here'. On A-theory, only the present exists and time genuinely passes.",
            ),
            match("Tap the pairs", [
              ["Augustine", "distension of the soul"],
              ["A-theory", "the flowing present"],
              ["B-theory", "the block universe"],
              ["Relativity", "pressures absolute 'now'"],
            ]),
          ],
        },
        {
          title: "God & Time",
          challenges: [
            info(
              "Timeless or everlasting?",
              "CLASSICAL view (Augustine, Boethius, Aquinas): God is TIMELESS — existing utterly outside succession, all-at-once; His 'today' is the eternal now. EVERLASTING view (some moderns): God is IN time, without beginning or end — experiencing succession. Boethius' classic line: the eternal now is 'the whole, simultaneous and perfect possession of unending life.' Timelessness follows from pure act: succession is actualized-potency-actualized; God has no potency, so no succession.",
            ),
            sel(
              "Why does classical theism conclude God is timeless?",
              "🕯️ Derivation check",
              "Time involves succession (potency actualized), and God is pure act",
              ["Because time travel is impossible", "Because God chose to leave time", "Because clocks did not exist in eternity"],
              "Time is the measure of change; God is changeless; therefore God is not IN time but is its Maker — time belongs to creatures.",
            ),
            info(
              "Boethius solves foreknowledge",
              "A prisoner in a tower watches a footrace from above; his seeing does not CAUSE the runner's turns — and the timelessness insight goes further: God does not FORE-see your tomorrow (peeking ahead in time); He SEES all moments in one eternal now, the way you see the whole page while the words lie in sequence. Providence without predestination-by-peeking: knowledge does not cause, and eternal knowledge is not temporal pushing.",
            ),
            sel(
              "Boethius' solution to divine foreknowledge and free will says…",
              "🐎 Race check",
              "God sees all times at once in the eternal now — vision, not compulsion",
              ["God learns the future as it happens", "God causes every choice directly", "Humans and God co-create time"],
              "Eternity is not endless time but the absence of succession. The whole of your life is present to the eternal now — known, not forced.",
            ),
            typeAns(
              "Type the philosopher who defined eternity as 'the whole, simultaneous and perfect possession of unending life'",
              "The prisoner-philosopher",
              ["boethius"],
              "Boethius — writing The Consolation of Philosophy on death row, and consoling the ages on time.",
            ),
          ],
        },
        {
          title: "Freedom & the Will",
          challenges: [
            info(
              "Three accounts of freedom",
              "LIBERTARIAN free will: you are free only if, given the exact past, you COULD have done otherwise — the will is a genuine originator. COMPATIBILISM: freedom = acting according to your own desires without coercion, even if those desires are determined. DETERMINISM: all events, including choices, are fixed by prior causes. The debate matters enormously: moral responsibility, the problem of evil (the free-will defense presupposes libertarian freedom), and the nature of God's sovereignty all pivot on it.",
            ),
            sel(
              "Compatibilism defines freedom as…",
              "🔓 Definition check",
              "Acting on your own desires without external coercion",
              ["The ability to have done otherwise, given the same past", "Total unpredictability", "Freedom from having any desires"],
              "For compatibilists, a willing slave to his own wishes is free; the coerced 'yes' is not. Libertarians demand more: genuine open alternatives.",
            ),
            info(
              "Sovereignty and freedom",
              "How do God's sovereignty and human freedom coexist? The tradition's aids: (1) CONCURSUS — God works IN and THROUGH creaturely causes without violating them (like an author writing characters who act from their own motives); (2) CLASSICAL PROVIDENCE — Augustine, Boethius and Aquinas hold that God timelessly foreknows the settled future without coercing it; (a modern minority proposal, open theism, instead pictures the future as partly open — but even an A-theory of time does not require that openness, so treat it as a debate, not the tradition); (3) THEODICY — the free-will defense against the problem of evil presupposes significant libertarian freedom: love that cannot be refused is not love. Genesis 50 holds both without flinching: 'You meant evil against me… God meant it for good.'",
            ),
            sel(
              "'Concursus' refers to…",
              "🤝 Doctrine check",
              "God causing in and through creaturely causes, without coercing them",
              ["God causing instead of creatures", "Creatures replacing God's work", "Mutual ignorance of both parties"],
              "Primary and secondary causation: the author writes the villain's choices as the villain's own. Two levels, one story.",
            ),
            match("Tap the pairs — freedom's vocabulary", [
              ["Libertarian", "could have done otherwise"],
              ["Compatibilist", "uncoerced desire-following"],
              ["Determinist", "all fixed by prior causes"],
              ["Concursus", "God in and through causes"],
              ["Genesis 50", "meant for good"],
            ]),
            info(
              "🌀 Course complete!",
              "You have climbed the summit of first philosophy: being, change, causality, essence, universals, persons, time, and will. The God you met through the arguments now stands in full metaphysical dress: ipsum esse subsistens, actus purus, timeless, simple, the Ground of every truth and every freedom. Metaphysics ends in worship — precisely where it always secretly began. Well done, philosopher-saint.",
            ),
          ],
        },
      ],
    },
  ],
}
