import type { SeedCourse, SeedUnit } from "./helpers"
import { info, sel, assist, match, arrange, typeAns } from "./helpers"
import { logicUnitsB } from "./logic2"

// 🧠 Logic & Fallacies — the lost art of thinking Christianly.
// "Come now, and let us reason together, saith the LORD" — Isaiah 1:18 (KJV)
export const logicUnitsA: SeedUnit[] = [
  // ── UNIT 1 · What Reasoning Is ───────────────────────────────
  {
    title: "The Grammar of Reason",
    description: "What an argument really is, the three kinds of inference, and the difference between a valid argument and a true one.",
    emoji: "🏛️",
    color: "#C2410C",
    difficulty: 1,
    lessons: [
      {
        title: "What Is an Argument?",
        challenges: [
          info(
            "Not a quarrel — a case",
            "In logic an ARGUMENT is not a fight. It is a set of STATEMENTS offered as REASONS (premises) in support of another statement (the CONCLUSION). 'The tomb was empty on the third day; no enemy produced the body despite every motive to do so; therefore the earliest enemies themselves testified an absence.' Three premises, one conclusion — a case, whether or not it convinces you. Scripture praises exactly this: 'Come now, and let us reason together, saith the LORD' (Isaiah 1:18, KJV).",
          ),
          sel(
            "Which of these is an argument in the logical sense (reasons supporting a conclusion)?",
            "🪜 Argument or opinion?",
            "Sinai's thunder proves God spoke, because the people heard it and the text records their testimony",
            ["I really dislike loud arguments", "Theology is so interesting!", "Mount Sinai is in the Sinai peninsula"],
            "Reason (people heard; text records) → conclusion (God spoke). The others are preferences, exclamations or plain facts — no inferential movement.",
          ),
          match("Tap the pairs", [
            ["Premise", "a statement offered as a reason"],
            ["Conclusion", "the statement the reasons are meant to support"],
            ["Argument", "premises plus a conclusion"],
            ["Assertion", "a claim stated without reasons"],
          ]),
          sel(
            "'You just have to have faith' — as an answer to the question 'Why believe?' — is best described as…",
            "🪜 Case or assertion?",
            "An assertion, not an argument",
            ["A valid syllogism", "A counterexample", "A dilemma"],
            "It states a position but offers no premises. It may be sincere — but logically it is an assertion. Faith has reasons to stand on (1 Peter 3:15); this unit teaches you to find them.",
          ),
          typeAns(
            "Spell the term",
            "The statement your premises are meant to establish is called the ______",
            ["conclusion"],
            "Every argument aims at one. Find it first, and the rest of the argument falls into place.",
          ),
        ],
      },
      {
        title: "The Three Kinds of Inference",
        challenges: [
          info(
            "Deduction · Induction · Abduction",
            "DEDUCTION: if the premises are true the conclusion MUST be true ('All Scripture is God-breathed; this verse is Scripture; so this verse is God-breathed'). INDUCTION: the conclusion is PROBABLE, built from repeated cases ('every manuscript family attests this reading; the reading is likely original'). ABDUCTION: inference to the BEST EXPLANATION ('the tomb was empty and the disciples died testifying resurrection; the best explanation is that He rose'). Most apologetics is abductive at its core.",
          ),
          match("Tap the pairs", [
            ["Deduction", "guarantees its conclusion"],
            ["Induction", "generalises from cases"],
            ["Abduction", "inference to best explanation"],
          ]),
          sel(
            "'Hundreds of thousands of fish fossils show burial in catastrophe sediments; therefore the fossil record testifies to rapid burial events' — what kind of inference?",
            "🐟 Which logic?",
            "Induction",
            ["Deduction", "Abduction", "None — it's a definition"],
            "It generalises from many observed cases to a probable conclusion about the whole record. One fossil would not carry it; the weight of cases does.",
          ),
          sel(
            "'The disciples were transformed from despair to boldness, enemies converted, and a persecuted movement exploded from the very city of the execution — the best explanation is that Jesus rose.' This is…",
            "🌅 Which logic?",
            "Abduction",
            ["Deduction", "Induction", "A logical fallacy"],
            "Inference to the best explanation — the classic apologetic move. It does not prove with mathematical force; it shows one explanation outstrips its rivals (as in the minimal-facts method).",
          ),
          assist(
            "Fill in the blank",
            "The only inference whose conclusion cannot be false while its premises are true is ______",
            ["deduction", "deductive reasoning"],
            ["induction", "abduction", "intuition"],
            "That is why logicians call deduction 'truth-preserving'. Induction and abduction earn probability, not certainty — and probability is still knowledge.",
          ),
        ],
      },
      {
        title: "Valid, Sound, True",
        challenges: [
          info(
            "Two different questions",
            "VALIDITY is about FORM: does the conclusion follow from the premises no matter what they talk about? SOUNDNESS is validity PLUS true premises. A valid argument can have a false conclusion if a premise is false; a sound argument cannot fail. 'All fish fly; salmon are fish; therefore salmon fly' — perfectly VALID, plainly unsound. 'All men are mortal; Caiaphas was a man; therefore Caiaphas was mortal' — valid AND sound.",
          ),
          sel(
            "'All angels are invisible; Gabriel is an angel; therefore Gabriel is invisible.' Assuming both premises true, this argument is…",
            "🪜 Check the form",
            "Valid and sound (if the premises are true)",
            ["Valid but unsound, because angels may be seen", "Invalid, because Gabriel is an archangel", "A fallacy of composition"],
            "The form (All A are B; x is A; so x is B) is valid, and if both premises are true the conclusion must be true. Note: Scripture shows angels CAN be seen when God sends them — so testing premises matters as much as testing form!",
          ),
          sel(
            "The quickest way to show an argument is INVALID is to…",
            "🪜 Testing technique",
            "Give the same form with obviously true premises and an obviously false conclusion",
            ["Disagree with its conclusion", "Question the arguer's motives", "Find a spelling error in it"],
            "This is the COUNTEREXAMPLE test — the logician's crowbar. Same form, true premises, false conclusion: the form is broken and can carry falsehood anywhere.",
          ),
          typeAns(
            "Spell the term",
            "An argument that is valid AND has all-true premises is called ______",
            ["sound"],
            "Sound = the gold standard. Seek sound arguments, and be honest when your own case falls short of it.",
          ),
          sel(
            "Someone says: 'Your syllogism about the resurrection is valid, therefore it proves Jesus rose.' What's missing from their claim?",
            "🪜 Careful!",
            "Validity alone proves nothing — the premises must also be true",
            ["Nothing — validity is enough", "A better conclusion", "At least three more premises"],
            "A valid argument with a false premise delivers a false conclusion with perfect form. 'If the moon is cheese, astronauts eat cheese; the moon is cheese…' Valid. Unsound. False.",
          ),
        ],
      },
    ],
  },

  // ── UNIT 2 · Dissecting Arguments ────────────────────────────
  {
    title: "Dissecting the Case",
    description: "Find the conclusion, surface hidden premises, and read your opponent's argument at its strongest — the Berean method.",
    emoji: "🔬",
    color: "#C2410C",
    difficulty: 1,
    lessons: [
      {
        title: "Find the Conclusion First",
        challenges: [
          info(
            "Indicator words",
            "CONCLUSION indicators: therefore, so, thus, hence, it follows that, which shows that, consequently. PREMISE indicators: because, since, for, as, given that, inasmuch as. Proverbs 18:17 (KJV): 'He that is first in his own cause seemeth just; but his neighbour cometh and searcheth him.' The first step of 'searching' a cause is locating its conclusion — the sentence everything else exists to serve.",
          ),
          sel(
            "'Since the oldest manuscripts lack the verse, and scribes more often added than removed, therefore the shorter reading is original.' The conclusion is…",
            "🔎 Locate the claim",
            "The shorter reading is original",
            ["The oldest manuscripts lack the verse", "Scribes more often added than removed", "Since"],
            "'Therefore' flags the conclusion; the other two claims are premises doing the work. Textual critics really do argue this way — now you can follow and evaluate them.",
          ),
          match("Tap the pairs", [
            ["therefore", "conclusion indicator"],
            ["because", "premise indicator"],
            ["it follows that", "conclusion indicator"],
            ["given that", "premise indicator"],
          ]),
          arrange(
            "Put the standard form in order",
            "P1. All Scripture is God-breathed. P2. This passage is Scripture. C. This passage is God-breathed.",
            ["P1. All Scripture is God-breathed.", "P2. This passage is Scripture.", "C. This passage is God-breathed."],
            ["Socrates is mortal.", "The sky is green."],
            "Standard form: premises first (P1, P2…), conclusion last (C). Writing an argument this way is half the dissection.",
          ),
          sel(
            "An argument with NO indicator words ('The tomb was empty. The enemies preached conversion in that same city. Nobody produced the body.') — where is the conclusion?",
            "🪜 No signposts",
            "The claim the others support — here, most naturally the unspoken one each premise points toward",
            ["Always the first sentence", "Always the last sentence", "There is no conclusion"],
            "Without indicators, ask: which statement could all the others be REASONS for? That's the conclusion. Context and emphasis decide.",
          ),
        ],
      },
      {
        title: "Hidden Premises (Enthymemes)",
        challenges: [
          info(
            "The argument beneath the argument",
            "Most real-world arguments leave premises UNSAID — these are ENTHYMEMES. 'She apologised, so you should forgive her' hides at least two premises: 'apologising creates a duty to forgive' and 'you ought to do your duties'. Surface the hidden premise and the argument becomes testable. Paul did this on Mars Hill: he named the Athenians' hidden assumptions before preaching the unknown God (Acts 17:22-31).",
          ),
          sel(
            "'This codex is ancient, so its readings are reliable.' Which hidden premise does the argument need?",
            "🏺 Excavate the premise",
            "Whatever is ancient is reliable",
            ["Whatever is reliable is ancient", "All codices are Greek", "Scribes never made errors"],
            "The needed bridge is 'ancient → reliable' — and it is FALSE (ancient scribes were fallible too). Surfacing the hidden premise is how you expose the weak joint in an otherwise confident-sounding case.",
          ),
          sel(
            "'The disciples died for their claim; people don't die for lies they invented; therefore they believed what they preached.' To reach 'therefore Christianity is true', which FURTHER premise would be needed?",
            "🪜 Complete the bridge",
            "The disciples were in a position to know whether the claim was true, and were sincere",
            ["Everyone who dies for anything is right", "Sincerity equals truth", "Nothing else is needed"],
            "Martyrdom proves sincerity and (if they were eyewitnesses) knowledge — it does not by itself prove truth. Seeing exactly which premise is missing is dissection at its finest.",
          ),
          typeAns(
            "Spell the term",
            "An argument with an unstated premise is called an ______ (Greek: 'kept in mind')",
            ["enthymeme"],
            "Named by Aristotle. Every advertisement, sermon and tweet you'll ever dissect is full of them.",
          ),
          assist(
            "Fill in the blank",
            "Making an implicit premise explicit is the first step to ______ the argument fairly",
            ["testing", "test", "evaluating", "evaluate"],
            ["ignoring", "mocking", "winning"],
            "You cannot test what you cannot see. Charity begins with reconstruction.",
          ),
        ],
      },
      {
        title: "The Principle of Charity",
        challenges: [
          info(
            "Read arguments at their strongest",
            "The PRINCIPLE OF CHARITY: reconstruct your opponent's argument in its strongest, most plausible form before evaluating it — a STEELMAN, not a strawman. Why? Three reasons: (1) honesty — you may be wrong and they may be right; (2) safety — defeating a weak version proves nothing about the strong one; (3) Scripture — 'as ye would that men should do to you, do ye also to them likewise' (Luke 6:31, KJV). Charity is not weakness; it is precision.",
          ),
          sel(
            "Before answering a skeptic's case for naturalism, the charitable thinker first…",
            "🪜 Golden rule of debate",
            "Rebuild it in its strongest form — and check with them that they recognise it",
            ["Finds its most embarrassing wording to quote", "Replies immediately with a verse", "Changes the subject to their lifestyle"],
            "Answering a case no one holds is shadow-boxing. 'He that answereth a matter before he heareth it, it is folly and shame unto him' (Proverbs 18:13, KJV).",
          ),
          match("Tap the pairs", [
            ["Steelman", "the strongest form of a case"],
            ["Strawman", "a weakened caricature of a case"],
            ["Principle of charity", "interpret arguments at their best"],
            ["Proverbs 18:13", "answering before hearing is folly"],
          ]),
          sel(
            "'Christians just want a cosmic security blanket!' What is the charitable FIRST response?",
            "🪜 Pause and rebuild",
            "Ask what argument supports that claim, and consider the strongest version of it",
            ["Reply that atheists are the ones fleeing moral accountability", "Say 'that's an ad hominem!' and end the conversation", "Ignore it — tone proves they lost"],
            "Note well: the tu-quoque comeback may be TRUE and is still not an answer to the claim. Charity means hearing the case; the next units give you the tools to test it.",
          ),
          typeAns(
            "Spell the term",
            "The opposite of a strawman — the strongest honest version of an opponent's argument — is called a ______",
            ["steelman"],
            "If you can defeat the steelman, you've won something. If you can't, you've learned something. Either way you're no longer fooling yourself.",
          ),
        ],
      },
    ],
  },

  // ── UNIT 3 · Formal Fallacies ────────────────────────────────
  {
    title: "Broken Forms",
    description: "Two valid forms every thinker must own — and the three broken imitations that masquerade as them.",
    emoji: "🧩",
    color: "#A63A08",
    difficulty: 2,
    lessons: [
      {
        title: "Two Valid Forms",
        challenges: [
          info(
            "Modus ponens & modus tollens",
            "MODUS PONENS (affirming): If P then Q; P; therefore Q. MODUS TOLLENS (denying): If P then Q; not-Q; therefore not-P. Paul argues by modus tollens in 1 Corinthians 15 (KJV): 'if there be no resurrection of the dead, then is Christ not risen…' — and since Christ IS risen, the chain runs backwards: there IS a resurrection of the dead. Jesus used reductio (a cousin of tollens) in Matthew 12:25-26: if Satan casts out Satan, his kingdom cannot stand — but it stands; so the premise is false.",
          ),
          sel(
            "'If God raised Jesus, death is not final. God raised Jesus. Therefore death is not final.' The form is…",
            "🪜 Name the form",
            "Modus ponens",
            ["Modus tollens", "Affirming the consequent", "Undistributed middle"],
            "If P then Q; P; therefore Q. The form is valid — the debate must be about the premises, and that is exactly where honest argument lives.",
          ),
          sel(
            "'If the vision were from God, it would agree with Scripture. It does not agree with Scripture. Therefore it is not from God.' The form is…",
            "🪜 Name the form",
            "Modus tollens",
            ["Modus ponens", "Denying the antecedent", "Begging the question"],
            "If P then Q; not-Q; therefore not-P. This is the Berean test (Acts 17:11) cast as valid form — the very logic of 'prove all things' (1 Thessalonians 5:21, KJV).",
          ),
          arrange(
            "Assemble the modus tollens",
            "If P then Q. Not-Q. Therefore not-P.",
            ["If P then Q.", "Not-Q.", "Therefore not-P."],
            ["Therefore P.", "If Q then P."],
            "Two lines in, the denial ripples backwards. Master this one form and you own half of formal reasoning.",
          ),
          assist(
            "Fill in the blank",
            "In modus ponens, after 'If P then Q' you affirm P and conclude ______",
            ["Q"],
            ["not-Q", "not-P", "P"],
            "Affirm the antecedent (P), ride the arrow forward to Q. Simple, airtight, everywhere.",
          ),
        ],
      },
      {
        title: "Affirming the Consequent",
        challenges: [
          info(
            "The backwards arrow",
            "AFFIRMING THE CONSEQUENT: If P then Q; Q; therefore P — INVALID. The arrow points one way. Rain makes ground wet; the ground is wet; therefore it rained? No — a sprinkler did it. MANY causes can produce the same effect. Watch for it everywhere: 'If God existed, the world would be good; the world is good; therefore God exists' — invalid, even when preaching to the choir. The conclusion may be true; THIS route to it is broken.",
          ),
          sel(
            "'If Jesus is who he says, lives change. My friend's life changed. Therefore Jesus is who he says.' The fallacy is…",
            "🪜 Broken form",
            "Affirming the consequent",
            ["Modus ponens", "Modus tollens", "No fallacy — the form is valid"],
            "Changed lives have many possible sources; they confirm the conditional's arrow only weakly. Honest apologetics refuses to use for its own side the form it rejects from the other.",
          ),
          sel(
            "Why can many causes share one effect?",
            "🪜 The heart of the fallacy",
            "Because 'If P then Q' promises only that P produces Q — never that P alone produces Q",
            ["Because effects are always random", "Because premises can be false", "Because Q is usually false"],
            "P is SUFFICIENT for Q, not NECESSARY. The wet-ground test: rain, sprinkler, burst pipe, a spilled bucket. One arrow in, many roads in.",
          ),
          match("Tap the pairs", [
            ["Affirming the consequent", "If P then Q; Q; so P"],
            ["Valid modus ponens", "If P then Q; P; so Q"],
            ["Sufficient condition", "enough by itself to bring Q about"],
            ["Necessary condition", "required for Q, but maybe not enough"],
          ]),
          sel(
            "Which reply best repairs the changed-lives argument into valid territory?",
            "🪜 Rebuild honestly",
            "Treat it as abductive evidence: compare 'Jesus is who he says' with rival explanations of the transformation",
            ["Repeat it louder with more examples", "Add 'and the Bible says lives change'", "Call anyone who objects a cynic"],
            "As abduction (best-explanation reasoning) the case becomes honest and testable — weaker than proof, stronger than nothing. Form matters because truth deserves the right vehicle.",
          ),
        ],
      },
      {
        title: "Denying the Antecedent & Undistributed Middle",
        challenges: [
          info(
            "Two more impostors",
            "DENYING THE ANTECEDENT: If P then Q; not-P; therefore not-Q — INVALID. 'If you repent you'll be forgiven; you didn't repent… so you can't be forgiven'? The form forbids this (God's mercy is not boxed by our map of it). UNDISTRIBUTED MIDDLE: All A are C; all B are C; therefore all A are B — INVALID. 'All apostles were Jews; all these men are Jews; therefore they are apostles.' The middle term never stretches across.",
          ),
          sel(
            "'If a prophet is from God, his words come true. That teacher's words came true — he must be from God.' What TWO problems does this have?",
            "🪜 Double trouble",
            "It affirms the consequent — and Scripture itself warns true-ish signs can mark false prophets (Deuteronomy 13:1-3)",
            ["It denies the antecedent and begs the question", "It is actually valid; no problem", "It is a false dilemma only"],
            "Form is broken AND the theological premise is unbiblical — the two levels of testing (form, then premises) working together, exactly as this course trains.",
          ),
          sel(
            "'If I pray, God will heal. I didn't pray. So God won't heal.' The fallacy is…",
            "🪜 Broken form",
            "Denying the antecedent",
            ["Affirming the consequent", "Modus tollens", "Slippery slope"],
            "'If P then Q' does not mean 'if not-P then not-Q'. God remains free to heal the unprayed-for — and He is not a vending machine either way. Bad form here hurts pastoral care.",
          ),
          match("Tap the pairs", [
            ["Denying the antecedent", "If P then Q; not-P; so not-Q"],
            ["Undistributed middle", "All A are C; all B are C; so all A are B"],
            ["Valid modus tollens", "If P then Q; not-Q; so not-P"],
            ["Valid syllogism (Barbara)", "All A are B; x is A; so x is B"],
          ]),
          sel(
            "'All Christians are sinners. All skeptics are sinners. Therefore all Christians are skeptics.' The broken form is…",
            "🪜 Name it",
            "Undistributed middle",
            ["Affirming the consequent", "Modus ponens", "Equivocation"],
            "Sharing a category (sinner) does not make two groups identical — thank God, or grace would be impossible to locate.",
          ),
          typeAns(
            "Spell the term",
            "The invalid form 'If P then Q; not-P; therefore not-Q' is called denying the ______",
            ["antecedent"],
            "The antecedent is the 'if' half of the arrow. Denying it tells you nothing certain about the 'then' half.",
          ),
        ],
      },
    ],
  },
]

export const logicCourse: SeedCourse = {
  code: "logic",
  title: "Logic & Fallacies",
  subtitle: "Think clearly. Argue honestly.",
  description:
    "Learn to reason the way the Bereans did — test every claim, dissect every argument, and detect the fallacies hiding in the conversations that matter most. Premises and conclusions, deduction and abduction, twenty-plus fallacies named and disarmed — the lost art of loving God with all your MIND (Matthew 22:37).",
  emoji: "🧠",
  color: "#C2410C",
  order: 8,
  units: [...logicUnitsA, ...logicUnitsB],
}
