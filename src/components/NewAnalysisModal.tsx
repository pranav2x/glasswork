"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { GlassInput } from "@/components/GlassInput";
import { GlassButton } from "@/components/GlassButton";
import { detectSourceType } from "@/lib/detect-source";

interface NewAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewAnalysisModal({ isOpen, onClose }: NewAnalysisModalProps) {
  const router = useRouter();
  const createAnalysis = useMutation(api.analyses.createAnalysis);
  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        className="animate-modal-overlay absolute inset-0 bg-warm-900/10 backdrop-blur-[3px]"
        onClick={onClose}
      />

      <div className="animate-modal-enter relative w-full max-w-md rounded-2xl border border-white/40 bg-white/80 backdrop-blur-2xl p-8 shadow-layered-lg">
        <button
          onClick={onClose}
          aria-label="Close modal"
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
          Paste a Google Doc link or GitHub repo.
        </p>

        <div className="mt-6 space-y-3">
          <GlassInput
            placeholder="docs.google.com/… or owner/repo"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError(null);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            autoFocus
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
          {isSubmitting ? "Creating..." : "Analyze"}
        </GlassButton>

        {error && (
          <p className="mt-3 text-[12px] font-medium text-danger">{error}</p>
        )}
      </div>
    </div>
  );
}
