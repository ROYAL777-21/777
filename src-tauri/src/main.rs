// Scroll Academy — Tauri (Rust) shell
//
// The entire app ships as the Next.js web build served inside a native Rust
// window — tiny binary, no Electron, fully free & open-source toolchain.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    scroll_academy_lib::run()
}
