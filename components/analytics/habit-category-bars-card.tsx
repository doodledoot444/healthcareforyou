import type { AnalyticsOverviewPayload } from "@/lib/api/contracts";

interface HabitCategoryBarsCardProps {
  categories: AnalyticsOverviewPayload["habitsByCategory"];
}

export function HabitCategoryBarsCard({ categories }: HabitCategoryBarsCardProps) {
  const max = Math.max(1, ...categories.map((c) => c.count));

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-base font-semibold text-slate-900">Habit Completion by Category</h2>

      {categories.length === 0 ? (
        <p className="text-sm text-slate-500">No habit completion data in the last 30 days.</p>
      ) : (
        <div className="space-y-3">
          {categories.map((category) => (
            <div key={category.category} className="space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span className="font-medium">{category.category}</span>
                <span>{category.count}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-cyan-500"
                  style={{ width: `${Math.round((category.count / max) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
