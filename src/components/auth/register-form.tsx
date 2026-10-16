"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { registerSchema } from "@/lib/validations/auth";
import { AuthFormShell } from "./auth-form-shell";

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");
    const confirmation = String(formData.get("confirmation") ?? "");
    const result = registerSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      password,
    });

    if (password !== confirmation) {
      setError("Passwords do not match.");
      return;
    }

    if (!result.success) {
      const issue = result.error.issues[0];
      if (issue?.path[0] === "name") setError("Name must be at least 2 characters.");
      else if (issue?.path[0] === "email") setError("Enter a valid email address.");
      else if (issue?.path[0] === "password") setError("Password must be between 8 atleast ");
      else setError("Check your details and try again.");
      return;
    }

    setPending(true);
    const response = await authClient.signUp.email({ ...result.data, callbackURL: "/dashboard" });
    setPending(false);
    if (response.error) {
      setError("Unable to create your account. Please try again.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  async function signUpWithGoogle() {
    setError("");
    setPending(true);
    const response = await authClient.signIn.social({ provider: "google", callbackURL: "/dashboard" });
    if (response.error) {
      setPending(false);
      setError("Unable to continue with Google. Please try again.");
    }
  }

  return (
    <AuthFormShell
      eyebrow="Start simply"
      title="Create your account"
      description="Set up your private workspace for the things that keep home running."
      footer={<>Already have an account? <Link className="font-semibold text-[#b85f32] hover:underline" href="/login">Sign in</Link></>}
    >
      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        <label className="block text-sm font-medium" htmlFor="name">Name<input id="name" name="name" type="text" autoComplete="name" required className="mt-2 h-12 w-full rounded-xl border border-[#d8d4c9] bg-white px-4 outline-none focus:border-[#b86b3d] focus:ring-4 focus:ring-[#b86b3d]/10" /></label>
        <label className="block text-sm font-medium" htmlFor="email">Email<input id="email" name="email" type="email" autoComplete="email" required className="mt-2 h-12 w-full rounded-xl border border-[#d8d4c9] bg-white px-4 outline-none focus:border-[#b86b3d] focus:ring-4 focus:ring-[#b86b3d]/10" /></label>
        <label className="block text-sm font-medium" htmlFor="password">Password<input id="password" name="password" type="password" autoComplete="new-password" required aria-describedby="password-hint" className="mt-2 h-12 w-full rounded-xl border border-[#d8d4c9] bg-white px-4 outline-none focus:border-[#b86b3d] focus:ring-4 focus:ring-[#b86b3d]/10" /><span id="password-hint" className="mt-2 block text-xs font-normal text-[#7a837e]">Use 8–72 characters.</span></label>
        <label className="block text-sm font-medium" htmlFor="confirmation">Confirm password<input id="confirmation" name="confirmation" type="password" autoComplete="new-password" required className="mt-2 h-12 w-full rounded-xl border border-[#d8d4c9] bg-white px-4 outline-none focus:border-[#b86b3d] focus:ring-4 focus:ring-[#b86b3d]/10" /></label>
        {error && <p className="text-sm text-[#b34d3c]" role="alert">{error}</p>}
        <button disabled={pending} className="h-12 w-full rounded-xl bg-[#1c2b27] font-semibold text-white transition hover:bg-[#2d403a] disabled:cursor-not-allowed disabled:opacity-60" type="submit">{pending ? "Creating account…" : "Create account"}</button>
      </form>
      <div className="my-5 flex items-center gap-3 text-xs text-[#9a9c95]"><span className="h-px flex-1 bg-[#e2ded4]" /><span>OR</span><span className="h-px flex-1 bg-[#e2ded4]" /></div>
      <button type="button" disabled={pending} onClick={signUpWithGoogle} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#d8d4c9] bg-white font-semibold transition hover:border-[#1c2b27] disabled:cursor-not-allowed disabled:opacity-60"><span className="text-base font-bold text-[#4285f4]">G</span>{pending ? "Connecting…" : "Continue with Google"}</button>
    </AuthFormShell>
  );
}
