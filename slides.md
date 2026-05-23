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

Multi-agent market expansion platform built on **Gemini Managed Agents** (<1 week old at I/O).

Upload a **pitch deck** + enter a **target city** → get a complete **Battle Plan** in ~30 seconds.

<br>

<div class="text-2xl font-semibold text-blue-600">
  "We turn terrain blindness into a 30-second Battle Plan."
</div>

<br>

<div class="text-sm opacity-70">
  Gemini Managed Agents grounded in Google Maps & Search,<br>defined as AGENTS.md files, running in isolated sandboxes.
</div>

::right::

<div class="pl-8 pt-16">

```mermaid
flowchart TD
  U[Upload Pitch Deck + City] --> API[Interactions API]
  API --> O["AGENTS.md (Orchestrator)"]
  O --> C["AGENTS.md (Cartographer)"]
  O --> N["AGENTS.md (Networker)"]
  O --> F["AGENTS.md (...more)"]
  C --> S["AGENTS.md (Strategist)"]
  N --> S
  F --> S
  S --> D[Dashboard]
```

<div class="mt-4 text-xs opacity-50 text-center">
  Gemini Managed Agents — declarative AGENTS.md files → isolated sandboxes
</div>

</div>

---
layout: two-cols
---

# How It Works

<div class="pr-4">

<br>

### Agent Pipeline

| Agent | Definition | Tool | Role |
|-------|------------|------|------|
| **The General** | `AGENTS.md` | PDF Ingest | Parse deck, decompose & orchestrate |
| **Cartographer** | `AGENTS.md` | Maps Grounding + Browse | Pin competitors, clusters, POIs |
| **Networker** | `AGENTS.md` | Search Grounding + Browse | Events, contacts, regulation |
| **Strategist** | `AGENTS.md` | Code Execution | Merge into structured Battle Plan |
| *...more agents* | `AGENTS.md` | Any grounding | Add Legal, Financial, Culture etc. |

<br>

<div class="text-sm opacity-70">
  All agents are declarative AGENTS.md files · Gemini 3.5 Flash<br>
  Interactions API provisions isolated sandboxes — no infrastructure to run
</div>

</div>

::right::

<div class="pl-4 pt-8">

```mermaid {scale: 0.9}
flowchart LR
  G["AGENTS.md\nThe General"] -->|calls| C["AGENTS.md\nCartographer"]
  G -->|calls| N["AGENTS.md\nNetworker"]
  G -.->|extensible| F["AGENTS.md\n..."]
  C -->|maps data| S["AGENTS.md\nStrategist"]
  N -->|search data| S
  F -.->|more data| S
  S -->|JSON| UI[Dashboard]

  style C fill:#dbeafe,stroke:#2563eb
  style N fill:#dbeafe,stroke:#2563eb
  style S fill:#dcfce7,stroke:#16a34a
```

<div class="mt-4 text-xs opacity-50 text-center">
  Gemini Managed Agents · Maps grounding · Search grounding · Code execution
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

# Why Gemini 3.5 Flash + Managed Agents

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

<div class="flex gap-4 items-start p-4 rounded-xl bg-green-50/50 border border-green-200">
  <div class="text-2xl mt-1">🆕</div>
  <div>
    <div class="font-semibold">Gemini Managed Agents <span class="text-xs bg-green-200 px-2 py-0.5 rounded-full">I/O 2026</span></div>
    <div class="text-sm opacity-70">Define agents as AGENTS.md files — Interactions API provisions isolated Linux sandboxes. Code execution, web browsing, state persistence built-in.</div>
  </div>
</div>

</div>

<div class="mt-6 text-center text-sm opacity-60">
  Declarative AGENTS.md + native Maps/Search grounding + isolated sandboxes — brand new at Google I/O 2026
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
