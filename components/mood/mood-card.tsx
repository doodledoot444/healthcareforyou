import type { MoodEntry } from "@/features/mood/types";
import { moodToLabel } from "@/features/mood/utils";

export function MoodCard({ entry }: { entry: MoodEntry }) {
  return (
    <article className="rounded-2xl border border-zinc-200 bg-white p-5">
      <p className="text-sm text-zinc-500">Latest check-in</p>
      <h3 className="mt-1 text-xl font-semibold text-zinc-900">{moodToLabel(entry.mood)}</h3>
      <p className="mt-2 text-sm text-zinc-600">Score: {entry.score} / 5</p>
      <p className="text-xs text-zinc-500">{new Date(entry.createdAt).toLocaleDateString()}</p>
    </article>
  );
}
