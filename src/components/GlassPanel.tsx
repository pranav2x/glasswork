import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  intensity?: "default" | "strong";
}

const GlassPanel = forwardRef<HTMLDivElement, GlassPanelProps>(
  ({ className, hoverable = false, intensity = "default", children, ...props }, ref) => {
    const base =
      intensity === "strong"
        ? "bg-white/[0.07] border-white/[0.12] backdrop-blur-[40px]"
        : "bg-white/[0.04] border-white/[0.08] backdrop-blur-[20px]";
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl border shadow-glass",
          base,
          hoverable &&
            "transition-all duration-300 hover:-translate-y-1 hover:shadow-glass-hover hover:border-white/[0.14] cursor-pointer",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
GlassPanel.displayName = "GlassPanel";

export { GlassPanel };
