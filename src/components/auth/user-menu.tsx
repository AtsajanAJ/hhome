"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function UserMenu({ name }: { name: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function signOut() {
    setPending(true);
    await authClient.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-[#61706a]">{name}</span>
      <button disabled={pending} onClick={signOut} className="rounded-full border border-[#c9c4b8] px-4 py-2 text-sm font-semibold transition hover:border-[#1c2b27] disabled:opacity-50">
        {pending ? "Signing out…" : "Sign out"}
      </button>
    </div>
  );
}
