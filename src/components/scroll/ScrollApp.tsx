"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { QueryClient, QueryClientProvider, useQuery, useQueryClient } from "@tanstack/react-query"
import { AnimatePresence, motion } from "framer-motion"
import { useAppStore, type View } from "@/lib/client/store"
import { sfx } from "@/lib/client/sound"
import { haptics } from "@/lib/client/haptics"
import { fireBrowserNotification } from "@/lib/client/notify"
import { useJourneys } from "@/lib/client/useJourneys"
import { engineTrack, engineTrackAppOpen, initEngineTracking, type EngineStateClient } from "@/lib/client/engine"
import type { BootstrapPayload } from "@/lib/types"
import { spring, readMotionPref } from "@/lib/motion"
import { MotionPrefsProvider } from "@/lib/motion/MotionPrefs"
import { TopBar } from "./TopBar"
import { Sidebar, BottomNav } from "./Sidebar"
import { Onboarding } from "./Onboarding"
import { LearnView } from "./LearnView"
import { LessonView } from "./LessonView"
import { PaywallModal } from "./PaywallModal"
import { AdventBanner } from "./AdventBanner"
import { AuthFlow } from "./AuthFlow"
import { SplashGate } from "./SplashGate"
import { Assistant } from "./Assistant" // v11: Ask Papy — Siri/Assistant bridge + in-app voice companion
import { useAuthStore } from "@/lib/client/auth"
import { loadingVerseOfTheDay } from "@/lib/scripture"

// heavy views load on demand — keeps first paint fast on mobile
const StoriesView = dynamic(() => import("./StoriesView").then((m) => m.StoriesView), {
  loading: () => <ViewSkeleton />,
})
const BibleView = dynamic(() => import("./BibleView").then((m) => m.BibleView), {
  loading: () => <ViewSkeleton />,
})
const CommunityView = dynamic(() => import("./CommunityView").then((m) => m.CommunityView), {
  loading: () => <ViewSkeleton />,
})
const FriendsView = dynamic(() => import("./FriendsView").then((m) => m.FriendsView), {
  loading: () => <ViewSkeleton />,
})
const PracticeHub = dynamic(() => import("./PracticeHub").then((m) => m.PracticeHub), {
  loading: () => <ViewSkeleton />,
})
const LeaderboardView = dynamic(() => import("./LeaderboardView").then((m) => m.LeaderboardView), {
  loading: () => <ViewSkeleton />,
})
const QuestsView = dynamic(() => import("./QuestsView").then((m) => m.QuestsView), {
  loading: () => <ViewSkeleton />,
})
const ShopView = dynamic(() => import("./ShopView").then((m) => m.ShopView), {
  loading: () => <ViewSkeleton />,
})
const ProfileView = dynamic(() => import("./ProfileView").then((m) => m.ProfileView), {
  loading: () => <ViewSkeleton />,
})
const CoursesView = dynamic(() => import("./CoursesView").then((m) => m.CoursesView), {
  loading: () => <ViewSkeleton />,
})
const AvatarBuilder = dynamic(() => import("./AvatarBuilder").then((m) => m.AvatarBuilder), {
  loading: () => <ViewSkeleton />,
})
const DailyQuizOverlay = dynamic(() => import("./DailyQuizOverlay").then((m) => m.DailyQuizOverlay), {
  loading: () => <ViewSkeleton />,
})
const PlacementOverlay = dynamic(() => import("./PlacementOverlay").then((m) => m.PlacementOverlay), {
  loading: () => <ViewSkeleton />,
})
const GrowthView = dynamic(() => import("./GrowthView").then((m) => m.GrowthView), {
  loading: () => <ViewSkeleton />,
})
// v9: the church dashboard lives inside AdminView (Staff admin → Churches);
// the standalone "church" view was removed — one door, one truth.
const AdminView = dynamic(() => import("./AdminView").then((m) => m.AdminView), {
  loading: () => <ViewSkeleton />,
})

function ViewSkeleton() {
  return (
    <div className="p-8 flex flex-col items-center gap-3">
      <motion.div
        animate={{ y: [0, -8, 0], rotate: [0, -7, 7, 0], scale: [1, 1.06, 1] }}
        transition={{ duration: 1.3, repeat: Infinity, ease: "easeInOut" }}
        className="text-4xl"
      >
        📜
      </motion.div>
      <p className="font-black text-sm text-muted-foreground">Unrolling…</p>
    </div>
  )
}

export function ScrollApp() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            staleTime: 15_000,
            queryFn: async ({ queryKey }): Promise<unknown> => {
              const res = await fetch(`/api/${queryKey[0]}`)
              if (!res.ok) throw new Error(`request failed: ${String(queryKey[0])}`)
              return res.json()
            },
          },
        },
      })
  )
  return (
    <QueryClientProvider client={queryClient}>
      <MotionPrefsProvider>
        <ScrollAppInner />
      </MotionPrefsProvider>
    </QueryClientProvider>
  )
}

function ScrollAppInner() {
  // ── auth gate (v9): hydrate the session once, then gate ──
  const hydrateAuth = useAuthStore((s) => s.hydrate)
  const session = useAuthStore((s) => s.session)
  const guest = useAuthStore((s) => s.guest)
  const authHydrated = useAuthStore((s) => s.hydrated)
  useEffect(() => {
    hydrateAuth()
  }, [hydrateAuth])

  // ── splash (v9): the parting of the sea, once per lifetime ──
  const [splash, setSplash] = useState<"pending" | "playing" | "done">("pending")
  useEffect(() => {
    // read storage off the render path, then resolve (React 19 rule:
    // no synchronous setState inside effects)
    const t = setTimeout(() => {
      let seen = false
      try {
        seen = window.localStorage.getItem("sb_splash_seen_v1") === "1"
      } catch {
        seen = true // storage blocked — never trap the viewer
      }
      const reduce =
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false
      const calmPref = readMotionPref() === "reduced" // v11.4: in-app toggle skips the splash too
      setSplash(seen || reduce || calmPref ? "done" : "playing")
    }, 0)
    return () => clearTimeout(t)
  }, [])

  // the day's verse for the loading screen (stable all day — scripture.ts)
  const bootVerse = loadingVerseOfTheDay()

  const { data, isLoading, isError } = useQuery<BootstrapPayload>({
    queryKey: ["bootstrap"],
    refetchOnWindowFocus: false,
  })
  useJourneys() // timed + personal notifications & email journeys
  const view = useAppStore((s) => s.view)
  const inLesson = useAppStore((s) => s.inLesson)
  const inQuiz = useAppStore((s) => s.inQuiz)
  const placementCourse = useAppStore((s) => s.placementCourse)
  const toastQueue = useAppStore((s) => s.toastQueue)
  const dismissToast = useAppStore((s) => s.dismissToast)
  const setSound = useAppStore((s) => s.setSound)
  const setHaptics = useAppStore((s) => s.setHaptics)
  const pushToast = useAppStore((s) => s.pushToast)
  const paywallOpen = useAppStore((s) => s.paywall !== null)

  // ── the Scribe's Ledger: client tap stream ──
  const engine = useQuery<EngineStateClient>({
    queryKey: ["engine/state"],
    staleTime: 60_000,
    retry: false,
  })

  useEffect(() => {
    const cleanup = initEngineTracking()
    engineTrackAppOpen()
    return cleanup
  }, [])

  // track view changes (surface-breadth features)
  useEffect(() => {
    if (data?.activeCourse) engineTrack("view_change", { view })
  }, [view, data?.activeCourse])

  // surface ONE in-app next-best-action at a time (fatigue guardrail),
  // never during lessons/quizzes or while the paywall is open
  const shownNba = engine.data?.decisions?.find((d) => d.channel === "in_app" && d.kind !== "paywall_invite")
  useEffect(() => {
    if (!shownNba || inLesson || inQuiz || paywallOpen) return
    const dismissKey = `nba-dismissed-${shownNba.kind}-${new Date().toISOString().slice(0, 10)}`
    try {
      if (typeof window !== "undefined" && window.localStorage.getItem(dismissKey) === "1") return
    } catch {
      /* storage unavailable — proceed */
    }
    engineTrack("nba_shown", { kind: shownNba.kind, variant: shownNba.variant })
    pushToast(shownNba.title, shownNba.body, shownNba.icon)
    try {
      if (typeof window !== "undefined") window.localStorage.setItem(dismissKey, "1")
    } catch {
      /* ignore */
    }
  }, [shownNba?.kind, inLesson, inQuiz, paywallOpen, shownNba, pushToast])

  // sync settings from server
  useEffect(() => {
    if (data) {
      setSound(data.user.soundOn)
      setHaptics(data.user.hapticsOn)
    }
  }, [data?.user.soundOn, data?.user.hapticsOn, data, setSound, setHaptics])

  // in-app toast auto-dismiss + sound + haptics + browser notification
  useEffect(() => {
    if (toastQueue.length > 0) {
      const t = toastQueue[0]
      sfx.notify()
      haptics.notify()
      fireBrowserNotification({ title: t.title, body: t.body, icon: t.icon })
      const timer = setTimeout(() => dismissToast(t.id), 4600)
      return () => clearTimeout(timer)
    }
  }, [toastQueue, dismissToast])

  // the splash → sign in / sign up → onboarding chain comes before everything else
  if (!authHydrated || splash === "pending") {
    return <div className="parchment-bg min-h-dvh" />
  }
  if (splash === "playing") {
    return (
      <SplashGate
        onDone={() => {
          try {
            window.localStorage.setItem("sb_splash_seen_v1", "1")
          } catch {
            /* ignore */
          }
          setSplash("done")
        }}
      />
    )
  }
  if (!session && !guest) {
    return <AuthFlow />
  }

  if (isLoading) {
    return (
      <div className="parchment-bg min-h-screen flex flex-col items-center justify-center gap-4">
        <motion.div
          animate={{ rotate: [0, -6, 6, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 1.4, repeat: Infinity }}
          className="text-6xl"
        >
          📜
        </motion.div>
        <p className="text-lg font-extrabold text-muted-foreground">Opening the scroll…</p>
        {/* the day's verse keeps the wait worshipful, never busy (v9) */}
        <p className="text-sm font-bold text-muted-foreground/80 text-center max-w-xs">
          “{bootVerse.text}” — {bootVerse.ref}
        </p>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="parchment-bg min-h-screen flex flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="text-6xl">🕯️</div>
        <h1 className="text-2xl font-black">Something interrupted the scribe</h1>
        <p className="text-muted-foreground">Please refresh the page to try again.</p>
      </div>
    )
  }

  if (!data.activeCourse) {
    return (
      <>
        <Onboarding courses={data.courses} />
        <PaywallModal />
      </>
    )
  }

  const lessonOverlay = inLesson ? <LessonView key={inLesson.lessonId} session={inLesson} /> : null
  const quizOverlay = inQuiz ? <DailyQuizOverlay key="daily-quiz" /> : null
  const placementOverlay = placementCourse ? <PlacementOverlay key={`placement-${placementCourse}`} courseId={placementCourse} /> : null

  return (
    <div className="parchment-bg min-h-dvh flex flex-col">
      <TopBar user={data.user} activeCourse={data.activeCourse} />

      <div className="flex flex-1">
        {/* desktop sidebar */}
        <Sidebar view={view} isPro={data.user.isPro} />
        {/* main */}
        <main className="flex-1 min-w-0 pb-24 lg:pb-10 max-w-[1100px] mx-auto w-full">
          {/* the Advent/Christmas gift campaign (Nov 23 – Jan 6, learn path only) */}
          {view === "learn" && <AdventBanner />}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 18, scale: 0.995 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.995 }}
              transition={spring.juice}
            >
              {view === "learn" && <LearnView course={data.activeCourse} />}
              {view === "stories" && <StoriesView />}
              {view === "bible" && <BibleView />}
              {view === "community" && <CommunityView />}
              {view === "friends" && <FriendsView />}
              {view === "practice-hub" && <PracticeHub />}
              {view === "leaderboard" && <LeaderboardView />}
              {view === "quests" && <QuestsView />}
              {view === "shop" && <ShopView />}
              {view === "profile" && <ProfileView />}
              {view === "avatar" && <AvatarBuilder onDone={() => useAppStore.getState().setView("profile")} />}
              {view === "courses" && <CoursesView />}
              {view === "growth" && <GrowthView />}
              {view === "admin" && <AdminView />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* mobile bottom nav */}
      <BottomNav view={view} />

      {/* lesson overlay */}
      <AnimatePresence>{lessonOverlay}</AnimatePresence>

      {/* daily quiz overlay */}
      <AnimatePresence>{quizOverlay}</AnimatePresence>

      {/* placement test overlay */}
      <AnimatePresence>{placementOverlay}</AnimatePresence>

      {/* toast stack */}
      <div className="fixed bottom-24 sm:bottom-24 lg:bottom-6 right-4 z-[90] flex flex-col gap-2 w-[min(92vw,360px)]" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <AnimatePresence>
          {toastQueue.slice(-3).map((t) => (
            <motion.button
              key={t.id}
              layout
              initial={{ opacity: 0, x: 60, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
              onClick={() => dismissToast(t.id)}
              className="text-left bg-white border-2 border-paper-border rounded-2xl p-3.5 shadow-[0_4px_0_#e8e0c8] flex items-start gap-3"
            >
              <span className="text-2xl leading-none mt-0.5">{t.icon ?? "🔔"}</span>
              <span className="min-w-0">
                <span className="block font-extrabold text-sm">{t.title}</span>
                <span className="block text-sm text-muted-foreground font-semibold">{t.body}</span>
              </span>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {/* paywall (Scroll Pro) */}
      <PaywallModal />

      {/* v11: Ask Papy — floating voice assistant (Siri/Assistant deep-linkable) */}
      <Assistant />
    </div>
  )
}

/** exported for children to refetch bootstrap after mutations */
export function useRefreshApp() {
  const qc = useQueryClient()
  return () => {
    void qc.invalidateQueries({ queryKey: ["bootstrap"] })
    void qc.invalidateQueries({ queryKey: ["leaderboard"] })
    void qc.invalidateQueries({ queryKey: ["quests"] })
    void qc.invalidateQueries({ queryKey: ["shop"] })
    void qc.invalidateQueries({ queryKey: ["profile"] })
    void qc.invalidateQueries({ queryKey: ["notifications"] })
    void qc.invalidateQueries({ queryKey: ["stories"] })
    void qc.invalidateQueries({ queryKey: ["engine/state"] })
    void qc.invalidateQueries({ queryKey: ["bible"] })
  }
}

export const viewTitle: Record<View, string> = {
  learn: "Learn",
  stories: "Stories",
  bible: "The Bible",
  community: "Community",
  friends: "Friends",
  "practice-hub": "Practice",
  leaderboard: "Leagues",
  quests: "Quests",
  shop: "Shop",
  profile: "Profile",
  avatar: "Avatar",
  courses: "My courses",
  growth: "Growth Hub",
  admin: "Staff admin",
}
