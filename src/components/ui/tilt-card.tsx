"use client";

import { useRef, useState, type ReactNode, type MouseEvent } from "react";

/**
 * Wraps any content in a card that tilts in 3D toward the cursor
 * (mouse-tracked rotateX/rotateY) with a soft glow that follows the pointer.
 * Pure CSS transforms — no WebGL/canvas needed for this scale of effect.
 */
export default function TiltCard({
  children,
  className = "",
  maxTilt = 10,
  glow = true,
}: {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
  glow?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({});
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50 });
  const [hovering, setHovering] = useState(false);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    const rotateY = (x - 0.5) * maxTilt * 2;
    const rotateX = (0.5 - y) * maxTilt * 2;

    setStyle({ transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)` });
    setGlowPos({ x: x * 100, y: y * 100 });
  };

  const handleMouseLeave = () => {
    setStyle({ transform: "rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)" });
    setHovering(false);
  };

  return (
    <div className="perspective-scene">
      <div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={handleMouseLeave}
        style={style}
        className={`tilt-card glass-panel relative overflow-hidden rounded-2xl ${className}`}
      >
        {glow && (
          <div
            className="pointer-events-none absolute inset-0 transition-opacity duration-300"
            style={{
              opacity: hovering ? 1 : 0,
              background: `radial-gradient(400px circle at ${glowPos.x}% ${glowPos.y}%, rgba(129,140,248,0.15), transparent 60%)`,
            }}
          />
        )}
        <div style={{ transform: "translateZ(20px)" }}>{children}</div>
      </div>
    </div>
  );
}
