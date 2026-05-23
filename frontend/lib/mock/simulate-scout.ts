import type { AgentId, BattlePlan, ScoutInput, ScoutStatus } from "@/lib/types";
import { sanitizeScoutReport } from "@/lib/sanitize-plan";
import battlePlanAustin from "./battle-plan-austin.json";

const AGENT_SEQUENCE: {
  agent: AgentId;
  progress: string;
  delayMs: number;
}[] = [
  {
    agent: "general",
    progress: "The General is reading your company profile…",
    delayMs: 2000,
  },
  {
    agent: "cartographer",
    progress: "Cartographer is mapping competitors with Google Maps…",
    delayMs: 2000,
  },
  {
    agent: "networker",
    progress: "Networker is scanning events and organizations with Google Search…",
    delayMs: 2000,
  },
  {
    agent: "strategist",
    progress: "Compliance Officer is checking permits and regulations…",
    delayMs: 2000,
  },
  {
    agent: "strategist",
    progress: "Compiling your Scout Report…",
    delayMs: 2000,
  },
];

type Session = {
  input: ScoutInput;
  startedAt: number;
  stepIndex: number;
};

const sessions = new Map<string, Session>();

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function mockStartScout(
  input: ScoutInput,
): Promise<{ sessionId: string }> {
  const sessionId = crypto.randomUUID();
  sessions.set(sessionId, { input, startedAt: Date.now(), stepIndex: 0 });
  return { sessionId };
}

export function mockGetScoutStatus(sessionId: string): ScoutStatus {
  const session = sessions.get(sessionId);
  if (!session) {
    return { status: "error", error: "Session not found" };
  }

  const elapsed = Date.now() - session.startedAt;
  let accumulated = 0;
  let currentStep = 0;

  for (let i = 0; i < AGENT_SEQUENCE.length; i++) {
    accumulated += AGENT_SEQUENCE[i].delayMs;
    if (elapsed < accumulated) {
      currentStep = i;
      break;
    }
    currentStep = i + 1;
  }

  if (currentStep >= AGENT_SEQUENCE.length) {
    const plan = {
      ...battlePlanAustin,
      target_city: session.input.city || battlePlanAustin.target_city,
      target_country:
        session.input.country || battlePlanAustin.target_country,
    };
    return {
      status: "done",
      active_agent: "strategist",
      progress: "Scout Report ready.",
      result: sanitizeScoutReport(plan as BattlePlan),
    };
  }

  const step = AGENT_SEQUENCE[currentStep];
  return {
    status: "running",
    active_agent: step.agent,
    progress: step.progress,
  };
}

export async function mockPollScout(
  sessionId: string,
  onUpdate: (status: ScoutStatus) => void,
): Promise<ScoutStatus> {
  for (;;) {
    const status = mockGetScoutStatus(sessionId);
    onUpdate(status);
    if (status.status === "done" || status.status === "error") {
      return status;
    }
    await delay(800);
  }
}

export function loadDemoBattlePlan() {
  return sanitizeScoutReport(battlePlanAustin as BattlePlan);
}
