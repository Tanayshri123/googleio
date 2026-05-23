import type { BattlePlan, ChatMessage } from "@/lib/types";

/** Offline fallback when the chat API is unavailable */
export function replyFromPlan(
  plan: BattlePlan,
  message: string,
  history: ChatMessage[] = [],
): string {
  const q = message.toLowerCase();
  const city = plan.target_city;

  const lastAssistant = [...history]
    .reverse()
    .find((m) => m.role === "assistant")?.content;
  const lastUser = [...history]
    .reverse()
    .find((m) => m.role === "user" && m.content !== message)?.content;

  const followUp =
    q.match(/^(what|who|how|when|where|why|their|they|it|that|those)\b/) ||
    q.length < 40;

  if (followUp && lastAssistant) {
    if (q.match(/market cap|valuation|revenue|stock|worth/)) {
      const entity =
        extractBoldName(lastAssistant) ||
        extractBoldName(lastUser || "") ||
        plan.competitors[0]?.name;
      if (entity) {
        return (
          `**${entity}** isn't in your Scout Report with financials. ` +
          `Reconnect to the backend with Search enabled for live market data, ` +
          `or check a public source like Crunchbase / exchange filings.`
        );
      }
    }
    if (q.match(/their|they|it|that one|them/)) {
      const entity = extractBoldName(lastAssistant);
      if (entity) {
        const match = plan.competitors.find((c) =>
          c.name.toLowerCase().includes(entity.toLowerCase()),
        );
        if (match) {
          return (
            `Following up on **${entity}**: ${match.notes || match.address}. ` +
            `See the Competitors section in your Scout Report for more.`
          );
        }
        return (
          `You were asking about **${entity}**. ` +
          `That topic came from our last reply — use Ask Scout with the API connected for deeper follow-ups.`
        );
      }
    }
  }

  if (q.match(/partner|partnership|who should/)) {
    const partners = plan.complementary_businesses?.length
      ? plan.complementary_businesses.map((p) => p.name).join(", ")
      : "local chambers and industry associations";
    const org = plan.organizations?.[0];
    const intro = org
      ? ` Start with **${org.name}** — ${org.why_relevant}`
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
    const notes =
      plan.regulatory_notes?.slice(0, 3).join(" ") ||
      "Review local business registration requirements.";
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
    const steps = plan.recommended_first_week
      .slice(0, 5)
      .map((s, i) => `${i + 1}. ${s}`)
      .join("\n");
    return `Your first week in **${city}**:\n${steps}`;
  }

  if (q.match(/strateg/)) {
    const bullets = plan.strategy_bullets
      .slice(0, 4)
      .map((b) => `• ${b}`)
      .join("\n");
    return `Strategy for ${city}:\n${bullets}`;
  }

  const orgCount = plan.organizations?.length ?? 0;
  return `You have **${plan.competitors.length} competitors**, **${orgCount} organizations**, and **${plan.events.length} events** mapped for ${city}, ${plan.target_country}. Ask about strategy, competitors, partners, or your first week — or ask a follow-up about something we just discussed.`;
}

function extractBoldName(text: string): string | null {
  const match = text.match(/\*\*([^*]+)\*\*/);
  return match?.[1]?.trim() || null;
}
