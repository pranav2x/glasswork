"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useConvexAuth, useQuery } from "convex/react";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { getInitials, formatTimeAgo } from "@/lib/formatters";

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

function IconAction({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <button
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

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTaskFilter, setActiveTaskFilter] = useState<"docs" | "repos">("docs");
  const [activeTimeFilter, setActiveTimeFilter] = useState<"today" | "week" | "month">("month");

  const dashboardData = useQuery(api.analyses.getDashboardStats, { timeFilter: activeTimeFilter });

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

  const filteredAnalyses = analyses.filter((a) =>
    activeTaskFilter === "docs"
      ? a.sourceType === "google_doc"
      : a.sourceType === "github_repo"
  );

  const donutSegments = [
    { value: statusCounts.ready, color: "#4A96D9", label: "Completed" },
    { value: statusCounts.pending, color: "#F5A623", label: "In Progress" },
    { value: statusCounts.error, color: "#E53935", label: "Failed" },
  ];

  const scoreBars = [
    { label: "Excellent", count: scoreDistribution.excellent, total: "Score 80–100", percentage: totalContributors > 0 ? Math.round((scoreDistribution.excellent / totalContributors) * 100) : 0, color: "#2DA44E" },
    { label: "Good", count: scoreDistribution.good, total: "Score 60–79", percentage: totalContributors > 0 ? Math.round((scoreDistribution.good / totalContributors) * 100) : 0, color: "#4A96D9" },
    { label: "Fair", count: scoreDistribution.fair, total: "Score 40–59", percentage: totalContributors > 0 ? Math.round((scoreDistribution.fair / totalContributors) * 100) : 0, color: "#9B6FE3" },
    { label: "Needs Work", count: scoreDistribution.needsWork, total: "Score 20–39", percentage: totalContributors > 0 ? Math.round((scoreDistribution.needsWork / totalContributors) * 100) : 0, color: "#E53935" },
    { label: "Minimal", count: scoreDistribution.minimal, total: "Score 0–19", percentage: totalContributors > 0 ? Math.round((scoreDistribution.minimal / totalContributors) * 100) : 0, color: "#F5A623" },
  ];

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

  const topContributorCards = topContributors.slice(0, 3).map((c) => ({
    name: c.name,
    message: `Score: ${c.score} across ${c.analysisCount} ${c.analysisCount === 1 ? "analysis" : "analyses"}`,
    initials: getInitials(c.name),
    color: c.tier === "carry" ? "#F5A623" : c.tier === "solid" ? "#2DA44E" : "#E53935",
    firstAnalysisId: c.firstAnalysisId,
  }));

  const isEmpty = analyses.length === 0;

  return (
    <>
      <div className="space-y-6">
        {/* ─── Header ─── */}
        <div className="hero-fade-in flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[13px] font-medium text-warm-400">
              Monitor and analyze your contributions
            </p>
            <h1 className="mt-0.5 text-[28px] font-bold tracking-tight text-warm-900">
              Analysis Dashboard
            </h1>
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
                type="text"
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
                        onClick={() => item.status === "ready" ? router.push(`/results/${item._id}`) : undefined}
                        className={item.status === "ready" ? "cursor-pointer" : ""}
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
                    ))
                  )}
                </div>
              </div>
            </GlassPanel>

            {/* ──── Column 2: Analysis Overview (Donut Chart) ──── */}
            <GlassPanel
              hoverable
              className="hero-fade-in"
              style={{ animationDelay: "0.12s" }}
            >
              <div className="p-5">
                <CardHeader
                  title="Analysis Overview"
                  actions={
                    <IconAction>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </IconAction>
                  }
                />
                <div className="mt-4">
                  <DonutChart segments={donutSegments} />
                </div>
              </div>
            </GlassPanel>

            {/* ──── Column 3: Contribution Activity (Line Chart) ──── */}
            <GlassPanel
              hoverable
              className="hero-fade-in"
              style={{ animationDelay: "0.16s" }}
            >
              <div className="p-5">
                <CardHeader
                  title="Contribution Activity"
                  actions={
                    <>
                      <IconAction>
                        <SlidersHorizontal className="h-3.5 w-3.5" />
                      </IconAction>
                      <IconAction>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </IconAction>
                    </>
                  }
                />
                <div className="mt-3">
                  <ActivityChart
                    months={months}
                    docsData={docsActivityData}
                    reposData={reposActivityData}
                  />
                </div>
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
              <GlassPanel>
                <div className="p-5">
                  <CardHeader
                    title="Top Contributors"
                    actions={
                      <IconAction>
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
              className="hero-fade-in lg:col-span-2 xl:col-span-2"
              style={{ animationDelay: "0.24s" }}
            >
              <div className="p-5">
                <CardHeader
                  title="Score Distribution"
                  actions={
                    <IconAction>
                      <SlidersHorizontal className="h-3.5 w-3.5" />
                    </IconAction>
                  }
                />
                <div className="mt-4 space-y-4">
                  {totalContributors === 0 ? (
                    <p className="py-6 text-center text-[12px] text-warm-400">
                      No contributor scores yet
                    </p>
                  ) : (
                    scoreBars.map((bar, i) => (
                      <ScoreBar
                        key={i}
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
