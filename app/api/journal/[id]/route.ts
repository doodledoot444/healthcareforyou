import type { NextRequest } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth";
import { deleteJournalEntry } from "@/lib/store";
import { apiError, apiSuccess } from "@/lib/api/response";
import { withValidation } from "@/lib/validate";
import { journalIdParamsSchema } from "@/lib/validators/journal";
import type { JournalDeletePayload } from "@/lib/api/contracts";

/**
 * DELETE /api/journal/[id]
 * Deletes a journal entry by ID for the current user.
 */
export const DELETE = withValidation(
  { params: journalIdParamsSchema },
  async (request: NextRequest, { params }) => {
  const userId = await getAuthenticatedUserId(request);

  if (!userId) {
    return apiError("Unauthorized", 401);
  }

  const deleted = await deleteJournalEntry(userId, params.id);

  if (!deleted) {
    return apiError("Entry not found", 404);
  }

  return apiSuccess<JournalDeletePayload>({ id: params.id });
  },
);
