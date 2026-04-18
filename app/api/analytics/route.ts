import { NextResponse } from "next/server";
import { buildMoodAnalytics } from "@/features/analytics/service";
import { getRecentMoods } from "@/features/mood/queries";
import { DEFAULT_DEMO_USER_ID } from "@/lib/constants";

export async function GET(request: Request) {
  const userId = request.headers.get("x-user-id")?.trim() || DEFAULT_DEMO_USER_ID;
  const moods = await getRecentMoods(userId, 60);
  const data = buildMoodAnalytics(moods);

  return NextResponse.json({ data });
}
