import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCompletedItems, getJournalEntries, getSessionParticipationCount } from "@/lib/store";
import { ACHIEVEMENT_RULES } from "@/features/achievements/config";
import { apiError, apiSuccess } from "@/lib/api/response";
import type { AchievementsPayload } from "@/lib/api/contracts";

/**
 * GET /api/achievements
 * Returns achievements derived dynamically from plan completions and journal activity.
 * No manual updates needed — computed fresh on each request.
 */
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return apiError("Unauthorized", 401);
  }

  const completedItems = getCompletedItems(session.user.id);
  const journalEntries = getJournalEntries(session.user.id);
  const sessionParticipations = getSessionParticipationCount(session.user.id);

  // Derived engagement from plan completion + journal activity + participation days.
  const engagementScore = completedItems.size + journalEntries.length + sessionParticipations;

  const achievements = ACHIEVEMENT_RULES.map((rule) => ({
    id: rule.id,
    title: rule.title,
    description: rule.description,
    threshold: rule.threshold,
    unlocked: engagementScore >= rule.threshold,
  }));

  return apiSuccess<AchievementsPayload>({
    achievements,
    metrics: {
      completedPlanItems: completedItems.size,
      journalEntries: journalEntries.length,
      sessionParticipations,
    },
  });
}
