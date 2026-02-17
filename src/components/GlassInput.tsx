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
          "glass-input flex h-12 w-full rounded-xl px-4 py-3 text-sm text-white/90",
          "placeholder:text-[#555]",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
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
