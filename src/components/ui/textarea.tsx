"use client";

import { TextareaHTMLAttributes, forwardRef } from "react";

interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, Props>(({ label, error, className = "", id, ...rest }, ref) => {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-slate-300">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={id}
        className={`rounded-lg border bg-white/5 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30 ${
          error ? "border-red-400" : "border-slate-600/60"
        } ${className}`}
        {...rest}
      />
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
});
Textarea.displayName = "Textarea";
export default Textarea;
