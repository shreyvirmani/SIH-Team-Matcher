"use client";

import { SelectHTMLAttributes, forwardRef } from "react";

interface OptionItem {
  value: string | number;
  label: string;
}

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options?: OptionItem[];
}

const Select = forwardRef<HTMLSelectElement, Props>(
  ({ label, error, options, className = "", id, children, style, ...rest }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-slate-300">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={id}
          style={{ colorScheme: "dark", ...style }}
          className={`rounded-lg border bg-slate-900/90 px-3 py-2 text-sm text-slate-100 outline-none transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30 [&>option]:bg-slate-900 [&>option]:text-slate-100 ${
            error ? "border-red-400" : "border-slate-600/60"
          } ${className}`}
          {...rest}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        {error && <span className="text-xs text-red-400">{error}</span>}
      </div>
    );
  }
);

Select.displayName = "Select";
export default Select;
