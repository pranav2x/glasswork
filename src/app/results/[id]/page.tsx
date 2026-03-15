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
import { ReceiptCard } from "@/components/ReceiptCard";
import { Badge } from "@/components/ui/badge";
import { mapConvexAnalysis } from "@/lib/mappers";
import { Users, BarChart3, Sparkles, Share2, Download, Trophy, Ghost } from "lucide-react";

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
  const [showReceipt, setShowReceipt] = useState(false);
  const [showTweetModal, setShowTweetModal] = useState(false);
  const prevStatusRef = useRef<string | undefined>(undefined);
  const confettiFiredRef = useRef(false);

  const data = useQuery(api.analyses.getAnalysis, {
    analysisId: analysisId as Id<"analyses">,
  });

  useEffect(() => {
    if (data && !confettiFiredRef.current) {
      if (prevStatusRef.current === "pending" && data.status === "ready") {
        confettiFiredRef.current = true;
        confetti({
          colors: ["#A78BFA", "#34D399", "#F87171", "#7C6FFF"],
          particleCount: 150,
          spread: 100,
          origin: { y: 0.4 },
          gravity: 0.8,
          scalar: 1.2,
        });
        setTimeout(() => {
          confetti({
            colors: ["#A78BFA", "#34D399", "#F87171", "#7C6FFF"],
            particleCount: 80,
            spread: 60,
            origin: { y: 0.2 },
            gravity: 1,
            scalar: 0.9,
          });
        }, 300);
      }
      prevStatusRef.current = data.status;
    }
  }, [data]);

  function handleCopyLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function buildTweetText(): string {
    if (!mapped) return "";
    const sorted = [...mapped.contributors].sort((a, b) => b.fairShareScore - a.fairShareScore);
    const tierEmoji = (tier: string) => tier === "carry" ? "🔒" : tier === "solid" ? "📊" : "💀";
    const tierLabel = (tier: string) => tier === "carry" ? "LOCKED IN" : tier === "solid" ? "MID" : "SELLING";
    const lines = sorted
      .map((c) => `${tierEmoji(c.tier)} ${c.name} — ${tierLabel(c.tier)} (${c.fairShareScore})`)
      .join("\n");
    return `just ran my group project through Glasswork and...\n\n${lines}\n\nno surveys. just data. 💀`;
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
              <h2 className="font-display text-2xl font-bold tracking-tight text-warm-900">
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
      <div className="mx-auto max-w-6xl space-y-6 py-8 pb-24">
        {/* Top Meta Bar */}
        <div className="hero-fade-in" style={{ animationDelay: "0s" }}>
          <GlassPanel className="p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Badge
                  variant="outline"
                  className="text-[10px] font-semibold border-white/[0.10] bg-white/[0.04] text-warm-500 uppercase tracking-[0.1em] mb-2"
                >
                  {isDoc ? "Google Doc" : "GitHub Repo"}
                </Badge>
                <h1 className="text-[22px] font-bold text-warm-900 tracking-tight">
                  {data.title}
                </h1>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Link href={`/app/reports?id=${analysisId}`}>
                  <GlassButton variant="ghost" size="sm">
                    Report
                  </GlassButton>
                </Link>
                <Link href="/app">
                  <GlassButton variant="ghost" size="sm">
                    Workspace
                  </GlassButton>
                </Link>
                <GlassButton variant="ghost" size="sm" onClick={handleCopyLink}>
                  <Share2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                  {copied ? "Copied!" : "Copy link"}
                </GlassButton>
                {mapped && (
                  <GlassButton variant="primary" size="sm" onClick={() => setShowReceipt(true)}>
                    <Download className="h-3.5 w-3.5" />
                    Receipt
                  </GlassButton>
                )}
              </div>
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
              <h2 className="font-display text-xl font-bold tracking-tight text-warm-900">
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
              <h2 className="font-display text-2xl font-bold tracking-tight text-warm-900">
                No contributors found
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-warm-500">
                {isDoc
                  ? "This document doesn't have accessible revision history."
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
            transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <GlassPanel className="border-l-2 border-l-brand/40 animate-border-glow p-5">
              <div className="mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-brand" strokeWidth={1.5} />
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-brand">
                  AI Insight
                </span>
              </div>
              <p className="text-[14px] leading-relaxed text-warm-700">
                <TypewriterText text={data.summary as string} />
              </p>
            </GlassPanel>
          </motion.div>
        )}

        {/* Summary Stats */}
        {summaryStats && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-2 gap-3 sm:grid-cols-4"
          >
            <GlassPanel className="p-4 text-center">
              <Users className="h-5 w-5 text-warm-500 mx-auto mb-2" strokeWidth={1.5} />
              <p className="text-[28px] font-black text-warm-900 tabular-nums">{summaryStats.total}</p>
              <p className="text-[10px] font-semibold text-warm-500 uppercase tracking-[0.1em]">Contributors</p>
            </GlassPanel>
            <GlassPanel className="p-4 text-center">
              <BarChart3 className="h-5 w-5 text-warm-500 mx-auto mb-2" strokeWidth={1.5} />
              <p className="text-[28px] font-black text-warm-900 tabular-nums">{summaryStats.avgScore}</p>
              <p className="text-[10px] font-semibold text-warm-500 uppercase tracking-[0.1em]">Avg Score</p>
            </GlassPanel>
            <GlassPanel className="p-4 text-center">
              <Trophy className="h-5 w-5 text-carry mx-auto mb-2" strokeWidth={1.5} />
              <p className="text-[28px] font-black text-carry tabular-nums">{summaryStats.lockedIn}</p>
              <p className="text-[10px] font-semibold text-warm-500 uppercase tracking-[0.1em]">Locked In</p>
            </GlassPanel>
            <GlassPanel className="p-4 text-center">
              <Ghost className="h-5 w-5 text-ghost mx-auto mb-2" strokeWidth={1.5} />
              <p className="text-[28px] font-black text-ghost tabular-nums">{summaryStats.notLockedIn}</p>
              <p className="text-[10px] font-semibold text-warm-500 uppercase tracking-[0.1em]">Selling</p>
            </GlassPanel>
          </motion.div>
        )}

        {/* Contributor Cards Grid */}
        {mapped && (
          <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3">
            {(() => {
              const sorted = [...mapped.contributors].sort(
                (a, b) => b.fairShareScore - a.fairShareScore
              );
              const maxScore = Math.max(...sorted.map((c) => c.fairShareScore), 1);
              return sorted.map((contributor, i) => (
                <ContributorCard
                  key={contributor.id}
                  contributor={contributor}
                  index={i}
                  maxScore={maxScore}
                  revealDelay={i * 0.18}
                />
              ));
            })()}
          </div>
        )}

        {/* ─── Share Section ─────────────────────────────────── */}
        {mapped && data.status === "ready" && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mt-2"
          >
            <GlassPanel className="p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <p className="text-[14px] font-semibold text-warm-800">
                    Share the receipts 🧾
                  </p>
                  <p className="text-[12px] text-warm-500 mt-0.5">
                    Let them know who actually carried.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowTweetModal(true)}
                    className="flex items-center gap-2 h-[40px] px-5 rounded-lg text-white text-[13px] font-semibold transition-all active:scale-[0.97]"
                    style={{ background: "#000000" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#1a1a1a")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "#000000")}
                  >
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    Post to X
                  </button>
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-2 h-[40px] px-4 rounded-lg text-[13px] font-medium transition-all active:scale-[0.97]"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.10)",
                      color: "rgba(255,255,255,0.70)",
                    }}
                  >
                    <Share2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                    {copied ? "Copied!" : "Copy link"}
                  </button>
                </div>
              </div>
            </GlassPanel>
          </motion.div>
        )}

        {mapped && showReceipt && (
          <ReceiptCard
            title={data.title}
            contributors={mapped.contributors}
            onClose={() => setShowReceipt(false)}
          />
        )}
      </div>

      {/* Tweet Preview Modal */}
      {showTweetModal && mapped && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowTweetModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-[420px] rounded-2xl overflow-hidden"
            style={{ background: "#0f1117", border: "1px solid rgba(255,255,255,0.12)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span className="text-[14px] font-semibold text-white">Preview your tweet</span>
              </div>
              <button
                onClick={() => setShowTweetModal(false)}
                className="text-warm-500 hover:text-warm-300 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Tweet preview */}
            <div className="p-5">
              <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <pre className="text-[13px] leading-relaxed text-warm-800 whitespace-pre-wrap font-sans">
                  {buildTweetText()}
                </pre>
                <div className="mt-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <p className="text-[11px] text-warm-500">
                    💡 Drop the link in your first reply — X buries posts with links
                  </p>
                  <p className="text-[11px] text-warm-400 mt-1 font-mono">{typeof window !== "undefined" ? window.location.href : ""}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 px-5 pb-5">
              <button
                onClick={() => {
                  const text = buildTweetText();
                  window.open(
                    `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
                    "_blank"
                  );
                  setShowTweetModal(false);
                }}
                className="flex-1 h-[40px] rounded-lg text-white text-[13px] font-semibold transition-all active:scale-[0.97]"
                style={{ background: "#000000" }}
              >
                Post to X →
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(buildTweetText());
                }}
                className="h-[40px] px-4 rounded-lg text-[13px] font-medium transition-all"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  color: "rgba(255,255,255,0.70)",
                }}
              >
                Copy text
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Sticky Share Bar (mobile) */}
      {mapped && data.status === "ready" && (
        <div className="fixed bottom-0 left-0 right-0 p-4 glass-strong z-50 sm:hidden">
          <div className="flex gap-2">
            <button
              onClick={() => setShowTweetModal(true)}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-brand py-3 text-[13px] font-semibold text-white shadow-glow-brand transition-all active:scale-[0.97]"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Share results
            </button>
            <button
              onClick={() => setShowReceipt(true)}
              className="flex items-center justify-center gap-2 rounded-xl bg-white/[0.08] border border-white/[0.10] px-4 py-3 text-[13px] font-semibold text-warm-800 transition-all active:scale-[0.97]"
            >
              <Download className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      )}
    </PageTransition>
  );
}
