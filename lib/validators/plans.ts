import { z } from "zod";

export const planParamsSchema = z.object({
  planId: z.string().trim().min(1, "planId is required"),
});

export const planItemPatchSchema = z.object({
  itemId: z.string().trim().min(1, "itemId is required"),
  completed: z.boolean().optional(),
});
