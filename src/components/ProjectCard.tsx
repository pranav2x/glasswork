"use client";

import Link from "next/link";
import Image from "next/image";
import { GitBranch, FileText, ArrowUpRight, Trash2 } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { GlassPanel } from "@/components/GlassPanel";
import { TierBadge } from "@/components/TierBadge";
import { formatTimeAgo, getInitials } from "@/lib/formatters";

interface ProjectCardProps {
  analysis: {
    _id: string;
    title: string;
    sourceType: "google_doc" | "github_repo";
    status: string;
    createdAt: number;
    topContributor: {
      name: string;
      score: number;
      tier: "carry" | "solid" | "ghost";
      avatarUrl?: string;
    } | null;
    topContributors?: { name: string; avatarUrl?: string }[];
    contributorCount: number;
  };
}

export function ProjectCard({ analysis }: ProjectCardProps) {
  const { _id, title, sourceType, createdAt, topContributor, topContributors, contributorCount } = analysis;
  const deleteAnalysis = useMutation(api.analyses.deleteAnalysis);

  return (
    <div className="relative group">
    <Link href={`/results/${_id}`}>
      <GlassPanel hoverable className="group flex h-full flex-col p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${sourceType === "github_repo" ? "bg-repo-accent/10" : "bg-docs-accent/10"}`}>
              {sourceType === "github_repo" ? (
                <GitBranch className="h-4 w-4 text-repo-accent" strokeWidth={1.5} />
              ) : (
                <FileText className="h-4 w-4 text-docs-accent" strokeWidth={1.5} />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-[14px] font-semibold text-warm-800">
                {title}
              </h3>
              <p className="text-[11px] text-warm-500">
                {formatTimeAgo(createdAt)}
              </p>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 shrink-0 text-warm-400 transition-colors group-hover:text-warm-600" strokeWidth={1.5} />
        </div>

        <div className="mt-4 flex items-center gap-2">
          <div className="flex -space-x-1.5">
            {(topContributors ?? (topContributor ? [topContributor] : [])).map((c, i) => (
              <div
                key={i}
                className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-white/[0.06] text-[9px] font-bold text-warm-600 ring-2 ring-surface"
              >
                {c.avatarUrl ? (
                  <Image
                    src={c.avatarUrl}
                    alt={c.name}
                    width={28}
                    height={28}
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  getInitials(c.name)
                )}
              </div>
            ))}
            {contributorCount > (topContributors?.length ?? 1) && (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.04] text-[9px] font-medium text-warm-500 ring-2 ring-surface">
                +{contributorCount - (topContributors?.length ?? 1)}
              </div>
            )}
          </div>
          <span className="text-[11px] text-warm-500">
            {contributorCount} contributor{contributorCount !== 1 ? "s" : ""}
          </span>
        </div>

        {topContributor && (
          <div className="mt-auto pt-4 flex items-center gap-2 flex-wrap">
            <TierBadge tier={topContributor.tier} size="sm" />
            <span className="text-[11px] font-medium text-warm-600">
              {topContributor.name}
            </span>
            <span className="text-[11px] font-bold text-warm-800">
              {topContributor.score}
            </span>
          </div>
        )}
      </GlassPanel>
    </Link>
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        deleteAnalysis({ analysisId: _id as Id<"analyses"> });
      }}
      className="absolute right-2 bottom-2 z-10 flex h-7 w-7 items-center justify-center rounded-lg text-warm-400 opacity-0 transition-all duration-150 group-hover:opacity-100 hover:bg-danger/10 hover:text-danger"
      title="Delete project"
    >
      <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
    </button>
    </div>
  );
}
