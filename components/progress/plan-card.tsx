import type { Plan } from "@/features/plans/types";
import { PlanProgress } from "./plan-progress";

interface ToggleItemParams {
  planId: string;
  itemId: string;
}

interface PlanCardProps {
  plan: Plan;
  onToggleItem?: (params: ToggleItemParams) => void;
}

export function PlanCard({ plan, onToggleItem }: PlanCardProps) {
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
      {plan.items.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {plan.items.map((item) => (
            <li key={item.id} className="flex items-center gap-2">
              <button
                type="button"
                role="checkbox"
                aria-checked={item.completed}
                onClick={() => onToggleItem?.({ planId: plan.id, itemId: item.id })}
                className={`h-4 w-4 shrink-0 rounded border transition ${
                  item.completed
                    ? "border-emerald-500 bg-emerald-500"
                    : "border-slate-300 bg-white hover:border-emerald-400"
                }`}
                aria-label={item.label}
              />
              <span
                className={`text-sm transition ${
                  item.completed ? "text-slate-400 line-through" : "text-slate-700"
                }`}
              >
                {item.label}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}
