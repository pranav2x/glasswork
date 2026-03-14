import { cn } from "@/lib/utils";
import { forwardRef } from "react";

type GlassInputProps = React.InputHTMLAttributes<HTMLInputElement>;

const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "flex h-12 w-full rounded-xl border border-white/[0.10] bg-white/[0.04]",
          "backdrop-blur-lg px-4 py-3 text-sm text-warm-900",
          "placeholder:text-warm-500",
          "transition-all duration-200",
          "hover:border-white/[0.16] hover:bg-white/[0.06]",
          "focus:border-brand/50 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:bg-white/[0.06]",
          "disabled:cursor-not-allowed disabled:opacity-40",
          className
        )}
        {...props}
      />
    );
  }
);
GlassInput.displayName = "GlassInput";

export { GlassInput };
