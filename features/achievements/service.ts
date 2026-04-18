import type { MoodEntry } from "@/features/mood/types";
import { ACHIEVEMENT_RULES } from "./config";

export interface Achievement {
  id: string;
  title: string;
  description: string;
}

export function evaluateAchievements(entries: MoodEntry[]): Achievement[] {
  return ACHIEVEMENT_RULES.filter((rule) => entries.length >= rule.threshold).map(
    (rule) => ({
      id: rule.id,
      title: rule.title,
      description: rule.description,
    }),
  );
}
