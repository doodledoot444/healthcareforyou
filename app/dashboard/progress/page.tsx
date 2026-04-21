import { MoodChart } from "@/components/mood/mood-chart";
import { YourPlan } from "@/components/progress/your-plan";
import { DashboardSectionShell } from "@/components/shared/section-shell";
import { getRecentMoods } from "@/features/mood/queries";
import { getPlansSnapshot } from "@/features/plans/service";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardProgressPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  const [moods, planSnapshot] = await Promise.all([getRecentMoods(currentUser.id, 60), getPlansSnapshot(currentUser.id)]);

  return (
    <div className="space-y-4">
      <YourPlan activePlan={planSnapshot.activePlan} plans={planSnapshot.plans} />
      <DashboardSectionShell
        title="Mood Trend"
        description="Monitor your mood pattern across the last 60 days."
      >
        <MoodChart entries={moods} />
      </DashboardSectionShell>
    </div>
  );
}
