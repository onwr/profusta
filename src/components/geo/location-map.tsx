"use client";

import { useEffect, useState } from "react";
import L from "leaflet";
import {
  Circle,
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { DEFAULT_MAP_CENTER } from "@/lib/geo/turkey";

const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function MapClickHandler({
  onChange,
}: {
  onChange: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
}

export function LocationMap({
  latitude,
  longitude,
  onChange,
  mode = "edit",
  heightClass = "h-[320px]",
  zoom = 13,
  radiusKm,
}: {
  latitude: number;
  longitude: number;
  onChange?: (lat: number, lng: number) => void;
  mode?: "edit" | "readonly";
  heightClass?: string;
  zoom?: number;
  radiusKm?: number;
}) {
  const [mounted, setMounted] = useState(false);
  const readonly = mode === "readonly";

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={`flex ${heightClass} items-center justify-center rounded-2xl border border-black/10 bg-[#f4f7f6] text-sm text-[#53635f]`}
      >
        Harita yükleniyor...
      </div>
    );
  }

  const position: [number, number] = [
    latitude || DEFAULT_MAP_CENTER.lat,
    longitude || DEFAULT_MAP_CENTER.lng,
  ];

  return (
    <MapContainer
      center={position}
      zoom={zoom}
      className={`${heightClass} w-full rounded-2xl border border-black/10 z-0`}
      scrollWheelZoom={!readonly}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Recenter lat={position[0]} lng={position[1]} />
      {radiusKm != null && radiusKm > 0 ? (
        <Circle
          center={position}
          radius={radiusKm * 1000}
          pathOptions={{
            color: "#087a61",
            fillColor: "#087a61",
            fillOpacity: 0.12,
            weight: 2,
          }}
        />
      ) : null}
      <Marker
        position={position}
        icon={markerIcon}
        draggable={!readonly && !!onChange}
        eventHandlers={
          !readonly && onChange
            ? {
                dragend: (e) => {
                  const { lat, lng } = e.target.getLatLng();
                  onChange(lat, lng);
                },
              }
            : undefined
        }
      />
      {!readonly && onChange ? <MapClickHandler onChange={onChange} /> : null}
    </MapContainer>
  );
}
