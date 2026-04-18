import type { MoodEntry } from "@/features/mood/types";

export function MoodChart({ entries }: { entries: MoodEntry[] }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5">
      <h2 className="text-lg font-semibold text-zinc-900">Mood Trend</h2>
      <div className="mt-5 space-y-2">
        {entries.slice(-10).map((entry) => (
          <div key={entry.id} className="flex items-center gap-3 text-sm text-zinc-700">
            <span className="w-24 text-xs text-zinc-500">{new Date(entry.createdAt).toLocaleDateString()}</span>
            <div className="h-3 flex-1 rounded-full bg-zinc-100">
              <div
                className="h-3 rounded-full bg-teal-500"
                style={{ width: `${(entry.score / 5) * 100}%` }}
              />
            </div>
            <span className="w-8 text-right font-medium">{entry.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
