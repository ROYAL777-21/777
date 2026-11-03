"use client"

import { useEffect, useState } from "react"
import { QueryClient, QueryClientProvider, useQuery, useQueryClient } from "@tanstack/react-query"
import { AnimatePresence, motion } from "framer-motion"
import { useAppStore, type View } from "@/lib/client/store"
import { sfx } from "@/lib/client/sound"
import { haptics } from "@/lib/client/haptics"
import { fireBrowserNotification } from "@/lib/client/notify"
import type { BootstrapPayload } from "@/lib/types"
import { TopBar } from "./TopBar"
import { Sidebar, BottomNav } from "./Sidebar"
import { Onboarding } from "./Onboarding"
import { LearnView } from "./LearnView"
import { LessonView } from "./LessonView"
import { StoriesView } from "./StoriesView"
import { LeaderboardView } from "./LeaderboardView"
import { QuestsView } from "./QuestsView"
import { ShopView } from "./ShopView"
import { ProfileView } from "./ProfileView"
import { CoursesView } from "./CoursesView"
import { PracticeHub } from "./PracticeHub"
import { BibleView } from "./BibleView"
import { FriendsView } from "./FriendsView"
import { CommunityView } from "./CommunityView"
import { AvatarBuilder } from "./AvatarBuilder"
import { DailyQuizOverlay } from "./DailyQuizOverlay"
import { PlacementOverlay } from "./PlacementOverlay"
import { GrowthView } from "./GrowthView"

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
      <ScrollAppInner />
    </QueryClientProvider>
  )
}

function ScrollAppInner() {
  const { data, isLoading, isError } = useQuery<BootstrapPayload>({
    queryKey: ["bootstrap"],
    refetchOnWindowFocus: false,
  })
  const view = useAppStore((s) => s.view)
  const inLesson = useAppStore((s) => s.inLesson)
  const inQuiz = useAppStore((s) => s.inQuiz)
  const placementCourse = useAppStore((s) => s.placementCourse)
  const toastQueue = useAppStore((s) => s.toastQueue)
  const dismissToast = useAppStore((s) => s.dismissToast)
  const setSound = useAppStore((s) => s.setSound)
  const setHaptics = useAppStore((s) => s.setHaptics)

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
    return <Onboarding courses={data.courses} />
  }

  const lessonOverlay = inLesson ? <LessonView key={inLesson.lessonId} session={inLesson} /> : null
  const quizOverlay = inQuiz ? <DailyQuizOverlay key="daily-quiz" /> : null
  const placementOverlay = placementCourse ? <PlacementOverlay key={`placement-${placementCourse}`} courseId={placementCourse} /> : null

  return (
    <div className="parchment-bg min-h-screen flex flex-col">
      <TopBar user={data.user} activeCourse={data.activeCourse} />

      <div className="flex flex-1">
        {/* desktop sidebar */}
        <Sidebar view={view} />
        {/* main */}
        <main className="flex-1 min-w-0 pb-24 lg:pb-10 max-w-[1100px] mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
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
      <div className="fixed bottom-24 lg:bottom-6 right-4 z-[90] flex flex-col gap-2 w-[min(92vw,360px)]">
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
}
