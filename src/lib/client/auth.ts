"use client"

// ═══════════════════════════════════════════════════════════════
//  AUTH — sign in / sign up (v9)
//  Mock provider today, real provider tomorrow.
//
//  The whole module is shaped like a provider interface so that the
//  swap to real auth (Supabase / Auth.js / Clerk / your backend) is a
//  matter of re-implementing `mockProvider` — every screen only ever
//  talks to `useAuthStore`, never to localStorage or fetch directly.
//
//  What the real provider replaces:
//   · localStorage "database"  → your users table + server-hashed passwords
//   · roleOf(email)            → a server-side role column
//   · the ?ref= capture        → a signed server session
//
//  v9.1 hardening: even the demo never stores plaintext. Passwords
//  are PBKDF2-SHA256 (150k iterations, per-account salt) via WebCrypto,
//  compared in constant time. Accounts created by the earlier v9
//  preview (plaintext) are migrated transparently on their next
//  successful sign-in.
// ═══════════════════════════════════════════════════════════════

import { create } from "zustand"

export type Role = "learner" | "admin"

export type Session = {
  userId: string
  name: string
  email: string
  role: Role
  createdAt: number
} | null

type StoredAccount = {
  name: string
  email: string
  /** PBKDF2 record — "pbkdf2$<iter>$<saltB64>$<hashB64>". Never plaintext. */
  hash?: string
  /** legacy v9-preview field — migrated to `hash` on next successful sign-in */
  password?: string
  userId: string
  createdAt: number
}

const ACCOUNTS_KEY = "sb_accounts_v1"
const SESSION_KEY = "sb_session_v1"
const REF_KEY = "sb_pending_ref"

/**
 * Staff rule for the mock: anyone on the team domain, plus the pilot
 * demo account. A real provider reads this from the database instead.
 */
export const DEMO_STAFF_EMAIL = "pastor@scrollthebible.org"

export function roleOf(email: string): Role {
  const e = email.trim().toLowerCase()
  if (e === DEMO_STAFF_EMAIL) return "admin"
  if (e.endsWith("@scrollthebible.org")) return "admin"
  return "learner"
}

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function writeJSON(key: string, value: unknown) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage full or blocked — the mock degrades to memory-only */
  }
}

function listAccounts(): StoredAccount[] {
  return readJSON<StoredAccount[]>(ACCOUNTS_KEY, [])
}

function saveAccounts(accounts: StoredAccount[]) {
  writeJSON(ACCOUNTS_KEY, accounts)
}

const emailOk = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e.trim())

// ── password hashing (WebCrypto PBKDF2, secure contexts only) ────

const PBKDF2_ITERATIONS = 150_000

function toB64(bytes: Uint8Array): string {
  let s = ""
  for (const b of bytes) s += String.fromCharCode(b)
  return btoa(s)
}

function fromB64(b64: string): Uint8Array {
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))
}

/** Fallback for non-secure contexts (e.g. plain-IP LAN demos) where
 *  WebCrypto is unavailable — weak by design of the environment, but
 *  still never plaintext. */
function weakHash(input: string): string {
  let h1 = 0xdeadbeef
  let h2 = 0x41c6ce57
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  return `weak$${(h2 >>> 0).toString(16)}${(h1 >>> 0).toString(16)}`
}

async function hashPassword(password: string, saltB64?: string): Promise<string> {
  const salt = saltB64 ? fromB64(saltB64) : crypto.getRandomValues(new Uint8Array(16))
  if (typeof crypto !== "undefined" && crypto.subtle?.deriveBits) {
    try {
      const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"])
      const bits = await crypto.subtle.deriveBits(
        { name: "PBKDF2", hash: "SHA-256", salt: salt as unknown as BufferSource, iterations: PBKDF2_ITERATIONS },
        key,
        256,
      )
      return `pbkdf2$${PBKDF2_ITERATIONS}$${toB64(salt)}$${toB64(new Uint8Array(bits))}`
    } catch {
      /* fall through to the weak path */
    }
  }
  return `pbkdf2$0$${toB64(salt)}$${weakHash(password + toB64(salt))}`
}

/** constant-time-ish string compare — no early exit on first mismatch */
function safeEqual(a: string, b: string): boolean {
  let diff = a.length ^ b.length
  for (let i = 0; i < a.length && i < b.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

// ── the store every screen talks to ───────────────────────────────

interface AuthState {
  /** null until hydrate() has run (SSR-safe) */
  hydrated: boolean
  session: Session
  /** guest mode — the classic single-learner demo, no account needed */
  guest: boolean
  /** referral code captured from ?ref= before an account exists */
  pendingRef: string | null
  hydrate: () => void
  captureRef: (code: string | null) => void
  signUp: (input: { name: string; email: string; password: string }) => Promise<{ ok: true } | { ok: false; error: string }>
  signIn: (input: { email: string; password: string }) => Promise<{ ok: true } | { ok: false; error: string }>
  /** pilot demo: enter the staff dashboard without creating anything */
  signInDemoStaff: () => void
  signOut: () => void
  continueAsGuest: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  hydrated: false,
  session: null,
  guest: false,
  pendingRef: null,

  hydrate: () => {
    if (get().hydrated) return
    const session = readJSON<Session>(SESSION_KEY, null)
    const guest = readJSON<boolean>(REF_KEY + ":guest", false)
    const pendingRef = readJSON<string | null>(REF_KEY, null)
    set({ hydrated: true, session, guest, pendingRef })
  },

  captureRef: (code) => {
    if (code) set({ pendingRef: code.toUpperCase().slice(0, 12) })
  },

  signUp: async ({ name, email, password }) => {
    const cleanName = name.trim()
    const cleanEmail = email.trim().toLowerCase()
    if (cleanName.length < 2) return { ok: false, error: "Tell us your name — even just a first name." }
    if (!emailOk(cleanEmail)) return { ok: false, error: "That email doesn't look right — mind checking it?" }
    if (password.length < 8) return { ok: false, error: "Passwords need at least 8 characters." }

    const accounts = listAccounts()
    if (accounts.some((a) => a.email === cleanEmail)) {
      return { ok: false, error: "You already have an account — try signing in instead." }
    }

    // In the single-learner sandbox every account maps onto the demo
    // user so all APIs keep working. A real provider issues a new id.
    const account: StoredAccount = {
      name: cleanName,
      email: cleanEmail,
      hash: await hashPassword(password), // never plaintext, even here
      userId: "user_1",
      createdAt: Date.now(),
    }
    saveAccounts([...accounts, account])

    const session: NonNullable<Session> = {
      userId: account.userId,
      name: account.name,
      email: account.email,
      role: roleOf(account.email),
      createdAt: account.createdAt,
    }
    writeJSON(SESSION_KEY, session)

    // the referral loop: a friend arrived via ?ref=CODE and now exists.
    // Tell the server once — it credits both sides atomically.
    const ref = get().pendingRef
    if (ref && /^[A-Z0-9]{6}$/.test(ref)) {
      void fetch("/api/referral", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "join", code: ref }),
      }).catch(() => undefined)
      try {
        window.localStorage.removeItem(REF_KEY)
      } catch {
        /* ignore */
      }
    }

    set({ session, pendingRef: null })
    return { ok: true }
  },

  signIn: async ({ email, password }) => {
    const cleanEmail = email.trim().toLowerCase()
    if (!emailOk(cleanEmail)) return { ok: false, error: "That email doesn't look right — mind checking it?" }
    const accounts = listAccounts()
    const idx = accounts.findIndex((a) => a.email === cleanEmail)
    if (idx === -1) return { ok: false, error: "No account with that email yet — create one below?" }
    const account = accounts[idx]

    if (account.hash) {
      // current format: pbkdf2$iter$salt$hash — re-derive and compare.
      // pbkdf2$0$ marks the non-WebCrypto fallback; verify on the same
      // path so an account is never falsely rejected across contexts.
      const [, , salt, expected] = account.hash.split("$")
      if (account.hash.startsWith("pbkdf2$0$")) {
        if (!safeEqual(weakHash(password + salt), expected)) {
          return { ok: false, error: "Wrong password — try again." }
        }
      } else {
        const candidate = await hashPassword(password, salt)
        if (!safeEqual(candidate, account.hash)) {
          return { ok: false, error: "Wrong password — try again." }
        }
      }
    } else if (typeof account.password === "string") {
      // legacy v9-preview account (plaintext) — verify, then migrate
      if (account.password !== password) return { ok: false, error: "Wrong password — try again." }
      account.hash = await hashPassword(password)
      delete account.password
      accounts[idx] = account
      saveAccounts(accounts)
    } else {
      return { ok: false, error: "This account needs to be recreated — sorry about that." }
    }

    const session: NonNullable<Session> = {
      userId: account.userId,
      name: account.name,
      email: account.email,
      role: roleOf(account.email),
      createdAt: account.createdAt,
    }
    writeJSON(SESSION_KEY, session)
    set({ session })
    return { ok: true }
  },

  signInDemoStaff: () => {
    const session: NonNullable<Session> = {
      userId: "user_1",
      name: "Pilot Pastor",
      email: DEMO_STAFF_EMAIL,
      role: "admin",
      createdAt: Date.now(),
    }
    writeJSON(SESSION_KEY, session)
    set({ session, guest: false })
  },

  signOut: () => {
    try {
      window.localStorage.removeItem(SESSION_KEY)
      window.localStorage.removeItem(REF_KEY + ":guest")
    } catch {
      /* ignore */
    }
    set({ session: null, guest: false })
  },

  continueAsGuest: () => {
    writeJSON(REF_KEY + ":guest", true)
    set({ guest: true })
  },
}))

/** convenience selector — is the current viewer staff? */
export function useIsAdmin(): boolean {
  return useAuthStore((s) => s.session?.role === "admin")
}
