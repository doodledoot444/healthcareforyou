import type { MoodEntry } from "@/features/mood/types";
import { moodToLabel } from "@/features/mood/utils";

export function MoodCard({ entry }: { entry: MoodEntry }) {
  return (
    <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          Latest check-in
        </p>
        <span className="text-xs text-zinc-400">
          {new Date(entry.createdAt).toLocaleDateString()}
        </span>
      </div>

      <div className="mt-3">
        <h3 className="text-xl font-semibold text-zinc-900">
          {moodToLabel(entry.mood)}
        </h3>
        <p className="mt-1 text-sm text-zinc-600">
          Score: <span className="font-medium text-zinc-800">{entry.score}</span> / 5
        </p>
      </div>
    </article>
  );
}