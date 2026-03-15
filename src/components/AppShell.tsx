"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useConvexAuth, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useTheme } from "next-themes";
import { api } from "../../convex/_generated/api";
import { useClickOutside } from "@/hooks/useClickOutside";
import { getInitials } from "@/lib/formatters";
import { NewAnalysisModal } from "@/components/NewAnalysisModal";
import {
  Home,
  Inbox,
  FolderKanban,
  ClipboardList,
  Settings,
  LogOut,
  Moon,
  Sun,
} from "lucide-react";

interface AppShellProps {
  children: React.ReactNode;
}

/* ─── Theme Toggle ─── */

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-8 w-8" />;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="flex h-8 w-8 items-center justify-center rounded-lg transition-all"
      style={{
        border: "1px solid var(--app-card-border)",
        background: "var(--app-hover-bg)",
        color: "var(--app-text-muted)",
      }}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="h-[14px] w-[14px]" strokeWidth={1.5} />
      ) : (
        <Moon className="h-[14px] w-[14px]" strokeWidth={1.5} />
      )}
    </button>
  );
}

/* ─── User Avatar + Dropdown ─── */

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
        className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition-colors"
        style={{ background: open ? "var(--app-hover-bg)" : "transparent" }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.background = "var(--app-hover-bg)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.background = open ? "var(--app-hover-bg)" : "transparent")
        }
      >
        <div
          className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full ring-2 ring-[rgba(81,139,219,0.30)]"
          style={{
            background: "var(--app-accent-muted)",
          }}
        >
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
            <span
              className="text-[11px] font-semibold"
              style={{ color: "var(--app-accent)" }}
            >
              {getInitials(user?.name)}
            </span>
          )}
          <span
            className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[var(--app-bg)]"
          />
        </div>
        <div className="hidden min-w-0 lg:block">
          <p
            className="truncate text-[13px] font-semibold"
            style={{ color: "var(--app-text)", fontFamily: "var(--font-body)" }}
          >
            {user?.name ?? "User"}
          </p>
        </div>
      </button>

      {open && (
        <div
          className="absolute right-0 top-full z-50 mt-2 min-w-[220px] overflow-hidden rounded-2xl shadow-lg"
          style={{
            border: "1px solid var(--app-card-border)",
            background: "var(--app-card-bg)",
            backdropFilter: "blur(16px)",
          }}
        >
          {user && (
            <div
              className="flex items-center gap-3 px-4 py-3.5"
              style={{ borderBottom: "1px solid var(--app-card-border)" }}
            >
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full"
                style={{ background: "var(--app-accent-muted)" }}
              >
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
                  <span
                    className="text-[11px] font-semibold"
                    style={{ color: "var(--app-accent)" }}
                  >
                    {getInitials(user.name)}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <p
                  className="truncate text-[13px] font-semibold"
                  style={{ color: "var(--app-text)", fontFamily: "var(--font-body)" }}
                >
                  {user.name ?? "Account"}
                </p>
                {user.email && (
                  <p
                    className="truncate text-[11px]"
                    style={{ color: "var(--app-text-muted)", fontFamily: "var(--font-body)" }}
                  >
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
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[13px] font-medium transition-colors"
              style={{ color: "var(--app-text-muted)", fontFamily: "var(--font-body)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--app-hover-bg)";
                e.currentTarget.style.color = "var(--app-text)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "var(--app-text-muted)";
              }}
            >
              <Settings className="h-3.5 w-3.5" strokeWidth={1.5} />
              Settings
            </Link>
            <button
              onClick={() => {
                setOpen(false);
                void signOut();
              }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[13px] font-medium transition-colors"
              style={{ color: "var(--app-text-muted)", fontFamily: "var(--font-body)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--app-danger-muted)";
                e.currentTarget.style.color = "var(--app-danger)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "var(--app-text-muted)";
              }}
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
      className="group/item relative flex w-full items-center gap-2.5 rounded-lg py-2 transition-all duration-150"
      style={{
        background: isActive ? "var(--app-active-bg)" : "transparent",
        color: isActive ? "var(--app-active-text)" : "var(--app-text-muted)",
        borderLeft: isActive ? "2px solid #518BDB" : "2px solid transparent",
        paddingLeft: isActive ? "8px" : "10px",
        paddingRight: "10px",
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = "rgba(255,255,255,0.05)";
          e.currentTarget.style.color = "rgba(255,255,255,0.70)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "var(--app-text-muted)";
        }
      }}
    >
      <Icon
        className="h-[18px] w-[18px] shrink-0"
        strokeWidth={isActive ? 2 : 1.5}
      />
      <span
        className="hidden text-[13px] lg:block"
        style={{
          fontWeight: isActive ? 600 : 400,
          fontFamily: "var(--font-body)",
        }}
      >
        {label}
      </span>
      {badge !== undefined && badge > 0 && (
        <span
          className="ml-auto hidden min-w-[20px] items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold text-white lg:flex"
          style={{ background: "var(--app-accent)" }}
        >
          {badge > 99 ? "99+" : badge}
        </span>
      )}
      {/* Tooltip for collapsed sidebar */}
      <span
        className="pointer-events-none absolute left-[52px] whitespace-nowrap rounded-lg px-2.5 py-1 text-[11px] font-medium opacity-0 shadow-md transition-opacity group-hover/item:opacity-100 lg:hidden"
        style={{
          background: "var(--app-card-bg)",
          color: "var(--app-text)",
          border: "1px solid var(--app-card-border)",
          fontFamily: "var(--font-body)",
        }}
      >
        {label}
      </span>
    </button>
  );

  if (href) return <Link href={href}>{inner}</Link>;
  return inner;
}

/* ─── Sidebar ─── */

function Sidebar() {
  const pathname = usePathname();
  const unreadCount = useQuery(api.notifications.getUnreadCount);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isHomeActive = pathname === "/app" || pathname.startsWith("/results");
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
      <aside
        className="fixed left-0 top-0 z-30 flex h-screen w-[56px] flex-col lg:w-[200px] sidebar-gradient"
        style={{
          borderRight: "1px solid var(--app-sidebar-border)",
        }}
      >
        {/* Logo */}
        <div className="flex h-14 items-center gap-2.5 px-3 lg:px-4">
          <Link href="/" title="Back to home" className="flex items-center gap-2">
            <span className="relative flex h-[7px] w-[7px] shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-[7px] w-[7px] rounded-full bg-emerald-500" />
            </span>
            <span
              className="hidden lg:block text-[15px] font-semibold tracking-[-0.02em]"
              style={{ color: "var(--app-text)", fontFamily: "var(--font-body)" }}
            >
              glass<span style={{ color: "var(--app-accent)" }}>work</span>
            </span>
            <img
              src="/logo.png"
              alt="Glasswork"
              className="h-7 w-7 rounded-lg object-contain lg:hidden"
            />
          </Link>
        </div>

        {/* New Analysis button */}
        <div className="px-2 lg:px-3 mb-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex w-full items-center justify-center gap-2 rounded-lg px-2.5 py-2 text-[12px] font-semibold transition-all duration-150 active:scale-[0.97]"
            style={{
              background: "var(--app-accent-muted)",
              border: "1px solid var(--app-accent-border)",
              color: "var(--app-accent)",
              fontFamily: "var(--font-body)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(81,139,219,0.16)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--app-accent-muted)";
            }}
          >
            <span className="text-[14px] leading-none font-light">+</span>
            <span className="hidden lg:block">New Analysis</span>
            <span
              className="ml-auto hidden text-[9px] font-mono lg:block"
              style={{ color: "var(--app-accent)", opacity: 0.55 }}
            >
              ⌘K
            </span>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-0.5 px-2 lg:px-3">
          <SidebarNavItem icon={Home} label="Home" href="/app" isActive={isHomeActive} />
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

        {/* Bottom: Settings gear */}
        <div className="mt-auto mb-4 px-2 lg:px-3">
          <SettingsButton />
        </div>
      </aside>

      <NewAnalysisModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}

/* ─── Settings button (bottom of sidebar) ─── */

function SettingsButton() {
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
        className="group/settings relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-150"
        style={{
          background: open ? "var(--app-hover-bg)" : "transparent",
          color: "var(--app-text-muted)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "var(--app-hover-bg)";
          e.currentTarget.style.color = "var(--app-text)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = open ? "var(--app-hover-bg)" : "transparent";
          e.currentTarget.style.color = "var(--app-text-muted)";
        }}
        title="Settings & Account"
      >
        <Settings className="h-[18px] w-[18px]" strokeWidth={1.5} />
      </button>

      {open && (
        <div
          className="absolute bottom-0 left-[56px] z-50 min-w-[220px] overflow-hidden rounded-2xl shadow-lg lg:bottom-auto lg:left-auto lg:right-0 lg:top-full lg:mt-2"
          style={{
            border: "1px solid var(--app-card-border)",
            background: "var(--app-sidebar-bg)",
            backdropFilter: "blur(16px)",
          }}
        >
          {user && (
            <div
              className="flex items-center gap-3 px-4 py-3.5"
              style={{ borderBottom: "1px solid var(--app-card-border)" }}
            >
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full"
                style={{ background: "var(--app-accent-muted)" }}
              >
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
                  <span
                    className="text-[11px] font-semibold"
                    style={{ color: "var(--app-accent)" }}
                  >
                    {getInitials(user.name)}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <p
                  className="truncate text-[13px] font-semibold"
                  style={{ color: "var(--app-text)", fontFamily: "var(--font-body)" }}
                >
                  {user.name ?? "Account"}
                </p>
                {user.email && (
                  <p
                    className="truncate text-[11px]"
                    style={{ color: "var(--app-text-muted)", fontFamily: "var(--font-body)" }}
                  >
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
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[13px] font-medium transition-colors"
              style={{ color: "var(--app-text-muted)", fontFamily: "var(--font-body)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--app-hover-bg)";
                e.currentTarget.style.color = "var(--app-text)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "var(--app-text-muted)";
              }}
            >
              <Settings className="h-3.5 w-3.5" strokeWidth={1.5} />
              Settings
            </Link>
            <button
              onClick={() => {
                setOpen(false);
                void signOut();
              }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[13px] font-medium transition-colors"
              style={{ color: "var(--app-text-muted)", fontFamily: "var(--font-body)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--app-danger-muted)";
                e.currentTarget.style.color = "var(--app-danger)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "var(--app-text-muted)";
              }}
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

/* ─── Top Bar ─── */

function DashboardTopBar() {
  return (
    <header
      className="sticky top-0 z-20"
      style={{
        background: "rgba(17, 17, 20, 0.85)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <div className="flex h-14 items-center justify-between px-6">
        {/* Logo — visible on mobile (sidebar is icon-only) */}
        <Link
          href="/app"
          className="flex items-center gap-2 transition-opacity hover:opacity-70 lg:invisible"
        >
          <span
            className="text-[15px] font-semibold tracking-[-0.02em]"
            style={{ color: "var(--app-text)", fontFamily: "var(--font-body)" }}
          >
            glass<span style={{ color: "var(--app-accent)" }}>work</span>
          </span>
        </Link>

        {/* Right side: theme toggle + user avatar */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserAvatar />
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
      <div
        className="relative min-h-screen"
        style={{ background: "var(--app-bg)" }}
      >
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
    <div
      className="relative min-h-screen"
      style={{ background: "var(--page-bg)" }}
    >
      <main className="relative z-10">{children}</main>
    </div>
  );
}
