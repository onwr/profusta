"use client";

import { useEffect, useState } from "react";
import { ProviderJobsList, type ProviderJobRow } from "@/components/provider/provider-jobs-list";
import { isProviderActiveStatus } from "@/lib/provider/job-statuses";

export default function ProviderJobsPage() {
  const [jobs, setJobs] = useState<ProviderJobRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((data) => {
        const list = (data.orders ?? []).filter((o: ProviderJobRow) =>
          isProviderActiveStatus(o.status),
        );
        setJobs(list);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return <ProviderJobsList jobs={jobs} loading={loading} variant="active" />;
}
