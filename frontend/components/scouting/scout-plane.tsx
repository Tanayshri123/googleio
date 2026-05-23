"use client";

import { motion } from "framer-motion";
import { scoutProgressFraction } from "@/lib/scout-progress";
import type { ScoutPhase } from "@/lib/types";

type Props = {
  scoutPhase: ScoutPhase;
  selectedSkills: string[];
  completedSkills: string[];
  activeSkill: string | null;
  city: string;
  country: string;
};

function CartoonPlane({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 72"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M12 44c6-20 32-34 58-36h52c18 0 34 10 38 26 2 8 0 16-6 20l-8 6H70c-16 0-30-10-38-20l-8-6z"
        fill="#fff"
        stroke="#171717"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M128 16c10-8 24-6 30 8 3 5 4 10 2 14l-26-4c-2-8-4-12-6-18z"
        fill="#fbcfe8"
        stroke="#171717"
        strokeWidth="2"
      />
      <path
        d="M44 38L14 22 6 36l36 14z"
        fill="#fff"
        stroke="#171717"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M52 20L42 4 56 2l10 20z"
        fill="#fff"
        stroke="#171717"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M168 42l32-8-4 12-28-4z"
        fill="#fff"
        stroke="#171717"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <rect x="98" y="30" width="8" height="8" rx="1" fill="#f9a8d4" stroke="#171717" strokeWidth="1.2" />
      <rect x="110" y="30" width="8" height="8" rx="1" fill="#f9a8d4" stroke="#171717" strokeWidth="1.2" />
      <rect x="122" y="30" width="8" height="8" rx="1" fill="#f9a8d4" stroke="#171717" strokeWidth="1.2" />
      <rect x="134" y="30" width="8" height="8" rx="1" fill="#f9a8d4" stroke="#171717" strokeWidth="1.2" />
      <path
        d="M82 48h70l-8 10H74l8-10z"
        fill="#fce7f3"
        stroke="#171717"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <ellipse cx="96" cy="58" rx="11" ry="7" fill="#d4d4d8" stroke="#171717" strokeWidth="2" />
      <circle cx="96" cy="58" r="4" fill="#525252" />
      <ellipse cx="138" cy="60" rx="10" ry="6.5" fill="#d4d4d8" stroke="#171717" strokeWidth="2" />
      <circle cx="138" cy="60" r="3.5" fill="#525252" />
    </svg>
  );
}

export function ScoutPlane({
  scoutPhase,
  selectedSkills,
  completedSkills,
  activeSkill,
  city,
  country,
}: Props) {
  const p = scoutProgressFraction({
    scoutPhase,
    selectedSkills,
    completedSkills,
    activeSkill,
  });
  const leftPct = 6 + p * 88;

  return (
    <div className="mx-auto w-full max-w-xl overflow-hidden rounded-2xl border border-pink-100 bg-gradient-to-b from-pink-50 via-white to-sky-50 shadow-sm">
      <div className="relative px-6 pb-8 pt-10 sm:px-10">
        <div className="relative h-32 sm:h-36">
          <div className="absolute bottom-10 left-0 right-0 border-t border-pink-100" />
          <div className="absolute bottom-10 left-0 right-0 h-0.5 bg-neutral-200" />
          <motion.div
            className="absolute bottom-10 left-0 h-1 rounded-full bg-pink-500"
            animate={{ width: `${leftPct}%` }}
            transition={{ type: "spring", stiffness: 40, damping: 14 }}
          />

          <span className="absolute bottom-1 left-0 text-xs font-medium text-neutral-500">
            You
          </span>
          <span className="absolute bottom-1 right-0 max-w-[140px] truncate text-right text-xs font-semibold text-neutral-900">
            {city}
          </span>

          <motion.div
            className="absolute z-10 -translate-x-1/2"
            style={{ bottom: "18px" }}
            animate={{
              left: `${leftPct}%`,
              y: [0, -12, -5, -10, 0],
              rotate: [-2, 1, -1, 2, -2],
            }}
            transition={{
              left: { type: "spring", stiffness: 50, damping: 12 },
              y: { repeat: Infinity, duration: 2.4, ease: "easeInOut" },
              rotate: { repeat: Infinity, duration: 2.4, ease: "easeInOut" },
            }}
          >
            <CartoonPlane className="h-16 w-auto drop-shadow-md sm:h-[4.5rem]" />
          </motion.div>
        </div>

        <p className="mt-2 text-center text-sm text-neutral-600">
          Scouting{" "}
          <span className="font-semibold text-neutral-900">
            {city}, {country}
          </span>
        </p>
      </div>
    </div>
  );
}
