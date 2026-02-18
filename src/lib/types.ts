export interface DocStats {
  revisions: number;
  wordsAdded: number;
  wordsDeleted: number;
  charsAdded?: number;
  charsRemoved?: number;
}

export interface RepoStats {
  commits: number;
  linesAdded: number;
  linesDeleted: number;
  prsOpened: number;
}

export type ContributorTier = "carry" | "solid" | "ghost";
export type SourceType = "doc" | "repo";

export interface Contributor {
  id: string;
  name: string;
  avatarUrl?: string;
  email?: string;
  handle?: string;
  source: SourceType;
  stats: DocStats | RepoStats;
  fairShareScore: number;
  tier: ContributorTier;
  heatmapData: number[];
}

export interface AnalysisResult {
  source: SourceType;
  sourceName: string;
  analyzedAt: string;
  contributors: Contributor[];
}
