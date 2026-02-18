"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { useConvexAuth } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { AnalysisCard } from "@/components/AnalysisCard";
import { NewAnalysisModal } from "@/components/NewAnalysisModal";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  Search,
  LayoutGrid,
  List,
  SlidersHorizontal,
  Plus,
} from "lucide-react";

type FilterType = "all" | "google_doc" | "github_repo";
type ViewMode = "card" | "list";

const filterOptions: { label: string; value: FilterType }[] = [
  { label: "All analyses", value: "all" },
  { label: "Google Docs", value: "google_doc" },
  { label: "GitHub Repos", value: "github_repo" },
];

export default function WorkspacePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("card");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isAuthLoading, router]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setIsFilterOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        if (!searchQuery) setIsSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [searchQuery]);

  const analyses = useQuery(
    api.analyses.listAnalyses,
    isAuthenticated
      ? {
          sourceType:
            activeFilter === "all"
              ? undefined
              : (activeFilter as "google_doc" | "github_repo"),
        }
      : "skip"
  );

  const filteredAnalyses = analyses?.filter((a) => {
    if (!searchQuery) return true;
    return a.title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const currentFilterLabel =
    filterOptions.find((f) => f.value === activeFilter)?.label ?? "All analyses";

  if (isAuthLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-10 w-48 rounded-lg bg-white/[0.06]" />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-[180px] rounded-2xl bg-white/[0.04]"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Page heading */}
        <div className="hero-fade-in">
          <h1 className="text-[28px] font-semibold tracking-tight text-white/90">
            Analyses
          </h1>
        </div>

        {/* Toolbar: filters + search + view toggle */}
        <div
          className="hero-fade-in flex flex-wrap items-center justify-between gap-3"
          style={{ animationDelay: "0.06s" }}
        >
          {/* Left controls */}
          <div className="flex items-center gap-2">
            {/* Filter dropdown */}
            <div className="relative" ref={filterRef}>
              <button
                onClick={() => setIsFilterOpen((v) => !v)}
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-3 py-1.5 text-[13px] font-medium transition-all",
                  isFilterOpen || activeFilter !== "all"
                    ? "border-[#d8b989]/20 bg-[#d8b989]/[0.06] text-[#d8b989]"
                    : "border-white/[0.08] bg-white/[0.03] text-white/60 hover:border-white/[0.12] hover:text-white/80"
                )}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                {currentFilterLabel}
                <ChevronDown className="h-3 w-3 opacity-50" />
              </button>

              {isFilterOpen && (
                <div className="absolute left-0 top-10 z-40 min-w-[180px] overflow-hidden rounded-xl border border-white/[0.08] bg-[#0c0c12]/95 py-1 shadow-2xl backdrop-blur-xl">
                  {filterOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setActiveFilter(opt.value);
                        setIsFilterOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center px-4 py-2.5 text-left text-[13px] transition-colors",
                        activeFilter === opt.value
                          ? "bg-[#d8b989]/[0.06] text-[#d8b989]"
                          : "text-white/60 hover:bg-white/[0.04] hover:text-white/80"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative" ref={searchRef}>
              {isSearchOpen ? (
                <div className="flex items-center gap-2 rounded-lg border border-white/[0.1] bg-white/[0.03] px-3 py-1.5">
                  <Search className="h-3.5 w-3.5 text-white/40" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search analyses..."
                    autoFocus
                    className="w-40 bg-transparent text-[13px] text-white/80 placeholder:text-white/25 focus:outline-none"
                  />
                </div>
              ) : (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[13px] text-white/50 transition-colors hover:border-white/[0.12] hover:text-white/70"
                >
                  <Search className="h-3.5 w-3.5" />
                  Find
                </button>
              )}
            </div>

            {/* View mode toggle */}
            <div className="flex items-center rounded-lg border border-white/[0.08] bg-white/[0.03]">
              <button
                onClick={() => setViewMode("card")}
                className={cn(
                  "flex items-center gap-1.5 rounded-l-lg px-3 py-1.5 text-[13px] transition-colors",
                  viewMode === "card"
                    ? "bg-white/[0.06] text-white/80"
                    : "text-white/35 hover:text-white/60"
                )}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                Card
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "flex items-center gap-1.5 rounded-r-lg px-3 py-1.5 text-[13px] transition-colors",
                  viewMode === "list"
                    ? "bg-white/[0.06] text-white/80"
                    : "text-white/35 hover:text-white/60"
                )}
              >
                <List className="h-3.5 w-3.5" />
                List
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {filteredAnalyses === undefined ? (
          <div
            className={cn(
              viewMode === "card"
                ? "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "space-y-3"
            )}
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton
                key={i}
                className={cn(
                  "bg-white/[0.04]",
                  viewMode === "card"
                    ? "h-[180px] rounded-2xl"
                    : "h-16 rounded-xl"
                )}
              />
            ))}
          </div>
        ) : filteredAnalyses.length === 0 ? (
          <div
            className="hero-fade-in flex justify-center pt-16"
            style={{ animationDelay: "0.12s" }}
          >
            <div className="max-w-sm text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.03]">
                <LayoutGrid className="h-7 w-7 text-white/20" />
              </div>
              <h2 className="text-[18px] font-semibold text-white/80">
                {searchQuery ? "No matches found" : "No analyses yet"}
              </h2>
              <p className="mt-2 text-[14px] leading-relaxed text-white/40">
                {searchQuery
                  ? "Try a different search term."
                  : "Paste a Google Doc link or a GitHub repo to see who did the work."}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-[#d8b989] to-[#b89a6a] px-5 py-2.5 text-[13px] font-medium text-[#1a1a1a] shadow-[0_2px_12px_rgba(216,185,137,0.25)] transition-all hover:shadow-[0_4px_20px_rgba(216,185,137,0.35)]"
                >
                  <Plus className="h-4 w-4" />
                  New analysis
                </button>
              )}
            </div>
          </div>
        ) : viewMode === "card" ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredAnalyses.map((analysis, i) => (
              <AnalysisCard
                key={analysis._id}
                analysis={analysis}
                index={i}
                variant="card"
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredAnalyses.map((analysis, i) => (
              <AnalysisCard
                key={analysis._id}
                analysis={analysis}
                index={i}
                variant="list"
              />
            ))}
          </div>
        )}
      </div>

      {/* FAB - New analysis */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-8 right-8 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#d8b989] to-[#b89a6a] shadow-[0_4px_24px_rgba(216,185,137,0.35)] transition-all hover:scale-105 hover:shadow-[0_8px_32px_rgba(216,185,137,0.45)] active:scale-95"
        aria-label="New analysis"
      >
        <Plus className="h-6 w-6 text-[#1a1a1a]" strokeWidth={2.5} />
      </button>

      <NewAnalysisModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
