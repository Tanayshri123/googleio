"use client";

import { motion } from "framer-motion";
import {
  Building2,
  Calendar,
  Users,
  MapPinned,
  Lightbulb,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import type { BattlePlan } from "@/lib/types";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

function Panel({
  title,
  icon: Icon,
  children,
  className = "",
}: {
  title: string;
  icon: typeof Building2;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={item}
      className={`flex flex-col rounded-2xl border border-pink-100 bg-white p-4 shadow-sm shadow-pink-100/50 ${className}`}
    >
      <div className="mb-3 flex shrink-0 items-center gap-2 border-b border-pink-50 pb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-50">
          <Icon className="h-4 w-4 text-pink-500" />
        </div>
        <h3 className="font-semibold text-neutral-900">{title}</h3>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
    </motion.div>
  );
}

export function IntelPanelGrid({ plan }: { plan: BattlePlan }) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2"
    >
      <Panel title="Competitors" icon={Building2} className="sm:col-span-2">
        <ul className="grid gap-3 sm:grid-cols-2">
          {plan.competitors.map((c) => (
            <li
              key={c.name}
              className="rounded-xl border border-pink-50 bg-pink-50/30 p-3"
            >
              <p className="font-medium text-neutral-900">{c.name}</p>
              <p className="mt-0.5 text-xs text-neutral-500">{c.address}</p>
              {c.notes && (
                <p className="mt-1.5 text-sm text-neutral-600">{c.notes}</p>
              )}
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Events" icon={Calendar}>
        <ul className="space-y-3">
          {plan.events.map((e) => (
            <li key={e.title} className="border-b border-pink-50 pb-3 last:border-0 last:pb-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-neutral-900">{e.title}</p>
                  <p className="text-xs text-pink-500">{e.date}</p>
                  <p className="mt-1 text-sm text-neutral-600">{e.relevance}</p>
                </div>
                {e.url && (
                  <a
                    href={e.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-neutral-400 hover:text-pink-500"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Key contacts" icon={Users}>
        <ul className="space-y-3">
          {plan.key_contacts.map((c) => (
            <li key={c.name}>
              <p className="font-medium text-neutral-900">{c.name}</p>
              <p className="text-sm text-neutral-600">{c.role}</p>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Neighborhoods" icon={MapPinned}>
        <ul className="space-y-2">
          {plan.neighborhoods.map((n) => (
            <li key={n.name}>
              <p className="font-medium text-neutral-900">{n.name}</p>
              <p className="text-sm text-neutral-600">{n.why_relevant}</p>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Strategy" icon={Lightbulb}>
        <ul className="space-y-2">
          {plan.strategy_bullets.map((b, i) => (
            <li key={i} className="flex gap-2 text-sm text-neutral-700">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-pink-500" />
              {b}
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title={`First week · ${plan.target_city}`} icon={CheckCircle2}>
        <ol className="space-y-2">
          {plan.recommended_first_week.map((step, i) => (
            <li key={i} className="flex gap-2.5 text-sm text-neutral-700">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-pink-500 text-[10px] font-bold text-white">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </Panel>
    </motion.div>
  );
}
