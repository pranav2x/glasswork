import { cn } from "@/lib/utils";
import type { ContributorTier } from "@/lib/types";

interface TierBadgeProps {
  tier: ContributorTier;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const TIER_CONFIG = {
  carry: {
    label: "LOCKED IN",
    dotColor: "#8B7CF6",
    bg: "rgba(139, 124, 246, 0.10)",
    border: "rgba(139, 124, 246, 0.22)",
    text: "#A89FFF",
  },
  solid: {
    label: "MID",
    dotColor: "#34C68C",
    bg: "rgba(52, 198, 140, 0.08)",
    border: "rgba(52, 198, 140, 0.20)",
    text: "#4ECCA3",
  },
  ghost: {
    label: "SELLING",
    dotColor: "#F06C6C",
    bg: "rgba(240, 108, 108, 0.08)",
    border: "rgba(240, 108, 108, 0.20)",
    text: "#F87171",
  },
} as const;

const SIZE_CLASSES = {
  sm:  "text-[9px]  px-1.5 py-[3px] gap-[5px]  tracking-[0.07em]",
  md:  "text-[10px] px-2   py-[4px] gap-[6px]  tracking-[0.08em]",
  lg:  "text-[11px] px-2.5 py-[5px] gap-[7px]  tracking-[0.09em]",
} as const;

const DOT_SIZES = {
  sm: "h-[5px] w-[5px]",
  md: "h-[6px] w-[6px]",
  lg: "h-[7px] w-[7px]",
} as const;

export function TierBadge({ tier, size = "md", className }: TierBadgeProps) {
  const config = TIER_CONFIG[tier];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-semibold uppercase",
        SIZE_CLASSES[size],
        className
      )}
      style={{
        backgroundColor: config.bg,
        border: `1px solid ${config.border}`,
        color: config.text,
      }}
    >
      <span
        className={cn("shrink-0 rounded-full", DOT_SIZES[size])}
        style={{ backgroundColor: config.dotColor }}
      />
      <span>{config.label}</span>
    </span>
  );
}

export { TIER_CONFIG };
