"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useConvexAuth } from "convex/react";
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
  ChevronDown,
  ArrowUpRight,
  SlidersHorizontal,
  FileText,
  GitBranch,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

/* ─── Mock Data ─── */

const SCORE_BARS = [
  { label: "Excellent", count: 8, total: "Score 80–100", percentage: 72, color: "#2DA44E" },
  { label: "Good", count: 12, total: "Score 60–79", percentage: 58, color: "#4A96D9" },
  { label: "Fair", count: 6, total: "Score 40–59", percentage: 45, color: "#9B6FE3" },
  { label: "Needs Work", count: 4, total: "Score 20–39", percentage: 30, color: "#E53935" },
  { label: "Minimal", count: 2, total: "Score 0–19", percentage: 15, color: "#F5A623" },
];

const ANALYSIS_ITEMS = [
  {
    title: "Project Alpha — Final Report",
    description: "CS 301 group project document analysis",
    iconBg: "#EEF0FF",
    iconColor: "#6C63FF",
    type: "doc" as const,
    isComplete: true,
  },
  {
    title: "react-query — Contributors",
    description: "Open source contributor pattern analysis",
    iconBg: "#F0FDF4",
    iconColor: "#2DA44E",
    type: "repo" as const,
    isComplete: true,
  },
  {
    title: "Weekly Standup Notes",
    description: "Team standup notes contribution tracking",
    iconBg: "#EEF0FF",
    iconColor: "#6C63FF",
    type: "doc" as const,
    isComplete: false,
  },
  {
    title: "API Microservices Repo",
    description: "Backend repository commit analysis",
    iconBg: "#F0FDF4",
    iconColor: "#2DA44E",
    type: "repo" as const,
    isComplete: true,
  },
];

const REPORTS = [
  { label: "Doc Analysis", title: "Project Alpha", time: "2:30 PM", iconBg: "#EEF0FF", iconColor: "#6C63FF", type: "doc" },
  { label: "Repo Analysis", title: "API Services", time: "11:15 AM", iconBg: "#F0FDF4", iconColor: "#2DA44E", type: "repo" },
];

const CONTRIBUTORS = [
  { name: "Sarah Chen", message: "Top contributor on 3 analyses with an average score of 92.", initials: "SC", color: "#6C63FF" },
  { name: "Marcus Rivera", message: "Consistent contributions across all Google Docs projects.", initials: "MR", color: "#2DA44E" },
  { name: "Priya Sharma", message: "Highest commit frequency on the API microservices repo.", initials: "PS", color: "#F5A623" },
];

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

/* ─── Main Dashboard ─── */

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTaskFilter, setActiveTaskFilter] = useState<"docs" | "repos">("docs");

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isAuthLoading, router]);

  if (isAuthLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64 rounded-xl bg-warm-200" />
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[280px] rounded-2xl bg-warm-100" />
          ))}
        </div>
      </div>
    );
  }

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

        {/* ─── Dashboard Grid ─── */}
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
                  8
                </span>
                <span className="text-[12px] font-medium text-warm-600">
                  Active Analyses
                </span>
                <ChevronDown className="h-3 w-3 text-warm-400" />
              </div>

              {/* Analysis list */}
              <div className="mt-4 space-y-1">
                {ANALYSIS_ITEMS.map((item, i) => (
                  <AnalysisItem
                    key={i}
                    icon={
                      item.type === "doc" ? (
                        <DocIcon color={item.iconColor} />
                      ) : (
                        <RepoIcon color={item.iconColor} />
                      )
                    }
                    iconBg={item.iconBg}
                    title={item.title}
                    description={item.description}
                    isComplete={item.isComplete}
                    delay={0.1 + i * 0.04}
                  />
                ))}
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
                <DonutChart />
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
                <ActivityChart />
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
                  {REPORTS.map((report, i) => (
                    <ReportItem
                      key={i}
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
                  ))}
                </div>
                <button className="mt-4 flex w-full items-center justify-center gap-1 text-[12px] font-semibold text-warm-500 transition-colors hover:text-warm-700">
                  See All Reports
                  <ChevronDown className="h-3 w-3 rotate-[-90deg]" />
                </button>
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
                  {CONTRIBUTORS.map((c, i) => (
                    <ContributorTicket
                      key={i}
                      name={c.name}
                      message={c.message}
                      avatarColor={c.color}
                      initials={c.initials}
                    />
                  ))}
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
                {SCORE_BARS.map((bar, i) => (
                  <ScoreBar
                    key={i}
                    label={bar.label}
                    count={bar.count}
                    total={bar.total}
                    percentage={bar.percentage}
                    color={bar.color}
                    delay={0.28 + i * 0.04}
                  />
                ))}
              </div>
            </div>
          </GlassPanel>
        </div>
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
