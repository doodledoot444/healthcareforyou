import { ExplorePreview } from "@/components/overview/explore-preview";
import { JournalPreview } from "@/components/overview/journal-preview";
import { ProgressPreview } from "@/components/overview/progress-preview";
import { getExploreSnapshot } from "@/features/explore/service";
import { getPlansSnapshot } from "@/features/plans/service";
import { getCurrentUser } from "@/lib/auth";

export default async function DashboardPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return null;
  }

  const [exploreSnapshot, planSnapshot] = await Promise.all([
    Promise.resolve(getExploreSnapshot()),
    getPlansSnapshot(currentUser.id),
  ]);

  return (
    <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
      <ExplorePreview snapshot={exploreSnapshot} />
      <ProgressPreview activePlan={planSnapshot.activePlan} />
      <JournalPreview />
    </section>
  );
}
