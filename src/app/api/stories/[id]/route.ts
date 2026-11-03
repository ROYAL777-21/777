import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { USER_ID } from "@/lib/gamification"
import type { StoryPayload, StorySceneDTO } from "@/lib/types"

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params
    // accept slug or id
    const story = (await db.story.findUnique({ where: { slug: id } })) ?? (await db.story.findUnique({ where: { id } }))
    if (!story) return NextResponse.json({ error: "story not found" }, { status: 404 })

    const scenes = await db.storyScene.findMany({
      where: { storyId: story.id },
      orderBy: { order: "asc" },
    })

    const existing = await db.storyCompletion.findUnique({
      where: { userId_storyId: { userId: USER_ID, storyId: story.id } },
    })

    let cast: Record<string, string> = {}
    try {
      cast = JSON.parse(story.castJson) as Record<string, string>
    } catch {
      cast = {}
    }

    const sceneDTOs: StorySceneDTO[] = scenes.map((s) => {
      let options: string[] = []
      try {
        options = JSON.parse(s.optionsJson) as string[]
      } catch {
        options = []
      }
      return {
        id: s.id,
        order: s.order,
        kind: s.kind as StorySceneDTO["kind"],
        speaker: s.speaker,
        text: s.text,
        question: s.question,
        options,
        correctIndex: s.correctIndex,
        meaning: s.meaning,
      }
    })

    const payload: StoryPayload = {
      storyId: story.id,
      title: story.title,
      emoji: story.emoji,
      color: story.color,
      category: story.category,
      difficulty: story.difficulty,
      xpReward: story.xpReward,
      cast,
      scenes: sceneDTOs,
      completed: !!existing,
    }
    return NextResponse.json(payload)
  } catch (e) {
    console.error("[api/stories/[id]]", e)
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}

export const dynamic = "force-dynamic"
