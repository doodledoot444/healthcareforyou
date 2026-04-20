import Link from "next/link";
import type { EvaluatedAchievement } from "@/features/achievements/service";

interface AchievementsOverviewProps {
  items: EvaluatedAchievement[];
}

export function AchievementsOverview({ items }: AchievementsOverviewProps) {
  const unlockedCount = items.filter((item) => item.unlocked).length;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Achievements</h2>
        <Link href="/dashboard/achievements" className="text-sm font-medium text-emerald-700 hover:text-emerald-600">
          View all
        </Link>
      </div>
      <p className="mt-2 text-sm text-slate-600">{unlockedCount} unlocked milestones so far.</p>
      <ul className="mt-4 space-y-2">
        {items.slice(0, 3).map((item) => (
          <li key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
            <span className="font-medium text-slate-900">{item.title}</span>
            <span className="ml-2 text-xs text-slate-500">{item.unlocked ? "Unlocked" : "In progress"}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
