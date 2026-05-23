"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import type { BattlePlan, Competitor } from "@/lib/types";

const pinIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function FitBounds({ competitors }: { competitors: Competitor[] }) {
  const map = useMap();
  useEffect(() => {
    if (competitors.length === 0) return;
    const bounds = L.latLngBounds(competitors.map((c) => [c.lat, c.lng]));
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 14 });
  }, [map, competitors]);
  return null;
}

type Props = {
  plan: BattlePlan;
  competitors: Competitor[];
  center: [number, number];
};

export function LeafletMapInner({ plan, competitors, center }: Props) {
  return (
    <MapContainer
      center={center}
      zoom={12}
      className="z-0 h-full w-full rounded-xl"
      style={{ minHeight: 400 }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds competitors={competitors} />
      {competitors.map((c) => (
        <Marker key={c.name} position={[c.lat, c.lng]} icon={pinIcon}>
          <Popup>
            <strong>{c.name}</strong>
            <br />
            <span className="text-xs">{c.address}</span>
            {c.notes && (
              <>
                <br />
                <span className="text-xs">{c.notes}</span>
              </>
            )}
          </Popup>
        </Marker>
      ))}
      {competitors.length === 0 && (
        <Marker position={center} icon={pinIcon}>
          <Popup>{plan.target_city} — no valid competitor coordinates yet</Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
