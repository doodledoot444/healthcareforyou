import type { Plan } from "@/features/plans/types";
import { PlanCard } from "./plan-card";

interface ToggleItemParams {
  planId: string;
  itemId: string;
}

interface YourPlanProps {
  activePlan: Plan | null;
  plans: Plan[];
  onToggleItem?: (params: ToggleItemParams) => void;
}

export function YourPlan({ activePlan, plans, onToggleItem }: YourPlanProps) {
  if (!activePlan || plans.length === 0) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Your Plan</h3>
        <p className="mt-2 text-sm text-slate-600">No active plans yet. Add your first plan to begin tracking progress.</p>
      </section>
    );
  }

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">Your Plan</h3>
        <p className="mt-1 text-sm text-slate-600">Track your active habits with category-based levels and clear progress.</p>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Active plan</p>
        <PlanCard plan={activePlan} onToggleItem={onToggleItem} />
      </div>

      {plans.filter((plan) => plan.id !== activePlan.id).length > 0 ? (
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Other plans</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {plans
              .filter((plan) => plan.id !== activePlan.id)
              .map((plan) => (
                <PlanCard key={plan.id} plan={plan} onToggleItem={onToggleItem} />
              ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
