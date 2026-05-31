"use client";

import { useEffect, useState } from "react";
import L from "leaflet";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { DashboardProviderCard } from "@/lib/customer/dashboard-data";

const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const customerIcon = L.divIcon({
  className: "",
  html: `<div style="width:14px;height:14px;border-radius:50%;background:#083228;border:3px solid white;box-shadow:0 1px 4px rgba(0,0,0,.3)"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

function FitBounds({
  centerLat,
  centerLng,
  providers,
  flyToCenter,
}: {
  centerLat: number;
  centerLng: number;
  providers: DashboardProviderCard[];
  flyToCenter?: [number, number] | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (flyToCenter) {
      map.flyTo(flyToCenter, 13, { duration: 0.8 });
      return;
    }

    const points: [number, number][] = [[centerLat, centerLng]];
    for (const p of providers) {
      if (p.latitude != null && p.longitude != null) {
        points.push([p.latitude, p.longitude]);
      }
    }
    if (points.length === 1) {
      map.setView(points[0], 12);
      return;
    }
    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, { padding: [24, 24], maxZoom: 14 });
  }, [map, centerLat, centerLng, providers, flyToCenter]);

  return null;
}

export default function NearbyMapInner({
  centerLat,
  centerLng,
  providers,
  className,
  flyToCenter,
  userMarker,
}: {
  centerLat: number;
  centerLng: number;
  providers: DashboardProviderCard[];
  className?: string;
  flyToCenter?: [number, number] | null;
  userMarker?: [number, number];
}) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  if (!ready) {
    return (
      <div
        className={
          className ??
          "flex h-[220px] items-center justify-center rounded-2xl bg-[#f4f7f6] text-sm text-[#53635f]"
        }
      >
        Harita yükleniyor...
      </div>
    );
  }

  const pins = providers.filter(
    (p) => p.latitude != null && p.longitude != null,
  );
  const markerPosition = userMarker ?? [centerLat, centerLng];

  return (
    <MapContainer
      center={[centerLat, centerLng]}
      zoom={12}
      className={
        className ??
        "z-0 h-[220px] w-full rounded-2xl border border-black/10"
      }
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds
        centerLat={centerLat}
        centerLng={centerLng}
        providers={pins}
        flyToCenter={flyToCenter}
      />
      <Marker position={markerPosition} icon={customerIcon} />
      {pins.map((p) => (
        <Marker
          key={p.id}
          position={[p.latitude!, p.longitude!]}
          icon={markerIcon}
        />
      ))}
    </MapContainer>
  );
}
