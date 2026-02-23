"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useConvexAuth, useMutation } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../../convex/_generated/api";
import { Github, Clock, ArrowRight, FileText } from "lucide-react";
import { TypewriterPlaceholder } from "@/components/TypewriterPlaceholder";

// Pre-seeded heatmap data (no Math.random — avoids hydration mismatch)
const HEATMAP_DATA = {
  alex:  [1,0,1,1,0,1,0, 1,1,0,1,1,1,0],
  sarah: [0,1,0,1,0,0,1, 1,0,1,0,1,0,1],
  mike:  [0,0,1,0,0,0,1, 0,0,0,1,0,0,0],
};

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated } = useConvexAuth();
  const { signIn } = useAuthActions();
  const createAnalysis = useMutation(api.analyses.createAnalysis);

  const [repoInput, setRepoInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputFocused, setInputFocused] = useState(false);
  const [activeScreen, setActiveScreen] = useState(0);

  // Auto-switch screenshots every 3 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveScreen((s) => (s === 0 ? 1 : 0));
    }, 3000);
    return () => clearInterval(timer);
  }, []);

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

  function detectInput(raw: string): { type: "google_doc" | "github_repo"; id: string } | null {
    const trimmed = raw.trim();
    const gdoc = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (gdoc) return { type: "google_doc", id: gdoc[1] };
    const ghUrl = trimmed.match(/github\.com\/([a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+)/);
    if (ghUrl) return { type: "github_repo", id: ghUrl[1].replace(/\.git$/, "") };
    if (/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(trimmed)) return { type: "github_repo", id: trimmed };
    return null;
  }

  const handleRepoAnalyze = useCallback(async () => {
    const detected = detectInput(repoInput);
    if (!detected) {
      setError('Paste a Google Doc link or a GitHub repo (e.g. "facebook/react")');
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
      const title = detected.type === "github_repo" ? detected.id : "Google Doc";
      const analysisId = await createAnalysis({
        sourceType: detected.type,
        sourceId: detected.id,
        title,
      });
      router.push(`/results/${analysisId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create analysis");
    } finally {
      setIsSubmitting(false);
    }
  }, [repoInput, isAuthenticated, signIn, createAnalysis, router]);

  return (
    <div className="min-h-screen bg-white">
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
            <span className="text-[16px] font-bold text-warm-900">Glasswork</span>
          </Link>

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
              className="rounded-xl bg-warm-900 px-5 py-2 text-[13px] font-semibold text-white shadow-sm transition-all duration-200 hover:bg-warm-800 active:scale-[0.97]"
            >
              {isAuthenticated ? "Dashboard" : "Get started"}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero with floating cards ── */}
      <section className="relative mx-auto max-w-6xl overflow-hidden px-6 pb-32 pt-24 sm:pt-32">
        <div className="relative z-10 text-center">
          {/* Logo icon */}
          <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-layered animate-fade-up">
            <div className="grid h-7 w-7 grid-cols-2 gap-[3px]">
              <div className="h-3 w-3 rounded-[3px] bg-warm-900" />
              <div className="h-3 w-3 rounded-[3px] bg-warm-900" />
              <div className="h-3 w-3 rounded-[3px] bg-warm-900" />
              <div className="h-3 w-3 rounded-[3px] bg-warm-900" />
            </div>
          </div>

          {/* Headline */}
          <h1 className="font-myflora font-normal italic text-[3rem] leading-[1.08] tracking-tight text-warm-900 sm:text-[3.75rem] md:text-[4.5rem] animate-fade-up">
            Who actually did
            <br />
            the work?
          </h1>

          {/* Subtitle */}
          <p
            className="mx-auto mt-6 max-w-lg text-[18px] leading-relaxed text-warm-600 animate-fade-up"
            style={{ animationDelay: "0.25s" }}
          >
            Analyze GitHub repos and Google Docs. Every teammate gets a Fair Share Score — instantly see who&apos;s Locked In and who&apos;s Selling.
          </p>

          {/* CTA */}
          <div
            className="mt-10 flex flex-col items-center gap-4 animate-fade-up"
            style={{ animationDelay: "0.35s" }}
          >
            {/* Quick repo input */}
            <div className="mx-auto mt-4 w-full max-w-md">
              <div className="relative flex items-center gap-2 rounded-2xl border border-warm-200 bg-white p-2 shadow-layered transition-all focus-within:border-warm-400 focus-within:ring-2 focus-within:ring-warm-200">
                <div className="ml-3 flex shrink-0 items-center gap-1">
                  <Github className="h-4 w-4 text-warm-400" />
                  <span className="text-warm-300 text-[10px]">/</span>
                  <FileText className="h-4 w-4 text-warm-400" />
                </div>
                <div className="relative min-w-0 flex-1">
                  <input
                    type="text"
                    placeholder=""
                    value={repoInput}
                    onChange={(e) => {
                      setRepoInput(e.target.value);
                      setError(null);
                    }}
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => setInputFocused(false)}
                    onKeyDown={(e) => e.key === "Enter" && handleRepoAnalyze()}
                    className="relative z-10 w-full bg-transparent py-2.5 text-[15px] text-warm-900 placeholder:text-warm-400 focus:outline-none"
                  />
                  {!repoInput && !inputFocused && (
                    <div className="pointer-events-none absolute inset-0 flex items-center text-[15px]">
                      <TypewriterPlaceholder isVisible={!repoInput && !inputFocused} />
                    </div>
                  )}
                  {!repoInput && inputFocused && (
                    <div className="pointer-events-none absolute inset-0 flex items-center text-[15px] text-warm-400">
                      owner/repo or paste a Google Doc link
                    </div>
                  )}
                </div>
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
                GitHub repos &amp; Google Docs supported.
              </p>

              {/* Quick demo button */}
              <button
                onClick={() => {
                  setRepoInput("facebook/react");
                  void (async () => {
                    const trimmed = "facebook/react";
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
                  })();
                }}
                disabled={isSubmitting}
                className="mt-2 rounded-xl bg-warm-100 px-4 py-2 text-[13px] font-medium text-warm-700 transition-all duration-200 hover:bg-warm-200 hover:text-warm-900 active:scale-[0.97] disabled:opacity-50"
              >
                Try with facebook/react &rarr;
              </button>
            </div>
          </div>
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
              See who&apos;s locked in<br />
              and who&apos;s selling.
            </p>
          </div>
          <div className="absolute -bottom-4 -left-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-warm-900 shadow-layered">
              <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </motion.div>

        {/* Top-right: Activity card */}
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
                <span className="rounded-full bg-warm-100 px-2 py-0.5 font-medium text-warm-700">Score: 142</span>
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
                <Image src="/avatar_eddy.png" alt="Aaryan Verma" width={28} height={28} className="h-7 w-7 rounded-full object-cover" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-medium text-warm-800">Aaryan Verma</span>
                    <span className="text-[11px] font-semibold text-warm-900">172</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-warm-100">
                    <div className="h-full rounded-full bg-warm-800" style={{ width: "86%" }} />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Image src="/avatar_madhav.png" alt="Rohan Bedi" width={28} height={28} className="h-7 w-7 rounded-full object-cover" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-medium text-warm-800">Rohan Bedi</span>
                    <span className="text-[11px] font-semibold text-warm-700">118</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-warm-100">
                    <div className="h-full rounded-full bg-warm-500" style={{ width: "59%" }} />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Image src="/avatar_max.png" alt="Jackie Lin" width={28} height={28} className="h-7 w-7 rounded-full object-cover" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-medium text-warm-800">Jackie Lin</span>
                    <span className="text-[11px] font-semibold text-warm-400">34</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-warm-100">
                    <div className="h-full rounded-full bg-warm-300" style={{ width: "17%" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bottom-right: Works with card */}
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
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="#888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14 2v6h6M8 13h8M8 17h8M8 9h2" stroke="#888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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

      {/* ── Auto-switching Screenshots ── */}
      <section className="mx-auto max-w-5xl px-6 py-24">
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-display text-3xl font-bold tracking-tight text-warm-900 sm:text-4xl">
            See exactly who showed up
          </h2>
          <p className="mx-auto mt-4 max-w-md text-[16px] text-warm-500">
            From the dashboard to the final score — everything at a glance.
          </p>
        </motion.div>

        {/* Browser frame */}
        <motion.div
          className="relative overflow-hidden rounded-2xl border border-warm-200 bg-white shadow-[0_8px_40px_rgba(0,0,0,0.08)]"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          {/* Browser chrome */}
          <div className="flex items-center gap-2 border-b border-warm-200 bg-warm-50 px-4 py-3">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-warm-300" />
              <div className="h-3 w-3 rounded-full bg-warm-300" />
              <div className="h-3 w-3 rounded-full bg-warm-300" />
            </div>
            <div className="mx-auto flex h-6 w-48 items-center justify-center rounded-md bg-warm-200/60 text-[11px] text-warm-400">
              glasswork.app
            </div>
          </div>

          {/* Screen content */}
          <div className="relative h-[420px] overflow-hidden bg-white">
            <AnimatePresence mode="wait">
              {activeScreen === 0 ? (
                <motion.div
                  key="dashboard"
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  {/* Dashboard mockup */}
                  <div className="flex h-full">
                    {/* Left sidebar */}
                    <div className="w-[180px] shrink-0 border-r border-warm-100 bg-warm-50/50 p-4">
                      <div className="mb-5 flex items-center gap-2">
                        <div className="grid h-5 w-5 grid-cols-2 gap-[2px]">
                          <div className="h-2 w-2 rounded-[2px] bg-warm-700" />
                          <div className="h-2 w-2 rounded-[2px] bg-warm-700" />
                          <div className="h-2 w-2 rounded-[2px] bg-warm-700" />
                          <div className="h-2 w-2 rounded-[2px] bg-warm-700" />
                        </div>
                        <span className="text-[12px] font-bold text-warm-800">Glasswork</span>
                      </div>
                      <div className="space-y-1">
                        {["Analyses", "Reports", "Settings"].map((item, i) => (
                          <div key={item} className={`flex items-center gap-2 rounded-lg px-2.5 py-2 ${i === 0 ? "bg-warm-200" : ""}`}>
                            <div className="h-3.5 w-3.5 rounded bg-warm-300" />
                            <span className={`text-[11px] font-medium ${i === 0 ? "text-warm-900" : "text-warm-500"}`}>{item}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-6">
                        <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-warm-400">Recent</div>
                        <div className="space-y-1">
                          {["facebook/react", "vercel/next.js", "torvalds/linux"].map((repo) => (
                            <div key={repo} className="flex items-center gap-2 rounded-lg px-2.5 py-1.5">
                              <Github className="h-3 w-3 shrink-0 text-warm-400" />
                              <span className="truncate text-[10px] text-warm-500">{repo}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Main content */}
                    <div className="flex-1 p-5">
                      <div className="mb-4 text-[15px] font-bold text-warm-900">Dashboard</div>
                      <div className="grid grid-cols-3 gap-3">
                        {[{ label: "Analyses", val: "12" }, { label: "Contributors", val: "34" }, { label: "Avg Score", val: "124" }].map((s) => (
                          <div key={s.label} className="rounded-xl border border-warm-100 p-3">
                            <div className="text-[10px] text-warm-400">{s.label}</div>
                            <div className="mt-1 text-[22px] font-bold text-warm-900">{s.val}</div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        {/* Donut chart */}
                        <div className="rounded-xl border border-warm-100 p-3">
                          <div className="mb-2 text-[11px] font-semibold text-warm-700">Score Distribution</div>
                          <div className="flex items-center gap-4">
                            <svg viewBox="0 0 64 64" className="h-14 w-14 shrink-0">
                              <circle cx="32" cy="32" r="24" fill="none" stroke="#E5E5E5" strokeWidth="8" />
                              <circle cx="32" cy="32" r="24" fill="none" stroke="#111" strokeWidth="8"
                                strokeDasharray="75 75" strokeDashoffset="19" strokeLinecap="round" transform="rotate(-90 32 32)" />
                              <circle cx="32" cy="32" r="24" fill="none" stroke="#737373" strokeWidth="8"
                                strokeDasharray="45 105" strokeDashoffset="-56" strokeLinecap="round" transform="rotate(-90 32 32)" />
                            </svg>
                            <div className="space-y-1.5">
                              {[{ label: "Locked In", color: "bg-warm-900" }, { label: "Solid", color: "bg-warm-500" }, { label: "Not Locked", color: "bg-warm-300" }].map((t) => (
                                <div key={t.label} className="flex items-center gap-1.5">
                                  <div className={`h-2 w-2 rounded-full ${t.color}`} />
                                  <span className="text-[9px] text-warm-500">{t.label}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Top contributors */}
                        <div className="rounded-xl border border-warm-100 p-3">
                          <div className="mb-2 text-[11px] font-semibold text-warm-700">Top Contributors</div>
                          <div className="space-y-2">
                            {[{ name: "Alex C.", score: 172, pct: "86%" }, { name: "Sarah K.", score: 118, pct: "59%" }, { name: "Mike T.", score: 34, pct: "17%" }].map((p) => (
                              <div key={p.name} className="flex items-center gap-2">
                                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-warm-200 text-[8px] font-bold text-warm-600">{p.name[0]}</div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex justify-between">
                                    <span className="text-[9px] text-warm-600">{p.name}</span>
                                    <span className="text-[9px] font-bold text-warm-900">{p.score}</span>
                                  </div>
                                  <div className="mt-0.5 h-1 overflow-hidden rounded-full bg-warm-100">
                                    <div className="h-full rounded-full bg-warm-800" style={{ width: p.pct }} />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="results"
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  {/* Results mockup */}
                  <div className="flex h-full flex-col p-5">
                    <div className="mb-1 text-[11px] text-warm-400">facebook/react</div>
                    <div className="mb-5 text-[16px] font-bold text-warm-900">Analysis Results</div>
                    <div className="grid flex-1 grid-cols-3 gap-4">
                      {[
                        { name: "Aaryan Verma", score: 172, tier: "LOCKED IN", pct: "86%", hm: HEATMAP_DATA.alex },
                        { name: "Rohan Bedi", score: 118, tier: "MID", pct: "59%", hm: HEATMAP_DATA.sarah },
                        { name: "Jackie Lin", score: 34, tier: "SELLING", pct: "17%", hm: HEATMAP_DATA.mike },
                      ].map((c, idx) => (
                        <div key={c.name} className="flex flex-col rounded-2xl border border-warm-200 p-4">
                          {/* Avatar */}
                          <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-full text-[15px] font-bold ${idx === 0 ? "bg-warm-900 text-white" : idx === 1 ? "bg-warm-500 text-white" : "bg-warm-200 text-warm-600"}`}>
                            {c.name[0]}
                          </div>
                          {/* Name */}
                          <div className="text-[12px] font-semibold text-warm-800">{c.name}</div>
                          {/* Score */}
                          <div className="mt-1 text-[32px] font-bold leading-none text-warm-900">{c.score}</div>
                          {/* Tier badge */}
                          <div className={`mt-2 w-fit rounded-full px-2 py-0.5 text-[8px] font-bold ${idx === 0 ? "bg-warm-900 text-white" : idx === 1 ? "bg-warm-600 text-white" : "bg-warm-200 text-warm-600"}`}>
                            {c.tier}
                          </div>
                          {/* Mini heatmap */}
                          <div className="mt-3 grid grid-cols-7 gap-[2px]">
                            {c.hm.map((v, i) => (
                              <div
                                key={i}
                                className={`aspect-square rounded-[2px] ${v ? (idx === 0 ? "bg-warm-800" : idx === 1 ? "bg-warm-500" : "bg-warm-400") : "bg-warm-100"}`}
                              />
                            ))}
                          </div>
                          {/* Score bar */}
                          <div className="mt-3">
                            <div className="h-1.5 overflow-hidden rounded-full bg-warm-100">
                              <div
                                className={`h-full rounded-full ${idx === 0 ? "bg-warm-900" : idx === 1 ? "bg-warm-600" : "bg-warm-300"}`}
                                style={{ width: c.pct }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Dot indicators */}
        <div className="mt-5 flex items-center justify-center gap-2">
          {[0, 1].map((i) => (
            <button
              key={i}
              onClick={() => setActiveScreen(i)}
              className={`h-2 rounded-full transition-all duration-300 ${activeScreen === i ? "w-6 bg-warm-900" : "w-2 bg-warm-300"}`}
              aria-label={i === 0 ? "Dashboard view" : "Results view"}
            />
          ))}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="border-t border-warm-200/50 bg-white py-24">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="font-myflora text-3xl tracking-tight text-warm-900 sm:text-4xl italic">
            Your grades deserve
            <br />
            <em>transparency</em>
          </h2>

          <button
            onClick={handleGetStarted}
            className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-warm-900 px-8 py-3.5 text-[15px] font-semibold text-white shadow-layered transition-all duration-200 hover:scale-[1.03] hover:bg-warm-800 hover:shadow-layered-md active:scale-[0.97]"
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
            Built by a 16-year-old who was always locked in.
          </p>
        </div>
      </footer>
    </div>
  );
}
