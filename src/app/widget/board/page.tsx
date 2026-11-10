"use client"

import { useEffect } from "react"
import { useWidgetSnapshot, useTimeUntilMidnight, useChrome, useWidgetOpen, trackWidgetImpression } from "../useSnapshot"
import { StreakWidgetBody, VerseWidgetBody, XpWidgetBody } from "../bodies"
import { toggleDesktopWidget } from "@/lib/client/desktop"

/**
 * /widget/board — the desktop companion (laptops): all three widgets in
 * one always-on-top frameless window, plus a quiet way back to the app.
 * Opened by the Tauri shell (toggle_widget); also fine as a phone
 * home-screen tile for people who want everything at a glance.
 */
export default function WidgetBoardPage() {
  const { snap, error } = useWidgetSnapshot()
  const chrome = useChrome()
  const { hhmm } = useTimeUntilMidnight()
  const open = useWidgetOpen()

  useEffect(() => {
    trackWidgetImpression("board", chrome)
  }, [chrome])

  const verseTarget = snap?.verse ? `/?bible=${snap.verse.bookId}.${snap.verse.chapter}.${snap.verse.verse}` : "/"

  return (
    <div className="widget-board">
      {/* streak */}
      <a
        className="widget-cell"
        href="/"
        target="_top"
        onClick={(e) => {
          e.preventDefault()
          open("streak", "/")
        }}
      >
        {snap && !error ? <StreakWidgetBody snap={snap} hhmm={hhmm} compact /> : <p className="widget-label">streak</p>}
      </a>

      {/* xp */}
      <a
        className="widget-cell"
        href="/"
        target="_top"
        onClick={(e) => {
          e.preventDefault()
          open("xp", "/")
        }}
      >
        {snap && !error ? <XpWidgetBody snap={snap} compact /> : <p className="widget-label">daily goal</p>}
      </a>

      {/* verse */}
      <a
        className="widget-cell"
        href={verseTarget}
        target="_top"
        onClick={(e) => {
          e.preventDefault()
          open("verse", verseTarget, "bible")
        }}
      >
        {snap && !error ? <VerseWidgetBody snap={snap} compact /> : <p className="widget-label">verse of the day</p>}
      </a>

      {/* open the app / hide the companion */}
      <div className="widget-cell" style={{ gap: 8 }}>
        <button
          onClick={() => open("board", "/")}
          style={{
            font: "inherit",
            fontWeight: 900,
            fontSize: 13,
            background: "#58cc02",
            color: "#fff",
            border: "none",
            borderRadius: 14,
            padding: "10px 18px",
            cursor: "pointer",
            boxShadow: "0 3px 0 #46a302",
          }}
        >
          Open Scroll
        </button>
        {chrome === "desktop" && (
          <button
            onClick={() => void toggleDesktopWidget(false)}
            style={{
              font: "inherit",
              fontWeight: 800,
              fontSize: 11,
              background: "transparent",
              color: "#8a8371",
              border: "none",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            hide companion
          </button>
        )}
      </div>
    </div>
  )
}
