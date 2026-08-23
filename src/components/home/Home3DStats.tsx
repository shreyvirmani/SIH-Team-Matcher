"use client";

import TiltCard from "@/components/ui/tilt-card";
import { StaggerContainer, StaggerItem } from "@/components/common/ScrollReveal";

const STATS = [
  {
    icon: "📜",
    value: "226",
    label: "Official SIH Problem Statements",
    highlight: "All 14 Ministries & Themes",
    color: "from-amber-400 to-orange-400",
  },
  {
    icon: "🧠",
    value: "0-100%",
    label: "AI Compatibility Matching",
    highlight: "With Plain-English Rationale",
    color: "from-indigo-400 to-cyan-400",
  },
  {
    icon: "🛡️",
    value: "6 Roles",
    label: "Balanced Squad Composition",
    highlight: "Instantly Spot Missing Gaps",
    color: "from-fuchsia-400 to-pink-400",
  },
  {
    icon: "🔒",
    value: "100%",
    label: "Verified Contact Privacy",
    highlight: "Unlocked Only on Acceptance",
    color: "from-emerald-400 to-teal-400",
  },
];

export default function Home3DStats() {
  return (
    <StaggerContainer staggerDelay={0.12} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {STATS.map((s) => (
        <StaggerItem key={s.label} variant="3d-rise">
          <TiltCard
            maxTilt={12}
            className="p-6 border border-white/10 bg-slate-900/60 shadow-[0_15px_35px_-10px_rgba(0,0,0,0.5)] hover:border-indigo-500/40 transition-all duration-300 h-full"
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">{s.icon}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5">
                SIH 2026
              </span>
            </div>
            <div className="mt-4">
              <span className={`text-3xl font-black tracking-tight bg-gradient-to-r ${s.color} bg-clip-text text-transparent`}>
                {s.value}
              </span>
              <h4 className="mt-1 text-sm font-bold text-white leading-snug">{s.label}</h4>
              <p className="mt-1 text-xs text-slate-400">{s.highlight}</p>
            </div>
          </TiltCard>
        </StaggerItem>
      ))}
    </StaggerContainer>
  );
}
