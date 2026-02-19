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
          "flex h-12 w-full rounded-xl border border-warm-200 bg-white px-4 py-3 text-sm text-warm-900",
          "placeholder:text-warm-400",
          "transition-all duration-200 hover:border-warm-300 focus:border-brand/40 focus:outline-none focus:ring-2 focus:ring-brand/10",
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
