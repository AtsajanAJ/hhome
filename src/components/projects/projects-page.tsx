"use client";

import { useState, type FormEvent } from "react";
import { createProject, deleteProject, toggleProject } from "@/app/(protected)/projects/actions";

type ProjectStatus = "ACTIVE" | "COMPLETED";
type Project = { id: string; name: string; description: string | null; status: ProjectStatus };

export function ProjectsPage({ initialProjects }: { initialProjects: Project[] }) {
  const [projects, setProjects] = useState(initialProjects);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) {
      setMessage("Add a project name first.");
      return;
    }
    setPending(true);
    const result = await createProject({ name: name.trim(), description: description.trim() || null });
    setPending(false);
    if (!result.ok) {
      setMessage(result.error);
      return;
    }
    setMessage("Project created. Refreshing...");
    window.location.reload();
  }

  async function changeStatus(project: Project) {
    const status = project.status === "ACTIVE" ? "COMPLETED" : "ACTIVE";
    const result = await toggleProject(project.id, status);
    if (!result.ok) return setMessage(result.error);
    setProjects((current) => current.map((item) => item.id === project.id ? { ...item, status } : item));
  }

  async function remove(project: Project) {
    if (!window.confirm(`Delete “${project.name}”?`)) return;
    const result = await deleteProject(project.id);
    if (!result.ok) return setMessage(result.error);
    setProjects((current) => current.filter((item) => item.id !== project.id));
  }

  return <section className="mx-auto max-w-6xl py-4 sm:py-7"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#b86b3d]">Give bigger work a home</p><h2 className="mt-3 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Projects</h2><p className="mt-4 max-w-xl text-base leading-7 text-[#61706a]">Keep larger home-office improvements together without losing the next small step.</p></div><span className="w-fit rounded-full bg-[#e5eee8] px-3.5 py-2 text-xs font-semibold text-[#477052]">{projects.filter((project) => project.status === "ACTIVE").length} active</span></div><div className="mt-9 grid gap-5 lg:grid-cols-[0.7fr_1.3fr]"><div className="rounded-2xl border border-[#dfe4dd] bg-[#eef4ee] p-6 sm:p-7"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#477052]">New project</p><h3 className="mt-2 text-xl font-semibold">Start a bigger thing</h3><form onSubmit={submit} className="mt-5 flex flex-col gap-3"><label htmlFor="project-name" className="text-xs font-semibold text-[#66756d]">Name</label><input id="project-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Organize the study" className="w-full rounded-xl border border-[#d7dfd6] bg-[#fffdf8] px-3.5 py-3 text-sm outline-none placeholder:text-[#a1aca4] focus:border-[#b86b3d] focus:ring-4 focus:ring-[#b86b3d]/10" /><label htmlFor="project-description" className="text-xs font-semibold text-[#66756d]">Description <span className="font-normal text-[#9aa39d]">(optional)</span></label><textarea id="project-description" value={description} onChange={(event) => setDescription(event.target.value)} rows={3} placeholder="What does done look like?" className="w-full resize-none rounded-xl border border-[#d7dfd6] bg-[#fffdf8] px-3.5 py-3 text-sm outline-none placeholder:text-[#a1aca4] focus:border-[#b86b3d] focus:ring-4 focus:ring-[#b86b3d]/10" /><button disabled={pending} className="mt-2 rounded-xl bg-[#1c2b27] px-4 py-3 text-sm font-semibold text-[#f8f5ed] hover:bg-[#314840] disabled:opacity-60">{pending ? "Creating..." : "Create project"}</button>{message && <p role="status" className="text-xs text-[#477052]">{message}</p>}</form></div><div className="flex flex-col gap-3">{projects.length ? projects.map((project) => <article key={project.id} className={`rounded-2xl border bg-[#fffdf8] p-5 shadow-[0_8px_30px_rgba(28,43,39,0.035)] ${project.status === "ACTIVE" ? "border-[#dfe4dd]" : "border-[#e7ebe5] opacity-70"}`}><div className="flex items-start gap-4"><div className={`mt-1 flex size-9 shrink-0 items-center justify-center rounded-xl text-sm ${project.status === "ACTIVE" ? "bg-[#fff0dd] text-[#a45d2f]" : "bg-[#e5eee8] text-[#477052]"}`}>◆</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className={`font-semibold ${project.status === "COMPLETED" ? "text-[#87918b] line-through" : "text-[#1c2b27]"}`}>{project.name}</h3><span className="rounded-full bg-[#eef2ec] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#66756d]">{project.status === "ACTIVE" ? "Active" : "Completed"}</span></div>{project.description && <p className="mt-2 text-sm leading-6 text-[#718078]">{project.description}</p>}</div><div className="flex shrink-0 flex-col gap-1 sm:flex-row"><button onClick={() => changeStatus(project)} className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#477052] hover:bg-[#e5eee8]">{project.status === "ACTIVE" ? "Complete" : "Reopen"}</button><button onClick={() => remove(project)} className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#a44935] hover:bg-[#f8e9e4]">Delete</button></div></div></article>) : <div className="rounded-2xl border border-dashed border-[#cdd8ce] bg-[#eef4ee] px-6 py-16 text-center"><p className="text-2xl">◆</p><h3 className="mt-3 text-lg font-semibold text-[#1c2b27]">No projects yet</h3><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#718078]">Create a larger outcome and give its smaller tasks somewhere to gather.</p></div>}</div></div></section>;
}
