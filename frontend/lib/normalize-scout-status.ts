import type { AgentId, BattlePlan, ScoutStatus } from "@/lib/types";

/** Normalize backend poll JSON → frontend ScoutStatus */
export function normalizeScoutStatus(raw: Record<string, unknown>): ScoutStatus {
  const status = raw.status as ScoutStatus["status"];
  const progress =
    typeof raw.progress === "string"
      ? raw.progress
      : Array.isArray(raw.progress)
        ? (raw.progress as string[]).join(" · ")
        : undefined;

  const active_agent = raw.active_agent as AgentId | undefined;

  let result = raw.result as BattlePlan | undefined;
  if (result && !result.target_country && typeof raw.target_country === "string") {
    result = { ...result, target_country: raw.target_country as string };
  }

  return {
    status,
    progress,
    active_agent,
    result,
    error: typeof raw.error === "string" ? raw.error : undefined,
  };
}
