"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthCard } from "@/components/auth/auth-card";
import { FormField, inputClassName } from "@/components/auth/form-field";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";

export function ForgotPasswordForm() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email") }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "İşlem başarısız");
        return;
      }
      setMessage(data.message);
    } catch {
      setError("Bağlantı hatası");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Şifremi Unuttum"
      subtitle="E-posta adresinize sıfırlama bağlantısı gönderilir"
      footer={
        <Link href={ROUTES.login} className="font-bold text-[#087a61]">
          Giriş sayfasına dön
        </Link>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <FormField label="E-posta">
          <input name="email" type="email" required className={inputClassName} />
        </FormField>

        {message ? (
          <p className="rounded-xl bg-[#eef8f5] px-4 py-3 text-sm text-[#087a61]">
            {message}
          </p>
        ) : null}
        {error ? (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Gönderiliyor..." : "Bağlantı Gönder"}
        </Button>
      </form>
    </AuthCard>
  );
}
