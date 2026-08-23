"use client";

import React from "react";

interface HackmindBadgeProps {
  variant?: "header" | "hero" | "footer";
  className?: string;
}

export default function HackmindBadge({
  variant = "hero",
  className = "",
}: HackmindBadgeProps) {
  if (variant === "header") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <a
          href="https://hackmind-ai-copilot.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          title="Experience HACKMIND AI Copilot"
          className="group flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-950/40 px-2.5 py-1 text-xs font-medium text-sky-200 transition-all hover:border-sky-400 hover:bg-sky-900/50 hover:shadow-[0_0_15px_-2px_rgba(56,189,248,0.5)]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/hackmind-logo.png"
            alt="Hackmind AI"
            className="h-5 w-5 object-contain transition-transform group-hover:scale-110 group-hover:rotate-6"
          />
          <span className="hidden sm:inline text-[11px] text-slate-300">
            Built with <strong className="text-white group-hover:text-sky-300">HACKMIND AI</strong>
          </span>
        </a>
      </div>
    );
  }

  if (variant === "footer") {
    return (
      <div
        className={`flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-sky-500/20 bg-gradient-to-r from-slate-900/80 via-sky-950/30 to-indigo-950/40 p-5 backdrop-blur-xl ${className}`}
      >
        <div className="flex items-center gap-3.5">
          <a
            href="https://hackmind-ai-copilot.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            title="Click to experience Hackmind AI Copilot"
            className="group relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-sky-400/30 bg-slate-900/90 p-1.5 shadow-[0_0_20px_-3px_rgba(56,189,248,0.5)] transition-all hover:scale-105 hover:border-sky-300"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/hackmind-logo.png"
              alt="HACKMIND AI Logo"
              className="h-full w-full object-contain transition-transform group-hover:scale-110"
            />
          </a>
          <div className="text-left">
            <p className="text-sm font-bold text-white flex items-center gap-2">
              Developed using{" "}
              <a
                href="https://hackmind-ai-copilot.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-sky-400 via-indigo-300 to-fuchsia-300 bg-clip-text text-transparent hover:underline font-extrabold"
              >
                HACKMIND AI
              </a>
            </p>
            <p className="text-xs text-slate-400">
              Click the logo to experience the AI Copilot for hackathons.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://instagram.com/hackmind_ai"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-pink-500/30 bg-gradient-to-r from-pink-500/10 to-purple-500/10 px-3.5 py-2 text-xs font-semibold text-pink-300 transition-all hover:border-pink-400 hover:bg-pink-500/20 hover:text-white shadow-[0_0_15px_-3px_rgba(236,72,153,0.4)]"
          >
            <span className="text-sm">📸</span>
            <span>Follow @hackmind_ai on Instagram</span>
          </a>
        </div>
      </div>
    );
  }

  // Default "hero" variant
  return (
    <div className={`flex flex-col items-center gap-2.5 ${className}`}>
      <div className="inline-flex flex-wrap items-center justify-center gap-2 sm:gap-3 rounded-full border border-sky-400/30 bg-gradient-to-r from-sky-950/60 via-slate-900/80 to-indigo-950/60 px-4 py-1.5 shadow-[0_0_25px_-5px_rgba(56,189,248,0.4)] backdrop-blur-xl transition-all hover:border-sky-400/50">
        <a
          href="https://hackmind-ai-copilot.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          title="Click to experience Hackmind AI Copilot"
          className="group flex items-center gap-2 text-xs font-semibold text-slate-200 hover:text-white transition-colors"
        >
          <div className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 border border-sky-400/40 p-1 shadow-[0_0_12px_rgba(56,189,248,0.6)] transition-transform group-hover:scale-110 group-hover:rotate-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/hackmind-logo.png"
              alt="HACKMIND AI Logo"
              className="h-full w-full object-contain"
            />
          </div>
          <span>
            Developed using{" "}
            <strong className="bg-gradient-to-r from-sky-300 via-indigo-300 to-fuchsia-300 bg-clip-text text-transparent font-bold">
              HACKMIND AI
            </strong>
          </span>
          <span className="text-[11px] text-sky-400 group-hover:underline hidden md:inline">
            (Click logo to experience)
          </span>
        </a>

        <span className="text-slate-600 hidden sm:inline">•</span>

        <a
          href="https://instagram.com/hackmind_ai"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-medium text-pink-300 hover:text-pink-200 transition-colors"
        >
          <span>📸</span>
          <span>Follow @hackmind_ai</span>
        </a>
      </div>
    </div>
  );
}
