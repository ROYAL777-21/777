"use client"

/**
 * AssistantSetup.tsx — "Use Papy with Siri & your phone's assistant"
 * (profile section, v11).
 *
 * The honest bridge, works today with zero native code:
 *   · Siri (iOS): a Shortcut that opens  /?assistant=1&q=<dictated text>
 *     → the app answers out loud
 *   · Android: an Assistant/Gemini routine opening the same URL
 *   · Installed PWA: long-press "Ask Papy" shortcut (manifest)
 *
 * The native adapters for the store builds (true Siri App Intents,
 * Google App Actions) are written and waiting in /native.
 */

import { useEffect, useState } from "react"
import { Mic, Volume2, Smartphone, Copy, Check } from "lucide-react"
import { sttSupported } from "@/lib/client/stt"
import { ttsSupported } from "@/lib/client/tts"
import { isDesktopApp } from "@/lib/client/desktop"
import { useAppStore } from "@/lib/client/store"
import { sfx } from "@/lib/client/sound"

function Cap({ ok, label, icon }: { ok: boolean; label: string; icon: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-black rounded-full px-2.5 py-1 border-2"
      style={{
        borderColor: ok ? "#bfe8a0" : "#eee6cd",
        background: ok ? "#eef7e6" : "#f6f0de",
        color: ok ? "#3c7a00" : "#b0a78e",
      }}
    >
      {icon}
      {label} {ok ? "✓" : "—"}
    </span>
  )
}

export function AssistantSetup() {
  const [mic, setMic] = useState(false)
  const [voice, setVoice] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [link, setLink] = useState("/?assistant=1&q=")
  const setView = useAppStore((s) => s.setView)

  useEffect(() => {
    // capability detection after mount, deferred a tick (SSR-safe)
    const t = setTimeout(() => {
      setMic(sttSupported())
      setVoice(ttsSupported())
      setLink(`${window.location.origin}/?assistant=1&q=`)
    }, 0)
    return () => clearTimeout(t)
  }, [])

  const copy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(id)
      sfx.tap()
      setTimeout(() => setCopied(null), 1600)
    } catch {
      /* clipboard blocked — the text is selectable anyway */
    }
  }

  return (
    <div className="bg-white rounded-3xl border-2 border-paper-border shadow-[0_5px_0_#e8e0c8] p-5 mb-4">
      <h3 className="font-black text-lg flex items-center gap-2 mb-1">
        <Mic className="w-5 h-5 text-[#58cc02]" /> Use Papy with Siri &amp; your assistant
      </h3>
      <p className="text-sm text-muted-foreground font-semibold mb-3">
        One link powers every bridge — the app hears your question and answers out loud.
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        <Cap ok={mic} label="Speech recognition" icon={<Mic className="w-3 h-3" />} />
        <Cap ok={voice} label="Voice" icon={<Volume2 className="w-3 h-3" />} />
        <Cap ok={isDesktopApp()} label="Desktop app" icon={<Smartphone className="w-3 h-3" />} />
      </div>

      {/* the bridge link */}
      <div className="flex items-center gap-2 mb-4">
        <code className="flex-1 min-w-0 text-xs font-bold bg-[#fff9ec] border-2 border-paper-border rounded-xl px-3 py-2 truncate">
          {link}
          <span className="text-[#b0a78e]">your words here</span>
        </code>
        <button
          onClick={() => void copy(link, "link")}
          className="shrink-0 rounded-xl px-3 py-2 text-xs font-black text-white flex items-center gap-1"
          style={{ border: "none", background: "#58cc02", boxShadow: "0 3px 0 #46a302", cursor: "pointer" }}
        >
          {copied === "link" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied === "link" ? "Copied" : "Copy"}
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Siri */}
        <div className="rounded-2xl border-2 border-paper-border p-3.5">
          <h4 className="font-black text-sm mb-2">On iPhone — Siri</h4>
          <ol className="list-decimal list-inside space-y-1 text-xs text-muted-foreground font-semibold">
            <li>Open the <b>Shortcuts</b> app → new shortcut</li>
            <li>Add <b>Dictate Text</b>, then <b>URL Encode</b> (Toolbox)</li>
            <li>Add <b>Open URLs</b> with the copied link + the encoded text</li>
            <li>Name it “Ask Papy” — then: “Hey Siri, Ask Papy”</li>
          </ol>
        </div>

        {/* Android */}
        <div className="rounded-2xl border-2 border-paper-border p-3.5">
          <h4 className="font-black text-sm mb-2">On Android — Assistant</h4>
          <ol className="list-decimal list-inside space-y-1 text-xs text-muted-foreground font-semibold">
            <li>Open Google Assistant settings → <b>Routines</b> → new</li>
            <li>When I say: <b>“Ask Papy”</b></li>
            <li>Add action → <b>Open URL</b> → paste the copied link</li>
            <li>Installed app? Long-press the icon → <b>Ask Papy</b> shortcut</li>
          </ol>
        </div>
      </div>

      <button
        onClick={() => setView("learn")}
        className="mt-4 text-xs font-black text-[#58a700] underline"
        style={{ border: "none", background: "transparent", cursor: "pointer", padding: 0 }}
      >
        Try Papy inside the app first →
      </button>

      <p className="mt-3 text-[11px] text-muted-foreground font-semibold leading-relaxed">
        Private by design: your spoken words reach Papy, get matched to an intent, and are discarded — never stored,
        never logged. Native Siri &amp; App-Actions adapters ship with the store builds (already written in{" "}
        <code className="font-bold">/native</code>).
      </p>
    </div>
  )
}
