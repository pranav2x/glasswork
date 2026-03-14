"use client";

import { useState, useEffect } from "react";
import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { TierBadge } from "@/components/TierBadge";
import type { ContributorTier } from "@/lib/types";

/* ─── Hero Input ─── */

function LandingHeroInput() {
  const router = useRouter();
  const [value, setValue] = useState("");

  function handleSubmit() {
    if (!value.trim()) return;
    router.push(`/app?prefill=${encodeURIComponent(value.trim())}`);
  }

  return (
    <div style={{ display: "flex", gap: "8px", maxWidth: "440px" }}>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        placeholder="Paste a Google Doc or GitHub link..."
        style={{
          flex: 1,
          height: "44px",
          padding: "0 14px",
          borderRadius: "10px",
          border: "1px solid rgba(255, 255, 255, 0.10)",
          background: "rgba(255, 255, 255, 0.04)",
          color: "#F4F4F6",
          fontSize: "13px",
          fontWeight: 400,
          letterSpacing: "0.005em",
          outline: "none",
          transition: "border-color 0.15s, background 0.15s",
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "rgba(139, 124, 246, 0.45)";
          e.target.style.background = "rgba(255, 255, 255, 0.06)";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "rgba(255, 255, 255, 0.10)";
          e.target.style.background = "rgba(255, 255, 255, 0.04)";
        }}
      />
      <button
        onClick={handleSubmit}
        style={{
          height: "44px",
          padding: "0 20px",
          borderRadius: "10px",
          border: "none",
          background: "#6D63D4",
          color: "#FFFFFF",
          fontSize: "13px",
          fontWeight: 600,
          letterSpacing: "-0.01em",
          cursor: "pointer",
          whiteSpace: "nowrap",
          transition: "background 0.15s, transform 0.1s",
          flexShrink: 0,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#7B72E0")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "#6D63D4")}
        onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
        onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        Expose it →
      </button>
    </div>
  );
}

/* ─── Hero Preview Cards ─── */

const HERO_DEMO_CONTRIBUTORS = [
  {
    name: "Pranav",
    avatarInitials: "P",
    avatarUrl: null,
    score: 189,
    tier: "carry" as const,
    rank: 1,
  },
  {
    name: "Aaryan Verma",
    avatarUrl: "/animepfp.jpeg",
    avatarInitials: "AV",
    score: 158,
    tier: "carry" as const,
    rank: 2,
  },
  {
    name: "Rohan Bedi",
    avatarUrl: "/catpj.jpeg",
    avatarInitials: "RB",
    score: 68,
    tier: "ghost" as const,
    rank: 3,
  },
];

const HERO_TIER_STYLE: Record<
  ContributorTier,
  { scoreColor: string; cardTopBorder: string; cardBg: string }
> = {
  carry: {
    scoreColor: "#A89FFF",
    cardTopBorder: "rgba(139, 124, 246, 0.35)",
    cardBg: "rgba(139, 124, 246, 0.04)",
  },
  ghost: {
    scoreColor: "#F87171",
    cardTopBorder: "rgba(240, 108, 108, 0.30)",
    cardBg: "rgba(240, 108, 108, 0.03)",
  },
  solid: {
    scoreColor: "#4ECCA3",
    cardTopBorder: "rgba(52, 198, 140, 0.30)",
    cardBg: "rgba(52, 198, 140, 0.03)",
  },
};

function HeroPreviewCards() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        transform: "perspective(1000px) rotateY(-3deg) rotateX(1deg)",
        transformOrigin: "center center",
      }}
    >
      {HERO_DEMO_CONTRIBUTORS.map((contributor, i) => {
        const tierStyle = HERO_TIER_STYLE[contributor.tier];
        return (
          <div
            key={contributor.name}
            style={{
              background: tierStyle.cardBg,
              border: "1px solid rgba(255, 255, 255, 0.07)",
              borderTop: `1px solid ${tierStyle.cardTopBorder}`,
              borderRadius: "14px",
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
              animation: `fadeUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) ${i * 0.08}s both`,
              boxShadow:
                "0 1px 0 rgba(255,255,255,0.06) inset, 0 8px 24px rgba(0,0,0,0.25)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "rgba(244, 244, 246, 0.25)",
                  minWidth: "16px",
                  letterSpacing: "0.02em",
                }}
              >
                #{contributor.rank}
              </span>

              <div
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "50%",
                  overflow: "hidden",
                  flexShrink: 0,
                  background: "rgba(139, 124, 246, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#A89FFF",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                {contributor.avatarUrl ? (
                  <img
                    src={contributor.avatarUrl}
                    alt={contributor.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  contributor.avatarInitials.slice(0, 1)
                )}
              </div>

              <span
                style={{
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#E8E8EE",
                  letterSpacing: "-0.01em",
                }}
              >
                {contributor.name}
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span
                style={{
                  fontSize: "26px",
                  fontWeight: 700,
                  letterSpacing: "-0.03em",
                  color: tierStyle.scoreColor,
                  fontVariantNumeric: "tabular-nums",
                  lineHeight: 1,
                }}
              >
                {contributor.score}
              </span>

              <TierBadge tier={contributor.tier} size="sm" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── How Steps ─── */

const HOW_STEPS = [
  {
    number: "01",
    title: "Paste a link",
    body: "Google Doc or public GitHub repo. Nothing else required.",
  },
  {
    number: "02",
    title: "We analyze it",
    body: "Diffs, commits, revisions \u2014 all recency-weighted. Takes 30 seconds.",
  },
  {
    number: "03",
    title: "See the truth",
    body: "Every contributor ranked. No fluff. No hiding. Share the results.",
  },
];

/* ─── Preview Contributors ─── */

const PREVIEW_CONTRIBUTORS = [
  { name: "Pranav", initials: "P", avatarUrl: null, score: 189, tier: "carry" as const },
  { name: "Aaryan Verma", initials: "AV", avatarUrl: "/animepfp.jpeg", score: 158, tier: "carry" as const },
  { name: "Rohan Bedi", initials: "RB", avatarUrl: "/catpj.jpeg", score: 68, tier: "ghost" as const },
];

/* ─── Trust Strip Schools ─── */

const TRUST_SCHOOLS = [
  "MIT", "Stanford", "UC Berkeley", "Harvard", "Princeton",
  "YC", "Georgia Tech", "Carnegie Mellon", "Caltech", "Columbia",
  "MIT", "Stanford", "UC Berkeley", "Harvard", "Princeton",
  "YC", "Georgia Tech", "Carnegie Mellon", "Caltech", "Columbia",
];

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
    <div className="relative min-h-screen">
      {/* ── Nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 sm:px-8">
        <a href="/" className="flex items-center gap-2">
          <span className="relative flex h-[7px] w-[7px]">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-[7px] w-[7px] rounded-full bg-emerald-500" />
          </span>
          <span
            style={{
              fontSize: "15px",
              fontWeight: 600,
              letterSpacing: "-0.02em",
              color: "#F4F4F6",
            }}
          >
            glass<span style={{ color: "#8B7CF6" }}>work</span>
          </span>
        </a>

        <button
          onClick={() => signIn("google", { redirectTo: "/app" })}
          className="flex items-center gap-1.5 rounded-lg border border-white/[0.10] bg-white/[0.04] px-4 py-2 text-[13px] font-medium text-white/70 transition-all duration-150 hover:border-white/[0.18] hover:bg-white/[0.07] hover:text-white/90 active:scale-[0.97]"
        >
          Sign in
        </button>
      </nav>

      {/* ── Hero ── */}
      <section
        id="hero"
        style={{ paddingTop: "120px", paddingBottom: "80px" }}
        className="relative mx-auto max-w-[1200px] px-6 sm:px-8"
      >
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <div
              className="mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1"
              style={{
                background: "rgba(139, 124, 246, 0.06)",
                borderColor: "rgba(139, 124, 246, 0.18)",
              }}
            >
              <span
                className="h-[5px] w-[5px] rounded-full"
                style={{ backgroundColor: "#8B7CF6" }}
              />
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#A89FFF",
                }}
              >
                Contributor Analytics
              </span>
            </div>

            <h1
              style={{
                fontSize: "clamp(38px, 5vw, 58px)",
                fontWeight: 600,
                lineHeight: 1.08,
                letterSpacing: "-0.025em",
                color: "#F4F4F6",
                marginBottom: "20px",
              }}
            >
              Find out who
              <br />
              actually did
              <br />
              <span style={{ color: "#8B7CF6" }}>the work.</span>
            </h1>

            <p
              style={{
                fontSize: "17px",
                fontWeight: 400,
                lineHeight: 1.6,
                color: "rgba(244, 244, 246, 0.50)",
                maxWidth: "420px",
                marginBottom: "32px",
                letterSpacing: "0.005em",
              }}
            >
              Paste a Google Doc or GitHub repo.
              <br />
              Glasswork scores every contributor in 30 seconds.
            </p>

            <LandingHeroInput />

            <a
              href="#preview"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                marginTop: "16px",
                fontSize: "12px",
                fontWeight: 500,
                color: "rgba(244, 244, 246, 0.35)",
                textDecoration: "none",
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "rgba(244, 244, 246, 0.65)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "rgba(244, 244, 246, 0.35)")
              }
            >
              See a live example
              <span style={{ fontSize: "10px" }}>→</span>
            </a>
          </div>

          <div className="hidden lg:block">
            <HeroPreviewCards />
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ── Trust Strip ── */}
      <section
        id="trust"
        style={{ padding: "48px 0 40px" }}
        className="overflow-hidden"
      >
        <p
          style={{
            textAlign: "center",
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "rgba(244, 244, 246, 0.25)",
            marginBottom: "20px",
          }}
        >
          Trusted by students and teams at
        </p>

        <div className="relative">
          <div
            className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 z-10"
            style={{ background: "linear-gradient(to right, #09090E, transparent)" }}
          />
          <div
            className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 z-10"
            style={{ background: "linear-gradient(to left, #09090E, transparent)" }}
          />

          <div
            className="flex animate-scroll-left gap-12 whitespace-nowrap"
            style={{ width: "max-content" }}
          >
            {TRUST_SCHOOLS.map((name, i) => (
              <span
                key={i}
                style={{
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "rgba(244, 244, 246, 0.22)",
                  letterSpacing: "-0.01em",
                }}
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ── How it works ── */}
      <section
        id="how"
        style={{ padding: "80px 0" }}
        className="mx-auto max-w-[1200px] px-6 sm:px-8"
      >
        <div style={{ textAlign: "center", marginBottom: "52px" }}>
          <h2
            style={{
              fontSize: "clamp(28px, 3.5vw, 40px)",
              fontWeight: 600,
              letterSpacing: "-0.02em",
              color: "#F4F4F6",
              lineHeight: 1.15,
            }}
          >
            How it works
          </h2>
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-3"
          style={{ gap: "12px" }}
        >
          {HOW_STEPS.map((step) => (
            <div
              key={step.number}
              style={{
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px solid rgba(255, 255, 255, 0.06)",
                borderRadius: "16px",
                padding: "28px 24px",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  color: "#6D63D4",
                  textTransform: "uppercase",
                  marginBottom: "20px",
                }}
              >
                {step.number}
              </div>

              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: 600,
                  letterSpacing: "-0.015em",
                  color: "#F4F4F6",
                  marginBottom: "10px",
                  lineHeight: 1.3,
                }}
              >
                {step.title}
              </h3>

              <p
                style={{
                  fontSize: "14px",
                  fontWeight: 400,
                  lineHeight: 1.6,
                  color: "rgba(244, 244, 246, 0.45)",
                  letterSpacing: "0.005em",
                }}
              >
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="section-divider" />

      {/* ── What you get ── */}
      <section
        id="preview"
        style={{ padding: "80px 0" }}
        className="mx-auto max-w-[1200px] px-6 sm:px-8"
      >
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <h2
            style={{
              fontSize: "clamp(28px, 3.5vw, 40px)",
              fontWeight: 600,
              letterSpacing: "-0.02em",
              color: "#F4F4F6",
              lineHeight: 1.15,
              marginBottom: "12px",
            }}
          >
            What you get
          </h2>
          <p
            style={{
              fontSize: "16px",
              fontWeight: 400,
              color: "rgba(244, 244, 246, 0.40)",
              letterSpacing: "0.005em",
            }}
          >
            Every contributor scored, ranked, and exposed. In seconds.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "12px",
            maxWidth: "900px",
            margin: "0 auto",
          }}
        >
          {PREVIEW_CONTRIBUTORS.map((c) => {
            const tierStyle = HERO_TIER_STYLE[c.tier];
            return (
              <div
                key={c.name}
                style={{
                  background: tierStyle.cardBg,
                  border: "1px solid rgba(255, 255, 255, 0.07)",
                  borderTop: `1px solid ${tierStyle.cardTopBorder}`,
                  borderRadius: "14px",
                  padding: "20px",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "16px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        overflow: "hidden",
                        background: "rgba(139, 124, 246, 0.12)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "#A89FFF",
                        flexShrink: 0,
                      }}
                    >
                      {c.avatarUrl ? (
                        <img
                          src={c.avatarUrl}
                          alt={c.name}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        c.initials.slice(0, 1)
                      )}
                    </div>
                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: 500,
                        color: "#E8E8EE",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {c.name}
                    </span>
                  </div>
                  <TierBadge tier={c.tier} size="sm" />
                </div>

                <div
                  style={{
                    fontSize: "52px",
                    fontWeight: 700,
                    letterSpacing: "-0.03em",
                    color: tierStyle.scoreColor,
                    lineHeight: 1,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {c.score}
                </div>
                <div
                  style={{
                    marginTop: "4px",
                    fontSize: "11px",
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "rgba(244, 244, 246, 0.30)",
                  }}
                >
                  Fair Share Score
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="section-divider" />

      {/* ── CTA ── */}
      <section
        id="cta"
        style={{ padding: "80px 0 120px" }}
        className="mx-auto max-w-[700px] px-6 text-center sm:px-8"
      >
        <h2
          style={{
            fontSize: "clamp(28px, 4vw, 44px)",
            fontWeight: 600,
            letterSpacing: "-0.02em",
            color: "#F4F4F6",
            lineHeight: 1.15,
            marginBottom: "16px",
          }}
        >
          Your group project deserves the truth.
        </h2>
        <p
          style={{
            fontSize: "16px",
            color: "rgba(244, 244, 246, 0.40)",
            marginBottom: "32px",
            lineHeight: 1.6,
          }}
        >
          Paste any link. Find out in 30 seconds.
        </p>
        <button
          onClick={() => signIn("google", { redirectTo: "/app" })}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            height: "46px",
            padding: "0 28px",
            borderRadius: "11px",
            background: "#6D63D4",
            color: "#FFFFFF",
            fontSize: "14px",
            fontWeight: 600,
            letterSpacing: "-0.01em",
            textDecoration: "none",
            border: "none",
            cursor: "pointer",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#7B72E0")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#6D63D4")}
        >
          Start for free →
        </button>
      </section>

      {/* ── Footer ── */}
      <footer
        style={{
          borderTop: "1px solid rgba(255, 255, 255, 0.05)",
          padding: "24px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <span
          style={{
            fontSize: "12px",
            color: "rgba(244, 244, 246, 0.25)",
            letterSpacing: "0.01em",
          }}
        >
          © 2025 Glasswork · Built by a 16yo in New York
        </span>
        <a
          href="/privacy"
          style={{
            fontSize: "12px",
            color: "rgba(244, 244, 246, 0.25)",
            textDecoration: "none",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.color = "rgba(244, 244, 246, 0.55)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = "rgba(244, 244, 246, 0.25)")
          }
        >
          Privacy
        </a>
      </footer>
    </div>
  );
}
