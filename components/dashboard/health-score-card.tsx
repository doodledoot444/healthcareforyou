"use client";

import { useState } from "react";
import type { HealthScoreResult, HealthScoreGrade, HealthScorePillar } from "@/features/health-score/service";

// ---------------------------------------------------------------------------
// Visual config
// ---------------------------------------------------------------------------

const GRADE_CONFIG: Record<
  HealthScoreGrade,
  { ring: string; text: string; bg: string; label: string }
> = {
  S: { ring: "ring-violet-400", text: "text-violet-700", bg: "bg-violet-50", label: "Outstanding" },
  A: { ring: "ring-emerald-400", text: "text-emerald-700", bg: "bg-emerald-50", label: "Excellent" },
  B: { ring: "ring-sky-400", text: "text-sky-700", bg: "bg-sky-50", label: "Good" },
  C: { ring: "ring-amber-400", text: "text-amber-700", bg: "bg-amber-50", label: "Building" },
  D: { ring: "ring-rose-400", text: "text-rose-700", bg: "bg-rose-50", label: "Getting Started" },
};

const PILLAR_COLORS: Record<string, { bar: string; badge: string }> = {
  mood: { bar: "bg-emerald-500", badge: "bg-emerald-100 text-emerald-700" },
  journal: { bar: "bg-sky-500", badge: "bg-sky-100 text-sky-700" },
  plan: { bar: "bg-violet-500", badge: "bg-violet-100 text-violet-700" },
  streak: { bar: "bg-amber-500", badge: "bg-amber-100 text-amber-700" },
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ScoreDial({
  total,
  grade,
}: {
  total: number;
  grade: HealthScoreGrade;
}) {
  const cfg = GRADE_CONFIG[grade];
  // SVG arc — 220° sweep out of 360, starting at -110° from top
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const sweepFraction = 220 / 360;
  const arcLength = circumference * sweepFraction;
  const filledLength = arcLength * (total / 100);
  const gapLength = circumference - filledLength;

  // Rotate so arc starts at bottom-left
  const rotation = -200;

  return (
    <div className={`relative flex h-28 w-28 items-center justify-center rounded-full ring-4 ${cfg.ring} ${cfg.bg}`}>
      <svg
        className="absolute inset-0 h-full w-full -rotate-90"
        viewBox="0 0 100 100"
        aria-hidden
      >
        {/* Track */}
        <circle
          cx="50" cy="50" r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          className="text-slate-100"
          strokeDasharray={`${arcLength} ${circumference - arcLength}`}
          strokeDashoffset={0}
          strokeLinecap="round"
          transform={`rotate(${rotation} 50 50)`}
        />
        {/* Fill */}
        <circle
          cx="50" cy="50" r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          className={cfg.text}
          strokeDasharray={`${filledLength} ${gapLength}`}
          strokeDashoffset={0}
          strokeLinecap="round"
          transform={`rotate(${rotation} 50 50)`}
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
      </svg>
      <div className="relative text-center">
        <p className={`text-2xl font-black ${cfg.text}`}>{total}</p>
        <p className={`text-[10px] font-bold ${cfg.text}`}>{grade}</p>
      </div>
    </div>
  );
}

function PillarBar({ pillar, expanded }: { pillar: HealthScorePillar; expanded: boolean }) {
  const colors = PILLAR_COLORS[pillar.key] ?? { bar: "bg-slate-400", badge: "bg-slate-100 text-slate-600" };
  const pct = Math.round((pillar.score / pillar.maxScore) * 100);

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-slate-700">{pillar.label}</span>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${colors.badge}`}>
          {pillar.score} / {pillar.maxScore}
        </span>
      </div>
      {/* Progress bar */}
      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${colors.bar} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {/* Description */}
      <p className="mt-1 text-[11px] text-slate-500">{pillar.description}</p>
      {/* Tip — shown when expanded */}
      {expanded && (
        <p className="mt-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5 text-[11px] leading-relaxed text-slate-600">
          💡 {pillar.tip}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function HealthScoreCard({ result }: { result: HealthScoreResult }) {
  const [expandedPillar, setExpandedPillar] = useState<string | null>(null);
  const cfg = GRADE_CONFIG[result.grade];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      {/* Header */}
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Adaptive Health Score
          </p>
          <p className="mt-0.5 text-sm font-semibold text-slate-900">
            {cfg.label} — based on your last 30 days
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Tap any pillar to see a personalised tip.
          </p>
        </div>
        <ScoreDial total={result.total} grade={result.grade} />
      </div>

      {/* Grade legend */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {(["S", "A", "B", "C", "D"] as HealthScoreGrade[]).map((g) => {
          const c = GRADE_CONFIG[g];
          return (
            <span
              key={g}
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                g === result.grade ? `${c.bg} ${c.text} ring-1 ${c.ring}` : "bg-slate-50 text-slate-400"
              }`}
            >
              {g} · {c.label}
            </span>
          );
        })}
      </div>

      {/* Pillars */}
      <div className="space-y-4">
        {result.pillars.map((pillar) => (
          <button
            key={pillar.key}
            onClick={() =>
              setExpandedPillar((prev) => (prev === pillar.key ? null : pillar.key))
            }
            className="w-full text-left rounded-xl border border-transparent px-3 py-2.5 transition-colors hover:border-slate-200 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            aria-expanded={expandedPillar === pillar.key}
          >
            <PillarBar
              pillar={pillar}
              expanded={expandedPillar === pillar.key}
            />
          </button>
        ))}
      </div>

      {/* Footer note */}
      <p className="mt-4 text-[10px] leading-relaxed text-slate-400">
        Score updates as you log mood, journal, and complete plan habits. Max 100 pts across 4 pillars.
      </p>
    </section>
  );
}
