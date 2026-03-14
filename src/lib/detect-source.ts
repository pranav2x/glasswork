export interface DetectedSource {
  type: "google_doc" | "github_repo";
  id: string;
}

export function detectSourceType(input: string): DetectedSource | null {
  const trimmed = input.trim();

  const gdocMatch = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (gdocMatch) {
    return { type: "google_doc", id: gdocMatch[1] };
  }

  const ghUrlMatch = trimmed.match(/github\.com\/([a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+)/);
  if (ghUrlMatch) {
    return { type: "github_repo", id: ghUrlMatch[1].replace(/\.git$/, "") };
  }

  if (/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(trimmed)) {
    return { type: "github_repo", id: trimmed };
  }

  return null;
}
