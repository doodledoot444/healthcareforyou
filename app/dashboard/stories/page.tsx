"use client";

import { DashboardSectionShell } from "@/components/shared/section-shell";
import { useStories } from "@/hooks/use-stories";

export default function DashboardStoriesPage() {
  const storiesQuery = useStories();

  return (
    <DashboardSectionShell
      title="Stories"
      description="Motivational stories and quotes curated for your daily momentum."
    >
      {storiesQuery.isLoading ? (
        <p className="text-sm text-slate-500">Loading stories...</p>
      ) : (
        <ul className="space-y-3">
          {(storiesQuery.data?.stories ?? []).map((story) => (
            <li key={story.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">{story.title}</p>
              <p className="mt-1 text-sm text-slate-600">{story.summary}</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">{story.content}</p>
              <p className="mt-2 text-xs text-slate-500">{story.author}</p>
            </li>
          ))}
        </ul>
      )}
    </DashboardSectionShell>
  );
}
