"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useConvexAuth, useMutation } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../../convex/_generated/api";
import { Github, ArrowRight, FileText, Eye, Users } from "lucide-react";
import { TypewriterPlaceholder } from "@/components/TypewriterPlaceholder";

// Pre-seeded heatmap data (no Math.random — avoids hydration mismatch)
const HEATMAP_DATA = {
  alex:  [1,0,1,1,0,1,0, 1,1,0,1,1,1,0],
  sarah: [0,1,0,1,0,0,1, 1,0,1,0,1,0,1],
  mike:  [0,0,1,0,0,0,1, 0,0,0,1,0,0,0],
};

// Star positions (pre-computed to avoid hydration issues)
const STARS = [
  { left: "10%", top: "15%", size: 2, delay: 0, duration: 3 },
  { left: "25%", top: "8%", size: 1.5, delay: 0.5, duration: 4 },
  { left: "40%", top: "22%", size: 1, delay: 1, duration: 3.5 },
  { left: "55%", top: "12%", size: 2.5, delay: 1.5, duration: 3 },
  { left: "70%", top: "18%", size: 1.5, delay: 0.3, duration: 4.5 },
  { left: "85%", top: "10%", size: 2, delay: 0.8, duration: 3.2 },
  { left: "15%", top: "35%", size: 1, delay: 2, duration: 4 },
  { left: "50%", top: "5%", size: 1.5, delay: 1.2, duration: 3.8 },
  { left: "90%", top: "28%", size: 2, delay: 0.6, duration: 3 },
  { left: "5%", top: "25%", size: 1.5, delay: 1.8, duration: 4.2 },
  { left: "35%", top: "30%", size: 1, delay: 0.4, duration: 3.6 },
  { left: "65%", top: "25%", size: 2, delay: 1.1, duration: 3.4 },
  { left: "78%", top: "8%", size: 1, delay: 2.2, duration: 4 },
  { left: "20%", top: "42%", size: 1.5, delay: 0.7, duration: 3.3 },
  { left: "48%", top: "38%", size: 2, delay: 1.6, duration: 3.7 },
];

// Sparkle cross positions (the large twinkling stars from the reference)
const SPARKLES = [
  { left: "30%", top: "15%", size: 20, delay: 0, duration: 4 },
  { left: "72%", top: "22%", size: 16, delay: 1.5, duration: 5 },
  { left: "88%", top: "12%", size: 12, delay: 3, duration: 4.5 },
  { left: "15%", top: "30%", size: 14, delay: 2, duration: 5.5 },
];

// Snowflake positions (pre-computed)
const SNOWFLAKES = Array.from({ length: 40 }, (_, i) => ({
  left: `${(i * 2.5) % 100}%`,
  size: 1 + (i % 3),
  delay: (i * 0.3) % 8,
  duration: 6 + (i % 5),
  drift: (i % 2 === 0 ? 1 : -1) * (10 + (i % 20)),
}));

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
  const [scrolled, setScrolled] = useState(false);

  // Track scroll for navbar transition
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  const handleQuickDemo = useCallback(async () => {
    setRepoInput("facebook/react");
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
        sourceId: "facebook/react",
        title: "facebook/react",
      });
      router.push(`/results/${analysisId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create analysis");
    } finally {
      setIsSubmitting(false);
    }
  }, [isAuthenticated, signIn, createAnalysis, router]);

  return (
    <div className="min-h-screen bg-white">
      {/* ── Floating Navigation ── */}
      <nav className="fixed left-0 right-0 top-0 z-50 transition-all duration-500">
        <div className={`mx-auto mt-4 flex max-w-3xl items-center justify-between rounded-full px-6 py-3 backdrop-blur-xl transition-all duration-500 ${
          scrolled
            ? "border border-warm-200/60 bg-white/90 shadow-layered"
            : "border border-white/10 bg-white/5"
        }`}>
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/logo.png" alt="Glasswork" className="h-6 w-6 rounded-lg object-contain" />
            <span className={`font-myflora text-[15px] font-medium transition-colors duration-500 ${scrolled ? "text-warm-900" : "text-white/90"}`}>
              Glasswork
            </span>
          </Link>

          <div className="hidden items-center gap-8 sm:flex">
            <span className={`text-[13px] cursor-pointer transition-colors duration-500 ${scrolled ? "text-warm-500 hover:text-warm-900" : "text-white/60 hover:text-white/90"}`}>
              About
            </span>
            <span className={`text-[13px] cursor-pointer transition-colors duration-500 ${scrolled ? "text-warm-500 hover:text-warm-900" : "text-white/60 hover:text-white/90"}`}>
              How it works
            </span>
          </div>

          <button
            onClick={handleGetStarted}
            className={`flex items-center gap-1.5 rounded-full px-5 py-2 text-[13px] font-semibold transition-all duration-500 active:scale-[0.97] ${
              scrolled
                ? "bg-warm-900 text-white hover:bg-warm-800"
                : "bg-white text-warm-900 hover:bg-white/90"
            }`}
          >
            {isAuthenticated ? "Dashboard" : "Get Started"}
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </nav>

      {/* ── Hero Section — Atmospheric Dark ── */}
      <section className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#0c0c20] via-[#141438] to-[#1c1c44]">
        {/* Radial glow behind title */}
        <div className="absolute left-1/2 top-[35%] h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#2a2a5a]/30 blur-[120px]" />

        {/* Star field */}
        <div className="absolute inset-0">
          {STARS.map((star, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white star-twinkle"
              style={{
                left: star.left,
                top: star.top,
                width: star.size,
                height: star.size,
                animationDelay: `${star.delay}s`,
                animationDuration: `${star.duration}s`,
              }}
            />
          ))}
        </div>

        {/* Cross-shaped sparkles (like the reference) */}
        <div className="absolute inset-0 pointer-events-none">
          {SPARKLES.map((sparkle, i) => (
            <svg
              key={`sparkle-${i}`}
              className="absolute sparkle-cross"
              style={{
                left: sparkle.left,
                top: sparkle.top,
                width: sparkle.size,
                height: sparkle.size,
                animationDelay: `${sparkle.delay}s`,
                animationDuration: `${sparkle.duration}s`,
              }}
              viewBox="0 0 24 24"
              fill="white"
            >
              <path d="M12 0C12 0 12.5 9 12 12C11.5 9 12 0 12 0Z" />
              <path d="M0 12C0 12 9 11.5 12 12C9 12.5 0 12 0 12Z" />
              <path d="M24 12C24 12 15 12.5 12 12C15 11.5 24 12 24 12Z" />
              <path d="M12 24C12 24 11.5 15 12 12C12.5 15 12 24 12 24Z" />
            </svg>
          ))}
        </div>

        {/* Snowfall */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {SNOWFLAKES.map((flake, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white/60 snowflake"
              style={{
                left: flake.left,
                width: flake.size,
                height: flake.size,
                animationDelay: `${flake.delay}s`,
                animationDuration: `${flake.duration}s`,
                "--drift": `${flake.drift}px`,
              } as React.CSSProperties}
            />
          ))}
        </div>

        {/* Atmospheric gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c20]/90 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-[50%] bg-gradient-to-t from-[#0c0c20] to-transparent" />

        {/* City skyline silhouette */}
        <div className="absolute bottom-0 left-0 right-0">
          {/* Building windows (warm glowing dots) */}
          <div className="absolute bottom-[80px] left-0 right-0 h-[120px] pointer-events-none">
            {[
              { l: "8%", b: "20px", w: 2, h: 2 }, { l: "9%", b: "35px", w: 2, h: 2 },
              { l: "10%", b: "50px", w: 2, h: 2 }, { l: "11%", b: "30px", w: 2, h: 2 },
              { l: "25%", b: "40px", w: 2, h: 3 }, { l: "26%", b: "60px", w: 2, h: 2 },
              { l: "27%", b: "25px", w: 2, h: 2 }, { l: "28%", b: "75px", w: 2, h: 2 },
              { l: "45%", b: "30px", w: 2, h: 2 }, { l: "46%", b: "55px", w: 2, h: 3 },
              { l: "47%", b: "70px", w: 2, h: 2 }, { l: "48%", b: "85px", w: 2, h: 2 },
              { l: "65%", b: "25px", w: 2, h: 2 }, { l: "66%", b: "45px", w: 2, h: 2 },
              { l: "67%", b: "60px", w: 2, h: 3 }, { l: "68%", b: "35px", w: 2, h: 2 },
              { l: "82%", b: "30px", w: 2, h: 2 }, { l: "83%", b: "50px", w: 2, h: 2 },
              { l: "84%", b: "70px", w: 2, h: 2 }, { l: "85%", b: "40px", w: 2, h: 3 },
            ].map((win, i) => (
              <div
                key={`win-${i}`}
                className="absolute rounded-[1px] bg-amber-300/40"
                style={{ left: win.l, bottom: win.b, width: win.w, height: win.h }}
              />
            ))}
          </div>
          <svg viewBox="0 0 1440 220" fill="none" className="w-full" preserveAspectRatio="none" style={{ height: 180 }}>
            <path
              d="M0 220V160h30v-15h15v-35h10v-20h8v20h10v35h15v-25h12v-40h8v-15h6v15h8v40h12v25h20v-50h10v-25h8v25h10v50h25v-30h15v-20h10v-60h8v-10h6v10h8v60h10v20h15v30h30v-45h12v-30h10v30h12v45h20v-20h15v-55h10v-35h8v35h10v55h15v20h25v-65h10v-15h6v15h10v65h20v-25h12v-40h10v40h12v25h30v-70h10v-25h8v25h10v70h20v-15h15v-45h10v-30h8v30h10v45h15v15h25v-80h10v-20h6v20h10v80h20v-35h12v-25h10v25h12v35h30v-55h10v-40h8v40h10v55h25v-20h15v-30h10v30h15v20h25v-45h10v-15h8v15h10v45h20v-60h10v-35h8v35h10v60h20v-25h12v-15h10v15h12v25h40V220z"
              fill="rgba(255,255,255,0.08)"
            />
            <path
              d="M0 220V175h45v-20h20v-30h10v-25h8v25h10v30h20v-15h15v-35h10v-20h8v20h10v35h15v15h30v-40h12v-20h10v20h12v40h25v-55h10v-30h8v30h10v55h20v-20h15v-45h10v-25h8v25h10v45h15v20h35v-35h10v-20h8v20h10v35h25v-50h12v-30h10v30h12v50h20v-15h15v-40h10v40h15v15h30v-60h10v-20h8v20h10v60h25v-25h12v-30h10v30h12v25h30v-45h10v-15h8v15h10v45h25v-35h15v-20h10v20h15v35h20v-50h10v-20h6v20h10v50h35v-30h10v-15h8v15h10v30h30v-40h12v-25h10v25h12v40h40V220z"
              fill="rgba(255,255,255,0.05)"
            />
          </svg>
        </div>

        {/* Hero content */}
        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 pt-24 pb-32">
          {/* Large serif title */}
          <motion.h1
            className="font-myflora text-center text-[3.5rem] leading-[1.05] tracking-tight text-white sm:text-[5rem] md:text-[6rem]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            Glasswork
          </motion.h1>

          <motion.p
            className="font-myflora mt-2 text-center text-[1.25rem] text-white/40 sm:text-[1.5rem]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            See through the work
          </motion.p>

          {/* Glassmorphism input card */}
          <motion.div
            className="mt-16 w-full max-w-xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-6 backdrop-blur-2xl">
              <p className="mb-1 text-[15px] font-medium text-white/90">
                Who <em className="font-myflora not-italic text-white">actually</em> did the work?
              </p>
              <p className="mb-5 text-[13px] text-white/40">
                Analyze GitHub repos and Google Docs to see if your group mates are locked in or just straight up selling.
              </p>

              {/* Input field */}
              <div className="relative flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] p-2 transition-all focus-within:border-white/20 focus-within:bg-white/[0.08]">
                <div className="ml-3 flex shrink-0 items-center gap-1.5">
                  <Github className="h-4 w-4 text-white/30" />
                  <span className="text-white/20 text-[10px]">/</span>
                  <FileText className="h-4 w-4 text-white/30" />
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
                    className="relative z-10 w-full bg-transparent py-2.5 text-[14px] text-white placeholder:text-white/30 focus:outline-none"
                  />
                  {!repoInput && !inputFocused && (
                    <div className="pointer-events-none absolute inset-0 flex items-center text-[14px]">
                      <TypewriterPlaceholder isVisible={!repoInput && !inputFocused} />
                    </div>
                  )}
                  {!repoInput && inputFocused && (
                    <div className="pointer-events-none absolute inset-0 flex items-center text-[14px] text-white/30">
                      owner/repo or paste a Google Doc link
                    </div>
                  )}
                </div>
                <button
                  onClick={handleRepoAnalyze}
                  disabled={isSubmitting || !repoInput.trim()}
                  className="shrink-0 rounded-lg bg-white px-5 py-2.5 text-[13px] font-semibold text-warm-900 transition-all duration-200 hover:bg-white/90 disabled:opacity-30"
                >
                  {isSubmitting ? "..." : "Analyze"}
                </button>
              </div>
              {error && (
                <p className="mt-2 text-[12px] text-red-400">{error}</p>
              )}

              <div className="mt-3 flex items-center gap-3">
                <p className="text-[11px] text-white/30">
                  GitHub repos &amp; Google Docs supported
                </p>
                <button
                  onClick={handleQuickDemo}
                  disabled={isSubmitting}
                  className="text-[11px] text-white/50 underline decoration-white/20 underline-offset-2 transition-colors hover:text-white/80 disabled:opacity-50"
                >
                  Try facebook/react
                </button>
              </div>
            </div>
          </motion.div>

          {/* Bottom-left glassmorphism info card (like reference) */}
          <motion.div
            className="absolute bottom-24 left-8 z-20 hidden lg:block"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="w-[320px] rounded-2xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur-2xl">
              <h3 className="font-myflora text-[1.5rem] leading-tight text-white/90">
                See through the work
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed text-white/40">
                Glasswork analyzes GitHub repos and Google Docs to score every contributor fairly. No more guessing.
              </p>
              <button
                onClick={handleGetStarted}
                className="mt-4 flex items-center gap-1.5 text-[13px] text-white/60 transition-colors hover:text-white"
              >
                Get to know us
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.6 }}
          >
            <div className="flex flex-col items-center gap-2">
              <span className="text-[12px] text-white/30">Scroll to explore</span>
              <div className="h-8 w-[1px] bg-gradient-to-b from-white/30 to-transparent scroll-indicator" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Dark-to-white transition ── */}
      <div className="h-32 bg-gradient-to-b from-[#0c0c20] to-white" />

      {/* ── Editorial Vision Section ── */}
      <section className="relative bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            {/* Left: Visual element */}
            <motion.div
              className="flex justify-center"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Abstract visualization - contribution graph */}
              <div className="relative">
                <div className="grid grid-cols-7 gap-[6px]">
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
                      "bg-warm-100",
                      "bg-warm-200",
                      "bg-warm-400",
                      "bg-warm-800",
                    ];
                    return (
                      <div
                        key={i}
                        className={`h-8 w-8 rounded-md ${colors[intensity]} sm:h-10 sm:w-10 transition-colors duration-700`}
                      />
                    );
                  })}
                </div>
                {/* Floating label */}
                <div className="absolute -right-4 -top-4 rounded-lg border border-warm-200 bg-white px-3 py-1.5 shadow-layered">
                  <span className="text-[11px] font-semibold text-warm-700">172 contributions</span>
                </div>
              </div>
            </motion.div>

            {/* Right: Editorial text */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="text-[16px] leading-relaxed text-warm-500">
                We envision a world where every group project is fair.
                Where contributions are measured, not guessed.
              </p>
              <p className="mt-4 text-[16px] leading-relaxed text-warm-500">
                A world where someone who does all the work gets the
                credit they deserve. Every edit tracked. Every commit counted.
              </p>

              <h2 className="font-myflora mt-10 text-[2.25rem] leading-[1.15] tracking-tight text-warm-900 sm:text-[2.75rem]">
                Where group work is as
                transparent as glass.
              </h2>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Problem Statement Section ── */}
      <section className="relative border-t border-warm-100 bg-white py-32 sm:py-40">
        <div className="mx-auto max-w-5xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2 className="font-myflora text-[2.5rem] leading-[1.15] tracking-tight text-warm-800 sm:text-[3.25rem]">
              Every group project has someone
              who does nothing{" "}
              <span className="text-warm-300">and someone
              who does everything.</span>
            </h2>

            <p className="mt-6 font-myflora text-[1.75rem] text-warm-900 sm:text-[2rem]">
              You already know who. Now prove it.
            </p>
          </motion.div>

          {/* Feature cards */}
          <div className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: <Eye className="h-5 w-5" />,
                title: "See through repos",
                desc: "Every commit, every line change, every contributor scored fairly.",
              },
              {
                icon: <FileText className="h-5 w-5" />,
                title: "See through docs",
                desc: "Google Docs revision history analyzed to see who actually wrote what.",
              },
              {
                icon: <Users className="h-5 w-5" />,
                title: "Fair share scores",
                desc: "Each contributor gets a score. No hiding behind others' work.",
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                className="group rounded-2xl border border-warm-100 bg-white p-6 transition-all duration-300 hover:border-warm-200 hover:shadow-layered"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-warm-50 text-warm-600 transition-colors group-hover:bg-warm-900 group-hover:text-white">
                  {feature.icon}
                </div>
                <h3 className="text-[15px] font-semibold text-warm-900">{feature.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-warm-500">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Auto-switching Screenshots ── */}
      <section className="border-t border-warm-100 bg-warm-50/50 py-32">
        <div className="mx-auto max-w-5xl px-6">
          <motion.div
            className="mb-16"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-myflora text-[2.25rem] tracking-tight text-warm-900 sm:text-[2.75rem]">
              See exactly who showed up
            </h2>
            <p className="mt-4 max-w-md text-[16px] text-warm-500">
              Your group members&apos; scores, their exact contributions,
              all in one clean dashboard.
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
                          <img src="/logo.png" alt="Glasswork" className="h-5 w-5 rounded object-contain" />
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
                          { name: "Aaryan Verma", score: 172, tier: "LOCKED IN", pct: "86%", hm: HEATMAP_DATA.alex, avatar: "/animepfp.jpeg" },
                          { name: "Rohan Bedi", score: 118, tier: "MID", pct: "59%", hm: HEATMAP_DATA.sarah, avatar: "/catpj.jpeg" },
                          { name: "Jackie Lin", score: 34, tier: "SELLING", pct: "17%", hm: HEATMAP_DATA.mike, avatar: "/voidman.jpeg" },
                        ].map((c, idx) => (
                          <div key={c.name} className="flex flex-col rounded-2xl border border-warm-200 p-4">
                            <Image src={c.avatar} alt={c.name} width={40} height={40} className="mb-3 h-10 w-10 rounded-full object-cover" />
                            <div className="text-[12px] font-semibold text-warm-800">{c.name}</div>
                            <div className="mt-1 text-[32px] font-bold leading-none text-warm-900">{c.score}</div>
                            <div className={`mt-2 w-fit rounded-full px-2 py-0.5 text-[8px] font-bold ${idx === 0 ? "bg-warm-900 text-white" : idx === 1 ? "bg-warm-600 text-white" : "bg-warm-200 text-warm-600"}`}>
                              {c.tier}
                            </div>
                            <div className="mt-3 grid grid-cols-7 gap-[2px]">
                              {c.hm.map((v, i) => (
                                <div
                                  key={i}
                                  className={`aspect-square rounded-[2px] ${v ? (idx === 0 ? "bg-warm-800" : idx === 1 ? "bg-warm-500" : "bg-warm-400") : "bg-warm-100"}`}
                                />
                              ))}
                            </div>
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
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="relative overflow-hidden bg-white py-32">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2 className="font-myflora text-[2.5rem] leading-[1.1] tracking-tight text-warm-900 sm:text-[3.25rem]">
              Your grades deserve
              <br />
              <em>transparency</em>
            </h2>
            <p className="mt-6 text-[16px] text-warm-500">
              Stop guessing. Start knowing. Glasswork shows you
              exactly who did what.
            </p>

            <button
              onClick={handleGetStarted}
              className="mt-10 inline-flex items-center gap-2 rounded-full bg-warm-900 px-8 py-4 text-[15px] font-semibold text-white shadow-layered transition-all duration-200 hover:scale-[1.03] hover:bg-warm-800 active:scale-[0.97]"
            >
              {isAuthenticated ? "Go to workspace" : "Get started free"}
              <ArrowRight className="h-4 w-4" />
            </button>

            <p className="mt-4 text-[12px] text-warm-400">
              Free to use. No credit card required.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-warm-100 bg-white px-6 py-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="Glasswork" className="h-5 w-5 rounded-lg object-contain opacity-50" />
            <span className="font-myflora text-[14px] text-warm-400">Glasswork</span>
          </div>
          <p className="text-[12px] text-warm-400">
            Built by a 16-year-old who was always locked in.
          </p>
        </div>
      </footer>
    </div>
  );
}
