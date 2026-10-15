import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = { title: "Create account | Home office" };

export default function RegisterPage() {
  return <RegisterForm />;
}
