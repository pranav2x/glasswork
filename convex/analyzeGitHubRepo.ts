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
  weeks: Array<{ w: number; a: number; d: number; c: number }>;
}

interface GitHubCommit {
  sha: string;
  commit: {
    author: { name: string; email: string; date: string };
    message: string;
  };
  author?: { login: string };
}

interface GitHubRepo {
  name: string;
  full_name: string;
}

const GITHUB_HEADERS: Record<string, string> = {
  Accept: "application/vnd.github.v3+json",
  "User-Agent": "Glasswork-App",
};

function parseCoAuthors(message: string): Array<{ name: string; email: string }> {
  const coAuthors: Array<{ name: string; email: string }> = [];
  const regex = /Co-authored-by:\s*(.+?)\s*<(.+?)>/gi;
  let match;
  while ((match = regex.exec(message)) !== null) {
    coAuthors.push({ name: match[1].trim(), email: match[2].trim() });
  }
  return coAuthors;
}

async function pollForStats(
  ownerRepo: string,
  maxRetries = 5,
  delayMs = 2000
): Promise<GitHubContributorStats[] | null> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const res = await fetch(
      `https://api.github.com/repos/${ownerRepo}/stats/contributors`,
      { headers: GITHUB_HEADERS }
    );

    if (res.status === 200) {
      return await res.json();
    }
    if (res.status === 403) {
      throw new Error("GitHub API rate limit exceeded. Try again in a few minutes.");
    }
    if (res.status === 404) {
      throw new Error(
        `Repository "${ownerRepo}" not found. Make sure it's public and the format is owner/repo.`
      );
    }
    if (res.status === 202 && attempt < maxRetries) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      continue;
    }

    return null;
  }
  return null;
}

async function fetchRepoName(ownerRepo: string): Promise<string> {
  try {
    const res = await fetch(`https://api.github.com/repos/${ownerRepo}`, {
      headers: GITHUB_HEADERS,
    });
    if (res.ok) {
      const data: GitHubRepo = await res.json();
      return data.name;
    }
  } catch {
    // fall through
  }
  return ownerRepo;
}

export const analyzeGitHubRepo = internalAction({
  args: { analysisId: v.id("analyses") },
  handler: async (ctx, args) => {
    try {
      const analysis = await ctx.runQuery(
        internal.analyses.getAnalysisInternal as any,
        { analysisId: args.analysisId }
      );
      if (!analysis) throw new Error("Analysis not found");
      if (analysis.sourceType !== "github_repo") {
        throw new Error("Analysis is not a GitHub repo type");
      }

      const ownerRepo = analysis.sourceId;
      const repoName = await fetchRepoName(ownerRepo);

      const statsData = await pollForStats(ownerRepo);

      let contributions: ContributionInput[];

      if (statsData && statsData.length > 0) {
        const coAuthorCredits = new Map<string, number>();

        // Fetch recent commits to extract co-authored-by tags
        try {
          const commitsRes = await fetch(
            `https://api.github.com/repos/${ownerRepo}/commits?per_page=100`,
            { headers: GITHUB_HEADERS }
          );
          if (commitsRes.ok) {
            const commits: GitHubCommit[] = await commitsRes.json();
            for (const commit of commits) {
              const coAuthors = parseCoAuthors(commit.commit.message);
              for (const ca of coAuthors) {
                const key = ca.email.toLowerCase();
                coAuthorCredits.set(key, (coAuthorCredits.get(key) || 0) + 1);
              }
            }
          }
        } catch {
          // co-author parsing is best-effort
        }

        contributions = statsData.map((contributor) => {
          const totalAdditions = contributor.weeks.reduce((sum, w) => sum + w.a, 0);
          const totalDeletions = contributor.weeks.reduce((sum, w) => sum + w.d, 0);
          const commitCount = contributor.total;

          const metric = commitCount + totalAdditions * 0.3;

          const timestamps = contributor.weeks
            .filter((w) => w.c > 0)
            .map((w) => w.w * 1000);

          return {
            name: contributor.author.login,
            emailOrHandle: `@${contributor.author.login}`,
            avatarUrl: contributor.author.avatar_url,
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
            { headers: GITHUB_HEADERS }
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
            title: repoName,
          });
          await ctx.runMutation(internal.analyses.writeContributors, {
            analysisId: args.analysisId,
            contributors: [],
          });
          return;
        }

        const authorMap = new Map<
          string,
          { name: string; handle: string; commitCount: number; timestamps: number[] }
        >();

        for (const commit of allCommits) {
          const login = commit.author?.login || commit.commit.author.name || "Unknown";
          const name = commit.commit.author.name || login;

          if (!authorMap.has(login)) {
            authorMap.set(login, { name, handle: commit.author?.login ? `@${commit.author.login}` : "", commitCount: 0, timestamps: [] });
          }

          const entry = authorMap.get(login)!;
          entry.commitCount++;
          if (commit.commit.author.date) {
            entry.timestamps.push(new Date(commit.commit.author.date).getTime());
          }

          // Count co-authored-by credits
          const coAuthors = parseCoAuthors(commit.commit.message);
          for (const ca of coAuthors) {
            const caKey = ca.name;
            if (!authorMap.has(caKey)) {
              authorMap.set(caKey, { name: ca.name, handle: "", commitCount: 0, timestamps: [] });
            }
            const caEntry = authorMap.get(caKey)!;
            caEntry.commitCount += 0.5;
            if (commit.commit.author.date) {
              caEntry.timestamps.push(new Date(commit.commit.author.date).getTime());
            }
          }
        }

        contributions = Array.from(authorMap.values()).map((author) => ({
          name: author.name,
          emailOrHandle: author.handle || undefined,
          metric: author.commitCount,
          timestamps: author.timestamps,
          rawStats: { commits: Math.round(author.commitCount) },
        }));
      }

      if (contributions.length === 0) {
        await ctx.runMutation(internal.analyses.updateAnalysisStatus, {
          analysisId: args.analysisId,
          status: "ready",
          title: repoName,
        });
        await ctx.runMutation(internal.analyses.writeContributors, {
          analysisId: args.analysisId,
          contributors: [],
        });
        return;
      }

      const scored = computeFairShareScores(contributions);

      await ctx.runMutation(internal.analyses.writeContributors, {
        analysisId: args.analysisId,
        contributors: scored,
      });

      await ctx.runMutation(internal.analyses.updateAnalysisStatus, {
        analysisId: args.analysisId,
        status: "ready",
        title: repoName,
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
