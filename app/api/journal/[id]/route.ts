import type { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { deleteJournalEntry } from "@/lib/store";
import { apiError, apiSuccess } from "@/lib/api/response";
import type { JournalDeletePayload } from "@/lib/api/contracts";

/**
 * DELETE /api/journal/[id]
 * Deletes a journal entry by ID for the current user.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return apiError("Unauthorized", 401);
  }

  const { id } = await params;
  const deleted = deleteJournalEntry(session.user.id, id);

  if (!deleted) {
    return apiError("Entry not found", 404);
  }

  return apiSuccess<JournalDeletePayload>({ id });
}
