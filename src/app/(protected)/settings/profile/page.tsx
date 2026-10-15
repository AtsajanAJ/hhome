import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { ProfileSettings } from "@/components/profile/profile-settings";

export default async function ProfilePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return null;

  return <ProfileSettings initialName={session.user.name} initialEmail={session.user.email} />;
}
