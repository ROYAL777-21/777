// Auto-plays the current lesson via the agent-browser eval loop (flow testing)
// strategy: CONTINUE > GOT IT > CHECK > select option / type / match pairs
(() => {
  const q = (s) => [...document.querySelectorAll(s)]
  const clickText = (txt) => {
    const b = q("button").find((x) => x.textContent.trim().toUpperCase() === txt && !x.disabled)
    if (b) {
      b.click()
      return true
    }
    return false
  }
  if (clickText("CONTINUE")) return "continue"
  if (clickText("GOT IT")) return "got-it"

  const checkBtn = q("button").find((x) => x.textContent.trim().toUpperCase() === "CHECK")
  if (checkBtn && !checkBtn.disabled) {
    checkBtn.click()
    return "check"
  }

  // TYPE input?
  const input = q("main input")
  if (input.length > 0) {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set
    setter.call(input[0], "word")
    input[0].dispatchEvent(new Event("input", { bubbles: true }))
    return "typed"
  }

  // options in main (skip faded/matched ones)
  const main = document.querySelector("main")
  if (!main) return "no-main"
  const opts = [...main.querySelectorAll("button")].filter(
    (b) => !b.disabled && !b.classList.contains("opacity-50")
  )
  if (opts.length === 0) return "no-options"

  const rects = opts.map((b) => b.getBoundingClientRect())
  const lefts = rects.map((r) => r.left)
  const uniqueLefts = [...new Set(lefts.map((l) => Math.round(l / 20)))]

  if (uniqueLefts.length === 1 || opts.length <= 4) {
    opts[0].click()
    return "option:" + opts[0].textContent.trim().slice(0, 12)
  }

  // MATCH: two columns — click first unfaded left, then rotate rights
  const minLeft = Math.min(...lefts)
  const colA = opts.filter((b) => Math.abs(b.getBoundingClientRect().left - minLeft) < 4)
  const colB = opts.filter((b) => Math.abs(b.getBoundingClientRect().left - minLeft) >= 4)
  if (colA.length && colB.length) {
    window.__matchIdx = (window.__matchIdx || 0) + 1
    colA[0].click()
    const pick = colB[window.__matchIdx % colB.length]
    setTimeout(() => pick.click(), 150)
    return `match-try L:${colA[0].textContent.trim()} R:${pick.textContent.trim().slice(0, 10)}`
  }
  opts[0].click()
  return "fallback"
})()
