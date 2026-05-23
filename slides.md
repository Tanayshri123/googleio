---
theme: default
title: Google AI Scout
highlighter: shiki
lineNumbers: false
colorSchema: light
fonts:
  sans: Inter
  mono: JetBrains Mono
defaults:
  layout: center
---

# Google AI Scout

**Expand into any city like you already know the terrain.**

<div class="mt-8 text-sm opacity-50">
  Google AI Hackathon · Gemini 3.5 Flash · Agentic Workflows
</div>

---
layout: image-left
image: /images/problem.svg
---

# The Problem: Terrain Blindness

Businesses expanding into new cities operate blind:

<br>

- **Competitors** — who are they, where are they?
- **Networking** — where do founders & buyers meet?
- **Culture** — what local nuances matter?
- **Partners** — which brands or people to collaborate with?

<br>

<div class="text-red-500 font-semibold">
  Traditional research: <span class="line-through">weeks of manual work</span> · thousands in consultant fees
</div>

---
layout: two-cols
---

# Google AI Scout

Multi-agent market expansion platform.

Upload a **pitch deck** + enter a **target city** → get a complete **Battle Plan** in ~30 seconds.

<br>

<div class="text-2xl font-semibold text-blue-600">
  "We turn terrain blindness into a 30-second Battle Plan."
</div>

<br>

<div class="text-sm opacity-70">
  Gemini 3.5 Flash agents grounded in Google Maps & Search,<br>orchestrated like a distributed research team.
</div>

::right::

<div class="pl-8 pt-16">

```mermaid
flowchart TD
  U[Upload Pitch Deck + City] --> O[Root Orchestrator]
  O --> C[Cartographer]
  O --> N[Networker]
  C --> S[Strategist]
  N --> S
  S --> D[Dashboard]
```

<div class="mt-4 text-xs opacity-50 text-center">
  General → Cartographer ∥ Networker → Strategist
</div>

</div>

---
layout: two-cols
---

# How It Works

<div class="pr-4">

<br>

### Agent Pipeline

| Agent | Tool | Role |
|-------|------|------|
| **The General** | PDF Ingest | Parse deck, define scout mission |
| **Cartographer** | Google Maps | Pin competitors, clusters, POIs |
| **Networker** | Google Search | Events, contacts, regulation |
| **Strategist** | Synthesis | Merge into structured Battle Plan |

<br>

<div class="text-sm opacity-70">
  All agents powered by Gemini 3.5 Flash<br>
  Parallel execution where supported
</div>

</div>

::right::

<div class="pl-4 pt-8">

```mermaid {scale: 0.9}
flowchart LR
  G[The General] -->|task briefs| C[Cartographer]
  G -->|task briefs| N[Networker]
  C -->|maps data| S[Strategist]
  N -->|search data| S
  S -->|JSON| UI[Dashboard]

  style C fill:#dbeafe,stroke:#2563eb
  style N fill:#dbeafe,stroke:#2563eb
  style S fill:#dcfce7,stroke:#16a34a
```

<div class="mt-4 text-xs opacity-50 text-center">
  Maps grounding · Search grounding · Structured output
</div>

</div>

---
layout: default
---

# Business Value

<div class="grid grid-cols-3 gap-6 mt-12">

<div class="bg-blue-50 rounded-2xl p-6 border border-blue-100">
  <div class="text-3xl mb-3">🎯</div>
  <div class="font-semibold text-lg mb-2">Who Benefits</div>
  <div class="text-sm opacity-70">
    Startup founders validating expansion<br>
    SMB owners competing without research budgets<br>
    BD managers prioritizing cities & first-week actions
  </div>
</div>

<div class="bg-blue-50 rounded-2xl p-6 border border-blue-100">
  <div class="text-3xl mb-3">⚡</div>
  <div class="font-semibold text-lg mb-2">Speed</div>
  <div class="text-sm opacity-70">
    <span class="line-through text-red-400">Weeks of Googling</span><br>
    <span class="text-2xl font-bold text-blue-600">~30 seconds</span><br>
    <span class="opacity-70">with live progress indicators</span>
  </div>
</div>

<div class="bg-blue-50 rounded-2xl p-6 border border-blue-100">
  <div class="text-3xl mb-3">🌍</div>
  <div class="font-semibold text-lg mb-2">Democratization</div>
  <div class="text-sm opacity-70">
    Consultant-grade market research<br>
    accessible to any business<br>
    <span class="font-medium">Leveling the playing field</span>
  </div>
</div>

</div>

---
layout: default
---

# Why Gemini 3.5 Flash

<div class="grid grid-cols-2 gap-6 mt-10">

<div class="flex gap-4 items-start p-4 rounded-xl bg-blue-50/50">
  <div class="text-2xl mt-1">🗺️</div>
  <div>
    <div class="font-semibold">Google Maps Grounding</div>
    <div class="text-sm opacity-70">Pin competitors, hubs, retail clusters in the target city with live map data</div>
  </div>
</div>

<div class="flex gap-4 items-start p-4 rounded-xl bg-blue-50/50">
  <div class="text-2xl mt-1">🔍</div>
  <div>
    <div class="font-semibold">Google Search Grounding</div>
    <div class="text-sm opacity-70">Live events, chamber leaders, news, communities, local regulation</div>
  </div>
</div>

<div class="flex gap-4 items-start p-4 rounded-xl bg-blue-50/50">
  <div class="text-2xl mt-1">🧠</div>
  <div>
    <div class="font-semibold">1M Token Context Window</div>
    <div class="text-sm opacity-70">Ingest full PDFs — pitch decks, financials, catalogs — for niche-accurate research</div>
  </div>
</div>

<div class="flex gap-4 items-start p-4 rounded-xl bg-blue-50/50">
  <div class="text-2xl mt-1">⚡</div>
  <div>
    <div class="font-semibold">High Throughput (~289 tok/s)</div>
    <div class="text-sm opacity-70">Many sub-agent turns execute in parallel; dashboard fills in seconds</div>
  </div>
</div>

</div>

<div class="mt-6 text-center text-sm opacity-60">
  Native tool use + multi-step agentic workflow + real-world grounding — not a single monolithic prompt
</div>

---
layout: center
class: text-center
---

# Live Demo

<div class="mt-16 text-8xl font-bold text-blue-600">
  ▶
</div>

<div class="mt-8 text-2xl font-semibold">
  Let's scout Austin.
</div>

<div class="mt-4 text-lg opacity-50">
  Pitch Deck → Multi-Agent Pipeline → Battle Plan
</div>

---
layout: center
class: text-center
---

# Google AI Scout

<div class="mt-8 text-xl opacity-70">
  Terrain blindness → 30-second Battle Plan
</div>

<div class="mt-12 text-sm opacity-40">
  Google AI Hackathon · Built with Gemini 3.5 Flash · Maps ↔ Search Grounding
</div>
