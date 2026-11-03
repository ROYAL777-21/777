import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { USER_ID, getOrCreateUser, regenHearts, awardActivityXp } from "@/lib/gamification"
import type { StoryCompleteResult } from "@/lib/types"

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params
    const body = (await req.json().catch(() => ({}))) as { correct?: number; total?: number }
    const user = await getOrCreateUser()
    const progress = await regenHearts(user.progress!)

    const story = (await db.story.findUnique({ where: { slug: id } })) ?? (await db.story.findUnique({ where: { id } }))
    if (!story) return NextResponse.json({ error: "story not found" }, { status: 404 })

    const existing = await db.storyCompletion.findUnique({
      where: { userId_storyId: { userId: USER_ID, storyId: story.id } },
    })
    const firstTime = !existing

    const total = Math.max(0, body.total ?? 0)
    const correct = Math.max(0, Math.min(body.correct ?? 0, total))
    const perfect = total > 0 && correct === total

    // ── XP math: full reward first time, replay bonus afterwards ──
    const baseXp = firstTime ? story.xpReward + (perfect ? 5 : 0) : 5
    const gemsEarned = firstTime ? 10 + (perfect ? 5 : 0) : 2

    // ── record completion ──
    await db.storyCompletion.upsert({
      where: { userId_storyId: { userId: USER_ID, storyId: story.id } },
      update: { xpEarned: Math.max(existing?.xpEarned ?? 0, baseXp), perfect, completedAt: new Date() },
      create: { userId: USER_ID, storyId: story.id, xpEarned: baseXp, perfect },
    })

    // ── xp, streak, quests, league, achievements, notifications ──
    const award = await awardActivityXp(progress, {
      xp: baseXp,
      questDelta: { lessons: 1, perfect: perfect ? 1 : 0, correct },
    })

    // ── story's own gem reward (persisted separately from quest/achievement gems) ──
    if (gemsEarned > 0) {
      await db.userProgress.update({
        where: { userId: USER_ID },
        data: { gems: { increment: gemsEarned } },
      })
    }

    const result: StoryCompleteResult = {
      xpEarned: award.xpEarned,
      doubled: award.doubled,
      firstTime,
      perfect,
      gemsEarned: gemsEarned + (award.gems - progress.gems),
      streak: award.streak,
      streakIncreased: award.streakIncreased,
      questsCompleted: award.questsCompleted,
      achievementsUnlocked: award.achievementsUnlocked,
      totalXp: award.totalXp,
      gems: award.gems + gemsEarned,
      dailyXp: award.dailyXp,
      dailyXpGoal: award.dailyXpGoal,
    }
    return NextResponse.json(result)
  } catch (e) {
    console.error("[api/stories/[id]/complete]", e)
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}

export const dynamic = "force-dynamic"
