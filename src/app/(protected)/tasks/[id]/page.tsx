import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { TaskDetail } from "@/components/tasks/task-detail";

export const instant = false;

export default async function TaskDetailRoute({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const task = await prisma.task.findFirst({
    where: { id, userId: user.id },
    select: { id: true, title: true, description: true, status: true, priority: true, dueDate: true, createdAt: true, updatedAt: true },
  });

  if (!task) notFound();

  return (
    <TaskDetail
      task={{
        ...task,
        dueDate: task.dueDate?.toISOString().slice(0, 10) ?? null,
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString(),
      }}
    />
  );
}
