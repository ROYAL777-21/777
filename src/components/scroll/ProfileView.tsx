"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { Pencil, Check, Volume2, Vibrate, BellRing, Flame, Zap, BookOpen, Target, Star, Palette, Share2, BookOpenCheck, Users, UserPlus, Crown, Sparkles } from "lucide-react"
import { parseAvatar } from "@/lib/avatar"
import { useAppStore } from "@/lib/client/store"
import { sfx } from "@/lib/client/sound"
import { haptics } from "@/lib/client/haptics"
import { requestNotificationPermission, fireBrowserNotification } from "@/lib/client/notify"
import { useMotionPrefs } from "@/lib/motion/MotionPrefs"
import type { ProfilePayload } from "@/lib/types"
import { useRefreshApp } from "./ScrollApp"
import { AvatarSvg } from "./AvatarSvg"
import { Mascot } from "./Mascot"
import { ExploreMenu, PlanCard, ReferralCard, NotificationPrefsCard, StatementOfFaith, AccountCard } from "./ProfileExtras"
import { ChurchPlanCard, GiftCard } from "./ProfileCards"
import { InsightsPanel } from "./InsightsPanel"
import { WidgetGallery } from "./WidgetGallery" // v11: animated home-screen widgets + desktop companion
import { AssistantSetup } from "./AssistantSetup" // v11: Siri / Android Assistant bridge setup

const AVATARS = ["🦁", "🕊️", "🐑", "🦉", "🐉", "🌟", "🕎", "🛡️", "📜", "👑", "🌾", "🐟"]

export function ProfileView() {
  const qc = useQueryClient()
  const refreshApp = useRefreshApp()
  const setView = useAppStore((s) => s.setView)
  const pushToast = useAppStore((s) => s.pushToast)
  const soundOn = useAppStore((s) => s.soundOn)
  const hapticsOn = useAppStore((s) => s.hapticsOn)
  const { pref: motionPref, osReduced, setPref: setMotionPref } = useMotionPrefs()
  const setSound = useAppStore((s) => s.setSound)
  const setHaptics = useAppStore((s) => s.setHaptics)
  const openPaywall = useAppStore((s) => s.openPaywall)

  const [editing, setEditing] = useState(false)
  const [name, setName] = useState("")
  const [bio, setBio] = useState("")
  const [avatar, setAvatar] = useState("")

  const { data, isLoading } = useQuery<ProfilePayload>({ queryKey: ["profile"] })
  const setShareDraft = useAppStore((s) => s.setShareDraft)

  const save = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/profile", {
        method: "POST",
        body: JSON.stringify({ name: name || "Scribe", image: avatar || "🦁", bio }),
      })
      if (!res.ok) throw new Error("failed")
      return res.json()
    },
    onSuccess: () => {
      sfx.correct()
      haptics.light()
      setEditing(false)
      refreshApp()
      void qc.invalidateQueries({ queryKey: ["profile"] })
    },
  })

  const toggleSetting = useMutation({
    mutationFn: async (body: { soundOn?: boolean; hapticsOn?: boolean }) => {
      const res = await fetch("/api/settings", { method: "POST", body: JSON.stringify(body) })
      return res.json()
    },
    onSuccess: (d: { soundOn: boolean; hapticsOn: boolean }) => {
      setSound(d.soundOn)
      setHaptics(d.hapticsOn)
    },
  })

  // v11.5 — goal agency: the learner sizes their own daily portion.
  // Auto-chosen goals beat assigned ones (self-determination research);
  // the engine still re-sizes nudge thresholds around the choice.
  const setGoal = useMutation({
    mutationFn: async (dailyGoal: number | null) => {
      const res = await fetch("/api/settings", { method: "POST", body: JSON.stringify({ dailyGoal }) })
      if (!res.ok) throw new Error("failed")
      return res.json() as Promise<{ ok: boolean; dailyGoal: number | null }>
    },
    onSuccess: () => {
      sfx.correct()
      haptics.light()
      refreshApp()
      void qc.invalidateQueries({ queryKey: ["profile"] })
      void qc.invalidateQueries({ queryKey: ["bootstrap"] })
    },
  })

  if (isLoading || !data) {
    return (
      <div className="p-8 flex flex-col items-center gap-3">
        <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 1.4, repeat: Infinity }} className="text-5xl">
          👤
        </motion.div>
        <p className="font-black text-muted-foreground">Reading your ledger…</p>
      </div>
    )
  }

  return (
    <div className="p-3 sm:p-5 max-w-2xl mx-auto pb-10">
      {/* the Scribe's Ledger — fully transparent personalization */}
      <InsightsPanel />
      {/* identity card */}
      <div className="bg-white rounded-3xl border-2 border-paper-border shadow-[0_5px_0_#e8e0c8] p-5 mb-4">
        {!editing ? (
          <div className="flex items-center gap-4">
            {parseAvatar(data.avatar) ? (
              <button
                onClick={() => {
                  sfx.tap()
                  haptics.tap()
                  setView("avatar")
                }}
                className="relative group shrink-0"
                aria-label="Customize avatar"
              >
                <AvatarSvg config={parseAvatar(data.avatar)!} size={72} />
                <span className="absolute -bottom-1 -right-1 bg-duo-purple text-white rounded-full p-1.5 opacity-90 group-hover:scale-110 transition-transform">
                  <Palette className="w-3.5 h-3.5" />
                </span>
              </button>
            ) : (
              <button
                onClick={() => {
                  sfx.tap()
                  setView("avatar")
                }}
                className="w-[72px] h-[72px] rounded-2xl bg-secondary grid place-items-center text-3xl relative group shrink-0"
                aria-label="Create avatar"
              >
                {data.image}
                <span className="absolute -bottom-1 -right-1 bg-duo-purple text-white rounded-full p-1.5 opacity-90">
                  <Palette className="w-3.5 h-3.5" />
                </span>
              </button>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-black leading-tight truncate">{data.name}</h1>
              <p className="font-bold text-muted-foreground text-sm">
                Level {data.level} · {data.chaptersRead} chapters read · {data.friends} friends
              </p>
              {data.bio && <p className="text-xs font-bold text-muted-foreground/80 truncate mt-0.5">{data.bio}</p>}
            </div>
            <button
              onClick={() => {
                sfx.tap()
                haptics.tap()
                setName(data.name)
                setBio(data.bio || "")
                setAvatar(data.image)
                setEditing(true)
              }}
              className="btn3d bg-white border-2 border-paper-border shadow-[0_3px_0_#e8e0c8] p-2.5"
              aria-label="Edit profile"
            >
              <Pencil className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div>
            <label className="block font-extrabold text-sm mb-1.5">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={24}
              className="w-full bg-secondary border-2 border-paper-border rounded-xl px-4 py-2.5 font-extrabold focus:outline-none focus:border-duo-green mb-3"
            />
            <label className="block font-extrabold text-sm mb-1.5">Bio (shown on your posts)</label>
            <input
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={140}
              placeholder="Learning Greek and loving Psalms…"
              className="w-full bg-secondary border-2 border-paper-border rounded-xl px-4 py-2.5 font-semibold text-sm focus:outline-none focus:border-duo-green mb-3"
            />
            <p className="font-extrabold text-sm mb-2">Emoji (fallback picture)</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {AVATARS.map((a) => (
                <button
                  key={a}
                  onClick={() => setAvatar(a)}
                  className={`w-10 h-10 rounded-xl text-xl grid place-items-center border-2 ${
                    avatar === a ? "border-duo-green bg-duo-green/10 scale-105" : "border-paper-border"
                  }`}
                  aria-label={`avatar ${a}`}
                >
                  {a}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => save.mutate()}
                disabled={save.isPending}
                className="btn3d bg-duo-green text-white shadow-[0_3px_0_#46a302] py-2.5 px-5 flex-1 flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" /> Save
              </button>
              <button onClick={() => setEditing(false)} className="btn3d bg-white border-2 border-paper-border shadow-[0_3px_0_#e8e0c8] py-2.5 px-5">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* level progress */}
        <div className="mt-4">
          <div className="flex justify-between text-xs font-black mb-1">
            <span>Level {data.level}</span>
            <span className="text-muted-foreground">{data.levelPercent}% to next</span>
          </div>
          <div className="h-3.5 rounded-full bg-[#eee6cd] overflow-hidden">
            <motion.div
              className="h-full bg-duo-green rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${data.levelPercent}%` }}
              transition={{ type: "spring", stiffness: 80, damping: 18 }}
            />
          </div>
        </div>
      </div>

      {/* Scroll Pro — membership / upgrade */}
      <PlanCard />

      {/* church plan — the B2B membership (pilot program) */}
      <ChurchPlanCard />

      {/* stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <Stat icon={<Flame className="w-5 h-5" />} color="#E4453D" label="Day streak" value={data.streak} delay={0.05} />
        <Stat icon={<Zap className="w-5 h-5" />} color="#D9A400" label="Total XP" value={data.totalXp} delay={0.1} />
        <Stat icon={<BookOpen className="w-5 h-5" />} color="#0F8A80" label="Lessons" value={data.lessonsCompleted} delay={0.15} />
        <Stat icon={<BookOpenCheck className="w-5 h-5" />} color="#9B5DE5" label="Chapters read" value={data.chaptersRead} delay={0.2} />
        <Stat icon={<Star className="w-5 h-5" />} color="#D97706" label="Perfect lessons" value={data.perfectLessons} delay={0.25} />
        <Stat icon={<Target className="w-5 h-5" />} color="#58A700" label="Avg accuracy" value={`${data.avgAccuracy}%`} delay={0.3} />
        <Stat icon={<Check className="w-5 h-5" />} color="#8B5E3C" label="Quests done" value={data.questsCompleted} delay={0.35} />
        <Stat icon={<Users className="w-5 h-5" />} color="#E4453D" label="Friends" value={data.friends} delay={0.4} />
      </div>

      {/* v11.5 — the daily goal picker: your portion, your call.
          Small (20) / Steady (50) / Intense (100), or let the engine size it. */}
      <div className="bg-white rounded-3xl border-2 border-paper-border shadow-[0_5px_0_#e8e0c8] p-5 mb-4">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-black">Daily goal</h2>
          <span className="text-[10px] font-black text-duo-green-dark bg-duo-green/10 rounded-full px-2 py-0.5">CHOOSE YOUR PORTION</span>
        </div>
        <p className="text-xs font-bold text-muted-foreground mb-3">
          Goals you pick yourself are the ones that stick. Change it anytime — the Academy adapts.
        </p>
        <div className="grid grid-cols-3 gap-2.5 mb-2.5">
          {[
            { v: 20, label: "Casual", note: "~1 lesson a day", emoji: "🌱" },
            { v: 50, label: "Steady", note: "~2 lessons a day", emoji: "🌿" },
            { v: 100, label: "Intense", note: "~4 lessons a day", emoji: "🌳" },
          ].map((g) => {
            const active = data.dailyGoal === g.v
            return (
              <motion.button
                key={g.v}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (!active) setGoal.mutate(g.v)
                }}
                disabled={setGoal.isPending}
                className={`rounded-2xl border-2 p-3 text-center transition-colors disabled:opacity-60 ${
                  active
                    ? "border-duo-green bg-duo-green/10 shadow-[0_3px_0_#46a302]"
                    : "border-paper-border hover:border-duo-green/50 shadow-[0_3px_0_#e8e0c8]"
                }`}
                aria-pressed={active}
                aria-label={`Daily goal: ${g.label}, ${g.v} XP`}
              >
                <span className="block text-2xl mb-0.5">{g.emoji}</span>
                <span className={`block font-black text-sm leading-tight ${active ? "text-duo-green-dark" : ""}`}>{g.label}</span>
                <span className="block text-[11px] font-black tabular-nums">{g.v} XP</span>
                <span className="block text-[10px] font-bold text-muted-foreground leading-tight mt-0.5">{g.note}</span>
              </motion.button>
            )
          })}
        </div>
        <button
          onClick={() => {
            if (data.dailyGoal !== null) setGoal.mutate(null)
          }}
          disabled={setGoal.isPending}
          className="text-xs font-black text-muted-foreground hover:text-foreground underline underline-offset-2 disabled:opacity-60"
        >
          {data.dailyGoal === null
            ? "✓ Papy sizes it for you (engine-tuned, ~50 XP)"
            : "Let Papy size it for me (engine-tuned)"}
        </button>
      </div>

      {/* weekly activity — Advanced stats (Scroll Pro) */}
      {data.plan !== "free" ? (
      <div className="bg-white rounded-3xl border-2 border-paper-border shadow-[0_5px_0_#e8e0c8] p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-black">This week&apos;s study</h2>
          <span className="text-[10px] font-black text-amber-600 bg-amber-100 rounded-full px-2 py-0.5">PRO · 2× XP WEEKENDS</span>
        </div>
        <div className="flex items-end justify-between gap-2 h-28">
          {data.history.map((h, i) => {
            const max = Math.max(10, ...data.history.map((x) => x.xp))
            const hPct = Math.max(4, Math.round((h.xp / max) * 100))
            const active = h.xp > 0
            return (
              <div key={h.day} className="flex-1 flex flex-col items-center gap-1.5">
                <motion.div
                  className={`w-full rounded-t-lg ${active ? "bg-duo-green" : "bg-[#eee6cd]"}`}
                  initial={{ height: 0 }}
                  animate={{ height: `${hPct}%` }}
                  transition={{ delay: 0.1 + i * 0.06, type: "spring", stiffness: 120, damping: 16 }}
                  title={`${h.xp} XP · ${h.lessons} lessons`}
                />
                <span className="text-[10px] font-black text-muted-foreground">{data.days[i]}</span>
              </div>
            )
          })}
        </div>
        <p className="text-[11px] font-bold text-muted-foreground mt-3">Pro perk: every Saturday &amp; Sunday counts double XP — it&apos;s already applied to this chart.</p>
      </div>
      ) : (
      <button
        onClick={() => {
          sfx.tap()
          openPaywall("profile")
        }}
        className="w-full text-left bg-white rounded-3xl border-2 border-dashed border-paper-border shadow-[0_5px_0_#e8e0c8] p-5 mb-4"
      >
        <div className="flex items-center gap-3">
          <span className="w-11 h-11 shrink-0 rounded-2xl bg-amber-100 grid place-items-center">
            <Crown className="w-6 h-6 text-amber-600" />
          </span>
          <div className="flex-1">
            <h2 className="font-black">Advanced stats &amp; mastery maps</h2>
            <p className="text-xs font-bold text-muted-foreground mt-0.5">Weekly XP trends, accuracy curves and 2× XP weekends — unlock with Scroll Pro.</p>
          </div>
        </div>
      </button>
      )}

      {/* courses */}
      <div className="bg-white rounded-3xl border-2 border-paper-border shadow-[0_5px_0_#e8e0c8] p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-black">My courses</h2>
          <button
            onClick={() => {
              sfx.tap()
              setView("courses")
            }}
            className="text-sm font-extrabold text-duo-green-dark hover:underline"
          >
            Switch course
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {data.courses.map((c) => {
            const pct = c.totalLessons > 0 ? Math.round((c.completedLessons / c.totalLessons) * 100) : 0
            return (
              <div key={c.id} className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl grid place-items-center text-xl" style={{ backgroundColor: c.color + "22" }}>
                  {c.emoji}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-sm font-black mb-1">
                    <span className="truncate">{c.title}</span>
                    <span className="text-muted-foreground tabular-nums">
                      {c.completedLessons}/{c.totalLessons}
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-[#eee6cd] overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: c.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ type: "spring", stiffness: 90, damping: 18 }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* achievements */}
      <div className="bg-white rounded-3xl border-2 border-paper-border shadow-[0_5px_0_#e8e0c8] p-5 mb-4">
        <h2 className="font-black mb-3">Achievements</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {data.achievements.map((a, i) => {
            const nextTierIdx = Math.min(a.tier, a.tiers.length - 1)
            const nextTarget = a.tiers[nextTierIdx]
            const prevTarget = a.tier > 0 ? a.tiers[a.tier - 1] : 0
            const span = Math.max(1, nextTarget - prevTarget)
            const pct = a.tier >= a.tiers.length ? 100 : Math.min(100, Math.round(((a.value - prevTarget) / span) * 100))
            const tierName = a.tier > 0 ? a.tierNames[a.tier - 1] : null
            return (
              <motion.div
                key={a.slug}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`rounded-2xl border-2 p-3.5 ${a.tier > 0 ? "border-duo-gold/60 bg-duo-gold/[0.07]" : "border-paper-border"}`}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-2xl ${a.tier > 0 ? "" : "grayscale opacity-50"}`}>{achievementEmoji(a.icon)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-black leading-tight">
                      {a.title}
                      {tierName && <span className="text-duo-gold-dark"> · {tierName}</span>}
                    </p>
                    <p className="text-xs font-bold text-muted-foreground">{a.description}</p>
                  </div>
                  {a.tier > 0 && (
                    <button
                      onClick={() => {
                        sfx.tap()
                        haptics.tap()
                        setShareDraft({
                          kind: "achievement",
                          title: `${a.title} · ${tierName}`,
                          subtitle: a.description,
                          icon: achievementEmoji(a.icon),
                          color: "#D97706",
                        })
                        setView("community")
                      }}
                      className="p-2 rounded-xl hover:bg-secondary text-muted-foreground hover:text-duo-purple shrink-0"
                      aria-label={`Share achievement ${a.title}`}
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  )}
                  <span className="text-xs font-black text-muted-foreground">
                    {a.tier}/{a.tiers.length}
                  </span>
                </div>
                <div className="mt-2.5 h-2.5 rounded-full bg-[#eee6cd] overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${a.tier > 0 ? "bg-duo-gold" : "bg-muted-foreground/50"}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ delay: 0.15, type: "spring", stiffness: 100, damping: 18 }}
                  />
                </div>
                <p className="text-[11px] font-black text-muted-foreground mt-1">
                  {a.tier >= a.tiers.length
                    ? "Max tier achieved! 🏅"
                    : `${formatValue(a.value, a.metric)} / ${formatValue(nextTarget, a.metric)}`}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* explore — the consolidated navigation (Quests, Leagues, Shop, Community…) */}
      <ExploreMenu />

      {/* doctrinal foundation — what every course is taught from */}
      <StatementOfFaith />

      {/* v11: animated widgets for phone & laptop */}
      <WidgetGallery />

      {/* v11: Siri / Android Assistant voice bridge */}
      <AssistantSetup />

      {/* give-a-month-get-a-month referral loop */}
      <ReferralCard />

      {/* gift subscriptions — redeem + the sent ledger */}
      <GiftCard />

      {/* notifications & email journeys */}
      <NotificationPrefsCard />

      {/* account — sign-in state, sign out, guest → account upgrade */}
      <AccountCard />

      {/* settings */}
      <div className="bg-white rounded-3xl border-2 border-paper-border shadow-[0_5px_0_#e8e0c8] p-5">
        <h2 className="font-black mb-3">Settings</h2>
        <div className="flex flex-col gap-2">
          <SettingRow
            icon={<Volume2 className="w-5 h-5" />}
            label="Sound effects"
            on={soundOn}
            onToggle={() => {
              toggleSetting.mutate({ soundOn: !soundOn })
              if (!soundOn) sfx.correct()
            }}
          />
          <SettingRow
            icon={<Vibrate className="w-5 h-5" />}
            label="Haptics"
            on={hapticsOn}
            onToggle={() => {
              toggleSetting.mutate({ hapticsOn: !hapticsOn })
              if (!hapticsOn) haptics.light()
            }}
          />
          {/* v11.4: motion is a device-level preference (a phone may need
              calm, a desktop may not) — stored per device, like Duolingo */}
          <SettingRow
            icon={<Sparkles className="w-5 h-5" />}
            label="Animations"
            on={motionPref === "full"}
            onToggle={() => {
              const next = motionPref === "full" ? "reduced" : "full"
              setMotionPref(next)
              if (next === "full") sfx.correct()
            }}
          />
          {osReduced && motionPref === "full" && (
            <p className="text-xs font-bold text-muted-foreground px-1 -mt-1">
              Your system currently asks for reduced motion — turning this on keeps full animation on this device.
            </p>
          )}
          <button
            className="flex items-center gap-3 bg-secondary rounded-2xl px-4 py-3 font-extrabold hover:bg-paper-border/50 transition-colors"
            onClick={async () => {
              haptics.tap()
              const perm = await requestNotificationPermission()
              pushToast(
                perm === "granted" ? "Notifications on! 🔔" : "Notifications unavailable",
                perm === "granted"
                  ? "You'll hear from us when quests complete or streaks are at risk."
                  : "No worries — in-app notifications still work.",
                perm === "granted" ? "🔔" : "🔕"
              )
              if (perm === "granted") {
                fireBrowserNotification({
                  title: "Notifications enabled! 🔔",
                  body: "We'll nudge you when your streak needs saving.",
                })
              }
            }}
          >
            <BellRing className="w-5 h-5" />
            <span className="flex-1 text-left">Browser notifications</span>
            <span className="text-duo-green-dark text-sm">Enable</span>
          </button>
        </div>
      </div>

      <div className="mt-6 flex flex-col items-center gap-1">
        <Mascot mood="happy" size={72} />
        <p className="text-xs font-bold text-muted-foreground">
          “Your word is a lamp to my feet and a light to my path.” — Psalm 119:105
        </p>
      </div>
    </div>
  )
}

function Stat({ icon, color, label, value, delay }: { icon: React.ReactNode; color: string; label: string; value: string | number; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-2xl border-2 border-paper-border p-3.5 flex items-center gap-3"
    >
      <span className="w-10 h-10 rounded-xl grid place-items-center text-white shrink-0" style={{ backgroundColor: color }}>
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-lg font-black leading-tight tabular-nums">{value}</p>
        <p className="text-[11px] font-black uppercase tracking-wide text-muted-foreground">{label}</p>
      </div>
    </motion.div>
  )
}

function SettingRow({ icon, label, on, onToggle }: { icon: React.ReactNode; label: string; on: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center gap-3 bg-secondary rounded-2xl px-4 py-3">
      {icon}
      <span className="font-extrabold flex-1">{label}</span>
      <button
        role="switch"
        aria-checked={on}
        aria-label={label}
        onClick={onToggle}
        className={`w-13 h-7 rounded-full transition-colors relative shrink-0 ${on ? "bg-duo-green" : "bg-muted-foreground/40"}`}
        style={{ width: 52 }}
      >
        <motion.span
          layout
          transition={{ type: "spring", stiffness: 500, damping: 32 }}
          className="absolute top-1 w-5 h-5 rounded-full bg-white shadow"
          style={{ left: on ? 27 : 5 }}
        />
      </button>
    </div>
  )
}

function achievementEmoji(icon: string): string {
  const map: Record<string, string> = {
    Flame: "🔥",
    Sparkles: "✨",
    BookOpen: "📖",
    Star: "⭐",
    PenLine: "✍️",
    GraduationCap: "🎓",
    Target: "🎯",
    BookOpenCheck: "📖",
    Users: "🤝",
    UserPlus: "🤝",
  }
  return map[icon] ?? "🏅"
}

function formatValue(v: number, metric: string): string {
  if (metric === "streak" || metric === "lessons" || metric === "quests" || metric === "challenges") return String(v)
  if (metric === "courses" || metric === "chapters" || metric === "friends" || metric === "community") return String(v)
  return v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)
}
