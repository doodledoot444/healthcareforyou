import { NextResponse } from "next/server";
import { buildMoodAnalytics } from "@/features/analytics/service";
import { getRecentMoods } from "@/features/mood/queries";
import { getCurrentUser } from "@/lib/auth";
import { withValidation } from "@/lib/validate";
import { analyticsQuerySchema } from "@/lib/validators/content";

export const GET = withValidation({ query: analyticsQuerySchema }, async (_request, { query }) => {
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

  const moods = await getRecentMoods(currentUser.id, query.days);
  const data = buildMoodAnalytics(moods);

  return NextResponse.json({ data });
});
