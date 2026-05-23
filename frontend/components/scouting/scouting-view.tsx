"use client";

import { motion } from "framer-motion";
import { ScoutPlane } from "./scout-plane";
import { AgentStepper } from "./agent-stepper";
import type { AgentId } from "@/lib/types";

type Props = {
  activeAgent: AgentId;
  progress: string;
  city: string;
  country: string;
};

export function ScoutingView({
  activeAgent,
  progress,
  city,
  country,
}: Props) {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto max-w-3xl px-5 py-12 sm:px-6 sm:py-16"
    >
      <div className="text-center">
        <p className="text-sm font-medium text-neutral-500">Agents at work</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
          Building your Battle Plan
        </h2>
      </div>

      <div className="mt-10">
        <ScoutPlane activeAgent={activeAgent} city={city} country={country} />
      </div>

      <div className="mt-8 rounded-2xl border border-neutral-200 bg-neutral-950 p-5 font-mono text-[13px] text-neutral-300 shadow-sm">
        <p className="mb-3 text-neutral-500">scout · live</p>
        <p className="text-emerald-400">{progress || "Initializing…"}</p>
        <motion.div
          className="mt-3 space-y-1 text-neutral-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p>→ agent: {activeAgent}</p>
          <p>→ target: {city}, {country}</p>
        </motion.div>
      </div>

      <div className="mt-8">
        <AgentStepper activeAgent={activeAgent} progress={progress} />
      </div>
    </motion.section>
  );
}
