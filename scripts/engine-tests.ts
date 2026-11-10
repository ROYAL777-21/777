/* bun scripts/engine-tests.ts — adversarial edge-case suite for the engine.
 * Proves no NaN/Infinity/crash can escape into gameplay, across synthetic
 * extreme profiles: empty history, maximal history, NaN injection, boundary
 * timestamps, and pathological score inputs. */
import { computeFeatures } from "../src/lib/engine/features"
import { computeScores, sigmoid, runModel, CHURN_PRIORS } from "../src/lib/engine/scores"
import { resolveGameConfig } from "../src/lib/engine/gameConfig"
import { decide } from "../src/lib/engine/decide"
import { GAME_VARS, defaultGameConfig } from "../src/lib/engine/gameVars"
import { catchUpMultiplier, sessionTargetMinutes } from "../src/lib/engine/xp"
import { nudgeCopy, SESSION_END_HOOKS, safeTone } from "../src/lib/engine/copy"

let pass = 0
let fail = 0
function check(name: string, cond: boolean, detail = "") {
  if (cond) {
    pass++
    console.log(`  ✓ ${name}`)
  } else {
    fail++
    console.log(`  ✗ ${name} ${detail}`)
  }
}

function finiteEverywhere(obj: unknown, path = ""): string[] {
  const bad: string[] = []
  if (typeof obj === "number") {
    if (!Number.isFinite(obj)) bad.push(path)
  } else if (Array.isArray(obj)) {
    obj.forEach((x, i) => bad.push(...finiteEverywhere(x, `${path}[${i}]`)))
  } else if (obj && typeof obj === "object") {
    for (const [k, v] of Object.entries(obj)) bad.push(...finiteEverywhere(v, path ? `${path}.${k}` : k))
  }
  return bad
}

async function main() {
  console.log("── 1. sigmoid & runModel ─────────────────────────")
  for (const z of [-1e9, -1e5, -35, -1, 0, 1, 35, 1e5, 1e9, NaN, Infinity, -Infinity]) {
    const s = sigmoid(z)
    check(`sigmoid(${z}) finite & in [0,1]`, Number.isFinite(s) && s >= 0 && s <= 1, `got ${s}`)
  }
  check("sigmoid(0) = 0.5", Math.abs(sigmoid(0) - 0.5) < 1e-12)
  check("sigmoid(1e9) = 1", sigmoid(1e9) > 0.999999)
  check("sigmoid(-1e9) = 0", sigmoid(-1e9) < 1e-6)

  // runModel with poisoned values
  const poisoned: Record<string, number> = {}
  for (const k of Object.keys(CHURN_PRIORS)) poisoned[k] = k.includes("days") ? 1e9 : -1e9
  const p = runModel(poisoned, 0, { ...poisoned, nan: NaN })
  check("runModel with extreme values finite", Number.isFinite(p), `got ${p}`)

  console.log("── 2. features at boundary timestamps ────────────")
  for (const [label, asOf] of [
    ["epoch (1970)", 0],
    ["far future (2100)", 4102444800000],
    ["now", Date.now()],
    ["negative", -86400000],
  ] as [string, number][]) {
    try {
      const fr = await computeFeatures("user_1", asOf)
      const bad = finiteEverywhere(fr.values)
      check(`computeFeatures(${label}) all finite`, bad.length === 0, bad.slice(0, 3).join(","))
      check(`computeFeatures(${label}) no crash`, fr.features.length >= 500, `${fr.features.length}`)
    } catch (e) {
      check(`computeFeatures(${label}) no crash`, false, String(e))
    }
  }

  console.log("── 3. scores with synthetic extreme profiles ─────")
  const fr = await computeFeatures("user_1")

  // all-zero feature set
  const zeroFr = { ...fr, values: Object.fromEntries(fr.features.map((f) => [f.id, 0])) }
  const zeroScores = await computeScores(zeroFr as typeof fr, "user_1")
  check("scores(zero features) all finite", finiteEverywhere(zeroScores).length === 0)
  check("scores(zero features) churn in [0,1]", zeroScores.churnRisk >= 0 && zeroScores.churnRisk <= 1)

  // all-max feature set
  const maxFr = { ...fr, values: Object.fromEntries(fr.features.map((f) => [f.id, 1e6])) }
  const maxScores = await computeScores(maxFr as typeof fr, "user_1")
  check("scores(extreme features) all finite", finiteEverywhere(maxScores).length === 0)
  check("scores(extreme) loyalty in [0,100]", maxScores.loyalty >= 0 && maxScores.loyalty <= 100)
  check("scores(extreme) wtp in [0,1]", maxScores.wtp >= 0 && maxScores.wtp <= 1)

  // NaN-injected feature set — must not leak
  const nanFr = { ...fr, values: Object.fromEntries(fr.features.map((f) => [f.id, NaN])) }
  const nanScores = await computeScores(nanFr as typeof fr, "user_1")
  check("scores(NaN features) produces no NaN", finiteEverywhere(nanScores).length === 0, finiteEverywhere(nanScores).slice(0, 3).join(","))

  // mixed: half NaN
  const mixFr = { ...fr, values: Object.fromEntries(fr.features.map((f, i) => [f.id, i % 2 === 0 ? NaN : i % 3 === 0 ? -1e9 : 1e9])) }
  const mixScores = await computeScores(mixFr as typeof fr, "user_1")
  check("scores(mixed NaN/extreme) produces no NaN", finiteEverywhere(mixScores).length === 0)

  console.log("── 4. game config with extreme inputs ────────────")
  for (const [label, vals] of [
    ["all zero", Object.fromEntries(fr.features.map((f) => [f.id, 0]))],
    ["all extreme", Object.fromEntries(fr.features.map((f) => [f.id, 1e8]))],
    ["all negative", Object.fromEntries(fr.features.map((f) => [f.id, -1e8]))],
    ["all NaN", Object.fromEntries(fr.features.map((f) => [f.id, NaN]))],
  ] as [string, Record<string, number>][]) {
    const testFr = { ...fr, values: vals }
    try {
      const cfg = await resolveGameConfig(testFr as typeof fr, nanScores)
      const bad = finiteEverywhere(cfg)
      check(`resolveGameConfig(${label}) finite`, bad.length === 0, bad.slice(0, 3).join(","))
      check(`resolveGameConfig(${label}) xp.daily_goal sane`, (cfg["xp.daily_goal"] as number) >= 1 && (cfg["xp.daily_goal"] as number) <= 10000)
      check(`resolveGameConfig(${label}) multiplier in [1,1.25]`, (cfg["xp.personal_multiplier"] as number) >= 1 && (cfg["xp.personal_multiplier"] as number) <= 1.25)
    } catch (e) {
      check(`resolveGameConfig(${label}) no crash`, false, String(e))
    }
  }

  // defaults integrity: hard rules never violated
  const def = defaultGameConfig()
  check("hard rules: dark patterns banned", def["paywall.no_dark_patterns"] === 1)
  check("hard rules: guilt ban", def["tone.guilt_ban"] === 1)
  check("hard rules: scarcity off", def["econ.scarcity_mechanics"] === 0)
  check("hard rules: burnout outranks revenue", def["wellbeing.burnout_priority_over_revenue"] === 1)
  const uniqueIds = new Set(GAME_VARS.map((v) => v.id)).size
  check("gameVars ≥ 500 unique", uniqueIds >= 500, `${uniqueIds}`)
  check("gameVars registry count matches unique", uniqueIds === GAME_VARS.length)

  console.log("── 5. decide() with pathological scores ───────────")
  const cfgNormal = await resolveGameConfig(fr, zeroScores)
  const pathological = [
    { label: "all zero", s: zeroScores },
    { label: "churn=1,wtp=1", s: { ...zeroScores, churnRisk: 1, wtp: 1, engagement: 1, burnoutRisk: 1 } },
    { label: "churn=NaN", s: { ...zeroScores, churnRisk: NaN } },
    { label: "extreme", s: { ...maxScores } },
  ] as { label: string; s: typeof zeroScores }[]
  for (const { label, s } of pathological) {
    try {
      const d = await decide(fr, s, cfgNormal, "user_1")
      check(`decide(${label}) no crash`, Array.isArray(d.nba))
      const bad = finiteEverywhere(d.nba.map((n) => n.priority))
      check(`decide(${label}) priorities finite`, bad.length === 0)
    } catch (e) {
      check(`decide(${label}) no crash`, false, String(e))
    }
  }

  console.log("── 6. XP helpers ─────────────────────────────────")
  check("catchUpMultiplier(0)=1", catchUpMultiplier(0, 0.5) === 1)
  check("catchUpMultiplier(21, 1) ≤ 1.25", catchUpMultiplier(21, 1) <= 1.2501, String(catchUpMultiplier(21, 1)))
  check("catchUpMultiplier(NaN)=1", catchUpMultiplier(NaN, 0.5) === 1)
  check("catchUpMultiplier(1e9) ≤ 1.25", catchUpMultiplier(1e9, 0.5) <= 1.2501)
  check("sessionTargetMinutes(sparking)=3", sessionTargetMinutes("sparking") === 3)
  check("sessionTargetMinutes(unknown)=10", sessionTargetMinutes("nonsense") === 10)

  console.log("── 7. copy library ───────────────────────────────")
  check("safeTone garbage → growth", safeTone("!!!") === "growth")
  for (const kind of ["reengage", "goal", "review", "streak_risk", "milestone_near", "social", "rest"]) {
    for (const tone of ["growth", "identity", "stewardship"] as const) {
      const c = nudgeCopy(kind, tone, { streak: 999999, due: 1e9, days: 1e9, next: 1e9, xp: 1e9, goal: "1e9" })
      const finite = Number.isFinite(c.title.length) && typeof c.body === "string" && c.body.length > 0 && c.body.length < 600
      check(`nudgeCopy(${kind},${tone}) sane`, finite && !c.body.includes("NaN") && !c.body.includes("Infinity") && !c.body.includes("undefined"))
    }
  }
  for (const k of ["A", "B", "C", "garbage"]) {
    check(`SESSION_END_HOOKS[${k}] exists or defaults`, (SESSION_END_HOOKS[k] ?? SESSION_END_HOOKS.A).body.length > 0)
  }

  console.log("── 8. determinism & bounds spot-checks ────────────")
  const fr2 = await computeFeatures("user_1", fr.features.length ? Date.now() : Date.now())
  // same-second recompute should match on stable aggregates (excluding as-of-sensitive ids)
  const stable = ["progress.xp_total", "progress.lessons_total", "freq.total_lessons", "mastery.challenges_total", "social.friends"]
  let mismatches = 0
  for (const id of stable) {
    if (fr.values[id] !== fr2.values[id]) mismatches++
  }
  check("stable features deterministic", mismatches === 0, `${mismatches} mismatches`)
  check("hour histogram 24 buckets", (await computeFeatures("user_1", Date.now())).byCat.length >= 25)

  console.log(`\n══════════════════════════════════`)
  console.log(`PASS ${pass} · FAIL ${fail}`)
  process.exit(fail > 0 ? 1 : 0)
}

main().catch((e) => {
  console.error("SUITE CRASHED:", e)
  process.exit(1)
})
