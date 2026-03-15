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
          "bg-white border-[#E5E5E5] shadow-card-light",
          "dark:bg-white/[0.03] dark:border-white/[0.07] dark:shadow-none",
          hoverable && [
            "transition-all duration-200 cursor-pointer",
            "hover:-translate-y-[2px]",
            "hover:shadow-card-light-hover",
            "dark:hover:border-white/[0.12] dark:hover:bg-white/[0.05] dark:hover:shadow-none",
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
