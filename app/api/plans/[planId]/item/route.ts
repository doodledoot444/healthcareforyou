import type { NextRequest } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api/response";
import { withValidation } from "@/lib/validate";
import { planItemPatchSchema, planParamsSchema } from "@/lib/validators/plans";
import type { PlanItemPatchPayload } from "@/lib/api/contracts";
import plansJson from "@/lib/data/plans.json";
import { setPlanItemCompletion, togglePlanItem } from "@/lib/store";
import type { PlanSeed } from "@/lib/api/contracts";

const planSeeds = plansJson as PlanSeed[];

/**
 * PATCH /api/plans/[planId]/item
 * Body: { itemId: string, completed?: boolean }
 * If `completed` is omitted, completion is toggled.
 */
export const PATCH = withValidation(
  { params: planParamsSchema, body: planItemPatchSchema },
  async (request: NextRequest, { params, body }) => {
  const userId = await getAuthenticatedUserId(request);

  if (!userId) {
    return apiError("Unauthorized", 401);
  }

  const { planId } = params;

  const seed = planSeeds.find((plan) => plan.id === planId);

  if (!seed) {
    return apiError("Plan not found", 404);
  }

  const itemSeed = seed.items.find((item) => item.id === body.itemId);

  if (!itemSeed) {
    return apiError("Plan item not found", 404);
  }

  const completed =
    typeof body.completed === "boolean"
      ? await setPlanItemCompletion(userId, body.itemId, body.completed)
      : await togglePlanItem(userId, body.itemId);

  const item = {
    id: itemSeed.id,
    label: itemSeed.label,
    completed,
  };

  return apiSuccess<PlanItemPatchPayload>({ planId, item });
  },
);
