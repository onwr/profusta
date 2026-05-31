"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ProviderPayoutsView,
  type ProviderPayoutRow,
} from "@/components/provider/provider-payouts-view";

export default function ProviderPayoutsPage() {
  const [payouts, setPayouts] = useState<ProviderPayoutRow[]>([]);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [hasIban, setHasIban] = useState(false);
  const [ibanMasked, setIbanMasked] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback((opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoading(true);
    fetch("/api/provider/payouts")
      .then((r) => r.json())
      .then((data) => {
        setPayouts(data.payouts ?? []);
        setAvailableBalance(data.availableBalance ?? 0);
        setHasIban(data.hasIban ?? false);
        setIbanMasked(data.ibanMasked ?? null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <ProviderPayoutsView
      payouts={payouts}
      availableBalance={availableBalance}
      hasIban={hasIban}
      ibanMasked={ibanMasked}
      loading={loading}
      onRefresh={() => load({ silent: true })}
    />
  );
}
