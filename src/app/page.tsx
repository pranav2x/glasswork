"use client";

import { useState, useEffect } from "react";
import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { TierBadge } from "@/components/TierBadge";
import type { ContributorTier } from "@/lib/types";
import { Moon, Sun } from "lucide-react";

/* ─── Demo data ─── */

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

const TIER_CARD_STYLE: Record<
  ContributorTier,
  {
    scoreColor: string;
    borderAccent: string;
    avatarRing: string;
    avatarBg: string;
    avatarText: string;
    scoreColorDark: string;
    borderAccentDark: string;
  }
> = {
  carry: {
    scoreColor: "#6D63D4",
    borderAccent: "#6D63D4",
    avatarRing: "#DDD9F7",
    avatarBg: "#EEF0FF",
    avatarText: "#6D63D4",
    scoreColorDark: "#A89FFF",
    borderAccentDark: "rgba(139, 124, 246, 0.35)",
  },
  solid: {
    scoreColor: "#16A34A",
    borderAccent: "#16A34A",
    avatarRing: "#BBF7D0",
    avatarBg: "#DCFCE7",
    avatarText: "#16A34A",
    scoreColorDark: "#4ECCA3",
    borderAccentDark: "rgba(52, 198, 140, 0.30)",
  },
  ghost: {
    scoreColor: "#DC2626",
    borderAccent: "#DC2626",
    avatarRing: "#FECACA",
    avatarBg: "#FEF2F2",
    avatarText: "#DC2626",
    scoreColorDark: "#F87171",
    borderAccentDark: "rgba(240, 108, 108, 0.30)",
  },
};

const TRUST_SCHOOLS = [
  "MIT", "Stanford", "UC Berkeley", "Harvard", "Princeton",
  "Carnegie Mellon", "Georgia Tech", "Caltech", "Columbia", "Cornell",
  "MIT", "Stanford", "UC Berkeley", "Harvard", "Princeton",
  "Carnegie Mellon", "Georgia Tech", "Caltech", "Columbia", "Cornell",
];

const HOW_STEPS = [
  {
    number: "01",
    title: "Paste a link",
    body: "Google Doc or public GitHub repo. Nothing else. No install, no sign-up for your teammates, no BS.",
  },
  {
    number: "02",
    title: "We analyze it",
    body: "Every revision, every commit, every edit — weighted by recency. Not self-reported. From the actual work.",
  },
  {
    number: "03",
    title: "See who carried",
    body: "Every contributor scored: LOCKED IN, MID, or SELLING. Share it, screenshot it, send it to your professor.",
  },
];

/* ─── Theme Toggle ─── */

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="h-8 w-8" />;
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E5E5] bg-white text-[#6B7280] transition-all hover:border-[#D1D5DB] hover:text-[#111111] dark:border-white/[0.09] dark:bg-white/[0.04] dark:text-white/50 dark:hover:border-white/[0.18] dark:hover:text-white/80"
      aria-label="Toggle theme"
    >
      <Sun className="h-4 w-4 dark:hidden" strokeWidth={1.5} />
      <Moon className="hidden h-4 w-4 dark:block" strokeWidth={1.5} />
    </button>
  );
}

/* ─── Hero Input ─── */

function LandingHeroInput() {
  const router = useRouter();
  const [value, setValue] = useState("");

  function handleSubmit() {
    if (!value.trim()) return;
    router.push(`/app?prefill=${encodeURIComponent(value.trim())}`);
  }

  return (
    <div className="flex gap-2 w-full max-w-[480px]">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        placeholder="Paste a Google Doc or GitHub link..."
        className="flex-1 h-11 px-3.5 rounded-xl text-[13px] font-normal border border-[#E5E5E5] bg-white text-[#111111] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#6D63D4] focus:ring-2 focus:ring-[#6D63D4]/10 transition-all duration-150 dark:border-white/[0.10] dark:bg-white/[0.04] dark:text-[#F4F4F6] dark:placeholder:text-white/30 dark:focus:border-[#6D63D4]/50 dark:focus:ring-[#6D63D4]/15"
      />
      <button
        onClick={handleSubmit}
        className="h-11 px-5 rounded-xl text-[13px] font-semibold text-white bg-[#6D63D4] hover:bg-[#7B72E0] active:scale-[0.97] transition-all duration-150 whitespace-nowrap flex-shrink-0 border border-[#6D63D4]"
      >
        Expose it →
      </button>
    </div>
  );
}

/* ─── Hero Card ─── */

function HeroCard({
  contributor,
  index,
}: {
  contributor: (typeof DEMO_CONTRIBUTORS)[0];
  index: number;
}) {
  const style = TIER_CARD_STYLE[contributor.tier];

  return (
    <div
      className="flex items-center justify-between rounded-[14px] border border-[#E5E5E5] bg-white shadow-card-light dark:bg-white/[0.03] dark:border-white/[0.07] dark:shadow-none"
      style={{
        borderTop: `2px solid ${style.borderAccent}`,
        padding: "16px 18px",
        animation: `fadeUp 0.45s cubic-bezier(0.22,1,0.36,1) ${index * 0.07}s both`,
      }}
    >
      <div className="flex items-center gap-2.5">
        <span className="text-[11px] font-semibold text-[#9CA3AF] min-w-[18px] tracking-[0.02em]">
          #{contributor.rank}
        </span>

        <div
          className="flex-shrink-0 rounded-full overflow-hidden flex items-center justify-center"
          style={{
            width: "36px",
            height: "36px",
            background: style.avatarBg,
            fontSize: "12px",
            fontWeight: 700,
            color: style.avatarText,
            border: `2px solid ${style.avatarRing}`,
          }}
        >
          {contributor.avatarUrl ? (
            <img
              src={contributor.avatarUrl}
              alt={contributor.name}
              className="w-full h-full object-cover"
            />
          ) : (
            contributor.initials.slice(0, 1)
          )}
        </div>

        <div>
          <p className="text-[14px] font-semibold tracking-[-0.01em] leading-[1.2] text-[#111111] dark:text-[#F4F4F6]">
            {contributor.name}
          </p>
          <p className="text-[11px] text-[#9CA3AF] mt-[1px]">
            {contributor.label}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <span
          className="text-[28px] font-extrabold tracking-[-0.03em] leading-none"
          style={{ color: style.scoreColor, fontVariantNumeric: "tabular-nums" }}
        >
          {contributor.score}
        </span>
        <TierBadge tier={contributor.tier} size="sm" theme="light" />
      </div>
    </div>
  );
}

/* ─── Landing Page ─── */

export default function LandingPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signIn } = useAuthActions();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/app");
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="min-h-screen bg-[#F5F5F5] dark:bg-[#09090E] transition-colors duration-200">

      {/* ─── NAV ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3.5 sm:px-8 border-b border-[#E5E5E5] bg-[#F5F5F5]/90 backdrop-blur-md dark:border-white/[0.06] dark:bg-[#09090E]/90 transition-colors duration-200">
        <a href="/" className="flex items-center gap-2">
          <span className="relative flex h-[7px] w-[7px]">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-[7px] w-[7px] rounded-full bg-emerald-500" />
          </span>
          <span className="text-[15px] font-semibold tracking-[-0.02em] text-[#111111] dark:text-[#F4F4F6]">
            glass<span className="text-[#6D63D4]">work</span>
          </span>
        </a>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => signIn("google", { redirectTo: "/app" })}
            className="h-8 px-4 rounded-lg text-[13px] font-semibold text-white bg-[#6D63D4] hover:bg-[#7B72E0] active:scale-[0.97] transition-all duration-150 inline-flex items-center"
          >
            Sign in
          </button>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section
        className="mx-auto max-w-[1180px] px-6 sm:px-8"
        style={{ paddingTop: "120px", paddingBottom: "80px" }}
      >
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <div>
            <div
              className="mb-6 inline-flex items-center gap-2 rounded-full px-3 py-1 border"
              style={{ background: "rgba(109,99,212,0.06)", borderColor: "rgba(109,99,212,0.18)" }}
            >
              <span className="h-[5px] w-[5px] rounded-full bg-[#6D63D4]" />
              <span className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[#6D63D4]">
                Know who actually carried
              </span>
            </div>

            <h1 className="text-[#111111] dark:text-[#F4F4F6]" style={{ fontSize: "clamp(38px, 5vw, 60px)", fontWeight: 700, lineHeight: 1.08, letterSpacing: "-0.025em", marginBottom: "20px" }}>
              Find out who
              <br />
              actually did
              <br />
              <span className="text-[#6D63D4]">the work.</span>
            </h1>

            <p className="text-[#6B7280] dark:text-[#8888A8]" style={{ fontSize: "17px", fontWeight: 400, lineHeight: 1.6, marginBottom: "32px", maxWidth: "420px" }}>
              Paste a Google Doc or GitHub repo.
              <br />
              Get every contributor ranked in 30 seconds.
              <br />
              No surveys. No guessing. Just the data.
            </p>

            <LandingHeroInput />

            <a
              href="#preview"
              className="text-[#9CA3AF] hover:text-[#6B7280] dark:text-white/25 dark:hover:text-white/50 inline-flex items-center gap-1 mt-3.5 text-[12px] font-medium no-underline transition-colors duration-150"
            >
              See a live example →
            </a>
          </div>

          <div className="hidden lg:flex flex-col gap-3">
            {DEMO_CONTRIBUTORS.map((c, i) => (
              <HeroCard key={c.name} contributor={c} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── DIVIDER ─── */}
      <div className="h-px mx-auto max-w-[900px] bg-[#E5E5E5] dark:bg-white/[0.06]" />

      {/* ─── TRUST STRIP ─── */}
      <section className="overflow-hidden" style={{ padding: "44px 0 40px" }}>
        <p className="text-center text-[11px] font-semibold tracking-[0.1em] uppercase mb-5 text-[#9CA3AF] dark:text-white/25">
          Used by students at
        </p>
        <div className="relative">
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-[#F5F5F5] to-transparent dark:from-[#09090E]" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-[#F5F5F5] to-transparent dark:from-[#09090E]" />
          <div className="flex animate-scroll-left gap-12 whitespace-nowrap" style={{ width: "max-content" }}>
            {TRUST_SCHOOLS.map((name, i) => (
              <span key={i} className="text-[14px] font-medium tracking-[-0.01em] text-[#9CA3AF] dark:text-white/22">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── DIVIDER ─── */}
      <div className="h-px mx-auto max-w-[900px] bg-[#E5E5E5] dark:bg-white/[0.06]" />

      {/* ─── HOW IT WORKS ─── */}
      <section className="mx-auto max-w-[1180px] px-6 sm:px-8" style={{ padding: "80px 24px" }}>
        <div className="text-center mb-[52px]">
          <h2 className="text-[#111111] dark:text-[#F4F4F6]" style={{ fontSize: "clamp(26px, 3.5vw, 38px)", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.15 }}>
            How it works
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {HOW_STEPS.map((step) => (
            <div
              key={step.number}
              className="rounded-[14px] border border-[#E5E5E5] bg-white p-7 shadow-[0_1px_3px_rgba(0,0,0,0.05)] dark:bg-white/[0.02] dark:border-white/[0.06] dark:shadow-none transition-colors duration-200"
            >
              <div className="text-[11px] font-bold tracking-[0.1em] uppercase mb-5 text-[#6D63D4]">
                {step.number}
              </div>
              <h3 className="text-[18px] font-semibold tracking-[-0.015em] mb-2.5 leading-[1.3] text-[#111111] dark:text-[#F4F4F6]">
                {step.title}
              </h3>
              <p className="text-[14px] font-normal leading-[1.6] text-[#6B7280] dark:text-[#8888A8]">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── DIVIDER ─── */}
      <div className="h-px mx-auto max-w-[900px] bg-[#E5E5E5] dark:bg-white/[0.06]" />

      {/* ─── WHAT YOU GET ─── */}
      <section id="preview" className="mx-auto max-w-[1180px] px-6 sm:px-8" style={{ padding: "80px 24px" }}>
        <div className="text-center mb-12">
          <h2 className="text-[#111111] dark:text-[#F4F4F6] mb-3" style={{ fontSize: "clamp(26px, 3.5vw, 38px)", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.15 }}>
            The receipt your group project deserves
          </h2>
          <p className="text-[16px] font-normal text-[#6B7280] dark:text-[#8888A8]">
            Objective scores. No surveys. No one lying about what they did.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mx-auto max-w-[860px]">
          {DEMO_CONTRIBUTORS.map((c) => {
            const cardStyle = TIER_CARD_STYLE[c.tier];
            return (
              <div
                key={c.name}
                className="rounded-[14px] border border-[#E5E5E5] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:bg-white/[0.02] dark:border-white/[0.06] dark:shadow-none transition-colors duration-200"
                style={{ borderTop: `2px solid ${cardStyle.borderAccent}` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="flex-shrink-0 rounded-full overflow-hidden flex items-center justify-center"
                      style={{
                        width: "38px",
                        height: "38px",
                        background: cardStyle.avatarBg,
                        fontSize: "12px",
                        fontWeight: 700,
                        color: cardStyle.avatarText,
                        border: `2px solid ${cardStyle.avatarRing}`,
                      }}
                    >
                      {c.avatarUrl ? (
                        <img src={c.avatarUrl} alt={c.name} className="w-full h-full object-cover" />
                      ) : c.initials.slice(0, 1)}
                    </div>
                    <span className="text-[14px] font-semibold tracking-[-0.01em] text-[#111111] dark:text-[#F4F4F6]">
                      {c.name}
                    </span>
                  </div>
                  <TierBadge tier={c.tier} size="sm" theme="light" />
                </div>

                <div style={{ fontSize: "56px", fontWeight: 800, letterSpacing: "-0.03em", color: cardStyle.scoreColor, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
                  {c.score}
                </div>
                <div className="mt-1 text-[11px] font-semibold tracking-[0.08em] uppercase text-[#9CA3AF] dark:text-white/30">
                  Fair Share Score
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── DIVIDER ─── */}
      <div className="h-px mx-auto max-w-[900px] bg-[#E5E5E5] dark:bg-white/[0.06]" />

      {/* ─── FINAL CTA ─── */}
      <section className="mx-auto max-w-[660px] px-6 text-center sm:px-8" style={{ padding: "88px 24px 120px" }}>
        <h2 className="text-[#111111] dark:text-[#F4F4F6] mb-3.5" style={{ fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.15 }}>
          Stop guessing who did what.
        </h2>
        <p className="text-[16px] mb-8 leading-[1.6] text-[#6B7280] dark:text-[#8888A8]">
          Paste your Google Doc or GitHub repo. Results in 30 seconds. Free.
        </p>
        <button
          onClick={() => signIn("google", { redirectTo: "/app" })}
          className="inline-flex items-center gap-1.5 h-[46px] px-7 rounded-[11px] bg-[#6D63D4] text-white text-[14px] font-semibold tracking-[-0.01em] border-none cursor-pointer transition-all duration-150 hover:bg-[#7B72E0] active:scale-[0.97]"
        >
          Run your first analysis →
        </button>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-[#E5E5E5] dark:border-white/[0.05] flex items-center justify-between flex-wrap gap-2" style={{ padding: "22px 32px" }}>
        <span className="text-[12px] tracking-[0.01em] text-[#9CA3AF] dark:text-white/25">
          © 2025 Glasswork · Built by a 16-year-old who got burned by one too many group projects.
        </span>
        <a
          href="/privacy"
          className="text-[12px] no-underline transition-colors duration-150 text-[#9CA3AF] hover:text-[#6B7280] dark:text-white/25 dark:hover:text-white/50"
        >
          Privacy
        </a>
      </footer>
    </div>
  );
}
