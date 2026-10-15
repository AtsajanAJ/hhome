import { requireUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { TasksPage } from "@/components/tasks/tasks-page";

// This route reads the request session and user-scoped database data.
// Keep it blocking until the task list is moved behind a Suspense boundary.
export const instant = false;

export default async function TasksRoute() {
  const user = await requireUser();
  const [tasks, projects] = await Promise.all([prisma.task.findMany({
    where: { userId: user.id },
    orderBy: [{ status: "asc" }, { dueDate: "asc" }, { createdAt: "desc" }],
    select: { id: true, title: true, description: true, status: true, priority: true, dueDate: true, projectId: true, project: { select: { name: true } } },
  }), prisma.project.findMany({ where: { userId: user.id, status: "ACTIVE" }, orderBy: { name: "asc" }, select: { id: true, name: true } })]);

  return (
    <TasksPage
      projects={projects}
      initialTasks={tasks.map((task) => ({
        ...task,
        projectName: task.project?.name ?? null,
        dueDate: task.dueDate?.toISOString().slice(0, 10) ?? null,
      }))}
    />
  );
}
