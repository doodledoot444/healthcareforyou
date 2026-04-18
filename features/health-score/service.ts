import type { MoodEntry } from "@/features/mood/types";
import { buildMoodAnalytics } from "@/features/analytics/service";
import { toPercentage } from "./utils";

export function calculateHealthScore(entries: MoodEntry[]): number {
  const analytics = buildMoodAnalytics(entries);
  return toPercentage(analytics.averageScore);
}
