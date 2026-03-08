"use client";

import { Suspense, useState, useRef, useMemo } from "react";
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
import { useMutation } from "convex/react";
import { ReportChatPanel } from "@/components/ReportChat/ReportChatPanel";
import type { ReportContext } from "@/components/ReportChat/useChatMessages";
import {
  ArrowLeft,
  Sparkles,
  TrendingUp,
  ArrowUpRight,
  FolderKanban,
  FileText,
  Github,
  Trash2,
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
  carry: { label: "LOCKED IN", bg: "bg-[#404040] text-white border-[#404040]" },
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
      className="flex flex-col rounded-2xl border border-white/50 bg-white/55 p-4 shadow-card backdrop-blur-xl"
    >
      {/* Identity + Score */}
      <div className="flex items-center gap-3">
        <div className="relative">
          {contributor.avatarUrl ? (
            <Image
              src={contributor.avatarUrl}
              alt={contributor.name}
              width={40}
              height={40}
              className="h-10 w-10 shrink-0 rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-warm-100 text-[12px] font-bold text-warm-700">
              {getInitials(contributor.name)}
            </div>
          )}
          <span className="absolute -right-1 -top-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-warm-200 text-[9px] font-bold text-warm-700">
            {rank + 1}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold text-warm-900">{contributor.name}</p>
          {contributor.emailOrHandle && (
            <p className="truncate text-[10px] text-warm-400">{contributor.emailOrHandle}</p>
          )}
        </div>
      </div>

      {/* Score + Tier */}
      <div className="mt-3 flex items-center gap-2">
        <span className="font-display text-2xl font-normal text-warm-900">{contributor.score}</span>
        <div className="flex flex-col">
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider",
              tc.bg
            )}
          >
            {tc.label}
          </span>
          <span
            className={cn(
              "mt-0.5 text-[10px] font-medium",
              scoreDelta >= 0 ? "text-emerald-600" : "text-red-400"
            )}
          >
            {scoreDelta >= 0 ? "+" : ""}
            {scoreDelta} vs avg
          </span>
        </div>
      </div>

      {/* Activity Heatmap */}
      <div className="mt-3">
        <LiquidHeatmap
          mode={isDoc ? "doc" : "repo"}
          data={contributor.heatmapData}
        />
      </div>

      {/* Strengths / Improvements */}
      <div className="mt-3 flex-1 space-y-2">
        {strengths.length > 0 && (
          <div>
            <div className="mb-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-emerald-500" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                Strengths
              </span>
            </div>
            <ul className="space-y-0.5">
              {strengths.map((s) => (
                <li key={s} className="flex items-center gap-1.5 text-[11px] text-warm-700">
                  <span className="h-1 w-1 shrink-0 rounded-full bg-emerald-400" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {improvements.length > 0 && (
          <div>
            <div className="mb-1 flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3 text-amber-500" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
                Can improve
              </span>
            </div>
            <ul className="space-y-0.5">
              {improvements.map((s) => (
                <li key={s} className="flex items-center gap-1.5 text-[11px] text-warm-500">
                  <span className="h-1 w-1 shrink-0 rounded-full bg-amber-400" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {strengths.length === 0 && improvements.length === 0 && (
          <p className="text-[11px] italic text-warm-400">
            Close to team average.
          </p>
        )}
      </div>

      {/* Pattern badge */}
      <div className="mt-2">
        <span className="rounded-full bg-warm-100 px-2 py-0.5 text-[10px] font-medium text-warm-600">
          {pattern}
        </span>
      </div>
    </motion.div>
  );
}

// ─── Report View ───────────────────────────────────────────────────────────

function ReportView({
  analysisId,
  onReportContext,
}: {
  analysisId: string;
  onReportContext?: (ctx: ReportContext | null) => void;
}) {
  const router = useRouter();
  const data = useQuery(api.analyses.getAnalysis, {
    analysisId: analysisId as Id<"analyses">,
  });

  const isDoc = data?.sourceType === "google_doc";
  const contributors = data?.status === "ready"
    ? [...data.contributors].sort((a, b) => b.score - a.score)
    : [];
  const teamAvg = contributors.length > 0 ? computeTeamAvg(contributors, !!isDoc) : {};
  const avgScore = contributors.length > 0
    ? Math.round(contributors.reduce((s, c) => s + c.score, 0) / contributors.length)
    : 0;
  const carryCount = contributors.filter((c) => c.tier === "carry").length;
  const ghostCount = contributors.filter((c) => c.tier === "ghost").length;

  // Build report context for the chat panel
  const reportContext = useMemo<ReportContext | null>(() => {
    if (!data || data.status !== "ready" || contributors.length === 0) return null;
    return {
      title: data.title,
      sourceType: data.sourceType,
      summary: data.summary || "",
      contributors: contributors.map((c) => {
        const { strengths, improvements } = computeInsights(c, teamAvg, !!isDoc);
        return {
          name: c.name,
          score: c.score,
          tier: c.tier,
          rawStats: c.rawStats,
          strengths,
          improvements,
        };
      }),
      teamAvgScore: avgScore,
      carryCount,
      ghostCount,
    };
  }, [data, contributors, teamAvg, isDoc, avgScore, carryCount, ghostCount]);

  // Notify parent of context changes
  const prevCtxRef = useRef<string>("");
  const ctxKey = reportContext ? JSON.stringify(reportContext) : "";
  if (ctxKey !== prevCtxRef.current) {
    prevCtxRef.current = ctxKey;
    onReportContext?.(reportContext);
  }

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

  return (
    <div className="space-y-4">
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
                className="text-[11px] font-medium border-warm-200 bg-warm-100/50 text-warm-500"
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
              className="rounded-2xl border border-white/50 bg-white/55 p-5 shadow-card backdrop-blur-xl"
            >
              <div className="mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-warm-400" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-warm-500">
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
              <span className="text-[20px] font-bold text-[#404040]">{carryCount}</span>
            </div>
            <div className="w-px bg-warm-100" />
            <div className="flex flex-col">
              <span className="text-[11px] font-medium text-warm-400">Selling</span>
              <span className="text-[20px] font-bold text-warm-400">{ghostCount}</span>
            </div>
          </motion.div>

          {/* Per-Contributor Cards Grid */}
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
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
  const deleteAnalysis = useMutation(api.analyses.deleteAnalysis);

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
          <motion.div
            key={analysis._id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.35 }}
            className="relative group"
          >
            <button
              onClick={() => router.push(`/app/reports?id=${analysis._id}`)}
              className="flex w-full items-start gap-3 rounded-2xl border border-white/50 bg-white/55 p-4 text-left shadow-card backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover"
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
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-warm-900">{analysis.title}</p>
                <p className="mt-0.5 text-[11px] text-warm-400">
                  {analysis.contributorCount} contributor{analysis.contributorCount !== 1 ? "s" : ""}
                  {analysis.topContributor ? ` · Top: ${analysis.topContributor.name}` : ""}
                </p>
              </div>
            </button>
            <button
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onClick={() => deleteAnalysis({ analysisId: analysis._id as any })}
              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-lg text-warm-300 opacity-0 transition-all duration-150 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500"
              title="Delete report"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────

function ReportsPage() {
  const searchParams = useSearchParams();
  const analysisId = searchParams.get("id");
  const [reportContext, setReportContext] = useState<ReportContext | null>(null);

  return (
    <div className="p-6">
      {!analysisId && (
        <div className="hero-fade-in mb-6">
          <p className="text-[13px] font-medium text-warm-400">
            Select a project to see a full breakdown
          </p>
          <h1 className="mt-0.5 text-[28px] font-bold tracking-tight text-warm-900">Report</h1>
        </div>
      )}

      {analysisId ? (
        <div className="flex items-start gap-5">
          {/* Report content — 65% with matching border */}
          <div className="min-w-0 flex-[65] rounded-2xl border border-warm-200/60 bg-white/40 p-5">
            <ReportView
              analysisId={analysisId}
              onReportContext={setReportContext}
            />
          </div>

          {/* Chat panel — 35%, sticky, aligned */}
          {reportContext && (
            <div className="hidden flex-[35] lg:block" style={{ minWidth: 320, maxWidth: 440 }}>
              <div className="sticky top-[80px] h-[calc(100vh-128px)]">
                <ReportChatPanel reportContext={reportContext} />
              </div>
            </div>
          )}
        </div>
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
