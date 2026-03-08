"use client";

import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useConvexAuth, useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { GlassPanel } from "@/components/GlassPanel";
import { Skeleton } from "@/components/ui/skeleton";
import { formatTimeAgo } from "@/lib/formatters";
import {
  Trophy,
  CheckCircle2,
  ArrowUpDown,
  Flame,
  Inbox,
  CheckCheck,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Id } from "../../../../convex/_generated/dataModel";

const NOTIFICATION_ICONS = {
  analysis_complete: CheckCircle2,
  mvp_status: Trophy,
  tier_change: ArrowUpDown,
  streak_milestone: Flame,
} as const;

const NOTIFICATION_COLORS = {
  analysis_complete: "text-[#5BA8C8] bg-[#5BA8C8]/10",
  mvp_status: "text-[#404040] bg-[#404040]/10",
  tier_change: "text-warm-600 bg-warm-100",
  streak_milestone: "text-[#404040] bg-[#404040]/10",
} as const;

export default function InboxPageWrapper() {
  return (
    <Suspense>
      <InboxPage />
    </Suspense>
  );
}

function InboxPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const notifications = useQuery(api.notifications.listNotifications, {});
  const markRead = useMutation(api.notifications.markRead);
  const markAllRead = useMutation(api.notifications.markAllRead);
  const deleteNotification = useMutation(api.notifications.deleteNotification);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isAuthLoading, router]);

  if (isAuthLoading || notifications === undefined) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-10 w-48 rounded-xl bg-warm-200" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[80px] rounded-2xl bg-warm-100" />
        ))}
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleClick = async (notificationId: string, analysisId?: string) => {
    await markRead({ notificationId: notificationId as Id<"notifications"> });
    if (analysisId) {
      router.push(`/results/${analysisId}`);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="hero-fade-in flex items-end justify-between">
        <div>
          <p className="text-[13px] font-medium text-warm-400">
            Stay up to date
          </p>
          <div className="mt-0.5 flex items-center gap-3">
            <h1 className="text-[28px] font-bold tracking-tight text-warm-900">
              Inbox
            </h1>
            {unreadCount > 0 && (
              <span className="rounded-full bg-carry px-2.5 py-0.5 text-[11px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </div>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllRead({})}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium text-warm-500 transition-colors hover:bg-warm-100 hover:text-warm-700"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Mark all read
          </button>
        )}
      </div>

      {/* Notification list */}
      {notifications.length === 0 ? (
        <div className="hero-fade-in flex flex-col items-center justify-center rounded-2xl border border-dashed border-warm-300 bg-warm-50/50 py-20" style={{ animationDelay: "0.08s" }}>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-warm-100">
            <Inbox className="h-6 w-6 text-warm-400" />
          </div>
          <h3 className="mt-4 text-[16px] font-semibold text-warm-800">No notifications yet</h3>
          <p className="mt-1 text-[13px] text-warm-500">
            Notifications will appear here when analyses complete
          </p>
        </div>
      ) : (
        <div className="hero-fade-in space-y-2" style={{ animationDelay: "0.04s" }}>
          {notifications.map((n) => {
            const IconComponent = NOTIFICATION_ICONS[n.type] || CheckCircle2;
            const colorClass = NOTIFICATION_COLORS[n.type] || "text-warm-500 bg-warm-100";

            return (
              <div key={n._id} className={cn("relative", !n.read && "relative")}>
                <button
                  onClick={() => handleClick(n._id, n.analysisId ?? undefined)}
                  className="w-full text-left transition-all duration-200"
                >
                  <GlassPanel className={cn(
                    "flex items-start gap-4 p-4 pr-12",
                    !n.read && "border-[#404040]/20"
                  )}>
                    {/* Unread dot */}
                    {!n.read && (
                      <div className="absolute left-2 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-[#404040]" />
                    )}

                    {/* Icon */}
                    <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", colorClass)}>
                      <IconComponent className="h-5 w-5" />
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <p className={cn(
                        "text-[13px] text-warm-800",
                        !n.read ? "font-semibold" : "font-medium"
                      )}>
                        {n.title}
                      </p>
                      <p className="mt-0.5 text-[12px] text-warm-500">{n.body}</p>
                    </div>

                    {/* Time */}
                    <span className="shrink-0 text-[11px] text-warm-400">
                      {formatTimeAgo(n.createdAt)}
                    </span>
                  </GlassPanel>
                </button>
                {/* Delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    void deleteNotification({ notificationId: n._id });
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-lg text-warm-300 transition-colors hover:bg-warm-100 hover:text-warm-600"
                  title="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
