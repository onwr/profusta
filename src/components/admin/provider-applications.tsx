"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type ProviderRow = {
  id: string;
  status: string;
  baseCity: string | null;
  baseDistrict: string | null;
  createdAt: string;
  rejectedReason: string | null;
  user: {
    fullName: string;
    email: string;
    phone: string | null;
  };
  categories: { categorySlug: string }[];
};

export function ProviderApplications({
  providers,
}: {
  providers: ProviderRow[];
}) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleAction(
    id: string,
    action: "approve" | "reject",
    rejectedReason?: string,
  ) {
    setLoadingId(id);
    setError("");
    try {
      const res = await fetch(`/api/admin/providers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, rejectedReason }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "İşlem başarısız");
        return;
      }
      router.refresh();
    } catch {
      setError("Bağlantı hatası");
    } finally {
      setLoadingId(null);
    }
  }

  if (providers.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-black/10 bg-white p-8 text-center text-sm text-[#53635f]">
        Bekleyen başvuru yok.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {error ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {providers.map((p) => (
        <article
          key={p.id}
          className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-[#083228]">
                {p.user.fullName}
              </h3>
              <p className="mt-1 text-sm text-[#53635f]">{p.user.email}</p>
              {p.user.phone ? (
                <p className="text-sm text-[#53635f]">{p.user.phone}</p>
              ) : null}
              <p className="mt-2 text-sm text-[#7b8b87]">
                {p.baseCity}
                {p.baseDistrict ? `, ${p.baseDistrict}` : ""}
              </p>
              <p className="mt-2 text-xs text-[#7b8b87]">
                Kategoriler:{" "}
                {p.categories.map((c) => c.categorySlug).join(", ") || "—"}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={loadingId === p.id}
                onClick={() => handleAction(p.id, "approve")}
                className="rounded-lg bg-[#087a61] px-4 py-2 text-sm font-bold text-white hover:bg-[#06644f] disabled:opacity-50"
              >
                Onayla
              </button>
              <button
                type="button"
                disabled={loadingId === p.id}
                onClick={() =>
                  handleAction(p.id, "reject", "Başvuru uygun bulunmadı")
                }
                className="rounded-lg border border-red-200 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                Reddet
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
