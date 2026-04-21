import { ExplorePreview } from "@/components/overview/explore-preview";
import { JournalPreview } from "@/components/overview/journal-preview";
import { ProgressPreview } from "@/components/overview/progress-preview";

export default function DashboardPage() {
  return (
    <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
      <ExplorePreview />
      <ProgressPreview />
      <JournalPreview />
    </section>
  );
}
