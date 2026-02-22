"use node";

import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { googleFetch } from "./googleApi";
import DiffMatchPatch from "diff-match-patch";
import {
  computeFairShareScores,
  recencyWeightedSum,
  type ContributionInput,
} from "./scoring";

// ─── DEMO MODE ───────────────────────────────────────────────────────────────
// Set to true when filming. Uses the real doc title but injects fake contributors.
// Flip back to false before shipping.
const DEMO_MODE = true;

const DEMO_CONTRIBUTORS = [
  {
    name: "Eddy Xu",
    emailOrHandle: "ex247@cornell.edu",
    score: 171,
    tier: "carry" as const,
    rawStats: { revisions: 89, charsAdded: 38400, wordsAdded: 6340 },
    heatmapData: [0.1,0.2,0.3,0.5,0.6,0.7,0.8,1.0,0.9,0.8,0.7,0.9,1.0,0.8,0.7,0.6,0.8,0.9,0.7,0.5],
  },
  {
    name: "Madhav Rapelli",
    emailOrHandle: "mr581@cornell.edu",
    score: 82,
    tier: "solid" as const,
    rawStats: { revisions: 34, charsAdded: 14100, wordsAdded: 2310 },
    heatmapData: [0.1,0.2,0.3,0.4,0.5,0.6,0.6,0.7,0.5,0.4,0.5,0.6,0.7,0.5,0.4,0.6,0.5,0.4,0.3,0.2],
  },
  {
    name: "Max Lee",
    emailOrHandle: "ml419@cornell.edu",
    score: 31,
    tier: "ghost" as const,
    rawStats: { revisions: 9, charsAdded: 3200, wordsAdded: 510 },
    heatmapData: [0.0,0.0,0.1,0.2,0.0,0.0,0.3,0.0,0.1,0.0,0.0,0.0,0.2,0.0,0.0,0.0,0.3,0.0,0.0,0.0],
  },
];

const DEMO_SUMMARY =
  "Eddy Xu wrote 87% of this document across 89 revisions — essentially the entire report — while his two teammates collectively contributed fewer than 700 words over the same 3-week period. Madhav Rapelli pulled a modest share late in the project, but Max Lee's heatmap flatlines for the final two weeks, suggesting he checked out entirely before the deadline.";
// ─────────────────────────────────────────────────────────────────────────────

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

const MAX_REVISIONS_TO_DIFF = 50;

async function exportRevisionText(
  ctx: any,
  userId: any,
  user: any,
  fileId: string,
  revisionId: string
): Promise<string | null> {
  try {
    const res = await googleFetch(
      ctx,
      userId,
      user,
      `https://www.googleapis.com/drive/v3/files/${fileId}/revisions/${revisionId}?alt=media`
    );
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

function countDiffChars(oldText: string, newText: string): { added: number; removed: number } {
  const dmp = new DiffMatchPatch();
  const diffs = dmp.diff_main(oldText, newText);
  dmp.diff_cleanupSemantic(diffs);

  let added = 0;
  let removed = 0;
  for (const [op, text] of diffs) {
    if (op === 1) added += text.length;
    else if (op === -1) removed += text.length;
  }
  return { added, removed };
}

export const analyzeGoogleDoc = internalAction({
  args: { analysisId: v.id("analyses") },
  handler: async (ctx, args) => {
    try {
      const analysis = await ctx.runQuery(
        internal.analyses.getAnalysisInternal as any,
        { analysisId: args.analysisId }
      );
      if (!analysis) throw new Error("Analysis not found");
      if (analysis.sourceType !== "google_doc") {
        throw new Error("Analysis is not a Google Doc type");
      }

      // Use the userId stored on the analysis record.
      // getAuthUserId() does not work inside scheduled actions (no HTTP auth context).
      const userId = analysis.userId;

      const user = await ctx.runQuery(internal.users.getUserInternal as any, {
        userId,
      });
      if (!user?.googleAccessToken) {
        throw new Error(
          "No Google access token found. Please sign out and sign back in with Google to re-authorize access."
        );
      }

      const fileId = analysis.sourceId;

      const metaRes = await googleFetch(
        ctx,
        userId,
        user,
        `https://www.googleapis.com/drive/v3/files/${fileId}?fields=name`
      );

      if (!metaRes.ok) {
        const err = await metaRes.text();
        throw new Error(`Google Drive API error (metadata): ${metaRes.status} ${err}`);
      }

      const metadata: GoogleFileMetadata = await metaRes.json();

      // ── Demo mode: skip real analysis, inject fake data ──
      if (DEMO_MODE) {
        await ctx.runMutation(internal.analyses.writeContributors, {
          analysisId: args.analysisId,
          contributors: DEMO_CONTRIBUTORS,
        });
        await ctx.runMutation(internal.analyses.updateAnalysisStatus, {
          analysisId: args.analysisId,
          status: "ready",
          title: metadata.name,
        });
        await ctx.runMutation(internal.analyses.updateSummary, {
          analysisId: args.analysisId,
          summary: DEMO_SUMMARY,
        });
        return;
      }
      // ─────────────────────────────────────────────────────

      const revisionsRes = await googleFetch(
        ctx,
        userId,
        user,
        `https://www.googleapis.com/drive/v3/files/${fileId}/revisions?` +
          new URLSearchParams({
            fields:
              "revisions(id,modifiedTime,lastModifyingUser(displayName,emailAddress))",
            pageSize: "1000",
          })
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

      // Aggregate revisions per user with optional character-level diffing
      const userRevisions = new Map<
        string,
        {
          name: string;
          email: string;
          timestamps: number[];
          revisionCount: number;
          charsAdded: number;
          charsRemoved: number;
        }
      >();

      // Take last N revisions for diffing (to stay within time limits)
      const revisionsForDiff = revisions.slice(-MAX_REVISIONS_TO_DIFF);
      let previousText = "";
      let isDiffingEnabled = true;

      // Try to get the text of the first revision as baseline
      if (revisionsForDiff.length > 1) {
        const baseText = await exportRevisionText(
          ctx, userId, user, fileId, revisionsForDiff[0].id
        );
        if (baseText !== null) {
          previousText = baseText;
        } else {
          isDiffingEnabled = false;
        }
      }

      for (let i = 0; i < revisions.length; i++) {
        const rev = revisions[i];
        const revUser = rev.lastModifyingUser;
        if (!revUser) continue;

        const key = revUser.emailAddress || revUser.displayName || "Unknown";
        const name = revUser.displayName || revUser.emailAddress || "Unknown";

        if (!userRevisions.has(key)) {
          userRevisions.set(key, {
            name,
            email: revUser.emailAddress || "",
            timestamps: [],
            revisionCount: 0,
            charsAdded: 0,
            charsRemoved: 0,
          });
        }

        const entry = userRevisions.get(key)!;
        entry.revisionCount++;
        entry.timestamps.push(new Date(rev.modifiedTime).getTime());

        // Diff only for the tail revisions we're analyzing
        const diffIdx = i - (revisions.length - revisionsForDiff.length);
        if (isDiffingEnabled && diffIdx > 0 && diffIdx < revisionsForDiff.length) {
          const currentText = await exportRevisionText(
            ctx, userId, user, fileId, rev.id
          );
          if (currentText !== null) {
            const { added, removed } = countDiffChars(previousText, currentText);
            entry.charsAdded += added;
            entry.charsRemoved += removed;
            previousText = currentText;
          }
        }
      }

      const contributions: ContributionInput[] = [];
      for (const [, data] of Array.from(userRevisions)) {
        const hasCharData = data.charsAdded > 0 || data.charsRemoved > 0;
        const metric = hasCharData
          ? data.charsAdded + data.charsRemoved * 0.3
          : recencyWeightedSum(data.timestamps);

        contributions.push({
          name: data.name,
          emailOrHandle: data.email || undefined,
          metric,
          timestamps: data.timestamps,
          rawStats: {
            revisions: data.revisionCount,
            ...(hasCharData
              ? {
                  charsAdded: data.charsAdded,
                  charsRemoved: data.charsRemoved,
                  wordsAdded: Math.round(data.charsAdded / 5),
                }
              : {}),
          },
        });
      }

      const scored = computeFairShareScores(contributions);

      await ctx.runMutation(internal.analyses.writeContributors, {
        analysisId: args.analysisId,
        contributors: scored,
      });

      await ctx.runMutation(internal.analyses.updateAnalysisStatus, {
        analysisId: args.analysisId,
        status: "ready",
        title: metadata.name,
      });

      // Schedule AI summary generation (non-blocking)
      await ctx.scheduler.runAfter(
        0,
        internal.generateSummary.generateSummary,
        { analysisId: args.analysisId }
      );
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
