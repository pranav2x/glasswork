"use client";

import { Suspense, useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { NewAnalysisModal } from "@/components/NewAnalysisModal";
import { GlassPanel } from "@/components/GlassPanel";
import { DonutChart } from "@/components/DashboardWidgets";
import { Plus, Search, GitBranch, FileText, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getInitials } from "@/lib/formatters";

/* ─── Sub-components ─── */

function AvatarImg({ src, name, initials }: { src: string; name: string; initials: string }) {
  const [err, setErr] = useState(false);
  if (err) return <>{initials}</>;
  return <Image src={src} alt={name} width={36} height={36} className="h-full w-full object-cover" referrerPolicy="no-referrer" onError={() => setErr(true)} />;
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
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const dashboardData = useQuery(api.analyses.getDashboardStats, { timeFilter: "month" });

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
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[80px] rounded-2xl bg-warm-100" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-[280px] rounded-2xl bg-warm-100" />
          ))}
        </div>
      </div>
    );
  }

  const { analyses, totalContributors, topContributors } = dashboardData;
  const isEmpty = analyses.length === 0;

  return (
    <>
      <div className="space-y-6">
        {/* ─── Header ─── */}
        <div className="hero-fade-in flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[13px] font-medium text-warm-400">
              Overview of all your analyses combined
            </p>
            <h1 className="mt-0.5 text-[28px] font-bold tracking-tight text-warm-900">
              Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div
              className="hero-fade-in flex items-center gap-2.5 rounded-2xl border border-warm-200 bg-white px-4 py-2.5 shadow-sm"
              style={{ animationDelay: "0.04s" }}
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
          <>
          {/* ─── Stat Chips Row (compact) ─── */}
          <div className="hero-fade-in grid grid-cols-3 gap-3" style={{ animationDelay: "0.06s" }}>
            {[
              { label: "Analyses", value: analyses.length },
              { label: "Contributors", value: totalContributors },
              { label: "Avg Score", value: dashboardData.avgScore },
            ].map((stat) => (
              <GlassPanel key={stat.label} className="p-5">
                <div className="text-[12px] font-medium text-warm-400">{stat.label}</div>
                <div className="mt-1.5 text-[36px] font-bold leading-none text-warm-900">{stat.value}</div>
              </GlassPanel>
            ))}
          </div>

          {/* ─── Bento Grid: Donut + Top Contributors ─── */}
          <div className="hero-fade-in grid grid-cols-1 gap-4 md:grid-cols-[1fr_1.6fr]" style={{ animationDelay: "0.1s" }}>
            {/* Score Distribution Donut (compact square) */}
            <GlassPanel hoverable className="flex flex-col">
              <div className="flex flex-1 flex-col p-6">
                <CardHeader title="Score Distribution" />
                <div className="flex flex-1 items-center justify-center mt-3">
                  <DonutChart
                    segments={[
                      { value: dashboardData.tierCounts.carry, color: "#111", label: "Locked In" },
                      { value: dashboardData.tierCounts.solid, color: "#737373", label: "Mid" },
                      { value: dashboardData.tierCounts.ghost, color: "#E5E5E5", label: "Selling" },
                    ]}
                  />
                </div>
              </div>
            </GlassPanel>

            {/* Top Contributors (wider panel, show more names) */}
            <GlassPanel hoverable className="flex flex-col">
              <div className="flex flex-1 flex-col p-6">
                <CardHeader title="Top Contributors" />
                <div className="mt-4 flex flex-1 flex-col justify-center space-y-4">
                  {topContributors.length === 0 ? (
                    <p className="py-6 text-center text-[12px] text-warm-400">
                      Run an analysis to see contributors
                    </p>
                  ) : (
                    topContributors.slice(0, 5).map((c) => (
                      <div
                        key={c.name}
                        className="flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-warm-50/50"
                        onClick={() => router.push(`/results/${c.firstAnalysisId}`)}
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-warm-200 text-[11px] font-bold text-warm-600">
                          {c.avatarUrl
                            ? <AvatarImg src={c.avatarUrl} name={c.name} initials={getInitials(c.name)} />
                            : getInitials(c.name)
                          }
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[14px] font-medium text-warm-700">{c.name}</span>
                            <span className="text-[14px] font-bold text-warm-900">{c.score}</span>
                          </div>
                          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-warm-100">
                            <div
                              className="h-full rounded-full bg-warm-800 transition-all duration-500"
                              style={{ width: `${Math.min(100, (c.score / 200) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </GlassPanel>
          </div>

          {/* ─── Recent Analyses Strip (full-width bento bottom row) ─── */}
          {analyses.length > 0 && (
            <div className="hero-fade-in" style={{ animationDelay: "0.14s" }}>
              <GlassPanel className="p-6">
                <CardHeader title="Recent Analyses" />
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {analyses.slice(0, 3).map((a) => (
                    <Link
                      key={a._id}
                      href={`/results/${a._id}`}
                      className="group/analysis flex items-center justify-between gap-3 rounded-xl border border-warm-100 p-4 transition-all duration-200 hover:border-warm-200 hover:bg-warm-50/50"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-warm-100">
                          {a.sourceType === "github_repo" ? (
                            <GitBranch className="h-3.5 w-3.5 text-warm-500" />
                          ) : (
                            <FileText className="h-3.5 w-3.5 text-warm-500" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-semibold text-warm-800">
                            {a.title}
                          </p>
                          <Badge
                            variant="outline"
                            className={`mt-1 text-[10px] font-medium ${
                              a.sourceType === "google_doc"
                                ? "border-docs-accent/20 text-docs-accent"
                                : "border-repo-accent/20 text-repo-accent"
                            }`}
                          >
                            {a.sourceType === "google_doc" ? "Google Doc" : "GitHub Repo"}
                          </Badge>
                        </div>
                      </div>
                      <ArrowUpRight className="h-4 w-4 shrink-0 text-warm-300 transition-colors group-hover/analysis:text-warm-500" />
                    </Link>
                  ))}
                </div>
              </GlassPanel>
            </div>
          )}
          </>
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
