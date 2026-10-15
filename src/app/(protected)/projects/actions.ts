"use server";

import { revalidatePath } from "next/cache";
import { ProjectStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";
import { projectInputSchema } from "@/lib/validations/project";

type ProjectActionResult = { ok: true } | { ok: false; error: string };

function actionError(error: unknown): ProjectActionResult {
  if (error instanceof Error && error.message === "Unauthorized") return { ok: false, error: "Your session has expired. Please sign in again." };
  return { ok: false, error: "Something went wrong. Please try again." };
}

export async function createProject(input: unknown): Promise<ProjectActionResult> {
  try {
    const user = await requireUser();
    const project = projectInputSchema.parse(input);
    await prisma.project.create({ data: { name: project.name, description: project.description || null, userId: user.id } });
    revalidatePath("/projects");
    return { ok: true };
  } catch (error) {
    return actionError(error);
  }
}

export async function toggleProject(id: string, status: ProjectStatus): Promise<ProjectActionResult> {
  try {
    const user = await requireUser();
    const result = await prisma.project.updateMany({ where: { id, userId: user.id }, data: { status } });
    if (result.count === 0) return { ok: false, error: "Project not found." };
    revalidatePath("/projects");
    return { ok: true };
  } catch (error) {
    return actionError(error);
  }
}

export async function deleteProject(id: string): Promise<ProjectActionResult> {
  try {
    const user = await requireUser();
    const result = await prisma.project.deleteMany({ where: { id, userId: user.id } });
    if (result.count === 0) return { ok: false, error: "Project not found." };
    revalidatePath("/projects");
    return { ok: true };
  } catch (error) {
    return actionError(error);
  }
}
