"use client";

import { motion, useSpring, useMotionValue, useTransform } from "framer-motion";
import { useEffect } from "react";
import { GlassPanel } from "@/components/GlassPanel";
import { TierBadge } from "@/components/TierBadge";
import { ActivityChart } from "@/components/DashboardWidgets";
import { Flame, ArrowUpRight, GitBranch, FileText, MessageSquare } from "lucide-react";
import Link from "next/link";
import { formatTimeAgo } from "@/lib/formatters";
import { cn } from "@/lib/utils";

function AnimatedNumber({ value }: { value: number }) {
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { stiffness: 40, damping: 15 });
  const display = useTransform(spring, (v) => Math.round(v));

  useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  return <motion.span>{display}</motion.span>;
}

export function BentoGlobalScore({
  avgScore,
  avgTier,
  className,
}: {
  avgScore: number;
  avgTier: "carry" | "solid" | "ghost";
  className?: string;
}) {
  return (
    <GlassPanel hoverable className={cn("flex flex-col justify-center p-6", className)}>
      <p className="text-[10px] font-semibold text-[color:var(--app-text-muted)] uppercase tracking-[0.1em]">Global Score</p>
      <div className="mt-2 font-body text-[4rem] font-black leading-none tracking-tight text-[color:var(--app-text)] tabular-nums">
        <AnimatedNumber value={avgScore} />
      </div>
      <div className="mt-3">
        <TierBadge tier={avgTier} size="lg" />
      </div>
    </GlassPanel>
  );
}

export function BentoAIFeed({
  summaries,
  className,
}: {
  summaries: { title: string; summary: string; id: string }[];
  className?: string;
}) {
  return (
    <GlassPanel hoverable className={cn("flex flex-col p-6", className)}>
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="h-4 w-4 text-[color:var(--app-text-muted)]" strokeWidth={1.5} />
        <p className="text-[10px] font-semibold text-[color:var(--app-text-muted)] uppercase tracking-[0.1em]">AI Insights</p>
      </div>
      <div className="flex flex-1 flex-col gap-3 overflow-hidden">
        {summaries.length === 0 ? (
          <p className="text-[12px] text-[color:var(--app-text-muted)] py-4 text-center">
            Run analyses to see AI summaries
          </p>
        ) : (
          summaries.map((s) => (
            <Link key={s.id} href={`/results/${s.id}`}>
              <div className="rounded-xl bg-[var(--app-hover-bg)] border border-[var(--app-card-border)] p-3 transition-colors hover:bg-[var(--app-hover-bg)]">
                <p className="text-[11px] font-semibold text-[color:var(--app-text)] mb-1">{s.title}</p>
                <p className="text-[11px] leading-relaxed text-[color:var(--app-text-muted)] line-clamp-2">{s.summary}</p>
              </div>
            </Link>
          ))
        )}
      </div>
    </GlassPanel>
  );
}

export function BentoActivityHeatmap({
  activityByMonth,
  className,
}: {
  activityByMonth: { month: string; docsCount: number; reposCount: number }[];
  className?: string;
}) {
  const months = activityByMonth.map((m) => m.month.slice(0, 3));
  const docsData = activityByMonth.map((m) => m.docsCount);
  const reposData = activityByMonth.map((m) => m.reposCount);

  return (
    <GlassPanel hoverable className={cn("flex flex-col p-6", className)}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] mb-3" style={{ color: "rgba(255,255,255,0.40)" }}>Activity</p>
      <div className="flex-1 min-h-0">
        <ActivityChart months={months} docsData={docsData} reposData={reposData} />
      </div>
    </GlassPanel>
  );
}

export function BentoCarryStreak({
  streak,
  className,
}: {
  streak: number;
  className?: string;
}) {
  const isActive = streak > 0;
  return (
    <GlassPanel hoverable className={cn("flex flex-col items-center justify-center p-6", className)}>
      <Flame
        className={cn(
          "h-8 w-8 transition-colors",
          isActive ? "text-amber-400" : "text-warm-300"
        )}
        fill={isActive ? "#FBBF24" : "none"}
        strokeWidth={1.5}
      />
      <div className="mt-2 font-body text-[2.5rem] font-black leading-none text-[color:var(--app-text)] tabular-nums">
        {streak}
      </div>
      <p className="mt-1 text-[10px] font-semibold text-[color:var(--app-text-muted)] uppercase tracking-[0.1em]">
        project streak
      </p>
    </GlassPanel>
  );
}

export function BentoRecentProjects({
  analyses,
  className,
}: {
  analyses: {
    _id: string;
    title: string;
    sourceType: "google_doc" | "github_repo";
    createdAt: number;
    topContributor: { name: string; score: number; tier: "carry" | "solid" | "ghost" } | null;
  }[];
  className?: string;
}) {
  return (
    <GlassPanel hoverable className={cn("flex flex-col p-6", className)}>
      <p className="text-[10px] font-semibold text-[color:var(--app-text-muted)] uppercase tracking-[0.1em] mb-4">Recent Projects</p>
      <div className="flex flex-1 flex-col gap-2">
        {analyses.length === 0 ? (
          <p className="text-[12px] text-[color:var(--app-text-muted)] py-4 text-center">No projects yet</p>
        ) : (
          analyses.map((a) => (
            <Link key={a._id} href={`/results/${a._id}`}>
              <div className="group flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-[var(--app-hover-bg)]">
                <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", a.sourceType === "github_repo" ? "bg-repo-accent/10" : "bg-docs-accent/10")}>
                  {a.sourceType === "github_repo" ? (
                    <GitBranch className="h-3.5 w-3.5 text-repo-accent" strokeWidth={1.5} />
                  ) : (
                    <FileText className="h-3.5 w-3.5 text-docs-accent" strokeWidth={1.5} />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-semibold text-[color:var(--app-text)]">{a.title}</p>
                  <p className="text-[10px] text-[color:var(--app-text-muted)]">{formatTimeAgo(a.createdAt)}</p>
                </div>
                <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-[color:var(--app-text-faint)] transition-colors group-hover:text-[color:var(--app-text-muted)]" strokeWidth={1.5} />
              </div>
            </Link>
          ))
        )}
      </div>
    </GlassPanel>
  );
}
