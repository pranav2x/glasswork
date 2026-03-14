"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

/* Donut Chart */
interface DonutSegment {
  value: number;
  color: string;
  label: string;
}

interface DonutChartProps {
  segments: DonutSegment[];
}

export function DonutChart({ segments }: DonutChartProps) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="h-[200px] w-[200px] rounded-full border-[14px] border-white/[0.06]" />
        <p className="mt-3 text-[12px] font-medium text-warm-500">No analyses yet</p>
      </div>
    );
  }

  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  let cumulativeLength = 0;

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 100 100" className="h-[200px] w-[200px]">
        {segments.map((seg, i) => {
          const pct = seg.value / total;
          const dashLength = pct * circumference;
          const gapLength = circumference - dashLength;
          const offset = cumulativeLength;
          cumulativeLength += dashLength;

          return (
            <circle
              key={i}
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth="11"
              strokeDasharray={`${dashLength} ${gapLength}`}
              strokeDashoffset={-offset}
              transform="rotate(-90 50 50)"
              className="transition-all duration-700 ease-out"
            />
          );
        })}
      </svg>

      <div className="mt-3 flex items-center gap-5">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: seg.color }}
            />
            <span className="text-[11px] font-medium text-warm-500">
              {seg.label}: {seg.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Activity Line Chart */
interface ActivityChartProps {
  months: string[];
  docsData: number[];
  reposData: number[];
}

export function ActivityChart({ months, docsData, reposData }: ActivityChartProps) {
  const docsTotal = docsData.reduce((s, v) => s + v, 0);
  const reposTotal = reposData.reduce((s, v) => s + v, 0);

  if (docsTotal === 0 && reposTotal === 0) {
    return (
      <div className="flex items-center justify-center py-10">
        <p className="text-[12px] font-medium text-warm-500">No activity yet</p>
      </div>
    );
  }

  const width = 320;
  const height = 180;
  const padL = 8;
  const padR = 8;
  const padT = 20;
  const padB = 36;

  const chartW = width - padL - padR;
  const chartH = height - padT - padB;
  const rawMax = Math.max(...docsData, ...reposData, 1);
  const maxVal = rawMax * 1.15;
  const yTicks = rawMax <= 3 ? rawMax : 4;

  const getX = (i: number) => padL + (i / Math.max(months.length - 1, 1)) * chartW;
  const getY = (v: number) => padT + chartH - (v / maxVal) * chartH;

  const docsPoints = docsData.map((v, i) => `${getX(i)},${getY(v)}`).join(" ");
  const reposPoints = reposData.map((v, i) => `${getX(i)},${getY(v)}`).join(" ");

  const areaPath = [
    `M${getX(0)},${getY(docsData[0])}`,
    ...docsData.map((v, i) => `L${getX(i)},${getY(v)}`),
    `L${getX(docsData.length - 1)},${padT + chartH}`,
    `L${getX(0)},${padT + chartH}`,
    "Z",
  ].join(" ");

  return (
    <div className="flex h-full flex-col">
      <div className="mb-2 flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-brand" />
          <span className="text-[10px] font-medium text-warm-500">
            Docs: {docsTotal.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-repo-accent" />
          <span className="text-[10px] font-medium text-warm-500">
            Repos: {reposTotal.toLocaleString()}
          </span>
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full flex-1" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="docsAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7C6FFF" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#7C6FFF" stopOpacity="0" />
          </linearGradient>
        </defs>

        {Array.from({ length: yTicks + 1 }, (_, i) => i / yTicks).map((pct, i) => {
          const yVal = Math.round(rawMax * pct);
          return (
            <g key={i}>
              <line
                x1={padL + 16}
                y1={padT + chartH * (1 - pct)}
                x2={width - padR}
                y2={padT + chartH * (1 - pct)}
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="0.5"
              />
              <text
                x={padL + 12}
                y={padT + chartH * (1 - pct) + 3}
                textAnchor="end"
                fontSize="8"
                fill="#5A5A78"
                fontFamily="inherit"
              >
                {yVal}
              </text>
            </g>
          );
        })}

        <path d={areaPath} fill="url(#docsAreaGrad)" />

        <polyline
          points={docsPoints}
          fill="none"
          stroke="#7C6FFF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <polyline
          points={reposPoints}
          fill="none"
          stroke="#34D399"
          strokeWidth="2"
          strokeDasharray="4 3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {docsData.map((v, i) => (
          <circle key={`d-${i}`} cx={getX(i)} cy={getY(v)} r="2.5" fill="#7C6FFF" />
        ))}
        {reposData.map((v, i) => (
          <circle key={`r-${i}`} cx={getX(i)} cy={getY(v)} r="2" fill="#34D399" />
        ))}

        {months.map((m, i) => (
          <text
            key={i}
            x={getX(i)}
            y={height - 10}
            textAnchor="middle"
            fontSize="9"
            fill="#8888A8"
            fontWeight="500"
            fontFamily="inherit"
          >
            {m}
          </text>
        ))}
      </svg>
    </div>
  );
}

/* Score Distribution Bar */
interface ScoreBarProps {
  label: string;
  count: number;
  total: string;
  percentage: number;
  color: string;
  delay?: number;
}

export function ScoreBar({ label, count, total, percentage, color, delay = 0 }: ScoreBarProps) {
  return (
    <div className="hero-fade-in" style={{ animationDelay: `${delay}s` }}>
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-warm-700">{label}</span>
        <div className="flex items-center gap-2 text-[12px] text-warm-500">
          <span>{count}</span>
          <span className="text-warm-400">|</span>
          <span>{total}</span>
        </div>
      </div>
      <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

/* Analysis List Item */
interface AnalysisItemProps {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
  isComplete?: boolean;
  delay?: number;
}

export function AnalysisItem({ icon, iconBg, title, description, isComplete = false, delay = 0 }: AnalysisItemProps) {
  return (
    <div
      className="hero-fade-in group flex items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-white/[0.04]"
      style={{ animationDelay: `${delay}s` }}
    >
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: iconBg }}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold text-warm-800">{title}</p>
        <p className="mt-0.5 truncate text-[11px] leading-relaxed text-warm-500">{description}</p>
      </div>
      <div
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors",
          isComplete
            ? "border-solid bg-solid/10 text-solid"
            : "border-warm-300 text-transparent group-hover:border-warm-400"
        )}
      >
        {isComplete && (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2.5 5L4.5 7L7.5 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
    </div>
  );
}

/* Report Item */
interface ReportItemProps {
  label: string;
  title: string;
  time: string;
  icon: React.ReactNode;
  iconBg: string;
}

export function ReportItem({ label, title, time, icon, iconBg }: ReportItemProps) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/[0.08] p-3.5 transition-colors hover:border-white/[0.14] hover:bg-white/[0.04]">
      <div className="min-w-0">
        <p className="text-[10px] font-medium uppercase tracking-wider text-warm-500">{label}</p>
        <p className="mt-0.5 text-[13px] font-semibold text-warm-800">{title}</p>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-[11px] font-medium text-warm-500">{time}</span>
          <div className="flex h-5 w-5 items-center justify-center rounded-md" style={{ backgroundColor: iconBg }}>
            {icon}
          </div>
        </div>
      </div>
      <button className="flex h-7 w-7 items-center justify-center rounded-lg text-warm-400 transition-colors hover:bg-white/[0.06] hover:text-warm-600">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 10L10 4M10 4H5M10 4V9" />
        </svg>
      </button>
    </div>
  );
}

/* Contributor Ticket Card */
interface ContributorTicketProps {
  name: string;
  message: string;
  avatarColor: string;
  initials: string;
  avatarUrl?: string;
  profileUrl?: string;
}

export function ContributorTicket({ name, message, avatarColor, initials, avatarUrl, profileUrl }: ContributorTicketProps) {
  const [imgError, setImgError] = useState(false);
  const showAvatar = avatarUrl && !imgError;
  return (
    <div className="rounded-xl border border-white/[0.08] p-3.5 transition-colors hover:border-white/[0.14] hover:bg-white/[0.04]">
      <div className="flex items-start gap-3">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full text-[11px] font-bold text-white"
          style={{ backgroundColor: showAvatar ? "transparent" : avatarColor }}
        >
          {showAvatar ? (
            <Image
              src={avatarUrl!}
              alt={name}
              width={36}
              height={36}
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
            />
          ) : (
            initials
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-warm-800">{name}</p>
          <p className="mt-0.5 text-[11px] leading-relaxed text-warm-500">{message}</p>
        </div>
      </div>
      <div className="mt-2.5 flex justify-end">
        {profileUrl ? (
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="rounded-lg border border-white/[0.10] px-3 py-1 text-[11px] font-medium text-warm-500 transition-all hover:border-white/[0.16] hover:text-warm-700"
          >
            View &rsaquo;
          </a>
        ) : (
          <button className="rounded-lg border border-white/[0.10] px-3 py-1 text-[11px] font-medium text-warm-500 transition-all hover:border-white/[0.16] hover:text-warm-700">
            View &rsaquo;
          </button>
        )}
      </div>
    </div>
  );
}
