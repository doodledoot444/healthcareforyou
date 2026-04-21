import type { ReactNode } from "react";
import Link from "next/link";

interface PreviewCardProps {
  title: string;
  description?: string;
  actionHref: string;
  actionLabel: string;
  children: ReactNode;
}

export function PreviewCard({ title, description, actionHref, actionLabel, children }: PreviewCardProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          {description ? <p className="mt-1 text-sm text-slate-600">{description}</p> : null}
        </div>
        <Link href={actionHref} className="text-sm font-medium text-emerald-700 transition hover:text-emerald-600">
          {actionLabel}
        </Link>
      </div>
      {children}
    </section>
  );
}
