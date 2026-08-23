"use client";

interface SIHLogoProps {
  size?: number | "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
}

export default function SIHLogo({
  size = "md",
  showText = true,
  className = "",
}: SIHLogoProps) {
  let dimension = 40;

  if (typeof size === "number") {
    dimension = size;
  } else {
    switch (size) {
      case "sm":
        dimension = 36;
        break;
      case "md":
        dimension = 44;
        break;
      case "lg":
        dimension = 56;
        break;
      case "xl":
        dimension = 80;
        break;
    }
  }

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <div
        style={{ width: dimension, height: dimension }}
        className="relative flex shrink-0 items-center justify-center rounded-xl bg-white p-1 shadow-[0_0_18px_-2px_rgba(99,102,241,0.6)] border border-white/20 overflow-hidden transition-transform hover:scale-105"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/sih-bulb-logo.png"
          alt="Smart India Hackathon Logo"
          className="h-full w-full object-contain"
        />
      </div>

      {showText && (
        <div className="flex flex-col text-left leading-tight">
          <span className="font-bold tracking-tight text-white flex items-center gap-1.5 text-base sm:text-lg">
            <span>SIH</span>
            <span className="bg-gradient-to-r from-indigo-400 via-fuchsia-300 to-amber-300 bg-clip-text text-transparent">
              Team Matcher
            </span>
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400/90">
            Smart India Hackathon
          </span>
        </div>
      )}
    </div>
  );
}
