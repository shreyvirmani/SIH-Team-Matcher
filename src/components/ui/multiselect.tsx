"use client";

export default function MultiSelect({
  label,
  options,
  selected,
  onChange,
  error,
}: {
  label?: string;
  options: string[];
  selected: string[];
  onChange: (values: string[]) => void;
  error?: string;
}) {
  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      {label && <span className="text-sm font-medium text-slate-300">{label}</span>}
      <div className="flex max-h-40 flex-wrap gap-1.5 overflow-y-auto rounded-lg border border-slate-600/60 bg-white/5 p-2">
        {options.map((opt) => {
          const active = selected.includes(opt);
          return (
            <button
              type="button"
              key={opt}
              onClick={() => toggle(opt)}
              className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                active
                  ? "border-indigo-400 bg-indigo-500 text-white shadow-[0_0_12px_-2px_rgba(99,102,241,0.8)]"
                  : "border-slate-600/60 bg-white/5 text-slate-300 hover:border-indigo-400/50"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}
