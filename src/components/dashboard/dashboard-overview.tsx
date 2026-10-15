"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { createTask } from "@/app/(protected)/tasks/actions";

type Status = "TODO" | "IN_PROGRESS" | "DONE";
type Priority = "LOW" | "MEDIUM" | "HIGH";
type DashboardTask = { id: string; title: string; status: Status; priority: Priority; dueDate: string | null };
type DashboardRoutine = { id: string; title: string; frequency: "DAILY" | "WEEKLY"; nextDueDate: string };

const statusLabel: Record<Status, string> = { TODO: "Todo", IN_PROGRESS: "In progress", DONE: "Done" };
const statusColor: Record<Status, string> = { TODO: "bg-[#eef2ec] text-[#66756d]", IN_PROGRESS: "bg-[#fff0dd] text-[#a45d2f]", DONE: "bg-[#e5eee8] text-[#477052]" };
const priorityLabel: Record<Priority, string> = { LOW: "Low", MEDIUM: "Medium", HIGH: "High" };
const priorityColor: Record<Priority, string> = { LOW: "text-[#87918b]", MEDIUM: "text-[#a45d2f]", HIGH: "text-[#a44935]" };

function dueLabel(value: string | null) {
  if (!value) return "No due date";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(`${value}T00:00:00`));
}

export function DashboardOverview({ tasks, counts, overdueCount, routines, routineCompletionsThisWeek }: { tasks: DashboardTask[]; counts: Record<Status, number>; overdueCount: number; routines: DashboardRoutine[]; routineCompletionsThisWeek: number }) {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) {
      setMessage("Add a title first.");
      return;
    }

    setPending(true);
    const result = await createTask({ title: title.trim(), description: null, status: "TODO", priority, dueDate: dueDate || null });
    setPending(false);
    if (!result.ok) {
      setMessage(result.error);
      return;
    }

    setTitle("");
    setDueDate("");
    setPriority("MEDIUM");
    setMessage("Task added. Refreshing your overview...");
    window.location.reload();
  }

  return (
    <>
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Todo", counts.TODO, "bg-[#eef2ec]"],
          ["In progress", counts.IN_PROGRESS, "bg-[#fff0dd]"],
          ["Done", counts.DONE, "bg-[#e5eee8]"],
          ["Overdue", overdueCount, "bg-[#f8e9e4]"],
        ].map(([label, count, color]) => (
          <div key={label} className="rounded-2xl border border-[#dfe4dd] bg-[#fffdf8] p-5 shadow-[0_8px_30px_rgba(28,43,39,0.04)]">
            <div className="flex items-center justify-between"><p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#87918b]">{label}</p><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${color}`}>TASKS</span></div>
            <p className="mt-5 text-3xl font-semibold tracking-[-0.04em] text-[#1c2b27]">{count}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="rounded-2xl border border-[#dfe4dd] bg-[#fffdf8] p-6 shadow-[0_8px_30px_rgba(28,43,39,0.04)] sm:p-7">
          <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b86b3d]">Your queue</p><h3 className="mt-2 text-xl font-semibold">Next tasks</h3></div><Link href="/tasks" className="text-xs font-semibold text-[#477052] hover:text-[#1c2b27]">View all →</Link></div>
          <div className="mt-6 flex flex-col gap-2">
            {tasks.length > 0 ? tasks.map((task) => <div key={task.id} className="flex items-center gap-3 rounded-xl bg-[#f4f6f1] px-3.5 py-3"><span className={`size-2 shrink-0 rounded-full ${task.status === "DONE" ? "bg-[#477052]" : task.status === "IN_PROGRESS" ? "bg-[#b86b3d]" : "bg-[#aab8ad]"}`} /><p className={`min-w-0 flex-1 truncate text-sm font-medium ${task.status === "DONE" ? "text-[#87918b] line-through" : "text-[#1c2b27]"}`}>{task.title}</p><span className={`hidden rounded-full px-2 py-1 text-[10px] font-semibold sm:inline ${statusColor[task.status]}`}>{statusLabel[task.status]}</span><span className={`hidden text-[10px] font-bold uppercase sm:inline ${priorityColor[task.priority]}`}>{priorityLabel[task.priority]}</span><span className="shrink-0 text-xs text-[#87918b]">{dueLabel(task.dueDate)}</span></div>) : <div className="rounded-xl border border-dashed border-[#cdd8ce] bg-[#eef4ee] px-4 py-8 text-center"><p className="text-sm font-semibold text-[#1c2b27]">Nothing on the list yet</p><p className="mt-1 text-xs text-[#718078]">Add a task here or open the full task list.</p></div>}
          </div>
        </div>

        <div className="rounded-2xl border border-[#dfe4dd] bg-[#eef4ee] p-6 sm:p-7"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#477052]">Quick add</p><h3 className="mt-2 text-xl font-semibold">Make a little room</h3><form onSubmit={submit} className="mt-5 flex flex-col gap-3"><label htmlFor="quick-task-title" className="sr-only">Task title</label><input id="quick-task-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="What needs doing?" className="w-full rounded-xl border border-[#d7dfd6] bg-[#fffdf8] px-3.5 py-3 text-sm outline-none placeholder:text-[#a1aca4] focus:border-[#b86b3d] focus:ring-4 focus:ring-[#b86b3d]/10" /><div className="grid gap-3 sm:grid-cols-2"><div><label htmlFor="quick-task-due" className="text-xs font-semibold text-[#66756d]">Due date <span className="font-normal text-[#9aa39d]">(optional)</span></label><input id="quick-task-due" type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} className="mt-2 w-full rounded-xl border border-[#d7dfd6] bg-[#fffdf8] px-3.5 py-3 text-sm outline-none focus:border-[#b86b3d] focus:ring-4 focus:ring-[#b86b3d]/10" /></div><div><label htmlFor="quick-task-priority" className="text-xs font-semibold text-[#66756d]">Priority</label><select id="quick-task-priority" value={priority} onChange={(event) => setPriority(event.target.value as Priority)} className="mt-2 w-full rounded-xl border border-[#d7dfd6] bg-[#fffdf8] px-3.5 py-3 text-sm outline-none focus:border-[#b86b3d] focus:ring-4 focus:ring-[#b86b3d]/10"><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option></select></div></div><button disabled={pending} className="mt-1 rounded-xl bg-[#1c2b27] px-4 py-3 text-sm font-semibold text-[#f8f5ed] transition hover:bg-[#314840] disabled:opacity-60">{pending ? "Adding..." : "Add task"}</button>{message && <p role="status" className="text-xs text-[#477052]">{message}</p>}</form></div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="rounded-2xl border border-[#dfe4dd] bg-[#fffdf8] p-6 shadow-[0_8px_30px_rgba(28,43,39,0.04)] sm:p-7"><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b86b3d]">Rhythm check</p><h3 className="mt-2 text-xl font-semibold">Routines due now</h3></div><Link href="/routines" className="text-xs font-semibold text-[#477052] hover:text-[#1c2b27]">Manage →</Link></div><div className="mt-6 flex flex-col gap-2">{routines.length ? routines.map((routine) => <div key={routine.id} className="flex items-center gap-3 rounded-xl bg-[#f4f6f1] px-3.5 py-3"><span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#e5eee8] text-sm text-[#477052]">↻</span><p className="min-w-0 flex-1 truncate text-sm font-medium text-[#1c2b27]">{routine.title}</p><span className="text-xs text-[#a45d2f]">{routine.nextDueDate < new Date().toISOString().slice(0, 10) ? "Overdue" : "Due today"}</span></div>) : <div className="rounded-xl border border-dashed border-[#cdd8ce] bg-[#eef4ee] px-4 py-8 text-center"><p className="text-sm font-semibold text-[#1c2b27]">No routines due today</p><p className="mt-1 text-xs text-[#718078]">Your rhythm is clear for now.</p></div>}</div></div>
        <div className="rounded-2xl border border-[#dfe4dd] bg-[#f8f3e9] p-6 sm:p-7"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a45d2f]">This week</p><p className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-[#1c2b27]">{routineCompletionsThisWeek}</p><p className="mt-2 text-sm leading-6 text-[#718078]">routine {routineCompletionsThisWeek === 1 ? "completion" : "completions"} logged so far.</p><Link href="/routines" className="mt-6 inline-flex rounded-xl bg-[#1c2b27] px-4 py-2.5 text-sm font-semibold text-[#f8f5ed] hover:bg-[#314840]">Open routines</Link></div>
      </div>
    </>
  );
}
