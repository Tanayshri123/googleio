/** Labels for backend skill_id values (General's selected_skills). */
export const SKILL_LABELS: Record<string, string> = {
  competitor_analysis: "Competitor analysis",
  network_broker: "Network broker",
  regulatory_hurdles: "Regulatory hurdles",
  market_vibe_check: "Market vibe",
  cost_estimation: "Cost estimation",
  demographic_profiler: "Demographics",
  monetization_audit: "Monetization",
  moat_evaluator: "Moat",
  partner_scout: "Partner scout",
};

export function skillLabel(skillId: string): string {
  return SKILL_LABELS[skillId] ?? skillId.replace(/_/g, " ");
}
