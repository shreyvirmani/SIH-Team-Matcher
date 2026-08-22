import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-gradient-to-b from-indigo-500 to-indigo-600 text-white shadow-[0_1px_0_0_rgba(255,255,255,0.25)_inset,0_8px_20px_-6px_rgba(99,102,241,0.7)] hover:from-indigo-400 hover:to-indigo-500 active:translate-y-px disabled:from-indigo-800 disabled:to-indigo-800 disabled:shadow-none",
  secondary:
    "bg-gradient-to-b from-slate-700 to-slate-800 text-white shadow-[0_1px_0_0_rgba(255,255,255,0.1)_inset,0_8px_20px_-6px_rgba(15,23,42,0.7)] hover:from-slate-600 hover:to-slate-700 active:translate-y-px disabled:opacity-50",
  outline:
    "border border-slate-600/60 text-slate-200 bg-white/5 hover:bg-white/10 active:translate-y-px disabled:opacity-40",
  ghost: "text-slate-300 hover:bg-white/10 active:translate-y-px disabled:opacity-40",
  danger:
    "bg-gradient-to-b from-red-500 to-red-600 text-white shadow-[0_1px_0_0_rgba(255,255,255,0.25)_inset,0_8px_20px_-6px_rgba(239,68,68,0.7)] hover:from-red-400 hover:to-red-500 active:translate-y-px disabled:opacity-50",
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, Props>(
  ({ className = "", variant = "primary", loading, disabled, children, ...rest }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-150 disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
        {...rest}
      >
        {loading && (
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
export default Button;
