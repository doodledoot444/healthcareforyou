import type { NextRequest } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api/response";
import { withValidation } from "@/lib/validate";
import { db } from "@/lib/db";
import { getRecentMoods } from "@/features/mood/queries";
import { computeHabitInsights } from "@/lib/habit-insights";
import { computeHabitRecommendations } from "@/lib/habit-recommendations";
import { planTemplates } from "@/data/plan-templates";
import type { HabitRecommendationsPayload } from "@/lib/api/contracts";
import type { PlanItemSeed } from "@/lib/habit-recommendations";

/**
 * GET /api/recommendations/habits
 *
 * Returns top 5 habit recommendations ranked by mood-lift potential,
 * goal alignment, and recency. Cached for 15 minutes.
 */
export const revalidate = 900;

export const GET = withValidation({}, async (request: NextRequest) => {
  const userId = await getAuthenticatedUserId(request);
  if (!userId) return apiError("Unauthorized", 401);

  const sevenDaysAgo = new Date(Date.now() - 7 * 86_400_000);
  const ninetyDaysAgo = new Date(Date.now() - 90 * 86_400_000);

  const [moodEntries, recentCompletions, insightCompletions, activeGoals] = await Promise.all([
    getRecentMoods(userId, 90),
    // Last 7-day completions for recency scoring
    db.planCompletion.findMany({
      where: { userId, completedAt: { gte: sevenDaysAgo } },
      select: { itemId: true, completedAt: true },
    }),
    // Last 90-day completions for mood lift insights
    db.planCompletion.findMany({
      where: { userId, completedAt: { gte: ninetyDaysAgo } },
      include: { item: { include: { plan: true } } },
    }),
    // Active wellness goals for goal-alignment scoring
    db.wellnessGoal.findMany({
      where: { userId, isActive: true },
      select: { goalType: true, target: true },
    }),
  ]);

  // ---------------------------------------------------------------------------
  // Build insight records for moodLift computation
  // ---------------------------------------------------------------------------
  const completionRecords = insightCompletions.map((c) => ({
    dateKey: c.completedAt.toISOString().slice(0, 10),
    habitId: c.itemId,
    habitLabel: c.item.label,
    category: c.item.plan.category,
  }));

  const dailyMoods = moodEntries.map((m) => ({
    dateKey: m.entryDate.slice(0, 10),
    score: m.score,
  }));

  const insights = computeHabitInsights(completionRecords, dailyMoods);

  // ---------------------------------------------------------------------------
  // Build recent completions map: habitId → dateKeys[]
  // ---------------------------------------------------------------------------
  const recentByHabit = new Map<string, string[]>();
  for (const c of recentCompletions) {
    const dk = c.completedAt.toISOString().slice(0, 10);
    if (!recentByHabit.has(c.itemId)) recentByHabit.set(c.itemId, []);
    recentByHabit.get(c.itemId)!.push(dk);
  }

  // ---------------------------------------------------------------------------
  // Category completion counts (last 7 days) for gap detection
  // ---------------------------------------------------------------------------
  const categoryCountMap = new Map<string, number>();
  for (const c of recentCompletions) {
    const found = insightCompletions.find((ic) => ic.itemId === c.itemId);
    const cat = found?.item.plan.category ?? "Unknown";
    categoryCountMap.set(cat, (categoryCountMap.get(cat) ?? 0) + 1);
  }

  // ---------------------------------------------------------------------------
  // Check if user is behind on habit_days goal
  // ---------------------------------------------------------------------------
  const habitDaysGoal = activeGoals.find((g) => g.goalType === "habit_days");
  const activeDaysThisWeek = new Set(
    recentCompletions.map((c) => c.completedAt.toISOString().slice(0, 10)),
  ).size;
  const isBehindHabitGoal =
    habitDaysGoal !== null &&
    habitDaysGoal !== undefined &&
    activeDaysThisWeek < habitDaysGoal.target * 0.6;

  // ---------------------------------------------------------------------------
  // Flatten plan templates into PlanItemSeed list
  // ---------------------------------------------------------------------------
  const allItems: PlanItemSeed[] = planTemplates.flatMap((plan) =>
    plan.items.map((item) => ({
      id: item.id,
      label: item.label,
      planId: plan.id,
      planTitle: plan.title,
      category: plan.category,
    })),
  );

  // ---------------------------------------------------------------------------
  // Compute recommendations
  // ---------------------------------------------------------------------------
  const recommendations = computeHabitRecommendations({
    allItems,
    recentCompletionsByHabit: recentByHabit,
    habitInsights: insights.topHabits,
    isBehindHabitGoal,
    categoryCompletionCounts: categoryCountMap,
    maxResults: 5,
  });

  return apiSuccess<HabitRecommendationsPayload>({
    recommendations,
    generatedAt: new Date().toISOString(),
  });
});
