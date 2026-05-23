"use client";

import { ArrowRight } from "lucide-react";

type Props = {
  onDemo?: () => void;
  showBack?: boolean;
  onBack?: () => void;
};

export function SiteHeader({ onDemo, showBack, onBack }: Props) {
  return (
    <header className="sticky top-0 z-50 border-b border-pink-100 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 shadow-lg shadow-pink-400/30">
            <span className="text-sm font-bold text-white">G</span>
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-neutral-900">
            Google AI Scout
          </span>
        </div>

        <div className="flex items-center gap-3">
          {showBack && onBack && (
            <button
              type="button"
              onClick={onBack}
              className="text-sm font-medium text-neutral-500 transition hover:text-pink-600"
            >
              ← Back
            </button>
          )}
          {onDemo && (
            <button
              type="button"
              onClick={onDemo}
              className="hidden items-center gap-2 rounded-full bg-pink-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-pink-500/25 transition hover:bg-pink-600 sm:inline-flex"
            >
              View demo
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
