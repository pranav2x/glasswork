import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

const GlassPanel = forwardRef<HTMLDivElement, GlassPanelProps>(
  ({ className, hoverable = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "glass-surface",
          hoverable && "glass-surface-hover",
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
