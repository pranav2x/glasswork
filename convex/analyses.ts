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
 * Internal query to get contributors for an analysis (used by actions).
 */
export const getContributorsInternal = internalQuery({
  args: { analysisId: v.id("analyses") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("contributors")
      .withIndex("by_analysisId", (q) => q.eq("analysisId", args.analysisId))
      .collect();
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

    // Enrich contributors missing avatarUrl with Google profile images from users table
    const enrichedContributors = await Promise.all(
      contributors.map(async (c) => {
        if (!c.avatarUrl && c.emailOrHandle?.includes("@")) {
          const matchedUser = await ctx.db
            .query("users")
            .withIndex("email", (q) => q.eq("email", c.emailOrHandle!))
            .first();
          if (matchedUser?.image) {
            return { ...c, avatarUrl: matchedUser.image };
          }
        }
        return c;
      })
    );

    return {
      ...analysis,
      contributors: enrichedContributors,
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
 * Internal mutation to save the AI-generated summary.
 */
export const updateSummary = internalMutation({
  args: {
    analysisId: v.id("analyses"),
    summary: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.analysisId, {
      summary: args.summary,
    });
  },
});

/**
 * Aggregated dashboard stats for the current user.
 * Returns analyses, status counts, score distribution, top contributors,
 * and monthly activity — all in one reactive query.
 */
export const getDashboardStats = query({
  args: {
    timeFilter: v.optional(
      v.union(v.literal("today"), v.literal("week"), v.literal("month"))
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    const empty = {
      analyses: [],
      statusCounts: { ready: 0, pending: 0, error: 0 },
      scoreDistribution: { excellent: 0, good: 0, fair: 0, needsWork: 0, minimal: 0 },
      totalContributors: 0,
      topContributors: [] as {
        name: string;
        emailOrHandle?: string;
        avatarUrl?: string;
        score: number;
        tier: "carry" | "solid" | "ghost";
        analysisCount: number;
        firstAnalysisId: Id<"analyses">;
      }[],
      activityByMonth: [] as { month: string; docsCount: number; reposCount: number }[],
    };

    if (!userId) return empty;

    // 1. Fetch all analyses for user
    let allAnalyses = await ctx.db
      .query("analyses")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    // 2. Apply time filter
    if (args.timeFilter === "today") {
      const cutoff = Date.now() - 24 * 60 * 60 * 1000;
      allAnalyses = allAnalyses.filter((a) => a.createdAt >= cutoff);
    } else if (args.timeFilter === "week") {
      const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
      allAnalyses = allAnalyses.filter((a) => a.createdAt >= cutoff);
    }
    // "month" or undefined = no filter (show all)

    allAnalyses.sort((a, b) => b.updatedAt - a.updatedAt);

    // 3. Fetch contributors for each analysis
    const allContributors: {
      contributor: Doc<"contributors">;
      analysisId: Id<"analyses">;
    }[] = [];

    const analysesWithMeta = await Promise.all(
      allAnalyses.map(async (analysis) => {
        const contributors = await ctx.db
          .query("contributors")
          .withIndex("by_analysisId", (q) => q.eq("analysisId", analysis._id))
          .collect();

        for (const c of contributors) {
          allContributors.push({ contributor: c, analysisId: analysis._id });
        }

        const topContributor =
          contributors.length > 0
            ? contributors.reduce((top, c) => (c.score > top.score ? c : top))
            : null;

        return {
          _id: analysis._id,
          sourceType: analysis.sourceType,
          title: analysis.title,
          status: analysis.status,
          createdAt: analysis.createdAt,
          updatedAt: analysis.updatedAt,
          topContributor: topContributor
            ? { name: topContributor.name, score: topContributor.score, tier: topContributor.tier }
            : null,
          contributorCount: contributors.length,
        };
      })
    );

    // 4. Status counts
    const statusCounts = { ready: 0, pending: 0, error: 0 };
    for (const a of allAnalyses) {
      statusCounts[a.status]++;
    }

    // 5. Score distribution (based on Fair Share Score — 100 = fair share, capped at 200)
    const scoreDistribution = { excellent: 0, good: 0, fair: 0, needsWork: 0, minimal: 0 };
    for (const { contributor } of allContributors) {
      const s = contributor.score;
      if (s >= 150) scoreDistribution.excellent++;
      else if (s >= 100) scoreDistribution.good++;
      else if (s >= 60) scoreDistribution.fair++;
      else if (s >= 30) scoreDistribution.needsWork++;
      else scoreDistribution.minimal++;
    }

    // 6. Top contributors (grouped by name + handle)
    const contributorMap = new Map<
      string,
      {
        name: string;
        emailOrHandle?: string;
        avatarUrl?: string;
        score: number;
        tier: "carry" | "solid" | "ghost";
        analysisCount: number;
        firstAnalysisId: Id<"analyses">;
      }
    >();

    for (const { contributor, analysisId } of allContributors) {
      const key = `${contributor.name}|${contributor.emailOrHandle ?? ""}`;
      const existing = contributorMap.get(key);
      if (!existing || contributor.score > existing.score) {
        contributorMap.set(key, {
          name: contributor.name,
          emailOrHandle: contributor.emailOrHandle,
          avatarUrl: contributor.avatarUrl,
          score: contributor.score,
          tier: contributor.tier,
          analysisCount: (existing?.analysisCount ?? 0) + (existing ? 0 : 1),
          firstAnalysisId: existing?.firstAnalysisId ?? analysisId,
        });
        if (existing) {
          contributorMap.get(key)!.analysisCount = existing.analysisCount + 1;
        }
      } else {
        existing.analysisCount++;
      }
    }

    const topContributors = Array.from(contributorMap.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    // 6b. Enrich contributors missing avatarUrl with Google profile images from users table
    for (const contributor of topContributors) {
      if (!contributor.avatarUrl && contributor.emailOrHandle?.includes("@")) {
        const matchedUser = await ctx.db
          .query("users")
          .withIndex("email", (q) => q.eq("email", contributor.emailOrHandle!))
          .first();
        if (matchedUser?.image) {
          contributor.avatarUrl = matchedUser.image;
        }
      }
    }

    // 7. Activity by month (last 7 months)
    const now = new Date();
    const activityByMonth: { month: string; docsCount: number; reposCount: number }[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = d.toLocaleString("default", { month: "short" });
      const monthStart = d.getTime();
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 1).getTime();

      activityByMonth.push({
        month: monthLabel,
        docsCount: allAnalyses.filter(
          (a) => a.sourceType === "google_doc" && a.createdAt >= monthStart && a.createdAt < monthEnd
        ).length,
        reposCount: allAnalyses.filter(
          (a) => a.sourceType === "github_repo" && a.createdAt >= monthStart && a.createdAt < monthEnd
        ).length,
      });
    }

    return {
      analyses: analysesWithMeta,
      statusCounts,
      scoreDistribution,
      totalContributors: allContributors.length,
      topContributors,
      activityByMonth,
    };
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
