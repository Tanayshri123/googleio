const REPLIES: { keywords: string[]; reply: string }[] = [
  {
    keywords: ["partner", "partnership", "who should"],
    reply:
      "Start with **ATX Food Collective** for pilot kitchens and **LocalLedger POS** for distribution—they are complementary, not competitive. Priya Sharma at Fareground Austin can intro you to 3–5 East Austin operators in week one.",
  },
  {
    keywords: ["competitor", "competition", "biggest threat", "closest"],
    reply:
      "**TableFlow ATX** is your closest direct threat downtown (211 E 6th St). They are scheduling-only—you win on inventory + staff in one UI. **KitchenPulse** on East 7th is the secondary threat for fast-casual.",
  },
  {
    keywords: ["regulat", "legal", "compliance", "permit"],
    reply:
      "As pure SaaS you avoid Austin food-handler licensing. Prioritize **PCI compliance** for any payments integration. Physical pilot kitchens would trigger occupancy permits—stay software-only for the hackathon demo path.",
  },
  {
    keywords: ["neighborhood", "where", "area", "start"],
    reply:
      "Lead with **East Austin** for fast pilots and lower contract lock-in. Use **South Congress** for brand visibility partnerships. Save **The Domain** for enterprise upsell after 10 paying independents.",
  },
  {
    keywords: ["event", "meetup", "network"],
    reply:
      "Prioritize the **Austin Restaurant Technology Meetup** (Jun 12) and **TRA Central Texas** (Jul 8). Join **ATX Restaurant Ops Slack** immediately—James Okonkwo runs it and it is your highest-density buyer channel.",
  },
  {
    keywords: ["first week", "week one", "priority"],
    reply:
      "Your first week playbook: (1) Slack intro with pilot offer, (2) 5 discovery calls via Priya, (3) Congress Ave walk-by mapping, (4) competitive mystery-shop TableFlow, (5) one meetup attendance. All five are in your recommended_first_week list.",
  },
];

export function mockChatReply(message: string): string {
  const lower = message.toLowerCase();
  for (const entry of REPLIES) {
    if (entry.keywords.some((k) => lower.includes(k))) {
      return entry.reply;
    }
  }
  return "Based on your Austin Scout Report: focus on East Austin independents first, differentiate from TableFlow with combined scheduling + inventory, and reach out to the Greater Austin Chamber for warm intros. Ask me about partners, competitors, neighborhoods, or your first week.";
}
