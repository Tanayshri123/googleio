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
      exit={{ opacity: 0 }}
      className="mx-auto max-w-4xl px-6 py-12 sm:py-16"
    >
      <div className="text-center">
        <p className="text-sm font-medium uppercase tracking-wider text-pink-500">
          Agents at work
        </p>
        <h2 className="font-serif mt-2 text-3xl tracking-tight text-neutral-900 sm:text-4xl">
          Your scout is in flight
        </h2>
        <p className="mt-3 text-neutral-600">
          Mapping terrain, scanning the web, and building your Battle Plan
        </p>
      </div>

      <div className="mt-12">
        <ScoutPlane activeAgent={activeAgent} city={city} country={country} />
      </div>

      <div className="mt-12 rounded-[1.75rem] border border-pink-100 bg-white p-6 shadow-lg shadow-pink-100/50 sm:p-8">
        <AgentStepper activeAgent={activeAgent} progress={progress} />
      </div>
    </motion.section>
  );
}
