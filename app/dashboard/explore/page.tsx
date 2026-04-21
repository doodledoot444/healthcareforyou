import { DashboardSectionShell } from "@/components/shared/section-shell";
import { getExploreSnapshot } from "@/features/explore/service";

export default function DashboardExplorePage() {
  const snapshot = getExploreSnapshot();

  return (
    <DashboardSectionShell
      title="Explore"
      description="Daily discovery content to support your growth and reflection."
    >
      <div className="space-y-3">
        <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Article of the Day</p>
          <h3 className="mt-1 text-base font-semibold text-slate-900">{snapshot.articleOfTheDay.title}</h3>
          <p className="mt-1 text-sm text-slate-600">{snapshot.articleOfTheDay.summary}</p>
        </article>

        <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Stories</p>
          <ul className="mt-2 space-y-2">
            {snapshot.stories.map((story) => (
              <li key={story.id}>
                <p className="text-sm font-medium text-slate-900">{story.title}</p>
                <p className="text-sm text-slate-600">{story.summary}</p>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Session</p>
          <h3 className="mt-1 text-base font-semibold text-slate-900">{snapshot.session.title}</h3>
          <p className="mt-1 text-sm text-slate-600">{snapshot.session.summary}</p>
        </article>
      </div>
    </DashboardSectionShell>
  );
}
