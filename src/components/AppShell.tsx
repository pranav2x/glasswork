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
  Smile,
  Layers,
  LayoutGrid,
  Circle,
  SlidersHorizontal,
  Link2,
  Settings,
  LogOut,
  ChevronDown,
  UserPlus,
  BarChart3,
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
        className={`group/settings relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 ${
          open
            ? "bg-warm-100 text-warm-700"
            : "text-warm-400 hover:bg-warm-100 hover:text-warm-600"
        }`}
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
      className={`group/icon relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 ${
        isActive
          ? "bg-warm-100 text-warm-700"
          : "text-warm-400 hover:bg-warm-100 hover:text-warm-600"
      }`}
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

function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleSearch = () => {
    if (pathname !== "/app") {
      router.push("/app");
      setTimeout(() => {
        const searchBtn =
          document.querySelector<HTMLButtonElement>("[data-search-trigger]");
        searchBtn?.click();
      }, 200);
    } else {
      const searchInput =
        document.querySelector<HTMLInputElement>("[data-search-input]");
      const searchBtn =
        document.querySelector<HTMLButtonElement>("[data-search-trigger]");
      if (searchInput) {
        searchInput.focus();
      } else {
        searchBtn?.click();
      }
    }
  };

  const isAnalysesActive =
    pathname === "/app" || pathname.startsWith("/results");

  return (
    <aside className="fixed left-0 top-0 z-30 flex h-screen w-[56px] flex-col items-center border-r border-warm-200 bg-white">
      <div className="flex h-14 items-center justify-center">
        <Link href="/app">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warm-900 shadow-sm transition-transform duration-200 hover:scale-105">
            <span className="text-[11px] font-bold text-white">G</span>
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

function UserAvatar() {
  const user = useQuery(api.users.getCurrentUser);

  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-warm-200">
      {user?.image ? (
        <Image
          src={user.image}
          alt={user?.name ?? "Profile"}
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
    </div>
  );
}

function DashboardTopBar() {
  return (
    <header className="sticky top-0 z-20 border-b border-warm-200/60 bg-white/80 backdrop-blur-xl">
      <div className="flex h-14 items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <Link
            href="/app"
            className="flex items-center gap-2 transition-opacity hover:opacity-70"
          >
            <div className="h-4 w-4 rounded bg-warm-900" />
            <span className="text-[13px] font-semibold text-warm-700">
              Glasswork
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-[13px] font-medium text-warm-500 transition-colors hover:bg-warm-50 hover:text-warm-700">
            Manage
            <ChevronDown className="h-3 w-3 opacity-50" />
          </button>

          <button className="flex items-center gap-1.5 rounded-lg bg-warm-900 px-3.5 py-1.5 text-[13px] font-semibold text-white shadow-sm transition-all duration-200 hover:bg-warm-800">
            <UserPlus className="h-3.5 w-3.5" />
            Invite
          </button>

          <UserAvatar />
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
  const isSignIn = pathname === "/sign-in";

  if (isWorkspace && isAuthenticated) {
    return (
      <div className="relative min-h-screen bg-surface grain-overlay">
        <Sidebar />
        <div className="pl-[56px]">
          <DashboardTopBar />
          <main className="relative z-10 p-6">{children}</main>
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
