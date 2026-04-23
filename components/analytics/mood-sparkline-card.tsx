import type { AnalyticsOverviewPayload } from "@/lib/api/contracts";

interface MoodSparklineCardProps {
  timeline: AnalyticsOverviewPayload["moodTimeline"];
  avgMood30d: number | null;
}

function polylinePoints(scores: number[]): string {
  if (scores.length === 0) return "";

  const width = 400;
  const height = 120;
  const padding = 10;
  const stepX = scores.length > 1 ? (width - 2 * padding) / (scores.length - 1) : 0;

  return scores
    .map((score, index) => {
      const x = padding + index * stepX;
      const y = height - padding - ((score - 1) / 4) * (height - 2 * padding);
      return `${x},${y}`;
    })
    .join(" ");
}

export function MoodSparklineCard({ timeline, avgMood30d }: MoodSparklineCardProps) {
  const scores = timeline.map((point) => point.score);
  const points = polylinePoints(scores);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900">Mood Trend (30 Days)</h2>
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
          Avg: {avgMood30d ?? "-"}
        </span>
      </div>

      {scores.length === 0 ? (
        <p className="text-sm text-slate-500">No mood data yet for this period.</p>
      ) : (
        <svg viewBox="0 0 400 120" className="h-28 w-full">
          <line x1="10" y1="110" x2="390" y2="110" className="stroke-slate-200" strokeWidth="1" />
          <line x1="10" y1="10" x2="10" y2="110" className="stroke-slate-200" strokeWidth="1" />
          <polyline fill="none" stroke="rgb(14 116 144)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={points} />
        </svg>
      )}
    </section>
  );
}
