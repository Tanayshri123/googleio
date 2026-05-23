"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { HeroLanding } from "@/components/landing/hero-landing";
import {
  type CompanyInputValue,
  isCompanyInputValid,
} from "@/components/landing/company-input-tabs";
import { ScoutingView } from "@/components/scouting/scouting-view";
import { BattlePlanDashboard } from "@/components/battle-plan/battle-plan-dashboard";
import { useScout } from "@/hooks/use-scout";
import { useScoutChat } from "@/hooks/use-scout-chat";
import { loadDemoBattlePlan } from "@/lib/mock/simulate-scout";
import { GradientBackground } from "@/components/ui/gradient-background";
import { SiteHeader } from "@/components/ui/site-header";
import type { AppPhase, ScoutInput } from "@/lib/types";

export function ScoutApp() {
  const [phase, setPhase] = useState<AppPhase>("landing");
  const [city, setCity] = useState("Austin");
  const [country, setCountry] = useState("United States");
  const [companyInput, setCompanyInput] = useState<CompanyInputValue>({
    inputType: "website",
    file: null,
    websiteUrl: "",
    companyText: "",
  });

  const scout = useScout();
  const chatSessionId =
    scout.sessionId ?? (scout.battlePlan ? "demo" : null);
  const chat = useScoutChat(chatSessionId, scout.battlePlan);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("demo") === "1") {
      scout.setBattlePlan(loadDemoBattlePlan());
      setPhase("battle-plan");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, []);

  useEffect(() => {
    if (scout.battlePlan && phase === "scouting") {
      setPhase("battle-plan");
    }
  }, [scout.battlePlan, phase]);

  const buildInput = useCallback((): ScoutInput => {
    const base = {
      input_type: companyInput.inputType,
      city: city.trim(),
      country: country.trim(),
    };
    if (companyInput.inputType === "pdf" && companyInput.file) {
      return { ...base, file: companyInput.file };
    }
    if (companyInput.inputType === "website") {
      const url = companyInput.websiteUrl.startsWith("http")
        ? companyInput.websiteUrl
        : `https://${companyInput.websiteUrl}`;
      return { ...base, website_url: url };
    }
    return { ...base, company_text: companyInput.companyText };
  }, [companyInput, city, country]);

  const handleSubmit = async () => {
    if (!isCompanyInputValid(companyInput) || !city || !country) return;
    setPhase("scouting");
    chat.clear();
    await scout.runScout(buildInput());
  };

  const handleDemo = () => {
    scout.reset();
    chat.clear();
    scout.setBattlePlan(loadDemoBattlePlan());
    setPhase("battle-plan");
  };

  const handleNewScout = () => {
    scout.reset();
    chat.clear();
    setPhase("landing");
  };

  const isScouting = phase === "scouting" || scout.isStarting;

  return (
    <div className="relative min-h-screen">
      <GradientBackground />
      <SiteHeader
        onDemo={phase === "landing" ? handleDemo : undefined}
        showBack={phase !== "landing"}
        onBack={handleNewScout}
      />

      <main>
        <AnimatePresence mode="wait">
          {phase === "landing" && !isScouting && (
            <HeroLanding
              key="landing"
              companyInput={companyInput}
              onCompanyInputChange={setCompanyInput}
              city={city}
              country={country}
              onCityChange={setCity}
              onCountryChange={setCountry}
              onSubmit={handleSubmit}
              onDemo={handleDemo}
              isLoading={scout.isStarting}
            />
          )}

          {isScouting && !scout.battlePlan && (
            <ScoutingView
              key="scouting"
              activeAgent={scout.activeAgent}
              progress={scout.progress}
              city={city}
              country={country}
            />
          )}

          {phase === "battle-plan" && scout.battlePlan && (
            <BattlePlanDashboard
              key="battle-plan"
              plan={scout.battlePlan}
              onNewScout={handleNewScout}
              chatMessages={chat.messages}
              chatLoading={chat.isLoading}
              onChatSend={chat.send}
            />
          )}
        </AnimatePresence>

        {scout.error && (
          <div className="mx-auto max-w-lg px-6 pb-8">
            <p className="rounded-2xl border border-red-200/80 bg-red-50/90 px-4 py-3 text-center text-sm text-red-700 backdrop-blur">
              {scout.error}{" "}
              <button
                type="button"
                onClick={handleDemo}
                className="font-semibold underline"
              >
                Load demo instead
              </button>
            </p>
          </div>
        )}
      </main>

      <footer className="relative border-t border-neutral-200 py-12 text-center text-sm text-neutral-500">
        Google AI Scout · Gemini 3.5 Flash · Maps & Search grounding
      </footer>
    </div>
  );
}
