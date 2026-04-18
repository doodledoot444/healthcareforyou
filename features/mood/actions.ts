"use server";

import { db } from "@/lib/db";
import { updateMoodStreak } from "@/features/streak/service";
import type { CreateMoodEntryInput, CreateMoodEntryResult, MoodEntry } from "./types";
import { assertValidMoodScore, normalizeToUtcStartOfDay, scoreToMood } from "./utils";

export class MoodEntryValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MoodEntryValidationError";
  }
}

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
    score: entity.score,
    mood: scoreToMood(entity.score),
    note: entity.note ?? undefined,
    entryDate: entity.entryDate.toISOString(),
    createdAt: entity.createdAt.toISOString(),
  };
}

export async function createMoodEntry(input: CreateMoodEntryInput): Promise<CreateMoodEntryResult> {
  if (!input.userId?.trim()) {
    throw new MoodEntryValidationError("userId is required to create a mood entry.");
  }

  let score: number;

  try {
    score = assertValidMoodScore(input.moodScore);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Mood score validation failed.";
    throw new MoodEntryValidationError(message);
  }

  const entryDate = normalizeToUtcStartOfDay(input.entryDate ?? new Date());

  try {
    const existing = await db.moodEntry.findUnique({
      where: {
        userId_entryDate: {
          userId: input.userId,
          entryDate,
        },
      },
      select: { id: true },
    });

    const mood = await db.moodEntry.upsert({
      where: {
        userId_entryDate: {
          userId: input.userId,
          entryDate,
        },
      },
      update: {
        score,
        note: input.note?.trim() ? input.note.trim() : null,
      },
      create: {
        userId: input.userId,
        score,
        note: input.note?.trim() ? input.note.trim() : null,
        entryDate,
      },
    });

    const streak = await updateMoodStreak(input.userId, entryDate);

    return {
      entry: toMoodEntry(mood),
      streak,
      wasUpdated: Boolean(existing),
    };
  } catch (error) {
    if (error instanceof MoodEntryValidationError) {
      throw error;
    }

    console.error("Failed to persist mood entry", error);
    throw error;
  }
}
