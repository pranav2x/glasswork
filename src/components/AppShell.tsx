"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useConvexAuth, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";
import { useClickOutside } from "@/hooks/useClickOutside";
import { getInitials } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { NewAnalysisModal } from "@/components/NewAnalysisModal";
import {
  Home,
  Inbox,
  FolderKanban,
  ClipboardList,
  Settings,
  LogOut,
} from "lucide-react";

interface AppShellProps {
  children: React.ReactNode;
}

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
            ? "bg-white/[0.08] text-warm-800"
            : "text-warm-500 hover:bg-white/[0.06] hover:text-warm-700"
        )}
        title="Settings & Account"
      >
        <Settings className="h-[18px] w-[18px]" strokeWidth={1.5} />
      </button>

      {open && (
        <div className="absolute bottom-0 left-[56px] z-50 min-w-[220px] overflow-hidden rounded-2xl border border-white/[0.10] bg-surface-2 shadow-layered-lg lg:bottom-auto lg:left-auto lg:right-0 lg:top-full lg:mt-2">
          {user && (
            <div className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-3.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/[0.06]">
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
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[13px] font-medium text-warm-600 transition-colors hover:bg-white/[0.06] hover:text-warm-800"
            >
              <Settings className="h-3.5 w-3.5" strokeWidth={1.5} />
              Settings
            </Link>
            <button
              onClick={() => {
                setOpen(false);
                void signOut();
              }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[13px] font-medium text-warm-600 transition-colors hover:bg-danger/10 hover:text-danger"
            >
              <LogOut className="h-3.5 w-3.5" strokeWidth={1.5} />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SidebarNavItem({
  icon: Icon,
  label,
  isActive,
  href,
  onClick,
  badge,
  shortcut,
}: {
  icon: typeof Home;
  label: string;
  isActive?: boolean;
  href?: string;
  onClick?: () => void;
  badge?: number;
  shortcut?: string;
}) {
  const inner = (
    <button
      onClick={onClick}
      className={cn(
        "group/icon relative flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 transition-all duration-200",
        isActive
          ? "bg-brand/15 text-brand font-semibold border border-brand/20 shadow-[0_0_12px_rgba(124,111,255,0.15)]"
          : "text-warm-500 hover:text-warm-800 hover:bg-white/[0.04]"
      )}
    >
      <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.5} />
      <span
        className={cn(
          "hidden text-[11px] font-medium lg:block",
          isActive ? "text-brand" : "text-warm-500"
        )}
      >
        {label}
      </span>
      {shortcut && (
        <span className="ml-auto hidden text-[9px] font-mono text-warm-400 lg:block">
          {shortcut}
        </span>
      )}
      {badge !== undefined && badge > 0 && (
        <span className="absolute right-1.5 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand px-1 text-[9px] font-bold text-white lg:relative lg:right-auto lg:top-auto lg:ml-auto">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
      <span className="pointer-events-none absolute left-[44px] whitespace-nowrap rounded-lg bg-surface-3 px-2.5 py-1 text-[11px] font-medium text-warm-800 opacity-0 shadow-md transition-opacity group-hover/icon:opacity-100 lg:hidden">
        {label}
      </span>
    </button>
  );

  if (href) {
    return <Link href={href}>{inner}</Link>;
  }
  return inner;
}

function Sidebar() {
  const pathname = usePathname();
  const unreadCount = useQuery(api.notifications.getUnreadCount);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isHomeActive =
    pathname === "/app" || pathname.startsWith("/results");
  const isInboxActive = pathname === "/app/inbox";
  const isProjectsActive = pathname === "/app/projects";
  const isReportsActive = pathname.startsWith("/app/reports");

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsModalOpen(true);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <aside className="fixed left-0 top-0 z-30 flex h-screen w-[56px] flex-col border-r border-white/[0.06] bg-surface-1 lg:w-[200px]">
        {/* Logo */}
        <div className="flex h-14 items-center gap-2.5 px-3 lg:px-4">
          <Link href="/" title="Back to home" className="flex items-center gap-2.5">
            <span className="animate-online-pulse inline-block h-2 w-2 rounded-full bg-emerald-400 shrink-0" />
            <span className="hidden font-black text-[20px] tracking-tight text-warm-900 lg:block">
              glass<span className="text-brand">work</span>
            </span>
            <img src="/logo.png" alt="Glasswork" className="h-7 w-7 rounded-lg object-contain lg:hidden" />
          </Link>
        </div>

        {/* New Analysis button */}
        <div className="px-2 lg:px-3 mb-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand/15 px-2.5 py-2 text-[11px] font-semibold text-brand border border-brand/20 transition-all duration-200 hover:bg-brand/25 hover:shadow-[0_0_16px_rgba(124,111,255,0.2)] active:scale-[0.97]"
          >
            <span className="text-[14px] leading-none">+</span>
            <span className="hidden lg:block">New Analysis</span>
            <span className="ml-auto hidden text-[9px] font-mono text-brand/60 lg:block">⌘K</span>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 px-2 lg:px-3">
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
          <SidebarNavItem
            icon={ClipboardList}
            label="Reports"
            href="/app/reports"
            isActive={isReportsActive}
          />
        </nav>

        {/* Bottom: Settings */}
        <div className="mt-auto mb-4 px-2 lg:px-3">
          <SettingsPopover />
        </div>
      </aside>

      <NewAnalysisModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}

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
        className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition-colors hover:bg-white/[0.06]"
      >
        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/[0.08] ring-2 ring-emerald-400/40">
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
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-surface" />
        </div>
        <div className="hidden min-w-0 lg:block">
          <p className="truncate text-[13px] font-semibold text-warm-800">
            {user?.name ?? "User"}
          </p>
        </div>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 min-w-[220px] overflow-hidden rounded-2xl border border-white/[0.10] bg-surface-2 shadow-layered-lg">
          {user && (
            <div className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-3.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/[0.06]">
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
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[13px] font-medium text-warm-600 transition-colors hover:bg-white/[0.06] hover:text-warm-800"
            >
              <Settings className="h-3.5 w-3.5" strokeWidth={1.5} />
              Settings
            </Link>
            <button
              onClick={() => {
                setOpen(false);
                void signOut();
              }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[13px] font-medium text-warm-600 transition-colors hover:bg-danger/10 hover:text-danger"
            >
              <LogOut className="h-3.5 w-3.5" strokeWidth={1.5} />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function DashboardTopBar() {
  return (
    <header className="sticky top-0 z-20 bg-surface/80 backdrop-blur-xl border-b border-white/[0.04]">
      <div className="flex h-14 items-center justify-between px-6">
        <Link
          href="/app"
          className="flex items-center gap-2 transition-opacity hover:opacity-70 lg:invisible"
        >
          <span className="font-black text-lg text-warm-900 tracking-tight">
            glass<span className="text-brand">work</span>
          </span>
        </Link>
        <UserAvatar />
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
      <div className="relative min-h-screen">
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
