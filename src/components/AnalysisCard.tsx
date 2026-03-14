"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { api } from "../../convex/_generated/api";
import { useClickOutside } from "@/hooks/useClickOutside";
import { formatTimeAgo } from "@/lib/formatters";
import {
  FileText,
  Github,
  Users,
  Trash2,
  MoreHorizontal,
  Loader2,
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
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete analysis"
      );
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
        aria-label="Analysis options"
        aria-expanded={open}
        className="flex h-7 w-7 items-center justify-center rounded-lg text-warm-300 transition-colors hover:bg-warm-100 hover:text-warm-600"
      >
        <MoreHorizontal className="h-[18px] w-[18px]" />
      </button>

      {open && (
        <div className="absolute right-0 top-8 z-40 min-w-[150px] overflow-hidden rounded-xl border border-warm-200 bg-white py-1 shadow-layered-lg">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[13px] font-medium text-warm-600 transition-colors hover:bg-warm-50 hover:text-danger"
          >
            <Trash2 className="h-3.5 w-3.5" />
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
    <span className="inline-flex items-center gap-1.5 rounded-full border border-warm-200 px-2.5 py-1 text-[12px] text-warm-500">
      <span className="flex h-[15px] w-[15px] items-center justify-center rounded-full bg-warm-100">
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
        <div className="group flex items-center gap-4 rounded-xl border border-warm-200 bg-white px-4 py-3 transition-all duration-200 hover:bg-warm-50">
          <Link
            href={`/results/${analysis._id}`}
            className="flex min-w-0 flex-1 items-center gap-4"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-warm-100">
              <SourceIcon className="h-4 w-4 text-warm-500" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-[14px] font-semibold text-warm-900">
                {analysis.title}
              </h3>
            </div>
            <div className="flex items-center gap-4 text-[12px] text-warm-400">
              {isPending && (
                <span className="flex items-center gap-1.5 font-medium text-warm-600">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Analyzing
                </span>
              )}
              {isError && (
                <span className="font-medium text-danger">Failed</span>
              )}
              <MemberBadge count={analysis.contributorCount} />
              <span>{formatTimeAgo(analysis.updatedAt)}</span>
            </div>
            <ExternalLink className="h-3.5 w-3.5 text-warm-300 transition-colors group-hover:text-warm-500" />
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
      <div className="group relative flex h-[190px] flex-col rounded-2xl border border-warm-200 bg-white p-5 transition-all duration-200 hover:border-warm-300 hover:shadow-card">
        <div className="flex items-start justify-between">
          <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-warm-100">
            <SourceIcon className="h-5 w-5 text-warm-500" />
          </div>
          <CardMenu analysisId={analysis._id} />
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
              <Loader2 className="h-3 w-3 animate-spin text-warm-400" />
              <span className="text-[12px] font-medium text-warm-400">
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
