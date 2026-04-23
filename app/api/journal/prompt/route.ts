import type { NextRequest } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api/response";
import { withValidation } from "@/lib/validate";
import { getLatestMoodEntry, getMoodStreakSnapshot, getRecentMoods } from "@/features/mood/queries";
import { computeMoodPattern } from "@/lib/mood-patterns";
import { computeSmartJournalPrompt } from "@/lib/journal-prompts";
import { db } from "@/lib/db";
import type { JournalPromptPayload } from "@/lib/api/contracts";

/**
 * Cache the prompt response for 1 hour per user.
 * Ensures stable selection per user/hour without hammering the endpoint.
 */
export const revalidate = 3600;

/**
 * GET /api/journal/prompt
 *
 * Returns one context-aware journal prompt plus a small set of alternatives.
 * Prompt is stable per user/hour via deterministic selection in the prompt engine.
 */
export const GET = withValidation({}, async (request: NextRequest) => {
  const userId = await getAuthenticatedUserId(request);

  if (!userId) {
    return apiError("Unauthorized", 401);
  }

  const [latestMoodEntry, recentMoods, streak, journalCountToday] = await Promise.all([
    getLatestMoodEntry(userId),
    getRecentMoods(userId, 30),
    getMoodStreakSnapshot(userId),
    db.journalEntry
      .count({
        where: {
          userId,
          createdAt: {
            gte: new Date(new Date().setUTCHours(0, 0, 0, 0)),
          },
        },
      })
      .catch(() => 0),
  ]);

  const moodPattern = computeMoodPattern(recentMoods);

  const result = computeSmartJournalPrompt({
    userId,
    latestMoodScore: latestMoodEntry?.score ?? null,
    moodPattern,
    currentStreak: streak.currentStreak,
    journalCountToday,
  });

  return apiSuccess<JournalPromptPayload>(result);
});
