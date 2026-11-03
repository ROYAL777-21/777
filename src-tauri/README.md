# Scroll Academy — Desktop (Tauri, Rust)

The desktop app wraps the whole Scroll Academy web app in a native Rust
window and runs it **100% offline**: the Next.js server, the SQLite
database, and the complete Bible text all live on the user's machine.
No Electron, no Node.js install, no internet required.

## How it works

```
┌──────────────────────────── Tauri (Rust) shell ────────────────────────────┐
│                                                                             │
│  startup:  copy resources (first run) → spawn sidecar → wait TCP → show    │
│                                                                             │
│   ┌── webview window ──────────────┐      ┌── scroll-server sidecar ────┐ │
│   │  loads http://127.0.0.1:3313   │ ◀──▶ │  bun-compiled executable   │ │
│   │  (the Next.js app UI)          │ HTTP │  runs the standalone        │ │
│   └────────────────────────────────┘      │  Next.js server + Prisma    │ │
│                                           └──────────────┬──────────────┘ │
│                                                        │                 │
│                          OS app-data dir ◀─────────────┘                 │
│                          scroll.db   (SQLite, user progress)              │
│                          server/    (Next.js standalone bundle)           │
└─────────────────────────────────────────────────────────────────────────────┘
```

- **`binaries/bun-<triple>`** — the sidecar: the Bun JavaScript runtime
  (single self-contained executable, MIT-licensed). End users install
  **nothing** — no Node, no package manager, no internet.
- **`resources/server/`** — the Next.js standalone build (server.js,
  `desktop-build/.next/`, `node_modules/` runtime, `public/` incl. the full
  Bible JSON, and the `desktop-server.js` launcher).
- **`resources/scroll.db`** — a fresh pre-seeded SQLite database (all
  courses, quests, leagues, stories, bot users).

On first launch the Rust shell copies the resources into the OS app-data
directory and starts the server; the window appears once the server is
answering. Progress is stored in the app-data `scroll.db`.

## Build it

Prerequisites (one-time):

```bash
# Rust + the Tauri CLI (free & open-source)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
cargo install tauri-cli --version "^2"
```

Then, from the repository root:

```bash
bun run desktop:icons     # once — renders PNG/ICO/ICNS from icons/app.svg
bun run desktop:prepare   # builds the standalone app, seeds the DB,
                          # compiles the scroll-server sidecar
cargo tauri build         # produces .AppImage/.deb (Linux), .msi (Windows), .dmg (macOS)
```

`desktop:prepare` is wired into `beforeBuildCommand`, so a plain
`cargo tauri build` also re-prepares everything automatically.

For development against the running `bun run dev` server:

```bash
cargo tauri dev           # window loads http://localhost:3000 (devUrl)
```

### Notes

- The sidecar binary is target-specific. `desktop:prepare` auto-detects the
  host triple via `rustc -vV`; override with `--triple <triple>` or the
  `SCROLL_TRIPLE` env var when cross-compiling. The bundled Bun runtime
  must match the target platform (Linux, Windows, macOS — arm64 & x64).
- Cross-platform bundles should be built on (or for) each target OS — the
  bundled Prisma native engine and the compiled sidecar are platform binaries.
- To reset a desktop install, delete the app's data directory
  (e.g. `~/.local/share/app.scrollacademy.bible` on Linux) and relaunch —
  first-run installation restores a fresh seeded database.
- The window starts hidden (`visible: false` in `tauri.conf.json`) and is
  shown by the shell once the server is ready, so users never see a blank
  frame while SQLite boots.
