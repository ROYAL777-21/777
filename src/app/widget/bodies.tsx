"use client"

/**
 * bodies.tsx — the animated widget bodies, shared by the standalone
 * pages (/widget/streak|verse|xp) and the desktop board (/widget/board).
 */

import type { WidgetSnapshot } from "./useSnapshot"

// ── the flame ─────────────────────────────────────────────────

export function StreakWidgetBody({ snap, hhmm, compact = false }: { snap: WidgetSnapshot | null; hhmm: string; compact?: boolean }) {
  const alive = snap?.streakAliveToday ?? false
  const streak = snap?.streak ?? 0

  return (
    <>
      <div className="flame-wrap" aria-hidden="true">
        <div className="flame-glow" />
        <svg className="flame" viewBox="0 0 64 84" fill="none">
          <path
            d="M32 4C38 18 52 26 52 46c0 15-9 26-20 26S12 61 12 46C12 32 22 24 26 14c1.5 8 6 11 6 11s-2-13 0-21z"
            fill="#ff9600"
            stroke="#e07b00"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        </svg>
        <svg className="flame-inner" viewBox="0 0 64 84" fill="none" aria-hidden="true">
          <path d="M32 30c4 8 12 12 12 22 0 9-5 15-12 15s-12-6-12-15c0-10 8-14 12-22z" fill="#ffd23e" />
        </svg>
      </div>

      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span className="widget-num">{streak}</span>
        <span className="widget-label">{streak === 1 ? "day" : "days"}</span>
      </div>

      <div className={`widget-status${alive ? "" : " at-risk"}`}>
        {alive ? "Kept today ✓" : `${hhmm} to keep it alive`}
      </div>

      {!compact && (snap?.freezes ?? 0) > 0 && (
        <div className="widget-label" style={{ fontSize: 11 }}>
          ❄ {snap?.freezes} streak freeze{(snap?.freezes ?? 0) > 1 ? "s" : ""} ready
        </div>
      )}
    </>
  )
}

// ── the verse ─────────────────────────────────────────────────

export function VerseWidgetBody({ snap, compact = false }: { snap: WidgetSnapshot | null; compact?: boolean }) {
  const verse = snap?.verse
  const today = new Date().toLocaleDateString(undefined, { month: "long", day: "numeric" })
  return (
    <>
      <span className="verse-mark" aria-hidden="true">“</span>
      <p className="verse-text" style={compact ? { WebkitLineClamp: 3 } : undefined}>
        {verse ? verse.text : "Thy word is a lamp unto my feet, and a light unto my path."}
      </p>
      <span className="verse-ref">{verse ? verse.ref : "Psalm 119:105"}</span>
      <span className="widget-label" style={{ fontSize: 10 }}>{today} · tap to read in context</span>
    </>
  )
}

// ── the XP ring ───────────────────────────────────────────────

function Ring({ pct, size, stroke }: { pct: number; size: number; stroke: number }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const done = pct >= 100
  return (
    <svg
      className={done ? "ring xp-ring-pulse" : "ring"}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={`${Math.min(100, Math.round(pct))}% of today's goal`}
    >
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#eee6cd" strokeWidth={stroke} />
      <circle
        className="ring-progress"
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={done ? "#58cc02" : "#e5b53a"}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - Math.min(1, Math.max(0, pct / 100)))}
      />
      <text x="50%" y="47%" dominantBaseline="central" textAnchor="middle" fontSize={size * 0.24} fontWeight={900} fill="#3f3a2f">
        {Math.round(pct)}%
      </text>
      <text x="50%" y="65%" textAnchor="middle" fontSize={size * 0.1} fontWeight={800} fill="#8a8371">
        TODAY
      </text>
    </svg>
  )
}

export function XpWidgetBody({ snap, compact = false }: { snap: WidgetSnapshot | null; compact?: boolean }) {
  const xpToday = snap?.dailyXp ?? 0
  const goal = snap?.dailyGoal ?? 50
  const pct = goal > 0 ? (xpToday / goal) * 100 : 0
  return (
    <>
      <Ring pct={pct} size={compact ? 96 : 128} stroke={compact ? 10 : 12} />
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span className="widget-num" style={{ fontSize: compact ? 22 : 30 }}>{xpToday}</span>
        <span className="widget-label">/ {goal} XP</span>
      </div>
      {!compact && (
        <div className="widget-label">
          Level {snap?.level ?? 1} · {snap?.xp ?? 0} XP total
        </div>
      )}
    </>
  )
}

// ── skeletons & resting states ────────────────────────────────

export function WidgetSkeleton({ kind }: { kind: "flame" | "verse" | "ring" }) {
  if (kind === "verse") {
    return (
      <div className="verse-card" style={{ alignItems: "flex-start" }}>
        <div className="skeleton" style={{ width: "86%", height: 18 }} />
        <div className="skeleton" style={{ width: "70%", height: 18 }} />
        <div className="skeleton" style={{ width: "80%", height: 18 }} />
        <div className="skeleton" style={{ width: "34%", height: 14, marginTop: 10 }} />
      </div>
    )
  }
  if (kind === "ring") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
        <div className="skeleton" style={{ width: 120, height: 120, borderRadius: "50%" }} />
        <div className="skeleton" style={{ width: 90, height: 20 }} />
      </div>
    )
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center", width: "60%" }}>
      <div className="skeleton" style={{ width: "70%", height: 90 }} />
      <div className="skeleton" style={{ width: "40%", height: 22 }} />
    </div>
  )
}

export function WidgetResting() {
  return (
    <>
      <p className="widget-status at-risk">The scroll is resting —</p>
      <p className="widget-label">tap to wake it</p>
    </>
  )
}
