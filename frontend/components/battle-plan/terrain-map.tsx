"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import type { BattlePlan, Competitor } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  plan: BattlePlan;
  className?: string;
};

function project(
  lat: number,
  lng: number,
  bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number },
) {
  const x =
    ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng || 1)) * 100;
  const y =
    (1 - (lat - bounds.minLat) / (bounds.maxLat - bounds.minLat || 1)) * 100;
  return { x: Math.min(95, Math.max(5, x)), y: Math.min(90, Math.max(10, y)) };
}

export function TerrainMap({ plan, className = "" }: Props) {
  const [selected, setSelected] = useState<Competitor | null>(null);

  const bounds = useMemo(() => {
    const lats = plan.competitors.map((c) => c.lat);
    const lngs = plan.competitors.map((c) => c.lng);
    const pad = 0.02;
    return {
      minLat: Math.min(...lats) - pad,
      maxLat: Math.max(...lats) + pad,
      minLng: Math.min(...lngs) - pad,
      maxLng: Math.max(...lngs) + pad,
    };
  }, [plan.competitors]);

  return (
    <div
      className={`relative h-full min-h-[320px] overflow-hidden rounded-[1.75rem] border border-pink-100 bg-gradient-to-br from-pink-50 via-white to-rose-50 shadow-lg shadow-pink-200/30 ${className}`}
    >
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgb(0 0 0 / 0.05) 1px, transparent 0)`,
          backgroundSize: "16px 16px",
        }}
      />

      <div className="absolute left-4 top-4 z-10 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-medium text-neutral-600 shadow-sm backdrop-blur">
        {plan.target_city}, {plan.target_country}
      </div>

      {plan.competitors.map((c, i) => {
        const pos = project(c.lat, c.lng, bounds);
        return (
          <motion.button
            key={c.name}
            type="button"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 * i, type: "spring" }}
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            className={cn(
              "absolute z-10 -translate-x-1/2 -translate-y-full",
              selected?.name === c.name && "z-20",
            )}
            onClick={() => setSelected(selected?.name === c.name ? null : c)}
          >
            <MapPin
              className={cn(
                "h-8 w-8 drop-shadow-md transition-colors",
                selected?.name === c.name
                  ? "fill-pink-600 text-pink-600"
                  : "fill-pink-500 text-pink-500",
              )}
            />
          </motion.button>
        );
      })}

      {selected && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 left-4 right-4 z-20 rounded-xl border border-neutral-200 bg-white p-4 shadow-lg"
        >
          <p className="font-semibold text-neutral-900">{selected.name}</p>
          <p className="mt-1 text-xs text-neutral-500">{selected.address}</p>
          {selected.notes && (
            <p className="mt-2 text-sm text-neutral-600">{selected.notes}</p>
          )}
        </motion.div>
      )}

      {!selected && (
        <p className="absolute bottom-4 left-4 text-xs text-neutral-400">
          Tap a pin for details
        </p>
      )}
    </div>
  );
}
