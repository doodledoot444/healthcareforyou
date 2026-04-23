import type { MoodEntry } from "@/features/mood/types";

export function MoodChart({
  entries,
  isLoading = false,
}: {
  entries: MoodEntry[];
  isLoading?: boolean;
}) {
  const recentEntries = entries.slice(-10);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900">Mood Trend</h2>
        <span className="text-xs text-zinc-500">Last 10 entries</span>
      </div>

      <div className="mt-5 space-y-3">
        {isLoading ? (
          <p className="text-sm text-zinc-500">Loading mood trend…</p>
        ) : recentEntries.length === 0 ? (
          <p className="text-sm text-zinc-600">
            No mood entries yet. Your trend will appear after your first check-in.
          </p>
        ) : (
          recentEntries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center gap-3 text-sm"
            >
              <span className="w-24 text-xs text-zinc-500">
                {new Date(entry.createdAt).toLocaleDateString()}
              </span>

              <div className="h-3 flex-1 overflow-hidden rounded-full bg-zinc-100">
                <div
                  className="h-full rounded-full bg-teal-500 transition-all"
                  style={{ width: `${(entry.score / 5) * 100}%` }}
                />
              </div>

              <span className="w-8 text-right font-medium text-zinc-800">
                {entry.score}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}