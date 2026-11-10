"use client"

import { motion } from "framer-motion"
import { House, BookOpenText, Users, UserRound, Trophy, Target, ShoppingBag, CircleUserRound, GraduationCap, Drama, Sprout, Crown, ShieldCheck } from "lucide-react"
import { useAppStore, type View } from "@/lib/client/store"
import { useAuthStore } from "@/lib/client/auth"
import { sfx } from "@/lib/client/sound"
import { haptics } from "@/lib/client/haptics"

const NAV: { view: View; label: string; icon: typeof House; color: string }[] = [
  { view: "learn", label: "Learn", icon: House, color: "#0F8A80" },
  { view: "stories", label: "Stories", icon: Drama, color: "#EC4899" },
  { view: "bible", label: "Bible", icon: BookOpenText, color: "#9B5DE5" },
  { view: "growth", label: "Growth", icon: Sprout, color: "#65A30D" },
  { view: "community", label: "Community", icon: Users, color: "#E4453D" },
  { view: "friends", label: "Friends", icon: UserRound, color: "#D97706" },
  { view: "leaderboard", label: "Leagues", icon: Trophy, color: "#D97706" },
  { view: "quests", label: "Quests", icon: Target, color: "#9B5DE5" },
  { view: "shop", label: "Shop", icon: ShoppingBag, color: "#58A700" },
  { view: "profile", label: "Profile", icon: CircleUserRound, color: "#8B5E3C" },
  { view: "courses", label: "My courses", icon: GraduationCap, color: "#0F766E" },
]

// ── consolidated mobile tab bar: 4 tabs — the immediate-use surfaces only
//    (study · read · compete · hub). Stories, Quests, Shop, Community,
//    Friends, Growth Hub, My courses, Practice Hub AND the staff admin
//    section (home of the church dashboard since v9) live in Profile →
//    "Explore", one tap away.
const MOBILE_NAV = NAV.filter((n) => ["learn", "bible", "leaderboard", "profile"].includes(n.view))

export function Sidebar({ view, isPro }: { view: View; isPro?: boolean }) {
  const setView = useAppStore((s) => s.setView)
  const openPaywall = useAppStore((s) => s.openPaywall)
  const isAdmin = useAuthStore((s) => s.session?.role === "admin")
  return (
    <nav className="hidden lg:flex flex-col gap-1 w-60 shrink-0 p-4 sticky top-16 h-[calc(100vh-4rem)]" aria-label="Main">
      {NAV.map((item) => {
        const active = view === item.view
        return (
          <motion.button
            key={item.view}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              sfx.tap()
              haptics.tap()
              setView(item.view)
            }}
            className={`flex items-center gap-3 px-3 py-3 rounded-2xl border-2 font-extrabold text-[15px] transition-colors ${
              active
                ? "bg-[#58cc0a]/10 border-duo-green/40 text-duo-green-dark"
                : "bg-transparent border-transparent hover:bg-white hover:border-paper-border"
            }`}
            style={active ? { color: item.color, backgroundColor: item.color + "14", borderColor: item.color + "55" } : undefined}
            aria-current={active ? "page" : undefined}
          >
            <item.icon className="w-7 h-7" style={{ color: active ? item.color : "#A5A08A" }} />
            {item.label}
          </motion.button>
        )
      })}
      {/* staff admin — the church dashboard's new home (v9), role-gated */}
      {isAdmin && (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            sfx.tap()
            haptics.tap()
            setView("admin")
          }}
          className={`flex items-center gap-3 px-3 py-3 rounded-2xl border-2 font-extrabold text-[15px] transition-colors ${
            view === "admin"
              ? "border-[#0F766E]/55 bg-[#0F766E]/10"
              : "bg-transparent border-transparent hover:bg-white hover:border-paper-border"
          }`}
          style={view === "admin" ? { color: "#0F766E" } : undefined}
          aria-current={view === "admin" ? "page" : undefined}
        >
          <ShieldCheck className="w-7 h-7" style={{ color: view === "admin" ? "#0F766E" : "#A5A08A" }} />
          Admin
        </motion.button>
      )}
      {!isPro && (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            sfx.tap()
            haptics.tap()
            openPaywall("general")
          }}
          className="flex items-center gap-3 px-3 py-3 rounded-2xl border-2 border-duo-gold/50 bg-duo-gold/10 font-extrabold text-[15px] text-duo-gold-dark hover:bg-duo-gold/20 transition-colors"
        >
          <Crown className="w-7 h-7" /> Go Pro
        </motion.button>
      )}
      <div className="mt-auto p-3 text-xs font-bold text-muted-foreground/70">
        📜 Scroll Academy · free & open study
      </div>
    </nav>
  )
}

export function BottomNav({ view }: { view: View }) {
  const setView = useAppStore((s) => s.setView)
  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t-2 border-paper-border pb-[env(safe-area-inset-bottom)]"
      aria-label="Main"
    >
      <div className="grid grid-cols-4">
        {MOBILE_NAV.map((item) => {
          const active = view === item.view
          return (
            <button
              key={item.view}
              onClick={() => {
                sfx.tap()
                haptics.tap()
                setView(item.view)
              }}
              className="relative flex flex-col items-center gap-0.5 py-2.5 min-h-[56px] justify-center"
              aria-current={active ? "page" : undefined}
              aria-label={item.label}
            >
              {active && (
                <motion.span
                  layoutId="bottomnav-pill"
                  className="absolute inset-x-2 inset-y-1 rounded-xl -z-10"
                  style={{ backgroundColor: item.color + "1f" }}
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <item.icon className="w-6 h-6" style={{ color: active ? item.color : "#A5A08A" }} />
              <span
                className="text-[10px] font-black uppercase tracking-wide"
                style={{ color: active ? item.color : "#A5A08A" }}
              >
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
