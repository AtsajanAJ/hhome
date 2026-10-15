import { describe, expect, it } from "vitest";
import { taskInputSchema } from "@/lib/validations/task";

const validTask = {
  title: "Prepare the weekly planning board",
  description: "Review open tasks and decide what matters next.",
  status: "TODO" as const,
  priority: "HIGH" as const,
  dueDate: "2026-10-20",
};

describe("taskInputSchema", () => {
  it("accepts a valid task and trims text fields", () => {
    const result = taskInputSchema.safeParse({ ...validTask, title: "  Prepare the board  " });

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.title).toBe("Prepare the board");
  });

  it("rejects an empty title", () => {
    expect(taskInputSchema.safeParse({ ...validTask, title: "   " }).success).toBe(false);
  });

  it("rejects a title over 120 characters", () => {
    expect(taskInputSchema.safeParse({ ...validTask, title: "a".repeat(121) }).success).toBe(false);
  });

  it("rejects invalid status and priority values", () => {
    expect(taskInputSchema.safeParse({ ...validTask, status: "BLOCKED" }).success).toBe(false);
    expect(taskInputSchema.safeParse({ ...validTask, priority: "URGENT" }).success).toBe(false);
  });

  it("allows an empty description and optional due date", () => {
    const result = taskInputSchema.safeParse({ ...validTask, description: null, dueDate: null });

    expect(result.success).toBe(true);
  });

  it("rejects descriptions over 1000 characters and invalid dates", () => {
    expect(taskInputSchema.safeParse({ ...validTask, description: "a".repeat(1001) }).success).toBe(false);
    expect(taskInputSchema.safeParse({ ...validTask, dueDate: "20-10-2026" }).success).toBe(false);
  });
});
