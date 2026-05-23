"use client";

/** Google-inspired vibrant mesh — blue, red, yellow, green */
export function GradientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#f8f9ff]">
      <div
        className="absolute inset-0 opacity-[0.55]"
        style={{
          background:
            "linear-gradient(165deg, #ffffff 0%, #f3f6ff 35%, #fff8f6 65%, #f6fff8 100%)",
        }}
      />

      <div className="scout-blob absolute -left-[12%] top-[-18%] h-[min(72vh,520px)] w-[min(72vh,520px)] rounded-full bg-[#4285F4]/35 blur-[90px]" />
      <div className="scout-blob scout-blob-delay-1 absolute -right-[8%] top-[2%] h-[min(58vh,440px)] w-[min(58vh,440px)] rounded-full bg-[#EA4335]/28 blur-[88px]" />
      <div className="scout-blob scout-blob-delay-2 absolute left-[28%] top-[38%] h-[min(50vh,380px)] w-[min(50vh,380px)] rounded-full bg-[#FBBC05]/32 blur-[95px]" />
      <div className="scout-blob scout-blob-delay-3 absolute -bottom-[12%] right-[18%] h-[min(55vh,420px)] w-[min(55vh,420px)] rounded-full bg-[#34A853]/30 blur-[92px]" />

      <div
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#4285F4]/40 to-transparent"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_90%_50%_at_50%_0%,rgba(255,255,255,0.85)_0%,transparent_55%)]"
        aria-hidden
      />
    </div>
  );
}
