"use client";

import { useState, useMemo } from "react";

export default function MultiSelect({
  label,
  options,
  selected,
  onChange,
  allowCustom = true,
  placeholder = "Search or type custom…",
  error,
}: {
  label?: string;
  options: string[];
  selected: string[];
  onChange: (values: string[]) => void;
  allowCustom?: boolean;
  placeholder?: string;
  error?: string;
}) {
  const [search, setSearch] = useState("");

  const allAvailableOptions = useMemo(() => {
    const combined = new Set([...selected, ...options]);
    return Array.from(combined);
  }, [options, selected]);

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return allAvailableOptions;
    const query = search.toLowerCase().trim();
    return allAvailableOptions.filter((opt) => opt.toLowerCase().includes(query));
  }, [allAvailableOptions, search]);

  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const handleAddCustom = () => {
    const trimmed = search.trim();
    if (!trimmed) return;
    // Check case-insensitive match
    const existing = allAvailableOptions.find((o) => o.toLowerCase() === trimmed.toLowerCase());
    const finalVal = existing || trimmed;
    if (!selected.includes(finalVal)) {
      onChange([...selected, finalVal]);
    }
    setSearch("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (allowCustom && search.trim()) {
        handleAddCustom();
      }
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        {label && <span className="text-sm font-medium text-slate-300">{label}</span>}
        {selected.length > 0 && (
          <span className="text-xs text-indigo-400 font-medium">{selected.length} selected</span>
        )}
      </div>

      {/* Selected chips list */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 p-2 rounded-lg bg-white/[0.03] border border-indigo-500/20">
          {selected.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1.5 rounded-full border border-indigo-400/40 bg-indigo-500/20 px-2.5 py-1 text-xs font-medium text-indigo-200 shadow-[0_0_10px_-2px_rgba(99,102,241,0.5)]"
            >
              {item}
              <button
                type="button"
                onClick={() => toggle(item)}
                className="hover:bg-indigo-500/40 rounded-full p-0.5 text-indigo-300 hover:text-white transition-colors"
                title={`Remove ${item}`}
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search & Custom Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 rounded-lg border border-slate-600/60 bg-white/5 px-3 py-1.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-indigo-400 transition-colors"
        />
        {allowCustom && search.trim() && (
          <button
            type="button"
            onClick={handleAddCustom}
            className="rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 text-xs font-semibold shadow-[0_0_12px_-2px_rgba(99,102,241,0.6)] transition-colors whitespace-nowrap"
          >
            + Add &quot;{search.trim()}&quot;
          </button>
        )}
      </div>

      {/* Options Cloud */}
      <div className="flex max-h-40 flex-wrap gap-1.5 overflow-y-auto rounded-lg border border-slate-600/60 bg-white/5 p-2.5">
        {filteredOptions.length === 0 ? (
          <div className="w-full py-2 text-center text-xs text-slate-500">
            {allowCustom ? (
              <span>
                No match found. Click <strong>+ Add &quot;{search.trim()}&quot;</strong> above to create it.
              </span>
            ) : (
              "No options match your search."
            )}
          </div>
        ) : (
          filteredOptions.map((opt) => {
            const active = selected.includes(opt);
            return (
              <button
                type="button"
                key={opt}
                onClick={() => toggle(opt)}
                className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-all ${
                  active
                    ? "border-indigo-400 bg-indigo-500 text-white shadow-[0_0_12px_-2px_rgba(99,102,241,0.8)]"
                    : "border-slate-600/60 bg-white/5 text-slate-300 hover:border-indigo-400/50 hover:bg-white/10"
                }`}
              >
                {active ? `✓ ${opt}` : opt}
              </button>
            );
          })
        )}
      </div>

      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}
