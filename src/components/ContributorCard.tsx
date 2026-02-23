"use client";

import Image from "next/image";
import { motion, useSpring, useMotionValue, useTransform } from "framer-motion";
import { useEffect, useState } from "react";
import { LiquidHeatmap } from "@/components/LiquidHeatmap";
import { Badge } from "@/components/ui/badge";
import type { Contributor, DocStats, RepoStats } from "@/lib/types";
import { getInitials } from "@/lib/formatters";
import { cn } from "@/lib/utils";

interface ContributorCardProps {
  contributor: Contributor;
  index: number;
  maxScore?: number;
}

const tierConfig = {
  carry: {
    label: "LOCKED IN",
    color: "text-warm-900",
    bg: "bg-warm-900 border-warm-900 text-white",
    accent: "bg-warm-100",
  },
  solid: {
    label: "MID",
    color: "text-warm-600",
    bg: "bg-warm-200 border-warm-200 text-warm-800",
    accent: "bg-warm-100",
  },
  ghost: {
    label: "SELLING",
    color: "text-warm-400",
    bg: "bg-warm-100 border-warm-100 text-warm-500",
    accent: "bg-warm-50",
  },
};

function isDocStats(stats: DocStats | RepoStats): stats is DocStats {
  return "revisions" in stats;
}

function AnimatedScore({ value, tier }: { value: number; tier: string }) {
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { stiffness: 40, damping: 15 });
  const display = useTransform(spring, (v) => Math.round(v));

  useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  return (
    <motion.span className={cn(
      "font-display text-5xl font-normal tracking-display text-warm-900",
      tier === "ghost" && "animate-glitch"
    )}>
      {display}
    </motion.span>
  );
}

export function ContributorCard({ contributor, index, maxScore }: ContributorCardProps) {
  const { name, avatarUrl, email, handle, source, stats, fairShareScore, tier, heatmapData } =
    contributor;
  const tierInfo = tierConfig[tier];
  const [showGlow, setShowGlow] = useState(false);

  // Trigger golden glow for LOCKED IN tier after card mounts
  useEffect(() => {
    if (tier === "carry") {
      const timer = setTimeout(() => setShowGlow(true), (index * 150) + 1800);
      return () => clearTimeout(timer);
    }
  }, [tier, index]);

  return (
    <motion.div
      className="h-full"
      initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{
        delay: index * 0.15,
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <div className={cn(
        "group flex h-full flex-col gap-5 rounded-2xl border border-warm-200 bg-white p-6 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover",
        showGlow && "animate-golden-glow"
      )}>
        {/* Avatar + Name */}
        <div className="flex items-center gap-3">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={name}
              width={44}
              height={44}
              className="h-11 w-11 shrink-0 rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[13px] font-bold",
                "bg-warm-100 text-warm-700"
              )}
            >
              {getInitials(name)}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold text-warm-900">
              {name}
            </p>
            <p className="truncate text-[12px] text-warm-500">
              {email || handle || ""}
            </p>
          </div>
        </div>

        {/* Stat badges */}
        <div className="flex flex-wrap gap-2">
          {isDocStats(stats) ? (
            <>
              <Badge
                variant="outline"
                className="border-brand/20 bg-brand-light text-[11px] font-medium text-brand"
              >
                {stats.revisions} revisions
              </Badge>
              {stats.charsAdded !== undefined && stats.charsAdded > 0 && (
                <Badge
                  variant="outline"
                  className="border-brand/20 bg-brand-light text-[11px] font-medium text-brand"
                >
                  +{stats.charsAdded.toLocaleString()} chars
                </Badge>
              )}
              {stats.wordsAdded > 0 && (
                <Badge
                  variant="outline"
                  className="border-brand/20 bg-brand-light text-[11px] font-medium text-brand"
                >
                  ~{stats.wordsAdded.toLocaleString()} words
                </Badge>
              )}
            </>
          ) : (
            <>
              <Badge
                variant="outline"
                className="border-repo-accent/20 bg-emerald-50 text-[11px] font-medium text-repo-accent"
              >
                {stats.commits} commits
              </Badge>
              <Badge
                variant="outline"
                className="border-repo-accent/20 bg-emerald-50 text-[11px] font-medium text-repo-accent"
              >
                +{stats.linesAdded.toLocaleString()}
              </Badge>
              <Badge
                variant="outline"
                className="border-repo-accent/20 bg-emerald-50 text-[11px] font-medium text-repo-accent"
              >
                &minus;{stats.linesDeleted.toLocaleString()}
              </Badge>
            </>
          )}
        </div>

        {/* Score + Tier + Heatmap */}
        <div className="mt-auto flex items-end justify-between">
          <div>
            <AnimatedScore value={fairShareScore} tier={tier} />
            <motion.div
              className="mt-2"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: (index * 0.15) + 1.2,
                type: "spring",
                stiffness: 300,
                damping: 15,
              }}
            >
              <span className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-micro",
                tierInfo.bg
              )}>
                {tierInfo.label}
              </span>
            </motion.div>
          </div>
          <LiquidHeatmap mode={source} data={heatmapData} />
        </div>

        {/* Score Progress Bar */}
        <div className="h-1.5 overflow-hidden rounded-full bg-warm-100">
          <motion.div
            className="h-full rounded-full bg-warm-800"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, (fairShareScore / (maxScore ?? Math.max(fairShareScore, 100))) * 100)}%` }}
            transition={{ delay: (index * 0.15) + 0.8, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </div>
    </motion.div>
  );
}
