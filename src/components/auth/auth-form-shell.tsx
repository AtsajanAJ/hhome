import type { ReactNode } from "react";

export function AuthFormShell({
  eyebrow,
  title,
  description,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f1ea] px-6 py-12 text-[#1c2b27]">
      <section className="w-full max-w-md rounded-3xl border border-[#d8d4c9] bg-[#fffdf8] p-8 shadow-[0_24px_80px_rgba(28,43,39,0.10)] sm:p-10">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-[#b86b3d]">
          {eyebrow}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-[#61706a]">{description}</p>
        <div className="mt-8">{children}</div>
        <div className="mt-8 border-t border-[#e4e0d6] pt-6 text-center text-sm text-[#61706a]">
          {footer}
        </div>
      </section>
    </main>
  );
}
