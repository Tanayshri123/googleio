"use client";

import { motion } from "framer-motion";
import { CartoonPlane } from "./cartoon-plane";
import type { AgentId } from "@/lib/types";

const AGENT_PROGRESS: Record<AgentId, number> = {
  general: 0.05,
  cartographer: 0.33,
  networker: 0.66,
  strategist: 0.95,
};

type Props = {
  activeAgent: AgentId;
  city: string;
  country: string;
};

export function ScoutPlane({ activeAgent, city, country }: Props) {
  const progress = AGENT_PROGRESS[activeAgent];

  return (
    <div className="relative mx-auto w-full max-w-4xl overflow-hidden rounded-[2rem] border border-pink-100 bg-white shadow-xl shadow-pink-200/40">
      {/* soft pink sky */}
      <div className="absolute inset-0 bg-gradient-to-b from-pink-50 via-white to-pink-50/30" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,#fce7f3_0%,transparent_50%)]" />

      {/* clouds */}
      <motion.div
        className="absolute left-[8%] top-[20%] h-5 w-14 rounded-full bg-white/90 shadow-sm"
        animate={{ x: [0, 24, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute right-[12%] top-[15%] h-4 w-12 rounded-full bg-pink-100/80"
        animate={{ x: [0, -18, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* flight lane */}
      <div className="relative z-10 px-6 pb-6 pt-10 sm:px-10">
        <div className="relative h-28 sm:h-32">
          {/* track */}
          <div className="absolute bottom-6 left-0 right-0 h-0.5 rounded-full bg-pink-100" />
          <motion.div
            className="absolute bottom-6 left-0 h-1 rounded-full bg-gradient-to-r from-pink-300 via-pink-500 to-pink-400"
            initial={{ width: "0%" }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ type: "spring", stiffness: 45, damping: 18 }}
          />

          {/* dashed path */}
          <div
            className="absolute bottom-[22px] left-[4%] right-[4%] border-t-2 border-dashed border-pink-300/70"
            aria-hidden
          />

          {/* origin */}
          <div className="absolute bottom-0 left-0 flex flex-col items-center">
            <div className="h-3 w-3 rounded-full bg-pink-500 ring-4 ring-pink-100" />
            <span className="mt-2 text-xs font-semibold text-neutral-500">You</span>
          </div>

          {/* destination */}
          <div className="absolute bottom-0 right-0 flex flex-col items-center">
            <div className="h-3 w-3 rounded-full bg-pink-600 ring-4 ring-pink-100" />
            <span className="mt-2 max-w-[80px] truncate text-center text-xs font-semibold text-neutral-700">
              {city}
            </span>
          </div>

          {/* cartoon plane — flies left → right */}
          <motion.div
            className="absolute bottom-4 z-20"
            style={{ left: `calc(${4 + progress * 88}% - 56px)` }}
            animate={{
              left: `calc(${4 + progress * 88}% - 56px)`,
              y: [0, -8, -4, -10, 0],
            }}
            transition={{
              left: { type: "spring", stiffness: 55, damping: 14 },
              y: { repeat: Infinity, duration: 2.5, ease: "easeInOut" },
            }}
          >
            <motion.div
              animate={{ rotate: [-2, 2, -2] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="relative"
            >
              {/* speed lines */}
              <motion.div
                className="absolute -left-8 top-1/2 flex -translate-y-1/2 flex-col gap-1"
                animate={{ opacity: [0.2, 0.6, 0.2] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
              >
                <span className="block h-0.5 w-6 rounded-full bg-pink-300" />
                <span className="block h-0.5 w-4 rounded-full bg-pink-200" />
                <span className="block h-0.5 w-5 rounded-full bg-pink-300" />
              </motion.div>
              <CartoonPlane className="h-16 w-44 drop-shadow-[0_8px_20px_rgba(244,63,94,0.25)] sm:h-20 sm:w-52" />
            </motion.div>
          </motion.div>
        </div>

        <p className="mt-4 text-center text-sm text-neutral-600">
          Flying to{" "}
          <span className="font-semibold text-pink-600">
            {city}, {country}
          </span>
        </p>
      </div>
    </div>
  );
}
