"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2 } from "lucide-react";
import type { ChatMessage } from "@/lib/types";
import { cn } from "@/lib/utils";

const SUGGESTED = [
  "Who should I partner with first?",
  "Biggest competitor threat?",
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
      <span key={i} className="whitespace-pre-wrap">
        {part}
      </span>
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
    <div className="flex h-full min-h-[400px] flex-col rounded-xl border border-neutral-200 bg-neutral-50/30">
      <div className="border-b border-neutral-200 px-4 py-3">
        <p className="text-sm font-semibold text-neutral-900">Ask Scout</p>
        <p className="text-xs text-neutral-500">Follow-up on this Scout Report</p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-neutral-200 px-3 py-2">
        {SUGGESTED.map((prompt) => (
          <button
            key={prompt}
            type="button"
            disabled={isLoading}
            onClick={() => onSend(prompt)}
            className="rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-[11px] text-neutral-600 hover:border-neutral-300 disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="text-center text-sm text-neutral-400">
            Ask anything about this market.
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
                  ? "ml-auto bg-neutral-900 text-white"
                  : "bg-white text-neutral-700 ring-1 ring-neutral-200",
              )}
            >
              {formatContent(msg.content)}
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-neutral-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Thinking…
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 border-t border-neutral-200 p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about this market…"
          disabled={isLoading}
          className="flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-900 text-white disabled:bg-neutral-200"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
