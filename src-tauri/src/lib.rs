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

use tauri::{Manager, RunEvent};
use tauri_plugin_shell::process::CommandChild;
use tauri_plugin_shell::ShellExt;

const SERVER_PORT: u16 = 3313;
const SERVER_START_TIMEOUT_SECS: u64 = 90;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Shalom, {}! Your scroll awaits.", name)
}

fn wait_for_server(timeout_secs: u64) -> bool {
    let deadline = Instant::now() + Duration::from_secs(timeout_secs);
    while Instant::now() < deadline {
        if TcpStream::connect_timeout(
            &format!("127.0.0.1:{SERVER_PORT}").parse().expect("valid addr"),
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
        .invoke_handler(tauri::generate_handler![greet])
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
