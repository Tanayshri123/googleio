"use client";

import { useCallback, useState } from "react";
import { sendChatMessage } from "@/lib/api";
import { replyFromPlan } from "@/lib/plan-chat";
import type { BattlePlan, ChatMessage } from "@/lib/types";

export function useScoutChat(
  sessionId: string | null,
  plan: BattlePlan | null,
) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = useCallback(
    async (content: string) => {
      if (!content.trim() || !plan) return;

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: content.trim(),
      };

      const historyForApi = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);
      setError(null);

      try {
        const sid = sessionId ?? "demo";
        const res = await sendChatMessage(
          sid,
          content.trim(),
          historyForApi,
          plan,
        );
        const reply =
          res.reply?.trim() ||
          replyFromPlan(plan, content, messages);

        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: "assistant", content: reply },
        ]);
      } catch (e) {
        const msg =
          e instanceof Error ? e.message : "Could not reach Ask Scout";
        setError(msg);
        const fallback = replyFromPlan(plan, content, messages);
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: `${fallback}\n\n_(Live Search unavailable: ${msg})_`,
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId, plan, messages],
  );

  const clear = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return { messages, isLoading, send, clear, error };
}
