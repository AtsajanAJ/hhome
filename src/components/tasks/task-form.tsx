"use client";

import { useState, type FormEvent } from "react";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export type TaskDraft = {
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: string | null;
  dueDate: string | null;
};

type TaskFormProps = {
  initialTask?: TaskDraft;
  projects?: { id: string; name: string }[];
  pending: boolean;
  onCancel: () => void;
  onSubmit: (draft: TaskDraft) => void;
};

const blankTask: TaskDraft = { title: "", description: null, status: "TODO", priority: "MEDIUM", projectId: null, dueDate: null };

export function TaskForm({ initialTask, projects = [], pending, onCancel, onSubmit }: TaskFormProps) {
  const [draft, setDraft] = useState<TaskDraft>(initialTask ?? blankTask);
  const [error, setError] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = draft.title.trim();

    if (!title) {
      setError("Add a title so you know what to do next.");
      return;
    }
    if (title.length > 120) {
      setError("Keep the title under 120 characters.");
      return;
    }
    if (draft.description && draft.description.length > 1000) {
      setError("Keep the description under 1000 characters.");
      return;
    }

    setError("");
    onSubmit({ ...draft, title, description: draft.description?.trim() || null });
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <div>
        <label htmlFor="task-title" className="text-xs font-semibold uppercase tracking-[0.16em] text-[#66756d]">Title</label>
        <input id="task-title" autoFocus value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="What needs your attention?" className="mt-2 w-full rounded-xl border border-[#d7dfd6] bg-[#fffdf8] px-3.5 py-3 text-sm outline-none transition placeholder:text-[#a1aca4] focus:border-[#b86b3d] focus:ring-4 focus:ring-[#b86b3d]/10" />
      </div>
      <div>
        <label htmlFor="task-description" className="text-xs font-semibold uppercase tracking-[0.16em] text-[#66756d]">Notes <span className="font-normal normal-case tracking-normal text-[#9aa39d]">(optional)</span></label>
        <textarea id="task-description" value={draft.description ?? ""} onChange={(event) => setDraft({ ...draft, description: event.target.value })} rows={3} placeholder="Add a little context..." className="mt-2 w-full resize-none rounded-xl border border-[#d7dfd6] bg-[#fffdf8] px-3.5 py-3 text-sm outline-none transition placeholder:text-[#a1aca4] focus:border-[#b86b3d] focus:ring-4 focus:ring-[#b86b3d]/10" />
      </div>
      <div className="grid gap-4 sm:grid-cols-4">
        <div>
          <label htmlFor="task-status" className="text-xs font-semibold uppercase tracking-[0.16em] text-[#66756d]">Status</label>
          <select id="task-status" value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as TaskStatus })} className="mt-2 w-full rounded-xl border border-[#d7dfd6] bg-[#fffdf8] px-3.5 py-3 text-sm outline-none focus:border-[#b86b3d] focus:ring-4 focus:ring-[#b86b3d]/10">
            <option value="TODO">Todo</option>
            <option value="IN_PROGRESS">In progress</option>
            <option value="DONE">Done</option>
          </select>
        </div>
        <div>
          <label htmlFor="task-project" className="text-xs font-semibold uppercase tracking-[0.16em] text-[#66756d]">Project</label>
          <select id="task-project" value={draft.projectId ?? ""} onChange={(event) => setDraft({ ...draft, projectId: event.target.value || null })} className="mt-2 w-full rounded-xl border border-[#d7dfd6] bg-[#fffdf8] px-3.5 py-3 text-sm outline-none focus:border-[#b86b3d] focus:ring-4 focus:ring-[#b86b3d]/10"><option value="">No project</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select>
        </div>
        <div>
          <label htmlFor="task-priority" className="text-xs font-semibold uppercase tracking-[0.16em] text-[#66756d]">Priority</label>
          <select id="task-priority" value={draft.priority} onChange={(event) => setDraft({ ...draft, priority: event.target.value as TaskPriority })} className="mt-2 w-full rounded-xl border border-[#d7dfd6] bg-[#fffdf8] px-3.5 py-3 text-sm outline-none focus:border-[#b86b3d] focus:ring-4 focus:ring-[#b86b3d]/10">
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>
        <div>
          <label htmlFor="task-due-date" className="text-xs font-semibold uppercase tracking-[0.16em] text-[#66756d]">Due date</label>
          <input id="task-due-date" type="date" value={draft.dueDate ?? ""} onChange={(event) => setDraft({ ...draft, dueDate: event.target.value || null })} className="mt-2 w-full rounded-xl border border-[#d7dfd6] bg-[#fffdf8] px-3.5 py-3 text-sm outline-none focus:border-[#b86b3d] focus:ring-4 focus:ring-[#b86b3d]/10" />
        </div>
      </div>
      {error && <p role="alert" className="rounded-xl bg-[#f8e9e4] px-3.5 py-3 text-sm text-[#9b4936]">{error}</p>}
      <div className="flex flex-col-reverse gap-2 border-t border-[#e5e9e2] pt-4 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[#66756d] transition hover:bg-[#eef2ec]">Cancel</button>
        <button type="submit" disabled={pending} className="rounded-xl bg-[#1c2b27] px-4 py-2.5 text-sm font-semibold text-[#f8f5ed] transition hover:bg-[#314840] disabled:cursor-not-allowed disabled:opacity-60">{pending ? "Saving..." : initialTask ? "Save changes" : "Create task"}</button>
      </div>
    </form>
  );
}
