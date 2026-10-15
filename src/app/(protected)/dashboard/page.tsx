import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { UserMenu } from "@/components/auth/user-menu";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const name = session?.user.name || session?.user.email || "there";

  return (
    <main className="min-h-screen bg-[#f4f1ea] text-[#1c2b27]">
      <div className="mx-auto max-w-6xl px-6 py-8 sm:px-10 lg:px-16">
        <header className="flex items-center justify-between border-b border-[#d8d4c9] pb-6">
          <span className="text-sm font-bold uppercase tracking-[0.18em]">H/Office</span>
          <UserMenu name={name} />
        </header>
        <section className="py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#b86b3d]">Your workspace</p>
          <h1 className="mt-4 text-5xl font-semibold tracking-[-0.04em]">Good morning, {name}.</h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-[#61706a]">Your home office is ready. The first modules for routines, tasks, and household details will live here.</p>
          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {[
              ["Today", "A clear place for what matters now."],
              ["Routines", "Keep recurring work visible and light."],
              ["Projects", "Give larger home improvements a home."],
            ].map(([title, description]) => (
              <div key={title} className="rounded-2xl border border-[#d8d4c9] bg-[#fffdf8] p-6">
                <h2 className="font-semibold">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-[#61706a]">{description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
