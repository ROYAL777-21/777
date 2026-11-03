"use client"

import { motion } from "framer-motion"

export type Mood = "happy" | "cheer" | "sad" | "think" | "sleep"

/**
 * "Papy" — the scroll mascot. Pure SVG, animated with framer-motion.
 */
export function Mascot({
  mood = "happy",
  size = 120,
  className,
}: {
  mood?: Mood
  size?: number
  className?: string
}) {
  const eyeVariant =
    mood === "sad"
      ? { scaleY: 0.75, y: 2 }
      : mood === "sleep"
        ? { scaleY: 0.15 }
        : { scaleY: 1, y: 0 }

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      className={className}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1, y: [0, -6, 0] }}
      transition={{
        scale: { type: "spring", stiffness: 260, damping: 16 },
        opacity: { duration: 0.25 },
        y: { duration: 3.2, repeat: Infinity, ease: "easeInOut" },
      }}
      aria-hidden="true"
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

        {/* seal */}
        <motion.g
          animate={
            mood === "cheer"
              ? { rotate: [0, -8, 8, 0], transition: { duration: 1.2, repeat: Infinity } }
              : {}
          }
          style={{ originX: "86px", originY: "44px" }}
        >
          <circle cx="86" cy="44" r="11" fill="#D64541" stroke="#B2362F" strokeWidth="2.5" />
          <path d="M82 44 l3 3 l6 -7" stroke="#FFF6DF" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </motion.g>

        {/* face */}
        <g>
          {/* eyes */}
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
                mood === "think"
                  ? {}
                  : mood === "sleep"
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
                mood === "think"
                  ? {}
                  : mood === "sleep"
                    ? {}
                    : { scaleY: [1, 0.1, 1], transition: { duration: 0.32, repeat: Infinity, repeatDelay: 3.4 } }
              }
              style={{ originX: "94px", originY: "76px" }}
            />
          </motion.g>
          {/* eye highlights */}
          {mood !== "sleep" && (
            <>
              <circle cx="72" cy="73" r="1.8" fill="#fff" />
              <circle cx="96" cy="73" r="1.8" fill="#fff" />
            </>
          )}

          {/* brows */}
          <path
            d={mood === "sad" ? "M63 64 l12 4 M101 64 l-12 4" : mood === "think" ? "M63 62 h12 M89 62 h12" : "M63 62 l12 -3 M101 62 l-12 -3"}
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
                : mood === "cheer"
                  ? "M70 92 q10 12 20 0 q-10 4 -20 0 z"
                  : mood === "sleep"
                    ? "M74 95 q6 3 12 0"
                    : "M72 93 q8 6 16 0"
            }
            stroke="#3C3C3C"
            strokeWidth="3"
            strokeLinecap="round"
            fill={mood === "cheer" ? "#3C3C3C" : "none"}
          />
        </g>
      </g>

      {/* thought bubble when thinking */}
      {mood === "think" && (
        <g>
          <circle cx="126" cy="30" r="4" fill="#FFF6DF" stroke="#B89A5E" strokeWidth="2" />
          <circle cx="136" cy="20" r="6" fill="#FFF6DF" stroke="#B89A5E" strokeWidth="2" />
        </g>
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
