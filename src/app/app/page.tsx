"use client";

import { Suspense, useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useConvexAuth, useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { NewAnalysisModal } from "@/components/NewAnalysisModal";
import { GlassPanel } from "@/components/GlassPanel";
import {
  DonutChart,
  ActivityChart,
  ScoreBar,
  AnalysisItem,
  ReportItem,
  ContributorTicket,
} from "@/components/DashboardWidgets";
import {
  Plus,
  Search,
  ArrowUpRight,
  SlidersHorizontal,
  FileText,
  GitBranch,
  Calendar,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { getInitials, formatTimeAgo } from "@/lib/formatters";
import { Id } from "../../../convex/_generated/dataModel";

/* ─── Sub-components ─── */

function DocIcon({ color }: { color: string }) {
  return <FileText className="h-4 w-4" style={{ color }} />;
}

function RepoIcon({ color }: { color: string }) {
  return <GitBranch className="h-4 w-4" style={{ color }} />;
}

function CardHeader({
  title,
  actions,
}: {
  title: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-[15px] font-semibold text-warm-800">{title}</h2>
      {actions && <div className="flex items-center gap-1">{actions}</div>}
    </div>
  );
}

function IconAction({ children, className, onClick, title }: { children: React.ReactNode; className?: string; onClick?: () => void; title?: string }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded-lg text-warm-400 transition-colors hover:bg-warm-100 hover:text-warm-600",
        className
      )}
    >
      {children}
    </button>
  );
}

const TIME_FILTERS = [
  { label: "Today", value: "today" as const },
  { label: "This Week", value: "week" as const },
  { label: "All Time", value: "month" as const },
];

/* ─── Main Dashboard ─── */

export default function DashboardPageWrapper() {
  return (
    <Suspense>
      <DashboardPage />
    </Suspense>
  );
}

function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTaskFilter, setActiveTaskFilter] = useState<"docs" | "repos">("docs");
  const [activeTimeFilter, setActiveTimeFilter] = useState<"today" | "week" | "month">("month");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<Id<"analyses"> | null>(null);
  const [scoreSortAsc, setScoreSortAsc] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const deleteAnalysisMutation = useMutation(api.analyses.deleteAnalysis);

  const dashboardData = useQuery(api.analyses.getDashboardStats, { timeFilter: activeTimeFilter });

  // Fetch selected analysis detail when one is selected
  const selectedAnalysis = useQuery(
    api.analyses.getAnalysis,
    selectedAnalysisId ? { analysisId: selectedAnalysisId } : "skip"
  );

  const handleDeleteAnalysis = useCallback(
    async (analysisId: Id<"analyses">, title: string) => {
      if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
      try {
        await deleteAnalysisMutation({ analysisId });
        toast.success("Analysis deleted");
      } catch {
        toast.error("Failed to delete analysis");
      }
    },
    [deleteAnalysisMutation]
  );

  // Listen for sidebar search focus event
  const handleFocusSearch = useCallback(() => {
    searchInputRef.current?.focus();
  }, []);

  useEffect(() => {
    window.addEventListener("glasswork:focus-search", handleFocusSearch);
    return () => window.removeEventListener("glasswork:focus-search", handleFocusSearch);
  }, [handleFocusSearch]);

  // Auto-focus search if ?search=1
  useEffect(() => {
    if (searchParams.get("search") === "1") {
      searchInputRef.current?.focus();
    }
  }, [searchParams]);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isAuthLoading, router]);

  if (isAuthLoading || dashboardData === undefined) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-10 w-64 rounded-xl bg-warm-200" />
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[280px] rounded-2xl bg-warm-100" />
          ))}
        </div>
      </div>
    );
  }

  // Derive all widget data from the query
  const { analyses, statusCounts, scoreDistribution, totalContributors, topContributors, activityByMonth } = dashboardData;

  const query = searchQuery.toLowerCase().trim();
  const isViewingAnalysis = selectedAnalysisId !== null && selectedAnalysis?.status === "ready";
  const selectedContributors = isViewingAnalysis ? (selectedAnalysis.contributors ?? []) : [];

  const filteredAnalyses = analyses.filter((a) => {
    const matchesType =
      activeTaskFilter === "docs"
        ? a.sourceType === "google_doc"
        : a.sourceType === "github_repo";
    if (!matchesType) return false;
    if (!query) return true;
    return (
      a.title.toLowerCase().includes(query) ||
      a.topContributor?.name.toLowerCase().includes(query)
    );
  });

  // --- Donut chart: aggregate or per-analysis ---
  const donutSegments = isViewingAnalysis
    ? [
        { value: selectedContributors.filter((c) => c.tier === "carry").length, color: "#D4A017", label: "Locked In" },
        { value: selectedContributors.filter((c) => c.tier === "solid").length, color: "#2DA44E", label: "Solid" },
        { value: selectedContributors.filter((c) => c.tier === "ghost").length, color: "#E53935", label: "Not Locked In" },
      ]
    : [
        { value: statusCounts.ready, color: "#4A96D9", label: "Completed" },
        { value: statusCounts.pending, color: "#F5A623", label: "In Progress" },
        { value: statusCounts.error, color: "#E53935", label: "Failed" },
      ];

  // --- Score distribution: aggregate or per-analysis ---
  const perAnalysisContributorCount = selectedContributors.length;
  const perAnalysisScoreDist = isViewingAnalysis
    ? {
        excellent: selectedContributors.filter((c) => c.score >= 150).length,
        good: selectedContributors.filter((c) => c.score >= 100 && c.score < 150).length,
        fair: selectedContributors.filter((c) => c.score >= 60 && c.score < 100).length,
        needsWork: selectedContributors.filter((c) => c.score >= 30 && c.score < 60).length,
        minimal: selectedContributors.filter((c) => c.score < 30).length,
      }
    : scoreDistribution;

  const effectiveTotal = isViewingAnalysis ? perAnalysisContributorCount : totalContributors;

  const scoreBars = [
    { label: "Excellent", count: perAnalysisScoreDist.excellent, total: "Score 150–200", percentage: effectiveTotal > 0 ? Math.round((perAnalysisScoreDist.excellent / effectiveTotal) * 100) : 0, color: "#2DA44E" },
    { label: "Good", count: perAnalysisScoreDist.good, total: "Score 100–149", percentage: effectiveTotal > 0 ? Math.round((perAnalysisScoreDist.good / effectiveTotal) * 100) : 0, color: "#4A96D9" },
    { label: "Fair", count: perAnalysisScoreDist.fair, total: "Score 60–99", percentage: effectiveTotal > 0 ? Math.round((perAnalysisScoreDist.fair / effectiveTotal) * 100) : 0, color: "#9B6FE3" },
    { label: "Needs Work", count: perAnalysisScoreDist.needsWork, total: "Score 30–59", percentage: effectiveTotal > 0 ? Math.round((perAnalysisScoreDist.needsWork / effectiveTotal) * 100) : 0, color: "#E53935" },
    { label: "Minimal", count: perAnalysisScoreDist.minimal, total: "Score 0–29", percentage: effectiveTotal > 0 ? Math.round((perAnalysisScoreDist.minimal / effectiveTotal) * 100) : 0, color: "#F5A623" },
  ];

  // --- Activity: aggregate or per-analysis contributor scores ---
  const months = activityByMonth.map((m) => m.month);
  const docsActivityData = activityByMonth.map((m) => m.docsCount);
  const reposActivityData = activityByMonth.map((m) => m.reposCount);

  const recentReports = analyses
    .filter((a) => a.status === "ready")
    .slice(0, 3)
    .map((a) => ({
      label: a.sourceType === "google_doc" ? "Doc Analysis" : "Repo Analysis",
      title: a.title,
      time: formatTimeAgo(a.updatedAt),
      iconBg: a.sourceType === "google_doc" ? "#EEF0FF" : "#F0FDF4",
      iconColor: a.sourceType === "google_doc" ? "#6C63FF" : "#2DA44E",
      type: a.sourceType === "google_doc" ? "doc" : "repo",
      analysisId: a._id,
    }));

  // --- Top contributors: aggregate or per-analysis ---
  const isRepoAnalysis = selectedAnalysis?.sourceType === "github_repo";

  const topContributorCards = isViewingAnalysis
    ? selectedContributors
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map((c) => ({
          name: c.name,
          message: `Score: ${c.score} · ${c.tier}`,
          initials: getInitials(c.name),
          color: c.tier === "carry" ? "#F5A623" : c.tier === "solid" ? "#2DA44E" : "#E53935",
          avatarUrl: c.avatarUrl,
          firstAnalysisId: selectedAnalysisId!,
          profileUrl: isRepoAnalysis && c.emailOrHandle
            ? `https://github.com/${c.emailOrHandle}`
            : undefined,
        }))
    : topContributors
        .filter((c) => !query || c.name.toLowerCase().includes(query))
        .slice(0, 3)
        .map((c) => ({
          name: c.name,
          message: `Score: ${c.score} across ${c.analysisCount} ${c.analysisCount === 1 ? "analysis" : "analyses"}`,
          initials: getInitials(c.name),
          color: c.tier === "carry" ? "#F5A623" : c.tier === "solid" ? "#2DA44E" : "#E53935",
          avatarUrl: c.avatarUrl,
          firstAnalysisId: c.firstAnalysisId,
          profileUrl: c.emailOrHandle && !c.emailOrHandle.includes("@")
            ? `https://github.com/${c.emailOrHandle}`
            : undefined,
        }));

  const isEmpty = analyses.length === 0;

  return (
    <>
      <div className="space-y-6">
        {/* ─── Header ─── */}
        <div className="hero-fade-in flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[13px] font-medium text-warm-400">
              {isViewingAnalysis
                ? `Viewing individual ${selectedAnalysis?.sourceType === "google_doc" ? "doc" : "repo"} analysis`
                : "Monitor and analyze your contributions"}
            </p>
            <h1 className="mt-0.5 text-[28px] font-bold tracking-tight text-warm-900">
              {isViewingAnalysis ? selectedAnalysis?.title : "Analysis Dashboard"}
            </h1>
            {isViewingAnalysis && (
              <button
                onClick={() => setSelectedAnalysisId(null)}
                className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1 text-[12px] font-medium text-brand transition-colors hover:bg-brand/20"
              >
                <X className="h-3 w-3" />
                Back to overview
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            {/* Time filter pills */}
            <div
              className="hero-fade-in flex items-center gap-1 rounded-full border border-warm-200 bg-white p-1 shadow-sm"
              style={{ animationDelay: "0.04s" }}
            >
              {TIME_FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setActiveTimeFilter(filter.value)}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-[12px] font-semibold transition-all duration-200",
                    activeTimeFilter === filter.value
                      ? "bg-warm-900 text-white shadow-sm"
                      : "text-warm-500 hover:text-warm-700 hover:bg-warm-50"
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>
            <div
              className="hero-fade-in flex items-center gap-2.5 rounded-2xl border border-warm-200 bg-white px-4 py-2.5 shadow-sm"
              style={{ animationDelay: "0.06s" }}
            >
              <Search className="h-4 w-4 text-warm-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search analyses, contributors..."
                className="w-52 bg-transparent text-[13px] text-warm-700 placeholder:text-warm-400 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* ─── Empty State ─── */}
        {isEmpty ? (
          <div className="hero-fade-in flex flex-col items-center justify-center rounded-2xl border border-dashed border-warm-300 bg-warm-50/50 py-20" style={{ animationDelay: "0.08s" }}>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-warm-100">
              <Plus className="h-6 w-6 text-warm-400" />
            </div>
            <h3 className="mt-4 text-[16px] font-semibold text-warm-800">No analyses yet</h3>
            <p className="mt-1 text-[13px] text-warm-500">Create your first analysis to get started</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-5 rounded-xl bg-warm-900 px-5 py-2.5 text-[13px] font-semibold text-white shadow-sm transition-all hover:bg-warm-800 hover:scale-105 active:scale-95"
            >
              New Analysis
            </button>
          </div>
        ) : (
          /* ─── Dashboard Grid ─── */
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-[260px_1fr_1fr_280px]">
            {/* ──── Column 1: Recent Analyses (spans 2 rows) ──── */}
            <GlassPanel className="hero-fade-in xl:row-span-2" style={{ animationDelay: "0.08s" }}>
              <div className="p-5">
                <CardHeader
                  title="Recent Analyses"
                  actions={
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-warm-900 text-white shadow-sm transition-all hover:bg-warm-800 hover:scale-105 active:scale-95"
                    >
                      <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                    </button>
                  }
                />

                {/* Filter pills */}
                <div className="mt-3.5 flex gap-2">
                  <button
                    onClick={() => setActiveTaskFilter("docs")}
                    className={cn(
                      "rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-all",
                      activeTaskFilter === "docs"
                        ? "bg-warm-900 text-white shadow-sm"
                        : "bg-warm-100 text-warm-500 hover:bg-warm-200 hover:text-warm-700"
                    )}
                  >
                    Docs
                  </button>
                  <button
                    onClick={() => setActiveTaskFilter("repos")}
                    className={cn(
                      "rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-all",
                      activeTaskFilter === "repos"
                        ? "bg-warm-900 text-white shadow-sm"
                        : "bg-warm-100 text-warm-500 hover:bg-warm-200 hover:text-warm-700"
                    )}
                  >
                    Repos
                  </button>
                </div>

                {/* Active count */}
                <div className="mt-3 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-warm-900 text-[10px] font-bold text-white">
                    {analyses.length}
                  </span>
                  <span className="text-[12px] font-medium text-warm-600">
                    Active Analyses
                  </span>
                </div>

                {/* Analysis list */}
                <div className="mt-4 space-y-1">
                  {filteredAnalyses.length === 0 ? (
                    <p className="py-6 text-center text-[12px] text-warm-400">
                      No {activeTaskFilter === "docs" ? "doc" : "repo"} analyses yet
                    </p>
                  ) : (
                    filteredAnalyses.map((item, i) => (
                      <div
                        key={item._id}
                        className="group/item relative"
                      >
                        <div
                          onClick={() => {
                            if (item.status !== "ready") return;
                            setSelectedAnalysisId(
                              selectedAnalysisId === item._id ? null : item._id
                            );
                          }}
                          className={cn(
                            "rounded-xl transition-all",
                            item.status === "ready" && "cursor-pointer",
                            selectedAnalysisId === item._id &&
                              "bg-brand/5 ring-1 ring-brand/20"
                          )}
                        >
                          <AnalysisItem
                            icon={
                              item.sourceType === "google_doc" ? (
                                <DocIcon color="#6C63FF" />
                              ) : (
                                <RepoIcon color="#2DA44E" />
                              )
                            }
                            iconBg={item.sourceType === "google_doc" ? "#EEF0FF" : "#F0FDF4"}
                            title={item.title}
                            description={
                              item.status === "pending"
                                ? "Analyzing..."
                                : item.status === "error"
                                  ? "Analysis failed"
                                  : `${item.contributorCount} contributors`
                            }
                            isComplete={item.status === "ready"}
                            delay={0.1 + i * 0.04}
                          />
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAnalysis(item._id, item.title);
                          }}
                          className="absolute right-9 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-lg text-warm-300 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover/item:opacity-100"
                          aria-label={`Delete ${item.title}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </GlassPanel>

            {/* ──── Column 2: Analysis Overview (Donut Chart) ──── */}
            <GlassPanel
              hoverable
              className={cn("hero-fade-in", isViewingAnalysis && "ring-1 ring-brand/10")}
              style={{ animationDelay: "0.12s" }}
            >
              <div className="p-5">
                <CardHeader
                  title={isViewingAnalysis ? "Tier Breakdown" : "Analysis Overview"}
                  actions={
                    isViewingAnalysis ? (
                      <button
                        onClick={() => setSelectedAnalysisId(null)}
                        className="flex h-7 items-center gap-1.5 rounded-lg bg-brand/10 px-2.5 text-[11px] font-medium text-brand transition-colors hover:bg-brand/20"
                      >
                        <span className="max-w-[100px] truncate">{selectedAnalysis?.title}</span>
                        <X className="h-3 w-3" />
                      </button>
                    ) : (
                      <IconAction>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </IconAction>
                    )
                  }
                />
                <div className="mt-4">
                  <DonutChart segments={donutSegments} />
                </div>
              </div>
            </GlassPanel>

            {/* ──── Column 3: Contribution Activity / Top Scores ──── */}
            <GlassPanel
              hoverable
              className={cn("hero-fade-in", isViewingAnalysis && "ring-1 ring-brand/10")}
              style={{ animationDelay: "0.16s" }}
            >
              <div className="p-5">
                {isViewingAnalysis ? (
                  <>
                    <CardHeader
                      title="Top Scores"
                      actions={
                        <button
                          onClick={() => router.push(`/results/${selectedAnalysisId}`)}
                          className="flex h-7 items-center gap-1 rounded-lg bg-warm-100 px-2.5 text-[11px] font-medium text-warm-600 transition-colors hover:bg-warm-200"
                        >
                          Full view
                          <ArrowUpRight className="h-3 w-3" />
                        </button>
                      }
                    />
                    <div className="mt-4 space-y-2.5">
                      {selectedContributors.length === 0 ? (
                        <p className="py-6 text-center text-[12px] text-warm-400">No contributors</p>
                      ) : (
                        selectedContributors
                          .sort((a, b) => b.score - a.score)
                          .slice(0, 6)
                          .map((c, i) => {
                            const rankColors = ["#D4A017", "#6C63FF", "#2DA44E", "#E88D3F", "#9B6FE3", "#4A96D9"];
                            const barColor = rankColors[i % rankColors.length];
                            const tierColor = c.tier === "carry" ? "#D4A017" : c.tier === "solid" ? "#2DA44E" : "#E53935";

                            return (
                              <div key={c.name} className="flex items-center gap-2.5">
                                <span className="w-4 text-right text-[10px] font-semibold text-warm-400">
                                  {i + 1}
                                </span>
                                <div
                                  className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full text-[9px] font-bold text-white"
                                  style={{ backgroundColor: c.avatarUrl ? "transparent" : barColor }}
                                >
                                  {c.avatarUrl ? (
                                    <Image
                                      src={c.avatarUrl}
                                      alt={c.name}
                                      width={24}
                                      height={24}
                                      className="h-full w-full object-cover"
                                      referrerPolicy="no-referrer"
                                    />
                                  ) : (
                                    getInitials(c.name)
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between">
                                    <span className="truncate text-[12px] font-medium text-warm-700">
                                      {c.name}
                                    </span>
                                    <span
                                      className="ml-2 text-[11px] font-bold"
                                      style={{ color: tierColor }}
                                    >
                                      {c.score}
                                    </span>
                                  </div>
                                  <div className="mt-0.5 h-1 w-full overflow-hidden rounded-full bg-warm-100">
                                    <div
                                      className="h-full rounded-full transition-all duration-500"
                                      style={{
                                        width: `${Math.min(100, (c.score / 200) * 100)}%`,
                                        backgroundColor: barColor,
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          })
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <CardHeader
                      title="Contribution Activity"
                      actions={
                        <IconAction
                          onClick={() => toast("Activity filters coming soon")}
                          title="Filter activity"
                        >
                          <SlidersHorizontal className="h-3.5 w-3.5" />
                        </IconAction>
                      }
                    />
                    <div className="mt-3">
                      <ActivityChart
                        months={months}
                        docsData={docsActivityData}
                        reposData={reposActivityData}
                      />
                    </div>
                  </>
                )}
              </div>
            </GlassPanel>

            {/* ──── Column 4: Right Sidebar (spans 2 rows) ──── */}
            <div
              className="hero-fade-in space-y-5 xl:row-span-2"
              style={{ animationDelay: "0.2s" }}
            >
              {/* Recent Reports */}
              <GlassPanel>
                <div className="p-5">
                  <CardHeader
                    title="Recent Reports"
                    actions={
                      <IconAction>
                        <Calendar className="h-3.5 w-3.5" />
                      </IconAction>
                    }
                  />
                  <div className="mt-4 space-y-3">
                    {recentReports.length === 0 ? (
                      <p className="py-4 text-center text-[12px] text-warm-400">
                        No completed reports yet
                      </p>
                    ) : (
                      recentReports.map((report) => (
                        <div
                          key={report.analysisId}
                          onClick={() => router.push(`/results/${report.analysisId}`)}
                          className="cursor-pointer"
                        >
                          <ReportItem
                            label={report.label}
                            title={report.title}
                            time={report.time}
                            icon={
                              report.type === "doc" ? (
                                <FileText
                                  className="h-3 w-3"
                                  style={{ color: report.iconColor }}
                                />
                              ) : (
                                <GitBranch
                                  className="h-3 w-3"
                                  style={{ color: report.iconColor }}
                                />
                              )
                            }
                            iconBg={report.iconBg}
                          />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </GlassPanel>

              {/* Top Contributors */}
              <GlassPanel className={cn(isViewingAnalysis && "ring-1 ring-brand/10")}>
                <div className="p-5">
                  <CardHeader
                    title={isViewingAnalysis ? "Contributors" : "Top Contributors"}
                    actions={
                      <IconAction
                        onClick={() => toast("Contributor filters coming soon")}
                        title="Filter contributors"
                      >
                        <SlidersHorizontal className="h-3.5 w-3.5" />
                      </IconAction>
                    }
                  />
                  <div className="mt-4 space-y-3">
                    {topContributorCards.length === 0 ? (
                      <p className="py-4 text-center text-[12px] text-warm-400">
                        Run an analysis to see contributors
                      </p>
                    ) : (
                      topContributorCards.map((c) => (
                        <div
                          key={c.name}
                          onClick={() => router.push(`/results/${c.firstAnalysisId}`)}
                          className="cursor-pointer"
                        >
                          <ContributorTicket
                            name={c.name}
                            message={c.message}
                            avatarColor={c.color}
                            initials={c.initials}
                            avatarUrl={c.avatarUrl}
                            profileUrl={c.profileUrl}
                          />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </GlassPanel>
            </div>

            {/* ──── Row 2, Columns 2-3: Score Distribution ──── */}
            <GlassPanel
              className={cn("hero-fade-in lg:col-span-2 xl:col-span-2", isViewingAnalysis && "ring-1 ring-brand/10")}
              style={{ animationDelay: "0.24s" }}
            >
              <div className="p-5">
                <CardHeader
                  title={isViewingAnalysis ? `Score Distribution — ${selectedAnalysis?.title ?? ""}` : "Score Distribution"}
                  actions={
                    <IconAction
                      onClick={() => setScoreSortAsc((v) => !v)}
                      title={scoreSortAsc ? "Sort: Low → High" : "Sort: High → Low"}
                    >
                      <SlidersHorizontal className="h-3.5 w-3.5" />
                    </IconAction>
                  }
                />
                <div className="mt-4 space-y-4">
                  {effectiveTotal === 0 ? (
                    <p className="py-6 text-center text-[12px] text-warm-400">
                      No contributor scores yet
                    </p>
                  ) : (
                    (scoreSortAsc ? [...scoreBars].reverse() : scoreBars).map((bar, i) => (
                      <ScoreBar
                        key={bar.label}
                        label={bar.label}
                        count={bar.count}
                        total={bar.total}
                        percentage={bar.percentage}
                        color={bar.color}
                        delay={0.28 + i * 0.04}
                      />
                    ))
                  )}
                </div>
              </div>
            </GlassPanel>
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="ripple-effect group fixed bottom-8 right-8 z-30 flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-warm-900 shadow-layered-lg transition-all duration-200 hover:scale-110 hover:bg-warm-800 hover:shadow-xl active:scale-95"
        aria-label="New analysis"
      >
        <Plus className="fab-icon h-6 w-6 text-white" strokeWidth={2.5} />
      </button>

      <NewAnalysisModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
