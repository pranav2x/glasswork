"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useAction } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";
import { GlassInput } from "@/components/GlassInput";
import { GlassButton } from "@/components/GlassButton";
import { cn } from "@/lib/utils";

interface NewAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface RecentDoc {
  id: string;
  name: string;
  modifiedTime: string;
}

function extractFileId(url: string): string | null {
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString();
}

export function NewAnalysisModal({ isOpen, onClose }: NewAnalysisModalProps) {
  const router = useRouter();
  const createAnalysis = useMutation(api.analyses.createAnalysis);
  const [activeTab, setActiveTab] = useState<"doc" | "repo">("doc");
  const [docUrl, setDocUrl] = useState("");
  const [repoInput, setRepoInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentDocs, setRecentDocs] = useState<RecentDoc[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [needsReauth, setNeedsReauth] = useState(false);

  const listRecentDocs = useAction(api.googleDrive.listRecentDocs);
  const { signIn } = useAuthActions();

  useEffect(() => {
    if (isOpen && activeTab === "doc") {
      setIsLoadingDocs(true);
      setNeedsReauth(false);
      listRecentDocs()
        .then((docs) => {
          setRecentDocs(docs as RecentDoc[]);
        })
        .catch((err: unknown) => {
          setRecentDocs([]);
          const msg = err instanceof Error ? err.message : "";
          if (msg.includes("access token") || msg.includes("re-authenticate")) {
            setNeedsReauth(true);
          }
        })
        .finally(() => setIsLoadingDocs(false));
    }
  }, [isOpen, activeTab, listRecentDocs]);

  if (!isOpen) return null;

  async function handleDocSelect(fileId: string, title: string) {
    setIsSubmitting(true);
    setError(null);
    try {
      const analysisId = await createAnalysis({
        sourceType: "google_doc",
        sourceId: fileId,
        title,
      });
      onClose();
      router.push(`/results/${analysisId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create analysis");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDocUrlSubmit() {
    const fileId = extractFileId(docUrl);
    if (!fileId) {
      setError("Invalid Google Doc URL. Expected format: https://docs.google.com/document/d/{fileId}/...");
      return;
    }
    await handleDocSelect(fileId, "Google Doc");
  }

  async function handleRepoSubmit() {
    const trimmed = repoInput.trim();
    if (!/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(trimmed)) {
      setError('Invalid format. Use "owner/repo" (e.g. "facebook/react")');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const analysisId = await createAnalysis({
        sourceType: "github_repo",
        sourceId: trimmed,
        title: trimmed,
      });
      onClose();
      router.push(`/results/${analysisId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create analysis");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-warm-900/20 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg rounded-2xl border border-warm-200/60 bg-white p-6 shadow-layered-lg">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-warm-400 transition-colors hover:text-warm-600"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        <h2 className="font-display text-xl font-semibold tracking-display text-warm-900">
          New analysis
        </h2>
        <p className="mt-1 text-[13px] text-warm-500">
          Choose a source to analyze contributions.
        </p>

        <div className="mt-5 flex gap-6 border-b border-warm-200 pb-3">
          <button
            onClick={() => { setActiveTab("doc"); setError(null); }}
            className={cn(
              "relative pb-3 text-[13px] font-medium transition-colors",
              activeTab === "doc" ? "text-warm-900" : "text-warm-400 hover:text-warm-600"
            )}
          >
            Google Doc
            {activeTab === "doc" && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand" />
            )}
          </button>
          <button
            onClick={() => { setActiveTab("repo"); setError(null); }}
            className={cn(
              "relative pb-3 text-[13px] font-medium transition-colors",
              activeTab === "repo" ? "text-warm-900" : "text-warm-400 hover:text-warm-600"
            )}
          >
            GitHub Repo
            {activeTab === "repo" && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand" />
            )}
          </button>
        </div>

        <div className="mt-5">
          {activeTab === "doc" && (
            <div className="space-y-4">
              {isLoadingDocs && (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-12 animate-pulse rounded-lg bg-warm-100" />
                  ))}
                </div>
              )}

              {!isLoadingDocs && needsReauth && (
                <div className="rounded-xl border border-gold/30 bg-gold/5 px-4 py-3">
                  <p className="text-[13px] font-medium text-warm-800">
                    Google access expired
                  </p>
                  <p className="mt-0.5 text-[12px] text-warm-500">
                    Sign in again to reconnect your Drive access.
                  </p>
                  <button
                    onClick={() => signIn("google", { redirectTo: "/app" })}
                    className="mt-2.5 rounded-lg bg-warm-800 px-3.5 py-1.5 text-[12px] font-medium text-white transition-all hover:bg-warm-900"
                  >
                    Reconnect Google
                  </button>
                </div>
              )}

              {!isLoadingDocs && !needsReauth && recentDocs.length > 0 && (
                <div className="max-h-48 space-y-1 overflow-y-auto">
                  <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.1em] text-warm-400">
                    Recent Docs
                  </p>
                  {recentDocs.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => handleDocSelect(doc.id, doc.name)}
                      disabled={isSubmitting}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-warm-50 disabled:opacity-50"
                    >
                      <span className="truncate text-[13px] text-warm-700">{doc.name}</span>
                      <span className="shrink-0 text-[11px] text-warm-400">{formatDate(doc.modifiedTime)}</span>
                    </button>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                {recentDocs.length > 0 && (
                  <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-warm-400">
                    Or paste a link
                  </p>
                )}
                <GlassInput
                  placeholder="https://docs.google.com/document/d/..."
                  value={docUrl}
                  onChange={(e) => { setDocUrl(e.target.value); setError(null); }}
                />
              </div>

              <GlassButton variant="primary" className="w-full" onClick={handleDocUrlSubmit} disabled={isSubmitting || !docUrl.trim()}>
                {isSubmitting ? "Creating..." : "Analyze Doc"}
              </GlassButton>
            </div>
          )}

          {activeTab === "repo" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <GlassInput
                  placeholder="owner/repo (e.g. facebook/react)"
                  value={repoInput}
                  onChange={(e) => { setRepoInput(e.target.value); setError(null); }}
                />
                <p className="px-1 text-[10px] text-warm-400">
                  We read public commit history. No tokens required.
                </p>
              </div>

              <GlassButton variant="primary" className="w-full" onClick={handleRepoSubmit} disabled={isSubmitting || !repoInput.trim()}>
                {isSubmitting ? "Creating..." : "Analyze Repo"}
              </GlassButton>
            </div>
          )}

          {error && <p className="mt-3 text-[12px] text-danger">{error}</p>}
        </div>
      </div>
    </div>
  );
}
