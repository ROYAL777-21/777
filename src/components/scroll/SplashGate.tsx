"use client"

import { useEffect, useRef, useState, type CSSProperties } from "react"
import { motion, type Variants } from "framer-motion"
import { sfx } from "@/lib/client/sound"
import { haptics } from "@/lib/client/haptics"
import { spring, SPLASH_MS } from "@/lib/motion"
import { useJuice } from "@/lib/motion/MotionPrefs"
import { Mascot } from "./Mascot"

// ═══════════════════════════════════════════════════════════════
//  SPLASH GATE (v11.4) — the parting of the sea, live.
//
//  Rebuilt from the Remotion MP4/player into a pure Framer scene:
//  zero dynamic imports, zero video decode — the first paint IS
//  the scene (sun, sea, title) in the very first frame, then the
//  sea parts, Papy rises, the verse lands. ~2s and out.
// ═══════════════════════════════════════════════════════════════

const TITLE = "Scroll Academy"

const letterCascade: Variants = {
  hidden: { opacity: 0, y: 18, rotate: 6 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    rotate: 0,
    transition: { ...spring.juice, delay: 0.12 + i * 0.035 },
  }),
}

/** one side of the sea — a stack of three bobbing wave sheets */
function SeaSide({ side }: { side: "left" | "right" }) {
  const dir = side === "left" ? -1 : 1
  return (
    <motion.div
      className="absolute bottom-0 top-[46%] w-[64%]"
      style={{ [side]: 0 } as CSSProperties}
      initial={{ x: 0 }}
      animate={{ x: `${dir * 78}%` }}
      transition={{ ...spring.juice, delay: 0.45 }}
    >
      {["#2AA7A0", "#35C2BA", "#57D8D0"].map((fill, i) => (
        <motion.svg
          key={fill}
          viewBox="0 0 400 240"
          preserveAspectRatio="none"
          className="absolute w-[220%] bottom-0 h-[46%]"
          style={{ [side]: "-4%", opacity: 1 - i * 0.18 } as CSSProperties}
          animate={{ y: [0, -7 + i * 3, 0] }}
          transition={{ duration: 2.1 + i * 0.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
        >
          <path
            d="M0 44 Q 25 28 50 44 T 100 44 T 150 44 T 200 44 T 250 44 T 300 44 T 350 44 T 400 44 V 240 H 0 Z"
            fill={fill}
          />
        </motion.svg>
      ))}
    </motion.div>
  )
}

export function SplashGate({ onDone }: { onDone: () => void }) {
  const [exiting, setExiting] = useState(false)
  const finished = useRef(false)
  const juice = useJuice()

  const finish = () => {
    if (finished.current) return
    finished.current = true
    sfx.fanfare()
    haptics.reveal()
    setExiting(true)
    setTimeout(onDone, 420)
  }

  // the sea parts with a whoosh; the scene hands over on its own clock
  useEffect(() => {
    const t1 = juice ? setTimeout(() => sfx.whoosh(), 480) : undefined
    const t2 = setTimeout(finish, juice ? SPLASH_MS : 650)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [juice])

  return (
    <motion.div
      className="fixed inset-0 z-[200] overflow-hidden select-none"
      style={{
        background: "linear-gradient(180deg, #FFF9E8 0%, #FFEFC4 38%, #FDE3A9 100%)",
        pointerEvents: exiting ? "none" : "auto",
      }}
      initial={{ opacity: 1 }}
      animate={{ opacity: exiting ? 0 : 1 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      role="img"
      aria-label="Scroll Academy intro — the sea parts and the scroll rises"
    >
      {/* sun — rises with the scene, rays slowly turning */}
      <motion.div
        className="absolute left-1/2 top-[16%] -translate-x-1/2"
        initial={{ y: 36, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="relative w-28 h-28 sm:w-36 sm:h-36">
          <motion.div
            className="absolute inset-[-30%] rounded-full"
            style={{
              background:
                "conic-gradient(from 0deg, #FFD86B33 0deg 12deg, transparent 12deg 30deg, #FFD86B33 30deg 42deg, transparent 42deg 60deg, #FFD86B33 60deg 72deg, transparent 72deg 90deg, #FFD86B33 90deg 102deg, transparent 102deg 120deg, #FFD86B33 120deg 132deg, transparent 132deg 150deg, #FFD86B33 150deg 162deg, transparent 162deg 180deg, #FFD86B33 180deg 192deg, transparent 192deg 210deg, #FFD86B33 210deg 222deg, transparent 222deg 240deg, #FFD86B33 240deg 252deg, transparent 252deg 270deg, #FFD86B33 270deg 282deg, transparent 282deg 300deg, #FFD86B33 300deg 312deg, transparent 312deg 330deg, #FFD86B33 330deg 342deg, transparent 342deg 360deg)",
            }}
            animate={juice ? { rotate: 360 } : {}}
            transition={{ duration: 46, repeat: Infinity, ease: "linear" }}
          />
          <div
            className="absolute inset-0 rounded-full"
            style={{ background: "radial-gradient(circle, #FFE082 0%, #FFC93C 62%, #F5B01E 100%)" }}
          />
        </div>
      </motion.div>

      {/* title — letter cascade */}
      <div className="absolute top-[34%] left-0 right-0 flex justify-center">
        <h1
          className="font-black text-4xl sm:text-6xl tracking-tight text-[#4A3B12]"
          style={{ WebkitTextStroke: "0px" }}
        >
          {TITLE.split("").map((ch, i) => (
            <motion.span
              key={i}
              custom={i}
              variants={letterCascade}
              initial="hidden"
              animate="show"
              className="inline-block"
              style={ch === " " ? { width: "0.4em" } : undefined}
            >
              {ch === " " ? "\u00A0" : ch}
            </motion.span>
          ))}
        </h1>
      </div>
      <motion.p
        className="absolute top-[45%] left-0 right-0 text-center font-extrabold text-[#8a6d3b] text-sm sm:text-base"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55, duration: 0.5 }}
      >
        The Word, learned by heart.
      </motion.p>

      {/* the sea — two sides parting */}
      <SeaSide side="left" />
      <SeaSide side="right" />

      {/* the dry path revealed between the waters */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 bottom-0 w-[30%] h-[38%]"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        style={{ transformOrigin: "bottom", background: "linear-gradient(180deg, #F7E7BC 0%, #E9D49A 100%)" }}
        transition={{ delay: 0.75, ...spring.soft }}
      >
        {/* light shaft down the path */}
        <motion.div
          className="absolute inset-x-[18%] top-0 bottom-0"
          style={{ background: "linear-gradient(180deg, #FFF3C480, #FFF3C400)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0, duration: 0.6 }}
        />
      </motion.div>

      {/* spray droplets along the seam */}
      {juice &&
        [12, 30, 50, 70, 88].map((left, i) => (
          <motion.span
            key={left}
            className="absolute bottom-[44%] w-2 h-2 rounded-full bg-[#9FE8E2]"
            style={{ left: `${left}%` }}
            initial={{ y: 0, opacity: 0 }}
            animate={{ y: [-6, -34 - (i % 3) * 10, 0], opacity: [0, 0.9, 0], x: (i % 2 ? 1 : -1) * (8 + i * 3) }}
            transition={{ delay: 0.5 + i * 0.06, duration: 0.65, ease: "easeOut" }}
          />
        ))}

      {/* Papy rises through the gap, squash-and-stretch */}
      <motion.div
        className="absolute left-1/2 bottom-[30%]"
        initial={{ y: 120, scale: 0.6, opacity: 0 }}
        animate={{
          y: [120, -18, 0],
          scale: [0.6, 1.12, 1],
          opacity: 1,
        }}
        transition={{ delay: 0.95, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div
          animate={juice ? { y: [0, -6, 0] } : {}}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <Mascot mood="happy" size={116} />
        </motion.div>
      </motion.div>

      {/* the verse */}
      <motion.div
        className="absolute bottom-[7%] left-0 right-0 px-8 text-center"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.45, duration: 0.55 }}
      >
        <p className="font-bold text-[#6b5a2e] text-sm sm:text-base italic max-w-md mx-auto">
          “And Moses stretched out his hand over the sea…”
        </p>
        <p className="font-black text-[#4A3B12] text-xs mt-1">EXODUS 14:21</p>
      </motion.div>

      {/* skip */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <button
          onClick={finish}
          className="btn3d bg-white/85 border-2 border-paper-border text-foreground shadow-[0_3px_0_#e8e0c8] px-4 py-2 text-xs"
        >
          Skip intro
        </button>
      </div>
    </motion.div>
  )
}
