"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { cn } from "@/lib/utils";
import {
  MoreHorizontal,
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

function ContextMenu({
  analysisId,
  onClose,
}: {
  analysisId: string;
  onClose: () => void;
}) {
  const deleteAnalysis = useMutation(api.analyses.deleteAnalysis);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute right-0 top-8 z-50 min-w-[140px] overflow-hidden rounded-xl border border-white/[0.08] bg-[#0c0c12]/95 py-1 shadow-2xl backdrop-blur-xl"
    >
      <button
        onClick={async (e) => {
          e.preventDefault();
          e.stopPropagation();
          await deleteAnalysis({
            analysisId: analysisId as Id<"analyses">,
          });
          onClose();
        }}
        className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-[13px] text-[#f97373]/80 transition-colors hover:bg-[#f97373]/[0.06] hover:text-[#f97373]"
      >
        <Trash2 className="h-3.5 w-3.5" />
        Delete
      </button>
    </div>
  );
}

export function AnalysisCard({
  analysis,
  index,
  variant = "card",
}: AnalysisCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isDoc = analysis.sourceType === "google_doc";
  const isPending = analysis.status === "pending";
  const isError = analysis.status === "error";

  const SourceIcon = isDoc ? FileText : Github;
  const iconBg = isDoc
    ? "bg-[#a894ff]/10 text-[#a894ff]"
    : "bg-[#5e9f99]/10 text-[#5e9f99]";

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
        <Link href={`/results/${analysis._id}`}>
          <div className="group flex items-center gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 transition-all hover:border-white/[0.1] hover:bg-white/[0.04]">
            <div
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                iconBg
              )}
            >
              <SourceIcon className="h-4 w-4" />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="truncate text-[14px] font-medium text-white/80 group-hover:text-white/95">
                {analysis.title}
              </h3>
            </div>

            <div className="flex items-center gap-4 text-[12px] text-white/35">
              {isPending && (
                <span className="flex items-center gap-1.5 text-[#d8b989]">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Analyzing
                </span>
              )}
              {isError && (
                <span className="text-[#f97373]">Failed</span>
              )}
              {analysis.contributorCount > 0 && (
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {analysis.contributorCount}
                </span>
              )}
              <span>{formatTimeAgo(analysis.updatedAt)}</span>
            </div>

            <ExternalLink className="h-3.5 w-3.5 text-white/15 transition-colors group-hover:text-white/40" />
          </div>
        </Link>
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
      <Link href={`/results/${analysis._id}`}>
        <div className="group relative flex h-[180px] flex-col rounded-2xl border border-white/[0.06] bg-white/[0.025] p-5 transition-all hover:border-white/[0.12] hover:bg-white/[0.04] hover:shadow-[0_8px_40px_rgba(0,0,0,0.3)]">
          {/* Top row: icon + menu */}
          <div className="flex items-start justify-between">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl",
                iconBg
              )}
            >
              <SourceIcon className="h-5 w-5" />
            </div>

            <div className="relative">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setMenuOpen((v) => !v);
                }}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-white/20 transition-colors hover:bg-white/[0.06] hover:text-white/50"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
              {menuOpen && (
                <ContextMenu
                  analysisId={analysis._id}
                  onClose={() => setMenuOpen(false)}
                />
              )}
            </div>
          </div>

          {/* Title */}
          <h3 className="mt-4 truncate text-[15px] font-medium text-white/85 group-hover:text-white">
            {analysis.title}
          </h3>

          {/* Status */}
          {isPending && (
            <div className="mt-2 flex items-center gap-1.5">
              <Loader2 className="h-3 w-3 animate-spin text-[#d8b989]" />
              <span className="text-[12px] text-[#d8b989]/70">
                Analyzing...
              </span>
            </div>
          )}
          {isError && (
            <p className="mt-2 truncate text-[12px] text-[#f97373]/70">
              {analysis.errorMessage || "Analysis failed"}
            </p>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Bottom row: contributor count + time */}
          <div className="flex items-center justify-between text-[12px] text-white/30">
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
        </div>
      </Link>
    </motion.div>
  );
}
