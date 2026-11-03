/**
 * Scroll Academy — desktop icon generator
 * Renders src-tauri/icons/app.svg into every icon format Tauri needs:
 *   - PNGs (32, 128, 256, 512, 1024)
 *   - icon.ico  (PNG-embedded ICO, Windows)
 *   - icon.icns (PNG-embedded ICNS, macOS)
 * Run: bun scripts/make-icons.mjs
 */
import sharp from "sharp"
import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"

const ROOT = path.resolve(import.meta.dir, "..")
const ICONS = path.join(ROOT, "src-tauri", "icons")
const SVG = path.join(ICONS, "app.svg")

const SIZES = [32, 128, 256, 512, 1024]

async function renderPngs() {
  const svg = await sharp(SVG)
  await mkdir(ICONS, { recursive: true })
  for (const size of SIZES) {
    await svg.clone().resize(size, size).png().toFile(path.join(ICONS, `${size}x${size}.png`))
  }
  // Tauri's conventional @2x name (256px)
  await svg.clone().resize(256, 256).png().toFile(path.join(ICONS, "128x128@2x.png"))
  console.log("✅ PNGs rendered:", SIZES.join(", "), "+ 128x128@2x")
}

/** Build a Windows .ico containing PNG entries (supported since Vista) */
async function buildIco() {
  const sizes = [16, 32, 48, 64, 128, 256]
  const pngs = []
  for (const s of sizes) {
    pngs.push(await sharp(SVG).resize(s, s).png().toBuffer())
  }
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0) // reserved
  header.writeUInt16LE(1, 2) // type: icon
  header.writeUInt16LE(sizes.length, 4)
  const entries = []
  const datas = []
  let offset = 6 + sizes.length * 16
  sizes.forEach((s, i) => {
    const e = Buffer.alloc(16)
    const dim = s >= 256 ? 0 : s
    e.writeUInt8(dim, 0) // width
    e.writeUInt8(dim, 1) // height
    e.writeUInt8(0, 2) // palette
    e.writeUInt8(0, 3) // reserved
    e.writeUInt16LE(1, 4) // color planes
    e.writeUInt16LE(32, 6) // bits per pixel
    e.writeUInt32LE(pngs[i].length, 8) // bytes
    e.writeUInt32LE(offset, 12) // offset
    entries.push(e)
    datas.push(pngs[i])
    offset += pngs[i].length
  })
  const ico = Buffer.concat([header, ...entries, ...datas])
  await writeFile(path.join(ICONS, "icon.ico"), ico)
  console.log("✅ icon.ico built with sizes:", sizes.join(", "))
}

/** Build a macOS .icns with PNG-in-ICNS entries */
async function buildIcns() {
  // OSType -> pixel size (official PNG-capable types)
  const entries = [
    { type: "ic07", size: 128 },
    { type: "ic08", size: 256 },
    { type: "ic09", size: 512 },
    { type: "ic10", size: 1024 }, // also covers 512@2x
  ]
  const chunks = []
  let total = 8
  for (const e of entries) {
    const png = await sharp(SVG).resize(e.size, e.size).png().toBuffer()
    const chunk = Buffer.alloc(8)
    chunk.write(e.type, 0, "ascii")
    chunk.writeUInt32BE(png.length + 8, 4)
    chunks.push(Buffer.concat([chunk, png]))
    total += png.length + 8
  }
  const header = Buffer.alloc(8)
  header.write("icns", 0, "ascii")
  header.writeUInt32BE(total, 4)
  await writeFile(path.join(ICONS, "icon.icns"), Buffer.concat([header, ...chunks]))
  console.log("✅ icon.icns built:", entries.map((e) => `${e.type}(${e.size})`).join(", "))
}

async function main() {
  console.log("🎨 Generating Scroll Academy desktop icons…")
  await renderPngs()
  await buildIco()
  await buildIcns()
  console.log("🎨 Icons complete →", ICONS)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
