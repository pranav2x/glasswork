"use client";

const CURVE_A = "M -20 340 C 300 280, 500 420, 720 350 S 1100 280, 1460 480";
const CURVE_B = "M -20 560 C 350 520, 650 600, 900 540 S 1200 580, 1460 620";
const CURVE_C = "M 1200 -20 C 1100 180, 980 320, 1060 500 S 1150 650, 1460 700";

const dotColors = [
  "rgba(216,185,137,0.15)",
  "rgba(94,159,153,0.12)",
  "rgba(249,115,115,0.08)",
  "rgba(216,185,137,0.12)",
  "rgba(94,159,153,0.10)",
  "rgba(216,185,137,0.14)",
  "rgba(249,115,115,0.06)",
  "rgba(94,159,153,0.12)",
  "rgba(216,185,137,0.10)",
  "rgba(94,159,153,0.08)",
  "rgba(249,115,115,0.07)",
  "rgba(216,185,137,0.13)",
  "rgba(94,159,153,0.11)",
  "rgba(216,185,137,0.09)",
  "rgba(249,115,115,0.06)",
  "rgba(94,159,153,0.10)",
  "rgba(216,185,137,0.12)",
  "rgba(94,159,153,0.09)",
  "rgba(249,115,115,0.07)",
  "rgba(216,185,137,0.11)",
];

const dotPositions = [
  { cx: 880, cy: 542 },
  { cx: 905, cy: 540 },
  { cx: 930, cy: 539 },
  { cx: 955, cy: 538 },
  { cx: 980, cy: 540 },
  { cx: 1005, cy: 543 },
  { cx: 1030, cy: 547 },
  { cx: 1055, cy: 551 },
  { cx: 1080, cy: 556 },
  { cx: 1105, cy: 560 },
  { cx: 1130, cy: 565 },
  { cx: 1155, cy: 569 },
  { cx: 1180, cy: 574 },
  { cx: 1205, cy: 578 },
  { cx: 1230, cy: 583 },
  { cx: 1255, cy: 587 },
  { cx: 1280, cy: 592 },
  { cx: 1305, cy: 596 },
  { cx: 1330, cy: 601 },
  { cx: 1355, cy: 605 },
];

export function ContributionBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={{ willChange: "transform, opacity" }}
    >
      {/* ── Layer 1: Aurora wash ── */}
      <div className="absolute inset-0" style={{ filter: "blur(80px)" }}>
        <div
          className="cb-aurora-1 absolute rounded-full"
          style={{
            width: "50vw",
            height: "50vw",
            top: "-5%",
            left: "-5%",
            background:
              "radial-gradient(circle, rgba(210,175,110,0.10) 0%, transparent 65%)",
          }}
        />
        <div
          className="cb-aurora-2 absolute rounded-full"
          style={{
            width: "55vw",
            height: "55vw",
            bottom: "-10%",
            right: "-10%",
            background:
              "radial-gradient(circle, rgba(60,120,120,0.05) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* ── Layer 2: SVG contribution curves + pulse ── */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradient for curves: transparent -> white -> transparent */}
          <linearGradient id="curveGradA" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(255,255,255,0)" />
            <stop offset="15%" stopColor="rgba(255,255,255,0.06)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.07)" />
            <stop offset="85%" stopColor="rgba(255,255,255,0.05)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>

          <linearGradient id="curveGradB" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(255,255,255,0)" />
            <stop offset="20%" stopColor="rgba(255,255,255,0.04)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.05)" />
            <stop offset="80%" stopColor="rgba(255,255,255,0.04)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>

          <linearGradient id="curveGradC" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0)" />
            <stop offset="30%" stopColor="rgba(255,255,255,0.04)" />
            <stop offset="70%" stopColor="rgba(255,255,255,0.03)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>

          {/* Glow filter for curves */}
          <filter id="curveGlow" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Golden radial gradient for the traveling pulse */}
          <radialGradient id="pulseGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(216,185,137,0.6)" />
            <stop offset="60%" stopColor="rgba(216,185,137,0.2)" />
            <stop offset="100%" stopColor="rgba(216,185,137,0)" />
          </radialGradient>

          {/* Blur filter for pulse */}
          <filter id="pulseBlur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" />
          </filter>

          {/* Shimmer gradient for dots */}
          <linearGradient id="dotShimmerGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(255,255,255,0)" />
            <stop offset="40%" stopColor="rgba(255,255,255,0)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.08)" />
            <stop offset="60%" stopColor="rgba(255,255,255,0)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>

          {/* Clip path for dot shimmer region */}
          <clipPath id="dotRegionClip">
            <rect x="870" y="530" width="500" height="90" />
          </clipPath>
        </defs>

        {/* Curve A — primary, glow layer */}
        <g className="cb-curve-float-1" style={{ willChange: "transform" }}>
          <path
            d={CURVE_A}
            stroke="url(#curveGradA)"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.5"
            filter="url(#curveGlow)"
          />
          <path
            d={CURVE_A}
            stroke="url(#curveGradA)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </g>

        {/* Curve B — secondary, glow layer */}
        <g className="cb-curve-float-2" style={{ willChange: "transform" }}>
          <path
            d={CURVE_B}
            stroke="url(#curveGradB)"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.4"
            filter="url(#curveGlow)"
          />
          <path
            d={CURVE_B}
            stroke="url(#curveGradB)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </g>

        {/* Curve C — accent, glow layer */}
        <g className="cb-curve-float-3" style={{ willChange: "transform" }}>
          <path
            d={CURVE_C}
            stroke="url(#curveGradC)"
            strokeWidth="1"
            strokeLinecap="round"
            opacity="0.35"
            filter="url(#curveGlow)"
          />
          <path
            d={CURVE_C}
            stroke="url(#curveGradC)"
            strokeWidth="1"
            strokeLinecap="round"
          />
        </g>

        {/* Traveling light pulse along Curve A */}
        <circle r="5" fill="url(#pulseGrad)" filter="url(#pulseBlur)">
          <animateMotion dur="12s" repeatCount="indefinite">
            <mpath href="#curveAPath" />
          </animateMotion>
          <animate
            attributeName="opacity"
            values="0;0.8;1;1;0.8;0"
            keyTimes="0;0.05;0.15;0.85;0.95;1"
            dur="12s"
            repeatCount="indefinite"
          />
        </circle>
        {/* Hidden path for animateMotion reference */}
        <path id="curveAPath" d={CURVE_A} fill="none" stroke="none" />

        {/* ── Layer 3: Contribution dots along Curve B ── */}
        <g className="cb-curve-float-2" style={{ willChange: "transform" }}>
          {dotPositions.map((pos, i) => (
            <circle
              key={i}
              cx={pos.cx}
              cy={pos.cy}
              r="2"
              fill={dotColors[i % dotColors.length]}
            />
          ))}

          {/* Dot shimmer overlay */}
          <g clipPath="url(#dotRegionClip)">
            <rect
              x="870"
              y="530"
              width="500"
              height="90"
              fill="url(#dotShimmerGrad)"
              className="cb-dot-shimmer"
              style={{ willChange: "transform" }}
            />
          </g>
        </g>
      </svg>
    </div>
  );
}
