/* bun scripts/engine-smoke.ts — sanity check of the engine core */
import { computeFeatures } from "../src/lib/engine/features"
import { computeScores } from "../src/lib/engine/scores"
import { resolveGameConfig } from "../src/lib/engine/gameConfig"
import { decide } from "../src/lib/engine/decide"
import { GAME_VARS } from "../src/lib/engine/gameVars"

async function main() {
  const t0 = Date.now()
  const fr = await computeFeatures("user_1")
  console.log(`features: ${fr.features.length} in ${Date.now() - t0}ms`)
  console.log("byCat:", fr.byCat.map((c) => `${c.cat}:${c.count}`).join(" "))
  const ids = new Set(fr.features.map((f) => f.id))
  console.log("unique ids:", ids.size, "(dupe check:", fr.features.length === ids.size ? "OK" : "DUPLICATES!", ")")
  const nonFinite = fr.features.filter((f) => !Number.isFinite(f.value))
  console.log("non-finite values:", nonFinite.length, nonFinite.length ? nonFinite.slice(0, 5).map((f) => f.id) : "")
  const scores = await computeScores(fr, "user_1")
  console.log("scores:", JSON.stringify({ ...scores, segments: scores.segments.join(",") }))
  const cfg = await resolveGameConfig(fr, scores)
  console.log("game vars resolved:", Object.keys(cfg).length, "/ registry:", GAME_VARS.length)
  const d = await decide(fr, scores, cfg, "user_1")
  console.log("NBAs:", d.nba.map((n) => `${n.kind}(${n.priority.toFixed(1)})`).join(", ") || "none")
  console.log("planned:", d.planned.map((p) => p.kind).join(", ") || "none")
  console.log("sessionHook:", d.sessionHook.title)
  process.exit(0)
}
main().catch((e) => {
  console.error(e)
  process.exit(1)
})
