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
      if (!content.trim()) return;

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: content.trim(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);
      setError(null);

      try {
        let reply: string;

        if (!plan) {
          const res = await sendChatMessage(sessionId ?? "demo", content);
          reply = res.reply;
        } else if (sessionId === "demo" || !sessionId) {
          await new Promise((r) => setTimeout(r, 350));
          reply = replyFromPlan(plan, content);
        } else {
          try {
            const res = await sendChatMessage(sessionId, content);
            reply = res.reply?.trim() || replyFromPlan(plan, content);
          } catch {
            reply = replyFromPlan(plan, content);
          }
        }

        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: "assistant", content: reply },
        ]);
      } catch (e) {
        const msg =
          e instanceof Error ? e.message : "Could not reach Ask Scout";
        setError(msg);
        if (plan) {
          setMessages((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              role: "assistant",
              content: replyFromPlan(plan, content),
            },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              role: "assistant",
              content: `Ask Scout failed: ${msg}. Check that the backend is running on port 8000.`,
            },
          ]);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId, plan],
  );

  const clear = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return { messages, isLoading, send, clear, error };
}
