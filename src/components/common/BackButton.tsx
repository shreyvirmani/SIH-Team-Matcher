"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

interface BackButtonProps {
  href?: string;
  label?: string;
  className?: string;
}

export default function BackButton({
  href,
  label = "Back",
  className = "",
}: BackButtonProps) {
  const router = useRouter();

  if (href) {
    return (
      <Link
        href={href}
        className={`inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-slate-300 transition-all hover:bg-white/[0.08] hover:border-white/20 hover:text-white active:scale-95 ${className}`}
      >
        <span className="text-sm leading-none">←</span>
        <span>{label}</span>
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className={`inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-slate-300 transition-all hover:bg-white/[0.08] hover:border-white/20 hover:text-white active:scale-95 ${className}`}
    >
      <span className="text-sm leading-none">←</span>
      <span>{label}</span>
    </button>
  );
}
