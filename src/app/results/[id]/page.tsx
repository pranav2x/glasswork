"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { GlassPanel } from "@/components/GlassPanel";
import { GlassButton } from "@/components/GlassButton";
import { ContributorCard } from "@/components/ContributorCard";
import { ResultsSkeleton } from "@/components/ResultsSkeleton";
import { Badge } from "@/components/ui/badge";
import { mapConvexAnalysis } from "@/lib/mappers";
import { cn } from "@/lib/utils";

export default function ResultsPage() {
  const params = useParams();
  const analysisId = params.id as string;
  const [copied, setCopied] = useState(false);

  const data = useQuery(api.analyses.getAnalysis, {
    analysisId: analysisId as Id<"analyses">,
  });

  function handleCopyLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Loading state — query hasn't returned yet
  if (data === undefined) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-24 md:px-8 space-y-8">
        <ResultsSkeleton />
      </div>
    );
  }

  // Not found
  if (data === null) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-24 md:px-8">
        <div className="flex justify-center pt-16">
          <GlassPanel className="max-w-md p-10 text-center">
            <h2 className="font-display text-2xl font-semibold tracking-display text-white/85">
              Analysis not found
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/40">
              This analysis may have been deleted or the link is invalid.
            </p>
            <Link href="/app" className="mt-6 inline-block">
              <GlassButton variant="primary">Go to Workspace</GlassButton>
            </Link>
          </GlassPanel>
        </div>
      </div>
    );
  }

  const isDoc = data.sourceType === "google_doc";
  const mapped =
    data.status === "ready" && data.contributors.length > 0
      ? mapConvexAnalysis(data, data.contributors)
      : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-24 md:px-8 space-y-8">
      {/* Top Meta Bar */}
      <div className="hero-fade-in" style={{ animationDelay: "0s" }}>
        <GlassPanel className="flex flex-col items-start justify-between gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
          {/* Left: Source info */}
          <div className="flex items-center gap-3">
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
            <span className="text-[15px] font-semibold text-white/85">
              {data.title}
            </span>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <Link href="/app">
              <GlassButton variant="ghost" size="sm">
                Workspace
              </GlassButton>
            </Link>
            <GlassButton variant="ghost" size="sm" onClick={handleCopyLink}>
              {copied ? "Copied!" : "Copy share link"}
            </GlassButton>
          </div>
        </GlassPanel>
      </div>

      {/* Pending state */}
      {data.status === "pending" && <ResultsSkeleton />}

      {/* Error state */}
      {data.status === "error" && (
        <div className="flex justify-center pt-8">
          <GlassPanel className="max-w-md p-10 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#f97373]/10">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                className="text-[#f97373]"
              >
                <path
                  d="M12 9v4m0 4h.01M12 3l9.66 16.59A1 1 0 0120.8 21H3.2a1 1 0 01-.86-1.41L12 3z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h2 className="font-display text-xl font-semibold tracking-display text-white/85">
              Analysis failed
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#f97373]/70">
              {data.errorMessage || "An unexpected error occurred."}
            </p>
            <Link href="/app" className="mt-6 inline-block">
              <GlassButton variant="primary">Back to Workspace</GlassButton>
            </Link>
          </GlassPanel>
        </div>
      )}

      {/* Empty state (ready but no contributors) */}
      {data.status === "ready" && data.contributors.length === 0 && (
        <div className="flex justify-center pt-8">
          <GlassPanel className="max-w-md p-10 text-center">
            <h2 className="font-display text-2xl font-semibold tracking-display text-white/85">
              No contributors found
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/40">
              {isDoc
                ? "This document doesn't have accessible revision history, or all revisions are by the same anonymous user."
                : "This repository has no commits or the API couldn't retrieve contributor data."}
            </p>
            <Link href="/app" className="mt-6 inline-block">
              <GlassButton variant="primary">Back to Workspace</GlassButton>
            </Link>
          </GlassPanel>
        </div>
      )}

      {/* Data state — Contributor Grid */}
      {mapped && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mapped.contributors.map((contributor, i) => (
            <ContributorCard
              key={contributor.id}
              contributor={contributor}
              index={i}
            />
          ))}
        </div>
      )}
    </div>
  );
}
