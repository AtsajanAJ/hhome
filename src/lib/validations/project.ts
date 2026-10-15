import { z } from "zod";

export const projectInputSchema = z.object({
  name: z.string().trim().min(1, "Project name is required").max(120, "Project name must be 120 characters or fewer"),
  description: z.string().trim().max(1000, "Description must be 1000 characters or fewer").nullable(),
});
