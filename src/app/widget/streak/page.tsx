"use client"

import { useEffect } from "react"
import { useWidgetSnapshot, useTimeUntilMidnight, useChrome, useWidgetOpen, trackWidgetImpression } from "../useSnapshot"
import { StreakWidgetBody, WidgetSkeleton, WidgetResting } from "../bodies"

/**
 * /widget/streak — the flame. One glance answers one question:
 * "is my streak alive, and how long do I have today?"
 */
export default function StreakWidgetPage() {
  const { snap, error } = useWidgetSnapshot()
  const chrome = useChrome()
  const { hhmm } = useTimeUntilMidnight()
  const open = useWidgetOpen()

  useEffect(() => {
    trackWidgetImpression("streak", chrome)
  }, [chrome])

  return (
    <a
      className="widget-card"
      href="/"
      target="_top"
      onClick={(e) => {
        e.preventDefault()
        open("streak", "/")
      }}
    >
      {error ? <WidgetResting /> : snap ? <StreakWidgetBody snap={snap} hhmm={hhmm} /> : <WidgetSkeleton kind="flame" />}
    </a>
  )
}
