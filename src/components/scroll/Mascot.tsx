"use client"

import { useEffect, useRef } from "react"
import { motion, useMotionValue, useSpring } from "framer-motion"
import { spring } from "@/lib/motion"
import { useJuice } from "@/lib/motion/MotionPrefs"

export type Mood = "happy" | "cheer" | "sad" | "think" | "sleep"

/**
 * "Papy" — the scroll mascot (v11.4: full-Duo liveliness).
 * Pure SVG + framer-motion:
 *   · breathes (subtle body swell, ~3.4s)
 *   · blinks on its own (existing) — now with eye highlights hidden mid-blink
 *   · eyes track the pointer (springy, rAF-light, desktop pointer only)
 *   · every mood change lands with squash-and-stretch
 *   · "cheer" = full celebration: hop + wiggle + sparkles
 */

const MAX_TRACK = 3.2 // px the pupils may drift

export function Mascot({
  mood = "happy",
  size = 120,
  className,
  tracking = true,
}: {
  mood?: Mood
  size?: number
  className?: string
  /** pointer eye-tracking (auto-disabled under reduced motion) */
  tracking?: boolean
}) {
  const juice = useJuice()
  const svgRef = useRef<SVGSVGElement | null>(null)

  // ── eye tracking: springy motion values, zero re-renders ──
  const eyeX = useMotionValue(0)
  const eyeY = useMotionValue(0)
  const sx = useSpring(eyeX, { stiffness: 120, damping: 14 })
  const sy = useSpring(eyeY, { stiffness: 120, damping: 14 })

  useEffect(() => {
    if (!tracking || !juice) return
    let raf = 0
    const onMove = (e: PointerEvent) => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        const el = svgRef.current
        if (!el) return
        const r = el.getBoundingClientRect()
        if (r.width === 0) return
        // mascot eye-center in screen coords (eyes sit ~y 76/160 of the viewBox)
        const cx = r.left + r.width * (80 / 160)
        const cy = r.top + r.height * (76 / 160)
        const dx = (e.clientX - cx) / (r.width / 2)
        const dy = (e.clientY - cy) / (r.height / 2)
        const d = Math.hypot(dx, dy) || 1
        const clamp = Math.min(1, d)
        eyeX.set((dx / d) * clamp * MAX_TRACK)
        eyeY.set((dy / d) * clamp * MAX_TRACK * 0.7)
      })
    }
    window.addEventListener("pointermove", onMove, { passive: true })
    return () => {
      window.removeEventListener("pointermove", onMove)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [tracking, juice, eyeX, eyeY])

  const eyeVariant =
    mood === "sad"
      ? { scaleY: 0.75, y: 2 }
      : mood === "sleep"
        ? { scaleY: 0.15 }
        : { scaleY: 1, y: 0 }

  const cheer = mood === "cheer"

  return (
    <motion.svg
      ref={svgRef}
      width={size}
      height={size}
      viewBox="0 0 160 160"
      className={className}
      aria-hidden="true"
    >
      {/* squash-and-stretch on every mood change + idle float + breathing */}
      <motion.g
        key={mood}
        initial={juice ? { scale: 0.82, opacity: 0.4 } : false}
        animate={{ scale: 1, opacity: 1 }}
        transition={spring.juice}
        style={{ originX: "80px", originY: "130px" }}
      >
        <motion.g
          animate={
            juice
              ? {
                  y: cheer ? [0, -16, 0] : [0, -6, 0],
                  rotate: cheer ? [0, -6, 6, 0] : 0,
                }
              : {}
          }
          transition={
            cheer
              ? { duration: 0.9, repeat: Infinity, ease: "easeInOut" }
              : { duration: 3.2, repeat: Infinity, ease: "easeInOut" }
          }
        >
          <motion.g
            animate={juice ? { scaleX: [1, 1.016, 1], scaleY: [1, 0.986, 1] } : {}}
            transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
            style={{ originX: "80px", originY: "130px" }}
          >
            {/* glow */}
            <ellipse cx="80" cy="150" rx="42" ry="8" fill="#00000012" />

            {/* body — rolled scroll */}
            <g>
              {/* left roll */}
              <rect x="30" y="38" width="16" height="96" rx="8" fill="#E5D3A0" stroke="#B89A5E" strokeWidth="3" />
              <rect x="36" y="38" width="6" height="96" rx="3" fill="#C9B273" />

              {/* main parchment */}
              <path
                d="M44 36 h64 a12 12 0 0 1 12 12 v76 a12 12 0 0 1 -12 12 h-64 a8 8 0 0 1 -8 -8 v-84 a8 8 0 0 1 8 -8 z"
                fill="#FFF6DF"
                stroke="#B89A5E"
                strokeWidth="3.5"
              />

              {/* right roll */}
              <rect x="112" y="32" width="16" height="104" rx="8" fill="#E5D3A0" stroke="#B89A5E" strokeWidth="3" />
              <rect x="118" y="32" width="6" height="104" rx="3" fill="#C9B273" />

              {/* text lines */}
              <g stroke="#D8C79A" strokeWidth="4" strokeLinecap="round">
                <line x1="58" y1="112" x2="102" y2="112" />
                <line x1="58" y1="124" x2="92" y2="124" />
              </g>

              {/* seal — wiggles when cheering */}
              <motion.g
                animate={cheer && juice ? { rotate: [0, -10, 10, 0] } : {}}
                transition={{ duration: 0.8, repeat: Infinity }}
                style={{ originX: "86px", originY: "44px" }}
              >
                <circle cx="86" cy="44" r="11" fill="#D64541" stroke="#B2362F" strokeWidth="2.5" />
                <path
                  d="M82 44 l3 3 l6 -7"
                  stroke="#FFF6DF"
                  strokeWidth="2.5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </motion.g>

              {/* face */}
              <g>
                {/* eyes — the tracking group wraps the blink group */}
                <motion.g style={{ x: sx, y: sy }}>
                  <motion.g
                    initial={false}
                    animate={eyeVariant}
                    style={{ originX: "80px", originY: "76px" }}
                  >
                    <motion.ellipse
                      cx="70"
                      cy="76"
                      rx="5.5"
                      ry={mood === "sleep" ? 7 : 7.5}
                      fill="#3C3C3C"
                      animate={
                        mood === "think" || mood === "sleep" || !juice
                          ? {}
                          : { scaleY: [1, 0.1, 1], transition: { duration: 0.32, repeat: Infinity, repeatDelay: 3.4 } }
                      }
                      style={{ originX: "70px", originY: "76px" }}
                    />
                    <motion.ellipse
                      cx="94"
                      cy="76"
                      rx="5.5"
                      ry={mood === "sleep" ? 7 : 7.5}
                      fill="#3C3C3C"
                      animate={
                        mood === "think" || mood === "sleep" || !juice
                          ? {}
                          : { scaleY: [1, 0.1, 1], transition: { duration: 0.32, repeat: Infinity, repeatDelay: 3.4 } }
                      }
                      style={{ originX: "94px", originY: "76px" }}
                    />
                  </motion.g>
                  {/* eye highlights ride along with the pupils */}
                  {mood !== "sleep" && (
                    <>
                      <circle cx="72" cy="73" r="1.8" fill="#fff" />
                      <circle cx="96" cy="73" r="1.8" fill="#fff" />
                    </>
                  )}
                </motion.g>

                {/* brows */}
                <path
                  d={
                    mood === "sad"
                      ? "M63 64 l12 4 M101 64 l-12 4"
                      : mood === "think"
                        ? "M63 62 h12 M89 62 h12"
                        : "M63 62 l12 -3 M101 62 l-12 -3"
                  }
                  stroke="#8A6D3B"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                />

                {/* blush */}
                <ellipse cx="60" cy="88" rx="6" ry="3.5" fill="#F4A6A0" opacity="0.7" />
                <ellipse cx="104" cy="88" rx="6" ry="3.5" fill="#F4A6A0" opacity="0.7" />

                {/* mouth */}
                <path
                  d={
                    mood === "sad"
                      ? "M72 96 q8 -7 16 0"
                      : cheer
                        ? "M70 92 q10 12 20 0 q-10 4 -20 0 z"
                        : mood === "sleep"
                          ? "M74 95 q6 3 12 0"
                          : "M72 93 q8 6 16 0"
                  }
                  stroke="#3C3C3C"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill={cheer ? "#3C3C3C" : "none"}
                />
              </g>
            </g>
          </motion.g>
        </motion.g>
      </motion.g>

      {/* sparkles when celebrating */}
      {cheer && juice && (
        <motion.g
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: [0, 1, 0.7], scale: 1 }}
          transition={{ duration: 0.7, repeat: Infinity, repeatDelay: 0.25 }}
          style={{ originX: "80px", originY: "80px" }}
        >
          <path d="M28 30 l2.4 5 5 2.4 -5 2.4 -2.4 5 -2.4 -5 -5 -2.4 5 -2.4 z" fill="#FFC93C" />
          <path d="M134 46 l2 4.2 4.2 2 -4.2 2 -2 4.2 -2 -4.2 -4.2 -2 4.2 -2 z" fill="#FFC93C" />
          <path d="M138 118 l1.7 3.6 3.6 1.7 -3.6 1.7 -1.7 3.6 -1.7 -3.6 -3.6 -1.7 3.6 -1.7 z" fill="#FFD86B" />
        </motion.g>
      )}

      {/* thought bubble when thinking */}
      {mood === "think" && (
        <motion.g
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={spring.soft}
        >
          <circle cx="126" cy="30" r="4" fill="#FFF6DF" stroke="#B89A5E" strokeWidth="2" />
          <circle cx="136" cy="20" r="6" fill="#FFF6DF" stroke="#B89A5E" strokeWidth="2" />
        </motion.g>
      )}

      {/* zzz when sleeping */}
      {mood === "sleep" && (
        <motion.g
          animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
          fill="#8A6D3B"
          fontSize="13"
          fontWeight="900"
          fontFamily="inherit"
        >
          <text x="124" y="26">z</text>
          <text x="134" y="16">Z</text>
        </motion.g>
      )}
    </motion.svg>
  )
}
