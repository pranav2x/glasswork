import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const join = mutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();

    // Check for duplicate
    const existing = await ctx.db
      .query("waitlist")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (existing) {
      const position = await ctx.db.query("waitlist").collect();
      const pos = position.findIndex((w) => w._id === existing._id) + 1;
      return { alreadyJoined: true, position: pos };
    }

    await ctx.db.insert("waitlist", {
      email,
      name: args.name?.trim() || undefined,
      createdAt: Date.now(),
    });

    const total = await ctx.db.query("waitlist").collect();
    return { alreadyJoined: false, position: total.length };
  },
});

export const getCount = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("waitlist").collect();
    return all.length;
  },
});
