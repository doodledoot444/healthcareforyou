import type { NextRequest } from "next/server";
import articlesJson from "@/lib/data/articles.json";
import { apiSuccess } from "@/lib/api/response";
import { withValidation } from "@/lib/validate";
import { articlesQuerySchema } from "@/lib/validators/content";
import type { ArticleDto, ArticleOfDayPayload, ArticlesPayload } from "@/lib/api/contracts";

const articles = articlesJson as ArticleDto[];

/**
 * GET /api/articles?type=day|all
 * - type=day (default): deterministic article rotation every 20 minutes
 * - type=all: returns full article dataset
 */
export const GET = withValidation({ query: articlesQuerySchema }, async (_request: NextRequest, { query }) => {
  const type = query.type;

  if (type === "all") {
    return apiSuccess<ArticlesPayload>({ articles });
  }

  const WINDOW_MS = 20 * 60 * 1000;
  const windowIndex = Math.floor(Date.now() / WINDOW_MS);
  const article = articles[windowIndex % articles.length];

  const nextWindowMs = (windowIndex + 1) * WINDOW_MS;
  const rotatesInMs = nextWindowMs - Date.now();

  return apiSuccess<ArticleOfDayPayload>({
    article,
    rotatesInMs,
    nextRotationAt: new Date(nextWindowMs).toISOString(),
  });
});
