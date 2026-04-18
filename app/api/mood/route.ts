import { NextResponse } from "next/server";
import { createMoodEntry } from "@/features/mood/actions";
import { getLatestMoodEntry, getMoodStreakSnapshot, getRecentMoods } from "@/features/mood/queries";
import { DEFAULT_DEMO_USER_ID } from "@/lib/constants";

function resolveUserId(request: Request): string {
  return request.headers.get("x-user-id")?.trim() || DEFAULT_DEMO_USER_ID;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const daysParam = Number(url.searchParams.get("days") ?? 30);
  const userId = resolveUserId(request);

  const [entries, latestEntry, streak] = await Promise.all([
    getRecentMoods(userId, Number.isFinite(daysParam) ? daysParam : 30),
    getLatestMoodEntry(userId),
    getMoodStreakSnapshot(userId),
  ]);

  return NextResponse.json({
    data: {
      entries,
      latestEntry,
      streak,
    },
  });
}

export async function POST(request: Request) {
  const body = (await request.json()) as { score?: number; note?: string };
  const userId = resolveUserId(request);

  if (typeof body.score !== "number") {
    return NextResponse.json({ error: "score is required" }, { status: 400 });
  }

  try {
    const data = await createMoodEntry({
      userId,
      score: body.score,
      note: body.note,
    });
    return NextResponse.json({ data }, { status: data.wasUpdated ? 200 : 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create mood entry.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
