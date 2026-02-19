"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useConvexAuth, useMutation } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { motion } from "framer-motion";
import { api } from "../../convex/_generated/api";
import { Github, BarChart3, GitCompare, Activity, Clock, ArrowRight } from "lucide-react";

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

          <div className="hidden items-center gap-1 rounded-full border border-warm-200 bg-warm-50/50 p-1 md:flex">
            <a href="#features" className="rounded-full px-4 py-1.5 text-[13px] font-semibold text-warm-600 transition-all hover:bg-white hover:text-warm-900 hover:shadow-sm">
              Features
            </a>
            <a href="#integrations" className="rounded-full px-4 py-1.5 text-[13px] font-semibold text-warm-600 transition-all hover:bg-white hover:text-warm-900 hover:shadow-sm">
              Integrations
            </a>
          </div>

          <div className="flex items-center gap-5">
            {!isAuthenticated && (
              <button
                onClick={handleGetStarted}
                className="hidden text-[14px] font-medium text-warm-600 transition-colors hover:text-warm-900 sm:block"
              >
                Sign in
              </button>
            )}
            <button
              onClick={handleGetStarted}
              className="rounded-xl border border-warm-300 bg-white px-5 py-2 text-[13px] font-semibold text-warm-900 shadow-sm transition-all duration-200 hover:border-warm-400 hover:shadow-md active:scale-[0.97]"
            >
              {isAuthenticated ? "Dashboard" : "Get started"}
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
            className="font-display text-[3rem] font-extrabold leading-[1.08] tracking-tight text-warm-900 sm:text-[3.75rem] md:text-[4.5rem]"
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
            className="mx-auto mt-6 max-w-lg text-[18px] leading-relaxed text-warm-600"
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
          <h2 className="font-display text-3xl font-bold tracking-tight text-warm-900 sm:text-4xl">
            Everything you need to see the truth
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-[16px] text-warm-600">
            From revision diffs to commit graphs, Glasswork turns boring version history into clear contribution data.
          </p>
        </motion.div>

        <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Fair Share Scores — tall card */}
          <motion.div
            className="group relative overflow-hidden rounded-2xl border border-warm-100 bg-white p-6 transition-all duration-300 hover:shadow-card-hover sm:row-span-2"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-5 rounded-xl bg-warm-50 p-5">
              <div className="space-y-3">
                {[
                  { name: "Alex C.", score: 172, pct: "86%", color: "#D4A017" },
                  { name: "Sarah K.", score: 118, pct: "59%", color: "#2DA44E" },
                  { name: "Mike T.", score: 34, pct: "17%", color: "#E53935" },
                ].map((person) => (
                  <div key={person.name} className="flex items-center gap-2.5">
                    <div
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                      style={{ backgroundColor: `${person.color}15`, color: person.color }}
                    >
                      {person.name[0]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-medium text-warm-700">{person.name}</span>
                        <span className="text-[11px] font-bold" style={{ color: person.color }}>{person.score}</span>
                      </div>
                      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-warm-100">
                        <div className="h-full rounded-full" style={{ width: person.pct, backgroundColor: person.color }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <BarChart3 className="mb-3 h-5 w-5 text-[#D4A017]" strokeWidth={1.5} />
            <h3 className="text-[16px] font-bold tracking-tight text-warm-900">
              Fair Share Scores
            </h3>
            <p className="mt-2 text-[13px] leading-relaxed text-warm-500">
              Normalized 0-200 scores that show exactly who carried, who contributed, and who ghosted.
            </p>
          </motion.div>

          {/* Contribution Heatmap */}
          <motion.div
            className="group relative overflow-hidden rounded-2xl border border-warm-100 bg-white p-6 transition-all duration-300 hover:shadow-card-hover"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="mb-5 rounded-xl bg-warm-50 p-4">
              <div className="grid grid-cols-7 gap-1">
                {[
                  0,1,2,0,3,1,0,
                  1,2,3,2,1,0,1,
                  2,3,2,1,3,2,0,
                  0,1,3,2,1,1,2,
                  1,0,2,3,2,0,1,
                ].map((level, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-[3px]"
                    style={{
                      backgroundColor: [
                        "#F5F5F5",
                        "rgba(108,99,255,0.2)",
                        "rgba(108,99,255,0.45)",
                        "rgba(108,99,255,0.75)",
                      ][level],
                    }}
                  />
                ))}
              </div>
            </div>
            <Activity className="mb-3 h-5 w-5 text-brand" strokeWidth={1.5} />
            <h3 className="text-[16px] font-bold tracking-tight text-warm-900">
              Contribution Heatmap
            </h3>
            <p className="mt-2 text-[13px] leading-relaxed text-warm-500">
              Color-coded activity timeline — cyan for code, magenta for docs. Days with both glow purple.
            </p>
          </motion.div>

          {/* Revision Forensics */}
          <motion.div
            className="group relative overflow-hidden rounded-2xl border border-warm-100 bg-white p-6 transition-all duration-300 hover:shadow-card-hover"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="mb-5 space-y-1.5 rounded-xl bg-warm-50 p-4 font-mono text-[11px]">
              <div className="flex items-center gap-2 text-warm-400">
                <span className="w-4 text-right text-[10px]">14</span>
                <span className="text-warm-300">│</span>
                <span>The results were analyzed...</span>
              </div>
              <div className="flex items-center gap-2 rounded bg-[#2DA44E]/10 text-[#2DA44E]">
                <span className="w-4 text-right text-[10px]">15</span>
                <span className="text-[#2DA44E]/40">│</span>
                <span>+ and the data confirms a clear</span>
              </div>
              <div className="flex items-center gap-2 rounded bg-[#E53935]/10 text-[#E53935]">
                <span className="w-4 text-right text-[10px]">16</span>
                <span className="text-[#E53935]/40">│</span>
                <span>- preliminary findings suggest</span>
              </div>
              <div className="flex items-center gap-2 text-warm-400">
                <span className="w-4 text-right text-[10px]">17</span>
                <span className="text-warm-300">│</span>
                <span>trend in contribution...</span>
              </div>
            </div>
            <GitCompare className="mb-3 h-5 w-5 text-[#2DA44E]" strokeWidth={1.5} />
            <h3 className="text-[16px] font-bold tracking-tight text-warm-900">
              Revision Forensics
            </h3>
            <p className="mt-2 text-[13px] leading-relaxed text-warm-500">
              Character-level diffing on Google Docs. We count the words, not just the edits.
            </p>
          </motion.div>

          {/* GitHub Deep Dive — wide card */}
          <motion.div
            className="group relative overflow-hidden rounded-2xl border border-warm-100 bg-white p-6 transition-all duration-300 hover:shadow-card-hover sm:col-span-2"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="mb-5 flex items-center gap-4 rounded-xl bg-warm-50 p-4">
              {[
                { hash: "a3f2c1d", msg: "feat: add scoring engine", time: "2h ago", color: "#2DA44E" },
                { hash: "b7e4a9f", msg: "fix: normalize edge cases", time: "5h ago", color: "#D4A017" },
                { hash: "c1d8b3e", msg: "refactor: split analyzer", time: "1d ago", color: "#6C63FF" },
              ].map((commit, i) => (
                <div key={commit.hash} className="flex flex-1 items-start gap-3">
                  {i > 0 && <div className="mt-2 h-px w-4 bg-warm-200" />}
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: commit.color }} />
                      <code className="text-[11px] font-semibold text-warm-700">{commit.hash}</code>
                    </div>
                    <p className="mt-0.5 text-[11px] text-warm-500">{commit.msg}</p>
                    <p className="text-[10px] text-warm-400">{commit.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <Github className="mb-3 h-5 w-5 text-warm-900" strokeWidth={1.5} />
            <h3 className="text-[16px] font-bold tracking-tight text-warm-900">
              GitHub Deep Dive
            </h3>
            <p className="mt-2 text-[13px] leading-relaxed text-warm-500">
              Commits, additions, deletions, and co-authored-by credit. Squash-proof analysis.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Integrations marquee ── */}
      <section id="integrations" className="overflow-hidden py-16">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <h2 className="font-display text-2xl font-bold tracking-tight text-warm-900 sm:text-3xl">
            Integrations & more coming
          </h2>
          <p className="mx-auto mt-3 max-w-md text-[15px] text-warm-600">
            Google Docs and GitHub today. Notion, Linear, Figma, and more on the way.
          </p>
        </div>

        <div className="relative mt-12">
          <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-24 bg-gradient-to-r from-white to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-white to-transparent" />

          <div className="animate-marquee flex items-center whitespace-nowrap" style={{ width: "max-content" }}>
            {Array.from({ length: 4 }, (_, setIndex) =>
              [
                {
                  name: "Google Docs",
                  logo: (
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" fill="#4285F4" fillOpacity="0.12" stroke="#4285F4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M14 2v6h6M8 13h8M8 17h8M8 9h2" stroke="#4285F4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ),
                },
                {
                  name: "GitHub",
                  logo: (
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#181717">
                      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                    </svg>
                  ),
                },
                {
                  name: "Notion",
                  logo: (
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                      <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L18.09 2.17c-.466-.373-.84-.653-1.772-.56l-12.79.933c-.466.047-.56.28-.373.466l1.304 1.199zm.793 3.172v13.85c0 .746.373 1.026 1.212.98l14.523-.84c.84-.046.933-.56.933-1.166V6.54c0-.606-.233-.933-.746-.886l-15.177.84c-.56.046-.746.326-.746.886zm14.337.7c.093.42 0 .84-.42.888l-.7.14v10.264c-.606.327-1.166.514-1.633.514-.746 0-.933-.234-1.493-.934l-4.572-7.186v6.952l1.446.327s0 .84-1.166.84l-3.218.186c-.093-.186 0-.653.327-.726l.84-.233V8.62l-1.166-.093c-.093-.42.14-1.026.793-1.073l3.451-.233 4.759 7.28V8.247l-1.213-.14c-.093-.513.28-.886.746-.933l3.219-.186z" fill="#000"/>
                    </svg>
                  ),
                },
                {
                  name: "Confluence",
                  logo: (
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                      <path d="M.87 18.257c-.248.382-.53.875-.763 1.245a.764.764 0 0 0 .255 1.04l4.965 3.054a.764.764 0 0 0 1.058-.26c.199-.332.49-.842.743-1.217 2.078-3.13 4.175-2.778 7.972-1.074l3.943 1.737a.764.764 0 0 0 1-.41l2.205-5.247a.764.764 0 0 0-.39-1.004l-3.907-1.722c-7.892-3.5-14.2-2.098-17.08 3.858z" fill="#1868DB"/>
                      <path d="M23.13 5.743c.249-.382.53-.875.764-1.245a.764.764 0 0 0-.256-1.04L18.673.404a.764.764 0 0 0-1.058.26c-.2.332-.49.842-.743 1.217C14.794 5.01 12.697 4.66 8.9 2.955L4.957 1.218a.764.764 0 0 0-1 .41L1.752 6.875a.764.764 0 0 0 .39 1.004l3.907 1.722c7.892 3.5 14.2 2.098 17.08-3.858z" fill="#1868DB"/>
                    </svg>
                  ),
                },
                {
                  name: "Linear",
                  logo: (
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                      <path d="M1.224 12.545a.342.342 0 0 1 0-.39l.188-.263a10.967 10.967 0 0 1 10.696-4.836.342.342 0 0 1 .2.567L3.44 16.492a.342.342 0 0 1-.488-.005A10.893 10.893 0 0 1 1.224 12.545z" fill="#5E6AD2"/>
                      <path d="M4.342 18.276a.342.342 0 0 1-.01-.495l9.94-9.94a.342.342 0 0 1 .567.2 10.967 10.967 0 0 1-4.837 10.696l-.263.188a.342.342 0 0 1-.39 0 10.96 10.96 0 0 1-5.007-4.649z" fill="#5E6AD2"/>
                      <path d="M12.545 22.776a.342.342 0 0 1-.39 0 10.892 10.892 0 0 1-3.942-3.941.342.342 0 0 1 .043-.41l8.32-8.32a.342.342 0 0 1 .568.192c.57 3.295-.465 6.776-3.097 9.47a11.066 11.066 0 0 1-1.502 1.009z" fill="#5E6AD2"/>
                      <path d="M18.835 16.488a.342.342 0 0 1-.494-.01 10.893 10.893 0 0 1-.774-.89.342.342 0 0 1 .024-.443l3.413-3.413a.342.342 0 0 1 .568.192 10.9 10.9 0 0 1-2.737 4.564z" fill="#5E6AD2"/>
                      <path d="M22.776 11.455a.342.342 0 0 1 0 .39c-.118.164-.22.318-.318.463a.342.342 0 0 1-.533.05l-1.438-1.439a.342.342 0 0 1 .192-.568 10.9 10.9 0 0 1 2.097 1.104z" fill="#5E6AD2"/>
                    </svg>
                  ),
                },
                {
                  name: "Jira",
                  logo: (
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                      <path d="M11.571 11.513H0a5.218 5.218 0 0 0 5.232 5.215h2.13v2.057A5.215 5.215 0 0 0 12.575 24V12.518a1.005 1.005 0 0 0-1.005-1.005z" fill="#2684FF"/>
                      <path d="M17.11 5.953H5.539a5.218 5.218 0 0 0 5.231 5.214h2.13v2.058a5.218 5.218 0 0 0 5.214 5.215V6.958a1.005 1.005 0 0 0-1.005-1.005z" fill="#2684FF" fillOpacity="0.85"/>
                      <path d="M22.648.394H11.077a5.218 5.218 0 0 0 5.231 5.214h2.13v2.058A5.218 5.218 0 0 0 23.652 12.88V1.399a1.005 1.005 0 0 0-1.005-1.005z" fill="#2684FF" fillOpacity="0.7"/>
                    </svg>
                  ),
                },
                {
                  name: "Figma",
                  logo: (
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                      <path d="M8 24c2.208 0 4-1.792 4-4v-4H8c-2.208 0-4 1.792-4 4s1.792 4 4 4z" fill="#0ACF83"/>
                      <path d="M4 12c0-2.208 1.792-4 4-4h4v8H8c-2.208 0-4-1.792-4-4z" fill="#A259FF"/>
                      <path d="M4 4c0-2.208 1.792-4 4-4h4v8H8C5.792 8 4 6.208 4 4z" fill="#F24E1E"/>
                      <path d="M12 0h4c2.208 0 4 1.792 4 4s-1.792 4-4 4h-4V0z" fill="#FF7262"/>
                      <path d="M20 12c0 2.208-1.792 4-4 4s-4-1.792-4-4 1.792-4 4-4 4 1.792 4 4z" fill="#1ABCFE"/>
                    </svg>
                  ),
                },
              ].map((item, i) => (
                <div
                  key={`${item.name}-${setIndex}-${i}`}
                  className="mx-7 flex shrink-0 items-center gap-2.5"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warm-50">
                    {item.logo}
                  </div>
                  <span className="text-[15px] font-semibold text-warm-900">
                    {item.name}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="border-t border-warm-200/50 bg-white py-24">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-warm-900 sm:text-4xl">
            Your grades deserve transparency
          </h2>
          <p className="mx-auto mt-4 max-w-md text-[16px] text-warm-600">
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
      <footer className="border-t border-warm-200/50 bg-white px-6 py-6">
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
