"use client";

import { motion } from "framer-motion";
import { ScoutPlane } from "./scout-plane";
import { SkillStepper } from "./skill-stepper";
import { skillLabel } from "@/lib/skill-labels";
import type { ScoutPhase } from "@/lib/types";

type Props = {
  progress: string;
  city: string;
  country: string;
  selectedSkills: string[];
  completedSkills: string[];
  failedSkills?: string[];
  activeSkill: string | null;
  scoutPhase: ScoutPhase;
};

export function ScoutingView({
  progress,
  city,
  country,
  selectedSkills,
  completedSkills,
  failedSkills,
  activeSkill,
  scoutPhase,
}: Props) {
  const skillLine =
    activeSkill != null
      ? skillLabel(activeSkill)
      : selectedSkills.length > 0
        ? `${selectedSkills.length} skills queued`
        : null;

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto max-w-3xl px-5 py-12 sm:px-6 sm:py-16"
    >
      <div className="text-center">
        <p className="text-sm font-medium text-neutral-500">Agents at work</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
          Building your Scout Report
        </h2>
      </div>

      <div className="mt-10">
        <ScoutPlane
          scoutPhase={scoutPhase}
          selectedSkills={selectedSkills}
          completedSkills={completedSkills}
          activeSkill={activeSkill}
          city={city}
          country={country}
        />
      </div>

      <div className="mt-8 rounded-2xl border border-neutral-200 bg-neutral-950 p-5 font-mono text-[13px] text-neutral-300 shadow-sm">
        <p className="mb-3 text-neutral-500">scout · live</p>
        <p className="text-emerald-400">{progress || "Initializing…"}</p>
        <motion.div
          className="mt-3 space-y-1 text-neutral-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {skillLine && <p>→ skill: {skillLine}</p>}
          <p>→ phase: {scoutPhase}</p>
          <p>→ target: {city}, {country}</p>
        </motion.div>
      </div>

      <div className="mt-8">
        <SkillStepper
          scoutPhase={scoutPhase}
          selectedSkills={selectedSkills}
          completedSkills={completedSkills}
          failedSkills={failedSkills}
          activeSkill={activeSkill}
        />
      </div>
    </motion.section>
  );
}
