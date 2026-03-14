"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useClickOutside } from "@/hooks/useClickOutside";
import { formatTimeAgo } from "@/lib/formatters";
import { TierBadge } from "@/components/TierBadge";
import {
  FileText,
  Github,
  Users,
  Trash2,
  MoreHorizontal,
  ExternalLink,
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

function CardMenu({ analysisId }: { analysisId: string }) {
  const deleteAnalysis = useMutation(api.analyses.deleteAnalysis);
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setConfirming(false);
  }, []);
  useClickOutside(ref, close);

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setDeleting(true);
    try {
      await deleteAnalysis({ analysisId: analysisId as Id<"analyses"> });
    } finally {
      setDeleting(false);
      setOpen(false);
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="flex h-7 w-7 items-center justify-center rounded-lg text-warm-400 transition-colors hover:bg-white/[0.06] hover:text-warm-600"
      >
        <MoreHorizontal className="h-[18px] w-[18px]" strokeWidth={1.5} />
      </button>

      {open && (
        <div className="absolute right-0 top-8 z-40 min-w-[150px] overflow-hidden rounded-xl border border-white/[0.10] bg-surface-2 py-1 shadow-layered-lg">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[13px] font-medium text-warm-600 transition-colors hover:bg-danger/10 hover:text-danger"
          >
            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
            {confirming
              ? deleting
                ? "Deleting..."
                : "Confirm delete?"
              : "Delete"}
          </button>
        </div>
      )}
    </div>
  );
}

function MemberBadge({ count }: { count: number }) {
  const label =
    count > 0
      ? `${count} ${count === 1 ? "person" : "people"}`
      : "No data";

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] px-2.5 py-1 text-[12px] text-warm-500">
      <span className="flex h-[15px] w-[15px] items-center justify-center rounded-full bg-white/[0.06]">
        <Users className="h-[9px] w-[9px] text-warm-400" />
      </span>
      {label}
    </span>
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

  if (variant === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: index * 0.03,
          duration: 0.4,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <div className="group flex items-center gap-4 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 transition-all duration-200 hover:bg-white/[0.06] hover:shadow-glass-hover">
          <Link
            href={`/results/${analysis._id}`}
            className="flex min-w-0 flex-1 items-center gap-4"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.06]">
              <SourceIcon className="h-4 w-4 text-warm-500" strokeWidth={1.5} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-[14px] font-semibold text-warm-900">
                {analysis.title}
              </h3>
            </div>
            <div className="flex items-center gap-4 text-[12px] text-warm-400">
              {isPending && (
                <span className="flex items-center gap-1.5 font-medium text-brand">
                  <span className="animate-pulse inline-block h-2 w-2 rounded-full bg-brand" />
                  Analyzing...
                </span>
              )}
              {isError && (
                <span className="font-medium text-danger">Failed</span>
              )}
              {analysis.topContributor && analysis.status === "ready" && (
                <TierBadge tier={analysis.topContributor.tier} size="sm" />
              )}
              <MemberBadge count={analysis.contributorCount} />
              <span>{formatTimeAgo(analysis.updatedAt)}</span>
            </div>
            <ExternalLink className="h-3.5 w-3.5 text-warm-400 transition-colors group-hover:text-warm-600" strokeWidth={1.5} />
          </Link>
          <CardMenu analysisId={analysis._id} />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.05,
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <div className="group relative flex h-[190px] flex-col rounded-2xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-[20px] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.14] hover:shadow-glass-hover cursor-pointer">
        <div className="flex items-start justify-between">
          <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-white/[0.06]">
            <SourceIcon className="h-5 w-5 text-warm-500" strokeWidth={1.5} />
          </div>
          <div className="flex items-center gap-2">
            {analysis.topContributor && analysis.status === "ready" && (
              <TierBadge tier={analysis.topContributor.tier} size="sm" />
            )}
            <CardMenu analysisId={analysis._id} />
          </div>
        </div>

        <Link
          href={`/results/${analysis._id}`}
          className="mt-4 block min-w-0 flex-1"
        >
          <h3 className="truncate text-[15px] font-semibold text-warm-900">
            {analysis.title}
          </h3>

          {isPending && (
            <div className="mt-2 flex items-center gap-1.5">
              <span className="animate-pulse inline-block h-2 w-2 rounded-full bg-brand" />
              <span className="text-[12px] font-medium text-brand">
                Analyzing...
              </span>
            </div>
          )}
          {isError && (
            <p className="mt-2 truncate text-[12px] font-medium text-danger/70">
              {analysis.errorMessage || "Analysis failed"}
            </p>
          )}
        </Link>

        <div className="flex items-center justify-between">
          <MemberBadge count={analysis.contributorCount} />
          <span className="text-[12px] text-warm-400">
            {formatTimeAgo(analysis.updatedAt)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
