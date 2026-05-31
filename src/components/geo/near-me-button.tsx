"use client";

import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserLocation } from "@/hooks/use-user-location";

export function NearMeButton({
  onLocated,
  label = "Konumumu kullan",
  variant = "outline",
}: {
  onLocated: (lat: number, lng: number) => void;
  label?: string;
  variant?: "primary" | "outline";
}) {
  const { loading, error, requestLocation } = useUserLocation();

  async function handleClick() {
    const loc = await requestLocation();
    if (loc) onLocated(loc.lat, loc.lng);
  }

  return (
    <div>
      <Button
        type="button"
        variant={variant}
        className="gap-2 h-10"
        disabled={loading}
        onClick={handleClick}
      >
        <MapPin className="h-4 w-4" />
        {loading ? "Konum alınıyor..." : label}
      </Button>
      {error ? (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      ) : null}
    </div>
  );
}
