import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getOrCreateUser, ensureLeagueState, botDisplayXp, weekElapsed, weekKey, PROMOTION_SLOTS, DEMOTION_SLOTS } from "@/lib/gamification"
import type { LeaderboardPayload } from "@/lib/types"

export async function GET() {
  try {
    const user = await getOrCreateUser()
    let progress = user.progress!
    progress = await ensureLeagueState(progress)

    const order = progress.leagueOrder ?? 0
    const leagueId = `league-${order}`
    const entriesRaw = await db.leagueEntry.findMany({ where: { leagueId }, orderBy: { xp: "desc" } })

    const elapsed = weekElapsed()
    const rows = entriesRaw.map((e) => ({
      displayName: e.isCurrentUser ? `${e.displayName} (you)` : e.displayName,
      rawName: e.displayName,
      avatarEmoji: e.avatarEmoji,
      xp: e.isCurrentUser ? e.xp : botDisplayXp(e.targetXp, e.displayName, elapsed),
      isCurrentUser: e.isCurrentUser,
    }))
    rows.sort((a, b) => b.xp - a.xp)

    const total = rows.length
    const entries: LeaderboardPayload["entries"] = rows.map((r, i) => ({
      rank: i + 1,
      displayName: r.isCurrentUser ? r.rawName : r.rawName,
      avatarEmoji: r.avatarEmoji,
      xp: r.xp,
      isCurrentUser: r.isCurrentUser,
      promotion: i < PROMOTION_SLOTS,
      demotion: i >= total - DEMOTION_SLOTS && total >= 10,
    }))

    // friends leaderboard (BotUser avatars + live weekly XP)
    const wk = weekKey()
    const myEntry = await db.leagueEntry.findFirst({ where: { weekKey: wk, isCurrentUser: true } })
    const myWeekXp = myEntry?.xp ?? 0
    const friendBots = await db.botUser.findMany({ where: { isFriend: true }, orderBy: { weeklyXp: "desc" } })
    const friendRows = friendBots.map((b) => ({
      name: b.name,
      avatar: b.avatar,
      xp: b.weeklyXp,
      isCurrentUser: false,
    }))
    friendRows.push({
      name: `${user.name} (you)`,
      avatar: user.avatar ?? "",
      xp: myWeekXp,
      isCurrentUser: true,
    })
    friendRows.sort((a, b) => b.xp - a.xp)
    const friends = friendRows.map((r, i) => ({ rank: i + 1, ...r }))

    const leaguesAll = await db.league.findMany({ orderBy: { order: "asc" } })
    const leagues = leaguesAll.map((l) => ({
      name: l.name,
      emoji: l.emoji,
      order: l.order,
      locked: l.order > order,
    }))

    const league = leaguesAll[order]
    // time until next Monday 00:00 (UTC+8)
    const now = new Date()
    const local = new Date(now.getTime() + 8 * 3600 * 1000)
    const day = local.getUTCDay() || 7
    const msUntilMonday = (8 - day) * 86400000 - (local.getUTCHours() * 3600 + local.getUTCMinutes() * 60 + local.getUTCSeconds()) * 1000

    const payload: LeaderboardPayload & { friends: { rank: number; name: string; avatar: string; xp: number; isCurrentUser: boolean }[] } = {
      league: { name: league.name, emoji: league.emoji, color: league.color, order: league.order },
      entries,
      leagues,
      timeLeftMs: Math.max(0, msUntilMonday),
      friends,
    }
    return NextResponse.json(payload)
  } catch (e) {
    console.error("[api/leaderboard]", e)
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}
