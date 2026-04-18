import { evaluateAchievements } from "@/features/achievements/service";
import { getRecentMoods } from "@/features/mood/queries";
import { DEFAULT_DEMO_USER_ID } from "@/lib/constants";

export default async function AchievementsPage() {
  const moods = await getRecentMoods(DEFAULT_DEMO_USER_ID, 60);
  const achievements = evaluateAchievements(moods);

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold text-zinc-900">Achievements</h1>
        <p className="mt-2 text-zinc-600">Celebrate consistency and growth milestones.</p>
      </header>
      <ul className="space-y-3">
        {achievements.map((item) => (
          <li key={item.id} className="rounded-xl border border-zinc-200 bg-white p-4">
            <p className="font-semibold text-zinc-900">{item.title}</p>
            <p className="text-sm text-zinc-600">{item.description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
