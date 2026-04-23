import { z } from "zod";

export const articlesQuerySchema = z.object({
  type: z.enum(["day", "all"]).optional().default("day"),
});

export const analyticsQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(365).optional().default(60),
});
