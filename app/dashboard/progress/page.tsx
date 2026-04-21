"use client";

import { usePlans } from "@/hooks/use-plans";
import { YourPlan } from "@/components/progress/your-plan";
import { DashboardSectionShell } from "@/components/shared/section-shell";

export default function DashboardProgressPage() {
  const { plans, activePlan, isLoading, toggleItem } = usePlans();

  return (
    <div className="space-y-4">
      {isLoading ? (
        <DashboardSectionShell title="Your Plan" description="Loading your plans…">
          <p className="text-sm text-slate-500">Loading…</p>
        </DashboardSectionShell>
      ) : (
        <YourPlan activePlan={activePlan} plans={plans} onToggleItem={toggleItem} />
      )}
    </div>
  );
}
