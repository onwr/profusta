"use client";

import { useEffect, useState } from "react";
import { ProviderJobsList, type ProviderJobRow } from "@/components/provider/provider-jobs-list";
import { isProviderCompletedStatus } from "@/lib/provider/job-statuses";

export default function ProviderCompletedJobsPage() {
  const [jobs, setJobs] = useState<ProviderJobRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((data) => {
        const list = (data.orders ?? []).filter((o: ProviderJobRow) =>
          isProviderCompletedStatus(o.status),
        );
        setJobs(list);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <ProviderJobsList jobs={jobs} loading={loading} variant="completed" />
  );
}
