"use client";

import { useState, useMemo } from "react";
import Badge from "@/components/ui/badge";

export interface ProblemStatementItem {
  id: number;
  psNumber?: string;
  organization?: string;
  theme?: string;
  title: string;
  description?: string;
  category?: string;
}

export default function ProblemStatementSelector({
  problemStatements = [],
  selectedIds = [],
  onChange,
  error,
}: {
  problemStatements: ProblemStatementItem[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  error?: string;
}) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    (problemStatements || []).forEach((ps) => {
      const cat = ps.category || ps.theme;
      if (cat) cats.add(cat);
    });
    return ["All", ...Array.from(cats).sort()];
  }, [problemStatements]);

  const filtered = useMemo(() => {
    return (problemStatements || []).filter((ps) => {
      const cat = ps.category || ps.theme;
      const matchesCategory = selectedCategory === "All" || cat === selectedCategory;
      const q = search.toLowerCase().trim();
      const psNum = ps.psNumber || (ps.id ? `SIH${1600 + ps.id}` : "");
      const matchesSearch =
        !q ||
        ps.title.toLowerCase().includes(q) ||
        psNum.toLowerCase().includes(q) ||
        (ps.organization && ps.organization.toLowerCase().includes(q)) ||
        (cat && cat.toLowerCase().includes(q)) ||
        (ps.description && ps.description.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [problemStatements, selectedCategory, search]);

  const toggle = (id: number) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((item) => item !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const clearAll = () => {
    onChange([]);
  };

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-300">
          SIH Problem Statements
        </span>
        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <>
              <span className="text-xs font-semibold text-amber-400">
                {selectedIds.length} selected
              </span>
              <button
                type="button"
                onClick={clearAll}
                className="text-xs text-slate-400 hover:text-slate-200 underline"
              >
                Clear
              </button>
            </>
          )}
        </div>
      </div>

      {/* Search Input */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search all 226 statements by PS No. (e.g. SIH1601), Ministry, Keyword (AI, Drone, Cyber)…"
        className="rounded-lg border border-slate-600/60 bg-white/5 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-indigo-400 transition-colors"
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
                : "border border-white/5 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Problem Statements List */}
      <div className="flex max-h-72 flex-col gap-2 overflow-y-auto rounded-lg border border-slate-600/60 bg-white/5 p-3">
        {filtered.length === 0 ? (
          <p className="py-6 text-center text-xs text-slate-500">
            No problem statements match your search criteria.
          </p>
        ) : (
          filtered.map((ps) => {
            const isSelected = selectedIds.includes(ps.id);
            const isExpanded = expandedId === ps.id;
            const psNum = ps.psNumber || `SIH${1600 + ps.id}`;
            const cat = ps.category || ps.theme;

            return (
              <div
                key={ps.id}
                className={`rounded-lg border p-2.5 transition-all ${
                  isSelected
                    ? "border-amber-400/40 bg-amber-500/10 shadow-[0_0_12px_-4px_rgba(245,158,11,0.3)]"
                    : "border-white/5 bg-white/[0.02] hover:border-white/15"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <label className="flex flex-1 items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="mt-0.5 h-4 w-4 rounded border-slate-700 bg-slate-800 text-amber-500 focus:ring-amber-400"
                      checked={isSelected}
                      onChange={() => toggle(ps.id)}
                    />
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-400/30">
                          {psNum}
                        </span>
                        <span className="text-sm font-medium text-slate-100">
                          {ps.title}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        {ps.organization && (
                          <span className="text-[11px] text-slate-400 font-medium">
                            🏛️ {ps.organization}
                          </span>
                        )}
                        {cat && (
                          <Badge color="slate">{cat}</Badge>
                        )}
                      </div>
                    </div>
                  </label>

                  {ps.description && (
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : ps.id)}
                      className="text-[11px] text-slate-400 hover:text-amber-300 font-medium whitespace-nowrap pt-0.5"
                    >
                      {isExpanded ? "Hide details" : "Details"}
                    </button>
                  )}
                </div>

                {isExpanded && ps.description && (
                  <div className="mt-2 text-xs leading-relaxed text-slate-300 pl-6.5 border-t border-white/5 pt-2 space-y-1">
                    {ps.organization && (
                      <p className="text-amber-300 font-medium">
                        Organization / Ministry: {ps.organization}
                      </p>
                    )}
                    <p>{ps.description}</p>
                  </div>
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
