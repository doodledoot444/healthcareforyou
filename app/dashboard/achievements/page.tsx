import { evaluateAchievements } from "@/features/achievements/service";
import { getRecentMoods } from "@/features/mood/queries";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardSectionShell } from "@/components/shared/section-shell";

export default async function DashboardAchievementsPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  const moods = await getRecentMoods(currentUser.id, 60).catch(() => []);
  const achievements = evaluateAchievements(moods);

  return (
    <DashboardSectionShell title="Achievements" description="Celebrate consistency and growth milestones.">
      <ul className="space-y-3">
        {achievements.map((item) => (
          <li key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="font-semibold text-slate-900">{item.title}</p>
            <p className="text-sm text-slate-600">{item.description}</p>
            <p className="mt-1 text-xs text-slate-500">{item.unlocked ? "Unlocked" : "In progress"}</p>
          </li>
        ))}
      </ul>
    </DashboardSectionShell>
  );
}
