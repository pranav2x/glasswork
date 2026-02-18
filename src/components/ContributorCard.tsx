"use client";

import { motion, useSpring, useMotionValue, useTransform } from "framer-motion";
import { useEffect } from "react";
import { GlassPanel } from "@/components/GlassPanel";
import { LiquidHeatmap } from "@/components/LiquidHeatmap";
import { Badge } from "@/components/ui/badge";
import type { Contributor, DocStats, RepoStats } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ContributorCardProps {
  contributor: Contributor;
  index: number;
}

const tierConfig = {
  carry: { label: "THE CARRY", color: "text-carry", bg: "bg-carry/10 border-carry/20", accent: "bg-carry/15" },
  solid: { label: "SOLID", color: "text-solid", bg: "bg-solid/10 border-solid/20", accent: "bg-solid/15" },
  ghost: { label: "GHOST", color: "text-ghost", bg: "bg-ghost/10 border-ghost/20", accent: "bg-ghost/15" },
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function isDocStats(stats: DocStats | RepoStats): stats is DocStats {
  return "revisions" in stats;
}

function AnimatedScore({ value, tier }: { value: number; tier: string }) {
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { stiffness: 60, damping: 20 });
  const display = useTransform(spring, (v) => Math.round(v));

  useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  return (
    <motion.span className={cn(
      "font-display text-4xl font-semibold tracking-display",
      tier === "ghost" && "animate-glitch"
    )}>
      {display}
    </motion.span>
  );
}

export function ContributorCard({ contributor, index }: ContributorCardProps) {
  const { name, email, handle, source, stats, fairShareScore, tier, heatmapData } =
    contributor;
  const tierInfo = tierConfig[tier];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.08,
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <GlassPanel hoverable className="flex flex-col gap-5 p-6">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold",
              source === "doc"
                ? "bg-brand/[0.12] text-brand"
                : "bg-repo-accent/[0.12] text-repo-accent"
            )}
          >
            {getInitials(name)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[15px] font-medium text-warm-800">
              {name}
            </p>
            <p className="truncate text-[12px] text-warm-400">
              {email || handle || ""}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {isDocStats(stats) ? (
            <>
              <Badge
                variant="outline"
                className="border-docs-accent/20 bg-docs-accent/[0.06] text-[11px] text-docs-accent"
              >
                {stats.revisions} revisions
              </Badge>
              {stats.charsAdded !== undefined && stats.charsAdded > 0 && (
                <Badge
                  variant="outline"
                  className="border-docs-accent/20 bg-docs-accent/[0.06] text-[11px] text-docs-accent"
                >
                  +{stats.charsAdded.toLocaleString()} chars
                </Badge>
              )}
              {stats.wordsAdded > 0 && (
                <Badge
                  variant="outline"
                  className="border-docs-accent/20 bg-docs-accent/[0.06] text-[11px] text-docs-accent"
                >
                  ~{stats.wordsAdded.toLocaleString()} words
                </Badge>
              )}
            </>
          ) : (
            <>
              <Badge
                variant="outline"
                className="border-repo-accent/20 bg-repo-accent/[0.06] text-[11px] text-repo-accent"
              >
                {stats.commits} commits
              </Badge>
              <Badge
                variant="outline"
                className="border-repo-accent/20 bg-repo-accent/[0.06] text-[11px] text-repo-accent"
              >
                +{stats.linesAdded.toLocaleString()}
              </Badge>
              <Badge
                variant="outline"
                className="border-repo-accent/20 bg-repo-accent/[0.06] text-[11px] text-repo-accent"
              >
                &minus;{stats.linesDeleted.toLocaleString()}
              </Badge>
            </>
          )}
        </div>

        <div className="flex items-end justify-between">
          <div>
            <div className="text-warm-800">
              <AnimatedScore value={fairShareScore} tier={tier} />
            </div>
            <p className={cn("mt-1.5 text-[11px] font-bold uppercase tracking-micro", tierInfo.color)}>
              {tierInfo.label}
            </p>
          </div>
          <LiquidHeatmap mode={source} data={heatmapData} />
        </div>
      </GlassPanel>
    </motion.div>
  );
}
