import type { AgentId, BattlePlan, ScoutPhase, ScoutStatus } from "@/lib/types";
import { sanitizeScoutReport } from "@/lib/sanitize-plan";

/** Normalize backend poll JSON → frontend ScoutStatus */
export function normalizeScoutStatus(raw: Record<string, unknown>): ScoutStatus {
  const status = raw.status as ScoutStatus["status"];
  const progress =
    typeof raw.progress === "string"
      ? raw.progress
      : typeof raw.progress === "number"
        ? `${raw.progress}% complete`
        : Array.isArray(raw.progress)
          ? (raw.progress as string[]).join(" · ")
          : undefined;

  const active_agent = raw.active_agent as AgentId | undefined;
  const selected_skills = Array.isArray(raw.selected_skills)
    ? (raw.selected_skills as string[])
    : undefined;
  const completed_skills = Array.isArray(raw.completed_skills)
    ? (raw.completed_skills as string[])
    : undefined;
  const failed_skills = Array.isArray(raw.failed_skills)
    ? (raw.failed_skills as string[])
    : undefined;
  const active_skill =
    typeof raw.active_skill === "string"
      ? raw.active_skill
      : raw.active_skill === null
        ? null
        : undefined;
  const scout_phase = ["planning", "skills", "synthesis"].includes(
    raw.scout_phase as string,
  )
    ? (raw.scout_phase as ScoutPhase)
    : undefined;

  let result =
    status === "done" ? (raw.result as BattlePlan | undefined) : undefined;
  if (result && !result.target_country && typeof raw.target_country === "string") {
    result = { ...result, target_country: raw.target_country as string };
  }
  if (result) {
    result = sanitizeScoutReport(result);
  }

  return {
    status,
    progress,
    active_agent: status === "running" ? active_agent : undefined,
    selected_skills,
    completed_skills,
    failed_skills,
    active_skill,
    scout_phase,
    result,
    error: typeof raw.error === "string" ? raw.error : undefined,
  };
}
