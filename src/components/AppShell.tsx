"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useConvexAuth, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";
import { ContributionBackground } from "@/components/ContributionBackground";
import {
  Search,
  BarChart3,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";

interface AppShellProps {
  children: React.ReactNode;
}

function getInitials(name?: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function AccountMenu() {
  const { signOut } = useAuthActions();
  const user = useQuery(api.users.getCurrentUser);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/[0.06] transition-all hover:border-[#d8b989]/30 hover:ring-2 hover:ring-[#d8b989]/10 focus:outline-none"
        aria-label="Account menu"
      >
        {user?.image ? (
          <Image
            src={user.image}
            alt={user.name ?? "Profile"}
            width={32}
            height={32}
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className="text-[11px] font-semibold text-white/60">
            {getInitials(user?.name)}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 min-w-[200px] overflow-hidden rounded-xl border border-white/[0.08] bg-[#0c0c12]/95 shadow-2xl backdrop-blur-xl">
          <div className="border-b border-white/[0.06] px-4 py-3">
            <p className="truncate text-[13px] font-medium text-white/80">
              {user?.name ?? "Signed in"}
            </p>
            {user?.email && (
              <p className="truncate text-[11px] text-white/35">{user.email}</p>
            )}
          </div>
          <div className="py-1">
            <Link
              href="/app"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-white/60 transition-colors hover:bg-white/[0.04] hover:text-white/90"
            >
              <BarChart3 className="h-3.5 w-3.5" />
              Workspace
            </Link>
            <button
              onClick={() => {
                setOpen(false);
                void signOut();
              }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[13px] text-white/40 transition-colors hover:bg-white/[0.04] hover:text-[#f97373]"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const sidebarNav = [
  { icon: Search, href: "/app", label: "Search", match: "none" },
  { icon: BarChart3, href: "/app", label: "Analyses", match: "/app" },
  { icon: Settings, href: "/app", label: "Settings", match: "none" },
];

function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-30 flex h-screen w-[56px] flex-col items-center border-r border-white/[0.05] bg-[#060609]/90 backdrop-blur-xl">
      <div className="flex h-14 items-center justify-center">
        <Link href="/app">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#d8b989] to-[#b89a6a] shadow-[0_2px_8px_rgba(216,185,137,0.25)]">
            <span className="text-[11px] font-bold text-[#1a1a1a]">G</span>
          </div>
        </Link>
      </div>

      <nav className="mt-2 flex flex-col items-center gap-1">
        {sidebarNav.map((item) => {
          const isActive = item.match !== "none" && pathname === item.match;
          return (
            <Link key={item.label} href={item.href}>
              <button
                className={`flex h-10 w-10 items-center justify-center rounded-lg transition-all ${
                  isActive
                    ? "bg-white/[0.08] text-[#d8b989]"
                    : "text-white/25 hover:bg-white/[0.04] hover:text-white/50"
                }`}
                title={item.label}
              >
                <item.icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
              </button>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

function DashboardTopBar() {
  const { isAuthenticated } = useConvexAuth();

  return (
    <header className="sticky top-0 z-20 border-b border-white/[0.05] bg-[#060609]/80 backdrop-blur-xl">
      <div className="flex h-14 items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <Link href="/app">
            <div className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 transition-colors hover:border-white/[0.12]">
              <div className="h-4 w-4 rounded bg-gradient-to-br from-[#d8b989] to-[#b89a6a]" />
              <span className="text-[13px] font-medium text-white/70">
                Glasswork
              </span>
              <ChevronDown className="h-3 w-3 text-white/30" />
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated && <AccountMenu />}
        </div>
      </div>
    </header>
  );
}

export function AppShell({ children }: AppShellProps) {
  const { isAuthenticated } = useConvexAuth();
  const pathname = usePathname();
  const isWorkspace =
    pathname.startsWith("/app") || pathname.startsWith("/results");

  if (isWorkspace && isAuthenticated) {
    return (
      <div className="relative min-h-screen">
        <ContributionBackground />
        <div aria-hidden className="noise-grain" />

        <Sidebar />

        <div className="pl-[56px]">
          <DashboardTopBar />
          <main className="relative z-10">{children}</main>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <ContributionBackground />
      <div aria-hidden className="noise-grain" />

      <header className="fixed inset-x-0 top-0 z-30">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 md:px-8">
          <Link href={isAuthenticated ? "/app" : "/"}>
            <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl">
              <span
                className="text-[13px] font-medium tracking-wide text-neutral-200"
                style={{ fontFamily: '"Goudita Serial", serif' }}
              >
                Glasswork
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <AccountMenu />
            ) : (
              <a
                href="#"
                className="hidden text-[10px] uppercase tracking-[0.2em] text-neutral-500 transition-colors hover:text-neutral-300 md:inline"
              >
                GitHub
              </a>
            )}
          </div>
        </div>
      </header>

      <main className="relative z-10">{children}</main>

      <footer className="fixed bottom-0 left-0 z-20 px-6 pb-5">
        <p className="text-[11px] tracking-wide text-white/15">
          Built by a 16-year-old tired of carrying group projects.
        </p>
      </footer>
    </div>
  );
}
