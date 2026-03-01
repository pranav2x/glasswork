"use client";

import { useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import html2canvas from "html2canvas";
import { getInitials } from "@/lib/formatters";
import type { Contributor } from "@/lib/types";
import { X, Download, Check } from "lucide-react";

interface ReceiptCardProps {
  title: string;
  contributors: Contributor[];
  onClose: () => void;
}

const tierLabel: Record<string, string> = {
  carry: "LOCKED IN",
  solid: "MID",
  ghost: "SELLING",
};

const tierColor: Record<string, string> = {
  carry: "#15803d",
  solid: "#b45309",
  ghost: "#dc2626",
};

const tierBg: Record<string, string> = {
  carry: "#dcfce7",
  solid: "#fef3c7",
  ghost: "#fee2e2",
};

export function ReceiptCard({ title, contributors, onClose }: ReceiptCardProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const sorted = [...contributors].sort(
    (a, b) => b.fairShareScore - a.fairShareScore
  );

  const handleExport = useCallback(async () => {
    if (!receiptRef.current || saving) return;
    setSaving(true);

    try {
      const canvas = await html2canvas(receiptRef.current, {
        backgroundColor: null,
        scale: 3,
        useCORS: true,
        logging: false,
      });

      const link = document.createElement("a");
      link.download = `glasswork-${title.replace(/\s+/g, "-").toLowerCase()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }, [saving, title]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        <motion.div
          className="relative z-10 flex flex-col items-center gap-4"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          {/* The receipt itself */}
          <div
            ref={receiptRef}
            className="w-[420px] overflow-hidden rounded-2xl"
            style={{ background: "linear-gradient(145deg, #fafaf9 0%, #f5f5f4 100%)" }}
          >
            <div className="px-8 pb-8 pt-10">
              {/* Header */}
              <div className="mb-1 text-center">
                <div className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-stone-400">
                  Glasswork
                </div>
                <div className="font-display text-[22px] font-semibold tracking-tight text-stone-900">
                  Contribution Receipt
                </div>
              </div>

              <div className="my-5 border-t border-dashed border-stone-300" />

              {/* Project title */}
              <div className="mb-5 text-center">
                <div className="text-[11px] font-medium uppercase tracking-wider text-stone-400">
                  Project
                </div>
                <div className="mt-1 text-[15px] font-semibold text-stone-800">
                  {title}
                </div>
              </div>

              <div className="my-5 border-t border-dashed border-stone-300" />

              {/* Column header */}
              <div className="mb-3 flex items-center justify-between px-1 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                <span>Contributor</span>
                <div className="flex items-center gap-6">
                  <span>Score</span>
                  <span className="w-[72px] text-right">Status</span>
                </div>
              </div>

              {/* Contributors */}
              <div className="space-y-2.5">
                {sorted.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between rounded-xl px-3 py-2.5"
                    style={{ backgroundColor: c.tier === "carry" ? "#f0fdf4" : "transparent" }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full text-[12px] font-bold"
                        style={{
                          backgroundColor: tierBg[c.tier],
                          color: tierColor[c.tier],
                        }}
                      >
                        {c.avatarUrl ? (
                          <Image
                            src={c.avatarUrl}
                            alt={c.name}
                            fill
                            className="object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          getInitials(c.name)
                        )}
                      </div>
                      <div>
                        <div className="text-[14px] font-semibold text-stone-900">
                          {c.name}
                        </div>
                        <div className="text-[11px] text-stone-400">
                          {c.email || c.handle || ""}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span
                        className="font-display text-[22px] font-semibold tabular-nums"
                        style={{ color: tierColor[c.tier] }}
                      >
                        {c.fairShareScore}
                      </span>
                      <span
                        className="inline-flex w-[72px] items-center justify-center rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-wider"
                        style={{
                          backgroundColor: tierBg[c.tier],
                          color: tierColor[c.tier],
                          border: c.tier === "carry" ? "1px solid #16a34a" : c.tier === "ghost" ? "1px solid #dc2626" : "1px solid #b45309",
                        }}
                      >
                        {tierLabel[c.tier]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="my-5 border-t border-dashed border-stone-300" />

              {/* Footer */}
              <div className="text-center">
                <div className="text-[11px] text-stone-400">
                  Analyzed by{" "}
                  <span className="font-semibold text-stone-600">glasswork.app</span>
                </div>
                <div className="mt-1 text-[10px] text-stone-300">
                  who actually did the work?
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons (outside the receipt so they don't appear in the screenshot) */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleExport}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-[13px] font-semibold text-stone-900 shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] disabled:opacity-50"
            >
              {saved ? (
                <Check className="h-4 w-4 text-emerald-500" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {saving ? "Saving..." : saved ? "Saved!" : "Save as PNG"}
            </button>
            <button
              onClick={onClose}
              className="inline-flex items-center gap-2 rounded-xl bg-white/20 px-5 py-2.5 text-[13px] font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/30 active:scale-[0.98]"
            >
              <X className="h-4 w-4" />
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
