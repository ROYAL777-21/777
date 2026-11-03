// Smart autoplay: fetches the lesson payload and answers every exercise correctly.
// Install with: agent-browser eval "$(cat scripts/autoplay-smart.js)"
// Poll with:    agent-browser eval "window.__autoLog.join(' | ')"
(() => {
  if (window.__auto) clearInterval(window.__auto)
  window.__autoLog = []
  const log = (m) => { window.__autoLog.push(m); if (window.__autoLog.length > 60) window.__autoLog.shift() }
  const norm = (s) => (s || "").replace(/\s+/g, " ").trim().toLowerCase()
  const btns = () => [...document.querySelectorAll("button")]
  const byText = (txt) => btns().find((b) => norm(b.textContent) === norm(txt) && !b.disabled)
  const enabled = (b) => b && !b.disabled

  // discover lesson id from the running session: the overlay's first data fetch used
  // /api/lessons/<id> — find it from performance entries
  const perf = performance.getEntriesByType("resource").map((r) => r.name)
  const m = perf.filter((u) => u.includes("/api/lessons/")).map((u) => u.match(/\/api\/lessons\/([^/?]+)/)?.[1]).filter(Boolean)
  const lessonId = m[m.length - 1]
  if (!lessonId) { log("no lesson id found"); return "no-lesson-id" }

  let payload = null
  fetch("/api/lessons/" + lessonId)
    .then((r) => r.json())
    .then((d) => { payload = d; log("payload loaded: " + d.challenges.length + " challenges") })
    .catch((e) => log("fetch fail " + e))

  const currentChallenge = () => {
    if (!payload) return null
    const dom = document.body.innerText
    return payload.challenges.find((c) => {
      if (c.type === "MATCH") {
        if (!dom.includes(c.prompt)) return false
        // ensure no other MATCH with same prompt shows its options… pick first not done
        return c
      }
      return c.question && dom.includes(c.question.slice(0, 24))
    }) || null
  }

  const matchColumns = () => {
    // match buttons: two-column grid, min-h-[60px]
    const cands = btns().filter((b) => (b.className || "").toString().includes("min-h-[60px]") && !b.disabled)
    if (cands.length < 4) return null
    const xs = cands.map((b) => b.getBoundingClientRect().left)
    const mid = (Math.min(...xs) + Math.max(...xs)) / 2
    return {
      left: cands.filter((b) => b.getBoundingClientRect().left < mid),
      right: cands.filter((b) => b.getBoundingClientRect().left >= mid),
    }
  }

  const step = () => {
    try {
      // finished screen?
      const cont = byText("CONTINUE")
      if (enabled(cont)) { cont.click(); log("continue"); return }
      const got = byText("GOT IT")
      if (enabled(got)) { got.click(); log("got-it"); return }

      if (!payload) return
      const c = currentChallenge()
      if (!c) return
      const check = btns().find((b) => b.textContent.trim() === "CHECK")
      const infoBtn = byText("GOT IT")

      if (c.type === "INFO") return // handled above

      if (c.type === "SELECT" || c.type === "ASSIST") {
        const correct = c.options.find((o) => o.correct)
        if (!correct) return
        const opt = byText(correct.text)
        const alreadySel = opt && opt.getAttribute("aria-pressed") === "true"
        if (!alreadySel && enabled(opt)) { opt.click(); log("select: " + correct.text.slice(0, 18)); return }
        if (enabled(check)) { check.click(); log("check"); return }
        return
      }

      if (c.type === "TYPE") {
        const correct = c.options.find((o) => o.correct)
        const input = document.querySelector("main input")
        if (correct && input && !input.disabled && norm(input.value) !== norm(correct.text)) {
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set
          setter.call(input, correct.text)
          input.dispatchEvent(new Event("input", { bubbles: true }))
          log("typed: " + correct.text.slice(0, 18))
          return
        }
        if (enabled(check)) { check.click(); log("check-type"); return }
        return
      }

      if (c.type === "ARRANGE") {
        const ordered = [...c.options].sort((a, b) => (a.wordOrder ?? 0) - (b.wordOrder ?? 0))
        // find first word not yet in the answer area (enabled bank button with that text)
        for (const o of ordered) {
          const bank = btns().filter((b) => b.textContent.trim() === o.text && !b.disabled && (b.className || "").toString().includes("btn3d"))
          if (bank.length > 0) { bank[0].click(); log("arrange: " + o.text); return }
        }
        if (enabled(check)) { check.click(); log("check-arrange"); return }
        return
      }

      if (c.type === "MATCH") {
        const cols = matchColumns()
        if (!cols) return
        // find a pair not yet matched (green/done = opacity-50)
        const groups = new Map()
        for (const o of c.options) {
          if (!o.matchId) continue
          if (!groups.has(o.matchId)) groups.set(o.matchId, [])
          groups.get(o.matchId).push(o)
        }
        for (const [mid2, g] of groups) {
          const [l, r] = g
          const lb = cols.left.find((b) => norm(b.textContent) === norm(l.text) && !(b.className || "").toString().includes("opacity-50"))
          if (!lb) continue
          const rb = cols.right.find((b) => norm(b.textContent) === norm(r.text) && !(b.className || "").toString().includes("opacity-50"))
          if (!rb) continue
          lb.click()
          setTimeout(() => rb.click(), 260)
          log("match: " + l.text.slice(0, 12) + " → " + r.text.slice(0, 12))
          return
        }
        return
      }
    } catch (e) {
      log("err " + e.message)
    }
  }

  window.__auto = setInterval(step, 650)
  log("autoplay armed for " + lessonId)
  return "armed:" + lessonId
})()
