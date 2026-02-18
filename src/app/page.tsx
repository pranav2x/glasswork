"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useConvexAuth, useMutation } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { motion } from "framer-motion";
import { api } from "../../convex/_generated/api";
import { FileText, Github, BookOpen, BarChart3, GitCompare, Activity } from "lucide-react";

const integrations = [
  { name: "Google Docs", icon: FileText },
  { name: "GitHub", icon: Github },
  { name: "Google Drive", icon: BookOpen },
  { name: "Google Docs", icon: FileText },
  { name: "GitHub", icon: Github },
  { name: "Google Drive", icon: BookOpen },
];

const features = [
  {
    icon: BarChart3,
    title: "Fair Share Scores",
    description:
      "Normalized 0-200 scores that show exactly who carried, who contributed, and who ghosted.",
  },
  {
    icon: Activity,
    title: "Contribution Heatmap",
    description:
      "Color-coded activity timeline — cyan for code, magenta for docs. Days with both glow purple.",
  },
  {
    icon: GitCompare,
    title: "Revision Forensics",
    description:
      "Character-level diffing on Google Docs. We count the words, not just the edits.",
  },
  {
    icon: Github,
    title: "GitHub Deep Dive",
    description:
      "Commits, additions, deletions, and co-authored-by credit. Squash-proof analysis.",
  },
];

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
      {/* Navigation */}
      <nav className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-warm-800">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-[15px] font-semibold text-warm-800">
            Glasswork
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <a href="#features" className="text-[14px] text-warm-500 transition-colors hover:text-warm-800">
            Features
          </a>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-[14px] text-warm-500 transition-colors hover:text-warm-800">
            GitHub
          </a>
        </div>

        <button
          onClick={handleGetStarted}
          className="rounded-lg bg-warm-900 px-4 py-2 text-[13px] font-semibold text-white shadow-sm transition-all hover:bg-warm-800 hover:shadow-md"
        >
          {isAuthenticated ? "Go to workspace" : "Get started free"}
        </button>
      </nav>

      {/* Hero */}
      <section className="relative mx-auto max-w-3xl px-6 pb-16 pt-20 text-center">
        {/* Radial gradient glow anchoring the hero */}
        <div
          className="pointer-events-none absolute left-1/2 top-16 -translate-x-1/2"
          aria-hidden="true"
          style={{
            width: "640px",
            height: "420px",
            background: "radial-gradient(ellipse at center, rgba(124,107,255,0.08) 0%, rgba(201,169,110,0.06) 40%, rgba(45,164,78,0.04) 65%, transparent 85%)",
            filter: "blur(60px)",
          }}
        />

        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="mx-auto mb-10 flex h-32 w-32 items-center justify-center">
            <svg viewBox="0 0 120 120" fill="none" className="h-full w-full">
              <circle cx="60" cy="40" r="16" stroke="#C9A96E" strokeWidth="2" fill="#C9A96E" fillOpacity="0.1"/>
              <circle cx="38" cy="72" r="12" stroke="#7C6BFF" strokeWidth="2" fill="#7C6BFF" fillOpacity="0.1"/>
              <circle cx="82" cy="72" r="12" stroke="#2DA44E" strokeWidth="2" fill="#2DA44E" fillOpacity="0.1"/>
              <line x1="52" y1="52" x2="43" y2="63" stroke="#E8E5E0" strokeWidth="1.5"/>
              <line x1="68" y1="52" x2="77" y2="63" stroke="#E8E5E0" strokeWidth="1.5"/>
              <line x1="48" y1="76" x2="72" y2="76" stroke="#E8E5E0" strokeWidth="1.5"/>
            </svg>
          </div>

          <h1 className="font-display text-5xl font-semibold tracking-display text-warm-900 sm:text-6xl md:text-7xl">
            See who actually
            <br />
            <span className="relative">
              did the work
              <svg
                className="underline-draw absolute -bottom-2 left-0 w-full"
                viewBox="0 0 200 8"
                fill="none"
                preserveAspectRatio="none"
                style={{ height: "8px" }}
              >
                <path
                  d="M 0 6 Q 100 1, 200 6"
                  stroke="#C9A96E"
                  strokeWidth="3"
                  strokeLinecap="round"
                  opacity="0.5"
                />
              </svg>
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-lg text-[17px] leading-relaxed text-warm-600">
            Paste a Google Doc or GitHub repo. Glasswork analyzes revision history and commit data to reveal exactly who contributed.
          </p>
        </motion.div>

        <motion.div
          className="relative mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <button
            onClick={handleGetStarted}
            className="rounded-xl bg-warm-800 px-8 py-3.5 text-[15px] font-medium text-white shadow-layered transition-all hover:bg-warm-900 hover:shadow-layered-md"
          >
            {isAuthenticated ? "Go to workspace" : "Try for free"}
          </button>
        </motion.div>

        {/* Quick repo input */}
        <motion.div
          className="relative mx-auto mt-8 max-w-md"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex items-center gap-2 rounded-2xl border border-warm-200/60 bg-white p-2 shadow-layered transition-all focus-within:border-brand/30 focus-within:ring-2 focus-within:ring-brand/10">
            <Github className="ml-3 h-4.5 w-4.5 shrink-0 text-warm-400" />
            <input
              type="text"
              placeholder="owner/repo — e.g. facebook/react"
              value={repoInput}
              onChange={(e) => {
                setRepoInput(e.target.value);
                setError(null);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleRepoAnalyze()}
              className="min-w-0 flex-1 bg-transparent py-2.5 text-[15px] text-warm-800 placeholder:text-warm-400 focus:outline-none"
            />
            <button
              onClick={handleRepoAnalyze}
              disabled={isSubmitting || !repoInput.trim()}
              className="shrink-0 rounded-xl bg-warm-900 px-5 py-2.5 text-[14px] font-semibold text-white shadow-sm transition-all hover:bg-warm-800 hover:shadow-md disabled:opacity-30"
            >
              {isSubmitting ? "Analyzing..." : "Analyze"}
            </button>
          </div>
          {error && (
            <p className="mt-2 text-[12px] text-danger">{error}</p>
          )}
          <p className="mt-3 text-[12px] text-warm-500">
            Public repos only. No tokens required.
          </p>
        </motion.div>
      </section>

      {/* Integration Carousel */}
      <section className="overflow-hidden border-y border-warm-200/60 bg-white/60 py-8">
        <div className="relative">
          <div className="flex animate-scroll-left items-center gap-16 whitespace-nowrap">
            {[...integrations, ...integrations].map((integration, i) => (
              <div
                key={i}
                className="flex shrink-0 items-center gap-2.5 text-warm-400"
              >
                <integration.icon className="h-5 w-5" strokeWidth={1.5} />
                <span className="text-[15px] font-medium">{integration.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-5xl px-6 py-24">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-display text-3xl font-semibold tracking-display text-warm-900 sm:text-4xl">
            Everything you need in one place
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-[16px] text-warm-600">
            From revision diffs to commit graphs, Glasswork turns boring version history into clear contribution data.
          </p>
        </motion.div>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              className="group rounded-2xl border border-warm-200/60 bg-white p-8 shadow-layered transition-all hover:shadow-layered-md"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-brand/[0.08] text-brand transition-colors group-hover:bg-brand/[0.14] group-hover:text-brand-dark">
                <feature.icon className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <h3 className="text-[17px] font-semibold text-warm-800">
                {feature.title}
              </h3>
              <p className="mt-2 text-[14px] leading-relaxed text-warm-600">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-warm-200/60 bg-white/60 py-24">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="font-display text-3xl font-semibold tracking-display text-warm-900">
            Your grades deserve transparency
          </h2>
          <p className="mx-auto mt-4 max-w-md text-[16px] text-warm-600">
            Stop letting freeloaders take credit. See the data, share the proof.
          </p>
          <button
            onClick={handleGetStarted}
            className="mt-8 rounded-xl bg-warm-900 px-8 py-3.5 text-[15px] font-semibold text-white shadow-layered transition-all hover:bg-warm-800 hover:shadow-layered-md"
          >
            {isAuthenticated ? "Go to workspace" : "Get started free"}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-warm-200/60 px-6 py-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-warm-400">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-[13px] font-medium text-warm-400">Glasswork</span>
          </div>
          <p className="text-[12px] text-warm-400">
            Built by a 16-year-old tired of carrying group projects.
          </p>
        </div>
      </footer>
    </div>
  );
}
