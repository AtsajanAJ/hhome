import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f4f1ea] text-[#1c2b27]">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8 sm:px-10 lg:px-16">
        <nav className="flex items-center justify-between">
          <Link href="/" className="text-sm font-bold uppercase tracking-[0.18em]">H/Office</Link>
          <div className="flex items-center gap-5 text-sm font-medium">
            <Link href="/login" className="text-[#61706a] hover:text-[#1c2b27]">Sign in</Link>
            <Link href="/register" className="rounded-full bg-[#1c2b27] px-5 py-2.5 text-white transition hover:bg-[#2d403a]">Get started</Link>
          </div>
        </nav>
        <section className="flex flex-1 items-center py-20">
          <div className="max-w-3xl">
            <p className="mb-6 text-xs font-semibold uppercase tracking-[0.25em] text-[#b86b3d]">A little more room to breathe</p>
            <h1 className="max-w-2xl text-5xl font-semibold leading-[1.04] tracking-[-0.04em] sm:text-7xl">Make the work of home feel lighter.</h1>
            <p className="mt-8 max-w-xl text-lg leading-8 text-[#61706a]">A quiet, practical workspace for the routines, projects, and details that make your home work well.</p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/register" className="rounded-full bg-[#b86b3d] px-6 py-3.5 font-semibold text-white transition hover:bg-[#9e572f]">Create your workspace</Link>
              <Link href="/login" className="rounded-full border border-[#c9c4b8] px-6 py-3.5 font-semibold transition hover:border-[#1c2b27]">I already have an account</Link>
            </div>
          </div>
        </section>
        <footer className="flex justify-between border-t border-[#d8d4c9] pt-5 text-xs text-[#7a837e]">
          <span>Built for the everyday.</span>
          <span>Private by design.</span>
        </footer>
      </div>
    </main>
  );
}
