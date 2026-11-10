import type { SeedUnit } from "./helpers"
import { info, sel, assist, match, arrange, typeAns } from "./helpers"

// 🧠 Logic & Fallacies — units 4-6 (informal fallacies & applied reason).
export const logicUnitsB: SeedUnit[] = [
  // ── UNIT 4 · Informal Fallacies I ────────────────────────────
  {
    title: "Fallacies of Attack & Appeal",
    description: "Ad hominem, tu quoque, false authorities and crowd appeal — the fallacies that aim at the person instead of the point.",
    emoji: "⚔️",
    color: "#9A3412",
    difficulty: 2,
    lessons: [
      {
        title: "Attacking the Person",
        challenges: [
          info(
            "Ad hominem — against the man",
            "AD HOMINEM rejects a claim by attacking the one who makes it. Three flavours: ABUSIVE ('you're an idiot'), CIRCUMSTANTIAL ('of course a pastor would say that'), and TU QUOQUE ('and you do the same thing!'). The claim lives or dies on its evidence, not its author's manners. Careful though: character is RELEVANT when the argument depends on the person's reliability (eyewitness trustworthiness, expert honesty). 'Testimony needs a trustworthy testifier' is not ad hominem — it is evidence law.",
          ),
          sel(
            "'The Gospels can't be trusted — they were written by biased believers.' The fairest analysis is…",
            "🪜 Dissect carefully",
            "This raises a real evidential question (bias is a fact of all human witness) but does not settle it — both believers and skeptics can reason well or badly",
            ["Pure ad hominem — bias never matters at all", "A sound refutation of the Gospels", "A tu quoque fallacy"],
            "The honest move: weigh the testimony (early, multiple, willing to die, embarrassing details retained) rather than dismissing either the objection or the documents wholesale. Fallacy-hunting is precision work, not a bludgeon.",
          ),
          sel(
            "'You say forgiveness matters, but you held a grudge last year — so your view is false.' This is…",
            "🪜 Name the fallacy",
            "Tu quoque ('you also') — hypocrisy does not falsify a claim",
            ["Modus tollens", "A valid appeal to conduct", "Begging the question"],
            "A hypocrite can preach true doctrine. Answer the grudge honestly — and note the argument never touched the claim. Christians should be the first to grant this point, and the first to repent of the hypocrisy.",
          ),
          match("Tap the pairs", [
            ["Ad hominem (abusive)", "'only a fool would believe that'"],
            ["Ad hominem (circumstantial)", "'of course the priest says so'"],
            ["Tu quoque", "'you did it too'"],
            ["Legitimate character evidence", "questioning a proven liar's testimony"],
          ]),
          typeAns(
            "Spell the term",
            "The fallacy of rejecting a claim because of who says it, not what is said, is called ad ______ (Latin: 'to the person')",
            ["hominem"],
            "Latin: 'against the man'. The oldest fallacy and still the most popular on the internet.",
          ),
        ],
      },
      {
        title: "Wrong Authorities & Crowds",
        challenges: [
          info(
            "Appeals that skip the evidence",
            "APPEAL TO POPULARITY (argumentum ad populum): 'billions believe it, so it's true' — majorities have been wrong. APPEAL TO INAPPROPRIATE AUTHORITY: a famous actor's opinion on manuscripts is not manuscript evidence. APPEAL TO FORCE (ad baculum): 'agree, or else.' APPEAL TO PITY (ad misericordiam): 'I've suffered so much — agree with me.' None tests the claim itself. RIGHT use of authority: a real expert, in field, backed by evidence, honestly reported — 'expert testimony' is legitimate evidence when the expertise is real and relevant.",
          ),
          sel(
            "'Two billion Christians can't be wrong!' As an argument for the faith, this is…",
            "🪜 Even when it favors us",
            "An appeal to popularity — numbers don't make truth",
            ["A sound inductive argument", "Modus ponens", "An appeal to appropriate authority"],
            "Majorities once held the sun circled the earth. Christianity stands on resurrection evidence, not head-counts — never borrow a broken argument just because it points your way.",
          ),
          sel(
            "Which is the LEGITIMATE use of authority?",
            "🪜 Not every appeal is a fallacy",
            "Citing a papyrologist's published dating of P52, in her field, verifiable by others",
            ["Citing a celebrity's opinion on textual criticism", "Citing a physicist on theology because he has a Nobel prize", "Citing a poll of what most people feel"],
            "Legitimate authority = real expertise + relevant field + checkable claims. Fallacy-hunting means precision, not cynicism about all expertise.",
          ),
          sel(
            "'If you keep asking those questions, don't expect to lead worship anymore.' As a response to honest doubt, this is…",
            "🪜 Name the pressure",
            "An appeal to force — pressure instead of proof",
            ["Modus tollens", "A strawman", "A fair pastoral warning"],
            "Coercion settles nothing logically and often wounds faiths already trembling. The Berean way welcomes the questions (Acts 17:11). Note: warning about real consequences is not coercion — context decides.",
          ),
          assist(
            "Fill in the blank",
            "'Judge not according to the appearance, but judge ______ judgment' — John 7:24 (KJV)",
            ["righteous"],
            ["hasty", "popular", "public"],
            "Righteous judgment weighs evidence, not appearances, crowds or pressure — the whole of this unit in one verse.",
          ),
        ],
      },
      {
        title: "Missing the Point",
        challenges: [
          info(
            "Strawman · Red herring · Whataboutism",
            "STRAWMAN: restating a case weaker than it is, then defeating the restatement. RED HERRING: dragging an irrelevant side-issue across the trail. WHATABOUTISM: answering a charge with a counter-charge ('what about the Crusades?'). All three dodge the actual point. The cure is the same: restate the original claim, ask if it was answered, and return to it — 'prove all things' (1 Thessalonians 5:21, KJV).",
          ),
          sel(
            "A skeptic says: 'I'm questioning the reliability of Mark's manuscript tradition.' The believer replies: 'So you think the ancients were idiots who couldn't remember anything?' The fallacy is…",
            "🪜 Name it",
            "Strawman — inflating a precise question into an absurd one",
            ["Ad hominem", "Slippery slope", "Appeal to pity"],
            "The precise claim (one manuscript tradition's reliability) got swapped for a cartoon (ancients had no memory). Precision is charity — on both sides of the aisle.",
          ),
          sel(
            "'The early manuscript evidence for the resurrection narrative is strong.' — 'But what about all the evil done in the name of religion?' This reply is…",
            "🪜 Name it",
            "A red herring — a real topic, but not THIS topic",
            ["Modus tollens", "Begging the question", "A valid tu quoque"],
            "Church failures deserve their own honest conversation (and repentance); they neither prove nor disprove manuscript evidence. One case at a time.",
          ),
          match("Tap the pairs", [
            ["Strawman", "defeats a weakened copy"],
            ["Red herring", "changes the subject"],
            ["Whataboutism", "counters a charge with a charge"],
            ["Steelman", "answers the strongest form"],
          ]),
          sel(
            "You want to answer a strawman honestly. The best first move is…",
            "🪜 Repair, then reply",
            "Restate their original claim accurately and confirm you've understood it — then answer THAT",
            ["Point out the fallacy and declare victory", "Strawman them back", "Escalate to their motive"],
            "Naming a fallacy is not winning an argument. Reconstructing and answering the real case is. 'Let your speech be alway with grace, seasoned with salt' (Colossians 4:6, KJV).",
          ),
        ],
      },
    ],
  },

  // ── UNIT 5 · Informal Fallacies II ───────────────────────────
  {
    title: "Fake Choices & Sneaky Premises",
    description: "False dilemmas, slippery slopes, question-begging, equivocation and the fallacies of hasty conclusion.",
    emoji: "🌀",
    color: "#9A3412",
    difficulty: 2,
    lessons: [
      {
        title: "False Dilemma & Slippery Slope",
        challenges: [
          info(
            "Either/or — and the domino panic",
            "FALSE DILEMMA: pretending only two options exist when more do ('either science or Scripture' — why not both, as many great scientists believed?). SLIPPERY SLOPE: claiming one step NECESSARILY drags a chain of disasters, without showing the links. Some slopes are real (Matthew 7:13-14 takes a narrow-way warning seriously!) — the fallacy is asserting the slide without showing each link is probable or necessary.",
          ),
          sel(
            "'Either you accept every modern reading of the manuscripts, or you don't believe the Bible at all!' The fallacy is…",
            "🪜 Name it",
            "False dilemma — many faithful positions exist between the poles",
            ["Slippery slope", "Ad hominem", "Valid disjunctive reasoning"],
            "Real debates (textual traditions, translations) live between 'everything' and 'nothing'. Forcing binary choices is how communities split.",
          ),
          sel(
            "'If you start asking questions in Bible study, next you'll doubt everything, then leave the faith entirely.' What makes this a FALLACY rather than a fair warning?",
            "🪜 The missing links",
            "It asserts the chain without showing each step is probable or unavoidable",
            ["It mentions doubt, which is always sinful", "It is a valid modus ponens", "It is really an appeal to authority"],
            "Questioning done Berean-style (Acts 17:11) STRENGTHENS faith — the Scriptures invite testing. A slope needs evidence link by link; otherwise it's fear dressed as foresight.",
          ),
          match("Tap the pairs", [
            ["False dilemma", "two options claimed, more exist"],
            ["Slippery slope", "unsupported chain of doom"],
            ["Legitimate warning", "documented, link-by-link risk"],
            ["Biblical example of a real slope", "little foxes spoil the vines (Song 2:15)"],
          ]),
          sel(
            "How do you CHARITABLY test a dilemma someone offers you?",
            "🪜 Repair the choice",
            "Ask: are these really the only two options? What third and fourth paths exist?",
            ["Accept whichever option is scarier", "Reject both options automatically", "Flip a coin"],
            "The dilemma dies the moment a live third option appears — and sometimes the third option is the truth both sides missed.",
          ),
        ],
      },
      {
        title: "Begging the Question & Equivocation",
        challenges: [
          info(
            "Premises that smuggle the verdict",
            "BEGGING THE QUESTION (circular reasoning): the conclusion hides inside a premise. 'The Bible is true because it's God's Word, and it's God's Word because it's true.' As PROOF this circle proves nothing — but note honestly: everyone reasons in a circle at their ultimate standard; the question is whose circle makes sense of the evidence (facts, logic, morality, resurrection). EQUIVOCATION: a word quietly changes meaning mid-argument ('faith' as trust vs 'faith' as belief-without-evidence — swapped to win cheaply).",
          ),
          sel(
            "'The Bible is the Word of God because it says so, and what it says is true because it's the Word of God.' As a standalone PROOF this is…",
            "🪜 Honest self-audit",
            "Begging the question — the conclusion is doing the premise's job",
            ["Modus ponens", "A sound abductive case", "An appeal to authority"],
            "Believers can AFFIRM Scripture's self-testimony as true — while admitting that as an argument to outsiders it needs the support of evidence (manuscripts, history, resurrection). Honesty here is rare and beautiful.",
          ),
          sel(
            "'Faith means believing without evidence (1); Christians have faith (2); therefore Christians believe without evidence (3).' The trick is…",
            "🪘 Watch the words",
            "Equivocation — 'faith' shifts meaning between biblical trust and a skeptic's redefinition",
            ["A valid syllogism using one fixed meaning", "A false dilemma", "An undistributed middle"],
            "Biblical faith (pistis) is trust grounded in testimony and promise — Hebrews 11:1's 'evidence of things not seen'. Fix the word's meaning and the argument collapses or transforms.",
          ),
          typeAns(
            "Spell the term",
            "Using one word with two different meanings in the same argument is called ______",
            ["equivocation"],
            "The sneakiest fallacy in theology: 'word', 'law', 'faith', 'church' — all get swapped mid-sentence.",
          ),
          sel(
            "Which reply breaks a circle ARGUMENT politely?",
            "🪜 Open the circle",
            "'We both take something as ultimate — can we test which worldview better explains the evidence we share?'",
            ["'Your circle is circular!' (and stop)", "'Only my book is self-attesting'", "Change the subject to their motive"],
            "Circularity at the FOUNDATION is unavoidable for everyone; circularity as ARGUMENT is empty. Distinguish the two and the conversation moves forward.",
          ),
        ],
      },
      {
        title: "Jumping to Conclusions",
        challenges: [
          info(
            "Hasty generalisation · False cause · Weak analogy · Appeal to ignorance",
            "HASTY GENERALISATION: a small sample carries a huge verdict ('two rude Christians… all Christians are rude'). POST HOC / FALSE CAUSE: after it, therefore because of it (prayed, then healed — careful! The event ORDER is not the causal PROOF; testimony and examination supply that). WEAK ANALOGY: 'God is like a watchmaker…' — every analogy limps; ask where it breaks. APPEAL TO IGNORANCE: 'you can't DISprove it, so it's true' — and its mirror 'you can't prove it, so it's false'. Absence of disproof is not proof; absence of proof is not disproof.",
          ),
          sel(
            "'You can't prove God doesn't exist — therefore He exists.' The fallacy is…",
            "🪜 Our side too",
            "Appeal to ignorance — lack of disproof is not proof",
            ["Modus tollens", "Hasty generalisation", "Equivocation"],
            "Truth cuts both ways: 'you can't prove He exists, so He doesn't' fails identically. The theist case rests on positive evidence — cosmos, conscience, Christ — never on the skeptic's inability.",
          ),
          sel(
            "'I prayed for my grandmother and she recovered — prayer works, guaranteed.' The honest analysis is…",
            "🪜 Test the causal claim",
            "Recovery after prayer is an occasion for gratitude; the general causal claim needs more than sequence",
            ["Pure false cause — God never heals", "A valid induction", "An appeal to force"],
            "One testimony is precious but not a controlled study; and medicine, timing and mystery all interact. Christians can rejoice AND stay logically careful — the two are not rivals.",
          ),
          match("Tap the pairs", [
            ["Hasty generalisation", "tiny sample, giant verdict"],
            ["Post hoc", "after it, so because of it"],
            ["Weak analogy", "comparison breaks under load"],
            ["Appeal to ignorance", "no disproof ≠ proof"],
          ]),
          sel(
            "'One televangelist faked a healing — all claims of Christian healing are fraud.' This is…",
            "🪜 Name it",
            "Hasty generalisation (with a sprinkle of guilt by association)",
            ["Valid modus tollens", "Equivocation", "A legitimate induction"],
            "Fraudulent faith healers are real and damnable (and the app says so plainly) — but one faker condemns one faker. Honest standards, applied evenly, protect everyone.",
          ),
        ],
      },
    ],
  },

  // ── UNIT 6 · The Reasoning Christian ─────────────────────────
  {
    title: "Reasoning About Ultimate Things",
    description: "Your own biased mind, real conversations at the doorstep, and the noble Berean method — loving God with all your mind.",
    emoji: "✨",
    color: "#7C2D12",
    difficulty: 3,
    lessons: [
      {
        title: "The Biased Mind",
        challenges: [
          info(
            "Your mind plays for team you",
            "CONFIRMATION BIAS: we hunt evidence for what we already believe and skim past the rest. MOTIVATED REASONING: conclusions follow wants, not just facts. DUNNING-KRUGER EFFECT: the less we know, the more confident we feel (a little learning is a confident thing). AVAILABILITY HEURISTIC: vivid stories outweigh boring statistics. 'The heart is deceitful above all things' (Jeremiah 17:9, KJV) — Scripture said it first, and it applies to BELIEVERS too. The corrective: seek disconfirming evidence, invite correction, 'in the multitude of counsellors there is safety' (Proverbs 11:14).",
          ),
          sel(
            "You notice you only read authors who already agree with your view of Genesis. The honest corrective is…",
            "🪜 Audit yourself",
            "Deliberately read the strongest opposing case and re-test your position against it",
            ["Read more of the same authors, faster", "Assume the other side has no reasons", "Label every disagreement 'bias' except yours"],
            "Confirmation bias doesn't vanish at conversion. The Bereans checked EVEN PAUL against Scripture — how much more should we check ourselves (Acts 17:11)?",
          ),
          match("Tap the pairs", [
            ["Confirmation bias", "noticing only agreeing evidence"],
            ["Motivated reasoning", "wanting, then concluding"],
            ["Dunning-Kruger effect", "least informed, most confident"],
            ["Availability heuristic", "vivid beats probable"],
          ]),
          sel(
            "A brand-new Christian is loudly schooling a veteran scholar online after two weeks of study. Which effect is most likely at work?",
            "🪜 Gentle diagnosis",
            "Dunning-Kruger — early confidence outrunning early knowledge",
            ["Availability heuristic", "Equivocation", "Modus ponens"],
            "The cure is humility and homework, not silence: 'study to shew thyself approved' (2 Timothy 2:15, KJV) — and James 1:19's 'swift to hear, slow to speak'.",
          ),
          typeAns(
            "Spell the term",
            "The bias where we search only for evidence that confirms what we already believe is called ______ bias",
            ["confirmation"],
            "Named in the 1960s by Peter Wason — diagnosed three millennia earlier by Jeremiah 17:9.",
          ),
        ],
      },
      {
        title: "Fallacies at the Doorstep",
        challenges: [
          info(
            "Both directions, honestly",
            "Fallacy-spotting is not a weapon for one tribe. SKEPTICS sometimes say: 'religion is a crutch' (genetic fallacy — origin ≠ falsity; comfort ≠ falsehood), 'you only believe because your parents did' (genetic again), 'the church is full of hypocrites' (red herring/tu quoque against the claims themselves). BELIEVERS sometimes say: 'you just have to have faith' (assertion where an answer belongs), 'everything that happens proves God' (unfalsifiable — a Texas sharpshooter), 'no true Christian would leave' (no true Scotsman). The Reasoning Christian polices BOTH sides — starting with their own.",
          ),
          sel(
            "'You only believe because you were raised in the church.' The fairest reply is…",
            "🪜 Steelman first",
            "Upbringing shapes exposure, not truth — the claim still needs evidence for or against; and every skeptic was also raised somewhere",
            ["'And you only DISbelieve because of YOUR upbringing!'", "'That's a fallacy, I win'", "Walk away immediately"],
            "The genetic fallacy cuts both ways — which is exactly why origin-talk settles nothing. Move the conversation to the evidence: manuscripts, resurrection, moral law.",
          ),
          sel(
            "A believer says: 'He walked away from the faith? Then he was never a TRUE Christian to begin with.' The fallacy is…",
            "🪜 Our own house",
            "No true Scotsman — redefining the group to protect the claim",
            ["Modus tollens", "Slippery slope", "Appeal to pity"],
            "Sometimes the redefinition is theologically argued (1 John 2:19 is a real text) — but as a REFLEX to explain every departure it immunizes the claim against all evidence. Handle Scripture carefully; handle people gentler.",
          ),
          sel(
            "'Whatever happens, it proves God — healing? God. No healing? God's plan.' The danger is…",
            "🪜 Unfalsifiable drift",
            "A claim that no possible event could count against explains everything and proves nothing",
            ["A valid abduction", "A false dilemma", "Proper humility"],
            "Christianity's strength is that it stakes REAL, testable claims — creation, cross, empty tomb, 'third day' (1 Corinthians 15:3-4). Protect the falsifiability; it is the faith's honor.",
          ),
          assist(
            "Fill in the blank",
            "'Be ready always to give an ______ to every man that asketh you a reason of the hope that is in you with meekness and fear' — 1 Peter 3:15 (KJV)",
            ["answer", "account"],
            ["argument", "opinion", "outline"],
            "'Answer' (apologia) — a reasoned defense, delivered with meekness and fear. The verse commands BOTH the case and the character.",
          ),
        ],
      },
      {
        title: "The Noble Bereans",
        challenges: [
          info(
            "The method of Acts 17:11",
            "'These were more noble than those in Thessalonica, in that they received the word with all readiness of mind, and searched the scriptures daily, whether those things were so' (Acts 17:11, KJV). THE BEREAN METHOD: (1) receive with READINESS — openness is noble; (2) SEARCH DAILY — sustained, habitual checking; (3) test the CLAIM — 'whether those things were so', even when spoken by an apostle; (4) let the standard be fixed — Scripture, not mood. This is the app's whole method in one verse: faith seeking understanding, evidence joined to devotion.",
          ),
          arrange(
            "Order the Berean method",
            "Receive openly → search the standard → test the claim → then believe and live",
            ["Receive openly", "Search the standard", "Test the claim", "Then believe and live"],
            ["Mock first", "Reflexively resist"],
            "Openness without testing is gullibility; testing without openness is cynicism. The Bereans kept both — and were called NOBLE for it.",
          ),
          sel(
            "Paul 'reasoned' with the Athenians (Acts 17:17-31) — quoting their poets, naming their unknown God, and calling for repentance. His method models…",
            "🪜 Paul in Athens",
            "Cultural bridge-building plus evidence plus a clear call — reason in service of the gospel",
            ["Pure assertion with no engagement", "Winning by shaming the philosophers", "Avoiding all controversy"],
            "'He reasoned in the synagogue and in the market daily' — dialegomai, dialogue and argument. Reason was Paul's evangelistic instrument, held together with boldness and respect.",
          ),
          match("Tap the pairs", [
            ["Isaiah 1:18", "'let us reason together, saith the LORD'"],
            ["1 Thessalonians 5:21", "'prove all things; hold fast that which is good'"],
            ["Matthew 22:37", "love God with all thy… mind"],
            ["Proverbs 18:17", "the first case seems just until searched"],
          ]),
          sel(
            "The final exam: a friend says, 'I could never believe something I can't prove with absolute certainty.' The Reasoning Christian's best reply is…",
            "🎓 Capstone",
            "Almost nothing important is provable with certainty — we live by evidence and best explanation; the question is which worldview best explains reality",
            ["'Then you should believe nothing at all, including science'", "'Just have faith and stop asking'", "'Certainty is for fools'"],
            "Courts, science and history run on evidence beyond reasonable doubt, not mathematical proof. By that standard the resurrection case — empty tomb, witnesses, transformed enemies — is exactly the kind of claim worth examining. 'O taste and see that the LORD is good' (Psalm 34:8, KJV).",
          ),
          typeAns(
            "Final spelling",
            "The city whose people 'searched the scriptures daily, whether those things were so' — Acts 17:11 (KJV)",
            ["Berea", "Beroea"],
            "Berea — where the noble test was born. Go and do likewise: receive with readiness, search daily, prove all things, hold fast the good.",
          ),
        ],
      },
    ],
  },
]
