"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useAction } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";
import { GlassInput } from "@/components/GlassInput";
import { GlassButton } from "@/components/GlassButton";
import { formatRelativeDate } from "@/lib/formatters";
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

/* ─── Sub-components ─── */

function RecentDocsList({
  docs,
  isSubmitting,
  onSelect,
}: {
  docs: RecentDoc[];
  isSubmitting: boolean;
  onSelect: (fileId: string, title: string) => void;
}) {
  return (
    <div className="max-h-48 space-y-1 overflow-y-auto">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-warm-400">
        Recent Docs
      </p>
      {docs.map((doc) => (
        <button
          key={doc.id}
          onClick={() => onSelect(doc.id, doc.name)}
          disabled={isSubmitting}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all duration-200 hover:bg-warm-50 disabled:opacity-50"
        >
          <FileText className="h-4 w-4 shrink-0 text-warm-500" />
          <span className="truncate text-[13px] font-medium text-warm-800">
            {doc.name}
          </span>
          <span className="ml-auto shrink-0 text-[11px] text-warm-400">
            {formatRelativeDate(doc.modifiedTime)}
          </span>
        </button>
      ))}
    </div>
  );
}

function ReauthBanner({ onReauth }: { onReauth: () => void }) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5">
      <p className="text-[13px] font-semibold text-warm-900">
        Google access expired
      </p>
      <p className="mt-0.5 text-[12px] text-warm-500">
        Sign in again to reconnect your Drive access.
      </p>
      <button
        onClick={onReauth}
        className="mt-3 rounded-lg bg-warm-900 px-4 py-2 text-[12px] font-semibold text-white transition-all duration-200 hover:bg-warm-800"
      >
        Reconnect Google
      </button>
    </div>
  );
}

function GoogleDocTab({
  isSubmitting,
  onSubmit,
  onError,
}: {
  isSubmitting: boolean;
  onSubmit: (sourceType: "google_doc", sourceId: string, title: string) => Promise<void>;
  onError: (msg: string) => void;
}) {
  const [docUrl, setDocUrl] = useState("");
  const [recentDocs, setRecentDocs] = useState<RecentDoc[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);
  const [needsReauth, setNeedsReauth] = useState(false);

  const listRecentDocs = useAction(api.googleDrive.listRecentDocs);
  const { signIn } = useAuthActions();

  useEffect(() => {
    setIsLoadingDocs(true);
    setNeedsReauth(false);
    listRecentDocs()
      .then((docs) => setRecentDocs(docs as RecentDoc[]))
      .catch((err: unknown) => {
        setRecentDocs([]);
        const msg = err instanceof Error ? err.message : "";
        if (msg.includes("access token") || msg.includes("re-authenticate")) {
          setNeedsReauth(true);
        }
      })
      .finally(() => setIsLoadingDocs(false));
  }, [listRecentDocs]);

  function handleDocUrlSubmit() {
    const fileId = extractFileId(docUrl);
    if (!fileId) {
      onError(
        "Invalid Google Doc URL. Expected format: https://docs.google.com/document/d/{fileId}/..."
      );
      return;
    }
    void onSubmit("google_doc", fileId, "Google Doc");
  }

  function handleDocSelect(fileId: string, title: string) {
    void onSubmit("google_doc", fileId, title);
  }

  return (
    <div className="space-y-4">
      {isLoadingDocs && (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-xl bg-warm-100" />
          ))}
        </div>
      )}

      {!isLoadingDocs && needsReauth && (
        <ReauthBanner onReauth={() => signIn("google", { redirectTo: "/app" })} />
      )}

      {!isLoadingDocs && !needsReauth && recentDocs.length > 0 && (
        <RecentDocsList
          docs={recentDocs}
          isSubmitting={isSubmitting}
          onSelect={handleDocSelect}
        />
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
          onChange={(e) => {
            setDocUrl(e.target.value);
            onError("");
          }}
        />
      </div>

      <GlassButton
        variant="primary"
        className="w-full"
        onClick={handleDocUrlSubmit}
        disabled={isSubmitting || !docUrl.trim()}
      >
        {isSubmitting ? "Creating..." : "Analyze Doc"}
      </GlassButton>
    </div>
  );
}

function GitHubRepoTab({
  isSubmitting,
  onSubmit,
  onError,
}: {
  isSubmitting: boolean;
  onSubmit: (sourceType: "github_repo", sourceId: string, title: string) => Promise<void>;
  onError: (msg: string) => void;
}) {
  const [repoInput, setRepoInput] = useState("");

  function handleRepoSubmit() {
    const trimmed = repoInput.trim();
    if (!/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(trimmed)) {
      onError('Invalid format. Use "owner/repo" (e.g. "facebook/react")');
      return;
    }
    void onSubmit("github_repo", trimmed, trimmed);
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <GlassInput
          placeholder="owner/repo (e.g. facebook/react)"
          value={repoInput}
          onChange={(e) => {
            setRepoInput(e.target.value);
            onError("");
          }}
        />
        <p className="px-1 text-[11px] text-warm-400">
          We read public commit history. No tokens required.
        </p>
      </div>

      <GlassButton
        variant="primary"
        className="w-full"
        onClick={handleRepoSubmit}
        disabled={isSubmitting || !repoInput.trim()}
      >
        {isSubmitting ? "Creating..." : "Analyze Repo"}
      </GlassButton>
    </div>
  );
}

/* ─── Main Modal ─── */

export function NewAnalysisModal({ isOpen, onClose }: NewAnalysisModalProps) {
  const router = useRouter();
  const createAnalysis = useMutation(api.analyses.createAnalysis);
  const [activeTab, setActiveTab] = useState<"doc" | "repo">("doc");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleSubmit(
    sourceType: "google_doc" | "github_repo",
    sourceId: string,
    title: string
  ) {
    setIsSubmitting(true);
    setError(null);
    try {
      const analysisId = await createAnalysis({ sourceType, sourceId, title });
      onClose();
      router.push(`/results/${analysisId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create analysis");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleError(msg: string) {
    setError(msg || null);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="animate-modal-overlay absolute inset-0 bg-warm-900/30 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="animate-modal-enter relative w-full max-w-lg rounded-2xl border border-warm-200 bg-white p-8 shadow-layered-lg">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-lg text-warm-400 transition-all duration-200 hover:bg-warm-100 hover:text-warm-600"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M4 4l8 8M12 4l-8 8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <h2 className="font-display text-2xl font-normal tracking-display text-warm-900">
          New analysis
        </h2>
        <p className="mt-1.5 text-[13px] text-warm-500">
          Choose a source to analyze contributions.
        </p>

        {/* Segmented control */}
        <div className="mt-6 flex rounded-xl bg-warm-100 p-1">
          <button
            onClick={() => {
              setActiveTab("doc");
              setError(null);
            }}
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
            onClick={() => {
              setActiveTab("repo");
              setError(null);
            }}
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
            <GoogleDocTab
              isSubmitting={isSubmitting}
              onSubmit={handleSubmit}
              onError={handleError}
            />
          )}

          {activeTab === "repo" && (
            <GitHubRepoTab
              isSubmitting={isSubmitting}
              onSubmit={handleSubmit}
              onError={handleError}
            />
          )}

          {error && (
            <p className="mt-3 text-[12px] font-medium text-danger">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
