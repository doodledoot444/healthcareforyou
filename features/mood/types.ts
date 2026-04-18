export type MoodLevel = "very_low" | "low" | "neutral" | "good" | "great";

export interface MoodEntry {
  id: string;
  userId: string;
  mood: MoodLevel;
  score: number;
  note?: string;
  entryDate: string;
  createdAt: string;
}

export interface CreateMoodEntryInput {
  userId: string;
  score: number;
  note?: string;
  entryDate?: Date;
}

export interface MoodStreakSnapshot {
  currentStreak: number;
  longestStreak: number;
  lastEntryDate: string | null;
}

export interface CreateMoodEntryResult {
  entry: MoodEntry;
  streak: MoodStreakSnapshot;
  wasUpdated: boolean;
}
