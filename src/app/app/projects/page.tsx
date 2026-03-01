"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { ProjectCard } from "@/components/ProjectCard";
import { NewAnalysisModal } from "@/components/NewAnalysisModal";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const FILTERS = [
  { label: "All", value: "all" },
  { label: "GitHub", value: "github" },
  { label: "Google Docs", value: "docs" },
  { label: "My LOCKED IN", value: "carry" },
] as const;

type FilterValue = (typeof FILTERS)[number]["value"];

export default function ProjectsPageWrapper() {
  return (
    <Suspense>
      <ProjectsPage />
    </Suspense>
  );
}

function ProjectsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterValue>("all");

  const analyses = useQuery(api.analyses.listAnalyses, {});

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isAuthLoading, router]);

  if (isAuthLoading || analyses === undefined) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-10 w-64 rounded-xl bg-warm-200" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[180px] rounded-2xl bg-warm-100" />
          ))}
        </div>
      </div>
    );
  }

  // Apply filters
  const filtered = analyses.filter((a) => {
    if (activeFilter === "github") return a.sourceType === "github_repo";
    if (activeFilter === "docs") return a.sourceType === "google_doc";
    if (activeFilter === "carry") return a.topContributor?.tier === "carry";
    return true;
  });

  return (
    <>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="hero-fade-in flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[13px] font-medium text-warm-400">
              All your analyzed repos and docs
            </p>
            <h1 className="mt-0.5 text-[28px] font-bold tracking-tight text-warm-900">
              Projects
            </h1>
          </div>
        </div>

        {/* Filter pills */}
        <div className="hero-fade-in flex flex-wrap gap-2" style={{ animationDelay: "0.04s" }}>
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setActiveFilter(f.value)}
              className={`rounded-full px-4 py-1.5 text-[12px] font-medium transition-all duration-200 ${
                activeFilter === f.value
                  ? "bg-warm-900 text-white shadow-sm"
                  : "bg-white/50 text-warm-500 hover:bg-white/70 hover:text-warm-700 border border-white/[0.25]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Card grid */}
        {filtered.length === 0 ? (
          <div className="hero-fade-in flex flex-col items-center justify-center rounded-2xl border border-dashed border-warm-300 bg-warm-50/50 py-20" style={{ animationDelay: "0.08s" }}>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-warm-100">
              <Plus className="h-6 w-6 text-warm-400" />
            </div>
            <h3 className="mt-4 text-[16px] font-semibold text-warm-800">
              {activeFilter === "all" ? "No projects yet" : "No matching projects"}
            </h3>
            <p className="mt-1 text-[13px] text-warm-500">
              {activeFilter === "all"
                ? "Create your first analysis to get started"
                : "Try a different filter"}
            </p>
            {activeFilter === "all" && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-5 rounded-xl bg-warm-900 px-5 py-2.5 text-[13px] font-semibold text-white shadow-sm transition-all hover:bg-warm-800 hover:scale-105 active:scale-95"
              >
                New Analysis
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((analysis) => (
                <motion.div
                  key={analysis._id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <ProjectCard analysis={analysis} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="ripple-effect group fixed bottom-8 right-8 z-30 flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-warm-800 to-warm-900 shadow-layered-lg ring-2 ring-white/20 transition-all duration-200 hover:scale-110 hover:shadow-xl active:scale-95"
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
