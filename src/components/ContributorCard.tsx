"use client";

import { motion } from "framer-motion";
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
  carry: { label: "THE CARRY", className: "tier-carry" },
  solid: { label: "SOLID", className: "tier-solid" },
  ghost: { label: "GHOST", className: "tier-ghost" },
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
        {/* ── Header: Avatar + name ── */}
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold",
              source === "doc"
                ? "border border-docs-accent/30 bg-docs-accent/10 text-docs-accent"
                : "border border-repo-accent/30 bg-repo-accent/10 text-repo-accent"
            )}
          >
            {getInitials(name)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[15px] font-medium text-white/90">
              {name}
            </p>
            <p className="truncate text-[12px] text-white/35">
              {email || handle || ""}
            </p>
          </div>
        </div>

        {/* ── Stats pills ── */}
        <div className="flex flex-wrap gap-2">
          {isDocStats(stats) ? (
            <Badge
              variant="outline"
              className="border-docs-accent/20 bg-docs-accent/[0.06] text-[11px] text-docs-accent/80"
            >
              {stats.revisions} revisions
            </Badge>
          ) : (
            <>
              <Badge
                variant="outline"
                className="border-repo-accent/20 bg-repo-accent/[0.06] text-[11px] text-repo-accent/80"
              >
                {stats.commits} commits
              </Badge>
              <Badge
                variant="outline"
                className="border-repo-accent/20 bg-repo-accent/[0.06] text-[11px] text-repo-accent/80"
              >
                +{stats.linesAdded.toLocaleString()}
              </Badge>
              <Badge
                variant="outline"
                className="border-repo-accent/20 bg-repo-accent/[0.06] text-[11px] text-repo-accent/80"
              >
                &minus;{stats.linesDeleted.toLocaleString()}
              </Badge>
            </>
          )}
        </div>

        {/* ── Fair Share Score ── */}
        <div className="flex items-end justify-between">
          <div>
            <p className="font-display text-4xl font-semibold tracking-display text-white/90">
              {fairShareScore}
            </p>
            <p
              className={cn(
                "mt-1 text-[10px] font-semibold uppercase tracking-micro",
                tierInfo.className
              )}
            >
              {tierInfo.label}
            </p>
          </div>

          {/* ── Heatmap ── */}
          <LiquidHeatmap mode={source} data={heatmapData} />
        </div>
      </GlassPanel>
    </motion.div>
  );
}
