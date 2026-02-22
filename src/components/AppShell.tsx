"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useConvexAuth, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";
import { useClickOutside } from "@/hooks/useClickOutside";
import { getInitials } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import {
  Search,
  LayoutGrid,
  BarChart3,
  FileText,
  Settings,
  LogOut,
  GitBranch,
} from "lucide-react";

interface AppShellProps {
  children: React.ReactNode;
}

/* ─── Settings Popover (for collapsed sidebar) ─── */

function SettingsPopover() {
  const { signOut } = useAuthActions();
  const user = useQuery(api.users.getCurrentUser);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);
  useClickOutside(ref, close);

  return (
    <div className="relative lg:hidden" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "group/settings relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200",
          open
            ? "bg-warm-100 text-warm-700"
            : "text-warm-400 hover:bg-warm-100 hover:text-warm-600"
        )}
        title="Settings & Account"
      >
        <Settings className="h-[18px] w-[18px]" strokeWidth={1.5} />
      </button>

      {open && (
        <div className="absolute bottom-0 left-[56px] z-50 min-w-[220px] overflow-hidden rounded-2xl border border-warm-200 bg-white shadow-layered-lg">
          {user && (
            <div className="flex items-center gap-3 border-b border-warm-100 px-4 py-3.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-warm-100">
                {user.image ? (
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
                    {getInitials(user.name)}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold text-warm-900">
                  {user.name ?? "Account"}
                </p>
                {user.email && (
                  <p className="truncate text-[11px] text-warm-500">
                    {user.email}
                  </p>
                )}
              </div>
            </div>
          )}
          <div className="py-1.5">
            <button
              onClick={() => {
                setOpen(false);
                void signOut();
              }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[13px] font-medium text-warm-500 transition-colors hover:bg-warm-50 hover:text-danger"
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

/* ─── Sidebar Nav Item ─── */

function SidebarNavItem({
  icon: Icon,
  label,
  isActive,
  href,
  onClick,
}: {
  icon: typeof LayoutGrid;
  label: string;
  isActive?: boolean;
  href?: string;
  onClick?: () => void;
}) {
  const inner = (
    <button
      onClick={onClick}
      className={cn(
        "group/icon relative flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 transition-all duration-200",
        isActive
          ? "bg-warm-200 text-warm-900"
          : "text-warm-500 hover:bg-warm-100 hover:text-warm-700"
      )}
    >
      <Icon className="h-[16px] w-[16px] shrink-0" strokeWidth={1.5} />
      <span
        className={cn(
          "hidden text-[11px] font-medium lg:block",
          isActive ? "text-warm-900" : "text-warm-500"
        )}
      >
        {label}
      </span>
      {/* Tooltip for collapsed sidebar */}
      <span className="pointer-events-none absolute left-[44px] whitespace-nowrap rounded-lg bg-warm-900 px-2.5 py-1 text-[11px] font-medium text-white opacity-0 shadow-md transition-opacity group-hover/icon:opacity-100 lg:hidden">
        {label}
      </span>
    </button>
  );

  if (href) {
    return <Link href={href}>{inner}</Link>;
  }
  return inner;
}

/* ─── Sidebar ─── */

function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const recentAnalyses = useQuery(api.analyses.listAnalyses, {});

  const handleSearch = () => {
    if (pathname !== "/app") {
      router.push("/app?search=1");
    } else {
      window.dispatchEvent(new CustomEvent("glasswork:focus-search"));
    }
  };

  const isAnalysesActive =
    pathname === "/app" || pathname.startsWith("/results");
  const isAnalyticsActive = pathname === "/app/analytics";
  const isReportsActive = pathname === "/app/reports";
  const isSettingsActive = pathname === "/app/settings";

  return (
    <aside className="fixed left-0 top-0 z-30 flex h-screen w-[56px] flex-col border-r border-warm-100 bg-warm-50/50 lg:w-[200px]">
      {/* Logo + Brand */}
      <div className="flex h-14 items-center gap-2 px-3 lg:px-4">
        <Link href="/" title="Back to home" className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-warm-900 shadow-sm transition-transform duration-200 hover:scale-105">
            <div className="grid h-3.5 w-3.5 grid-cols-2 gap-[2px]">
              <div className="h-1.5 w-1.5 rounded-[2px] bg-white" />
              <div className="h-1.5 w-1.5 rounded-[2px] bg-white" />
              <div className="h-1.5 w-1.5 rounded-[2px] bg-white" />
              <div className="h-1.5 w-1.5 rounded-[2px] bg-white" />
            </div>
          </div>
          <span className="hidden text-[13px] font-bold text-warm-800 lg:block">
            Glasswork
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="mt-2 flex flex-col gap-1 px-2 lg:px-3">
        <SidebarNavItem
          icon={Search}
          label="Search"
          onClick={handleSearch}
        />
        <SidebarNavItem
          icon={LayoutGrid}
          label="Analyses"
          href="/app"
          isActive={isAnalysesActive}
        />
        <SidebarNavItem
          icon={BarChart3}
          label="Analytics"
          href="/app/analytics"
          isActive={isAnalyticsActive}
        />
        <SidebarNavItem
          icon={FileText}
          label="Reports"
          href="/app/reports"
          isActive={isReportsActive}
        />
        <SidebarNavItem
          icon={Settings}
          label="Settings"
          href="/app/settings"
          isActive={isSettingsActive}
        />
      </nav>

      {/* Recent section (expanded sidebar only) */}
      <div className="mt-6 hidden px-4 lg:block">
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-warm-400">
          Recent
        </div>
        <div className="space-y-1">
          {recentAnalyses && recentAnalyses.length > 0 ? (
            recentAnalyses.slice(0, 3).map((a) => (
              <Link key={a._id} href={`/results/${a._id}`}>
                <div className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 transition-colors hover:bg-warm-100">
                  {a.sourceType === "github_repo" ? (
                    <GitBranch className="h-3 w-3 shrink-0 text-warm-400" />
                  ) : (
                    <FileText className="h-3 w-3 shrink-0 text-warm-400" />
                  )}
                  <span className="truncate text-[10px] text-warm-500">
                    {a.title}
                  </span>
                </div>
              </Link>
            ))
          ) : (
            <p className="px-2.5 text-[10px] text-warm-400">No analyses yet</p>
          )}
        </div>
      </div>

      {/* Bottom: Settings popover (collapsed sidebar only) */}
      <div className="mt-auto mb-4 flex justify-center lg:hidden">
        <SettingsPopover />
      </div>
    </aside>
  );
}

/* ─── User Avatar ─── */

function UserAvatar() {
  const user = useQuery(api.users.getCurrentUser);

  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-warm-200 ring-2 ring-white">
        {user?.image ? (
          <Image
            src={user.image}
            alt={user?.name ?? "Profile"}
            width={36}
            height={36}
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className="text-[11px] font-semibold text-warm-600">
            {getInitials(user?.name)}
          </span>
        )}
      </div>
      <div className="hidden min-w-0 lg:block">
        <p className="truncate text-[13px] font-semibold text-warm-800">
          {user?.name ?? "User"}
        </p>
        <p className="truncate text-[10px] text-warm-400">Analyst</p>
      </div>
    </div>
  );
}

/* ─── Top Bar ─── */

function DashboardTopBar() {
  return (
    <header className="sticky top-0 z-20 bg-white/70 backdrop-blur-xl">
      <div className="flex h-14 items-center justify-between px-6">
        {/* Left: Brand (hidden on lg where sidebar shows it) */}
        <Link
          href="/app"
          className="flex items-center gap-2 transition-opacity hover:opacity-70 lg:invisible"
        >
          <span className="font-display text-lg text-warm-800 tracking-tight italic">
            glasswork
          </span>
          <span className="text-[10px] font-medium text-warm-400 -ml-0.5 mt-1">
            studio
          </span>
        </Link>

        {/* Right: Avatar */}
        <UserAvatar />
      </div>
    </header>
  );
}

/* ─── App Shell ─── */

export function AppShell({ children }: AppShellProps) {
  const { isAuthenticated } = useConvexAuth();
  const pathname = usePathname();
  const isWorkspace =
    pathname.startsWith("/app") || pathname.startsWith("/results");
  const isSignIn = pathname === "/sign-in";

  if (isWorkspace && isAuthenticated) {
    return (
      <div className="relative min-h-screen bg-white grain-overlay">
        <Sidebar />
        <div className="relative z-10 pl-[56px] lg:pl-[200px]">
          <DashboardTopBar />
          <main className="relative">{children}</main>
        </div>
      </div>
    );
  }

  if (isSignIn) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-screen bg-surface">
      <main className="relative z-10">{children}</main>
    </div>
  );
}
