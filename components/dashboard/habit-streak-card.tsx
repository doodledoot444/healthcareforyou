"use client";

import { useHabitStreak } from "@/hooks/use-habit-streak";
import type { HabitStreakPayload } from "@/lib/api/contracts";

// ---------------------------------------------------------------------------
// Badge config
// ---------------------------------------------------------------------------

const BADGE_ICONS: Record<string, string> = {
  first_habit: "⭐",
  habit_week: "🔥",
  habit_fortnight: "💪",
  habit_month: "🏆",
  habit_century: "🌟",
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StreakCounter({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <p className="text-2xl font-bold tabular-nums text-slate-900">{value}</p>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
    </div>
  );
}

function MilestoneBadge({
  badge,
}: {
  badge: HabitStreakPayload["milestones"][number];
}) {
  const icon = BADGE_ICONS[badge.badge] ?? "🎖️";

  return (
    <div
      title={`${badge.label}: ${badge.description}`}
      className={`flex flex-col items-center gap-1 rounded-xl border p-2.5 transition ${
        badge.unlocked
          ? "border-amber-200 bg-amber-50 text-amber-900"
          : "border-slate-100 bg-slate-50 text-slate-300"
      }`}
    >
      <span className={`text-xl ${badge.unlocked ? "" : "grayscale opacity-40"}`}>
        {icon}
      </span>
      <p className={`text-center text-[10px] font-semibold leading-tight ${badge.unlocked ? "text-amber-800" : "text-slate-400"}`}>
        {badge.label}
      </p>
      <p className={`text-[9px] font-medium ${badge.unlocked ? "text-amber-600" : "text-slate-300"}`}>
        {badge.threshold}d
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Progress to next milestone
// ---------------------------------------------------------------------------

function NextMilestoneBar({
  currentStreak,
  nextMilestoneAt,
}: {
  currentStreak: number;
  nextMilestoneAt: number | null;
}) {
  if (nextMilestoneAt === null) {
    return (
      <p className="text-center text-xs font-semibold text-amber-600">
        🌟 All milestones unlocked!
      </p>
    );
  }

  const pct = Math.min(100, Math.round((currentStreak / nextMilestoneAt) * 100));
  const remaining = nextMilestoneAt - currentStreak;

  return (
    <div>
      <div className="mb-1 flex justify-between text-[10px] text-slate-500">
        <span>Next milestone: {nextMilestoneAt} days</span>
        <span>{remaining} day{remaining === 1 ? "" : "s"} to go</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-amber-400 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function HabitStreakCard() {
  const { streak, isLoading } = useHabitStreak();

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-3 h-4 w-40 animate-pulse rounded bg-slate-100" />
        <div className="flex gap-4">
          <div className="h-14 w-20 animate-pulse rounded-xl bg-slate-100" />
          <div className="h-14 w-20 animate-pulse rounded-xl bg-slate-100" />
        </div>
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Habit Streak
          </p>
          <p className="mt-0.5 text-sm font-semibold text-slate-900">
            Daily habit consistency
          </p>
        </div>
        {streak.currentStreak >= 3 && (
          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-700">
            🔥 On a roll!
          </span>
        )}
      </div>

      {/* Current / Longest counter */}
      <div className="mt-4 flex items-center justify-around rounded-xl bg-slate-50 py-4">
        <StreakCounter value={streak.currentStreak} label="Current" />
        <div className="h-8 w-px bg-slate-200" />
        <StreakCounter value={streak.longestStreak} label="Best ever" />
        <div className="h-8 w-px bg-slate-200" />
        <StreakCounter
          value={streak.milestones.filter((m) => m.unlocked).length}
          label="Badges"
        />
      </div>

      {/* Next milestone progress */}
      <div className="mt-4">
        <NextMilestoneBar
          currentStreak={streak.longestStreak}
          nextMilestoneAt={streak.nextMilestoneAt}
        />
      </div>

      {/* Badge grid */}
      {streak.milestones.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Milestones
          </p>
          <div className="grid grid-cols-5 gap-2">
            {streak.milestones.map((badge) => (
              <MilestoneBadge key={badge.badge} badge={badge} />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {streak.currentStreak === 0 && (
        <p className="mt-3 text-center text-xs text-slate-400">
          Complete your first habit to start your streak!
        </p>
      )}
    </section>
  );
}
