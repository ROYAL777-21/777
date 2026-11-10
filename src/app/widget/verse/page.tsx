"use client"

import { useEffect } from "react"
import { useWidgetSnapshot, useChrome, useWidgetOpen, trackWidgetImpression } from "../useSnapshot"
import { VerseWidgetBody, WidgetSkeleton } from "../bodies"

/**
 * /widget/verse — the verse of the day on parchment. Deterministic
 * (same verse all day, chosen by bible.ts verseOfDay), offline-safe,
 * and it never pitches anything — a quiet corner, not a billboard.
 */
export default function VerseWidgetPage() {
  const { snap, error } = useWidgetSnapshot()
  const chrome = useChrome()
  const open = useWidgetOpen()

  useEffect(() => {
    trackWidgetImpression("verse", chrome)
  }, [chrome])

  const target = snap?.verse ? `/?bible=${snap.verse.bookId}.${snap.verse.chapter}.${snap.verse.verse}` : "/"

  return (
    <a
      className="widget-card"
      href={target}
      target="_top"
      onClick={(e) => {
        e.preventDefault()
        open("verse", target, "bible")
      }}
    >
      {error ? <VerseWidgetBody snap={null} /> : snap ? <VerseWidgetBody snap={snap} /> : <WidgetSkeleton kind="verse" />}
    </a>
  )
}
