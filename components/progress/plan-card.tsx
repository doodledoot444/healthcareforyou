import type { Plan } from "@/features/plans/types";
import { PlanProgress } from "./plan-progress";

interface PlanCardProps {
  plan: Plan;
}

export function PlanCard({ plan }: PlanCardProps) {
  return (
    <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-slate-900">{plan.title}</p>
        <span className="rounded-full bg-white px-2 py-1 text-xs font-medium text-slate-600">{plan.level}</span>
      </div>
      <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">{plan.category}</p>
      <p className="mt-2 text-sm text-slate-600">{plan.description}</p>
      <div className="mt-3">
        <PlanProgress percentage={plan.progressPercentage} />
      </div>
    </article>
  );
}
