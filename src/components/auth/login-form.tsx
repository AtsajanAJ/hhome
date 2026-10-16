"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { loginSchema } from "@/lib/validations/auth";
import { AuthFormShell } from "./auth-form-shell";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const formData = new FormData(event.currentTarget);
    const result = loginSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    if (!result.success) {
      setError("Enter a valid email and password.");
      return;
    }

    setPending(true);
    const response = await authClient.signIn.email({
      ...result.data,
      callbackURL: "/dashboard",
    });
    setPending(false);

    if (response.error) {
      setError("Invalid email or password.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  async function signInWithGoogle() {
    setError("");
    setPending(true);
    const response = await authClient.signIn.social({ provider: "google", callbackURL: "/dashboard" });
    if (response.error) {
      setPending(false);
      setError("Unable to sign in with Google. Please try again.");
    }
  }

  return (
    <AuthFormShell
      eyebrow="Home office"
      title="Welcome back"
      description="Sign in to keep your home, tasks, and routines in one calm place."
      footer={
        <>
          New here? <Link className="font-semibold text-[#b85f32] hover:underline" href="/register">Create an account</Link>
        </>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        <label className="block text-sm font-medium" htmlFor="email">
          Email
          <input id="email" name="email" type="email" autoComplete="email" required className="mt-2 h-12 w-full rounded-xl border border-[#d8d4c9] bg-white px-4 outline-none transition focus:border-[#b86b3d] focus:ring-4 focus:ring-[#b86b3d]/10" />
        </label>
        <label className="block text-sm font-medium" htmlFor="password">
          Password
          <input id="password" name="password" type="password" autoComplete="current-password" required className="mt-2 h-12 w-full rounded-xl border border-[#d8d4c9] bg-white px-4 outline-none transition focus:border-[#b86b3d] focus:ring-4 focus:ring-[#b86b3d]/10" />
        </label>
        {error && <p className="text-sm text-[#b34d3c]" role="alert">{error}</p>}
        <button disabled={pending} className="h-12 w-full rounded-xl bg-[#1c2b27] font-semibold text-white transition hover:bg-[#2d403a] disabled:cursor-not-allowed disabled:opacity-60" type="submit">
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <div className="my-5 flex items-center gap-3 text-xs text-[#9a9c95]"><span className="h-px flex-1 bg-[#e2ded4]" /><span>OR</span><span className="h-px flex-1 bg-[#e2ded4]" /></div>
      <button type="button" disabled={pending} onClick={signInWithGoogle} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#d8d4c9] bg-white font-semibold transition hover:border-[#1c2b27] disabled:cursor-not-allowed disabled:opacity-60"><span className="text-base font-bold text-[#4285f4]">G</span>{pending ? "Connecting…" : "Continue with Google"}</button>
    </AuthFormShell>
  );
}
