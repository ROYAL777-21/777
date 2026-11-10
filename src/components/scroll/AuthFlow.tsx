"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Eye, EyeOff, Gift, LogIn, Mail, User, UserPlus } from "lucide-react"
import { useAuthStore } from "@/lib/client/auth"
import { sfx } from "@/lib/client/sound"
import { haptics } from "@/lib/client/haptics"
import { Mascot } from "./Mascot"

// ═══════════════════════════════════════════════════════════════
//  AUTH FLOW — welcome → sign up / sign in (v9)
//
//  Shown by ScrollApp until the viewer has a session or chooses
//  guest mode. Captures ?ref=CODE so the referral loop starts at the
//  very first tap, and stays warm: no pressure, no upsell — the free
//  academy is the headline, Pro is never mentioned here.
// ═══════════════════════════════════════════════════════════════

type Screen = "welcome" | "signup" | "signin"

export function AuthFlow() {
  const [screen, setScreen] = useState<Screen>("welcome")
  const captureRef = useAuthStore((s) => s.captureRef)

  // capture the referral code once, before any account exists
  useEffect(() => {
    if (typeof window === "undefined") return
    const ref = new URLSearchParams(window.location.search).get("ref")
    if (ref) captureRef(ref)
  }, [captureRef])

  return (
    <div className="parchment-bg min-h-dvh flex flex-col items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        {/* brand */}
        <div className="flex flex-col items-center text-center mb-6">
          <span className="text-5xl" aria-hidden>📜</span>
          <h1 className="text-3xl font-black tracking-tight mt-2">Scroll Academy</h1>
          <p className="font-bold text-muted-foreground text-sm mt-1">
            Learn the Bible — five minutes a day.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {screen === "welcome" && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -14 }}
              transition={{ duration: 0.18 }}
              className="bg-white rounded-3xl border-2 border-paper-border shadow-[0_6px_0_#e8e0c8] p-6 sm:p-7"
            >
              <div className="flex justify-center mb-3">
                <Mascot mood="cheer" size={92} />
              </div>
              <h2 className="text-xl font-black text-center leading-snug">
                Solomon has been expecting you.
              </h2>
              <p className="text-sm font-bold text-muted-foreground text-center leading-snug mt-1.5 mb-5">
                Greek and Hebrew, the whole-Bible survey, apologetics, logic —
                built like a game, taught like a church that loves Scripture.
              </p>

              <button
                onClick={() => {
                  sfx.tap()
                  haptics.tap()
                  setScreen("signup")
                }}
                className="btn3d bg-duo-green text-white shadow-[0_5px_0_#46a302] w-full py-4 text-lg font-black flex items-center justify-center gap-2"
              >
                <UserPlus className="w-5 h-5" /> Create your account
              </button>
              <button
                onClick={() => {
                  sfx.tap()
                  haptics.tap()
                  setScreen("signin")
                }}
                className="btn3d bg-white border-2 border-paper-border text-foreground shadow-[0_5px_0_#e8e0c8] w-full py-3.5 mt-2.5 font-black flex items-center justify-center gap-2"
              >
                <LogIn className="w-5 h-5" /> I already have an account
              </button>
              <button
                onClick={() => {
                  sfx.tap()
                  haptics.tap()
                  useAuthStore.getState().continueAsGuest()
                }}
                className="w-full py-3 mt-1 font-extrabold text-muted-foreground hover:text-foreground text-sm"
              >
                Look around first — continue as guest
              </button>

              <p className="text-[11px] font-bold text-muted-foreground text-center mt-4 leading-relaxed">
                The academy is free, forever — no card needed to learn.
                <br />
                By continuing you agree to our community guidelines.
              </p>
            </motion.div>
          )}

          {screen === "signup" && <SignUpForm onSwitch={() => setScreen("signin")} />}
          {screen === "signin" && <SignInForm onSwitch={() => setScreen("signup")} />}
        </AnimatePresence>

        <p className="text-center text-xs font-bold text-muted-foreground/80 mt-5">
          📜 Scroll Academy · free &amp; open study
        </p>
      </motion.div>
    </div>
  )
}

// ── shared field look ─────────────────────────────────────────────

function Field({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
  trailing,
}: {
  id: string
  label: string
  type?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  autoComplete?: string
  trailing?: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-xs font-black uppercase tracking-wide mb-1.5" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="w-full bg-white border-2 border-paper-border rounded-2xl px-4 py-3 pr-12 font-bold text-sm focus:outline-none focus:border-duo-green/60"
        />
        {trailing && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{trailing}</span>}
      </div>
    </div>
  )
}

function FormError({ message }: { message: string | null }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          role="alert"
          className="text-sm font-bold text-duo-red bg-duo-red/10 border-2 border-duo-red/25 rounded-xl px-3 py-2"
        >
          {message}
        </motion.p>
      )}
    </AnimatePresence>
  )
}

/** honest, calm password feedback — no scolding, no theater (v9) */
function PasswordStrength({ pw }: { pw: string }) {
  if (!pw) return null
  let score = 0
  if (pw.length >= 8) score++
  if (pw.length >= 12) score++
  if (/[0-9]/.test(pw) && /[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  const meta = [
    { label: "", color: "bg-paper-border" },
    { label: "A little more…", color: "bg-duo-red" },
    { label: "Getting there", color: "bg-duo-gold" },
    { label: "Solid", color: "bg-duo-green" },
    { label: "Strong", color: "bg-duo-green-dark" },
  ][score]
  return (
    <div className="flex items-center gap-2 -mt-1" aria-hidden>
      <div className="flex gap-1 flex-1">
        {[1, 2, 3, 4].map((i) => (
          <span key={i} className={`h-1.5 flex-1 rounded-full ${i <= score ? meta.color : "bg-paper-border"}`} />
        ))}
      </div>
      {score > 0 && <span className="text-[10px] font-black text-muted-foreground">{meta.label}</span>}
    </div>
  )
}

// ── sign up ───────────────────────────────────────────────────────

function SignUpForm({ onSwitch }: { onSwitch: () => void }) {
  const signUp = useAuthStore((s) => s.signUp)
  const captureRef = useAuthStore((s) => s.captureRef)
  const pendingRef = useAuthStore((s) => s.pendingRef)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [inviteCode, setInviteCode] = useState("")
  const [showInvite, setShowInvite] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    setBusy(true)
    setError(null)
    // a friend's code typed by hand joins the ?ref= capture (v9)
    if (inviteCode.trim()) captureRef(inviteCode.trim())
    try {
      const res = await signUp({ name, email, password })
      if (!res.ok) {
        sfx.wrong()
        haptics.wrong()
        setError(res.error)
      } else {
        sfx.fanfare()
        haptics.complete()
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <motion.form
      key="signup"
      initial={{ opacity: 0, x: 14 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 14 }}
      transition={{ duration: 0.18 }}
      className="bg-white rounded-3xl border-2 border-paper-border shadow-[0_6px_0_#e8e0c8] p-6 sm:p-7"
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
    >
      <h2 className="text-xl font-black text-center mb-1">Create your account</h2>
      <p className="text-sm font-bold text-muted-foreground text-center mb-5">
        Your streak, gems and courses — kept safe on every device you use.
      </p>

      <div className="flex flex-col gap-3.5">
        <Field id="su-name" label="Name" value={name} onChange={setName} placeholder="Naomi" autoComplete="name" trailing={<User className="w-4 h-4" />} />
        <Field id="su-email" label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" autoComplete="email" trailing={<Mail className="w-4 h-4" />} />
        <Field
          id="su-password"
          label="Password"
          type={showPw ? "text" : "password"}
          value={password}
          onChange={setPassword}
          placeholder="8+ characters"
          autoComplete="new-password"
          trailing={
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              aria-label={showPw ? "Hide password" : "Show password"}
              className="hover:text-foreground"
            >
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
        />
        <PasswordStrength pw={password} />
        <FormError message={error} />
      </div>

      {/* a friend's code, typed by hand — the ?ref= link's quiet sibling */}
      {showInvite ? (
        <div className="mt-3">
          <Field
            id="su-invite"
            label="Invite code (optional)"
            value={inviteCode}
            onChange={(v) => setInviteCode(v.toUpperCase())}
            placeholder="6-character code"
            autoComplete="off"
            trailing={<Gift className="w-4 h-4" />}
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => {
            sfx.tap()
            setShowInvite(true)
          }}
          className="mt-3 text-xs font-black text-muted-foreground hover:text-foreground text-left"
        >
          Have a friend&apos;s invite code?
        </button>
      )}

      {pendingRef && (
        <div className="mt-3 bg-duo-purple/10 border-2 border-duo-purple/30 rounded-2xl px-3.5 py-2.5 flex items-start gap-2.5">
          <Gift className="w-4 h-4 text-duo-purple shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-duo-purple leading-snug">
              A friend invited you — you&apos;ll start with +100 gems the moment you join.
            </p>
            <p className="text-[10px] font-bold text-duo-purple/70 mt-0.5">
              “Two are better than one.” — Ecclesiastes 4:9
            </p>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={busy}
        className="btn3d bg-duo-green text-white shadow-[0_5px_0_#46a302] w-full py-4 text-lg font-black mt-5 disabled:opacity-60"
      >
        {busy ? "Opening the scroll…" : "Start learning"}
      </button>

      <p className="text-center text-sm font-bold text-muted-foreground mt-3">
        Already have an account?{" "}
        <button type="button" className="text-duo-green-dark hover:underline font-black" onClick={onSwitch}>
          Sign in
        </button>
      </p>
    </motion.form>
  )
}

// ── sign in ───────────────────────────────────────────────────────

function SignInForm({ onSwitch }: { onSwitch: () => void }) {
  const signIn = useAuthStore((s) => s.signIn)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [forgot, setForgot] = useState(false)
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    setBusy(true)
    setError(null)
    try {
      const res = await signIn({ email, password })
      if (!res.ok) {
        sfx.wrong()
        haptics.wrong()
        setError(res.error)
      } else {
        sfx.correct()
        haptics.complete()
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <motion.form
      key="signin"
      initial={{ opacity: 0, x: 14 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 14 }}
      transition={{ duration: 0.18 }}
      className="bg-white rounded-3xl border-2 border-paper-border shadow-[0_6px_0_#e8e0c8] p-6 sm:p-7"
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
    >
      <h2 className="text-xl font-black text-center mb-1">Welcome back</h2>
      <p className="text-sm font-bold text-muted-foreground text-center mb-5">
        Solomon kept your streak warm.
      </p>

      <div className="flex flex-col gap-3.5">
        <Field id="si-email" label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" autoComplete="email" trailing={<Mail className="w-4 h-4" />} />
        <Field
          id="si-password"
          label="Password"
          type={showPw ? "text" : "password"}
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
          trailing={
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              aria-label={showPw ? "Hide password" : "Show password"}
              className="hover:text-foreground"
            >
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
        />
        <FormError message={error} />
      </div>

      <button
        type="button"
        onClick={() => {
          sfx.tap()
          setForgot(true)
        }}
        className="text-xs font-black text-muted-foreground hover:text-foreground mt-3"
      >
        Forgot your password?
      </button>
      <AnimatePresence>
        {forgot && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="text-[11px] font-bold text-muted-foreground bg-secondary rounded-xl px-3 py-2 mt-2 leading-relaxed"
          >
            In the live build this emails you a reset link. In the demo, just
            create the account again with the same email — or continue as guest.
          </motion.p>
        )}
      </AnimatePresence>

      <button
        type="submit"
        disabled={busy}
        className="btn3d bg-duo-green text-white shadow-[0_5px_0_#46a302] w-full py-4 text-lg font-black mt-5 disabled:opacity-60"
      >
        {busy ? "Unrolling…" : "Sign in"}
      </button>

      {/* social — disabled until the real provider lands */}
      <div className="flex items-center gap-3 my-4" aria-hidden>
        <span className="h-0.5 flex-1 bg-paper-border rounded-full" />
        <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">or</span>
        <span className="h-0.5 flex-1 bg-paper-border rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {["Continue with Google", "Continue with Apple"].map((label) => (
          <button
            key={label}
            type="button"
            disabled
            title="Arriving with the real sign-in provider"
            className="btn3d bg-white border-2 border-paper-border shadow-[0_3px_0_#e8e0c8] py-2.5 text-xs font-black text-muted-foreground/70 cursor-not-allowed"
          >
            {label.split(" with ")[1]} · soon
          </button>
        ))}
      </div>

      <p className="text-center text-sm font-bold text-muted-foreground mt-4">
        New here?{" "}
        <button type="button" className="text-duo-green-dark hover:underline font-black" onClick={onSwitch}>
          Create an account
        </button>
      </p>
    </motion.form>
  )
}
