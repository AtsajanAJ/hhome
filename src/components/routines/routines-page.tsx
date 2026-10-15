"use client";

import { useState, type FormEvent } from "react";
import { completeRoutine, createRoutine, deleteRoutine, toggleRoutine, updateRoutine } from "@/app/(protected)/routines/actions";

type Frequency = "DAILY" | "WEEKLY";
type Routine = { id: string; title: string; description: string | null; frequency: Frequency; nextDueDate: string; lastCompletedAt: string | null; active: boolean; completions: { id: string; completedAt: string }[] };

function defaultDate() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(`${value}T00:00:00`));
}

export function RoutinesPage({ routines: initialRoutines }: { routines: Routine[] }) {
  const [routines, setRoutines] = useState(initialRoutines);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState<Frequency>("DAILY");
  const [nextDueDate, setNextDueDate] = useState(defaultDate);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function addRoutine(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) {
      setMessage("Add a routine title first.");
      return;
    }

    setPending(true);
    const input = { title: title.trim(), description: description.trim() || null, frequency, nextDueDate };
    const result = editingId ? await updateRoutine(editingId, input) : await createRoutine(input);
    setPending(false);
    if (!result.ok) {
      setMessage(result.error);
      return;
    }
    setMessage(editingId ? "Routine updated. Refreshing..." : "Routine created. Refreshing...");
    window.location.reload();
  }

  async function complete(routine: Routine) {
    setPending(true);
    const result = await completeRoutine(routine.id);
    setPending(false);
    if (!result.ok) {
      setMessage(result.error);
      return;
    }
    setMessage(`${routine.title} completed. Refreshing...`);
    window.location.reload();
  }

  async function pause(routine: Routine) {
    const result = await toggleRoutine(routine.id, !routine.active);
    if (!result.ok) {
      setMessage(result.error);
      return;
    }
    setRoutines((current) => current.map((item) => item.id === routine.id ? { ...item, active: !item.active } : item));
  }

  async function remove(routine: Routine) {
    if (!window.confirm(`Delete “${routine.title}”?`)) return;
    const result = await deleteRoutine(routine.id);
    if (!result.ok) {
      setMessage(result.error);
      return;
    }
    setRoutines((current) => current.filter((item) => item.id !== routine.id));
  }

  function edit(routine: Routine) {
    setEditingId(routine.id);
    setTitle(routine.title);
    setDescription(routine.description ?? "");
    setFrequency(routine.frequency);
    setNextDueDate(routine.nextDueDate);
    setMessage("");
  }

  function cancelEdit() {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setFrequency("DAILY");
    setNextDueDate(defaultDate());
    setMessage("");
  }

  return (
    <section className="mx-auto max-w-6xl py-4 sm:py-7">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#b86b3d]">Keep a gentle rhythm</p><h2 className="mt-3 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Routines</h2><p className="mt-4 max-w-xl text-base leading-7 text-[#61706a]">Small recurring actions that keep your home office feeling cared for.</p></div><span className="w-fit rounded-full bg-[#e5eee8] px-3.5 py-2 text-xs font-semibold text-[#477052]">{routines.filter((routine) => routine.active).length} active</span></div>

      <div className="mt-9 grid gap-5 lg:grid-cols-[0.7fr_1.3fr]">
        <div className="rounded-2xl border border-[#dfe4dd] bg-[#eef4ee] p-6 sm:p-7"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#477052]">{editingId ? "Edit routine" : "New routine"}</p><h3 className="mt-2 text-xl font-semibold">{editingId ? "Tune the rhythm" : "Build a rhythm"}</h3><form onSubmit={addRoutine} className="mt-5 flex flex-col gap-3"><label htmlFor="routine-title" className="text-xs font-semibold text-[#66756d]">Title</label><input id="routine-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Clear the desk" className="w-full rounded-xl border border-[#d7dfd6] bg-[#fffdf8] px-3.5 py-3 text-sm outline-none placeholder:text-[#a1aca4] focus:border-[#b86b3d] focus:ring-4 focus:ring-[#b86b3d]/10" /><label htmlFor="routine-description" className="text-xs font-semibold text-[#66756d]">Notes <span className="font-normal text-[#9aa39d]">(optional)</span></label><textarea id="routine-description" value={description} onChange={(event) => setDescription(event.target.value)} rows={2} placeholder="A little context..." className="w-full resize-none rounded-xl border border-[#d7dfd6] bg-[#fffdf8] px-3.5 py-3 text-sm outline-none placeholder:text-[#a1aca4] focus:border-[#b86b3d] focus:ring-4 focus:ring-[#b86b3d]/10" /><div className="grid gap-3 sm:grid-cols-2"><div><label htmlFor="routine-frequency" className="text-xs font-semibold text-[#66756d]">Repeats</label><select id="routine-frequency" value={frequency} onChange={(event) => setFrequency(event.target.value as Frequency)} className="mt-2 w-full rounded-xl border border-[#d7dfd6] bg-[#fffdf8] px-3.5 py-3 text-sm outline-none focus:border-[#b86b3d] focus:ring-4 focus:ring-[#b86b3d]/10"><option value="DAILY">Daily</option><option value="WEEKLY">Weekly</option></select></div><div><label htmlFor="routine-date" className="text-xs font-semibold text-[#66756d]">Starts</label><input id="routine-date" type="date" value={nextDueDate} onChange={(event) => setNextDueDate(event.target.value)} className="mt-2 w-full rounded-xl border border-[#d7dfd6] bg-[#fffdf8] px-3.5 py-3 text-sm outline-none focus:border-[#b86b3d] focus:ring-4 focus:ring-[#b86b3d]/10" /></div></div><div className="flex gap-2"><button disabled={pending} className="mt-2 flex-1 rounded-xl bg-[#1c2b27] px-4 py-3 text-sm font-semibold text-[#f8f5ed] hover:bg-[#314840] disabled:opacity-60">{pending ? "Saving..." : editingId ? "Save changes" : "Create routine"}</button>{editingId && <button type="button" onClick={cancelEdit} className="mt-2 rounded-xl px-4 py-3 text-sm font-semibold text-[#66756d] hover:bg-[#e1e9e1]">Cancel</button>}</div>{message && <p role="status" className="text-xs text-[#477052]">{message}</p>}</form></div>

        <div className="flex flex-col gap-3">{routines.length ? routines.map((routine) => <article key={routine.id} className={`rounded-2xl border bg-[#fffdf8] p-5 shadow-[0_8px_30px_rgba(28,43,39,0.035)] ${routine.active ? "border-[#dfe4dd]" : "border-[#e7ebe5] opacity-70"}`}><div className="flex items-start gap-4"><div className={`mt-1 flex size-9 shrink-0 items-center justify-center rounded-xl text-sm ${routine.active ? "bg-[#e5eee8] text-[#477052]" : "bg-[#eef2ec] text-[#87918b]"}`}>↻</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-[#1c2b27]">{routine.title}</h3><span className="rounded-full bg-[#eef2ec] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#66756d]">{routine.frequency === "DAILY" ? "Daily" : "Weekly"}</span></div>{routine.description && <p className="mt-2 text-sm leading-6 text-[#718078]">{routine.description}</p>}<p className={`mt-3 text-xs font-semibold ${routine.active ? "text-[#b86b3d]" : "text-[#87918b]"}`}>{routine.active ? `Next on ${formatDate(routine.nextDueDate)}` : "Paused"}</p>{routine.completions.length > 0 && <p className="mt-2 text-xs text-[#87918b]">Recent: {routine.completions.map((completion) => new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(completion.completedAt))).join(" · ")}</p>}</div><div className="flex shrink-0 flex-col gap-1 sm:flex-row"><button disabled={!routine.active || pending} onClick={() => complete(routine)} className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#477052] hover:bg-[#e5eee8] disabled:cursor-not-allowed disabled:opacity-50">Complete</button><button onClick={() => edit(routine)} className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#66756d] hover:bg-[#eef2ec]">Edit</button><button onClick={() => pause(routine)} className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#66756d] hover:bg-[#eef2ec]">{routine.active ? "Pause" : "Resume"}</button><button onClick={() => remove(routine)} className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#a44935] hover:bg-[#f8e9e4]">Delete</button></div></div></article>) : <div className="rounded-2xl border border-dashed border-[#cdd8ce] bg-[#eef4ee] px-6 py-16 text-center"><p className="text-2xl">↻</p><h3 className="mt-3 text-lg font-semibold text-[#1c2b27]">No routines yet</h3><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#718078]">Create a small daily or weekly rhythm and let it carry some of the mental load.</p></div>}</div>
      </div>
    </section>
  );
}

