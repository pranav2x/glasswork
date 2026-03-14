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
    emoji: "🔒",
    bg: "rgba(167,139,250,0.15)",
    border: "rgba(167,139,250,0.35)",
    text: "#A78BFA",
    glow: "0 0 16px rgba(167,139,250,0.3)",
  },
  solid: {
    label: "MID",
    emoji: "📊",
    bg: "rgba(52,211,153,0.12)",
    border: "rgba(52,211,153,0.30)",
    text: "#34D399",
    glow: "0 0 12px rgba(52,211,153,0.2)",
  },
  ghost: {
    label: "SELLING",
    emoji: "💀",
    bg: "rgba(248,113,113,0.12)",
    border: "rgba(248,113,113,0.30)",
    text: "#F87171",
    glow: "0 0 12px rgba(248,113,113,0.2)",
  },
} as const;

const SIZE_CLASSES = {
  sm: "text-[10px] px-2 py-0.5 gap-1",
  md: "text-[11px] px-2.5 py-1 gap-1.5",
  lg: "text-[13px] px-3.5 py-1.5 gap-2 font-bold",
} as const;

export function TierBadge({ tier, size = "md", className }: TierBadgeProps) {
  const config = TIER_CONFIG[tier];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-semibold tracking-wide",
        SIZE_CLASSES[size],
        className
      )}
      style={{
        backgroundColor: config.bg,
        border: `1px solid ${config.border}`,
        color: config.text,
        boxShadow: config.glow,
      }}
    >
      <span>{config.emoji}</span>
      <span>{config.label}</span>
    </span>
  );
}

export { TIER_CONFIG };
