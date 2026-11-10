// Scroll Academy — Tauri (Rust) shell
//
// The entire app ships as the Next.js standalone build served from a local
// bun-compiled server (sidecar) — tiny binary, no Electron, no Node on the
// user's machine, fully free & open-source toolchain. 100% offline:
//   - SQLite database lives in the OS app-data directory
//   - server bundle + pre-seeded DB ship as Tauri resources
//
// Startup flow:
//   1. resolve app-data dir; on first run copy resources (server/, scroll.db)
//   2. spawn the `scroll-server` sidecar on 127.0.0.1:3313
//   3. poll until the server answers TCP
//   4. show the main window (it loads http://127.0.0.1:3313)
// On exit the sidecar child is killed.

use std::fs;
use std::net::TcpStream;
use std::path::{Path, PathBuf};
use std::sync::Mutex;
use std::time::{Duration, Instant};

use serde as _; // re-exported through ledger; keep serde in scope for the derive macros
use tauri::{Manager, RunEvent, WebviewUrl, WebviewWindowBuilder};
use tauri_plugin_shell::process::CommandChild;
use tauri_plugin_shell::ShellExt;

pub mod ledger;
pub mod telemetry;

const SERVER_PORT: u16 = 3313;
const SERVER_START_TIMEOUT_SECS: u64 = 90;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Shalom, {}! Your scroll awaits.", name)
}

/// Native Scribe's-Ledger scoring — parity with the server engine.
/// The webview calls this for instant offline scores.
#[tauri::command]
fn ledger_score(input: ledger::LedgerInput) -> ledger::LedgerScores {
    ledger::score(&input)
}

/// Native XP math — mirrors the server's `awardActivityXp` rules.
#[tauri::command]
fn lesson_xp(
    difficulty: u32,
    first_time: bool,
    perfect: bool,
    combo: u32,
    pro_weekend: bool,
) -> ledger::XpBreakdown {
    ledger::lesson_xp(difficulty, first_time, perfect, combo, pro_weekend)
}

// ── v11: telemetry schema parity ──────────────────────────────────
// The webview compares this against GET /api/engine/schema so a stale
// shell can never silently drift from the server's contract.
#[tauri::command]
fn schema_fingerprint() -> u32 {
    telemetry::fingerprint()
}

// ── v11: the desktop companion widget window (laptops) ────────────
// A small frameless always-on-top window over /widget/board. Created
// on demand from the app (Profile → Scroll on your home screen → Show
// desktop companion). No extra plugins — core window APIs only.

#[tauri::command]
fn toggle_widget(app: tauri::AppHandle, show: bool) -> Result<bool, String> {
    if let Some(win) = app.get_webview_window("widget") {
        if show {
            let _ = win.show();
            let _ = win.set_focus();
            return Ok(true);
        }
        let _ = win.hide();
        return Ok(false);
    }
    if !show {
        return Ok(false);
    }

    // resolve the app origin from the main window (works in dev AND
    // in the packaged sidecar build)
    let origin = app
        .get_webview_window("main")
        .and_then(|m| m.url().ok())
        .map(|u| u.origin().ascii_serialization())
        .unwrap_or_else(|| format!("http://127.0.0.1:{SERVER_PORT}"));
    let url: tauri::Url = format!("{origin}/widget/board?chrome=desktop")
        .parse()
        .map_err(|e| format!("invalid widget url: {e}"))?;

    WebviewWindowBuilder::new(&app, "widget", WebviewUrl::External(url))
        .title("Scroll Academy")
        .inner_size(420.0, 560.0)
        .min_inner_size(300.0, 380.0)
        .decorations(false)
        .always_on_top(true)
        .skip_taskbar(true)
        .resizable(true)
        .build()
        .map_err(|e| format!("widget window failed: {e}"))?;
    Ok(true)
}

/// From the companion window: bring the main app window forward.
#[tauri::command]
fn open_main(app: tauri::AppHandle) -> Result<(), String> {
    if let Some(win) = app.get_webview_window("main") {
        let _ = win.show();
        let _ = win.set_focus();
    }
    Ok(())
}

fn wait_for_server(timeout_secs: u64) -> bool {
    let deadline = Instant::now() + Duration::from_secs(timeout_secs);
    while Instant::now() < deadline {
        if TcpStream::connect_timeout(
            &format!("127.0.0.1:{SERVER_PORT}")
                .parse()
                .expect("valid addr"),
            Duration::from_millis(400),
        )
        .is_ok()
        {
            return true;
        }
        std::thread::sleep(Duration::from_millis(250));
    }
    false
}

/// recursive directory copy (first-run resource installation)
fn copy_dir_all(src: &Path, dst: &Path) -> std::io::Result<()> {
    fs::create_dir_all(dst)?;
    for entry in fs::read_dir(src)? {
        let entry = entry?;
        let ty = entry.file_type()?;
        let from = entry.path();
        let to = dst.join(entry.file_name());
        if ty.is_dir() {
            copy_dir_all(&from, &to)?;
        } else {
            fs::copy(&from, &to)?;
        }
    }
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_shell::init())
        .manage(Mutex::new(None::<CommandChild>))
        .invoke_handler(tauri::generate_handler![
            greet,
            ledger_score,
            lesson_xp,
            schema_fingerprint,
            toggle_widget,
            open_main
        ])
        .build(tauri::generate_context!())
        .expect("error while running Scroll Academy")
        .run(|app, event| {
            if let RunEvent::Ready = event {
                // ── boot the offline server, then reveal the window ──
                let handle = app.handle().clone();
                std::thread::spawn(move || {
                    let data_dir: PathBuf = handle
                        .path()
                        .app_data_dir()
                        .expect("no app data dir for this identifier");
                    let server_dir = data_dir.join("server");
                    let db_path = data_dir.join("scroll.db");

                    // first run: install resources (server bundle + seeded db)
                    if !server_dir.exists() || !db_path.exists() {
                        let resource_dir = handle
                            .path()
                            .resource_dir()
                            .expect("no resource dir");
                        if !server_dir.exists() {
                            if let Err(e) = copy_dir_all(&resource_dir.join("server"), &server_dir) {
                                eprintln!("[scroll] failed to install server bundle: {e}");
                            }
                        }
                        if !db_path.exists() {
                            if let Err(e) = fs::copy(resource_dir.join("scroll.db"), &db_path) {
                                eprintln!("[scroll] failed to install database: {e}");
                            }
                        }
                        println!("[scroll] first run complete — bundle installed to {data_dir:?}");
                    }

                    // spawn the sidecar: the bundled Bun runtime executing
                    // the launcher script that ships inside the server bundle
                    let sidecar = match handle.shell().sidecar("bun") {
                        Ok(cmd) => cmd,
                        Err(e) => {
                            eprintln!("[scroll] bun sidecar missing: {e}");
                            return;
                        }
                    };
                    let launcher = server_dir
                        .join("desktop-server.js")
                        .to_string_lossy()
                        .into_owned();
                    match sidecar
                        .args([launcher])
                        .env("PORT", SERVER_PORT.to_string())
                        .env("HOSTNAME", "127.0.0.1")
                        .env("SCROLL_SERVER_DIR", &server_dir)
                        .env("SCROLL_DB", &db_path)
                        .spawn()
                    {
                        Ok((_rx, child)) => {
                            *handle
                                .state::<Mutex<Option<CommandChild>>>()
                                .lock()
                                .unwrap() = Some(child);
                            println!("[scroll] server sidecar spawned on 127.0.0.1:{SERVER_PORT}");
                        }
                        Err(e) => {
                            eprintln!("[scroll] failed to spawn scroll-server: {e}");
                            return;
                        }
                    }

                    // wait for readiness, then show the window
                    let ready = wait_for_server(SERVER_START_TIMEOUT_SECS);
                    if !ready {
                        eprintln!("[scroll] WARNING: server did not answer within {SERVER_START_TIMEOUT_SECS}s");
                    }
                    if let Some(win) = handle.get_webview_window("main") {
                        let _ = win.show();
                        if !ready {
                            let _ = win.set_title("Scroll Academy — server still starting…");
                        }
                    }
                });
            }

            if let RunEvent::ExitRequested { .. } = event {
                // shut the sidecar down with the app
                if let Some(child) = app
                    .state::<Mutex<Option<CommandChild>>>()
                    .lock()
                    .unwrap()
                    .take()
                {
                    let _ = child.kill();
                    println!("[scroll] server sidecar stopped");
                }
            }
        });
}
