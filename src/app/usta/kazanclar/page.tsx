"use client";

import { useEffect, useState } from "react";
import { ProviderEarningsView } from "@/components/provider/provider-earnings-view";

type Wallet = {
  available: number;
  pending: number;
  totalEarned: number;
  withdrawn: number;
};

type Entry = {
  id: string;
  type: string;
  amount: number;
  note: string | null;
  createdAt: string;
  orderId: string | null;
  orderTitle: string | null;
};

export default function ProviderEarningsPage() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [earningsByDay, setEarningsByDay] = useState<
    { label: string; amount: number }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/provider/earnings")
      .then((r) => r.json())
      .then((data) => {
        setWallet(data.wallet ?? null);
        setEntries(data.entries ?? []);
        setEarningsByDay(data.earningsByDay ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <ProviderEarningsView
      wallet={wallet}
      entries={entries}
      earningsByDay={earningsByDay}
      loading={loading}
    />
  );
}
