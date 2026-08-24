"use client";

import { useRef, useState, type MouseEvent } from "react";
import Avatar from "@/components/profile/Avatar";
import Badge from "@/components/ui/badge";

export default function Hero3DMatchCard() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 12, y: -16 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    // 3D rotation angles
    const rotX = (0.5 - y) * 26;
    const rotY = (x - 0.5) * 32;

    setRotate({ x: rotX, y: rotY });
    setGlare({ x: x * 100, y: y * 100, opacity: 0.8 });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotate({ x: 8, y: -12 });
    setGlare({ x: 50, y: 50, opacity: 0 });
  };

  return (
    <div className="relative mx-auto w-full max-w-lg perspective-scene py-6 select-none">
      {/* Dynamic Background Neon Orb */}
      <div className="absolute -left-12 -top-10 h-72 w-72 rounded-full bg-gradient-to-tr from-indigo-600/30 to-fuchsia-600/30 blur-3xl -z-10 animate-pulse" />
      <div className="absolute -right-10 -bottom-10 h-72 w-72 rounded-full bg-gradient-to-br from-amber-500/20 to-cyan-500/20 blur-3xl -z-10 animate-pulse" />

      {/* Floating 3D Card Scene */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
          transformStyle: "preserve-3d",
          transition: isHovered ? "transform 0.08s ease-out" : "transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)",
        }}
        className="relative rounded-3xl border border-white/20 bg-slate-900/80 p-6 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7),0_0_40px_-5px_rgba(99,102,241,0.3)] backdrop-blur-2xl transition-shadow duration-300"
      >
        {/* Dynamic Holographic Glare */}
        <div
          className="pointer-events-none absolute inset-0 rounded-3xl transition-opacity duration-300 -z-0 overflow-hidden"
          style={{
            opacity: glare.opacity,
            background: `radial-gradient(400px circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.14), transparent 65%)`,
          }}
        />

        {/* 3D Depth Layer 1: Header + Match Score Pill (translateZ: 35px) */}
        <div
          style={{ transform: "translateZ(35px)" }}
          className="flex items-center justify-between gap-3 border-b border-white/10 pb-4"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar name="Priya Sharma" size={48} />
              <div className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-400 border-2 border-slate-900 shadow-[0_0_8px_#34d399]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base tracking-tight">Priya Sharma</h3>
                <Badge color="indigo">AI/ML Lead</Badge>
              </div>
              <p className="text-xs text-slate-400">IIT Delhi • 3rd Year AI & Data Science</p>
            </div>
          </div>

          {/* Glowing 3D Score Badge */}
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-500/20 px-3.5 py-1 shadow-[0_0_20px_-3px_rgba(16,185,129,0.5)]">
              <span className="text-xs">⚡</span>
              <span className="text-sm font-black text-emerald-300 tracking-wide">98% Match</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 font-medium">Ideal Complement</span>
          </div>
        </div>

        {/* 3D Depth Layer 2: Skills & Roles Grid (translateZ: 45px) */}
        <div style={{ transform: "translateZ(45px)" }} className="mt-4 space-y-3">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Verified Tech Arsenal
            </span>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {["PyTorch", "FastAPI", "OpenCV", "Edge AI", "Docker", "ROS2"].map((s) => (
                <span
                  key={s}
                  className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1 text-xs font-medium text-indigo-300 shadow-[0_0_10px_-2px_rgba(99,102,241,0.2)]"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Targeted SIH Problem Statement Card (translateZ: 55px) */}
          <div
            style={{ transform: "translateZ(55px)" }}
            className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-3.5 shadow-[0_0_25px_-5px_rgba(245,158,11,0.2)]"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs">🎯</span>
              <span className="text-xs font-bold text-amber-300">Target Problem Statement:</span>
            </div>
            <p className="mt-1 text-xs font-medium text-slate-200 leading-snug">
              SIH1601: Smart Traffic Signal Optimization using Edge AI & Computer Vision
            </p>
          </div>
        </div>

        {/* 3D Depth Layer 3: AI Match Analysis Rationale (translateZ: 50px) */}
        <div
          style={{ transform: "translateZ(50px)" }}
          className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-left"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs">🤖</span>
            <span className="text-xs font-bold text-indigo-300">AI Match Rationale:</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-300 leading-relaxed">
            Completes your squad&apos;s missing <strong>Computer Vision & ML</strong> gap. Matches your <strong>Full-time availability</strong> and targets identical SIH1601 problem statement.
          </p>
        </div>

        {/* Floating 3D Popout Notification (translateZ: 75px) */}
        <div
          style={{
            transform: "translateZ(75px)",
            transformStyle: "preserve-3d",
          }}
          className="absolute -bottom-5 -right-3 sm:-right-6 flex items-center gap-2.5 rounded-2xl border border-emerald-400/50 bg-slate-950/90 px-4 py-2.5 shadow-[0_15px_35px_-5px_rgba(0,0,0,0.8),0_0_25px_rgba(16,185,129,0.3)] backdrop-blur-xl animate-float-slow"
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs">
            ✓
          </div>
          <div>
            <p className="text-xs font-bold text-white">Squad Request Accepted!</p>
            <p className="text-[10px] text-emerald-300">Teammate contact unlocked 📞</p>
          </div>
        </div>

        {/* Floating 3D Problem Statement Pill (translateZ: 65px) */}
        <div
          style={{
            transform: "translateZ(65px)",
            transformStyle: "preserve-3d",
          }}
          className="absolute -top-4 -left-3 sm:-left-6 flex items-center gap-2 rounded-xl border border-indigo-400/40 bg-slate-950/90 px-3.5 py-1.5 shadow-[0_10px_25px_rgba(0,0,0,0.7),0_0_20px_rgba(99,102,241,0.3)] backdrop-blur-xl animate-float-slower"
        >
          <span className="h-2 w-2 rounded-full bg-indigo-400 animate-ping" />
          <span className="text-[11px] font-semibold text-indigo-200">226 SIH PS Ready</span>
        </div>
      </div>
    </div>
  );
}

