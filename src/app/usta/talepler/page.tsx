"use client";

import { useEffect, useState } from "react";
import {
  ProviderRequestsList,
  type ProviderRequestRow,
} from "@/components/provider/provider-requests-list";

export default function ProviderRequestsPage() {
  const [requests, setRequests] = useState<ProviderRequestRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/provider/requests")
      .then((r) => r.json())
      .then((data) => {
        setRequests(data.requests ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return <ProviderRequestsList requests={requests} loading={loading} />;
}
