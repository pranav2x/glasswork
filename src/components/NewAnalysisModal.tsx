"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { GlassInput } from "@/components/GlassInput";
import { GlassButton } from "@/components/GlassButton";

interface NewAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PLACEHOLDERS = [
  "docs.google.com/document/d/...",
  "github.com/org/repo",
  "paste any link...",
];

function TypewriterPlaceholder() {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = PLACEHOLDERS[index];
    let timeout: ReturnType<typeof setTimeout>;

    if (!isDeleting && text.length < current.length) {
      timeout = setTimeout(() => setText(current.slice(0, text.length + 1)), 60);
    } else if (!isDeleting && text.length === current.length) {
      timeout = setTimeout(() => setIsDeleting(true), 2000);
    } else if (isDeleting && text.length > 0) {
      timeout = setTimeout(() => setText(text.slice(0, -1)), 30);
    } else if (isDeleting && text.length === 0) {
      setIsDeleting(false);
      setIndex((i) => (i + 1) % PLACEHOLDERS.length);
    }

    return () => clearTimeout(timeout);
  }, [text, isDeleting, index]);

  return text;
}

function detectSourceType(input: string): { type: "google_doc" | "github_repo"; id: string } | null {
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

export function NewAnalysisModal({ isOpen, onClose }: NewAnalysisModalProps) {
  const router = useRouter();
  const createAnalysis = useMutation(api.analyses.createAnalysis);
  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const placeholder = TypewriterPlaceholder();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const detected = detectSourceType(input);

  async function handleSubmit() {
    if (!detected) {
      setError("Paste a Google Doc link or a GitHub repo (e.g. owner/repo).");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const title = detected.type === "github_repo" ? detected.id : "Google Doc";
      const analysisId = await createAnalysis({
        sourceType: detected.type,
        sourceId: detected.id,
        title,
      });
      setInput("");
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
      <div
        className="animate-modal-overlay absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="animate-modal-enter relative w-full max-w-md rounded-2xl border border-white/[0.10] bg-surface-2 backdrop-blur-2xl p-8 shadow-layered-lg">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-lg text-warm-400 transition-all duration-200 hover:bg-white/[0.06] hover:text-warm-600"
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

        <h2 className="font-display text-2xl font-bold tracking-tight text-warm-900">
          Who actually did the work?
        </h2>
        <p className="mt-1.5 text-[13px] text-warm-500">
          Paste a Google Doc or GitHub repo — we&apos;ll settle the score.
        </p>

        <div className="mt-6 space-y-3">
          <GlassInput
            ref={inputRef}
            placeholder={placeholder}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError(null);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />

          {detected && (
            <p className="px-1 text-[11px] text-warm-400">
              Detected:{" "}
              <span className="font-semibold text-warm-700">
                {detected.type === "google_doc" ? "Google Doc" : `GitHub · ${detected.id}`}
              </span>
            </p>
          )}
        </div>

        <GlassButton
          variant="primary"
          className="mt-4 w-full"
          onClick={handleSubmit}
          disabled={isSubmitting || !input.trim()}
        >
          {isSubmitting ? "Creating..." : "Run Analysis →"}
        </GlassButton>

        <p className="mt-3 text-center text-[11px] text-warm-400">
          Results in ~30 seconds
        </p>

        {error && (
          <p className="mt-3 text-[12px] font-medium text-danger">{error}</p>
        )}
      </div>
    </div>
  );
}
