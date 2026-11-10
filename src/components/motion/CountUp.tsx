"use client"

/**
 * CountUp — an animated number counter (v11.4).
 * Rolls from the previous value to the new one on change, with a
 * tiny scale pop on arrival. Used for XP, gems, streak, scores.
 * Falls back to a static number under reduced motion.
 */

import { useEffect, useRef, useState } from "react"
import { animate, motion } from "framer-motion"
import { spring } from "@/lib/motion"
import { useJuice } from "@/lib/motion/MotionPrefs"

export function CountUp({
  value,
  className,
  durationSec = 0.7,
  format,
}: {
  value: number
  className?: string
  durationSec?: number
  format?: (n: number) => string
}) {
  const juice = useJuice()
  const [display, setDisplay] = useState(value)
  const prev = useRef(value)
  const [pop, setPop] = useState(0)

  useEffect(() => {
    const from = prev.current
    prev.current = value
    if (!juice || from === value) {
      setDisplay(value)
      return
    }
    setPop((k) => k + 1)
    const controls = animate(from, value, {
      duration: durationSec,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => setDisplay(Math.round(latest)),
    })
    return () => controls.stop()
  }, [value, juice, durationSec])

  const text = format ? format(display) : String(display)
  return (
    <motion.span
      key={pop}
      className={className}
      initial={false}
      animate={pop > 0 ? { scale: [1.35, 1] } : { scale: 1 }}
      transition={spring.snappy}
      style={{ display: "inline-block" }}
    >
      {text}
    </motion.span>
  )
}
