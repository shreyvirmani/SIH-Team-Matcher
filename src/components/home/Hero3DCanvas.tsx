"use client";

import { useEffect, useRef } from "react";

/**
 * High-performance 3D interactive particle & node mesh canvas.
 * Projects 3D points (x, y, z) to 2D screen space with camera rotation,
 * responds smoothly to mouse coordinates, and renders glowing node connections.
 */
export default function Hero3DCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener("resize", handleResize);

    // 3D Particles array
    const PARTICLE_COUNT = 70;
    const particles: {
      x: number;
      y: number;
      z: number;
      vx: number;
      vy: number;
      vz: number;
      size: number;
      color: string;
    }[] = [];

    const colors = [
      "rgba(129, 140, 248, ", // indigo
      "rgba(217, 70, 239, ",  // fuchsia
      "rgba(56, 189, 248, ",  // sky
      "rgba(251, 191, 36, ",  // amber
    ];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: (Math.random() - 0.5) * 1200,
        y: (Math.random() - 0.5) * 800,
        z: (Math.random() - 0.5) * 1000 + 400,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        vz: (Math.random() - 0.5) * 0.6,
        size: Math.random() * 2.5 + 1.2,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    let targetRotX = 0;
    let targetRotY = 0;
    let rotX = 0;
    let rotY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / width - 0.5;
      const y = (e.clientY - rect.top) / height - 0.5;
      targetRotY = x * 0.4;
      targetRotX = -y * 0.4;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    const fov = 450;
    let time = 0;

    const render = () => {
      time += 0.005;
      rotX += (targetRotX - rotX) * 0.05;
      rotY += (targetRotY - rotY) * 0.05;

      ctx.clearRect(0, 0, width, height);

      const cosY = Math.cos(rotY + time * 0.2);
      const sinY = Math.sin(rotY + time * 0.2);
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);

      const projected: { px: number; py: number; pz: number; p: (typeof particles)[0]; scale: number }[] = [];

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;

        if (p.x > 600) p.x = -600;
        if (p.x < -600) p.x = 600;
        if (p.y > 400) p.y = -400;
        if (p.y < -400) p.y = 400;
        if (p.z > 900) p.z = 100;
        if (p.z < 100) p.z = 900;

        // 3D rotation projection
        const x1 = p.x * cosY - p.z * sinY;
        const z1 = p.z * cosY + p.x * sinY;
        const y1 = p.y * cosX - z1 * sinX;
        const z2 = z1 * cosX + p.y * sinX;

        if (z2 > 10) {
          const scale = fov / (fov + z2);
          const px = x1 * scale + width / 2;
          const py = y1 * scale + height / 2;
          projected.push({ px, py, pz: z2, p, scale });
        }
      }

      // Draw connection lines between nearby 3D points
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const p1 = projected[i];
          const p2 = projected[j];
          const dx = p1.px - p2.px;
          const dy = p1.py - p2.py;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            const alpha = (1 - dist / 110) * 0.22 * Math.min(p1.scale, p2.scale);
            ctx.beginPath();
            ctx.strokeStyle = `rgba(147, 197, 253, ${alpha})`;
            ctx.lineWidth = 0.75;
            ctx.moveTo(p1.px, p1.py);
            ctx.lineTo(p2.px, p2.py);
            ctx.stroke();
          }
        }
      }

      // Draw glowing particle nodes
      for (let i = 0; i < projected.length; i++) {
        const { px, py, p, scale } = projected[i];
        const r = Math.max(1, p.size * scale);
        const alpha = Math.min(0.9, Math.max(0.15, scale * 0.8));

        // Soft outer glow
        ctx.beginPath();
        ctx.arc(px, py, r * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${alpha * 0.3})`;
        ctx.fill();

        // Bright node core
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${alpha})`;
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full opacity-70"
      aria-hidden="true"
    />
  );
}

