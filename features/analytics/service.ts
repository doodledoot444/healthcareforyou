import type { MoodEntry } from "@/features/mood/types";
import type { MoodAnalytics } from "./types";
import { average, roundToTwo } from "./utils";

export function buildMoodAnalytics(entries: MoodEntry[]): MoodAnalytics {
  if (entries.length === 0) {
    return {
      averageScore: 0,
      minScore: 0,
      maxScore: 0,
      totalEntries: 0,
    };
  }

  const scores = entries.map((entry) => entry.score);

  return {
    averageScore: roundToTwo(average(scores)),
    minScore: Math.min(...scores),
    maxScore: Math.max(...scores),
    totalEntries: entries.length,
  };
}
