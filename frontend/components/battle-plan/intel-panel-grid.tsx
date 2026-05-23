"use client";

import { motion } from "framer-motion";
import {
  Building2,
  Calendar,
  Users,
  MapPinned,
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
      className={`rounded-xl border border-neutral-200 bg-white p-4 ${className}`}
    >
      <div className="mb-3 flex items-center gap-2 border-b border-neutral-100 pb-2">
        <Icon className="h-4 w-4 text-neutral-500" />
        <h3 className="text-sm font-semibold text-neutral-900">{title}</h3>
      </div>
      {children}
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
              className="rounded-lg border border-neutral-100 bg-neutral-50 p-3"
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
            <li key={e.title} className="border-b border-neutral-50 pb-2 last:border-0">
              <div className="flex justify-between gap-2">
                <div>
                  <p className="font-medium text-neutral-900">{e.title}</p>
                  <p className="text-xs text-neutral-500">{e.date}</p>
                  <p className="mt-1 text-sm text-neutral-600">{e.relevance}</p>
                </div>
                {e.url && (
                  <a href={e.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 text-neutral-400" />
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Key contacts" icon={Users}>
        <ul className="space-y-2">
          {plan.key_contacts.map((c) => (
            <li key={c.name}>
              <p className="font-medium text-neutral-900">{c.name}</p>
              <p className="text-sm text-neutral-600">{c.role}</p>
            </li>
          ))}
        </ul>
      </Panel>

      {plan.neighborhoods.length > 0 && (
        <Panel title="Neighborhoods" icon={MapPinned} className="sm:col-span-2">
          <ul className="grid gap-2 sm:grid-cols-3">
            {plan.neighborhoods.map((n) => (
              <li key={n.name} className="rounded-lg bg-neutral-50 p-2">
                <p className="font-medium text-neutral-900">{n.name}</p>
                <p className="text-xs text-neutral-600">{n.why_relevant}</p>
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </motion.div>
  );
}
