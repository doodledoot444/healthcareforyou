import { MoodChart } from "@/components/mood/mood-chart";
import { getRecentMoods } from "@/features/mood/queries";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ProgressPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  const moods = await getRecentMoods(currentUser.id, 60);

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
