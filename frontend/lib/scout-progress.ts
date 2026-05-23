import type { ScoutPhase } from "@/lib/types";

/** Plane position 0–1 from skill pipeline state. */
export function scoutProgressFraction(opts: {
  scoutPhase: ScoutPhase;
  selectedSkills: string[];
  completedSkills: string[];
  activeSkill: string | null;
}): number {
  const { scoutPhase, selectedSkills, completedSkills, activeSkill } = opts;
  const n = Math.max(selectedSkills.length, 1);

  if (scoutPhase === "planning") return 0.06;
  if (scoutPhase === "synthesis") return 0.94;

  const done = completedSkills.length;
  const partial = activeSkill ? 0.45 : 0;
  return 0.12 + ((done + partial) / (n + 1)) * 0.78;
}
