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
  primary: cn(
    "bg-[#4B83F5] text-white font-semibold",
    "border border-[#4B83F5]",
    "hover:bg-[#5B93F7]",
    "active:scale-[0.97] transition-all duration-150",
    "disabled:opacity-40 disabled:cursor-not-allowed",
  ),
  secondary: cn(
    "bg-[#FAFAFF] text-[#374151] font-medium border border-[#DADDD8]",
    "hover:bg-[#F9FAFB] hover:border-[#D1D5DB]",
    "dark:bg-white/[0.04] dark:text-white/70 dark:border-white/[0.09]",
    "dark:hover:bg-white/[0.07] dark:hover:text-white/90 dark:hover:border-white/[0.16]",
    "active:scale-[0.97] transition-all duration-150",
    "disabled:opacity-40 disabled:cursor-not-allowed",
  ),
  ghost: cn(
    "bg-transparent text-[#374151] font-medium border border-[#DADDD8]",
    "hover:bg-[#F3F4F6]",
    "dark:text-white/70 dark:border-white/[0.09]",
    "dark:hover:bg-white/[0.06] dark:hover:text-white/90",
    "active:scale-[0.97] transition-all duration-150",
    "disabled:opacity-40 disabled:cursor-not-allowed",
  ),
  danger: cn(
    "bg-red-50 text-red-600 font-medium border border-red-200",
    "hover:bg-red-100 hover:border-red-300",
    "dark:bg-[#F06C6C]/[0.08] dark:text-[#F87171] dark:border-[#F06C6C]/[0.20]",
    "dark:hover:bg-[#F06C6C]/[0.14] dark:hover:border-[#F06C6C]/[0.35]",
    "active:scale-[0.97] transition-all duration-150",
  ),
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
