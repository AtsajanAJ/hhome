"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { passwordChangeSchema, profileEmailSchema, profileNameSchema, profilePasswordSchema } from "@/lib/validations/profile";

type Notice = { kind: "success" | "error"; text: string } | null;

function NoticeMessage({ notice }: { notice: Notice }) {
  if (!notice) return null;
  return <p role="alert" className={`rounded-xl px-4 py-3 text-sm ${notice.kind === "success" ? "bg-[#e5eee8] text-[#477052]" : "bg-[#fff0eb] text-[#b34d3c]"}`}>{notice.text}</p>;
}

function Field({ label, name, type = "text", defaultValue, autoComplete }: { label: string; name: string; type?: string; defaultValue?: string; autoComplete?: string }) {
  return (
    <label className="block text-sm font-medium" htmlFor={name}>
      {label}
      <input id={name} name={name} type={type} defaultValue={defaultValue} autoComplete={autoComplete} required className="mt-2 h-11 w-full rounded-xl border border-[#d8d4c9] bg-white px-3.5 outline-none transition focus:border-[#b86b3d] focus:ring-4 focus:ring-[#b86b3d]/10" />
    </label>
  );
}

export function ProfileSettings({ initialName, initialEmail }: { initialName: string; initialEmail: string }) {
  const router = useRouter();
  const [profileNotice, setProfileNotice] = useState<Notice>(null);
  const [passwordNotice, setPasswordNotice] = useState<Notice>(null);
  const [deleteNotice, setDeleteNotice] = useState<Notice>(null);
  const [profilePending, setProfilePending] = useState(false);
  const [passwordPending, setPasswordPending] = useState(false);
  const [deletePending, setDeletePending] = useState(false);

  async function updateProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProfileNotice(null);
    const data = new FormData(event.currentTarget);
    const name = profileNameSchema.safeParse(data.get("name"));
    const email = profileEmailSchema.safeParse(data.get("email"));
    if (!name.success || !email.success) {
      setProfileNotice({ kind: "error", text: "Enter a valid name and email address." });
      return;
    }

    setProfilePending(true);
    const nameChanged = name.data !== initialName;
    const emailChanged = email.data !== initialEmail;
    if (nameChanged) {
      const result = await authClient.updateUser({ name: name.data });
      if (result.error) {
        setProfilePending(false);
        setProfileNotice({ kind: "error", text: "Unable to update your name." });
        return;
      }
    }
    if (emailChanged) {
      const result = await authClient.changeEmail({ newEmail: email.data, callbackURL: "/settings/profile" });
      if (result.error) {
        setProfilePending(false);
        setProfileNotice({ kind: "error", text: "Unable to update your email." });
        return;
      }
    }
    setProfilePending(false);
    setProfileNotice({ kind: "success", text: emailChanged ? "Profile saved. Your email change is active." : "Profile saved." });
    router.refresh();
  }

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordNotice(null);
    const data = new FormData(event.currentTarget);
    const result = passwordChangeSchema.safeParse({
      currentPassword: data.get("currentPassword"),
      newPassword: data.get("newPassword"),
      confirmation: data.get("confirmation"),
    });
    if (!result.success) {
      setPasswordNotice({ kind: "error", text: "Passwords must be between 8 and 72 characters." });
      return;
    }
    if (result.data.newPassword !== result.data.confirmation) {
      setPasswordNotice({ kind: "error", text: "New passwords do not match." });
      return;
    }

    setPasswordPending(true);
    const response = await authClient.changePassword({
      currentPassword: result.data.currentPassword,
      newPassword: result.data.newPassword,
      revokeOtherSessions: true,
    });
    setPasswordPending(false);
    if (response.error) {
      setPasswordNotice({ kind: "error", text: "Current password is incorrect or the new password is invalid." });
      return;
    }
    event.currentTarget.reset();
    setPasswordNotice({ kind: "success", text: "Password changed. Other sessions were signed out." });
  }

  async function deleteAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDeleteNotice(null);
    const data = new FormData(event.currentTarget);
    const password = profilePasswordSchema.safeParse(data.get("deletePassword"));
    if (!password.success) {
      setDeleteNotice({ kind: "error", text: "Enter your current password to confirm deletion." });
      return;
    }
    if (!window.confirm("Delete your account permanently? This cannot be undone.")) return;

    setDeletePending(true);
    const response = await authClient.deleteUser({ password: password.data });
    setDeletePending(false);
    if (response.error) {
      setDeleteNotice({ kind: "error", text: "Account deletion failed. Check your password and try again." });
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-3xl py-4 sm:py-7">
      <Link href="/dashboard" className="text-sm font-medium text-[#66756d] hover:text-[#1c2b27]">← Back to overview</Link>
      <div className="mt-8">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#b86b3d]">Account</p>
        <h2 className="mt-3 text-4xl font-semibold tracking-[-0.04em]">Profile settings</h2>
        <p className="mt-3 text-base leading-7 text-[#61706a]">Keep your identity and sign-in details up to date.</p>
      </div>

      <div className="mt-10 space-y-5">
        <section className="rounded-2xl border border-[#dfe4dd] bg-[#fffdf8] p-6 sm:p-7">
          <div className="mb-6"><h3 className="font-semibold">Personal details</h3><p className="mt-1 text-sm text-[#87918b]">This is how you appear in your workspace.</p></div>
          <form onSubmit={updateProfile} className="space-y-5">
            <Field label="Name" name="name" defaultValue={initialName} autoComplete="name" />
            <Field label="Email" name="email" type="email" defaultValue={initialEmail} autoComplete="email" />
            <p className="text-xs leading-5 text-[#87918b]">Email changes are applied immediately while email verification is not configured.</p>
            <NoticeMessage notice={profileNotice} />
            <button disabled={profilePending} type="submit" className="rounded-xl bg-[#1c2b27] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2d403a] disabled:opacity-50">{profilePending ? "Saving…" : "Save profile"}</button>
          </form>
        </section>

        <section className="rounded-2xl border border-[#dfe4dd] bg-[#fffdf8] p-6 sm:p-7">
          <div className="mb-6"><h3 className="font-semibold">Change password</h3><p className="mt-1 text-sm text-[#87918b]">Changing your password signs out other active sessions.</p></div>
          <form onSubmit={changePassword} className="space-y-5">
            <Field label="Current password" name="currentPassword" type="password" autoComplete="current-password" />
            <Field label="New password" name="newPassword" type="password" autoComplete="new-password" />
            <Field label="Confirm new password" name="confirmation" type="password" autoComplete="new-password" />
            <NoticeMessage notice={passwordNotice} />
            <button disabled={passwordPending} type="submit" className="rounded-xl border border-[#c9c4b8] px-5 py-2.5 text-sm font-semibold transition hover:border-[#1c2b27] disabled:opacity-50">{passwordPending ? "Changing…" : "Change password"}</button>
          </form>
        </section>

        <section className="rounded-2xl border border-[#e8cfc8] bg-[#fff9f6] p-6 sm:p-7">
          <div className="mb-6"><h3 className="font-semibold text-[#8f3f32]">Delete account</h3><p className="mt-1 text-sm leading-6 text-[#9b6b62]">This permanently removes your profile, sessions, and account data.</p></div>
          <form onSubmit={deleteAccount} className="space-y-5">
            <Field label="Current password" name="deletePassword" type="password" autoComplete="current-password" />
            <NoticeMessage notice={deleteNotice} />
            <button disabled={deletePending} type="submit" className="rounded-xl bg-[#b34d3c] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#953d30] disabled:opacity-50">{deletePending ? "Deleting…" : "Delete my account"}</button>
          </form>
        </section>
      </div>
    </div>
  );
}
