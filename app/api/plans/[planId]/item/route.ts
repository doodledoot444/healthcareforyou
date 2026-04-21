import type { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api/response";
import type { PlanItemPatchPayload, PlanItemPatchRequest } from "@/lib/api/contracts";
import plansJson from "@/lib/data/plans.json";
import { setPlanItemCompletion, togglePlanItem } from "@/lib/store";
import type { PlanSeed } from "@/lib/api/contracts";

const planSeeds = plansJson as PlanSeed[];

/**
 * PATCH /api/plans/[planId]/item
 * Body: { itemId: string, completed?: boolean }
 * If `completed` is omitted, completion is toggled.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ planId: string }> },
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return apiError("Unauthorized", 401);
  }

  const { planId } = await params;
  const body = (await request.json().catch(() => null)) as PlanItemPatchRequest | null;

  if (!body || typeof body.itemId !== "string" || body.itemId.trim() === "") {
    return apiError("itemId is required", 400);
  }

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
      ? setPlanItemCompletion(session.user.id, body.itemId, body.completed)
      : togglePlanItem(session.user.id, body.itemId);

  const item = {
    id: itemSeed.id,
    label: itemSeed.label,
    completed,
  };

  return apiSuccess<PlanItemPatchPayload>({ planId, item });
}
