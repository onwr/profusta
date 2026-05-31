"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

type ListingRow = {
  id: string;
  title: string;
  price: number;
  city: string;
  district: string | null;
  status: string;
  rejectedReason: string | null;
  createdAt: string;
  category: { name: string };
  provider: { user: { fullName: string; email: string } };
};

const statusLabels: Record<string, string> = {
  PENDING: "Onay bekliyor",
  ACTIVE: "Yayında",
  REJECTED: "Reddedildi",
  INACTIVE: "Pasif",
};

export function ListingAdminTable({ listings }: { listings: ListingRow[] }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleAction(
    id: string,
    action: "approve" | "reject" | "deactivate",
    rejectedReason?: string,
  ) {
    setLoadingId(id);
    setError("");
    try {
      const res = await fetch(`/api/admin/listings/${id}`, {
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

  if (listings.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-black/10 bg-white p-8 text-center text-sm text-[#53635f]">
        Bu filtrede ilan yok.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {error ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}
      {listings.map((l) => (
        <article
          key={l.id}
          className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-[#083228]">{l.title}</h3>
              <p className="text-sm text-[#53635f]">
                {l.category.name} · {l.provider.user.fullName} ({l.provider.user.email})
              </p>
              <p className="mt-1 text-sm text-[#53635f]">
                {l.city}
                {l.district ? ` / ${l.district}` : ""} ·{" "}
                {l.price.toLocaleString("tr-TR")} ₺
              </p>
              {l.rejectedReason ? (
                <p className="mt-2 text-sm text-red-600">{l.rejectedReason}</p>
              ) : null}
            </div>
            <span className="rounded-full bg-[#eef8f5] px-3 py-1 text-xs font-bold text-[#087a61]">
              {statusLabels[l.status] ?? l.status}
            </span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {l.status === "PENDING" ? (
              <>
                <Button
                  type="button"
                  className="h-10"
                  disabled={loadingId === l.id}
                  onClick={() => handleAction(l.id, "approve")}
                >
                  Onayla
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 text-red-600"
                  disabled={loadingId === l.id}
                  onClick={() => {
                    const reason = prompt("Red sebebi (opsiyonel):");
                    handleAction(l.id, "reject", reason ?? undefined);
                  }}
                >
                  Reddet
                </Button>
              </>
            ) : null}
            {l.status === "ACTIVE" ? (
              <Button
                type="button"
                variant="outline"
                className="h-10"
                disabled={loadingId === l.id}
                onClick={() => handleAction(l.id, "deactivate")}
              >
                Pasife al
              </Button>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}
