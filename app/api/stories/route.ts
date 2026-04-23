import storiesJson from "@/lib/data/stories.json";
import { apiSuccess } from "@/lib/api/response";
import { withValidation } from "@/lib/validate";
import type { StoriesPayload, StoryDto } from "@/lib/api/contracts";

const stories = storiesJson as StoryDto[];

/**
 * GET /api/stories
 * Returns all stories.
 */
export const GET = withValidation({}, async () => {
  return apiSuccess<StoriesPayload>({ stories });
});
