"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export function UserMenu({ name, email }: { name: string; email: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [open, setOpen] = useState(false);

  async function signOut() {
    setPending(true);
    await authClient.signOut();
    router.push("/login");
    router.refresh();
  }

  const initials = name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="relative">
      <button aria-expanded={open} aria-haspopup="menu" onClick={() => setOpen((value) => !value)} className="flex items-center gap-2.5 rounded-xl p-1.5 pr-2 transition hover:bg-[#e8eee7]">
        <span className="flex size-9 items-center justify-center rounded-[11px] bg-[#d9e6da] text-xs font-bold text-[#2f5541]">{initials}</span>
        <span className="hidden text-left sm:block"><span className="block max-w-[140px] truncate text-sm font-semibold">{name}</span><span className="block max-w-[140px] truncate text-[11px] text-[#87918b]">{email}</span></span>
        <IconChevron />
      </button>
      {open && <div role="menu" className="absolute right-0 top-12 w-52 rounded-2xl border border-[#dfe4dd] bg-[#fffdf8] p-2 shadow-[0_18px_50px_rgba(28,43,39,0.14)]">
        <div className="border-b border-[#e8ece5] px-3 py-2.5"><p className="text-xs font-semibold">Account</p><p className="mt-1 truncate text-[11px] text-[#87918b]">{email}</p></div>
        <Link role="menuitem" href="/settings/profile" onClick={() => setOpen(false)} className="mt-1 block rounded-xl px-3 py-2.5 text-sm font-medium transition hover:bg-[#eef4ee]">Profile settings</Link>
        <button role="menuitem" disabled={pending} onClick={signOut} className="mt-1 w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium text-[#b34d3c] transition hover:bg-[#fff0eb] disabled:opacity-50">{pending ? "Signing out…" : "Sign out"}</button>
      </div>}
    </div>
  );
}

function IconChevron() {
  return <svg className="size-4 text-[#87918b]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="m8 10 4 4 4-4" /></svg>;
}
