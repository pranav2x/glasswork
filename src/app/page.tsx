"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { motion, useInView } from "framer-motion";
import { api } from "../../convex/_generated/api";
import { TierBadge } from "@/components/TierBadge";
import Image from "next/image";

const PLACEHOLDERS = [
  "Paste your Google Doc link...",
  "Paste your GitHub repo...",
];

function useTypingPlaceholder() {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = PLACEHOLDERS[index];
    let timeout: ReturnType<typeof setTimeout>;

    if (!isDeleting && text.length < current.length) {
      timeout = setTimeout(() => setText(current.slice(0, text.length + 1)), 50);
    } else if (!isDeleting && text.length === current.length) {
      timeout = setTimeout(() => setIsDeleting(true), 2500);
    } else if (isDeleting && text.length > 0) {
      timeout = setTimeout(() => setText(text.slice(0, -1)), 25);
    } else if (isDeleting && text.length === 0) {
      setIsDeleting(false);
      setIndex((i) => (i + 1) % PLACEHOLDERS.length);
    }

    return () => clearTimeout(timeout);
  }, [text, isDeleting, index]);

  return text;
}

function FadeInSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function DemoContributorCard({
  name,
  score,
  tier,
  avatarUrl,
  delay,
}: {
  name: string;
  score: number;
  tier: "carry" | "solid" | "ghost";
  avatarUrl: string;
  delay: number;
}) {
  const config = {
    carry: { text: "#A78BFA", bg: "rgba(167,139,250,0.15)", border: "rgba(167,139,250,0.35)", glow: "0 0 30px rgba(167,139,250,0.25), 0 0 60px rgba(167,139,250,0.10)" },
    solid: { text: "#34D399", bg: "rgba(52,211,153,0.12)", border: "rgba(52,211,153,0.30)", glow: "0 0 20px rgba(52,211,153,0.15)" },
    ghost: { text: "#F87171", bg: "rgba(248,113,113,0.12)", border: "rgba(248,113,113,0.30)", glow: "0 0 20px rgba(248,113,113,0.15)" },
  }[tier];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative"
    >
      {tier === "carry" && (
        <div
          className="absolute -inset-px rounded-2xl opacity-50 blur-xl"
          style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(167,139,250,0.3) 0%, transparent 70%)" }}
        />
      )}
      <div
        className="relative rounded-2xl p-4 glass"
        style={{ boxShadow: config.glow }}
      >
        <div className="h-[2px] w-full absolute top-0 left-0 right-0 rounded-t-2xl" style={{ backgroundColor: config.border }} />
        <div className="flex items-center gap-3 mb-3 pt-1">
          <Image src={avatarUrl} alt={name} width={36} height={36} className="rounded-full" />
          <div>
            <p className="text-[13px] font-bold text-warm-900">{name}</p>
          </div>
          <div className="ml-auto">
            <TierBadge tier={tier} size="sm" />
          </div>
        </div>
        <p className="text-[40px] font-black leading-none tabular-nums" style={{ color: config.text }}>
          {score}
        </p>
      </div>
    </motion.div>
  );
}

export default function LandingPage() {
  const { signIn } = useAuthActions();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();
  const placeholder = useTypingPlaceholder();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/app");
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Hero background gradient from chaotic image */}
      <div
        className="absolute inset-0 -z-10 opacity-40"
        style={{
          backgroundImage: "url('/Chaotic Gradient.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(80px)",
        }}
      />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5">
          <span className="animate-online-pulse inline-block h-2 w-2 rounded-full bg-emerald-400" />
          <span className="font-black text-[20px] tracking-tight text-warm-900">
            glass<span className="text-brand">work</span>
          </span>
        </div>
        <button
          onClick={() => signIn("google", { redirectTo: "/app" })}
          className="rounded-xl bg-white/[0.06] border border-white/[0.10] px-4 py-2 text-[13px] font-semibold text-warm-700 transition-all hover:bg-white/[0.10] hover:text-warm-800 active:scale-[0.97]"
        >
          Sign in with Google
        </button>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-24 lg:pt-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Copy */}
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="text-[clamp(40px,6vw,72px)] font-black leading-[0.95] tracking-tight text-warm-900"
            >
              Find out who
              <br />
              actually{" "}
              <span className="bg-gradient-to-r from-brand via-carry to-brand bg-clip-text text-transparent">
                did the work.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="mt-6 text-[18px] leading-relaxed text-warm-600 max-w-lg"
            >
              Paste a Google Doc or GitHub repo.
              <br />
              Glasswork scores every contributor in 30 seconds.
            </motion.p>

            {/* CTA Input */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="mt-8 flex gap-3 max-w-lg"
            >
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder={placeholder}
                  onClick={() => signIn("google", { redirectTo: "/app" })}
                  readOnly
                  className="w-full h-14 rounded-xl border border-white/[0.12] bg-white/[0.06] backdrop-blur-lg px-5 text-[15px] text-warm-900 placeholder:text-warm-500 cursor-pointer transition-all hover:border-white/[0.20] hover:bg-white/[0.08] focus:outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/20"
                />
              </div>
              <button
                onClick={() => signIn("google", { redirectTo: "/app" })}
                className="h-14 rounded-xl bg-brand px-6 text-[15px] font-bold text-white shadow-glow-brand transition-all hover:bg-brand-light hover:shadow-[0_0_40px_rgba(124,111,255,0.5)] active:scale-[0.97] whitespace-nowrap"
              >
                Expose it →
              </button>
            </motion.div>

            {/* Demo link */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="mt-4 text-[13px] text-warm-500"
            >
              <button
                onClick={() => signIn("google", { redirectTo: "/app" })}
                className="text-brand hover:text-brand-light transition-colors underline underline-offset-4 decoration-brand/30"
              >
                See a live example →
              </button>
            </motion.p>
          </div>

          {/* Right: Demo Cards */}
          <div className="hidden lg:block">
            <div className="space-y-4 animate-float">
              <DemoContributorCard name="Pranav" score={189} tier="carry" avatarUrl="/logo.png" delay={0.4} />
              <DemoContributorCard name="Aaryan Verma" score={158} tier="carry" avatarUrl="/animepfp.jpeg" delay={0.55} />
              <DemoContributorCard name="Rohan Bedi" score={68} tier="ghost" avatarUrl="/catpj.jpeg" delay={0.7} />
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Strip */}
      <FadeInSection>
        <section className="relative z-10 border-t border-b border-white/[0.06] py-8">
          <div className="max-w-7xl mx-auto px-6">
            <p className="text-[11px] font-semibold text-warm-500 uppercase tracking-[0.15em] text-center mb-6">
              Trusted by students and teams at
            </p>
            <div className="overflow-hidden">
              <div className="animate-marquee flex items-center gap-16 whitespace-nowrap">
                {["MIT", "Stanford", "UC Berkeley", "YC", "Princeton", "MIT", "Stanford", "UC Berkeley", "YC", "Princeton", "MIT", "Stanford", "UC Berkeley", "YC", "Princeton", "MIT", "Stanford", "UC Berkeley", "YC", "Princeton"].map((name, i) => (
                  <span key={i} className="text-[14px] font-bold text-warm-400 tracking-wide">{name}</span>
                ))}
              </div>
            </div>
          </div>
        </section>
      </FadeInSection>

      {/* How It Works */}
      <FadeInSection>
        <section className="relative z-10 max-w-7xl mx-auto px-6 py-24">
          <h2 className="text-[36px] font-black tracking-tight text-warm-900 text-center mb-16">
            How it works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", icon: "📎", title: "Paste a link", desc: "Google Doc or public GitHub repo. That's it." },
              { step: "02", icon: "⚡", title: "We analyze it", desc: "Diffs, commits, revisions — all recency weighted." },
              { step: "03", icon: "🏆", title: "See the truth", desc: "Every contributor ranked. No fluff. No hiding." },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="glass rounded-2xl p-8 h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-glass-hover cursor-default">
                  <span className="text-[11px] font-bold text-brand tracking-widest">{item.step}</span>
                  <div className="mt-4 text-[32px]">{item.icon}</div>
                  <h3 className="mt-4 text-[18px] font-bold text-warm-900">{item.title}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-warm-600">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </FadeInSection>

      {/* What You Get — Demo results */}
      <FadeInSection>
        <section className="relative z-10 max-w-7xl mx-auto px-6 pb-24">
          <h2 className="text-[36px] font-black tracking-tight text-warm-900 text-center mb-4">
            What you get
          </h2>
          <p className="text-[16px] text-warm-600 text-center mb-12 max-w-md mx-auto">
            Every contributor scored, ranked, and exposed. In seconds.
          </p>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <DemoContributorCard name="Pranav" score={189} tier="carry" avatarUrl="/logo.png" delay={0} />
            <DemoContributorCard name="Aaryan Verma" score={158} tier="carry" avatarUrl="/animepfp.jpeg" delay={0.1} />
            <DemoContributorCard name="Rohan Bedi" score={68} tier="ghost" avatarUrl="/catpj.jpeg" delay={0.2} />
          </div>
        </section>
      </FadeInSection>

      {/* Final CTA */}
      <FadeInSection>
        <section className="relative z-10 max-w-7xl mx-auto px-6 pb-24 text-center">
          <h2 className="text-[32px] font-black tracking-tight text-warm-900 mb-4">
            Your group project deserves the truth.
          </h2>
          <button
            onClick={() => signIn("google", { redirectTo: "/app" })}
            className="mt-4 rounded-xl bg-brand px-8 py-4 text-[16px] font-bold text-white shadow-glow-brand transition-all hover:bg-brand-light hover:shadow-[0_0_50px_rgba(124,111,255,0.5)] hover:scale-105 active:scale-95"
          >
            Start for free →
          </button>
        </section>
      </FadeInSection>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.06] py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[12px] text-warm-500">
            © 2025 Glasswork ·{" "}
            <a href="/privacy" className="hover:text-warm-700 transition-colors">Privacy</a>
          </p>
          <p className="text-[12px] text-warm-500">
            Built by a 16yo in New York
          </p>
        </div>
      </footer>
    </div>
  );
}
