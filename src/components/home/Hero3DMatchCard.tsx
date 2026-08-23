"use client";

import { useRef, useState, type MouseEvent } from "react";
import Avatar from "@/components/profile/Avatar";
import Badge from "@/components/ui/badge";
import {
  ZapIcon,
  TargetIcon,
  BrainIcon,
  CheckCircleIcon,
  PhoneIcon,
} from "@/components/common/Icons";

export default function Hero3DMatchCard() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 8, y: -12 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    const rotX = (0.5 - y) * 18;
    const rotY = (x - 0.5) * 22;

    setRotate({ x: rotX, y: rotY });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotate({ x: 6, y: -8 });
  };

  return (
    <div className="relative mx-auto w-full max-w-lg perspective-scene py-4 select-none">
      {/* Crisp 3D Card Container */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
          transformStyle: "preserve-3d",
          transition: isHovered ? "transform 0.08s ease-out" : "transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)",
        }}
        className="relative rounded-2xl border border-slate-700/60 bg-slate-900/95 p-6 shadow-2xl backdrop-blur-md"
      >
        {/* Layer 1: Header + Match Score (translateZ: 30px) */}
        <div
          style={{ transform: "translateZ(30px)" }}
          className="flex items-center justify-between gap-3 border-b border-slate-800 pb-4"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar name="Priya Sharma" size={44} />
              <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-slate-900" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white text-sm">Priya Sharma</h3>
                <Badge color="indigo">AI/ML Lead</Badge>
              </div>
              <p className="text-xs text-slate-400">IIT Delhi • 3rd Year AI & Data Science</p>
            </div>
          </div>

          {/* Clean Score Badge */}
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1">
              <ZapIcon className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-400">98% Match</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1">High Compatibility</span>
          </div>
        </div>

        {/* Layer 2: Skills & Problem Statement (translateZ: 35px) */}
        <div style={{ transform: "translateZ(35px)" }} className="mt-4 space-y-3">
          <div>
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
              Verified Tech Stack
            </span>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {["PyTorch", "FastAPI", "OpenCV", "Edge AI", "Docker", "ROS2"].map((s) => (
                <span
                  key={s}
                  className="rounded-md border border-slate-700 bg-slate-800/80 px-2 py-0.5 text-xs font-medium text-slate-300"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Target Problem Statement */}
          <div
            style={{ transform: "translateZ(40px)" }}
            className="rounded-xl border border-slate-800 bg-slate-800/40 p-3"
          >
            <div className="flex items-center gap-1.5">
              <TargetIcon className="h-3.5 w-3.5 text-indigo-400" />
              <span className="text-xs font-semibold text-slate-200">Target Problem Statement</span>
            </div>
            <p className="mt-1 text-xs text-slate-300 font-medium">
              SIH1601: Smart Traffic Signal Optimization using Edge AI & Computer Vision
            </p>
          </div>
        </div>

        {/* Layer 3: AI Match Rationale (translateZ: 40px) */}
        <div
          style={{ transform: "translateZ(40px)" }}
          className="mt-4 rounded-xl border border-slate-800 bg-slate-800/30 p-3 text-left"
        >
          <div className="flex items-center gap-1.5">
            <BrainIcon className="h-3.5 w-3.5 text-indigo-400" />
            <span className="text-xs font-semibold text-slate-200">AI Match Rationale</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400 leading-relaxed">
            Completes squad missing <strong className="text-slate-200">Computer Vision</strong> capability. Shares targeted SIH1601 problem statement and matching full-time availability.
          </p>
        </div>

        {/* Clean Floating Popout (translateZ: 50px) */}
        <div
          style={{
            transform: "translateZ(50px)",
            transformStyle: "preserve-3d",
          }}
          className="absolute -bottom-4 -right-2 sm:-right-4 flex items-center gap-2.5 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 shadow-xl"
        >
          <CheckCircleIcon className="h-4 w-4 text-emerald-400 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-white">Squad Request Accepted</p>
            <p className="text-[10px] text-slate-400 flex items-center gap-1">
              <span>Contact Unlocked</span>
              <PhoneIcon className="h-2.5 w-2.5 text-emerald-400" />
            </p>
          </div>
        </div>

        {/* Clean Top Tag (translateZ: 45px) */}
        <div
          style={{
            transform: "translateZ(45px)",
            transformStyle: "preserve-3d",
          }}
          className="absolute -top-3 -left-2 sm:-left-4 flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1 shadow-lg"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
          <span className="text-[11px] font-medium text-slate-300">226 SIH Catalog</span>
        </div>
      </div>
    </div>
  );
}
