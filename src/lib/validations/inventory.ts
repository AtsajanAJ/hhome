import { z } from "zod";

export const inventoryInputSchema = z.object({
  name: z.string().trim().min(1, "Item name is required").max(120, "Item name must be 120 characters or fewer"),
  category: z.string().trim().max(60).nullable(),
  quantity: z.number().int().min(0).max(9999),
  location: z.string().trim().max(120).nullable(),
  notes: z.string().trim().max(1000).nullable(),
});
