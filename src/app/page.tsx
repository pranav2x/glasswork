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
  const [activeScreen, setActiveScreen] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
    <div
      className="min-h-screen"
      style={{
        backgroundImage: "url('/Chaotic Gradient.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >

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
            <span onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })} className={`font-myflora text-[15px] cursor-pointer transition-colors duration-500 ${scrolled ? "text-warm-500 hover:text-warm-900" : "text-white/60 hover:text-white/90"}`}>
              About
            </span>
            <span onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })} className={`font-myflora text-[15px] cursor-pointer transition-colors duration-500 ${scrolled ? "text-warm-500 hover:text-warm-900" : "text-white/60 hover:text-white/90"}`}>
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

      {/* ── Hero — Full-bleed background image ── */}
      <section className="relative min-h-screen overflow-hidden">
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/40" />

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
            <motion.p
              className="font-myflora mt-3 text-center text-[1.1rem] tracking-wide text-white/50 sm:text-[1.35rem]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            >
              See through the work
            </motion.p>
          </div>

          {/* Bottom-left glassmorphism card with input */}
          <motion.div
            className="absolute bottom-12 left-1/2 z-20 w-full max-w-[420px] -translate-x-1/2 px-6 sm:px-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="w-full rounded-2xl border border-white/[0.12] bg-white/[0.07] p-7 backdrop-blur-2xl">
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
        </div>
      </section>

      {/* ── Editorial Vision Section ── */}
      <section id="about" className="relative bg-black/30 py-36 backdrop-blur-sm sm:py-48">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-20 lg:grid-cols-2">

            {/* Left: GitHub-style contribution graph */}
            <motion.div
              className="flex justify-center"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="relative">
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
                      "bg-[#ebedf0]",
                      "bg-[#9be9a8]",
                      "bg-[#40c463]",
                      "bg-[#30a14e]",
                    ];
                    return (
                      <div
                        key={i}
                        className={`h-9 w-9 rounded-[3px] ${colors[intensity]} sm:h-11 sm:w-11`}
                      />
                    );
                  })}
                </div>
                <div className="absolute -right-3 -top-3 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 backdrop-blur-md">
                  <span className="text-[11px] font-semibold text-white/80">172 contributions</span>
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
              <p className="text-[17px] leading-[1.7] text-white/60">
                We envision a world where every group project is fair.
                Where contributions are measured, not guessed.
              </p>
              <p className="mt-5 text-[17px] leading-[1.7] text-white/60">
                A world where someone who does all the work gets the
                credit they deserve. Every edit tracked. Every commit counted.
              </p>

              <h2 className="font-myflora mt-12 text-[2.5rem] leading-[1.12] tracking-tight text-white sm:text-[3rem]">
                Where group work is as transparent as glass.
              </h2>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Problem Statement ── */}
      <section id="how-it-works" className="relative bg-black/30 py-32 backdrop-blur-sm sm:py-44">
        <div className="mx-auto max-w-5xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2 className="font-myflora text-[2.75rem] leading-[1.12] tracking-tight text-white sm:text-[3.5rem]">
              Every group project has someone who does nothing{" "}
              <span className="text-white/40">
                and someone who does everything.
              </span>
            </h2>

            <p className="mt-8 font-myflora text-[1.75rem] text-white/90 sm:text-[2.25rem]">
              You already know who. Now prove it.
            </p>
          </motion.div>

          {/* Feature cards */}
          <div className="mt-24 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
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
                className="group rounded-2xl border border-white/[0.12] bg-white/[0.07] p-8 backdrop-blur-xl transition-all duration-300 hover:bg-white/[0.12]"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-white/70 transition-all duration-300 group-hover:bg-white/20 group-hover:text-white">
                  {feature.icon}
                </div>
                <h3 className="text-[16px] font-semibold text-white">{feature.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-white/50">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Screenshots ── */}
      <section className="bg-black/30 py-32 backdrop-blur-sm sm:py-40">
        <div className="mx-auto max-w-5xl px-6">
          <motion.div
            className="mb-16"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-myflora text-[2.5rem] tracking-tight text-white sm:text-[3rem]">
              See exactly who showed up
            </h2>
            <p className="mt-4 max-w-md text-[17px] leading-[1.7] text-white/60">
              Your group members&apos; scores, their exact contributions,
              all in one clean dashboard.
            </p>
          </motion.div>

          {/* Browser frame */}
          <motion.div
            className="relative overflow-hidden rounded-2xl border border-white/[0.12] bg-white/[0.07] shadow-[0_12px_48px_rgba(0,0,0,0.2)] backdrop-blur-xl"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.05] px-4 py-3">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-white/20" />
                <div className="h-3 w-3 rounded-full bg-white/20" />
                <div className="h-3 w-3 rounded-full bg-white/20" />
              </div>
              <div className="mx-auto flex h-6 w-48 items-center justify-center rounded-md bg-white/10 text-[11px] text-white/40">
                glasswork.app
              </div>
            </div>

            <div className="relative h-[420px] overflow-hidden bg-black/20">
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
                    <div className="flex h-full">
                      <div className="w-[180px] shrink-0 border-r border-white/10 bg-white/[0.03] p-4">
                        <div className="mb-5 flex items-center gap-2">
                          <img src="/logo.png" alt="Glasswork" className="h-5 w-5 rounded object-contain" />
                          <span className="text-[12px] font-bold text-white/80">Glasswork</span>
                        </div>
                        <div className="space-y-1">
                          {["Analyses", "Reports", "Settings"].map((item, i) => (
                            <div key={item} className={`flex items-center gap-2 rounded-lg px-2.5 py-2 ${i === 0 ? "bg-white/10" : ""}`}>
                              <div className="h-3.5 w-3.5 rounded bg-white/20" />
                              <span className={`text-[11px] font-medium ${i === 0 ? "text-white/90" : "text-white/50"}`}>{item}</span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-6">
                          <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/30">Recent</div>
                          <div className="space-y-1">
                            {["facebook/react", "vercel/next.js", "torvalds/linux"].map((repo) => (
                              <div key={repo} className="flex items-center gap-2 rounded-lg px-2.5 py-1.5">
                                <Github className="h-3 w-3 shrink-0 text-white/30" />
                                <span className="truncate text-[10px] text-white/50">{repo}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 p-5">
                        <div className="mb-4 text-[15px] font-bold text-white/90">Dashboard</div>
                        <div className="grid grid-cols-3 gap-3">
                          {[{ label: "Analyses", val: "12" }, { label: "Contributors", val: "34" }, { label: "Avg Score", val: "124" }].map((s) => (
                            <div key={s.label} className="rounded-xl border border-white/10 p-3">
                              <div className="text-[10px] text-white/40">{s.label}</div>
                              <div className="mt-1 text-[22px] font-bold text-white/90">{s.val}</div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-3">
                          <div className="rounded-xl border border-white/10 p-3">
                            <div className="mb-2 text-[11px] font-semibold text-white/70">Score Distribution</div>
                            <div className="flex items-center gap-4">
                              <svg viewBox="0 0 64 64" className="h-14 w-14 shrink-0">
                                <circle cx="32" cy="32" r="24" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                                <circle cx="32" cy="32" r="24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="8" strokeDasharray="75 75" strokeDashoffset="19" strokeLinecap="round" transform="rotate(-90 32 32)" />
                                <circle cx="32" cy="32" r="24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="8" strokeDasharray="45 105" strokeDashoffset="-56" strokeLinecap="round" transform="rotate(-90 32 32)" />
                              </svg>
                              <div className="space-y-1.5">
                                {[{ label: "Locked In", color: "bg-white/90" }, { label: "Solid", color: "bg-white/50" }, { label: "Not Locked", color: "bg-white/20" }].map((t) => (
                                  <div key={t.label} className="flex items-center gap-1.5">
                                    <div className={`h-2 w-2 rounded-full ${t.color}`} />
                                    <span className="text-[9px] text-white/50">{t.label}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="rounded-xl border border-white/10 p-3">
                            <div className="mb-2 text-[11px] font-semibold text-white/70">Top Contributors</div>
                            <div className="space-y-2">
                              {[{ name: "Alex C.", score: 172, pct: "86%" }, { name: "Sarah K.", score: 118, pct: "59%" }, { name: "Mike T.", score: 34, pct: "17%" }].map((p) => (
                                <div key={p.name} className="flex items-center gap-2">
                                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-[8px] font-bold text-white/60">{p.name[0]}</div>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex justify-between">
                                      <span className="text-[9px] text-white/60">{p.name}</span>
                                      <span className="text-[9px] font-bold text-white/90">{p.score}</span>
                                    </div>
                                    <div className="mt-0.5 h-1 overflow-hidden rounded-full bg-white/10">
                                      <div className="h-full rounded-full bg-white/70" style={{ width: p.pct }} />
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
                    <div className="flex h-full flex-col p-5">
                      <div className="mb-1 text-[11px] text-white/40">facebook/react</div>
                      <div className="mb-5 text-[16px] font-bold text-white/90">Analysis Results</div>
                      <div className="grid flex-1 grid-cols-3 gap-4">
                        {[
                          { name: "Aaryan Verma", score: 172, tier: "LOCKED IN", pct: "86%", hm: HEATMAP_DATA.alex, avatar: "/animepfp.jpeg" },
                          { name: "Rohan Bedi", score: 118, tier: "MID", pct: "59%", hm: HEATMAP_DATA.sarah, avatar: "/catpj.jpeg" },
                          { name: "Jackie Lin", score: 34, tier: "SELLING", pct: "17%", hm: HEATMAP_DATA.mike, avatar: "/voidman.jpeg" },
                        ].map((c, idx) => (
                          <div key={c.name} className="flex flex-col rounded-2xl border border-white/10 p-4">
                            <Image src={c.avatar} alt={c.name} width={40} height={40} className="mb-3 h-10 w-10 rounded-full object-cover" />
                            <div className="text-[12px] font-semibold text-white/80">{c.name}</div>
                            <div className="mt-1 text-[32px] font-bold leading-none text-white/90">{c.score}</div>
                            <div className={`mt-2 w-fit rounded-full px-2 py-0.5 text-[8px] font-bold ${idx === 0 ? "bg-white/90 text-warm-900" : idx === 1 ? "bg-white/50 text-warm-900" : "bg-white/20 text-white/60"}`}>
                              {c.tier}
                            </div>
                            <div className="mt-3 grid grid-cols-7 gap-[2px]">
                              {c.hm.map((v, i) => (
                                <div key={i} className={`aspect-square rounded-[2px] ${v ? (idx === 0 ? "bg-white/70" : idx === 1 ? "bg-white/50" : "bg-white/30") : "bg-white/10"}`} />
                              ))}
                            </div>
                            <div className="mt-3">
                              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                                <div className={`h-full rounded-full ${idx === 0 ? "bg-white/80" : idx === 1 ? "bg-white/50" : "bg-white/20"}`} style={{ width: c.pct }} />
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

          <div className="mt-5 flex items-center justify-center gap-2">
            {[0, 1].map((i) => (
              <button
                key={i}
                onClick={() => setActiveScreen(i)}
                className={`h-2 rounded-full transition-all duration-300 ${activeScreen === i ? "w-6 bg-white" : "w-2 bg-white/30"}`}
                aria-label={i === 0 ? "Dashboard view" : "Results view"}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="relative overflow-hidden bg-black/30 py-40 backdrop-blur-sm sm:py-48">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2 className="font-myflora text-[2.75rem] leading-[1.1] tracking-tight text-white sm:text-[3.5rem]">
              Your grades deserve
              <br />
              <em>transparency</em>
            </h2>
            <p className="mt-6 text-[17px] leading-[1.7] text-white/60">
              Stop guessing. Start knowing. Glasswork shows you
              exactly who did what.
            </p>

            <button
              onClick={handleGetStarted}
              className="mt-10 inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-[15px] font-semibold text-warm-900 shadow-layered transition-all duration-200 hover:scale-[1.03] hover:bg-white/90 active:scale-[0.97]"
            >
              {isAuthenticated ? "Go to workspace" : "Get started free"}
              <ArrowRight className="h-4 w-4" />
            </button>

            <p className="mt-4 text-[13px] text-white/40">
              Free to use. No credit card required.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/10 bg-black/30 px-6 py-10 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="Glasswork" className="h-5 w-5 rounded-lg object-contain opacity-40" />
            <span className="font-myflora text-[14px] text-white/40">Glasswork</span>
          </div>
          <p className="text-[12px] text-white/40">
            Built by a 16-year-old who was always locked in.
          </p>
        </div>
      </footer>
    </div>
  );
}
