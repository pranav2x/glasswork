import { v } from "convex/values";
import { query, internalQuery } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Returns the current authenticated user's profile row.
 * @convex-dev/auth automatically populates name, image, email when signing in.
 */
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return await ctx.db.get(userId);
  },
});

/**
 * Internal query to get a user by ID (used by analysis actions).
 */
export const getUserInternal = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});
