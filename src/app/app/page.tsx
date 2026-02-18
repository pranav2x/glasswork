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
        <Skeleton className="h-10 w-48 rounded-lg bg-warm-200" />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[180px] rounded-2xl bg-warm-100" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="hero-fade-in">
          <h1 className="text-[28px] font-semibold tracking-tight text-warm-900">
            Analyses
          </h1>
        </div>

        {/* Toolbar */}
        <div
          className="hero-fade-in flex flex-wrap items-center justify-between gap-3"
          style={{ animationDelay: "0.06s" }}
        >
          <div className="flex items-center gap-2">
            <div className="relative" ref={filterRef}>
              <button
                onClick={() => setIsFilterOpen((v) => !v)}
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-3 py-1.5 text-[13px] font-medium transition-all",
                  isFilterOpen || activeFilter !== "all"
                    ? "border-brand/30 bg-brand/[0.06] text-brand-dark"
                    : "border-warm-200/60 bg-white text-warm-600 shadow-layered hover:shadow-layered-md hover:text-warm-800"
                )}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                {currentFilterLabel}
                <ChevronDown className="h-3 w-3 opacity-50" />
              </button>

              {isFilterOpen && (
                <div className="absolute left-0 top-10 z-40 min-w-[180px] overflow-hidden rounded-xl border border-warm-200/60 bg-white py-1 shadow-layered-lg">
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
                          ? "bg-brand/[0.06] text-brand-dark"
                          : "text-warm-600 hover:bg-warm-50 hover:text-warm-800"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative" ref={searchRef}>
              {isSearchOpen ? (
                <div className="flex items-center gap-2 rounded-lg border border-brand/30 bg-white px-3 py-1.5 shadow-layered ring-2 ring-brand/10">
                  <Search className="h-3.5 w-3.5 text-brand" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search analyses..."
                    autoFocus
                    data-search-input
                    className="w-40 bg-transparent text-[13px] text-warm-800 placeholder:text-warm-400 focus:outline-none"
                  />
                </div>
              ) : (
                <button
                  data-search-trigger
                  onClick={() => setIsSearchOpen(true)}
                  className="flex items-center gap-2 rounded-lg border border-warm-200/60 bg-white px-3 py-1.5 text-[13px] text-warm-500 shadow-layered transition-all hover:shadow-layered-md hover:text-warm-700"
                >
                  <Search className="h-3.5 w-3.5" />
                  Find
                </button>
              )}
            </div>

            <div className="flex items-center rounded-lg border border-warm-200/60 bg-white shadow-layered">
              <button
                onClick={() => setViewMode("card")}
                className={cn(
                  "flex items-center gap-1.5 rounded-l-lg px-3 py-1.5 text-[13px] transition-colors",
                  viewMode === "card"
                    ? "bg-warm-100 text-warm-800"
                    : "text-warm-400 hover:text-warm-600"
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
                    ? "bg-warm-100 text-warm-800"
                    : "text-warm-400 hover:text-warm-600"
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
                  "bg-warm-100",
                  viewMode === "card" ? "h-[180px] rounded-2xl" : "h-16 rounded-xl"
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
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-warm-200 bg-warm-50">
                <LayoutGrid className="h-7 w-7 text-warm-300" />
              </div>
              <h2 className="text-[18px] font-semibold text-warm-800">
                {searchQuery ? "No matches found" : "No analyses yet"}
              </h2>
              <p className="mt-2 text-[14px] leading-relaxed text-warm-500">
                {searchQuery
                  ? "Try a different search term."
                  : "Paste a Google Doc link or a GitHub repo to see who did the work."}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-[13px] font-semibold text-white shadow-layered transition-all hover:bg-brand-dark hover:shadow-layered-md"
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
              <AnalysisCard key={analysis._id} analysis={analysis} index={i} variant="card" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredAnalyses.map((analysis, i) => (
              <AnalysisCard key={analysis._id} analysis={analysis} index={i} variant="list" />
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-8 right-8 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-brand shadow-layered-lg transition-all hover:scale-105 hover:bg-brand-dark hover:shadow-xl active:scale-95"
        aria-label="New analysis"
      >
        <Plus className="h-6 w-6 text-white" strokeWidth={2.5} />
      </button>

      <NewAnalysisModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
