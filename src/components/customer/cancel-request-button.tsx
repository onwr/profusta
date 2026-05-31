"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CancelRequestButton({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function cancel() {
    if (!confirm("Bu talebi iptal etmek istediğinize emin misiniz?")) return;
    setLoading(true);
    await fetch(`/api/requests/${requestId}/cancel`, { method: "PATCH" });
    router.refresh();
    setLoading(false);
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="h-10 text-red-600"
      disabled={loading}
      onClick={cancel}
    >
      {loading ? "İptal ediliyor..." : "Talebi İptal Et"}
    </Button>
  );
}
