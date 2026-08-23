"use client";

import { useState, useMemo } from "react";
import Badge from "@/components/ui/badge";

export interface ProblemStatementItem {
  id: number;
  title: string;
  description?: string;
  category?: string;
}

export default function TeamProblemStatementSelector({
  problemStatements = [],
  selectedId,
  onChange,
  error,
}: {
  problemStatements: ProblemStatementItem[];
  selectedId?: string | number | null;
  onChange: (id: string) => void;
  error?: string;
}) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    (problemStatements || []).forEach((ps) => {
      if (ps.category) cats.add(ps.category);
    });
    return ["All", ...Array.from(cats).sort()];
  }, [problemStatements]);

  const filtered = useMemo(() => {
    return (problemStatements || []).filter((ps) => {
      const matchesCategory = selectedCategory === "All" || ps.category === selectedCategory;
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        ps.title.toLowerCase().includes(q) ||
        (ps.category && ps.category.toLowerCase().includes(q)) ||
        (ps.description && ps.description.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [problemStatements, selectedCategory, search]);

  const selectedItem = useMemo(() => {
    return problemStatements.find((ps) => String(ps.id) === String(selectedId));
  }, [problemStatements, selectedId]);

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-300">
          Target SIH 2026 Problem Statement <span className="text-red-400">*</span>
        </label>
        {selectedItem && (
          <span className="text-xs font-semibold text-amber-400">
            Selected: {selectedItem.title.slice(0, 32)}…
          </span>
        )}
      </div>

      {/* Search Input */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search 50+ problem statements by topic, keyword (e.g. AI, Drone, Blockchain)…"
        className="rounded-lg border border-slate-700/80 bg-slate-900/90 px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-indigo-400 transition-colors"
      />

      {/* Category Pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
        {categories.map((cat) => (
          <button
            type="button"
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
              selectedCategory === cat
                ? "border border-amber-400/50 bg-amber-500/20 text-amber-300 shadow-[0_0_10px_-2px_rgba(245,158,11,0.5)]"
                : "border border-white/5 bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Problem Statements List with Custom Dark Scrollbar */}
      <div className="flex max-h-60 flex-col gap-2 overflow-y-auto rounded-xl border border-slate-700/70 bg-slate-950/80 p-3 scrollbar-thin scrollbar-thumb-indigo-500/30 scrollbar-track-slate-900/60">
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-xs text-slate-500">
            No problem statements match your search criteria.
          </p>
        ) : (
          filtered.map((ps) => {
            const isSelected = String(selectedId) === String(ps.id);
            const isExpanded = expandedId === ps.id;

            return (
              <div
                key={ps.id}
                onClick={() => onChange(String(ps.id))}
                className={`rounded-lg border p-3 cursor-pointer transition-all ${
                  isSelected
                    ? "border-amber-400/60 bg-amber-500/15 shadow-[0_0_14px_-3px_rgba(245,158,11,0.35)]"
                    : "border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/15"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-1 items-start gap-3">
                    <div
                      className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-all ${
                        isSelected
                          ? "border-amber-400 bg-amber-500 text-slate-950"
                          : "border-slate-600 bg-slate-800"
                      }`}
                    >
                      {isSelected && (
                        <div className="h-1.5 w-1.5 rounded-full bg-slate-950" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-xs font-semibold ${isSelected ? "text-amber-200" : "text-slate-100"}`}>
                          {ps.title}
                        </span>
                        {ps.category && (
                          <Badge color="amber">{ps.category}</Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {ps.description && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedId(isExpanded ? null : ps.id);
                      }}
                      className="text-[11px] text-slate-400 hover:text-amber-300 font-medium whitespace-nowrap pt-0.5"
                    >
                      {isExpanded ? "Hide" : "Details"}
                    </button>
                  )}
                </div>

                {isExpanded && ps.description && (
                  <p className="mt-2 text-xs leading-relaxed text-slate-300 pl-7 border-t border-white/5 pt-2">
                    {ps.description}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>

      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}
