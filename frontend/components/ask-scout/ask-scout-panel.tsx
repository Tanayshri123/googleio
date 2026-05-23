"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, Loader2 } from "lucide-react";
import type { ChatMessage } from "@/lib/types";
import { cn } from "@/lib/utils";

const SUGGESTED = [
  "Who should I partner with first?",
  "What's my biggest competitor threat?",
  "Best neighborhood to start?",
  "What should I do in week one?",
];

type Props = {
  messages: ChatMessage[];
  isLoading: boolean;
  onSend: (message: string) => void;
};

function formatContent(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-semibold text-neutral-900">
        {part}
      </strong>
    ) : (
      part
    ),
  );
}

export function AskScoutPanel({ messages, isLoading, onSend }: Props) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSend(input);
    setInput("");
  };

  return (
    <div className="flex h-full min-h-[420px] flex-col rounded-[1.75rem] border border-pink-100 bg-white shadow-xl shadow-pink-100/50 lg:max-h-[calc(100vh-11rem)]">
      <div className="flex items-center gap-2 border-b border-pink-50 px-4 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-pink-400 to-rose-500">
          <MessageCircle className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="font-semibold text-neutral-900">Ask Scout</p>
          <p className="text-xs text-neutral-400">Follow-up on your Battle Plan</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-pink-50 px-3 py-2">
        {SUGGESTED.map((prompt) => (
          <button
            key={prompt}
            type="button"
            disabled={isLoading}
            onClick={() => onSend(prompt)}
            className="rounded-full border border-pink-100 bg-pink-50 px-2.5 py-1 text-[11px] text-neutral-600 transition hover:border-pink-200 hover:bg-pink-100 hover:text-pink-700 disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="text-center text-sm text-neutral-400">
            Ask anything about competitors, partners, or your first week.
          </p>
        )}
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "max-w-[95%] rounded-2xl px-3 py-2 text-sm",
                msg.role === "user"
                  ? "ml-auto bg-pink-500 text-white"
                  : "bg-pink-50 text-neutral-700",
              )}
            >
              {formatContent(msg.content)}
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-neutral-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Scout is thinking…
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex gap-2 border-t border-pink-50 p-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about this market…"
          disabled={isLoading}
          className="flex-1 rounded-xl border border-pink-100 px-3 py-2 text-sm focus:border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-500/20 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500 text-white disabled:bg-pink-100"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
