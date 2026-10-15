import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardOverview } from "@/components/dashboard/dashboard-overview";

// Dashboard reads the request session, so it must render at request time.
export const instant = false;

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const name = session?.user.name || session?.user.email || "there";
  const tasks = session?.user
    ? await prisma.task.findMany({
        where: { userId: session.user.id },
        orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
        take: 6,
        select: { id: true, title: true, status: true, dueDate: true },
      })
    : [];

  const today = new Date().toISOString().slice(0, 10);
  const summary = session?.user
    ? await prisma.task.groupBy({
        by: ["status"],
        where: { userId: session.user.id },
        _count: { _all: true },
      })
    : [];

  const counts = {
    TODO: summary.find((item) => item.status === "TODO")?._count._all ?? 0,
    IN_PROGRESS: summary.find((item) => item.status === "IN_PROGRESS")?._count._all ?? 0,
    DONE: summary.find((item) => item.status === "DONE")?._count._all ?? 0,
  };

  const overdueCount = session?.user
    ? await prisma.task.count({ where: { userId: session.user.id, status: { not: "DONE" }, dueDate: { lt: new Date(`${today}T00:00:00.000Z`) } } })
    : 0;

  return (
    <section className="mx-auto max-w-6xl py-4 sm:py-7">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#b86b3d]">Your workspace</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Good morning, {name}.</h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-[#61706a]">Your home office is ready. Start with one small thing, then let the system carry the rest.</p>
        </div>
        <span className="w-fit rounded-full bg-[#e5eee8] px-3.5 py-2 text-xs font-semibold text-[#477052]">All caught up</span>
      </div>
      <DashboardOverview
        tasks={tasks.map((task) => ({ ...task, dueDate: task.dueDate?.toISOString().slice(0, 10) ?? null }))}
        counts={counts}
        overdueCount={overdueCount}
      />
    </section>
  );
}
