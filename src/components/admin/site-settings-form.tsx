"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type Settings = {
  siteName: string;
  supportEmail: string;
  maintenanceMode: boolean;
  heroTagline: string;
};

export function SiteSettingsForm({ initial }: { initial: Settings }) {
  const [settings, setSettings] = useState(initial);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/admin/settings/site", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <form onSubmit={submit} className="max-w-lg space-y-4 rounded-2xl border border-black/5 bg-white p-6">
      <label className="block text-sm font-semibold">
        Site adı
        <input
          value={settings.siteName}
          onChange={(e) =>
            setSettings((s) => ({ ...s, siteName: e.target.value }))
          }
          className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2"
        />
      </label>
      <label className="block text-sm font-semibold">
        Destek e-postası
        <input
          type="email"
          value={settings.supportEmail}
          onChange={(e) =>
            setSettings((s) => ({ ...s, supportEmail: e.target.value }))
          }
          className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2"
        />
      </label>
      <p className="rounded-lg bg-[#eef8f5] px-3 py-2 text-xs text-[#53635f]">
        Ana sayfa hero ve bölüm metinleri{" "}
        <a href="/admin/anasayfa" className="font-bold text-[#087a61] hover:underline">
          Anasayfa
        </a>{" "}
        ekranından yönetilir.
      </p>
      <label className="flex items-center gap-2 text-sm font-semibold">
        <input
          type="checkbox"
          checked={settings.maintenanceMode}
          onChange={(e) =>
            setSettings((s) => ({ ...s, maintenanceMode: e.target.checked }))
          }
        />
        Bakım modu
      </label>
      <Button type="submit" disabled={loading}>
        Kaydet
      </Button>
      {saved ? (
        <span className="ml-3 text-sm text-[#087a61]">Kaydedildi</span>
      ) : null}
    </form>
  );
}
