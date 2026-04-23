"use client";

import { useMemo, useState } from "react";
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
  const [viewMode, setViewMode] = useState<"focus" | "all">("focus");

  const allItemsCount = useMemo(() => plans.reduce((count, plan) => count + plan.items.length, 0), [plans]);
  const completedItemsCount = useMemo(
    () => plans.reduce((count, plan) => count + plan.items.filter((item) => item.completed).length, 0),
    [plans]
  );
  const globalProgress = allItemsCount > 0 ? Math.round((completedItemsCount / allItemsCount) * 100) : 0;

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
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Your Plan</h3>
            <p className="mt-1 text-sm text-slate-600">
              Dynamic habit momentum based on completed actions and plan focus.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => setViewMode("focus")}
              className={`rounded-full border px-3 py-1 transition ${
                viewMode === "focus"
                  ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                  : "border-slate-300 bg-white text-slate-600 hover:bg-slate-100"
              }`}
            >
              Focus mode
            </button>
            <button
              type="button"
              onClick={() => setViewMode("all")}
              className={`rounded-full border px-3 py-1 transition ${
                viewMode === "all"
                  ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                  : "border-slate-300 bg-white text-slate-600 hover:bg-slate-100"
              }`}
            >
              All plans
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="flex items-center justify-between gap-2 text-sm">
            <p className="font-medium text-slate-700">Global habit momentum</p>
            <p className="font-semibold text-slate-900">{globalProgress}%</p>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${globalProgress}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-slate-600">
            {completedItemsCount}/{allItemsCount} completed tasks across all plans.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {viewMode === "focus" ? "Active plan" : "All plans"}
        </p>
        <PlanCard plan={activePlan} onToggleItem={onToggleItem} />
      </div>

      {viewMode === "all" && plans.filter((plan) => plan.id !== activePlan.id).length > 0 ? (
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
