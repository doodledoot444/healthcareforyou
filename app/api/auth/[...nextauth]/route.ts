import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      message: "Auth handler scaffolded. Integrate NextAuth providers before production deployment.",
    },
    { status: 501 },
  );
}

export async function POST() {
  return GET();
}
