import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { auth } from "@/lib/auth";
import { AppShell } from "@/components/app-shell";

export const instant = false;

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) redirect("/login");

  return (
    <AppShell user={{ name: session.user.name, email: session.user.email }}>
      {children}
    </AppShell>
  );
}
