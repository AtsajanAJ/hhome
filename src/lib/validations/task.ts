import { z } from "zod";

export const taskStatusSchema = z.enum(["TODO", "IN_PROGRESS", "DONE"]);
export const taskPrioritySchema = z.enum(["LOW", "MEDIUM", "HIGH"]);

export const taskInputSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(120, "Title must be 120 characters or fewer"),
  description: z.string().trim().max(1000, "Description must be 1000 characters or fewer").nullable(),
  status: taskStatusSchema,
  priority: taskPrioritySchema,
  projectId: z.string().min(1).nullable(),
  dueDate: z.string().date().nullable(),
});

export type TaskInput = z.infer<typeof taskInputSchema>;
