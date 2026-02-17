"use client";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="relative min-h-screen">
      {/* ── Aurora animated layer ── */}
      <div aria-hidden className="aurora-container">
        <div className="aurora-orb aurora-orb-1" />
        <div className="aurora-orb aurora-orb-2" />
        <div className="aurora-orb aurora-orb-3" />
      </div>

      {/* ── Noise grain overlay ── */}
      <div aria-hidden className="noise-grain" />

      {/* ── Navigation Bar ── */}
      <nav className="glass-nav fixed left-0 right-0 top-0 z-50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-2.5">
          {/* Left: Wordmark only */}
          <span className="text-lg font-semibold tracking-tight text-white">
            Glasswork
          </span>

          {/* Right: Single ghost link */}
          <a
            href="#"
            className="text-[13px] font-medium text-white/30 transition-colors hover:text-white/50"
          >
            GitHub
          </a>
        </div>
      </nav>

      {/* ── Main Content ── */}
      <main className="relative z-10">
        {children}
      </main>

      {/* ── Footer ── */}
      <footer className="fixed bottom-0 left-0 z-20 px-6 pb-5">
        <p className="text-[11px] tracking-wide text-white/15">
          Built by a 16-year-old tired of carrying group projects.
        </p>
      </footer>
    </div>
  );
}
