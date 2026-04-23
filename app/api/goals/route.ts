import { z } from "zod";
import type { NextRequest } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api/response";
import { withValidation } from "@/lib/validate";
import { db } from "@/lib/db";
import { getRecentMoods } from "@/features/mood/queries";
import { computeHabitStreak } from "@/lib/habit-streak";
import { evaluateWellnessGoals } from "@/lib/wellness-goals";
import type { GoalsPayload, WellnessGoalDto, EvaluatedGoalDto, GoalCreateRequest } from "@/lib/api/contracts";
import type { WellnessGoalRecord } from "@/lib/wellness-goals"

// ---------------------------------------------------------------------------
// Validation schemas
// ---------------------------------------------------------------------------

const GOAL_TYPES = ["mood_avg", "habit_days", "journal_entries", "streak_days"] as const;
const PERIODS = ["weekly", "monthly"] as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toDto(goal: {
  id: string;
  goalType: string;
  target: number;
  period: string;
  label: string | null;
  isActive: boolean;
  createdAt: Date;
}): WellnessGoalDto {
  return {
    id: goal.id,
    goalType: goal.goalType,
    target: goal.target,
    period: goal.period,
    label: goal.label,
    isActive: goal.isActive,
    createdAt: goal.createdAt.toISOString(),
  };
}

async function buildMetrics(userId: string, period: string) {
  const days = period === "monthly" ? 30 : 7;
  const cutoff = new Date(Date.now() - days * 86_400_000);

  const [moodEntries, habitCompletions, journalCount, habitDateKeys] = await Promise.all([
    getRecentMoods(userId, days),
    db.planCompletion.findMany({
      where: { userId, completedAt: { gte: cutoff } },
      select: { completedAt: true },
    }),
    db.journalEntry.count({
      where: { userId, createdAt: { gte: cutoff } },
    }),
    db.planCompletion.findMany({
      where: { userId },
      select: { completedAt: true },
    }),
  ]);

  const moodAvg =
    moodEntries.length > 0
      ? moodEntries.reduce((s, e) => s + e.score, 0) / moodEntries.length
      : null;

  const habitDayKeys = Array.from(
    new Set(habitCompletions.map((c) => c.completedAt.toISOString().slice(0, 10))),
  );
  const habitDays = habitDayKeys.length;

  const allHabitKeys = habitDateKeys.map((c) => c.completedAt.toISOString().slice(0, 10));
  const habitStreak = computeHabitStreak(allHabitKeys).currentStreak;

  return {
    moodAvg: moodAvg !== null ? Math.round(moodAvg * 10) / 10 : null,
    habitDays,
    journalEntries: journalCount,
    streakDays: habitStreak,
  };
}

// ---------------------------------------------------------------------------
// GET /api/goals — list all goals with evaluated progress
// ---------------------------------------------------------------------------

export const GET = withValidation({}, async (request: NextRequest) => {
  const userId = await getAuthenticatedUserId(request);
  if (!userId) return apiError("Unauthorized", 401);

  const goals = await db.wellnessGoal.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });

  if (goals.length === 0) {
    return apiSuccess<GoalsPayload>({ goals: [], evaluated: [] });
  }

  // Use the most common period to drive metrics window
  const dominantPeriod = goals.filter((g) => g.isActive).some((g) => g.period === "monthly")
    ? "monthly"
    : "weekly";

  const metrics = await buildMetrics(userId, dominantPeriod);

  const activeGoalRecords: WellnessGoalRecord[] = goals
    .filter((g) => g.isActive)
    .map((g) => ({
      id: g.id,
      goalType: g.goalType as WellnessGoalRecord["goalType"],
      target: g.target,
      period: g.period as WellnessGoalRecord["period"],
      label: g.label,
      isActive: g.isActive,
    }));

  const evaluated = evaluateWellnessGoals(activeGoalRecords, metrics);

  return apiSuccess<GoalsPayload>({
    goals: goals.map(toDto),
    evaluated: evaluated as EvaluatedGoalDto[],
  });
});

// ---------------------------------------------------------------------------
// POST /api/goals — create a new goal (max 5 active goals per user)
// ---------------------------------------------------------------------------

const postBody = z.object({
  goalType: z.enum(GOAL_TYPES),
  target: z.number().positive().max(1000),
  period: z.enum(PERIODS),
  label: z.string().max(60).optional(),
});

export const POST = withValidation({ body: postBody }, async (request: NextRequest, { body }) => {
  const userId = await getAuthenticatedUserId(request);
  if (!userId) return apiError("Unauthorized", 401);

  const createBody = body as GoalCreateRequest;

  // Limit to 5 active goals
  const activeCount = await db.wellnessGoal.count({
    where: { userId, isActive: true },
  });

  if (activeCount >= 5) {
    return apiError("Maximum 5 active goals allowed. Deactivate one first.", 400);
  }

  const goal = await db.wellnessGoal.create({
    data: {
      userId,
      goalType: createBody.goalType,
      target: createBody.target,
      period: createBody.period,
      label: createBody.label ?? null,
    },
  });

  return apiSuccess(toDto(goal), 201);
});
