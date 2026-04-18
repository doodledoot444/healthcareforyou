import { MoodChart } from "@/components/mood/mood-chart";
import { getRecentMoods } from "@/features/mood/queries";
import { DEFAULT_DEMO_USER_ID } from "@/lib/constants";

export default async function ProgressPage() {
  const moods = await getRecentMoods(DEFAULT_DEMO_USER_ID, 60);

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold text-zinc-900">60-Day Progress</h1>
        <p className="mt-2 text-zinc-600">See mood trends, consistency, and recovery patterns.</p>
      </header>
      <MoodChart entries={moods} />
    </section>
  );
}
