import type {
  Contributor,
  AnalysisResult,
  DocStats,
  RepoStats,
  SourceType,
} from "./types";

export function mapConvexContributor(
  doc: {
    _id: string;
    name: string;
    emailOrHandle?: string;
    avatarUrl?: string;
    score: number;
    tier: "carry" | "solid" | "ghost";
    rawStats: Record<string, number>;
    heatmapData: number[];
  },
  source: SourceType
): Contributor {
  const stats: DocStats | RepoStats =
    source === "doc"
      ? {
          revisions: doc.rawStats?.revisions ?? 0,
          wordsAdded: doc.rawStats?.wordsAdded ?? 0,
          wordsDeleted: doc.rawStats?.wordsDeleted ?? 0,
          charsAdded: doc.rawStats?.charsAdded,
          charsRemoved: doc.rawStats?.charsRemoved,
        }
      : {
          commits: doc.rawStats?.commits ?? 0,
          linesAdded: doc.rawStats?.additions ?? 0,
          linesDeleted: doc.rawStats?.deletions ?? 0,
          prsOpened: doc.rawStats?.prsOpened ?? 0,
        };

  return {
    id: doc._id,
    name: doc.name,
    avatarUrl: doc.avatarUrl,
    email: source === "doc" ? doc.emailOrHandle : undefined,
    handle: source === "repo" ? doc.emailOrHandle : undefined,
    source,
    stats,
    fairShareScore: doc.score,
    tier: doc.tier,
    heatmapData: doc.heatmapData,
  };
}

export function mapConvexAnalysis(
  analysis: {
    sourceType: "google_doc" | "github_repo";
    title: string;
    updatedAt: number;
  },
  contributors: Array<{
    _id: string;
    name: string;
    emailOrHandle?: string;
    avatarUrl?: string;
    score: number;
    tier: "carry" | "solid" | "ghost";
    rawStats: Record<string, number>;
    heatmapData: number[];
  }>
): AnalysisResult {
  const source: SourceType =
    analysis.sourceType === "google_doc" ? "doc" : "repo";

  return {
    source,
    sourceName: analysis.title,
    analyzedAt: new Date(analysis.updatedAt).toISOString(),
    contributors: contributors.map((c) => mapConvexContributor(c, source)),
  };
}
