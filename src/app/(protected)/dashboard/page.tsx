import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const name = session?.user.name || session?.user.email || "there";

  return (
    <section className="mx-auto max-w-6xl py-4 sm:py-7">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#b86b3d]">Your workspace</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Good morning, {name}.</h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-[#61706a]">Your home office is ready. Start with one small thing, then let the system carry the rest.</p>
        </div>
        <span className="w-fit rounded-full bg-[#e5eee8] px-3.5 py-2 text-xs font-semibold text-[#477052]">All caught up</span>
      </div>
      <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {[
              ["Today", "A clear place for what matters now.", "01"],
              ["Routines", "Keep recurring work visible and light.", "02"],
              ["Projects", "Give larger home improvements a home.", "03"],
            ].map(([title, description, number]) => (
              <div key={title} className="rounded-2xl border border-[#dfe4dd] bg-[#fffdf8] p-6 shadow-[0_8px_30px_rgba(28,43,39,0.04)]">
                <div className="flex items-center justify-between"><h3 className="font-semibold">{title}</h3><span className="text-xs font-semibold text-[#b86b3d]">{number}</span></div>
                <p className="mt-2 text-sm leading-6 text-[#61706a]">{description}</p>
              </div>
            ))}
      </div>
      <div className="mt-8 rounded-2xl border border-dashed border-[#cdd8ce] bg-[#eef4ee] p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#477052]">Next up</p>
        <h3 className="mt-3 text-xl font-semibold">Your home office is taking shape.</h3>
        <p className="mt-2 max-w-lg text-sm leading-6 text-[#61706a]">Tasks, routines, projects, and inventory will appear here as you add them.</p>
      </div>
    </section>
  );
}
