/**
 * Scroll Academy — database seeder
 * Run: bun prisma/seed.ts
 */
import { PrismaClient } from "@prisma/client"

const db = new PrismaClient()

import { avatarFromSeed } from "../src/lib/avatar"

import { greekCourse } from "./seed-data/greek"
import { hebrewCourse } from "./seed-data/hebrew"
import { manuscriptsCourse } from "./seed-data/manuscripts"
import { apologeticsCourse } from "./seed-data/apologetics"
import { bibleSurveyCourse } from "./seed-data/bibleSurvey"
import { studyMethodsCourse } from "./seed-data/studyMethods"
import { worldviewsCourse } from "./seed-data/worldviews"
import { existenceCourse } from "./seed-data/existence"
import { ethicsCourse } from "./seed-data/ethics"
import { metaphysicsCourse } from "./seed-data/metaphysics"
import { courseExpansions } from "./seed-data/expansions"
import { storySeeds } from "./seed-data/stories"
import { storySeeds2 } from "./seed-data/stories2"
import { expandCoursesWithDeepPractice } from "./seed-data/deepPractice"
import { buildUnitTips } from "./seed-data/tips"
import { questSeeds, achievementSeeds, storeItemSeeds, leagueSeeds, botUserSeeds, incomingRequestSeed, postSeeds } from "./seed-data/meta"
import { catholicCourse, orthodoxCourse, pentecostalCourse, baptistCourse } from "./seed-data/denominations1"
import { anglicanCourse, methodistCourse, lutheranCourse, reformedCourse } from "./seed-data/denominations2"
import { logicCourse } from "./seed-data/logic1"
import { churchOrgSeed, churchMemberSeeds } from "./seed-data/church"
import type { SeedCourse } from "./seed-data/helpers"

const baseCourses: SeedCourse[] = [
  greekCourse,
  hebrewCourse,
  bibleSurveyCourse,
  studyMethodsCourse,
  worldviewsCourse,
  manuscriptsCourse,
  apologeticsCourse,
  logicCourse, // 🧠 reasoning & fallacies — the Berean skill set
  existenceCourse,
  ethicsCourse,
  metaphysicsCourse,
]

// the most popular denominations first (by global adherent count) —
// the user asked for "more denominations, the more popular ones to start"
const denominationCourses: SeedCourse[] = [
  catholicCourse, // ~1.3B
  orthodoxCourse, // ~220M
  pentecostalCourse, // ~280M
  baptistCourse, // ~100M
  anglicanCourse, // ~85M
  methodistCourse, // ~80M
  reformedCourse, // ~80M
  lutheranCourse, // ~75M
]

// merge the expansion units onto their courses (appended at the end)…
const mergedCourses: SeedCourse[] = baseCourses.map((c) => ({
  ...c,
  units: [...c.units, ...(courseExpansions[c.code] ?? [])],
}))

// …then expand EVERY unit by 5 deep-practice lessons
// (Listening Lab · Spelling Studio · Speak Out · Mixed Review · Unit Mastery)
const courses: SeedCourse[] = expandCoursesWithDeepPractice([...mergedCourses, ...denominationCourses])

// growth tips per unit (in-app · outside-app · routine)
const unitTips = buildUnitTips(courses)
const allStories = [...storySeeds, ...storySeeds2]

async function seedCourse(c: SeedCourse) {
  const course = await db.course.upsert({
    where: { code: c.code },
    update: {
      title: c.title,
      subtitle: c.subtitle,
      description: c.description,
      emoji: c.emoji,
      color: c.color,
      order: c.order,
    },
    create: {
      code: c.code,
      title: c.title,
      subtitle: c.subtitle,
      description: c.description,
      emoji: c.emoji,
      color: c.color,
      order: c.order,
    },
  })

  for (const [ui, u] of c.units.entries()) {
    const tips = unitTips[`${c.code}-u${ui + 1}`]
    const unit = await db.unit.upsert({
      where: { id: `${c.code}-u${ui + 1}` },
      update: {
        title: u.title,
        description: u.description,
        emoji: u.emoji,
        color: u.color,
        order: ui + 1,
        courseId: course.id,
        difficulty: u.difficulty ?? (ui <= 1 ? 1 : ui <= 3 ? 2 : 3),
        tipsJson: tips ? JSON.stringify(tips) : null,
      },
      create: {
        id: `${c.code}-u${ui + 1}`,
        courseId: course.id,
        title: u.title,
        description: u.description,
        emoji: u.emoji,
        color: u.color,
        order: ui + 1,
        difficulty: u.difficulty ?? (ui <= 1 ? 1 : ui <= 3 ? 2 : 3),
        tipsJson: tips ? JSON.stringify(tips) : null,
      },
    })

    for (const [li, l] of u.lessons.entries()) {
      const lesson = await db.lesson.upsert({
        where: { id: `${c.code}-u${ui + 1}-l${li + 1}` },
        update: { title: l.title, order: li + 1, unitId: unit.id },
        create: {
          id: `${c.code}-u${ui + 1}-l${li + 1}`,
          unitId: unit.id,
          title: l.title,
          order: li + 1,
        },
      })

      // delete existing challenges for the lesson & recreate (content refresh)
      await db.challenge.deleteMany({ where: { lessonId: lesson.id } })

      for (const [ci, ch] of l.challenges.entries()) {
        await db.challenge.create({
          data: {
            lessonId: lesson.id,
            type: ch.type,
            prompt: ch.prompt,
            question: ch.question,
            meaning: ch.meaning ?? null,
            transliteration: ch.transliteration ?? null,
            order: ci + 1,
            options: {
              create: ch.options.map((o) => ({
                text: o.text,
                correct: o.correct ?? false,
                order: o.order ?? 0,
                matchId: o.matchId ?? null,
                wordOrder: o.wordOrder ?? null,
              })),
            },
          },
        })
      }
    }
  }
  console.log(`✅ Course seeded: ${c.title} (${c.units.length} units)`)
}

async function main() {
  console.log("🌱 Seeding Scroll Academy…")

  for (const c of courses) await seedCourse(c)

  // ── quests ──
  for (const q of questSeeds) {
    await db.quest.upsert({
      where: { slug: q.slug },
      update: {
        title: q.title,
        description: q.description,
        icon: q.icon,
        metric: q.metric,
        target: q.target,
        gemsReward: q.gemsReward,
      },
      create: q as never,
    })
  }
  console.log(`✅ Quests seeded: ${questSeeds.length}`)

  // ── achievements ──
  for (const a of achievementSeeds) {
    await db.achievement.upsert({
      where: { slug: a.slug },
      update: {
        title: a.title,
        description: a.description,
        icon: a.icon,
        metric: a.metric,
        tiers: JSON.stringify(a.tiers),
        tierNames: JSON.stringify(a.tierNames),
      },
      create: {
        slug: a.slug,
        title: a.title,
        description: a.description,
        icon: a.icon,
        metric: a.metric,
        tiers: JSON.stringify(a.tiers),
        tierNames: JSON.stringify(a.tierNames),
      },
    })
  }
  console.log(`✅ Achievements seeded: ${achievementSeeds.length}`)

  // ── store items ──
  for (const s of storeItemSeeds) {
    await db.storeItem.upsert({
      where: { slug: s.slug },
      update: { name: s.name, description: s.description, icon: s.icon, price: s.price },
      create: s as never,
    })
  }
  console.log(`✅ Store items seeded: ${storeItemSeeds.length}`)

  // ── leagues ──
  for (const l of leagueSeeds) {
    await db.league.upsert({
      where: { id: `league-${l.order}` },
      update: { name: l.name, emoji: l.emoji, color: l.color, order: l.order },
      create: {
        id: `league-${l.order}`,
        name: l.name,
        emoji: l.emoji,
        color: l.color,
        order: l.order,
      },
    })
  }
  console.log(`✅ Leagues seeded: ${leagueSeeds.length}`)

  // ── bot users (friends & community) ──
  for (const b of botUserSeeds) {
    await db.botUser.upsert({
      where: { id: b.id },
      update: {
        name: b.name,
        bio: b.bio,
        country: b.country,
        streak: b.streak,
        weeklyXp: b.weeklyXp,
        isFriend: b.friend,
      },
      create: {
        id: b.id,
        name: b.name,
        avatar: JSON.stringify(avatarFromSeed(b.id + b.name)),
        bio: b.bio,
        country: b.country,
        streak: b.streak,
        weeklyXp: b.weeklyXp,
        isFriend: b.friend,
        requestedToUser: b.id === incomingRequestSeed,
        requestedAt: b.id === incomingRequestSeed ? new Date(Date.now() - 3 * 3600 * 1000) : null,
      },
    })
  }
  console.log(`✅ Bot users seeded: ${botUserSeeds.length}`)

  // ── community posts (seed once — preserve user activity afterwards) ──
  const postCount = await db.post.count()
  if (postCount === 0) {
    for (const p of postSeeds) {
      const post = await db.post.create({
        data: {
          authorBotId: p.botId,
          body: p.body,
          likes: p.likes,
          createdAt: new Date(Date.now() - p.hoursAgo * 3600 * 1000),
          attachment: p.attachment ? JSON.stringify(p.attachment) : null,
        },
      })
      for (const cm of p.comments ?? []) {
        await db.postComment.create({
          data: {
            postId: post.id,
            authorBotId: cm.botId ?? null,
            body: cm.body,
            createdAt: new Date(Date.now() - cm.hoursAgo * 3600 * 1000),
          },
        })
      }
    }
    console.log(`✅ Community posts seeded: ${postSeeds.length}`)
  } else {
    console.log(`ℹ️ Community posts already present (${postCount}) — skipped`)
  }

  // ── story mode ──
  for (const s of allStories) {
    const story = await db.story.upsert({
      where: { slug: s.slug },
      update: {
        title: s.title,
        description: s.description,
        emoji: s.emoji,
        color: s.color,
        category: s.category,
        difficulty: s.difficulty,
        xpReward: s.xpReward,
        order: s.order,
        castJson: JSON.stringify(s.cast),
      },
      create: {
        slug: s.slug,
        title: s.title,
        description: s.description,
        emoji: s.emoji,
        color: s.color,
        category: s.category,
        difficulty: s.difficulty,
        xpReward: s.xpReward,
        order: s.order,
        castJson: JSON.stringify(s.cast),
      },
    })
    // refresh scenes (completions are keyed by storyId and survive)
    await db.storyScene.deleteMany({ where: { storyId: story.id } })
    for (const [i, sc] of s.scenes.entries()) {
      await db.storyScene.create({
        data: {
          storyId: story.id,
          order: i + 1,
          kind: sc.kind,
          speaker: sc.kind === "LINE" ? sc.speaker : null,
          text: sc.kind === "QUESTION" ? (sc.question ?? "") : sc.text,
          question: sc.kind === "QUESTION" ? sc.question : null,
          optionsJson: sc.kind === "QUESTION" ? JSON.stringify(sc.options) : "[]",
          correctIndex: sc.kind === "QUESTION" ? sc.correctIndex : 0,
          meaning: sc.kind === "QUESTION" ? (sc.meaning ?? null) : null,
        },
      })
    }
  }
  console.log(`✅ Stories seeded: ${allStories.length}`)

  // ── church pilot (B2B dashboard) — REVENUE.md §6 weeks 3–6 ──
  // upsert by slug; members are replaced each run (the pilot cohort's
  // stored snapshot refreshes, user progress rows are never touched)
  const org = await db.churchOrg.upsert({
    where: { slug: churchOrgSeed.slug },
    update: {
      name: churchOrgSeed.name,
      city: churchOrgSeed.city,
      tier: churchOrgSeed.tier,
      seatsTotal: churchOrgSeed.seatsTotal,
      priceMonthly: churchOrgSeed.priceMonthly,
      contactName: churchOrgSeed.contactName,
      contactEmail: churchOrgSeed.contactEmail,
      focusCourse: churchOrgSeed.focusCourse,
      renewalAt: new Date(Date.now() + 18 * 86400000), // next billing date
    },
    create: {
      slug: churchOrgSeed.slug,
      name: churchOrgSeed.name,
      city: churchOrgSeed.city,
      tier: churchOrgSeed.tier,
      seatsTotal: churchOrgSeed.seatsTotal,
      priceMonthly: churchOrgSeed.priceMonthly,
      contactName: churchOrgSeed.contactName,
      contactEmail: churchOrgSeed.contactEmail,
      focusCourse: churchOrgSeed.focusCourse,
      startedAt: new Date(Date.now() - 42 * 86400000),
      renewalAt: new Date(Date.now() + 18 * 86400000),
    },
  })
  await db.churchMember.deleteMany({ where: { orgId: org.id } })
  // the admin seat — live stats, computed by the API (none stored)
  await db.churchMember.create({
    data: {
      orgId: org.id,
      userId: "user_1",
      name: "Scribe",
      emoji: "📜",
      role: "admin",
      joinedAt: new Date(Date.now() - 42 * 86400000),
    },
  })
  for (const m of churchMemberSeeds) {
    await db.churchMember.create({
      data: {
        orgId: org.id,
        name: m.name,
        emoji: m.emoji,
        role: "member",
        joinedAt: new Date(Date.now() - m.daysAgoJoined * 86400000),
        lessons: m.lessons,
        chaptersRead: m.chaptersRead,
        streak: m.streak,
        weeklyXp: m.weeklyXp,
        lastActiveDaysAgo: m.lastActiveDaysAgo,
        weeksJson: JSON.stringify(m.weeks.map((w) => ({ lessons: w[0], chapters: w[1], xp: w[2] }))),
      },
    })
  }
  console.log(`✅ Church pilot seeded: ${churchMemberSeeds.length + 1}/${churchOrgSeed.seatsTotal} seats at ${churchOrgSeed.name}`)

  const lessonCount = await db.lesson.count()
  const challengeCount = await db.challenge.count()
  const optionCount = await db.challengeOption.count()
  const storyCount = await db.story.count()
  const memberCount = await db.churchMember.count()
  console.log(`📊 Totals — lessons: ${lessonCount}, challenges: ${challengeCount}, options: ${optionCount}, stories: ${storyCount}, church seats: ${memberCount}`)
  console.log("🌱 Seed complete!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
