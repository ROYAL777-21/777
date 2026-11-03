import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { USER_ID } from "@/lib/gamification"
import type { StoriesPayload, StoryListItemDTO } from "@/lib/types"

export async function GET() {
  try {
    const stories = await db.story.findMany({
      orderBy: { order: "asc" },
    })
    const completions = await db.storyCompletion.findMany({
      where: { userId: USER_ID },
      select: { storyId: true, perfect: true },
    })
    const byStory = new Map(completions.map((c) => [c.storyId, c]))

    const items: StoryListItemDTO[] = stories.map((s) => {
      const c = byStory.get(s.id)
      return {
        id: s.id,
        slug: s.slug,
        title: s.title,
        description: s.description,
        emoji: s.emoji,
        color: s.color,
        category: s.category,
        difficulty: s.difficulty,
        xpReward: s.xpReward,
        completed: !!c,
        perfect: !!c?.perfect,
      }
    })

    const payload: StoriesPayload = {
      stories: items,
      completedCount: completions.length,
      total: stories.length,
    }
    return NextResponse.json(payload)
  } catch (e) {
    console.error("[api/stories]", e)
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}

export const dynamic = "force-dynamic"
