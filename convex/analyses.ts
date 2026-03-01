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
          summary: analysis.summary,
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
      tierCounts: { carry: 0, solid: 0, ghost: 0 },
      avgScore: 0,
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

    // 7. Tier counts and average score
    const tierCounts = { carry: 0, solid: 0, ghost: 0 };
    let totalScore = 0;
    for (const { contributor } of allContributors) {
      tierCounts[contributor.tier]++;
      totalScore += contributor.score;
    }
    const avgScore = allContributors.length > 0
      ? Math.round(totalScore / allContributors.length)
      : 0;

    // 8. Activity by month (last 7 months)
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
      tierCounts,
      avgScore,
    };
  },
});

/**
 * Seeds 6 pre-crafted demo analyses with contributors for showcase/demo purposes.
 * Call from the Settings page "Load Demo Data" button.
 */
export const seedDemoData = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const now = Date.now();

    const seed = async (
      sourceType: "google_doc" | "github_repo",
      sourceId: string,
      title: string,
      summary: string,
      contributors: Array<{
        name: string;
        emailOrHandle: string;
        score: number;
        tier: "carry" | "solid" | "ghost";
        rawStats: Record<string, number>;
        heatmapData: number[];
      }>,
      offsetMs: number
    ) => {
      // Skip if this demo analysis already exists for this user (idempotency)
      const existing = await ctx.db
        .query("analyses")
        .withIndex("by_userId_sourceType", (q) =>
          q.eq("userId", userId).eq("sourceType", sourceType)
        )
        .filter((q) => q.eq(q.field("sourceId"), sourceId))
        .first();
      if (existing) return;

      const ts = now - offsetMs;
      const analysisId = await ctx.db.insert("analyses", {
        userId,
        sourceType,
        sourceId,
        title,
        status: "ready",
        summary,
        createdAt: ts,
        updatedAt: ts,
      });
      for (const c of contributors) {
        await ctx.db.insert("contributors", {
          analysisId,
          name: c.name,
          emailOrHandle: c.emailOrHandle,
          score: c.score,
          tier: c.tier,
          rawStats: c.rawStats,
          heatmapData: c.heatmapData,
        });
      }
    };

    // 1. CS 4780 — classic carry (1h ago)
    await seed("google_doc", "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVEcuQ",
      "CS 4780 Final Report - Machine Learning Survey",
      "Priya Sharma wrote 87% of this document across 94 revisions — essentially the entire final report — while her three teammates collectively contributed fewer than 200 words over the same 3-week period. Darius Webb and Keaton Flores each opened the document twice, and Jordan Holt has no revision history at all, suggesting they never opened it.",
      [
        { name: "Priya Sharma",  emailOrHandle: "ps847@cornell.edu", score: 176, tier: "carry", rawStats: { revisions: 94, charsAdded: 41200, wordsAdded: 6840 }, heatmapData: [0.1,0.2,0.3,0.5,0.4,0.6,0.7,0.8,1.0,0.9,0.8,0.7,0.6,0.8,1.0,0.9,0.7,0.6,0.5,0.4] },
        { name: "Darius Webb",   emailOrHandle: "dw392@cornell.edu", score: 14,  tier: "ghost", rawStats: { revisions: 6,  charsAdded: 1800,  wordsAdded: 290  }, heatmapData: [0.0,0.0,0.0,0.1,0.0,0.0,0.0,0.0,0.2,0.0,0.0,0.0,0.0,0.0,0.3,0.0,0.0,0.0,0.0,0.0] },
        { name: "Keaton Flores", emailOrHandle: "kf219@cornell.edu", score: 9,   tier: "ghost", rawStats: { revisions: 4,  charsAdded: 950,   wordsAdded: 155  }, heatmapData: [0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.1,0.0,0.0,0.0,0.0,0.1,0.0,0.0,0.0,0.2,0.0,0.0,0.0] },
        { name: "Jordan Holt",   emailOrHandle: "jh503@cornell.edu", score: 1,   tier: "ghost", rawStats: { revisions: 0,  charsAdded: 120,   wordsAdded: 18   }, heatmapData: [0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.1,0.0,0.0,0.0] },
      ], 1 * 60 * 60 * 1000);

    // 2. ECON 3120 — reasonable split (6h ago)
    await seed("google_doc", "1k8dXYz3QWErTnBvCpL7mN2oHsGjFiAeMuRqVwItKh",
      "ECON 3120 Group Project - Market Equilibrium Analysis",
      "Marcus Okafor contributed nearly half the document's content with 58 revisions and over 3,200 words, earning a Fair Share Score of 148 and a clear Carry designation. Sophie Nguyen pulled her weight solidly at 102, while Camille Tran's 50-point score and sparse heatmap suggest she only engaged meaningfully in the final sprint.",
      [
        { name: "Marcus Okafor", emailOrHandle: "mo614@nyu.edu", score: 148, tier: "carry", rawStats: { revisions: 58, charsAdded: 19400, wordsAdded: 3210 }, heatmapData: [0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1.0,0.8,0.7,0.6,0.5,0.6,0.7,0.8,0.9,0.8,0.7,0.5] },
        { name: "Sophie Nguyen", emailOrHandle: "sn281@nyu.edu", score: 102, tier: "solid", rawStats: { revisions: 41, charsAdded: 13500, wordsAdded: 2230 }, heatmapData: [0.1,0.2,0.3,0.4,0.5,0.6,0.6,0.7,0.8,0.7,0.5,0.5,0.4,0.5,0.6,0.7,0.7,0.6,0.5,0.3] },
        { name: "Camille Tran",  emailOrHandle: "ct773@nyu.edu", score: 50,  tier: "ghost", rawStats: { revisions: 18, charsAdded: 6100,  wordsAdded: 980  }, heatmapData: [0.0,0.0,0.1,0.2,0.1,0.0,0.0,0.3,0.4,0.2,0.1,0.0,0.0,0.1,0.2,0.4,0.5,0.3,0.0,0.0] },
      ], 6 * 60 * 60 * 1000);

    // 3. react-dashboard — two carries, two ghosts (1d ago)
    await seed("github_repo", "tylerbrennan/react-dashboard",
      "react-dashboard",
      "Tyler Brennan and Aisha Mensah together wrote 91% of the codebase, committing 151 times combined and adding nearly 8,000 lines across the project's lifespan. Nate Kovacs and Rita Sundaram made token contributions, with their combined 31 commits representing mostly configuration tweaks and README edits.",
      [
        { name: "Tyler Brennan", emailOrHandle: "@tylerbrennan", score: 162, tier: "carry", rawStats: { commits: 87, additions: 4820, deletions: 1140 }, heatmapData: [0.3,0.4,0.5,0.6,0.7,0.8,1.0,0.9,0.8,0.7,0.9,1.0,0.8,0.7,0.6,0.8,0.9,1.0,0.7,0.5] },
        { name: "Aisha Mensah",  emailOrHandle: "@aishamensah",  score: 128, tier: "carry", rawStats: { commits: 64, additions: 3210, deletions: 890  }, heatmapData: [0.2,0.3,0.4,0.5,0.6,0.8,0.9,0.8,0.7,0.6,0.7,0.9,0.7,0.6,0.5,0.7,0.8,0.9,0.6,0.4] },
        { name: "Rita Sundaram", emailOrHandle: "@ritasun",       score: 63,  tier: "solid", rawStats: { commits: 19, additions: 980,  deletions: 220  }, heatmapData: [0.0,0.1,0.0,0.2,0.0,0.0,0.3,0.0,0.1,0.0,0.0,0.4,0.0,0.1,0.0,0.2,0.0,0.5,0.0,0.1] },
        { name: "Nate Kovacs",   emailOrHandle: "@natekovacs",    score: 47,  tier: "ghost", rawStats: { commits: 12, additions: 610,  deletions: 90   }, heatmapData: [0.0,0.0,0.1,0.0,0.0,0.2,0.0,0.0,0.0,0.1,0.0,0.0,0.2,0.0,0.0,0.0,0.3,0.0,0.0,0.0] },
      ], 1 * 24 * 60 * 60 * 1000);

    // 4. ml-classifier — balanced team (3d ago)
    await seed("github_repo", "devpatel/ml-classifier",
      "ml-classifier",
      "This is a textbook example of equitable collaboration — all five contributors hover within a 30-point band of each other, with Dev Patel leading at 118 and Jasmine Ford bringing up the rear at 84. Every team member maintained consistent commit cadence throughout the 8-week project, with no single sprint domination or last-minute cramming visible in the heatmaps.",
      [
        { name: "Dev Patel",     emailOrHandle: "@devpatel",    score: 118, tier: "carry", rawStats: { commits: 34, additions: 1820, deletions: 410 }, heatmapData: [0.3,0.4,0.5,0.6,0.7,0.6,0.8,0.7,0.9,1.0,0.8,0.7,0.6,0.8,0.9,0.7,0.6,0.5,0.7,0.6] },
        { name: "Leila Osei",   emailOrHandle: "@leilaosei",   score: 107, tier: "carry", rawStats: { commits: 29, additions: 1590, deletions: 370 }, heatmapData: [0.4,0.3,0.6,0.5,0.7,0.8,0.7,0.9,0.8,0.9,0.7,0.8,0.7,0.6,0.8,0.7,0.8,0.6,0.7,0.5] },
        { name: "Felix Ramos",  emailOrHandle: "@felixramos",  score: 98,  tier: "solid", rawStats: { commits: 24, additions: 1220, deletions: 270 }, heatmapData: [0.2,0.3,0.4,0.4,0.6,0.5,0.7,0.6,0.7,0.8,0.5,0.7,0.5,0.5,0.7,0.6,0.6,0.4,0.5,0.4] },
        { name: "Cameron Wu",   emailOrHandle: "@camwu",       score: 93,  tier: "solid", rawStats: { commits: 26, additions: 1390, deletions: 290 }, heatmapData: [0.2,0.4,0.5,0.4,0.6,0.7,0.6,0.8,0.7,0.8,0.6,0.7,0.6,0.5,0.7,0.6,0.7,0.5,0.6,0.4] },
        { name: "Jasmine Ford", emailOrHandle: "@jasmineford",  score: 84,  tier: "ghost", rawStats: { commits: 23, additions: 1180, deletions: 260 }, heatmapData: [0.3,0.3,0.4,0.5,0.5,0.6,0.7,0.7,0.6,0.8,0.6,0.6,0.5,0.5,0.6,0.6,0.6,0.5,0.6,0.4] },
      ], 3 * 24 * 60 * 60 * 1000);

    // 5. INFO 2850 — mid-sprint dropout (5d ago)
    await seed("google_doc", "1mRtKpY7wQn3HsGjVbCvLe4oNzFiDkAuXqMsBwItOh",
      "INFO 2850 - UX Research Report",
      "Zoe Hartmann and Eli Nakamura carried this 5-person report to the finish line after Owen Blackwell and Maddie Torres went essentially dark at the halfway mark — their heatmaps flatline completely after week 4. Valentina Cruz faded significantly in the final stretch, leaving Zoe and Eli to write the conclusions, formatting, and citations section entirely alone.",
      [
        { name: "Zoe Hartmann",   emailOrHandle: "zh491@umich.edu", score: 154, tier: "carry", rawStats: { revisions: 71, charsAdded: 22800, wordsAdded: 3750 }, heatmapData: [0.2,0.4,0.5,0.6,0.7,0.8,0.9,1.0,0.9,0.8,0.8,0.9,1.0,0.9,0.8,0.7,0.8,0.9,0.7,0.5] },
        { name: "Eli Nakamura",   emailOrHandle: "en384@umich.edu", score: 118, tier: "carry", rawStats: { revisions: 52, charsAdded: 16900, wordsAdded: 2780 }, heatmapData: [0.1,0.3,0.4,0.5,0.6,0.7,0.8,0.9,0.8,0.7,0.7,0.8,0.9,0.8,0.7,0.6,0.7,0.8,0.6,0.4] },
        { name: "Valentina Cruz", emailOrHandle: "vc228@umich.edu", score: 68,  tier: "solid", rawStats: { revisions: 28, charsAdded: 9400,  wordsAdded: 1510 }, heatmapData: [0.1,0.2,0.4,0.5,0.6,0.7,0.7,0.8,0.6,0.4,0.3,0.2,0.1,0.0,0.0,0.0,0.0,0.0,0.0,0.0] },
        { name: "Owen Blackwell", emailOrHandle: "ob115@umich.edu", score: 32,  tier: "ghost", rawStats: { revisions: 11, charsAdded: 3100,  wordsAdded: 490  }, heatmapData: [0.1,0.2,0.3,0.4,0.5,0.4,0.2,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0] },
        { name: "Maddie Torres",  emailOrHandle: "mt667@umich.edu", score: 28,  tier: "ghost", rawStats: { revisions: 9,  charsAdded: 2600,  wordsAdded: 400  }, heatmapData: [0.0,0.1,0.2,0.4,0.3,0.2,0.1,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0] },
      ], 5 * 24 * 60 * 60 * 1000);

    // 6. auth-microservice — solo dev disguised as team (7d ago)
    await seed("github_repo", "samreyes/auth-microservice",
      "auth-microservice",
      "Sam Reyes is the sole author of this codebase in every meaningful sense — 143 commits, 7,840 lines added, and a perfectly consistent contribution heatmap that spans the entire project timeline. Brianna Lee and Theo Park each made a single trivial commit (likely a README name addition), giving Sam a perfect score of 200 — the maximum the system can award.",
      [
        { name: "Sam Reyes",   emailOrHandle: "@samreyes",   score: 200, tier: "carry", rawStats: { commits: 143, additions: 7840, deletions: 2310 }, heatmapData: [0.4,0.5,0.6,0.7,0.8,0.9,1.0,0.9,0.8,0.9,1.0,0.9,0.8,0.7,0.9,1.0,0.9,0.8,0.7,0.6] },
        { name: "Brianna Lee", emailOrHandle: "@briannalee", score: 0,   tier: "ghost", rawStats: { commits: 1,   additions: 14,   deletions: 2    }, heatmapData: [0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.1,0.0] },
        { name: "Theo Park",   emailOrHandle: "@theopark",   score: 0,   tier: "ghost", rawStats: { commits: 2,   additions: 22,   deletions: 5    }, heatmapData: [0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.1,0.0,0.0] },
      ], 7 * 24 * 60 * 60 * 1000);

    return { seeded: 6 };
  },
});

/**
 * Removes all demo analyses (by their known sourceIds) for the current user.
 */
export const clearDemoData = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const demoSourceIds = new Set([
      "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVEcuQ",
      "1k8dXYz3QWErTnBvCpL7mN2oHsGjFiAeMuRqVwItKh",
      "tylerbrennan/react-dashboard",
      "devpatel/ml-classifier",
      "1mRtKpY7wQn3HsGjVbCvLe4oNzFiDkAuXqMsBwItOh",
      "samreyes/auth-microservice",
    ]);

    const allAnalyses = await ctx.db
      .query("analyses")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    let deleted = 0;
    for (const analysis of allAnalyses) {
      if (!demoSourceIds.has(analysis.sourceId)) continue;

      const contributors = await ctx.db
        .query("contributors")
        .withIndex("by_analysisId", (q) => q.eq("analysisId", analysis._id))
        .collect();
      for (const c of contributors) {
        await ctx.db.delete(c._id);
      }
      await ctx.db.delete(analysis._id);
      deleted++;
    }

    return { deleted };
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
