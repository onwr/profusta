"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { ProviderAvatar } from "@/components/provider/provider-avatar";
import { Button } from "@/components/ui/button";

type ProfileData = {
  fullName: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  createdAt: string;
};

export function CustomerProfileView() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/customer/profile")
      .then((r) => r.json())
      .then((data) => {
        const p = data.profile as ProfileData;
        setProfile(p);
        setFullName(p.fullName);
        setPhone(p.phone ?? "");
      })
      .finally(() => setLoading(false));
  }, []);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/customer/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          phone: phone.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Profil güncellenemedi");
        return;
      }
      setProfile(data.profile);
      setMessage("Profil başarıyla güncellendi");
    } catch {
      setError("Bağlantı hatası");
    } finally {
      setSaving(false);
    }
  }

  async function onAvatarChange(file: File) {
    setAvatarUploading(true);
    setError("");
    setMessage("");

    const form = new FormData();
    form.append("avatar", file);

    try {
      const res = await fetch("/api/customer/avatar", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Fotoğraf yüklenemedi");
        return;
      }
      setProfile((prev) =>
        prev ? { ...prev, avatarUrl: data.avatarUrl } : prev,
      );
      setMessage("Profil fotoğrafı güncellendi");
    } catch {
      setError("Bağlantı hatası");
    } finally {
      setAvatarUploading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[240px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#087a61]" />
      </div>
    );
  }

  if (!profile) {
    return (
      <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
        Profil yüklenemedi.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#083228]">Profilim</h1>
        <p className="mt-1 text-sm text-[#53635f]">
          Hesap bilgilerinizi görüntüleyin ve güncelleyin.
        </p>
      </div>

      <section className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-black text-[#083228]">Profil fotoğrafı</h2>
        <div className="mt-4 flex items-center gap-4">
          <ProviderAvatar
            userName={profile.fullName}
            avatarUrl={profile.avatarUrl}
            size="lg"
          />
          <div>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-black/10 px-4 py-2 text-sm font-bold text-[#083228] hover:bg-[#f4f8f6]">
              {avatarUploading ? "Yükleniyor..." : "Fotoğraf seç"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={avatarUploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onAvatarChange(file);
                }}
              />
            </label>
          </div>
        </div>
      </section>

      <form
        onSubmit={onSave}
        className="space-y-5 rounded-2xl border border-black/5 bg-white p-6 shadow-sm"
      >
        <h2 className="text-sm font-black text-[#083228]">Kişisel bilgiler</h2>

        <div>
          <label className="mb-1.5 block text-xs font-black text-[#53635f]">
            Ad Soyad
          </label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="h-11 w-full rounded-xl border border-black/10 px-3 text-sm text-[#083228] outline-none focus:border-[#087a61]/40 focus:ring-2 focus:ring-[#087a61]/10"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-black text-[#53635f]">
            E-posta
          </label>
          <input
            value={profile.email}
            readOnly
            className="h-11 w-full rounded-xl border border-black/5 bg-[#f7f7f3] px-3 text-sm text-[#53635f]"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-black text-[#53635f]">
            Telefon
          </label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="05xx xxx xx xx"
            className="h-11 w-full rounded-xl border border-black/10 px-3 text-sm text-[#083228] outline-none focus:border-[#087a61]/40 focus:ring-2 focus:ring-[#087a61]/10"
          />
        </div>

        <p className="text-xs text-[#8b9b96]">
          Üyelik tarihi:{" "}
          {new Date(profile.createdAt).toLocaleDateString("tr-TR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>

        {error ? (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}
        {message ? (
          <p className="rounded-xl bg-[#eef8f5] px-4 py-3 text-sm font-semibold text-[#087a61]">
            {message}
          </p>
        ) : null}

        <Button type="submit" disabled={saving} className="h-11">
          {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
        </Button>
      </form>
    </div>
  );
}
