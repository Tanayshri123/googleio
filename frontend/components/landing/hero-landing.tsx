"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Map, Search, Bot } from "lucide-react";
import {
  CompanyInputTabs,
  isCompanyInputValid,
  type CompanyInputValue,
} from "./company-input-tabs";
import { LocationFields } from "./location-fields";
import { HeroPreview } from "./hero-preview";
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
    <section className="relative">
      <div className="mx-auto max-w-6xl px-6 pb-20 pt-10 sm:pt-16">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left: copy + form */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
            >
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-pink-200 bg-pink-50 px-3.5 py-1.5 text-xs font-medium text-pink-700">
                <Sparkles className="h-3.5 w-3.5 text-pink-500" />
                Powered by Gemini 3.5 Flash
              </div>

              <h1 className="font-serif text-4xl leading-[1.08] tracking-tight text-neutral-900 sm:text-5xl lg:text-[3.25rem]">
                Purpose-built AI agents for{" "}
                <span className="bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 bg-clip-text text-transparent">
                  market expansion
                </span>
              </h1>

              <p className="mt-5 max-w-lg text-lg leading-relaxed text-neutral-600">
                Upload your company, pick a city and country, and get a complete
                Battle Plan—competitors on the map, local contacts, events, and
                your first week on the ground.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                {[
                  { icon: Map, label: "Maps grounding" },
                  { icon: Search, label: "Search grounding" },
                  { icon: Bot, label: "Multi-agent ADK" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-2 text-sm text-neutral-500"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-50 ring-1 ring-pink-100">
                      <item.icon className="h-4 w-4 text-pink-500" />
                    </div>
                    {item.label}
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.12 }}
              className="mt-10 rounded-[1.75rem] border border-pink-100 bg-white p-6 shadow-xl shadow-pink-100/60 sm:p-8"
            >
              <CompanyInputTabs
                value={companyInput}
                onChange={onCompanyInputChange}
              />

              <div className="mt-8 border-t border-neutral-100 pt-8">
                <p className="mb-4 text-sm font-semibold text-neutral-800">
                  Target market
                </p>
                <LocationFields
                  city={city}
                  country={country}
                  onCityChange={onCityChange}
                  onCountryChange={onCountryChange}
                />
              </div>

              {city && country && (
                <p className="mt-4 rounded-xl bg-pink-50 px-3 py-2 text-center text-sm text-pink-800">
                  Expanding into{" "}
                  <strong>
                    {city}, {country}
                  </strong>
                </p>
              )}

              <button
                type="button"
                disabled={!canSubmit}
                onClick={onSubmit}
                className={cn(
                  "mt-6 flex w-full items-center justify-center gap-2 rounded-full py-4 text-base font-semibold transition-all",
                  canSubmit
                    ? "bg-pink-500 text-white shadow-lg shadow-pink-500/30 hover:bg-pink-600 hover:shadow-xl"
                    : "cursor-not-allowed bg-pink-100 text-pink-300",
                )}
              >
                {isLoading ? "Launching scout…" : "Generate Battle Plan"}
                <ArrowRight className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={onDemo}
                className="mt-3 w-full text-center text-sm font-medium text-neutral-500 transition hover:text-pink-600"
              >
                Or view Austin sample →
              </button>
            </motion.div>
          </div>

          {/* Right: product preview */}
          <div className="hidden lg:block">
            <HeroPreview />
          </div>
        </div>
      </div>
    </section>
  );
}
