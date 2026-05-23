"use client";

import { motion } from "framer-motion";
import {
  Building2,
  Calendar,
  Landmark,
  MapPinned,
  ExternalLink,
  TrendingUp,
  Shield,
  Handshake,
} from "lucide-react";
import type { BattlePlan } from "@/lib/types";
import { SKILL_LABELS } from "@/lib/skill-labels";

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
  const organizations = plan.organizations ?? [];
  const moat = plan.agent_outputs?.moat_evaluator as
    | { defensibility_score?: number; moat_recommendations?: string[] }
    | undefined;
  const partnerScout = plan.agent_outputs?.partner_scout as
    | {
        connector_archetypes?: {
          archetype?: string;
          where_to_find?: string;
          why_relevant?: string;
        }[];
        trending_partner_types?: { type?: string; momentum?: string; notes?: string }[];
        terrain_summary?: string;
      }
    | undefined;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2"
    >
      {plan.market_vibe?.narrative_summary && (
        <Panel title="Market vibe" icon={TrendingUp} className="sm:col-span-2">
          {plan.market_vibe.sentiment_label && (
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-pink-600">
              {plan.market_vibe.sentiment_label}
            </p>
          )}
          <p className="text-sm leading-relaxed text-neutral-700">
            {plan.market_vibe.narrative_summary}
          </p>
          {(plan.market_vibe.behavioral_trends?.length ?? 0) > 0 && (
            <ul className="mt-3 list-disc space-y-1 pl-4 text-sm text-neutral-600">
              {plan.market_vibe.behavioral_trends!.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          )}
        </Panel>
      )}

      {moat?.moat_recommendations && moat.moat_recommendations.length > 0 && (
        <Panel title="Competitive moat" icon={Shield}>
          {typeof moat.defensibility_score === "number" && (
            <p className="mb-2 text-sm text-neutral-600">
              Defensibility score:{" "}
              <span className="font-medium text-neutral-900">
                {Math.round(moat.defensibility_score * 100)}%
              </span>
            </p>
          )}
          <ul className="space-y-2 text-sm text-neutral-700">
            {moat.moat_recommendations.slice(0, 4).map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </Panel>
      )}

      {(plan.selected_skills?.length ?? 0) > 0 && (
        <Panel title="Skills used" icon={TrendingUp} className="sm:col-span-2">
          <div className="flex flex-wrap gap-2">
            {plan.selected_skills!.map((id) => (
              <span
                key={id}
                className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700"
              >
                {SKILL_LABELS[id] ?? id.replace(/_/g, " ")}
              </span>
            ))}
          </div>
        </Panel>
      )}

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

      {partnerScout?.terrain_summary && (
        <Panel title="Partnership terrain" icon={Handshake} className="sm:col-span-2">
          <p className="text-sm leading-relaxed text-neutral-700">
            {partnerScout.terrain_summary}
          </p>
          {(partnerScout.trending_partner_types?.length ?? 0) > 0 && (
            <ul className="mt-3 flex flex-wrap gap-2">
              {partnerScout.trending_partner_types!.map((t) => (
                <li
                  key={t.type}
                  className="rounded-full bg-pink-50 px-3 py-1 text-xs font-medium text-pink-900"
                >
                  {t.type}
                  {t.momentum ? ` · ${t.momentum}` : ""}
                </li>
              ))}
            </ul>
          )}
          {(partnerScout.connector_archetypes?.length ?? 0) > 0 && (
            <ul className="mt-3 space-y-2 text-sm text-neutral-600">
              {partnerScout.connector_archetypes!.slice(0, 4).map((c) => (
                <li key={c.archetype}>
                  <span className="font-medium text-neutral-900">{c.archetype}</span>
                  {c.where_to_find ? ` — ${c.where_to_find}` : ""}
                </li>
              ))}
            </ul>
          )}
        </Panel>
      )}

      {(plan.ideal_partners?.length ?? 0) > 0 && (
        <Panel title="Ideal partners" icon={Handshake} className="sm:col-span-2">
          <ul className="grid gap-3 sm:grid-cols-2">
            {plan.ideal_partners!.map((p) => (
              <li
                key={p.name}
                className="rounded-lg border border-neutral-100 bg-neutral-50 p-3"
              >
                <div className="flex justify-between gap-2">
                  <p className="font-medium text-neutral-900">{p.name}</p>
                  {p.url && (
                    <a href={p.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 shrink-0 text-neutral-400" />
                    </a>
                  )}
                </div>
                {p.partner_type && (
                  <p className="mt-0.5 text-xs capitalize text-neutral-500">
                    {p.partner_type.replace(/_/g, " ")}
                  </p>
                )}
                {p.why_fit && (
                  <p className="mt-1.5 text-sm text-neutral-600">{p.why_fit}</p>
                )}
                {p.partnership_angle && (
                  <p className="mt-1 text-xs text-pink-700">{p.partnership_angle}</p>
                )}
              </li>
            ))}
          </ul>
        </Panel>
      )}

      {organizations.length > 0 && (
        <Panel title="Organizations" icon={Landmark}>
          <ul className="space-y-3">
            {organizations.map((org) => (
              <li key={org.name}>
                <div className="flex justify-between gap-2">
                  <div>
                    <p className="font-medium text-neutral-900">{org.name}</p>
                    {org.type && (
                      <p className="text-xs capitalize text-neutral-400">
                        {org.type.replace(/_/g, " ")}
                      </p>
                    )}
                    <p className="mt-1 text-sm text-neutral-600">{org.why_relevant}</p>
                  </div>
                  {org.url && (
                    <a href={org.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 text-neutral-400" />
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      )}

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
