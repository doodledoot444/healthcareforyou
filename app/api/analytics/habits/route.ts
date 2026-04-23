import type { NextRequest } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api/response";
import { withValidation } from "@/lib/validate";
import { db } from "@/lib/db";
import { getRecentMoods } from "@/features/mood/queries";
import { computeHabitInsights } from "@/lib/habit-insights";
import type { HabitInsightsPayload } from "@/lib/api/contracts";

/**
 * GET /api/analytics/habits
 *
 * Returns per-habit and per-category mood lift analysis for the last 90 days.
 * Cached for 10 minutes — insights are slow-moving and expensive to compute.
 */
export const revalidate = 600;

export const GET = withValidation({}, async (request: NextRequest) => {
  const userId = await getAuthenticatedUserId(request);

  if (!userId) {
    return apiError("Unauthorized", 401);
  }

  // Fetch mood entries (90 days for statistically meaningful sample)
  const [moodEntries, completions] = await Promise.all([
    getRecentMoods(userId, 90),
    db.planCompletion.findMany({
      where: {
        userId,
        completedAt: {
          gte: new Date(Date.now() - 90 * 86_400_000),
        },
      },
      include: {
        item: {
          include: { plan: true },
        },
      },
    }),
  ]);

  const completionRecords = completions.map((c) => ({
    dateKey: c.completedAt.toISOString().slice(0, 10),
    habitId: c.itemId,
    habitLabel: c.item.label,
    category: c.item.plan.category,
  }));

  const dailyMoods = moodEntries.map((m) => ({
    dateKey: m.entryDate.slice(0, 10),
    score: m.score,
  }));

  const result = computeHabitInsights(completionRecords, dailyMoods);

  return apiSuccess<HabitInsightsPayload>(result);
});
