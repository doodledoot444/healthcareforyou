import { db } from "@/lib/db";
import { dateKeyToUtcDate, normalizeToUtcStartOfDay } from "@/features/mood/utils";
import type { MoodStreakSnapshot } from "@/features/mood/types";
import { addUtcDays, isConsecutiveUtcDate, toUtcDateKey } from "./utils";

interface ComputedStreak {
  currentStreak: number;
  longestStreak: number;
  lastEntryDate: Date | null;
}

function computeStreakFromDateKeys(dateKeys: string[], referenceDate: Date): ComputedStreak {
  if (dateKeys.length === 0) {
    return { currentStreak: 0, longestStreak: 0, lastEntryDate: null };
  }

  const normalizedReference = normalizeToUtcStartOfDay(referenceDate);
  const sortedDates = dateKeys
    .map((key) => dateKeyToUtcDate(key))
    .sort((a, b) => a.getTime() - b.getTime());

  let longestStreak = 1;
  let runningLongest = 1;

  for (let index = 1; index < sortedDates.length; index += 1) {
    if (isConsecutiveUtcDate(sortedDates[index - 1], sortedDates[index])) {
      runningLongest += 1;
    } else {
      runningLongest = 1;
    }

    if (runningLongest > longestStreak) {
      longestStreak = runningLongest;
    }
  }

  const lastEntryDate = sortedDates[sortedDates.length - 1];
  const yesterday = addUtcDays(normalizedReference, -1);
  const canHaveActiveStreak =
    toUtcDateKey(lastEntryDate) === toUtcDateKey(normalizedReference) ||
    toUtcDateKey(lastEntryDate) === toUtcDateKey(yesterday);

  let currentStreak = 0;

  if (canHaveActiveStreak) {
    currentStreak = 1;

    for (let index = sortedDates.length - 1; index > 0; index -= 1) {
      if (isConsecutiveUtcDate(sortedDates[index - 1], sortedDates[index])) {
        currentStreak += 1;
      } else {
        break;
      }
    }
  }

  return { currentStreak, longestStreak, lastEntryDate };
}

export async function updateMoodStreak(userId: string, referenceDate = new Date()): Promise<MoodStreakSnapshot> {
  const entries = await db.moodEntry.findMany({
    where: { userId },
    select: { entryDate: true },
    orderBy: { entryDate: "asc" },
  });

  const dateKeys: string[] = Array.from(
    new Set(entries.map((entry: { entryDate: Date }) => entry.entryDate.toISOString().slice(0, 10))),
  );
  const computed = computeStreakFromDateKeys(dateKeys, referenceDate);

  const streak = await db.moodStreak.upsert({
    where: { userId },
    update: {
      currentStreak: computed.currentStreak,
      longestStreak: computed.longestStreak,
      lastEntryDate: computed.lastEntryDate,
    },
    create: {
      userId,
      currentStreak: computed.currentStreak,
      longestStreak: computed.longestStreak,
      lastEntryDate: computed.lastEntryDate,
    },
  });

  return {
    currentStreak: streak.currentStreak,
    longestStreak: streak.longestStreak,
    lastEntryDate: streak.lastEntryDate ? streak.lastEntryDate.toISOString() : null,
  };
}
