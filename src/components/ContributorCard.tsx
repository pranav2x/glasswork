"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { LiquidHeatmap } from "@/components/LiquidHeatmap";
import { TierBadge, TIER_CONFIG } from "@/components/TierBadge";
import { Badge } from "@/components/ui/badge";
import type { Contributor, DocStats, RepoStats } from "@/lib/types";
import { getInitials } from "@/lib/formatters";
import { cn } from "@/lib/utils";

interface ContributorCardProps {
  contributor: Contributor;
  index: number;
  maxScore?: number;
  revealDelay?: number;
}

function isDocStats(stats: DocStats | RepoStats): stats is DocStats {
  return "revisions" in stats;
}

function AnimatedScore({ value, delay }: { value: number; delay: number }) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    const startTime = Date.now() + delay * 1000;
    let frame: number;

    const tick = () => {
      const now = Date.now();
      const elapsed = Math.max(0, now - startTime);
      const duration = 800;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(eased * value));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, delay]);

  return <span>{displayed}</span>;
}

function StatsRow({ contributor }: { contributor: Contributor }) {
  const { stats } = contributor;
  if (isDocStats(stats)) {
    return (
      <div className="flex flex-wrap gap-1.5">
        <Badge
          variant="outline"
          className="border-brand/20 bg-brand/10 text-[10px] font-medium text-brand-light"
        >
          {stats.revisions} revisions
        </Badge>
        {stats.charsAdded !== undefined && stats.charsAdded > 0 && (
          <Badge
            variant="outline"
            className="border-brand/20 bg-brand/10 text-[10px] font-medium text-brand-light"
          >
            +{stats.charsAdded.toLocaleString()} chars
          </Badge>
        )}
        {stats.wordsAdded > 0 && (
          <Badge
            variant="outline"
            className="border-brand/20 bg-brand/10 text-[10px] font-medium text-brand-light"
          >
            ~{stats.wordsAdded.toLocaleString()} words
          </Badge>
        )}
      </div>
    );
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      <Badge
        variant="outline"
        className="border-repo-accent/20 bg-repo-accent/10 text-[10px] font-medium text-repo-accent"
      >
        {stats.commits} commits
      </Badge>
      <Badge
        variant="outline"
        className="border-repo-accent/20 bg-repo-accent/10 text-[10px] font-medium text-repo-accent"
      >
        +{stats.linesAdded.toLocaleString()}
      </Badge>
      <Badge
        variant="outline"
        className="border-repo-accent/20 bg-repo-accent/10 text-[10px] font-medium text-repo-accent"
      >
        &minus;{stats.linesDeleted.toLocaleString()}
      </Badge>
    </div>
  );
}

export function ContributorCard({ contributor, index, maxScore, revealDelay }: ContributorCardProps) {
  const tierConfig = TIER_CONFIG[contributor.tier];
  const isCarry = contributor.tier === "carry";
  const isGhost = contributor.tier === "ghost";
  const baseDelay = revealDelay ?? index * 0.18;
  const pct = Math.round(
    (contributor.fairShareScore / Math.max(maxScore ?? contributor.fairShareScore, 1)) * 100
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: baseDelay, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative h-full"
    >
      {isCarry && (
        <div
          className="absolute -inset-px rounded-2xl opacity-60 blur-xl"
          style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(167,139,250,0.3) 0%, transparent 70%)" }}
        />
      )}

      <div
        className={cn(
          "relative h-full rounded-2xl overflow-hidden glass",
          "transition-all duration-300 hover:-translate-y-1 cursor-pointer",
          isCarry && "shadow-glass-carry",
          !isCarry && !isGhost && "shadow-glass-solid",
          isGhost && "shadow-glass-ghost",
        )}
      >
        {/* Top colored border strip */}
        <div
          className="h-[2px] w-full"
          style={{ backgroundColor: tierConfig.border as string }}
        />

        <div className="p-5">
          {/* Rank + Tier row */}
          <div className="flex items-start justify-between mb-4">
            <span className="text-[11px] font-bold text-warm-500 tracking-widest uppercase">
              #{index + 1}
            </span>
            <TierBadge tier={contributor.tier} size="md" />
          </div>

          {/* Avatar + Name */}
          <div className="flex items-center gap-3 mb-5">
            <div className="relative">
              {contributor.avatarUrl ? (
                <Image
                  src={contributor.avatarUrl}
                  alt={contributor.name}
                  width={44}
                  height={44}
                  className="rounded-full object-cover ring-2"
                  style={{ "--tw-ring-color": tierConfig.border } as React.CSSProperties}
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div
                  className="h-11 w-11 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{ background: tierConfig.bg, color: tierConfig.text }}
                >
                  {getInitials(contributor.name)}
                </div>
              )}
              {isCarry && (
                <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-carry flex items-center justify-center">
                  <span className="text-[8px]">⭐</span>
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[15px] font-bold text-warm-900 truncate">{contributor.name}</p>
              <p className="text-[11px] text-warm-500 truncate">
                {contributor.email || contributor.handle || "contributor"}
              </p>
            </div>
          </div>

          {/* BIG SCORE */}
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-[10px] font-semibold text-warm-500 uppercase tracking-[0.1em] mb-1">
                Fair Share Score
              </p>
              <p
                className={cn(
                  "text-[64px] font-black leading-none tabular-nums",
                  isCarry && "bg-gradient-to-br from-carry via-brand to-carry bg-clip-text text-transparent",
                  !isCarry && "text-warm-900"
                )}
              >
                <AnimatedScore value={contributor.fairShareScore} delay={baseDelay + 0.1} />
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-[11px] text-warm-500">{pct}% of top</span>
              <div className="w-16 h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: tierConfig.text }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ delay: baseDelay + 0.35, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </div>
          </div>

          {/* Stats row */}
          <StatsRow contributor={contributor} />

          {/* Heatmap */}
          {contributor.heatmapData && contributor.heatmapData.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/[0.06]">
              <p className="text-[10px] text-warm-500 uppercase tracking-[0.1em] font-semibold mb-2">Activity</p>
              <LiquidHeatmap data={contributor.heatmapData} color={tierConfig.text} />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
