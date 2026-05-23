import type { BattlePlan } from "@/lib/types";

/** Remove named individuals from strategy copy and drop contact records. */
export function sanitizeScoutReport(plan: BattlePlan): BattlePlan {
  const names = (plan.key_contacts ?? [])
    .map((c) => c.name.trim())
    .filter(Boolean);

  const stripNames = (text: string) => {
    let out = text;
    for (const name of names) {
      const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      out = out.replace(new RegExp(escaped, "gi"), "local industry leaders");
    }
    out = out.replace(/\(\s*local industry leaders\s*\)/gi, "");
    out = out.replace(/\s{2,}/g, " ").trim();
    return out;
  };

  return {
    ...plan,
    key_contacts: [],
    strategy_bullets: plan.strategy_bullets.map(stripNames),
    recommended_first_week: plan.recommended_first_week.map(stripNames),
  };
}
