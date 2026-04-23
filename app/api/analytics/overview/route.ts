import type { NextRequest } from "next/server";
import { withValidation } from "@/lib/validate";
import { apiError, apiSuccess } from "@/lib/api/response";
import type { AnalyticsOverviewPayload } from "@/lib/api/contracts";
import { getAuthenticatedUserId } from "@/lib/auth";
import { db } from "@/lib/db";
import { computeHabitStreak } from "@/lib/habit-streak";

export const revalidate = 900;

export const GET = withValidation({}, async (request: NextRequest) => {
  const userId = await getAuthenticatedUserId(request);
  if (!userId) return apiError("Unauthorized", 401);

  const thirtyDaysAgo = new Date(Date.now() - 30 * 86_400_000);

  const [
    moods30d,
    completions30d,
    completionsAll,
    journalCount30d,
    journalCountAllTime,
  ] = await Promise.all([
    db.moodEntry.findMany({
      where: { userId, entryDate: { gte: thirtyDaysAgo } },
      orderBy: { entryDate: "asc" },
      select: { entryDate: true, score: true },
    }),
    db.planCompletion.findMany({
      where: { userId, completedAt: { gte: thirtyDaysAgo } },
      include: { item: { include: { plan: true } } },
    }),
    db.planCompletion.findMany({
      where: { userId },
      select: { completedAt: true },
    }),
    db.journalEntry.count({
      where: { userId, createdAt: { gte: thirtyDaysAgo } },
    }),
    db.journalEntry.count({ where: { userId } }),
  ]);

  const moodTimeline = moods30d.map((m) => ({
    dateKey: m.entryDate.toISOString().slice(0, 10),
    score: m.score,
  }));

  const avgMood30d =
    moodTimeline.length === 0
      ? null
      : Number(
          (
            moodTimeline.reduce((sum, point) => sum + point.score, 0) /
            moodTimeline.length
          ).toFixed(2),
        );

  const activeHabitDays = new Set(
    completions30d.map((c) => c.completedAt.toISOString().slice(0, 10)),
  ).size;

  const categoryMap = new Map<string, number>();
  for (const completion of completions30d) {
    const category = completion.item.plan.category;
    categoryMap.set(category, (categoryMap.get(category) ?? 0) + 1);
  }

  const habitsByCategory = Array.from(categoryMap.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  const streakInput = completionsAll.map((c) => c.completedAt.toISOString().slice(0, 10));
  const streak = computeHabitStreak(streakInput);

  const payload: AnalyticsOverviewPayload = {
    moodTimeline,
    avgMood30d,
    habitActiveDays30d: activeHabitDays,
    habitsByCategory,
    currentHabitStreak: streak.currentStreak,
    longestHabitStreak: streak.longestStreak,
    journalCount30d,
    journalCountAllTime,
    habitCompletionsAllTime: completionsAll.length,
  };

  return apiSuccess<AnalyticsOverviewPayload>(payload);
});
