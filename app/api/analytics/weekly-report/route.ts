import type { NextRequest } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api/response";
import { withValidation } from "@/lib/validate";
import { db } from "@/lib/db";
import { getRecentMoods, getMoodStreakSnapshot } from "@/features/mood/queries";
import { computeMoodPattern } from "@/lib/mood-patterns";
import { computeHabitStreak } from "@/lib/habit-streak";
import { computeWeeklyWellnessReport } from "@/lib/weekly-wellness-report";
import type { WeeklyReportPayload } from "@/lib/api/contracts";

/**
 * GET /api/analytics/weekly-report
 *
 * Returns a structured 7-day wellness summary covering mood, habits, journal,
 * and streak health with one actionable recommendation.
 * Cached for 1 hour — report window shifts only once per day.
 */
export const revalidate = 3600;

export const GET = withValidation({}, async (request: NextRequest) => {
  const userId = await getAuthenticatedUserId(request);

  if (!userId) {
    return apiError("Unauthorized", 401);
  }

  const sevenDaysAgo = new Date(Date.now() - 7 * 86_400_000);

  const [moodEntries, completions, journalEntries, moodStreak, habitCompletionKeys] =
    await Promise.all([
      // 14 days to cover this week + prior week for trend
      getRecentMoods(userId, 14),
      db.planCompletion.findMany({
        where: { userId, completedAt: { gte: sevenDaysAgo } },
        select: { completedAt: true, item: { include: { plan: { select: { category: true } } } } },
      }),
      db.journalEntry.findMany({
        where: { userId, createdAt: { gte: sevenDaysAgo } },
        select: { createdAt: true, content: true },
      }),
      getMoodStreakSnapshot(userId),
      // All-time completion dates for habit streak
      db.planCompletion.findMany({
        where: { userId },
        select: { completedAt: true },
        orderBy: { completedAt: "asc" },
      }),
    ]);

  const moodPattern = computeMoodPattern(moodEntries);

  // Habit streak engine
  const habitDateKeys = habitCompletionKeys.map((c) =>
    c.completedAt.toISOString().slice(0, 10),
  );
  const habitStreakResult = computeHabitStreak(habitDateKeys);

  // Build report input
  const moods = moodEntries.map((m) => ({
    dateKey: m.entryDate.slice(0, 10),
    score: m.score,
    note: m.note ?? null,
  }));

  const habitCompletionRecords = completions.map((c) => ({
    dateKey: c.completedAt.toISOString().slice(0, 10),
    category: c.item.plan.category,
  }));

  const journalRecords = journalEntries.map((j) => ({
    dateKey: j.createdAt.toISOString().slice(0, 10),
    charCount: j.content.length,
  }));

  const report = computeWeeklyWellnessReport({
    moods,
    habitCompletions: habitCompletionRecords,
    journalEntries: journalRecords,
    currentMoodStreak: moodStreak.currentStreak,
    currentHabitStreak: habitStreakResult.currentStreak,
    moodPattern,
  });

  return apiSuccess<WeeklyReportPayload>(report);
});
