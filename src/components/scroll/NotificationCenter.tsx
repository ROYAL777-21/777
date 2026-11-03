"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion"
import { Send } from "lucide-react"
import { sfx } from "@/lib/client/sound"
import { haptics } from "@/lib/client/haptics"
import { timeAgo, notificationsSupported, requestNotificationPermission, fireBrowserNotification } from "@/lib/client/notify"
import { useAppStore } from "@/lib/client/store"
import type { NotificationDTO } from "@/lib/types"

export function NotificationCenter({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qc = useQueryClient()
  const pushToast = useAppStore((s) => s.pushToast)

  const { data } = useQuery<{ notifications: NotificationDTO[]; unread: number }>({
    queryKey: ["notifications"],
  })

  const markRead = useMutation({
    mutationFn: () => fetch("/api/notifications", { method: "POST", body: JSON.stringify({ action: "readAll" }) }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["notifications"] }),
  })

  const sendTest = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/notifications", {
        method: "POST",
        body: JSON.stringify({ action: "test" }),
      })
      return res.json() as Promise<{ notification: NotificationDTO }>
    },
    onSuccess: (d) => {
      void qc.invalidateQueries({ queryKey: ["notifications"] })
      if (!fireBrowserNotification({ title: d.notification.title, body: d.notification.body, icon: "⏰" })) {
        // browser notification not available → in-app toast
        pushToast(d.notification.title, d.notification.body, "⏰")
      }
    },
  })

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[45]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.16 }}
            className="absolute right-0 top-12 z-[50] w-[min(92vw,380px)] bg-white rounded-2xl border-2 border-paper-border shadow-[0_6px_0_#e8e0c8] overflow-hidden"
            role="dialog"
            aria-label="Notifications"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b-2 border-paper-border bg-secondary">
              <h3 className="font-black">Notifications</h3>
              <button
                className="text-xs font-extrabold text-duo-green-dark hover:underline"
                onClick={() => {
                  sfx.tap()
                  markRead.mutate()
                }}
              >
                Mark all read
              </button>
            </div>

            <div className="max-h-[320px] overflow-y-auto">
              {(data?.notifications ?? []).length === 0 && (
                <div className="p-6 text-center text-muted-foreground font-semibold">
                  <div className="text-4xl mb-2">🕊️</div>
                  All quiet. Complete a lesson to hear from us!
                </div>
              )}
              {(data?.notifications ?? []).map((n) => (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex gap-3 px-4 py-3 border-b border-paper-border/60 ${!n.read ? "bg-duo-green/[0.05]" : ""}`}
                >
                  <span className="text-xl leading-none mt-0.5 shrink-0">{n.icon}</span>
                  <div className="min-w-0">
                    <p className="font-extrabold text-sm leading-snug">{n.title}</p>
                    <p className="text-sm text-muted-foreground font-semibold leading-snug">{n.body}</p>
                    <p className="text-[11px] font-bold text-muted-foreground/70 mt-0.5">{timeAgo(n.createdAt)}</p>
                  </div>
                  {!n.read && <span className="ml-auto mt-1 w-2.5 h-2.5 rounded-full bg-duo-green shrink-0" />}
                </motion.div>
              ))}
            </div>

            <div className="p-3 border-t-2 border-paper-border bg-secondary flex flex-col gap-2">
              {notificationsSupported() && (
                <button
                  className="btn3d bg-white border-2 border-duo-green/50 text-duo-green-dark shadow-[0_3px_0_#e8e0c8] text-xs py-2 px-3 flex items-center justify-center gap-1.5"
                  onClick={async () => {
                    haptics.tap()
                    const perm = await requestNotificationPermission()
                    pushToast(
                      perm === "granted" ? "Notifications on! 🔔" : "Notifications blocked",
                      perm === "granted"
                        ? "You'll get streak reminders, quest news and achievements on this device."
                        : "No worries — in-app notifications will keep you posted.",
                      perm === "granted" ? "🔔" : "🔕"
                    )
                  }}
                >
                  🔔 Enable browser notifications
                </button>
              )}
              <button
                className="btn3d bg-duo-purple text-white shadow-[0_3px_0_#7c3aed] text-xs py-2 px-3 flex items-center justify-center gap-1.5"
                disabled={sendTest.isPending}
                onClick={() => {
                  haptics.tap()
                  sendTest.mutate()
                }}
              >
                <Send className="w-3.5 h-3.5" />
                Send me a test notification
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
