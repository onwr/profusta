"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { AuthCard } from "@/components/auth/auth-card";
import { FormField, inputClassName } from "@/components/auth/form-field";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password: form.get("password"),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "İşlem başarısız");
        return;
      }
      router.push(data.redirect ?? ROUTES.login);
    } catch {
      setError("Bağlantı hatası");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <AuthCard title="Geçersiz bağlantı" subtitle="Lütfen yeni bir sıfırlama talebi oluşturun">
        <Link href="/sifremi-unuttum" className="font-bold text-[#087a61]">
          Şifremi unuttum
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Yeni Şifre" subtitle="Yeni şifrenizi belirleyin">
      <form onSubmit={onSubmit} className="space-y-4">
        <FormField label="Yeni şifre">
          <input
            name="password"
            type="password"
            required
            minLength={8}
            className={inputClassName}
          />
        </FormField>

        {error ? (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Kaydediliyor..." : "Şifreyi Güncelle"}
        </Button>
      </form>
    </AuthCard>
  );
}
