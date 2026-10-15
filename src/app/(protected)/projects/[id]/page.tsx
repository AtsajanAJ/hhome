import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { ProjectDetail } from "@/components/projects/project-detail";

export const instant = false;

export default async function ProjectDetailRoute({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const project = await prisma.project.findFirst({
    where: { id, userId: user.id },
    select: { id: true, name: true, description: true, status: true, tasks: { orderBy: [{ status: "asc" }, { dueDate: "asc" }], select: { id: true, title: true, status: true, priority: true, dueDate: true } } },
  });

  if (!project) notFound();

  return <ProjectDetail project={{ ...project, tasks: project.tasks.map((task) => ({ ...task, dueDate: task.dueDate?.toISOString().slice(0, 10) ?? null })) }} />;
}
