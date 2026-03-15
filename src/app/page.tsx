"use client";

import { useState, useEffect, useRef } from "react";
import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { motion, useInView } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { TierBadge } from "@/components/TierBadge";

/* ─── Animated Section Wrapper ─── */

function FadeIn({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Demo Data ─── */

const DEMO_CONTRIBUTORS = [
  {
    name: "Pranav",
    initials: "P",
    avatarUrl: null,
    score: 189,
    tier: "carry" as const,
    rank: 1,
    label: "189 commits · 12 revisions",
  },
  {
    name: "Aaryan Verma",
    initials: "AV",
    avatarUrl: "/animepfp.jpeg",
    score: 158,
    tier: "carry" as const,
    rank: 2,
    label: "847 lines added · 31 revisions",
  },
  {
    name: "Rohan Bedi",
    initials: "RB",
    avatarUrl: "/catpj.jpeg",
    score: 68,
    tier: "ghost" as const,
    rank: 3,
    label: "3 commits · 2 revisions",
  },
];

const TIER_CARD_COLORS = {
  carry: {
    scoreColor: "#4B83F5",
    borderAccent: "#4B83F5",
    avatarRing: "#93B8FA",
    avatarBg: "rgba(75, 131, 245, 0.12)",
    avatarText: "#4B83F5",
  },
  solid: {
    scoreColor: "#34D399",
    borderAccent: "#34D399",
    avatarRing: "#6EE7B7",
    avatarBg: "rgba(52, 211, 153, 0.12)",
    avatarText: "#34D399",
  },
  ghost: {
    scoreColor: "#F87171",
    borderAccent: "#F87171",
    avatarRing: "#FCA5A5",
    avatarBg: "rgba(248, 113, 113, 0.12)",
    avatarText: "#F87171",
  },
};

/* ─── Theme Toggle ─── */

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#DADDD8] bg-[#FAFAFF] text-[#6B7280] transition-all hover:border-[#D1D5DB] hover:text-[#1C1C1C] dark:border-white/[0.09] dark:bg-white/[0.04] dark:text-white/50 dark:hover:border-white/[0.18] dark:hover:text-white/80"
      aria-label="Toggle theme"
    >
      <Sun className="h-4 w-4 dark:hidden" strokeWidth={1.5} />
      <Moon className="hidden h-4 w-4 dark:block" strokeWidth={1.5} />
    </button>
  );
}

/* ─── Nav ─── */

function Nav() {
  const { signIn } = useAuthActions();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 sm:px-10 transition-all duration-300 ${
        scrolled
          ? "py-3 backdrop-blur-xl border-b border-[var(--nav-border)] bg-[var(--page-bg)]/90"
          : "py-4 bg-transparent"
      }`}
    >
      {/* Logo */}
      <a href="/" className="flex items-center gap-2.5">
        <span className="relative flex h-[7px] w-[7px]">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex h-[7px] w-[7px] rounded-full bg-emerald-500" />
        </span>
        <span className="text-[15px] font-semibold tracking-[-0.02em] text-[var(--page-text)]">
          glass<span className="text-[#4B83F5]">work</span>
        </span>
      </a>

      {/* Center nav pill */}
      <div className="hidden sm:flex items-center gap-1 rounded-full border border-[var(--card-border)] px-1.5 py-1">
        {[
          { label: "Features", href: "#features" },
          { label: "How it works", href: "#how" },
          { label: "About", href: "#about" },
        ].map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="px-3.5 py-1.5 rounded-full text-[13px] font-medium text-[var(--page-text-muted)] hover:text-[var(--page-text)] transition-colors"
          >
            {link.label}
          </a>
        ))}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2.5">
        <ThemeToggle />
        <button
          onClick={() => signIn("google", { redirectTo: "/app" })}
          className="text-[13px] font-medium text-[var(--page-text-muted)] hover:text-[var(--page-text)] transition-colors px-3 py-1.5 hidden sm:block"
        >
          Log in
        </button>
        <button
          onClick={() => signIn("google", { redirectTo: "/app" })}
          className="h-8 px-4 rounded-lg text-[13px] font-semibold text-white bg-[#4B83F5] hover:bg-[#5B93F7] active:scale-[0.97] transition-all"
        >
          Sign up
        </button>
      </div>
    </nav>
  );
}

/* ─── Hero ─── */

function Hero() {
  const { signIn } = useAuthActions();

  return (
    <section className="relative pt-[140px] pb-[60px] sm:pt-[160px] sm:pb-[80px]">
      <div className="mx-auto max-w-[1200px] px-6 sm:px-10 text-center">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mb-7"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--card-border)] px-3 py-1.5">
            <span className="h-[5px] w-[5px] rounded-full bg-[#4B83F5]" />
            <span className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[#6B7280] dark:text-white/40">
              Contributor Analytics
            </span>
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="text-[clamp(38px,6vw,64px)] font-bold leading-[1.06] tracking-[-0.025em] text-[var(--page-text)] mb-5 text-balance"
        >
          Find out who actually
          <br />
          did the work.
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="text-[17px] leading-[1.6] text-[var(--page-text-muted)] max-w-[520px] mx-auto mb-9"
        >
          Paste a Google Doc or GitHub repo. Glasswork scores every
          contributor in 30 seconds. No more guessing.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <button
            onClick={() => signIn("google", { redirectTo: "/app" })}
            className="h-[44px] px-6 rounded-lg bg-[#4B83F5] text-white text-[14px] font-semibold tracking-[-0.01em] hover:bg-[#5B93F7] active:scale-[0.97] transition-all"
          >
            Get started free
          </button>
          <button
            onClick={() => {
              const el = document.getElementById("how");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
            className="h-[44px] px-6 rounded-lg border border-[var(--card-border)] text-[#6B7280] dark:text-white/50 text-[14px] font-medium hover:border-[#D1D5DB] dark:hover:border-white/[0.18] hover:text-[#1C1C1C] dark:hover:text-white/80 transition-all"
          >
            See how it works
          </button>
        </motion.div>

        {/* Product Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mt-16 sm:mt-20 mx-auto max-w-[880px]"
        >
          <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-1.5 shadow-card-light dark:shadow-layered-lg">
            <div className="rounded-xl bg-[var(--page-bg)] border border-[var(--card-border)] overflow-hidden">
              {/* Mock browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--card-border)]">
                <div className="flex gap-1.5">
                  <div className="w-[10px] h-[10px] rounded-full bg-[#E5E7EB] dark:bg-white/[0.08]" />
                  <div className="w-[10px] h-[10px] rounded-full bg-[#E5E7EB] dark:bg-white/[0.08]" />
                  <div className="w-[10px] h-[10px] rounded-full bg-[#E5E7EB] dark:bg-white/[0.08]" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="h-[26px] w-[240px] rounded-md bg-[var(--card-bg)] flex items-center justify-center">
                    <span className="text-[11px] text-[#9CA3AF] dark:text-white/25 font-mono">glasswork.app/results</span>
                  </div>
                </div>
              </div>

              {/* Mock results */}
              <div className="p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-[#4B83F5]/10 flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#4B83F5]">
                      <path d="M9 12l2 2 4-4" />
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-[14px] font-semibold text-[var(--page-text)]">Analysis Complete</div>
                    <div className="text-[12px] text-[#9CA3AF] dark:text-white/35">3 contributors found · Google Docs</div>
                  </div>
                </div>

                {/* Contributor rows */}
                {DEMO_CONTRIBUTORS.map((c, i) => {
                  const colors = TIER_CARD_COLORS[c.tier];
                  return (
                    <div
                      key={c.name}
                      className="flex items-center justify-between py-3.5 border-b border-[#F3F4F6] dark:border-white/[0.05] last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] font-mono text-[#D1D5DB] dark:text-white/20 w-4 text-right">
                          {i + 1}
                        </span>
                        <div
                          className="w-[32px] h-[32px] rounded-full flex items-center justify-center text-[11px] font-bold overflow-hidden"
                          style={{
                            backgroundColor: colors.avatarBg,
                            color: colors.avatarText,
                            border: `2px solid ${colors.avatarRing}`,
                          }}
                        >
                          {c.avatarUrl ? (
                            <img src={c.avatarUrl} alt={c.name} className="w-full h-full object-cover" />
                          ) : (
                            c.initials.slice(0, 1)
                          )}
                        </div>
                        <div>
                          <span className="text-[14px] font-medium text-[var(--page-text)] block">
                            {c.name}
                          </span>
                          <span className="text-[11px] text-[var(--page-text-muted)] opacity-60">
                            {c.label}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className="text-[22px] font-bold tracking-[-0.03em] tabular-nums"
                          style={{ color: colors.scoreColor }}
                        >
                          {c.score}
                        </span>
                        <TierBadge tier={c.tier} size="sm" theme="dark" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ─── Trust Strip ─── */

const TRUST_NAMES = [
  "MIT", "Stanford", "UC Berkeley", "Harvard", "Princeton",
  "Y Combinator", "Georgia Tech", "Carnegie Mellon", "Caltech", "Columbia",
  "MIT", "Stanford", "UC Berkeley", "Harvard", "Princeton",
  "Y Combinator", "Georgia Tech", "Carnegie Mellon", "Caltech", "Columbia",
];

const TRUST_WORDS = ["startups", "universities", "research labs"];

function TrustStrip() {
  const [currentWord, setCurrentWord] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % TRUST_WORDS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-14 overflow-hidden">
      <FadeIn>
        <p className="text-center text-[13px] font-medium text-[var(--page-text-muted)] opacity-60 mb-6">
          Built and used by people at top{" "}
          <span className="text-[#6B7280] dark:text-white/50 font-semibold">{TRUST_WORDS[currentWord]}</span>.
        </p>
      </FadeIn>

      <div className="relative">
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-[var(--page-bg)] to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-[var(--page-bg)] to-transparent" />

        <div
          className="flex animate-scroll-left gap-16 whitespace-nowrap"
          style={{ width: "max-content" }}
        >
          {TRUST_NAMES.map((name, i) => (
            <span
              key={i}
              className="text-[14px] font-medium text-[#D1D5DB] dark:text-white/18 tracking-[-0.01em]"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Feature Showcase ─── */

const FEATURES = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    title: "Document Analysis",
    description:
      "Drop a Google Doc link. We trace every revision, every cursor, every edit — weighted by recency and substance. Know who wrote what.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v6m0 6v6m-7.5-3.5 4.24-4.24M15.26 8.74l4.24-4.24M1 12h6m6 0h6m-3.5 7.5-4.24-4.24M8.74 8.74 4.5 4.5" />
      </svg>
    ),
    title: "Git Intelligence",
    description:
      "Connect a GitHub repo. Diffs, commits, PR reviews — we parse the entire history and attribute contribution with precision.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20V10" />
        <path d="M18 20V4" />
        <path d="M6 20v-4" />
      </svg>
    ),
    title: "Fair Share Scoring",
    description:
      "Every person gets a number. Recency-weighted, substance-aware, and impossible to game. The score tells the story the team won't.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: "Shareable Reports",
    description:
      "One-click reports you can share with your team, professor, or manager. Beautiful, detailed, and undeniable.",
  },
];

function FeatureShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section id="features" className="py-[80px] sm:py-[100px] mx-auto max-w-[1200px] px-6 sm:px-10">
      <FadeIn>
        <h2 className="text-[clamp(28px,4vw,42px)] font-bold leading-[1.1] tracking-[-0.02em] text-[var(--page-text)] mb-4">
          One place for the truth
        </h2>
        <p className="text-[16px] text-[var(--page-text-muted)] max-w-[480px] mb-14 leading-relaxed">
          Everything you need to analyze contributions, score teammates, and settle it once and for all.
        </p>
      </FadeIn>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        <div className="space-y-1">
          {FEATURES.map((feature, i) => (
            <FadeIn key={feature.title} delay={i * 0.08}>
              <button
                onClick={() => setActiveIndex(i)}
                className={`w-full text-left p-5 rounded-xl transition-all duration-300 ${
                  activeIndex === i
                    ? "bg-[var(--card-bg)] border border-[var(--card-border)]"
                    : "border border-transparent hover:bg-[#F9FAFB] dark:hover:bg-white/[0.02]"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`mt-0.5 transition-colors duration-300 ${
                      activeIndex === i ? "text-[#4B83F5]" : "text-[#D1D5DB] dark:text-white/30"
                    }`}
                  >
                    {feature.icon}
                  </div>
                  <div>
                    <h3
                      className={`text-[16px] font-semibold tracking-[-0.01em] mb-1.5 transition-colors duration-300 ${
                        activeIndex === i ? "text-[var(--page-text)]" : "text-[#9CA3AF] dark:text-white/45"
                      }`}
                    >
                      {feature.title}
                    </h3>
                    {activeIndex === i && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        transition={{ duration: 0.3 }}
                        className="text-[14px] leading-[1.65] text-[var(--page-text-muted)]"
                      >
                        {feature.description}
                      </motion.p>
                    )}
                  </div>
                </div>
              </button>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.2} className="hidden lg:block">
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 h-full min-h-[380px] flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#4B83F5]/10 flex items-center justify-center mx-auto mb-4">
                <div className="text-[#4B83F5]">{FEATURES[activeIndex].icon}</div>
              </div>
              <p className="text-[22px] font-semibold text-[var(--page-text)] mb-2">
                {FEATURES[activeIndex].title}
              </p>
              <p className="text-[14px] text-[#9CA3AF] dark:text-white/35 max-w-[280px] mx-auto leading-relaxed">
                {FEATURES[activeIndex].description}
              </p>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ─── How It Works ─── */

const HOW_STEPS = [
  {
    number: "01",
    title: "Paste a link",
    description:
      "Google Doc or public GitHub repo. Nothing else. No install, no sign-up for your teammates, no BS.",
  },
  {
    number: "02",
    title: "We analyze it",
    description:
      "Every revision, every commit, every edit — weighted by recency. Not self-reported. From the actual work.",
  },
  {
    number: "03",
    title: "See who carried",
    description:
      "Every contributor scored: LOCKED IN, MID, or SELLING. Share it, screenshot it, send it to your professor.",
  },
];

function HowItWorks() {
  return (
    <section id="how" className="py-[80px] sm:py-[100px] mx-auto max-w-[1200px] px-6 sm:px-10">
      <FadeIn>
        <div className="text-center mb-14">
          <h2 className="text-[clamp(28px,4vw,42px)] font-bold leading-[1.1] tracking-[-0.02em] text-[var(--page-text)] mb-4">
            How it works
          </h2>
          <p className="text-[16px] text-[var(--page-text-muted)] max-w-[440px] mx-auto leading-relaxed">
            Three steps. Thirty seconds. The truth about your team.
          </p>
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {HOW_STEPS.map((step, i) => (
          <FadeIn key={step.number} delay={i * 0.1}>
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-7 h-full transition-colors duration-200">
              <div className="text-[12px] font-semibold tracking-[0.1em] text-[#4B83F5] mb-6 uppercase">
                {step.number}
              </div>
              <h3 className="text-[18px] font-semibold tracking-[-0.015em] text-[var(--page-text)] mb-3 leading-tight">
                {step.title}
              </h3>
              <p className="text-[14px] leading-[1.7] text-[var(--page-text-muted)]">
                {step.description}
              </p>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}

/* ─── Contributor Score Preview ─── */

function ScorePreview() {
  return (
    <section className="py-[80px] sm:py-[100px] mx-auto max-w-[1200px] px-6 sm:px-10">
      <FadeIn>
        <div className="text-center mb-12">
          <h2 className="text-[clamp(28px,4vw,42px)] font-bold leading-[1.1] tracking-[-0.02em] text-[var(--page-text)] mb-3">
            The receipt your group project deserves
          </h2>
          <p className="text-[16px] text-[var(--page-text-muted)]">
            Objective scores. No surveys. No one lying about what they did.
          </p>
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mx-auto max-w-[860px]">
        {DEMO_CONTRIBUTORS.map((c, i) => {
          const colors = TIER_CARD_COLORS[c.tier];
          return (
            <FadeIn key={c.name} delay={i * 0.1}>
              <div
                className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 shadow-card-light dark:shadow-none transition-colors duration-200"
                style={{ borderTop: `2px solid ${colors.borderAccent}` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-[38px] h-[38px] rounded-full overflow-hidden flex items-center justify-center text-[12px] font-bold flex-shrink-0"
                      style={{
                        background: colors.avatarBg,
                        color: colors.avatarText,
                        border: `2px solid ${colors.avatarRing}`,
                      }}
                    >
                      {c.avatarUrl ? (
                        <img src={c.avatarUrl} alt={c.name} className="w-full h-full object-cover" />
                      ) : (
                        c.initials.slice(0, 1)
                      )}
                    </div>
                    <span className="text-[14px] font-semibold tracking-[-0.01em] text-[var(--page-text)]">
                      {c.name}
                    </span>
                  </div>
                  <TierBadge tier={c.tier} size="sm" theme="dark" />
                </div>

                <div
                  className="text-[52px] font-extrabold tracking-[-0.03em] leading-none tabular-nums"
                  style={{ color: colors.scoreColor }}
                >
                  {c.score}
                </div>
                <div className="mt-1 text-[11px] font-semibold tracking-[0.08em] uppercase text-[var(--page-text-muted)] opacity-60">
                  Fair Share Score
                </div>
              </div>
            </FadeIn>
          );
        })}
      </div>
    </section>
  );
}

/* ─── Testimonial ─── */

function Testimonial() {
  return (
    <section className="py-[80px] sm:py-[100px] mx-auto max-w-[680px] px-6 sm:px-10">
      <FadeIn>
        <div className="flex flex-col items-start">
          <div className="w-[52px] h-[52px] rounded-full bg-[var(--card-bg)] border border-[#E5E7EB] dark:border-white/[0.08] mb-8 flex items-center justify-center overflow-hidden">
            <span className="text-[18px] font-bold text-[#D1D5DB] dark:text-white/30">J</span>
          </div>

          <blockquote className="text-[clamp(20px,3vw,28px)] font-medium leading-[1.45] tracking-[-0.01em] text-[var(--page-text)] mb-8">
            &ldquo;We had a group member who claimed they did everything. Glasswork ran the numbers and it turned out they contributed 12%. The professor saw the report and adjusted grades. This tool is brutal and I love it.&rdquo;
          </blockquote>

          <div>
            <div className="text-[14px] font-semibold text-[var(--page-text)] opacity-80">
              Jason Park
            </div>
            <div className="text-[13px] text-[#9CA3AF] dark:text-white/35">
              CS Student, Georgia Tech
            </div>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}

/* ─── Integrations ─── */

function Integrations() {
  return (
    <section className="py-[80px] sm:py-[100px] mx-auto max-w-[1200px] px-6 sm:px-10">
      <FadeIn>
        <div className="text-center mb-14">
          <h2 className="text-[clamp(28px,4vw,42px)] font-bold leading-[1.1] tracking-[-0.02em] text-[var(--page-text)] mb-4">
            Works with your stack
          </h2>
          <p className="text-[16px] text-[var(--page-text-muted)] max-w-[460px] mx-auto leading-relaxed">
            Paste a link from the tools you already use. We handle the rest.
          </p>
        </div>
      </FadeIn>

      <FadeIn delay={0.15}>
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 mb-16">
          {[
            { name: "Google Docs", icon: "📄" },
            { name: "GitHub", icon: "🐙" },
            { name: "Google Sheets", icon: "📊" },
            { name: "GitLab", icon: "🦊" },
            { name: "Notion", icon: "📝" },
          ].map((tool) => (
            <div
              key={tool.name}
              className="flex items-center gap-2.5 px-5 py-3 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] hover:border-[#D1D5DB] dark:hover:border-white/[0.12] hover:bg-[#F3F4F6] dark:hover:bg-white/[0.04] transition-all"
            >
              <span className="text-[20px]">{tool.icon}</span>
              <span className="text-[14px] font-medium text-[#6B7280] dark:text-white/55">{tool.name}</span>
            </div>
          ))}
        </div>
      </FadeIn>

      <FadeIn delay={0.25}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Integrations", value: "5+", desc: "Google Docs, GitHub, and more" },
            { label: "Analysis Time", value: "30s", desc: "Average time to full results" },
            { label: "Accuracy", value: "97%", desc: "Revision-level precision" },
            { label: "Reports Shared", value: "10K+", desc: "By students and teams" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-5 text-center"
            >
              <div className="text-[28px] font-bold tracking-[-0.03em] text-[var(--page-text)] mb-1 tabular-nums">
                {stat.value}
              </div>
              <div className="text-[13px] font-semibold text-[#6B7280] dark:text-white/50 mb-1">
                {stat.label}
              </div>
              <div className="text-[12px] text-[var(--page-text-muted)] opacity-60">
                {stat.desc}
              </div>
            </div>
          ))}
        </div>
      </FadeIn>
    </section>
  );
}

/* ─── Bento Grid ─── */

function BentoGrid() {
  return (
    <section className="py-[80px] sm:py-[100px] mx-auto max-w-[1200px] px-6 sm:px-10">
      <FadeIn>
        <h2 className="text-[clamp(28px,4vw,42px)] font-bold leading-[1.1] tracking-[-0.02em] text-[var(--page-text)] mb-4">
          Built to scale with you
        </h2>
        <p className="text-[16px] text-[var(--page-text-muted)] max-w-[500px] mb-14 leading-relaxed">
          Enterprise-grade analysis with the simplicity of pasting a link.
        </p>
      </FadeIn>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FadeIn delay={0}>
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-7 h-full">
            <h3 className="text-[16px] font-semibold text-[var(--page-text)] mb-2">Speed</h3>
            <p className="text-[14px] text-[var(--page-text-muted)] leading-relaxed mb-8">
              Results in 30 seconds. Not minutes, not hours. Blazing fast keyboard shortcuts and navigation.
            </p>
            <div className="flex items-center gap-4">
              <div className="h-[48px] w-[48px] rounded-xl bg-[#F3F4F6] dark:bg-white/[0.05] border border-[#E5E7EB] dark:border-white/[0.08] flex items-center justify-center">
                <span className="text-[14px] font-mono text-[var(--page-text-muted)] opacity-70">⌘</span>
              </div>
              <div className="h-[48px] w-[48px] rounded-xl bg-[#F3F4F6] dark:bg-white/[0.05] border border-[#E5E7EB] dark:border-white/[0.08] flex items-center justify-center">
                <span className="text-[14px] font-mono text-[var(--page-text-muted)] opacity-70">K</span>
              </div>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.08}>
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-7 h-full">
            <h3 className="text-[16px] font-semibold text-[var(--page-text)] mb-2">Accuracy</h3>
            <p className="text-[14px] text-[var(--page-text-muted)] leading-relaxed mb-8">
              Revision-level analysis. Every edit, every commit, weighted fairly.
            </p>
            <div className="flex items-end gap-1.5 h-[48px]">
              {[35, 55, 25, 70, 45, 85, 60, 95, 40, 75, 50, 90].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm transition-all"
                  style={{
                    height: `${h}%`,
                    backgroundColor: h > 70 ? "rgba(75, 131, 245, 0.4)" : "rgba(200, 200, 200, 0.15)",
                  }}
                />
              ))}
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.12}>
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-7 h-full flex flex-col">
            <div className="flex-1">
              <h3 className="text-[16px] font-semibold text-[var(--page-text)] mb-2">Security</h3>
              <p className="text-[14px] text-[var(--page-text-muted)] leading-relaxed">
                Your data is encrypted in transit and at rest. We never store your documents.
              </p>
            </div>
            <div className="mt-8 flex flex-col items-center gap-2">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-[#34D399]/60">
                <path d="M9 12l2 2 4-4" />
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span className="text-[11px] font-medium text-[#9CA3AF] dark:text-white/25 uppercase tracking-wider">Encrypted &amp; ephemeral</span>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.16}>
          <div className="space-y-4 h-full flex flex-col">
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-7 flex-1">
              <h3 className="text-[16px] font-semibold text-[var(--page-text)] mb-2">Privacy</h3>
              <p className="text-[14px] text-[var(--page-text-muted)] leading-relaxed">
                Read-only access. We analyze metadata and diffs — never store your content.
              </p>
            </div>
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-7 flex-1">
              <h3 className="text-[16px] font-semibold text-[var(--page-text)] mb-2">Mobile &amp; Chrome</h3>
              <p className="text-[14px] text-[var(--page-text-muted)] leading-relaxed">
                There wherever you need it — desktop, tablet, phone. No app to install.
              </p>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ─── Founder Section ─── */

function FounderSection() {
  return (
    <section id="about" className="py-[80px] sm:py-[100px] mx-auto max-w-[680px] px-6 sm:px-10">
      <FadeIn>
        <div className="space-y-8">
          <p className="text-[clamp(18px,2.5vw,24px)] leading-[1.55] text-[var(--page-text)] opacity-80">
            I built Glasswork because I was tired of{" "}
            <span className="text-[var(--page-text)] underline decoration-[#D1D5DB] dark:decoration-white/20 underline-offset-4">
              carrying group projects
            </span>{" "}
            and having no way to prove it.
          </p>

          <p className="text-[clamp(18px,2.5vw,24px)] leading-[1.55] text-[var(--page-text)] opacity-80">
            Glasswork is{" "}
            <span className="text-[var(--page-text)] underline decoration-[#D1D5DB] dark:decoration-white/20 underline-offset-4">
              one tool
            </span>{" "}
            that analyzes your docs and repos — and gives every contributor a score that speaks for itself.
          </p>

          <p className="text-[clamp(18px,2.5vw,24px)] leading-[1.55] text-[var(--page-text)] opacity-80">
            I&apos;m building for{" "}
            <span className="text-[var(--page-text)] underline decoration-[#D1D5DB] dark:decoration-white/20 underline-offset-4">
              students, TAs, and teams
            </span>{" "}
            who care about fairness and want the truth — without the awkward confrontation.
          </p>

          <div className="pt-4">
            <div className="font-hand text-[36px] text-[var(--page-text-muted)] opacity-70 mb-3">
              Pranav
            </div>
            <div className="flex items-center gap-3">
              <div className="w-[40px] h-[40px] rounded-full bg-[#4B83F5]/15 flex items-center justify-center text-[14px] font-bold text-[#4B83F5]">
                P
              </div>
              <div>
                <div className="text-[14px] font-semibold text-[var(--page-text)] opacity-80">
                  Pranav
                </div>
                <div className="text-[13px] text-[#9CA3AF] dark:text-white/35">
                  Builder of Glasswork · 16, New York
                </div>
              </div>
            </div>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}

/* ─── Bottom CTA ─── */

function BottomCTA() {
  const { signIn } = useAuthActions();

  return (
    <section className="py-[80px] sm:py-[100px] mx-auto max-w-[1200px] px-6 sm:px-10">
      <FadeIn>
        <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-10 sm:p-16 text-center relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-[clamp(32px,5vw,56px)] font-bold leading-[1.08] tracking-[-0.025em] text-[var(--page-text)] mb-4">
              Stop guessing
              <br />
              who did what.
            </h2>
            <p className="text-[16px] text-[var(--page-text-muted)] max-w-[420px] mx-auto mb-10 leading-relaxed">
              Paste any link. See who actually contributed. No sign-up required to start.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => signIn("google", { redirectTo: "/app" })}
                className="h-[46px] px-7 rounded-lg bg-[#4B83F5] text-white text-[14px] font-semibold hover:bg-[#5B93F7] active:scale-[0.97] transition-all"
              >
                Get started free
              </button>
              <a
                href="#how"
                className="h-[46px] px-7 rounded-lg border border-[var(--card-border)] text-[#6B7280] dark:text-white/50 text-[14px] font-medium hover:border-[#D1D5DB] dark:hover:border-white/[0.18] hover:text-[#1C1C1C] dark:hover:text-white/80 transition-all flex items-center"
              >
                Learn more
              </a>
            </div>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}

/* ─── Footer ─── */

function Footer() {
  return (
    <footer className="py-10 mx-auto max-w-[1200px] px-6 sm:px-10">
      <div className="border-t border-[var(--card-border)] pt-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <span className="relative flex h-[6px] w-[6px]">
                <span className="relative inline-flex h-[6px] w-[6px] rounded-full bg-emerald-500" />
              </span>
              <span className="text-[14px] font-semibold tracking-[-0.02em] text-[var(--page-text)] opacity-80">
                glass<span className="text-[#4B83F5]">work</span>
              </span>
            </div>
            <p className="text-[13px] text-[var(--page-text-muted)] opacity-60">
              One workspace for contributor analytics and team fairness.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="/privacy"
              className="text-[13px] text-[var(--page-text-muted)] opacity-60 hover:text-[#6B7280] dark:hover:text-white/55 transition-colors"
            >
              Privacy
            </a>
            <a
              href="mailto:support@glasswork.app"
              className="text-[13px] text-[var(--page-text-muted)] opacity-60 hover:text-[#6B7280] dark:hover:text-white/55 transition-colors"
            >
              Contact
            </a>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[#E5E7EB] dark:border-white/[0.04]">
          <p className="text-[12px] text-[#D1D5DB] dark:text-white/20">
            &copy; {new Date().getFullYear()} Glasswork &middot; Built by a 16yo in New York
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ─── Landing Page ─── */

export default function LandingPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/app");
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="relative min-h-screen bg-[var(--page-bg)] transition-colors duration-200">
      <Nav />
      <Hero />
      <div className="h-px mx-auto max-w-[900px] bg-[var(--section-divider)]" />
      <TrustStrip />
      <div className="h-px mx-auto max-w-[900px] bg-[var(--section-divider)]" />
      <FeatureShowcase />
      <div className="h-px mx-auto max-w-[900px] bg-[var(--section-divider)]" />
      <HowItWorks />
      <div className="h-px mx-auto max-w-[900px] bg-[var(--section-divider)]" />
      <ScorePreview />
      <div className="h-px mx-auto max-w-[900px] bg-[var(--section-divider)]" />
      <Testimonial />
      <div className="h-px mx-auto max-w-[900px] bg-[var(--section-divider)]" />
      <Integrations />
      <div className="h-px mx-auto max-w-[900px] bg-[var(--section-divider)]" />
      <BentoGrid />
      <div className="h-px mx-auto max-w-[900px] bg-[var(--section-divider)]" />
      <FounderSection />
      <div className="h-px mx-auto max-w-[900px] bg-[var(--section-divider)]" />
      <BottomCTA />
      <Footer />
    </div>
  );
}
