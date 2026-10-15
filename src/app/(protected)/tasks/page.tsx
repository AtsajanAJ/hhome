import { requireUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { TasksPage } from "@/components/tasks/tasks-page";

// This route reads the request session and user-scoped database data.
// Keep it blocking until the task list is moved behind a Suspense boundary.
export const instant = false;

export default async function TasksRoute() {
  const user = await requireUser();
  const tasks = await prisma.task.findMany({
    where: { userId: user.id },
    orderBy: [{ status: "asc" }, { dueDate: "asc" }, { createdAt: "desc" }],
    select: { id: true, title: true, description: true, status: true, priority: true, dueDate: true },
  });

  return (
    <TasksPage
      initialTasks={tasks.map((task) => ({
        ...task,
        dueDate: task.dueDate?.toISOString().slice(0, 10) ?? null,
      }))}
    />
  );
}
