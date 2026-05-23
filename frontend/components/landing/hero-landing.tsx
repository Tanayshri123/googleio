"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import {
  CompanyInputTabs,
  isCompanyInputValid,
  type CompanyInputValue,
} from "./company-input-tabs";
import { LocationFields } from "./location-fields";
import { DashboardMock } from "./dashboard-mock";
import { cn } from "@/lib/utils";

type Props = {
  companyInput: CompanyInputValue;
  onCompanyInputChange: (v: CompanyInputValue) => void;
  city: string;
  country: string;
  onCityChange: (v: string) => void;
  onCountryChange: (v: string) => void;
  onSubmit: () => void;
  onDemo: () => void;
  isLoading?: boolean;
  deepScope: boolean;
  onDeepScopeChange: (v: boolean) => void;
};

export function HeroLanding({
  companyInput,
  onCompanyInputChange,
  city,
  country,
  onCityChange,
  onCountryChange,
  onSubmit,
  onDemo,
  isLoading,
  deepScope,
  onDeepScopeChange,
}: Props) {
  const canSubmit =
    isCompanyInputValid(companyInput) &&
    city.trim().length > 0 &&
    country.trim().length > 0 &&
    !isLoading;

  return (
    <div>
      {/* Hero — Tsenta-style centered headline */}
      <section className="mx-auto max-w-4xl px-5 pt-12 text-center sm:pt-20 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/70 px-3 py-1.5 text-xs font-medium text-neutral-600 shadow-sm backdrop-blur-sm">
            <span className="scout-gradient-text font-semibold">Gemini 3.5 Flash</span>
            <span className="text-neutral-300">·</span>
            Maps & Search grounding
          </div>

          <h1 className="text-[2.5rem] font-semibold leading-[1.1] tracking-tight text-neutral-900 sm:text-6xl sm:leading-[1.05]">
            Know every{" "}
            <span className="scout-gradient-text">city</span>
            <br />
            like you&apos;re already there.
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-neutral-600">
            Google AI Scout maps competitors, surfaces local organizations, and builds your
            path into a new market—strategy, partners, and where to start, the moment you
            pick a city.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => {
                document.getElementById("scout-form")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#1a73e8] px-8 py-3.5 text-sm font-semibold text-white shadow-md shadow-[#4285F4]/25 hover:bg-[#1967d2] sm:w-auto"
            >
              Get started
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onDemo}
              className="inline-flex w-full items-center justify-center rounded-full border border-white/90 bg-white/80 px-8 py-3.5 text-sm font-semibold text-neutral-800 shadow-sm backdrop-blur-sm hover:bg-white sm:w-auto"
            >
              See demo Scout Report
            </button>
          </div>

          <p className="mt-4 text-sm text-neutral-400">
            Free to try — PDF, website, or text in. Results in ~60 seconds.
          </p>
        </motion.div>
      </section>

      {/* Product preview */}
      <section className="mx-auto max-w-6xl px-5 pb-8 pt-12 sm:px-6">
        <DashboardMock />
      </section>

      {/* How it works — illustrative sample (live scouts pick agents per product) */}
      <section id="how-it-works" className="border-y border-white/60 bg-white/50 py-16 backdrop-blur-sm sm:py-20">
        <div className="mx-auto max-w-4xl px-5 text-center sm:px-6">
          <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-900">
            Sample workflow
          </span>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
            Multiple agents. One expansion path. Zero spreadsheets.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-neutral-600 sm:text-base">
            This is an <strong className="font-medium text-neutral-800">example</strong> of how
            Scout can run—not a fixed pipeline. When you scout, The General chooses the right
            research agents for your product (competitor analysis, market vibe, partner scout,
            regulatory hurdles, and more).
          </p>
        </div>
        <p className="mx-auto mt-8 max-w-5xl px-5 text-center text-xs font-medium uppercase tracking-wider text-neutral-400 sm:px-6">
          Illustrative agent sequence
        </p>
        <div className="mx-auto mt-4 grid max-w-5xl gap-6 px-5 sm:grid-cols-2 lg:grid-cols-5 sm:px-6">
          {[
            { n: "01", title: "The General", sub: "Reads your company" },
            { n: "02", title: "Cartographer", sub: "Maps grounding" },
            { n: "03", title: "Networker", sub: "Search grounding" },
            { n: "04", title: "Compliance", sub: "Legal intel" },
            { n: "05", title: "Deep Verify", sub: "Strategic QA" },
          ].map((step, i) => (
            <motion.div
              key={step.n}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl border border-neutral-200 bg-white p-5"
            >
              <p className="text-xs font-medium text-neutral-400">{step.n}</p>
              <p className="mt-2 font-semibold text-neutral-900">{step.title}</p>
              <p className="mt-1 text-sm text-neutral-500">{step.sub}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Form */}
      <section id="scout-form" className="mx-auto max-w-xl px-5 py-16 sm:px-6 sm:py-20">
        <h2 className="text-center text-xl font-semibold text-neutral-900">
          Generate your Scout Report
        </h2>
        <p className="mt-2 text-center text-sm text-neutral-500">
          Tell us about your company and where you want to expand.
        </p>

        <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
          <CompanyInputTabs value={companyInput} onChange={onCompanyInputChange} />

          <div className="mt-8 border-t border-neutral-100 pt-8">
            <p className="mb-3 text-sm font-medium text-neutral-800">Target market</p>
            <LocationFields
              city={city}
              country={country}
              onCityChange={onCityChange}
              onCountryChange={onCountryChange}
            />
          </div>

          <div className="mt-6 flex items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50/70 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-neutral-800">Deep Scope Strategy</p>
              <p className="text-xs text-neutral-500">Cross-examine all agent findings for anomalies and risks</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={deepScope}
              onClick={() => onDeepScopeChange(!deepScope)}
              className={cn(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                deepScope ? "bg-[#1a73e8]" : "bg-neutral-300",
              )}
            >
              <span
                className={cn(
                  "inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform",
                  deepScope ? "translate-x-6" : "translate-x-1",
                )}
              />
            </button>
          </div>

          <button
            type="button"
            disabled={!canSubmit}
            onClick={onSubmit}
            className={cn(
              "mt-6 flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold transition-all",
              canSubmit
                ? "bg-[#1a73e8] text-white shadow-md shadow-[#4285F4]/20 hover:bg-[#1967d2]"
                : "cursor-not-allowed bg-neutral-100 text-neutral-400",
            )}
          >
            {isLoading ? "Launching scout…" : "Generate Scout Report"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>
    </div>
  );
}
