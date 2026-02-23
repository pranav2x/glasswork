"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Github } from "lucide-react";
import { GlassPanel } from "@/components/GlassPanel";

interface AnalysisLoadingCinematicProps {
  sourceType: "google_doc" | "github_repo";
}

const GITHUB_STEPS = [
  { text: "Fetching repository info...", counter: null },
  { text: "Analyzing commit history...", counter: { label: "commits", target: 2847 } },
  { text: "Detecting co-authors...", counter: { label: "contributors", target: 24 } },
  { text: "Computing Fair Share Scores...", counter: null },
  { text: "Calculating MVP ratings...", counter: null },
];

const DOC_STEPS = [
  { text: "Fetching document metadata...", counter: null },
  { text: "Loading revision history...", counter: { label: "revisions", target: 156 } },
  { text: "Diffing character changes...", counter: { label: "chars analyzed", target: 48200 } },
  { text: "Computing Fair Share Scores...", counter: null },
  { text: "Calculating MVP ratings...", counter: null },
];

function AnimatedCounter({ target, duration = 2000 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const startTime = useRef(Date.now());

  useEffect(() => {
    startTime.current = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress >= 1) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, [target, duration]);

  return <span>{count.toLocaleString()}</span>;
}

export function AnalysisLoadingCinematic({ sourceType }: AnalysisLoadingCinematicProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const steps = sourceType === "github_repo" ? GITHUB_STEPS : DOC_STEPS;
  const isDoc = sourceType === "google_doc";

  // Step through progress phases
  useEffect(() => {
    const stepDurations = [800, 1200, 900, 800, 800];
    let elapsed = 0;

    const timers: ReturnType<typeof setTimeout>[] = [];

    stepDurations.forEach((duration, i) => {
      const timer = setTimeout(() => {
        setCurrentStep(i);
        setProgress(((i + 1) / steps.length) * 100);
      }, elapsed);
      timers.push(timer);
      elapsed += duration;
    });

    return () => timers.forEach(clearTimeout);
  }, [steps.length]);

  // Ring count for radar
  const rings = [0, 1, 2, 3, 4];

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <GlassPanel className="relative w-full max-w-lg overflow-hidden p-10">
        {/* Radar visualization */}
        <div className="relative mx-auto mb-8 h-[200px] w-[200px]">
          {/* Pulsing concentric rings */}
          <svg
            viewBox="0 0 200 200"
            className="absolute inset-0 h-full w-full"
          >
            {rings.map((i) => {
              const radius = 20 + i * 20;
              const delay = i * 0.4;
              const progressColor = progress > (i / rings.length) * 100;
              return (
                <circle
                  key={i}
                  cx="100"
                  cy="100"
                  r={radius}
                  fill="none"
                  stroke={progressColor ? "#111111" : "#E5E5E5"}
                  strokeWidth="1"
                  strokeOpacity={progressColor ? 0.2 + (i * 0.08) : 0.12}
                  className="transition-all duration-700"
                  style={{
                    animation: `radar-pulse ${3 + i * 0.5}s ease-out infinite ${delay}s`,
                    transformOrigin: "100px 100px",
                  }}
                />
              );
            })}

            {/* Rotating sweep line */}
            <line
              x1="100"
              y1="100"
              x2="100"
              y2="10"
              stroke="#111111"
              strokeWidth="1.5"
              strokeOpacity="0.25"
              strokeLinecap="round"
              style={{
                animation: "radar-spin 3s linear infinite",
                transformOrigin: "100px 100px",
              }}
            />

            {/* Data points flying inward */}
            {Array.from({ length: 8 }).map((_, i) => {
              const angle = (i / 8) * 2 * Math.PI;
              const startR = 90;
              const endR = 20 + Math.random() * 40;
              const cx = 100 + Math.cos(angle) * startR;
              const cy = 100 + Math.sin(angle) * startR;
              return (
                <motion.circle
                  key={i}
                  cx={cx}
                  cy={cy}
                  r="3"
                  fill="#111111"
                  opacity={0}
                  animate={{
                    cx: [cx, 100 + Math.cos(angle) * endR],
                    cy: [cy, 100 + Math.sin(angle) * endR],
                    opacity: [0, 0.8, 0],
                    r: [3, 2, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.3,
                    ease: "easeIn",
                  }}
                />
              );
            })}
          </svg>

          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-layered"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              {isDoc ? (
                <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" fill="#111111" fillOpacity="0.06" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14 2v6h6M8 13h8M8 17h8M8 9h2" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <Github className="h-7 w-7 text-warm-900" strokeWidth={1.5} />
              )}
            </motion.div>
          </div>
        </div>

        {/* Progress steps */}
        <div className="space-y-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <p className="font-mono text-[14px] font-medium text-warm-700">
                {steps[currentStep].text}
              </p>
              {steps[currentStep].counter && (
                <p className="mt-1 font-mono text-[12px] text-warm-500">
                  <AnimatedCounter target={steps[currentStep].counter!.target} /> {steps[currentStep].counter!.label}
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress bar */}
        <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-warm-100">
          <motion.div
            className="h-full rounded-full bg-warm-900"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>

        {/* Step dots */}
        <div className="mt-4 flex items-center justify-center gap-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 w-1.5 rounded-full transition-all duration-500 ${
                i <= currentStep ? "bg-warm-900" : "bg-warm-200"
              }`}
            />
          ))}
        </div>
      </GlassPanel>
    </div>
  );
}
