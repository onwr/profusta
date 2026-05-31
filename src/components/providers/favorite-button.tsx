"use client";

import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function FavoriteButton({
  providerId,
  initialFavorited = false,
}: {
  providerId: string;
  initialFavorited?: boolean;
}) {
  const router = useRouter();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    if (favorited) {
      await fetch(`/api/favorites/${providerId}`, { method: "DELETE" });
      setFavorited(false);
    } else {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerId }),
      });
      if (res.status === 401) {
        router.push("/giris?redirect=/ustalar/" + providerId);
        setLoading(false);
        return;
      }
      if (res.ok) setFavorited(true);
    }
    setLoading(false);
    router.refresh();
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="gap-2"
      disabled={loading}
      onClick={toggle}
    >
      <Heart
        className={`h-4 w-4 ${favorited ? "fill-red-500 text-red-500" : ""}`}
      />
      {favorited ? "Favorilerden çıkar" : "Favorilere ekle"}
    </Button>
  );
}
