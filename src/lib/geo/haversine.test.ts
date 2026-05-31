import { describe, expect, it } from "vitest";
import {
  distanceBetweenPoints,
  formatDistanceKm,
  haversineKm,
} from "@/lib/geo/haversine";

describe("haversineKm", () => {
  it("Ankara–İstanbul arası yaklaşık 350 km", () => {
    const km = haversineKm(39.9334, 32.8597, 41.0082, 28.9784);
    expect(km).toBeGreaterThan(300);
    expect(km).toBeLessThan(450);
  });

  it("aynı nokta 0 km", () => {
    expect(haversineKm(41, 29, 41, 29)).toBe(0);
  });
});

describe("formatDistanceKm", () => {
  it("metre gösterir", () => {
    expect(formatDistanceKm(0.5)).toBe("500 m");
  });

  it("km gösterir", () => {
    expect(formatDistanceKm(12.3)).toContain("km");
  });

  it("null için mesaj", () => {
    expect(formatDistanceKm(null)).toBe("Mesafe bilgisi yok");
  });
});

describe("distanceBetweenPoints", () => {
  it("nokta çifti ile hesaplar", () => {
    const d = distanceBetweenPoints(
      { lat: 0, lng: 0 },
      { lat: 0, lng: 1 },
    );
    expect(d).toBeGreaterThan(0);
  });
});
