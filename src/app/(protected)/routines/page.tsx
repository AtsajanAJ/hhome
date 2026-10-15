import { requireUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { RoutinesPage } from "@/components/routines/routines-page";

export const instant = false;

export default async function RoutinesRoute() {
  const user = await requireUser();
  const routines = await prisma.routine.findMany({
    where: { userId: user.id },
    orderBy: [{ active: "desc" }, { nextDueDate: "asc" }],
    select: { id: true, title: true, description: true, frequency: true, nextDueDate: true, lastCompletedAt: true, active: true, completions: { orderBy: { completedAt: "desc" }, take: 5, select: { id: true, completedAt: true } } },
  });

  return <RoutinesPage routines={routines.map((routine) => ({ ...routine, nextDueDate: routine.nextDueDate.toISOString().slice(0, 10), lastCompletedAt: routine.lastCompletedAt?.toISOString() ?? null, completions: routine.completions.map((completion) => ({ id: completion.id, completedAt: completion.completedAt.toISOString() })) }))} />;
}
