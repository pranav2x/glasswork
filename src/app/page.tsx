"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useConvexAuth, useMutation } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { motion } from "framer-motion";
import { api } from "../../convex/_generated/api";
import { Github, ArrowRight, FileText, Eye, Users, BarChart3, MessageSquare, TrendingUp } from "lucide-react";
import { TypewriterPlaceholder } from "@/components/TypewriterPlaceholder";

/* ─── Pre-seeded data for the results preview card ─── */
const HEATMAP_DATA = {
  alex:  [1,0,1,1,0,1,0, 1,1,0,1,1,1,0],
  sarah: [0,1,0,1,0,0,1, 1,0,1,0,1,0,1],
  mike:  [0,0,1,0,0,0,1, 0,0,0,1,0,0,0],
};

/* ─── Framer Motion stagger config ─── */
const easeOut = [0.22, 1, 0.36, 1] as const;

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated } = useConvexAuth();
  const { signIn } = useAuthActions();
  const createAnalysis = useMutation(api.analyses.createAnalysis);

  const [repoInput, setRepoInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputFocused, setInputFocused] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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
      try { await signIn("google", { redirectTo: "/app" }); } catch {}
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const title = detected.type === "github_repo" ? detected.id : "Google Doc";
      const analysisId = await createAnalysis({ sourceType: detected.type, sourceId: detected.id, title });
      router.push(`/results/${analysisId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create analysis");
    } finally {
      setIsSubmitting(false);
    }
  }, [repoInput, isAuthenticated, signIn, createAnalysis, router]);

  const handleQuickDemo = useCallback(async () => {
    setRepoInput("facebook/react");
    if (!isAuthenticated) {
      try { await signIn("google", { redirectTo: "/app" }); } catch {}
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const analysisId = await createAnalysis({ sourceType: "github_repo", sourceId: "facebook/react", title: "facebook/react" });
      router.push(`/results/${analysisId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create analysis");
    } finally {
      setIsSubmitting(false);
    }
  }, [isAuthenticated, signIn, createAnalysis, router]);

  return (
    <div className="min-h-screen bg-[#F4F1ED] overflow-x-hidden">

      {/* ── Floating Navbar ── */}
      <nav className="fixed left-0 right-0 top-0 z-50 transition-all duration-500">
        <div className={`mx-auto mt-4 flex max-w-3xl items-center justify-between rounded-full px-7 py-3.5 backdrop-blur-xl transition-all duration-500 ${
          scrolled
            ? "border border-warm-200/60 bg-white/90 shadow-layered"
            : "border border-warm-300/20 bg-white/40"
        }`}>
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/logo.png" alt="Glasswork" className="h-6 w-6 rounded-lg object-contain" />
            <span className={`font-myflora text-[18px] font-semibold transition-colors duration-500 ${scrolled ? "text-warm-900" : "text-warm-800"}`}>
              Glasswork
            </span>
          </Link>

          <div className="hidden items-center gap-8 sm:flex">
            <span onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })} className="cursor-pointer font-myflora text-[14px] font-medium text-warm-500 transition-colors duration-300 hover:text-warm-800">
              About
            </span>
          </div>

          <button
            onClick={handleGetStarted}
            className="flex items-center gap-1.5 rounded-full border border-warm-800 bg-warm-900 px-5 py-2 text-[13px] font-semibold text-white transition-all duration-300 hover:bg-warm-800 active:scale-[0.97]"
          >
            {isAuthenticated ? "Dashboard" : "Sign up"}
          </button>
        </div>
      </nav>

      {/* ── Hero Section — Earnwave-inspired ── */}
      <section className="relative min-h-screen overflow-hidden">

        {/* Soft warm gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#F4F1ED] via-[#EDE8E1] to-[#E8E2DA]" />

        {/* Wave/curtain shapes — left side (Earnwave-style prominent curtains) */}
        <div className="wave-left absolute left-0 top-0 h-full w-[30%] pointer-events-none">
          <svg viewBox="0 0 400 1000" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full" preserveAspectRatio="none">
            {/* Outer curtain — darker */}
            <path
              d="M0 0 L360 0 Q300 200 320 400 Q340 600 260 800 Q200 900 360 1000 L0 1000 Z"
              fill="#DDD6CA"
              fillOpacity="0.7"
            />
            {/* Inner curtain — lighter, slightly offset */}
            <path
              d="M0 0 L280 0 Q220 180 240 360 Q260 540 200 720 Q140 860 280 1000 L0 1000 Z"
              fill="#E5DED3"
              fillOpacity="0.5"
            />
          </svg>
        </div>

        {/* Wave/curtain shapes — right side */}
        <div className="wave-right absolute right-0 top-0 h-full w-[30%] pointer-events-none">
          <svg viewBox="0 0 400 1000" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full" preserveAspectRatio="none">
            {/* Outer curtain — darker */}
            <path
              d="M400 0 L40 0 Q100 200 80 400 Q60 600 140 800 Q200 900 40 1000 L400 1000 Z"
              fill="#DDD6CA"
              fillOpacity="0.7"
            />
            {/* Inner curtain — lighter */}
            <path
              d="M400 0 L120 0 Q180 180 160 360 Q140 540 200 720 Q260 860 120 1000 L400 1000 Z"
              fill="#E5DED3"
              fillOpacity="0.5"
            />
          </svg>
        </div>

        {/* Hero content */}
        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 pt-24 pb-16">

          {/* Headline */}
          <motion.h1
            className="font-myflora text-center text-[3.5rem] leading-[1.05] tracking-tight text-warm-900 sm:text-[4.5rem] md:text-[5.5rem]"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: easeOut }}
          >
            See through the work.
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="mt-5 max-w-lg text-center text-[1rem] leading-relaxed text-warm-500 sm:text-[1.15rem]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: easeOut }}
          >
            Glasswork analyzes GitHub repos and Google Docs to show exactly who contributed — and who didn&apos;t.
          </motion.p>

          {/* Decorative dots / indicator line */}
          <motion.div
            className="mt-10 flex items-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="h-[3px] w-6 rounded-full bg-warm-300" />
            <div className="h-2 w-2 rounded-full bg-warm-400" />
            <div className="h-[3px] w-10 rounded-full bg-warm-300" />
            <div className="flex h-6 w-6 items-center justify-center rounded-full border border-warm-300">
              <div className="h-1.5 w-1.5 rounded-full bg-warm-400" />
            </div>
            <div className="h-[3px] w-10 rounded-full bg-warm-300" />
            <div className="h-2 w-2 rounded-full bg-warm-400" />
            <div className="h-[3px] w-6 rounded-full bg-warm-300" />
          </motion.div>

          {/* Three Bento Cards */}
          <div className="mt-14 grid w-full max-w-4xl grid-cols-1 gap-5 px-4 sm:grid-cols-3 sm:px-0">

            {/* Card 1: Your Score */}
            <motion.div
              className="card-tilt cursor-pointer rounded-[20px] border border-warm-200/50 bg-white p-6 shadow-[0_4px_32px_rgba(0,0,0,0.06)]"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6, ease: easeOut }}
            >
              <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-[#D4A017]/10 px-3 py-1">
                <TrendingUp className="h-3 w-3 text-[#D4A017]" />
                <span className="font-body text-[11px] font-semibold text-[#D4A017]">Your score</span>
              </div>
              <div className="font-body text-[3rem] font-bold leading-none tracking-tight text-warm-900">
                172
              </div>
              <p className="font-body mt-1.5 text-[13px] text-warm-400">out of 200</p>
              {/* Mini sparkline chart — warm gradient bars */}
              <div className="mt-6 flex items-end gap-[4px] h-[52px]">
                {[28, 42, 35, 58, 48, 68, 62, 78, 72, 88, 82, 96].map((h, i) => (
                  <div
                    key={i}
                    className="w-full rounded-[3px]"
                    style={{
                      height: `${h * 0.54}%`,
                      background: `linear-gradient(to top, #D4A017${i > 8 ? "" : "60"}, #5BA8C8${i > 8 ? "" : "40"})`,
                    }}
                  />
                ))}
              </div>
            </motion.div>

            {/* Card 2: Analyze Sources (center, slightly elevated) */}
            <motion.div
              className="card-tilt card-tilt-center cursor-pointer rounded-[20px] border border-warm-200/50 bg-white p-6 shadow-[0_4px_32px_rgba(0,0,0,0.06)] sm:-mt-5"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.75, ease: easeOut }}
            >
              <h3 className="font-body mb-6 text-center text-[16px] font-semibold text-warm-800">Analyze sources</h3>
              {/* Source icons with connecting lines — like Earnwave's hub */}
              <div className="relative mx-auto">
                {/* Connection lines behind icons */}
                <svg className="absolute inset-0 h-full w-full" viewBox="0 0 200 120" fill="none">
                  <line x1="50" y1="40" x2="100" y2="40" stroke="#E5E5E5" strokeWidth="1.5" />
                  <line x1="100" y1="40" x2="150" y2="40" stroke="#E5E5E5" strokeWidth="1.5" />
                  <line x1="75" y1="90" x2="100" y2="60" stroke="#E5E5E5" strokeWidth="1.5" />
                  <line x1="125" y1="90" x2="100" y2="60" stroke="#E5E5E5" strokeWidth="1.5" />
                </svg>
                <div className="relative flex flex-col items-center gap-5">
                  <div className="flex items-center gap-6">
                    <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full border border-warm-200 bg-white shadow-sm">
                      <Github className="h-6 w-6 text-warm-800" />
                    </div>
                    <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full border border-warm-200 bg-white shadow-sm">
                      <FileText className="h-6 w-6 text-[#4285F4]" />
                    </div>
                    <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full border border-warm-200 bg-white shadow-sm">
                      <Eye className="h-6 w-6 text-warm-500" />
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full border border-warm-200 bg-white shadow-sm">
                      <Users className="h-6 w-6 text-warm-500" />
                    </div>
                    <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full border border-warm-200 bg-white shadow-sm">
                      <BarChart3 className="h-6 w-6 text-[#D4A017]" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Card 3: AI Insights — chat bubbles */}
            <motion.div
              className="card-tilt card-tilt-right cursor-pointer rounded-[20px] border border-warm-200/50 bg-white p-6 shadow-[0_4px_32px_rgba(0,0,0,0.06)]"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9, ease: easeOut }}
            >
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-warm-100">
                  <MessageSquare className="h-4 w-4 text-warm-600" />
                </div>
              </div>
              {/* Chat-style AI summary bubbles */}
              <div className="space-y-3">
                <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-warm-100 px-4 py-3">
                  <p className="font-body text-[12px] leading-relaxed text-warm-600">Who carried the React project?</p>
                </div>
                <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-warm-100 px-4 py-3">
                  <p className="font-body text-[12px] leading-relaxed text-warm-600">How much did Sarah actually write?</p>
                </div>
                <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-warm-800 px-4 py-3">
                  <p className="font-body text-[12px] leading-relaxed text-white/90">Aaryan was carrying hard. Jackie was selling.</p>
                </div>
              </div>
              <div className="mt-5 flex justify-end">
                <span className="font-body text-[11px] font-medium text-warm-400">AI-powered insights</span>
              </div>
            </motion.div>
          </div>

          {/* CTA below cards */}
          <motion.div
            className="mt-12 flex flex-col items-center gap-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.1, ease: easeOut }}
          >
            <button
              onClick={handleGetStarted}
              className="flex items-center gap-2 rounded-full bg-warm-900 px-8 py-3.5 text-[14px] font-semibold text-white shadow-layered transition-all duration-300 hover:bg-warm-800 hover:scale-[1.02] active:scale-[0.97]"
            >
              {isAuthenticated ? "Go to workspace" : "Get started free"}
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={handleQuickDemo}
              disabled={isSubmitting}
              className="flex items-center gap-1 text-[13px] text-warm-400 transition-colors hover:text-warm-600 disabled:opacity-50"
            >
              Try a demo with facebook/react
              <ArrowRight className="h-3 w-3" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* ── Social Proof Strip — scrolling AI summaries ── */}
      <section className="overflow-hidden bg-[#F4F1ED] py-6">
        <div className="flex animate-scroll-left gap-6" style={{ width: "max-content" }}>
          {[
            "Aaryan added 4,000 lines of code. Jackie added a comma.",
            "Rohan wrote the entire backend. Jackie changed the README font.",
            "Aaryan was carrying hard with 172. Rohan had 118. Jackie? Selling at 34.",
            "Aaryan solo-carried the auth microservice. Score: 172/200.",
            "Rohan started strong but fell off week two. Aaryan picked up the slack.",
            "Jackie added a comma and called it a day. Aaryan rewrote the whole module.",
            "Aaryan added 4,000 lines of code. Jackie added a comma.",
            "Rohan wrote the entire backend. Jackie changed the README font.",
            "Aaryan was carrying hard with 172. Rohan had 118. Jackie? Selling at 34.",
            "Aaryan solo-carried the auth microservice. Score: 172/200.",
            "Rohan started strong but fell off week two. Aaryan picked up the slack.",
            "Jackie added a comma and called it a day. Aaryan rewrote the whole module.",
          ].map((summary, i) => (
            <div
              key={i}
              className="w-[300px] shrink-0 rounded-xl border border-warm-200/40 bg-white/70 p-5 backdrop-blur-sm"
            >
              <p className="font-body text-[13px] leading-relaxed text-warm-500">
                &ldquo;{summary}&rdquo;
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Input Section — Where users actually try it ── */}
      <section className="bg-[#F9F7F4] py-20 sm:py-28">
        <div className="mx-auto max-w-xl px-6">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: easeOut }}
          >
            <h2 className="font-myflora text-[2.5rem] leading-[1.1] tracking-tight text-warm-900 sm:text-[3rem]">
              Try it yourself
            </h2>
            <p className="mt-4 text-[15px] text-warm-500">
              Paste a GitHub repo or Google Doc link and see who actually did the work.
            </p>
          </motion.div>

          <motion.div
            className="mt-10"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <div className="rounded-[20px] border border-warm-200/50 bg-white p-7 shadow-[0_4px_32px_rgba(0,0,0,0.06)]">
              <div className="relative flex items-center gap-2 rounded-xl border border-warm-200 bg-warm-50/50 p-2 transition-all focus-within:border-warm-400 focus-within:bg-white">
                <div className="ml-2 flex shrink-0 items-center gap-1.5">
                  <Github className="h-4 w-4 text-warm-400" />
                  <span className="text-warm-300 text-[10px]">/</span>
                  <FileText className="h-4 w-4 text-warm-400" />
                </div>
                <div className="relative min-w-0 flex-1">
                  <input
                    type="text"
                    value={repoInput}
                    onChange={(e) => { setRepoInput(e.target.value); setError(null); }}
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => setInputFocused(false)}
                    onKeyDown={(e) => e.key === "Enter" && handleRepoAnalyze()}
                    className="relative z-10 w-full bg-transparent py-2 text-[14px] text-warm-800 placeholder:text-warm-400 focus:outline-none"
                  />
                  {!repoInput && !inputFocused && (
                    <div className="pointer-events-none absolute inset-0 flex items-center text-[14px]">
                      <TypewriterPlaceholder isVisible={!repoInput && !inputFocused} />
                    </div>
                  )}
                  {!repoInput && inputFocused && (
                    <div className="pointer-events-none absolute inset-0 flex items-center text-[14px] text-warm-400">
                      owner/repo or Google Doc link
                    </div>
                  )}
                </div>
                <button
                  onClick={handleRepoAnalyze}
                  disabled={isSubmitting || !repoInput.trim()}
                  className="shrink-0 rounded-lg bg-warm-900 px-4 py-2 text-[13px] font-semibold text-white transition-all duration-200 hover:bg-warm-800 disabled:opacity-30"
                >
                  {isSubmitting ? "..." : "Analyze"}
                </button>
              </div>
              {error && <p className="mt-2 text-[12px] text-red-500">{error}</p>}

              <div className="mt-3 flex items-center gap-3">
                <button
                  onClick={handleQuickDemo}
                  disabled={isSubmitting}
                  className="flex items-center gap-1 text-[13px] text-warm-400 transition-colors hover:text-warm-600 disabled:opacity-50"
                >
                  Try facebook/react
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── About + Product Preview (combined) ── */}
      <section id="about" className="relative bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-6">
          {/* Two-column: About left, Product Preview right */}
          <div className="grid items-center gap-12 lg:grid-cols-2">

            {/* Left: About — tagline + contribution graph */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: easeOut }}
            >
              <h2 className="font-myflora text-[2.25rem] leading-[1.12] tracking-tight text-warm-900 sm:text-[2.75rem]">
                Where group work is as transparent as glass.
              </h2>
              <p className="mt-4 max-w-md text-[15px] leading-[1.7] text-warm-500">
                See exactly who showed up — scores, contributions, all in one clean dashboard.
              </p>

              {/* Contribution graph */}
              <div className="mt-10 relative inline-block">
                <div className="grid grid-cols-7 gap-[5px]">
                  {Array.from({ length: 49 }, (_, i) => {
                    const intensity = [
                      0,0,1,0,0,0,0,
                      0,1,2,1,0,0,0,
                      1,2,3,2,1,0,0,
                      0,2,3,3,2,1,0,
                      0,1,2,3,2,1,0,
                      0,0,1,2,2,1,0,
                      0,0,0,1,1,0,0,
                    ][i];
                    const colors = [
                      "bg-warm-200",
                      "bg-[#D4A017]/30",
                      "bg-[#D4A017]/60",
                      "bg-[#D4A017]",
                    ];
                    return (
                      <div
                        key={i}
                        className={`h-7 w-7 rounded-[4px] ${colors[intensity]} sm:h-9 sm:w-9 transition-colors`}
                      />
                    );
                  })}
                </div>
                <div className="absolute -right-3 -top-8 z-10 rounded-lg border border-warm-200 bg-white px-3 py-1.5 shadow-sm">
                  <span className="text-[11px] font-semibold text-warm-700">172 contributions</span>
                </div>
              </div>
            </motion.div>

            {/* Right: Product Preview browser frame */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1, ease: easeOut }}
            >
              <div className="relative overflow-hidden rounded-2xl border border-warm-200 bg-white shadow-[0_12px_48px_rgba(0,0,0,0.08)]">
                <div className="flex items-center gap-2 border-b border-warm-100 bg-warm-50 px-4 py-3">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-warm-300" />
                    <div className="h-3 w-3 rounded-full bg-warm-200" />
                    <div className="h-3 w-3 rounded-full bg-warm-200" />
                  </div>
                  <div className="mx-auto flex h-6 w-48 items-center justify-center rounded-md bg-warm-100 text-[11px] text-warm-400">
                    glasswork.app
                  </div>
                </div>

                <div className="relative h-[420px] overflow-hidden bg-[#FAFAF8]">
                  <div className="flex h-full flex-col p-5">
                    <div className="mb-1 text-[11px] text-warm-400">facebook/react</div>
                    <div className="mb-5 text-[16px] font-bold text-warm-800">Analysis Results</div>
                    <div className="grid flex-1 grid-cols-3 gap-4">
                      {[
                        { name: "Aaryan Verma", score: 172, tier: "LOCKED IN", pct: "86%", hm: HEATMAP_DATA.alex, avatar: "/animepfp.jpeg", tierColor: "bg-[#D4A017] text-white" },
                        { name: "Rohan Bedi", score: 118, tier: "MID", pct: "59%", hm: HEATMAP_DATA.sarah, avatar: "/catpj.jpeg", tierColor: "bg-[#5BA8C8]/20 text-[#5BA8C8]" },
                        { name: "Jackie Lin", score: 34, tier: "SELLING", pct: "17%", hm: HEATMAP_DATA.mike, avatar: "/voidman.jpeg", tierColor: "bg-warm-200 text-warm-400" },
                      ].map((c) => (
                        <div key={c.name} className="flex flex-col rounded-2xl border border-warm-200/40 bg-white/60 p-4">
                          <Image src={c.avatar} alt={c.name} width={40} height={40} className="mb-3 h-10 w-10 rounded-full object-cover" />
                          <div className="text-[12px] font-semibold text-warm-700">{c.name}</div>
                          <div className="mt-1 text-[32px] font-bold leading-none text-warm-900">{c.score}</div>
                          <div className={`mt-2 w-fit rounded-full px-2 py-0.5 text-[8px] font-bold ${c.tierColor}`}>
                            {c.tier}
                          </div>
                          <div className="mt-3 grid grid-cols-7 gap-[2px]">
                            {c.hm.map((v, i) => (
                              <div key={i} className={`aspect-square rounded-[2px] ${v ? "bg-warm-400" : "bg-warm-100"}`} />
                            ))}
                          </div>
                          <div className="mt-3">
                            <div className="h-1.5 overflow-hidden rounded-full bg-warm-100">
                              <div className="h-full rounded-full bg-gradient-to-r from-[#5BA8C8] to-[#D4A017]" style={{ width: c.pct }} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-warm-200 bg-[#F9F7F4] px-6 py-10">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="Glasswork" className="h-5 w-5 rounded-lg object-contain opacity-50" />
            <span className="font-myflora text-[14px] text-warm-400">Glasswork</span>
          </div>
          <div className="flex items-center gap-6">
            <p className="text-[12px] text-warm-400">
              Built by a 16-year-old who was always locked in.
            </p>
            <Link href="/privacy" className="text-[12px] text-warm-400 underline underline-offset-2 transition-colors hover:text-warm-600">
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
