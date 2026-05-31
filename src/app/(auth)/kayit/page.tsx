import { Suspense } from "react";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-sm text-[#53635f]">Yükleniyor...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
