"use client";

import { motion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import type { BattlePlan, ChatMessage } from "@/lib/types";
import { TerrainMap } from "./terrain-map";
import { IntelPanelGrid } from "./intel-panel-grid";
import { StrategyHero } from "./strategy-hero";
import { AskScoutPanel } from "@/components/ask-scout/ask-scout-panel";

type Props = {
  plan: BattlePlan;
  onNewScout: () => void;
  chatMessages: ChatMessage[];
  chatLoading: boolean;
  onChatSend: (message: string) => void;
};

export function BattlePlanDashboard({
  plan,
  onNewScout,
  chatMessages,
  chatLoading,
  onChatSend,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8"
    >
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 border-b border-neutral-200 pb-8 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">
            Battle Plan
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
            {plan.target_city}, {plan.target_country}
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-neutral-600">
            {plan.company_summary}
          </p>
        </div>
        <button
          type="button"
          onClick={onNewScout}
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-800"
        >
          <RotateCcw className="h-4 w-4" />
          New scout
        </button>
      </div>

      {/* 1. Strategy first */}
      <section className="mb-8">
        <StrategyHero plan={plan} />
      </section>

      {/* 2. Intel + Map side by side — map at end (right) */}
      <section className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <h2 className="mb-4 text-sm font-semibold text-neutral-900">Market intel</h2>
          <IntelPanelGrid plan={plan} />
        </div>
        <div className="lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold text-neutral-900">Terrain map</h2>
          <div className="sticky top-20">
            <TerrainMap plan={plan} />
          </div>
        </div>
      </section>

      {/* 3. Ask Scout — full width */}
      <section>
        <h2 className="mb-4 text-sm font-semibold text-neutral-900">Ask Scout</h2>
        <AskScoutPanel
          messages={chatMessages}
          isLoading={chatLoading}
          onSend={onChatSend}
        />
      </section>
    </motion.div>
  );
}
