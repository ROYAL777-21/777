"use client"

// ═══════════════════════════════════════════════════════════════
//  THE PARTING OF THE SEA (v9) — the splash, told in the app's
//  own design language: parchment, chunky flat shapes, Papy the
//  scroll, Nunito Black.
//
//  Story (7.5s, 30fps, 1080x1920):
//    0.0s  Papy drifts asleep on a quiet sea
//    1.3s  a wind passes — the waters part
//    2.0s  a golden trail of footprints is revealed
//          ("a lamp unto my feet" — the same feet as the learn path)
//    4.0s  Papy walks the trail, the wordmark rises
//    6.4s  "Begin the journey" — the gate hands over to onboarding
//
//  Rendered by Remotion (github.com/remotion-dev/remotion):
//    in-app      @remotion/player (SplashGate)
//    for stores  bun run splash:render -> out/parting-sea.mp4
//
//  Deterministic by construction: every "random" value comes from
//  prand(seed) so the Player and the renderer agree frame-for-frame.
// ═══════════════════════════════════════════════════════════════

import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion"
import { loadFont } from "@remotion/google-fonts/Nunito"
// relative import: Remotion's webpack doesn't know Next's `@/` tsconfig alias
import { FootprintShape } from "../components/scroll/footprint"

// only the weights the composition actually sets — keeps the font
// requests to a handful instead of the full Nunito family
loadFont("normal", { weights: ["700", "800", "900"], subsets: ["latin"] })

const FONT = "var(--font-nunito, 'Nunito'), 'Nunito', sans-serif"

// the palette — pulled from globals.css and Mascot.tsx
const PARCHMENT = "#fff9ec"
const INK = "#3c3c3c"
const MUTED = "#8a8471"
const FAINT = "#b3ac93"
const SEA = "#4e8db8"
const SEA_DARK = "#2f5e80"
const SEA_SURFACE = "#6fa5cc"
const SAND = "#f2e3bc"
const SAND_EDGE = "#d9c48f"
const GOLD = "#ffc800"
const GREEN = "#58cc02"
const GREEN_DARK = "#46a302"
const ROLL = "#e5d3a0"
const ROLL_SHADE = "#c9b273"
const ROLL_EDGE = "#b89a5e"
const BODY = "#fff6df"
const SEAL = "#d64541"
const SEAL_EDGE = "#b2362f"
const BLUSH = "#f4a6a0"
const BROW = "#8a6d3b"

/** deterministic pseudo-random in [0,1) — no Math.random anywhere */
const prand = (seed: number): number => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

const SEA_TOP = 780
const SEA_BOTTOM = 1140

export const PartingSea: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps, width, height } = useVideoConfig()
  const cx = width / 2

  // ── the story's springs ─────────────────────────────────────────
  const part = spring({ frame: frame - 38, fps, config: { damping: 13, stiffness: 68 } })
  const sand = spring({ frame: frame - 55, fps, config: { damping: 14 } })
  const rays = spring({ frame: frame - 96, fps, config: { damping: 18 } })
  const markPop = spring({ frame: frame - 138, fps, config: { damping: 11 } })
  const cta = spring({ frame: frame - 186, fps, config: { damping: 14 } })
  const drift = interpolate(frame, [190, 225], [0, -14], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  })

  const shift = part * 430
  const bob = Math.sin(frame / 26) * 5
  const wind = interpolate(frame, [30, 36, 46, 52], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  })

  // Papy: asleep on the surface, then walks the revealed trail
  const papyY = frame < 50 ? 758 : 758 + spring({ frame: frame - 50, fps, config: { damping: 15 } }) * 196
  const papyWalk = interpolate(frame, [120, 160], [0, -110], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  })
  const papyX = cx + Math.sin(frame / 21) * 7
  const sway = Math.sin(frame / 24) * 2.2
  const at = (start: number, len: number) => frame >= start && frame < start + len
  const blink = at(58, 5) || at(130, 5) || at(166, 5)
  const eyesOpen = frame >= 40
  const eyeRy = !eyesOpen ? 1.3 : blink ? 1.6 : 7.5
  const cheer = frame >= 150
  const sealWiggle =
    frame >= 150 ? Math.sin((frame - 150) / 2.6) * 8 * Math.max(0, 1 - (frame - 150) / 26) : 0

  // the golden trail — same footprints as the learn path
  const TRAIL = 7
  const trailFrom = 64

  // wordmark
  const word1 = spring({ frame: frame - 146, fps, config: { damping: 13 } })
  const word2 = spring({ frame: frame - 154, fps, config: { damping: 13 } })
  const flourish = interpolate(frame, [160, 186], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  })
  const subtitleIn = interpolate(frame, [166, 184], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  })
  const verseIn = interpolate(frame, [176, 196], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  })

  return (
    <AbsoluteFill style={{ backgroundColor: PARCHMENT }}>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%">
        <g transform={`translate(0 ${drift})`}>
          {/* ── the sea, before and during the parting ── */}
          {[0, 1].map((side) => {
            const dir = side === 0 ? -1 : 1
            const tx = cx + dir * shift
            const wallX = side === 0 ? -120 : cx
            const wallW = cx + 120
            return (
              <g key={side} transform={`translate(${tx - cx} ${bob})`}>
                {/* chunky under-edge, then the wall, then the surface band */}
                <rect x={wallX} y={SEA_TOP + 16} width={wallW} height={SEA_BOTTOM - SEA_TOP} fill={SEA_DARK} />
                <rect x={wallX} y={SEA_TOP} width={wallW} height={SEA_BOTTOM - SEA_TOP} fill={SEA} />
                <rect x={wallX} y={SEA_TOP} width={wallW} height={22} fill={SEA_SURFACE} />
                {/* foam riding the inner edge — only once the waters
                    actually move (before that the seam is invisible and
                    the column would read as a stray bubble trail) */}
                {part > 0.01 &&
                  Array.from({ length: 8 }).map((_, i) => {
                    const y = SEA_TOP + 44 + i * 56
                    const r = 17 + prand(side * 31 + i) * 13
                    return <circle key={i} cx={cx} cy={y} r={r} fill={PARCHMENT} />
                  })}
                {/* drifting foam on the surface */}
                {Array.from({ length: 5 }).map((_, i) => {
                  const w = (prand(side * 17 + i) * width + frame * 0.55) % (width + 120)
                  return (
                    <circle
                      key={`d${i}`}
                      cx={w - 60}
                      cy={SEA_TOP + 6 + prand(i + 9) * 10}
                      r={5 + prand(i + 4) * 6}
                      fill={PARCHMENT}
                      opacity={0.85}
                    />
                  )
                })}
              </g>
            )
          })}

          {/* spray as the waters divide */}
          {part > 0.02 &&
            Array.from({ length: 12 }).map((_, i) => {
              const dir = prand(i) > 0.5 ? 1 : -1
              const s = spring({ frame: frame - 44 - i * 2, fps, config: { damping: 11 } })
              const y0 = 800 + prand(i + 3) * 280
              return (
                <circle
                  key={`s${i}`}
                  cx={cx + dir * s * (70 + prand(i + 7) * 150)}
                  cy={y0 - s * (30 + prand(i + 11) * 90)}
                  r={7 + prand(i + 13) * 9}
                  fill={PARCHMENT}
                  opacity={Math.max(0.12, 0.9 - s * 0.75)}
                />
              )
            })}

          {/* the wind — three quiet streaks before the parting */}
          {wind > 0.01 &&
            [0, 1, 2].map((i) => (
              <rect
                key={`w${i}`}
                x={-220 + (frame - 30) * 40 + i * 130}
                y={706 + i * 132}
                width={96 + i * 26}
                height={7}
                rx={3.5}
                fill={SEA_DARK}
                opacity={0.3 * wind}
              />
            ))}

          {/* ── soft gold light from above — one widening beam (layered,
              never crossed), painted behind the terrain so it tints the
              sea and sky without stamping on the path ── */}
          {rays > 0.01 && (
            <g opacity={rays}>
              <polygon points={`${cx - 150},-80 ${cx + 150},-80 ${cx + 340},1240 ${cx - 340},1240`} fill={GOLD} opacity={0.1} />
              <polygon points={`${cx - 70},-80 ${cx + 70},-80 ${cx + 160},1240 ${cx - 160},1240`} fill={GOLD} opacity={0.07} />
            </g>
          )}

          {/* ── the revealed way — sand, running off-screen so it reads
              as a road walked, not a floating card ── */}
          <g transform={`translate(${cx} 1140) scale(1 ${Math.max(0.001, sand)}) translate(${-cx} -1140)`}>
            <rect
              x={cx - 200}
              y={700}
              width={400}
              height={1300}
              rx={64}
              fill={SAND}
              stroke={SAND_EDGE}
              strokeWidth={6}
            />
          </g>

          {/* the trail of footprints — gold, stamped in one by one */}
          {Array.from({ length: TRAIL }).map((_, i) => {
            const s = spring({ frame: frame - (trailFrom + i * 6), fps, config: { damping: 10 } })
            if (s <= 0.001) return null
            const y = 1380 - i * 60
            const x = cx + (i % 2 === 0 ? -17 : 17)
            const tilt = (i % 2 === 0 ? -7 : 7) + (prand(i + 21) * 6 - 3)
            const pulse = i === TRAIL - 1 && frame > 140 ? 1 + Math.sin(frame / 9) * 0.05 : 1
            return (
              <FootprintShape
                key={`f${i}`}
                x={x}
                y={y}
                rotate={tilt}
                mirror={i % 2 === 0}
                scale={2.35 * s * pulse}
                fill={GOLD}
                opacity={0.92}
              />
            )
          })}

          {/* ── Papy the scroll, asleep then walking ── */}
          <g transform={`translate(${papyX} ${papyY + papyWalk}) rotate(${sway})`}>
            {/* shadow */}
            <ellipse cx={0} cy={116} rx={52} ry={9} fill="#00000014" />
            {/* left roll */}
            <rect x={-66} y={-38} width={20} height={116} rx={10} fill={ROLL} stroke={ROLL_EDGE} strokeWidth={4} />
            <rect x={-59} y={-38} width={6} height={116} rx={3} fill={ROLL_SHADE} />
            {/* body */}
            <rect x={-50} y={-46} width={100} height={130} rx={15} fill={BODY} stroke={ROLL_EDGE} strokeWidth={4.5} />
            {/* right roll */}
            <rect x={46} y={-44} width={20} height={128} rx={10} fill={ROLL} stroke={ROLL_EDGE} strokeWidth={4} />
            <rect x={53} y={-44} width={6} height={128} rx={3} fill={ROLL_SHADE} />
            {/* text lines */}
            <line x1={-34} y1={52} x2={30} y2={52} stroke="#d8c79a" strokeWidth={5} strokeLinecap="round" />
            <line x1={-34} y1={66} x2={16} y2={66} stroke="#d8c79a" strokeWidth={5} strokeLinecap="round" />
            {/* wax seal — wiggles when the trail is complete */}
            <g transform={`rotate(${sealWiggle} 30 -26)`}>
              <circle cx={30} cy={-26} r={13} fill={SEAL} stroke={SEAL_EDGE} strokeWidth={3} />
              <path
                d="M25 -26 l3.5 3.5 l7 -8"
                stroke={BODY}
                strokeWidth={3}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
            {/* face */}
            <ellipse cx={-16} cy={-6} rx={6.5} ry={eyeRy} fill={INK} />
            <ellipse cx={8} cy={-6} rx={6.5} ry={eyeRy} fill={INK} />
            {eyesOpen && (
              <>
                <circle cx={-14} cy={-9} r={2} fill="#fff" />
                <circle cx={10} cy={-9} r={2} fill="#fff" />
              </>
            )}
            <path
              d="M-27 -21 l13 -3.5 M19 -21 l-13 -3.5"
              stroke={BROW}
              strokeWidth={3.5}
              strokeLinecap="round"
              fill="none"
            />
            <ellipse cx={-31} cy={7} rx={7} ry={4} fill={BLUSH} opacity={0.7} />
            <ellipse cx={23} cy={7} rx={7} ry={4} fill={BLUSH} opacity={0.7} />
            {cheer ? (
              <path d="M-8 8 q10 12 20 0 q-10 4 -20 0 z" fill={INK} />
            ) : (
              <path d="M-8 6 q8 6 16 0" stroke={INK} strokeWidth={3} strokeLinecap="round" fill="none" />
            )}
            {/* zZ while asleep */}
            {!eyesOpen && (
              <g fill={BROW} fontFamily={FONT} fontWeight={900} opacity={0.4 + Math.sin(frame / 8) * 0.25}>
                <text x={66} y={-52} fontSize={22}>
                  z
                </text>
                <text x={80} y={-72} fontSize={30}>
                  Z
                </text>
              </g>
            )}
          </g>

          {/* ── the wordmark ── */}
          <g transform={`translate(${cx} 0)`}>
            <g opacity={markPop} transform={`scale(${0.6 + markPop * 0.4})`}>
              <text textAnchor="middle" y={252} fontSize={112}>
                📜
              </text>
            </g>
            <text
              textAnchor="middle"
              x={-190}
              y={372}
              fontSize={96}
              fontWeight={900}
              fill={INK}
              fontFamily={FONT}
              letterSpacing={-2}
              opacity={word1}
              transform={`translate(0 ${(1 - word1) * 34})`}
            >
              Scroll
            </text>
            <text
              textAnchor="middle"
              x={190}
              y={372}
              fontSize={96}
              fontWeight={900}
              fill={INK}
              fontFamily={FONT}
              letterSpacing={-2}
              opacity={word2}
              transform={`translate(0 ${(1 - word2) * 34})`}
            >
              Academy
            </text>
            {/* gold flourish under the name */}
            <rect x={-flourish * 210} y={404} width={flourish * 420} height={10} rx={5} fill={GOLD} opacity={flourish} />
          </g>

          {/* subtitle */}
          <text
            x={cx}
            y={452}
            textAnchor="middle"
            fontSize={36}
            fontWeight={800}
            fill={MUTED}
            fontFamily={FONT}
            opacity={subtitleIn}
          >
            Learn the Bible — five minutes a day.
          </text>

          {/* the verse the whole app is built on — set in the open
              parchment band, clear of the road and the trail */}
          <text x={cx} y={545} textAnchor="middle" fontSize={30} fontWeight={800} fill={MUTED} fontFamily={FONT} opacity={verseIn * 0.95}>
            “Thy word is a lamp unto my feet,
          </text>
          <text x={cx} y={589} textAnchor="middle" fontSize={30} fontWeight={800} fill={MUTED} fontFamily={FONT} opacity={verseIn * 0.95}>
            and a light unto my path.”
          </text>
          <text x={cx} y={634} textAnchor="middle" fontSize={26} fontWeight={800} fill={FAINT} fontFamily={FONT} opacity={verseIn}>
            — Psalm 119:105 (KJV)
          </text>

          {/* ── the call to begin ── */}
          <g transform={`translate(${cx} 1690) scale(${cta})`} opacity={cta}>
            <rect x={-310} y={0} width={620} height={104} rx={52} fill={GREEN_DARK} />
            <rect x={-310} y={-12} width={620} height={104} rx={52} fill={GREEN} />
            <text y={58} textAnchor="middle" fontSize={40} fontWeight={900} fill="#fff" fontFamily={FONT} letterSpacing={4}>
              BEGIN THE JOURNEY
            </text>
          </g>
        </g>
      </svg>
    </AbsoluteFill>
  )
}
