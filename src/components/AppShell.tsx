"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useConvexAuth, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";
import {
  Search,
  BarChart3,
  Settings,
  LogOut,
  User,
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
        className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-warm-300 bg-warm-100 transition-all hover:border-gold/40 hover:ring-2 hover:ring-gold/10 focus:outline-none"
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
          <span className="text-[11px] font-semibold text-warm-600">
            {getInitials(user?.name)}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 min-w-[200px] overflow-hidden rounded-xl border border-warm-300 bg-white shadow-lg">
          <div className="border-b border-warm-200 px-4 py-3">
            <p className="truncate text-[13px] font-medium text-warm-800">
              {user?.name ?? "Signed in"}
            </p>
            {user?.email && (
              <p className="truncate text-[11px] text-warm-500">{user.email}</p>
            )}
          </div>
          <div className="py-1">
            <Link
              href="/app"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-warm-600 transition-colors hover:bg-warm-100 hover:text-warm-800"
            >
              <BarChart3 className="h-3.5 w-3.5" />
              Workspace
            </Link>
            <button
              onClick={() => {
                setOpen(false);
                void signOut();
              }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[13px] text-warm-500 transition-colors hover:bg-warm-100 hover:text-danger"
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

function SettingsPopover() {
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
        className={`flex h-10 w-10 items-center justify-center rounded-lg transition-all ${
          open
            ? "bg-gold/10 text-gold-dark"
            : "text-warm-400 hover:bg-warm-100 hover:text-warm-600"
        }`}
        title="Settings"
      >
        <Settings className="h-[18px] w-[18px]" strokeWidth={1.8} />
      </button>

      {open && (
        <div className="absolute bottom-0 left-[52px] z-50 min-w-[200px] overflow-hidden rounded-xl border border-warm-200 bg-white shadow-lg">
          {user && (
            <div className="flex items-center gap-2.5 border-b border-warm-100 px-4 py-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold/10 text-[11px] font-semibold text-gold-dark">
                {user.name?.charAt(0).toUpperCase() ?? <User className="h-3.5 w-3.5" />}
              </div>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-medium text-warm-800">{user.name ?? "Account"}</p>
                {user.email && (
                  <p className="truncate text-[11px] text-warm-400">{user.email}</p>
                )}
              </div>
            </div>
          )}
          <div className="py-1">
            <button
              onClick={() => { setOpen(false); void signOut(); }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[13px] text-warm-500 transition-colors hover:bg-warm-100 hover:text-danger"
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

function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleSearch = () => {
    if (pathname !== "/app") {
      router.push("/app");
      setTimeout(() => {
        const searchBtn = document.querySelector<HTMLButtonElement>("[data-search-trigger]");
        searchBtn?.click();
      }, 200);
    } else {
      const searchBtn = document.querySelector<HTMLButtonElement>("[data-search-trigger]");
      const searchInput = document.querySelector<HTMLInputElement>("[data-search-input]");
      if (searchInput) {
        searchInput.focus();
      } else {
        searchBtn?.click();
      }
    }
  };

  return (
    <aside className="fixed left-0 top-0 z-30 flex h-screen w-[56px] flex-col items-center border-r border-warm-300 bg-white">
      <div className="flex h-14 items-center justify-center">
        <Link href="/app">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-gold to-gold-dark shadow-sm">
            <span className="text-[11px] font-bold text-white">G</span>
          </div>
        </Link>
      </div>

      <nav className="mt-2 flex flex-col items-center gap-1">
        {/* Search */}
        <button
          onClick={handleSearch}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-warm-400 transition-all hover:bg-warm-100 hover:text-warm-600"
          title="Search"
        >
          <Search className="h-[18px] w-[18px]" strokeWidth={1.8} />
        </button>

        {/* Analyses */}
        <Link href="/app">
          <button
            className={`flex h-10 w-10 items-center justify-center rounded-lg transition-all ${
              pathname === "/app" || pathname.startsWith("/results")
                ? "bg-gold/10 text-gold-dark"
                : "text-warm-400 hover:bg-warm-100 hover:text-warm-600"
            }`}
            title="Analyses"
          >
            <BarChart3 className="h-[18px] w-[18px]" strokeWidth={1.8} />
          </button>
        </Link>

        {/* Settings — opens popover with sign out */}
        <SettingsPopover />
      </nav>
    </aside>
  );
}

function DashboardTopBar() {
  const { isAuthenticated } = useConvexAuth();

  return (
    <header className="sticky top-0 z-20 border-b border-warm-300 bg-white/80 backdrop-blur-xl">
      <div className="flex h-14 items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <Link href="/app" className="flex items-center gap-2 transition-opacity hover:opacity-70">
            <div className="h-4 w-4 rounded bg-gradient-to-br from-gold to-gold-dark" />
            <span className="text-[13px] font-medium text-warm-700">
              Glasswork
            </span>
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
      <div className="relative min-h-screen bg-surface">
        <Sidebar />
        <div className="pl-[56px]">
          <DashboardTopBar />
          <main className="relative z-10 p-6">{children}</main>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-surface">
      <main className="relative z-10">{children}</main>
    </div>
  );
}
