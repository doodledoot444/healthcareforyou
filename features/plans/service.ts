import { buildMoodAnalytics } from "@/features/analytics/service";
import { getMoodStreakSnapshot, getRecentMoods } from "@/features/mood/queries";
import type { Plan, PlanLevel, PlansSnapshot } from "./types";

function clampPercentage(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function getPlanLevel(progressPercentage: number): PlanLevel {
  if (progressPercentage >= 75) {
    return "Advanced";
  }

  if (progressPercentage >= 50) {
    return "Focused";
  }

  if (progressPercentage >= 25) {
    return "Builder";
  }

  return "Starter";
}

function enrichPlan(base: Omit<Plan, "level">): Plan {
  return {
    ...base,
    progressPercentage: clampPercentage(base.progressPercentage),
    level: getPlanLevel(base.progressPercentage),
  };
}

export async function getPlansSnapshot(userId: string): Promise<PlansSnapshot> {
  const [moods, streak] = await Promise.all([getRecentMoods(userId, 60), getMoodStreakSnapshot(userId)]);
  const analytics = buildMoodAnalytics(moods);

  const plans = [
    enrichPlan({
      id: "reading",
      title: "Daily Reading Routine",
      category: "Reading",
      description: "Build a consistent reading habit for 20 minutes each day.",
      progressPercentage: moods.length * 5,
    }),
    enrichPlan({
      id: "self-improvement",
      title: "Self Improvement Sprint",
      category: "Self Improvement",
      description: "Stay consistent with your growth routine and maintain momentum.",
      progressPercentage: streak.currentStreak * 8,
    }),
    enrichPlan({
      id: "mindfulness",
      title: "Mindfulness Check-ins",
      category: "Mindfulness",
      description: "Practice mindful reflection and emotional awareness.",
      progressPercentage: analytics.averageScore * 20,
    }),
  ];

  const activePlan = plans.find((plan) => plan.progressPercentage < 100) ?? plans[0] ?? null;

  return {
    activePlan,
    plans,
  };
}
