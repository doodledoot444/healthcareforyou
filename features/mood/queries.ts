import { db } from "@/lib/db";
import type { MoodEntry, MoodStreakSnapshot } from "./types";
import { normalizeToUtcStartOfDay, scoreToMood } from "./utils";

function toMoodEntry(entity: {
  id: string;
  userId: string;
  score: number;
  note: string | null;
  entryDate: Date;
  createdAt: Date;
}): MoodEntry {
  return {
    id: entity.id,
    userId: entity.userId,
    mood: scoreToMood(entity.score),
    score: entity.score,
    note: entity.note ?? undefined,
    entryDate: entity.entryDate.toISOString(),
    createdAt: entity.createdAt.toISOString(),
  };
}

export async function getRecentMoods(userId: string, days = 30): Promise<MoodEntry[]> {
  const safeDays = Math.max(1, Math.min(365, Math.floor(days)));
  const today = normalizeToUtcStartOfDay(new Date());
  const cutoff = new Date(today);
  cutoff.setUTCDate(today.getUTCDate() - (safeDays - 1));

  const entries = await db.moodEntry.findMany({
    where: {
      userId,
      entryDate: {
        gte: cutoff,
      },
    },
    orderBy: { entryDate: "asc" },
  });

  return entries.map(toMoodEntry);
}

export async function getLatestMoodEntry(userId: string): Promise<MoodEntry | null> {
  const entry = await db.moodEntry.findFirst({
    where: { userId },
    orderBy: { entryDate: "desc" },
  });

  return entry ? toMoodEntry(entry) : null;
}

export async function getMoodStreakSnapshot(userId: string): Promise<MoodStreakSnapshot> {
  const streak = await db.moodStreak.findUnique({ where: { userId } });

  if (!streak) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastEntryDate: null,
    };
  }

  return {
    currentStreak: streak.currentStreak,
    longestStreak: streak.longestStreak,
    lastEntryDate: streak.lastEntryDate ? streak.lastEntryDate.toISOString() : null,
  };
}
