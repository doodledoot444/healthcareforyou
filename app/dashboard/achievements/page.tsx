import { evaluateAchievements } from "@/features/achievements/service";
import { getRecentMoods } from "@/features/mood/queries";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AchievementsPointsBoard } from "@/components/achievements/achievements-points-board";
import { DashboardSectionShell } from "@/components/shared/section-shell";

export default async function DashboardAchievementsPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  const moods = await getRecentMoods(currentUser.id, 60).catch(() => []);
  const achievements = evaluateAchievements(moods);

  return (
    <DashboardSectionShell
      title="Achievements"
      description="Track how each mood check-in converts into points, streak momentum, and milestone progress."
    >
      <AchievementsPointsBoard achievements={achievements} moods={moods} />
    </DashboardSectionShell>
  );
}
