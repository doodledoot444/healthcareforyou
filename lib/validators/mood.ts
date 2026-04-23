import { z } from "zod";

export const moodBodySchema = z.object({
  moodScore: z.number().int().min(1).max(5).optional(),
  score: z.number().int().min(1).max(5).optional(),
  note: z.string().trim().max(500).optional(),
});

export const moodQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(365).optional().default(7),
});
