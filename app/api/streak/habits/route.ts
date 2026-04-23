import type { NextRequest } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api/response";
import { withValidation } from "@/lib/validate";
import { db } from "@/lib/db";
import { computeHabitStreak } from "@/lib/habit-streak";
import type { HabitStreakPayload } from "@/lib/api/contracts";

/**
 * GET /api/streak/habits
 *
 * Returns the user's consecutive-day habit completion streak plus milestone badges.
 * A "completion day" is any UTC calendar day where the user completed at least
 * one PlanItem. Milestones are evaluated against the longest-ever streak so they
 * survive an accidental break.
 *
 * This route is cached for 5 minutes to avoid repeated DB queries on page reload.
 */
export const revalidate = 300;

export const GET = withValidation({}, async (request: NextRequest) => {
  const userId = await getAuthenticatedUserId(request);

  if (!userId) {
    return apiError("Unauthorized", 401);
  }

  // Fetch all completion timestamps for this user
  const completions = await db.planCompletion.findMany({
    where: { userId },
    select: { completedAt: true },
    orderBy: { completedAt: "asc" },
  });

  // Map to UTC date keys (yyyy-mm-dd) — dedup handled inside engine
  const dateKeys = completions.map((c) =>
    c.completedAt.toISOString().slice(0, 10),
  );

  const result = computeHabitStreak(dateKeys);

  return apiSuccess<HabitStreakPayload>(result);
});
