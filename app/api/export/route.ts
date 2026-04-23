import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { withValidation } from "@/lib/validate";
import { apiError, apiSuccess } from "@/lib/api/response";
import type { UserDataExportPayload } from "@/lib/api/contracts";
import { getAuthenticatedUserId } from "@/lib/auth";
import { db } from "@/lib/db";

const exportQuerySchema = z.object({
  format: z.enum(["json", "csv"]).optional(),
});

function toCsvCell(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) return "";
  const raw = String(value);
  const escaped = raw.replaceAll('"', '""');
  return `"${escaped}"`;
}

function buildCsv(payload: UserDataExportPayload): string {
  const lines: string[] = [];

  lines.push("dataset,id,date,value,label,extra1,extra2,extra3");

  for (const mood of payload.data.moods) {
    lines.push(
      [
        "mood",
        mood.id,
        mood.entryDate,
        mood.score,
        mood.note ?? "",
        mood.createdAt,
        "",
        "",
      ]
        .map(toCsvCell)
        .join(","),
    );
  }

  for (const entry of payload.data.journalEntries) {
    lines.push(
      [
        "journal",
        entry.id,
        entry.createdAt,
        entry.moodScore ?? "",
        entry.content,
        "",
        "",
        "",
      ]
        .map(toCsvCell)
        .join(","),
    );
  }

  for (const completion of payload.data.planCompletions) {
    lines.push(
      [
        "habit_completion",
        completion.id,
        completion.completedAt,
        completion.itemId,
        completion.itemLabel,
        completion.planTitle,
        completion.category,
        completion.planId,
      ]
        .map(toCsvCell)
        .join(","),
    );
  }

  for (const goal of payload.data.goals) {
    lines.push(
      [
        "goal",
        goal.id,
        goal.createdAt,
        goal.target,
        goal.label ?? "",
        goal.goalType,
        goal.period,
        goal.isActive,
      ]
        .map(toCsvCell)
        .join(","),
    );
  }

  return lines.join("\n");
}

export const GET = withValidation(
  { query: exportQuerySchema },
  async (request: NextRequest, { query }) => {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) return apiError("Unauthorized", 401);

    const format = query.format ?? "json";

    const [user, moods, journalEntries, planCompletions, goals] = await Promise.all([
      db.user.findUnique({ where: { id: userId }, select: { id: true, name: true, email: true } }),
      db.moodEntry.findMany({
        where: { userId },
        orderBy: { entryDate: "asc" },
        select: { id: true, score: true, note: true, entryDate: true, createdAt: true },
      }),
      db.journalEntry.findMany({
        where: { userId },
        orderBy: { createdAt: "asc" },
        select: { id: true, content: true, moodScore: true, createdAt: true },
      }),
      db.planCompletion.findMany({
        where: { userId },
        orderBy: { completedAt: "asc" },
        include: { item: { include: { plan: true } } },
      }),
      db.wellnessGoal.findMany({
        where: { userId },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    if (!user) return apiError("User not found", 404);

    const payload: UserDataExportPayload = {
      generatedAt: new Date().toISOString(),
      user,
      summary: {
        moodEntries: moods.length,
        journalEntries: journalEntries.length,
        habitCompletions: planCompletions.length,
        goals: goals.length,
      },
      data: {
        moods: moods.map((m) => ({
          ...m,
          entryDate: m.entryDate.toISOString(),
          createdAt: m.createdAt.toISOString(),
        })),
        journalEntries: journalEntries.map((j) => ({
          ...j,
          createdAt: j.createdAt.toISOString(),
        })),
        planCompletions: planCompletions.map((c) => ({
          id: c.id,
          itemId: c.itemId,
          itemLabel: c.item.label,
          planId: c.item.planId,
          planTitle: c.item.plan.title,
          category: c.item.plan.category,
          completedAt: c.completedAt.toISOString(),
        })),
        goals: goals.map((g) => ({
          id: g.id,
          goalType: g.goalType,
          target: g.target,
          period: g.period,
          label: g.label,
          isActive: g.isActive,
          createdAt: g.createdAt.toISOString(),
          updatedAt: g.updatedAt.toISOString(),
        })),
      },
    };

    if (format === "csv") {
      const csv = buildCsv(payload);
      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="wellness-export-${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    return apiSuccess<UserDataExportPayload>(payload);
  },
);
