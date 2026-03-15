"use client";

import { useState, useEffect, useRef } from "react";
import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { motion, useInView } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { TierBadge } from "@/components/TierBadge";

/* ─── Fade-in wrapper ─── */

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
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Demo data ─── */

const DEMO_CONTRIBUTORS = [
  {
    name: "Pranav Rajesh",
    initials: "PR",
    avatarUrl: "/logo.png" as string | null,
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

const TIER_COLORS = {
  carry: {
    score: "#518BDB",
    avatarBg: "rgba(81, 139, 219, 0.10)",
    avatarText: "#518BDB",
    avatarRing: "rgba(81, 139, 219, 0.25)",
    rowBorder: "#518BDB",
  },
  solid: {
    score: "#36BAB8",
    avatarBg: "rgba(54, 186, 184, 0.10)",
    avatarText: "#36BAB8",
    avatarRing: "rgba(54, 186, 184, 0.25)",
    rowBorder: "#36BAB8",
  },
  ghost: {
    score: "#E5A057",
    avatarBg: "rgba(229, 160, 87, 0.10)",
    avatarText: "#E5A057",
    avatarRing: "rgba(229, 160, 87, 0.25)",
    rowBorder: "#E5A057",
  },
};

/* ─── Theme Toggle ─── */

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="flex h-8 w-8 items-center justify-center rounded-lg border transition-all"
      style={{
        borderColor: "var(--card-border)",
        background: "var(--card-bg)",
        color: "var(--page-text-muted)",
      }}
      aria-label="Toggle theme"
    >
      <Sun className="h-[14px] w-[14px] dark:hidden" strokeWidth={1.5} />
      <Moon className="hidden h-[14px] w-[14px] dark:block" strokeWidth={1.5} />
    </button>
  );
}

/* ─── Nav ─── */

function Nav() {
  const { signIn } = useAuthActions();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 sm:px-10 transition-all duration-300"
      style={{
        paddingTop: scrolled ? "10px" : "14px",
        paddingBottom: scrolled ? "10px" : "14px",
        background: scrolled ? "var(--page-bg)" : "transparent",
        borderBottom: scrolled ? "1px solid var(--nav-border)" : "none",
        backdropFilter: scrolled ? "blur(16px)" : "none",
      }}
    >
      {/* Logo */}
      <a href="/" className="flex items-center gap-2 shrink-0">
        <span className="relative flex h-[7px] w-[7px]">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex h-[7px] w-[7px] rounded-full bg-emerald-500" />
        </span>
        <span
          className="text-[17px] tracking-[-0.02em]"
          style={{ color: "var(--page-text)", fontFamily: "var(--font-display)" }}
        >
          glass<span style={{ color: "#518BDB" }}>work</span>
        </span>
      </a>

      {/* Center pill — TRULY centered with absolute positioning */}
      <div
        className="absolute left-1/2 -translate-x-1/2 hidden sm:flex items-center gap-0.5 rounded-full px-1 py-1"
        style={{
          border: "1px solid var(--card-border)",
          background: "var(--card-bg)",
        }}
      >
        {[
          { label: "Features", href: "#features" },
          { label: "How it works", href: "#how" },
          { label: "About", href: "#about" },
        ].map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="px-4 py-1.5 rounded-full text-[13px] font-medium transition-colors"
            style={{
              color: "var(--page-text-muted)",
              fontFamily: "var(--font-body)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "var(--page-text)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "var(--page-text-muted)")
            }
          >
            {link.label}
          </a>
        ))}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2 shrink-0">
        <ThemeToggle />
        <button
          onClick={() => signIn("google", { redirectTo: "/app" })}
          className="hidden sm:block text-[13px] font-medium px-3 py-1.5 transition-colors"
          style={{
            color: "var(--page-text-muted)",
            fontFamily: "var(--font-body)",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.color = "var(--page-text)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = "var(--page-text-muted)")
          }
        >
          Log in
        </button>
        <button
          onClick={() => signIn("google", { redirectTo: "/app" })}
          className="h-8 px-4 rounded-lg text-[13px] font-semibold text-white active:scale-[0.97] transition-all"
          style={{ background: "#518BDB", fontFamily: "var(--font-body)" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "#3D7ACC")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "#518BDB")
          }
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

        {/* Eyebrow badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8"
        >
          <span
            className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5"
            style={{
              border: "1px solid var(--card-border)",
              background: "var(--card-bg)",
            }}
          >
            <span
              className="h-[5px] w-[5px] rounded-full"
              style={{ background: "#518BDB" }}
            />
            <span
              className="text-[11px] font-semibold tracking-[0.08em] uppercase"
              style={{ color: "var(--page-text-muted)", fontFamily: "var(--font-body)" }}
            >
              Contributor Analytics
            </span>
          </span>
        </motion.div>

        {/* Headline — perfectlyNineties font */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="mb-5 text-balance"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(40px, 6.5vw, 72px)",
            fontWeight: "normal",
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            color: "var(--page-text)",
          }}
        >
          Find out who actually
          <br />
          did the work.
        </motion.h1>

        {/* Subheadline — haffer */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mb-9 max-w-[480px]"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "17px",
            lineHeight: 1.65,
            color: "var(--page-text-muted)",
          }}
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
            className="h-[44px] px-7 rounded-lg text-white text-[14px] font-semibold tracking-[-0.01em] active:scale-[0.97] transition-all"
            style={{ background: "#518BDB", fontFamily: "var(--font-body)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#3D7ACC")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#518BDB")}
          >
            Get started free
          </button>
          <button
            onClick={() => {
              document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="h-[44px] px-7 rounded-lg text-[14px] font-medium transition-all"
            style={{
              border: "1px solid var(--card-border)",
              color: "var(--page-text-muted)",
              background: "var(--card-bg)",
              fontFamily: "var(--font-body)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--page-text)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--page-text-muted)")}
          >
            See how it works
          </button>
        </motion.div>

        {/* Product preview — browser mockup */}
        <motion.div
          initial={{ opacity: 0, y: 48 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mt-16 sm:mt-20 mx-auto max-w-[820px]"
        >
          <div
            className="rounded-2xl p-[1px]"
            style={{
              background: "var(--card-border)",
              boxShadow: "0 4px 32px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)",
            }}
          >
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: "var(--card-bg)" }}
            >
              {/* Browser chrome */}
              <div
                className="flex items-center gap-2 px-4 py-3"
                style={{ borderBottom: "1px solid var(--card-border)" }}
              >
                <div className="flex gap-1.5">
                  {["#E5E5E5", "#E5E5E5", "#E5E5E5"].map((c, i) => (
                    <div key={i} className="w-[10px] h-[10px] rounded-full" style={{ background: c }} />
                  ))}
                </div>
                <div className="flex-1 flex justify-center">
                  <div
                    className="h-[26px] w-[240px] rounded-md flex items-center justify-center"
                    style={{ background: "var(--page-bg)" }}
                  >
                    <span
                      className="text-[11px] font-mono"
                      style={{ color: "var(--page-text-muted)" }}
                    >
                      glasswork.app/results
                    </span>
                  </div>
                </div>
              </div>

              {/* Results content */}
              <div className="px-6 py-6 sm:px-8 sm:py-8">
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: "rgba(81,139,219,0.10)" }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#518BDB" strokeWidth="2">
                      <path d="M9 12l2 2 4-4" />
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                  </div>
                  <div>
                    <div
                      className="text-[14px] font-semibold"
                      style={{ color: "var(--page-text)", fontFamily: "var(--font-body)" }}
                    >
                      Analysis Complete
                    </div>
                    <div
                      className="text-[12px]"
                      style={{ color: "var(--page-text-muted)", fontFamily: "var(--font-body)" }}
                    >
                      3 contributors found · Google Docs
                    </div>
                  </div>
                </div>

                {/* Contributor rows */}
                {DEMO_CONTRIBUTORS.map((c, i) => {
                  const colors = TIER_COLORS[c.tier];
                  return (
                    <div
                      key={c.name}
                      className="flex items-center justify-between py-3.5"
                      style={{
                        borderBottom: i < DEMO_CONTRIBUTORS.length - 1
                          ? "1px solid var(--section-divider)"
                          : "none",
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="text-[11px] font-mono w-4 text-right"
                          style={{ color: "var(--page-text-muted)", opacity: 0.4, fontFamily: "var(--font-body)" }}
                        >
                          {i + 1}
                        </span>
                        <div
                          className="w-[32px] h-[32px] rounded-full flex items-center justify-center text-[11px] font-bold overflow-hidden shrink-0"
                          style={{
                            background: colors.avatarBg,
                            color: colors.avatarText,
                            border: `2px solid ${colors.avatarRing}`,
                          }}
                        >
                          {c.avatarUrl ? (
                            <img src={c.avatarUrl} alt={c.name} className="w-full h-full object-cover" />
                          ) : c.initials.slice(0, 1)}
                        </div>
                        <div>
                          <div
                            className="text-[14px] font-medium"
                            style={{ color: "var(--page-text)", fontFamily: "var(--font-body)" }}
                          >
                            {c.name}
                          </div>
                          <div
                            className="text-[11px]"
                            style={{ color: "var(--page-text-muted)", fontFamily: "var(--font-body)" }}
                          >
                            {c.label}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className="text-[22px] font-bold tracking-[-0.03em] tabular-nums"
                          style={{ color: colors.score, fontFamily: "var(--font-display)" }}
                        >
                          {c.score}
                        </span>
                        <TierBadge tier={c.tier} size="sm" theme="light" />
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

const TRUST_ICONS: Record<string, React.ReactNode> = {
  "Google Docs": (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" fill="#4285F4" />
      <path d="M14 2v6h6" fill="#A1C2FA" />
      <rect x="8" y="13" width="8" height="1.5" rx="0.75" fill="#fff" />
      <rect x="8" y="16" width="5" height="1.5" rx="0.75" fill="#fff" />
    </svg>
  ),
  "GitHub": (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--page-text)">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  ),
  "Google Slides": (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" fill="#F4B400" />
      <path d="M14 2v6h6" fill="#F7D77A" />
      <rect x="7" y="12" width="10" height="6" rx="1" fill="#fff" />
    </svg>
  ),
  "Slack": (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52z" fill="#E01E5A" />
      <path d="M6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z" fill="#E01E5A" />
      <path d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834z" fill="#36C5F0" />
      <path d="M8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z" fill="#36C5F0" />
      <path d="M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834z" fill="#2EB67D" />
      <path d="M17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312z" fill="#2EB67D" />
      <path d="M15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52z" fill="#ECB22E" />
      <path d="M15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" fill="#ECB22E" />
    </svg>
  ),
  "Notion": (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--page-text)">
      <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L18.29 2.47c-.42-.326-.98-.7-2.055-.607l-12.77.933c-.467.047-.56.28-.374.466l1.368.946zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.166V6.382c0-.606-.233-.933-.748-.886l-15.177.887c-.56.047-.747.327-.747.886zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952l1.449.327s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.14c-.093-.514.28-.886.747-.933l3.222-.186zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.374 1.633-1.681 1.726l-15.458.933c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.448-1.632z" />
    </svg>
  ),
  "Figma": (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M8 24c2.208 0 4-1.792 4-4v-4H8c-2.208 0-4 1.792-4 4s1.792 4 4 4z" fill="#0ACF83" />
      <path d="M4 12c0-2.208 1.792-4 4-4h4v8H8c-2.208 0-4-1.792-4-4z" fill="#A259FF" />
      <path d="M4 4c0-2.208 1.792-4 4-4h4v8H8C5.792 8 4 6.208 4 4z" fill="#F24E1E" />
      <path d="M12 0h4c2.208 0 4 1.792 4 4s-1.792 4-4 4h-4V0z" fill="#FF7262" />
      <path d="M20 12c0 2.208-1.792 4-4 4s-4-1.792-4-4 1.792-4 4-4 4 1.792 4 4z" fill="#1ABCFE" />
    </svg>
  ),
  "Linear": (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M1.16 11.16a11.94 11.94 0 0 0 11.68 11.68L1.16 11.16z" fill="#5E6AD2" />
      <path d="M2.04 14.08l7.88 7.88a11.96 11.96 0 0 0 4.56-2.28L3.32 8.52a11.96 11.96 0 0 0-1.28 5.56z" fill="#5E6AD2" />
      <path d="M4.24 7.24l12.52 12.52A12 12 0 1 0 4.24 7.24z" fill="#5E6AD2" />
    </svg>
  ),
  "GitLab": (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 22.08L15.72 11.4H8.28L12 22.08z" fill="#E24329" />
      <path d="M12 22.08L8.28 11.4H1.68L12 22.08z" fill="#FC6D26" />
      <path d="M1.68 11.4l-1.44 4.44c-.132.4.012.84.36 1.08L12 22.08 1.68 11.4z" fill="#FCA326" />
      <path d="M1.68 11.4h6.6L5.52 2.76c-.144-.44-.768-.44-.912 0L1.68 11.4z" fill="#E24329" />
      <path d="M12 22.08l3.72-10.68h6.6L12 22.08z" fill="#FC6D26" />
      <path d="M22.32 11.4l1.44 4.44c.132.4-.012.84-.36 1.08L12 22.08l10.32-10.68z" fill="#FCA326" />
      <path d="M22.32 11.4h-6.6l2.88-8.64c.144-.44.768-.44.912 0l2.8 8.64z" fill="#E24329" />
    </svg>
  ),
};

const TRUST_ITEMS = [
  "Google Docs", "GitHub", "Google Slides", "Slack",
  "Notion", "Figma", "Linear", "GitLab",
];

function TrustStrip() {
  // Duplicate items for seamless infinite scroll
  const allItems = [...TRUST_ITEMS, ...TRUST_ITEMS, ...TRUST_ITEMS, ...TRUST_ITEMS];

  return (
    <section className="py-12 overflow-hidden">
      <FadeIn>
        <p
          className="text-center text-[12px] font-semibold tracking-[0.08em] uppercase mb-7"
          style={{ color: "var(--page-text-muted)", fontFamily: "var(--font-body)" }}
        >
          Paste a link from
        </p>
      </FadeIn>

      <div className="relative">
        {/* Fade edges */}
        <div
          className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 z-10"
          style={{ background: `linear-gradient(to right, var(--page-bg), transparent)` }}
        />
        <div
          className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 z-10"
          style={{ background: `linear-gradient(to left, var(--page-bg), transparent)` }}
        />

        <div
          className="flex animate-scroll-left"
          style={{ width: "max-content", gap: "16px" }}
        >
          {allItems.map((name, i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 px-5 py-2.5 rounded-full shrink-0"
              style={{
                border: "1px solid var(--card-border)",
                background: "var(--card-bg)",
              }}
            >
              <span className="shrink-0 flex items-center">{TRUST_ICONS[name]}</span>
              <span
                className="text-[13px] font-medium whitespace-nowrap"
                style={{ color: "var(--page-text)", fontFamily: "var(--font-body)" }}
              >
                {name}
              </span>
            </div>
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
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
    title: "Document Analysis",
    description: "Drop a Google Doc link. We trace every revision, every cursor, every edit \u2014 weighted by recency and substance.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v6m0 6v6m-7.5-3.5 4.24-4.24M15.26 8.74l4.24-4.24M1 12h6m6 0h6" />
      </svg>
    ),
    title: "Git Intelligence",
    description: "Connect a GitHub repo. Commits, diffs, PR reviews \u2014 we parse the full history and attribute contribution with precision.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20V10" />
        <path d="M18 20V4" />
        <path d="M6 20v-4" />
      </svg>
    ),
    title: "Fair Share Scoring",
    description: "Every person gets a number. Recency-weighted, substance-aware, impossible to game. LOCKED IN, MID, or SELLING.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
        <polyline points="16 6 12 2 8 6" />
        <line x1="12" y1="2" x2="12" y2="15" />
      </svg>
    ),
    title: "Shareable Reports",
    description: "One-click reports you can send to your professor, manager, or post publicly. Beautiful, detailed, and undeniable.",
  },
];

function FeatureShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section id="features" className="py-[80px] sm:py-[100px] mx-auto max-w-[1200px] px-6 sm:px-10">
      <FadeIn>
        <h2
          className="mb-3"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(28px,4vw,42px)",
            fontWeight: "normal",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            color: "var(--page-text)",
          }}
        >
          One place for the truth
        </h2>
        <p
          className="max-w-[440px] mb-14"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "16px",
            lineHeight: 1.65,
            color: "var(--page-text-muted)",
          }}
        >
          Everything you need to analyze contributions, score teammates, and settle it once and for all.
        </p>
      </FadeIn>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        {/* Left accordion */}
        <div className="space-y-1">
          {FEATURES.map((feature, i) => (
            <FadeIn key={feature.title} delay={i * 0.07}>
              <button
                onClick={() => setActiveIndex(i)}
                className="w-full text-left p-5 rounded-xl transition-all duration-250"
                style={{
                  background: activeIndex === i ? "var(--card-bg)" : "transparent",
                  border: activeIndex === i ? "1px solid var(--card-border)" : "1px solid transparent",
                }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="mt-0.5 transition-colors duration-200"
                    style={{ color: activeIndex === i ? "#518BDB" : "var(--page-text-muted)" }}
                  >
                    {feature.icon}
                  </div>
                  <div>
                    <h3
                      className="text-[15px] font-semibold mb-1.5 transition-colors duration-200"
                      style={{
                        fontFamily: "var(--font-body)",
                        color: activeIndex === i ? "var(--page-text)" : "var(--page-text-muted)",
                      }}
                    >
                      {feature.title}
                    </h3>
                    {activeIndex === i && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        transition={{ duration: 0.25 }}
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: "14px",
                          lineHeight: 1.65,
                          color: "var(--page-text-muted)",
                        }}
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

        {/* Right panel */}
        <FadeIn delay={0.15} className="hidden lg:block">
          <div
            className="rounded-xl p-8 h-full min-h-[340px] flex items-center justify-center"
            style={{
              border: "1px solid var(--card-border)",
              background: "var(--card-bg)",
            }}
          >
            <div className="text-center">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: "rgba(81,139,219,0.08)" }}
              >
                <div style={{ color: "#518BDB" }}>{FEATURES[activeIndex].icon}</div>
              </div>
              <p
                className="text-[20px] font-semibold mb-2"
                style={{ fontFamily: "var(--font-body)", color: "var(--page-text)" }}
              >
                {FEATURES[activeIndex].title}
              </p>
              <p
                className="text-[14px] max-w-[260px] mx-auto leading-relaxed"
                style={{ fontFamily: "var(--font-body)", color: "var(--page-text-muted)" }}
              >
                {FEATURES[activeIndex].description}
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
    <section id="about" className="py-[80px] sm:py-[100px] mx-auto max-w-[620px] px-6 sm:px-10">
      <FadeIn>
        <div className="space-y-7">
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(17px,2.2vw,22px)",
              lineHeight: 1.6,
              color: "var(--page-text)",
            }}
          >
            I built Glasswork because I was tired of{" "}
            <span
              style={{
                textDecoration: "underline",
                textDecorationColor: "rgba(81,139,219,0.35)",
                textUnderlineOffset: "4px",
              }}
            >
              carrying group projects
            </span>{" "}
            and having no way to prove it.
          </p>

          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(17px,2.2vw,22px)",
              lineHeight: 1.6,
              color: "var(--page-text)",
            }}
          >
            Glasswork analyzes your docs and repos &mdash; and gives every contributor a score that speaks for itself. No surveys. No drama. Just data.
          </p>

          <div className="pt-2 flex items-center gap-3">
            <div
              className="w-[42px] h-[42px] rounded-full overflow-hidden shrink-0"
              style={{ border: "2px solid rgba(81,139,219,0.25)" }}
            >
              <img src="/logo.png" alt="Pranav" className="w-full h-full object-cover" />
            </div>
            <div>
              <div
                className="text-[14px] font-semibold"
                style={{ fontFamily: "var(--font-display)", color: "var(--page-text)" }}
              >
                Pranav
              </div>
              <div
                className="text-[13px]"
                style={{ fontFamily: "var(--font-body)", color: "var(--page-text-muted)" }}
              >
                Builder of Glasswork &middot; 16, New York
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
    <section className="py-[60px] sm:py-[80px] mx-auto max-w-[1200px] px-6 sm:px-10">
      <FadeIn>
        <div
          className="rounded-2xl p-10 sm:p-16 text-center"
          style={{
            background: "#1C1C1C",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <h2
            className="mb-4"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(32px,5vw,54px)",
              fontWeight: "normal",
              lineHeight: 1.08,
              letterSpacing: "-0.02em",
              color: "#F2F2F2",
            }}
          >
            Stop guessing.
          </h2>
          <p
            className="mb-8 mx-auto max-w-[360px]"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "16px",
              lineHeight: 1.6,
              color: "#828282",
            }}
          >
            Paste any link. See who actually contributed.
          </p>
          <button
            onClick={() => signIn("google", { redirectTo: "/app" })}
            className="h-[46px] px-8 rounded-lg text-white text-[14px] font-semibold active:scale-[0.97] transition-all"
            style={{ background: "#518BDB", fontFamily: "var(--font-body)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#3D7ACC")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#518BDB")}
          >
            Get started free &rarr;
          </button>
        </div>
      </FadeIn>
    </section>
  );
}

/* ─── Footer ─── */

function Footer() {
  return (
    <footer
      className="py-8 mx-auto max-w-[1200px] px-6 sm:px-10"
      style={{ borderTop: "1px solid var(--section-divider)" }}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="relative flex h-[6px] w-[6px]">
            <span className="relative inline-flex h-[6px] w-[6px] rounded-full bg-emerald-500" />
          </span>
          <span
            className="text-[14px] font-semibold tracking-[-0.02em]"
            style={{ color: "var(--page-text)", fontFamily: "var(--font-body)" }}
          >
            glass<span style={{ color: "#518BDB" }}>work</span>
          </span>
          <span
            className="text-[13px] ml-2 hidden sm:inline"
            style={{ color: "var(--page-text-muted)", fontFamily: "var(--font-body)" }}
          >
            &middot; Built by a 16-year-old who got burned by one too many group projects.
          </span>
        </div>

        <div className="flex items-center gap-6">
          <a
            href="/privacy"
            className="text-[13px] transition-colors"
            style={{ color: "var(--page-text-muted)", fontFamily: "var(--font-body)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--page-text)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--page-text-muted)")}
          >
            Privacy
          </a>
          <a
            href="mailto:support@glasswork.app"
            className="text-[13px] transition-colors"
            style={{ color: "var(--page-text-muted)", fontFamily: "var(--font-body)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--page-text)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--page-text-muted)")}
          >
            Contact
          </a>
        </div>
      </div>

      <p
        className="mt-6 text-[12px]"
        style={{ color: "var(--page-text-muted)", opacity: 0.5, fontFamily: "var(--font-body)" }}
      >
        &copy; {new Date().getFullYear()} Glasswork
      </p>
    </footer>
  );
}

/* ─── Main export ─── */

export default function LandingPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/app");
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div
      className="relative min-h-screen transition-colors duration-200"
      style={{ background: "var(--page-bg)" }}
    >
      <Nav />
      <Hero />
      <div style={{ height: "1px", background: "var(--section-divider)", maxWidth: "900px", margin: "0 auto" }} />
      <TrustStrip />
      <div style={{ height: "1px", background: "var(--section-divider)", maxWidth: "900px", margin: "0 auto" }} />
      <FeatureShowcase />
      <div style={{ height: "1px", background: "var(--section-divider)", maxWidth: "900px", margin: "0 auto" }} />
      <FounderSection />
      <BottomCTA />
      <Footer />
    </div>
  );
}
