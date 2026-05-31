"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthMethodDivider } from "@/components/auth/auth-method-divider";
import { FormField, inputClassName } from "@/components/auth/form-field";
import { SocialAuthButton } from "@/components/auth/social-auth-button";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";
import { getGoogleAuthErrorMessage } from "@/lib/auth/google-error-messages";

const REMEMBER_EMAIL_KEY = "profusta_remember_email";

type Step = "choose" | "manual";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>("choose");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const applied = searchParams.get("applied") === "1";
  const googleError = searchParams.get("error");

  useEffect(() => {
    const message = getGoogleAuthErrorMessage(googleError);
    if (message) {
      setError(message);
      setStep("choose");
    }
  }, [googleError]);

  useEffect(() => {
    if (searchParams.get("manual") === "1") {
      setStep("manual");
    }
  }, [searchParams]);

  useEffect(() => {
    const saved = localStorage.getItem(REMEMBER_EMAIL_KEY);
    if (saved) {
      setEmail(saved);
      setRemember(true);
    }
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const body = {
      email: form.get("email"),
      password: form.get("password"),
    };

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Giriş başarısız");
        return;
      }

      const emailValue = String(body.email ?? "").trim();
      if (remember && emailValue) {
        localStorage.setItem(REMEMBER_EMAIL_KEY, emailValue);
      } else {
        localStorage.removeItem(REMEMBER_EMAIL_KEY);
      }

      const redirect =
        searchParams.get("redirect") ?? data.redirect ?? ROUTES.home;

      router.push(redirect);
      router.refresh();
    } catch {
      setError("Bağlantı hatası");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Giriş Yap"
      subtitle={
        step === "choose"
          ? "Google hesabınızla veya e-posta ile giriş yapın."
          : "E-posta ve şifrenizle giriş yapın."
      }
      footer={
        <>
          <span className="text-[#53635f]">Hesabınız yok mu? </span>
          <Link href={ROUTES.register} className="font-black text-[#087a61]">
            Kayıt Ol
          </Link>
        </>
      }
    >
      {applied && step === "choose" ? (
        <p className="mb-5 rounded-2xl bg-[#eef8f5] px-5 py-4 text-sm font-semibold text-[#087a61]">
          Usta başvurunuz alındı. Onay sonrası giriş yapabilirsiniz.
        </p>
      ) : null}

      {step === "choose" ? (
        <div className="space-y-5">
          {error ? (
            <p className="rounded-2xl bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
              {error}
            </p>
          ) : null}

          <SocialAuthButton
            icon={<FcGoogle size={22} />}
            label="Google ile Devam Et"
            href="/api/auth/google?intent=login"
          />

          <AuthMethodDivider />

          <Button
            type="button"
            variant="outline"
            className="h-[56px] w-full text-sm font-black"
            onClick={() => {
              setError("");
              setStep("manual");
            }}
          >
            E-posta ile giriş yap
          </Button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-5">
          <button
            type="button"
            onClick={() => {
              setError("");
              setStep("choose");
            }}
            className="text-sm font-semibold text-[#087a61] hover:underline"
          >
            ← Diğer giriş yöntemleri
          </button>

          <FormField label="E-posta Adresi">
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7b8b87]" />
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`${inputClassName} pl-14`}
                placeholder="E-posta adresinizi girin"
              />
            </div>
          </FormField>

          <FormField label="Şifre">
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7b8b87]" />
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                className={`${inputClassName} pl-14 pr-14`}
                placeholder="Şifrenizi girin"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-[#7b8b87]"
                aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </FormField>

          <div className="flex items-center justify-between gap-4">
            <label className="flex items-center gap-2 text-sm font-semibold text-[#53635f]">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-black/20 accent-[#087a61]"
              />
              Beni hatırla
            </label>

            <Link
              href="/sifremi-unuttum"
              className="text-sm font-black text-[#087a61]"
            >
              Şifremi Unuttum?
            </Link>
          </div>

          {error ? (
            <p className="rounded-2xl bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
              {error}
            </p>
          ) : null}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </Button>
        </form>
      )}
    </AuthCard>
  );
}
