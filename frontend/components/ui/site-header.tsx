"use client";

import { ScoutLogo } from "@/components/ui/scout-logo";

type Props = {
  onDemo?: () => void;
  showBack?: boolean;
  onBack?: () => void;
};

export function SiteHeader({ onDemo, showBack, onBack }: Props) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/60 bg-white/75 backdrop-blur-xl shadow-[0_1px_0_rgba(66,133,244,0.08)]">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 sm:px-6">
        <a href="/" className="flex items-center gap-2.5" aria-label="Google AI Scout home">
          <ScoutLogo variant="full" height={34} className="hidden sm:flex" />
          <ScoutLogo variant="mark" height={36} className="sm:hidden" />
        </a>

        <nav className="flex items-center gap-2 sm:gap-4">
          {showBack && onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="text-sm font-medium text-neutral-500 hover:text-neutral-900"
            >
              ← Back
            </button>
          ) : (
            <>
              <a
                href="#how-it-works"
                className="hidden text-sm text-neutral-600 hover:text-neutral-900 sm:inline"
              >
                How it works
              </a>
              {onDemo && (
                <button
                  type="button"
                  onClick={onDemo}
                  className="rounded-full border border-[#4285F4]/20 bg-white/80 px-4 py-2 text-sm font-medium text-[#1a73e8] shadow-sm hover:bg-[#4285F4]/5"
                >
                  View demo
                </button>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
