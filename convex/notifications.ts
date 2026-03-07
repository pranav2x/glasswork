import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * List notifications for the current user, most recent first.
 */
export const listNotifications = query({
  args: {
    onlyUnread: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    let notifications;
    if (args.onlyUnread) {
      notifications = await ctx.db
        .query("notifications")
        .withIndex("by_userId_read", (q) => q.eq("userId", userId).eq("read", false))
        .collect();
    } else {
      notifications = await ctx.db
        .query("notifications")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .collect();
    }

    notifications.sort((a, b) => b.createdAt - a.createdAt);
    return notifications;
  },
});

/**
 * Get unread notification count for sidebar badge.
 */
export const getUnreadCount = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return 0;

    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_userId_read", (q) => q.eq("userId", userId).eq("read", false))
      .collect();

    return unread.length;
  },
});

/**
 * Mark a single notification as read.
 */
export const markRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.notificationId, { read: true });
  },
});

/**
 * Mark all notifications as read for current user.
 */
export const markAllRead = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return;

    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_userId_read", (q) => q.eq("userId", userId).eq("read", false))
      .collect();

    for (const n of unread) {
      await ctx.db.patch(n._id, { read: true });
    }
  },
});

/**
 * Delete a single notification for the current user.
 */
export const deleteNotification = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return;
    const notification = await ctx.db.get(args.notificationId);
    if (notification?.userId === userId) {
      await ctx.db.delete(args.notificationId);
    }
  },
});

/**
 * Internal: create a notification (called from analysis pipeline).
 */
export const createNotification = internalMutation({
  args: {
    userId: v.id("users"),
    type: v.union(
      v.literal("tier_change"),
      v.literal("mvp_status"),
      v.literal("analysis_complete"),
      v.literal("streak_milestone")
    ),
    title: v.string(),
    body: v.string(),
    analysisId: v.optional(v.id("analyses")),
    contributorName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("notifications", {
      ...args,
      read: false,
      createdAt: Date.now(),
    });
  },
});
