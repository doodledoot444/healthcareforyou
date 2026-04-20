import type { MoodEntry } from "@/features/mood/types";
import { ACHIEVEMENT_RULES } from "./config";

export interface Achievement {
  id: string;
  title: string;
  description: string;
}

export interface EvaluatedAchievement extends Achievement {
  threshold: number;
  unlocked: boolean;
}

export function evaluateAchievements(entries: MoodEntry[]): EvaluatedAchievement[] {
  return ACHIEVEMENT_RULES.map((rule) => ({
    id: rule.id,
    title: rule.title,
    description: rule.description,
    threshold: rule.threshold,
    unlocked: entries.length >= rule.threshold,
  }));
}
