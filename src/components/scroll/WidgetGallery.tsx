"use client"

/**
 * WidgetGallery.tsx — "Scroll on your home screen" (profile section, v11).
 *
 * Shows the three live widget surfaces (real iframes — WYSIWYG), and the
 * honest per-platform way to pin them:
 *   · iPhone/iPad  — Add to Home Screen from Safari (a one-tap tile),
 *                    and a Shortcuts automation can open it by voice
 *   · Android      — installed PWA long-press shortcuts (from the
 *                    manifest) or a launcher shortcut to the URL
 *   · Laptop       — the always-on-top desktop companion window
 *                    (Tauri build) — one toggle, no install step
 *
 * No dark patterns, no fake "widgets supported" claims: each platform
 * gets only what it can actually do today, and the native-shell path
 * (true home-screen widgets) is linked for later.
 */

import { useState } from "react"
import { Smartphone, Laptop, Flame, BookOpen, Zap, Sparkles } from "lucide-react"
import { isDesktopApp, toggleDesktopWidget } from "@/lib/client/desktop"
import { sfx } from "@/lib/client/sound"
import { haptics } from "@/lib/client/haptics"

function detectPlatform(): "ios" | "android" | "desktop" | "other" {
  if (typeof navigator === "undefined") return "other"
  const ua = navigator.userAgent
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  if (isIOS) return "ios"
  if (/Android/.test(ua)) return "android"
  if (!/Mobi/.test(ua)) return "desktop"
  return "other"
}

const PREVIEWS = [
  { path: "/widget/streak", label: "Streak flame", icon: Flame },
  { path: "/widget/verse", label: "Verse of the day", icon: BookOpen },
  { path: "/widget/xp", label: "Daily goal ring", icon: Zap },
]

function Steps({ platform }: { platform: string }) {
  if (platform === "ios") {
    return (
      <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground font-semibold">
        <li>Open scroll.academy in <b>Safari</b> (widgets need Safari, not in-app browsers)</li>
        <li>Share → <b>Add to Home Screen</b> — name it “Scroll”</li>
        <li>Long-press the new icon → open <b>/widget/streak</b> once, then add it too as its own tile</li>
        <li>For the verse: repeat with <b>/widget/verse</b></li>
      </ol>
    )
  }
  if (platform === "android") {
    return (
      <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground font-semibold">
        <li>Open scroll.academy in Chrome → menu → <b>Install app</b></li>
        <li>Long-press the app icon — the shortcuts (<b>Ask Papy</b>, <b>Streak</b>, <b>Verse</b>) appear</li>
        <li>Or long-press your launcher → <b>Widgets → Chrome</b> → pin the /widget/streak page as a tile</li>
      </ol>
    )
  }
  if (platform === "desktop") {
    return (
      <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground font-semibold">
        <li>Install the desktop app (Windows / macOS / Linux builds)</li>
        <li>Toggle <b>Desktop companion</b> below — a small always-on-top window appears</li>
        <li>Tap any card in it to jump straight back into the app</li>
      </ol>
    )
  }
  return (
    <p className="text-sm text-muted-foreground font-semibold">
      Open this page on the device you want the widget on, then follow its steps.
    </p>
  )
}

export function WidgetGallery() {
  const platform = detectPlatform()
  const [companionOn, setCompanionOn] = useState(false)
  const desktop = isDesktopApp()

  const toggleCompanion = async () => {
    const next = !companionOn
    setCompanionOn(next)
    sfx.tap()
    haptics.tap()
    await toggleDesktopWidget(next)
  }

  return (
    <div className="bg-white rounded-3xl border-2 border-paper-border shadow-[0_5px_0_#e8e0c8] p-5 mb-4">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-black text-lg flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-[#58cc02]" /> Scroll on your home screen
        </h3>
        <Laptop className="w-5 h-5 text-[#b89a5e]" />
      </div>
      <p className="text-sm text-muted-foreground font-semibold mb-4">
        Little animated companions — your streak, the day&apos;s verse, your goal — a glance away.
      </p>

      {/* live previews (the real pages, scaled down) */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {PREVIEWS.map((p) => (
          <a
            key={p.path}
            href={p.path}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative block rounded-2xl border-2 border-paper-border overflow-hidden bg-[#fff9ec] aspect-square hover:border-[#58cc02] transition-colors"
            title={`Open ${p.label}`}
          >
            <iframe
              src={p.path}
              title={p.label}
              loading="lazy"
              className="w-[300%] h-[300%] origin-top-left scale-[0.3333] border-0 pointer-events-none"
            />
            <span className="absolute bottom-1 inset-x-0 text-center text-[10px] font-black text-[#8a8371] uppercase tracking-wide">
              {p.label}
            </span>
          </a>
        ))}
      </div>

      <Steps platform={platform} />

      {desktop && (
        <button
          onClick={() => void toggleCompanion()}
          className="mt-4 w-full font-black text-sm rounded-2xl px-4 py-3 border-2 transition-transform active:translate-y-[2px]"
          style={{
            background: companionOn ? "#fff9ec" : "#58cc02",
            color: companionOn ? "#3f3a2f" : "#fff",
            borderColor: companionOn ? "#e8e0c8" : "#46a302",
            boxShadow: `0 3px 0 ${companionOn ? "#e8e0c8" : "#46a302"}`,
          }}
        >
          <Sparkles className="inline w-4 h-4 mr-1.5 -mt-0.5" />
          {companionOn ? "Hide desktop companion" : "Show desktop companion"}
        </button>
      )}
    </div>
  )
}
