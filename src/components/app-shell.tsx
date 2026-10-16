"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { UserMenu } from "@/components/auth/user-menu";

type User = { name: string; email: string };

type NavItem = {
  label: string;
  href: string;
  icon: IconName;
  soon?: boolean;
};

type IconName = "grid" | "check" | "repeat" | "folder" | "box" | "menu" | "close" | "chevron";

const primaryNav: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: "grid" },
  { label: "Tasks", href: "/tasks", icon: "check" },
  { label: "Routines", href: "/routines", icon: "repeat" },
];

const secondaryNav: NavItem[] = [
  { label: "Projects", href: "/projects", icon: "folder" },
  { label: "Inventory", href: "/inventory", icon: "box" },
];

function Icon({ name, className = "size-4" }: { name: IconName; className?: string }) {
  const common = { className, fill: "none", stroke: "currentColor", strokeWidth: 1.8, viewBox: "0 0 24 24" };

  if (name === "grid") return <svg {...common}><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><rect x="14" y="14" width="6" height="6" rx="1" /></svg>;
  if (name === "check") return <svg {...common}><path d="m5 12 4 4L19 6" /><path d="M5 5h4M5 19h4" /></svg>;
  if (name === "repeat") return <svg {...common}><path d="m17 2 3 3-3 3" /><path d="M4 11V9a4 4 0 0 1 4-4h12" /><path d="m7 22-3-3 3-3" /><path d="M20 13v2a4 4 0 0 1-4 4H4" /></svg>;
  if (name === "folder") return <svg {...common}><path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H10l2 2h6.5A2.5 2.5 0 0 1 21 9.5v7A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5Z" /></svg>;
  if (name === "box") return <svg {...common}><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9Z" /><path d="m4 7.5 8 4.5 8-4.5M12 12v9" /></svg>;
  if (name === "close") return <svg {...common}><path d="m6 6 12 12M18 6 6 18" /></svg>;
  if (name === "chevron") return <svg {...common}><path d="m8 10 4 4 4-4" /></svg>;
  return <svg {...common}><path d="M4 6h16M4 12h16M4 18h16" /></svg>;
}

function NavSection({ label, items, onNavigate }: { label: string; items: NavItem[]; onNavigate: () => void }) {
  const pathname = usePathname();

  return (
    <div className="mt-7">
      <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#87918b]">{label}</p>
      <nav className="mt-2 space-y-1" aria-label={label}>
        {items.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${active ? "bg-[#e5eee8] font-semibold text-[#1c2b27]" : "text-[#66756d] hover:bg-[#f1f4ef] hover:text-[#1c2b27]"}`}
            >
              <Icon name={item.icon} className={`size-[17px] ${active ? "text-[#b86b3d]" : "text-[#8a968f] group-hover:text-[#1c2b27]"}`} />
              <span>{item.label}</span>
              {item.soon && <span className="ml-auto text-[9px] font-medium uppercase tracking-[0.12em] text-[#9aa39d]">Soon</span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <>
      <button aria-label="Close navigation" onClick={onClose} className={`fixed inset-0 z-30 bg-[#1c2b27]/30 backdrop-blur-[2px] transition-opacity lg:hidden ${open ? "opacity-100" : "pointer-events-none opacity-0"}`} />
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[276px] flex-col border-r border-[#dfe4dd] bg-[#fbfcf8] px-4 py-5 transition-transform duration-300 lg:static lg:z-auto lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between px-3">
          <Link href="/dashboard" onClick={onClose} className="flex items-center gap-2.5 text-sm font-bold uppercase tracking-[0.18em] text-[#1c2b27]">
            <span className="flex size-8 items-center justify-center rounded-[10px] bg-[#1c2b27] text-xs font-bold tracking-normal text-[#f4f1ea]">H</span>
            H/Office
          </Link>
          <button aria-label="Close navigation" onClick={onClose} className="rounded-lg p-2 text-[#87918b] hover:bg-[#eef2ec] hover:text-[#1c2b27] lg:hidden"><Icon name="close" /></button>
        </div>
        <div className="mt-8 rounded-2xl bg-[#f0f4ef] p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#87918b]">Workspace</p>
          <p className="mt-2 text-sm font-semibold text-[#1c2b27]">Personal home office</p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#dbe5dc]"><div className="h-full w-1/3 rounded-full bg-[#b86b3d]" /></div>
          <p className="mt-2 text-[11px] text-[#718078]">Your calm command center</p>
        </div>
        <NavSection label="Workspace" items={primaryNav} onNavigate={onClose} />
        <NavSection label="Manage" items={secondaryNav} onNavigate={onClose} />
        <div className="mt-auto border-t border-[#e1e6df] px-3 pt-4">
          <p className="text-xs leading-5 text-[#87918b]">More tools are on their way. Start with one clear thing today.</p>
        </div>
      </aside>
    </>
  );
}

export function AppShell({ children, user }: { children: ReactNode; user: User }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const pageTitle = pathname === "/tasks" ? "Tasks" : pathname.startsWith("/settings") ? "Settings" : pathname.startsWith("/routines") ? "Routines" : pathname.startsWith("/projects") ? "Projects" : pathname.startsWith("/inventory") ? "Inventory" : "Overview";

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  return (
    <div className="flex min-h-screen bg-[#f4f6f1] text-[#1c2b27]">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-[#dfe4dd] bg-[#f4f6f1]/95 px-5 backdrop-blur-md sm:px-8 lg:px-10">
          <div className="flex items-center gap-3">
            <button aria-label="Open navigation" onClick={() => setSidebarOpen(true)} className="rounded-xl p-2 text-[#66756d] hover:bg-[#e8eee7] hover:text-[#1c2b27] lg:hidden"><Icon name="menu" className="size-5" /></button>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#b86b3d]">Thursday, October 15</p>
              <h1 className="mt-0.5 text-lg font-semibold tracking-[-0.02em]">{pageTitle}</h1>
            </div>
          </div>
          <UserMenu name={user.name} email={user.email} />
        </header>
        <main className="min-w-0 flex-1 px-5 py-7 sm:px-8 sm:py-9 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
