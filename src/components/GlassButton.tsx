import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface GlassButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
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
      "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne/40 focus-visible:ring-offset-2 focus-visible:ring-offset-root disabled:pointer-events-none disabled:opacity-40";

    const variants = {
      primary: cn(
        "bg-gradient-to-b from-champagne to-champagne-dark text-ink",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_2px_12px_rgba(216,185,137,0.25)]",
        "hover:from-champagne-light hover:to-champagne hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_4px_20px_rgba(216,185,137,0.35)]",
        "active:shadow-[inset_0_2px_6px_rgba(0,0,0,0.25)]"
      ),
      secondary: cn(
        "glass-surface text-white/90",
        "hover:translate-y-[-2px] hover:border-white/25",
        "active:translate-y-0 active:shadow-[inset_0_2px_6px_rgba(0,0,0,0.45)]"
      ),
      ghost: cn(
        "border border-white/12 bg-transparent text-white/70",
        "hover:bg-white/[0.06] hover:text-white/90 hover:border-white/20",
        "active:bg-white/[0.03]"
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
