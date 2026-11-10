"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { AVATAR_PRESETS } from "@/lib/avatar"
import { courseCategory, CATEGORY_META, type CourseCategory } from "@/lib/courseMeta"
import { sfx } from "@/lib/client/sound"
import { haptics } from "@/lib/client/haptics"
import type { CourseSummary } from "@/lib/types"
import { AvatarSvg } from "./AvatarSvg"
import { Mascot } from "./Mascot"
import { useAppStore } from "@/lib/client/store"

const AVATARS = ["🦁", "🕊️", "🐑", "🦉", "🐉", "🌟", "🕎", "🛡️", "📜", "👑", "🌾", "🐟"]
const CATEGORY_ORDER: CourseCategory[] = ["language", "study", "denomination"]

export function Onboarding({ courses }: { courses: CourseSummary[] }) {
  const qc = useQueryClient()
  const [step, setStep] = useState(0)
  const [name, setName] = useState("")
  const [avatar, setAvatar] = useState("🦁")
  const [avatarCfg, setAvatarCfg] = useState(AVATAR_PRESETS[0])
  const [picked, setPicked] = useState<string | null>(null)

  const selectCourse = useMutation({
    mutationFn: async (courseId: string) => {
      const res = await fetch("/api/courses", {
        method: "POST",
        body: JSON.stringify({ courseId }),
      })
      if (!res.ok) throw new Error("failed")
      return res.json()
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["bootstrap"] })
    },
  })

  const saveProfile = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/profile", {
        method: "POST",
        body: JSON.stringify({ name: name || "Scribe", image: avatar, avatar: JSON.stringify(avatarCfg.config) }),
      })
      if (!res.ok) throw new Error("failed")
      return res.json()
    },
  })

  const finish = () => {
    sfx.fanfare()
    haptics.complete()
    saveProfile.mutate()
    if (picked) selectCourse.mutate(picked)
    // Hormozi: the best upgrade moment is right after the first win —
    // offer the 7-day trial as onboarding's final step
    setTimeout(() => useAppStore.getState().openPaywall("onboarding"), 500)
  }

  return (
    <div className="parchment-bg min-h-screen flex flex-col items-center justify-center p-5 overflow-hidden relative">
      {/* floating decorations */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl opacity-20 select-none"
          style={{ left: `${10 + i * 16}%`, top: `${12 + ((i * 23) % 70)}%` }}
          animate={{ y: [0, -14, 0], rotate: [0, 8, -8, 0] }}
          transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut" }}
        >
          {["Α", "א", "📜", "Ω", "🪶", "✨"][i]}
        </motion.div>
      ))}

      <div className="w-full max-w-xl text-center relative">
        <div className="flex justify-center mb-2">
          <Mascot mood={step === 0 ? "happy" : step === 1 ? "think" : "cheer"} size={130} />
        </div>

        {step === 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl sm:text-4xl font-black mb-2">
              Welcome to Scroll <span className="text-duo-green">Academy</span>
            </h1>
            <p className="text-lg font-bold text-muted-foreground mb-8">
              Learn the Bible in its own languages — Greek, Hebrew, the whole Book, apologetics and the great
              denominations — with streaks, hearts and leagues that keep you coming back daily.
            </p>
            <button
              className="btn3d bg-duo-green text-white shadow-[0_5px_0_#46a302] text-lg py-4 px-10"
              onClick={() => {
                sfx.correct()
                haptics.light()
                setStep(1)
              }}
            >
              Get started
            </button>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-2xl font-black mb-1">What do you want to learn?</h2>
            <p className="font-bold text-muted-foreground mb-6">Pick your first course — you can add more anytime.</p>
            <div className="max-h-[46vh] overflow-y-auto pr-1 -mx-1 px-1 mb-6 flex flex-col gap-4 text-left">
              {CATEGORY_ORDER.map((cat) => {
                const list = courses.filter((c) => courseCategory(c.code) === cat)
                if (list.length === 0) return null
                const meta = CATEGORY_META[cat]
                return (
                  <div key={cat}>
                    <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                      <span>{meta.emoji}</span> {meta.label}
                    </p>
                    <div className="grid gap-2.5 sm:grid-cols-2">
                      {list.map((c, i) => {
                        const active = picked === c.id
                        return (
                          <motion.button
                            key={c.id}
                            initial={{ opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => {
                              sfx.tap()
                              haptics.tap()
                              setPicked(c.id)
                            }}
                            className={`text-left rounded-2xl border-2 p-3.5 bg-white flex gap-3 items-center transition-all ${
                              active ? "border-duo-green shadow-[0_4px_0_#58cc0a66]" : "border-paper-border shadow-[0_4px_0_#e8e0c8] hover:border-muted-foreground/40"
                            }`}
                          >
                            <span
                              className="w-11 h-11 rounded-2xl grid place-items-center text-2xl shrink-0"
                              style={{ backgroundColor: c.color + "22" }}
                            >
                              {c.emoji}
                            </span>
                            <span className="min-w-0">
                              <span className="block font-black text-sm leading-tight">{c.title}</span>
                              <span className="block text-xs text-muted-foreground font-semibold leading-snug line-clamp-2">{c.subtitle}</span>
                            </span>
                            {active && <span className="ml-auto text-duo-green text-xl shrink-0">✓</span>}
                          </motion.button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="flex gap-3 justify-center">
              <button className="btn3d bg-white border-2 border-paper-border shadow-[0_4px_0_#e8e0c8] py-3 px-6" onClick={() => setStep(0)}>
                Back
              </button>
              <button
                className="btn3d bg-duo-green text-white shadow-[0_5px_0_#46a302] py-3 px-8 disabled:bg-[#b7b2a0] disabled:shadow-[0_4px_0_#c9c0a4]"
                disabled={!picked}
                onClick={() => {
                  sfx.correct()
                  haptics.light()
                  setStep(2)
                }}
              >
                Continue
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-2xl font-black mb-1">Create your profile</h2>
            <p className="font-bold text-muted-foreground mb-6">No account, no ads, no tracking. Just you and the scroll.</p>
            <div className="bg-white rounded-3xl border-2 border-paper-border shadow-[0_5px_0_#e8e0c8] p-6 mb-6">
              <label className="block text-left font-extrabold text-sm mb-1.5" htmlFor="sname">
                Your name
              </label>
              <input
                id="sname"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Scribe"
                maxLength={24}
                className="w-full bg-secondary border-2 border-paper-border rounded-xl px-4 py-3 font-extrabold focus:outline-none focus:border-duo-green"
              />
              <p className="block text-left font-extrabold text-sm mt-4 mb-2">Pick your study self (customise later — robes, crowns & outfits!)</p>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
                {AVATAR_PRESETS.map((p) => {
                  const active = avatarCfg.label === p.label
                  return (
                    <button
                      key={p.label}
                      onClick={() => {
                        sfx.tap()
                        haptics.tap()
                        setAvatarCfg(p)
                      }}
                      className={`flex flex-col items-center gap-1 rounded-2xl border-2 p-2 transition-all ${
                        active ? "border-duo-green bg-duo-green/10 scale-105" : "border-paper-border hover:border-muted-foreground/40"
                      }`}
                      aria-label={`avatar preset ${p.label}`}
                    >
                      <AvatarSvg config={p.config} size={56} />
                      <span className="text-[10px] font-black">{p.label}</span>
                    </button>
                  )
                })}
              </div>
              <p className="block text-left font-extrabold text-sm mb-2">Or an emoji</p>
              <div className="flex flex-wrap gap-2">
                {AVATARS.map((a) => (
                  <button
                    key={a}
                    onClick={() => {
                      sfx.tap()
                      haptics.tap()
                      setAvatar(a)
                    }}
                    className={`w-11 h-11 rounded-xl text-xl grid place-items-center border-2 transition-all ${
                      avatar === a ? "border-duo-green bg-duo-green/10 scale-110" : "border-paper-border hover:border-muted-foreground/40"
                    }`}
                    aria-label={`avatar ${a}`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3 justify-center">
              <button className="btn3d bg-white border-2 border-paper-border shadow-[0_4px_0_#e8e0c8] py-3 px-6" onClick={() => setStep(1)}>
                Back
              </button>
              <button
                className="btn3d bg-duo-green text-white shadow-[0_5px_0_#46a302] py-3 px-8"
                onClick={finish}
                disabled={selectCourse.isPending}
              >
                Let&apos;s go!
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
