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
          "rounded-[14px] border",
          "bg-white/[0.03] border-white/[0.07]",
          hoverable && [
            "transition-all duration-200 cursor-pointer",
            "hover:-translate-y-[2px]",
            "hover:border-white/[0.12]",
            "hover:bg-white/[0.05]",
          ],
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
