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
  Smile,
  Layers,
  LayoutGrid,
  Circle,
  SlidersHorizontal,
  Link2,
  Settings,
  LogOut,
  Mail,
  Bell,
  HelpCircle,
  BarChart3,
} from "lucide-react";

interface AppShellProps {
  children: React.ReactNode;
}

/* ─── Settings Popover ─── */

function SettingsPopover() {
  const { signOut } = useAuthActions();
  const user = useQuery(api.users.getCurrentUser);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);
  useClickOutside(ref, close);

  return (
    <div className="relative" ref={ref}>
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

/* ─── Sidebar Icon ─── */

function SidebarIcon({
  icon: Icon,
  label,
  isActive,
  href,
  onClick,
}: {
  icon: typeof BarChart3;
  label: string;
  isActive?: boolean;
  href?: string;
  onClick?: () => void;
}) {
  const content = (
    <button
      onClick={onClick}
      className={cn(
        "group/icon relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200",
        isActive
          ? "bg-white/80 text-warm-800 shadow-sm"
          : "text-warm-400 hover:bg-white/60 hover:text-warm-600"
      )}
      title={label}
    >
      <Icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
      <span className="pointer-events-none absolute left-[52px] whitespace-nowrap rounded-lg bg-warm-900 px-2.5 py-1 text-[11px] font-medium text-white opacity-0 shadow-md transition-opacity group-hover/icon:opacity-100">
        {label}
      </span>
    </button>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}

/* ─── Sidebar ─── */

function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleSearch = () => {
    if (pathname !== "/app") {
      router.push("/app?search=1");
    } else {
      window.dispatchEvent(new CustomEvent("glasswork:focus-search"));
    }
  };

  const isAnalysesActive =
    pathname === "/app" || pathname.startsWith("/results");

  return (
    <aside className="fixed left-0 top-0 z-30 flex h-screen w-[56px] flex-col items-center bg-transparent">
      <div className="flex h-14 items-center justify-center">
        <Link href="/app">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-warm-900 shadow-sm transition-transform duration-200 hover:scale-105">
            <div className="grid h-4 w-4 grid-cols-2 gap-[2px]">
              <div className="h-1.5 w-1.5 rounded-[2px] bg-brand" />
              <div className="h-1.5 w-1.5 rounded-[2px] bg-white" />
              <div className="h-1.5 w-1.5 rounded-[2px] bg-white" />
              <div className="h-1.5 w-1.5 rounded-[2px] bg-white" />
            </div>
          </div>
        </Link>
      </div>

      <nav className="mt-2 flex flex-1 flex-col items-center gap-1">
        <SidebarIcon icon={Search} label="Search" onClick={handleSearch} />
        <SidebarIcon icon={Smile} label="Feedback" />
        <SidebarIcon icon={Layers} label="Collections" />
        <SidebarIcon
          icon={LayoutGrid}
          label="Analyses"
          href="/app"
          isActive={isAnalysesActive}
        />
        <SidebarIcon icon={Circle} label="Projects" />
        <SidebarIcon icon={SlidersHorizontal} label="Workflows" />
        <SidebarIcon icon={Link2} label="Connections" />
        <SidebarIcon icon={Layers} label="Integrations" />
      </nav>

      <div className="mb-4">
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

const TIME_FILTERS = ["Today", "This Week", "This Month", "Reports"] as const;

function DashboardTopBar() {
  const [activeFilter, setActiveFilter] = useState<string>("This Month");

  return (
    <header className="sticky top-0 z-20 bg-white/70 backdrop-blur-xl">
      <div className="flex h-14 items-center justify-between px-6">
        {/* Left: Brand */}
        <Link
          href="/app"
          className="flex items-center gap-2 transition-opacity hover:opacity-70"
        >
          <span className="font-display text-lg text-warm-800 tracking-tight italic">
            glasswork
          </span>
          <span className="text-[10px] font-medium text-warm-400 -ml-0.5 mt-1">
            studio
          </span>
        </Link>

        {/* Center: Time filter pills */}
        <div className="hidden items-center gap-1 rounded-full border border-warm-200 bg-white p-1 shadow-sm md:flex">
          {TIME_FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={cn(
                "rounded-full px-4 py-1.5 text-[12px] font-semibold transition-all duration-200",
                activeFilter === filter
                  ? "bg-warm-900 text-white shadow-sm"
                  : "text-warm-500 hover:text-warm-700 hover:bg-warm-50"
              )}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Right: Icon actions + Avatar */}
        <div className="flex items-center gap-1">
          {[Mail, Bell, HelpCircle, Settings].map((Icon, i) => (
            <button
              key={i}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-warm-400 transition-colors hover:bg-warm-100 hover:text-warm-600"
            >
              <Icon className="h-4 w-4" strokeWidth={1.5} />
            </button>
          ))}
          <div className="ml-3 border-l border-warm-200 pl-4">
            <UserAvatar />
          </div>
        </div>
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
        <div className="relative z-10 pl-[56px]">
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
