import { redirect } from "next/navigation";
import { DashboardSectionShell } from "@/components/shared/section-shell";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function DashboardProfilePage() {
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
    <DashboardSectionShell title="Profile" description="Review your account details.">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-700">
        <dl className="space-y-4">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Name</dt>
            <dd className="mt-1 text-sm text-slate-900">{displayName}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</dt>
            <dd className="mt-1 text-sm text-slate-900">{displayEmail}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Member since</dt>
            <dd className="mt-1 text-sm text-slate-900">{joinedAt}</dd>
          </div>
        </dl>
      </div>
    </DashboardSectionShell>
  );
}
