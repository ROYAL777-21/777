/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Scroll Academy — desktop server launcher
 * ---------------------------------------
 * This script ships INSIDE the server bundle (resources/server/) and is
 * executed by the bundled Bun runtime (the Tauri sidecar). Running it as a
 * plain script keeps every path real and every require resolvable from
 * the bundle's own node_modules — no compiled-binary module quirks.
 *
 * Environment (set by the Rust shell, all optional):
 *   PORT             — server port          (default 3313)
 *   HOSTNAME         — bind address         (default 127.0.0.1)
 *   SCROLL_DB        — absolute path to scroll.db (default: <bundle>/../scroll.db)
 *   SCROLL_SERVER_DIR— server bundle dir    (default: this script's directory)
 */
const path = require("node:path")
const fs = require("node:fs")

const PORT = process.env.PORT || "3313"
const HOSTNAME = process.env.HOSTNAME || "127.0.0.1"

const serverDir = process.env.SCROLL_SERVER_DIR || __dirname
const dbPath = process.env.SCROLL_DB || path.resolve(serverDir, "..", "scroll.db")

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "file:" + dbPath
}
process.env.PORT = PORT
process.env.HOSTNAME = HOSTNAME
process.env.NODE_ENV = "production"

const serverEntry = path.join(serverDir, "server.js")
if (!fs.existsSync(serverEntry)) {
  console.error(`[scroll-server] FATAL: cannot find server bundle at ${serverEntry}`)
  process.exit(1)
}
if (!fs.existsSync(dbPath)) {
  console.warn(`[scroll-server] WARNING: database not found at ${dbPath} — Prisma may fail; re-install the app resources`)
}

console.log(`[scroll-server] starting Scroll Academy on http://${HOSTNAME}:${PORT}`)
console.log(`[scroll-server] server dir : ${serverDir}`)
console.log(`[scroll-server] database   : ${dbPath}`)

// Next.js standalone expects to run from its own directory
process.chdir(serverDir)
require(serverEntry)
