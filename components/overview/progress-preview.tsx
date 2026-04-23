"use client";

import { useDashboardData } from "@/providers/dashboard-data-provider";
import { PreviewCard } from "@/components/shared/preview-card";
import { ProgressBar } from "@/components/shared/progress-bar";

export function ProgressPreview() {
  const { activePlan, isPlansLoading } = useDashboardData();

  return (
    <PreviewCard
      title="Progress"
      description="Track your active plan and completion percentage."
      actionHref="/dashboard/progress"
      actionLabel="Open"
    >
      <div className="mt-4">
        {isPlansLoading ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : !activePlan ? (
          <p className="text-sm text-slate-600">No active plans yet. Create your first plan to get started.</p>
        ) : (
          <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-slate-900">{activePlan.title}</p>
              <span className="rounded-full bg-white px-2 py-1 text-xs font-medium text-slate-600">{activePlan.level}</span>
            </div>
            <p className="text-xs uppercase tracking-wide text-slate-500">{activePlan.category}</p>
            <ProgressBar percentage={activePlan.progressPercentage} />
            <p className="text-sm text-slate-600">{activePlan.progressPercentage}% complete</p>
          </div>
        )}
      </div>
    </PreviewCard>
  );
}
