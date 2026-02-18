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
  Plus,
  Infinity,
  Filter,
  Group,
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
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isAuthLoading, router]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        filterRef.current &&
        !filterRef.current.contains(e.target as Node)
      ) {
        setIsFilterOpen(false);
      }
      if (
        searchRef.current &&
        !searchRef.current.contains(e.target as Node)
      ) {
        if (!searchQuery) setIsSearchOpen(false);
      }
      if (viewRef.current && !viewRef.current.contains(e.target as Node)) {
        setIsViewOpen(false);
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
    filterOptions.find((f) => f.value === activeFilter)?.label ??
    "All analyses";

  if (isAuthLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-10 w-48 rounded-lg bg-warm-200" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-[190px] rounded-2xl bg-warm-100"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-5">
        {/* Page title */}
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
          {/* Left: filter controls */}
          <div className="flex items-center gap-3">
            <div className="relative" ref={filterRef}>
              <button
                onClick={() => setIsFilterOpen((v) => !v)}
                className={cn(
                  "flex items-center gap-2 rounded-full border px-3.5 py-[7px] text-[13px] font-medium transition-all duration-200",
                  isFilterOpen || activeFilter !== "all"
                    ? "border-warm-300 bg-warm-50 text-warm-900"
                    : "border-warm-200 bg-white text-warm-600 hover:border-warm-300 hover:text-warm-800"
                )}
              >
                <Infinity className="h-3.5 w-3.5 opacity-50" />
                {currentFilterLabel}
                <ChevronDown className="h-3 w-3 opacity-40" />
              </button>

              {isFilterOpen && (
                <div className="absolute left-0 top-10 z-40 min-w-[180px] overflow-hidden rounded-xl border border-warm-200 bg-white py-1 shadow-layered-lg">
                  {filterOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setActiveFilter(opt.value);
                        setIsFilterOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center px-4 py-2.5 text-left text-[13px] font-medium transition-colors",
                        activeFilter === opt.value
                          ? "bg-warm-100 text-warm-900"
                          : "text-warm-500 hover:bg-warm-50 hover:text-warm-800"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button className="flex items-center gap-1.5 text-[13px] font-medium text-warm-400 transition-colors hover:text-warm-600">
              <Plus className="h-3.5 w-3.5" />
              Filter
            </button>
          </div>

          {/* Right: find, group, view toggle */}
          <div className="flex items-center gap-2">
            {/* Find */}
            <div className="relative" ref={searchRef}>
              {isSearchOpen ? (
                <div className="flex items-center gap-2 rounded-full border border-warm-300 bg-white px-3.5 py-[7px] shadow-sm ring-1 ring-warm-200">
                  <Search className="h-3.5 w-3.5 text-warm-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search analyses..."
                    autoFocus
                    data-search-input
                    className="w-40 bg-transparent text-[13px] text-warm-900 placeholder:text-warm-400 focus:outline-none"
                  />
                </div>
              ) : (
                <button
                  data-search-trigger
                  onClick={() => setIsSearchOpen(true)}
                  className="flex items-center gap-1.5 rounded-full border border-warm-200 bg-white px-3.5 py-[7px] text-[13px] font-medium text-warm-500 transition-all duration-200 hover:border-warm-300 hover:text-warm-700"
                >
                  <Search className="h-3.5 w-3.5" />
                  Find
                </button>
              )}
            </div>

            {/* Group */}
            <button className="flex items-center gap-1.5 rounded-full border border-warm-200 bg-white px-3.5 py-[7px] text-[13px] font-medium text-warm-500 transition-all duration-200 hover:border-warm-300 hover:text-warm-700">
              <Group className="h-3.5 w-3.5" />
              Group
            </button>

            {/* View mode dropdown */}
            <div className="relative" ref={viewRef}>
              <button
                onClick={() => setIsViewOpen((v) => !v)}
                className="flex items-center gap-1.5 rounded-full border border-warm-200 bg-white px-3.5 py-[7px] text-[13px] font-medium text-warm-500 transition-all duration-200 hover:border-warm-300 hover:text-warm-700"
              >
                {viewMode === "card" ? (
                  <LayoutGrid className="h-3.5 w-3.5" />
                ) : (
                  <List className="h-3.5 w-3.5" />
                )}
                {viewMode === "card" ? "Card" : "List"}
                <ChevronDown className="h-3 w-3 opacity-40" />
              </button>

              {isViewOpen && (
                <div className="absolute right-0 top-10 z-40 min-w-[120px] overflow-hidden rounded-xl border border-warm-200 bg-white py-1 shadow-layered-lg">
                  <button
                    onClick={() => {
                      setViewMode("card");
                      setIsViewOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center gap-2 px-4 py-2.5 text-left text-[13px] font-medium transition-colors",
                      viewMode === "card"
                        ? "bg-warm-100 text-warm-900"
                        : "text-warm-500 hover:bg-warm-50 hover:text-warm-800"
                    )}
                  >
                    <LayoutGrid className="h-3.5 w-3.5" />
                    Card
                  </button>
                  <button
                    onClick={() => {
                      setViewMode("list");
                      setIsViewOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center gap-2 px-4 py-2.5 text-left text-[13px] font-medium transition-colors",
                      viewMode === "list"
                        ? "bg-warm-100 text-warm-900"
                        : "text-warm-500 hover:bg-warm-50 hover:text-warm-800"
                    )}
                  >
                    <List className="h-3.5 w-3.5" />
                    List
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        {filteredAnalyses === undefined ? (
          <div
            className={cn(
              viewMode === "card"
                ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "space-y-2"
            )}
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton
                key={i}
                className={cn(
                  "bg-warm-100",
                  viewMode === "card"
                    ? "h-[190px] rounded-2xl"
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
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-warm-200 bg-warm-50">
                <LayoutGrid className="h-7 w-7 text-warm-300" />
              </div>
              <h2 className="text-xl font-semibold text-warm-900">
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
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-warm-900 px-5 py-2.5 text-[13px] font-semibold text-white shadow-sm transition-all duration-200 hover:bg-warm-800 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Plus className="h-4 w-4" />
                  New analysis
                </button>
              )}
            </div>
          </div>
        ) : viewMode === "card" ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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

      {/* FAB */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="ripple-effect group fixed bottom-8 right-8 z-30 flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-warm-900 shadow-layered-lg transition-all duration-200 hover:scale-110 hover:bg-warm-800 hover:shadow-xl active:scale-95"
        aria-label="New analysis"
      >
        <Plus className="fab-icon h-6 w-6 text-white" strokeWidth={2.5} />
      </button>

      <NewAnalysisModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
