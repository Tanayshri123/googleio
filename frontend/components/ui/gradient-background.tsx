"use client";

/** Tsenta-style: clean white with very subtle top glow */
export function GradientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 bg-white">
      <div className="absolute inset-x-0 top-0 h-[480px] bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,#f5f5f5_0%,transparent_70%)]" />
    </div>
  );
}
