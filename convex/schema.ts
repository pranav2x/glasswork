import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
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
    summary: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_sourceType", ["userId", "sourceType"]),

  contributors: defineTable({
    analysisId: v.id("analyses"),
    name: v.string(),
    emailOrHandle: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    score: v.number(),
    tier: v.union(v.literal("carry"), v.literal("solid"), v.literal("ghost")),
    rawStats: v.any(),
    heatmapData: v.array(v.number()),
    heatmapBySource: v.optional(
      v.object({
        github: v.array(v.number()),
        docs: v.array(v.number()),
      })
    ),
  }).index("by_analysisId", ["analysisId"]),

  streaks: defineTable({
    userId: v.id("users"),
    currentStreak: v.number(),
    longestStreak: v.number(),
    lastAnalysisId: v.optional(v.id("analyses")),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  notifications: defineTable({
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
    read: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_read", ["userId", "read"]),

  waitlist: defineTable({
    email: v.string(),
    name: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_email", ["email"]),
});
