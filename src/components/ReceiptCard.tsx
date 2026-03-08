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

const tierStyle: Record<string, { color: string; bg: string; border: string }> = {
  carry: { color: "#15803d", bg: "#f0fdf4", border: "#bbf7d0" },
  solid: { color: "#525252", bg: "#F5F5F5", border: "#D4D4D4" },
  ghost: { color: "#991b1b", bg: "#fef2f2", border: "#fecaca" },
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
          className="absolute inset-0 bg-warm-900/50 backdrop-blur-sm"
          onClick={onClose}
        />

        <motion.div
          className="relative z-10 flex flex-col items-center gap-5"
          initial={{ scale: 0.92, opacity: 0, y: 24 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 24 }}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
        >
          {/* The receipt */}
          <div
            ref={receiptRef}
            className="w-[400px] overflow-hidden rounded-3xl shadow-2xl"
            style={{ background: "linear-gradient(160deg, #FFFFFF 0%, #FAFAFA 50%, #F5F5F5 100%)" }}
          >
            <div className="px-8 pb-8 pt-10">
              {/* Header */}
              <div className="text-center">
                <div className="text-[10px] font-bold uppercase tracking-[0.35em] text-warm-400">
                  Glasswork
                </div>
                <div className="mt-2 text-[20px] font-bold tracking-tight text-warm-900">
                  Contribution Receipt
                </div>
              </div>

              <div className="my-6 border-t border-dashed border-warm-300/60" />

              {/* Project title */}
              <div className="text-center">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-warm-400">
                  Project
                </div>
                <div className="mt-1.5 text-[15px] font-semibold text-warm-800">
                  {title}
                </div>
              </div>

              <div className="my-6 border-t border-dashed border-warm-300/60" />

              {/* Column header */}
              <div className="mb-3 flex items-center justify-between px-1 text-[9px] font-bold uppercase tracking-widest text-warm-400">
                <span>Contributor</span>
                <div className="flex items-center gap-5">
                  <span>Score</span>
                  <span className="w-[68px] text-right">Status</span>
                </div>
              </div>

              {/* Contributors */}
              <div className="space-y-1.5">
                {sorted.map((c, i) => {
                  const style = tierStyle[c.tier] || tierStyle.solid;
                  return (
                    <div
                      key={c.id}
                      className="flex items-center justify-between rounded-xl px-3 py-2.5 transition-colors"
                      style={{
                        backgroundColor: i === 0 ? "rgba(255,255,255,0.7)" : "transparent",
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-warm-100 text-[11px] font-bold text-warm-600">
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
                        <div className="min-w-0">
                          <div className="truncate text-[13px] font-semibold text-warm-900">
                            {c.name}
                          </div>
                          {(c.email || c.handle) && (
                            <div className="truncate text-[10px] text-warm-400">
                              {c.email || c.handle}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span
                          className="text-[20px] font-bold tabular-nums"
                          style={{ color: style.color }}
                        >
                          {c.fairShareScore}
                        </span>
                        <span
                          className="inline-flex w-[68px] items-center justify-center rounded-full px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider"
                          style={{
                            backgroundColor: style.bg,
                            color: style.color,
                            border: `1px solid ${style.border}`,
                          }}
                        >
                          {tierLabel[c.tier]}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="my-6 border-t border-dashed border-warm-300/60" />

              {/* Footer */}
              <div className="text-center">
                <div className="text-[11px] text-warm-500">
                  Analyzed by{" "}
                  <span className="font-semibold text-warm-700">glasswork.app</span>
                </div>
                <div className="mt-1 text-[9px] italic text-warm-300">
                  who actually did the work?
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleExport}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-[13px] font-semibold text-warm-900 shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] disabled:opacity-50"
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
              className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-5 py-2.5 text-[13px] font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/25 active:scale-[0.98]"
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
