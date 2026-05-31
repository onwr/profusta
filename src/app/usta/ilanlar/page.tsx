"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  ProviderListingsList,
  type ProviderListingRow,
} from "@/components/provider/provider-listings-list";

export default function ProviderListingsPage() {
  const router = useRouter();
  const [listings, setListings] = useState<ProviderListingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/provider/listings")
      .then((r) => r.json())
      .then((data) => {
        setListings(data.listings ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function deactivate(id: string) {
    if (!confirm("İlanı pasife almak istiyor musunuz?")) return;
    setActionId(id);
    try {
      const res = await fetch(`/api/provider/listings/${id}/deactivate`, {
        method: "PATCH",
      });
      if (res.ok) {
        load();
        router.refresh();
      }
    } finally {
      setActionId(null);
    }
  }

  return (
    <ProviderListingsList
      listings={listings}
      loading={loading}
      actionId={actionId}
      onDeactivate={(id) => void deactivate(id)}
    />
  );
}
