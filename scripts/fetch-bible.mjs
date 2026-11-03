/**
 * Download the public-domain KJV Bible and split it into per-book JSON files
 * under public/bible/{id}.json  →  { id, name, chapters: string[][] }
 * Run: bun scripts/fetch-bible.mjs
 */
import { mkdir, writeFile } from "node:fs/promises"

const SOURCES = [
  "https://raw.githubusercontent.com/thiagobodruk/bible/master/json/en_kjv.json",
  "https://cdn.jsdelivr.net/gh/thiagobodruk/bible@master/json/en_kjv.json",
]

// canonical short ids in Protestant book order
const IDS = [
  "gen","exo","lev","num","deu","jos","jdg","rut","1sa","2sa","1ki","2ki","1ch","2ch",
  "ezr","neh","est","job","psa","pro","ecc","sng","isa","jer","lam","ezk","dan","hos",
  "jol","amo","oba","jon","mic","nam","hab","zep","hag","zec","mal",
  "mat","mrk","luk","jhn","act","rom","1co","2co","gal","eph","php","col","1th","2th",
  "1ti","2ti","tit","phm","heb","jas","1pe","2pe","1jn","2jn","3jn","jud","rev",
]

async function fetchJson() {
  for (const url of SOURCES) {
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      if (Array.isArray(data) && data.length === 66) return data
      throw new Error(`unexpected shape (${Array.isArray(data) ? data.length : typeof data})`)
    } catch (e) {
      console.error(`source failed: ${url} → ${e.message}`)
    }
  }
  throw new Error("all sources failed")
}

function cleanVerse(t) {
  return String(t ?? "")
    .replace(/\s+/g, " ")
    .replace(/^\s*(?:\{[^}]*\})?\s*/, "")
    .trim()
}

const raw = await fetchJson()
await mkdir("public/bible", { recursive: true })

let totalVerses = 0
for (let i = 0; i < 66; i++) {
  const book = raw[i]
  const chapters = (book.chapters || []).map((c) => c.map(cleanVerse).filter(Boolean))
  totalVerses += chapters.reduce((n, c) => n + c.length, 0)
  const payload = { id: IDS[i], name: book.name ?? book.book ?? IDS[i], chapters }
  await writeFile(`public/bible/${IDS[i]}.json`, JSON.stringify(payload))
  console.log(`${IDS[i].padEnd(4)} ${String((book.name ?? "").padEnd(14))} ${chapters.length} ch · ${chapters.reduce((n, c) => n + c.length, 0)} verses`)
}
console.log(`\nDONE · 66 books · ${totalVerses} verses`)
