"use node";

import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";
import {
  computeFairShareScores,
  recencyWeightedSum,
  type ContributionInput,
} from "./scoring";

interface GoogleRevision {
  id: string;
  modifiedTime: string;
  lastModifyingUser?: {
    displayName?: string;
    emailAddress?: string;
  };
}

interface GoogleFileMetadata {
  name: string;
}

/**
 * Analyzes a Google Doc by fetching its revision history from the Drive API.
 *
 * Scoring:
 *   - Counts revisions per user
 *   - Applies recency weighting (newer revisions count more)
 *   - Normalizes to 0–100 Fair Share Score
 *   - Assigns tiers: carry / solid / ghost
 */
export const analyzeGoogleDoc = internalAction({
  args: { analysisId: v.id("analyses") },
  handler: async (ctx, args) => {
    try {
      // Get the analysis record
      const analysis = await ctx.runQuery(
        internal.analyses.getAnalysisInternal as any,
        { analysisId: args.analysisId }
      );
      if (!analysis) throw new Error("Analysis not found");
      if (analysis.sourceType !== "google_doc") {
        throw new Error("Analysis is not a Google Doc type");
      }

      // Get the user's Google access token
      const userId = await getAuthUserId(ctx);
      if (!userId) throw new Error("Not authenticated");

      const user = await ctx.runQuery(internal.users.getUserInternal as any, {
        userId,
      });
      if (!user?.googleAccessToken) {
        throw new Error(
          "No Google access token found. Please re-authenticate with Google."
        );
      }

      const accessToken = user.googleAccessToken;
      const fileId = analysis.sourceId;

      // Fetch doc metadata for the title
      const metaRes = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?fields=name`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (!metaRes.ok) {
        const err = await metaRes.text();
        throw new Error(`Google Drive API error (metadata): ${metaRes.status} ${err}`);
      }

      const metadata: GoogleFileMetadata = await metaRes.json();

      // Fetch revision history
      const revisionsRes = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}/revisions?` +
          new URLSearchParams({
            fields:
              "revisions(id,modifiedTime,lastModifyingUser(displayName,emailAddress))",
            pageSize: "1000",
          }),
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (!revisionsRes.ok) {
        const err = await revisionsRes.text();
        throw new Error(
          `Google Drive API error (revisions): ${revisionsRes.status} ${err}`
        );
      }

      const revisionsData: { revisions: GoogleRevision[] } =
        await revisionsRes.json();
      const revisions = revisionsData.revisions || [];

      if (revisions.length === 0) {
        // No revisions found — mark ready with no contributors
        await ctx.runMutation(internal.analyses.updateAnalysisStatus, {
          analysisId: args.analysisId,
          status: "ready",
          title: metadata.name,
        });
        await ctx.runMutation(internal.analyses.writeContributors, {
          analysisId: args.analysisId,
          contributors: [],
        });
        return;
      }

      // Aggregate revisions per user
      const userRevisions = new Map<
        string,
        { name: string; email: string; timestamps: number[] }
      >();

      for (const rev of revisions) {
        const user = rev.lastModifyingUser;
        if (!user) continue;

        const key = user.emailAddress || user.displayName || "Unknown";
        const name = user.displayName || user.emailAddress || "Unknown";

        if (!userRevisions.has(key)) {
          userRevisions.set(key, {
            name,
            email: user.emailAddress || "",
            timestamps: [],
          });
        }
        userRevisions
          .get(key)!
          .timestamps.push(new Date(rev.modifiedTime).getTime());
      }

      // Build contribution inputs with recency-weighted scoring
      const contributions: ContributionInput[] = [];
      for (const [, data] of Array.from(userRevisions)) {
        contributions.push({
          name: data.name,
          emailOrHandle: data.email || undefined,
          metric: recencyWeightedSum(data.timestamps),
          timestamps: data.timestamps,
          rawStats: {
            revisions: data.timestamps.length,
          },
        });
      }

      // Compute Fair Share Scores
      const scored = computeFairShareScores(contributions);

      // Write results to DB
      await ctx.runMutation(internal.analyses.writeContributors, {
        analysisId: args.analysisId,
        contributors: scored,
      });

      await ctx.runMutation(internal.analyses.updateAnalysisStatus, {
        analysisId: args.analysisId,
        status: "ready",
        title: metadata.name,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      console.error("analyzeGoogleDoc failed:", message);

      await ctx.runMutation(internal.analyses.updateAnalysisStatus, {
        analysisId: args.analysisId,
        status: "error",
        errorMessage: message,
      });
    }
  },
});
