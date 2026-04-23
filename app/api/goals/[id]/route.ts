import { z } from "zod";
import type { NextRequest } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api/response";
import { withValidation } from "@/lib/validate";
import { db } from "@/lib/db";

// ---------------------------------------------------------------------------
// PATCH /api/goals/[id] — update a goal
// ---------------------------------------------------------------------------

const patchBody = z.object({
  target: z.number().positive().max(1000).optional(),
  label: z.string().max(60).nullable().optional(),
  isActive: z.boolean().optional(),
});

const paramsSchema = z.object({
  id: z.string(),
});

export const PATCH = withValidation(
  { body: patchBody, params: paramsSchema },
  async (request: NextRequest, { params, body }) => {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) return apiError("Unauthorized", 401);

    const id = params.id;

    const existing = await db.wellnessGoal.findFirst({ where: { id, userId } });
    if (!existing) return apiError("Goal not found", 404);

    const updated = await db.wellnessGoal.update({
      where: { id },
      data: {
        ...(body.target !== undefined && { target: body.target }),
        ...(body.label !== undefined && { label: body.label }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
    });

    return apiSuccess({
      id: updated.id,
      goalType: updated.goalType,
      target: updated.target,
      period: updated.period,
      label: updated.label,
      isActive: updated.isActive,
      createdAt: updated.createdAt.toISOString(),
    });
  },
);

// ---------------------------------------------------------------------------
// DELETE /api/goals/[id] — permanently remove a goal
// ---------------------------------------------------------------------------

export const DELETE = withValidation(
  { params: paramsSchema },
  async (request: NextRequest, { params }) => {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) return apiError("Unauthorized", 401);

    const id = params.id;
    const existing = await db.wellnessGoal.findFirst({ where: { id, userId } });
    if (!existing) return apiError("Goal not found", 404);

    await db.wellnessGoal.delete({ where: { id } });

    return apiSuccess({ deleted: true });
  },
);
