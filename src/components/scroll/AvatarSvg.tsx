"use client"

import type { AvatarConfig } from "@/lib/avatar"
import { OUTFITS } from "@/lib/avatar"

const SKIN_SHADE: Record<string, string> = {}

function darken(hex: string, amt = 30): string {
  const n = parseInt(hex.replace("#", ""), 16)
  const r = Math.max(0, ((n >> 16) & 0xff) - amt)
  const g = Math.max(0, ((n >> 8) & 0xff) - amt)
  const b = Math.max(0, (n & 0xff) - amt)
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

const EYE_HEX: Record<AvatarConfig["eyes"], string> = {
  dark: "#2A1D15",
  brown: "#6B4226",
  hazel: "#9C7A3C",
  green: "#4F7A3A",
  blue: "#4A6FA5",
}

/** Flat-cartoon avatar — Duolingo-style, fully deterministic from config. */
export function AvatarSvg({
  config,
  size = 96,
  ring,
  className,
}: {
  config: AvatarConfig
  size?: number
  ring?: string
  className?: string
}) {
  const outfit = OUTFITS.find((o) => o.id === config.outfit) ?? OUTFITS[0]
  const skin = config.skin
  const skinShadow = darken(skin, 22)
  const hair = config.hairColor
  const hairDark = darken(hair, 18)

  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="User avatar"
    >
      {/* background */}
      <circle cx="60" cy="60" r="58" fill={config.bg} />
      {ring && <circle cx="60" cy="60" r="56" fill="none" stroke={ring} strokeWidth="5" />}

      {/* ---- back hair layers ---- */}
      {(config.hair === "long" || config.hair === "dreads" || config.hair === "ponytail" || config.hair === "waves") && (
        <path d="M26 44 Q24 96 34 106 L48 92 L42 40 Z" fill={hairDark} />
      )}
      {config.hair === "long" && <path d="M94 44 Q96 96 86 106 L72 92 L78 40 Z" fill={hairDark} />}
      {config.hair === "afro" && <circle cx="60" cy="34" r="36" fill={hair} />}
      {config.hair === "ponytail" && (
        <path d="M88 30 Q106 34 102 58 Q100 74 90 76 Q98 58 88 42 Z" fill={hairDark} />
      )}

      {/* ---- torso ---- */}
      <g>
        {/* neck */}
        <rect x="52" y="66" width="16" height="14" rx="6" fill={skinShadow} />
        {/* shoulders + chest */}
        <path d="M22 120 Q22 90 44 84 L76 84 Q98 90 98 120 Z" fill={outfit.main} />
        {/* collar */}
        <path d="M48 84 Q60 96 72 84 L68 82 Q60 90 52 82 Z" fill={darken(outfit.main, 16)} />

        {/* outfit details */}
        {config.outfit === "hoodie" && (
          <>
            <path d="M40 84 Q60 104 80 84 L84 82 Q60 110 36 82 Z" fill={darken(outfit.main, 14)} />
            <line x1="54" y1="94" x2="53" y2="106" stroke="#F5F0E1" strokeWidth="3" strokeLinecap="round" />
            <line x1="66" y1="94" x2="67" y2="106" stroke="#F5F0E1" strokeWidth="3" strokeLinecap="round" />
            <circle cx="53" cy="108" r="2.2" fill="#F5F0E1" />
            <circle cx="67" cy="108" r="2.2" fill="#F5F0E1" />
          </>
        )}
        {config.outfit === "tunic" && (
          <>
            <rect x="24" y="98" width="72" height="9" rx="4" fill={outfit.trim} />
            <path d="M52 84 L60 94 L68 84 Z" fill={darken(skin, 10)} />
          </>
        )}
        {config.outfit === "robe" && (
          <>
            <path d="M56 84 L64 84 L66 120 L54 120 Z" fill={outfit.trim} />
            <path d="M50 84 L60 98 L70 84 L66 82 L60 90 L54 82 Z" fill={darken(outfit.trim, 12)} />
          </>
        )}
        {config.outfit === "armor" && (
          <>
            <path d="M30 88 Q38 82 46 88 L46 108 Q38 112 30 106 Z" fill={darken(outfit.trim, 6)} />
            <path d="M90 88 Q82 82 74 88 L74 108 Q82 112 90 106 Z" fill={darken(outfit.trim, 6)} />
            <path d="M40 92 Q60 86 80 92 L80 104 Q60 110 40 104 Z" fill={darken(outfit.main, 14)} opacity="0.6" />
            <circle cx="60" cy="97" r="4" fill={outfit.trim} stroke="#F5F0E1" strokeWidth="1.4" />
          </>
        )}
        {config.outfit === "sunday" && (
          <>
            <path d="M46 84 L60 100 L74 84 L70 81 L60 92 L50 81 Z" fill="#F5F0E1" />
            <path d="M30 120 Q30 94 46 86 L52 88 L44 120 Z" fill={outfit.trim} />
            <path d="M90 120 Q90 94 74 86 L68 88 L76 120 Z" fill={outfit.trim} />
          </>
        )}
        {config.outfit === "scholar" && (
          <>
            <path d="M44 86 L52 88 L44 108 L36 104 Z" fill={outfit.trim} />
            <path d="M76 86 L68 88 L76 108 L84 104 Z" fill={outfit.trim} />
            <path d="M52 84 L60 92 L68 84 L64 81 L60 86 L56 81 Z" fill={darken(outfit.main, 18)} />
          </>
        )}
        {config.outfit === "missionary" && (
          <>
            <line x1="60" y1="86" x2="60" y2="118" stroke={outfit.trim} strokeWidth="3" strokeLinecap="round" />
            <rect x="50" y="82" width="9" height="7" rx="2" fill={darken(outfit.main, 18)} />
            <rect x="61" y="82" width="9" height="7" rx="2" fill={darken(outfit.main, 18)} />
          </>
        )}
        {config.outfit === "tee" && (
          <path d="M46 84 L60 94 L74 84 L70 81 L60 89 L50 81 Z" fill={darken(outfit.main, 18)} />
        )}
      </g>

      {/* ---- accessory (chest) ---- */}
      {config.accessory !== "none" && <Accessory config={config} />}

      {/* ---- head ---- */}
      <g>
        {/* ears */}
        <circle cx="29" cy="46" r="6" fill={skin} />
        <circle cx="91" cy="46" r="6" fill={skin} />
        {/* face */}
        <circle cx="60" cy="46" r="30" fill={skin} />
        {/* eyes */}
        <g>
          <ellipse cx="48" cy="44" rx="7" ry="8" fill="#FFFFFF" />
          <ellipse cx="72" cy="44" rx="7" ry="8" fill="#FFFFFF" />
          <circle cx="49" cy="45" r="4.4" fill={EYE_HEX[config.eyes]} />
          <circle cx="71" cy="45" r="4.4" fill={EYE_HEX[config.eyes]} />
          <circle cx="49" cy="45" r="2" fill="#1A120B" />
          <circle cx="71" cy="45" r="2" fill="#1A120B" />
          <circle cx="50.6" cy="42.8" r="1.3" fill="#FFFFFF" />
          <circle cx="72.6" cy="42.8" r="1.3" fill="#FFFFFF" />
        </g>
        {/* brows */}
        <rect x="41" y="31" width="13" height="3.6" rx="1.8" fill={hairDark} />
        <rect x="66" y="31" width="13" height="3.6" rx="1.8" fill={hairDark} />
        {/* smile */}
        <path d="M51 57 Q60 66 69 57" stroke={darken(skin, 45)} strokeWidth="3.4" strokeLinecap="round" fill="none" />
        {/* blush */}
        <ellipse cx="40" cy="54" rx="5" ry="3.2" fill="#F0A28F" opacity="0.45" />
        <ellipse cx="80" cy="54" rx="5" ry="3.2" fill="#F0A28F" opacity="0.45" />
      </g>

      {/* ---- front hair ---- */}
      <Hair config={config} hair={hair} hairDark={hairDark} />

      {/* ---- headwear ---- */}
      <Headwear config={config} />
    </svg>
  )
}

function Hair({ config, hair, hairDark }: { config: AvatarConfig; hair: string; hairDark: string }) {
  switch (config.hair) {
    case "bald":
      return null
    case "buzz":
      return <path d="M30 42 Q30 14 60 14 Q90 14 90 42 Q84 30 60 28 Q36 30 30 42 Z" fill={hairDark} />
    case "short":
      return (
        <g>
          <path d="M29 44 Q27 12 60 12 Q93 12 91 44 Q88 26 74 24 Q56 20 44 28 Q34 32 29 44 Z" fill={hair} />
          <path d="M74 24 Q86 26 90 40 Q86 28 74 24 Z" fill={hairDark} opacity="0.5" />
        </g>
      )
    case "curly":
      return (
        <g fill={hair}>
          <circle cx="38" cy="26" r="10" />
          <circle cx="52" cy="18" r="11" />
          <circle cx="68" cy="18" r="11" />
          <circle cx="82" cy="26" r="10" />
          <circle cx="32" cy="38" r="8" />
          <circle cx="88" cy="38" r="8" />
          <circle cx="60" cy="24" r="10" />
        </g>
      )
    case "afro":
      return <circle cx="60" cy="36" r="26" fill={hair} />
    case "bun":
      return (
        <g>
          <circle cx="60" cy="8" r="11" fill={hairDark} />
          <path d="M30 44 Q30 14 60 14 Q90 14 90 44 Q84 28 60 26 Q36 28 30 44 Z" fill={hair} />
        </g>
      )
    case "dreads":
      return (
        <g>
          <path d="M30 44 Q30 12 60 12 Q90 12 90 44 Q84 26 60 24 Q36 26 30 44 Z" fill={hair} />
          {[
            [30, 40, 26, 68],
            [38, 34, 34, 76],
            [46, 30, 42, 72],
            [74, 30, 78, 72],
            [82, 34, 86, 76],
            [90, 40, 94, 68],
          ].map(([x1, y1, x2, y2], i) => (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={hairDark} strokeWidth="6" strokeLinecap="round" />
          ))}
        </g>
      )
    case "waves":
      return (
        <path
          d="M29 46 Q27 12 60 12 Q93 12 91 46 Q88 34 84 38 Q80 30 74 36 Q68 26 60 32 Q52 26 46 36 Q40 30 36 38 Q32 34 29 46 Z"
          fill={hair}
        />
      )
    case "ponytail":
      return <path d="M30 44 Q28 12 60 12 Q92 12 90 44 Q86 26 60 24 Q34 26 30 44 Z" fill={hair} />
    case "long":
    default:
      return <path d="M29 46 Q27 12 60 12 Q93 12 91 46 Q88 28 74 26 Q56 22 44 30 Q34 34 29 46 Z" fill={hair} />
  }
}

function Headwear({ config }: { config: AvatarConfig }) {
  switch (config.headwear) {
    case "laurel":
      return (
        <g>
          <path d="M32 26 Q60 6 88 26" stroke="#3F7A2E" strokeWidth="3" fill="none" strokeLinecap="round" />
          {[36, 44, 52, 60, 68, 76, 84].map((x, i) => (
            <ellipse
              key={i}
              cx={x}
              cy={i % 2 === 0 ? 17 : 12}
              rx="5"
              ry="2.6"
              fill="#4C9A38"
              transform={`rotate(${x < 60 ? -35 : 35} ${x} ${i % 2 === 0 ? 17 : 12})`}
            />
          ))}
        </g>
      )
    case "crown":
      return (
        <g>
          <path d="M42 12 L48 2 L54 10 L60 0 L66 10 L72 2 L78 12 Z" fill="#F2C14E" stroke="#D9A400" strokeWidth="1.6" />
          <circle cx="60" cy="7" r="2" fill="#E4453D" />
          <circle cx="48" cy="9" r="1.6" fill="#58A700" />
          <circle cx="72" cy="9" r="1.6" fill="#58A700" />
        </g>
      )
    case "headband":
      return (
        <g>
          <path d="M30 34 Q60 22 90 34 L90 28 Q60 16 30 28 Z" fill="#E4453D" />
          <path d="M88 30 L97 24 L96 32 Z" fill="#C9302C" />
        </g>
      )
    case "flowers":
      return (
        <g>
          {[
            [86, 16, "#F2A2C0"],
            [78, 10, "#F6D34C"],
            [90, 24, "#B69DF5"],
          ].map(([x, y, c], i) => (
            <g key={i} transform={`translate(${x} ${y})`}>
              {[0, 72, 144, 216, 288].map((r) => (
                <ellipse key={r} cx="0" cy="-3.4" rx="2.2" ry="3.4" fill={c as string} transform={`rotate(${r})`} />
              ))}
              <circle r="1.6" fill="#F5F0E1" />
            </g>
          ))}
        </g>
      )
    default:
      return null
  }
}

function Accessory({ config }: { config: AvatarConfig }) {
  const metals: Record<string, { cross: string; edge: string; corpus: string }> = {
    "crucifix-gold": { cross: "#E8B923", edge: "#B8860B", corpus: "#8A6508" },
    "crucifix-silver": { cross: "#C4C9D4", edge: "#8E97A8", corpus: "#5F6878" },
    "crucifix-wood": { cross: "#9C6B3F", edge: "#6E4626", corpus: "#4A2E17" },
    cross: { cross: "#E8B923", edge: "#B8860B", corpus: "#E8B923" },
  }

  if (config.accessory === "beads") {
    return (
      <g>
        <path d="M46 86 Q60 108 74 86" stroke="#B45309" strokeWidth="2" fill="none" />
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const t = i / 5
          const x = 46 + 28 * t
          const y = 86 + Math.sin(Math.PI * t) * 20
          return <circle key={i} cx={x} cy={y + 2} r="3.4" fill={i % 2 === 0 ? "#7E22CE" : "#B69DF5"} />
        })}
        <circle cx="60" cy="110" r="4.2" fill="#7E22CE" stroke="#5B1689" strokeWidth="1.2" />
      </g>
    )
  }

  const m = metals[config.accessory]
  if (!m) return null
  const isCrucifix = config.accessory.startsWith("crucifix")

  return (
    <g>
      {/* chain */}
      <path d="M50 84 Q60 94 70 84" stroke={m.edge} strokeWidth="1.8" fill="none" strokeDasharray="2.5 1.8" />
      {/* cross */}
      <rect x="57.4" y="92" width="5.2" height="17" rx="1.6" fill={m.cross} stroke={m.edge} strokeWidth="1.2" />
      <rect x="51" y="97.4" width="18" height="5.2" rx="1.6" fill={m.cross} stroke={m.edge} strokeWidth="1.2" />
      {/* corpus (body of Christ) — only on crucifix */}
      {isCrucifix && (
        <g fill={m.corpus}>
          <circle cx="60" cy="97.4" r="2.4" />
          <path d="M58.6 99.6 L61.4 99.6 L62.2 108.6 L57.8 108.6 Z" />
        </g>
      )}
    </g>
  )
}
