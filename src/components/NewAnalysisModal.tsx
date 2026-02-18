"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useAction } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";
import { GlassInput } from "@/components/GlassInput";
import { GlassButton } from "@/components/GlassButton";
import { cn } from "@/lib/utils";
import { FileText, Github } from "lucide-react";

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
      {/* Backdrop */}
      <div className="animate-modal-overlay absolute inset-0 bg-warm-900/30 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="animate-modal-enter relative w-full max-w-lg rounded-2xl border border-warm-200 bg-white p-8 shadow-layered-lg">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-lg text-warm-400 transition-all duration-200 hover:bg-warm-100 hover:text-warm-600"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        <h2 className="font-display text-2xl font-normal tracking-display text-warm-900">
          New analysis
        </h2>
        <p className="mt-1.5 text-[13px] text-warm-500">
          Choose a source to analyze contributions.
        </p>

        {/* Segmented control tab switcher */}
        <div className="mt-6 flex rounded-xl bg-warm-100 p-1">
          <button
            onClick={() => { setActiveTab("doc"); setError(null); }}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[13px] font-semibold transition-all duration-200",
              activeTab === "doc"
                ? "bg-white text-warm-900 shadow-sm"
                : "text-warm-500 hover:text-warm-700"
            )}
          >
            <FileText className="h-4 w-4" />
            Google Doc
          </button>
          <button
            onClick={() => { setActiveTab("repo"); setError(null); }}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[13px] font-semibold transition-all duration-200",
              activeTab === "repo"
                ? "bg-white text-warm-900 shadow-sm"
                : "text-warm-500 hover:text-warm-700"
            )}
          >
            <Github className="h-4 w-4" />
            GitHub Repo
          </button>
        </div>

        <div className="mt-6">
          {activeTab === "doc" && (
            <div className="space-y-4">
              {isLoadingDocs && (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-12 animate-pulse rounded-xl bg-warm-100" />
                  ))}
                </div>
              )}

              {!isLoadingDocs && needsReauth && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5">
                  <p className="text-[13px] font-semibold text-warm-900">
                    Google access expired
                  </p>
                  <p className="mt-0.5 text-[12px] text-warm-500">
                    Sign in again to reconnect your Drive access.
                  </p>
                  <button
                    onClick={() => signIn("google", { redirectTo: "/app" })}
                    className="mt-3 rounded-lg bg-warm-900 px-4 py-2 text-[12px] font-semibold text-white transition-all duration-200 hover:bg-warm-800"
                  >
                    Reconnect Google
                  </button>
                </div>
              )}

              {!isLoadingDocs && !needsReauth && recentDocs.length > 0 && (
                <div className="max-h-48 space-y-1 overflow-y-auto">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-warm-400">
                    Recent Docs
                  </p>
                  {recentDocs.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => handleDocSelect(doc.id, doc.name)}
                      disabled={isSubmitting}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all duration-200 hover:bg-warm-50 disabled:opacity-50"
                    >
                      <FileText className="h-4 w-4 shrink-0 text-warm-500" />
                      <span className="truncate text-[13px] font-medium text-warm-800">{doc.name}</span>
                      <span className="ml-auto shrink-0 text-[11px] text-warm-400">{formatDate(doc.modifiedTime)}</span>
                    </button>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                {recentDocs.length > 0 && (
                  <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-warm-400">
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
                <p className="px-1 text-[11px] text-warm-400">
                  We read public commit history. No tokens required.
                </p>
              </div>

              <GlassButton variant="primary" className="w-full" onClick={handleRepoSubmit} disabled={isSubmitting || !repoInput.trim()}>
                {isSubmitting ? "Creating..." : "Analyze Repo"}
              </GlassButton>
            </div>
          )}

          {error && <p className="mt-3 text-[12px] font-medium text-danger">{error}</p>}
        </div>
      </div>
    </div>
  );
}
