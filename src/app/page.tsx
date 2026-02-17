"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { GlassInput } from "@/components/GlassInput";

/* ── Fake contributor data for the right-side preview ── */
const previewContributors = [
  {
    name: "Maya R.",
    initials: "MR",
    score: 94,
    tier: "Carry" as const,
    heatmap: [3, 5, 4, 6, 7, 5, 8, 6, 7, 9, 8, 7],
  },
  {
    name: "Jordan K.",
    initials: "JK",
    score: 71,
    tier: "Solid" as const,
    heatmap: [2, 3, 4, 3, 5, 4, 3, 4, 5, 4, 3, 4],
  },
  {
    name: "Alex T.",
    initials: "AT",
    score: 23,
    tier: "Ghost" as const,
    heatmap: [1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
  },
];

const tierColors = {
  Carry: "text-[#d8b989]",
  Solid: "text-[#5e9f99]",
  Ghost: "text-[#f97373]",
};

const tierBg = {
  Carry: "bg-[#d8b989]/10 border-[#d8b989]/20",
  Solid: "bg-[#5e9f99]/10 border-[#5e9f99]/20",
  Ghost: "bg-[#f97373]/10 border-[#f97373]/20",
};

const cardDepth = [
  { opacity: 1, filter: "none" },
  { opacity: 0.85, filter: "none" },
  { opacity: 0.65, filter: "blur(0.5px)" },
];

function HeatmapStrip({ data }: { data: number[] }) {
  const max = Math.max(...data);
  return (
    <div className="flex gap-[3px]">
      {data.map((v, i) => (
        <div
          key={i}
          className="h-[14px] w-[6px] rounded-[2px]"
          style={{
            backgroundColor: `rgba(255,255,255,${0.04 + (v / max) * 0.18})`,
          }}
        />
      ))}
    </div>
  );
}

function PreviewCard({
  contributor,
  style,
  className = "",
}: {
  contributor: (typeof previewContributors)[number];
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <div className={`preview-card px-5 py-4 ${className}`} style={style}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06] text-[11px] font-semibold text-white/50">
            {contributor.initials}
          </div>
          <div>
            <p className="text-[13px] font-medium text-white/80">
              {contributor.name}
            </p>
            <div className="mt-0.5 flex items-center gap-2">
              <span
                className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium ${tierBg[contributor.tier]} ${tierColors[contributor.tier]}`}
              >
                {contributor.tier}
              </span>
              <HeatmapStrip data={contributor.heatmap} />
            </div>
          </div>
        </div>
        <span
          className={`text-lg font-semibold tabular-nums ${tierColors[contributor.tier]}`}
        >
          {contributor.score}
        </span>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<"doc" | "repo">("doc");

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-20">
      <div className="mx-auto grid w-full max-w-5xl grid-cols-1 items-center gap-16 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        {/* ══════════════════════════════════════════
            Left column — Hero text + interaction panel
           ══════════════════════════════════════════ */}
        <div className="flex flex-col">
          {/* Hero headline */}
          <h1
            className="hero-fade-in text-balance leading-[1.05]"
            style={{ animationDelay: "0s" }}
          >
            <span className="relative inline-block font-display text-5xl font-semibold tracking-display text-white/95 sm:text-6xl md:text-7xl">
              No freeloaders,
              {/* Curved SVG underline — grows from center outward */}
              <svg
                className="underline-draw absolute -bottom-1 left-0 w-full"
                viewBox="0 0 200 6"
                fill="none"
                preserveAspectRatio="none"
                style={{ height: "6px" }}
              >
                <defs>
                  <linearGradient id="ulGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="rgba(216,185,137,0)" />
                    <stop offset="20%" stopColor="rgba(216,185,137,0.8)" />
                    <stop offset="50%" stopColor="rgba(201,169,110,1)" />
                    <stop offset="80%" stopColor="rgba(216,185,137,0.8)" />
                    <stop offset="100%" stopColor="rgba(216,185,137,0)" />
                  </linearGradient>
                </defs>
                <path
                  d="M 0 4 Q 100 1, 200 4"
                  stroke="url(#ulGrad)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <br />
            <span className="font-body text-5xl font-light text-white/50 sm:text-6xl md:text-7xl">
              just the work.
            </span>
          </h1>

          {/* Subheading */}
          <p
            className="hero-fade-in mt-4 max-w-md text-[17px] font-normal leading-relaxed text-neutral-300"
            style={{ animationDelay: "0.12s" }}
          >
            Paste a Google Doc or GitHub repo. Glasswork shows who carried.
          </p>

          {/* Glass interaction panel */}
          <div
            className="hero-fade-in mt-10 w-full max-w-md"
            style={{ animationDelay: "0.28s" }}
          >
            <div className="glass-panel-hero glass-shimmer p-8">
              {/* Minimal tabs */}
              <div className="mb-6 flex gap-6 border-b border-white/[0.06] pb-3">
                <button
                  onClick={() => setActiveTab("doc")}
                  className={`relative pb-3 text-[13px] font-medium transition-colors ${
                    activeTab === "doc"
                      ? "text-white"
                      : "text-[#666] hover:text-[#888]"
                  }`}
                >
                  Google Doc
                  {activeTab === "doc" && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#d8b989]" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("repo")}
                  className={`relative pb-3 text-[13px] font-medium transition-colors ${
                    activeTab === "repo"
                      ? "text-white"
                      : "text-[#666] hover:text-[#888]"
                  }`}
                >
                  GitHub Repo
                  {activeTab === "repo" && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#d8b989]" />
                  )}
                </button>
              </div>

              {/* Tab content */}
              {activeTab === "doc" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <GlassInput placeholder="Paste Google Doc link" />
                    <p className="px-1 text-[10px] text-[#444]">
                      We&apos;ll ask Google once to read revision metadata.
                    </p>
                  </div>
                  <Link href="/results" className="block">
                    <button className="w-full rounded-xl bg-gradient-to-b from-[#c9a96e]/90 to-[#b8935a]/90 px-5 py-3 text-sm font-medium text-[#1a1a1a] transition-all hover:from-[#d4b87a]/95 hover:to-[#c9a96e]/95 hover:shadow-[0_4px_20px_rgba(216,185,137,0.25)] active:shadow-[inset_0_2px_6px_rgba(0,0,0,0.2)]">
                      Continue with Google
                    </button>
                  </Link>
                </div>
              )}

              {activeTab === "repo" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <GlassInput placeholder="owner/repo" />
                    <p className="px-1 text-[10px] text-[#444]">
                      We read public commit history. No tokens required.
                    </p>
                  </div>
                  <Link href="/results" className="block">
                    <button className="w-full rounded-xl bg-gradient-to-b from-[#c9a96e]/90 to-[#b8935a]/90 px-5 py-3 text-sm font-medium text-[#1a1a1a] transition-all hover:from-[#d4b87a]/95 hover:to-[#c9a96e]/95 hover:shadow-[0_4px_20px_rgba(216,185,137,0.25)] active:shadow-[inset_0_2px_6px_rgba(0,0,0,0.2)]">
                      Analyze repo
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            Right column — Blurred dashboard preview
           ══════════════════════════════════════════ */}
        <div
          className="preview-fade-in relative hidden lg:block"
          aria-hidden
          style={{ animationDelay: "0.6s", perspective: "800px" }}
        >
          {/* Spotlight behind middle card */}
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/3"
            style={{
              width: "280px",
              height: "280px",
              background:
                "radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)",
              filter: "blur(80px)",
            }}
          />

          <motion.div
            className="relative space-y-3"
            style={{
              transformStyle: "preserve-3d",
              transform: "rotate(-2deg) rotateY(-3deg)",
            }}
            animate={{ y: [0, -4, 0, 4, 0] }}
            transition={{
              duration: 12,
              ease: "easeInOut",
              repeat: Infinity,
            }}
          >
            {/* Frosted overlay for "behind glass" feel */}
            <div className="pointer-events-none absolute -inset-6 z-10 rounded-3xl bg-gradient-to-br from-white/[0.02] to-transparent backdrop-blur-[2px]" />

            {/* Label */}
            <div className="mb-4 flex items-center gap-2 px-1">
              <div className="h-1.5 w-1.5 rounded-full bg-[#5e9f99]" />
              <span className="text-[11px] font-medium uppercase tracking-[0.15em] text-white/25">
                Contribution scores
              </span>
            </div>

            {/* Stacked contributor cards with depth */}
            {previewContributors.map((c, i) => (
              <PreviewCard
                key={c.name}
                contributor={c}
                className="preview-fade-in"
                style={{
                  animationDelay: `${0.7 + i * 0.12}s`,
                  opacity: cardDepth[i].opacity,
                  filter: cardDepth[i].filter,
                }}
              />
            ))}

            {/* Fade-to-dark gradient at bottom */}
            <div className="pointer-events-none absolute -bottom-4 left-0 right-0 h-20 bg-gradient-to-t from-[#060609] to-transparent" />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
