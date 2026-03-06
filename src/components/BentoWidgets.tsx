"use client";

import { motion, useSpring, useMotionValue, useTransform } from "framer-motion";
import { useEffect } from "react";
import { GlassPanel } from "@/components/GlassPanel";
import { TierBadge } from "@/components/TierBadge";
import { Flame, ArrowUpRight, GitBranch, FileText, MessageSquare } from "lucide-react";
import Link from "next/link";
import { formatTimeAgo } from "@/lib/formatters";
import { cn } from "@/lib/utils";

/* ─── Animated Number ─── */
function AnimatedNumber({ value }: { value: number }) {
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { stiffness: 40, damping: 15 });
  const display = useTransform(spring, (v) => Math.round(v));

  useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  return <motion.span>{display}</motion.span>;
}

/* ─── 1. Global Score Widget ─── */
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
      <p className="text-[12px] font-medium text-warm-400">Global Score</p>
      <div className="mt-2 font-body text-[4rem] font-bold leading-none tracking-tight text-warm-900">
        <AnimatedNumber value={avgScore} />
      </div>
      <div className="mt-3">
        <TierBadge tier={avgTier} size="lg" />
      </div>
    </GlassPanel>
  );
}

/* ─── 2. AI Feed Widget ─── */
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
        <MessageSquare className="h-4 w-4 text-warm-400" />
        <p className="text-[12px] font-medium text-warm-400">AI Insights</p>
      </div>
      <div className="flex flex-1 flex-col gap-3 overflow-hidden">
        {summaries.length === 0 ? (
          <p className="text-[12px] text-warm-400 py-4 text-center">
            Run analyses to see AI summaries
          </p>
        ) : (
          summaries.map((s) => (
            <Link key={s.id} href={`/results/${s.id}`}>
              <div className="rounded-xl bg-warm-100/60 p-3 transition-colors hover:bg-warm-100">
                <p className="text-[11px] font-semibold text-warm-600 mb-1">{s.title}</p>
                <p className="text-[11px] leading-relaxed text-warm-500 line-clamp-2">{s.summary}</p>
              </div>
            </Link>
          ))
        )}
      </div>
    </GlassPanel>
  );
}

/* ─── 3. Activity Heatmap Widget ─── */
export function BentoActivityHeatmap({
  activityByMonth,
  className,
}: {
  activityByMonth: { month: string; docsCount: number; reposCount: number }[];
  className?: string;
}) {
  const maxActivity = Math.max(
    ...activityByMonth.map((m) => m.docsCount + m.reposCount),
    1
  );
  const hasAnyActivity = activityByMonth.some((m) => m.docsCount + m.reposCount > 0);

  return (
    <GlassPanel hoverable className={cn("flex flex-col p-6", className)}>
      <p className="text-[12px] font-medium text-warm-400 mb-4">Activity</p>
      {!hasAnyActivity ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-[12px] text-warm-400 text-center">
            Run analyses to see your activity chart
          </p>
        </div>
      ) : (
        <div className="flex flex-1 items-end gap-2">
          {activityByMonth.map((m) => {
            const total = m.docsCount + m.reposCount;
            const height = Math.max(12, (total / maxActivity) * 100);
            return (
              <div key={m.month} className="flex flex-1 flex-col items-center gap-1.5">
                <div className="w-full flex flex-col items-stretch gap-[2px]" style={{ height: `${height}%` }}>
                  {m.reposCount > 0 && (
                    <div
                      className="rounded-t-sm bg-[#5BA8C8]"
                      style={{ flex: m.reposCount }}
                    />
                  )}
                  {m.docsCount > 0 && (
                    <div
                      className="rounded-b-sm bg-[#D4A017]"
                      style={{ flex: m.docsCount }}
                    />
                  )}
                  {total === 0 && (
                    <div className="h-full rounded-sm bg-warm-200/60" />
                  )}
                </div>
                <span className="text-[9px] text-warm-400">{m.month.slice(0, 3)}</span>
              </div>
            );
          })}
        </div>
      )}
      <div className="mt-3 flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-[#5BA8C8]" />
          <span className="text-[9px] text-warm-400">Repos</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-[#D4A017]" />
          <span className="text-[9px] text-warm-400">Docs</span>
        </div>
      </div>
    </GlassPanel>
  );
}

/* ─── 4. Carry Streak Widget ─── */
export function BentoCarryStreak({
  streak,
  className,
}: {
  streak: number;
  className?: string;
}) {
  const isHot = streak >= 5;
  return (
    <GlassPanel hoverable className={cn("flex flex-col items-center justify-center p-6", className)}>
      <Flame
        className={cn(
          "h-8 w-8 transition-colors",
          isHot ? "text-red-500" : "text-warm-300"
        )}
        fill={isHot ? "#ef4444" : "none"}
      />
      <div className="mt-2 font-body text-[2.5rem] font-bold leading-none text-warm-900">
        {streak}
      </div>
      <p className="mt-1 text-[11px] font-medium text-warm-400">
        project streak
      </p>
    </GlassPanel>
  );
}

/* ─── 5. Recent Projects Widget ─── */
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
      <p className="text-[12px] font-medium text-warm-400 mb-4">Recent Projects</p>
      <div className="flex flex-1 flex-col gap-2">
        {analyses.length === 0 ? (
          <p className="text-[12px] text-warm-400 py-4 text-center">No projects yet</p>
        ) : (
          analyses.map((a) => (
            <Link key={a._id} href={`/results/${a._id}`}>
              <div className="group flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-warm-100/50">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-warm-100">
                  {a.sourceType === "github_repo" ? (
                    <GitBranch className="h-3.5 w-3.5 text-warm-500" />
                  ) : (
                    <FileText className="h-3.5 w-3.5 text-warm-500" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-semibold text-warm-700">{a.title}</p>
                  <p className="text-[10px] text-warm-400">{formatTimeAgo(a.createdAt)}</p>
                </div>
                <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-warm-300 transition-colors group-hover:text-warm-500" />
              </div>
            </Link>
          ))
        )}
      </div>
    </GlassPanel>
  );
}
