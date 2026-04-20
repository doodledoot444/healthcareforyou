interface ProfileOverviewProps {
  name: string;
  email: string;
  joinedAt: string;
}

export function ProfileOverview({ name, email, joinedAt }: ProfileOverviewProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Profile</h2>
      <dl className="mt-4 space-y-3">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Name</dt>
          <dd className="mt-1 text-sm text-slate-800">{name}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</dt>
          <dd className="mt-1 text-sm text-slate-800">{email}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Member since</dt>
          <dd className="mt-1 text-sm text-slate-800">{joinedAt}</dd>
        </div>
      </dl>
    </section>
  );
}
