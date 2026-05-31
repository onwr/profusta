"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { inputClassName } from "@/components/auth/form-field";

type Settings = {
  apiKey: string;
  hasSecretKey: boolean;
  baseUrl: string;
  callbackUrl: string;
  defaultIdentity: string;
  isConfigured: boolean;
};

const SECRET_PLACEHOLDER = "••••••••••••••••";

export function IyzicoSettingsForm() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("https://sandbox-api.iyzipay.com");
  const [callbackUrl, setCallbackUrl] = useState("");
  const [defaultIdentity, setDefaultIdentity] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings/iyzico")
      .then((r) => r.json())
      .then((data) => {
        const s = data.settings as Settings;
        setSettings(s);
        setApiKey(s.apiKey);
        setBaseUrl(s.baseUrl);
        setCallbackUrl(s.callbackUrl);
        setDefaultIdentity(s.defaultIdentity);
        if (s.hasSecretKey) setSecretKey(SECRET_PLACEHOLDER);
      });
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    const payload: Record<string, string> = {
      apiKey,
      baseUrl,
      callbackUrl,
      defaultIdentity,
    };

    if (secretKey && secretKey !== SECRET_PLACEHOLDER) {
      payload.secretKey = secretKey;
    }

    const res = await fetch("/api/admin/settings/iyzico", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Ayarlar kaydedilemedi");
      return;
    }

    const s = data.settings as Settings;
    setSettings(s);
    if (s.hasSecretKey) setSecretKey(SECRET_PLACEHOLDER);
    setMessage("İyzico ayarları kaydedildi");
  }

  const isSandbox = baseUrl.includes("sandbox");

  return (
    <form
      onSubmit={onSubmit}
      className="max-w-2xl space-y-5 rounded-2xl border border-black/5 bg-white p-6"
    >
      {settings && !settings.isConfigured ? (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Ödeme henüz yapılandırılmadı. API anahtarı ve gizli anahtarı girin;
          aksi halde müşteri ödemeleri başlatılamaz.
        </p>
      ) : null}

      <label className="block text-sm font-semibold">
        API anahtarı
        <input
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className={`mt-1 ${inputClassName}`}
          placeholder="sandbox-..."
          autoComplete="off"
        />
      </label>

      <label className="block text-sm font-semibold">
        Gizli anahtar (secret)
        <input
          type="password"
          value={secretKey}
          onChange={(e) => setSecretKey(e.target.value)}
          onFocus={() => {
            if (secretKey === SECRET_PLACEHOLDER) setSecretKey("");
          }}
          className={`mt-1 ${inputClassName}`}
          placeholder={
            settings?.hasSecretKey
              ? "Değiştirmek için yeni değer girin"
              : "sandbox-..."
          }
          autoComplete="new-password"
        />
      </label>

      <label className="block text-sm font-semibold">
        API adresi (base URL)
        <select
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
          className={`mt-1 ${inputClassName}`}
        >
          <option value="https://sandbox-api.iyzipay.com">
            Sandbox — test ortamı
          </option>
          <option value="https://api.iyzipay.com">Production — canlı</option>
        </select>
      </label>

      <label className="block text-sm font-semibold">
        Callback URL
        <input
          value={callbackUrl}
          onChange={(e) => setCallbackUrl(e.target.value)}
          className={`mt-1 ${inputClassName}`}
          placeholder="https://alanadiniz.com/api/payments/iyzico/callback"
        />
        <span className="mt-1 block text-xs font-normal text-[#7b8b87]">
          Herkese açık HTTPS adres olmalı; localhost kabul edilmez.
        </span>
      </label>

      {isSandbox ? (
        <label className="block text-sm font-semibold">
          Sandbox test TC kimlik (opsiyonel)
          <input
            inputMode="numeric"
            maxLength={11}
            value={defaultIdentity}
            onChange={(e) =>
              setDefaultIdentity(e.target.value.replace(/\D/g, "").slice(0, 11))
            }
            className={`mt-1 ${inputClassName}`}
            placeholder="11111111111"
          />
          <span className="mt-1 block text-xs font-normal text-[#7b8b87]">
            Müşteri TC alanını boş bıraktığında sandbox ödemelerinde kullanılır.
          </span>
        </label>
      ) : null}

      {error ? (
        <p className="text-sm font-semibold text-red-600">{error}</p>
      ) : null}
      {message ? (
        <p className="text-sm font-semibold text-[#087a61]">{message}</p>
      ) : null}

      <Button type="submit" disabled={loading || !settings} className="h-10">
        Kaydet
      </Button>
    </form>
  );
}
