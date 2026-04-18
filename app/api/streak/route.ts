import { NextResponse } from "next/server";
import { getMoodStreakSnapshot } from "@/features/mood/queries";
import { DEFAULT_DEMO_USER_ID } from "@/lib/constants";

export async function GET(request: Request) {
  const userId = request.headers.get("x-user-id")?.trim() || DEFAULT_DEMO_USER_ID;
  const data = await getMoodStreakSnapshot(userId);

  return NextResponse.json({ data });
}
