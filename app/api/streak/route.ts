import { NextResponse } from "next/server";
import { getMoodStreakSnapshot } from "@/features/mood/queries";
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

  const data = await getMoodStreakSnapshot(currentUser.id);

  return NextResponse.json({ data });
}
