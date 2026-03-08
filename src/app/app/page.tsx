"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { NewAnalysisModal } from "@/components/NewAnalysisModal";
import {
  BentoGlobalScore,
  BentoAIFeed,
  BentoActivityHeatmap,
  BentoCarryStreak,
  BentoRecentProjects,
} from "@/components/BentoWidgets";
import { Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

/* ─── Helpers ─── */

function computeCarryStreak(
  analyses: { topContributor: { tier: string } | null }[]
): number {
  let streak = 0;
  for (const a of analyses) {
    if (a.topContributor && a.topContributor.tier !== "ghost") {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

function determineAvgTier(avgScore: number): "carry" | "solid" | "ghost" {
  if (avgScore >= 130) return "carry";
  if (avgScore >= 70) return "solid";
  return "ghost";
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
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const dashboardData = useQuery(api.analyses.getDashboardStats, { timeFilter: "month" });
  const analyses = useQuery(api.analyses.listAnalyses, {});

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isAuthLoading, router]);

  if (isAuthLoading || dashboardData === undefined || analyses === undefined) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-48 rounded-xl bg-warm-200" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
          <Skeleton className="h-[200px] rounded-2xl bg-warm-100" />
          <Skeleton className="col-span-2 h-[200px] rounded-2xl bg-warm-100" />
          <Skeleton className="row-span-2 h-[416px] rounded-2xl bg-warm-100" />
          <Skeleton className="h-[200px] rounded-2xl bg-warm-100" />
          <Skeleton className="h-[200px] rounded-2xl bg-warm-100" />
        </div>
      </div>
    );
  }

  const { avgScore, activityByMonth } = dashboardData;
  const isEmpty = dashboardData.analyses.length === 0;

  // Compute carry streak from sorted analyses (most recent first)
  const carryStreak = computeCarryStreak(analyses);
  const avgTier = determineAvgTier(avgScore);

  // Prepare AI feed summaries
  const aiSummaries = analyses
    .filter((a) => a.summary)
    .slice(0, 3)
    .map((a) => ({
      id: a._id,
      title: a.title,
      summary: a.summary!,
    }));

  // Recent projects for the widget
  const recentProjects = analyses.slice(0, 5);

  return (
    <>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="hero-fade-in">
          <p className="text-[13px] font-medium text-warm-400">
            Welcome back
          </p>
          <h1 className="mt-0.5 text-[28px] font-bold tracking-tight text-warm-900">
            Home
          </h1>
        </div>

        {/* Empty State */}
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
          /* ─── Bento Grid ─── */
          <div className="hero-fade-in grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4 auto-rows-[200px]" style={{ animationDelay: "0.06s" }}>
            {/* Global Score — large square */}
            <BentoGlobalScore
              avgScore={avgScore}
              avgTier={avgTier}
              className="md:col-span-1 md:row-span-1"
            />

            {/* AI Feed — wide rectangle */}
            <BentoAIFeed
              summaries={aiSummaries}
              className="md:col-span-2 md:row-span-1"
            />

            {/* Recent Projects — tall, far right on lg */}
            <BentoRecentProjects
              analyses={recentProjects}
              className="md:col-span-1 md:row-span-2 lg:col-start-4 lg:row-start-1"
            />

            {/* Activity Heatmap — spans 2 cols to fill empty space */}
            <BentoActivityHeatmap
              activityByMonth={activityByMonth}
              className="md:col-span-2 md:row-span-1"
            />

            {/* Carry Streak */}
            <BentoCarryStreak
              streak={carryStreak}
              className="md:col-span-1 md:row-span-1"
            />
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="ripple-effect group fixed bottom-8 right-8 z-30 flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-warm-800 to-warm-900 shadow-layered-lg ring-2 ring-white/20 transition-all duration-200 hover:scale-110 hover:shadow-xl active:scale-95"
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
