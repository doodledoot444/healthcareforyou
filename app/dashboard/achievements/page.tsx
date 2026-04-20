import { evaluateAchievements } from "@/features/achievements/service";
import { getRecentMoods } from "@/features/mood/queries";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardAchievementsPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  const moods = await getRecentMoods(currentUser.id, 60);
  const achievements = evaluateAchievements(moods);

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <header>
        <h2 className="text-xl font-semibold text-slate-900">Achievements</h2>
        <p className="mt-1 text-sm text-slate-600">Celebrate consistency and growth milestones.</p>
      </header>
      <ul className="space-y-3">
        {achievements.map((item) => (
          <li key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="font-semibold text-slate-900">{item.title}</p>
            <p className="text-sm text-slate-600">{item.description}</p>
            <p className="mt-1 text-xs text-slate-500">{item.unlocked ? "Unlocked" : "In progress"}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
