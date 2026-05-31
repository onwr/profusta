import { Suspense } from "react";
import { AuthLoading } from "@/components/auth/auth-loading";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<AuthLoading />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
