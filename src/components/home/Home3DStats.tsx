"use client";

import TiltCard from "@/components/ui/tilt-card";
import { StaggerContainer, StaggerItem } from "@/components/common/ScrollReveal";
import { DocumentIcon, BrainIcon, UsersIcon, LockIcon } from "@/components/common/Icons";

const STATS = [
  {
    icon: DocumentIcon,
    value: "226",
    label: "Official Problem Statements",
    highlight: "All 14 Ministries & Themes",
    iconColor: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  },
  {
    icon: BrainIcon,
    value: "0-100%",
    label: "AI Compatibility Scoring",
    highlight: "With Clear Rationales",
    iconColor: "text-indigo-400 bg-indigo-400/10 border-indigo-400/20",
  },
  {
    icon: UsersIcon,
    value: "6 Members",
    label: "Balanced Squad Composition",
    highlight: "Spot Missing Skills & Roles",
    iconColor: "text-sky-400 bg-sky-400/10 border-sky-400/20",
  },
  {
    icon: LockIcon,
    value: "100% Private",
    label: "Verified Contact Sharing",
    highlight: "Unlocked Only on Acceptance",
    iconColor: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  },
];

export default function Home3DStats() {
  return (
    <StaggerContainer staggerDelay={0.08} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {STATS.map((s) => {
        const Icon = s.icon;
        return (
          <StaggerItem key={s.label} variant="fade-up">
            <TiltCard
              maxTilt={8}
              glow={false}
              className="p-5 border border-slate-800 bg-slate-900/80 shadow-sm hover:border-slate-700 transition-all h-full"
            >
              <div className="flex items-center justify-between">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg border ${s.iconColor}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 rounded border border-slate-800 bg-slate-800/50 px-2 py-0.5">
                  SIH 2026
                </span>
              </div>
              <div className="mt-4">
                <span className="text-2xl font-bold tracking-tight text-white">
                  {s.value}
                </span>
                <h4 className="mt-1 text-sm font-semibold text-slate-200">{s.label}</h4>
                <p className="mt-1 text-xs text-slate-400">{s.highlight}</p>
              </div>
            </TiltCard>
          </StaggerItem>
        );
      })}
    </StaggerContainer>
  );
}
