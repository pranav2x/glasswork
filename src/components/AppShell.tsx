"use client";

import { ContributionBackground } from "@/components/ContributionBackground";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="relative min-h-screen">
      {/* ── Contribution Currents background system ── */}
      <ContributionBackground />

      {/* ── Noise grain overlay ── */}
      <div aria-hidden className="noise-grain" />

      {/* ── Navigation Bar ── */}
      <header className="fixed inset-x-0 top-0 z-30">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 md:px-8">
          {/* Logo pill with glassmorphism */}
          <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl">
            <span
              className="text-[13px] font-medium tracking-wide text-neutral-200"
              style={{ fontFamily: '"Goudita Serial", serif' }}
            >
              Glasswork
            </span>
          </div>

          {/* Optional GitHub link — very subtle */}
          <a
            href="#"
            className="hidden text-[10px] uppercase tracking-[0.2em] text-neutral-500 transition-colors hover:text-neutral-300 md:inline"
          >
            GitHub
          </a>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="relative z-10">{children}</main>

      {/* ── Footer ── */}
      <footer className="fixed bottom-0 left-0 z-20 px-6 pb-5">
        <p className="text-[11px] tracking-wide text-white/15">
          Built by a 16-year-old tired of carrying group projects.
        </p>
      </footer>
    </div>
  );
}
