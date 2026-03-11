export type NoiseLevel = "Quiet" | "Moderate" | "Buzzing";
export type OutletAvailability = "Sparse" | "Decent" | "Plentiful";
export type SessionLength = 25 | 45 | 60;

export interface UserProfile {
  id: string;
  fullName: string;
  major: string;
  xp: number;
  streak: number;
  level: number;
  avatarUrl?: string | null;
}

export interface Creature {
  id: string;
  name: string;
  rarity: "Common" | "Rare" | "Epic";
  description: string;
  accent: string;
  illustration: string;
}

export interface StudySpot {
  id: string;
  slug: string;
  name: string;
  buildingCode: string;
  description: string;
  longDescription: string;
  tags: string[];
  noiseLevel: NoiseLevel;
  outletAvailability: OutletAvailability;
  featuredCreatureId: string;
}

export interface StudySession {
  id: string;
  studySpotId: string;
  durationMinutes: SessionLength;
  completedAt: string;
  xpEarned: number;
  creatureGrantedId?: string | null;
}

export interface TaskItem {
  id: string;
  title: string;
  dueLabel: string;
  completed: boolean;
  xpReward: number;
}

export interface CollectionEntry {
  id: string;
  creatureId: string;
  acquiredAt: string;
  originSpotId: string;
}

export interface DashboardSnapshot {
  profile: UserProfile;
  recentSessions: StudySession[];
  tasks: TaskItem[];
  collection: CollectionEntry[];
}
