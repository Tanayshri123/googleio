"use client";

import { motion } from "framer-motion";
import { Check, Map, Search, FileText, Layers } from "lucide-react";
import type { AgentId } from "@/lib/types";
import { cn } from "@/lib/utils";

const STEPS: {
  id: AgentId;
  label: string;
  sub: string;
  icon: typeof FileText;
}[] = [
  {
    id: "general",
    label: "The General",
    sub: "Reads your company",
    icon: FileText,
  },
  {
    id: "cartographer",
    label: "Cartographer",
    sub: "Maps grounding",
    icon: Map,
  },
  {
    id: "networker",
    label: "Networker",
    sub: "Search grounding",
    icon: Search,
  },
  {
    id: "strategist",
    label: "Strategist",
    sub: "Battle Plan",
    icon: Layers,
  },
];

const ORDER: AgentId[] = [
  "general",
  "cartographer",
  "networker",
  "strategist",
];

function stepIndex(id: AgentId) {
  return ORDER.indexOf(id);
}

type Props = {
  activeAgent: AgentId;
  progress?: string;
};

export function AgentStepper({ activeAgent, progress }: Props) {
  const activeIdx = stepIndex(activeAgent);

  return (
    <div className="w-full">
      <div className="flex items-start justify-between gap-1 sm:gap-2">
        {STEPS.map((step, i) => {
          const done = i < activeIdx;
          const active = i === activeIdx;
          const Icon = step.icon;

          return (
            <div key={step.id} className="flex flex-1 flex-col items-center">
              <motion.div
                animate={{
                  scale: active ? 1.06 : 1,
                }}
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-2xl border-2 transition-all sm:h-12 sm:w-12",
                  done
                    ? "border-transparent bg-neutral-900 text-white shadow-lg"
                    : active
                      ? "border-pink-400 bg-gradient-to-br from-pink-400 to-rose-500 text-white shadow-lg shadow-pink-400/30"
                      : "border-pink-100 bg-white text-neutral-400",
                )}
              >
                {done ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
              </motion.div>
              <p
                className={cn(
                  "mt-2 text-center text-[11px] font-semibold sm:text-xs",
                  active ? "text-neutral-900" : "text-neutral-400",
                )}
              >
                {step.label}
              </p>
              <p className="mt-0.5 hidden text-center text-[10px] text-neutral-400 sm:block">
                {step.sub}
              </p>
            </div>
          );
        })}
      </div>

      <div className="relative mt-6 h-1.5 overflow-hidden rounded-full bg-neutral-100">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-pink-300 via-pink-500 to-rose-400"
          initial={{ width: "0%" }}
          animate={{
            width: `${((activeIdx + 0.5) / STEPS.length) * 100}%`,
          }}
          transition={{ type: "spring", stiffness: 80, damping: 20 }}
        />
      </div>

      {progress && (
        <motion.p
          key={progress}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-5 text-center text-sm text-neutral-600"
        >
          {progress}
        </motion.p>
      )}
    </div>
  );
}
