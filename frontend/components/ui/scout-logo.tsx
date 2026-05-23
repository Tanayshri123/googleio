"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

const C = {
  blue: "#4285F4",
  red: "#EA4335",
  yellow: "#FBBC05",
  green: "#34A853",
  ink: "#202124",
  muted: "#5F6368",
} as const;

/** Scout binoculars mark — readable from 24px up */
function ScoutMark({ size = 40, gradId }: { size?: number; gradId: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className="shrink-0"
    >
      <defs>
        <linearGradient id={gradId} x1="8" y1="8" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor={C.blue} />
          <stop offset="0.35" stopColor={C.red} />
          <stop offset="0.65" stopColor={C.yellow} />
          <stop offset="1" stopColor={C.green} />
        </linearGradient>
        <filter id="scout-mark-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.2" floodColor="#202124" floodOpacity="0.12" />
        </filter>
      </defs>

      {/* Card */}
      <rect
        x="2"
        y="2"
        width="44"
        height="44"
        rx="12"
        fill="#fff"
        stroke="#E8EAED"
        strokeWidth="1"
        filter="url(#scout-mark-shadow)"
      />

      {/* Scan arc — exploration */}
      <path
        d="M10 28c6-10 22-10 28 0"
        stroke={`url(#${gradId})`}
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.85"
      />

      {/* Binoculars body */}
      <rect x="14" y="22" width="20" height="5" rx="2.5" fill={C.red} opacity="0.9" />

      {/* Left lens */}
      <circle cx="17" cy="26" r="7.5" fill="#E8F0FE" stroke={C.blue} strokeWidth="2" />
      <circle cx="17" cy="26" r="3" fill={C.blue} opacity="0.35" />
      <circle cx="17" cy="26" r="1.5" fill={C.blue} />

      {/* Right lens */}
      <circle cx="31" cy="26" r="7.5" fill="#E6F4EA" stroke={C.green} strokeWidth="2" />
      <circle cx="31" cy="26" r="3" fill={C.green} opacity="0.35" />
      <circle cx="31" cy="26" r="1.5" fill={C.green} />

      {/* AI sparkle */}
      <path
        d="M35 13l1.2 2.4 2.6.4-1.9 1.8.45 2.6L35 18.8l-2.35 1.4.45-2.6-1.9-1.8 2.6-.4L35 13z"
        fill={C.yellow}
      />
    </svg>
  );
}

type Props = {
  variant?: "full" | "mark";
  className?: string;
  height?: number;
};

export function ScoutLogo({ variant = "full", className, height = 36 }: Props) {
  const gradId = useId();
  const markSize = variant === "mark" ? height : Math.round(height * 1.05);

  if (variant === "mark") {
    return (
      <span className={cn("inline-flex", className)} role="img" aria-label="Google AI Scout">
        <ScoutMark size={markSize} gradId={gradId} />
      </span>
    );
  }

  return (
    <span
      className={cn("inline-flex items-center gap-2.5", className)}
      role="img"
      aria-label="Google AI Scout"
    >
      <ScoutMark size={markSize} gradId={gradId} />
      <span className="flex flex-col justify-center leading-none">
        <span
          className="text-[10px] font-medium tracking-wide text-[#5F6368] sm:text-[11px]"
          style={{ color: C.muted }}
        >
          Google
        </span>
        <span className="mt-0.5 flex items-baseline gap-1 text-[15px] font-bold tracking-tight sm:text-[17px]">
          <span style={{ color: C.ink }}>AI</span>
          <span className="scout-gradient-text">Scout</span>
        </span>
      </span>
    </span>
  );
}
