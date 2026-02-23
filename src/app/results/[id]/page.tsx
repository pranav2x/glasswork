"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { GlassPanel } from "@/components/GlassPanel";
import { GlassButton } from "@/components/GlassButton";
import { ContributorCard } from "@/components/ContributorCard";
import { AnalysisLoadingCinematic } from "@/components/AnalysisLoadingCinematic";
import { PageTransition } from "@/components/PageTransition";
import { Badge } from "@/components/ui/badge";
import { mapConvexAnalysis } from "@/lib/mappers";
import { cn } from "@/lib/utils";
import { Users, BarChart3, Sparkles } from "lucide-react";

function TypewriterText({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState("");
  const indexRef = useRef(0);

  useEffect(() => {
    indexRef.current = 0;
    setDisplayed("");
    const interval = setInterval(() => {
      indexRef.current++;
      if (indexRef.current <= text.length) {
        setDisplayed(text.slice(0, indexRef.current));
      } else {
        clearInterval(interval);
      }
    }, 25);
    return () => clearInterval(interval);
  }, [text]);

  return (
    <span>
      {displayed}
      {displayed.length < text.length && (
        <span className="animate-cursor-blink ml-[1px] text-brand">|</span>
      )}
    </span>
  );
}

export default function ResultsPage() {
  const params = useParams();
  const analysisId = params.id as string;
  const [copied, setCopied] = useState(false);
  const prevStatusRef = useRef<string | undefined>(undefined);
  const confettiFiredRef = useRef(false);

  const data = useQuery(api.analyses.getAnalysis, {
    analysisId: analysisId as Id<"analyses">,
  });

  // Fire confetti when transitioning from pending to ready
  useEffect(() => {
    if (data && !confettiFiredRef.current) {
      if (prevStatusRef.current === "pending" && data.status === "ready") {
        confettiFiredRef.current = true;
        confetti({
          colors: ["#6C63FF", "#D4A017", "#2DA44E"],
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 },
        });
      }
      prevStatusRef.current = data.status;
    }
  }, [data]);

  function handleCopyLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (data === undefined) {
    return (
      <div className="mx-auto max-w-6xl space-y-8 py-8">
        <AnalysisLoadingCinematic sourceType="github_repo" />
      </div>
    );
  }

  if (data === null) {
    return (
      <PageTransition>
        <div className="mx-auto max-w-6xl py-8">
          <div className="flex justify-center pt-16">
            <GlassPanel className="max-w-md p-10 text-center">
              <h2 className="font-display text-2xl font-normal tracking-display text-warm-900">
                Analysis not found
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-warm-500">
                This analysis may have been deleted or the link is invalid.
              </p>
              <Link href="/app" className="mt-6 inline-block">
                <GlassButton variant="primary">Go to Workspace</GlassButton>
              </Link>
            </GlassPanel>
          </div>
        </div>
      </PageTransition>
    );
  }

  const isDoc = data.sourceType === "google_doc";
  const mapped =
    data.status === "ready" && data.contributors.length > 0
      ? mapConvexAnalysis(data, data.contributors)
      : null;

  // Calculate summary stats
  const summaryStats = mapped
    ? {
        total: mapped.contributors.length,
        avgScore: Math.round(
          mapped.contributors.reduce((sum, c) => sum + c.fairShareScore, 0) /
            mapped.contributors.length
        ),
        lockedIn: mapped.contributors.filter((c) => c.tier === "carry").length,
        notLockedIn: mapped.contributors.filter((c) => c.tier === "ghost").length,
      }
    : null;

  return (
    <PageTransition>
      <div className="mx-auto max-w-6xl space-y-6 py-8">
        {/* Top Meta Bar */}
        <div className="hero-fade-in" style={{ animationDelay: "0s" }}>
          <GlassPanel className="flex flex-col items-start justify-between gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
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
              <span className="text-[15px] font-semibold text-warm-900">
                {data.title}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Link href={`/app/analytics?analysis=${analysisId}`}>
                <GlassButton variant="ghost" size="sm">
                  Analytics
                </GlassButton>
              </Link>
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

        {data.status === "pending" && (
          <AnalysisLoadingCinematic sourceType={data.sourceType} />
        )}

        {data.status === "error" && (
          <div className="flex justify-center pt-8">
            <GlassPanel className="max-w-md p-10 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-danger/10">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-danger">
                  <path
                    d="M12 9v4m0 4h.01M12 3l9.66 16.59A1 1 0 0120.8 21H3.2a1 1 0 01-.86-1.41L12 3z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h2 className="font-display text-xl font-normal tracking-display text-warm-900">
                Analysis failed
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-danger/70">
                {data.errorMessage || "An unexpected error occurred."}
              </p>
              <Link href="/app" className="mt-6 inline-block">
                <GlassButton variant="primary">Back to Workspace</GlassButton>
              </Link>
            </GlassPanel>
          </div>
        )}

        {data.status === "ready" && data.contributors.length === 0 && (
          <div className="flex justify-center pt-8">
            <GlassPanel className="max-w-md p-10 text-center">
              <h2 className="font-display text-2xl font-normal tracking-display text-warm-900">
                No contributors found
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-warm-500">
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

        {/* AI Narrative */}
        {mapped && "summary" in data && data.summary && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <GlassPanel className="border-l-2 border-l-brand/30 p-5">
              <div className="mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-brand" />
                <span className="text-[11px] font-bold uppercase tracking-micro text-brand">
                  AI Insight
                </span>
              </div>
              <p className="text-[14px] leading-relaxed text-warm-700">
                <TypewriterText text={data.summary as string} />
              </p>
            </GlassPanel>
          </motion.div>
        )}

        {/* Summary Strip */}
        {summaryStats && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <GlassPanel className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <motion.div
                  className="flex items-center gap-2"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <Users className="h-4 w-4 text-warm-500" />
                  <span className="text-[13px] font-semibold text-warm-800">
                    {summaryStats.total} contributors
                  </span>
                </motion.div>

                <motion.div
                  className="flex items-center gap-2"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <BarChart3 className="h-4 w-4 text-warm-500" />
                  <span className="text-[13px] font-semibold text-warm-800">
                    Avg score: {summaryStats.avgScore}
                  </span>
                </motion.div>

                <motion.div
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  {summaryStats.lockedIn > 0 && (
                    <span className="flex items-center gap-1.5 text-[12px] font-semibold">
                      <span className="h-2 w-2 rounded-full bg-warm-900" />
                      <span className="text-warm-900">{summaryStats.lockedIn} Chad</span>
                    </span>
                  )}
                  {summaryStats.notLockedIn > 0 && (
                    <span className="flex items-center gap-1.5 text-[12px] font-semibold">
                      <span className="h-2 w-2 rounded-full bg-warm-400" />
                      <span className="text-warm-500">{summaryStats.notLockedIn} Subhuman</span>
                    </span>
                  )}
                </motion.div>

                <motion.span
                  className="text-[11px] text-warm-400"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  Analyzed just now
                </motion.span>
              </div>
            </GlassPanel>
          </motion.div>
        )}

        {mapped && (
          <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3">
            {(() => {
              const maxScore = Math.max(...mapped.contributors.map((c) => c.fairShareScore), 1);
              return mapped.contributors.map((contributor, i) => (
                <ContributorCard
                  key={contributor.id}
                  contributor={contributor}
                  index={i}
                  maxScore={maxScore}
                />
              ));
            })()}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
