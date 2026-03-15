import { cn } from "@/lib/utils";
import type { ContributorTier } from "@/lib/types";

interface TierBadgeProps {
  tier: ContributorTier;
  size?: "sm" | "md" | "lg";
  className?: string;
  theme?: "light" | "dark" | "auto";
}

const TIER_LIGHT = {
  carry: {
    label: "LOCKED IN",
    dotColor: "#4B83F5",
    bg: "rgba(75, 131, 245, 0.08)",
    border: "rgba(75, 131, 245, 0.18)",
    text: "#4B83F5",
  },
  solid: {
    label: "MID",
    dotColor: "#16A34A",
    bg: "rgba(22, 163, 74, 0.08)",
    border: "rgba(22, 163, 74, 0.18)",
    text: "#16A34A",
  },
  ghost: {
    label: "SELLING",
    dotColor: "#DC2626",
    bg: "rgba(220, 38, 38, 0.07)",
    border: "rgba(220, 38, 38, 0.16)",
    text: "#DC2626",
  },
} as const;

const TIER_DARK = {
  carry: {
    label: "LOCKED IN",
    dotColor: "#6B9CF7",
    bg: "rgba(107, 156, 247, 0.10)",
    border: "rgba(107, 156, 247, 0.22)",
    text: "#6B9CF7",
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

const TIER_CONFIG = TIER_DARK;

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

export function TierBadge({ tier, size = "md", className, theme = "auto" }: TierBadgeProps) {
  if (theme === "light") {
    const config = TIER_LIGHT[tier];
    return (
      <span
        className={cn("inline-flex items-center rounded-full font-semibold uppercase", SIZE_CLASSES[size], className)}
        style={{ backgroundColor: config.bg, border: `1px solid ${config.border}`, color: config.text }}
      >
        <span className={cn("shrink-0 rounded-full", DOT_SIZES[size])} style={{ backgroundColor: config.dotColor }} />
        <span>{config.label}</span>
      </span>
    );
  }

  if (theme === "dark") {
    const config = TIER_DARK[tier];
    return (
      <span
        className={cn("inline-flex items-center rounded-full font-semibold uppercase", SIZE_CLASSES[size], className)}
        style={{ backgroundColor: config.bg, border: `1px solid ${config.border}`, color: config.text }}
      >
        <span className={cn("shrink-0 rounded-full", DOT_SIZES[size])} style={{ backgroundColor: config.dotColor }} />
        <span>{config.label}</span>
      </span>
    );
  }

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

export { TIER_CONFIG, TIER_LIGHT, TIER_DARK };
export type { TierBadgeProps };
