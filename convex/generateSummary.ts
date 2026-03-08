"use node";

import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

const TIER_LABELS: Record<string, string> = {
  carry: "LOCKED IN",
  solid: "MID",
  ghost: "SELLING",
};

export const generateSummary = internalAction({
  args: {
    analysisId: v.id("analyses"),
  },
  handler: async (ctx, args) => {
    try {
      // 1. Fetch analysis and contributors
      const analysis = await ctx.runQuery(
        internal.analyses.getAnalysisInternal,
        { analysisId: args.analysisId }
      );
      if (!analysis) return;

      const contributors = await ctx.runQuery(
        internal.analyses.getContributorsInternal,
        { analysisId: args.analysisId }
      );
      if (!contributors || contributors.length === 0) return;

      // Sort by score desc
      const sorted = [...contributors].sort((a, b) => b.score - a.score);
      const isRepo = analysis.sourceType === "github_repo";

      // 2. Build the structured data for the prompt
      const contributorSummaries = sorted.map((c) => {
        const tier = TIER_LABELS[c.tier] || c.tier;
        const stats = c.rawStats as Record<string, number>;
        const statLine = isRepo
          ? `${stats.commits ?? 0} commits, +${(stats.additions ?? 0).toLocaleString()} / -${(stats.deletions ?? 0).toLocaleString()} lines`
          : `${stats.revisions ?? 0} revisions, ~${(stats.wordsAdded ?? 0).toLocaleString()} words added`;
        return `- ${c.name} (${c.emailOrHandle || "unknown"}): Score ${c.score}/200, tier: ${tier}. Stats: ${statLine}`;
      });

      const totalContributors = sorted.length;
      const topScore = sorted[0].score;
      const bottomScore = sorted[sorted.length - 1].score;

      const prompt = `You are analyzing contribution data for a ${isRepo ? "GitHub repository" : "Google Doc"} called "${analysis.title}".

Here are the contributors ranked by Fair Share Score (0-200, where 100 = exact fair share):

${contributorSummaries.join("\n")}

Total contributors: ${totalContributors}
Highest score: ${topScore}, Lowest score: ${bottomScore}

Tier definitions:
- LOCKED IN (top 25%): Did more than their fair share, carried hard
- MID (middle 50%): Put in their fair share
- SELLING (bottom 25%): Barely showed up

Write 2-3 sentences about what happened. Use the actual names. Use the words Locked In, Mid, and Selling naturally in the sentences. Write like a real person texting a friend about a group project, not like a formal report. Short sentences. No em dashes. No semicolons. No bullet points. No markdown. Keep it casual and a little funny.`;

      // 3. Call the Claude API
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        // Fallback to template-based summary if no API key
        const topContributor = sorted[0];
        const bottomContributor = sorted[sorted.length - 1];
        const topStats = topContributor.rawStats as Record<string, number>;

        let summary = `${topContributor.name} was a full MVP with a score of ${topContributor.score}. `;
        if (isRepo) {
          summary += `${topStats.commits ?? 0} commits and ${(topStats.additions ?? 0).toLocaleString()} lines added. `;
        } else {
          summary += `${topStats.revisions ?? 0} revisions and about ${(topStats.wordsAdded ?? 0).toLocaleString()} words written. `;
        }

        if (totalContributors > 1 && bottomContributor.tier === "ghost") {
          summary += `${bottomContributor.name} was basically a ghost with a score of ${bottomContributor.score}. Not great.`;
        } else if (totalContributors > 1) {
          summary += `${sorted[1].name} held it down too with a score of ${sorted[1].score}.`;
        }

        await ctx.runMutation(internal.analyses.updateSummary, {
          analysisId: args.analysisId,
          summary,
        });
        return;
      }

      const systemInstruction = "You write short, casual, human-sounding takes on group project contributions. You sound like a 17 year old who just saw the stats. No em dashes. No semicolons. No formal language. Just real talk.";

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 200,
          system: systemInstruction,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        console.error("Claude API error:", response.status, await response.text());
        // Fall back to template
        const topContributor = sorted[0];
        const summary = `${topContributor.name} led this ${isRepo ? "repo" : "doc"} with a score of ${topContributor.score}. Pure MVP behavior.`;
        await ctx.runMutation(internal.analyses.updateSummary, {
          analysisId: args.analysisId,
          summary,
        });
        return;
      }

      const data = await response.json();
      const summary = data.content?.[0]?.text?.trim();

      if (summary) {
        await ctx.runMutation(internal.analyses.updateSummary, {
          analysisId: args.analysisId,
          summary,
        });
      }
    } catch (error) {
      console.error("generateSummary failed:", error);
      // Non-critical — don't fail the analysis
    }
  },
});
