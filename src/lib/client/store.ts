"use client"

import { create } from "zustand"
import { setSoundEnabled } from "@/lib/client/sound"
import { setHapticsEnabled } from "@/lib/client/haptics"

export type View =
  | "learn"
  | "stories"
  | "bible"
  | "community"
  | "friends"
  | "practice-hub"
  | "leaderboard"
  | "quests"
  | "shop"
  | "profile"
  | "avatar"
  | "courses"
  | "growth"

interface LessonSession {
  lessonId: string // "practice" for practice sessions
  title: string
}

export type ShareDraft = {
  kind: string // achievement | streak | verse | plan | course
  title: string
  subtitle: string
  icon: string
  color: string
} | null

interface AppState {
  view: View
  inLesson: LessonSession | null
  inQuiz: boolean
  placementCourse: string | null
  soundOn: boolean
  hapticsOn: boolean
  toastQueue: { id: number; title: string; body: string; icon?: string }[]
  /** pending achievement/verse card to attach to the next community post */
  shareDraft: ShareDraft
  /** open the bible reader at a specific chapter (e.g. from a reading plan) */
  bibleTarget: { bookId: string; chapter: number } | null
  setView: (v: View) => void
  startLesson: (lessonId: string, title: string) => void
  endLesson: () => void
  startQuiz: () => void
  endQuiz: () => void
  startPlacement: (courseId: string) => void
  endPlacement: () => void
  setSound: (v: boolean) => void
  setHaptics: (v: boolean) => void
  pushToast: (title: string, body: string, icon?: string) => void
  dismissToast: (id: number) => void
  setShareDraft: (d: ShareDraft) => void
  openBible: (bookId: string, chapter: number) => void
  clearBibleTarget: () => void
}

export const useAppStore = create<AppState>((set) => ({
  view: "learn",
  inLesson: null,
  inQuiz: false,
  placementCourse: null,
  soundOn: true,
  hapticsOn: true,
  toastQueue: [],
  shareDraft: null,
  bibleTarget: null,
  setView: (v) => set({ view: v }),
  startLesson: (lessonId, title) => set({ inLesson: { lessonId, title } }),
  endLesson: () => set({ inLesson: null }),
  startQuiz: () => set({ inQuiz: true }),
  endQuiz: () => set({ inQuiz: false }),
  startPlacement: (courseId) => set({ placementCourse: courseId }),
  endPlacement: () => set({ placementCourse: null }),
  setSound: (v) => {
    setSoundEnabled(v)
    set({ soundOn: v })
  },
  setHaptics: (v) => {
    setHapticsEnabled(v)
    set({ hapticsOn: v })
  },
  pushToast: (title, body, icon) =>
    set((s) => ({ toastQueue: [...s.toastQueue.slice(-3), { id: Date.now() + Math.random(), title, body, icon }] })),
  dismissToast: (id) => set((s) => ({ toastQueue: s.toastQueue.filter((t) => t.id !== id) })),
  setShareDraft: (d) => set({ shareDraft: d }),
  openBible: (bookId, chapter) => set({ view: "bible", bibleTarget: { bookId, chapter } }),
  clearBibleTarget: () => set({ bibleTarget: null }),
}))

/** normalize typed answers client-side (mirrors server) */
export function normalizeAnswer(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[.,!?;:'"’‘“”()\[\]]/g, "")
    .replace(/\s+/g, " ")
}

/** seeded shuffle for stable UI randomness */
export function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr]
  let s = seed
  const rand = () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
