"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Github, Check } from "lucide-react";

interface AnalysisLoadingCinematicProps {
  sourceType: "google_doc" | "github_repo";
}

const GITHUB_STEPS = [
  { text: "Fetching repository info", detail: null },
  { text: "Analyzing commit history", detail: { label: "commits", target: 2847 } },
  { text: "Detecting co-authors", detail: { label: "contributors", target: 24 } },
  { text: "Computing Fair Share Scores", detail: null },
  { text: "Calculating MVP ratings", detail: null },
];

const DOC_STEPS = [
  { text: "Fetching document metadata", detail: null },
  { text: "Loading revision history", detail: { label: "revisions", target: 156 } },
  { text: "Diffing character changes", detail: { label: "characters", target: 48200 } },
  { text: "Computing Fair Share Scores", detail: null },
  { text: "Finalizing rankings", detail: null },
];

const STEP_DURATIONS = [1200, 900, 800, 600, 500];

function AnimatedCounter({ target }: { target: number }) {
  const [count, setCount] = useState(0);
  const startRef = useRef(Date.now());
  const rafRef = useRef<number>();

  useEffect(() => {
    startRef.current = Date.now();
    const duration = 1400;

    const tick = () => {
      const elapsed = Date.now() - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target]);

  return <>{count.toLocaleString()}</>;
}

function StepIndicator({ state }: { state: "completed" | "active" | "pending" }) {
  if (state === "completed") {
    return (
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 22 }}
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand"
      >
        <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
      </motion.div>
    );
  }

  if (state === "active") {
    return (
      <div className="relative flex h-5 w-5 shrink-0 items-center justify-center">
        <motion.div
          className="absolute h-5 w-5 rounded-full bg-brand/20"
          animate={{ scale: [1, 1.9, 1], opacity: [0.7, 0, 0.7] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute h-5 w-5 rounded-full bg-brand/10"
          animate={{ scale: [1, 2.4, 1], opacity: [0.4, 0, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
        />
        <div className="h-2.5 w-2.5 rounded-full bg-brand" />
      </div>
    );
  }

  return (
    <div className="flex h-5 w-5 shrink-0 items-center justify-center">
      <div className="h-1.5 w-1.5 rounded-full bg-warm-300" />
    </div>
  );
}

export function AnalysisLoadingCinematic({ sourceType }: AnalysisLoadingCinematicProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = sourceType === "github_repo" ? GITHUB_STEPS : DOC_STEPS;
  const isDoc = sourceType === "google_doc";

  useEffect(() => {
    let elapsed = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];

    STEP_DURATIONS.forEach((duration, i) => {
      if (i === 0) {
        elapsed += duration;
        return;
      }
      const t = setTimeout(() => setCurrentStep(i), elapsed);
      timers.push(t);
      elapsed += duration;
    });

    return () => timers.forEach(clearTimeout);
  }, []);

  const progressFraction = (currentStep + 0.6) / steps.length;
  const circumference = 2 * Math.PI * 36;

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-[20px] shadow-glass px-8 py-9">

        {/* Icon + circular progress ring */}
        <div className="relative mx-auto mb-9 h-20 w-20">
          <motion.div
            className="absolute -inset-3 rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(124,111,255,0.15) 0%, transparent 70%)",
            }}
            animate={{ scale: [1, 1.12, 1], opacity: [0.4, 0.9, 0.4] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          />

          <svg
            className="absolute inset-0 h-full w-full -rotate-90"
            viewBox="0 0 80 80"
          >
            <circle
              cx="40"
              cy="40"
              r="36"
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="2.5"
            />
            <motion.circle
              cx="40"
              cy="40"
              r="36"
              fill="none"
              stroke="#7C6FFF"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{
                strokeDashoffset: circumference * (1 - progressFraction),
              }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            />
          </svg>

          <div className="absolute inset-0 flex items-center justify-center p-2.5">
            <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-surface-2 shadow-layered border border-white/[0.06]">
              {isDoc ? (
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"
                    fill="rgba(124,111,255,0.1)"
                    stroke="#7C6FFF"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M14 2v6h6M8 13h8M8 17h8M8 9h2"
                    stroke="#7C6FFF"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <Github className="h-6 w-6 text-brand" strokeWidth={1.5} />
              )}
            </div>
          </div>
        </div>

        {/* Step list */}
        <div className="mb-7 space-y-3">
          {steps.map((step, i) => {
            const state =
              i < currentStep
                ? "completed"
                : i === currentStep
                ? "active"
                : "pending";

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -6 }}
                animate={{
                  opacity: state === "pending" ? 0.22 : 1,
                  x: 0,
                }}
                transition={{
                  delay: i * 0.055,
                  duration: 0.32,
                  ease: "easeOut",
                }}
                className="flex items-start gap-3"
              >
                <div className="mt-0.5">
                  <StepIndicator state={state} />
                </div>

                <div className="min-w-0 flex-1">
                  <p
                    className={[
                      "text-[13px] leading-5 transition-colors duration-300",
                      state === "active"
                        ? "font-semibold text-warm-900"
                        : state === "completed"
                        ? "font-medium text-warm-500"
                        : "font-medium text-warm-600",
                    ].join(" ")}
                  >
                    {step.text}
                    {state === "active" && (
                      <motion.span
                        className="text-warm-400"
                        animate={{ opacity: [1, 0.2, 1] }}
                        transition={{ duration: 1.3, repeat: Infinity }}
                      >
                        ...
                      </motion.span>
                    )}
                  </p>

                  {state === "active" && step.detail && (
                    <motion.p
                      initial={{ opacity: 0, y: 3 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                      className="mt-0.5 font-mono text-[11px] font-medium text-brand/70"
                    >
                      <AnimatedCounter target={step.detail.target} />{" "}
                      {step.detail.label}
                    </motion.p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="h-[3px] overflow-hidden rounded-full bg-white/[0.06]">
          <motion.div
            className="h-full rounded-full bg-brand"
            initial={{ width: "0%" }}
            animate={{ width: `${progressFraction * 100}%` }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>

        <div className="mt-2.5 flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-widest text-warm-400">
            Analyzing
          </span>
          <span className="font-mono text-[10px] text-warm-400">
            {currentStep + 1}&thinsp;/&thinsp;{steps.length}
          </span>
        </div>
      </div>
    </div>
  );
}
