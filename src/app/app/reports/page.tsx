"use client";

import { Suspense } from "react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { LiquidHeatmap } from "@/components/LiquidHeatmap";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Sparkles,
  TrendingUp,
  ArrowUpRight,
  FolderKanban,
  FileText,
  Github,
} from "lucide-react";

// ─── Insight computation ───────────────────────────────────────────────────

type RawStats = Record<string, number>;

const DOC_METRICS: { key: string; label: string }[] = [
  { key: "revisions", label: "Revision count" },
  { key: "charsAdded", label: "Characters added" },
  { key: "wordsAdded", label: "Words written" },
];

const REPO_METRICS: { key: string; label: string }[] = [
  { key: "commits", label: "Commit count" },
  { key: "additions", label: "Lines added" },
  { key: "deletions", label: "Lines changed" },
];

function computeInsights(
  contributor: { rawStats: RawStats; heatmapData: number[]; score: number },
  teamStats: RawStats,
  isDoc: boolean
): { strengths: string[]; improvements: string[]; pattern: string } {
  const metrics = isDoc ? DOC_METRICS : REPO_METRICS;
  const strengths: string[] = [];
  const improvements: string[] = [];

  for (const { key, label } of metrics) {
    const val = contributor.rawStats[key] ?? 0;
    const avg = teamStats[key] ?? 0;
    if (avg === 0) continue;
    if (val >= avg * 0.9) {
      strengths.push(label);
    } else if (val < avg * 0.5) {
      const ratio = Math.round((val / avg) * 100);
      improvements.push(`${label} (${ratio}% of team avg)`);
    }
  }

  // Activity pattern from heatmap
  const data = contributor.heatmapData;
  const mid = Math.floor(data.length / 2);
  const firstHalf = data.slice(0, mid).reduce((s, v) => s + v, 0) / mid;
  const secondHalf = data.slice(mid).reduce((s, v) => s + v, 0) / (data.length - mid);
  const overall = data.reduce((s, v) => s + v, 0) / data.length;

  let pattern = "Steady pace";
  if (overall < 0.1) {
    pattern = "Minimal activity";
  } else if (secondHalf / (firstHalf || 0.001) > 1.6) {
    pattern = "Late sprint";
  } else if (firstHalf / (secondHalf || 0.001) > 1.6) {
    pattern = "Front-loaded";
  } else {
    const max = Math.max(...data);
    const min = Math.min(...data);
    if (max - min > 0.5) pattern = "Variable bursts";
    else pattern = "Steady pace";
  }

  return { strengths, improvements, pattern };
}

function computeTeamAvg(
  contributors: Array<{ rawStats: RawStats }>,
  isDoc: boolean
): RawStats {
  const metrics = isDoc ? DOC_METRICS : REPO_METRICS;
  const avgs: RawStats = {};
  for (const { key } of metrics) {
    const sum = contributors.reduce((s, c) => s + (c.rawStats[key] ?? 0), 0);
    avgs[key] = contributors.length > 0 ? sum / contributors.length : 0;
  }
  return avgs;
}

// ─── Tier config ───────────────────────────────────────────────────────────

const tierConfig = {
  carry: { label: "LOCKED IN", bg: "bg-[#D4A017] text-white border-[#D4A017]" },
  solid: { bg: "bg-[#5BA8C8]/20 text-[#5BA8C8] border-[#5BA8C8]/30", label: "MID" },
  ghost: { bg: "bg-warm-100 text-warm-400 border-warm-200", label: "SELLING" },
};

// ─── Contributor Report Row ────────────────────────────────────────────────

function ContributorReportRow({
  contributor,
  teamAvg,
  isDoc,
  rank,
  avgScore,
}: {
  contributor: {
    _id: string;
    name: string;
    emailOrHandle?: string;
    avatarUrl?: string;
    score: number;
    tier: "carry" | "solid" | "ghost";
    rawStats: RawStats;
    heatmapData: number[];
  };
  teamAvg: RawStats;
  isDoc: boolean;
  rank: number;
  avgScore: number;
}) {
  const { strengths, improvements, pattern } = computeInsights(contributor, teamAvg, isDoc);
  const tc = tierConfig[contributor.tier];
  const scoreDelta = contributor.score - avgScore;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border border-white/50 bg-white/55 p-5 shadow-card backdrop-blur-xl"
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:gap-6">
        {/* Left: Identity + Score */}
        <div className="flex min-w-0 flex-col gap-3 sm:w-[200px] sm:shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              {contributor.avatarUrl ? (
                <Image
                  src={contributor.avatarUrl}
                  alt={contributor.name}
                  width={44}
                  height={44}
                  className="h-11 w-11 shrink-0 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-warm-100 text-[13px] font-bold text-warm-700">
                  {getInitials(contributor.name)}
                </div>
              )}
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-warm-200 text-[10px] font-bold text-warm-700">
                {rank + 1}
              </span>
            </div>
            <div className="min-w-0">
              <p className="truncate text-[14px] font-semibold text-warm-900">{contributor.name}</p>
              {contributor.emailOrHandle && (
                <p className="truncate text-[11px] text-warm-400">{contributor.emailOrHandle}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-display text-3xl font-normal text-warm-900">{contributor.score}</span>
            <div className="flex flex-col">
              <span
                className={cn(
                  "inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                  tc.bg
                )}
              >
                {tc.label}
              </span>
              <span
                className={cn(
                  "mt-1 text-[11px] font-medium",
                  scoreDelta >= 0 ? "text-emerald-600" : "text-red-400"
                )}
              >
                {scoreDelta >= 0 ? "+" : ""}
                {scoreDelta} vs avg
              </span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden w-px bg-warm-100 sm:block" />

        {/* Middle: Strengths + Improvements */}
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          {strengths.length > 0 && (
            <div>
              <div className="mb-1.5 flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                  Strengths
                </span>
              </div>
              <ul className="space-y-1">
                {strengths.map((s) => (
                  <li key={s} className="flex items-center gap-2 text-[13px] text-warm-700">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {improvements.length > 0 && (
            <div>
              <div className="mb-1.5 flex items-center gap-1.5">
                <ArrowUpRight className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
                  Can improve
                </span>
              </div>
              <ul className="space-y-1">
                {improvements.map((s) => (
                  <li key={s} className="flex items-center gap-2 text-[13px] text-warm-500">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {strengths.length === 0 && improvements.length === 0 && (
            <p className="text-[13px] italic text-warm-400">
              Performance is close to the team average across all metrics.
            </p>
          )}
        </div>

        {/* Divider */}
        <div className="hidden w-px bg-warm-100 sm:block" />

        {/* Right: Activity */}
        <div className="flex shrink-0 flex-col items-end gap-3 sm:w-[120px]">
          <LiquidHeatmap
            mode={isDoc ? "doc" : "repo"}
            data={contributor.heatmapData}
          />
          <span className="rounded-full bg-warm-100 px-2.5 py-1 text-[11px] font-medium text-warm-600">
            {pattern}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Report View ───────────────────────────────────────────────────────────

function ReportView({ analysisId }: { analysisId: string }) {
  const router = useRouter();
  const data = useQuery(api.analyses.getAnalysis, {
    analysisId: analysisId as Id<"analyses">,
  });

  if (data === undefined) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 rounded-2xl bg-warm-100" />
        <Skeleton className="h-24 rounded-2xl bg-warm-100" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-2xl bg-warm-100" />
        ))}
      </div>
    );
  }

  if (!data || data.status !== "ready" || data.contributors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-warm-300 bg-warm-50/50 py-20">
        <p className="text-[15px] font-semibold text-warm-700">
          {!data ? "Analysis not found" : "No contributors to report on"}
        </p>
        <button
          onClick={() => router.replace("/app/reports")}
          className="mt-4 text-[13px] text-warm-400 underline underline-offset-2 hover:text-warm-600"
        >
          Back to projects
        </button>
      </div>
    );
  }

  const isDoc = data.sourceType === "google_doc";
  const contributors = [...data.contributors].sort((a, b) => b.score - a.score);
  const teamAvg = computeTeamAvg(contributors, isDoc);
  const avgScore = Math.round(
    contributors.reduce((s, c) => s + c.score, 0) / contributors.length
  );
  const carryCount = contributors.filter((c) => c.tier === "carry").length;
  const ghostCount = contributors.filter((c) => c.tier === "ghost").length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="hero-fade-in flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <button
            onClick={() => router.replace("/app/reports")}
            className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-warm-400 transition-colors hover:bg-warm-100 hover:text-warm-700"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={cn(
                  "text-[11px] font-medium",
                  isDoc
                    ? "border-docs-accent/30 bg-docs-accent/[0.08] text-docs-accent"
                    : "border-repo-accent/30 bg-repo-accent/[0.08] text-repo-accent"
                )}
              >
                {isDoc ? "Google Doc" : "GitHub Repo"}
              </Badge>
            </div>
            <h1 className="mt-1 text-[24px] font-bold tracking-tight text-warm-900">
              {data.title}
            </h1>
          </div>
        </div>
      </div>

      {/* AI Summary */}
      {data.summary && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.4 }}
          className="rounded-2xl border-l-2 border-l-brand/30 bg-white/55 p-5 shadow-card backdrop-blur-xl"
        >
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-brand" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand">
              AI Insight
            </span>
          </div>
          <p className="text-[14px] leading-relaxed text-warm-700">{data.summary}</p>
        </motion.div>
      )}

      {/* Team Overview */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="flex flex-wrap gap-4 rounded-2xl border border-white/50 bg-white/55 px-5 py-4 shadow-card backdrop-blur-xl"
      >
        <div className="flex flex-col">
          <span className="text-[11px] font-medium text-warm-400">Contributors</span>
          <span className="text-[20px] font-bold text-warm-900">{contributors.length}</span>
        </div>
        <div className="w-px bg-warm-100" />
        <div className="flex flex-col">
          <span className="text-[11px] font-medium text-warm-400">Team avg score</span>
          <span className="text-[20px] font-bold text-warm-900">{avgScore}</span>
        </div>
        <div className="w-px bg-warm-100" />
        <div className="flex flex-col">
          <span className="text-[11px] font-medium text-warm-400">Carrying</span>
          <span className="text-[20px] font-bold text-[#D4A017]">{carryCount}</span>
        </div>
        <div className="w-px bg-warm-100" />
        <div className="flex flex-col">
          <span className="text-[11px] font-medium text-warm-400">Selling</span>
          <span className="text-[20px] font-bold text-warm-400">{ghostCount}</span>
        </div>
      </motion.div>

      {/* Per-Contributor Rows */}
      <div className="space-y-3">
        {contributors.map((c, i) => (
          <ContributorReportRow
            key={c._id}
            contributor={c}
            teamAvg={teamAvg}
            isDoc={isDoc}
            rank={i}
            avgScore={avgScore}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Project Picker ────────────────────────────────────────────────────────

function ProjectPicker() {
  const router = useRouter();
  const analyses = useQuery(api.analyses.listAnalyses, {});

  if (analyses === undefined) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-[100px] rounded-2xl bg-warm-100" />
        ))}
      </div>
    );
  }

  const ready = analyses.filter((a) => a.status === "ready");

  if (ready.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-warm-300 bg-warm-50/50 py-20">
        <FolderKanban className="h-8 w-8 text-warm-300" />
        <p className="mt-3 text-[14px] font-semibold text-warm-700">No completed analyses yet</p>
        <p className="mt-1 text-[13px] text-warm-400">
          Run an analysis from Projects first
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {ready.map((analysis, i) => {
        const isDoc = analysis.sourceType === "google_doc";
        return (
          <motion.button
            key={analysis._id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.35 }}
            onClick={() => router.push(`/app/reports?id=${analysis._id}`)}
            className="flex items-start gap-3 rounded-2xl border border-white/50 bg-white/55 p-4 text-left shadow-card backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover"
          >
            <div
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                isDoc ? "bg-docs-accent/10" : "bg-repo-accent/10"
              )}
            >
              {isDoc ? (
                <FileText className="h-4 w-4 text-docs-accent" />
              ) : (
                <Github className="h-4 w-4 text-repo-accent" />
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold text-warm-900">{analysis.title}</p>
              <p className="mt-0.5 text-[11px] text-warm-400">
                {analysis.contributorCount} contributor{analysis.contributorCount !== 1 ? "s" : ""}
                {analysis.topContributor ? ` · Top: ${analysis.topContributor.name}` : ""}
              </p>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────

function ReportsPage() {
  const searchParams = useSearchParams();
  const analysisId = searchParams.get("id");

  return (
    <div className="space-y-6 p-6">
      {!analysisId && (
        <div className="hero-fade-in">
          <p className="text-[13px] font-medium text-warm-400">
            Select a project to see a full breakdown
          </p>
          <h1 className="mt-0.5 text-[28px] font-bold tracking-tight text-warm-900">Report</h1>
        </div>
      )}

      {analysisId ? (
        <ReportView analysisId={analysisId} />
      ) : (
        <ProjectPicker />
      )}
    </div>
  );
}

export default function ReportsPageWrapper() {
  return (
    <Suspense>
      <ReportsPage />
    </Suspense>
  );
}
