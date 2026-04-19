import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function ProfilePage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  const userRecord = await db.user.findUnique({
    where: { id: currentUser.id },
    select: {
      createdAt: true,
    },
  });

  const displayName = currentUser.name || "Not set";
  const displayEmail = currentUser.email || "Not set";
  const joinedAt = userRecord?.createdAt
    ? new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(userRecord.createdAt)
    : "Unknown";

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold text-zinc-900">Profile</h1>
        <p className="mt-2 text-zinc-600">Manage your personal details and tracking preferences.</p>
      </header>
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-zinc-700">
        <dl className="space-y-4">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Name</dt>
            <dd className="mt-1 text-sm text-zinc-900">{displayName}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Email</dt>
            <dd className="mt-1 text-sm text-zinc-900">{displayEmail}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Member since</dt>
            <dd className="mt-1 text-sm text-zinc-900">{joinedAt}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
