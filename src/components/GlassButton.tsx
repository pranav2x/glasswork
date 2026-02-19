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
      "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 disabled:pointer-events-none disabled:opacity-40";

    const variants = {
      primary:
        "bg-brand text-white shadow-layered hover:bg-brand-dark hover:shadow-layered-md hover:scale-[1.02] active:scale-[0.98]",
      secondary:
        "border border-warm-200 bg-white text-warm-700 shadow-card hover:-translate-y-0.5 hover:shadow-card-hover active:translate-y-0",
      ghost:
        "border border-warm-200 bg-transparent text-warm-600 hover:bg-warm-100 hover:text-warm-800 active:bg-warm-50",
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
