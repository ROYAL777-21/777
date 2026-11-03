"use client"

/** Browser push-style notifications (in-app toasts as fallback). */

export type NotifyPayload = { title: string; body: string; icon?: string }

export function notificationsSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window
}

export function notificationsEnabled(): boolean {
  return notificationsSupported() && Notification.permission === "granted"
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!notificationsSupported()) return "denied"
  if (Notification.permission === "granted") return "granted"
  try {
    return await Notification.requestPermission()
  } catch {
    return "denied"
  }
}

/** Fire a browser notification if permitted; returns whether it was shown. */
export function fireBrowserNotification(payload: NotifyPayload): boolean {
  if (!notificationsEnabled()) return false
  try {
    const n = new Notification(payload.title, {
      body: payload.body,
      icon: payload.icon ?? "/scroll-icon.svg",
      tag: `scroll-${Date.now()}`,
    })
    setTimeout(() => n.close(), 7000)
    return true
  } catch {
    return false
  }
}

export function timeAgo(iso: string): string {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return "just now"
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}
