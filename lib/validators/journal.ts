import { z } from "zod";

export const journalCreateSchema = z.object({
  content: z.string().trim().min(1, "content must not be empty").max(4000, "content is too long"),
});

export const journalIdParamsSchema = z.object({
  id: z.string().trim().min(1, "id is required"),
});
