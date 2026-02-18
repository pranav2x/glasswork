import type { AnalysisResult } from "./types";

export const mockDocResult: AnalysisResult = {
  source: "doc",
  sourceName: "CS 161 — Final Project Report",
  analyzedAt: "2026-02-17T09:30:00Z",
  contributors: [
    {
      id: "1",
      name: "Maya Chen",
      email: "maya.chen@stanford.edu",
      source: "doc",
      stats: { revisions: 47, wordsAdded: 3420, wordsDeleted: 890 },
      fairShareScore: 94,
      tier: "carry",
      heatmapData: [
        0.8, 0.9, 0.7, 1.0, 0.6, 0.9, 0.5, 0.85, 0.95, 0.7, 0.8, 0.6, 0.9,
        0.75, 0.85, 0.9, 0.7, 1.0, 0.6, 0.8,
      ],
    },
    {
      id: "2",
      name: "Jordan Ellis",
      email: "j.ellis@stanford.edu",
      source: "doc",
      stats: { revisions: 31, wordsAdded: 2180, wordsDeleted: 650 },
      fairShareScore: 72,
      tier: "solid",
      heatmapData: [
        0.4, 0.5, 0.6, 0.7, 0.3, 0.8, 0.5, 0.6, 0.4, 0.7, 0.5, 0.3, 0.6,
        0.5, 0.7, 0.4, 0.6, 0.5, 0.8, 0.4,
      ],
    },
    {
      id: "3",
      name: "Priya Sharma",
      email: "priya.s@stanford.edu",
      source: "doc",
      stats: { revisions: 28, wordsAdded: 1950, wordsDeleted: 420 },
      fairShareScore: 65,
      tier: "solid",
      heatmapData: [
        0.3, 0.4, 0.5, 0.6, 0.7, 0.4, 0.3, 0.5, 0.6, 0.5, 0.4, 0.7, 0.3,
        0.6, 0.5, 0.4, 0.3, 0.6, 0.5, 0.7,
      ],
    },
    {
      id: "4",
      name: "Liam Torres",
      email: "liam.t@stanford.edu",
      source: "doc",
      stats: { revisions: 6, wordsAdded: 310, wordsDeleted: 40 },
      fairShareScore: 18,
      tier: "ghost",
      heatmapData: [
        0.0, 0.0, 0.1, 0.0, 0.0, 0.2, 0.0, 0.0, 0.0, 0.15, 0.0, 0.0, 0.0,
        0.0, 0.1, 0.0, 0.0, 0.0, 0.0, 0.2,
      ],
    },
    {
      id: "5",
      name: "Nora Kimball",
      email: "nora.k@stanford.edu",
      source: "doc",
      stats: { revisions: 3, wordsAdded: 120, wordsDeleted: 10 },
      fairShareScore: 8,
      tier: "ghost",
      heatmapData: [
        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.1, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0, 0.0, 0.0, 0.1, 0.0, 0.0, 0.0,
      ],
    },
  ],
};

export const mockRepoResult: AnalysisResult = {
  source: "repo",
  sourceName: "acme-org/frontend",
  analyzedAt: "2026-02-17T10:15:00Z",
  contributors: [
    {
      id: "r1",
      name: "Alex Rivera",
      handle: "@arivera",
      source: "repo",
      stats: { commits: 84, linesAdded: 4200, linesDeleted: 1800, prsOpened: 12 },
      fairShareScore: 91,
      tier: "carry",
      heatmapData: [
        0.9, 0.8, 1.0, 0.7, 0.85, 0.9, 0.75, 1.0, 0.8, 0.6, 0.9, 0.7, 0.85,
        0.95, 0.8, 0.7, 0.9, 0.85, 1.0, 0.75,
      ],
    },
    {
      id: "r2",
      name: "Sasha Petrova",
      handle: "@spetrova",
      source: "repo",
      stats: { commits: 52, linesAdded: 2800, linesDeleted: 1100, prsOpened: 8 },
      fairShareScore: 74,
      tier: "solid",
      heatmapData: [
        0.5, 0.6, 0.7, 0.5, 0.4, 0.8, 0.6, 0.5, 0.7, 0.4, 0.6, 0.5, 0.7,
        0.8, 0.5, 0.6, 0.4, 0.7, 0.5, 0.6,
      ],
    },
    {
      id: "r3",
      name: "Dev Okonkwo",
      handle: "@devokon",
      source: "repo",
      stats: { commits: 8, linesAdded: 180, linesDeleted: 45, prsOpened: 2 },
      fairShareScore: 14,
      tier: "ghost",
      heatmapData: [
        0.0, 0.0, 0.0, 0.1, 0.0, 0.0, 0.0, 0.0, 0.15, 0.0, 0.0, 0.0, 0.0,
        0.1, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
      ],
    },
  ],
};
