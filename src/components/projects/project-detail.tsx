"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { deleteProject, toggleProject, updateProject } from "@/app/(protected)/projects/actions";

type ProjectStatus = "ACTIVE" | "COMPLETED";
type Task = { id: string; title: string; status: "TODO" | "IN_PROGRESS" | "DONE"; priority: "LOW" | "MEDIUM" | "HIGH"; dueDate: string | null };
type Project = { id: string; name: string; description: string | null; status: ProjectStatus; tasks: Task[] };

export function ProjectDetail({ project }: { project: Project }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description ?? "");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    const result = await updateProject(project.id, { name, description: description || null });
    setPending(false);
    if (!result.ok) return setMessage(result.error);
    setEditing(false);
    router.refresh();
  }

  async function changeStatus() {
    const result = await toggleProject(project.id, project.status === "ACTIVE" ? "COMPLETED" : "ACTIVE");
    if (!result.ok) return setMessage(result.error);
    router.refresh();
  }

  async function remove() {
    if (!window.confirm(`Delete “${project.name}”?`)) return;
    const result = await deleteProject(project.id);
    if (!result.ok) return setMessage(result.error);
    router.push("/projects");
  }

  return <section className="mx-auto max-w-5xl py-4 sm:py-7"><Link href="/projects" className="text-sm font-semibold text-[#66756d] hover:text-[#1c2b27]">← Back to projects</Link><div className="mt-8 rounded-3xl border border-[#dfe4dd] bg-[#fffdf8] p-6 shadow-[0_8px_30px_rgba(28,43,39,0.04)] sm:p-8">{editing ? <form onSubmit={save} className="flex flex-col gap-4"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b86b3d]">Edit project</p><label htmlFor="project-detail-name" className="text-xs font-semibold text-[#66756d]">Name</label><input id="project-detail-name" value={name} onChange={(event) => setName(event.target.value)} className="rounded-xl border border-[#d7dfd6] bg-[#fffdf8] px-3.5 py-3 text-sm outline-none focus:border-[#b86b3d]" /><label htmlFor="project-detail-description" className="text-xs font-semibold text-[#66756d]">Description</label><textarea id="project-detail-description" value={description} onChange={(event) => setDescription(event.target.value)} rows={4} className="resize-none rounded-xl border border-[#d7dfd6] bg-[#fffdf8] px-3.5 py-3 text-sm outline-none focus:border-[#b86b3d]" /><div className="flex gap-2"><button disabled={pending} className="rounded-xl bg-[#1c2b27] px-4 py-2.5 text-sm font-semibold text-[#f8f5ed]">{pending ? "Saving..." : "Save changes"}</button><button type="button" onClick={() => setEditing(false)} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[#66756d] hover:bg-[#eef2ec]">Cancel</button></div>{message && <p role="alert" className="text-sm text-[#a44935]">{message}</p>}</form> : <><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start"><div><span className="rounded-full bg-[#eef2ec] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#66756d]">{project.status === "ACTIVE" ? "Active" : "Completed"}</span><h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-[#1c2b27]">{project.name}</h2><p className="mt-3 max-w-2xl text-base leading-7 text-[#61706a]">{project.description || "No description yet."}</p></div><div className="flex gap-2"><button onClick={() => setEditing(true)} className="rounded-xl bg-[#1c2b27] px-4 py-2.5 text-sm font-semibold text-[#f8f5ed]">Edit</button><button onClick={changeStatus} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[#477052] hover:bg-[#e5eee8]">{project.status === "ACTIVE" ? "Complete" : "Reopen"}</button><button onClick={remove} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[#a44935] hover:bg-[#f8e9e4]">Delete</button></div></div><div className="mt-9 border-t border-[#e5e9e2] pt-6"><div className="flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b86b3d]">Project tasks</p><h3 className="mt-2 text-xl font-semibold">{project.tasks.length} {project.tasks.length === 1 ? "task" : "tasks"}</h3></div><Link href="/tasks" className="text-xs font-semibold text-[#477052]">Open tasks →</Link></div><div className="mt-5 flex flex-col gap-2">{project.tasks.length ? project.tasks.map((task) => <Link key={task.id} href={`/tasks/${task.id}`} className="flex items-center gap-3 rounded-xl bg-[#f4f6f1] px-3.5 py-3 hover:bg-[#eaf0e9]"><span className={`size-2 rounded-full ${task.status === "DONE" ? "bg-[#477052]" : task.priority === "HIGH" ? "bg-[#a44935]" : "bg-[#b86b3d]"}`} /><span className={`flex-1 truncate text-sm font-medium ${task.status === "DONE" ? "text-[#87918b] line-through" : "text-[#1c2b27]"}`}>{task.title}</span>{task.dueDate && <span className="text-xs text-[#87918b]">{task.dueDate}</span>}</Link>) : <p className="rounded-xl border border-dashed border-[#cdd8ce] bg-[#eef4ee] px-4 py-8 text-center text-sm text-[#718078]">No tasks assigned to this project yet.</p>}</div></div></>}</div></section>;
}
