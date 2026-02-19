"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useConvexAuth, useMutation } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { motion } from "framer-motion";
import { api } from "../../convex/_generated/api";
import { Github, BarChart3, GitCompare, Activity, FileText, Users, Clock, ArrowRight, Share2 } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated } = useConvexAuth();
  const { signIn } = useAuthActions();
  const createAnalysis = useMutation(api.analyses.createAnalysis);

  const [repoInput, setRepoInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGetStarted = useCallback(async () => {
    if (isAuthenticated) {
      router.push("/app");
      return;
    }
    try {
      await signIn("google", { redirectTo: "/app" });
    } catch (err) {
      console.error("Sign in failed:", err);
    }
  }, [isAuthenticated, router, signIn]);

  const handleRepoAnalyze = useCallback(async () => {
    const trimmed = repoInput.trim();
    if (!/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(trimmed)) {
      setError('Use "owner/repo" format (e.g. "facebook/react")');
      return;
    }

    if (!isAuthenticated) {
      try {
        await signIn("google", { redirectTo: "/app" });
      } catch (err) {
        console.error("Sign in failed:", err);
      }
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const analysisId = await createAnalysis({
        sourceType: "github_repo",
        sourceId: trimmed,
        title: trimmed,
      });
      router.push(`/results/${analysisId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create analysis");
    } finally {
      setIsSubmitting(false);
    }
  }, [repoInput, isAuthenticated, signIn, createAnalysis, router]);

  return (
    <div className="min-h-screen bg-surface">
      {/* ── Navigation ── */}
      <nav className="sticky top-0 z-50 border-b border-warm-200/40 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="grid h-7 w-7 grid-cols-2 gap-[3px]">
              <div className="h-3 w-3 rounded-[3px] bg-warm-900" />
              <div className="h-3 w-3 rounded-[3px] bg-warm-900" />
              <div className="h-3 w-3 rounded-[3px] bg-warm-900" />
              <div className="h-3 w-3 rounded-[3px] bg-warm-900" />
            </div>
            <span className="text-[16px] font-bold text-warm-900">
              Glasswork
            </span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-[14px] font-medium text-warm-500 transition-colors hover:text-warm-900">
              Features
            </a>
            <a href="#how-it-works" className="text-[14px] font-medium text-warm-500 transition-colors hover:text-warm-900">
              How it works
            </a>
            <a href="#integrations" className="text-[14px] font-medium text-warm-500 transition-colors hover:text-warm-900">
              Integrations
            </a>
          </div>

          <div className="flex items-center gap-5">
            <button
              onClick={handleGetStarted}
              className="hidden text-[14px] font-medium text-warm-600 transition-colors hover:text-warm-900 sm:block"
            >
              {isAuthenticated ? "Dashboard" : "Sign in"}
            </button>
            <button
              onClick={handleGetStarted}
              className="rounded-xl border border-warm-300 bg-white px-5 py-2 text-[13px] font-semibold text-warm-900 shadow-sm transition-all duration-200 hover:border-warm-400 hover:shadow-md active:scale-[0.97]"
            >
              {isAuthenticated ? "Go to workspace" : "Get started"}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero with floating cards ── */}
      <section className="relative mx-auto max-w-6xl overflow-hidden px-6 pb-32 pt-24 sm:pt-32">
        {/* Subtle radial gradient */}
        <div
          className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2"
          aria-hidden="true"
          style={{
            width: "900px",
            height: "600px",
            background: "radial-gradient(ellipse at center, rgba(108,99,255,0.06) 0%, rgba(108,99,255,0.02) 40%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />

        <div className="relative z-10 text-center">
          {/* Logo icon */}
          <motion.div
            className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-layered"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="grid h-7 w-7 grid-cols-2 gap-[3px]">
              <div className="h-3 w-3 rounded-[3px] bg-brand" />
              <div className="h-3 w-3 rounded-[3px] bg-warm-900" />
              <div className="h-3 w-3 rounded-[3px] bg-warm-900" />
              <div className="h-3 w-3 rounded-[3px] bg-warm-900" />
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            className="font-display text-[3rem] font-normal leading-[1.1] tracking-display text-warm-900 sm:text-[3.75rem] md:text-[4.5rem]"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            See who contributed
            <br />
            <span className="text-brand">to every project</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="mx-auto mt-6 max-w-lg text-[17px] leading-relaxed text-warm-500"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            Analyze Google Docs and GitHub repos to reveal exactly who did the work. Fair Share Scores for every teammate.
          </motion.p>

          {/* CTA */}
          <motion.div
            className="mt-10 flex flex-col items-center gap-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <button
              onClick={handleGetStarted}
              className="rounded-2xl bg-brand px-8 py-3.5 text-[15px] font-semibold text-white shadow-layered transition-all duration-200 hover:scale-[1.03] hover:shadow-layered-md active:scale-[0.97]"
            >
              {isAuthenticated ? "Go to workspace" : "Try for free"}
            </button>

            {/* Quick repo input */}
            <div className="mx-auto mt-4 w-full max-w-md">
              <div className="flex items-center gap-2 rounded-2xl border border-warm-200 bg-white p-2 shadow-layered transition-all focus-within:border-brand/40 focus-within:ring-2 focus-within:ring-brand/10">
                <Github className="ml-3 h-4 w-4 shrink-0 text-warm-400" />
                <input
                  type="text"
                  placeholder="owner/repo — e.g. facebook/react"
                  value={repoInput}
                  onChange={(e) => {
                    setRepoInput(e.target.value);
                    setError(null);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleRepoAnalyze()}
                  className="min-w-0 flex-1 bg-transparent py-2.5 text-[15px] text-warm-900 placeholder:text-warm-400 focus:outline-none"
                />
                <button
                  onClick={handleRepoAnalyze}
                  disabled={isSubmitting || !repoInput.trim()}
                  className="shrink-0 rounded-xl bg-warm-900 px-5 py-2.5 text-[13px] font-semibold text-white shadow-sm transition-all duration-200 hover:bg-warm-800 disabled:opacity-30"
                >
                  {isSubmitting ? "..." : "Analyze"}
                </button>
              </div>
              {error && (
                <p className="mt-2 text-[12px] text-danger">{error}</p>
              )}
              <p className="mt-2 text-[12px] text-warm-400">
                Public repos only. No tokens required.
              </p>
            </div>
          </motion.div>
        </div>

        {/* ── Floating cards ── */}

        {/* Top-left: Sticky note */}
        <motion.div
          className="absolute left-4 top-16 hidden lg:block"
          initial={{ opacity: 0, x: -40, rotate: -8 }}
          animate={{ opacity: 1, x: 0, rotate: -6 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="floating-card-1 w-[180px] rounded-sm bg-[#FFF9C4] p-4 shadow-layered" style={{ transform: "rotate(-6deg)" }}>
            <div className="absolute -right-1 -top-2 h-4 w-4 rounded-full bg-[#EF5350]/80 shadow-sm" />
            <p className="font-hand text-[15px] leading-snug text-warm-700">
              Track every edit,<br />
              every commit.<br />
              See who carried<br />
              the project.
            </p>
          </div>
          <div className="absolute -bottom-4 -left-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand shadow-layered">
              <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </motion.div>

        {/* Top-right: Reminders / Activity card */}
        <motion.div
          className="absolute right-4 top-12 hidden lg:block"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="floating-card-2 w-[220px] rounded-2xl border border-warm-200 bg-white p-5 shadow-layered">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[14px] font-semibold text-warm-900">Activity</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-warm-200 bg-warm-50">
                <Clock className="h-4 w-4 text-warm-500" />
              </div>
            </div>
            <div className="space-y-2.5">
              <div>
                <p className="text-[13px] font-medium text-warm-800">Latest Analysis</p>
                <p className="text-[11px] text-warm-400">facebook/react — 3 contributors</p>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="rounded-full bg-brand/10 px-2 py-0.5 font-medium text-brand">Score: 142</span>
                <span className="text-warm-400">2 min ago</span>
              </div>
            </div>
          </div>

          <div className="absolute -right-3 top-2 -z-10 w-[200px] rounded-2xl border border-warm-100 bg-warm-50 p-4 shadow-sm" style={{ transform: "rotate(3deg)" }}>
            <div className="h-3 w-16 rounded bg-warm-200" />
            <div className="mt-2 h-2 w-24 rounded bg-warm-100" />
          </div>
        </motion.div>

        {/* Bottom-left: Contributor scores card */}
        <motion.div
          className="absolute bottom-8 left-2 hidden lg:block"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="floating-card-3 w-[240px] rounded-2xl border border-warm-200 bg-white p-5 shadow-layered">
            <p className="mb-3 text-[14px] font-semibold text-warm-900">Fair Share Scores</p>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#D4A017]/10 text-[11px] font-bold text-[#D4A017]">A</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-medium text-warm-800">Alex Chen</span>
                    <span className="text-[11px] font-semibold text-[#D4A017]">172</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-warm-100">
                    <div className="h-full rounded-full bg-[#D4A017]" style={{ width: "86%" }} />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2DA44E]/10 text-[11px] font-bold text-[#2DA44E]">S</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-medium text-warm-800">Sarah Kim</span>
                    <span className="text-[11px] font-semibold text-[#2DA44E]">118</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-warm-100">
                    <div className="h-full rounded-full bg-[#2DA44E]" style={{ width: "59%" }} />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#E53935]/10 text-[11px] font-bold text-[#E53935]">M</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-medium text-warm-800">Mike Torres</span>
                    <span className="text-[11px] font-semibold text-[#E53935]">34</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-warm-100">
                    <div className="h-full rounded-full bg-[#E53935]" style={{ width: "17%" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bottom-right: Integrations card */}
        <motion.div
          className="absolute bottom-12 right-4 hidden lg:block"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="floating-card-4 w-[200px] rounded-2xl border border-warm-200 bg-white p-5 shadow-layered">
            <p className="mb-4 text-[14px] font-semibold text-warm-900">Works with</p>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-warm-50 shadow-sm">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="#4285F4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14 2v6h6M8 13h8M8 17h8M8 9h2" stroke="#4285F4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-warm-50 shadow-sm">
                <Github className="h-6 w-6 text-warm-900" strokeWidth={1.5} />
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-warm-50 shadow-sm">
                <span className="text-[11px] font-bold text-warm-400">+5</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Features grid ── */}
      <section id="features" className="mx-auto max-w-5xl px-6 py-24">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-display text-3xl font-normal tracking-display text-warm-900 sm:text-4xl">
            Everything you need to see the truth
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-[16px] text-warm-500">
            From revision diffs to commit graphs, Glasswork turns boring version history into clear contribution data.
          </p>
        </motion.div>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {[
            {
              icon: BarChart3,
              title: "Fair Share Scores",
              description: "Normalized 0–200 scores that show exactly who carried, who contributed, and who ghosted.",
            },
            {
              icon: Activity,
              title: "Contribution Heatmap",
              description: "Color-coded activity timeline — cyan for code, magenta for docs. Days with both glow purple.",
            },
            {
              icon: GitCompare,
              title: "Revision Forensics",
              description: "Character-level diffing on Google Docs. We count the words, not just the edits.",
            },
            {
              icon: Github,
              title: "GitHub Deep Dive",
              description: "Commits, additions, deletions, and co-authored-by credit. Squash-proof analysis.",
            },
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              className="group rounded-2xl border border-warm-200 bg-white p-8 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-brand/[0.08] text-brand transition-colors group-hover:bg-brand/[0.14]">
                <feature.icon className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <h3 className="text-[17px] font-semibold text-warm-900">
                {feature.title}
              </h3>
              <p className="mt-2 text-[14px] leading-relaxed text-warm-500">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="border-y border-warm-200/50 bg-white/60 py-24">
        <div className="mx-auto max-w-5xl px-6">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display text-3xl font-normal tracking-display text-warm-900 sm:text-4xl">
              Three steps. Full transparency.
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-[16px] text-warm-500">
              Get from link to leaderboard in under a minute.
            </p>
          </motion.div>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                icon: FileText,
                title: "Paste a link",
                description: "Drop a Google Doc URL or GitHub repo. We handle the rest.",
              },
              {
                step: "02",
                icon: Users,
                title: "See contributors",
                description: "Revision history and commit data, broken down by person with fair scores.",
              },
              {
                step: "03",
                icon: Share2,
                title: "Share the proof",
                description: "One-click shareable link with ranked contributions and heatmaps.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                className="relative text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
              >
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/[0.08]">
                  <item.icon className="h-6 w-6 text-brand" strokeWidth={1.5} />
                </div>
                <span className="mb-2 block text-[12px] font-semibold tracking-micro text-brand uppercase">
                  Step {item.step}
                </span>
                <h3 className="text-[18px] font-semibold text-warm-900">
                  {item.title}
                </h3>
                <p className="mx-auto mt-2 max-w-[240px] text-[14px] leading-relaxed text-warm-500">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Integrations marquee ── */}
      <section id="integrations" className="overflow-hidden py-16">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <h2 className="font-display text-2xl font-normal tracking-display text-warm-900 sm:text-3xl">
            Integrations & more coming
          </h2>
          <p className="mx-auto mt-3 max-w-md text-[15px] text-warm-500">
            Google Docs and GitHub today. Notion, Linear, Figma, and more on the way.
          </p>
        </div>

        <div className="relative mt-12">
          <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-24 bg-gradient-to-r from-surface to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-surface to-transparent" />

          <div className="animate-marquee flex items-center gap-14 whitespace-nowrap" style={{ width: "max-content" }}>
            {[
              { name: "Google Docs", supported: true },
              { name: "GitHub", supported: true },
              { name: "Notion", supported: false },
              { name: "Confluence", supported: false },
              { name: "Linear", supported: false },
              { name: "Jira", supported: false },
              { name: "Figma", supported: false },
              { name: "Google Docs", supported: true },
              { name: "GitHub", supported: true },
              { name: "Notion", supported: false },
              { name: "Confluence", supported: false },
              { name: "Linear", supported: false },
              { name: "Jira", supported: false },
              { name: "Figma", supported: false },
            ].map((item, i) => (
              <div
                key={`${item.name}-${i}`}
                className={`flex shrink-0 items-center gap-2.5 ${item.supported ? "text-warm-900" : "text-warm-400"}`}
              >
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${item.supported ? "bg-brand/10" : "bg-warm-100"}`}>
                  <span className="text-[12px] font-bold">{item.name.charAt(0)}</span>
                </div>
                <span className={`text-[15px] font-semibold ${item.supported ? "text-warm-900" : "text-warm-400"}`}>
                  {item.name}
                </span>
                {!item.supported && (
                  <span className="rounded-full bg-warm-100 px-2 py-0.5 text-[10px] font-medium text-warm-400">
                    soon
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="border-t border-warm-200/50 bg-white/60 py-24">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="font-display text-3xl font-normal tracking-display text-warm-900 sm:text-4xl">
            Your grades deserve transparency
          </h2>
          <p className="mx-auto mt-4 max-w-md text-[16px] text-warm-500">
            Stop letting freeloaders take credit. See the data, share the proof.
          </p>
          <button
            onClick={handleGetStarted}
            className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-brand px-8 py-3.5 text-[15px] font-semibold text-white shadow-layered transition-all duration-200 hover:scale-[1.03] hover:shadow-layered-md active:scale-[0.97]"
          >
            {isAuthenticated ? "Go to workspace" : "Get started free"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-warm-200/50 px-6 py-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="grid h-4 w-4 grid-cols-2 gap-[2px]">
              <div className="h-1.5 w-1.5 rounded-[1px] bg-warm-400" />
              <div className="h-1.5 w-1.5 rounded-[1px] bg-warm-400" />
              <div className="h-1.5 w-1.5 rounded-[1px] bg-warm-400" />
              <div className="h-1.5 w-1.5 rounded-[1px] bg-warm-400" />
            </div>
            <span className="text-[13px] font-medium text-warm-500">Glasswork</span>
          </div>
          <p className="text-[12px] text-warm-400">
            Built by a 16-year-old tired of carrying group projects.
          </p>
        </div>
      </footer>
    </div>
  );
}
