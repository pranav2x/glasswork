"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { cn } from "@/lib/utils";
import {
  FileText,
  Github,
  Users,
  Trash2,
  ExternalLink,
  Loader2,
} from "lucide-react";
import type { Id } from "../../convex/_generated/dataModel";

interface AnalysisCardProps {
  analysis: {
    _id: string;
    sourceType: "google_doc" | "github_repo";
    title: string;
    status: "pending" | "ready" | "error";
    errorMessage?: string;
    updatedAt: number;
    topContributor: {
      name: string;
      score: number;
      tier: "carry" | "solid" | "ghost";
    } | null;
    contributorCount: number;
  };
  index: number;
  variant?: "card" | "list";
}

function formatTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

function DeleteButton({ analysisId }: { analysisId: string }) {
  const deleteAnalysis = useMutation(api.analyses.deleteAnalysis);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirming) {
      setConfirming(true);
      // Auto-cancel confirm state after 3 seconds
      setTimeout(() => setConfirming(false), 3000);
      return;
    }
    setDeleting(true);
    try {
      await deleteAnalysis({ analysisId: analysisId as Id<"analyses"> });
    } finally {
      setDeleting(false);
    }
  }

  if (confirming) {
    return (
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="flex items-center gap-1 rounded-lg bg-danger px-2 py-1 text-[11px] font-medium text-white transition-all hover:bg-danger/90"
      >
        <Trash2 className="h-3 w-3" />
        {deleting ? "Deleting..." : "Confirm"}
      </button>
    );
  }

  return (
    <button
      onClick={handleDelete}
      className="flex h-7 w-7 items-center justify-center rounded-lg text-warm-300 opacity-0 transition-all group-hover:opacity-100 hover:bg-danger/8 hover:text-danger"
      title="Delete"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  );
}

export function AnalysisCard({
  analysis,
  index,
  variant = "card",
}: AnalysisCardProps) {
  const isDoc = analysis.sourceType === "google_doc";
  const isPending = analysis.status === "pending";
  const isError = analysis.status === "error";

  const SourceIcon = isDoc ? FileText : Github;
  const iconBg = isDoc
    ? "bg-docs-accent/10 text-docs-accent"
    : "bg-repo-accent/10 text-repo-accent";

  if (variant === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.03, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="group flex items-center gap-4 rounded-xl border border-warm-200/40 bg-white px-4 py-3 shadow-layered transition-all hover:shadow-layered-md">
          <Link href={`/results/${analysis._id}`} className="flex min-w-0 flex-1 items-center gap-4">
            <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", iconBg)}>
              <SourceIcon className="h-4 w-4" />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="truncate text-[14px] font-medium text-warm-800 group-hover:text-warm-900">
                {analysis.title}
              </h3>
            </div>

            <div className="flex items-center gap-4 text-[12px] text-warm-500">
              {isPending && (
                <span className="flex items-center gap-1.5 text-brand">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Analyzing
                </span>
              )}
              {isError && <span className="text-danger">Failed</span>}
              {analysis.contributorCount > 0 && (
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {analysis.contributorCount}
                </span>
              )}
              <span>{formatTimeAgo(analysis.updatedAt)}</span>
            </div>

            <ExternalLink className="h-3.5 w-3.5 text-warm-300 transition-colors group-hover:text-brand" />
          </Link>

          <DeleteButton analysisId={analysis._id} />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="group relative flex h-[180px] flex-col rounded-2xl border border-warm-200/40 bg-white p-5 shadow-layered transition-all hover:shadow-layered-md">
        <div className="flex items-start justify-between">
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", iconBg)}>
            <SourceIcon className="h-5 w-5" />
          </div>

          <DeleteButton analysisId={analysis._id} />
        </div>

        <Link href={`/results/${analysis._id}`} className="flex min-w-0 flex-1 flex-col">
          <h3 className="mt-4 truncate text-[15px] font-medium text-warm-800 group-hover:text-warm-900">
            {analysis.title}
          </h3>

          {isPending && (
            <div className="mt-2 flex items-center gap-1.5">
              <Loader2 className="h-3 w-3 animate-spin text-brand" />
              <span className="text-[12px] text-brand/70">Analyzing...</span>
            </div>
          )}
          {isError && (
            <p className="mt-2 truncate text-[12px] text-danger/70">
              {analysis.errorMessage || "Analysis failed"}
            </p>
          )}

          <div className="flex-1" />

          <div className="flex items-center justify-between text-[12px] text-warm-500">
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              <span>
                {analysis.contributorCount > 0
                  ? `${analysis.contributorCount} ${analysis.contributorCount === 1 ? "person" : "people"}`
                  : "No data"}
              </span>
            </div>
            <span>{formatTimeAgo(analysis.updatedAt)}</span>
          </div>
        </Link>
      </div>
    </motion.div>
  );
}
