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
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-600">
            <span className="font-semibold text-neutral-900">Gemini 3.5 Flash</span>
            <span className="text-neutral-300">·</span>
            Maps & Search grounding
          </div>

          <h1 className="text-[2.5rem] font-semibold leading-[1.1] tracking-tight text-neutral-900 sm:text-6xl sm:leading-[1.05]">
            Know every city like
            <br />
            you&apos;re already there.
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-neutral-600">
            Google AI Scout maps competitors, finds local contacts, and builds your
            first-week Battle Plan—the moment you pick a new market.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => {
                document.getElementById("scout-form")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-neutral-900 px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-neutral-800 sm:w-auto"
            >
              Get started
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onDemo}
              className="inline-flex w-full items-center justify-center rounded-full border border-neutral-200 bg-white px-8 py-3.5 text-sm font-semibold text-neutral-800 hover:bg-neutral-50 sm:w-auto"
            >
              See demo Battle Plan
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

      {/* How it works — Tsenta pipeline */}
      <section id="how-it-works" className="border-y border-neutral-200 bg-neutral-50/50 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-5 text-center sm:px-6">
          <p className="text-sm font-medium text-neutral-500">The pipeline</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
            Four agents. One Battle Plan. Zero spreadsheets.
          </h2>
        </div>
        <div className="mx-auto mt-12 grid max-w-5xl gap-6 px-5 sm:grid-cols-2 lg:grid-cols-4 sm:px-6">
          {[
            { n: "01", title: "The General", sub: "Reads your company" },
            { n: "02", title: "Cartographer", sub: "Maps grounding" },
            { n: "03", title: "Networker", sub: "Search grounding" },
            { n: "04", title: "Strategist", sub: "Your Battle Plan" },
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
          Generate your Battle Plan
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

          <button
            type="button"
            disabled={!canSubmit}
            onClick={onSubmit}
            className={cn(
              "mt-6 flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold transition-all",
              canSubmit
                ? "bg-neutral-900 text-white hover:bg-neutral-800"
                : "cursor-not-allowed bg-neutral-100 text-neutral-400",
            )}
          >
            {isLoading ? "Launching scout…" : "Generate Battle Plan"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>
    </div>
  );
}
