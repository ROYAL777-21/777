# 📜 Scroll Academy — Gamified Bible Study

A **Duolingo-style Bible study app** in the spirit of [Scroll Bible App](https://scrollbibleapp.com/) — no ads, no accounts, no tracking — with the full gamification playbook: streaks, XP, hearts, gems, leagues, quests, achievements, **story mode**, and a winding learning path that gets progressively harder.

**Study tracks (10 courses, 165 lessons, 1,000+ challenges, 8 interactive stories):**

| Course | What you'll learn |
|---|---|
| 🏛️ **Biblical Greek** | The alphabet Α→Ω, the great words of the faith, John 1:1, and the full verb engine (aspect, aorist, moods) |
| 🕎 **Biblical Hebrew** | The 22-letter aleph-bet, nikkud vowels, Torah vocabulary, Genesis 1:1 — and reading the Shema yourself |
| 📜 **Manuscripts & Codices** | Papyrus to parchment, Sinaiticus & Vaticanus, the Dead Sea Scrolls, textual criticism — and how we got the canon |
| 🛡️ **Apologetics** | 1 Peter 3:15, the case for the Bible, the resurrection — and the hardest doctrines (hell, justice, judgment) handled honestly |
| 📖 **The Big Picture** | The whole Bible as one story, with a poetry workshop (parallelism, psalm types, wisdom) |
| 🔍 **Study Skills** | O.I.A. method, genre reading — and figures of speech: idioms, chiasmus, hyperbole |
| 🌍 **Worldviews & Religions** | Judaism, Islam, atheism, Hinduism, Buddhism — and new religious movements (Mormonism, JW) |
| ✨ **The Existence of God** | The full natural-theology curriculum: kalam, contingency, fine-tuning, moral argument, consciousness, reason, the ontological argument — every objection answered |
| ⚖️ **Ethics & the Good Life** | Meta-ethics, utilitarianism vs deontology vs virtue, divine command & natural law, Euthyphro answered, character formation |
| 🌀 **Metaphysics** | The deep grammar of reality: being, act & potency, essence & existence, ipsum esse subsistens, universals, time, eternity, free will |

Every course ramps in difficulty — Foundations → Growing → **Advanced (timed challenges)** — so the app gets progressively harder as you progress.

---

## 🎭 Story Mode (dialogue-based scenarios)

A Duolingo-Stories-style player with chat-bubble dialogue, narration cards, and comprehension checkpoints:

- **8 stories across 4 categories** — Bible (Road to Emmaus, Nicodemus at Night, Joseph & the Dreamers), Apologetics (Dinner with a Skeptic), Church history (Paul at the Areopagus, Justin's School in Rome), Languages (First Day of Greek)
- Animated chat bubbles with an emoji cast, spring transitions, tap-to-advance
- Checkpoint questions with correct/wrong feedback and explanations
- Full gamification integration — XP, gems, streak, quests and achievements all advance
- Perfect-comprehension bonus, replay support, and one-tap **sharing to the community feed**

## ✨ Gamification (the full Duolingo playbook)

- **Winding learning path** — sticky unit headers, locked/current/completed nodes with 3D buttons, START bobbing tooltip, pulsing ring on the current node
- **XP & levels** — base XP + first-time, perfect-lesson and combo bonuses, Double XP boost
- **Daily goal ring** — 50 XP/day with animated progress
- **Streaks** — daily streak with flame animation, milestone celebrations (3/7/14/30/100…), **Streak Freeze** protection
- **Hearts** — 5 hearts, lose one per mistake, timed regeneration (10 min), refill via gems or practice
- **Gems economy** — earned from lessons, stories, quests, chests and achievements; spend on freezes, refills, boosts
- **Leagues** — Bronze → Diamond, 15 rivals whose XP ramps through the week, promotion/demotion zones, weekly rollover
- **Daily quests** — deterministic daily quests with progress bars and auto-claimed gem rewards (stories count too)
- **Achievements** — tiered achievements (Wildfire, Sage, Scholar, Flawless, Scribe, Renaissance, Quest Hunter, Bible Reader, Koinonia…)
- **Unit chests & trophy** — 30-gem chest after each unit, trophy at course end
- **Practice hub** — mistakes review that restores hearts

## 📖 The Bible itself

- **Full Bible text** (public-domain translation, all 66 books) in a reader with verse highlighting and five highlight colors
- **Bookmarks and notes** on any verse
- **Reading plans** with day-by-day check-offs
- Reading chapters awards XP and advances streaks and quests

## 👥 Community & friends

- **Friends system** — add friends from suggestions, send/accept requests, see streaks and weekly XP
- **Community feed** — post achievements, streaks, verses, plan progress and story completions; like and comment

## 🧑‍🎨 Avatars

- Fully customizable SVG avatar — skin, hair, eyes, outfit, accessories
- **Crucifix options** (wooden and gold) among the accessories

## 🎮 UX details

- **Haptics** — Web Vibration API patterns for correct/wrong/combo/complete (toggleable)
- **Sound** — fully synthesized Web Audio effects (no audio files): correct chime, wrong buzz, combo ticks, completion fanfare
- **Animations** — framer-motion everywhere: page transitions, progress springs, combo chip, confetti results screen, count-up stats, shake on wrong answers
- **Notifications** — in-app notification center + real browser notifications (streak-at-risk, quest complete, achievements)
- **Mascot** — "Papy" the animated scroll character with moods (happy, cheer, sad, think)
- **Mobile-first** — bottom nav on phones (7 items incl. Stories), sidebar on desktop, safe-area aware, 44px+ touch targets

## 🛠 Tech stack (free & open-source first)

| Layer | Tech |
|---|---|
| Framework | **Next.js 16** (App Router) + TypeScript |
| Styling | Tailwind CSS 4 + custom Duolingo-style design system |
| Database | **Prisma ORM + SQLite** (local, offline, zero-config) |
| State | Zustand (client) + TanStack Query (server) |
| Animation | framer-motion + canvas-confetti |
| Audio/Haptics | Web Audio API + Vibration API |
| Desktop packaging | **Rust + Tauri 2** (`src-tauri/`) with a fully offline sidecar server |

### Run the web app

```bash
bun install
bun run db:push          # create the SQLite schema
bun prisma/seed.ts       # seed courses, stories, quests, achievements, leagues
bun run dev              # http://localhost:3000
```

### Package as a native desktop app (Rust, fully offline)

The `src-tauri/` shell ships the **entire app — server, database and Bible text —
inside the native binary**. No internet, no Node install, nothing required:

```bash
cargo install tauri-cli --version "^2"   # one-time
bun run desktop:icons    # once — renders PNG/ICO/ICNS from the SVG
bun run desktop:prepare  # builds the standalone server + seeds the desktop DB + sidecar
cargo tauri build        # .AppImage / .deb / .msi / .dmg
```

See [`src-tauri/README.md`](src-tauri/README.md) for the full architecture:
the Rust shell copies the bundled server + pre-seeded SQLite into the OS
app-data directory on first run, spawns a bundled Bun runtime sidecar on
`127.0.0.1:3313`, waits for readiness, and only then reveals the window.
Tauri plugins included:

- `tauri-plugin-notification` — native OS notifications for streak reminders
- `tauri-plugin-vibration` — native haptics on Android
- `tauri-plugin-shell` — sidecar lifecycle (spawn, readiness, shutdown)

### Reset the demo data

```bash
bun scripts/reset-demo.ts   # keeps profile + chosen course, clears progress
```

## 📁 Project structure

```
prisma/
  schema.prisma           # full gamification + story-mode data model
  seed.ts                 # seeder orchestration
  seed-data/              # course content:
                          #   greek, hebrew, bibleSurvey, studyMethods,
                          #   worldviews, manuscripts, apologetics,
                          #   existence, ethics, metaphysics, expansions,
                          #   stories, meta (quests, achievements, bots…)
src/
  app/api/                # bootstrap, courses, lessons, complete, practice,
                          # hearts, leaderboard, quests, shop, chests,
                          # notifications, profile, settings, bible, plans,
                          # friends, community, stories
  lib/gamification.ts     # streaks, quests, leagues, achievements, hearts engine
  lib/client/             # sound synth, haptics, notifications, zustand store
  components/scroll/      # the whole UI (path, lesson player, story player,
                          # bible reader, community, avatar builder, views)
src-tauri/                # Rust desktop shell (offline sidecar architecture)
scripts/
  prepare-desktop.mjs     # desktop build pipeline
  make-icons.mjs          # PNG/ICO/ICNS icon generation
  desktop-server.js       # the offline server launcher (sidecar entry)
```

## 📖 Content notes

All lesson content is written to be scholarly and fair: manuscript counts and dates reflect standard references (Sinaiticus ~AD 330–360, Dead Sea Scrolls 1947, ~5,800+ Greek NT manuscripts), the apologetics and Existence-of-God courses present the classical arguments alongside how philosophers actually debate them (objections and replies), the worldviews course describes other faiths respectfully while marking real differences, and language lessons use real verses (John 1:1, Genesis 1:1, Deuteronomy 6:4, Psalm 117) with accurate transliterations.

*"Your word is a lamp to my feet and a light for my path." — Psalm 119:105*
