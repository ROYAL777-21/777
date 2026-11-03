/**
 * Scroll Academy — desktop build pipeline
 * =======================================
 * Produces everything `cargo tauri build` needs for a fully OFFLINE desktop app:
 *
 *   1. Builds the Next.js app standalone (into desktop-build/.next so the
 *      running dev server's .next is never touched)
 *   2. Assembles  src-tauri/resources/server/   (server.js + .next + public + node_modules)
 *   3. Seeds a    src-tauri/resources/scroll.db (fresh, pre-populated database)
 *   4. Compiles   src-tauri/binaries/scroll-server-<triple>  (bun-compiled launcher,
 *                embeds the JS runtime — end users install nothing)
 *
 * Then the user runs:  cargo tauri build   (or `bun run desktop:tauri`)
 *
 * Usage:  bun scripts/prepare-desktop.mjs [--triple x86_64-unknown-linux-gnu]
 */
import { spawnSync } from "node:child_process"
import { cp, mkdir, rm, access, readdir } from "node:fs/promises"
import { constants } from "node:fs"
import path from "node:path"

const ROOT = path.resolve(import.meta.dir, "..")
const BUILD = path.join(ROOT, "desktop-build", ".next")
const STANDALONE = path.join(BUILD, "standalone")
const RESOURCES = path.join(ROOT, "src-tauri", "resources")
const SERVER_DIR = path.join(RESOURCES, "server")
const BINARIES = path.join(ROOT, "src-tauri", "binaries")
const DB_PATH = path.join(RESOURCES, "scroll.db")

// ── helpers ───────────────────────────────────────────────────
const log = (icon, msg) => console.log(`${icon} ${msg}`)

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, {
    cwd: ROOT,
    stdio: opts.silent ? "ignore" : "inherit",
    shell: false,
    env: { ...process.env, ...opts.env },
  })
  if (r.status !== 0 && !opts.okToFail) {
    console.error(`✗ command failed (${r.status}): ${cmd} ${args.join(" ")}`)
    process.exit(1)
  }
  return r
}

async function exists(p) {
  try {
    await access(p, constants.F_OK)
    return true
  } catch {
    return false
  }
}

function detectTriple() {
  // explicit arg wins:  --triple x86_64-unknown-linux-gnu
  const i = process.argv.indexOf("--triple")
  if (i !== -1 && process.argv[i + 1]) return process.argv[i + 1]
  if (process.env.SCROLL_TRIPLE) return process.env.SCROLL_TRIPLE
  try {
    const r = spawnSync("rustc", ["-vV"], { encoding: "utf8" })
    const m = r.stdout?.match(/host:\s*(\S+)/)
    if (m) return m[1]
  } catch {
    /* rustc not installed */
  }
  const arch = process.arch === "arm64" ? "aarch64" : "x86_64"
  const os = process.platform === "darwin" ? "apple-darwin" : process.platform === "win32" ? "pc-windows-msvc" : "unknown-linux-gnu"
  log("⚠️ ", `rustc not found — guessed target triple ${arch}-${os}. Override with --triple <triple>`)
  return `${arch}-${os}`
}

// ── pipeline ──────────────────────────────────────────────────
async function main() {
  const t0 = Date.now()
  log("📦", "Preparing the Scroll Academy desktop bundle…")

  // 1 ─ build Next.js (standalone, separate dist dir)
  log("🏗️ ", "Building Next.js (standalone) into desktop-build/ …")
  await rm(path.join(ROOT, "desktop-build"), { recursive: true, force: true })
  run("bun", ["x", "next", "build"], { env: { DESKTOP_BUILD: "1" } })
  if (!(await exists(STANDALONE))) {
    console.error("✗ standalone output missing — did the build succeed?")
    process.exit(1)
  }

  // 2 ─ assemble resources/server (preserve Next's standalone layout exactly:
  //     with distDir "desktop-build/.next" the generated server.js hardcodes
  //     ./desktop-build/.next relative to itself, so we keep that structure)
  log("🗂️ ", "Assembling src-tauri/resources/server/ …")
  await rm(SERVER_DIR, { recursive: true, force: true })
  await mkdir(SERVER_DIR, { recursive: true })
  const entries = await readdir(STANDALONE, { withFileTypes: true })
  for (const e of entries) {
    if (e.name === ".env") continue // env comes from the launcher at runtime
    await cp(path.join(STANDALONE, e.name), path.join(SERVER_DIR, e.name), { recursive: true })
  }
  // static assets → nested distDir (standalone never includes them)
  await cp(
    path.join(BUILD, "static"),
    path.join(SERVER_DIR, "desktop-build", ".next", "static"),
    { recursive: true }
  )
  // public assets (bible JSON, icons…) — served from <serverDir>/public
  await cp(path.join(ROOT, "public"), path.join(SERVER_DIR, "public"), { recursive: true })

  // 3 ─ fresh pre-seeded database
  log("🌱", "Seeding a fresh desktop database (resources/scroll.db) …")
  await rm(DB_PATH, { force: true })
  run("bun", ["x", "prisma", "db", "push", "--skip-generate"], {
    env: { DATABASE_URL: "file:" + DB_PATH },
  })
  run("bun", ["prisma/seed.ts"], { env: { DATABASE_URL: "file:" + DB_PATH } })

  // 4 ─ sidecar: the Bun runtime itself, executed with the launcher script.
  //    Running desktop-server.js as a plain script (real paths, real
  //    node_modules resolution) is more reliable than `bun build --compile`,
  //    whose module resolution for runtime-required packages is flaky.
  log("⚙️ ", "Preparing the scroll-server sidecar (bundled Bun runtime) …")
  await rm(BINARIES, { recursive: true, force: true })
  await mkdir(BINARIES, { recursive: true })
  const bunPath = process.execPath // the bun running this script
  const triple = detectTriple()
  const sidedest = path.join(BINARIES, `bun-${triple}`)
  await cp(bunPath, sidedest)
  if (process.platform !== "win32") {
    spawnSync("chmod", ["+x", sidedest])
  }
  // the launcher lives inside the server bundle
  await cp(path.join(ROOT, "scripts", "desktop-server.js"), path.join(SERVER_DIR, "desktop-server.js"))
  log("🎯", `Sidecar ready: src-tauri/binaries/bun-${triple} (launcher: resources/server/desktop-server.js)`)

  const secs = ((Date.now() - t0) / 1000).toFixed(1)
  log("✅", `Desktop bundle prepared in ${secs}s`)
  log(" ▶ ", "Next: bun run desktop:icons   (once — generates PNG/ICO/ICNS)")
  log(" ▶ ", "Next: cargo tauri build        (or `cargo tauri dev`)")
  log(" ℹ️ ", "Requires the Tauri CLI:  cargo install tauri-cli --version \"^2\"")
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
