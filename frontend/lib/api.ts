import type { ScoutInput, ScoutStatus } from "@/lib/types";
import { mockChatReply } from "@/lib/mock/chat-replies";
import {
  mockGetScoutStatus,
  mockStartScout,
} from "@/lib/mock/simulate-scout";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false";
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

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
  if (input.file) form.append("file", input.file);
  if (input.website_url) form.append("website_url", input.website_url);
  if (input.company_text) form.append("company_text", input.company_text);

  const res = await fetch(`${API_URL}/api/scout`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error("Failed to start scout");
  return res.json();
}

export async function getScoutStatus(sessionId: string): Promise<ScoutStatus> {
  if (USE_MOCK) {
    return mockGetScoutStatus(sessionId);
  }

  const res = await fetch(`${API_URL}/api/scout/${sessionId}`);
  if (!res.ok) throw new Error("Failed to get scout status");
  return res.json();
}

export async function sendChatMessage(
  sessionId: string,
  message: string,
): Promise<{ reply: string }> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 600 + Math.random() * 400));
    return { reply: mockChatReply(message) };
  }

  const res = await fetch(`${API_URL}/api/scout/${sessionId}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) throw new Error("Chat failed");
  return res.json();
}
