import { Suspense } from "react";
import { AuthLoading } from "@/components/auth/auth-loading";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <Suspense fallback={<AuthLoading />}>
      <LoginForm />
    </Suspense>
  );
}
