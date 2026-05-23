"use client";

import { motion } from "framer-motion";
import { Lightbulb, ListChecks } from "lucide-react";
import type { BattlePlan } from "@/lib/types";

export function StrategyHero({ plan }: { plan: BattlePlan }) {
  const showFirstWeek = (plan.recommended_first_week?.length ?? 0) > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={showFirstWeek ? "grid gap-6 lg:grid-cols-2" : ""}
    >
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-pink-500 text-white">
            <Lightbulb className="h-4 w-4" />
          </div>
          <h2 className="text-lg font-semibold text-neutral-900">Strategy</h2>
        </div>
        <ul className="space-y-3">
          {plan.strategy_bullets.map((b, i) => (
            <li key={i} className="flex gap-3 text-sm leading-relaxed text-neutral-700">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-pink-500" />
              {b}
            </li>
          ))}
          {plan.strategy_bullets.length === 0 && (
            <li className="text-sm text-neutral-500">Strategy is being synthesized…</li>
          )}
        </ul>
      </div>

      {showFirstWeek && (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 text-white shadow-sm ring-1 ring-pink-500/20">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
              <ListChecks className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-semibold">First week in {plan.target_city}</h2>
          </div>
          <ol className="space-y-3">
            {plan.recommended_first_week.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm leading-relaxed text-neutral-200">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-neutral-900">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      )}
    </motion.div>
  );
}
