"use client";

import { useEffect, useState } from "react";
import {
  ProviderReviewsView,
  type ProviderReviewRow,
} from "@/components/provider/provider-reviews-view";

type ReviewSummary = {
  ratingAvg: number | null;
  reviewCount: number;
  visibleCount: number;
  fiveStar: number;
  fourStar: number;
  threeStar: number;
  lowStar: number;
  last30Days: number;
};

export default function ProviderReviewsPage() {
  const [reviews, setReviews] = useState<ProviderReviewRow[]>([]);
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/provider/reviews")
      .then((r) => r.json())
      .then((data) => {
        setReviews(data.reviews ?? []);
        setSummary(data.summary ?? null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <ProviderReviewsView reviews={reviews} summary={summary} loading={loading} />
  );
}
