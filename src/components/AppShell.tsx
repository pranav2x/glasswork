"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useConvexAuth, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";
import { useClickOutside } from "@/hooks/useClickOutside";
import { getInitials } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import {
  Home,
  Inbox,
  FolderKanban,
  Settings,
  LogOut,
} from "lucide-react";

interface AppShellProps {
  children: React.ReactNode;
}

/* ─── Settings Popover (for collapsed sidebar on mobile) ─── */

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
        <div className="absolute bottom-0 left-[56px] z-50 min-w-[220px] overflow-hidden rounded-2xl border border-white/[0.25] bg-white/80 backdrop-blur-xl shadow-layered-lg lg:bottom-auto lg:left-auto lg:right-0 lg:top-full lg:mt-2">
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
            <Link
              href="/app/settings"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[13px] font-medium text-warm-500 transition-colors hover:bg-warm-50 hover:text-warm-700"
            >
              <Settings className="h-3.5 w-3.5" />
              Settings
            </Link>
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
  badge,
}: {
  icon: typeof Home;
  label: string;
  isActive?: boolean;
  href?: string;
  onClick?: () => void;
  badge?: number;
}) {
  const inner = (
    <button
      onClick={onClick}
      className={cn(
        "group/icon relative flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 transition-all duration-200",
        isActive
          ? "bg-white/50 text-warm-900 shadow-sm"
          : "text-warm-500 hover:bg-white/30 hover:text-warm-700"
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
      {/* Unread badge */}
      {badge !== undefined && badge > 0 && (
        <span className="absolute right-1.5 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-carry px-1 text-[9px] font-bold text-white lg:relative lg:right-auto lg:top-auto lg:ml-auto">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
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
  const unreadCount = useQuery(api.notifications.getUnreadCount);

  const isHomeActive =
    pathname === "/app" || pathname.startsWith("/results");
  const isInboxActive = pathname === "/app/inbox";
  const isProjectsActive = pathname === "/app/projects";

  return (
    <aside className="fixed left-0 top-0 z-30 flex h-screen w-[56px] flex-col border-r border-white/[0.25] bg-[#FFF5EB]/[0.12] backdrop-blur-[20px] lg:w-[200px]">
      {/* Logo + Brand */}
      <div className="flex h-14 items-center gap-2 px-3 lg:px-4">
        <Link href="/" title="Back to home" className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl shadow-sm transition-transform duration-200 hover:scale-105">
            <img src="/logo.png" alt="Glasswork" className="h-8 w-8 rounded-xl object-contain" />
          </div>
          <span className="hidden text-[13px] font-bold text-warm-800 lg:block">
            Glasswork
          </span>
        </Link>
      </div>

      {/* Navigation — 3 primary destinations */}
      <nav className="mt-2 flex flex-col gap-1 px-2 lg:px-3">
        <SidebarNavItem
          icon={Home}
          label="Home"
          href="/app"
          isActive={isHomeActive}
        />
        <SidebarNavItem
          icon={Inbox}
          label="Inbox"
          href="/app/inbox"
          isActive={isInboxActive}
          badge={unreadCount ?? undefined}
        />
        <SidebarNavItem
          icon={FolderKanban}
          label="Projects"
          href="/app/projects"
          isActive={isProjectsActive}
        />
      </nav>

      {/* Bottom: Settings */}
      <div className="mt-auto mb-4 px-2 lg:px-3">
        <SettingsPopover />
      </div>
    </aside>
  );
}

/* ─── User Avatar with Settings Dropdown ─── */

function UserAvatar() {
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
        className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition-colors hover:bg-warm-100/60"
      >
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
        </div>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 min-w-[220px] overflow-hidden rounded-2xl border border-warm-200/50 bg-white/90 backdrop-blur-xl shadow-lg">
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
            <Link
              href="/app/settings"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[13px] font-medium text-warm-500 transition-colors hover:bg-warm-50 hover:text-warm-700"
            >
              <Settings className="h-3.5 w-3.5" />
              Settings
            </Link>
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

/* ─── Top Bar ─── */

function DashboardTopBar() {
  return (
    <header className="sticky top-0 z-20 bg-[#FFF8F0]/80 backdrop-blur-xl border-b border-warm-200/30">
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
      <div className="relative min-h-screen grain-overlay">
        {/* Warm cream gradient background */}
        <div className="fixed inset-0 -z-10" style={{ background: "linear-gradient(135deg, #FFF8F0 0%, #FBF7F4 40%, #F5F0EB 100%)" }} />
        <div className="fixed -left-[200px] -top-[200px] -z-10 h-[600px] w-[600px] rounded-full bg-[#FFE8D4] opacity-30 blur-[120px]" />
        <div className="fixed -bottom-[100px] -right-[100px] -z-10 h-[500px] w-[500px] rounded-full bg-[#FFF0D4] opacity-25 blur-[120px]" />
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
