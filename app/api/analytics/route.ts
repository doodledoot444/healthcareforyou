import { NextResponse } from "next/server";
import { buildMoodAnalytics } from "@/features/analytics/service";
import { getRecentMoods } from "@/features/mood/queries";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json(
      {
        data: null,
        error: "Unauthorized",
      },
      { status: 401 },
    );
  }

  const moods = await getRecentMoods(currentUser.id, 60);
  const data = buildMoodAnalytics(moods);

  return NextResponse.json({ data });
}
