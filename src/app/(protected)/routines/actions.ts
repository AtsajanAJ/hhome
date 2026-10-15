"use server";

import { revalidatePath } from "next/cache";
import { RoutineFrequency } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";
import { routineInputSchema } from "@/lib/validations/routine";

type RoutineActionResult = { ok: true } | { ok: false; error: string };

function toDate(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

function nextDate(currentDueDate: Date, frequency: RoutineFrequency) {
  const date = new Date(currentDueDate);
  const interval = frequency === RoutineFrequency.DAILY ? 1 : 7;
  const now = new Date();

  do {
    date.setUTCDate(date.getUTCDate() + interval);
  } while (date <= now);

  return date;
}

function actionError(error: unknown): RoutineActionResult {
  if (error instanceof Error && error.message === "Unauthorized") {
    return { ok: false, error: "Your session has expired. Please sign in again." };
  }

  return { ok: false, error: "Something went wrong. Please try again." };
}

export async function createRoutine(input: unknown): Promise<RoutineActionResult> {
  try {
    const user = await requireUser();
    const routine = routineInputSchema.parse(input);

    await prisma.routine.create({
      data: {
        title: routine.title,
        description: routine.description || null,
        frequency: routine.frequency as RoutineFrequency,
        nextDueDate: toDate(routine.nextDueDate),
        userId: user.id,
      },
    });

    revalidatePath("/routines");
    return { ok: true };
  } catch (error) {
    return actionError(error);
  }
}

export async function completeRoutine(id: string): Promise<RoutineActionResult> {
  try {
    const user = await requireUser();
    const routine = await prisma.routine.findFirst({ where: { id, userId: user.id }, select: { frequency: true, nextDueDate: true } });
    if (!routine) return { ok: false, error: "Routine not found." };

    await prisma.$transaction([
      prisma.routineCompletion.create({ data: { routineId: id, userId: user.id } }),
      prisma.routine.updateMany({ where: { id, userId: user.id }, data: { lastCompletedAt: new Date(), nextDueDate: nextDate(routine.nextDueDate, routine.frequency) } }),
    ]);

    revalidatePath("/routines");
    return { ok: true };
  } catch (error) {
    return actionError(error);
  }
}

export async function updateRoutine(id: string, input: unknown): Promise<RoutineActionResult> {
  try {
    const user = await requireUser();
    const routine = routineInputSchema.parse(input);
    const result = await prisma.routine.updateMany({
      where: { id, userId: user.id },
      data: { title: routine.title, description: routine.description || null, frequency: routine.frequency as RoutineFrequency, nextDueDate: toDate(routine.nextDueDate) },
    });
    if (result.count === 0) return { ok: false, error: "Routine not found." };

    revalidatePath("/routines");
    return { ok: true };
  } catch (error) {
    return actionError(error);
  }
}

export async function toggleRoutine(id: string, active: boolean): Promise<RoutineActionResult> {
  try {
    const user = await requireUser();
    const result = await prisma.routine.updateMany({ where: { id, userId: user.id }, data: { active } });
    if (result.count === 0) return { ok: false, error: "Routine not found." };

    revalidatePath("/routines");
    return { ok: true };
  } catch (error) {
    return actionError(error);
  }
}

export async function deleteRoutine(id: string): Promise<RoutineActionResult> {
  try {
    const user = await requireUser();
    const result = await prisma.routine.deleteMany({ where: { id, userId: user.id } });
    if (result.count === 0) return { ok: false, error: "Routine not found." };

    revalidatePath("/routines");
    return { ok: true };
  } catch (error) {
    return actionError(error);
  }
}
