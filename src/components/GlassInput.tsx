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
          "flex h-12 w-full rounded-xl border border-warm-300 bg-white px-4 py-3 text-sm text-warm-800",
          "placeholder:text-warm-400",
          "transition-all hover:border-warm-400 focus:border-gold/40 focus:outline-none focus:ring-2 focus:ring-gold/10",
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
