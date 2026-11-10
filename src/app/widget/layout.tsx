import type { Metadata, Viewport } from "next"
import "./widget.css"

/**
 * /widget/* — glanceable, animated surfaces that live OUTSIDE the app
 * chrome: home-screen shortcuts (mobile), pinned tiles and the
 * always-on-top desktop companion window (Tauri, laptops).
 *
 * Animation discipline (battery-first):
 *  · CSS keyframes on transform/opacity only — GPU-composited, no layout
 *  · `prefers-reduced-motion` freezes every loop (see widget.css)
 *  · JS timers (countdown) pause while the tab is hidden
 *  · data refetches only when visible + at most every 10 minutes
 */

export const metadata: Metadata = {
  title: "Scroll Academy",
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fff9ec",
}

export default function WidgetLayout({ children }: { children: React.ReactNode }) {
  return <div className="widget-root">{children}</div>
}
