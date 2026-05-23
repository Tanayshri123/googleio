"use client";

type Props = {
  onDemo?: () => void;
  showBack?: boolean;
  onBack?: () => void;
};

export function SiteHeader({ onDemo, showBack, onBack }: Props) {
  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-xs font-bold text-white">
            G
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-neutral-900">
            Google AI Scout
          </span>
        </div>

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
                  className="rounded-full px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
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
