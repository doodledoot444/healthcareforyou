import { JournalModule } from "@/components/journal/journal-module";
import { DashboardSectionShell } from "@/components/shared/section-shell";

export default function DashboardJournalPage() {
  return (
    <DashboardSectionShell
      title="Journal"
      description="Write and review your reflections in one focused space."
    >
      <JournalModule />
    </DashboardSectionShell>
  );
}
