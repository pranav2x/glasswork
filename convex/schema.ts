import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  // authTables defines: users, authSessions, authAccounts, authVerificationCodes,
  // authVerifiers, authRateLimits. We extend users below with our own fields.
  ...authTables,

  // Extend the authTables users table — must include ALL fields from authTables.users
  // plus our additional fields. This overrides authTables.users.
  users: defineTable({
    // Required by @convex-dev/auth
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    // Our custom additions for Google API access
    googleAccessToken: v.optional(v.string()),
    googleRefreshToken: v.optional(v.string()),
  })
    .index("email", ["email"])
    .index("phone", ["phone"]),

  analyses: defineTable({
    userId: v.id("users"),
    sourceType: v.union(v.literal("google_doc"), v.literal("github_repo")),
    sourceId: v.string(),
    title: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("ready"),
      v.literal("error")
    ),
    errorMessage: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_sourceType", ["userId", "sourceType"]),

  contributors: defineTable({
    analysisId: v.id("analyses"),
    name: v.string(),
    emailOrHandle: v.optional(v.string()),
    score: v.number(),
    tier: v.union(v.literal("carry"), v.literal("solid"), v.literal("ghost")),
    rawStats: v.any(),
    heatmapData: v.array(v.number()),
  }).index("by_analysisId", ["analysisId"]),
});
