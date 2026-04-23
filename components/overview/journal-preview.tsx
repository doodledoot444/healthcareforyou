"use client";

import { PreviewCard } from "@/components/shared/preview-card";
import { useDashboardData } from "@/providers/dashboard-data-provider";

export function JournalPreview() {
  const { journalEntries, isJournalLoading } = useDashboardData();
  const recentEntries = journalEntries.slice(0, 3);

  return (
    <PreviewCard
      title="Journal"
      description="Review your latest reflections and continue writing."
      actionHref="/dashboard/journal"
      actionLabel="Open"
    >
      <div className="mt-4">
        {isJournalLoading ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : recentEntries.length === 0 ? (
          <p className="text-sm text-slate-600">No entries yet. Start your journal today.</p>
        ) : (
          <ul className="space-y-2">
            {recentEntries.map((entry) => (
              <li key={entry.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="line-clamp-2 text-sm text-slate-800">{entry.content}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </PreviewCard>
  );
}
