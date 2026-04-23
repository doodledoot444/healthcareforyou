import { NextResponse } from "next/server";
import { createMoodEntry, MoodEntryValidationError } from "@/features/mood/actions";
import { getLatestMoodEntry, getMoodStreakSnapshot, getRecentMoods } from "@/features/mood/queries";
import { getCurrentUser } from "@/lib/auth";
import { withValidation } from "@/lib/validate";
import { moodBodySchema, moodQuerySchema } from "@/lib/validators/mood";

export const GET = withValidation({ query: moodQuerySchema }, async (_request, { query }) => {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "Unauthorized",
        },
        { status: 401 },
      );
    }

    const userId = currentUser.id;

    const [entries, latestEntry, streak] = await Promise.all([
      getRecentMoods(userId, query.days),
      getLatestMoodEntry(userId),
      getMoodStreakSnapshot(userId),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        entries,
        latestEntry,
        streak,
      },
      error: null,
    });
  } catch (error) {
    console.error("Unexpected mood GET error", error);

    return NextResponse.json(
      {
        success: false,
        data: null,
        error: "Failed to load mood entries.",
      },
      { status: 500 },
    );
  }
});

export const POST = withValidation({ body: moodBodySchema }, async (_request, { body }) => {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "Unauthorized",
        },
        { status: 401 },
      );
    }

    const userId = currentUser.id;
    const moodScore = typeof body.moodScore === "number" ? body.moodScore : body.score;

    if (typeof moodScore !== "number") {
      console.warn("Mood submission validation error", { reason: "moodScore missing" });

      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "moodScore is required.",
        },
        { status: 400 },
      );
    }

    const data = await createMoodEntry({
      userId,
      moodScore,
      note: body.note,
    });

    return NextResponse.json(
      {
        success: true,
        data,
        error: null,
      },
      { status: data.wasUpdated ? 200 : 201 },
    );
  } catch (error) {
    if (error instanceof MoodEntryValidationError) {
      console.warn("Mood submission validation error", { message: error.message });

      return NextResponse.json(
        {
          success: false,
          data: null,
          error: error.message,
        },
        { status: 400 },
      );
    }

    console.error("Unexpected mood POST error", error);

    return NextResponse.json(
      {
        success: false,
        data: null,
        error: "Failed to create mood entry.",
      },
      { status: 500 },
    );
  }
});
