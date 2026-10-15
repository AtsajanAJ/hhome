"use client";

import { useMemo, useState, type FormEvent } from "react";
import { adjustInventoryQuantity, createInventoryItem, deleteInventoryItem, updateInventoryItem } from "@/app/(protected)/inventory/actions";

type Item = { id: string; name: string; category: string | null; quantity: number; location: string | null; notes: string | null };

export function InventoryPage({ initialItems }: { initialItems: Item[] }) {
  const [items, setItems] = useState(initialItems);
  const [editing, setEditing] = useState<Item | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [query, setQuery] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  const visibleItems = useMemo(() => items.filter((item) => `${item.name} ${item.category ?? ""} ${item.location ?? ""}`.toLowerCase().includes(query.trim().toLowerCase())), [items, query]);

  function startEdit(item: Item) {
    setEditing(item); setName(item.name); setCategory(item.category ?? ""); setQuantity(String(item.quantity)); setLocation(item.location ?? ""); setNotes(item.notes ?? ""); setMessage("");
  }

  function reset() {
    setEditing(null); setName(""); setCategory(""); setQuantity("1"); setLocation(""); setNotes("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    const input = { name, category: category || null, quantity: Number(quantity), location: location || null, notes: notes || null };
    const result = editing ? await updateInventoryItem(editing.id, input) : await createInventoryItem(input);
    setPending(false);
    if (!result.ok) return setMessage(result.error);
    setMessage(editing ? "Item updated. Refreshing..." : "Item added. Refreshing...");
    window.location.reload();
  }

  async function changeQuantity(item: Item, amount: number) {
    const result = await adjustInventoryQuantity(item.id, amount);
    if (!result.ok) return setMessage(result.error);
    setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, quantity: Math.max(0, entry.quantity + amount) } : entry));
  }

  async function remove(item: Item) {
    if (!window.confirm(`Delete “${item.name}”?`)) return;
    const result = await deleteInventoryItem(item.id);
    if (!result.ok) return setMessage(result.error);
    setItems((current) => current.filter((entry) => entry.id !== item.id));
  }

  return <section className="mx-auto max-w-6xl py-4 sm:py-7"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#b86b3d]">Know what you have</p><h2 className="mt-3 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Inventory</h2><p className="mt-4 max-w-xl text-base leading-7 text-[#61706a]">Keep the useful details close: what it is, where it lives, and how much is left.</p></div><span className="w-fit rounded-full bg-[#e5eee8] px-3.5 py-2 text-xs font-semibold text-[#477052]">{items.length} items</span></div><div className="mt-9 grid gap-5 lg:grid-cols-[0.7fr_1.3fr]"><div className="rounded-2xl border border-[#dfe4dd] bg-[#eef4ee] p-6 sm:p-7"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#477052]">{editing ? "Edit item" : "Add item"}</p><h3 className="mt-2 text-xl font-semibold">{editing ? "Update the details" : "Keep track of a useful thing"}</h3><form onSubmit={submit} className="mt-5 flex flex-col gap-3"><label htmlFor="inventory-name" className="text-xs font-semibold text-[#66756d]">Name</label><input id="inventory-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="USB-C cable" className="rounded-xl border border-[#d7dfd6] bg-[#fffdf8] px-3.5 py-3 text-sm outline-none focus:border-[#b86b3d]" /><div className="grid gap-3 sm:grid-cols-2"><div><label htmlFor="inventory-category" className="text-xs font-semibold text-[#66756d]">Category</label><input id="inventory-category" value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Tech" className="mt-2 w-full rounded-xl border border-[#d7dfd6] bg-[#fffdf8] px-3.5 py-3 text-sm outline-none focus:border-[#b86b3d]" /></div><div><label htmlFor="inventory-quantity" className="text-xs font-semibold text-[#66756d]">Quantity</label><input id="inventory-quantity" type="number" min="0" value={quantity} onChange={(event) => setQuantity(event.target.value)} className="mt-2 w-full rounded-xl border border-[#d7dfd6] bg-[#fffdf8] px-3.5 py-3 text-sm outline-none focus:border-[#b86b3d]" /></div></div><label htmlFor="inventory-location" className="text-xs font-semibold text-[#66756d]">Location</label><input id="inventory-location" value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Top drawer" className="rounded-xl border border-[#d7dfd6] bg-[#fffdf8] px-3.5 py-3 text-sm outline-none focus:border-[#b86b3d]" /><label htmlFor="inventory-notes" className="text-xs font-semibold text-[#66756d]">Notes</label><textarea id="inventory-notes" value={notes} onChange={(event) => setNotes(event.target.value)} rows={2} className="resize-none rounded-xl border border-[#d7dfd6] bg-[#fffdf8] px-3.5 py-3 text-sm outline-none focus:border-[#b86b3d]" /><div className="flex gap-2"><button disabled={pending} className="flex-1 rounded-xl bg-[#1c2b27] px-4 py-3 text-sm font-semibold text-[#f8f5ed] disabled:opacity-60">{pending ? "Saving..." : editing ? "Save changes" : "Add item"}</button>{editing && <button type="button" onClick={reset} className="rounded-xl px-4 py-3 text-sm font-semibold text-[#66756d] hover:bg-[#e1e9e1]">Cancel</button>}</div>{message && <p role="status" className="text-xs text-[#477052]">{message}</p>}</form></div><div><label htmlFor="inventory-search" className="sr-only">Search inventory</label><input id="inventory-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search inventory..." className="mb-4 w-full rounded-xl border border-[#dfe4dd] bg-[#fffdf8] px-4 py-3 text-sm outline-none focus:border-[#b86b3d]" /><div className="flex flex-col gap-3">{visibleItems.length ? visibleItems.map((item) => <article key={item.id} className="rounded-2xl border border-[#dfe4dd] bg-[#fffdf8] p-5 shadow-[0_8px_30px_rgba(28,43,39,0.035)]"><div className="flex items-start gap-4"><div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#fff0dd] text-sm font-bold text-[#a45d2f]">{item.quantity}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-[#1c2b27]">{item.name}</h3>{item.category && <span className="rounded-full bg-[#eef2ec] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#66756d]">{item.category}</span>}</div><p className="mt-2 text-sm text-[#718078]">{item.location || "No location"}</p>{item.notes && <p className="mt-1 text-xs text-[#9aa39d]">{item.notes}</p>}</div><div className="flex shrink-0 flex-col gap-1"><div className="flex items-center gap-1"><button aria-label={`Decrease ${item.name}`} onClick={() => changeQuantity(item, -1)} className="size-7 rounded-lg bg-[#eef2ec] text-sm font-bold text-[#66756d]">−</button><button aria-label={`Increase ${item.name}`} onClick={() => changeQuantity(item, 1)} className="size-7 rounded-lg bg-[#e5eee8] text-sm font-bold text-[#477052]">+</button></div><div className="flex gap-1"><button onClick={() => startEdit(item)} className="px-1.5 py-1 text-[11px] font-semibold text-[#66756d]">Edit</button><button onClick={() => remove(item)} className="px-1.5 py-1 text-[11px] font-semibold text-[#a44935]">Delete</button></div></div></div></article>) : <div className="rounded-2xl border border-dashed border-[#cdd8ce] bg-[#eef4ee] px-6 py-16 text-center"><p className="text-2xl">▦</p><h3 className="mt-3 text-lg font-semibold text-[#1c2b27]">No inventory yet</h3><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#718078]">Add the useful things around your home office so they are easier to find.</p></div>}</div></div></div></section>;
}
