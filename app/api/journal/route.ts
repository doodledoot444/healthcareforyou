import type { NextRequest } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth";
import { addJournalEntry, getJournalEntries } from "@/lib/store";
import { apiError, apiSuccess } from "@/lib/api/response";
import { withValidation } from "@/lib/validate";
import { journalCreateSchema } from "@/lib/validators/journal";
import type { JournalCreatePayload, JournalPayload } from "@/lib/api/contracts";

/**
 * GET /api/journal
 * Returns all journal entries for the current user.
 *
 * POST /api/journal
 * Creates a new journal entry. Body: { content: string }
 */
export const GET = withValidation({}, async (request: NextRequest) => {
  const userId = await getAuthenticatedUserId(request);

  if (!userId) {
    return apiError("Unauthorized", 401);
  }

  const entries = await getJournalEntries(userId);
  return apiSuccess<JournalPayload>({ entries });
});

export const POST = withValidation({ body: journalCreateSchema }, async (request: NextRequest, { body }) => {
  const userId = await getAuthenticatedUserId(request);

  if (!userId) {
    return apiError("Unauthorized", 401);
  }

  const entry = await addJournalEntry(userId, body.content);
  return apiSuccess<JournalCreatePayload>({ entry }, 201);
});
