import { redirect } from "next/navigation";
import { DashboardSectionShell } from "@/components/shared/section-shell";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getRecentMoods } from "@/features/mood/queries";
import { getCompletedItems } from "@/lib/store";
import { computeHealthScore } from "@/features/health-score/service";
import { HealthScoreCard } from "@/components/dashboard/health-score-card";
import { GoalManager } from "@/components/dashboard/goal-manager";
import plansJson from "@/lib/data/plans.json";
import type { PlanSeed } from "@/lib/api/contracts";

const planSeeds = plansJson as PlanSeed[];

export default async function DashboardProfilePage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  const userId = currentUser.id;

  // Pre-compute reference date to avoid impure Date.now() call in parallel block
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setUTCDate(thirtyDaysAgo.getUTCDate() - 30);

  // Fetch all profile data in parallel
  const [userRecord, moodEntries, streakRecord, journalCount30d, completedItems] =
    await Promise.all([
      db.user
        .findUnique({ where: { id: userId }, select: { createdAt: true } })
        .catch(() => null),
      getRecentMoods(userId, 90),
      db.moodStreak
        .findUnique({ where: { userId }, select: { currentStreak: true } })
        .catch(() => null),
      db.journalEntry
        .count({
          where: {
            userId,
            createdAt: { gte: thirtyDaysAgo },
          },
        })
        .catch(() => 0),
      getCompletedItems(userId).catch(() => new Set<string>()),
    ]);

  // Plan completion ratio from seeds + completed items
  const totalItems = planSeeds.reduce((s, p) => s + p.items.length, 0);
  const completedCount = planSeeds.reduce(
    (s, p) => s + p.items.filter((item) => completedItems.has(item.id)).length,
    0,
  );
  const planCompletedRatio = totalItems === 0 ? 0 : completedCount / totalItems;

  const healthScore = computeHealthScore({
    moodEntries,
    currentStreak: streakRecord?.currentStreak ?? 0,
    journalCount30d,
    planCompletedRatio,
  });

  const displayName = currentUser.name || "Not set";
  const displayEmail = currentUser.email || "Not set";
  const joinedAt = userRecord?.createdAt
    ? new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(userRecord.createdAt)
    : "Unknown";

  return (
    <DashboardSectionShell title="Profile" description="Your account and adaptive health overview.">
      <div className="space-y-5">
        {/* Account details */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-700">
          <dl className="space-y-4">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Name</dt>
              <dd className="mt-1 text-sm text-slate-900">{displayName}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</dt>
              <dd className="mt-1 text-sm text-slate-900">{displayEmail}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Member since</dt>
              <dd className="mt-1 text-sm text-slate-900">{joinedAt}</dd>
            </div>
          </dl>
        </div>

        {/* Adaptive Health Score */}
        <HealthScoreCard result={healthScore} />

        {/* Personalized wellness goals manager */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-800">My Wellness Goals</h2>
          <GoalManager />
        </div>
      </div>
    </DashboardSectionShell>
  );
}
