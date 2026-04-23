"use client";

import { useWellnessGoals } from "@/hooks/use-wellness-goals";
import type { EvaluatedGoalDto } from "@/lib/api/contracts";

// ---------------------------------------------------------------------------
// Status colours
// ---------------------------------------------------------------------------

const STATUS_CONFIG = {
  achieved: {
    bar: "bg-emerald-500",
    badge: "bg-emerald-100 text-emerald-700",
    label: "Achieved",
  },
  on_track: {
    bar: "bg-sky-500",
    badge: "bg-sky-100 text-sky-700",
    label: "On track",
  },
  at_risk: {
    bar: "bg-amber-500",
    badge: "bg-amber-100 text-amber-700",
    label: "At risk",
  },
  behind: {
    bar: "bg-rose-400",
    badge: "bg-rose-100 text-rose-700",
    label: "Behind",
  },
} as const;

// ---------------------------------------------------------------------------
// Single goal row
// ---------------------------------------------------------------------------

function GoalRow({ goal }: { goal: EvaluatedGoalDto }) {
  const cfg = STATUS_CONFIG[goal.status];
  const pct = Math.round(goal.progress * 100);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-slate-700 truncate">{goal.label}</span>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${cfg.badge}`}>
          {cfg.label}
        </span>
      </div>

      {/* Progress bar */}
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all duration-500 ${cfg.bar}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{goal.progressLabel} {goal.unit}</span>
        <span className="capitalize">{goal.period}</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyGoals() {
  return (
    <div className="flex flex-col items-center gap-2 py-6 text-center">
      <p className="text-sm text-slate-500">No active goals yet.</p>
      <p className="text-xs text-slate-400">
        Set a goal below to start tracking your progress.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main card
// ---------------------------------------------------------------------------

export function GoalProgressCard() {
  const { data, isLoading, error } = useWellnessGoals();

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 h-5 w-36 animate-pulse rounded bg-slate-100" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  if (error) return null;

  const evaluated = data?.evaluated ?? [];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-800">Wellness Goals</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {evaluated.length} active goal{evaluated.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Summary pill */}
        {evaluated.length > 0 && (
          <div className="flex items-center gap-1">
            {(["achieved", "on_track", "at_risk", "behind"] as const).map((s) => {
              const count = evaluated.filter((g) => g.status === s).length;
              if (count === 0) return null;
              const { badge } = STATUS_CONFIG[s];
              return (
                <span key={s} className={`rounded-full px-2 py-0.5 text-xs font-semibold ${badge}`}>
                  {count}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Goal rows */}
      {evaluated.length === 0 ? (
        <EmptyGoals />
      ) : (
        <div className="space-y-4">
          {evaluated.map((goal) => (
            <GoalRow key={goal.id} goal={goal} />
          ))}
        </div>
      )}
    </div>
  );
}
