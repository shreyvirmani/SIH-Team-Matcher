"use client";

import Link from "next/link";
import TiltCard from "@/components/ui/tilt-card";

const CATEGORIES = [
  {
    name: "Smart Automation",
    icon: "🤖",
    count: "22 Statements",
    ps: "SIH1601 - SIH1622",
    color: "border-indigo-500/30 bg-indigo-500/10 text-indigo-300",
  },
  {
    name: "Agriculture & Rural Dev",
    icon: "🌾",
    count: "20 Statements",
    ps: "SIH1623 - SIH1642",
    color: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  },
  {
    name: "Blockchain & Cyber",
    icon: "🔐",
    count: "20 Statements",
    ps: "SIH1643 - SIH1662",
    color: "border-violet-500/30 bg-violet-500/10 text-violet-300",
  },
  {
    name: "Clean & Green Tech",
    icon: "🌱",
    count: "20 Statements",
    ps: "SIH1663 - SIH1682",
    color: "border-teal-500/30 bg-teal-500/10 text-teal-300",
  },
  {
    name: "MedTech & HealthTech",
    icon: "🩺",
    count: "22 Statements",
    ps: "SIH1683 - SIH1704",
    color: "border-rose-500/30 bg-rose-500/10 text-rose-300",
  },
  {
    name: "Smart Education",
    icon: "🎓",
    count: "20 Statements",
    ps: "SIH1705 - SIH1724",
    color: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  },
  {
    name: "Disaster Management",
    icon: "🚨",
    count: "15 Statements",
    ps: "SIH1725 - SIH1739",
    color: "border-red-500/30 bg-red-500/10 text-red-300",
  },
  {
    name: "Smart Vehicles & Transport",
    icon: "🚗",
    count: "16 Statements",
    ps: "SIH1740 - SIH1755",
    color: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
  },
  {
    name: "Robotics & Drones",
    icon: "🛸",
    count: "15 Statements",
    ps: "SIH1756 - SIH1770",
    color: "border-blue-500/30 bg-blue-500/10 text-blue-300",
  },
  {
    name: "Renewable Energy",
    icon: "⚡",
    count: "15 Statements",
    ps: "SIH1771 - SIH1785",
    color: "border-yellow-500/30 bg-yellow-500/10 text-yellow-300",
  },
  {
    name: "Space Technology",
    icon: "🛰️",
    count: "12 Statements",
    ps: "SIH1798 - SIH1809",
    color: "border-purple-500/30 bg-purple-500/10 text-purple-300",
  },
  {
    name: "FinTech & Banking",
    icon: "💳",
    count: "10 Statements",
    ps: "SIH1810 - SIH1819",
    color: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  },
];

export default function Category3DShowcase() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <span className="rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold text-indigo-300">
          Official SIH 2026 Problem Catalog
        </span>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Explore All 226 SIH Problem Statements
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-slate-400">
          Match with students solving the same national challenges across AICTE, ISRO, DRDO, and Central Ministries.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 pt-4">
        {CATEGORIES.map((c) => (
          <TiltCard
            key={c.name}
            maxTilt={10}
            className="p-5 border border-white/10 bg-slate-900/50 hover:border-white/20 transition-all"
          >
            <div className="flex items-start justify-between">
              <span className="text-2xl">{c.icon}</span>
              <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${c.color}`}>
                {c.count}
              </span>
            </div>
            <h3 className="mt-3 font-semibold text-white text-sm">{c.name}</h3>
            <p className="mt-1 text-[11px] font-mono text-slate-400">{c.ps}</p>
          </TiltCard>
        ))}
      </div>

      <div className="flex justify-center pt-2">
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 rounded-xl border border-indigo-500/40 bg-indigo-600/20 px-5 py-2.5 text-xs font-semibold text-indigo-300 hover:bg-indigo-600/30 transition-all shadow-[0_0_20px_rgba(99,102,241,0.2)]"
        >
          <span>🔍</span>
          <span>Search & Filter All 226 Statements in Profile Setup</span>
          <span>→</span>
        </Link>
      </div>
    </div>
  );
}

