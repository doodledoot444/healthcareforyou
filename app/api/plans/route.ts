import type { NextRequest } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth";
import plansJson from "@/lib/data/plans.json";
import { getCompletedItems } from "@/lib/store";
import { withValidation } from "@/lib/validate";
import type { Plan, PlanLevel } from "@/features/plans/types";
import type { PlanSeed, PlansPayload } from "@/lib/api/contracts";
import { apiError, apiSuccess } from "@/lib/api/response";

const planSeeds = plansJson as PlanSeed[];

function getPlanLevel(progressPercentage: number): PlanLevel {
  if (progressPercentage >= 75) return "Advanced";
  if (progressPercentage >= 50) return "Focused";
  if (progressPercentage >= 25) return "Builder";
  return "Starter";
}

/**
 * GET /api/plans
 * Returns all plans with item completion state and derived progress for the current user.
 */
export const GET = withValidation({}, async (request: NextRequest) => {
  const userId = await getAuthenticatedUserId(request);

  if (!userId) {
    return apiError("Unauthorized", 401);
  }

  const completedItems = await getCompletedItems(userId);

  const plans: Plan[] = planSeeds.map((template) => {
    const items = template.items.map((item) => ({
      ...item,
      completed: completedItems.has(item.id),
    }));

    const completedCount = items.filter((i) => i.completed).length;
    const progressPercentage =
      items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

    return {
      id: template.id,
      title: template.title,
      category: template.category,
      description: template.description,
      progressPercentage,
      level: getPlanLevel(progressPercentage),
      items,
    };
  });

  const activePlan = plans.find((p) => p.progressPercentage < 100) ?? plans[0] ?? null;

  return apiSuccess<PlansPayload>({ plans, activePlan });
});
