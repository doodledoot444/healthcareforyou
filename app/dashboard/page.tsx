import { AchievementsOverview } from "@/components/dashboard/achievements-overview";
import { ProfileOverview } from "@/components/dashboard/profile-overview";
import { ProgressOverview } from "@/components/dashboard/progress-overview";
import { evaluateAchievements } from "@/features/achievements/service";
import { buildMoodAnalytics } from "@/features/analytics/service";
import { getMoodStreakSnapshot, getRecentMoods } from "@/features/mood/queries";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function DashboardPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return null;
  }

  const [userRecord, moods, streak] = await Promise.all([
    db.user.findUnique({
      where: { id: currentUser.id },
      select: {
        createdAt: true,
      },
    }),
    getRecentMoods(currentUser.id, 60),
    getMoodStreakSnapshot(currentUser.id),
  ]);

  const achievements = evaluateAchievements(moods);
  const analytics = buildMoodAnalytics(moods);

  const joinedAt = userRecord?.createdAt
    ? new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(userRecord.createdAt)
    : "Unknown";

  return (
    <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <ProfileOverview
        name={currentUser.name ?? "Not set"}
        email={currentUser.email ?? "Not set"}
        joinedAt={joinedAt}
      />
      <AchievementsOverview items={achievements} />
      <ProgressOverview
        currentStreak={streak.currentStreak}
        longestStreak={streak.longestStreak}
        averageScore={analytics.averageScore}
        entriesCount={analytics.totalEntries}
      />
    </section>
  );
}
