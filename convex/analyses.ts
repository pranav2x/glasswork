import { v } from "convex/values";
import { query, mutation, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Doc, Id } from "./_generated/dataModel";

/**
 * Internal query to get an analysis by ID (used by actions).
 */
export const getAnalysisInternal = internalQuery({
  args: { analysisId: v.id("analyses") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.analysisId);
  },
});

/**
 * Lists analyses for the current user, ordered by updatedAt desc.
 * Optionally filtered by sourceType.
 * Includes the top contributor (highest score) for each analysis.
 */
export const listAnalyses = query({
  args: {
    sourceType: v.optional(
      v.union(v.literal("google_doc"), v.literal("github_repo"))
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    let analyses: Doc<"analyses">[];

    if (args.sourceType) {
      analyses = await ctx.db
        .query("analyses")
        .withIndex("by_userId_sourceType", (q) =>
          q.eq("userId", userId).eq("sourceType", args.sourceType!)
        )
        .collect();
    } else {
      analyses = await ctx.db
        .query("analyses")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .collect();
    }

    // Sort by updatedAt desc (in-memory since Convex indexes don't include updatedAt)
    analyses.sort((a, b) => b.updatedAt - a.updatedAt);

    // Attach top contributor for each analysis
    const results = await Promise.all(
      analyses.map(async (analysis) => {
        const contributors = await ctx.db
          .query("contributors")
          .withIndex("by_analysisId", (q) => q.eq("analysisId", analysis._id))
          .collect();

        // Find the top scorer
        const topContributor =
          contributors.length > 0
            ? contributors.reduce((top, c) =>
                c.score > top.score ? c : top
              )
            : null;

        return {
          ...analysis,
          topContributor: topContributor
            ? {
                name: topContributor.name,
                score: topContributor.score,
                tier: topContributor.tier,
              }
            : null,
          contributorCount: contributors.length,
        };
      })
    );

    return results;
  },
});

/**
 * Gets a single analysis with all its contributors, sorted by score desc.
 */
export const getAnalysis = query({
  args: { analysisId: v.id("analyses") },
  handler: async (ctx, args) => {
    const analysis = await ctx.db.get(args.analysisId);
    if (!analysis) return null;

    const contributors = await ctx.db
      .query("contributors")
      .withIndex("by_analysisId", (q) => q.eq("analysisId", args.analysisId))
      .collect();

    contributors.sort((a, b) => b.score - a.score);

    return {
      ...analysis,
      contributors,
    };
  },
});

/**
 * Creates a new analysis in "pending" state.
 * Returns the new analysis _id so we can navigate to it immediately.
 */
export const createAnalysis = mutation({
  args: {
    sourceType: v.union(v.literal("google_doc"), v.literal("github_repo")),
    sourceId: v.string(),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const now = Date.now();
    const analysisId = await ctx.db.insert("analyses", {
      userId,
      sourceType: args.sourceType,
      sourceId: args.sourceId,
      title: args.title,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    });

    // Schedule the appropriate analysis action to run immediately
    if (args.sourceType === "google_doc") {
      await ctx.scheduler.runAfter(
        0,
        internal.analyzeGoogleDoc.analyzeGoogleDoc as any,
        { analysisId }
      );
    } else {
      await ctx.scheduler.runAfter(
        0,
        internal.analyzeGitHubRepo.analyzeGitHubRepo as any,
        { analysisId }
      );
    }

    return analysisId;
  },
});

/**
 * Internal mutation used by analysis actions to update status and write contributors.
 */
export const updateAnalysisStatus = internalMutation({
  args: {
    analysisId: v.id("analyses"),
    status: v.union(
      v.literal("pending"),
      v.literal("ready"),
      v.literal("error")
    ),
    errorMessage: v.optional(v.string()),
    title: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const patch: Record<string, unknown> = {
      status: args.status,
      updatedAt: Date.now(),
    };
    if (args.errorMessage !== undefined) patch.errorMessage = args.errorMessage;
    if (args.title !== undefined) patch.title = args.title;

    await ctx.db.patch(args.analysisId, patch);
  },
});

/**
 * Internal mutation to write contributor rows for an analysis.
 * Clears existing contributors first (for re-analysis).
 */
export const writeContributors = internalMutation({
  args: {
    analysisId: v.id("analyses"),
    contributors: v.array(
      v.object({
        name: v.string(),
        emailOrHandle: v.optional(v.string()),
        avatarUrl: v.optional(v.string()),
        score: v.number(),
        tier: v.union(
          v.literal("carry"),
          v.literal("solid"),
          v.literal("ghost")
        ),
        rawStats: v.any(),
        heatmapData: v.array(v.number()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("contributors")
      .withIndex("by_analysisId", (q) => q.eq("analysisId", args.analysisId))
      .collect();

    for (const c of existing) {
      await ctx.db.delete(c._id);
    }

    for (const c of args.contributors) {
      await ctx.db.insert("contributors", {
        analysisId: args.analysisId,
        name: c.name,
        emailOrHandle: c.emailOrHandle,
        avatarUrl: c.avatarUrl,
        score: c.score,
        tier: c.tier,
        rawStats: c.rawStats,
        heatmapData: c.heatmapData,
      });
    }
  },
});

/**
 * Deletes an analysis and all its contributors.
 */
export const deleteAnalysis = mutation({
  args: { analysisId: v.id("analyses") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const analysis = await ctx.db.get(args.analysisId);
    if (!analysis || analysis.userId !== userId) {
      throw new Error("Analysis not found or not owned by user");
    }

    // Delete contributors first
    const contributors = await ctx.db
      .query("contributors")
      .withIndex("by_analysisId", (q) => q.eq("analysisId", args.analysisId))
      .collect();

    for (const c of contributors) {
      await ctx.db.delete(c._id);
    }

    await ctx.db.delete(args.analysisId);
  },
});
