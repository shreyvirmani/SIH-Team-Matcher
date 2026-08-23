"use client";

import Link from "next/link";
import TiltCard from "@/components/ui/tilt-card";
import ScrollReveal, { StaggerContainer, StaggerItem } from "@/components/common/ScrollReveal";
import {
  BotIcon,
  WheatIcon,
  LockIcon,
  LeafIcon,
  StethoscopeIcon,
  GraduationCapIcon,
  AlertTriangleIcon,
  CarIcon,
  DroneIcon,
  ZapIcon,
  SatelliteIcon,
  CreditCardIcon,
  SearchIcon,
} from "@/components/common/Icons";

const CATEGORIES = [
  {
    name: "Smart Automation",
    icon: BotIcon,
    count: "22 PS",
    ps: "SIH1601 - SIH1622",
  },
  {
    name: "Agriculture & Rural Dev",
    icon: WheatIcon,
    count: "20 PS",
    ps: "SIH1623 - SIH1642",
  },
  {
    name: "Blockchain & Cyber",
    icon: LockIcon,
    count: "20 PS",
    ps: "SIH1643 - SIH1662",
  },
  {
    name: "Clean & Green Tech",
    icon: LeafIcon,
    count: "20 PS",
    ps: "SIH1663 - SIH1682",
  },
  {
    name: "MedTech & HealthTech",
    icon: StethoscopeIcon,
    count: "22 PS",
    ps: "SIH1683 - SIH1704",
  },
  {
    name: "Smart Education",
    icon: GraduationCapIcon,
    count: "20 PS",
    ps: "SIH1705 - SIH1724",
  },
  {
    name: "Disaster Management",
    icon: AlertTriangleIcon,
    count: "15 PS",
    ps: "SIH1725 - SIH1739",
  },
  {
    name: "Smart Vehicles & Transport",
    icon: CarIcon,
    count: "16 PS",
    ps: "SIH1740 - SIH1755",
  },
  {
    name: "Robotics & Drones",
    icon: DroneIcon,
    count: "15 PS",
    ps: "SIH1756 - SIH1770",
  },
  {
    name: "Renewable Energy",
    icon: ZapIcon,
    count: "15 PS",
    ps: "SIH1771 - SIH1785",
  },
  {
    name: "Space Technology",
    icon: SatelliteIcon,
    count: "12 PS",
    ps: "SIH1798 - SIH1809",
  },
  {
    name: "FinTech & Banking",
    icon: CreditCardIcon,
    count: "10 PS",
    ps: "SIH1810 - SIH1819",
  },
];

export default function Category3DShowcase() {
  return (
    <div className="space-y-6">
      <ScrollReveal variant="fade-up" className="text-center">
        <span className="rounded-full border border-slate-700 bg-slate-800/60 px-3.5 py-1 text-xs font-semibold text-slate-300">
          Official SIH 2026 Problem Catalog
        </span>
        <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Explore All 226 SIH Problem Statements
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-slate-400">
          Match with students solving the same challenges across AICTE, ISRO, DRDO, and Central Ministries.
        </p>
      </ScrollReveal>

      <StaggerContainer staggerDelay={0.04} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 pt-2">
        {CATEGORIES.map((c) => {
          const Icon = c.icon;
          return (
            <StaggerItem key={c.name} variant="fade-up">
              <TiltCard
                maxTilt={6}
                glow={false}
                className="p-4 border border-slate-800 bg-slate-900/70 hover:border-slate-700 transition-all h-full"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-800/40 text-slate-300">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="rounded border border-slate-800 bg-slate-800/60 px-2 py-0.5 text-[11px] font-semibold text-slate-300">
                    {c.count}
                  </span>
                </div>
                <h3 className="mt-3 font-semibold text-white text-sm">{c.name}</h3>
                <p className="mt-1 text-[11px] font-mono text-slate-400">{c.ps}</p>
              </TiltCard>
            </StaggerItem>
          );
        })}
      </StaggerContainer>

      <ScrollReveal variant="fade-up" delay={0.1} className="flex justify-center pt-2">
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/80 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-all"
        >
          <SearchIcon className="h-3.5 w-3.5 text-indigo-400" />
          <span>Search & Filter All 226 Statements in Profile Setup</span>
          <span>→</span>
        </Link>
      </ScrollReveal>
    </div>
  );
}
