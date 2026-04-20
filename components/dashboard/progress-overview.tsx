import Link from "next/link";

interface ProgressOverviewProps {
  currentStreak: number;
  longestStreak: number;
  averageScore: number;
  entriesCount: number;
}

export function ProgressOverview({
  currentStreak,
  longestStreak,
  averageScore,
  entriesCount,
}: ProgressOverviewProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Progress</h2>
        <Link href="/dashboard/progress" className="text-sm font-medium text-cyan-700 hover:text-cyan-600">
          Open details
        </Link>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <div className="rounded-xl bg-emerald-50 px-3 py-2">
          <p className="text-xs text-emerald-700">Current streak</p>
          <p className="mt-1 font-semibold text-emerald-900">{currentStreak} days</p>
        </div>
        <div className="rounded-xl bg-cyan-50 px-3 py-2">
          <p className="text-xs text-cyan-700">Longest streak</p>
          <p className="mt-1 font-semibold text-cyan-900">{longestStreak} days</p>
        </div>
        <div className="rounded-xl bg-slate-100 px-3 py-2">
          <p className="text-xs text-slate-600">Average mood</p>
          <p className="mt-1 font-semibold text-slate-900">{averageScore.toFixed(2)} / 5</p>
        </div>
        <div className="rounded-xl bg-slate-100 px-3 py-2">
          <p className="text-xs text-slate-600">Entries</p>
          <p className="mt-1 font-semibold text-slate-900">{entriesCount}</p>
        </div>
      </div>
    </section>
  );
}
