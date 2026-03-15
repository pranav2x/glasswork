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

const variants = {
  primary: [
    "bg-[#6D63D4] text-white font-semibold",
    "border border-[#6D63D4]",
    "hover:bg-[#7B72E0]",
    "active:scale-[0.97]",
    "transition-all duration-150",
    "disabled:opacity-40 disabled:cursor-not-allowed",
  ].join(" "),

  secondary: [
    "bg-white/[0.04] text-white/70 font-medium",
    "border border-white/[0.09]",
    "hover:bg-white/[0.07] hover:text-white/90 hover:border-white/[0.16]",
    "active:scale-[0.97]",
    "transition-all duration-150",
    "disabled:opacity-40 disabled:cursor-not-allowed",
  ].join(" "),

  ghost: [
    "bg-white/[0.04] text-white/70 font-medium",
    "border border-white/[0.09]",
    "hover:bg-white/[0.07] hover:text-white/90 hover:border-white/[0.16]",
    "active:scale-[0.97]",
    "transition-all duration-150",
    "disabled:opacity-40 disabled:cursor-not-allowed",
  ].join(" "),

  danger: [
    "bg-[#F06C6C]/[0.08] text-[#F87171] font-medium",
    "border border-[#F06C6C]/[0.20]",
    "hover:bg-[#F06C6C]/[0.14] hover:border-[#F06C6C]/[0.35]",
    "active:scale-[0.97]",
    "transition-all duration-150",
  ].join(" "),
};

const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, variant = "secondary", size = "md", children, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center gap-2 rounded-xl font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 disabled:pointer-events-none";

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
