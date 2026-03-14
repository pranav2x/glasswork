"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { NewAnalysisModal } from "@/components/NewAnalysisModal";
import { PageTransition } from "@/components/PageTransition";
import {
  BentoGlobalScore,
  BentoAIFeed,
  BentoActivityHeatmap,
  BentoCarryStreak,
  BentoRecentProjects,
} from "@/components/BentoWidgets";
import { Plus } from "lucide-react";

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

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
  const user = useQuery(api.users.getCurrentUser);
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
        <div className="h-8 w-48 rounded-xl bg-white/[0.04] shimmer-bg" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
          <div className="h-[200px] rounded-2xl bg-white/[0.04] shimmer-bg" />
          <div className="col-span-2 h-[200px] rounded-2xl bg-white/[0.04] shimmer-bg" />
          <div className="row-span-2 h-[416px] rounded-2xl bg-white/[0.04] shimmer-bg" />
          <div className="h-[200px] rounded-2xl bg-white/[0.04] shimmer-bg" />
          <div className="h-[200px] rounded-2xl bg-white/[0.04] shimmer-bg" />
        </div>
      </div>
    );
  }

  const { avgScore, activityByMonth } = dashboardData;
  const isEmpty = dashboardData.analyses.length === 0;
  const carryStreak = computeCarryStreak(analyses);
  const avgTier = determineAvgTier(avgScore);
  const firstName = user?.name?.split(" ")[0] ?? "there";

  const aiSummaries = analyses
    .filter((a) => a.summary)
    .slice(0, 3)
    .map((a) => ({
      id: a._id,
      title: a.title,
      summary: a.summary!,
    }));

  const recentProjects = analyses.slice(0, 5);

  return (
    <PageTransition>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="hero-fade-in">
          <p className="text-[13px] font-medium text-warm-500">
            {getGreeting()}, {firstName}. Let&apos;s see who&apos;s actually working.
          </p>
          <h1 className="mt-0.5 text-[28px] font-bold tracking-tight text-warm-900">
            Home
          </h1>
        </div>

        {/* Empty State */}
        {isEmpty ? (
          <div className="hero-fade-in flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.12] bg-white/[0.02] py-20" style={{ animationDelay: "0.08s" }}>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 border border-brand/20">
              <Plus className="h-6 w-6 text-brand" strokeWidth={1.5} />
            </div>
            <h3 className="mt-4 text-[16px] font-semibold text-warm-800">Drop your first link</h3>
            <p className="mt-1 text-[13px] text-warm-500">Paste a Google Doc or GitHub repo to get started</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-5 rounded-xl bg-brand px-5 py-2.5 text-[13px] font-semibold text-white shadow-[0_0_20px_rgba(124,111,255,0.3)] transition-all hover:bg-brand-light hover:shadow-[0_0_30px_rgba(124,111,255,0.5)] hover:scale-105 active:scale-95"
            >
              New Analysis
            </button>
          </div>
        ) : (
          <div className="hero-fade-in grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4 auto-rows-[200px]" style={{ animationDelay: "0.06s" }}>
            <BentoGlobalScore
              avgScore={avgScore}
              avgTier={avgTier}
              className="md:col-span-1 md:row-span-1"
            />
            <BentoAIFeed
              summaries={aiSummaries}
              className="md:col-span-2 md:row-span-1"
            />
            <BentoRecentProjects
              analyses={recentProjects}
              className="md:col-span-1 md:row-span-2 lg:col-start-4 lg:row-start-1"
            />
            <BentoActivityHeatmap
              activityByMonth={activityByMonth}
              className="md:col-span-2 md:row-span-1"
            />
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
        className="ripple-effect group fixed bottom-8 right-8 z-30 flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-brand shadow-glow-brand ring-2 ring-brand/20 transition-all duration-200 hover:scale-110 hover:shadow-[0_0_50px_rgba(124,111,255,0.5)] active:scale-95"
        aria-label="New analysis"
      >
        <Plus className="fab-icon h-6 w-6 text-white" strokeWidth={2.5} />
      </button>

      <NewAnalysisModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </PageTransition>
  );
}
