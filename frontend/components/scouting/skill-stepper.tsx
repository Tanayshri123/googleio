"use client";

import { Check, Loader2, X } from "lucide-react";
import { skillLabel } from "@/lib/skill-labels";
import { cn } from "@/lib/utils";
import type { ScoutPhase } from "@/lib/types";

type Props = {
  scoutPhase: ScoutPhase;
  selectedSkills: string[];
  completedSkills: string[];
  failedSkills?: string[];
  activeSkill: string | null;
};

export function SkillStepper({
  scoutPhase,
  selectedSkills,
  completedSkills,
  failedSkills = [],
  activeSkill,
}: Props) {
  const generalDone = scoutPhase !== "planning";
  const synthesisActive = scoutPhase === "synthesis";
  const synthesisDone = false;

  const skills = selectedSkills.length > 0 ? selectedSkills : [];

  return (
    <div className="space-y-4">
      {/* General */}
      <div className="flex items-center gap-3">
        <StepDot
          done={generalDone}
          active={scoutPhase === "planning"}
        />
        <p
          className={cn(
            "text-sm font-medium",
            scoutPhase === "planning" ? "text-neutral-900" : "text-neutral-500",
          )}
        >
          The General
        </p>
      </div>

      {/* Selected skills */}
      {skills.length > 0 && (
        <div className="ml-1 border-l-2 border-neutral-100 pl-4">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-neutral-400">
            Agent dispatched
          </p>
          <ul className="space-y-2">
            {skills.map((skillId) => {
              const failed = failedSkills.includes(skillId);
              const done = completedSkills.includes(skillId);
              const active = activeSkill === skillId;
              return (
                <li key={skillId} className="flex items-center gap-2.5">
                  <StepDot done={done} failed={failed} active={active} small />
                  <span
                    className={cn(
                      "text-sm",
                      active && "font-medium text-neutral-900",
                      failed && "text-amber-700",
                      done && !active && !failed && "text-neutral-500",
                      !done && !active && !failed && "text-neutral-400",
                    )}
                  >
                    {skillLabel(skillId)}
                  </span>
                  {active && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-pink-500" />
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Synthesis */}
      <div className="flex items-center gap-3">
        <StepDot done={synthesisDone} active={synthesisActive} />
        <p
          className={cn(
            "text-sm font-medium",
            synthesisActive ? "text-neutral-900" : "text-neutral-400",
          )}
        >
          Scout Report synthesis
        </p>
      </div>
    </div>
  );
}

function StepDot({
  done,
  failed,
  active,
  small,
}: {
  done: boolean;
  failed?: boolean;
  active: boolean;
  small?: boolean;
}) {
  const size = small ? "h-6 w-6" : "h-8 w-8";
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors",
        size,
        failed && "bg-amber-100 text-amber-800 ring-2 ring-amber-200",
        done && !failed && "bg-neutral-900 text-white",
        active && !done && !failed && "bg-pink-500 text-white ring-4 ring-pink-100",
        !done && !active && !failed && "bg-neutral-100 text-neutral-400",
      )}
    >
      {failed ? (
        <X className={small ? "h-3 w-3" : "h-4 w-4"} />
      ) : done ? (
        <Check className={small ? "h-3 w-3" : "h-4 w-4"} />
      ) : active ? (
        <span className={cn("rounded-full bg-white", small ? "h-1.5 w-1.5" : "h-2 w-2")} />
      ) : null}
    </div>
  );
}
