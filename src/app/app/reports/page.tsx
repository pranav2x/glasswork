"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { GlassPanel } from "@/components/GlassPanel";
import { PageTransition } from "@/components/PageTransition";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatTimeAgo } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import {
  FileText,
  ArrowUpRight,
  Users,
  Trophy,
} from "lucide-react";

export default function ReportsPage() {
  const router = useRouter();
  const analyses = useQuery(api.analyses.listAnalyses, {});
  const [filter, setFilter] = useState<"all" | "docs" | "repos">("all");

  if (analyses === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48 rounded-xl bg-warm-200" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[180px] rounded-2xl bg-warm-100" />
          ))}
        </div>
      </div>
    );
  }

  const completedAnalyses = analyses.filter((a) => a.status === "ready");
  const filtered = completedAnalyses.filter((a) => {
    if (filter === "docs") return a.sourceType === "google_doc";
    if (filter === "repos") return a.sourceType === "github_repo";
    return true;
  });

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="hero-fade-in flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[13px] font-medium text-warm-400">
              View all completed analysis reports
            </p>
            <h1 className="mt-0.5 text-[28px] font-bold tracking-tight text-warm-900">
              Reports
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {(["all", "docs", "repos"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-[12px] font-semibold transition-all duration-200",
                  filter === f
                    ? "bg-warm-900 text-white shadow-sm"
                    : "bg-warm-100 text-warm-500 hover:bg-warm-200 hover:text-warm-700"
                )}
              >
                {f === "all" ? "All" : f === "docs" ? "Docs" : "Repos"}
              </button>
            ))}
          </div>
        </div>

        {/* Reports Grid */}
        {filtered.length === 0 ? (
          <div className="hero-fade-in flex flex-col items-center justify-center rounded-2xl border border-dashed border-warm-300 bg-warm-50/50 py-20">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-warm-100">
              <FileText className="h-6 w-6 text-warm-400" />
            </div>
            <h3 className="mt-4 text-[16px] font-semibold text-warm-800">
              No reports yet
            </h3>
            <p className="mt-1 text-[13px] text-warm-500">
              Complete an analysis to see it here as a report
            </p>
            <button
              onClick={() => router.push("/app")}
              className="mt-5 rounded-xl bg-warm-900 px-5 py-2.5 text-[13px] font-semibold text-white shadow-sm transition-all hover:bg-warm-800 hover:scale-105 active:scale-95"
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((report, i) => {
              const isDoc = report.sourceType === "google_doc";
              return (
                <GlassPanel
                  key={report._id}
                  hoverable
                  className="hero-fade-in cursor-pointer"
                  style={{ animationDelay: `${0.04 + i * 0.04}s` }}
                >
                  <div
                    className="p-5"
                    onClick={() => router.push(`/results/${report._id}`)}
                  >
                    {/* Type badge + time */}
                    <div className="flex items-center justify-between">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] font-medium uppercase",
                          isDoc
                            ? "border-brand/30 bg-brand/[0.08] text-brand"
                            : "border-repo-accent/30 bg-repo-accent/[0.08] text-repo-accent"
                        )}
                      >
                        {isDoc ? "Doc Analysis" : "Repo Analysis"}
                      </Badge>
                      <span className="text-[11px] text-warm-400">
                        {formatTimeAgo(report.updatedAt)}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="mt-3 truncate text-[15px] font-semibold text-warm-900">
                      {report.title}
                    </h3>

                    {/* Stats row */}
                    <div className="mt-3 flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-[12px] text-warm-500">
                        <Users className="h-3.5 w-3.5" />
                        <span>{report.contributorCount} contributors</span>
                      </div>
                      {report.topContributor && (
                        <div className="flex items-center gap-1.5 text-[12px] text-warm-500">
                          <Trophy className="h-3.5 w-3.5" />
                          <span>
                            {report.topContributor.name}: {report.topContributor.score}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* View link */}
                    <div className="mt-4 flex items-center gap-1 text-[12px] font-medium text-warm-500 transition-colors group-hover:text-warm-700">
                      <span>View report</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </GlassPanel>
              );
            })}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
