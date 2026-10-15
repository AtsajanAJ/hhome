"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { createTask, deleteTask, toggleTaskStatus, updateTask } from "@/app/(protected)/tasks/actions";
import { TaskForm, type TaskDraft, type TaskPriority, type TaskStatus } from "@/components/tasks/task-form";

type Task = { id: string; title: string; description: string | null; status: TaskStatus; priority: TaskPriority; dueDate: string | null };
type Filter = "ALL" | TaskStatus;
type Sort = "PRIORITY" | "DUE_DATE" | "NEWEST";

const filterOptions: { label: string; value: Filter }[] = [
  { label: "All", value: "ALL" },
  { label: "Todo", value: "TODO" },
  { label: "In progress", value: "IN_PROGRESS" },
  { label: "Done", value: "DONE" },
];

const statusLabel: Record<TaskStatus, string> = { TODO: "Todo", IN_PROGRESS: "In progress", DONE: "Done" };
const statusColor: Record<TaskStatus, string> = { TODO: "bg-[#eef2ec] text-[#66756d]", IN_PROGRESS: "bg-[#fff0dd] text-[#a45d2f]", DONE: "bg-[#e5eee8] text-[#477052]" };
const priorityLabel: Record<TaskPriority, string> = { LOW: "Low", MEDIUM: "Medium", HIGH: "High" };
const priorityColor: Record<TaskPriority, string> = { LOW: "bg-[#eef2ec] text-[#66756d]", MEDIUM: "bg-[#fff0dd] text-[#a45d2f]", HIGH: "bg-[#f8e9e4] text-[#a44935]" };
const priorityRank: Record<TaskPriority, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };

function today() {
  return new Date().toISOString().slice(0, 10);
}

function formatDueDate(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(`${value}T00:00:00`));
}

export function TasksPage({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("ALL");
  const [sort, setSort] = useState<Sort>("PRIORITY");
  const [modal, setModal] = useState<"create" | Task | null>(null);
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState("");

  const visibleTasks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = tasks.filter((task) => {
      const matchesFilter = filter === "ALL" || task.status === filter;
      const matchesQuery = !normalizedQuery || `${task.title} ${task.description ?? ""}`.toLowerCase().includes(normalizedQuery);
      return matchesFilter && matchesQuery;
    });

    return filtered.sort((a, b) => {
      if (sort === "PRIORITY") return priorityRank[a.priority] - priorityRank[b.priority];
      if (sort === "DUE_DATE") return (a.dueDate ?? "9999-12-31").localeCompare(b.dueDate ?? "9999-12-31");
      return 0;
    });
  }, [filter, query, sort, tasks]);

  async function saveTask(draft: TaskDraft) {
    if (!modal) return;

    setPending(true);
    const result = modal === "create" ? await createTask(draft) : await updateTask(modal.id, draft);
    setPending(false);
    if (!result.ok) {
      setNotice(result.error);
      return;
    }
    setNotice("");
    setModal(null);
    window.location.reload();
  }

  async function removeTask(task: Task) {
    if (!window.confirm(`Delete “${task.title}”?`)) return;
    setPending(true);
    const result = await deleteTask(task.id);
    setPending(false);
    if (!result.ok) {
      setNotice(result.error);
      return;
    }
    setTasks((current) => current.filter((item) => item.id !== task.id));
    setNotice("Task deleted.");
  }

  async function changeStatus(task: Task) {
    const nextStatus: TaskStatus = task.status === "TODO" ? "IN_PROGRESS" : task.status === "IN_PROGRESS" ? "DONE" : "TODO";
    const result = await toggleTaskStatus(task.id, nextStatus);
    if (!result.ok) {
      setNotice(result.error);
      return;
    }
    setTasks((current) => current.map((item) => item.id === task.id ? { ...item, status: nextStatus } : item));
  }

  return (
    <section className="mx-auto max-w-6xl py-4 sm:py-7">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#b86b3d]">Your workbench</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Tasks</h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-[#61706a]">Keep the next useful thing visible, then move it forward at your own pace.</p>
        </div>
        <button onClick={() => setModal("create")} className="w-full rounded-xl bg-[#1c2b27] px-4 py-3 text-sm font-semibold text-[#f8f5ed] shadow-[0_8px_20px_rgba(28,43,39,0.12)] transition hover:bg-[#314840] sm:w-auto">+ New task</button>
      </div>

      <div className="mt-9 flex flex-col gap-3 rounded-2xl border border-[#dfe4dd] bg-[#fffdf8] p-3 sm:flex-row sm:items-center sm:p-4">
        <label className="flex min-w-0 flex-1 items-center gap-3 rounded-xl bg-[#f4f6f1] px-3.5 py-2.5 text-sm text-[#87918b]">
          <span aria-hidden="true">⌕</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tasks..." className="min-w-0 flex-1 bg-transparent text-[#1c2b27] outline-none placeholder:text-[#9aa39d]" />
        </label>
        <div className="flex gap-1 overflow-x-auto" aria-label="Filter tasks">
          {filterOptions.map((option) => <button key={option.value} onClick={() => setFilter(option.value)} className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold transition ${filter === option.value ? "bg-[#e5eee8] text-[#1c2b27]" : "text-[#87918b] hover:bg-[#f1f4ef]"}`}>{option.label}</button>)}
        </div>
        <label className="flex items-center gap-2 border-t border-[#e5e9e2] pt-3 text-xs font-semibold text-[#87918b] sm:border-l sm:border-t-0 sm:pl-3 sm:pt-0"><span>Sort</span><select value={sort} onChange={(event) => setSort(event.target.value as Sort)} className="rounded-lg bg-[#f4f6f1] px-2.5 py-2 text-xs text-[#66756d] outline-none"><option value="PRIORITY">Priority</option><option value="DUE_DATE">Due date</option><option value="NEWEST">Newest</option></select></label>
      </div>

      {notice && <p role="status" className="mt-4 rounded-xl bg-[#eef4ee] px-4 py-3 text-sm text-[#477052]">{notice}</p>}

      <div className="mt-5 flex flex-col gap-3">
        {visibleTasks.map((task) => {
          const overdue = task.dueDate && task.dueDate < today() && task.status !== "DONE";
          return <article key={task.id} className={`group rounded-2xl border bg-[#fffdf8] p-5 shadow-[0_8px_30px_rgba(28,43,39,0.035)] transition hover:border-[#c8d5c9] ${task.status === "DONE" ? "border-[#dfe8df]" : "border-[#dfe4dd]"}`}>
            <div className="flex items-start gap-3">
              <button aria-label={`Mark ${task.title} as ${task.status === "DONE" ? "todo" : "next status"}`} onClick={() => changeStatus(task)} className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition ${task.status === "DONE" ? "border-[#477052] bg-[#477052] text-white" : task.status === "IN_PROGRESS" ? "border-[#b86b3d]" : "border-[#bdc9bf] hover:border-[#b86b3d]"}`}>{task.status === "DONE" && "✓"}</button>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2"><Link href={`/tasks/${task.id}`} className={`font-semibold hover:text-[#b86b3d] ${task.status === "DONE" ? "text-[#87918b] line-through" : "text-[#1c2b27]"}`}>{task.title}</Link><span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${statusColor[task.status]}`}>{statusLabel[task.status]}</span><span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${priorityColor[task.priority]}`}>{priorityLabel[task.priority]}</span></div>
                {task.description && <p className="mt-2 text-sm leading-6 text-[#718078]">{task.description}</p>}
                {task.dueDate && <p className={`mt-3 text-xs font-semibold ${overdue ? "text-[#a44935]" : "text-[#87918b]"}`}>{overdue ? "Overdue · " : "Due "}{formatDueDate(task.dueDate)}</p>}
              </div>
              <div className="flex shrink-0 gap-1 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
                <button aria-label={`Edit ${task.title}`} onClick={() => setModal(task)} className="rounded-lg px-2 py-1.5 text-xs font-semibold text-[#66756d] hover:bg-[#eef2ec]">Edit</button>
                <button aria-label={`Delete ${task.title}`} disabled={pending} onClick={() => removeTask(task)} className="rounded-lg px-2 py-1.5 text-xs font-semibold text-[#a44935] hover:bg-[#f8e9e4]">Delete</button>
              </div>
            </div>
          </article>;
        })}
        {visibleTasks.length === 0 && <div className="rounded-2xl border border-dashed border-[#cdd8ce] bg-[#eef4ee] px-6 py-16 text-center"><p className="text-2xl">✦</p><h3 className="mt-3 text-lg font-semibold text-[#1c2b27]">{tasks.length ? "No tasks match this view" : "Your list is clear"}</h3><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#718078]">{tasks.length ? "Try another filter or a different search phrase." : "Add one small task to give your day a gentle direction."}</p>{!tasks.length && <button onClick={() => setModal("create")} className="mt-5 rounded-xl bg-[#1c2b27] px-4 py-2.5 text-sm font-semibold text-[#f8f5ed]">Create your first task</button>}</div>}
      </div>

      {modal && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1c2b27]/35 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setModal(null); }}><div role="dialog" aria-modal="true" aria-labelledby="task-dialog-title" className="max-h-[calc(100vh-2rem)] w-full max-w-xl overflow-y-auto rounded-3xl border border-[#dfe4dd] bg-[#f8f7f2] p-5 shadow-2xl sm:p-7"><div className="mb-6 flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b86b3d]">Task details</p><h2 id="task-dialog-title" className="mt-2 text-2xl font-semibold tracking-[-0.03em]">{modal === "create" ? "Make room for one thing" : "Edit task"}</h2></div><button aria-label="Close task dialog" onClick={() => setModal(null)} className="rounded-xl px-2.5 py-1.5 text-xl text-[#87918b] hover:bg-[#e8eee7]">×</button></div><TaskForm key={modal === "create" ? "create" : modal.id} initialTask={modal === "create" ? undefined : modal} pending={pending} onCancel={() => setModal(null)} onSubmit={saveTask} /></div></div>}
    </section>
  );
}
