"use client";

import { useState, useEffect, useRef } from "react";
import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { motion, useInView } from "framer-motion";

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
          ? "py-3 bg-bg/80 backdrop-blur-xl border-b border-[rgba(248,245,239,0.06)]"
          : "py-5 bg-transparent"
      }`}
    >
      <a href="/" className="flex items-center gap-2.5">
        <div className="w-[22px] h-[22px] rounded-full bg-fg flex items-center justify-center">
          <div className="w-[8px] h-[8px] rounded-full bg-bg" />
        </div>
        <span className="text-[15px] font-semibold tracking-[-0.02em] text-fg">
          glasswork
        </span>
      </a>

      <div className="flex items-center gap-3">
        <button
          onClick={() => signIn("google", { redirectTo: "/app" })}
          className="text-[13px] font-medium text-fg/60 hover:text-fg transition-colors px-3 py-1.5"
        >
          Log in
        </button>
        <button
          onClick={() => signIn("google", { redirectTo: "/app" })}
          className="text-[13px] font-semibold text-bg bg-fg hover:bg-fg/90 px-4 py-2 rounded-lg transition-all active:scale-[0.97]"
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
    <section className="relative pt-[140px] pb-[80px] sm:pt-[160px] sm:pb-[100px]">
      <div className="mx-auto max-w-container px-6 sm:px-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8"
        >
          <span className="inline-flex items-center gap-2 text-[12px] font-mono font-medium tracking-[0.06em] uppercase text-fg/40">
            <span className="w-1.5 h-1.5 rounded-full bg-solid" />
            Contributor Analytics
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="font-serif text-[clamp(42px,7vw,76px)] font-bold leading-[1.05] tracking-[-0.02em] text-fg mb-6 text-balance"
        >
          Find out who actually
          <br />
          did <span className="italic text-brand-light">the work.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="text-[17px] sm:text-[19px] leading-[1.6] text-fg/45 max-w-[520px] mx-auto mb-10"
        >
          Paste a Google Doc or GitHub repo. Glasswork scores every
          contributor in 30 seconds. No more guessing.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <button
            onClick={() => signIn("google", { redirectTo: "/app" })}
            className="h-[48px] px-7 rounded-[10px] bg-fg text-bg text-[14px] font-semibold tracking-[-0.01em] hover:bg-fg/90 active:scale-[0.97] transition-all"
          >
            Get started free
          </button>
          <button
            onClick={() => {
              const el = document.getElementById("how");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
            className="h-[48px] px-7 rounded-[10px] border border-fg/12 text-fg/60 text-[14px] font-medium hover:border-fg/20 hover:text-fg/80 transition-all"
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
          <div className="rounded-xl border border-fg/[0.08] bg-surface-1/50 p-1.5 shadow-layered-lg">
            <div className="rounded-lg bg-surface-1 border border-fg/[0.06] overflow-hidden">
              {/* Mock App Header */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-fg/[0.06]">
                <div className="flex gap-1.5">
                  <div className="w-[10px] h-[10px] rounded-full bg-fg/[0.08]" />
                  <div className="w-[10px] h-[10px] rounded-full bg-fg/[0.08]" />
                  <div className="w-[10px] h-[10px] rounded-full bg-fg/[0.08]" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="h-[26px] w-[240px] rounded-md bg-fg/[0.04] flex items-center justify-center">
                    <span className="text-[11px] text-fg/25 font-mono">glasswork.app/results</span>
                  </div>
                </div>
              </div>
              {/* Mock Results */}
              <div className="p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-brand/20 flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand-light">
                      <path d="M9 12l2 2 4-4" />
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-[14px] font-semibold text-fg">Analysis Complete</div>
                    <div className="text-[12px] text-fg/35">3 contributors found · Google Docs</div>
                  </div>
                </div>
                {/* Contributor Rows */}
                {[
                  { name: "Pranav", score: 189, tier: "carry", color: "#8B7CF6" },
                  { name: "Aaryan V.", score: 158, tier: "carry", color: "#8B7CF6" },
                  { name: "Rohan B.", score: 68, tier: "ghost", color: "#F87171" },
                ].map((c, i) => (
                  <div
                    key={c.name}
                    className="flex items-center justify-between py-3.5 border-b border-fg/[0.05] last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-mono text-fg/20 w-4 text-right">
                        {i + 1}
                      </span>
                      <div
                        className="w-[32px] h-[32px] rounded-full flex items-center justify-center text-[11px] font-bold"
                        style={{
                          backgroundColor: `${c.color}15`,
                          color: c.color,
                        }}
                      >
                        {c.name[0]}
                      </div>
                      <span className="text-[14px] font-medium text-fg/80">
                        {c.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className="text-[22px] font-bold tracking-[-0.03em] tabular-nums"
                        style={{ color: c.color }}
                      >
                        {c.score}
                      </span>
                      <span
                        className="text-[10px] font-semibold tracking-[0.06em] uppercase px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${c.color}12`,
                          color: c.color,
                        }}
                      >
                        {c.tier}
                      </span>
                    </div>
                  </div>
                ))}
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
    <section className="py-16 overflow-hidden">
      <FadeIn>
        <p className="text-center text-[14px] text-fg/35 mb-6">
          Built and used by students at top{" "}
          <span className="text-fg/60 font-medium">{TRUST_WORDS[currentWord]}</span>.
        </p>
      </FadeIn>

      <div className="relative">
        <div
          className="pointer-events-none absolute left-0 top-0 bottom-0 w-32 z-10"
          style={{ background: "linear-gradient(to right, #0F1013, transparent)" }}
        />
        <div
          className="pointer-events-none absolute right-0 top-0 bottom-0 w-32 z-10"
          style={{ background: "linear-gradient(to left, #0F1013, transparent)" }}
        />

        <div
          className="flex animate-scroll-left gap-16 whitespace-nowrap"
          style={{ width: "max-content" }}
        >
          {TRUST_NAMES.map((name, i) => (
            <span
              key={i}
              className="text-[15px] font-medium text-fg/18 tracking-[-0.01em]"
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
    <section className="py-section mx-auto max-w-container px-6 sm:px-10">
      <FadeIn>
        <h2 className="font-serif text-[clamp(32px,5vw,52px)] font-bold leading-[1.1] tracking-[-0.02em] text-fg mb-4">
          One tool for the truth
        </h2>
        <p className="text-[17px] text-fg/40 max-w-[480px] mb-14 leading-relaxed">
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
                    ? "bg-fg/[0.04] border border-fg/[0.08]"
                    : "border border-transparent hover:bg-fg/[0.02]"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`mt-0.5 transition-colors duration-300 ${
                      activeIndex === i ? "text-brand-light" : "text-fg/30"
                    }`}
                  >
                    {feature.icon}
                  </div>
                  <div>
                    <h3
                      className={`text-[16px] font-semibold tracking-[-0.01em] mb-1.5 transition-colors duration-300 ${
                        activeIndex === i ? "text-fg" : "text-fg/55"
                      }`}
                    >
                      {feature.title}
                    </h3>
                    {activeIndex === i && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        transition={{ duration: 0.3 }}
                        className="text-[14px] leading-[1.65] text-fg/40"
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
          <div className="rounded-xl border border-fg/[0.08] bg-surface-1/50 p-6 h-full min-h-[380px] flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-brand/10 flex items-center justify-center mx-auto mb-4">
                <div className="text-brand-light">{FEATURES[activeIndex].icon}</div>
              </div>
              <p className="text-[22px] font-serif font-semibold text-fg/80 mb-2">
                {FEATURES[activeIndex].title}
              </p>
              <p className="text-[14px] text-fg/35 max-w-[280px] mx-auto leading-relaxed">
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
    description: "Google Doc or public GitHub repo. That's it. No setup, no integrations, no waiting.",
  },
  {
    number: "02",
    title: "We analyze everything",
    description: "Diffs, commits, revisions — all parsed and recency-weighted. Takes about 30 seconds.",
  },
  {
    number: "03",
    title: "See the truth",
    description: "Every contributor ranked with a Fair Share Score. Share the results with one click.",
  },
];

function HowItWorks() {
  return (
    <section id="how" className="py-section mx-auto max-w-container px-6 sm:px-10">
      <FadeIn>
        <div className="text-center mb-16">
          <h2 className="font-serif text-[clamp(32px,5vw,52px)] font-bold leading-[1.1] tracking-[-0.02em] text-fg mb-4">
            How it works
          </h2>
          <p className="text-[17px] text-fg/40 max-w-[440px] mx-auto leading-relaxed">
            Three steps. Thirty seconds. The truth about your team.
          </p>
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {HOW_STEPS.map((step, i) => (
          <FadeIn key={step.number} delay={i * 0.1}>
            <div className="rounded-xl border border-fg/[0.07] bg-fg/[0.02] p-7 h-full">
              <div className="font-mono text-[12px] font-semibold tracking-[0.1em] text-brand-light mb-6">
                [ {step.number} ]
              </div>
              <h3 className="text-[18px] font-semibold tracking-[-0.015em] text-fg mb-3 leading-tight">
                {step.title}
              </h3>
              <p className="text-[14px] leading-[1.7] text-fg/40">
                {step.description}
              </p>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}

/* ─── Testimonial ─── */

function Testimonial() {
  return (
    <section className="py-section mx-auto max-w-container-xs px-6 sm:px-10">
      <FadeIn>
        <div className="flex flex-col items-start">
          <div className="w-[52px] h-[52px] rounded-full bg-surface-2 border border-fg/[0.08] mb-8 flex items-center justify-center overflow-hidden">
            <span className="text-[18px] font-bold text-fg/30">J</span>
          </div>

          <blockquote className="font-serif text-[clamp(22px,3.5vw,32px)] font-medium leading-[1.4] tracking-[-0.01em] text-fg/85 mb-8">
            &ldquo;We had a group member who claimed they did everything. Glasswork ran the numbers and it turned out they contributed 12%. The professor saw the report and adjusted grades. This tool is brutal and I love it.&rdquo;
          </blockquote>

          <div>
            <div className="text-[14px] font-semibold text-fg/70">
              Jason Park
            </div>
            <div className="text-[13px] text-fg/35">
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
    <section className="py-section mx-auto max-w-container px-6 sm:px-10">
      <FadeIn>
        <div className="text-center mb-14">
          <h2 className="font-serif text-[clamp(32px,5vw,52px)] font-bold leading-[1.1] tracking-[-0.02em] text-fg mb-4">
            Works with your stack
          </h2>
          <p className="text-[17px] text-fg/40 max-w-[460px] mx-auto leading-relaxed">
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
              className="flex items-center gap-2.5 px-5 py-3 rounded-xl border border-fg/[0.06] bg-fg/[0.02] hover:border-fg/[0.12] hover:bg-fg/[0.04] transition-all"
            >
              <span className="text-[20px]">{tool.icon}</span>
              <span className="text-[14px] font-medium text-fg/55">{tool.name}</span>
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
              className="rounded-xl border border-fg/[0.06] bg-fg/[0.02] p-5 text-center"
            >
              <div className="text-[28px] font-bold tracking-[-0.03em] text-fg mb-1 tabular-nums">
                {stat.value}
              </div>
              <div className="text-[13px] font-semibold text-fg/50 mb-1">
                {stat.label}
              </div>
              <div className="text-[12px] text-fg/30">
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
    <section className="py-section mx-auto max-w-container px-6 sm:px-10">
      <FadeIn>
        <h2 className="font-serif text-[clamp(32px,5vw,52px)] font-bold leading-[1.1] tracking-[-0.02em] text-fg mb-4">
          Built to be trusted
        </h2>
        <p className="text-[17px] text-fg/40 max-w-[500px] mb-14 leading-relaxed">
          Enterprise-grade analysis with the simplicity of pasting a link.
        </p>
      </FadeIn>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Speed */}
        <FadeIn delay={0}>
          <div className="rounded-xl border border-fg/[0.07] bg-fg/[0.02] p-6 h-full">
            <h3 className="text-[16px] font-semibold text-fg mb-2">Speed</h3>
            <p className="text-[14px] text-fg/35 leading-relaxed mb-6">
              Results in 30 seconds. Not minutes, not hours.
            </p>
            <div className="flex items-center gap-3">
              <div className="h-[44px] w-[44px] rounded-lg bg-fg/[0.04] border border-fg/[0.06] flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-fg/40">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <span className="font-mono text-[13px] text-fg/25">~30s average</span>
            </div>
          </div>
        </FadeIn>

        {/* Accuracy */}
        <FadeIn delay={0.08}>
          <div className="rounded-xl border border-fg/[0.07] bg-fg/[0.02] p-6 h-full">
            <h3 className="text-[16px] font-semibold text-fg mb-2">Accuracy</h3>
            <p className="text-[14px] text-fg/35 leading-relaxed mb-6">
              Revision-level analysis. Every edit, every commit, weighted fairly.
            </p>
            <div className="flex items-center gap-2">
              {[85, 65, 95, 45, 75].map((h, i) => (
                <div
                  key={i}
                  className="w-3 rounded-sm bg-brand/30"
                  style={{ height: `${h * 0.4}px` }}
                />
              ))}
            </div>
          </div>
        </FadeIn>

        {/* Security */}
        <FadeIn delay={0.16}>
          <div className="rounded-xl border border-fg/[0.07] bg-fg/[0.02] p-6 h-full">
            <h3 className="text-[16px] font-semibold text-fg mb-2">Security</h3>
            <p className="text-[14px] text-fg/35 leading-relaxed mb-6">
              Your data is encrypted in transit and at rest. We never store documents.
            </p>
            <div className="flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-solid">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span className="text-[12px] font-medium text-fg/30">Encrypted & ephemeral</span>
            </div>
          </div>
        </FadeIn>

        {/* Privacy */}
        <FadeIn delay={0.08}>
          <div className="rounded-xl border border-fg/[0.07] bg-fg/[0.02] p-6 h-full">
            <h3 className="text-[16px] font-semibold text-fg mb-2">Privacy</h3>
            <p className="text-[14px] text-fg/35 leading-relaxed">
              Read-only access. We analyze metadata and diffs — never store your content.
            </p>
          </div>
        </FadeIn>

        {/* Shareable */}
        <FadeIn delay={0.16}>
          <div className="rounded-xl border border-fg/[0.07] bg-fg/[0.02] p-6 h-full">
            <h3 className="text-[16px] font-semibold text-fg mb-2">Shareable</h3>
            <p className="text-[14px] text-fg/35 leading-relaxed">
              One-click share links. Send results to professors, managers, or teammates.
            </p>
          </div>
        </FadeIn>

        {/* Mobile */}
        <FadeIn delay={0.24}>
          <div className="rounded-xl border border-fg/[0.07] bg-fg/[0.02] p-6 h-full">
            <h3 className="text-[16px] font-semibold text-fg mb-2">Works everywhere</h3>
            <p className="text-[14px] text-fg/35 leading-relaxed">
              Desktop, tablet, phone. Check results anywhere, anytime.
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ─── Founder Section ─── */

function FounderSection() {
  return (
    <section className="py-section mx-auto max-w-container-xs px-6 sm:px-10">
      <FadeIn>
        <div className="space-y-8">
          <p className="font-serif text-[clamp(20px,3vw,28px)] leading-[1.55] text-fg/80">
            I built Glasswork because I was tired of{" "}
            <span className="text-fg underline decoration-fg/20 underline-offset-4">
              carrying group projects
            </span>{" "}
            and having no way to prove it.
          </p>

          <p className="font-serif text-[clamp(20px,3vw,28px)] leading-[1.55] text-fg/80">
            Glasswork is{" "}
            <span className="text-fg underline decoration-fg/20 underline-offset-4">
              one tool
            </span>{" "}
            that analyzes your docs and repos — and gives every contributor a score that speaks for itself.
          </p>

          <p className="font-serif text-[clamp(20px,3vw,28px)] leading-[1.55] text-fg/80">
            I&apos;m building for{" "}
            <span className="text-fg underline decoration-fg/20 underline-offset-4">
              students, TAs, and teams
            </span>{" "}
            who care about fairness and want the truth — without the awkward confrontation.
          </p>

          {/* Signature */}
          <div className="pt-4">
            <div className="font-hand text-[36px] text-fg/50 mb-3">
              Pranav
            </div>
            <div className="flex items-center gap-3">
              <div className="w-[40px] h-[40px] rounded-full bg-brand/15 flex items-center justify-center text-[14px] font-bold text-brand-light">
                P
              </div>
              <div>
                <div className="text-[14px] font-semibold text-fg/70">
                  Pranav
                </div>
                <div className="text-[13px] text-fg/35">
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
    <section className="py-section mx-auto max-w-container px-6 sm:px-10">
      <FadeIn>
        <div className="rounded-2xl border border-fg/[0.08] bg-fg/[0.02] p-10 sm:p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand/[0.06] via-transparent to-solid/[0.04] pointer-events-none" />
          <div className="relative z-10">
            <h2 className="font-serif text-[clamp(36px,6vw,64px)] font-bold leading-[1.08] tracking-[-0.02em] text-fg mb-4">
              The truth.
              <br />
              <span className="italic text-fg/50">In 30 seconds.</span>
            </h2>
            <p className="text-[17px] text-fg/40 max-w-[420px] mx-auto mb-10 leading-relaxed">
              Paste any link. See who actually contributed.
              No sign-up required to start.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => signIn("google", { redirectTo: "/app" })}
                className="h-[48px] px-8 rounded-[10px] bg-fg text-bg text-[14px] font-semibold hover:bg-fg/90 active:scale-[0.97] transition-all"
              >
                Get started free
              </button>
              <a
                href="#how"
                className="h-[48px] px-8 rounded-[10px] border border-fg/12 text-fg/55 text-[14px] font-medium hover:border-fg/20 hover:text-fg/75 transition-all flex items-center"
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
    <footer className="py-12 mx-auto max-w-container px-6 sm:px-10">
      <div className="border-t border-fg/[0.06] pt-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-[18px] h-[18px] rounded-full bg-fg flex items-center justify-center">
                <div className="w-[6px] h-[6px] rounded-full bg-bg" />
              </div>
              <span className="text-[14px] font-semibold tracking-[-0.02em] text-fg/70">
                glasswork
              </span>
            </div>
            <p className="text-[13px] text-fg/30">
              Contributor analytics for group projects and teams.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="/privacy"
              className="text-[13px] text-fg/30 hover:text-fg/55 transition-colors"
            >
              Privacy
            </a>
            <a
              href="mailto:support@glasswork.app"
              className="text-[13px] text-fg/30 hover:text-fg/55 transition-colors"
            >
              Contact
            </a>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-fg/[0.04]">
          <p className="text-[12px] text-fg/20">
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
    <div className="relative min-h-screen bg-bg">
      <Nav />
      <Hero />
      <div className="section-divider" />
      <TrustStrip />
      <div className="section-divider" />
      <FeatureShowcase />
      <div className="section-divider" />
      <HowItWorks />
      <div className="section-divider" />
      <Testimonial />
      <div className="section-divider" />
      <Integrations />
      <div className="section-divider" />
      <BentoGrid />
      <div className="section-divider" />
      <FounderSection />
      <div className="section-divider" />
      <BottomCTA />
      <Footer />
    </div>
  );
}
