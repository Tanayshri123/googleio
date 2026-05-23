import type { BattlePlan } from "@/lib/types";

/** Client-side Ask Scout when API unavailable or demo mode */
export function replyFromPlan(plan: BattlePlan, message: string): string {
  const q = message.toLowerCase();
  const city = plan.target_city;

  if (q.match(/partner|partnership|who should/)) {
    const partners = plan.complementary_businesses?.length
      ? plan.complementary_businesses.map((p) => p.name).join(", ")
      : "local chambers and industry associations";
    const contact = plan.key_contacts[0];
    const intro = contact
      ? ` Start with **${contact.name}** (${contact.role}).`
      : "";
    return `Prioritize complementary partners: **${partners}**.${intro}`;
  }

  if (q.match(/competitor|competition|threat|closest/)) {
    const top = plan.competitors[0];
    if (!top) return "No competitors were mapped for this run—try re-running the scout.";
    const second = plan.competitors[1];
    return `Your top threat is **${top.name}** (${top.address}).${top.notes ? ` ${top.notes}` : ""}${
      second ? ` Watch **${second.name}** as a close second.` : ""
    }`;
  }

  if (q.match(/regulat|legal|compliance|permit/)) {
    const notes = plan.regulatory_notes?.slice(0, 3).join(" ") || "Review local business registration requirements.";
    return `Regulatory snapshot for ${city}: ${notes}`;
  }

  if (q.match(/neighborhood|where|area|start/)) {
    const n = plan.neighborhoods[0];
    if (!n) return `Focus initial outreach in central ${city} near your mapped competitors.`;
    return `Lead with **${n.name}**: ${n.why_relevant}`;
  }

  if (q.match(/event|meetup|network/)) {
    const e = plan.events[0];
    if (!e) return `Search for ${city} chamber events and industry meetups this month.`;
    return `Top event: **${e.title}** (${e.date}) — ${e.relevance}`;
  }

  if (q.match(/first week|week one|priority|should i do/)) {
    const steps = plan.recommended_first_week.slice(0, 5).map((s, i) => `${i + 1}. ${s}`).join("\n");
    return `Your first week in **${city}**:\n${steps}`;
  }

  if (q.match(/strateg/)) {
    const bullets = plan.strategy_bullets.slice(0, 4).map((b) => `• ${b}`).join("\n");
    return `Strategy for ${city}:\n${bullets}`;
  }

  return `You have **${plan.competitors.length} competitors**, **${plan.key_contacts.length} contacts**, and **${plan.events.length} events** mapped for ${city}, ${plan.target_country}. Ask about strategy, competitors, partners, or your first week.`;
}
