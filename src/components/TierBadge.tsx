import { cn } from "@/lib/utils";

interface TierBadgeProps {
  tier: "carry" | "solid" | "ghost";
  size?: "sm" | "md" | "lg";
  animated?: boolean;
  className?: string;
}

const TIER_CONFIG = {
  carry: {
    label: "LOCKED IN",
    bg: "bg-[#404040]/10",
    border: "border-[#404040]/30",
    text: "text-[#404040]",
    glow: "animate-pulse-glow",
  },
  solid: {
    label: "MID",
    bg: "bg-[#5BA8C8]/10",
    border: "border-[#5BA8C8]/30",
    text: "text-[#5BA8C8]",
    glow: "",
  },
  ghost: {
    label: "SELLING",
    bg: "bg-warm-100",
    border: "border-warm-200",
    text: "text-warm-400",
    glow: "",
  },
} as const;

const SIZE_CLASSES = {
  sm: "px-2 py-0.5 text-[9px]",
  md: "px-2.5 py-0.5 text-[10px]",
  lg: "px-3 py-1 text-[11px]",
} as const;

export function TierBadge({ tier, size = "md", animated = true, className }: TierBadgeProps) {
  const config = TIER_CONFIG[tier];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-bold uppercase tracking-[0.12em]",
        config.bg,
        config.border,
        config.text,
        animated && config.glow,
        SIZE_CLASSES[size],
        className
      )}
    >
      {config.label}
    </span>
  );
}

export { TIER_CONFIG };
