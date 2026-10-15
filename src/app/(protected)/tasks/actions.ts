"use server";

import { revalidatePath } from "next/cache";
import { TaskPriority, TaskStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";
import { taskInputSchema, taskStatusSchema } from "@/lib/validations/task";

type TaskActionResult = { ok: true } | { ok: false; error: string };

function toDate(value: string | null) {
  return value ? new Date(`${value}T00:00:00.000Z`) : null;
}

function actionError(error: unknown): TaskActionResult {
  if (error instanceof Error && error.message === "Unauthorized") {
    return { ok: false, error: "Your session has expired. Please sign in again." };
  }

  return { ok: false, error: "Something went wrong. Please try again." };
}

export async function createTask(input: unknown): Promise<TaskActionResult> {
  try {
    const user = await requireUser();
    const task = taskInputSchema.parse(input);

    await prisma.task.create({
      data: {
        title: task.title,
        description: task.description || null,
        status: task.status as TaskStatus,
        priority: task.priority as TaskPriority,
        dueDate: toDate(task.dueDate),
        userId: user.id,
      },
    });

    revalidatePath("/tasks");
    return { ok: true };
  } catch (error) {
    return actionError(error);
  }
}

export async function updateTask(id: string, input: unknown): Promise<TaskActionResult> {
  try {
    const user = await requireUser();
    const task = taskInputSchema.parse(input);

    const result = await prisma.task.updateMany({
      where: { id, userId: user.id },
      data: {
        title: task.title,
        description: task.description || null,
        status: task.status as TaskStatus,
        priority: task.priority as TaskPriority,
        dueDate: toDate(task.dueDate),
      },
    });

    if (result.count === 0) return { ok: false, error: "Task not found." };

    revalidatePath("/tasks");
    return { ok: true };
  } catch (error) {
    return actionError(error);
  }
}

export async function deleteTask(id: string): Promise<TaskActionResult> {
  try {
    const user = await requireUser();
    const result = await prisma.task.deleteMany({ where: { id, userId: user.id } });

    if (result.count === 0) return { ok: false, error: "Task not found." };

    revalidatePath("/tasks");
    return { ok: true };
  } catch (error) {
    return actionError(error);
  }
}

export async function toggleTaskStatus(id: string, status: string): Promise<TaskActionResult> {
  try {
    const user = await requireUser();
    const parsedStatus = taskStatusSchema.parse(status);
    const result = await prisma.task.updateMany({
      where: { id, userId: user.id },
      data: { status: parsedStatus as TaskStatus },
    });

    if (result.count === 0) return { ok: false, error: "Task not found." };

    revalidatePath("/tasks");
    return { ok: true };
  } catch (error) {
    return actionError(error);
  }
}
