"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useConvexAuth, useMutation } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { motion } from "framer-motion";
import { api } from "../../convex/_generated/api";
import { Github, ArrowRight, FileText } from "lucide-react";
import { TypewriterPlaceholder } from "@/components/TypewriterPlaceholder";

// Subtle floating particles (reduced, larger, slower than before)
const PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  left: `${(i * 8.3) % 100}%`,
  size: 2 + (i % 3),
  delay: (i * 0.7) % 6,
  duration: 10 + (i % 6),
  drift: (i % 2 === 0 ? 1 : -1) * (15 + (i % 15)),
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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100);
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
    <div className="min-h-screen bg-white">

      {/* ── Floating Navbar ── */}
      <nav className="fixed left-0 right-0 top-0 z-50 transition-all duration-500">
        <div className={`mx-auto mt-4 flex max-w-3xl items-center justify-between rounded-full px-7 py-3.5 backdrop-blur-xl transition-all duration-500 ${
          scrolled
            ? "border border-warm-200/60 bg-white/90 shadow-layered"
            : "border border-white/[0.12] bg-white/[0.06]"
        }`}>
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/logo.png" alt="Glasswork" className="h-6 w-6 rounded-lg object-contain" />
            <span className={`font-myflora text-[15px] font-medium transition-colors duration-500 ${scrolled ? "text-warm-900" : "text-white/90"}`}>
              Glasswork
            </span>
          </Link>

          <div className="hidden items-center gap-8 sm:flex">
            <span className={`text-[14px] font-medium cursor-pointer transition-colors duration-500 ${scrolled ? "text-warm-500 hover:text-warm-900" : "text-white/60 hover:text-white/90"}`}>
              About
            </span>
            <span className={`text-[14px] font-medium cursor-pointer transition-colors duration-500 ${scrolled ? "text-warm-500 hover:text-warm-900" : "text-white/60 hover:text-white/90"}`}>
              How it works
            </span>
          </div>

          <button
            onClick={handleGetStarted}
            className="flex items-center gap-1.5 rounded-full bg-warm-900 px-5 py-2 text-[13px] font-semibold text-white transition-all duration-500 hover:bg-warm-800 active:scale-[0.97]"
          >
            {isAuthenticated ? "Dashboard" : "Get Started"}
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </nav>

      {/* ── Hero — Full-bleed background image ── */}
      <section
        className="relative min-h-[200vh] overflow-hidden"
        style={{
          backgroundImage: "url('/Chaotic Gradient.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/40" />
        {/* Bottom fade to black for seamless transition */}
        <div className="absolute bottom-0 left-0 right-0 h-[60%] bg-gradient-to-t from-black via-black/60 to-transparent" />

        {/* Subtle floating particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {PARTICLES.map((p, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white/30 snowflake"
              style={{
                left: p.left,
                width: p.size,
                height: p.size,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`,
                "--drift": `${p.drift}px`,
              } as React.CSSProperties}
            />
          ))}
        </div>

        {/* Hero content */}
        <div className="relative z-10 flex min-h-screen flex-col px-6 pt-32">

          {/* Centered title in upper portion */}
          <div className="flex flex-1 flex-col items-center justify-center pb-48">
            <motion.h1
              className="font-myflora text-center text-[4.5rem] leading-[1] tracking-tight text-white sm:text-[6rem] md:text-[7.5rem]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            >
              Glasswork
            </motion.h1>
          </div>

          {/* Bottom-left glassmorphism card with input */}
          <motion.div
            className="absolute bottom-12 left-6 right-6 z-20 sm:left-8 sm:right-auto lg:left-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="w-full rounded-2xl border border-white/[0.12] bg-white/[0.07] p-7 backdrop-blur-2xl sm:w-[420px]">
              <h3 className="font-myflora text-[1.5rem] leading-tight text-white/90">
                Who <em className="not-italic">actually</em> did the work?
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed text-white/40">
                Analyze GitHub repos and Google Docs to see who&apos;s locked in and who&apos;s selling.
              </p>

              {/* Input */}
              <div className="relative mt-5 flex items-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.05] p-2 transition-all focus-within:border-white/20 focus-within:bg-white/[0.08]">
                <div className="ml-2 flex shrink-0 items-center gap-1.5">
                  <Github className="h-4 w-4 text-white/30" />
                  <span className="text-white/20 text-[10px]">/</span>
                  <FileText className="h-4 w-4 text-white/30" />
                </div>
                <div className="relative min-w-0 flex-1">
                  <input
                    type="text"
                    value={repoInput}
                    onChange={(e) => { setRepoInput(e.target.value); setError(null); }}
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => setInputFocused(false)}
                    onKeyDown={(e) => e.key === "Enter" && handleRepoAnalyze()}
                    className="relative z-10 w-full bg-transparent py-2 text-[14px] text-white placeholder:text-white/30 focus:outline-none"
                  />
                  {!repoInput && !inputFocused && (
                    <div className="pointer-events-none absolute inset-0 flex items-center text-[14px]">
                      <TypewriterPlaceholder isVisible={!repoInput && !inputFocused} />
                    </div>
                  )}
                  {!repoInput && inputFocused && (
                    <div className="pointer-events-none absolute inset-0 flex items-center text-[14px] text-white/30">
                      owner/repo or Google Doc link
                    </div>
                  )}
                </div>
                <button
                  onClick={handleRepoAnalyze}
                  disabled={isSubmitting || !repoInput.trim()}
                  className="shrink-0 rounded-lg bg-white px-4 py-2 text-[13px] font-semibold text-warm-900 transition-all duration-200 hover:bg-white/90 disabled:opacity-30"
                >
                  {isSubmitting ? "..." : "Analyze"}
                </button>
              </div>
              {error && <p className="mt-2 text-[12px] text-red-400">{error}</p>}

              <div className="mt-3 flex items-center gap-3">
                <button
                  onClick={handleQuickDemo}
                  disabled={isSubmitting}
                  className="flex items-center gap-1 text-[13px] text-white/50 transition-colors hover:text-white/80 disabled:opacity-50"
                >
                  Try facebook/react
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Bottom-right tagline */}
          <motion.div
            className="absolute bottom-12 right-6 z-20 hidden items-center gap-3 sm:flex lg:right-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.8 }}
          >
            <img src="/logo.png" alt="" className="h-5 w-5 rounded-lg object-contain opacity-60" />
            <p className="max-w-[240px] text-[13px] leading-snug text-white/40">
              See who actually did the work in every group project.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Editorial Vision Section ── */}
      <section className="relative bg-white py-40 sm:py-56">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-start gap-24 lg:grid-cols-[1fr_1.2fr]">

            {/* Left: Decorative contribution grid */}
            <motion.div
              className="flex justify-center lg:sticky lg:top-32"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
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
                      "bg-[#ebedf0]",
                      "bg-[#9be9a8]",
                      "bg-[#40c463]",
                      "bg-[#30a14e]",
                    ];
                    return (
                      <div
                        key={i}
                        className={`h-10 w-10 rounded-[4px] ${colors[intensity]} sm:h-12 sm:w-12`}
                      />
                    );
                  })}
                </div>
                <div className="absolute -right-3 -top-3 rounded-lg border border-warm-200 bg-white px-3 py-1.5 shadow-layered">
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
              <p className="text-[20px] leading-[1.8] text-warm-400">
                We envision a world where every group project is fair.
                Where contributions are measured, not guessed.
              </p>
              <p className="mt-8 text-[20px] leading-[1.8] text-warm-400">
                A world where someone who does all the work gets the
                credit they deserve. Every edit tracked. Every commit counted.
              </p>

              <h2 className="font-myflora mt-16 text-[2.75rem] leading-[1.1] tracking-tight text-warm-900 sm:text-[3.5rem]">
                Where group work is as transparent as glass.
              </h2>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Problem Statement + Device Mockup ── */}
      <section className="relative bg-white py-32 sm:py-44">
        <div className="mx-auto max-w-5xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2 className="font-myflora text-[2.75rem] leading-[1.12] tracking-tight text-warm-800 sm:text-[3.5rem]">
              Every group project has someone who does nothing{" "}
              <span className="text-warm-300">
                and someone who does everything.
              </span>
            </h2>

            <p className="mt-8 font-myflora text-[1.75rem] text-warm-900 sm:text-[2.25rem]">
              They need a way to prove it.
            </p>
          </motion.div>

          {/* Text + Device Mockup */}
          <motion.div
            className="mt-24 grid gap-16 lg:grid-cols-[1fr_1.5fr] lg:items-start"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            {/* Left: description */}
            <div>
              <h3 className="font-myflora text-[1.5rem] text-warm-900">
                Scattered contributions
              </h3>
              <p className="mt-4 text-[16px] leading-[1.7] text-warm-400">
                GitHub commits and Google Doc edits are scattered across
                platforms. Manual checking is tedious and unreliable.
                You need a unified view of who did what.
              </p>
            </div>

            {/* Right: Static browser mockup */}
            <div className="overflow-hidden rounded-2xl border border-warm-200 bg-white shadow-[0_12px_48px_rgba(0,0,0,0.08)]">
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

              {/* Static dashboard content */}
              <div className="h-[400px] overflow-hidden bg-white">
                <div className="flex h-full">
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
                      <div className="rounded-xl border border-warm-100 p-3">
                        <div className="mb-2 text-[11px] font-semibold text-warm-700">Score Distribution</div>
                        <div className="flex items-center gap-4">
                          <svg viewBox="0 0 64 64" className="h-14 w-14 shrink-0">
                            <circle cx="32" cy="32" r="24" fill="none" stroke="#E5E5E5" strokeWidth="8" />
                            <circle cx="32" cy="32" r="24" fill="none" stroke="#111" strokeWidth="8" strokeDasharray="75 75" strokeDashoffset="19" strokeLinecap="round" transform="rotate(-90 32 32)" />
                            <circle cx="32" cy="32" r="24" fill="none" stroke="#737373" strokeWidth="8" strokeDasharray="45 105" strokeDashoffset="-56" strokeLinecap="round" transform="rotate(-90 32 32)" />
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
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Product Section — Dark with gradient bg ── */}
      <section className="relative overflow-hidden py-32 sm:py-44">
        {/* Background: Chaotic Gradient at low opacity */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: "url('/Chaotic Gradient.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-warm-900/80" />

        <div className="relative z-10 mx-auto max-w-5xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2 className="font-myflora text-[2.75rem] leading-[1.1] tracking-tight text-white sm:text-[3.5rem]">
              Glasswork lets you analyze contributions with a single link
            </h2>
            <p className="mt-8 max-w-2xl text-[18px] leading-[1.7] text-white/60">
              Paste a GitHub repo or Google Doc link and get instant breakdowns
              of who did what. Fair scores, contribution heatmaps, and
              detailed timelines for every team member.
            </p>

            <button
              onClick={handleGetStarted}
              className="mt-10 inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-[15px] font-semibold text-warm-900 transition-all duration-200 hover:scale-[1.03] hover:bg-white/90 active:scale-[0.97]"
            >
              {isAuthenticated ? "Go to workspace" : "Get Started"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </motion.div>

          {/* Bottom tagline */}
          <div className="mt-32 flex items-center gap-3">
            <img src="/logo.png" alt="" className="h-5 w-5 rounded-lg object-contain opacity-60" />
            <p className="text-[13px] text-white/40">
              Your grades deserve transparency.
            </p>
          </div>
        </div>

        {/* Floating preview card */}
        <div className="absolute right-8 top-8 hidden xl:block">
          <motion.div
            className="w-[280px] rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-xl"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <div className="text-[11px] text-white/40">Analysis complete</div>
            <div className="mt-1 text-[14px] font-semibold text-white">facebook/react</div>
            <div className="mt-2 text-[12px] text-white/60">3 contributors scored</div>
          </motion.div>
        </div>
      </section>

      {/* ── Use Cases Grid ── */}
      <section className="bg-white py-32 sm:py-44">
        <div className="mx-auto max-w-6xl px-6">
          {/* Header row */}
          <div className="flex items-end justify-between">
            <h2 className="font-myflora text-[2.5rem] leading-[1.1] tracking-tight text-warm-900 sm:text-[3rem]">
              Built for teams who care about fairness
            </h2>
            <button
              onClick={handleGetStarted}
              className="hidden items-center gap-1.5 text-[14px] font-medium text-warm-500 transition-colors hover:text-warm-900 sm:flex"
            >
              See all use cases
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* 3-card grid */}
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Computer Science Group Projects",
                desc: "Track GitHub commits across team repos",
                gradient: "from-purple-900/80 to-purple-600/80",
                pos: "25% center",
              },
              {
                title: "Research Paper Collaborations",
                desc: "See who wrote what in shared Google Docs",
                gradient: "from-warm-900/80 to-warm-700/80",
                pos: "50% center",
              },
              {
                title: "Hackathon Teams",
                desc: "Fair judging with contribution breakdowns",
                gradient: "from-blue-900/80 to-blue-600/80",
                pos: "75% center",
              },
            ].map((card, i) => (
              <motion.div
                key={card.title}
                className="group relative h-[320px] overflow-hidden rounded-2xl"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
              >
                {/* Background: Chaotic Gradient with gradient overlay */}
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: "url('/Chaotic Gradient.jpg')",
                    backgroundSize: "cover",
                    backgroundPosition: card.pos,
                  }}
                />
                <div className={`absolute inset-0 bg-gradient-to-b ${card.gradient}`} />

                {/* Text overlay at bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="font-myflora text-[1.35rem] leading-tight text-white">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-[13px] text-white/60">
                    {card.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-white">
        {/* Top CTA area */}
        <div className="mx-auto max-w-5xl px-6 py-32 sm:py-40">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2 className="font-myflora text-[2.75rem] leading-[1.1] tracking-tight text-warm-900 sm:text-[3.5rem]">
              We&apos;re building tools that make group work fair
            </h2>
            <p className="mt-6 text-[17px] text-warm-500">
              If that sounds useful,{" "}
              <button
                onClick={handleGetStarted}
                className="inline-flex items-center gap-1 font-medium text-warm-900 underline decoration-warm-300 underline-offset-4 transition-colors hover:decoration-warm-900"
              >
                try Glasswork today
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </p>
          </motion.div>
        </div>

        {/* Separator */}
        <div className="mx-auto max-w-5xl px-6">
          <div className="h-px bg-warm-200" />
        </div>

        {/* Footer links row */}
        <div className="mx-auto max-w-5xl px-6 py-8">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            {/* Left: nav links */}
            <div className="flex items-center gap-6">
              <Link href="/" className="text-[13px] text-warm-500 transition-colors hover:text-warm-900">Home</Link>
              <span className="cursor-pointer text-[13px] text-warm-500 transition-colors hover:text-warm-900">About</span>
              <span className="cursor-pointer text-[13px] text-warm-500 transition-colors hover:text-warm-900">How it works</span>
              <span className="cursor-pointer text-[13px] text-warm-500 transition-colors hover:text-warm-900">Privacy</span>
            </div>
            {/* Right: branding */}
            <div className="flex items-center gap-2.5">
              <img src="/logo.png" alt="Glasswork" className="h-5 w-5 rounded-lg object-contain opacity-40" />
              <span className="font-myflora text-[14px] text-warm-400">Glasswork</span>
            </div>
          </div>
        </div>

        {/* Bottom gradient strip */}
        <div
          className="relative h-[200px] overflow-hidden"
          style={{
            backgroundImage: "url('/Chaotic Gradient.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center bottom",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white via-white/60 to-transparent" />
          <div className="absolute bottom-4 left-0 right-0 text-center">
            <p className="text-[12px] text-white/60">
              &copy; Glasswork 2026
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
