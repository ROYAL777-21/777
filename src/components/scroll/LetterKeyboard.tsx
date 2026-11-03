"use client"

import { motion } from "framer-motion"
import { Delete, Keyboard } from "lucide-react"
import { sfx } from "@/lib/client/sound"
import { haptics } from "@/lib/client/haptics"

/**
 * On-screen letter keyboards for Greek & Hebrew spelling challenges.
 * Hebrew renders right-to-left; both include final letter forms.
 */

const GREEK_ROWS = [
  "α β γ δ ε ζ η θ".split(" "),
  "ι κ λ μ ν ξ ο π".split(" "),
  "ρ σ τ υ φ χ ψ ω".split(" "),
  ["ς"],
]

const HEBREW_ROWS = [
  "א ב ג ד ה ו ז".split(" "),
  "ח ט י כ ל מ נ".split(" "),
  "ס ע פ צ ק ר ש".split(" "),
  ["ת", "ך", "ם", "ן", "ף", "ץ"],
]

export function LetterKeyboard({
  lang,
  onKey,
  onBackspace,
  onSpace,
  disabled,
}: {
  lang: "el" | "he"
  onKey: (letter: string) => void
  onBackspace: () => void
  onSpace: () => void
  disabled?: boolean
}) {
  const rows = lang === "el" ? GREEK_ROWS : HEBREW_ROWS
  return (
    <div className="mt-4" aria-label={`${lang === "el" ? "Greek" : "Hebrew"} letter keyboard`}>
      <p className="text-xs font-black uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1.5">
        <Keyboard className="w-3.5 h-3.5" />
        {lang === "el" ? "Greek keyboard" : "Hebrew keyboard · type right to left"} — or use your physical keyboard
      </p>
      <div className="flex flex-col gap-1.5">
        {rows.map((row, ri) => (
          <div key={ri} className="flex flex-wrap justify-center gap-1.5">
            {row.map((letter) => (
              <motion.button
                key={letter}
                whileTap={disabled ? undefined : { scale: 0.9 }}
                disabled={disabled}
                onClick={() => {
                  sfx.tap()
                  haptics.tap()
                  onKey(letter)
                }}
                className="glyph btn3d bg-white border-2 border-paper-border shadow-[0_3px_0_#e8e0c8] w-11 h-11 sm:w-12 sm:h-12 rounded-xl text-2xl font-black hover:bg-secondary disabled:opacity-50"
                aria-label={`Letter ${letter}`}
              >
                {letter}
              </motion.button>
            ))}
          </div>
        ))}
        <div className="flex justify-center gap-1.5 mt-1">
          <motion.button
            whileTap={disabled ? undefined : { scale: 0.94 }}
            disabled={disabled}
            onClick={() => {
              sfx.tap()
              haptics.tap()
              onSpace()
            }}
            className="btn3d bg-white border-2 border-paper-border shadow-[0_3px_0_#e8e0c8] px-8 h-11 rounded-xl text-sm font-black hover:bg-secondary disabled:opacity-50"
          >
            space
          </motion.button>
          <motion.button
            whileTap={disabled ? undefined : { scale: 0.94 }}
            disabled={disabled}
            onClick={() => {
              sfx.tap()
              haptics.tap()
              onBackspace()
            }}
            className="btn3d bg-white border-2 border-paper-border shadow-[0_3px_0_#e8e0c8] px-4 h-11 rounded-xl hover:bg-secondary disabled:opacity-50 flex items-center gap-1.5 font-black text-sm"
            aria-label="Delete letter"
          >
            <Delete className="w-4 h-4" /> del
          </motion.button>
        </div>
      </div>
    </div>
  )
}

/** show the right keyboard for a course + accept physical keyboard input */
export function isLangCourse(courseCode: string): "el" | "he" | null {
  if (courseCode === "greek") return "el"
  if (courseCode === "hebrew") return "he"
  return null
}
