"use client";

import { motion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import type { BattlePlan, ChatMessage } from "@/lib/types";
import { TerrainMap } from "./terrain-map";
import { IntelPanelGrid } from "./intel-panel-grid";
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
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6"
    >
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 border-b border-pink-100 pb-8 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-pink-500">
            Battle Plan ready
          </p>
          <h2 className="font-serif mt-1 text-3xl tracking-tight text-neutral-900 sm:text-4xl">
            {plan.target_city}, {plan.target_country}
          </h2>
          <p className="mt-3 max-w-2xl text-lg text-neutral-600">
            {plan.company_summary}
          </p>
        </div>
        <button
          type="button"
          onClick={onNewScout}
          className="inline-flex items-center gap-2 self-start rounded-full border border-pink-200 bg-white px-5 py-2.5 text-sm font-medium text-neutral-800 shadow-sm hover:border-pink-300 hover:bg-pink-50"
        >
          <RotateCcw className="h-4 w-4 text-pink-500" />
          New scout
        </button>
      </div>

      {/* 3-column: Ask Scout | Intel cards | Map (end) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
        {/* Col 1 — Ask Scout */}
        <div className="lg:col-span-3 lg:sticky lg:top-24 lg:self-start">
          <AskScoutPanel
            messages={chatMessages}
            isLoading={chatLoading}
            onSend={onChatSend}
          />
        </div>

        {/* Col 2 — Intel bento (2-up grid) */}
        <div className="lg:col-span-5">
          <IntelPanelGrid plan={plan} />
        </div>

        {/* Col 3 — Map at the end (right) */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 lg:self-start">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-neutral-900">Terrain map</h3>
            <span className="rounded-full bg-pink-50 px-2.5 py-0.5 text-[11px] font-medium text-pink-600">
              {plan.competitors.length} pins
            </span>
          </div>
          <TerrainMap plan={plan} className="min-h-[520px] lg:min-h-[calc(100vh-11rem)]" />
        </div>
      </div>
    </motion.section>
  );
}
