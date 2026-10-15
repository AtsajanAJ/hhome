import { requireUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { ProjectsPage } from "@/components/projects/projects-page";

export const instant = false;

export default async function ProjectsRoute() {
  const user = await requireUser();
  const projects = await prisma.project.findMany({ where: { userId: user.id }, orderBy: [{ status: "asc" }, { updatedAt: "desc" }], select: { id: true, name: true, description: true, status: true } });
  return <ProjectsPage initialProjects={projects} />;
}
