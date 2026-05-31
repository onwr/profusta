"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ProviderOffersList,
  type ProviderOfferRow,
} from "@/components/provider/provider-offers-list";

export default function ProviderOffersPage() {
  const [offers, setOffers] = useState<ProviderOfferRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/provider/offers")
      .then((r) => r.json())
      .then((data) => {
        setOffers(data.offers ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <ProviderOffersList offers={offers} loading={loading} onRefresh={load} />
  );
}
