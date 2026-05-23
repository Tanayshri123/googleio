"use client";

import { useCallback, useState } from "react";
import { sendChatMessage } from "@/lib/api";
import type { ChatMessage } from "@/lib/types";

export function useScoutChat(sessionId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const send = useCallback(
    async (content: string) => {
      if (!sessionId || !content.trim()) return;

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: content.trim(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      try {
        const { reply } = await sendChatMessage(sessionId, content);
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: reply,
          },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: "Sorry, Ask Scout is unavailable. Try again in a moment.",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId],
  );

  const clear = useCallback(() => setMessages([]), []);

  return { messages, isLoading, send, clear };
}
