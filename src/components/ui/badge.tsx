"use client";

export default function Badge({
  children,
  color = "slate",
}: {
  children: React.ReactNode;
  color?: "slate" | "indigo" | "green" | "red" | "amber";
}) {
  const colors: Record<string, string> = {
    slate: "bg-white/10 text-slate-300 border border-white/10",
    indigo: "bg-indigo-500/15 text-indigo-300 border border-indigo-400/30",
    green: "bg-emerald-500/15 text-emerald-300 border border-emerald-400/30",
    red: "bg-red-500/15 text-red-300 border border-red-400/30",
    amber: "bg-amber-500/15 text-amber-300 border border-amber-400/30",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[color]}`}>
      {children}
    </span>
  );
}
