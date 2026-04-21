import { NextResponse } from "next/server";
import type { ApiEnvelope } from "./contracts";

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json<ApiEnvelope<T>>({ success: true, data }, { status });
}

export function apiError(error: string, status = 400) {
  return NextResponse.json<ApiEnvelope<null>>({ success: false, data: null, error }, { status });
}
