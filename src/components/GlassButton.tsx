import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface GlassButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "px-3.5 py-1.5 text-[13px]",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3 text-[15px]",
};

const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, variant = "secondary", size = "md", children, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 disabled:pointer-events-none disabled:opacity-40 active:scale-[0.97]";

    const variants = {
      primary: cn(
        "bg-brand text-white font-semibold",
        "shadow-[0_0_20px_rgba(124,111,255,0.3)]",
        "hover:bg-brand-light hover:shadow-[0_0_30px_rgba(124,111,255,0.5)]",
        "border border-brand/40",
      ),
      secondary: cn(
        "border border-white/[0.10] bg-white/[0.06] text-warm-700",
        "shadow-card hover:-translate-y-0.5 hover:shadow-card-hover",
        "hover:bg-white/[0.10] hover:text-warm-800",
      ),
      ghost: cn(
        "bg-white/[0.04] text-warm-600 border border-white/[0.08]",
        "hover:bg-white/[0.08] hover:text-warm-800 hover:border-white/[0.14]",
      ),
      danger: cn(
        "bg-danger/10 text-danger border border-danger/20",
        "hover:bg-danger/20 hover:border-danger/40",
      ),
    };

    return (
      <button
        ref={ref}
        className={cn(base, sizeClasses[size], variants[variant], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);
GlassButton.displayName = "GlassButton";

export { GlassButton };
export type { GlassButtonProps };
