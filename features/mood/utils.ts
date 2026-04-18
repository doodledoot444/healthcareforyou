import type { MoodLevel } from "./types";

export function scoreToMood(score: number): MoodLevel {
  if (score <= 1) return "very_low";
  if (score === 2) return "low";
  if (score === 3) return "neutral";
  if (score === 4) return "good";
  return "great";
}

export function assertValidMoodScore(score: number): number {
  if (!Number.isInteger(score) || score < 1 || score > 5) {
    throw new Error("Mood score must be an integer between 1 and 5.");
  }

  return score;
}

export function normalizeToUtcStartOfDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export function formatUtcDateKey(date: Date): string {
  return normalizeToUtcStartOfDay(date).toISOString().slice(0, 10);
}

export function moodToLabel(mood: MoodLevel): string {
  const labels: Record<MoodLevel, string> = {
    very_low: "Very Low",
    low: "Low",
    neutral: "Neutral",
    good: "Good",
    great: "Great",
  };

  return labels[mood];
}

export function dateKeyToUtcDate(dateKey: string): Date {
  return new Date(`${dateKey}T00:00:00.000Z`);
}
