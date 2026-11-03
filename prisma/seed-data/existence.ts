import { SeedCourse } from "./helpers"
import { info, sel, assist, match, arrange, typeAns } from "./helpers"

// ✨ The flagship natural-theology course — the arguments for God,
// from the most popular starting points to the most nuanced.
export const existenceCourse: SeedCourse = {
  code: "existence",
  title: "The Existence of God",
  subtitle: "The case for the Creator — argument by argument",
  description:
    "Walk through the great arguments for God — cosmological, contingency, design, moral, and beyond — with their strongest objections. Learn to weigh evidence like a philosopher, not just quote an answer.",
  emoji: "✨",
  color: "#A21CAF",
  order: 8,
  units: [
    {
      title: "The God Question",
      description: "How to think carefully about the biggest question a human can ask.",
      emoji: "❓",
      color: "#A21CAF",
      lessons: [
        {
          title: "The Biggest Question",
          challenges: [
            info(
              "One question above all",
              "Does God exist? Every worldview answers it — theism (yes, a personal Creator), atheism (no), agnosticism (we can't know). Each answer reshapes everything else: where you came from, what a human is, what happens when you die, and what 'good' means. This is not a side quest. It is the load-bearing question of every life.",
            ),
            sel(
              "Which position says a personal Creator exists?",
              "🗺️ Map the options",
              "Theism",
              ["Atheism", "Agnosticism", "Polytheism means one personal Creator"],
              "Theism = one personal God created and sustains everything. Atheism denies God; agnosticism says we can't know; polytheism posits many gods (not one ultimate Creator).",
            ),
            info(
              "Why it is not a draw by default",
              "Some say: 'You can't prove God, so the sensible default is unbelief.' But the rules cut both ways. The claim 'no God exists, no Creator caused this fine-tuned, information-rich, moral-carrying universe' is itself a bold claim that needs support. The honest student does not pick a default — she weighs the evidence for both worldviews.",
            ),
            sel(
              "'You can't prove God, so just default to atheism' is flawed because…",
              "⚖️ Burden check",
              "Atheism is also a claim about reality that needs support",
              ["Questions always default to 'no'", "Only theism needs evidence", "Atheism makes no claims at all"],
              "'The universe has no Creator' is a positive claim about what exists — it carries a burden of support too. Weigh both sides of the scale.",
            ),
            match("Tap the pairs", [
              ["Theism", "one personal Creator"],
              ["Atheism", "no God exists"],
              ["Agnosticism", "we can't know"],
              ["Pantheism", "God = the universe"],
            ]),
            assist(
              "Complete: 'Every ___ answers the God question — theism, atheism, and agnosticism each tell a different story of reality.'",
              "The starting point",
              "worldview",
              ["country", "scientist", "religion"],
              "Whether admitted or not, everyone lives inside a worldview that has already answered the God question.",
            ),
            info(
              "How this course works",
              "We will walk through the strongest arguments FOR God — the cosmological, contingency, design, moral, consciousness, and ontological arguments — and at every step we will meet the strongest objections and reply to them. No straw men. You will learn to make the case AND to respect the questioner. That is the 1 Peter 3:15 way: reason with gentleness and respect.",
            ),
          ],
        },
        {
          title: "Faith & Reason Are Friends",
          challenges: [
            info(
              "What faith actually is",
              "Biblical faith (πίστις, pistis) is not belief without evidence — it is TRUST in a person you have good reason to believe. You have faith in a surgeon because of diplomas, reputation, and track record. The Christian claim is that God has given reasons: a fine-tuned cosmos, a moral law, a risen Messiah. Faith steps INTO evidence, not around it.",
            ),
            sel(
              "Biblical faith is best defined as…",
              "📖 Definition check",
              "Trust based on good reasons",
              ["Belief against the evidence", "Belief with no evidence at all", "A warm feeling about God"],
              "πίστις = trust, like trusting a bridge you have inspected. The inspection (reason) comes first; the crossing (faith) rests on it.",
            ),
            info(
              "Two kinds of 'because'",
              "Science asks HOW the world works — its mechanisms. Philosophy and theology ask WHY there is a world at all and what it means. A chemistry teacher can explain the ink and paper of a love letter but be silent about its meaning. Methodological naturalism (science studies natural causes) is fine; metaphysical naturalism (ONLY natural causes exist) is a philosophy smuggled in wearing a lab coat.",
            ),
            sel(
              "Claiming 'only natural causes exist' because science studies natural causes is…",
              "🧪 Category check",
              "A philosophical assumption, not a scientific result",
              ["A proven laboratory fact", "The definition of physics", "An obvious logical truth"],
              "Science's METHOD studies natural causes; that says nothing about whether ONLY natural causes exist. That leap is philosophy — and it needs its own argument.",
            ),
            match("Tap the pairs", [
              ["Science", "how the world works"],
              ["Philosophy", "why there is a world"],
              ["Faith (pistis)", "trust in evidenced person"],
              ["Metaphysical naturalism", "a philosophy, not a lab result"],
            ]),
            typeAns(
              "Type the Greek word for faith used in the New Testament",
              "The Greek word",
              ["pistis", "πιστις", "pistis!"],
              "πίστις (pistis) — trust, reliance, allegiance. Never 'believing what you know ain't so.'",
              "pistis"
            ),
          ],
        },
        {
          title: "How Arguments Work",
          challenges: [
            info(
              "Three shapes of reasoning",
              "A DEDUCTIVE argument claims its conclusion must be true if its premises are true (the classic syllogism). An INDUCTIVE argument accumulates evidence until its conclusion is probable. An ABDUCTIVE argument says this explanation fits the evidence best — like a detective naming the suspect who makes every clue make sense. Natural theology uses all three.",
            ),
            sel(
              "An argument that makes its conclusion certain if its premises are true is…",
              "🧩 Logic check",
              "Deductive",
              ["Inductive", "Abductive", "Rhetorical"],
              "Deductive = certainty. Inductive = probability. Abductive = best explanation. The kalam argument is deductive; the design argument is abductive.",
            ),
            info(
              "Attack the premise, not the person",
              "There are only two honest ways to defeat an argument: show a premise is false, or show the conclusion does not follow. Calling it 'old', 'religious', or 'unfashionable' is noise, not logic. An argument from 1015 AD or 2025 AD stands or falls by its premises. Learn this rule and you will out-reason most internet debates instantly.",
            ),
            assist(
              "The only two honest ways to defeat an argument: show a premise is ___, or show the conclusion does not follow.",
              "The rule of rules",
              "false",
              ["old", "religious", "unpopular"],
              "Age, fashion, and popularity are irrelevant. Premises and logic — that is the whole game.",
            ),
            arrange(
              "Build a classic deductive argument (the syllogism shape)",
              "The syllogism skeleton",
              ["Major premise", "Minor premise", "Therefore — conclusion"],
              ["Insult the opponent", "Repeat louder"],
              "Premise + premise = conclusion. If the premises are true and the logic valid, the conclusion is not optional.",
            ),
            info(
              "The rope, not the chain",
              "No single argument will force an unwilling heart — God leaves room for trust. But arguments work like a ROPE: many strands woven together (origin of the universe, fine-tuning, morality, consciousness, resurrection) are stronger than any single thread. That is the cumulative case method you will practice in this course.",
            ),
            sel(
              "The 'cumulative case' compares God's existence to…",
              "🪢 Method check",
              "A rope of many woven strands",
              ["A chain that snaps if one link breaks", "A house of cards", "A single silver bullet"],
              "Unlike a chain, a rope gains strength from many threads. Each argument adds weight; together they carry the case.",
            ),
          ],
        },
      ],
    },
    {
      title: "Why Is There Something?",
      description: "The kalam cosmological argument — from the universe's beginning to its Cause.",
      emoji: "🌌",
      color: "#7E22CE",
      lessons: [
        {
          title: "Whatever Begins to Exist",
          challenges: [
            info(
              "The oldest opening move",
              "The kalam cosmological argument, refined by medieval theologians and revived in our day: (1) Whatever begins to exist has a cause. (2) The universe began to exist. (3) Therefore, the universe has a cause. Short, deductive, and explosive — IF the premises hold. Let us test them like professionals.",
            ),
            arrange(
              "Build the kalam argument in its correct order",
              "The kalam syllogism",
              ["Whatever begins to exist has a cause", "The universe began to exist", "Therefore, the universe has a cause"],
              ["Everything needs a cause", "Therefore, nothing exists"],
              "Careful — the first premise says whatever BEGINS to exist. That word does all the defensive work.",
            ),
            info(
              "Premise 1: something from nothing",
              "'From nothing, nothing comes' is not a narrow religious rule — it is a bedrock intuition of rationality. Nothing (no matter, no energy, no space, no time, no laws) has no powers, no properties, no potential. Even famous skeptic David Hume admitted he never saw anything pop into being without a cause — and quantum events are not exceptions: the quantum vacuum is a governed, structured something, not nothing.",
            ),
            sel(
              "Why is the quantum vacuum NOT an example of 'something from nothing'?",
              "⚛️ Physics check",
              "The vacuum is a structured field governed by physical laws",
              ["It is literally nothing at all", "It has no properties whatsoever", "Physicists have never studied it"],
              "The quantum vacuum is a sea of potential with physical laws — a very impressive SOMETHING. True nothing has nothing to offer, not even chance.",
            ),
            assist(
              "'From ___, nothing comes' — the principle behind premise 1.",
              "The first principle",
              "nothing",
              ["something", "anywhere", "chance"],
              "Nothing has no properties, no powers, no potential. You cannot borrow from an empty bank.",
            ),
            match("Tap the pairs", [
              ["Kalam premise 1", "whatever begins has a cause"],
              ["Quantum vacuum", "a governed something"],
              ["True nothing", "no properties at all"],
              ["Hume", "never saw uncaused beginnings"],
            ]),
          ],
        },
        {
          title: "Did the Universe Begin?",
          challenges: [
            info(
              "Premise 2 — the evidence of astronomy",
              "In 1929 Edwin Hubble saw the galaxies racing away from each other — the universe is EXPANDING. Rewind the film and everything converges to a beginning: the standard Big Bang model. Arno Penzias, who detected the afterglow: 'The best data we have are exactly what I would have predicted, had I nothing to go on but the five books of Moses, and the Psalms.' Science caught up with 'In the beginning.'",
            ),
            sel(
              "Hubble's 1929 discovery showed that the universe is…",
              "🔭 Observation check",
              "Expanding — galaxies recede from each other",
              ["Eternal and unchanging", "Collapsing inward", "Rotating around the Milky Way"],
              "An expanding universe, run backwards, converges on a beginning — exactly what Genesis 1:1 always claimed.",
            ),
            info(
              "The evidence of philosophy",
              "Could the past simply be infinite? Imagine Hilbert's Hotel: a hotel with infinitely many occupied rooms that always has room for one more (shift every guest up a floor). Absurd yet perfectly managed by infinity in the abstract. But an actually infinite series of past EVENTS can never be 'completed' — you would never finish counting to today. The Borde-Guth-Vilenkin theorem goes further: any universe expanding on average cannot extend infinitely into the past. The universe had a beginning.",
            ),
            sel(
              "Hilbert's Hotel is used to show that…",
              "🏨 Paradox check",
              "An actually infinite collection of past events leads to absurdities",
              ["Hotels are always full", "Infinity is simple to manage", "The future is already decided"],
              "Infinities behave absurdly in the real world. A beginning-less universe would be an actual infinity of completed events — check-out time is impossible.",
            ),
            typeAns(
              "Name the theorem (two surnames are enough, e.g. Borde-Guth-___) proving expanding universes cannot be past-eternal",
              "The BGV theorem",
              ["vilenkin", "borde guth vilenkin", "borde-guth-vilenkin"],
              "Borde-Guth-Vilenkin: any universe expanding on average has a boundary to its past — a beginning — no matter what earlier physics it had.",
            ),
            info(
              "The conclusion lands hard",
              "Whatever begins to exist has a cause. The universe (space, time, matter, energy — the whole shebang) began to exist. Therefore the universe has a cause — and that cause must be OUTSIDE space, BEFORE time, beyond matter. Sound like anyone you have read about? 'In the beginning, God created the heavens and the earth.'",
            ),
          ],
        },
        {
          title: "What Kind of Cause?",
          challenges: [
            info(
              "Reading the cause's profile",
              "The cause of space, time and matter must itself be spaceless, timeless and immaterial. It must be unimaginably powerful (it brought forth a cosmos). And here is the subtle step: there are only two kinds of immaterial, timeless causes we know — abstract objects (like numbers — causally impotent) and MINDS. Abstract objects cannot cause anything. Therefore the cause of the universe is a transcendent MIND. The kalam ends where Genesis begins: In the beginning, God.",
            ),
            sel(
              "Why must the cause be spaceless, timeless and immaterial?",
              "📐 Deduction check",
              "It caused space, time and matter — so it is beyond them",
              ["Because causes are always physical", "Because the Bible says so first", "Because space cannot exist"],
              "The cause cannot be inside the box it built. It stands outside space, prior to time, independent of matter.",
            ),
            sel(
              "Of the two candidates for an immaterial cause — abstract objects and minds — why abstract objects fail",
              "🧠 Candidate check",
              "Abstract objects (numbers, sets) are causally inert",
              ["They are too powerful", "They are made of energy", "They exist inside space"],
              "The number seven has never caused anything. A MIND can intend, choose and create — the universe looks exactly like the product of intention.",
            ),
            info(
              "Why a personal cause? The freeze argument",
              "If the cause were an impersonal, mechanically operating condition (like water freezing at zero), then whenever the condition eternally holds, the effect is eternal too — an eternally frozen universe. But the universe BEGAN. So the cause must be capable of freely deciding: an eternal cause with a beginning effect means the cause willed it — choice, will, PERSONHOOD. The kalam delivers not a vague force but a personal Creator.",
            ),
            assist(
              "An eternal cause producing a beginning effect points to a free act of ___ — that is, a personal Creator.",
              "The personal conclusion",
              "will",
              ["chance", "pressure", "gravity"],
              "Impersonal conditions that eternally hold produce eternal effects. Only a will can decide to create at time zero.",
            ),
            match("Tap the pairs — attributes of the first cause", [
              ["Cause of space", "spaceless"],
              ["Cause of time", "timeless"],
              ["Cause of matter", "immaterial"],
              ["Brought forth a cosmos", "powerful"],
              ["Freely chose to create", "personal"],
            ]),
            info(
              " ✨ Unit complete!",
              "You can now build the kalam argument, defend both premises, and explain why its cause is a transcendent mind. Next: Leibniz's deeper question — not 'when did it begin?' but 'why does anything exist at all?'",
            ),
          ],
        },
      ],
    },
    {
      title: "The Contingency Argument",
      description: "Leibniz's question: why is there something rather than nothing?",
      emoji: "🕊️",
      color: "#6D28D9",
      lessons: [
        {
          title: "Two Kinds of Truth",
          challenges: [
            info(
              "Necessary vs contingent",
              "Look at any object near you — a chair, a star, an atom. It is CONTINGENT: it exists, but it might not have. Its existence is not built into what it is; it must be given existence by something else. A NECESSARY being is different: it cannot fail to exist. Its essence IS to exist. Philosophers ask: which things are contingent, and is there anything necessary?",
            ),
            sel(
              "A contingent being is one that…",
              "🪑 Concept check",
              "Exists but could have failed to exist",
              ["Cannot possibly not exist", "Exists in every possible world", "Is purely imaginary"],
              "Everything made of matter, everything that begins, everything that depends — contingent through and through.",
            ),
            info(
              "Could the universe itself be necessary?",
              "Here is the atheist's move: 'maybe the universe is the necessary being.' But the universe is a collection of contingent things — every particle, every force, every law could have been otherwise. Physicists routinely describe universes with different constants and contents; the whole package looks as contingent as its parts. And if the universe had a beginning (last unit!), it plainly failed to exist at some 'time' — not the profile of necessity.",
            ),
            sel(
              "Why does the universe's beginning count against ITS being the necessary being?",
              "🕰️ Recall check",
              "A necessary being cannot fail to exist — but the universe did not exist before its beginning",
              ["Because necessary beings must be visible", "Because the universe is too large", "Because necessity means being made of matter"],
              "Whatever began to exist once was not there — contingency written into its résumé. The necessary being must be sought beyond the cosmos.",
            ),
            match("Tap the pairs", [
              ["Contingent", "could have failed to exist"],
              ["Necessary", "cannot fail to exist"],
              ["The universe", "a contingent collection"],
              ["Beginning", "a mark of contingency"],
            ]),
            assist(
              "A being whose very essence is to exist is called a ___ being.",
              "Vocabulary",
              "necessary",
              ["contingent", "physical", "accidental"],
              "Necessity is not stubbornness or longevity — it is the impossibility of non-existence.",
            ),
          ],
        },
        {
          title: "Leibniz's Question",
          challenges: [
            info(
              "The Principle of Sufficient Reason",
              "Gottfried Leibniz (1646–1716) stated the deep rule: nothing exists without a sufficient reason WHY it is so and not otherwise. Not 'a cause I can find' but 'an explanation that exists, whether or not I know it.' Science assumes this every day — every effect prompts the question 'why?' and we never accept 'it just is, no reason, stop asking' in the lab. Why accept it for reality as a whole?",
            ),
            sel(
              "The Principle of Sufficient Reason says…",
              "📜 Principle check",
              "Everything has an explanation — known or not",
              ["Everything has a cause I can discover", "Some things happen for absolutely no reason", "Only physical things need explanations"],
              "PSR is not about your knowledge but about reality: for anything that exists, there is a sufficient reason why it exists.",
            ),
            info(
              "Why is there something rather than nothing?",
              "Leibniz's argument: (1) Every contingent fact requires an explanation (PSR). (2) The totality of contingent things — even an eternal chain of them — is itself contingent, and cannot explain itself. (3) Therefore the explanation of the whole contingent order must lie in a NECESSARY being — something that exists by its own nature. Note the power: this argument does not care whether the universe is past-eternal. Even an eternal chain of dominoes cannot explain itself.",
            ),
            arrange(
              "Assemble the contingency argument",
              "Leibniz's steps",
              ["Contingent things exist", "The totality of contingent things cannot explain itself", "So there must be a necessary being", "That necessary being is what all call God"],
              ["Contingent things are illusions", "Everything explains itself just fine"],
              "The chain of contingency must end in something that has existence by nature — not by borrowing.",
            ),
            sel(
              "Why can't an INFINITE CHAIN of contingent causes explain the whole ensemble?",
              "⛓️ Chain check",
              "Each link borrows existence — an infinite sum of debts is still all debt",
              ["Because infinity is impossible in any sense", "Because chains cannot be long", "Because the chain would be necessary per link"],
              "Explaining each domino by the previous domino leaves the whole row of dominoes unexplained. The sum of dependent things is still dependent.",
            ),
            typeAns(
              "Type the surname of the philosopher who asked 'why is there something rather than nothing?'",
              "The questioner",
              ["leibniz", "leibnitz"],
              "Gottfried Wilhelm Leibniz — mathematician, diplomat, and the man who wouldn't let 'brute facts' bully him.",
            ),
          ],
        },
        {
          title: "The Ground of Being",
          challenges: [
            info(
              "From first cause to Father",
              "The necessary being of philosophy is not yet the God of Abraham — but look at its profile: exists by its own nature (aseity), beyond the contingent order, sustaining all things. Add the personal conclusion of the kalam and the moral argument (coming next units) and the God of the philosophers begins to look strikingly like the God of the patriarchs. Aquinas said the God of philosophy and the God of Scripture are the same God, met from two directions.",
            ),
            sel(
              "'Aseity' refers to God's…",
              "🔤 Term check",
              "Self-existence — existing of Himself alone",
              ["Omnipresence in space", "Knowledge of the future", "Ability to perform miracles"],
              "A se = 'of himself.' God does not borrow existence; He IS existence. Moses heard it at the bush: I AM WHO I AM.",
            ),
            info(
              "The brute-fact bluff",
              "The main objection: 'maybe the universe is just a brute fact — no explanation, tough luck.' Notice what this move costs: it abandons the PSR at exactly the one place it becomes inconvenient, like refusing to audit the biggest account in the bank. And a brute-fact universe is a scientific scandal: the whole enterprise of explanation assumes effects have reasons. Theism explains MORE with LESS: one necessary mind grounds every contingent thing.",
            ),
            sel(
              "Why is 'the universe is a brute fact' an expensive move?",
              "💰 Cost check",
              "It abandons the demand for explanation precisely where it matters most",
              ["Because brute facts are forbidden by physics alone", "Because it proves too little about chemistry", "Because brute facts are illegal"],
              "The skeptic keeps asking 'why?' everywhere else. Stopping at the universe itself is special pleading — exempting the biggest item from the rule applied to everything in it.",
            ),
            match("Tap the pairs", [
              ["Leibniz's question", "why anything at all?"],
              ["PSR", "everything has an explanation"],
              ["Aseity", "existence of oneself"],
              ["Brute fact", "explanation refused"],
              ["Necessary being", "the ground of the contingent"],
            ]),
            info(
              "🕊️ Unit complete!",
              "You can now state the contingency argument, defend the PSR against the brute-fact bluff, and explain aseity. The case is stacking: a BEGINNING (kalam) and a GROUND (contingency). Next: a universe suspiciously comfortable for life.",
            ),
          ],
        },
      ],
    },
    {
      title: "A Universe Tuned for Life",
      description: "The design argument — fine-tuning, the inference to mind, and the multiverse wager.",
      emoji: "🎯",
      color: "#9333EA",
      lessons: [
        {
          title: "The Razor's Edge",
          challenges: [
            info(
              "The dials are set — precisely",
              "The universe's fundamental constants sit on a knife's edge. If gravity were stronger by one part in 10^60, stars burn out in millions of years; weaker, and galaxies never form. The cosmological constant is fine-tuned to perhaps 1 part in 10^120 — a precision like throwing a dart from the Andes and hitting a bullseye one atom wide in the Alps. The strong nuclear force shifts 2% either way and the periodic table — and chemistry, and life — vanishes.",
            ),
            sel(
              "Fine-tuning refers to…",
              "🎯 Data check",
              "Physical constants set within extremely narrow life-permitting ranges",
              ["The tuning of musical instruments", "That the universe is exactly balanced between matter types", "Earth's distance from the sun only"],
              "Gravity, the cosmological constant, the strong force and more — each dial set within a razor-thin range where life is possible at all.",
            ),
            info(
              "Not just lucky — life-permitting on many dials at once",
              "Physicist Paul Davies: the appearance of design is 'overwhelming.' Even skeptical astronomer Fred Hoyle — no friend of theism — admitted the universe looks like 'a put-up job', prompting his famous line about a super-intellect monkeying with physics. These are not preachers; they are physicists reading the same dials you just met. The question is not WHETHER the values are narrow — that is data — but what best explains them: chance, necessity, or design.",
            ),
            assist(
              "Fred Hoyle, skeptical of theism, said the universe looks like 'a put-up ___' — rigged for life.",
              "The physicist's admission",
              "job",
              ["quiz", "game", "test"],
              "'A common-sense interpretation of the facts suggests that a super-intellect has monkeyed with physics.' Data this stubborn deserves an honest hearing.",
            ),
            match("Tap the pairs — constants and consequences", [
              ["Gravity stronger", "stars burn out fast"],
              ["Cosmological constant", "1 part in 10^120"],
              ["Strong force shifted", "no periodic table"],
              ["Fine-tuning", "life-permitting ranges"],
            ]),
            sel(
              "The fine-tuning ARGUMENT begins from data that is…",
              "📊 Starting point check",
              "Accepted by theists and non-theistic physicists alike",
              ["Found only in Christian labs", "A medieval church teaching", "Rejected by all cosmologists"],
              "The narrow ranges are standard physics. The debate is over the best EXPLANATION — exactly where philosophy earns its keep.",
            ),
          ],
        },
        {
          title: "Design or Lottery?",
          challenges: [
            info(
              "Three suspects",
              "When a detective meets an improbable result, she considers three explanations: CHANCE (it just happened), NECESSITY (it had to happen), or DESIGN (someone intended it). Chance: the odds are incomprehensibly small — not one lucky dart but dozens landing together. Necessity: no known physics FORCES these values; string theory's landscape treats them as environmental accidents. That leaves design — a mind that chose the dials. Physicists themselves reach for design-language ('the Anthropic Principle') then try to un-say it.",
            ),
            sel(
              "The three candidate explanations of fine-tuning are…",
              "🕵️ Suspect line-up",
              "Chance, necessity, design",
              ["Chance, miracle, illusion", "Necessity, violence, entropy", "Design, chaos, luck"],
              "Eliminate chance (odds absurd) and necessity (no forcing law), and design is what remains — the explanation a scientist would accept anywhere else.",
            ),
            info(
              "The sealed-room test",
              "Imagine ten sharpshooters aiming at a prisoner, all fire, and he survives. 'Lucky me!' he laughs. But the odds of ten simultaneous misses are so low that the better inference is arranged executioners — or mercy — in short, INTENT behind the outcome. Or a lottery where YOUR numbers win 50 draws in a row: at some point, the officials rigged it for you. The universe hit its life-permitting jackpot on every dial at once. Crying 'chance' is faith in the improbably absurd.",
            ),
            sel(
              "In the sharpshooter story, the prisoner's error is…",
              "🎯 Inference check",
              "Inferring chance from an outcome suspiciously shaped like intent",
              ["Trusting the sharpshooters", "Counting the bullets", "Wearing a blindfold"],
              "When survival itself depends on dozens of independent 'misses', the inference to arrangement — design — beats blind luck.",
            ),
            arrange(
              "Order the design inference",
              "The reasoning flow",
              ["Observe the narrow dials", "Rule out chance — odds absurdly small", "Rule out necessity — no law forces the values", "Infer a cosmic Designer who intended life"],
              ["Observe the weather", "Pray for better constants"],
              "Same logic a detective, historian or doctor uses daily: best explanation of the total evidence.",
            ),
            info(
              "The resurrection of the Watchmaker",
              "Old design arguments leaned on complexity in biology (gap arguments — vulnerable to evolution). The NEW design argument leans on the CONSTANTS OF PHYSICS themselves — the stage on which evolution must play. Darwin cannot explain away a fine-tuned stage: the laws that make natural selection possible are themselves part of what needs explaining. Design has moved from biology to cosmology, where evolution cannot touch it.",
            ),
          ],
        },
        {
          title: "The Multiverse Wager",
          challenges: [
            info(
              "The skeptic's rescue: many universes",
              "Facing fine-tuning, the non-theist's strongest move is the MULTIVERSE: perhaps infinitely many universes exist with different constants; ours looks tuned because we can only observe a life-permitting one (the observer-selection effect). One jackpot among trillions of tickets will be won by somebody. It is a serious reply — and it pays a heavy price.",
            ),
            sel(
              "The multiverse explains fine-tuning by…",
              "🌌 Hypothesis check",
              "Postulating enough universes that a tuned one becomes probable",
              ["Proving the constants could not differ", "Showing life exists in every universe", "Measuring the constants directly"],
              "Buy trillions of lottery tickets and one winner is unsurprising. The question: is there evidence for the trillions?",
            ),
            info(
              "What the wager costs",
              "Notice: no telescope has seen another universe. The multiverse is UNOBSERVABLE BY PRINCIPLE — and it multiplies entities beyond anything Occam's razor tolerates: billions of unobservable universes to avoid ONE designer. Worse, it backfires: a multiverse-generating mechanism itself needs laws precise enough to churn out universes — fine-tuning one level up! When a theory's main job is to avoid a conclusion rather than explain the data, philosophy calls it an ad hoc rescue. Designer vs multiverse: one entity with intent, or infinite entities without evidence.",
            ),
            sel(
              "Why do critics call the multiverse an 'ad hoc' move against fine-tuning?",
              "⚖️ Philosophy of science",
              "It is unobservable in principle and multiplies entities to dodge a conclusion",
              ["Because it contradicts Genesis directly", "Because it was proposed by atheists", "Because it has no mathematical form"],
              "From Bayes' view: if the multiverse is not independently evidenced, it cannot raise the probability of our tuned universe. It is a patch, not an explanation.",
            ),
            match("Tap the pairs", [
              ["Fine-tuning data", "narrow life-permitting dials"],
              ["Design", "one mind, one intent"],
              ["Multiverse", "many universes, no observer"],
              ["Ad hoc rescue", "theory built to dodge a result"],
              ["Occam's razor", "do not multiply entities"],
            ]),
            info(
              "🎯 Unit complete!",
              "You now hold the design argument: the data (razor-edge constants), the inference (chance and necessity fail, design fits), and the reply to the multiverse. Next up: the argument every human heart already knows — the moral one.",
            ),
          ],
        },
      ],
    },
    {
      title: "The Moral Argument",
      description: "From real right and wrong to a moral Lawgiver — with the Euthyphro dilemma answered.",
      emoji: "⚖️",
      color: "#BE185D",
      lessons: [
        {
          title: "Really Wrong, Not Just Unpopular",
          challenges: [
            info(
              "The argument in three steps",
              "(1) If God does not exist, objective moral values do not exist — 'right' and 'wrong' would be electrochemistry and social convention, nothing more. (2) But objective moral values DO exist — torturing children for fun is not merely unfashionable; it is REALLY wrong, and rescuing them is REALLY good. (3) Therefore, God exists. The argument does not say atheists behave badly — many live admirably. It says REAL moral OBLIGATION needs a foundation no molecule can supply.",
            ),
            arrange(
              "Build the moral argument",
              "The syllogism",
              ["If no God, no objective moral values", "Objective moral values do exist", "Therefore, God exists"],
              ["Atheists are evil people", "Morality is a scam invented by priests"],
              "The premises do the work: no Lawgiver, no real law — but the law is real. Note carefully: many atheists agree with premise 1 and simply deny 2.",
            ),
            info(
              "Two escape routes — both costly",
              "The skeptic can deny objective morality exists (premise 2): 'torturing children for fun is just your preference.' But almost no one can live that way — the same skeptic will cry REAL injustice when wronged, when tyrants oppress, when human-subject research ethics are violated. Or he can keep objective morals without God (deny premise 1) — but then WHAT grounds them? Sociobiology explains why we FEEL morals; it cannot make them TRUE. Explaining the belief is not the same as grounding the fact.",
            ),
            sel(
              "The moral argument does NOT claim that…",
              "🛡️ Fairness check",
              "Atheists cannot behave morally",
              ["Objective values need grounding", "Moral experience is real", "A Lawgiver explains moral law"],
              "Read the argument's lips: it is about the FOUNDATION of moral facts, not the behavior of atheists. Straw-manning this is the most common error in the debate.",
            ),
            assist(
              "Explaining WHY we believe in morals (evolution, culture) is not the same as ___ them — making them actually binding.",
              "The grounding gap",
              "grounding",
              ["doubting", "feeling", "describing"],
              "A description of the belief in justice never becomes a prescription of justice. Is ≠ ought.",
            ),
            match("Tap the pairs", [
              ["Objective moral value", "true whether or not approved"],
              ["Sociobiology", "explains the belief"],
              ["Grounding", "makes obligation real"],
              ["Is vs ought", "description ≠ prescription"],
            ]),
          ],
        },
        {
          title: "The Euthyphro Question",
          challenges: [
            info(
              "The dilemma, stated fairly",
              "Plato's old challenge: 'Is something good because God commands it, or does God command it because it is good?' If the first — God could command cruelty and it would become 'good' (arbitrary horror). If the second — goodness floats ABOVE God, and He is just a messenger reading a standard He doesn't control. Either way, say critics, morality doesn't really need God. This is the strongest single objection to the moral argument. It deserves a careful answer.",
            ),
            sel(
              "The Euthyphro dilemma asks whether…",
              "🏛️ Objection check",
              "Good is good because commanded, or commanded because already good",
              ["God exists at all", "Plato was a Christian", "Morality can be measured scientifically"],
              "Horn one: arbitrariness. Horn two: a standard beyond God. The dilemma forces a choice between two bad options — UNLESS there is a third option.",
            ),
            info(
              "The third option: God IS the good",
              "The classic answer: goodness flows from God's NATURE — His character. God does not invent justice (horn one), nor obey a standard outside Himself (horn two); He IS loving, just, faithful, holy. Commands EXPRESS the character, like a thermometer reading the temperature of God's own being. The standard is neither below Him nor above Him — it IS Him. The dilemma assumes God and good are two separate items to relate; classical theism identifies them — God IS the good.",
            ),
            sel(
              "The third horn of the Euthyphro dilemma says goodness is…",
              "💡 Response check",
              "God's own nature, expressed in His commands",
              ["Whatever the majority votes", "A rule God found and copied", "An illusion for weak minds"],
              "God's commands are the AMPLIFIER of His character — He cannot command against His nature any more than heat can freeze.",
            ),
            info(
              "Why this matters so much",
              "The Euthyphro answer shows theism is not ONE theory of ethics among many — it is the only framework where moral obligations are (a) real (grounded in a personal source, not chemistry), (b) authoritative (binding on all, since they flow from the source of being), and (c) livable (we are made by and for the Good Himself). Secular theories pick at most one. Paul says the Gentiles show 'the work of the law written on their hearts' (Romans 2:15) — conscience is the fingerprint of the Lawgiver.",
            ),
            typeAns(
              "Type the book of the Bible where Paul says the law is 'written on their hearts' (one word)",
              "Where conscience is located",
              ["romans", "romans 2", "rom"],
              "Romans 2:15 — the moral law within is evidence of the Lawgiver without.",
            ),
          ],
        },
        {
          title: "The Law Written on Hearts",
          challenges: [
            info(
              "Conscience: signal, not static",
              "Every culture, every era, every tribe shows a startling moral overlap: courage over cowardice, loyalty over betrayal, care for children, horror at murder and betrayal. Anthropology's exceptions (spartan exposure, honor killings) prove the rule — they are justified by DEEPER appeals to loyalty or honor, never by celebrating betrayal as such. C.S. Lewis built his case in Mere Christianity on this 'Tao' — the universal moral grammar. Grammar needs a grammarian.",
            ),
            sel(
              "Cross-cultural moral overlap is best explained by…",
              "🌐 Anthropology check",
              "A shared moral constitution — pointing beyond culture",
              ["Identical weather everywhere", "Total coincidence", "Cultures never disagreeing"],
              "Disagreements exist at the edges; the CORE (murder, betrayal, care for the weak) is stunningly universal — exactly what 'written on hearts' predicts.",
            ),
            info(
              "Dignity: the moral argument's crown",
              "If humans are cosmic accidents, human rights are a polite fiction — nature knows no rights, only power. But if humans are made in the image of a personal Creator, every person has worth no vote can revoke. Historian's footnote: the abolition of slavery, hospitals, and human-rights language all grew from theology's soil. Even secular humanism is, as one philosopher put it, 'Christianity's unpaid debt' — cut from its roots, the flower fades. Objective dignity requires a dignifier.",
            ),
            sel(
              "Human rights that no vote can revoke make sense IF…",
              "👑 Dignity check",
              "Every person is made in the image of a transcendent Creator",
              ["Humans are the strongest species", "Governments decide to be kind", "Enough people sign a charter"],
              "Unalienable rights need an anchor beyond parliaments and power — imago Dei is that anchor.",
            ),
            match("Tap the pairs", [
              ["Conscience", "law written on hearts"],
              ["Euthyphro", "answered by God's nature"],
              ["Imago Dei", "unalienable dignity"],
              ["Objective morals", "a personal Lawgiver"],
            ]),
            info(
              "⚖️ Unit complete!",
              "You can state the moral argument, dodge its most-mocked straw man, and answer the Euthyphro dilemma with the classical third option. The rope now holds origin, ground, design and goodness. Next: mind itself — the hardest problem in all of science.",
            ),
          ],
        },
      ],
    },
    {
      title: "Mind, Reason & Revelation",
      description: "Consciousness, the argument from reason, the ontological argument — and the cumulative case.",
      emoji: "🧠",
      color: "#86198F",
      lessons: [
        {
          title: "The Consciousness Puzzle",
          challenges: [
            info(
              "The 'hard problem'",
              "Neuroscience maps WHICH brain states correlate with experiences — but WHY should vibrating atoms produce the TASTE of chocolate, the ACHE of grief, the SEEING of red? Philosopher David Chalmers calls this the 'hard problem of consciousness.' Physical science explains structure and function; experience itself — qualia — seems like a further fact. If matter is all there is, consciousness is the universe's most embarrassing anomaly.",
            ),
            sel(
              "The 'hard problem' of consciousness is…",
              "🧩 Problem check",
              "Why physical processes produce subjective experience at all",
              ["Which brain areas light up in scans", "How to define the word 'mind'", "Whether brains are fast"],
              "Correlation maps are 'easy problems'. The hard problem: why is there something it is LIKE to be you?",
            ),
            info(
              "Two worldviews, one anomaly",
              "Naturalism says: mind must EMERGE from mindless matter — a strange alchemy where adding enough non-conscious parts produces consciousness (like adding enough non-living parts and getting life, which at least has a mechanism). Theism says: mind is FUNDAMENTAL — the universe began with a Consciousness, and our minds are lesser candles lit from the primal Flame. On which view is consciousness expected rather than miraculous? The theist starts with mind; the naturalist must conjure it from mud. As one philosopher quipped: if you start with matter, you never get to mind; if you start with Mind, matter is the easy part.",
            ),
            sel(
              "On theism, human consciousness is…",
              "🕯️ Expectation check",
              "Expected — made in the image of the fundamental Mind",
              ["A violation of physics", "A late cosmic accident", "Strictly identical to brain chemistry"],
              "If reality's foundation is conscious, small conscious beings are no surprise. If reality's foundation is mindless, they are the deepest mystery in town.",
            ),
            match("Tap the pairs", [
              ["Qualia", "what experience feels like"],
              ["Chalmers", "named the hard problem"],
              ["Naturalism", "consciousness as emergent anomaly"],
              ["Theism", "consciousness as image-of-Mind"],
            ]),
          ],
        },
        {
          title: "Reason on Naturalism",
          challenges: [
            info(
              "C.S. Lewis's headache for naturalism",
              "In 'Miracles', Lewis posed the argument from reason: if my thoughts are ONLY the motion of atoms in my skull — caused by blind physical forces, not by logic — then I have no reason to trust them as TRUE. A brain that reasons the way a river reasons, by purely physical pressure, cannot KNOW anything. But we DO trust reason (science depends on it!). So reasoning requires something that mere matter-motion cannot supply: contact with grounds, not just causes.",
            ),
            sel(
              "The argument from reason challenges the idea that…",
              "💭 Argument check",
              "Thoughts are nothing but blind physical movements in the brain",
              ["Brains exist at all", "People can be rational", "Logic is useful in math"],
              "Causes push; grounds PERSUADE. If only causes exist, every belief is a chemical event — including the belief in naturalism. The saw that cuts cannot cut itself.",
            ),
            info(
              "Plantinga's upgrade: EAAN",
              "Alvin Plantinga sharpened this into the Evolutionary Argument Against Naturalism: evolution selects for SURVIVAL behavior, not TRUE belief — beliefs could be wildly false yet adaptive (as long as they trigger survival-helpful actions). So if naturalism + evolution are both true, our cognitive faculties are probably unreliable — including the faculties that concluded 'naturalism is true'! Naturalism, teamed with evolution, saws off the branch it sits on. Theism, where minds are designed BY truth-oriented Mind, keeps its footing.",
            ),
            sel(
              "Plantinga's EAAN argues that naturalism + evolution undermine…",
              "🪚 Self-defeat check",
              "Our trust in our own reasoning faculties",
              ["The fossil record", "The theory of gravity", "Moral behavior in animals"],
              "Unreliable faculties can't certify the very worldview that says faculties are unreliable. Theism predicts truth-tracking minds; naturalism has no reason to.",
            ),
            typeAns(
              "Type the surname of the philosopher behind the Evolutionary Argument Against Naturalism",
              "The philosopher's name",
              ["plantinga", "alvin plantinga"],
              "Alvin Plantinga — the philosopher who reintroduced rigor into philosophy of religion and made naturalism do push-ups.",
            ),
          ],
        },
        {
          title: "The Perfect Being & the Case Assembled",
          challenges: [
            info(
              "The strangest argument of all",
              "Anselm of Canterbury (1033–1109) prayed his way into an argument: God is 'that than which nothing greater can be conceived.' Even the FOOL who denies God must grasp that definition to deny it — so the concept exists in his understanding. But existing in reality is GREATER than existing only in the mind. Therefore that-than-which-nothing-greater-can-be-conceived exists in reality. God cannot be merely imagined; by definition, the Perfect cannot lack existence.",
            ),
            sel(
              "Anselm's definition of God is…",
              "📖 Definition check",
              "That than which nothing greater can be conceived",
              ["The strongest possible being physically", "The oldest being in the universe", "Whatever causes morality"],
              "Note what it does: defines God at the ceiling of conceivable greatness — existence itself being one greatness-making property.",
            ),
            info(
              "Gaunilo's island and Kant's bill",
              "The monk Gaunilo countered: by that logic I can imagine a PERFECT ISLAND, and it must exist! (Anselm's friends replied: islands have no intrinsic maximum — greatness does.) Kant struck harder: existence is not a predicate, not a property that adds to a concept — 'a hundred real dollars' adds nothing to the concept of 'a hundred dollars.' Yet the story continues: modal versions (Hartshorne, Plantinga) argue that if a maximally great being is POSSIBLE, it exists in every possible world — including this one. Most philosophers stay cautious, but the modal revival keeps the old prayer intriguing.",
            ),
            sel(
              "Gaunilo's counter-argument used…",
              "🏝️ Objection check",
              "A perfect island that would also have to exist",
              ["A perfect triangle", "A perfect number", "A perfect storm"],
              "The island parody targets the move from concept to reality. The theist's reply: only God has a maximum — islands are always improvable, God is not.",
            ),
            info(
              "The rope, tied off",
              "Step back and survey the case: a universe with a BEGINNING (kalam) and a GROUND (contingency), constants dialed for LIFE (design), moral law written in HEARTS (moral argument), conscious minds awaiting explanation (consciousness), and reason itself at home only in a world made by Mind (argument from reason) — plus the greatest event in history claimed and attested: the resurrection. No single thread forces the knee to bow. The ROPE is another matter. And the rope ends at a person: not a force, but a Father — not a deduction, but a Face. The arguments don't REPLACE faith; they clear the road for it.",
            ),
            match("Tap the pairs — the cumulative case", [
              ["Kalam", "the universe began"],
              ["Contingency", "why anything exists"],
              ["Fine-tuning", "dials set for life"],
              ["Moral argument", "real right and wrong"],
              ["Argument from reason", "logic needs a Logos"],
            ]),
            info(
              "✨ Course complete!",
              "You have walked the full road of natural theology — from the first question to the cumulative case. The God question is not a brain-teaser but a doorway. Next stops: Ethics (what the Lawgiver calls good) and Metaphysics (the deep grammar of being). Soli Deo gloria!",
            ),
          ],
        },
      ],
    },
  ],
}
