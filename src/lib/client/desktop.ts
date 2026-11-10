"use client"

/**
 * desktop.ts — the Tauri bridge (feature-detected, never assumed).
 *
 * The desktop shell (src-tauri) exposes `window.__TAURI__` via
 * `withGlobalTauri: true`. Everything here degrades gracefully to a
 * no-op in a plain browser — the same UI code runs on web, PWA and
 * desktop without branching beyond these helpers.
 */

interface TauriGlobal {
  core?: {
    invoke?: (cmd: string, args?: Record<string, unknown>) => Promise<unknown>
  }
  invoke?: (cmd: string, args?: Record<string, unknown>) => Promise<unknown>
}

function tauri(): TauriGlobal | null {
  if (typeof window === "undefined") return null
  const t = (window as unknown as { __TAURI__?: TauriGlobal }).__TAURI__
  return t ?? null
}

export function isDesktopApp(): boolean {
  const t = tauri()
  return !!(t?.core?.invoke ?? t?.invoke)
}

export async function desktopInvoke<T = unknown>(cmd: string, args?: Record<string, unknown>): Promise<T | null> {
  const t = tauri()
  const invoke = t?.core?.invoke ?? t?.invoke
  if (typeof invoke !== "function") return null
  try {
    return (await invoke(cmd, args)) as T
  } catch {
    return null
  }
}

/** show/hide the always-on-top desktop companion widget window */
export function toggleDesktopWidget(show: boolean): Promise<boolean | null> {
  return desktopInvoke<boolean>("toggle_widget", { show })
}

/** from the tiny widget window: bring the main app window forward */
export function focusMainWindow(): Promise<null> {
  return desktopInvoke<null>("open_main").then(() => null)
}
