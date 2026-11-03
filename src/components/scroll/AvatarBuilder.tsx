"use client"

import { useMemo, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion"
import { Dices, Lock, Save, Shuffle, Sparkles } from "lucide-react"
import {
  ACCESSORIES,
  AvatarConfig,
  AVATAR_PRESETS,
  BGS,
  EYE_COLORS,
  HAIR_COLORS,
  HAIR_STYLES,
  HEADWEARS,
  OUTFITS,
  SKINS,
} from "@/lib/avatar"
import { useAppStore } from "@/lib/client/store"
import { sfx } from "@/lib/client/sound"
import { haptics } from "@/lib/client/haptics"
import { AvatarSvg } from "./AvatarSvg"
import { useRefreshApp } from "./ScrollApp"

type Category = "presets" | "skin" | "hair" | "eyes" | "outfit" | "accessory" | "headwear" | "bg"

const CATEGORIES: { id: Category; label: string }[] = [
  { id: "presets", label: "✨ Presets" },
  { id: "skin", label: "Skin" },
  { id: "hair", label: "Hair" },
  { id: "eyes", label: "Eyes" },
  { id: "outfit", label: "Outfit" },
  { id: "accessory", label: "Accessory" },
  { id: "headwear", label: "Headwear" },
  { id: "bg", label: "Backdrop" },
]

export function AvatarBuilder({ onDone }: { onDone: () => void }) {
  const [tab, setTab] = useState<Category>("presets")
  const pushToast = useAppStore((s) => s.pushToast)

  const boot = useQuery<{ user: { avatar: string | null; name: string } }>({ queryKey: ["bootstrap"] })
  const shop = useQuery<{ items: { slug: string; owned: number }[] }>({ queryKey: ["shop"] })

  const initial: AvatarConfig = useMemo(() => {
    if (boot.data?.user.avatar) {
      try {
        return JSON.parse(boot.data.user.avatar) as AvatarConfig
      } catch {
        /* fall through */
      }
    }
    return AVATAR_PRESETS[0].config
  }, [boot.data])

  const [cfg, setCfg] = useState<AvatarConfig>(initial)
  const set = <K extends keyof AvatarConfig>(k: K, v: AvatarConfig[K]) => setCfg((c) => ({ ...c, [k]: v }))

  const ownedSlugs = useMemo(() => new Set((shop.data?.items ?? []).filter((i) => i.owned > 0).map((i) => i.slug)), [shop.data])
  const qc = useQueryClient()
  const refreshApp = useRefreshApp()

  const save = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/profile", { method: "POST", body: JSON.stringify({ avatar: JSON.stringify(cfg) }) })
      if (!res.ok) throw new Error("failed")
    },
    onSuccess: () => {
      sfx.fanfare()
      haptics.complete()
      pushToast("Avatar saved! 🎨", "Looking sharp — your new look is live everywhere.", "🎨")
      void qc.invalidateQueries({ queryKey: ["bootstrap"] })
      void qc.invalidateQueries({ queryKey: ["profile"] })
      void qc.invalidateQueries({ queryKey: ["leaderboard"] })
      void qc.invalidateQueries({ queryKey: ["community"] })
      refreshApp()
      onDone()
    },
    onError: () => {
      sfx.wrong()
      pushToast("Couldn't save", "Please try again in a moment.", "⚠️")
    },
  })

  const randomize = () => {
    sfx.tap()
    haptics.tap()
    const free = OUTFITS.filter((o) => !o.shopSlug || ownedSlugs.has(o.shopSlug))
    setCfg({
      skin: SKINS[Math.floor(Math.random() * SKINS.length)],
      hair: HAIR_STYLES[Math.floor(Math.random() * HAIR_STYLES.length)].id,
      hairColor: HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)],
      eyes: EYE_COLORS[Math.floor(Math.random() * EYE_COLORS.length)].id,
      outfit: free[Math.floor(Math.random() * free.length)].id,
      accessory: ACCESSORIES[Math.floor(Math.random() * ACCESSORIES.length)].id,
      headwear: HEADWEARS[Math.floor(Math.random() * HEADWEARS.length)].id,
      bg: BGS[Math.floor(Math.random() * BGS.length)],
    })
  }

  const isLocked = (slug: string | null) => !!slug && !ownedSlugs.has(slug)

  return (
    <div className="px-3 sm:px-5 pt-5 pb-6">
      <div className="max-w-2xl mx-auto">
        <header className="mb-4 flex items-center gap-3">
          <div>
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-duo-purple" /> My Avatar
            </h1>
            <p className="text-muted-foreground font-bold text-sm mt-1">Craft your study self — including your crucifix</p>
          </div>
          <button onClick={randomize} className="ml-auto btn3d bg-white border-2 border-paper-border shadow-[0_3px_0_#e8e0c8] px-4 py-2.5 text-sm flex items-center gap-2" aria-label="Randomize avatar">
            <Dices className="w-4 h-4" /> Surprise me
          </button>
        </header>

        {/* preview */}
        <div className="bg-white rounded-3xl border-2 border-paper-border shadow-[0_5px_0_#e8e0c8] p-6 flex items-center gap-6 mb-4">
          <motion.div key={JSON.stringify(cfg)} initial={{ scale: 0.85, rotate: -4 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 300, damping: 18 }}>
            <AvatarSvg config={cfg} size={140} />
          </motion.div>
          <div className="min-w-0">
            <p className="font-black text-lg leading-tight">{boot.data?.user.name ?? "You"}</p>
            <p className="text-sm font-bold text-muted-foreground mt-0.5">
              {OUTFITS.find((o) => o.id === cfg.outfit)?.label}
              {cfg.accessory !== "none" && ACCESSORIES.find((a) => a.id === cfg.accessory)?.emoji}
            </p>
            <p className="text-xs font-bold text-muted-foreground mt-2 leading-relaxed">
              Accessory options include gold, silver and wooden crucifixes, a plain cross, and prayer beads — wear your faith.
            </p>
          </div>
        </div>

        {/* categories */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-3 -mx-1 px-1" role="tablist" aria-label="Avatar categories">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              role="tab"
              aria-selected={tab === c.id}
              onClick={() => {
                sfx.tap()
                setTab(c.id)
              }}
              className={`btn3d px-4 py-2 text-sm border-2 border-b-4 whitespace-nowrap ${
                tab === c.id ? "bg-duo-purple text-white border-duo-purple-dark shadow-[0_3px_0_#7c3aed]" : "bg-white border-paper-border text-muted-foreground hover:bg-secondary"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* options */}
        <div className="bg-white rounded-3xl border-2 border-paper-border shadow-[0_5px_0_#e8e0c8] p-4 min-h-[120px]">
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}>
              {tab === "presets" && (
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {AVATAR_PRESETS.map((p) => (
                    <button
                      key={p.label}
                      onClick={() => {
                        sfx.tap()
                        haptics.tap()
                        setCfg(p.config)
                      }}
                      className="flex flex-col items-center gap-1 rounded-2xl border-2 border-paper-border p-2 hover:border-duo-purple/50 transition-colors"
                    >
                      <AvatarSvg config={p.config} size={64} />
                      <span className="text-[11px] font-black">{p.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {tab === "skin" && (
                <SwatchRow>
                  {SKINS.map((s) => (
                    <Swatch key={s} color={s} active={cfg.skin === s} onClick={() => set("skin", s)} label="Skin tone" />
                  ))}
                </SwatchRow>
              )}

              {tab === "hair" && (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {HAIR_STYLES.map((h) => (
                      <button
                        key={h.id}
                        onClick={() => {
                          sfx.tap()
                          set("hair", h.id)
                        }}
                        className={`px-3.5 py-2 rounded-xl text-sm font-black border-2 transition-colors ${
                          cfg.hair === h.id ? "bg-ink text-white border-ink" : "bg-white border-paper-border text-muted-foreground hover:bg-secondary"
                        }`}
                      >
                        {h.label}
                      </button>
                    ))}
                  </div>
                  <SwatchRow>
                    {HAIR_COLORS.map((c) => (
                      <Swatch key={c} color={c} active={cfg.hairColor === c} onClick={() => set("hairColor", c)} label="Hair colour" />
                    ))}
                  </SwatchRow>
                </div>
              )}

              {tab === "eyes" && (
                <SwatchRow>
                  {EYE_COLORS.map((e) => (
                    <Swatch key={e.id} color={e.hex} active={cfg.eyes === e.id} onClick={() => set("eyes", e.id)} label={`${e.label} eyes`} />
                  ))}
                </SwatchRow>
              )}

              {tab === "outfit" && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {OUTFITS.map((o) => {
                    const locked = isLocked(o.shopSlug)
                    return (
                      <button
                        key={o.id}
                        onClick={() => {
                          if (locked) {
                            sfx.wrong()
                            haptics.wrong()
                            pushToast("Locked outfit 🔒", `Buy “${o.label}” in the Shop to unlock it.`, "🔒")
                            return
                          }
                          sfx.tap()
                          set("outfit", o.id)
                        }}
                        className={`relative rounded-2xl border-2 p-3 flex flex-col items-center gap-1 transition-colors ${
                          cfg.outfit === o.id ? "border-duo-purple bg-duo-purple/5" : "border-paper-border hover:bg-secondary"
                        } ${locked ? "opacity-60" : ""}`}
                      >
                        {locked && (
                          <span className="absolute top-1.5 right-1.5 bg-duo-gold text-white rounded-full p-1">
                            <Lock className="w-3 h-3" />
                          </span>
                        )}
                        <span className="text-2xl">{o.emoji}</span>
                        <span className="text-[11px] font-black text-center leading-tight">{o.label}</span>
                      </button>
                    )
                  })}
                </div>
              )}

              {tab === "accessory" && (
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                  {ACCESSORIES.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => {
                        sfx.tap()
                        haptics.tap()
                        set("accessory", a.id)
                      }}
                      className={`rounded-2xl border-2 p-3 flex flex-col items-center gap-1 transition-colors ${
                        cfg.accessory === a.id ? "border-duo-purple bg-duo-purple/5" : "border-paper-border hover:bg-secondary"
                      }`}
                    >
                      <span className="text-2xl">{a.emoji}</span>
                      <span className="text-[11px] font-black text-center leading-tight">{a.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {tab === "headwear" && (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
                  {HEADWEARS.map((h) => (
                    <button
                      key={h.id}
                      onClick={() => {
                        sfx.tap()
                        set("headwear", h.id)
                      }}
                      className={`rounded-2xl border-2 p-3 flex flex-col items-center gap-1 transition-colors ${
                        cfg.headwear === h.id ? "border-duo-purple bg-duo-purple/5" : "border-paper-border hover:bg-secondary"
                      }`}
                    >
                      <span className="text-2xl">{h.emoji}</span>
                      <span className="text-[11px] font-black text-center leading-tight">{h.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {tab === "bg" && (
                <SwatchRow>
                  {BGS.map((b) => (
                    <Swatch key={b} color={b} active={cfg.bg === b} onClick={() => set("bg", b)} label="Backdrop" />
                  ))}
                </SwatchRow>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* save */}
        <button
          onClick={() => save.mutate()}
          disabled={save.isPending}
          className="btn3d mt-4 w-full bg-duo-green text-white shadow-[0_5px_0_#46a302] py-4 text-lg flex items-center justify-center gap-2"
        >
          <Save className="w-5 h-5" /> {save.isPending ? "Saving…" : "Save avatar"}
        </button>
        <button onClick={onDone} className="mt-2 w-full py-2 font-extrabold text-muted-foreground hover:text-foreground">
          Cancel
        </button>
      </div>
    </div>
  )
}

function SwatchRow({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap gap-3">{children}</div>
}

function Swatch({ color, active, onClick, label }: { color: string; active: boolean; onClick: () => void; label: string }) {
  return (
    <motion.button
      whileTap={{ scale: 0.88 }}
      onClick={() => {
        sfx.tap()
        onClick()
      }}
      className={`w-12 h-12 rounded-full border-4 transition-colors ${active ? "border-duo-purple shadow-[0_0_0_3px_#9b5de540]" : "border-paper-border"}`}
      style={{ backgroundColor: color }}
      role="button"
      aria-label={`${label} ${color}`}
      aria-pressed={active}
    />
  )
}
