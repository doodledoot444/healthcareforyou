interface AnalyticsKpiGridProps {
  habitActiveDays30d: number;
  currentHabitStreak: number;
  longestHabitStreak: number;
  journalCount30d: number;
  journalCountAllTime: number;
  habitCompletionsAllTime: number;
}

function KpiCard({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className={`rounded-xl border p-4 ${tone}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}

export function AnalyticsKpiGrid({
  habitActiveDays30d,
  currentHabitStreak,
  longestHabitStreak,
  journalCount30d,
  journalCountAllTime,
  habitCompletionsAllTime,
}: AnalyticsKpiGridProps) {
  return (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <KpiCard label="Active Habit Days (30d)" value={String(habitActiveDays30d)} tone="border-cyan-100 bg-cyan-50/50" />
      <KpiCard label="Current Habit Streak" value={`${currentHabitStreak} days`} tone="border-emerald-100 bg-emerald-50/50" />
      <KpiCard label="Longest Habit Streak" value={`${longestHabitStreak} days`} tone="border-teal-100 bg-teal-50/50" />
      <KpiCard label="Journal Entries (30d)" value={String(journalCount30d)} tone="border-sky-100 bg-sky-50/50" />
      <KpiCard label="Journal Entries (All-Time)" value={String(journalCountAllTime)} tone="border-indigo-100 bg-indigo-50/50" />
      <KpiCard label="Habit Completions (All-Time)" value={String(habitCompletionsAllTime)} tone="border-amber-100 bg-amber-50/50" />
    </section>
  );
}
