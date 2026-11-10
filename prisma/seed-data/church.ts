// ═══════════════════════════════════════════════════════════════
//  CHURCH PILOT — seed data for the B2B org dashboard
//  (REVENUE.md §6 weeks 3–6: 10 hand-sold churches, $99/mo, 50 seats)
//
//  The stats below are the pilot cohort's weekly snapshot, written out
//  explicitly (not generated) so every number on the dashboard is
//  inspectable. weeks = [lessons, chapters, xp] × 8, oldest → newest.
//  The admin seat (userId "user_1") carries NO stored stats — the API
//  recomputes those live from real lesson completions & Bible reads.
// ═══════════════════════════════════════════════════════════════

export type ChurchMemberSeed = {
  name: string
  emoji: string
  daysAgoJoined: number
  lessons: number
  chaptersRead: number
  streak: number
  weeklyXp: number
  lastActiveDaysAgo: number
  weeks: [number, number, number][] // [lessons, chapters, xp] × 8
}

export const churchOrgSeed = {
  slug: "grace-community",
  name: "Grace Community Church",
  city: "Springfield",
  tier: "fifty", // ≤50 seats — $99/mo whole org (REVENUE.md Phase-3 line 4)
  seatsTotal: 50,
  priceMonthly: 99,
  contactName: "Pastor Ben Whitfield",
  contactEmail: "ben@gracecommunity.example",
  focusCourse: "Biblical Greek — the cohort's shared focus course",
}

// 26 enrolled seats + the admin = 27 of 50 used (room to invite from the UI).
// Distribution is deliberately realistic: 4 core · 13 steady · 5 new · 4 lapsed.
export const churchMemberSeeds: ChurchMemberSeed[] = [
  // ── the core four (they'll finish Greek by Advent) ──
  {
    name: "Naomi Adler", emoji: "🕊️", daysAgoJoined: 42, lessons: 92, chaptersRead: 174, streak: 38, weeklyXp: 412, lastActiveDaysAgo: 0,
    weeks: [[11, 22, 410], [12, 24, 448], [11, 21, 415], [12, 23, 452], [11, 20, 408], [12, 22, 441], [11, 21, 412], [12, 21, 438]],
  },
  {
    name: "Ezra Okafor", emoji: "🦁", daysAgoJoined: 42, lessons: 84, chaptersRead: 121, streak: 26, weeklyXp: 355, lastActiveDaysAgo: 0,
    weeks: [[10, 16, 362], [11, 17, 380], [10, 15, 341], [11, 16, 370], [10, 14, 330], [11, 15, 358], [10, 14, 336], [11, 14, 348]],
  },
  {
    name: "Miriam Castellanos", emoji: "📚", daysAgoJoined: 40, lessons: 71, chaptersRead: 96, streak: 19, weeklyXp: 289, lastActiveDaysAgo: 1,
    weeks: [[9, 12, 296], [9, 13, 301], [8, 11, 272], [9, 12, 298], [9, 12, 291], [9, 12, 293], [9, 12, 288], [9, 12, 290]],
  },
  {
    name: "Hosea Lindqvist", emoji: "🕯️", daysAgoJoined: 39, lessons: 63, chaptersRead: 88, streak: 15, weeklyXp: 244, lastActiveDaysAgo: 0,
    weeks: [[8, 11, 251], [8, 11, 248], [8, 11, 246], [8, 11, 244], [7, 10, 231], [8, 11, 249], [8, 11, 247], [7, 12, 242]],
  },

  // ── the steady middle — the congregation's backbone ──
  {
    name: "Ruth Delgado", emoji: "🌾", daysAgoJoined: 38, lessons: 48, chaptersRead: 57, streak: 11, weeklyXp: 188, lastActiveDaysAgo: 0,
    weeks: [[6, 8, 195], [6, 7, 183], [6, 8, 191], [6, 7, 186], [6, 7, 184], [6, 7, 185], [6, 7, 183], [6, 6, 187]],
  },
  {
    name: "Gideon Mbeki", emoji: "🛡️", daysAgoJoined: 37, lessons: 44, chaptersRead: 49, streak: 9, weeklyXp: 171, lastActiveDaysAgo: 1,
    weeks: [[6, 6, 178], [5, 6, 168], [6, 6, 175], [5, 6, 169], [6, 6, 174], [5, 6, 167], [6, 6, 173], [5, 6, 170]],
  },
  {
    name: "Esther Vasquez", emoji: "👑", daysAgoJoined: 36, lessons: 41, chaptersRead: 44, streak: 8, weeklyXp: 162, lastActiveDaysAgo: 0,
    weeks: [[5, 6, 168], [5, 5, 158], [5, 6, 165], [5, 5, 157], [5, 6, 163], [5, 5, 156], [5, 6, 164], [5, 6, 161]],
  },
  {
    name: "Caleb Nakamura", emoji: "🏹", daysAgoJoined: 35, lessons: 38, chaptersRead: 39, streak: 7, weeklyXp: 149, lastActiveDaysAgo: 0,
    weeks: [[5, 5, 154], [5, 5, 151], [4, 5, 143], [5, 5, 152], [5, 5, 150], [5, 5, 149], [4, 5, 141], [5, 4, 147]],
  },
  {
    name: "Deborah Fontaine", emoji: "🦉", daysAgoJoined: 35, lessons: 36, chaptersRead: 41, streak: 12, weeklyXp: 158, lastActiveDaysAgo: 0,
    weeks: [[5, 6, 164], [5, 6, 162], [5, 5, 155], [5, 6, 160], [5, 5, 156], [5, 6, 161], [5, 5, 154], [5, 5, 152]],
  },
  {
    name: "Joel Ashworth", emoji: "🎵", daysAgoJoined: 33, lessons: 33, chaptersRead: 31, streak: 6, weeklyXp: 134, lastActiveDaysAgo: 1,
    weeks: [[4, 4, 139], [4, 4, 137], [4, 4, 136], [4, 4, 133], [4, 4, 135], [4, 4, 134], [4, 4, 132], [4, 3, 130]],
  },
  {
    name: "Abigail Tembo", emoji: "💐", daysAgoJoined: 32, lessons: 31, chaptersRead: 28, streak: 5, weeklyXp: 126, lastActiveDaysAgo: 0,
    weeks: [[4, 4, 131], [4, 3, 124], [4, 4, 129], [4, 3, 122], [4, 4, 128], [4, 3, 123], [4, 4, 127], [4, 3, 121]],
  },
  {
    name: "Malachi Brennan", emoji: "📜", daysAgoJoined: 31, lessons: 29, chaptersRead: 26, streak: 4, weeklyXp: 118, lastActiveDaysAgo: 1,
    weeks: [[4, 3, 124], [4, 3, 122], [3, 3, 112], [4, 3, 120], [4, 3, 119], [3, 3, 111], [4, 3, 118], [3, 3, 113]],
  },
  {
    name: "Zipporah Halevi", emoji: "🕎", daysAgoJoined: 30, lessons: 27, chaptersRead: 24, streak: 6, weeklyXp: 112, lastActiveDaysAgo: 0,
    weeks: [[3, 3, 117], [4, 3, 121], [3, 3, 110], [4, 3, 119], [3, 3, 109], [4, 3, 118], [3, 3, 108], [3, 3, 113]],
  },
  {
    name: "Boaz Petrov", emoji: "⚓", daysAgoJoined: 29, lessons: 25, chaptersRead: 21, streak: 3, weeklyXp: 104, lastActiveDaysAgo: 2,
    weeks: [[3, 3, 109], [3, 3, 107], [3, 3, 106], [3, 3, 105], [3, 3, 104], [3, 3, 103], [3, 3, 102], [3, 2, 100]],
  },
  {
    name: "Lois Fairbanks", emoji: "🧵", daysAgoJoined: 28, lessons: 23, chaptersRead: 19, streak: 3, weeklyXp: 96, lastActiveDaysAgo: 0,
    weeks: [[3, 2, 101], [3, 2, 99], [3, 2, 98], [3, 2, 97], [3, 2, 96], [3, 2, 95], [3, 2, 94], [2, 2, 90]],
  },
  {
    name: "Amos Dlamini", emoji: "🌳", daysAgoJoined: 27, lessons: 21, chaptersRead: 17, streak: 2, weeklyXp: 89, lastActiveDaysAgo: 1,
    weeks: [[3, 2, 94], [3, 2, 93], [3, 2, 92], [2, 2, 87], [3, 2, 91], [2, 2, 86], [3, 2, 90], [2, 2, 85]],
  },
  {
    name: "Jemima Oyelaran", emoji: "🦋", daysAgoJoined: 26, lessons: 19, chaptersRead: 15, streak: 4, weeklyXp: 84, lastActiveDaysAgo: 0,
    weeks: [[2, 2, 89], [3, 2, 88], [2, 2, 86], [2, 2, 85], [2, 2, 84], [2, 2, 83], [3, 2, 88], [2, 1, 82]],
  },

  // ── new seats — joined mid-pilot, still ramping ──
  {
    name: "Elias Vogel", emoji: "🌱", daysAgoJoined: 13, lessons: 11, chaptersRead: 9, streak: 5, weeklyXp: 52, lastActiveDaysAgo: 0,
    weeks: [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [2, 2, 26], [4, 3, 41], [5, 4, 51]],
  },
  {
    name: "Tabitha Nowak", emoji: "🧶", daysAgoJoined: 11, lessons: 9, chaptersRead: 7, streak: 3, weeklyXp: 44, lastActiveDaysAgo: 0,
    weeks: [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [4, 3, 38], [5, 4, 46]],
  },
  {
    name: "Silas Marsh", emoji: "🚣", daysAgoJoined: 9, lessons: 7, chaptersRead: 5, streak: 2, weeklyXp: 35, lastActiveDaysAgo: 1,
    weeks: [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [7, 5, 37]],
  },
  {
    name: "Priscilla Adeyemi", emoji: "📮", daysAgoJoined: 8, lessons: 6, chaptersRead: 4, streak: 2, weeklyXp: 31, lastActiveDaysAgo: 0,
    weeks: [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [6, 4, 32]],
  },
  {
    name: "Titus Björk", emoji: "🔨", daysAgoJoined: 6, lessons: 4, chaptersRead: 3, streak: 1, weeklyXp: 22, lastActiveDaysAgo: 0,
    weeks: [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [4, 3, 23]],
  },

  // ── lapsed seats — the reason the dashboard has a re-engage view ──
  {
    name: "Elijah Sandoval", emoji: "🌪️", daysAgoJoined: 41, lessons: 18, chaptersRead: 14, streak: 0, weeklyXp: 0, lastActiveDaysAgo: 9,
    weeks: [[3, 2, 92], [3, 2, 90], [2, 2, 78], [2, 1, 65], [1, 1, 31], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
  },
  {
    name: "Martha Iqbal", emoji: "🌻", daysAgoJoined: 39, lessons: 14, chaptersRead: 10, streak: 0, weeklyXp: 0, lastActiveDaysAgo: 12,
    weeks: [[2, 2, 71], [2, 1, 64], [2, 2, 69], [1, 1, 38], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
  },
  {
    name: "Andrew Castile", emoji: "🐟", daysAgoJoined: 36, lessons: 10, chaptersRead: 8, streak: 0, weeklyXp: 0, lastActiveDaysAgo: 7,
    weeks: [[2, 1, 58], [2, 2, 62], [1, 1, 35], [1, 1, 33], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
  },
  {
    name: "Lydia Moreau", emoji: "💜", daysAgoJoined: 34, lessons: 8, chaptersRead: 6, streak: 0, weeklyXp: 0, lastActiveDaysAgo: 11,
    weeks: [[1, 1, 44], [2, 1, 51], [1, 1, 42], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
  },
]
