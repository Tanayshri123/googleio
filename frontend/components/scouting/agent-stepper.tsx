"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import type { AgentId } from "@/lib/types";
import { cn } from "@/lib/utils";

const STEPS: { id: AgentId; label: string }[] = [
  { id: "general", label: "General" },
  { id: "cartographer", label: "Cartographer" },
  { id: "networker", label: "Networker" },
  { id: "strategist", label: "Strategist" },
];

const ORDER: AgentId[] = ["general", "cartographer", "networker", "strategist"];

function stepIndex(id: AgentId) {
  return ORDER.indexOf(id);
}

type Props = {
  activeAgent: AgentId;
  progress?: string;
};

export function AgentStepper({ activeAgent }: Props) {
  const activeIdx = stepIndex(activeAgent);

  return (
    <div className="flex items-center justify-between gap-2">
      {STEPS.map((step, i) => {
        const done = i < activeIdx;
        const active = i === activeIdx;
        return (
          <div key={step.id} className="flex flex-1 flex-col items-center">
            <div
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                done && "bg-neutral-900 text-white",
                active && "bg-neutral-900 text-white ring-4 ring-neutral-200",
                !done && !active && "bg-neutral-100 text-neutral-400",
              )}
            >
              {done ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <p
              className={cn(
                "mt-2 hidden text-center text-[11px] font-medium sm:block",
                active ? "text-neutral-900" : "text-neutral-400",
              )}
            >
              {step.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}
