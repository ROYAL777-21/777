// ── Avatar system: shared config, catalogs & presets ──────────

export type HairStyle = "short" | "long" | "curly" | "bun" | "afro" | "dreads" | "waves" | "buzz" | "bald" | "ponytail"
export type OutfitStyle = "tee" | "hoodie" | "tunic" | "robe" | "armor" | "sunday" | "scholar" | "missionary"
export type AccessoryStyle = "none" | "crucifix-gold" | "crucifix-silver" | "crucifix-wood" | "cross" | "beads"
export type HeadwearStyle = "none" | "laurel" | "crown" | "headband" | "flowers"

export type AvatarConfig = {
  skin: string
  hair: HairStyle
  hairColor: string
  eyes: "dark" | "brown" | "hazel" | "green" | "blue"
  outfit: OutfitStyle
  accessory: AccessoryStyle
  headwear: HeadwearStyle
  bg: string
}

export const SKINS = ["#8D5524", "#C68642", "#E0AC69", "#F1C27D", "#FFDBAC", "#5C3A21"]
export const HAIR_COLORS = ["#1B1B1B", "#3B2314", "#6A4423", "#A9682F", "#D9B26A", "#B5451B", "#7A7A7A", "#2C2C54"]
export const BGS = ["#FFF3D6", "#E8F5E1", "#E3F2FD", "#FCE7F3", "#F3E8FF", "#FFF0E1", "#E0F2F1", "#FDE8E8"]

export const HAIR_STYLES: { id: HairStyle; label: string }[] = [
  { id: "short", label: "Short" },
  { id: "long", label: "Long" },
  { id: "curly", label: "Curly" },
  { id: "bun", label: "Top bun" },
  { id: "afro", label: "Afro" },
  { id: "dreads", label: "Dreads" },
  { id: "waves", label: "Waves" },
  { id: "ponytail", label: "Ponytail" },
  { id: "buzz", label: "Buzz cut" },
  { id: "bald", label: "Bald" },
]

export const EYE_COLORS: { id: AvatarConfig["eyes"]; label: string; hex: string }[] = [
  { id: "dark", label: "Dark", hex: "#2A1D15" },
  { id: "brown", label: "Brown", hex: "#6B4226" },
  { id: "hazel", label: "Hazel", hex: "#9C7A3C" },
  { id: "green", label: "Green", hex: "#4F7A3A" },
  { id: "blue", label: "Blue", hex: "#4A6FA5" },
]

export type OutfitDef = {
  id: OutfitStyle
  label: string
  emoji: string
  /** shop slug required to unlock (null = free) */
  shopSlug: string | null
  main: string
  trim: string
}

export const OUTFITS: OutfitDef[] = [
  { id: "tee", label: "Everyday tee", emoji: "👕", shopSlug: null, main: "#58A700", trim: "#3F7A00" },
  { id: "hoodie", label: "Study hoodie", emoji: "🧥", shopSlug: null, main: "#0F766E", trim: "#0B5750" },
  { id: "tunic", label: "Shepherd tunic", emoji: "🧵", shopSlug: null, main: "#C2410C", trim: "#8F3009" },
  { id: "robe", label: "Galilee robe", emoji: "🕊️", shopSlug: null, main: "#7E22CE", trim: "#5B1689" },
  { id: "armor", label: "Armor of God", emoji: "🛡️", shopSlug: "outfit_armor", main: "#6B7280", trim: "#3C3C3C" },
  { id: "sunday", label: "Sunday best", emoji: "🎽", shopSlug: "outfit_sunday", main: "#1F2937", trim: "#B45309" },
  { id: "scholar", label: "Scholar sweater", emoji: "📚", shopSlug: "outfit_scholar", main: "#9A3412", trim: "#6B2410" },
  { id: "missionary", label: "Mission jacket", emoji: "🌍", shopSlug: "outfit_missionary", main: "#3F6212", trim: "#274208" },
]

export type AccessoryDef = { id: AccessoryStyle; label: string; emoji: string }

export const ACCESSORIES: AccessoryDef[] = [
  { id: "none", label: "None", emoji: "🚫" },
  { id: "crucifix-gold", label: "Gold crucifix", emoji: "✝️" },
  { id: "crucifix-silver", label: "Silver crucifix", emoji: "✝️" },
  { id: "crucifix-wood", label: "Wooden crucifix", emoji: "✝️" },
  { id: "cross", label: "Plain cross", emoji: "†" },
  { id: "beads", label: "Prayer beads", emoji: "📿" },
]

export const HEADWEARS: { id: HeadwearStyle; label: string; emoji: string }[] = [
  { id: "none", label: "None", emoji: "🚫" },
  { id: "laurel", label: "Laurel wreath", emoji: "🌿" },
  { id: "crown", label: "Victory crown", emoji: "👑" },
  { id: "headband", label: "Headband", emoji: "🎽" },
  { id: "flowers", label: "Flower crown", emoji: "🌸" },
]

export const DEFAULT_AVATAR: AvatarConfig = {
  skin: "#C68642",
  hair: "short",
  hairColor: "#1B1B1B",
  eyes: "brown",
  outfit: "tee",
  accessory: "crucifix-gold",
  headwear: "none",
  bg: "#FFF3D6",
}

export const AVATAR_PRESETS: { label: string; config: AvatarConfig }[] = [
  { label: "Timothy", config: { skin: "#C68642", hair: "short", hairColor: "#1B1B1B", eyes: "brown", outfit: "tee", accessory: "crucifix-gold", headwear: "none", bg: "#FFF3D6" } },
  { label: "Deborah", config: { skin: "#8D5524", hair: "bun", hairColor: "#1B1B1B", eyes: "dark", outfit: "robe", accessory: "crucifix-silver", headwear: "flowers", bg: "#F3E8FF" } },
  { label: "Barnabas", config: { skin: "#F1C27D", hair: "curly", hairColor: "#6A4423", eyes: "hazel", outfit: "tunic", accessory: "cross", headwear: "none", bg: "#FFF0E1" } },
  { label: "Priscilla", config: { skin: "#E0AC69", hair: "long", hairColor: "#3B2314", eyes: "brown", outfit: "hoodie", accessory: "beads", headwear: "none", bg: "#E8F5E1" } },
  { label: "Apollos", config: { skin: "#5C3A21", hair: "dreads", hairColor: "#1B1B1B", eyes: "dark", outfit: "scholar", accessory: "crucifix-wood", headwear: "none", bg: "#FDE8E8" } },
  { label: "Lydia", config: { skin: "#FFDBAC", hair: "ponytail", hairColor: "#D9B26A", eyes: "green", outfit: "sunday", accessory: "crucifix-gold", headwear: "none", bg: "#E3F2FD" } },
]

export function parseAvatar(json: string | null | undefined): AvatarConfig | null {
  if (!json) return null
  try {
    const c = JSON.parse(json) as Partial<AvatarConfig>
    if (!c || typeof c !== "object" || !c.skin) return null
    return { ...DEFAULT_AVATAR, ...c }
  } catch {
    return null
  }
}

/** deterministic pseudo-random avatar from a seed string (bots) */
export function avatarFromSeed(seed: string): AvatarConfig {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  const r = (n: number) => (h = Math.imul(h ^ (h >>> 15), 2246822507), Math.abs(h) % n)
  const hair = HAIR_STYLES.filter((s) => s.id !== "bald")[r(HAIR_STYLES.length - 1)].id
  return {
    skin: SKINS[r(SKINS.length)],
    hair,
    hairColor: HAIR_COLORS[r(HAIR_COLORS.length)],
    eyes: EYE_COLORS[r(EYE_COLORS.length)].id,
    outfit: OUTFITS.filter((o) => !o.shopSlug)[r(4)].id,
    accessory: ACCESSORIES[r(ACCESSORIES.length)].id,
    headwear: HEADWEARS[r(HEADWEARS.length)].id,
    bg: BGS[r(BGS.length)],
  }
}
