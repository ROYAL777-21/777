"use client"

import { useEffect } from "react"
import { useWidgetSnapshot, useChrome, useWidgetOpen, trackWidgetImpression } from "../useSnapshot"
import { XpWidgetBody, WidgetSkeleton, WidgetResting } from "../bodies"

/**
 * /widget/xp — the daily goal ring. Fills as the day fills; when the
 * goal is met the ring pulses gently — celebration, not pressure.
 */
export default function XpWidgetPage() {
  const { snap, error } = useWidgetSnapshot()
  const chrome = useChrome()
  const open = useWidgetOpen()

  useEffect(() => {
    trackWidgetImpression("xp", chrome)
  }, [chrome])

  return (
    <a
      className="widget-card"
      href="/"
      target="_top"
      onClick={(e) => {
        e.preventDefault()
        open("xp", "/")
      }}
    >
      {error ? <WidgetResting /> : snap ? <XpWidgetBody snap={snap} /> : <WidgetSkeleton kind="ring" />}
    </a>
  )
}
