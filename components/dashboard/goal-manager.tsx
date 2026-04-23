"use client";

import { useState } from "react";
import { useWellnessGoals } from "@/hooks/use-wellness-goals";
import { defaultTarget } from "@/lib/wellness-goals";
import type { WellnessGoalDto } from "@/lib/api/contracts";
import type { WellnessGoalType, WellnessGoalPeriod } from "@/lib/wellness-goals";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const GOAL_TYPE_OPTIONS: { value: WellnessGoalType; label: string; description: string }[] = [
  { value: "mood_avg", label: "Average mood score", description: "Daily mood avg (1–5)" },
  { value: "habit_days", label: "Active habit days", description: "Days with ≥1 habit completed" },
  { value: "journal_entries", label: "Journal entries", description: "Entries logged this period" },
  { value: "streak_days", label: "Streak days", description: "Current consecutive-day streak" },
];

// ---------------------------------------------------------------------------
// Add-goal form
// ---------------------------------------------------------------------------

function AddGoalForm({ onAdd, onClose }: { onAdd: () => void; onClose: () => void }) {
  const { addGoal } = useWellnessGoals();
  const [type, setType] = useState<WellnessGoalType>("mood_avg");
  const [period, setPeriod] = useState<WellnessGoalPeriod>("weekly");
  const [target, setTarget] = useState<number>(defaultTarget("mood_avg", "weekly"));
  const [label, setLabel] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function handleTypeChange(t: WellnessGoalType) {
    setType(t);
    setTarget(defaultTarget(t, period));
  }

  function handlePeriodChange(p: WellnessGoalPeriod) {
    setPeriod(p);
    setTarget(defaultTarget(type, p));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setSaving(true);
    try {
      await addGoal({
        goalType: type,
        target,
        period,
        label: label.trim() || undefined,
      });
      onAdd();
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Failed to create goal");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4"
    >
      <p className="text-sm font-semibold text-emerald-800">New goal</p>

      {/* Goal type */}
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">Type</label>
        <select
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          value={type}
          onChange={(e) => handleTypeChange(e.target.value as WellnessGoalType)}
        >
          {GOAL_TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label} — {o.description}
            </option>
          ))}
        </select>
      </div>

      {/* Period + target row */}
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="mb-1 block text-xs font-medium text-slate-600">Period</label>
          <select
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            value={period}
            onChange={(e) => handlePeriodChange(e.target.value as WellnessGoalPeriod)}
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-xs font-medium text-slate-600">Target</label>
          <input
            type="number"
            min={0.1}
            max={1000}
            step={type === "mood_avg" ? 0.1 : 1}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            value={target}
            onChange={(e) => setTarget(parseFloat(e.target.value))}
          />
        </div>
      </div>

      {/* Optional label */}
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">
          Custom label <span className="text-slate-400">(optional)</span>
        </label>
        <input
          type="text"
          maxLength={60}
          placeholder="e.g. Meditate daily"
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
      </div>

      {err && <p className="text-xs text-rose-600">{err}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 hover:bg-emerald-700 transition-colors"
        >
          {saving ? "Saving…" : "Add goal"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Goal list row
// ---------------------------------------------------------------------------

function GoalItem({ goal }: { goal: WellnessGoalDto }) {
  const { editGoal, removeGoal } = useWellnessGoals();
  const [removing, setRemoving] = useState(false);
  const [toggling, setToggling] = useState(false);

  async function handleToggle() {
    setToggling(true);
    try {
      await editGoal(goal.id, { isActive: !goal.isActive });
    } finally {
      setToggling(false);
    }
  }

  async function handleRemove() {
    if (!confirm("Delete this goal?")) return;
    setRemoving(true);
    try {
      await removeGoal(goal.id);
    } finally {
      setRemoving(false);
    }
  }

  const typeLabel = GOAL_TYPE_OPTIONS.find((o) => o.value === goal.goalType)?.label ?? goal.goalType;

  return (
    <div
      className={`flex items-center gap-3 rounded-xl border p-3 transition-opacity ${
        goal.isActive ? "border-slate-200 bg-white" : "border-slate-100 bg-slate-50 opacity-60"
      }`}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 truncate">
          {goal.label ?? typeLabel}
        </p>
        <p className="text-xs text-slate-500 capitalize">
          Target: {goal.target} · {goal.period}
        </p>
      </div>

      {/* Toggle active */}
      <button
        onClick={handleToggle}
        disabled={toggling}
        title={goal.isActive ? "Deactivate" : "Activate"}
        className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
          goal.isActive
            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
            : "bg-slate-100 text-slate-500 hover:bg-slate-200"
        }`}
      >
        {goal.isActive ? "Active" : "Paused"}
      </button>

      {/* Delete */}
      <button
        onClick={handleRemove}
        disabled={removing}
        title="Delete goal"
        className="rounded-full p-1 text-slate-400 hover:text-rose-500 transition-colors"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function GoalManager() {
  const { data, isLoading, error } = useWellnessGoals();
  const [showForm, setShowForm] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2].map((i) => (
          <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-100" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-slate-500">
        Could not load goals. Please refresh.
      </p>
    );
  }

  const goals = data?.goals ?? [];
  const activeCount = goals.filter((g) => g.isActive).length;
  const canAdd = activeCount < 5;

  return (
    <div className="space-y-3">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {activeCount} / 5 active goal{activeCount !== 1 ? "s" : ""}
        </p>
        {canAdd && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add goal
          </button>
        )}
        {!canAdd && (
          <span className="text-xs text-amber-600">Max goals reached</span>
        )}
      </div>

      {/* Add form */}
      {showForm && (
        <AddGoalForm
          onAdd={() => setShowForm(false)}
          onClose={() => setShowForm(false)}
        />
      )}

      {/* Goal list */}
      {goals.length === 0 && !showForm ? (
        <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center">
          <p className="text-sm text-slate-400">No goals yet. Add one to start tracking.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {goals.map((goal) => (
            <GoalItem key={goal.id} goal={goal} />
          ))}
        </div>
      )}
    </div>
  );
}
