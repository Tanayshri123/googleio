# Google AI Scout — Frontend Plan (Hackathon Demo)

**Owner:** Frontend team  
**Backend:** Separate — we integrate via API contract only  
**Goal:** A **modern YC-style** product UI with a memorable **scout plane** loading moment, flexible company input, and **follow-up Q&A** on the Battle Plan — all demo-ready without auth.

---

## 1. What “done” looks like

A single-page app with **four experiences**:

| Experience | When |
|------------|------|
| **Landing** | Hero + company input (3 ways) + target **city & country** |
| **Scouting** | Mini-plane animation + agent pipeline while backend runs |
| **Battle Plan** | Map + intel panels (results dashboard) |
| **Ask Scout** | Chat sidebar / dock to query the analysis further |

**Demo path (must never break):**

1. Land on hero → pick **Website** tab → paste `https://example.com` *or* **Text** / **PDF**  
2. Enter **Austin** + **United States** → **Generate Battle Plan**  
3. **Plane flies** across route line while agents run (General → Cartographer → Networker → Strategist)  
4. Dashboard reveals — pins drop, cards stagger in  
5. Type in Ask Scout: *“Who should I partner with first?”* → streamed answer grounded in the Battle Plan  

Mock-first (`NEXT_PUBLIC_USE_MOCK=true`), then wire real API.

**Auth:** ignored for hackathon — no login, no accounts.

---

## 2. Stack

| Choice | Why |
|--------|-----|
| **Next.js 15 (App Router)** | Fast deploy, App Router |
| **TypeScript** | Shared types with backend |
| **Tailwind + shadcn/ui** | YC-speed components |
| **Framer Motion** | Plane path, hero stagger, card reveals |
| **vis.gl/react-google-maps** | Result map pins |
| **Lottie (optional)** | Plane asset fallback if custom SVG is tight on time |
| **No auth, no DB** | `useScout` + `useScoutChat` hooks |

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_GOOGLE_MAPS_KEY=...
NEXT_PUBLIC_USE_MOCK=true
```

---

## 3. Company input — three ways (one required)

Use a **segmented control** or tabs — only one active at a time.

| Mode | UI | Validation |
|------|-----|------------|
| **PDF** | Drag-and-drop zone, max ~10MB | `.pdf` only, show filename |
| **Website** | URL field with `https://` placeholder | Valid URL pattern |
| **Text** | Textarea (min ~50 chars) | “Describe your company, product, and customers…” |

**CTA enabled when:** `(pdf \| website \| text filled)` **and** `city` **and** `country`.

### Target market fields

| Field | UI | Example |
|-------|-----|---------|
| **City** | Text input | `Austin` |
| **Country** | Text input or select (top countries + “Other”) | `United States` |

Display in UI as **“Expand into Austin, United States”**. Backend receives `city` and `country` as separate strings (easier for Maps/Search grounding than parsing `"Austin, TX"`).

---

## 4. Backend contract (share with backend Day 0)

### `POST /api/scout`

**Body:** `multipart/form-data` *or* `application/json` (team pick one; multipart if PDF).

```ts
type ScoutInput = {
  input_type: "pdf" | "website" | "text";
  file?: File;           // when pdf
  website_url?: string;  // when website
  company_text?: string; // when text
  city: string;
  country: string;
};
```

**Response:** `{ "sessionId": "uuid" }`

### `GET /api/scout/:sessionId`

```ts
type ScoutStatus = {
  status: "running" | "done" | "error";
  progress?: string;
  active_agent?: "general" | "cartographer" | "networker" | "strategist";
  result?: BattlePlan;
  error?: string;
};
```

**Polling:** every **1.5s** while `running`.

### `POST /api/scout/:sessionId/chat` (follow-up Q&A)

```ts
// Request
{ "message": "Which competitor is closest to downtown?" }

// Response (pick one for v1)
// A) Simple:
{ "reply": "string", "citations?: string[] }

// B) Streaming (nice-to-have): SSE chunks
```

Frontend keeps **chat history** in React state for the session (no persistence). Context = full `BattlePlan` + prior messages; backend attaches session / plan.

### `BattlePlan`

```ts
export type BattlePlan = {
  company_summary: string;
  target_city: string;
  target_country: string;
  competitors: {
    name: string;
    address: string;
    lat: number;
    lng: number;
    notes?: string;
  }[];
  complementary_businesses?: { name: string; notes?: string }[];
  neighborhoods: { name: string; why_relevant: string }[];
  events: { title: string; date: string; url?: string; relevance: string }[];
  key_contacts: { name: string; role: string; source?: string }[];
  communities?: { name: string; platform: string; url?: string }[];
  regulatory_notes?: string[];
  strategy_bullets: string[];
  recommended_first_week: string[];
};
```

**Ask backend:**

- [ ] Accept all three `input_type` values  
- [ ] `city` + `country` on request and in `BattlePlan`  
- [ ] `active_agent` enum for plane / stepper sync (or keyword `progress`)  
- [ ] Chat endpoint grounded on completed scout  
- [ ] CORS for dev + Vercel URL  

---

## 5. UI direction — modern YC startup (2024–2025)

**Reference vibe:** [Linear](https://linear.app), [Resend](https://resend.com), [Granola](https://granola.ai) — **light-first**, confident typography, subtle motion, not “hackathon dark dashboard.”

### Layout principles

- **Generous whitespace** — hero breathes; content max-width `~1200px`  
- **Large display type** — one sharp headline, one muted subhead  
- **Soft gradients** — hero mesh or faint radial (`neutral-50` → `white`), not neon  
- **Bento-style** result cards — rounded-2xl, light border `border-black/5`, shadow-sm  
- **Micro-interactions** — hover lift on cards, smooth tab switches  
- **Trust strip** (optional, 15 min) — “Maps grounding · Search grounding · Gemini 3.5 Flash” with small icons  

### Design tokens

| Token | Value |
|-------|--------|
| Background | `#FAFAFA` / `white` with subtle grid or dot pattern in hero only |
| Text | `neutral-900` headings, `neutral-500` body |
| Primary CTA | Near-black pill `bg-neutral-900 text-white` or single brand blue |
| Accent | One color only — e.g. `#2563eb` for links / active tab |
| Radius | `rounded-2xl` cards, `rounded-full` buttons |
| Font | **Inter** or **Geist** (Next default) — optional **Instrument Serif** for hero word only |

### Landing hero (Input)

```
┌─────────────────────────────────────────────────────────────┐
│  Google AI Scout                                            │
│  Expand into any city like you already know the terrain.    │
│                                                             │
│  [ PDF ] [ Website ] [ Text ]    ← segmented control        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  input area (changes per tab)                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  City [ Austin        ]    Country [ United States ▼ ]   │
│                                                             │
│              [ Generate Battle Plan → ]                     │
└─────────────────────────────────────────────────────────────┘
```

Footer: small “Built for Google AI Hackathon · Gemini 3.5 Flash” — not loud.

---

## 6. Scout plane animation (loading / scouting)

**Concept:** A small **scout plane** flies along a **curved route** from “Home” (user’s company) to **target city** while agents work. This is the signature moment judges remember.

### Visual spec

- **Canvas:** full-width panel (~280–360px tall) between hero and dashboard, or replaces hero content after submit  
- **Route:** SVG dashed path (arc or S-curve); subtle map dots / grid in background (decorative, not real Maps API)  
- **Plane:** SVG icon (8–12kb) or Lottie loop — **nose follows path** via `motion-path` or manual `%` along path  
- **Markers:** start pin “You”, end pin “{City}, {Country}”  
- **Progress:** plane position tied to **agent step** (0% → 25% → 50% → 75% → 100% on done)

| Agent step | Plane position | Label under path |
|------------|----------------|------------------|
| General | 0–25% | Reading your company… |
| Cartographer | 25–50% | Mapping the terrain (Maps) |
| Networker | 50–75% | Scanning people & events (Search) |
| Strategist | 75–100% | Building your Battle Plan |

**Implementation (Framer Motion):**

```tsx
// motion.svg path + <motion.g> with animate={{ offsetDistance: "50%" }} style={{ offsetPath: "path('M...')" }}
// OR translateX keyed to step index with spring easing
```

**Fallback:** CSS animation moving plane left-to-right on a simple line if path math slips — still ship.

**Sync:**

- Prefer `active_agent` from API  
- Else fuzzy-match `progress` string  
- Else timer: **8s per step** (demo insurance)

**Sound:** off by default (hackathon rooms).

---

## 7. Agent pipeline (under the plane)

Compact **horizontal stepper** below the animation — same four agents, checkmarks as each completes. Plane and stepper stay in sync.

| Step | Label |
|------|--------|
| 1 | The General — understands your company |
| 2 | Cartographer — Maps grounding |
| 3 | Networker — Search grounding |
| 4 | Strategist — compiles Battle Plan |

---

## 8. Battle Plan dashboard

**Layout (desktop):**

```
┌────────────────────────────────────────────────────────────────┐
│  Battle Plan · Austin, United States          [New scout]      │
│  {company_summary one-liner}                                   │
├──────────────────────────────┬─────────────────────────────────┤
│                              │  Ask Scout 💬 (collapsible)      │
│   MAP (~55%)                 │  ┌───────────────────────────┐  │
│   pins                       │  │ chat messages              │  │
│                              │  │ input: Ask about this market│  │
│                              │  └───────────────────────────┘  │
│                              │  Competitors · Events · People  │
├──────────────────────────────┴─────────────────────────────────┤
│  Strategy chips · First week checklist                           │
└────────────────────────────────────────────────────────────────┘
```

**Mobile:** map → tabs for intel → **Ask Scout** as bottom sheet (FAB).

**Map:** light map style (`roadmap` or custom light `mapId`) — matches YC aesthetic better than dark map.

**Ask Scout panel:**

- Shown after `status === "done"`  
- Suggested prompts as chips: *“Top 3 partners?”* *“Biggest regulatory risk?”* *“Best neighborhood to start?”*  
- User messages + assistant replies; loading dots on send  
- Mock: echo smart replies from canned snippets keyed by keywords  

---

## 9. Mock-first development

```
frontend/
  lib/
    types.ts
    api.ts
    mock/
      battle-plan-austin.json
      simulate-scout.ts
      chat-replies.ts
  hooks/
    use-scout.ts
    use-scout-chat.ts
  components/
    landing/
      company-input-tabs.tsx
      location-fields.tsx
    scouting/
      scout-plane.tsx        ★ plane + route SVG
      agent-stepper.tsx
    battle-plan/
      ...
    ask-scout/
      ask-scout-panel.tsx
```

**`simulate-scout.ts`:** 12–16s total, rotate `active_agent` every 3–4s, then `done` + JSON.

**`chat-replies.ts`:** keyword → reply for demo without backend.

**Kill switches:**

- `?demo=1` — skip input, load Austin Battle Plan + open Ask Scout  
- “Try sample website” — prefills URL + Austin / US  

---

## 10. Build phases (frontend-only)

### Phase 0 — Scaffold (2–3 hrs)

- [ ] Next.js + Tailwind + shadcn + Geist/Inter  
- [ ] Light YC shell: hero, dot grid, types + mock JSON (`target_country`)  

### Phase 1 — Battle Plan + Ask Scout mock (half day) ★

- [ ] Dashboard bento layout + light map  
- [ ] Ask Scout UI with mock replies  
- [ ] `?demo=1`  

### Phase 2 — Landing input + plane (half day) ★

- [ ] PDF / Website / Text tabs + city/country  
- [ ] **Scout plane** + agent stepper synced to mock  
- [ ] Submit → scouting view → dashboard on `done`  

### Phase 3 — API wire-up (2–4 hrs)

- [ ] Real scout POST/GET (all input types)  
- [ ] Real chat endpoint or mock fallback  

### Phase 4 — Polish (2–3 hrs)

- [ ] Mobile + bottom sheet chat  
- [ ] Suggested prompt chips, pin stagger  
- [ ] Deploy Vercel, favicon, OG  

**Estimate:** ~1.5 days for a strong YC-quality demo.

---

## 11. Out of scope

- Login / auth / user accounts  
- Saved chat or scout history  
- In-browser PDF preview  
- Calling Gemini/Maps from browser  
- Full i18n (country **name** in English is fine)  

---

## 12. Handoff checklist (backend)

| Item | Notes |
|------|--------|
| `input_type`: pdf \| website \| text | Website = backend scrapes/fetches |
| `city` + `country` separate fields | On POST and in `BattlePlan` |
| `active_agent` on poll response | Powers plane + stepper |
| `POST .../chat` | Q&A over completed session |
| Sample JSON with `target_country` | For `mock/battle-plan-austin.json` |

---

## 13. Folder structure

```
frontend/
  app/
    page.tsx
    layout.tsx
    globals.css
  components/
    landing/
      company-input-tabs.tsx
      location-fields.tsx
    scouting/
      scout-plane.tsx
      agent-stepper.tsx
    battle-plan/
      battle-map.tsx
      competitor-list.tsx
      events-panel.tsx
      contacts-panel.tsx
      strategy-strip.tsx
    ask-scout/
      ask-scout-panel.tsx
      suggested-prompts.tsx
  hooks/
    use-scout.ts
    use-scout-chat.ts
  lib/
    types.ts
    api.ts
    mock/
      battle-plan-austin.json
      simulate-scout.ts
      chat-replies.ts
```

---

## 14. Open decisions

| # | Decision | Recommendation |
|---|----------|----------------|
| 1 | Page structure | Single page |
| 2 | Country input | Select top 20 + “Other” text field |
| 3 | Plane asset | Custom SVG + Framer `offsetPath` |
| 4 | Chat streaming | JSON reply v1; SSE if backend has time |

---

## 15. Next step

**Phase 0 + 1:** YC-style landing shell + Battle Plan dashboard + Ask Scout mock — then **Phase 2** plane animation on mock timer.

---

*Pairs with `PROJECT.md`. Update backend API §9 there when contract is finalized.*
