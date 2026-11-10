// ═══════════════════════════════════════════════════════════════
//  THE FOOTPRINT (v9)
//
//  "Thy word is a lamp unto my feet" — the road ahead on the learn
//  path is walked, not dotted. One shape, shared by the learn path
//  and the parting-of-the-sea splash, so the metaphor is literal
//  everywhere it appears.
//
//  Pure SVG, no animation dependencies: the learn path lets CSS
//  pulse the leading step (.footstep-lead), the Remotion splash
//  animates it with springs. Coordinates: toes at -y, heel at +y.
// ═══════════════════════════════════════════════════════════════

/** the sole — ball of the foot to the heel */
export const FOOT_SOLE_PATH =
  "M0,-13 C6.2,-13 8.6,-5.2 7.6,2.8 C6.8,10.4 4.1,15.8 0,15.8 C-4.1,15.8 -6.8,10.4 -7.6,2.8 C-8.6,-5.2 -6.2,-13 0,-13 Z"

/** the toes — big toe sits on the +x side of a right print */
export const FOOT_TOES: { cx: number; cy: number; r: number }[] = [
  { cx: 4.8, cy: -16.4, r: 1.8 },
  { cx: 1.7, cy: -19.0, r: 2.0 },
  { cx: -1.7, cy: -18.8, r: 2.1 },
  { cx: -4.6, cy: -16.2, r: 1.8 },
]

/**
 * A single footprint.
 * @param x,y      centre of the print, in the parent SVG's space
 * @param rotate   degrees — toes point along the direction of travel
 * @param mirror   true → left foot (big toe on the walker's other side)
 * @param scale    uniform scale (1 ≈ 34px tall)
 * @param fill     print colour
 * @param opacity  0–1
 * @param lead     the next step — gets the soft call-forward pulse
 */
export function FootprintShape({
  x,
  y,
  rotate = 0,
  mirror = false,
  scale = 1,
  fill,
  opacity = 1,
  lead = false,
}: {
  x: number
  y: number
  rotate?: number
  mirror?: boolean
  scale?: number
  fill: string
  opacity?: number
  lead?: boolean
}) {
  return (
    <g
      transform={`translate(${x} ${y}) rotate(${rotate}) scale(${mirror ? -scale : scale} ${scale})`}
      opacity={opacity}
    >
      <g className={lead ? "footstep-lead" : undefined}>
        <path d={FOOT_SOLE_PATH} fill={fill} />
        {FOOT_TOES.map((t) => (
          <circle key={`${t.cx},${t.cy}`} cx={t.cx} cy={t.cy} r={t.r} fill={fill} />
        ))}
      </g>
    </g>
  )
}
