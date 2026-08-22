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
      {label && <span className="text-sm font-medium text-slate-700">{label}</span>}
      <div className="flex flex-wrap gap-1.5 rounded-lg border border-slate-300 p-2 max-h-40 overflow-y-auto">
        {options.map((opt) => {
          const active = selected.includes(opt);
          return (
            <button
              type="button"
              key={opt}
              onClick={() => toggle(opt)}
              className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                active
                  ? "border-indigo-600 bg-indigo-600 text-white"
                  : "border-slate-300 bg-white text-slate-600 hover:border-indigo-300"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
