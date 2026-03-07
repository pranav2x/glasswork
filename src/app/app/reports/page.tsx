"use client";

import { Suspense, useState, useRef, useMemo } from "react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { LiquidHeatmap } from "@/components/LiquidHeatmap";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { useMutation } from "convex/react";
import {
  ReportChatPanel,
  FloatingChatFAB,
} from "@/components/ReportChat/ReportChatPanel";
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
  Target,
  BookOpen,
  Lightbulb,
  CheckCircle2,
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

// ─── AP Seminar improvement generator ──────────────────────────────────────

type ImprovementPlan = {
  focusAreas: { icon: "target" | "book" | "lightbulb" | "trending"; label: string; detail: string }[];
  nextStep: string;
  priority: "high" | "medium" | "low";
};

function generateImprovementPlan(
  contributor: { score: number; tier: "carry" | "solid" | "ghost"; rawStats: RawStats; heatmapData: number[] },
  teamAvg: RawStats,
  avgScore: number,
  isDoc: boolean
): ImprovementPlan {
  const focusAreas: ImprovementPlan["focusAreas"] = [];
  const data = contributor.heatmapData;
  const mid = Math.floor(data.length / 2);
  const firstHalf = data.slice(0, mid).reduce((s, v) => s + v, 0) / Math.max(mid, 1);
  const secondHalf = data.slice(mid).reduce((s, v) => s + v, 0) / Math.max(data.length - mid, 1);
  const isLate = secondHalf / (firstHalf || 0.001) > 1.6;
  const isFrontLoaded = firstHalf / (secondHalf || 0.001) > 1.6;

  if (isDoc) {
    // AP Seminar Google Doc-specific improvements
    const revRatio = (contributor.rawStats.revisions ?? 0) / Math.max(teamAvg.revisions ?? 1, 1);
    const wordRatio = (contributor.rawStats.wordsAdded ?? 0) / Math.max(teamAvg.wordsAdded ?? 1, 1);

    if (revRatio < 0.6) {
      focusAreas.push({
        icon: "book",
        label: "Iterative revision",
        detail: "Revisit and refine your sections more frequently — strong AP Seminar arguments are built through multiple revision passes, not first drafts.",
      });
    }
    if (wordRatio < 0.6) {
      focusAreas.push({
        icon: "target",
        label: "Written contribution depth",
        detail: "Increase substantive writing output. Focus on developing your assigned perspectives with fuller evidence chains and reasoned synthesis.",
      });
    }
    if (contributor.tier === "ghost") {
      focusAreas.push({
        icon: "lightbulb",
        label: "Perspective integration",
        detail: "Your section needs stronger connection to the team's central argument. Explicitly bridge your lens to the research question in each paragraph.",
      });
    }
    if (isLate) {
      focusAreas.push({
        icon: "trending",
        label: "Earlier engagement",
        detail: "Your contributions spike late in the project. Engage with source material and drafting earlier so teammates can build on your work.",
      });
    }
    if (isFrontLoaded) {
      focusAreas.push({
        icon: "trending",
        label: "Sustained engagement",
        detail: "You start strong but drop off. Stay engaged in later revision stages — final synthesis and counterargument sections need your voice.",
      });
    }
    if (contributor.tier === "carry" && focusAreas.length === 0) {
      focusAreas.push({
        icon: "lightbulb",
        label: "Elevate team argument quality",
        detail: "You're carrying the load. Use your position to lift weaker sections — propose synthesis edits and leave constructive inline comments for teammates.",
      });
    }
    if (focusAreas.length < 2) {
      focusAreas.push({
        icon: "book",
        label: "Source diversity",
        detail: "Vary your cited sources across academic, primary, and multimedia. AP Seminar rewards evidence that spans multiple disciplines and perspectives.",
      });
    }
  } else {
    // GitHub repo improvements
    const commitRatio = (contributor.rawStats.commits ?? 0) / Math.max(teamAvg.commits ?? 1, 1);
    const addRatio = (contributor.rawStats.additions ?? 0) / Math.max(teamAvg.additions ?? 1, 1);

    if (commitRatio < 0.6) {
      focusAreas.push({
        icon: "target",
        label: "Commit frequency",
        detail: "Commit smaller, more atomic changes more often. Consistent commits signal active participation and make code review easier.",
      });
    }
    if (addRatio < 0.6) {
      focusAreas.push({
        icon: "book",
        label: "Code contribution volume",
        detail: "Your line output is below team average. Pick up a feature or bug track and take ownership of a complete implementation.",
      });
    }
    if (isLate) {
      focusAreas.push({
        icon: "trending",
        label: "Earlier engagement",
        detail: "Most of your work happens near the deadline. Shift effort earlier — late bursts often introduce bugs and block teammate reviews.",
      });
    }
    if (contributor.tier === "carry" && focusAreas.length === 0) {
      focusAreas.push({
        icon: "lightbulb",
        label: "Code review leadership",
        detail: "You're the top contributor. Invest time in reviewing PRs and documenting key decisions to multiply your impact across the team.",
      });
    }
    if (focusAreas.length < 2) {
      focusAreas.push({
        icon: "lightbulb",
        label: "Documentation & clarity",
        detail: "Add comments and README updates alongside your code. Clear documentation compounds the value of your contributions.",
      });
    }
  }

  // Next step based on tier
  const nextStepMap: Record<string, string> = {
    carry: isDoc
      ? "Lead a group sync to align everyone's section arguments with the central claim before the next deadline."
      : "Schedule a code review session and assign each teammate a specific area to own for the next sprint.",
    solid: isDoc
      ? "Identify the weakest source in your section and replace it with a peer-reviewed or primary source by end of week."
      : "Pick one unassigned issue from the backlog and deliver a complete, tested implementation before the next standup.",
    ghost: isDoc
      ? "Write at least 200 words of new substantive content this week and post a draft in the shared doc for team feedback."
      : "Make at least 3 meaningful commits this week — start with fixing an open bug or adding a unit test.",
  };

  return {
    focusAreas: focusAreas.slice(0, 3),
    nextStep: nextStepMap[contributor.tier],
    priority: contributor.tier === "ghost" ? "high" : contributor.tier === "solid" ? "medium" : "low",
  };
}

const iconComponents = {
  target: Target,
  book: BookOpen,
  lightbulb: Lightbulb,
  trending: TrendingUp,
};

const priorityConfig = {
  high: { label: "High priority", className: "bg-red-50 text-red-500 border-red-200" },
  medium: { label: "Medium priority", className: "bg-amber-50 text-amber-600 border-amber-200" },
  low: { label: "On track", className: "bg-emerald-50 text-emerald-600 border-emerald-200" },
};

// ─── Improvements View ─────────────────────────────────────────────────────

type RubricFeedback = {
  name: string;
  focusAreas: { label: string; detail: string }[];
  nextStep: string;
};

function getActivityPattern(heatmapData: number[]): string {
  const data = heatmapData;
  const mid = Math.floor(data.length / 2);
  const firstHalf = data.slice(0, mid).reduce((s, v) => s + v, 0) / Math.max(mid, 1);
  const secondHalf = data.slice(mid).reduce((s, v) => s + v, 0) / Math.max(data.length - mid, 1);
  const overall = data.reduce((s, v) => s + v, 0) / data.length;
  if (overall < 0.1) return "Minimal activity";
  if (secondHalf / (firstHalf || 0.001) > 1.6) return "Late sprint";
  if (firstHalf / (secondHalf || 0.001) > 1.6) return "Front-loaded";
  const max = Math.max(...data);
  const min = Math.min(...data);
  if (max - min > 0.5) return "Variable bursts";
  return "Steady pace";
}

function ImprovementsView({
  contributors,
  teamAvg,
  avgScore,
  isDoc,
}: {
  contributors: Array<{
    _id: string;
    name: string;
    emailOrHandle?: string;
    avatarUrl?: string;
    score: number;
    tier: "carry" | "solid" | "ghost";
    rawStats: RawStats;
    heatmapData: number[];
  }>;
  teamAvg: RawStats;
  avgScore: number;
  isDoc: boolean;
}) {
  const [rubricFile, setRubricFile] = useState<File | null>(null);
  const [rubricFeedback, setRubricFeedback] = useState<RubricFeedback[] | null>(null);
  const [rubricName, setRubricName] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleRubricUpload(file: File) {
    setRubricFile(file);
    setIsAnalyzing(true);
    setError(null);
    setRubricFeedback(null);

    try {
      const formData = new FormData();
      formData.append("rubric", file);
      formData.append("isDoc", String(isDoc));
      formData.append(
        "contributors",
        JSON.stringify(
          contributors.map((c) => ({
            name: c.name,
            score: c.score,
            tier: c.tier,
            rawStats: c.rawStats,
            activityPattern: getActivityPattern(c.heatmapData),
          }))
        )
      );

      const res = await fetch("/api/rubric-feedback", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to analyze rubric");
      }

      const data = await res.json();
      setRubricName(data.rubricName || file.name);
      setRubricFeedback(data.feedback);
    } catch {
      setError("Failed to analyze rubric. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  function handleClearRubric() {
    setRubricFile(null);
    setRubricFeedback(null);
    setRubricName(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // Match AI feedback to contributor by name
  function getFeedbackForContributor(name: string): RubricFeedback | undefined {
    if (!rubricFeedback) return undefined;
    return rubricFeedback.find(
      (f) => f.name.toLowerCase() === name.toLowerCase()
    );
  }

  return (
    <div className="space-y-4">
      {/* Rubric Upload Card */}
      <div className="rounded-2xl border border-white/50 bg-white/55 px-5 py-4 shadow-card backdrop-blur-xl">
        <div className="flex items-center gap-2 mb-1">
          <Target className="h-4 w-4 text-brand" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand">
            Improvement Plans
          </span>
        </div>
        <p className="text-[13px] text-warm-500 leading-relaxed mb-4">
          Upload your rubric to get AI-powered feedback tailored to each contributor&apos;s performance.
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleRubricUpload(file);
          }}
        />

        {!rubricFile ? (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-dashed border-warm-200 bg-warm-50/50 px-4 py-6 transition-all duration-200 hover:border-brand/40 hover:bg-brand/[0.03]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10">
              <FileText className="h-5 w-5 text-brand" />
            </div>
            <div className="text-left">
              <p className="text-[13px] font-semibold text-warm-800">Upload rubric</p>
              <p className="text-[11px] text-warm-400">PDF or image of your grading rubric</p>
            </div>
          </button>
        ) : (
          <div className="flex items-center justify-between rounded-xl border border-warm-200 bg-warm-50 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10">
                <FileText className="h-4 w-4 text-brand" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-warm-800">
                  {rubricName || rubricFile.name}
                </p>
                <p className="text-[11px] text-warm-400">
                  {isAnalyzing ? "Analyzing with Gemini..." : "Rubric loaded"}
                </p>
              </div>
            </div>
            {!isAnalyzing && (
              <button
                onClick={handleClearRubric}
                className="rounded-lg px-2 py-1 text-[11px] font-medium text-warm-400 transition-colors hover:bg-warm-100 hover:text-warm-600"
              >
                Clear
              </button>
            )}
          </div>
        )}

        {error && (
          <p className="mt-2 text-[12px] text-red-500">{error}</p>
        )}
      </div>

      {/* Loading state */}
      {isAnalyzing && (
        <div className="space-y-3">
          {contributors.map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-2xl border border-white/50 bg-white/55 p-5 shadow-card backdrop-blur-xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="h-9 w-9 rounded-full bg-warm-100" />
                <div className="space-y-1.5">
                  <div className="h-3 w-24 rounded bg-warm-100" />
                  <div className="h-2 w-16 rounded bg-warm-100" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full rounded bg-warm-100" />
                <div className="h-3 w-3/4 rounded bg-warm-100" />
                <div className="h-3 w-1/2 rounded bg-warm-100" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Contributor Cards */}
      {!isAnalyzing &&
        contributors.map((contributor, i) => {
          const aiFeedback = getFeedbackForContributor(contributor.name);
          const plan = generateImprovementPlan(contributor, teamAvg, avgScore, isDoc);
          const pc = priorityConfig[plan.priority];

          // Use AI feedback if available, otherwise fall back to static
          const displayAreas = aiFeedback
            ? aiFeedback.focusAreas.map((a) => ({
                icon: "lightbulb" as const,
                label: a.label,
                detail: a.detail,
              }))
            : plan.focusAreas;
          const displayNextStep = aiFeedback ? aiFeedback.nextStep : plan.nextStep;

          return (
            <motion.div
              key={contributor._id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-2xl border border-white/50 bg-white/55 p-5 shadow-card backdrop-blur-xl"
            >
              {/* Header row */}
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  {contributor.avatarUrl ? (
                    <Image
                      src={contributor.avatarUrl}
                      alt={contributor.name}
                      width={36}
                      height={36}
                      className="h-9 w-9 shrink-0 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-warm-100 text-[12px] font-bold text-warm-700">
                      {getInitials(contributor.name)}
                    </div>
                  )}
                  <div>
                    <p className="text-[14px] font-semibold text-warm-900">{contributor.name}</p>
                    {contributor.emailOrHandle && (
                      <p className="text-[11px] text-warm-400">{contributor.emailOrHandle}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {aiFeedback && (
                    <span className="shrink-0 rounded-full border border-brand/20 bg-brand/5 px-2 py-0.5 text-[10px] font-semibold text-brand">
                      Rubric AI
                    </span>
                  )}
                  <span
                    className={cn(
                      "shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold",
                      pc.className
                    )}
                  >
                    {pc.label}
                  </span>
                </div>
              </div>

              {/* Focus areas */}
              <div className="space-y-3 mb-4">
                {displayAreas.map((area, j) => {
                  const Icon = iconComponents[area.icon];
                  return (
                    <div key={j} className="flex gap-3">
                      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-warm-100">
                        <Icon className="h-3.5 w-3.5 text-warm-600" />
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-warm-800">{area.label}</p>
                        <p className="mt-0.5 text-[12px] leading-relaxed text-warm-500">{area.detail}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Next step */}
              <div className="flex gap-2.5 rounded-xl bg-warm-50 border border-warm-100 px-4 py-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-brand mb-0.5">Next step</p>
                  <p className="text-[12px] leading-relaxed text-warm-700">{displayNextStep}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
    </div>
  );
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

function ReportView({
  analysisId,
  onReportContext,
}: {
  analysisId: string;
  onReportContext?: (ctx: ReportContext | null) => void;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "improvements">("overview");
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

      {/* Tab switcher */}
      <div className="flex gap-1 rounded-xl border border-warm-200/60 bg-warm-100/40 p-1 w-fit">
        <button
          onClick={() => setActiveTab("overview")}
          className={cn(
            "rounded-lg px-4 py-1.5 text-[12px] font-semibold transition-all duration-200",
            activeTab === "overview"
              ? "bg-white shadow-sm text-warm-900"
              : "text-warm-500 hover:text-warm-700"
          )}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab("improvements")}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-[12px] font-semibold transition-all duration-200",
            activeTab === "improvements"
              ? "bg-white shadow-sm text-warm-900"
              : "text-warm-500 hover:text-warm-700"
          )}
        >
          <Target className="h-3 w-3" />
          Improvements
        </button>
      </div>

      {activeTab === "overview" && (
        <>
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
        </>
      )}

      {activeTab === "improvements" && (
        <ImprovementsView
          contributors={contributors}
          teamAvg={teamAvg}
          avgScore={avgScore}
          isDoc={isDoc}
        />
      )}
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
  const [chatOpen, setChatOpen] = useState(false);
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
        <div className="flex gap-6">
          <div
            className={cn(
              "min-w-0 space-y-5 transition-all duration-300",
              chatOpen ? "flex-[65]" : "flex-1"
            )}
          >
            <ReportView
              analysisId={analysisId}
              onReportContext={setReportContext}
            />
          </div>

          {/* Desktop chat panel */}
          <AnimatePresence>
            {chatOpen && reportContext && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "auto", opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="hidden flex-[35] lg:block"
                style={{ minWidth: 340, maxWidth: 480 }}
              >
                <div className="sticky top-6">
                  <ReportChatPanel
                    reportContext={reportContext}
                    onClose={() => setChatOpen(false)}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile chat overlay */}
          <AnimatePresence>
            {chatOpen && reportContext && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
                  onClick={() => setChatOpen(false)}
                />
                <motion.div
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="fixed inset-y-0 right-0 z-50 w-[85vw] max-w-[400px] p-3 lg:hidden"
                >
                  <ReportChatPanel
                    reportContext={reportContext}
                    onClose={() => setChatOpen(false)}
                  />
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* FAB when chat is closed */}
          <AnimatePresence>
            {(!chatOpen || !reportContext) && reportContext && (
              <FloatingChatFAB onClick={() => setChatOpen(true)} />
            )}
          </AnimatePresence>
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
