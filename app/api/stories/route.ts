import storiesJson from "@/lib/data/stories.json";
import { apiSuccess } from "@/lib/api/response";
import type { StoriesPayload, StoryDto } from "@/lib/api/contracts";

const stories = storiesJson as StoryDto[];

/**
 * GET /api/stories
 * Returns all stories.
 */
export function GET() {
  return apiSuccess<StoriesPayload>({ stories });
}
