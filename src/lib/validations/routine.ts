import { z } from "zod";

export const routineFrequencySchema = z.enum(["DAILY", "WEEKLY"]);

export const routineInputSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(120, "Title must be 120 characters or fewer"),
  description: z.string().trim().max(1000, "Description must be 1000 characters or fewer").nullable(),
  frequency: routineFrequencySchema,
  nextDueDate: z.string().date(),
});

export type RoutineInput = z.infer<typeof routineInputSchema>;
