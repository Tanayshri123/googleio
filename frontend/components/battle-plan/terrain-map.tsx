"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { BattlePlan, Competitor } from "@/lib/types";
import { geocodeQuery, isValidCoord } from "@/lib/geocode";

const LeafletMapInner = dynamic(
  () =>
    import("./leaflet-map-inner").then((m) => m.LeafletMapInner),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[400px] items-center justify-center rounded-xl bg-neutral-100 text-sm text-neutral-500">
        Loading map…
      </div>
    ),
  },
);

type Props = {
  plan: BattlePlan;
  className?: string;
};

export function TerrainMap({ plan, className = "" }: Props) {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [center, setCenter] = useState<[number, number]>([12.97, 77.59]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function resolve() {
      setLoading(true);
      const cityCenter = await geocodeQuery(
        `${plan.target_city}, ${plan.target_country}`,
      );
      const base = cityCenter ?? { lat: 30.27, lng: -97.74 };

      const resolved: Competitor[] = [];
      for (const c of plan.competitors) {
        if (isValidCoord(c.lat, c.lng)) {
          resolved.push(c);
          continue;
        }
        const geo = await geocodeQuery(
          `${c.address}, ${plan.target_city}, ${plan.target_country}`,
        );
        if (geo) {
          resolved.push({ ...c, lat: geo.lat, lng: geo.lng });
        }
        await new Promise((r) => setTimeout(r, 120));
      }

      if (!cancelled) {
        setCenter([base.lat, base.lng]);
        setCompetitors(resolved);
        setLoading(false);
      }
    }

    resolve();
    return () => {
      cancelled = true;
    };
  }, [plan]);

  return (
    <div
      className={`relative h-[420px] overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100 sm:h-[480px] lg:h-[560px] ${className}`}
    >
      <div className="absolute left-3 top-3 z-[1000] rounded-lg bg-white px-3 py-1.5 text-xs font-medium shadow-md">
        {plan.target_city}, {plan.target_country}
        {!loading && (
          <span className="ml-2 text-neutral-400">· {competitors.length} pins</span>
        )}
      </div>

      {loading ? (
        <div className="flex min-h-[400px] items-center justify-center text-sm text-neutral-500">
          Geocoding competitors…
        </div>
      ) : (
        <LeafletMapInner plan={plan} competitors={competitors} center={center} />
      )}
    </div>
  );
}
