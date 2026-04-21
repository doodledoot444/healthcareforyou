import type { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { addJournalEntry, getJournalEntries } from "@/lib/store";
import { apiError, apiSuccess } from "@/lib/api/response";
import type { JournalCreatePayload, JournalCreateRequest, JournalPayload } from "@/lib/api/contracts";

/**
 * GET /api/journal
 * Returns all journal entries for the current user.
 *
 * POST /api/journal
 * Creates a new journal entry. Body: { content: string }
 */
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return apiError("Unauthorized", 401);
  }

  const entries = getJournalEntries(session.user.id);
  return apiSuccess<JournalPayload>({ entries });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return apiError("Unauthorized", 401);
  }

  const body = (await request.json().catch(() => null)) as JournalCreateRequest | null;

  if (!body || typeof body.content !== "string") {
    return apiError("content is required", 400);
  }

  const content = body.content.trim();

  if (!content) {
    return apiError("content must not be empty", 400);
  }

  const entry = addJournalEntry(session.user.id, content);
  return apiSuccess<JournalCreatePayload>({ entry }, 201);
}
