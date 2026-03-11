import {
  CollectionEntry,
  Creature,
  DashboardSnapshot,
  StudySession,
  StudySpot,
  TaskItem
} from "@/lib/types";

export const creatures: Creature[] = [
  { id: "horned-owl", name: "Tower Owl", rarity: "Rare", description: "Guards late-night momentum from the UT skyline.", accent: "from-amber to-coral", illustration: "🦉" },
  { id: "library-axolotl", name: "PCL Axolotl", rarity: "Epic", description: "Thrives in quiet corners and impossible reading lists.", accent: "from-lake to-fern", illustration: "🦎" },
  { id: "union-fox", name: "Union Fox", rarity: "Common", description: "Finds snacks, sofas, and the best people-watching angles.", accent: "from-coral to-amber", illustration: "🦊" },
  { id: "welch-sprite", name: "Welch Sprite", rarity: "Rare", description: "Lives between equations, whiteboards, and breakthroughs.", accent: "from-fern to-lake", illustration: "✨" },
  { id: "pma-moth", name: "PMA Moth", rarity: "Common", description: "Drawn to glowing problem sets and evening calm.", accent: "from-stone-300 to-slate-500", illustration: "🦋" },
  { id: "littlefield-bee", name: "Littlefield Bee", rarity: "Common", description: "Organizes projects with suspicious efficiency.", accent: "from-yellow-300 to-amber", illustration: "🐝" },
  { id: "gsb-koi", name: "GSB Koi", rarity: "Rare", description: "Swims through case studies and polished presentations.", accent: "from-sky-300 to-lake", illustration: "🐟" },
  { id: "fac-raccoon", name: "FAC Raccoon", rarity: "Epic", description: "Makes treasures out of half-finished drafts and deadlines.", accent: "from-slate-400 to-zinc-700", illustration: "🦝" },
  { id: "ece-cicada", name: "EER Cicada", rarity: "Common", description: "Buzzes brightest around hardware demos and all-nighters.", accent: "from-fern to-moss", illustration: "🪲" },
  { id: "law-cat", name: "Law Cat", rarity: "Rare", description: "Keeps a precise eye on outlines and calm focus.", accent: "from-stone-200 to-zinc-500", illustration: "🐈" }
];

export const studySpots: StudySpot[] = [
  {
    id: "pcl",
    slug: "perry-castaneda-library",
    name: "Perry-Castaneda Library",
    buildingCode: "PCL",
    description: "The classic deep-focus campus library with plenty of floors to choose from.",
    longDescription: "PCL is the default answer for a reason: reliable seating, quiet stacks, strong study energy, and a wide mix of solo and group-friendly zones.",
    tags: ["24-hour vibe", "Quiet floors", "Central campus"],
    noiseLevel: "Quiet",
    outletAvailability: "Plentiful",
    featuredCreatureId: "library-axolotl",
    lat: 30.2828,
    lng: -97.7382,
    address: "101 E 21st St, Austin, TX 78705"
  },
  {
    id: "union",
    slug: "texas-union",
    name: "Texas Union",
    buildingCode: "UNB",
    description: "High-energy common areas with easy food access and flexible seating.",
    longDescription: "The Union works well for lighter study blocks, collaborative sessions, and people who focus better with movement and ambient noise nearby.",
    tags: ["Food nearby", "Group study", "Late afternoon"],
    noiseLevel: "Buzzing",
    outletAvailability: "Decent",
    featuredCreatureId: "union-fox",
    lat: 30.2858,
    lng: -97.7408,
    address: "2308 Whitis Ave, Austin, TX 78705"
  },
  {
    id: "welch",
    slug: "welch-hall",
    name: "Welch Hall Commons",
    buildingCode: "WEL",
    description: "Science-heavy study territory close to labs and engineering routes.",
    longDescription: "Welch is ideal when you want whiteboards, STEM energy, and quick access to classmates between lectures and labs.",
    tags: ["Whiteboards", "STEM hub", "Group pods"],
    noiseLevel: "Moderate",
    outletAvailability: "Decent",
    featuredCreatureId: "welch-sprite",
    lat: 30.2868,
    lng: -97.7370,
    address: "105 E 24th St, Austin, TX 78712"
  },
  {
    id: "pma",
    slug: "painter-hall",
    name: "Painter Hall Atrium",
    buildingCode: "PMA",
    description: "Bright, steady, and good for knocking out medium-focus work.",
    longDescription: "Painter gives you a balance of motion and calm, making it useful for reading, problem sets, and between-class productivity.",
    tags: ["Natural light", "Math corridor", "Drop-in sessions"],
    noiseLevel: "Moderate",
    outletAvailability: "Sparse",
    featuredCreatureId: "pma-moth",
    lat: 30.2876,
    lng: -97.7382,
    address: "2100 San Jacinto Blvd, Austin, TX 78712"
  },
  {
    id: "littlefield",
    slug: "littlefield-cafe",
    name: "Littlefield Cafe",
    buildingCode: "CMA",
    description: "Warm cafe energy for planning, writing, and lighter deep-work blocks.",
    longDescription: "A strong option when you want a soft landing spot with coffee, quick meetings, and enough buzz to avoid feeling isolated.",
    tags: ["Coffee", "Writing", "Casual focus"],
    noiseLevel: "Buzzing",
    outletAvailability: "Sparse",
    featuredCreatureId: "littlefield-bee",
    lat: 30.2844,
    lng: -97.7393,
    address: "101 E 21st St, Austin, TX 78712"
  },
  {
    id: "gsb",
    slug: "gsb-commons",
    name: "McCombs GSB Commons",
    buildingCode: "GSB",
    description: "Polished collaborative spaces with strong daytime productivity energy.",
    longDescription: "GSB commons suits students who prefer structured environments, cleaner furniture, and group work near business school resources.",
    tags: ["Business school", "Presentation prep", "Collaborative"],
    noiseLevel: "Moderate",
    outletAvailability: "Plentiful",
    featuredCreatureId: "gsb-koi",
    lat: 30.2843,
    lng: -97.7355,
    address: "2110 Speedway, Austin, TX 78712"
  },
  {
    id: "fac",
    slug: "fine-arts-center",
    name: "Fine Arts Library",
    buildingCode: "FAC",
    description: "A tucked-away spot for quieter sessions and creative recharge.",
    longDescription: "The Fine Arts area has a hidden-gem feel that works especially well for reading-heavy work, sketching ideas, or escaping busier corridors.",
    tags: ["Hidden gem", "Creative work", "Quiet corners"],
    noiseLevel: "Quiet",
    outletAvailability: "Decent",
    featuredCreatureId: "fac-raccoon",
    lat: 30.2879,
    lng: -97.7416,
    address: "23rd & Trinity St, Austin, TX 78712"
  },
  {
    id: "eer",
    slug: "engineering-education-research-center",
    name: "Engineering Education and Research Center",
    buildingCode: "EER",
    description: "Modern study zones with maker energy and solid infrastructure.",
    longDescription: "EER is strong for project teams, code sessions, and long blocks where you need good outlets, tables, and a modern academic environment.",
    tags: ["Engineering", "Project work", "Modern space"],
    noiseLevel: "Moderate",
    outletAvailability: "Plentiful",
    featuredCreatureId: "ece-cicada",
    lat: 30.2877,
    lng: -97.7352,
    address: "2501 Speedway, Austin, TX 78712"
  },
  {
    id: "tower",
    slug: "main-building-lounge",
    name: "Main Building Lounge",
    buildingCode: "MAI",
    description: "Historic architecture with classic UT atmosphere and strong focus energy.",
    longDescription: "The Main Building offers a more ceremonial mood, useful when you want to reset, read, or lean into the ritual of studying on campus.",
    tags: ["Historic", "Campus icon", "Reading"],
    noiseLevel: "Quiet",
    outletAvailability: "Sparse",
    featuredCreatureId: "horned-owl",
    lat: 30.2863,
    lng: -97.7393,
    address: "110 Inner Campus Dr, Austin, TX 78705"
  },
  {
    id: "law",
    slug: "tnrl-reading-room",
    name: "Tarlton Reading Room",
    buildingCode: "TNRL",
    description: "Serious quiet for long reading sessions and exam prep.",
    longDescription: "Tarlton is for students who want minimal distractions, polished quiet, and a setting that immediately raises the bar for attention.",
    tags: ["Very quiet", "Reading room", "Exam prep"],
    noiseLevel: "Quiet",
    outletAvailability: "Decent",
    featuredCreatureId: "law-cat",
    lat: 30.2839,
    lng: -97.7370,
    address: "727 E Dean Keeton St, Austin, TX 78705"
  }
];

export const recentSessions: StudySession[] = [
  { id: "session-1", studySpotId: "pcl", durationMinutes: 45, completedAt: "2026-03-09T20:15:00.000Z", xpEarned: 85, creatureGrantedId: "library-axolotl" },
  { id: "session-2", studySpotId: "welch", durationMinutes: 25, completedAt: "2026-03-08T18:10:00.000Z", xpEarned: 50, creatureGrantedId: null },
  { id: "session-3", studySpotId: "union", durationMinutes: 60, completedAt: "2026-03-07T22:05:00.000Z", xpEarned: 120, creatureGrantedId: "union-fox" },
  { id: "session-4", studySpotId: "eer", durationMinutes: 45, completedAt: "2026-03-06T16:30:00.000Z", xpEarned: 85, creatureGrantedId: null },
  { id: "session-5", studySpotId: "tower", durationMinutes: 60, completedAt: "2026-03-05T21:40:00.000Z", xpEarned: 120, creatureGrantedId: "horned-owl" },
  { id: "session-6", studySpotId: "pcl", durationMinutes: 25, completedAt: "2026-03-05T14:00:00.000Z", xpEarned: 50, creatureGrantedId: null },
  { id: "session-7", studySpotId: "gsb", durationMinutes: 45, completedAt: "2026-03-03T19:20:00.000Z", xpEarned: 85, creatureGrantedId: "gsb-koi" },
  { id: "session-8", studySpotId: "littlefield", durationMinutes: 25, completedAt: "2026-03-01T11:45:00.000Z", xpEarned: 50, creatureGrantedId: null },
  { id: "session-9", studySpotId: "fac", durationMinutes: 60, completedAt: "2026-02-28T20:00:00.000Z", xpEarned: 120, creatureGrantedId: "fac-raccoon" },
  { id: "session-10", studySpotId: "pma", durationMinutes: 25, completedAt: "2026-02-26T17:15:00.000Z", xpEarned: 50, creatureGrantedId: null },
];

export const tasks: TaskItem[] = [
  { id: "task-1", title: "Finalize StudyMon MVP demo", dueLabel: "Tonight", completed: false, xpReward: 20 },
  { id: "task-2", title: "Submit Devpost project page", dueLabel: "Tomorrow", completed: false, xpReward: 35 },
  { id: "task-3", title: "Polish UI and fix auth flow", dueLabel: "Today", completed: true, xpReward: 15 }
];

export const collection: CollectionEntry[] = [
  { id: "entry-1", creatureId: "library-axolotl", acquiredAt: "2026-03-09T20:15:00.000Z", originSpotId: "pcl" },
  { id: "entry-2", creatureId: "union-fox", acquiredAt: "2026-03-07T22:05:00.000Z", originSpotId: "union" },
  { id: "entry-3", creatureId: "horned-owl", acquiredAt: "2026-03-05T21:40:00.000Z", originSpotId: "tower" }
];

export const dashboardSnapshot: DashboardSnapshot = {
  profile: {
    id: "user-demo",
    fullName: "Panav Mhatre",
    major: "Computer Science",
    xp: 540,
    streak: 6,
    level: 3
  },
  recentSessions,
  tasks,
  collection
};

export function getSpotBySlug(slug: string) {
  return studySpots.find((spot) => spot.slug === slug);
}

export function getSpotById(id: string) {
  return studySpots.find((spot) => spot.id === id);
}

export function getCreatureById(id: string) {
  return creatures.find((creature) => creature.id === id);
}
