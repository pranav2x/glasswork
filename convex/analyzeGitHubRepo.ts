"use node";

import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import {
  computeFairShareScores,
  type ContributionInput,
} from "./scoring";

interface GitHubContributorStats {
  author: {
    login: string;
    avatar_url: string;
  };
  total: number;
  weeks: Array<{
    w: number;
    a: number;
    d: number;
    c: number;
  }>;
}

interface GitHubCommit {
  sha: string;
  commit: {
    author: {
      name: string;
      email: string;
      date: string;
    };
    message: string;
  };
  author?: {
    login: string;
  };
}

/**
 * Analyzes a GitHub repo by fetching contributor statistics from the REST API.
 *
 * Primary: GET /repos/{owner}/{repo}/stats/contributors (additions/deletions/commits)
 * Fallback: GET /repos/{owner}/{repo}/commits (if stats returns 202)
 *
 * Scoring metric: commitCount + (additions * 0.3)
 * Normalizes to 0–100, assigns tiers.
 */
export const analyzeGitHubRepo = internalAction({
  args: { analysisId: v.id("analyses") },
  handler: async (ctx, args) => {
    try {
      // Get the analysis record using a direct DB read through runQuery
      const analysis = await ctx.runQuery(
        internal.analyses.getAnalysisInternal as any,
        { analysisId: args.analysisId }
      );
      if (!analysis) throw new Error("Analysis not found");
      if (analysis.sourceType !== "github_repo") {
        throw new Error("Analysis is not a GitHub repo type");
      }

      const ownerRepo = analysis.sourceId;
      const headers: Record<string, string> = {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "Glasswork-App",
      };

      // Try stats/contributors endpoint first (richer data)
      let useStatsFallback = false;
      let statsData: GitHubContributorStats[] = [];

      const statsRes = await fetch(
        `https://api.github.com/repos/${ownerRepo}/stats/contributors`,
        { headers }
      );

      if (statsRes.status === 200) {
        statsData = await statsRes.json();
      } else if (statsRes.status === 202) {
        // GitHub is computing stats — wait briefly and retry once
        await new Promise((resolve) => setTimeout(resolve, 3000));
        const retryRes = await fetch(
          `https://api.github.com/repos/${ownerRepo}/stats/contributors`,
          { headers }
        );
        if (retryRes.status === 200) {
          statsData = await retryRes.json();
        } else {
          useStatsFallback = true;
        }
      } else if (statsRes.status === 403) {
        throw new Error(
          "GitHub API rate limit exceeded. Try again in a few minutes."
        );
      } else if (statsRes.status === 404) {
        throw new Error(
          `Repository "${ownerRepo}" not found. Make sure it's public and the format is owner/repo.`
        );
      } else {
        useStatsFallback = true;
      }

      let contributions: ContributionInput[];

      if (!useStatsFallback && statsData.length > 0) {
        // Use the rich stats data
        contributions = statsData.map((contributor) => {
          const totalAdditions = contributor.weeks.reduce(
            (sum, w) => sum + w.a,
            0
          );
          const totalDeletions = contributor.weeks.reduce(
            (sum, w) => sum + w.d,
            0
          );
          const commitCount = contributor.total;

          // Scoring: commits + additions * 0.3
          const metric = commitCount + totalAdditions * 0.3;

          // Extract weekly timestamps for heatmap (use weeks with activity)
          const timestamps = contributor.weeks
            .filter((w) => w.c > 0)
            .map((w) => w.w * 1000);

          return {
            name: contributor.author.login,
            emailOrHandle: `@${contributor.author.login}`,
            metric,
            timestamps,
            rawStats: {
              commits: commitCount,
              additions: totalAdditions,
              deletions: totalDeletions,
            },
          };
        });
      } else {
        // Fallback: use commits endpoint
        const allCommits: GitHubCommit[] = [];
        let page = 1;
        const maxPages = 3;

        while (page <= maxPages) {
          const commitsRes = await fetch(
            `https://api.github.com/repos/${ownerRepo}/commits?per_page=100&page=${page}`,
            { headers }
          );

          if (!commitsRes.ok) {
            if (commitsRes.status === 404) {
              throw new Error(
                `Repository "${ownerRepo}" not found. Make sure it's public and the format is owner/repo.`
              );
            }
            break;
          }

          const commits: GitHubCommit[] = await commitsRes.json();
          if (commits.length === 0) break;

          allCommits.push(...commits);
          if (commits.length < 100) break;
          page++;
        }

        if (allCommits.length === 0) {
          await ctx.runMutation(internal.analyses.updateAnalysisStatus, {
            analysisId: args.analysisId,
            status: "ready",
          });
          await ctx.runMutation(internal.analyses.writeContributors, {
            analysisId: args.analysisId,
            contributors: [],
          });
          return;
        }

        // Aggregate commits per author
        const authorMap = new Map<
          string,
          {
            name: string;
            handle: string;
            commitCount: number;
            timestamps: number[];
          }
        >();

        for (const commit of allCommits) {
          const login =
            commit.author?.login ||
            commit.commit.author.name ||
            "Unknown";
          const name = commit.commit.author.name || login;

          if (!authorMap.has(login)) {
            authorMap.set(login, {
              name,
              handle: commit.author?.login ? `@${commit.author.login}` : "",
              commitCount: 0,
              timestamps: [],
            });
          }

          const entry = authorMap.get(login)!;
          entry.commitCount++;
          if (commit.commit.author.date) {
            entry.timestamps.push(
              new Date(commit.commit.author.date).getTime()
            );
          }
        }

        contributions = Array.from(authorMap.values()).map((author) => ({
          name: author.name,
          emailOrHandle: author.handle || undefined,
          metric: author.commitCount,
          timestamps: author.timestamps,
          rawStats: {
            commits: author.commitCount,
          },
        }));
      }

      if (contributions.length === 0) {
        await ctx.runMutation(internal.analyses.updateAnalysisStatus, {
          analysisId: args.analysisId,
          status: "ready",
        });
        await ctx.runMutation(internal.analyses.writeContributors, {
          analysisId: args.analysisId,
          contributors: [],
        });
        return;
      }

      // Compute Fair Share Scores
      const scored = computeFairShareScores(contributions);

      // Write results
      await ctx.runMutation(internal.analyses.writeContributors, {
        analysisId: args.analysisId,
        contributors: scored,
      });

      await ctx.runMutation(internal.analyses.updateAnalysisStatus, {
        analysisId: args.analysisId,
        status: "ready",
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      console.error("analyzeGitHubRepo failed:", message);

      await ctx.runMutation(internal.analyses.updateAnalysisStatus, {
        analysisId: args.analysisId,
        status: "error",
        errorMessage: message,
      });
    }
  },
});
