"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteTask, updateTask } from "@/app/(protected)/tasks/actions";
import { TaskForm, type TaskDraft, type TaskPriority, type TaskStatus } from "@/components/tasks/task-form";

type Task = TaskDraft & { id: string; createdAt: string; updatedAt: string };

const statusLabel: Record<TaskStatus, string> = { TODO: "Todo", IN_PROGRESS: "In progress", DONE: "Done" };
const priorityLabel: Record<TaskPriority, string> = { LOW: "Low", MEDIUM: "Medium", HIGH: "High" };

export function TaskDetail({ task }: { task: Task }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function save(draft: TaskDraft) {
    setPending(true);
    const result = await updateTask(task.id, draft);
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setEditing(false);
    router.refresh();
  }

  async function remove() {
    if (!window.confirm(`Delete “${task.title}”?`)) return;
    setPending(true);
    const result = await deleteTask(task.id);
    if (!result.ok) {
      setPending(false);
      setError(result.error);
      return;
    }
    router.push("/tasks");
  }

  return (
    <section className="mx-auto max-w-3xl py-4 sm:py-7">
      <Link href="/tasks" className="text-sm font-semibold text-[#66756d] hover:text-[#1c2b27]">← Back to tasks</Link>
      <div className="mt-8 rounded-3xl border border-[#dfe4dd] bg-[#fffdf8] p-6 shadow-[0_8px_30px_rgba(28,43,39,0.04)] sm:p-8">
        {editing ? <><div className="mb-6"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b86b3d]">Edit task</p><h2 className="mt-2 text-2xl font-semibold">Update the details</h2></div><TaskForm initialTask={task} pending={pending} onCancel={() => setEditing(false)} onSubmit={save} /></> : <>
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start"><div><div className="flex flex-wrap gap-2"><span className="rounded-full bg-[#e5eee8] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#477052]">{statusLabel[task.status]}</span><span className="rounded-full bg-[#fff0dd] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#a45d2f]">{priorityLabel[task.priority]} priority</span></div><h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-[#1c2b27]">{task.title}</h2></div><div className="flex gap-2"><button onClick={() => setEditing(true)} className="rounded-xl bg-[#1c2b27] px-4 py-2.5 text-sm font-semibold text-[#f8f5ed] hover:bg-[#314840]">Edit</button><button disabled={pending} onClick={remove} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[#a44935] hover:bg-[#f8e9e4]">Delete</button></div></div>
          <div className="mt-8 border-t border-[#e5e9e2] pt-6"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#87918b]">Notes</p><p className="mt-3 whitespace-pre-wrap text-base leading-7 text-[#61706a]">{task.description || "No notes added yet."}</p></div>
          <div className="mt-8 grid gap-4 border-t border-[#e5e9e2] pt-6 text-sm sm:grid-cols-2"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#87918b]">Due date</p><p className="mt-2 font-semibold text-[#1c2b27]">{task.dueDate || "No due date"}</p></div><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#87918b]">Last updated</p><p className="mt-2 font-semibold text-[#1c2b27]">{new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(task.updatedAt))}</p></div></div>
          {error && <p role="alert" className="mt-6 rounded-xl bg-[#f8e9e4] px-3.5 py-3 text-sm text-[#9b4936]">{error}</p>}
        </>}
      </div>
    </section>
  );
}
