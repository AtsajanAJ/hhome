import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { TaskDetail } from "@/components/tasks/task-detail";

export const instant = false;

export default async function TaskDetailRoute({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const [task, projects] = await Promise.all([prisma.task.findFirst({
    where: { id, userId: user.id },
    select: { id: true, title: true, description: true, status: true, priority: true, projectId: true, project: { select: { name: true } }, dueDate: true, createdAt: true, updatedAt: true },
  }), prisma.project.findMany({ where: { userId: user.id, status: "ACTIVE" }, orderBy: { name: "asc" }, select: { id: true, name: true } })]);

  if (!task) notFound();

  return (
    <TaskDetail
      projects={projects}
      task={{
        ...task,
        projectName: task.project?.name ?? null,
        dueDate: task.dueDate?.toISOString().slice(0, 10) ?? null,
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString(),
      }}
    />
  );
}
