import { planTemplates } from "@/data/plan-templates";
import type { Plan, PlanLevel, PlansSnapshot } from "./types";

function getPlanLevel(progressPercentage: number): PlanLevel {
  if (progressPercentage >= 75) return "Advanced";
  if (progressPercentage >= 50) return "Focused";
  if (progressPercentage >= 25) return "Builder";
  return "Starter";
}

/**
 * Returns plans with empty completion state (no user context).
 * Prefer the /api/plans route for user-specific completion data.
 */
export function getPlansSnapshot(_userId?: string): PlansSnapshot {
  const plans: Plan[] = planTemplates.map((template) => ({
    id: template.id,
    title: template.title,
    category: template.category,
    description: template.description,
    progressPercentage: 0,
    level: getPlanLevel(0),
    items: template.items.map((item) => ({ ...item, completed: false })),
  }));

  const activePlan = plans[0] ?? null;

  return { activePlan, plans };
}
