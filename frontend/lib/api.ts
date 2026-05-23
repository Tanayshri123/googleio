import type { BattlePlan, ScoutInput, ScoutStatus } from "@/lib/types";
import { mockChatReply } from "@/lib/mock/chat-replies";
import {
  mockGetScoutStatus,
  mockStartScout,
} from "@/lib/mock/simulate-scout";
import { normalizeScoutStatus } from "@/lib/normalize-scout-status";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function parseError(res: Response): Promise<string> {
  try {
    const body = await res.json();
    return body.detail ?? body.error ?? res.statusText;
  } catch {
    return res.statusText || "Request failed";
  }
}

export async function startScout(
  input: ScoutInput,
): Promise<{ sessionId: string }> {
  if (USE_MOCK) {
    return mockStartScout(input);
  }

  const form = new FormData();
  form.append("input_type", input.input_type);
  form.append("city", input.city);
  form.append("country", input.country);
  form.append("deep_scope", String(input.deep_scope ?? false));
  if (input.file) form.append("file", input.file);
  if (input.website_url) form.append("website_url", input.website_url);
  if (input.company_text) form.append("company_text", input.company_text);

  const res = await fetch(`${API_URL}/api/scout`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    throw new Error(await parseError(res));
  }
  const data = await res.json();
  const sessionId = data.sessionId ?? data.session_id;
  if (!sessionId) throw new Error("No session id returned from backend");
  return { sessionId };
}

export async function getScoutStatus(sessionId: string): Promise<ScoutStatus> {
  if (USE_MOCK) {
    return mockGetScoutStatus(sessionId);
  }

  const res = await fetch(`${API_URL}/api/scout/${sessionId}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(await parseError(res));
  }
  const raw = await res.json();
  return normalizeScoutStatus(raw);
}

export async function sendChatMessage(
  sessionId: string,
  message: string,
  history: { role: "user" | "assistant"; content: string }[] = [],
  plan?: BattlePlan,
): Promise<{ reply: string }> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 600 + Math.random() * 400));
    return { reply: mockChatReply(message) };
  }

  const res = await fetch(`${API_URL}/api/scout/${sessionId}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      history,
      ...(sessionId === "demo" && plan ? { plan } : {}),
    }),
  });
  if (!res.ok) {
    throw new Error(await parseError(res));
  }
  return res.json();
}

export async function checkBackendHealth(): Promise<boolean> {
  if (USE_MOCK) return true;
  try {
    const res = await fetch(`${API_URL}/api/health`, { cache: "no-store" });
    return res.ok;
  } catch {
    return false;
  }
}

export { USE_MOCK, API_URL };
